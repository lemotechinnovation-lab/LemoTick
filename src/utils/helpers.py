"""
Helper utilities for LemoTick bot.
Includes timestamp formatting, data validation, and common functions.
"""

import time
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, Optional, Union


def get_timestamp() -> int:
    """Get current Unix timestamp."""
    return int(time.time())


def get_utc_timestamp() -> str:
    """Get current UTC timestamp as ISO string."""
    return datetime.now(timezone.utc).isoformat()


def generate_trade_id() -> str:
    """Generate unique trade ID."""
    return str(uuid.uuid4())


def format_price(price: float, decimals: int = 6) -> str:
    """
    Format price with specified decimal places.
    
    Args:
        price: Price value to format
        decimals: Number of decimal places
        
    Returns:
        Formatted price string
    """
    return f"{price:.{decimals}f}"


def format_percentage(value: float, decimals: int = 2) -> str:
    """
    Format percentage value.
    
    Args:
        value: Percentage value (0.05 for 5%)
        decimals: Number of decimal places
        
    Returns:
        Formatted percentage string
    """
    return f"{value * 100:.{decimals}f}%"


def validate_price(price: Any) -> bool:
    """
    Validate if value is a valid price.
    
    Args:
        price: Value to validate
        
    Returns:
        True if valid price, False otherwise
    """
    try:
        price_float = float(price)
        return price_float > 0 and price_float < 1e10  # Reasonable price range
    except (ValueError, TypeError):
        return False


def validate_stake(stake: Any, min_stake: float = 0.1, max_stake: float = 10000) -> bool:
    """
    Validate if value is a valid stake amount.
    
    Args:
        stake: Stake value to validate
        min_stake: Minimum allowed stake
        max_stake: Maximum allowed stake
        
    Returns:
        True if valid stake, False otherwise
    """
    try:
        stake_float = float(stake)
        return min_stake <= stake_float <= max_stake
    except (ValueError, TypeError):
        return False


def safe_float(value: Any, default: float = 0.0) -> float:
    """
    Safely convert value to float with default fallback.
    
    Args:
        value: Value to convert
        default: Default value if conversion fails
        
    Returns:
        Float value or default
    """
    try:
        return float(value)
    except (ValueError, TypeError):
        return default


def safe_int(value: Any, default: int = 0) -> int:
    """
    Safely convert value to int with default fallback.
    
    Args:
        value: Value to convert
        default: Default value if conversion fails
        
    Returns:
        Integer value or default
    """
    try:
        return int(value)
    except (ValueError, TypeError):
        return default


def clamp(value: float, min_val: float, max_val: float) -> float:
    """
    Clamp value between min and max.
    
    Args:
        value: Value to clamp
        min_val: Minimum allowed value
        max_val: Maximum allowed value
        
    Returns:
        Clamped value
    """
    return max(min_val, min(max_val, value))


def calculate_percentage_change(old_value: float, new_value: float) -> float:
    """
    Calculate percentage change between two values.
    
    Args:
        old_value: Original value
        new_value: New value
        
    Returns:
        Percentage change (0.05 for 5% increase)
    """
    if old_value == 0:
        return 0.0
    return (new_value - old_value) / old_value


def is_within_trading_hours() -> bool:
    """
    Check if current time is within trading hours.
    For 24/7 markets like synthetic indices, this always returns True.
    
    Returns:
        True if within trading hours
    """
    # Deriv synthetic indices trade 24/7
    return True


def calculate_kelly_fraction(win_rate: float, avg_win: float, avg_loss: float) -> float:
    """
    Calculate Kelly Criterion fraction for position sizing.
    
    Args:
        win_rate: Win rate (0.6 for 60%)
        avg_win: Average win amount
        avg_loss: Average loss amount
        
    Returns:
        Kelly fraction for position sizing
    """
    if avg_loss == 0:
        return 0.0
    
    # Kelly formula: f = (bp - q) / b
    # where b = avg_win/avg_loss, p = win_rate, q = 1 - win_rate
    b = avg_win / avg_loss
    p = win_rate
    q = 1 - win_rate
    
    kelly = (b * p - q) / b
    
    # Cap Kelly at reasonable levels (typically 0.25 max)
    return clamp(kelly, 0.0, 0.25)


def exponential_backoff_delay(attempt: int, base_delay: float = 1.0, max_delay: float = 60.0) -> float:
    """
    Calculate exponential backoff delay for retry attempts.
    
    Args:
        attempt: Current attempt number (0-based)
        base_delay: Base delay in seconds
        max_delay: Maximum delay in seconds
        
    Returns:
        Delay in seconds
    """
    delay = base_delay * (2 ** attempt)
    return min(delay, max_delay)


def format_duration(seconds: float) -> str:
    """
    Format duration in human-readable format.
    
    Args:
        seconds: Duration in seconds
        
    Returns:
        Formatted duration string
    """
    if seconds < 60:
        return f"{seconds:.1f}s"
    elif seconds < 3600:
        minutes = seconds / 60
        return f"{minutes:.1f}m"
    else:
        hours = seconds / 3600
        return f"{hours:.1f}h"


def sanitize_log_data(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Sanitize data for logging by removing sensitive information.
    
    Args:
        data: Data dictionary to sanitize
        
    Returns:
        Sanitized data dictionary
    """
    sensitive_keys = ['token', 'password', 'secret', 'key', 'auth']
    sanitized = data.copy()
    
    for key in sanitized:
        if any(sensitive in key.lower() for sensitive in sensitive_keys):
            sanitized[key] = "***REDACTED***"
    
    return sanitized


def merge_dicts(*dicts: Dict[str, Any]) -> Dict[str, Any]:
    """
    Merge multiple dictionaries, with later dicts overriding earlier ones.
    
    Args:
        *dicts: Dictionaries to merge
        
    Returns:
        Merged dictionary
    """
    result = {}
    for d in dicts:
        result.update(d)
    return result

