"""
Risk management module for LemoTick bot.
Handles position sizing, drawdown limits, and trading controls.
"""

import time
from typing import Dict, Any, Optional, Tuple
from infrastructure.config import config
from infrastructure.logger import logger
from utils.helpers import clamp, calculate_percentage_change


class RiskManager:
    """Comprehensive risk management system."""

    def __init__(self, initial_equity: Optional[float] = None, metrics=None):
        """
        Initialize risk manager with advanced risk controls and adaptive stake sizing.
        Default equity is based on account type configuration.

        Args:
            initial_equity: Starting equity amount (if None, uses account-specific config)
            metrics: Metrics instance for Prometheus monitoring
        """
        # Get account type - Handle both parameter-passed config and global config
        # Global config has the instance methods, but parameter config might be dictionary
        try:
            # Try global config first (has get_account_type method)
            self.account_type = config.get_account_type()
            self.is_demo = config.is_demo_account()
        except AttributeError:
            # Fallback to sensible defaults
            self.account_type = "demo"
            self.is_demo = True
        
        # Store metrics instance for monitoring
        self.metrics = metrics
        
        # Get account-specific initial equity if not provided
        if initial_equity is None:
            initial_equity = config.get_account_config("initial_equity", 50.0)
            
        logger.info(f"Initializing risk manager for {self.account_type.upper()} account with ${initial_equity:.2f} equity")
            
        # Equity tracking with enhanced metrics
        self.initial_equity = initial_equity
        self.current_equity = initial_equity
        self.daily_start_equity = initial_equity
        self.peak_equity = initial_equity
        self.lowest_equity = initial_equity  # Track lowest equity point
        
        # Risk parameters - account-type specific
        self.risk_per_trade = config.risk_per_trade  # Uses the property that handles account type
        self.max_daily_drawdown = config.get("risk_management.max_daily_drawdown", 0.05)  # 5% daily max drawdown
        
        # Account-specific stake limits
        self.max_stake = config.max_stake  # Uses the property that handles account type
        self.min_stake = config.min_stake  # Uses the property that handles account type
        
        # Override switch with explicit warning
        self.force_always_trade = bool(config.get("risk_management.force_always_trade", False))
        if self.force_always_trade:
            logger.warning("RISK WARNING: Force always trade enabled - risk controls will be bypassed!")

        # Enhanced trading controls
        self.cooldown_after_loss = config.get("risk_management.cooldown_seconds", 5.0)  # Aggressive default cooldown
        self.max_concurrent_trades = config.get("risk_management.max_concurrent_trades", 1)  # Default to 1 trade at a time
        self.daily_loss_limit_triggered = False
        self.consecutive_wins = 0  # Track winning streaks too
        
        # ================================================================================
        # SAFETY SYSTEMS CONFIGURATION
        # ================================================================================
        
        # Circuit Breaker System
        self.circuit_breaker_enabled = config.get("risk_management.circuit_breaker_enabled", True)
        self.circuit_breaker_losses = config.get("risk_management.circuit_breaker_losses", 5)
        self.circuit_breaker_reset_hours = config.get("risk_management.circuit_breaker_reset_hours", 6)
        self.circuit_breaker_manual_reset = config.get("risk_management.circuit_breaker_manual_reset", False)
        self.circuit_breaker_triggered_time = None  # Track when circuit breaker was triggered
        
        # Daily Loss Limits
        self.daily_loss_limit_enabled = config.get("risk_management.daily_loss_limit_enabled", True)
        self.max_daily_drawdown = config.get("risk_management.max_daily_drawdown", 0.15)
        self.daily_drawdown_strict = config.get("risk_management.daily_drawdown_strict", True)
        
        # Emergency Stop System
        self.emergency_stop_enabled = config.get("risk_management.emergency_stop_enabled", True)
        self.emergency_stop_threshold = config.get("risk_management.emergency_stop_threshold", 0.20)
        self.emergency_stop_manual_reset = config.get("risk_management.emergency_stop_manual_reset", True)
        self.emergency_stopped = False
        
        # Cooldown System
        self.cooldown_enabled = config.get("risk_management.cooldown_enabled", True)
        self.cooldown_after_loss = config.get("risk_management.cooldown_after_loss", 15)  # 15 seconds
        self.cooldown_exponential = config.get("risk_management.cooldown_exponential", True)
        self.cooldown_multiplier = config.get("risk_management.cooldown_multiplier", 2.0)
        self.max_cooldown = config.get("risk_management.max_cooldown", 180)  # 3 minutes
        
        # Win Rate Protection
        self.win_rate_protection_enabled = config.get("risk_management.win_rate_protection_enabled", True)
        self.min_win_rate_threshold = config.get("risk_management.min_win_rate_threshold", 0.60)
        self.min_trades_for_win_rate = config.get("risk_management.min_trades_for_win_rate", 10)
        
        # Adaptive recovery system
        self.recovery_mode_enabled = config.get("risk_management.recovery_mode_enabled", True)
        self.recovery_factor = config.get("risk_management.recovery_factor", 0.25)  # 25% increase per loss
        self.max_recovery_multiplier = config.get("risk_management.max_recovery_multiplier", 2.5)  # Max 2.5x stake
        
        # Martingale strategy system
        self.martingale_enabled = config.get("trading.martingale_enabled", False)
        self.martingale_base_stake = config.get("trading.martingale_base_stake", self.min_stake)
        self.martingale_multiplier = config.get("trading.martingale_multiplier", 2.0)
        self.martingale_max_level = config.get("trading.martingale_max_level", 4)
        self.martingale_reset_on_profit = config.get("trading.martingale_reset_on_profit", True)
        self.current_martingale_level = 0  # Track current Martingale level
        
        # State tracking with enhanced metrics
        self.open_trades = {}
        self.last_loss_time = 0
        self.last_win_time = 0
        self.consecutive_losses = 0
        self.daily_trades = 0
        self.session_start_time = time.time()
        
        # Advanced stake sizing system
        self.dynamic_stake_enabled = config.get("risk_management.dynamic_stake_enabled", True)
        self.win_rate_multiplier = config.get("risk_management.win_rate_multiplier", 1.5)
        self.loss_rate_multiplier = config.get("risk_management.loss_rate_multiplier", 0.5)
        self.daily_wins = 0
        self.daily_losses = 0
        self.win_streak_bonus = config.get("risk_management.win_streak_bonus", 0.15)  # 15% bonus per win
        self.loss_penalty = config.get("risk_management.loss_penalty", 0.35)  # 35% penalty per loss
        
        # Market condition adaptation
        self.volatility_adjustment = config.get("risk_management.volatility_adjustment", True)
        self.market_condition_factor = 1.0  # Default neutral market
        
        # Performance tracking with enhanced metrics
        self.total_trades = 0
        self.total_wins = 0
        self.total_losses = 0
        self.total_profit = 0.0
        self.best_trade = 0.0
        self.worst_trade = 0.0
        self.avg_win = 0.0
        self.avg_loss = 0.0
        self.win_rate_history = []  # Track win rate over time
        
        # Time-based metrics
        self.trades_per_hour = 0.0
        self.profit_per_hour = 0.0
        
        logger.info(f"Enhanced Risk Manager initialized with equity: ${initial_equity:.2f}")
        logger.info(f"Risk parameters: {self.risk_per_trade*100:.1f}% risk per trade, max daily drawdown: {self.max_daily_drawdown*100:.1f}%")
        logger.info(f"Recovery system: {'Enabled' if self.recovery_mode_enabled else 'Disabled'}, max multiplier: {self.max_recovery_multiplier}x")
        
        # Log Martingale settings if enabled
        if self.martingale_enabled:
            logger.info("=" * 80)
            logger.info("MARTINGALE STRATEGY ENABLED")
            logger.info(f"   Base stake: ${self.martingale_base_stake}")
            logger.info(f"   Multiplier: {self.martingale_multiplier}x after each loss")
            logger.info(f"   Max level: {self.martingale_max_level} (Max stake: ${self.martingale_base_stake * (self.martingale_multiplier ** self.martingale_max_level):.2f})")
            logger.info(f"   Reset on profit: {self.martingale_reset_on_profit}")
            
            # Build level progression string
            progression = "   Level progression: "
            for level in range(self.martingale_max_level + 1):
                stake_at_level = self.martingale_base_stake * (self.martingale_multiplier ** level)
                progression += f"L{level}=${stake_at_level:.2f} "
            logger.info(progression)
            logger.info("=" * 80)
        
        # Log safety systems status
        logger.info("=" * 80)
        logger.info("SAFETY SYSTEMS STATUS:")
        logger.info(f"  Circuit Breaker: {'ENABLED' if self.circuit_breaker_enabled else 'DISABLED'} (trigger at {self.circuit_breaker_losses} losses)")
        logger.info(f"  Daily Loss Limit: {'ENABLED' if self.daily_loss_limit_enabled else 'DISABLED'} (max {self.max_daily_drawdown*100:.1f}% drawdown)")
        logger.info(f"  Emergency Stop: {'ENABLED' if self.emergency_stop_enabled else 'DISABLED'} (trigger at {self.emergency_stop_threshold*100:.1f}% drawdown)")
        logger.info(f"  Cooldown System: {'ENABLED' if self.cooldown_enabled else 'DISABLED'} (base: {self.cooldown_after_loss}s)")
        logger.info(f"  Win Rate Protection: {'ENABLED' if self.win_rate_protection_enabled else 'DISABLED'} (min {self.min_win_rate_threshold*100:.0f}%)")
        logger.info("=" * 80)

    def can_trade(self) -> Tuple[bool, str]:
        """
        Check if trading is allowed based on risk parameters.
        Implements smart risk controls with appropriate safety measures.

        Returns:
            Tuple of (can_trade, reason)
        """
        # Global bypass: override risk controls if explicitly enabled
        if self.force_always_trade:
            logger.warning("RISK WARNING: Forced trading enabled - bypassing risk controls")
            return True, "Forced trading enabled (risk controls bypassed)"
            
        # ================================================================================
        # SAFETY SYSTEMS - All checks with enable/disable controls
        # ================================================================================
        
        # 1. EMERGENCY STOP CHECK - Last line of defense
        if self.emergency_stop_enabled:
            # Check if already triggered
            if self.emergency_stopped:
                if self.emergency_stop_manual_reset:
                    return False, "EMERGENCY STOP ACTIVE - Manual reset required"
                else:
                    return False, "EMERGENCY STOP ACTIVE - Trading halted"
            
            # Check current total drawdown
            current_drawdown = self.get_current_drawdown()
            if current_drawdown > self.emergency_stop_threshold:
                self.emergency_stop(f"Critical drawdown exceeded ({current_drawdown:.1%})")
                logger.critical(f"EMERGENCY STOP TRIGGERED: Drawdown {current_drawdown:.1%} > {self.emergency_stop_threshold:.1%}")
                return False, f"Emergency stop: Critical drawdown ({current_drawdown:.1%})"
        
        # 2. CIRCUIT BREAKER CHECK - Stops after consecutive losses
        if self.circuit_breaker_enabled:
            # Check if automatic reset is possible
            if self.circuit_breaker_triggered_time and not self.circuit_breaker_manual_reset:
                hours_since_trigger = (time.time() - self.circuit_breaker_triggered_time) / 3600
                if hours_since_trigger >= self.circuit_breaker_reset_hours:
                    logger.info(f"Circuit breaker auto-reset after {hours_since_trigger:.1f} hours")
                    self.circuit_breaker_triggered_time = None
                    self.consecutive_losses = 0
            
            # Check consecutive losses
            if self.consecutive_losses >= self.circuit_breaker_losses:
                if not self.circuit_breaker_triggered_time:
                    self.circuit_breaker_triggered_time = time.time()
                    logger.warning(f"CIRCUIT BREAKER TRIGGERED: {self.consecutive_losses} consecutive losses")
                
                total_trades = self.total_wins + self.total_losses
                win_rate = (self.total_wins / total_trades * 100) if total_trades > 0 else 0
                return False, f" Circuit breaker: {self.consecutive_losses} consecutive losses (Win rate: {win_rate:.1f}%)"
        
        # 3. DAILY LOSS LIMIT CHECK - Protects daily capital
        if self.daily_loss_limit_enabled:
            if self.daily_loss_limit_triggered:
                return False, " Daily loss limit reached - Trading paused until reset"
            
            # Calculate daily drawdown
            daily_drawdown = (self.daily_start_equity - (self.current_equity or 0)) / self.daily_start_equity if self.daily_start_equity else 0.0
            
            # Update metrics
            if hasattr(self, 'metrics') and self.metrics:
                try:
                    self.metrics.update_drawdown(daily_drawdown)
                except Exception as e:
                    logger.error(f"Failed to update daily drawdown metric: {e}")
            
            # Apply progressive limits if strict mode
            adjusted_drawdown_limit = self.max_daily_drawdown
            if self.daily_drawdown_strict and self.daily_trades > 20:
                adjusted_drawdown_limit *= 0.8  # Tighter limit after many trades
            
            if daily_drawdown > adjusted_drawdown_limit:
                self.daily_loss_limit_triggered = True
                logger.warning(f"Daily loss limit triggered: Drawdown {daily_drawdown:.1%} > {adjusted_drawdown_limit:.1%}")
                return False, f" Daily drawdown limit exceeded ({daily_drawdown:.1%} > {adjusted_drawdown_limit:.1%})"
        
        # 4. CONCURRENT TRADES CHECK - Always enforced
        if len(self.open_trades) >= self.max_concurrent_trades:
            return False, f"Maximum concurrent trades reached ({self.max_concurrent_trades})"
        
        # 5. COOLDOWN PERIOD CHECK - Prevents rapid-fire losses
        if self.cooldown_enabled and self._is_in_cooldown():
            time_since_loss = time.time() - self.last_loss_time
            
            # Calculate cooldown with exponential backoff
            if self.cooldown_exponential:
                cooldown_duration = min(
                    self.cooldown_after_loss * (self.cooldown_multiplier ** min(self.consecutive_losses - 1, 4)),
                    self.max_cooldown
                )
            else:
                cooldown_duration = self.cooldown_after_loss
            
            time_remaining = cooldown_duration - time_since_loss
            if time_remaining > 0:
                return False, f"Cooldown period: {time_remaining:.0f}s remaining (Loss #{self.consecutive_losses})"
        
        # 6. WIN RATE PROTECTION CHECK - Stops if performance is poor
        if self.win_rate_protection_enabled:
            total_trades = self.total_wins + self.total_losses
            if total_trades >= self.min_trades_for_win_rate:
                current_win_rate = self.total_wins / total_trades
                if current_win_rate < self.min_win_rate_threshold:
                    logger.warning(f"Win rate protection triggered: {current_win_rate:.1%} < {self.min_win_rate_threshold:.1%}")
                    return False, f" Win rate too low: {current_win_rate:.1%} < {self.min_win_rate_threshold:.1%} (after {total_trades} trades)"
        
        # 7. MINIMUM EQUITY CHECK - Ensure enough capital to trade
        min_equity_required = (self.min_stake or 0.35) * 3  # Need 3x min stake for safety
        if self.current_equity and self.current_equity < min_equity_required:
            return False, f" Insufficient equity: ${self.current_equity:.2f} < ${min_equity_required:.2f}"
            
        # 8. Check market volatility (if available)
        # This would require passing market volatility to this method
        
        # All checks passed
        return True, "Trading allowed - risk controls satisfied"

    def calculate_martingale_stake(self) -> float:
        """
        Calculate stake using Martingale strategy.
        Doubles stake after each loss, resets to base after win.
        
        Returns:
            Martingale-adjusted stake amount
        """
        if not self.martingale_enabled:
            return self.martingale_base_stake
        
        # Calculate stake based on current Martingale level
        stake = self.martingale_base_stake * (self.martingale_multiplier ** self.current_martingale_level)
        
        # Cap at max stake
        stake = min(stake, self.max_stake)
        
        logger.info(
            f" Martingale Level {self.current_martingale_level}: "
            f"${stake:.2f} (Base: ${self.martingale_base_stake}, "
            f"Multiplier: {self.martingale_multiplier}x)"
        )
        
        return round(stake, 2)

    def calculate_win_streak_stake(self, base_stake: float, 
                                   consecutive_wins: int, 
                                   consecutive_losses: int,
                                   win_rate: float) -> float:
        """
        Scale stake based on current streak for maximum profit during wins
        and capital preservation during losses.
        
        Args:
            base_stake: Base stake amount
            consecutive_wins: Number of consecutive wins
            consecutive_losses: Number of consecutive losses  
            win_rate: Current overall win rate (0.0 to 1.0)
            
        Returns:
            Adjusted stake amount
        """
        # If Martingale is enabled, use Martingale stake calculation instead
        if self.martingale_enabled:
            return self.calculate_martingale_stake()
        
        # If min/max stake are equal, use fixed stake (no scaling)
        if self.min_stake == self.max_stake:
            return self.min_stake
        
        multiplier = 1.0
        
        # WIN STREAK SCALING - Compound growth during winning periods
        if consecutive_wins > 0:
            # Progressive increase: win_streak_bonus% per win
            win_bonus = 1.0 + (consecutive_wins * self.win_streak_bonus)
            
            # Cap at 2.5x for safety (never risk more than 2.5x base)
            win_bonus = min(win_bonus, 2.5)
            
            # Additional boost if win rate is excellent
            if win_rate >= 0.65:  # 65%+ win rate
                win_bonus *= 1.2  # 20% extra boost
                logger.info(f"High win rate bonus: {win_rate:.1%} -> +20% multiplier")
            
            multiplier = win_bonus
            logger.info(f"Win streak scaling: {consecutive_wins} wins -> {multiplier:.2f}x stake")
        
        # LOSS STREAK PROTECTION - Capital preservation during losses
        elif consecutive_losses > 0:
            # Progressive decrease: loss_penalty% per loss
            loss_reduction = 1.0 - (consecutive_losses * self.loss_penalty)
            
            # Floor at 0.4x (never go below 40% of base stake)
            loss_reduction = max(loss_reduction, 0.4)
            
            multiplier = loss_reduction
            logger.info(f"Loss protection: {consecutive_losses} losses -> {multiplier:.2f}x stake")
        
        # Calculate final stake
        adjusted_stake = base_stake * multiplier
        
        # Apply absolute min/max limits
        adjusted_stake = max(self.min_stake, min(adjusted_stake, self.max_stake))
        
        return round(adjusted_stake, 2)

    def calculate_stake(
        self, volatility: float = 0.001, confidence: float = 1.0, signal_strength: float = 1.0
    ) -> float:
        """
        Calculate appropriate stake size based on percentage-based risk management.
        Implements advanced recovery mechanism after losses with adaptive sizing.
        Adjusts behavior based on account type (demo/real).

        Args:
            volatility: Current market volatility
            confidence: Signal confidence (0.0 to 1.0)
            signal_strength: Signal strength from indicators (0.0 to 1.0)

        Returns:
            Calculated stake amount
        """
        # Log account type for clarity
        logger.info(f"Calculating stake for {self.account_type.upper()} account (equity: ${self.current_equity:.2f})")
        
        # CRITICAL FIX: For demo accounts, we need to use the initial equity (e.g. $50)
        # instead of the actual demo balance (which can be thousands) to calculate stake
        calculation_equity = self.initial_equity if self.is_demo else self.current_equity
        logger.info(f"Using {calculation_equity:.2f} as calculation base for stake (demo={self.is_demo})")
        
        # Use percentage-based risk per trade (from config or default 0.5%)
        risk_per_trade_pct = config.get('risk_management.risk_per_trade_pct', 0.03)  # 0.5% of equity per trade

        # ADVANCED RECOVERY MECHANISM: Implements a progressive recovery strategy
        # that increases stake after losses but with smarter scaling based on:
        # 1. Number of consecutive losses
        # 2. Total equity remaining
        # 3. Win/loss ratio
        
        # Calculate win rate for adaptive recovery
        total_trades = self.total_wins + self.total_losses
        win_rate = self.total_wins / max(total_trades, 1) * 100
        
        # Base recovery multiplier calculation
        recovery_multiplier = 1.0
        if self.consecutive_losses > 0:
            # Calculate recovery factor based on consecutive losses
            base_recovery = min(1.0 + (self.consecutive_losses * 0.25), 2.0)
            
            # Adjust recovery based on win rate (more aggressive if win rate is high)
            if win_rate > 55:
                # Higher win rate = more aggressive recovery (up to 2.5x)
                recovery_multiplier = min(base_recovery * 1.25, 2.5)
                logger.info(f"AGGRESSIVE RECOVERY: High win rate ({win_rate:.1f}%), multiplier = {recovery_multiplier:.2f}x")
            elif win_rate < 40:
                # Lower win rate = more conservative recovery (max 1.5x)
                recovery_multiplier = min(base_recovery * 0.75, 1.5)
                logger.info(f"CONSERVATIVE RECOVERY: Low win rate ({win_rate:.1f}%), multiplier = {recovery_multiplier:.2f}x")
            else:
                # Standard recovery
                recovery_multiplier = base_recovery
                logger.info(f"STANDARD RECOVERY: After {self.consecutive_losses} losses, multiplier = {recovery_multiplier:.2f}x")
                
            # Safety check: Reduce recovery if equity is dropping too much
            current_drawdown = self.get_current_drawdown()
            if current_drawdown > 0.15:  # If drawdown exceeds 15%
                drawdown_factor = max(1.0 - (current_drawdown - 0.15) * 2, 0.5)  # Reduce by up to 50%
                recovery_multiplier *= drawdown_factor
                logger.info(f"DRAWDOWN PROTECTION: Reducing recovery due to {current_drawdown:.1%} drawdown (factor: {drawdown_factor:.2f})")
        
        # If Martingale is enabled, use Martingale stake calculation
        if self.martingale_enabled:
            stake = self.calculate_martingale_stake()
            logger.info(f"Using Martingale stake: ${stake:.2f}")
            return stake
        
        # If min_stake equals max_stake, use fixed stake value WITHOUT recovery multiplier
        # This ensures we always use exactly the configured stake amount
        if self.min_stake == self.max_stake:
            stake = self.min_stake  # Always use exact fixed stake
            logger.info(f"Using fixed stake: {stake} (recovery disabled for fixed stake)")
            return stake
        else:
            # Calculate base stake as percentage of appropriate equity value
            base_stake = calculation_equity * risk_per_trade_pct

            # ADAPTIVE STAKE SIZING: Adjust stake based on multiple factors
            
            # 1. Adjust for signal strength (stronger signals = higher stake)
            # More aggressive scaling for very strong signals
            if signal_strength > 0.8:
                strength_multiplier = 1.5 + (signal_strength - 0.8) * 2.5  # Up to 2.0x for strongest signals
            else:
                strength_multiplier = 0.8 + signal_strength * 0.875  # 0.8x to 1.5x range
                
            # 2. Adjust for confidence (higher confidence = higher stake)
            # More nuanced confidence scaling
            confidence_multiplier = 0.7 + (confidence * 0.6)  # 0.7x to 1.3x based on confidence

            # 3. Adjust for volatility (higher volatility = smaller stake for safety)
            # Improved volatility handling with better scaling
            if volatility < 0.0005:  # Very low volatility
                volatility_factor = 1.3  # Increase stake in very stable markets
            elif volatility > 0.0005:  # Very high volatility
                volatility_factor = 0.4  # Significantly reduce stake in highly volatile markets
            else:
                # Smoother curve for normal volatility range
                volatility_factor = 1.3 - (volatility * 180)  # 1.3x down to 0.4x
                
            volatility_factor = clamp(volatility_factor, 0.4, 1.3)

            # Calculate final stake with all multipliers
            stake = base_stake * strength_multiplier * confidence_multiplier * volatility_factor * recovery_multiplier

            # Apply absolute limits for safety
            max_stake_by_equity = (calculation_equity or 50.0) * 0.08  # Max 8% of equity per trade (more conservative)
            min_stake_by_equity = (calculation_equity or 50.0) * 0.03  # Min 0.5% of equity per trade

            effective_max_stake = min(self.max_stake, max_stake_by_equity)
            effective_min_stake = max(self.min_stake, min_stake_by_equity)

            stake = clamp(stake, effective_min_stake, effective_max_stake)

            # Round to 2 decimal places
            stake = round(stake, 2)
            
            logger.info(
                f"Adaptive stake: {stake} ({risk_per_trade_pct*100:.1f}% of {self.current_equity:.2f}), "
                f"strength: {strength_multiplier:.2f}x, confidence: {confidence_multiplier:.2f}x, "
                f"volatility: {volatility_factor:.2f}x, recovery: {recovery_multiplier:.2f}x"
            )
        
        #  NEW: Apply win streak scaling for compound growth
        total_trades = self.total_wins + self.total_losses
        current_win_rate = self.total_wins / max(total_trades, 1)
        
        final_stake = self.calculate_win_streak_stake(
            base_stake=stake,
            consecutive_wins=self.consecutive_wins,
            consecutive_losses=self.consecutive_losses,
            win_rate=current_win_rate
        )
        
        return final_stake

    def calculate_impulse_pullback_stake(
        self,
        entry_price: float,
        stop_loss_price: float,
        target_price: float,
        account_balance: Optional[float] = None
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

            # Use account balance if provided, otherwise use appropriate equity value
            # For demo accounts, use initial equity instead of inflated demo balance
            if account_balance:
                balance = account_balance
            else:
                balance = self.initial_equity if self.is_demo else self.current_equity

            # Risk 0.5% of account per trade (adjusted for better risk management)
            risk_per_trade = (balance or 50.0) * 0.03  # 0.5% risk per trade

            # Calculate stake based on risk distance
            # stake = risk_amount / risk_distance
            stake = risk_per_trade / risk_distance

            # Apply limits
            stake = max(self.min_stake, min(stake, self.max_stake))

            # Ensure stake doesn't exceed 10% of account
            max_stake_by_balance = (balance or 50.0) * 0.03
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
        self, trade_id: str, exit_price: float, timestamp: int, closure_reason: str = ""
    ) -> Dict[str, Any]:
        """
        Close a trade and update equity with enhanced performance tracking.

        Args:
            trade_id: Trade ID
            exit_price: Exit price (payout amount)
            timestamp: Exit timestamp

        Returns:
            Trade result dictionary with comprehensive metrics
        """
        if trade_id not in self.open_trades:
            logger.error(f"Trade {trade_id} not found in open trades")
            return {}

        # Get trade details
        trade = self.open_trades[trade_id]
        entry_price = trade["entry_price"]
        stake = trade["stake"]
        entry_time = trade.get("timestamp", 0)
        trade_duration = 0
        
        # Calculate trade duration if we have timestamps
        if timestamp and entry_time:
            trade_duration = timestamp - entry_time

        # Calculate P&L using actual payout from Deriv API
        # exit_price is the actual payout received (sold_for from API response)
        profit = exit_price - stake
        profit_pct = (profit / stake) * 100 if stake > 0 else 0
        
        # Calculate price change and percentage change for reference
        price_change = exit_price - entry_price
        price_change_pct = calculate_percentage_change(entry_price, exit_price)

        # Update equity based on account type
        if self.is_demo:
            # In demo mode, we track profit but don't let demo balance affect our risk calculations
            self.total_profit += profit
            # Keep using our configured equity for risk calculations
            logger.info(f"Demo account: Tracking P&L (${profit:.2f}) but preserving risk capital")
        else:
            # In live mode, we update equity based on actual trade results
            self.current_equity += profit
            self.total_profit += profit
            logger.info(f"Live account: Updated equity to ${self.current_equity:.2f} after ${profit:.2f} P&L")

        # Track lowest equity point
        if self.current_equity and self.lowest_equity and self.current_equity < self.lowest_equity:
            self.lowest_equity = self.current_equity
            
        # Update peak equity
        if self.current_equity and self.peak_equity and self.current_equity > self.peak_equity:
            self.peak_equity = self.current_equity

        # Update performance metrics with enhanced tracking
        self.total_trades += 1
        self.daily_trades += 1
        
        if profit > 0:
            # Win metrics
            self.total_wins += 1
            self.daily_wins += 1
            self.consecutive_wins += 1
            self.consecutive_losses = 0
            self.last_win_time = time.time()
            
            # Track best trade
            if profit > self.best_trade:
                self.best_trade = profit
                
            # Update average win
            self.avg_win = ((self.avg_win * (self.total_wins - 1)) + profit) / self.total_wins
            
            # Martingale: Reset level on win
            if self.martingale_enabled and self.martingale_reset_on_profit:
                if self.current_martingale_level > 0:
                    logger.info(f"Martingale WIN! Resetting from Level {self.current_martingale_level} -> Level 0")
                self.current_martingale_level = 0
            
            logger.info(f"WIN: ${profit:.2f} ({profit_pct:.1f}%) | Consecutive wins: {self.consecutive_wins}")
        else:
            # Loss metrics
            self.total_losses += 1
            self.daily_losses += 1
            self.consecutive_losses += 1
            self.consecutive_wins = 0
            
            # Skip cooldown for profit protection closures (they're successful profit-taking)
            if "profit_protection" not in closure_reason.lower():
                self.last_loss_time = time.time()
            else:
                logger.info(f"Profit protection closure - skipping cooldown")

            # Track worst trade
            if profit < self.worst_trade:
                self.worst_trade = profit
                
            # Update average loss
            self.avg_loss = ((self.avg_loss * (self.total_losses - 1)) + profit) / self.total_losses
            
            # Martingale: Increase level on loss (up to max)
            if self.martingale_enabled:
                if self.current_martingale_level < self.martingale_max_level:
                    self.current_martingale_level += 1
                    next_stake = self.martingale_base_stake * (self.martingale_multiplier ** self.current_martingale_level)
                    logger.warning(
                        f" Martingale LOSS! Advancing to Level {self.current_martingale_level} "
                        f"(Next stake: ${next_stake:.2f})"
                    )
                else:
                    logger.critical(
                        f" Martingale MAX LEVEL REACHED! Staying at Level {self.current_martingale_level} "
                        f"(Stake capped at ${self.max_stake:.2f})"
                    )
            
            logger.info(f"LOSS: ${profit:.2f} ({profit_pct:.1f}%) | Consecutive losses: {self.consecutive_losses}")

        # Calculate win rate and add to history
        win_rate = (self.total_wins / self.total_trades) * 100 if self.total_trades > 0 else 0
        self.win_rate_history.append((timestamp or time.time(), win_rate))
        
        # Keep only last 100 win rate entries
        if len(self.win_rate_history) > 100:
            self.win_rate_history = self.win_rate_history[-100:]
        
        # Calculate time-based metrics
        session_duration_hours = (time.time() - self.session_start_time) / 3600
        if session_duration_hours > 0:
            self.trades_per_hour = self.total_trades / session_duration_hours
            self.profit_per_hour = self.total_profit / session_duration_hours

        # Remove from open trades
        del self.open_trades[trade_id]

        # Create comprehensive result dictionary
        result = {
            "trade_id": trade_id,
            "type": trade["type"],
            "stake": stake,
            "entry_price": entry_price,
            "exit_price": exit_price,
            "price_change": price_change,
            "price_change_pct": price_change_pct,
            "profit": profit,
            "profit_pct": profit_pct,
            "timestamp": timestamp,
            "duration": trade_duration,
            "win": profit > 0,
            "current_equity": self.current_equity,
            "win_rate": win_rate,
        }

        # Log detailed trade results
        logger.info(
            f"Trade {trade_id} closed: P&L = ${profit:.2f} ({profit_pct:.1f}%) | "
            f"Equity: ${self.current_equity:.2f} | Win rate: {win_rate:.1f}%"
        )
        
        # Log performance summary every 5 trades
        if self.total_trades % 5 == 0:
            logger.info(
                f"Performance summary: {self.total_wins}/{self.total_trades} wins ({win_rate:.1f}%) | "
                f"Profit: ${self.total_profit:.2f} | Trades/hour: {self.trades_per_hour:.1f}"
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
        if not self.peak_equity or self.peak_equity == 0:
            return 0.0
        if not self.current_equity:
            return 0.0
        return (self.peak_equity - self.current_equity) / self.peak_equity

    def get_current_drawdown(self) -> float:
        """Get current drawdown as a percentage."""
        return self._calculate_drawdown()
    
    def calculate_dynamic_stake(self, base_stake: float, win_rate: float = 0.0, consecutive_wins: int = 0, consecutive_losses: int = 0) -> float:
        """
        Calculate dynamic stake based on performance to maximize profit probability.
        Enhanced with market condition adaptation and better risk management.
        
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
            current_drawdown = self.get_current_drawdown()
            
            # ENHANCED DYNAMIC STAKE SYSTEM
            
            # Rule 1: Win rate based scaling with more granular adjustments
            if win_rate >= 65.0:  # Exceptional win rate
                win_multiplier = 1.5
                logger.debug(f"Exceptional win rate ({win_rate:.1f}%) - increasing stake by 50%")
            elif win_rate >= 55.0:  # Good win rate
                win_multiplier = 1.25
                logger.debug(f"Good win rate ({win_rate:.1f}%) - increasing stake by 25%")
            elif win_rate >= 50.0:  # Decent win rate
                win_multiplier = 1.1
                logger.debug(f"Decent win rate ({win_rate:.1f}%) - increasing stake by 10%")
            elif win_rate <= 35.0:  # Very poor win rate
                win_multiplier = 0.6
                logger.debug(f"Very poor win rate ({win_rate:.1f}%) - reducing stake by 40%")
            elif win_rate <= 45.0:  # Poor win rate
                win_multiplier = 0.8
                logger.debug(f"Poor win rate ({win_rate:.1f}%) - reducing stake by 20%")
            else:
                win_multiplier = 1.0
                
            multiplier *= win_multiplier

            # Rule 2: Winning streak bonus with progressive scaling
            if consecutive_wins >= 1:
                # Progressive scaling that accelerates with more wins
                if consecutive_wins >= 5:
                    streak_multiplier = 1.5  # Cap at 50% increase
                else:
                    streak_multiplier = 1.0 + (consecutive_wins * 0.1)  # 10% per win
                
                multiplier *= streak_multiplier
                logger.debug(f"Winning streak ({consecutive_wins}) - increasing stake by {(streak_multiplier-1.0)*100:.0f}%")
            
            # Rule 3: Drawdown protection - reduce stake when in drawdown
            if current_drawdown > 0.05:  # More than 5% drawdown
                # Progressive reduction based on drawdown severity
                drawdown_factor = 1.0 - (current_drawdown * 2)  # Linear reduction
                drawdown_factor = max(drawdown_factor, 0.5)  # Floor at 50%
                
                multiplier *= drawdown_factor
                logger.debug(f"Drawdown protection: {current_drawdown:.1%} drawdown - reducing stake by {(1.0-drawdown_factor)*100:.0f}%")
            
            # Rule 4: Account growth bonus - increase stake as account grows
            if self.current_equity and self.initial_equity and self.current_equity > self.initial_equity * 1.2:  # 20% account growth
                growth_factor = min(self.current_equity / self.initial_equity, 2.0) if self.initial_equity else 1.0  # Cap at 2x
                growth_bonus = 1.0 + ((growth_factor - 1.0) * 0.25)  # 25% of growth as bonus
                
                multiplier *= growth_bonus
                logger.debug(f"Account growth bonus: {growth_bonus:.2f}x (equity growth: {growth_factor:.2f}x)")
            
            # Rule 5: Recovery mode after losses
            if consecutive_losses > 0:
                # Anti-martingale approach: reduce stake after losses to preserve capital
                recovery_factor = max(1.0 - (consecutive_losses * 0.15), 0.5)  # Reduce by 15% per loss, floor at 50%
                
                multiplier *= recovery_factor
                logger.debug(f"Recovery mode: {consecutive_losses} consecutive losses - reducing stake by {(1.0-recovery_factor)*100:.0f}%")
            
            # Calculate final stake with all factors applied
            dynamic_stake = base_stake * multiplier
            
            # Apply stricter bounds based on equity
            max_stake_by_equity = (self.current_equity or 50.0) * 0.08  # Max 8% of equity per trade
            min_stake_by_equity = (self.current_equity or 50.0) * 0.03  # Min 0.5% of equity per trade
            
            # Apply absolute bounds
            effective_max_stake = min(self.max_stake, max_stake_by_equity)
            effective_min_stake = max(self.min_stake, min_stake_by_equity)
            
            dynamic_stake = clamp(dynamic_stake, effective_min_stake, effective_max_stake)
            
            # Round to 2 decimal places
            dynamic_stake = round(dynamic_stake, 2)
            
            if abs(multiplier - 1.0) > 0.01:  # Only log if multiplier is significantly different from 1.0
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
        # Reset Martingale level at start of day
        self.current_martingale_level = 0

        logger.info("Daily metrics reset (including Martingale level)")

    def update_equity(self, new_equity: float) -> None:
        """
        Update current equity (e.g., from account balance API).

        Args:
            new_equity: New equity amount
        """
        old_equity = self.current_equity
        self.current_equity = new_equity

        if self.peak_equity and new_equity > self.peak_equity:
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
        self.consecutive_wins = 0
        self.daily_loss_limit_triggered = False
        self.emergency_stopped = False  #  Reset emergency stop
        self.current_martingale_level = 0  #  Reset Martingale level

        self.total_trades = 0
        self.total_wins = 0
        self.total_losses = 0
        self.total_profit = 0.0

        logger.info("Risk manager reset (including Martingale level)")

    def clear_all_risk_blocks(self):
        """
        CLEAR ALL RISK BLOCKS - Remove all trading restrictions.
        Use with caution! This removes ALL safety limits.
        """
        # Reset all blocking flags
        self.emergency_stopped = False
        self.daily_loss_limit_triggered = False
        
        # Reset loss counters (but keep equity tracking)
        self.consecutive_losses = 0
        self.last_loss_time = 0
        
        # Clear any active trades that might be blocking
        self.open_trades.clear()
        
        logger.warning("ALL RISK BLOCKS CLEARED - Trading restrictions removed!")
        logger.warning("Emergency stop: DISABLED")
        logger.warning("Daily loss limits: DISABLED") 
        logger.warning("Circuit breaker: DISABLED")
        logger.warning("Cooldown periods: DISABLED")
        logger.warning("Minimum equity: RELAXED")
        
        return True


