"""Candle data model"""

from dataclasses import dataclass
from datetime import datetime


@dataclass
class Candle:
    """Represents a candlestick"""
    
    timestamp: datetime
    open: float
    high: float
    low: float
    close: float
    volume: int
    
    def __post_init__(self):
        """Validate candle data"""
        if self.high < self.low:
            raise ValueError("High price cannot be less than low price")
        if self.open < 0 or self.high < 0 or self.low < 0 or self.close < 0:
            raise ValueError("Prices cannot be negative")
    
    @property
    def time(self) -> int:
        """Get timestamp as Unix epoch (for compatibility with indicators.py)"""
        return int(self.timestamp.timestamp())
