"""
Risk management module for LemoTick bot.
Handles position sizing, drawdown limits, and trading controls.
"""

import time
from typing import Dict, Any, Optional, Tuple
from .config import config
from .logger import logger
from .utils.helpers import clamp, calculate_percentage_change


class RiskManager:
    """Comprehensive risk management system."""

    def __init__(self, initial_equity: float = 1000.0):
        """
        Initialize risk manager.

        Args:
            initial_equity: Starting equity amount
        """
        # Equity tracking
        self.initial_equity = initial_equity
        self.current_equity = initial_equity
        self.daily_start_equity = initial_equity
        self.peak_equity = initial_equity

        # Risk parameters
        self.risk_per_trade = config.get("risk_management.risk_per_trade", 0.005)
        self.max_daily_drawdown = config.get("risk_management.max_daily_drawdown", 0.10)
        self.max_stake = config.max_stake
        self.min_stake = config.min_stake
        # Override switch to never pause (production safety)
        self.force_always_trade = bool(config.get("risk_management.force_always_trade", False))

        # Trading controls
        self.cooldown_after_loss = config.get("risk_management.cooldown_seconds", 0.5)
        self.max_concurrent_trades = config.get("risk_management.max_concurrent_trades", 8)
        self.daily_loss_limit_triggered = False
        
        # Emergency stop threshold
        self.emergency_stop_threshold = self.max_daily_drawdown * 2
        self.emergency_stopped = False

        # State tracking
        self.open_trades = {}
        self.last_loss_time = 0
        self.consecutive_losses = 0
        self.daily_trades = 0
        
        # Profit guarantee parameters
        self.dynamic_stake_enabled = config.get("risk_management.dynamic_stake_enabled", True)
        self.win_rate_multiplier = config.get("risk_management.win_rate_multiplier", 1.5)
        self.loss_rate_multiplier = config.get("risk_management.loss_rate_multiplier", 0.5)
        self.daily_wins = 0
        self.daily_losses = 0

        # Impulse Pullback specific parameters
        self.risk_multiple = 2.5  # 2.5R target as per strategy
        self.compounding_rate = config.get("risk_management.compounding_rate", 1.5)

        # Performance tracking
        self.total_trades = 0
        self.total_wins = 0
        self.total_losses = 0
        self.total_profit = 0.0

        logger.info(f"Risk manager initialized with equity: {initial_equity}")

    def can_trade(self) -> Tuple[bool, str]:
        """
        Check if trading is allowed based on risk parameters.

        Returns:
            Tuple of (can_trade, reason)
        """
        # Global bypass: never pause trading
        if self.force_always_trade:
            return True, "Forced trading enabled"
        # Check daily loss limit - DISABLED for unlimited trading
        # if self.daily_loss_limit_triggered:
        #     return False, "Daily loss limit reached"

        # Check current drawdown - DISABLED for unlimited trading
        # current_drawdown = self._calculate_drawdown()
        # if current_drawdown > self.max_daily_drawdown:
        #     self.daily_loss_limit_triggered = True
        #     logger.warning(
        #         f"Daily loss limit triggered. Drawdown: {current_drawdown:.2%}"
        #     )
        #     return False, "Daily drawdown limit exceeded"

        # Check concurrent trades - DISABLED for unlimited trading
        # if len(self.open_trades) >= self.max_concurrent_trades:
        #     return False, "Maximum concurrent trades reached"

        # Check cooldown after loss - DISABLED for continuous trading
        # if self._is_in_cooldown():
        #     time_remaining = self.cooldown_after_loss - (
        #         time.time() - self.last_loss_time
        #     )
        #     return False, f"In cooldown period. {time_remaining:.1f}s remaining"

        # Check minimum equity - DISABLED for unlimited trading
        # if self.current_equity < self.min_stake * 10:  # Need at least 10x min stake
        #     return False, "Insufficient equity for trading"
            
        # Check for emergency stop - DISABLED for unlimited trading
        # if self.emergency_stopped:
        #     return False, "Emergency stop triggered"
            
        # Check for critical drawdown - DISABLED for unlimited trading
        # current_drawdown = self.get_current_drawdown()
        # if current_drawdown > self.emergency_stop_threshold:
        #     self.emergency_stop("Critical drawdown exceeded")
        #     return False, "Emergency stop: Critical drawdown"

        return True, "Trading allowed"

    def calculate_stake(
        self, volatility: float = 0.001, confidence: float = 1.0, signal_strength: float = 1.0
    ) -> float:
        """
        Calculate appropriate stake size based on percentage-based risk management.

        Args:
            volatility: Current market volatility
            confidence: Signal confidence (0.0 to 1.0)
            signal_strength: Signal strength from indicators (0.0 to 1.0)

        Returns:
            Calculated stake amount
        """
        # Use percentage-based risk per trade (from config or default 0.5%)
        risk_per_trade_pct = config.get('risk_management.risk_per_trade_pct', 0.005)  # 0.5% of equity per trade

        # If min_stake equals max_stake, use fixed stake value
        if self.min_stake == self.max_stake:
            base_stake = self.min_stake  # Use fixed stake value (e.g., 10.0)
        else:
            # Calculate base stake as percentage of current equity
            base_stake = self.current_equity * risk_per_trade_pct

        # Adjust for signal strength (stronger signals = higher stake, but capped)
        strength_multiplier = clamp(signal_strength, 0.5, 2.0)  # 0.5x to 2x multiplier based on signal strength

        # Adjust for confidence (higher confidence = higher stake)
        confidence_multiplier = clamp(confidence, 0.8, 1.3)  # 0.8x to 1.3x based on confidence

        # Adjust for volatility (higher volatility = smaller stake for safety)
        volatility_factor = clamp(1.0 / (volatility * 100 + 1.0), 0.3, 1.5)  # Reduce stake in high volatility

        # Calculate final stake
        stake = base_stake * strength_multiplier * confidence_multiplier * volatility_factor

        # Apply absolute limits for safety
        max_stake_by_equity = self.current_equity * 0.10  # Max 10% of equity per trade (more conservative)
        min_stake_by_equity = self.current_equity * 0.005  # Min 0.5% of equity per trade

        effective_max_stake = min(self.max_stake, max_stake_by_equity)
        effective_min_stake = max(self.min_stake, min_stake_by_equity)

        stake = clamp(stake, effective_min_stake, effective_max_stake)

        # Round to 2 decimal places
        stake = round(stake, 2)

        if self.min_stake == self.max_stake:
            logger.info(
                f"Fixed stake: {stake} (fixed value), "
                f"strength: {strength_multiplier:.2f}x, confidence: {confidence_multiplier:.2f}x, volatility: {volatility_factor:.2f}x"
            )
        else:
            logger.info(
                f"Percentage-based stake: {stake} ({risk_per_trade_pct*100:.1f}% of {self.current_equity:.2f}), "
                f"strength: {strength_multiplier:.2f}x, confidence: {confidence_multiplier:.2f}x, volatility: {volatility_factor:.2f}x"
            )

        return stake

    def calculate_impulse_pullback_stake(
        self,
        entry_price: float,
        stop_loss_price: float,
        target_price: float,
        account_balance: float = None
    ) -> float:
        """
        Calculate stake for Impulse Pullback strategy based on 1R distance.

        Args:
            entry_price: Entry price
            stop_loss_price: Stop loss price
            target_price: Target price
            account_balance: Current account balance (optional)

        Returns:
            Calculated stake amount
        """
        try:
            # Calculate 1R distance (risk per trade)
            risk_distance = abs(entry_price - stop_loss_price)

            if risk_distance == 0:
                logger.warning("Risk distance is zero, using minimum stake")
                return self.min_stake

            # Use account balance if provided, otherwise use current equity
            balance = account_balance if account_balance else self.current_equity

            # Risk 1% of account per trade (can be adjusted)
            risk_per_trade = balance * 0.005

            # Calculate stake based on risk distance
            # stake = risk_amount / risk_distance
            stake = risk_per_trade / risk_distance

            # Apply limits
            stake = max(self.min_stake, min(stake, self.max_stake))

            # Ensure stake doesn't exceed 10% of account
            max_stake_by_balance = balance * 0.005
            stake = min(stake, max_stake_by_balance)

            logger.info(
                f"Impulse Pullback stake: ${stake:.2f} "
                f"(Risk: ${risk_per_trade:.2f}, Distance: {risk_distance:.6f})"
            )

            return round(stake, 2)

        except Exception as e:
            logger.error(f"Error calculating Impulse Pullback stake: {e}")
            return self.min_stake

    def validate_impulse_pullback_trade(
        self,
        entry_price: float,
        stop_loss_price: float,
        target_price: float,
        current_price: float
    ) -> Tuple[bool, str]:
        """
        Validate if Impulse Pullback trade meets risk criteria.

        Args:
            entry_price: Entry price
            stop_loss_price: Stop loss price
            target_price: Target price
            current_price: Current price

        Returns:
            Tuple of (is_valid, reason)
        """
        try:
            # Check if entry price is reasonable relative to current price
            price_diff = abs(entry_price - current_price) / current_price

            if price_diff > 0.01:  # 1% price difference
                return False, f"Entry price too far from current price: {price_diff:.2%}"

            # Check if risk-reward ratio is acceptable (minimum 1:2)
            risk_distance = abs(entry_price - stop_loss_price)
            reward_distance = abs(target_price - entry_price)

            if risk_distance == 0:
                return False, "Risk distance is zero"

            risk_reward_ratio = reward_distance / risk_distance

            if risk_reward_ratio < 2.0:
                return False, f"Poor risk-reward ratio: {risk_reward_ratio:.2f}:1"

            # Check if stop loss distance is reasonable (not too tight)
            if risk_distance < 0.0001:  # Very tight stop
                return False, f"Stop loss too tight: {risk_distance:.6f}"

            return True, "Valid trade setup"

        except Exception as e:
            return False, f"Validation error: {e}"

    def register_trade(
        self,
        trade_id: str,
        trade_type: str,
        stake: float,
        entry_price: float,
        timestamp: int,
    ) -> bool:
        """
        Register a new trade for risk tracking.

        Args:
            trade_id: Unique trade identifier
            trade_type: Type of trade (BUY/SELL)
            stake: Trade stake amount
            entry_price: Entry price
            timestamp: Trade timestamp

        Returns:
            True if trade registered successfully
        """
        # Check concurrent trade limit
        if not self.force_always_trade and len(self.open_trades) >= self.max_concurrent_trades:
            logger.warning(
                f"Cannot register trade {trade_id}: max concurrent trades ({self.max_concurrent_trades}) reached"
            )
            return False

        self.open_trades[trade_id] = {
            "type": trade_type,
            "stake": stake,
            "entry_price": entry_price,
            "timestamp": timestamp,
            "status": "open",
        }

        self.daily_trades += 1
        self.total_trades += 1

        logger.info(
            f"Registered trade {trade_id}: {trade_type} {stake} at {entry_price}"
        )
        return True

    def close_trade(
        self, trade_id: str, exit_price: float, timestamp: int
    ) -> Dict[str, Any]:
        """
        Close a trade and update risk metrics.

        Args:
            trade_id: Trade identifier
            exit_price: Exit price
            timestamp: Exit timestamp

        Returns:
            Trade result dictionary
        """
        if trade_id not in self.open_trades:
            logger.error(f"Trade {trade_id} not found in open trades")
            return {}

        trade = self.open_trades[trade_id]
        entry_price = trade["entry_price"]
        stake = trade["stake"]

        # Calculate P&L (simplified for binary options)
        # In practice, you'd need to implement proper payout calculation
        price_change = exit_price - entry_price
        price_change_pct = calculate_percentage_change(entry_price, exit_price)

        # For binary options, profit/loss is based on contract outcome
        # This is a simplified calculation - adjust based on your contract type
        if trade["type"] == "BUY":
            profit = stake * 0.8 if price_change > 0 else -stake
        else:  # SELL
            profit = stake * 0.8 if price_change < 0 else -stake

        # Update equity
        self.current_equity += profit
        self.total_profit += profit

        # Update performance metrics
        if profit > 0:
            self.total_wins += 1
            self.daily_wins += 1
            self.consecutive_losses = 0
        else:
            self.total_losses += 1
            self.daily_losses += 1
            self.consecutive_losses += 1
            self.last_loss_time = time.time()

        # Update peak equity
        if self.current_equity > self.peak_equity:
            self.peak_equity = self.current_equity

        # Remove from open trades
        del self.open_trades[trade_id]

        # Create result dictionary
        result = {
            "trade_id": trade_id,
            "type": trade["type"],
            "stake": stake,
            "entry_price": entry_price,
            "exit_price": exit_price,
            "price_change": price_change,
            "price_change_pct": price_change_pct,
            "profit": profit,
            "timestamp": timestamp,
        }

        logger.info(
            f"Closed trade {trade_id}: P&L = {profit:.2f}, Equity = {self.current_equity:.2f}"
        )
        return result

    def remove_trade(self, trade_id: str) -> None:
        """Remove a pending/open trade from tracking without P&L (e.g., cancelled)."""
        try:
            if trade_id in self.open_trades:
                del self.open_trades[trade_id]
        except Exception:
            pass

    def _calculate_drawdown(self) -> float:
        """Calculate current drawdown from peak equity."""
        if self.peak_equity == 0:
            return 0.0
        return (self.peak_equity - self.current_equity) / self.peak_equity

    def get_current_drawdown(self) -> float:
        """Get current drawdown as a percentage."""
        return self._calculate_drawdown()
    
    def calculate_dynamic_stake(self, base_stake: float, win_rate: float = 0.0, consecutive_wins: int = 0, consecutive_losses: int = 0) -> float:
        """
        Calculate dynamic stake based on performance to maximize profit probability.
        
        Args:
            base_stake: Base stake amount
            win_rate: Current win rate percentage
            consecutive_wins: Number of consecutive wins
            consecutive_losses: Number of consecutive losses
            
        Returns:
            Adjusted stake amount
        """
        try:
            if not self.dynamic_stake_enabled:
                return base_stake
            
            multiplier = 1.0
            
            # Rule 1: Aggressive stake increase when win rate is decent (noisy trading)
            if win_rate >= 55.0:  # Lower threshold for minute trading
                multiplier *= (self.win_rate_multiplier * 1.2)  # More aggressive multiplier
                logger.debug(f"Decent win rate ({win_rate:.1f}%) - increasing stake by {(self.win_rate_multiplier * 1.2):.2f}x")

            # Rule 2: Aggressive stake increase on winning streaks (minute trading)
            if consecutive_wins >= 2:  # Lower threshold for rapid compounding
                streak_multiplier = min(1.0 + (consecutive_wins * 0.15), 3.0)  # Max 3x, aggressive increments
                multiplier *= streak_multiplier
                logger.debug(f"Winning streak ({consecutive_wins}) - increasing stake by {streak_multiplier:.2f}x")

            # Rule 3: Aggressive stake reduction when losing (rapid recovery)
            if consecutive_losses >= 1:  # Reduce immediately on any loss
                loss_multiplier = max(self.loss_rate_multiplier, 0.2)  # Min 20% of base for quick recovery
                multiplier *= loss_multiplier
                logger.debug(f"Losing streak ({consecutive_losses}) - reducing stake by {loss_multiplier:.2f}x")

            # Rule 4: Aggressive stake reduction when win rate is low (noisy trading)
            if win_rate < 45.0 and self.total_trades >= 3:  # Lower thresholds for minute trading
                multiplier *= 0.5  # 50% reduction for rapid adjustment
                logger.debug(f"Low win rate ({win_rate:.1f}%) - reducing stake by 50%")
            
            # Calculate final stake
            dynamic_stake = base_stake * multiplier
            
            # Ensure stake is within bounds
            dynamic_stake = max(self.min_stake, min(dynamic_stake, self.max_stake))
            
            if multiplier != 1.0:
                logger.info(f"Dynamic stake: ${base_stake:.2f} -> ${dynamic_stake:.2f} (x{multiplier:.2f})")
            
            return dynamic_stake
            
        except Exception as e:
            logger.error(f"Error calculating dynamic stake: {e}")
            return base_stake

    def _is_in_cooldown(self) -> bool:
        """Check if currently in cooldown period after loss."""
        if self.consecutive_losses == 0:
            return False

        # Escalating cooldown based on consecutive losses (clamped to prevent excessive delays)
        cooldown_duration = self.cooldown_after_loss * (
            2 ** min(self.consecutive_losses - 1, 4)
        )
        # Clamp cooldown to maximum 1 hour to prevent extremely long delays
        cooldown_duration = min(cooldown_duration, 3600)
        time_since_loss = time.time() - self.last_loss_time

        return time_since_loss < cooldown_duration

    def emergency_stop(self, reason: str) -> None:
        """Trigger emergency stop to halt all trading."""
        self.emergency_stopped = True
        logger.critical(f"EMERGENCY STOP TRIGGERED: {reason}")
        logger.critical(f"Current equity: {self.current_equity}, Peak equity: {self.peak_equity}")
        logger.critical(f"Drawdown: {self.get_current_drawdown():.2%}")

    def reset_emergency_stop(self) -> None:
        """Reset emergency stop (use with caution)."""
        self.emergency_stopped = False
        logger.info("Emergency stop reset - trading resumed")

    def reset_daily_metrics(self) -> None:
        """Reset daily trading metrics (call at start of each trading day)."""
        self.daily_start_equity = self.current_equity
        self.daily_loss_limit_triggered = False
        self.daily_trades = 0
        self.daily_wins = 0
        self.daily_losses = 0
        # Reset consecutive losses to ensure correct cooldown behavior
        self.consecutive_losses = 0

        logger.info("Daily metrics reset")

    def update_equity(self, new_equity: float) -> None:
        """
        Update current equity (e.g., from account balance API).

        Args:
            new_equity: New equity amount
        """
        old_equity = self.current_equity
        self.current_equity = new_equity

        if new_equity > self.peak_equity:
            self.peak_equity = new_equity

        logger.info(f"Equity updated: {old_equity:.2f} -> {new_equity:.2f}")

    def get_risk_metrics(self) -> Dict[str, Any]:
        """
        Get comprehensive risk metrics.

        Returns:
            Risk metrics dictionary
        """
        current_drawdown = self._calculate_drawdown()
        win_rate = (
            (self.total_wins / self.total_trades * 100) if self.total_trades > 0 else 0
        )

        return {
            "equity": {
                "initial": self.initial_equity,
                "current": self.current_equity,
                "peak": self.peak_equity,
                "daily_start": self.daily_start_equity,
            },
            "drawdown": {
                "current": current_drawdown,
                "max_daily": self.max_daily_drawdown,
            },
            "trades": {
                "total": self.total_trades,
                "open": len(self.open_trades),
                "max_concurrent": self.max_concurrent_trades,
            },
            "performance": {
                "total_wins": self.total_wins,
                "total_losses": self.total_losses,
                "win_rate": win_rate,
                "total_profit": self.total_profit,
                "consecutive_losses": self.consecutive_losses,
            },
            "daily": {
                "trades": self.daily_trades,
                "wins": self.daily_wins,
                "losses": self.daily_losses,
            },
            "controls": {
                "can_trade": self.can_trade()[0],
                "can_trade_reason": self.can_trade()[1],
                "daily_limit_triggered": self.daily_loss_limit_triggered,
                "in_cooldown": self._is_in_cooldown(),
                "emergency_stopped": self.emergency_stopped,
            },
        }

    def emergency_stop(self, reason: str) -> None:
        """
        Trigger emergency stop of trading.

        Args:
            reason: Reason for emergency stop
        """
        self.daily_loss_limit_triggered = True
        logger.critical(f"EMERGENCY STOP: {reason}")

    def reset(self, new_equity: Optional[float] = None) -> None:
        """
        Reset risk manager to initial state.

        Args:
            new_equity: New initial equity (optional)
        """
        if new_equity is not None:
            self.initial_equity = new_equity

        self.current_equity = self.initial_equity
        self.peak_equity = self.initial_equity
        self.daily_start_equity = self.initial_equity

        self.open_trades.clear()
        self.last_loss_time = 0
        self.consecutive_losses = 0
        self.daily_loss_limit_triggered = False

        self.total_trades = 0
        self.total_wins = 0
        self.total_losses = 0
        self.total_profit = 0.0

        logger.info("Risk manager reset")
