"""
Configuration management for LemoTick bot.
Handles environment variables, YAML settings, and credential loading.
"""

import os
import yaml
from pathlib import Path
from typing import Dict, Any
from dotenv import load_dotenv


class Config:
    """Centralized configuration management."""

    def __init__(
        self,
        config_path: str = "config/settings.yaml",
        env_path: str = "config/credentials.env",
    ):
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

        with open(self.config_path, "r") as file:
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
        """Get risk per trade percentage."""
        return self.settings["risk_management"]["risk_per_trade"]

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
        """Get minimum stake amount."""
        return self.settings["trading"]["min_stake"]

    @property
    def max_stake(self) -> float:
        """Get maximum stake amount."""
        return self.settings["trading"]["max_stake"]

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


# Global config instance
config = Config()
