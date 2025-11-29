"""
Risk management module for LemoTick bot.
Handles position sizing, drawdown limits, and trading controls.
"""

import os
import time
from typing import Any, final

from infrastructure.logger import logger


@final
class RiskManager:
    """Comprehensive risk management system."""

    def __init__(
        self,
        config: dict[str, Any] | None = None,
        initial_equity: float | None = None,
        metrics=None,
    ):
        """
        Initialize risk manager with advanced risk controls and adaptive stake sizing.

        Args:
            config: Configuration object with account settings
            initial_equity: Starting equity amount (if None, uses account-specific config)
            metrics: Metrics instance for Prometheus monitoring
        """
        logger.info("RiskManager.__init__() - Starting initialization...")
        self.config = config
        logger.info("RiskManager.__init__() - Config stored")

        # Determine account type from config
        logger.info("RiskManager.__init__() - Determining account type...")
        if isinstance(config, dict):
            # Dictionary-style config (from ConfigManager)
            env_live = os.getenv("LEMOTICK_LIVE_ACCOUNT", "").lower()
            if env_live in ("true", "1", "yes"):
                self.account_type = "real"
                self.is_demo = False
            elif env_live in ("false", "0", "no"):
                self.account_type = "demo"
                self.is_demo = True
            else:
                # Check account_mode configuration
                use_live = config.get("account_mode", {}).get("use_live_account", False)
                if use_live:
                    self.account_type = "real"
                    self.is_demo = False
                else:
                    # Fall back to deprecated development.demo_account
                    self.is_demo = config.get("development", {}).get(
                        "demo_account", True
                    )
                    self.account_type = "demo" if self.is_demo else "real"
        elif config is not None:
            # Object-style config (legacy)
            try:
                self.account_type = config.get_account_type()
                self.is_demo = config.is_demo_account()
            except AttributeError:
                self.account_type = "demo"
                self.is_demo = True
        else:
            # No config provided - default to demo
            self.account_type = "demo"
            self.is_demo = True

        logger.info(f"RiskManager.__init__() - Account type determined: {self.account_type}")

        self.metrics = metrics
        logger.info("RiskManager.__init__() - Metrics stored")
        if initial_equity is None:
            if isinstance(config, dict):
                # Get from backend.accounts.{account_type}.initial_equity
                backend_config = config.get("backend", {})
                account_config = backend_config.get("accounts", {}).get(
                    self.account_type, {}
                )
                initial_equity = account_config.get("initial_equity", 50.0)
            elif config is not None:
                try:
                    initial_equity = config.get_account_config("initial_equity", 50.0)
                except AttributeError:
                    initial_equity = 50.0
            else:
                initial_equity = 50.0

        logger.info(
            f"Initializing risk manager for {self.account_type.upper()} account with ${initial_equity:.2f} equity"
        )

        self.initial_equity = initial_equity
        self.current_equity = initial_equity
        self.daily_start_equity = initial_equity
        self.peak_equity = initial_equity
        self.lowest_equity = initial_equity

        # Override risk_per_trade to enforce stricter 1% risk limit
        if isinstance(config, dict):
            # Get from backend.accounts.{account_type}
            backend_config = config.get("backend", {})
            account_config = backend_config.get("accounts", {}).get(
                self.account_type, {}
            )
            config_risk_per_trade = account_config.get("risk_per_trade", 0.03)
            self.max_stake = account_config.get(
                "max_stake", 999999 if self.is_demo else 50.0
            )
            self.min_stake = account_config.get("min_stake", 1.0)
            # Get risk management settings
            risk_config = config.get("risk_management", {})
            self.max_daily_drawdown = risk_config.get(
                "max_daily_drawdown", 0.15
            )  # 15% for demo
        elif config is not None:
            try:
                config_risk_per_trade = config.risk_per_trade
                self.max_stake = config.max_stake
                self.min_stake = config.min_stake
                self.max_daily_drawdown = config.get(
                    "risk_management.max_daily_drawdown", 0.05
                )
            except AttributeError:
                config_risk_per_trade = 0.03
                self.max_stake = 999999 if self.is_demo else 50.0
                self.min_stake = 1.0
                self.max_daily_drawdown = 0.05
        else:
            config_risk_per_trade = 0.03
            self.max_stake = 999999 if self.is_demo else 50.0
            self.min_stake = 1.0
            self.max_daily_drawdown = 0.05

        self.risk_per_trade = min(
            config_risk_per_trade, 0.01
        )  # Enforce 1% maximum risk per trade
        self.force_always_trade = False  # Always disabled for safety
        logger.info(
            f"RISK PROTECTION: Using conservative risk per trade: {self.risk_per_trade:.1%}"
        )

        # Cooldown - Always Enabled with Exponential Backoff
        if config is not None and isinstance(config, dict):
            self.cooldown_after_loss = config.get("risk_management", {}).get(
                "cooldown_after_loss", 5
            )
            self.max_concurrent_trades = config.get("risk_management", {}).get(
                "max_concurrent_trades", 3
            )
        else:
            self.cooldown_after_loss = 5
            self.max_concurrent_trades = 3
        self.daily_loss_limit_triggered = False
        self.consecutive_wins = 0

        # Circuit Breaker - Always Enabled
        self.circuit_breaker_enabled = True  # Always enabled for safety
        if config is not None and isinstance(config, dict):
            self.circuit_breaker_losses = min(
                config.get("risk_management", {}).get("circuit_breaker_losses", 5), 5
            )  # Max 5 consecutive losses
            self.circuit_breaker_reset_hours = config.get("risk_management", {}).get(
                "circuit_breaker_reset_hours", 6
            )
            self.circuit_breaker_manual_reset = config.get("risk_management", {}).get(
                "circuit_breaker_manual_reset", False
            )
        else:
            self.circuit_breaker_losses = 5
            self.circuit_breaker_reset_hours = 6
            self.circuit_breaker_manual_reset = False
        self.circuit_breaker_triggered_time = None

        # Log circuit breaker configuration
        logger.info(
            f"RISK PROTECTION: Circuit Breaker ENFORCED - losses={self.circuit_breaker_losses}, "
            f"reset_hours={self.circuit_breaker_reset_hours}"
        )

        # Daily loss limits
        if config is not None and isinstance(config, dict):
            self.daily_loss_limit_enabled = config.get("risk_management", {}).get(
                "daily_loss_limit_enabled", True
            )
            # Strict drawdown checking
            self.daily_drawdown_strict = config.get("risk_management", {}).get(
                "daily_drawdown_strict", True
            )
        else:
            self.daily_loss_limit_enabled = True
            self.daily_drawdown_strict = True

        # Emergency Stop
        # Emergency stop settings
        if config is not None and isinstance(config, dict):
            self.emergency_stop_enabled = config.get("risk_management", {}).get(
                "emergency_stop_enabled", True
            )
            self.emergency_stop_threshold = config.get("risk_management", {}).get(
                "emergency_stop_threshold", 0.20
            )  # 20% loss
            self.emergency_stop_manual_reset = config.get("risk_management", {}).get(
                "emergency_stop_manual_reset", True
            )
        else:
            self.emergency_stop_enabled = True
            self.emergency_stop_threshold = 0.20
            self.emergency_stop_manual_reset = True
        self.emergency_stopped = False

        # Cooldown - Always Enabled with Exponential Backoff
        self.cooldown_enabled = True  # Always enabled for safety
        self.cooldown_exponential = True  # Always use exponential backoff
        if config is not None and isinstance(config, dict):
            self.cooldown_multiplier = max(
                config.get("risk_management", {}).get("cooldown_multiplier", 2.0), 2.0
            )  # Minimum 2x multiplier
        self.cooldown_after_loss = max(
            config.get("risk_management", {}).get("cooldown_seconds", 60.0)
            if config is not None and isinstance(config, dict)
            else 60.0,
            60.0,
        )  # Minimum 60s base cooldown
        if config is not None and isinstance(config, dict):
            self.max_cooldown = config.get("risk_management", {}).get(
                "max_cooldown", 600
            )
        else:
            self.max_cooldown = 600  # 10 minutes max cooldown

        # Log cooldown configuration
        logger.info(
            f"RISK PROTECTION: Cooldown ENFORCED - base={self.cooldown_after_loss}s, "
            f"exponential=True, multiplier={self.cooldown_multiplier}x, max={self.max_cooldown}s"
        )

        # Win rate protection
        if config is not None and isinstance(config, dict):
            self.win_rate_protection_enabled = config.get("risk_management", {}).get(
                "win_rate_protection_enabled", True
            )
            self.min_win_rate_threshold = config.get("risk_management", {}).get(
                "min_win_rate_threshold", 0.45
            )  # 45% minimum
            self.min_trades_for_win_rate = config.get("risk_management", {}).get(
                "min_trades_for_win_rate", 10
            )
        else:
            self.win_rate_protection_enabled = True
            self.min_win_rate_threshold = 0.45
            self.min_trades_for_win_rate = 10

        # Adaptive recovery
        # Recovery mode
        if config is not None and isinstance(config, dict):
            self.recovery_mode_enabled = config.get("risk_management", {}).get(
                "recovery_mode_enabled", False
            )
            self.recovery_factor = config.get("risk_management", {}).get(
                "recovery_factor", 1.25
            )
            self.max_recovery_multiplier = config.get("risk_management", {}).get(
                "max_recovery_multiplier", 2.0
            )
        else:
            self.recovery_mode_enabled = False
            self.recovery_factor = 1.25
            self.max_recovery_multiplier = 2.0

        # Martingale
        if config is not None and isinstance(config, dict):
            self.martingale_enabled = config.get("trading", {}).get(
                "martingale_enabled", False
            )
            self.martingale_base_stake = config.get("trading", {}).get(
                "martingale_base_stake", self.min_stake
            )
            self.martingale_multiplier = config.get("trading", {}).get(
                "martingale_multiplier", 2.0
            )
            self.martingale_max_level = config.get("trading", {}).get(
                "martingale_max_level", 4
            )
            self.martingale_reset_on_profit = config.get("trading", {}).get(
                "martingale_reset_on_profit", True
            )
        else:
            self.martingale_enabled = False
            self.martingale_base_stake = self.min_stake
            self.martingale_multiplier = 2.0
            self.martingale_max_level = 4
            self.martingale_reset_on_profit = True
        self.current_martingale_level = 0

        # State tracking
        self.open_trades: dict[str, dict[str, Any]] = {}
        self.last_loss_time = 0
        self.last_win_time = 0
        self.consecutive_losses = 0
        self.daily_trades = 0
        self.daily_wins = 0
        self.daily_losses = 0
        self.session_start_time = time.time()

        # Adaptive stake
        # Dynamic stake sizing
        if config is not None and isinstance(config, dict):
            self.dynamic_stake_enabled = config.get("risk_management", {}).get(
                "dynamic_stake_enabled", True
            )
            self.win_rate_multiplier = config.get("risk_management", {}).get(
                "win_rate_multiplier", 1.2
            )
            self.loss_rate_multiplier = config.get("risk_management", {}).get(
                "loss_rate_multiplier", 0.8
            )
            self.win_streak_bonus = config.get("risk_management", {}).get(
                "win_streak_bonus", 1.1
            )
            self.loss_penalty = config.get("risk_management", {}).get(
                "loss_penalty", 0.9
            )

            self.volatility_adjustment = config.get("risk_management", {}).get(
                "volatility_adjustment", True
            )
        else:
            self.dynamic_stake_enabled = True
            self.win_rate_multiplier = 1.2
            self.loss_rate_multiplier = 0.8
            self.win_streak_bonus = 1.1
            self.loss_penalty = 0.9
            self.volatility_adjustment = True
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

        logger.info(
            f"Enhanced Risk Manager initialized with equity: ${initial_equity:.2f}"
        )
        logger.info("RiskManager.__init__() - Initialization COMPLETE ✓")

    # --- MAIN METHODS ---
    def can_trade(self) -> tuple[bool, str] | tuple[bool, dict[str, Any]]:
        """Check if trading is allowed based on risk controls."""
        if self.force_always_trade:
            return True, "Forced trading enabled (risk controls bypassed)"

        # Emergency stop
        if self.emergency_stop_enabled and self.emergency_stopped:
            return False, "EMERGENCY STOP ACTIVE"

        # Circuit breaker
        if (
            self.circuit_breaker_enabled
            and self.consecutive_losses >= self.circuit_breaker_losses
        ):
            return (
                False,
                f"Circuit breaker triggered ({self.consecutive_losses} losses)",
            )

        # Daily loss
        daily_start = self.daily_start_equity or 0.0
        current = self.current_equity or 0.0
        if daily_start > 0:
            daily_drawdown = (daily_start - current) / daily_start
            if (
                self.daily_loss_limit_enabled
                and daily_drawdown > self.max_daily_drawdown
            ):
                return False, f"Daily drawdown exceeded ({daily_drawdown:.1%})"

        # Max concurrent trades
        if len(self.open_trades) >= self.max_concurrent_trades:
            return (
                False,
                f"Max concurrent trades reached ({self.max_concurrent_trades})",
            )

        # Cooldown
        if self.cooldown_enabled and self._is_in_cooldown():
            cooldown_remaining = self._get_cooldown_remaining()
            logger.debug(
                f"⏸️ COOLDOWN ACTIVE: {cooldown_remaining:.1f}s remaining (consecutive losses: {self.consecutive_losses})"
            )
            return False, f"In cooldown period ({cooldown_remaining:.1f}s remaining)"

        # Win rate protection
        total_trades = self.total_wins + self.total_losses
        if (
            self.win_rate_protection_enabled
            and total_trades >= self.min_trades_for_win_rate
        ):
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
                self.cooldown_after_loss
                * (self.cooldown_multiplier ** min(self.consecutive_losses - 1, 4)),
                self.max_cooldown,
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
                self.cooldown_after_loss
                * (self.cooldown_multiplier ** min(self.consecutive_losses - 1, 4)),
                self.max_cooldown,
            )
        else:
            cooldown_duration = self.cooldown_after_loss

        remaining = max(0, cooldown_duration - time_since_loss)
        return remaining

    # --- STAKE CALCULATION METHODS ---
    def calculate_stake(
        self,
        volatility: float = 0.001,
        confidence: float = 1.0,
        signal_strength: float = 1.0,
    ) -> float:
        """Calculate adaptive stake based on risk management rules."""
        calculation_equity = (
            self.initial_equity
            if self.is_demo
            else (self.current_equity or self.initial_equity)
        )
        risk_pct = getattr(self, "risk_per_trade", 0.03)
        base_stake = (calculation_equity or 50.0) * risk_pct
        base_stake = round(max(self.min_stake, min(base_stake, self.max_stake)), 2)
        return base_stake
