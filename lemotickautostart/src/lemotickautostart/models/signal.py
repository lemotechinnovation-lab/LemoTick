"""Trading signal model"""

from dataclasses import dataclass
from datetime import datetime


@dataclass
class Signal:
    """Represents a trading signal"""
    
    direction: str  # 'rise' or 'fall'
    strength: float  # 0.0 to 1.0
    entry_price: float
    timestamp: datetime
    indicators: dict = None
    
    def __post_init__(self):
        """Validate signal data"""
        if self.direction not in ('rise', 'fall'):
            raise ValueError("Direction must be 'rise' or 'fall'")
        if not 0.0 <= self.strength <= 1.0:
            raise ValueError("Strength must be between 0.0 and 1.0")
        if self.entry_price < 0:
            raise ValueError("Entry price cannot be negative")
        if self.indicators is None:
            self.indicators = {}
