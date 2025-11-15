"""
Risk management module for LemoTick bot.
Handles position sizing, drawdown limits, and trading controls.
"""

import time
import logging
from typing import Dict, Any, Optional, Tuple

from infrastructure.config import config
from infrastructure.logger import logger
from utils.helpers import clamp, calculate_percentage_change

logger = logging.getLogger(__name__)

class RiskManager:
    """Comprehensive risk management system."""

    def __init__(self, initial_equity: Optional[float] = None, metrics=None):
        """
        Initialize risk manager with advanced risk controls and adaptive stake sizing.

        Args:
            initial_equity: Starting equity amount (if None, uses account-specific config)
            metrics: Metrics instance for Prometheus monitoring
        """
        try:
            self.account_type = config.get_account_type()
            self.is_demo = config.is_demo_account()
        except AttributeError:
            self.account_type = "demo"
            self.is_demo = True
        
        self.metrics = metrics
        if initial_equity is None:
            initial_equity = config.get_account_config("initial_equity", 50.0)
            
        logger.info(f"Initializing risk manager for {self.account_type.upper()} account with ${initial_equity:.2f} equity")
            
        self.initial_equity = initial_equity
        self.current_equity = initial_equity
        self.daily_start_equity = initial_equity
        self.peak_equity = initial_equity
        self.lowest_equity = initial_equity
        
        self.risk_per_trade = config.risk_per_trade
        self.max_daily_drawdown = config.get("risk_management.max_daily_drawdown", 0.05)
        self.max_stake = config.max_stake
        self.min_stake = config.min_stake
        self.force_always_trade = bool(config.get("risk_management.force_always_trade", False))
        if self.force_always_trade:
            logger.warning("RISK WARNING: Force always trade enabled - risk controls will be bypassed!")

        self.cooldown_after_loss = config.get("risk_management.cooldown_seconds", 5.0)
        self.max_concurrent_trades = config.get("risk_management.max_concurrent_trades", 1)
        self.daily_loss_limit_triggered = False
        self.consecutive_wins = 0

        # Circuit Breaker
        self.circuit_breaker_enabled = config.get("risk_management.circuit_breaker_enabled", True)
        self.circuit_breaker_losses = config.get("risk_management.circuit_breaker_losses", 5)
        self.circuit_breaker_reset_hours = config.get("risk_management.circuit_breaker_reset_hours", 6)
        self.circuit_breaker_manual_reset = config.get("risk_management.circuit_breaker_manual_reset", False)
        self.circuit_breaker_triggered_time = None
        
        # Log circuit breaker configuration for 24/7 operation verification
        logger.info(f"Circuit Breaker: enabled={self.circuit_breaker_enabled}, losses={self.circuit_breaker_losses}, "
                   f"reset_hours={self.circuit_breaker_reset_hours}")
        
        # Daily Loss Limits
        self.daily_loss_limit_enabled = config.get("risk_management.daily_loss_limit_enabled", True)
        self.daily_drawdown_strict = config.get("risk_management.daily_drawdown_strict", True)
        
        # Emergency Stop
        self.emergency_stop_enabled = config.get("risk_management.emergency_stop_enabled", True)
        self.emergency_stop_threshold = config.get("risk_management.emergency_stop_threshold", 0.20)
        self.emergency_stop_manual_reset = config.get("risk_management.emergency_stop_manual_reset", True)
        self.emergency_stopped = False
        
        # Cooldown
        self.cooldown_enabled = config.get("risk_management.cooldown_enabled", True)
        self.cooldown_exponential = config.get("risk_management.cooldown_exponential", True)
        self.cooldown_multiplier = config.get("risk_management.cooldown_multiplier", 2.0)
        self.max_cooldown = config.get("risk_management.max_cooldown", 180)
        
        # Log cooldown configuration for 24/7 operation verification
        logger.info(f"Cooldown Settings: enabled={self.cooldown_enabled}, base={self.cooldown_after_loss}s, "
                   f"exponential={self.cooldown_exponential}, multiplier={self.cooldown_multiplier}x, max={self.max_cooldown}s")
        
        # Win Rate Protection
        self.win_rate_protection_enabled = config.get("risk_management.win_rate_protection_enabled", True)
        self.min_win_rate_threshold = config.get("risk_management.min_win_rate_threshold", 0.60)
        self.min_trades_for_win_rate = config.get("risk_management.min_trades_for_win_rate", 10)
        
        # Adaptive recovery
        self.recovery_mode_enabled = config.get("risk_management.recovery_mode_enabled", True)
        self.recovery_factor = config.get("risk_management.recovery_factor", 0.25)
        self.max_recovery_multiplier = config.get("risk_management.max_recovery_multiplier", 2.5)
        
        # Martingale
        self.martingale_enabled = config.get("trading.martingale_enabled", False)
        self.martingale_base_stake = config.get("trading.martingale_base_stake", self.min_stake)
        self.martingale_multiplier = config.get("trading.martingale_multiplier", 2.0)
        self.martingale_max_level = config.get("trading.martingale_max_level", 4)
        self.martingale_reset_on_profit = config.get("trading.martingale_reset_on_profit", True)
        self.current_martingale_level = 0
        
        # State tracking
        self.open_trades: Dict[str, Dict[str, Any]] = {}
        self.last_loss_time = 0
        self.last_win_time = 0
        self.consecutive_losses = 0
        self.daily_trades = 0
        self.daily_wins = 0
        self.daily_losses = 0
        self.session_start_time = time.time()
        
        # Adaptive stake
        self.dynamic_stake_enabled = config.get("risk_management.dynamic_stake_enabled", True)
        self.win_rate_multiplier = config.get("risk_management.win_rate_multiplier", 1.5)
        self.loss_rate_multiplier = config.get("risk_management.loss_rate_multiplier", 0.5)
        self.win_streak_bonus = config.get("risk_management.win_streak_bonus", 0.15)
        self.loss_penalty = config.get("risk_management.loss_penalty", 0.35)

        # Market adaptation
        self.volatility_adjustment = config.get("risk_management.volatility_adjustment", True)
        self.market_condition_factor = 1.0
        
        # Performance
        self.total_trades = 0
        self.total_wins = 0
        self.total_losses = 0
        self.total_profit = 0.0
        self.best_trade = 0.0
        self.worst_trade = 0.0
        self.avg_win = 0.0
        self.avg_loss = 0.0
        self.win_rate_history: list[tuple[float, float]] = []
        self.trades_per_hour = 0.0
        self.profit_per_hour = 0.0
        
        logger.info(f"Enhanced Risk Manager initialized with equity: ${initial_equity:.2f}")

    # --- MAIN METHODS ---
    def can_trade(self) -> Tuple[bool, str]:
        """Check if trading is allowed based on risk controls."""
        if self.force_always_trade:
            return True, "Forced trading enabled (risk controls bypassed)"
            
        # Emergency stop
        if self.emergency_stop_enabled and self.emergency_stopped:
            return False, "EMERGENCY STOP ACTIVE"

        # Circuit breaker
        if self.circuit_breaker_enabled and self.consecutive_losses >= self.circuit_breaker_losses:
            return False, f"Circuit breaker triggered ({self.consecutive_losses} losses)"

        # Daily loss
        daily_start = self.daily_start_equity or 0.0
        current = self.current_equity or 0.0
        if daily_start > 0:
            daily_drawdown = (daily_start - current) / daily_start
            if self.daily_loss_limit_enabled and daily_drawdown > self.max_daily_drawdown:
                return False, f"Daily drawdown exceeded ({daily_drawdown:.1%})"

        # Max concurrent trades
        if len(self.open_trades) >= self.max_concurrent_trades:
            return False, f"Max concurrent trades reached ({self.max_concurrent_trades})"

        # Cooldown
        if self.cooldown_enabled and self._is_in_cooldown():
            cooldown_remaining = self._get_cooldown_remaining()
            logger.debug(f"⏸️ COOLDOWN ACTIVE: {cooldown_remaining:.1f}s remaining (consecutive losses: {self.consecutive_losses})")
            return False, f"In cooldown period ({cooldown_remaining:.1f}s remaining)"

        # Win rate protection
        total_trades = self.total_wins + self.total_losses
        if self.win_rate_protection_enabled and total_trades >= self.min_trades_for_win_rate:
            win_rate = self.total_wins / total_trades
            if win_rate < self.min_win_rate_threshold:
                return False, f"Win rate too low ({win_rate:.1%})"

        # Minimum equity
        min_equity_required = self.min_stake * 3
        current = self.current_equity or 0.0
        if current < min_equity_required:
            return False, f"Insufficient equity (${current:.2f})"

        return True, "Trading allowed"

    def _is_in_cooldown(self) -> bool:
        """Check if currently in cooldown period after loss."""
        if self.consecutive_losses == 0 or self.last_loss_time == 0:
            return False
        
        # Calculate cooldown duration
        if self.cooldown_exponential:
            cooldown_duration = min(
                self.cooldown_after_loss * (self.cooldown_multiplier ** min(self.consecutive_losses - 1, 4)),
                self.max_cooldown
            )
        else:
            cooldown_duration = self.cooldown_after_loss
        
        time_since_loss = time.time() - self.last_loss_time
        return time_since_loss < cooldown_duration
    
    def _get_cooldown_remaining(self) -> float:
        """Get remaining cooldown time in seconds."""
        if self.consecutive_losses == 0 or self.last_loss_time == 0:
            return 0.0
        
        time_since_loss = time.time() - self.last_loss_time
        if self.cooldown_exponential:
            cooldown_duration = min(
                self.cooldown_after_loss * (self.cooldown_multiplier ** min(self.consecutive_losses - 1, 4)),
                self.max_cooldown
            )
        else:
            cooldown_duration = self.cooldown_after_loss
        
        remaining = max(0, cooldown_duration - time_since_loss)
        return remaining

    # --- STAKE CALCULATION METHODS ---
    def calculate_stake(self, volatility: float = 0.001, confidence: float = 1.0, signal_strength: float = 1.0) -> float:
        """Calculate adaptive stake based on risk management rules."""
        calculation_equity = self.initial_equity if self.is_demo else (self.current_equity or self.initial_equity)
        risk_pct = getattr(self, 'risk_per_trade', 0.03)
        base_stake = (calculation_equity or 50.0) * risk_pct
        base_stake = round(max(self.min_stake, min(base_stake, self.max_stake)), 2)
        return base_stake
