"""
Exceptions module for LemoTick bot.
Contains custom exception classes.
"""

class LemoTickException(Exception):
    """Base exception for LemoTick bot."""
    pass


class APIConnectionError(LemoTickException):
    """Raised when API connection fails."""
    pass


class InvalidConfigError(LemoTickException):
    """Raised when configuration is invalid."""
    pass


class TradingError(LemoTickException):
    """Raised when trading operation fails."""
    pass


class RiskManagementError(LemoTickException):
    """Raised when risk limits are violated."""
    pass

