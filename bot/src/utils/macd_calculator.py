"""
MACD (Moving Average Convergence Divergence) Calculator
Comprehensive implementation with step-by-step explanations and examples.

MACD Formula:
1. Fast EMA = EMA(price, fast_period)
2. Slow EMA = EMA(price, slow_period)
3. MACD Line = Fast EMA - Slow EMA
4. Signal Line = EMA(MACD Line, signal_period)
5. Histogram = MACD Line - Signal Line

Example from Deriv platform:
- MACD: -0.60
- SIGNAL MACD: -0.31
- MACD HIST: -0.29

This means:
- MACD Line = -0.60
- Signal Line = -0.31
- Histogram = -0.60 - (-0.31) = -0.29

Interpretation:
- MACD Line < 0: Bearish momentum
- Signal Line < 0: Bearish trend
- Histogram < 0: Bearish divergence increasing
"""

import math
from typing import List, Tuple, Optional
from collections import deque
import pandas as pd
import numpy as np


class MACDCalculator:
    """
    Comprehensive MACD Calculator with detailed explanations.

    The MACD indicator consists of three components:
    1. MACD Line: Difference between fast and slow EMAs
    2. Signal Line: EMA of the MACD Line
    3. Histogram: Difference between MACD Line and Signal Line
    """

    def __init__(self, fast_period: int = 12, slow_period: int = 26, signal_period: int = 9):
        """
        Initialize MACD Calculator.

        Args:
            fast_period: Fast EMA period (typically 12)
            slow_period: Slow EMA period (typically 26)
            signal_period: Signal line EMA period (typically 9)
        """
        self.fast_period = fast_period
        self.slow_period = slow_period
        self.signal_period = signal_period

        # Price history for calculations
        self.price_history: deque = deque(maxlen=max(fast_period, slow_period, signal_period) * 3)

        # EMA calculators
        self.fast_ema_values: List[float] = []
        self.slow_ema_values: List[float] = []
        self.macd_values: List[float] = []
        self.signal_values: List[float] = []
        self.histogram_values: List[float] = []

        # Current values
        self.current_macd = 0.0
        self.current_signal = 0.0
        self.current_histogram = 0.0

        # Initialization tracking
        self.is_ready = False
        self.calculation_count = 0

    def calculate_ema(self, values: List[float], period: int, new_value: Optional[float] = None) -> float:
        """
        Calculate Exponential Moving Average.

        EMA Formula:
        EMA_today = (Price_today * Multiplier) + (EMA_yesterday * (1 - Multiplier))
        Multiplier = 2 / (period + 1)

        Args:
            values: Historical values for EMA calculation
            period: EMA period
            new_value: New value to add (if provided)

        Returns:
            Current EMA value
        """
        if new_value is not None:
            values.append(new_value)

        if len(values) < period:
            # Not enough data for EMA calculation
            return 0.0

        if len(values) == period:
            # First EMA value is simple average
            return sum(values[-period:]) / period

        # Calculate multiplier
        multiplier = 2.0 / (period + 1.0)

        # Use the last EMA value as previous
        prev_ema = values[-2] if len(values) > 1 else values[-1]

        # Calculate current EMA
        current_ema = (values[-1] * multiplier) + (prev_ema * (1 - multiplier))

        return current_ema

    def update(self, price: float) -> Tuple[float, float, float]:
        """
        Update MACD with new price data.

        Step-by-step calculation:
        1. Add price to history
        2. Calculate Fast EMA
        3. Calculate Slow EMA
        4. Calculate MACD Line = Fast EMA - Slow EMA
        5. Calculate Signal Line = EMA(MACD Line)
        6. Calculate Histogram = MACD Line - Signal Line

        Args:
            price: Current price

        Returns:
            Tuple of (MACD Line, Signal Line, Histogram)
        """
        self.calculation_count += 1

        # Step 1: Add price to history
        self.price_history.append(price)

        # Step 2: Calculate Fast EMA
        self.fast_ema_values.append(price)
        fast_ema = self.calculate_ema(self.fast_ema_values, self.fast_period)

        # Step 3: Calculate Slow EMA
        self.slow_ema_values.append(price)
        slow_ema = self.calculate_ema(self.slow_ema_values, self.slow_period)

        # Step 4: Calculate MACD Line
        if fast_ema != 0.0 and slow_ema != 0.0:
            self.current_macd = fast_ema - slow_ema
        else:
            self.current_macd = 0.0

        self.macd_values.append(self.current_macd)

        # Step 5: Calculate Signal Line (EMA of MACD Line)
        signal_ema = self.calculate_ema(self.macd_values, self.signal_period)
        if signal_ema != 0.0:
            self.current_signal = signal_ema
        else:
            self.current_signal = self.current_macd

        self.signal_values.append(self.current_signal)

        # Step 6: Calculate Histogram
        self.current_histogram = self.current_macd - self.current_signal
        self.histogram_values.append(self.current_histogram)

        # Check if we have enough data for reliable calculations
        min_required = max(self.fast_period, self.slow_period) + self.signal_period
        self.is_ready = self.calculation_count >= min_required

        return self.current_macd, self.current_signal, self.current_histogram

    def get_values(self) -> Tuple[float, float, float]:
        """Get current MACD values."""
        return self.current_macd, self.current_signal, self.current_histogram

    def get_detailed_analysis(self) -> dict:
        """
        Get detailed MACD analysis.

        Returns:
            Dictionary containing all MACD components and analysis
        """
        return {
            'current_values': {
                'macd_line': self.current_macd,
                'signal_line': self.current_signal,
                'histogram': self.current_histogram
            },
            'interpretation': {
                'trend': 'bullish' if self.current_macd > 0 else 'bearish',
                'momentum': 'increasing' if self.current_histogram > 0 else 'decreasing',
                'signal': 'buy' if self.current_macd > self.current_signal else 'sell'
            },
            'configuration': {
                'fast_period': self.fast_period,
                'slow_period': self.slow_period,
                'signal_period': self.signal_period
            },
            'status': {
                'is_ready': self.is_ready,
                'calculation_count': self.calculation_count,
                'data_points': len(self.price_history)
            }
        }

    def reset(self):
        """Reset all calculations."""
        self.price_history.clear()
        self.fast_ema_values.clear()
        self.slow_ema_values.clear()
        self.macd_values.clear()
        self.signal_values.clear()
        self.histogram_values.clear()
        self.current_macd = 0.0
        self.current_signal = 0.0
        self.current_histogram = 0.0
        self.is_ready = False
        self.calculation_count = 0


