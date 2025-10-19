"""
Unit tests for technical indicators.
"""

import pytest
import numpy as np
from src.utils.indicators import IncrementalEMA, IncrementalMomentum, IncrementalVolatility, IncrementalRSI


class TestIncrementalEMA:
    """Test IncrementalEMA implementation."""
    
    def test_ema_initialization(self):
        """Test EMA initialization."""
        ema = IncrementalEMA(10)
        assert ema.period == 10
        assert ema.alpha == 2.0 / 11.0
        assert ema.ema is None
        assert not ema.is_initialized
    
    def test_ema_first_update(self):
        """Test EMA first update."""
        ema = IncrementalEMA(10)
        result = ema.update(100.0)
        
        assert result == 100.0
        assert ema.ema == 100.0
        assert ema.is_initialized
    
    def test_ema_subsequent_updates(self):
        """Test EMA subsequent updates."""
        ema = IncrementalEMA(2)  # Alpha = 2/3
        ema.update(100.0)
        result = ema.update(110.0)
        
        expected = (2/3) * 110.0 + (1/3) * 100.0
        assert abs(result - expected) < 1e-10
    
    def test_ema_reset(self):
        """Test EMA reset functionality."""
        ema = IncrementalEMA(10)
        ema.update(100.0)
        ema.reset()
        
        assert ema.ema is None
        assert not ema.is_initialized


class TestIncrementalMomentum:
    """Test IncrementalMomentum implementation."""
    
    def test_momentum_initialization(self):
        """Test momentum initialization."""
        momentum = IncrementalMomentum(5)
        assert momentum.lookback == 5
        assert momentum.momentum is None
    
    def test_momentum_first_update(self):
        """Test momentum first update."""
        momentum = IncrementalMomentum(5)
        result = momentum.update(100.0)
        
        assert result == 0.0
        assert momentum.momentum == 0.0
    
    def test_momentum_calculation(self):
        """Test momentum calculation."""
        momentum = IncrementalMomentum(3)
        
        momentum.update(100.0)
        momentum.update(105.0)
        result = momentum.update(110.0)
        
        assert result == 10.0  # 110 - 100
    
    def test_momentum_rolling_window(self):
        """Test momentum with rolling window."""
        momentum = IncrementalMomentum(3)
        
        momentum.update(100.0)
        momentum.update(105.0)
        momentum.update(110.0)
        result = momentum.update(115.0)
        
        assert result == 10.0  # 115 - 105 (oldest price)


class TestIncrementalVolatility:
    """Test IncrementalVolatility implementation."""
    
    def test_volatility_initialization(self):
        """Test volatility initialization."""
        volatility = IncrementalVolatility(10)
        assert volatility.window == 10
        assert volatility.volatility is None
    
    def test_volatility_insufficient_data(self):
        """Test volatility with insufficient data."""
        volatility = IncrementalVolatility(10)
        
        volatility.update(100.0)
        volatility.update(105.0)
        result = volatility.update(110.0)
        
        assert result == 0.0  # Not enough data
    
    def test_volatility_calculation(self):
        """Test volatility calculation."""
        volatility = IncrementalVolatility(5)
        
        # Add 5 prices with known volatility
        prices = [100.0, 102.0, 98.0, 104.0, 96.0]
        for price in prices:
            volatility.update(price)
        
        result = volatility.get_value()
        assert result is not None
        assert result > 0  # Should have some volatility
    
    def test_volatility_zero_change(self):
        """Test volatility with zero price changes."""
        volatility = IncrementalVolatility(5)
        
        for _ in range(5):
            volatility.update(100.0)
        
        result = volatility.get_value()
        assert result == 0.0  # No volatility


class TestIncrementalRSI:
    """Test IncrementalRSI implementation."""
    
    def test_rsi_initialization(self):
        """Test RSI initialization."""
        rsi = IncrementalRSI(14)
        assert rsi.period == 14
        assert rsi.rsi is None
    
    def test_rsi_insufficient_data(self):
        """Test RSI with insufficient data."""
        rsi = IncrementalRSI(14)
        
        for i in range(5):
            rsi.update(100.0 + i)
        
        result = rsi.get_value()
        assert result is None
    
    def test_rsi_upward_trend(self):
        """Test RSI with upward trend."""
        rsi = IncrementalRSI(5)  # Smaller period for testing
        
        # Create upward trend
        for i in range(10):
            rsi.update(100.0 + i)
        
        result = rsi.get_value()
        assert result is not None
        assert result > 50  # Should be above 50 for upward trend
    
    def test_rsi_downward_trend(self):
        """Test RSI with downward trend."""
        rsi = IncrementalRSI(5)  # Smaller period for testing
        
        # Create downward trend
        for i in range(10):
            rsi.update(100.0 - i)
        
        result = rsi.get_value()
        assert result is not None
        assert result < 50  # Should be below 50 for downward trend


if __name__ == "__main__":
    pytest.main([__file__])

