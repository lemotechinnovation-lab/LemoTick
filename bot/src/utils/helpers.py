"""
Helper utilities for LemoTick bot.
Includes timestamp formatting, data validation, and common functions.
"""

import time
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, Optional


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


def validate_stake(
    stake: Any, min_stake: float = 0.1, max_stake: float = 10000
) -> bool:
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
    # Add type checking to handle None values
    if value is None:
        return min_val
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
        # Handle zero old_value more accurately
        return float('inf') if new_value != 0 else 0.0
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


def exponential_backoff_delay(
    attempt: int, base_delay: float = 1.0, max_delay: float = 60.0
) -> float:
    """
    Calculate exponential backoff delay for retry attempts with jitter.

    Args:
        attempt: Current attempt number (0-based)
        base_delay: Base delay in seconds
        max_delay: Maximum delay in seconds

    Returns:
        Delay in seconds with jitter
    """
    import random
    delay = base_delay * (2 ** attempt)
    delay = min(delay, max_delay)
    # Add 10% jitter to prevent thundering herd
    return delay * random.uniform(0.9, 1.1)


def format_duration(seconds: float, verbose: bool = False) -> str:
    """
    Format duration in human-readable format.

    Args:
        seconds: Duration in seconds
        verbose: If True, provide detailed breakdown

    Returns:
        Formatted duration string
    """
    if verbose:
        hours = int(seconds // 3600)
        minutes = int((seconds % 3600) // 60)
        secs = seconds % 60
        if hours > 0:
            return f"{hours}h {minutes}m {secs:.1f}s"
        elif minutes > 0:
            return f"{minutes}m {secs:.1f}s"
        else:
            return f"{secs:.1f}s"
    else:
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
    Handles nested dictionaries recursively.

    Args:
        data: Data dictionary to sanitize

    Returns:
        Sanitized data dictionary
    """
    sensitive_keys = ["token", "password", "secret", "key", "auth"]
    sanitized = {}
    
    for key, value in data.items():
        if isinstance(value, dict):
            # Recursively sanitize nested dictionaries
            sanitized[key] = sanitize_log_data(value)
        elif any(sensitive in key.lower() for sensitive in sensitive_keys):
            sanitized[key] = "***REDACTED***"
        else:
            sanitized[key] = value

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


def get_candle_color(open_price: float, close_price: float) -> str:
    """
    Determine candle color based on open and close prices.

    Args:
        open_price: Opening price of the candle
        close_price: Closing price of the candle

    Returns:
        "green" for bullish (close > open),
        "red" for bearish (close < open),
        "doji" for neutral (close == open)
    """
    if close_price > open_price:
        return "green"   # bullish
    elif close_price < open_price:
        return "red"     # bearish
    else:
        return "doji"    # neutral


def calculate_ticks_sl_tp(entry_price: float, tick_size: float, risk_percentage: float, reward_multiplier: float, atr_value: Optional[float] = None) -> tuple[float, float]:
    """
    Converts price-based SL/TP into tick counts for Rise/Fall contracts.
    Uses ATR for dynamic SL/TP when available.
    
    Args:
        entry_price: Entry price of trade
        tick_size: Minimum price movement per tick
        risk_percentage: Risk per trade (0.01 = 1%)
        reward_multiplier: Desired reward-to-risk ratio
        atr_value: Average True Range value (if available)
    
    Returns:
        Tuple of (ticks_to_stop_loss, ticks_to_take_profit)
    """
    if tick_size <= 0:
        raise ValueError("Tick size must be positive")
    
    # ATR-BASED DYNAMIC SL/TP CALCULATION
    # When ATR is available, use it to set dynamic stop loss and take profit levels
    # This adapts to market volatility automatically
    if atr_value and atr_value > 0:
        # Stop Loss = ATR  2
        # Take Profit = ATR  4 (2:1 reward-to-risk ratio)
        sl_distance = atr_value * 2.0
        tp_distance = atr_value * 4.0
        
        # Convert price distances to tick counts
        ticks_to_sl = sl_distance / tick_size
        ticks_to_tp = tp_distance / tick_size
        
        # Log the ATR-based calculation
        from infrastructure.logger import logger
        logger.info(f"ATR-based SL/TP: ATR={atr_value:.6f}, SL={sl_distance:.6f} ({ticks_to_sl:.1f} ticks), TP={tp_distance:.6f} ({ticks_to_tp:.1f} ticks)")
    else:
        # FALLBACK: Using custom SL/TP percentages for binary options
        # Take Profit: 40% of entry price - balanced profit target
        # Stop Loss: 20% of entry price - tighter risk control
        # Risk:Reward ratio of 1:2 favoring profit potential
        
        # Calculate SL/TP based on percentage of price
        tp_percentage = 0.0040  # 0.40% of price (scaled down because we're measuring ticks)
        sl_percentage = 0.0020  # 0.20% of price (half of TP)
        
        # Convert percentage movement to ticks
        ticks_to_tp = (entry_price * tp_percentage) / tick_size
        ticks_to_sl = (entry_price * sl_percentage) / tick_size
        
        # Log the percentage-based calculation
        from infrastructure.logger import logger
        logger.info(f"Percentage-based SL/TP: SL={sl_percentage*100:.2f}%, TP={tp_percentage*100:.2f}%")
    
    # Ensure minimum values
    ticks_to_tp = max(ticks_to_tp, 80.0)  # Minimum 80 ticks (~0.40 points) for TP
    ticks_to_sl = max(ticks_to_sl, 40.0)  # Minimum 40 ticks (~0.20 points) for SL
    
    return ticks_to_sl, ticks_to_tp


def calculate_tick_size_for_symbol(symbol: str) -> float:
    """
    Get tick size for different trading symbols.
    
    Args:
        symbol: Trading symbol (e.g., 'R_100', 'R_75', 'R_50')
        
    Returns:
        Tick size for the symbol
    """
    # Tick sizes for Deriv synthetic indices
    tick_sizes = {
        'R_100': 0.005,   # Volatility 100 Index
        'R_75': 0.005,    # Volatility 75 Index  
        'R_50': 0.005,    # Volatility 50 Index
        'R_25': 0.005,    # Volatility 25 Index
        'R_200': 0.005,   # Volatility 200 Index
        'R_10': 0.005,    # Volatility 10 Index
    }
    
    return tick_sizes.get(symbol, 0.005)  # Default to 0.005 if symbol not found


def calculate_dynamic_ticks_sl_tp(entry_price: float, symbol: str, risk_percentage: float = 0.01, reward_multiplier: float = 1.5, atr_value: Optional[float] = None) -> tuple[float, float]:
    """
    Calculate dynamic tick-based SL/TP for a given symbol and risk parameters.
    Uses ATR when available for volatility-based stops.
    
    Args:
        entry_price: Entry price of trade
        symbol: Trading symbol
        risk_percentage: Risk per trade (default 1%)
        reward_multiplier: Desired reward-to-risk ratio (default 1.5:1)
        atr_value: Average True Range value (if available)
        
    Returns:
        Tuple of (ticks_to_stop_loss, ticks_to_take_profit)
    """
    tick_size = calculate_tick_size_for_symbol(symbol)
    return calculate_ticks_sl_tp(entry_price, tick_size, risk_percentage, reward_multiplier, atr_value)

