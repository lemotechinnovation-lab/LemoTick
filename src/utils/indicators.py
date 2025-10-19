"""
Incremental technical indicators for tick-level analysis.
Optimized for real-time computation without recalculating entire arrays.
"""

import math
from typing import Optional, List
from collections import deque


class IncrementalEMA:
    """Exponential Moving Average with incremental updates."""
    
    def __init__(self, period: int):
        """
        Initialize EMA with given period.
        
        Args:
            period: Number of periods for EMA calculation
        """
        self.period = period
        self.alpha = 2.0 / (period + 1.0)  # EMA smoothing factor
        self.ema: Optional[float] = None
        self.is_initialized = False
    
    def update(self, price: float) -> float:
        """
        Update EMA with new price value.
        
        Args:
            price: New price value
            
        Returns:
            Current EMA value
        """
        if not self.is_initialized:
            self.ema = price
            self.is_initialized = True
        else:
            self.ema = self.alpha * price + (1 - self.alpha) * self.ema
        
        return self.ema
    
    def get_value(self) -> Optional[float]:
        """Get current EMA value without updating."""
        return self.ema
    
    def reset(self) -> None:
        """Reset EMA to uninitialized state."""
        self.ema = None
        self.is_initialized = False


class IncrementalMomentum:
    """Simple momentum indicator for tick-level analysis."""
    
    def __init__(self, lookback: int = 5):
        """
        Initialize momentum indicator.
        
        Args:
            lookback: Number of ticks to look back for momentum calculation
        """
        self.lookback = lookback
        self.prices = deque(maxlen=lookback)
        self.momentum: Optional[float] = None
    
    def update(self, price: float) -> float:
        """
        Update momentum with new price.
        
        Args:
            price: New price value
            
        Returns:
            Current momentum value
        """
        self.prices.append(price)
        
        if len(self.prices) >= 2:
            self.momentum = price - self.prices[0]
        else:
            self.momentum = 0.0
        
        return self.momentum
    
    def get_value(self) -> Optional[float]:
        """Get current momentum value without updating."""
        return self.momentum


class IncrementalVolatility:
    """Rolling volatility calculation using standard deviation."""
    
    def __init__(self, window: int = 50):
        """
        Initialize volatility indicator.
        
        Args:
            window: Number of ticks for volatility calculation
        """
        self.window = window
        self.prices = deque(maxlen=window)
        self.volatility: Optional[float] = None
    
    def update(self, price: float) -> float:
        """
        Update volatility with new price.
        
        Args:
            price: New price value
            
        Returns:
            Current volatility value
        """
        self.prices.append(price)
        
        if len(self.prices) >= 5:  # Minimum samples for meaningful volatility
            mean = sum(self.prices) / len(self.prices)
            variance = sum((p - mean) ** 2 for p in self.prices) / len(self.prices)
            self.volatility = math.sqrt(variance)
        else:
            self.volatility = 0.0
        
        return self.volatility
    
    def get_value(self) -> Optional[float]:
        """Get current volatility value without updating."""
        return self.volatility


class IncrementalRSI:
    """Relative Strength Index with incremental updates."""
    
    def __init__(self, period: int = 14):
        """
        Initialize RSI indicator.
        
        Args:
            period: Number of periods for RSI calculation
        """
        self.period = period
        self.prices = deque(maxlen=period + 1)
        self.gains = deque(maxlen=period)
        self.losses = deque(maxlen=period)
        self.avg_gain: Optional[float] = None
        self.avg_loss: Optional[float] = None
        self.rsi: Optional[float] = None
    
    def update(self, price: float) -> float:
        """
        Update RSI with new price.
        
        Args:
            price: New price value
            
        Returns:
            Current RSI value
        """
        self.prices.append(price)
        
        if len(self.prices) >= 2:
            change = self.prices[-1] - self.prices[-2]
            
            if change > 0:
                self.gains.append(change)
                self.losses.append(0.0)
            else:
                self.gains.append(0.0)
                self.losses.append(abs(change))
        
        if len(self.gains) >= self.period:
            if self.avg_gain is None:
                # Initial calculation
                self.avg_gain = sum(self.gains) / self.period
                self.avg_loss = sum(self.losses) / self.period
            else:
                # Smoothed averages
                self.avg_gain = ((self.avg_gain * (self.period - 1)) + self.gains[-1]) / self.period
                self.avg_loss = ((self.avg_loss * (self.period - 1)) + self.losses[-1]) / self.period
            
            if self.avg_loss != 0:
                rs = self.avg_gain / self.avg_loss
                self.rsi = 100 - (100 / (1 + rs))
            else:
                self.rsi = 100.0
        
        return self.rsi or 50.0
    
    def get_value(self) -> Optional[float]:
        """Get current RSI value without updating."""
        return self.rsi


class BollingerBands:
    """Bollinger Bands with incremental calculation."""
    
    def __init__(self, period: int = 20, std_dev: float = 2.0):
        """
        Initialize Bollinger Bands.
        
        Args:
            period: Number of periods for moving average
            std_dev: Standard deviation multiplier
        """
        self.period = period
        self.std_dev = std_dev
        self.prices = deque(maxlen=period)
        self.sma: Optional[float] = None
        self.upper_band: Optional[float] = None
        self.lower_band: Optional[float] = None
    
    def update(self, price: float) -> tuple[Optional[float], Optional[float], Optional[float]]:
        """
        Update Bollinger Bands with new price.
        
        Args:
            price: New price value
            
        Returns:
            Tuple of (upper_band, middle_band, lower_band)
        """
        self.prices.append(price)
        
        if len(self.prices) >= self.period:
            # Calculate SMA
            self.sma = sum(self.prices) / self.period
            
            # Calculate standard deviation
            variance = sum((p - self.sma) ** 2 for p in self.prices) / self.period
            std = math.sqrt(variance)
            
            # Calculate bands
            self.upper_band = self.sma + (self.std_dev * std)
            self.lower_band = self.sma - (self.std_dev * std)
        
        return self.upper_band, self.sma, self.lower_band
    
    def get_values(self) -> tuple[Optional[float], Optional[float], Optional[float]]:
        """Get current Bollinger Bands values without updating."""
        return self.upper_band, self.sma, self.lower_band


def calculate_alpha(period: int) -> float:
    """
    Calculate EMA alpha value for given period.
    
    Args:
        period: EMA period
        
    Returns:
        Alpha smoothing factor
    """
    return 2.0 / (period + 1.0)

