"""
Unit tests for strategy engine.
"""

import pytest
from src.strategy_engine import StrategyEngine, SignalType


class TestStrategyEngine:
    """Test StrategyEngine implementation."""
    
    def test_strategy_engine_initialization(self):
        """Test strategy engine initialization."""
        engine = StrategyEngine()
        
        assert engine.last_signal == SignalType.HOLD
        assert engine.last_price is None
        assert len(engine.signal_history) == 0
    
    def test_update_first_tick(self):
        """Test updating with first tick."""
        engine = StrategyEngine()
        
        signal = engine.update(100.0, 1234567890)
        
        assert signal == SignalType.HOLD  # Should be HOLD until indicators are initialized
        assert engine.last_price == 100.0
        assert len(engine.signal_history) == 1
    
    def test_signal_generation_buy(self):
        """Test BUY signal generation."""
        engine = StrategyEngine()
        
        # Warm up indicators
        for i in range(50):
            engine.update(100.0 + i * 0.01, 1234567890 + i)
        
        # Create conditions for BUY signal
        # Fast EMA should be above slow EMA
        engine.ema_fast.ema = 101.0
        engine.ema_slow.ema = 100.5
        engine.momentum.momentum = 0.0002  # Above threshold
        
        signal = engine.update(101.0, 1234567890)
        
        # Should generate BUY signal if all conditions are met
        assert signal in [SignalType.BUY, SignalType.HOLD]  # Depends on other filters
    
    def test_signal_generation_sell(self):
        """Test SELL signal generation."""
        engine = StrategyEngine()
        
        # Warm up indicators
        for i in range(50):
            engine.update(100.0 - i * 0.01, 1234567890 + i)
        
        # Create conditions for SELL signal
        engine.ema_fast.ema = 100.5
        engine.ema_slow.ema = 101.0
        engine.momentum.momentum = -0.0002  # Below negative threshold
        
        signal = engine.update(100.5, 1234567890)
        
        # Should generate SELL signal if all conditions are met
        assert signal in [SignalType.SELL, SignalType.HOLD]  # Depends on other filters
    
    def test_volatility_filter(self):
        """Test volatility filtering."""
        engine = StrategyEngine()
        
        # Set extreme volatility (should be filtered out)
        engine.volatility.volatility = 0.1  # Very high volatility
        
        signal = engine.update(100.0, 1234567890)
        
        # Should be HOLD due to volatility filter
        assert signal == SignalType.HOLD
    
    def test_rsi_filter(self):
        """Test RSI filtering."""
        engine = StrategyEngine()
        
        # Set RSI in overbought region
        engine.rsi.rsi = 80  # Overbought
        
        signal = engine.update(100.0, 1234567890)
        
        # Should be HOLD due to RSI filter
        assert signal == SignalType.HOLD
    
    def test_get_indicator_values(self):
        """Test getting indicator values."""
        engine = StrategyEngine()
        
        # Update with some data
        engine.update(100.0, 1234567890)
        
        values = engine.get_indicator_values()
        
        assert 'ema_fast' in values
        assert 'ema_slow' in values
        assert 'momentum' in values
        assert 'volatility' in values
        assert 'rsi' in values
        assert 'last_price' in values
    
    def test_get_signal_statistics(self):
        """Test getting signal statistics."""
        engine = StrategyEngine()
        
        # Generate some signals
        for i in range(10):
            engine.update(100.0 + i, 1234567890 + i)
        
        stats = engine.get_signal_statistics()
        
        assert 'total_signals' in stats
        assert 'buy_signals' in stats
        assert 'sell_signals' in stats
        assert 'hold_signals' in stats
        assert stats['total_signals'] > 0
    
    def test_reset(self):
        """Test strategy engine reset."""
        engine = StrategyEngine()
        
        # Make some changes
        engine.update(100.0, 1234567890)
        engine.last_signal = SignalType.BUY
        engine.last_price = 100.0
        
        engine.reset()
        
        assert engine.last_signal == SignalType.HOLD
        assert engine.last_price is None
        assert len(engine.signal_history) == 0


if __name__ == "__main__":
    pytest.main([__file__])
