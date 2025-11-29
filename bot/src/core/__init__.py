"""
Core module for LemoTick bot.
Contains bot engine, configuration management, and signal processing.
"""

from .config_manager import ConfigManager
from .ema_rsi_bot import EMARSIBot

__all__ = [
    "EMARSIBot",
    "ConfigManager",
]
