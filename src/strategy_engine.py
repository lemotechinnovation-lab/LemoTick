"""
Strategy engine for LemoTick bot.
Implements signal generation logic using technical indicators.
"""

from typing import Dict, Any, Optional, Tuple
from enum import Enum
from .utils.indicators import IncrementalEMA, IncrementalMomentum, IncrementalVolatility, IncrementalRSI
from .config import config
from .logger import logger


class SignalType(Enum):
    """Trading signal types."""
    BUY = "BUY"
    SELL = "SELL"
    HOLD = "HOLD"


class StrategyEngine:
    """Main strategy engine for signal generation."""
    
    def __init__(self):
        """Initialize strategy engine with indicators."""
        # Technical indicators
        self.ema_fast = IncrementalEMA(config.ema_fast_period)
        self.ema_slow = IncrementalEMA(config.ema_slow_period)
        self.momentum = IncrementalMomentum(lookback=5)
        self.volatility = IncrementalVolatility(config.volatility_window)
        self.rsi = IncrementalRSI(period=14)
        
        # Strategy parameters
        self.momentum_threshold = config.momentum_threshold
        self.volatility_min = config.get('indicators.volatility_min', 0.0001)
        self.volatility_max = config.get('indicators.volatility_max', 0.01)
        self.rsi_oversold = config.get('indicators.rsi_oversold', 30)
        self.rsi_overbought = config.get('indicators.rsi_overbought', 70)
        
        # State tracking
        self.last_signal = SignalType.HOLD
        self.last_price = None
        self.signal_history = []
        
        logger.info("Strategy engine initialized")
    
    def update(self, price: float, timestamp: int) -> SignalType:
        """
        Update strategy with new price data and generate signal.
        
        Args:
            price: Current price
            timestamp: Price timestamp
            
        Returns:
            Generated trading signal
        """
        try:
            # Update all indicators
            ema_fast = self.ema_fast.update(price)
            ema_slow = self.ema_slow.update(price)
            momentum = self.momentum.update(price)
            volatility = self.volatility.update(price)
            rsi = self.rsi.update(price)
            
            self.last_price = price
            
            # Generate signal
            signal = self._generate_signal(ema_fast, ema_slow, momentum, volatility, rsi)
            
            # Log signal generation
            if signal != SignalType.HOLD:
                logger.info(f"Signal generated: {signal.value} at price {price}")
                self._log_signal_details(price, ema_fast, ema_slow, momentum, volatility, rsi)
            
            # Track signal history
            self.signal_history.append({
                'timestamp': timestamp,
                'price': price,
                'signal': signal.value,
                'ema_fast': ema_fast,
                'ema_slow': ema_slow,
                'momentum': momentum,
                'volatility': volatility,
                'rsi': rsi
            })
            
            # Keep only last 1000 signals
            if len(self.signal_history) > 1000:
                self.signal_history = self.signal_history[-1000:]
            
            self.last_signal = signal
            return signal
            
        except Exception as e:
            logger.error(f"Error updating strategy: {e}")
            return SignalType.HOLD
    
    def _generate_signal(self, ema_fast: float, ema_slow: float, momentum: float, 
                        volatility: float, rsi: float) -> SignalType:
        """
        Generate trading signal based on indicator values.
        
        Args:
            ema_fast: Fast EMA value
            ema_slow: Slow EMA value
            momentum: Momentum value
            volatility: Volatility value
            rsi: RSI value
            
        Returns:
            Generated signal
        """
        # Check if indicators are initialized
        if ema_fast is None or ema_slow is None:
            return SignalType.HOLD
        
        # Volatility filter - avoid trading in extreme conditions
        if volatility < self.volatility_min or volatility > self.volatility_max:
            return SignalType.HOLD
        
        # RSI filter - avoid overbought/oversold conditions
        if rsi > self.rsi_overbought or rsi < self.rsi_oversold:
            return SignalType.HOLD
        
        # Main signal logic
        # BUY signal: Fast EMA above slow EMA + positive momentum
        if ema_fast > ema_slow and momentum > self.momentum_threshold:
            return SignalType.BUY
        
        # SELL signal: Fast EMA below slow EMA + negative momentum
        if ema_fast < ema_slow and momentum < -self.momentum_threshold:
            return SignalType.SELL
        
        return SignalType.HOLD
    
    def _log_signal_details(self, price: float, ema_fast: float, ema_slow: float,
                           momentum: float, volatility: float, rsi: float) -> None:
        """Log detailed signal information."""
        logger.debug(f"Signal details - Price: {price}, EMA Fast: {ema_fast:.6f}, "
                    f"EMA Slow: {ema_slow:.6f}, Momentum: {momentum:.6f}, "
                    f"Volatility: {volatility:.6f}, RSI: {rsi:.2f}")
    
    def get_indicator_values(self) -> Dict[str, Optional[float]]:
        """
        Get current indicator values.
        
        Returns:
            Dictionary of indicator values
        """
        return {
            'ema_fast': self.ema_fast.get_value(),
            'ema_slow': self.ema_slow.get_value(),
            'momentum': self.momentum.get_value(),
            'volatility': self.volatility.get_value(),
            'rsi': self.rsi.get_value(),
            'last_price': self.last_price
        }
    
    def get_signal_statistics(self) -> Dict[str, Any]:
        """
        Get signal generation statistics.
        
        Returns:
            Statistics dictionary
        """
        if not self.signal_history:
            return {'total_signals': 0, 'buy_signals': 0, 'sell_signals': 0, 'hold_signals': 0}
        
        total = len(self.signal_history)
        buy_count = sum(1 for s in self.signal_history if s['signal'] == 'BUY')
        sell_count = sum(1 for s in self.signal_history if s['signal'] == 'SELL')
        hold_count = sum(1 for s in self.signal_history if s['signal'] == 'HOLD')
        
        return {
            'total_signals': total,
            'buy_signals': buy_count,
            'sell_signals': sell_count,
            'hold_signals': hold_count,
            'buy_percentage': (buy_count / total) * 100,
            'sell_percentage': (sell_count / total) * 100,
            'hold_percentage': (hold_count / total) * 100
        }
    
    def reset(self) -> None:
        """Reset all indicators and state."""
        self.ema_fast.reset()
        self.ema_slow.reset()
        self.momentum = IncrementalMomentum(lookback=5)
        self.volatility = IncrementalVolatility(config.volatility_window)
        self.rsi = IncrementalRSI(period=14)
        
        self.last_signal = SignalType.HOLD
        self.last_price = None
        self.signal_history.clear()
        
        logger.info("Strategy engine reset")
    
    def update_parameters(self, **kwargs) -> None:
        """
        Update strategy parameters.
        
        Args:
            **kwargs: Parameter updates
        """
        for key, value in kwargs.items():
            if hasattr(self, key):
                setattr(self, key, value)
                logger.info(f"Updated parameter {key} to {value}")
    
    def get_strategy_status(self) -> Dict[str, Any]:
        """
        Get comprehensive strategy status.
        
        Returns:
            Status dictionary
        """
        return {
            'indicators': self.get_indicator_values(),
            'statistics': self.get_signal_statistics(),
            'last_signal': self.last_signal.value,
            'parameters': {
                'momentum_threshold': self.momentum_threshold,
                'volatility_min': self.volatility_min,
                'volatility_max': self.volatility_max,
                'rsi_oversold': self.rsi_oversold,
                'rsi_overbought': self.rsi_overbought
            }
        }

