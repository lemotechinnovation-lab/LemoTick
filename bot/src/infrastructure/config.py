"""
Configuration management for LemoTick bot.
Handles environment variables, YAML settings, and credential loading.
"""

import os
from pathlib import Path
from typing import Any, Dict, Optional

import yaml

try:
    from dotenv import load_dotenv  # type: ignore
except ImportError:

    def load_dotenv(*args, **kwargs) -> bool:  # type: ignore
        """Fallback when python-dotenv is not installed."""
        return True


class Config:
    """Centralized configuration management."""

    def __init__(
        self,
        config_path: Optional[str] = None,
        env_path: Optional[str] = None,
    ):
        # Calculate bot root directory from this file's location
        # This file is in bot/src/infrastructure/config.py, so go up 3 levels
        bot_root = Path(__file__).parent.parent.parent.resolve()
        config_dir = bot_root / "config"

        # Auto-detect config paths if not provided
        if config_path is None:
            # Try multiple possible locations, prioritizing absolute paths from bot root
            possible_config_paths = [
                config_dir / "settings_ema_rsi.yaml",  # Absolute path from bot root
                Path("config/settings_ema_rsi.yaml"),  # Relative from current dir
                Path("../config/settings_ema_rsi.yaml"),  # Relative from bot/src
                Path(
                    "../../config/settings_ema_rsi.yaml"
                ),  # Relative from bot/src/subdir
            ]

            for path in possible_config_paths:
                if path.exists():
                    config_path = str(path)
                    break

            if config_path is None:
                # Final fallback to absolute path (will raise error if not found)
                config_path = str(config_dir / "settings_ema_rsi.yaml")

        if env_path is None:
            # Check for live account setting to determine which credentials file to use
            lemotick_live_account = os.getenv("LEMOTICK_LIVE_ACCOUNT", "").lower()

            if lemotick_live_account in ("true", "1", "yes"):
                env_filename = "credentials.live.env"
            else:
                env_filename = "credentials.demo.env"

            # Try multiple possible locations, prioritizing absolute paths from bot root
            possible_env_paths = [
                config_dir / env_filename,  # Absolute path from bot root
                config_dir / "credentials.env",  # Fallback to generic credentials.env
                Path(f"config/{env_filename}"),  # Relative from current dir
                Path(f"../config/{env_filename}"),  # Relative from bot/src
                Path(f"../../config/{env_filename}"),  # Relative from bot/src/subdir
                Path("config/credentials.env"),  # Generic fallback
            ]

            for path in possible_env_paths:
                if path.exists():
                    env_path = str(path)
                    break

            if env_path is None:
                # Final fallback to absolute path
                env_path = str(config_dir / "credentials.env")

        self.config_path = Path(config_path)
        self.env_path = Path(env_path)

        # Load environment variables
        if self.env_path.exists():
            load_dotenv(self.env_path)

        # Load YAML configuration
        self.settings = self._load_yaml_config()

        # Validate required settings
        self._validate_config()

    def _load_yaml_config(self) -> Dict[str, Any]:
        """Load configuration from YAML file."""
        if not self.config_path.exists():
            raise FileNotFoundError(f"Configuration file not found: {self.config_path}")

        with open(self.config_path, "r", encoding="utf-8") as file:
            return yaml.safe_load(file)

    def _validate_config(self) -> None:
        """Validate that required configuration is present."""
        required_env_vars = ["DERIV_API_TOKEN"]
        missing_vars = [var for var in required_env_vars if not os.getenv(var)]

        if missing_vars:
            raise ValueError(f"Missing required environment variables: {missing_vars}")

        required_sections = ["trading", "deriv", "risk_management", "indicators"]
        missing_sections = [
            section for section in required_sections if section not in self.settings
        ]

        if missing_sections:
            raise ValueError(
                f"Missing required configuration sections: {missing_sections}"
            )

    @property
    def api_token(self) -> str:
        """Get Deriv API token from environment."""
        token = os.getenv("DERIV_API_TOKEN")
        if not token:
            raise ValueError("DERIV_API_TOKEN environment variable not set")
        return token

    @property
    def deriv_ws_url(self) -> str:
        """Get Deriv WebSocket URL."""
        return os.getenv("DERIV_WS_URL", self.settings["deriv"]["ws_url"])

    @property
    def app_id(self) -> str:
        """Get Deriv app ID."""
        return os.getenv("DERIV_APP_ID", self.settings["deriv"]["app_id"])

    @property
    def symbol(self) -> str:
        """Get trading symbol."""
        return self.settings["trading"]["symbol"]

    @property
    def risk_per_trade(self) -> float:
        """Get risk per trade percentage based on account type."""
        is_demo = self.get("development.demo_account", True)
        account_type = "demo" if is_demo else "real"

        # Try to get account-specific risk first, fall back to risk_management section
        return self.get(
            f"accounts.{account_type}.risk_per_trade",
            self.settings["risk_management"]["risk_per_trade"],
        )

    @property
    def max_daily_drawdown(self) -> float:
        """Get maximum daily drawdown percentage."""
        return self.settings["risk_management"]["max_daily_drawdown"]

    @property
    def ema_fast_period(self) -> int:
        """Get fast EMA period."""
        return self.settings["indicators"]["ema_fast_period"]

    @property
    def ema_slow_period(self) -> int:
        """Get slow EMA period."""
        return self.settings["indicators"]["ema_slow_period"]

    @property
    def momentum_threshold(self) -> float:
        """Get momentum threshold."""
        return self.settings["indicators"]["momentum_threshold"]

    @property
    def volatility_window(self) -> int:
        """Get volatility calculation window."""
        return self.settings["indicators"]["volatility_window"]

    @property
    def min_stake(self) -> float:
        """Get minimum stake amount based on account type."""
        is_demo = self.get("development.demo_account", True)
        account_type = "demo" if is_demo else "real"

        # Try to get account-specific stake first, fall back to trading section
        return self.get(
            f"accounts.{account_type}.min_stake", self.settings["trading"]["min_stake"]
        )

    @property
    def max_stake(self) -> float:
        """Get maximum stake amount based on account type."""
        is_demo = self.get("development.demo_account", True)
        account_type = "demo" if is_demo else "real"

        # Try to get account-specific stake first, fall back to trading section
        return self.get(
            f"accounts.{account_type}.max_stake", self.settings["trading"]["max_stake"]
        )

    @property
    def cooldown_after_loss(self) -> float:
        """Get cooldown period after loss in seconds."""
        return self.settings["risk_management"]["cooldown_seconds"]

    @property
    def db_path(self) -> str:
        """Get database path."""
        return self.settings["data"]["db_path"]

    @property
    def log_level(self) -> str:
        """Get logging level."""
        return os.getenv(
            "LOG_LEVEL", self.settings.get("logging", {}).get("level", "INFO")
        )

    @property
    def debug_mode(self) -> bool:
        """Get debug mode setting."""
        return os.getenv("DEBUG_MODE", "false").lower() == "true"

    @property
    def simulation_mode(self) -> bool:
        """Get simulation mode setting."""
        return os.getenv("SIMULATION_MODE", "false").lower() == "true"

    @property
    def test_mode(self) -> bool:
        """Get test mode setting."""
        return os.getenv("TEST_MODE", "false").lower() == "true"

    def get(self, key: str, default: Any = None) -> Any:
        """Get configuration value by dot-separated key."""
        keys = key.split(".")
        value = self.settings

        for k in keys:
            if isinstance(value, dict) and k in value:
                value = value[k]
            else:
                return default

        return value

    def get_account_type(self) -> str:
        """
        Get current account type (demo or real).

        Priority order:
        1. Environment variable LEMOTICK_LIVE_ACCOUNT
        2. account_mode.use_live_account setting
        3. development.demo_account (deprecated, for backward compatibility)
        4. Default to demo (safe default)
        """
        import os

        # Check environment variable first (highest priority)
        env_live = os.getenv("LEMOTICK_LIVE_ACCOUNT", "").lower()
        if env_live in ("true", "1", "yes"):
            return "real"
        elif env_live in ("false", "0", "no"):
            return "demo"

        # Check new account_mode configuration
        use_live = self.get("account_mode.use_live_account", False)
        if use_live:
            return "real"

        # Fall back to deprecated development.demo_account (backward compatibility)
        is_demo = self.get("development.demo_account", True)
        return "demo" if is_demo else "real"

    def get_account_config(self, key: str, default: Any = None) -> Any:
        """Get account-specific configuration value."""
        account_type = self.get_account_type()
        return self.get(f"accounts.{account_type}.{key}", default)

    def is_demo_account(self) -> bool:
        """
        Check if currently using a demo account.

        Returns False if using REAL/LIVE account (real money).
        """
        return self.get_account_type() == "demo"

    def requires_live_confirmation(self) -> bool:
        """Check if live trading requires explicit confirmation."""
        return self.get("account_mode.require_explicit_confirmation", True)


# Global config instance
try:
    config = Config()
except FileNotFoundError as e:
    import sys

    print(f"CRITICAL ERROR: Configuration file not found: {e}", file=sys.stderr)
    print(
        "Please ensure config/settings_ema_rsi.yaml exists in the bot directory",
        file=sys.stderr,
    )
    # Re-raise to prevent bot from starting with invalid config
    raise
except ValueError as e:
    import sys

    print(f"CRITICAL ERROR: Invalid configuration: {e}", file=sys.stderr)
    print(
        "Please check your configuration files and environment variables",
        file=sys.stderr,
    )
    # Re-raise to prevent bot from starting with invalid config
    raise
except Exception as e:
    import sys

    print(f"CRITICAL ERROR: Failed to initialize configuration: {e}", file=sys.stderr)
    import traceback

    traceback.print_exc(file=sys.stderr)
    # Re-raise to prevent bot from starting with invalid config
    raise
