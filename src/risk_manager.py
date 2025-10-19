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
        self.risk_per_trade = config.risk_per_trade
        self.max_daily_drawdown = config.max_daily_drawdown
        self.max_stake = config.max_stake
        self.min_stake = config.min_stake
        
        # Trading controls
        self.cooldown_after_loss = config.cooldown_after_loss
        self.max_concurrent_trades = config.get('risk.max_concurrent_trades', 1)
        self.daily_loss_limit_triggered = False
        
        # State tracking
        self.open_trades = {}
        self.last_loss_time = 0
        self.consecutive_losses = 0
        self.daily_trades = 0
        self.daily_wins = 0
        self.daily_losses = 0
        
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
        # Check daily loss limit
        if self.daily_loss_limit_triggered:
            return False, "Daily loss limit reached"
        
        # Check current drawdown
        current_drawdown = self._calculate_drawdown()
        if current_drawdown > self.max_daily_drawdown:
            self.daily_loss_limit_triggered = True
            logger.warning(f"Daily loss limit triggered. Drawdown: {current_drawdown:.2%}")
            return False, "Daily drawdown limit exceeded"
        
        # Check concurrent trades
        if len(self.open_trades) >= self.max_concurrent_trades:
            return False, "Maximum concurrent trades reached"
        
        # Check cooldown after loss
        if self._is_in_cooldown():
            time_remaining = self.cooldown_after_loss - (time.time() - self.last_loss_time)
            return False, f"In cooldown period. {time_remaining:.1f}s remaining"
        
        # Check minimum equity
        if self.current_equity < self.min_stake * 10:  # Need at least 10x min stake
            return False, "Insufficient equity for trading"
        
        return True, "Trading allowed"
    
    def calculate_stake(self, volatility: float = 0.001, confidence: float = 1.0) -> float:
        """
        Calculate appropriate stake size based on risk parameters.
        
        Args:
            volatility: Current market volatility
            confidence: Signal confidence (0.0 to 1.0)
            
        Returns:
            Calculated stake amount
        """
        # Base stake calculation
        base_risk = self.current_equity * self.risk_per_trade
        
        # Adjust for volatility (lower stake in high volatility)
        volatility_factor = clamp(0.5 / (volatility + 0.0001), 0.2, 2.0)
        
        # Adjust for confidence
        confidence_factor = clamp(confidence, 0.5, 1.0)
        
        # Calculate final stake
        stake = base_risk * volatility_factor * confidence_factor
        
        # Apply limits
        stake = clamp(stake, self.min_stake, min(self.max_stake, self.current_equity * 0.1))
        
        # Round to 2 decimal places
        stake = round(stake, 2)
        
        logger.debug(f"Calculated stake: {stake} (base_risk: {base_risk}, "
                    f"vol_factor: {volatility_factor:.2f}, conf_factor: {confidence_factor:.2f})")
        
        return stake
    
    def register_trade(self, trade_id: str, trade_type: str, stake: float, 
                      entry_price: float, timestamp: int) -> bool:
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
        if len(self.open_trades) >= self.max_concurrent_trades:
            logger.warning(f"Cannot register trade {trade_id}: max concurrent trades reached")
            return False
        
        self.open_trades[trade_id] = {
            'type': trade_type,
            'stake': stake,
            'entry_price': entry_price,
            'timestamp': timestamp,
            'status': 'open'
        }
        
        self.daily_trades += 1
        self.total_trades += 1
        
        logger.info(f"Registered trade {trade_id}: {trade_type} {stake} at {entry_price}")
        return True
    
    def close_trade(self, trade_id: str, exit_price: float, timestamp: int) -> Dict[str, Any]:
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
        entry_price = trade['entry_price']
        stake = trade['stake']
        
        # Calculate P&L (simplified for binary options)
        # In practice, you'd need to implement proper payout calculation
        price_change = exit_price - entry_price
        price_change_pct = calculate_percentage_change(entry_price, exit_price)
        
        # For binary options, profit/loss is based on contract outcome
        # This is a simplified calculation - adjust based on your contract type
        if trade['type'] == 'BUY':
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
            'trade_id': trade_id,
            'type': trade['type'],
            'stake': stake,
            'entry_price': entry_price,
            'exit_price': exit_price,
            'price_change': price_change,
            'price_change_pct': price_change_pct,
            'profit': profit,
            'timestamp': timestamp
        }
        
        logger.info(f"Closed trade {trade_id}: P&L = {profit:.2f}, Equity = {self.current_equity:.2f}")
        return result
    
    def _calculate_drawdown(self) -> float:
        """Calculate current drawdown from peak equity."""
        if self.peak_equity == 0:
            return 0.0
        return (self.peak_equity - self.current_equity) / self.peak_equity
    
    def _is_in_cooldown(self) -> bool:
        """Check if currently in cooldown period after loss."""
        if self.consecutive_losses == 0:
            return False
        
        # Escalating cooldown based on consecutive losses
        cooldown_duration = self.cooldown_after_loss * (2 ** min(self.consecutive_losses - 1, 4))
        time_since_loss = time.time() - self.last_loss_time
        
        return time_since_loss < cooldown_duration
    
    def reset_daily_metrics(self) -> None:
        """Reset daily trading metrics (call at start of each trading day)."""
        self.daily_start_equity = self.current_equity
        self.daily_loss_limit_triggered = False
        self.daily_trades = 0
        self.daily_wins = 0
        self.daily_losses = 0
        
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
        win_rate = (self.total_wins / self.total_trades * 100) if self.total_trades > 0 else 0
        
        return {
            'equity': {
                'initial': self.initial_equity,
                'current': self.current_equity,
                'peak': self.peak_equity,
                'daily_start': self.daily_start_equity
            },
            'drawdown': {
                'current': current_drawdown,
                'max_daily': self.max_daily_drawdown
            },
            'trades': {
                'total': self.total_trades,
                'open': len(self.open_trades),
                'max_concurrent': self.max_concurrent_trades
            },
            'performance': {
                'total_wins': self.total_wins,
                'total_losses': self.total_losses,
                'win_rate': win_rate,
                'total_profit': self.total_profit,
                'consecutive_losses': self.consecutive_losses
            },
            'daily': {
                'trades': self.daily_trades,
                'wins': self.daily_wins,
                'losses': self.daily_losses
            },
            'controls': {
                'can_trade': self.can_trade()[0],
                'daily_limit_triggered': self.daily_loss_limit_triggered,
                'in_cooldown': self._is_in_cooldown()
            }
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