def demonstrate_macd_calculation():
    """
    Demonstrate MACD calculation with identical settings to Deriv platform.

    Since Deriv platform uses the same settings as our bot (1,2,1),
    this shows that the calculations should match exactly.
    """
    print("IDENTICAL MACD Settings: Deriv Platform vs Bot")
    print("=" * 55)
    print("Deriv Platform: Fast=1, Slow=2, Signal=1")
    print("Bot:           Fast=1, Slow=2, Signal=1")
    print()

    # Sample price data (simulating recent market prices)
    sample_prices = [
        810.50, 810.75, 811.00, 810.85, 810.60, 810.45, 810.20, 810.35, 810.80, 811.05,
        810.90, 810.65, 810.40, 810.25, 810.10, 810.35, 810.60, 810.85, 811.10, 811.35,
        811.20, 811.45, 811.70, 811.55, 811.30, 811.05, 810.80, 810.55, 810.30, 810.45,
        810.70, 810.95, 811.20, 811.45, 811.70, 811.55, 811.30, 811.05, 810.80, 810.55
    ]

    print(f"Sample Prices ({len(sample_prices)} points): {sample_prices[-10:]}...")
    print()

    # Use identical settings to Deriv platform
    macd = MACDCalculator(fast_period=1, slow_period=2, signal_period=1)

    results = []
    for i, price in enumerate(sample_prices):
        macd_line, signal_line, histogram = macd.update(price)

        if macd.is_ready:
            results.append({
                'price': price,
                'macd': round(macd_line, 2),
                'signal': round(signal_line, 2),
                'histogram': round(histogram, 2)
            })

            print(f"Price: {price:6.2f} | MACD: {macd_line:6.2f} | Signal: {signal_line:6.2f} | Hist: {histogram:6.2f}")

    print()
    print("Final Calculated Values:")
    if results:
        last_result = results[-1]
        print(f"   MACD: {last_result['macd']}")
        print(f"   SIGNAL: {last_result['signal']}")
        print(f"   HIST: {last_result['histogram']}")
        print(f"Expected format: MACD: {last_result['macd']}, SIGNAL: {last_result['signal']}, HIST: {last_result['histogram']}")

        # Show interpretation
        print("\nInterpretation:")
        trend = "Bullish" if last_result['macd'] > 0 else "Bearish"
        momentum = "Increasing" if last_result['histogram'] > 0 else "Decreasing"
        signal = "BUY" if last_result['macd'] > last_result['signal'] else "SELL"
        print(f"   Trend: {trend}")
        print(f"   Momentum: {momentum}")
        print(f"   Signal: {signal}")
    else:
        print("   Not enough data for MACD calculation yet")

    print("\nPOTENTIAL SOURCES OF DISCREPANCY:")
    print("-" * 45)
    print("1. Timing: Screenshot vs bot calculation moment")
    print("2. Chart timeframe: Platform might show different candle period")
    print("3. Price data: Micro-differences in tick data")
    print("4. EMA initialization: Different starting point calculations")
    print("5. Platform display: Might round or format values differently")

    return results


def calculate_macd_pandas(prices: List[float], fast_period: int = 12, slow_period: int = 26, signal_period: int = 9) -> pd.DataFrame:
    """
    Calculate MACD using pandas (traditional method).

    Args:
        prices: List of price values
        fast_period: Fast EMA period
        slow_period: Slow EMA period
        signal_period: Signal EMA period

    Returns:
        DataFrame with MACD, Signal, and Histogram columns
    """
    df = pd.DataFrame({'Close': prices})

    # Calculate EMAs
    df['EMA_Fast'] = df['Close'].ewm(span=fast_period, adjust=False).mean()
    df['EMA_Slow'] = df['Close'].ewm(span=slow_period, adjust=False).mean()

    # Calculate MACD Line
    df['MACD'] = df['EMA_Fast'] - df['EMA_Slow']

    # Calculate Signal Line
    df['Signal'] = df['MACD'].ewm(span=signal_period, adjust=False).mean()

    # Calculate Histogram
    df['Histogram'] = df['MACD'] - df['Signal']

    return df[['MACD', 'Signal', 'Histogram']]


if __name__ == "__main__":
    # Run demonstration
    demonstrate_macd_calculation()


