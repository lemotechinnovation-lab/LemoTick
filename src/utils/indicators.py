"""
Incremental technical indicators for tick-level analysis.
Optimized for real-time computation without recalculating entire arrays.
"""

import math
from typing import Optional
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
        self.momentum = 0.0  # Start with zero momentum

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

    def get_value(self) -> float:
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
        self.volatility = 0.001  # Start with small default volatility

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

    def get_value(self) -> float:
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
        self.avg_gain = 0.0
        self.avg_loss = 0.0
        self.rsi = 50.0  # Start with neutral RSI

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
                self.avg_gain = (
                    (self.avg_gain * (self.period - 1)) + self.gains[-1]
                ) / self.period
                self.avg_loss = (
                    (self.avg_loss * (self.period - 1)) + self.losses[-1]
                ) / self.period

            if self.avg_loss != 0:
                rs = self.avg_gain / self.avg_loss
                self.rsi = 100 - (100 / (1 + rs))
            else:
                self.rsi = 100.0

        return self.rsi or 50.0

    def get_value(self) -> float:
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

    def update(
        self, price: float
    ) -> tuple[Optional[float], Optional[float], Optional[float]]:
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


class IncrementalMACD:
    """MACD (Moving Average Convergence Divergence) with incremental updates."""

    def __init__(self, fast_period: int = 12, slow_period: int = 26, signal_period: int = 9):
        """
        Initialize MACD indicator.

        Args:
            fast_period: Fast EMA period (default 12)
            slow_period: Slow EMA period (default 26)
            signal_period: Signal line EMA period (default 9)
        """
        self.fast_period = fast_period
        self.slow_period = slow_period
        self.signal_period = signal_period

        # Fast and slow EMAs
        self.fast_ema = IncrementalEMA(fast_period)
        self.slow_ema = IncrementalEMA(slow_period)

        # MACD line (fast EMA - slow EMA)
        self.macd_line = 0.0

        # Signal line (EMA of MACD line)
        self.signal_ema = IncrementalEMA(signal_period)
        self.signal_line = 0.0

        # Histogram (MACD - Signal)
        self.histogram = 0.0

        # Values history for calculations
        self.macd_history = deque(maxlen=signal_period + 1)

    def update(self, price: float) -> tuple[float, float, float]:
        """
        Update MACD with new price.

        Args:
            price: New price value

        Returns:
            Tuple of (MACD line, signal line, histogram)
        """
        # Update EMAs
        fast_ema_val = self.fast_ema.update(price)
        slow_ema_val = self.slow_ema.update(price)

        # Calculate MACD line
        if fast_ema_val is not None and slow_ema_val is not None:
            self.macd_line = fast_ema_val - slow_ema_val
        else:
            self.macd_line = 0.0

        # Update MACD history for signal line calculation
        self.macd_history.append(self.macd_line)

        # Calculate signal line (only when we have enough history)
        if len(self.macd_history) >= self.signal_period:
            signal_val = self.signal_ema.update(self.macd_line)
            if signal_val is not None:
                self.signal_line = signal_val

        # Calculate histogram
        self.histogram = self.macd_line - self.signal_line

        return self.macd_line, self.signal_line, self.histogram

    def get_value(self) -> tuple[float, float, float]:
        """Get current MACD values without updating."""
        return self.macd_line, self.signal_line, self.histogram

    def is_bullish(self) -> bool:
        """Check if MACD is bullish (MACD > Signal)."""
        return self.macd_line > self.signal_line

    def is_bearish(self) -> bool:
        """Check if MACD is bearish (MACD < Signal)."""
        return self.macd_line < self.signal_line


class IncrementalStochastic:
    """Stochastic Oscillator with incremental updates."""

    def __init__(self, k_period: int = 5, d_period: int = 3, slowing: int = 3):
        """
        Initialize Stochastic indicator.

        Args:
            k_period: %K period (default 5)
            d_period: %D period (default 3)
            slowing: Slowing period (default 3)
        """
        self.k_period = k_period
        self.d_period = d_period
        self.slowing = slowing

        # Price history for highest high and lowest low
        self.highs = deque(maxlen=k_period)
        self.lows = deque(maxlen=k_period)

        # %K calculation (raw stochastic)
        self.percent_k = 50.0

        # %D calculation (SMA of %K)
        self.k_history = deque(maxlen=d_period)
        self.percent_d = 50.0

    def update(self, high: float, low: float, close: float) -> tuple[float, float]:
        """
        Update Stochastic with new OHLC data.

        Args:
            high: High price
            low: Low price
            close: Close price

        Returns:
            Tuple of (%K, %D)
        """
        self.highs.append(high)
        self.lows.append(low)

        if len(self.highs) >= self.k_period and len(self.lows) >= self.k_period:
            # Calculate highest high and lowest low
            highest_high = max(self.highs)
            lowest_low = min(self.lows)

            if highest_high != lowest_low:
                # Calculate %K
                self.percent_k = ((close - lowest_low) / (highest_high - lowest_low)) * 100
            else:
                self.percent_k = 50.0  # Neutral when no range

            # Update %K history for %D calculation
            self.k_history.append(self.percent_k)

            if len(self.k_history) >= self.d_period:
                # Calculate %D (SMA of %K)
                self.percent_d = sum(self.k_history) / len(self.k_history)

        return self.percent_k, self.percent_d

    def get_value(self) -> tuple[float, float]:
        """Get current Stochastic values without updating."""
        return self.percent_k, self.percent_d

    def is_overbought(self, threshold: float = 80.0) -> bool:
        """Check if Stochastic is overbought."""
        return self.percent_k > threshold

    def is_oversold(self, threshold: float = 20.0) -> bool:
        """Check if Stochastic is oversold."""
        return self.percent_k < threshold


def calculate_alpha(period: int) -> float:
    """
    Calculate EMA alpha value for given period.

    Args:
        period: EMA period

    Returns:
        Alpha smoothing factor
    """
    return 2.0 / (period + 1.0)
