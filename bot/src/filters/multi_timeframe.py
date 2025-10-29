"""
Multi-timeframe trend confirmation for higher quality signals.

This module analyzes multiple timeframes to confirm trend direction
before allowing trades, significantly improving win rates.
"""

from collections import deque
import time
from infrastructure.logger import logger


class MultiTimeframeAnalyzer:
    """
    Analyze multiple timeframes for trend confluence.
    
    Timeframes:
    - 1-minute: Primary signal generation (tick aggregation)
    - 5-minute: Medium-term trend confirmation
    - 15-minute: Long-term direction (optional)
    """
    
    def __init__(self):
        """Initialize multi-timeframe analyzer."""
        # Price storage for different timeframes
        self.tf1_prices = deque(maxlen=60)  # Last 60 1-min candles (1 hour)
        self.tf1_candles = []  # Completed 1-min candles
        
        # Current candle being built
        self.current_candle_start = None
        self.current_1min_candle = {
            'high': 0,
            'low': float('inf'),
            'close': 0,
            'open': 0,
            'timestamp': 0
        }
        
        # Tick counter for candle formation
        self.tick_count = 0
        
        logger.info("Multi-timeframe analyzer initialized")
    
    def update(self, price: float, timestamp: int):
        """
        Update with new tick data.
        
        Args:
            price: Current tick price
            timestamp: Current timestamp
        """
        current_minute = timestamp // 60
        
        # Update 1-minute candle
        if self.current_candle_start != current_minute:
            # Close current candle if it has data
            if self.current_1min_candle['close'] > 0:
                self.tf1_candles.append(self.current_1min_candle.copy())
                # Keep only last 60 candles (1 hour)
                if len(self.tf1_candles) > 60:
                    self.tf1_candles.pop(0)
                
                logger.debug(f"Closed 1-min candle: O={self.current_1min_candle['open']:.2f}, "
                           f"H={self.current_1min_candle['high']:.2f}, "
                           f"L={self.current_1min_candle['low']:.2f}, "
                           f"C={self.current_1min_candle['close']:.2f}")
            
            # Start new candle
            self.current_candle_start = current_minute
            self.current_1min_candle = {
                'high': price,
                'low': price,
                'close': price,
                'open': price,
                'timestamp': timestamp
            }
        else:
            # Update current candle
            self.current_1min_candle['high'] = max(self.current_1min_candle['high'], price)
            self.current_1min_candle['low'] = min(self.current_1min_candle['low'], price)
            self.current_1min_candle['close'] = price
        
        self.tick_count += 1
    
    def get_trend_confluence(self, current_signal: str) -> tuple[str, float]:
        """
        Check if 1-min and 5-min trends agree with current signal.
        
        Args:
            current_signal: Current signal ('BUY', 'SELL', or 'HOLD')
            
        Returns:
            Tuple of (confirmed_signal, confidence_score)
            - confirmed_signal: 'BUY', 'SELL', or 'HOLD'
            - confidence_score: 0.0 to 1.0
        """
        # Need at least 5 candles for trend analysis
        if len(self.tf1_candles) < 5:
            logger.debug(f"Not enough candle data ({len(self.tf1_candles)}/5), cannot confirm trend")
            return current_signal, 0.5  # Not enough data, neutral confidence
        
        # Calculate 1-minute trend (last 5 candles)
        tf1_trend = self._calculate_trend(self.tf1_candles[-5:])
        
        # Calculate 5-minute trend (aggregate last 25 1-min candles if available)
        if len(self.tf1_candles) >= 25:
            tf5_trend = self._calculate_trend(self.tf1_candles[-25:])
        else:
            tf5_trend = 'NEUTRAL'
            logger.debug(f"Not enough data for 5-min trend ({len(self.tf1_candles)}/25)")
        
        # Log trend analysis
        logger.info(f"Multi-TF Analysis: Current={current_signal}, TF1={tf1_trend}, TF5={tf5_trend}")
        
        # Check confluence based on signal type
        if current_signal == 'BUY':
            if tf1_trend == 'BULLISH' and tf5_trend == 'BULLISH':
                # Strong confluence: all timeframes bullish
                logger.info(" STRONG BUY CONFLUENCE: All timeframes bullish")
                return 'BUY', 0.95
            elif tf1_trend == 'BULLISH':
                # Medium confluence: 1-min bullish
                logger.info(" MEDIUM BUY CONFLUENCE: 1-min bullish")
                return 'BUY', 0.75
            else:
                # No confluence: filter out
                logger.info(" NO BUY CONFLUENCE: 1-min not bullish, filtering signal")
                return 'HOLD', 0.3
        
        elif current_signal == 'SELL':
            if tf1_trend == 'BEARISH' and tf5_trend == 'BEARISH':
                # Strong confluence: all timeframes bearish
                logger.info(" STRONG SELL CONFLUENCE: All timeframes bearish")
                return 'SELL', 0.95
            elif tf1_trend == 'BEARISH':
                # Medium confluence: 1-min bearish
                logger.info(" MEDIUM SELL CONFLUENCE: 1-min bearish")
                return 'SELL', 0.75
            else:
                # No confluence: filter out
                logger.info(" NO SELL CONFLUENCE: 1-min not bearish, filtering signal")
                return 'HOLD', 0.3
        
        # HOLD signal or unknown
        return current_signal, 0.5
    
    def _calculate_trend(self, candles: list) -> str:
        """
        Calculate trend from candle data.
        
        Args:
            candles: List of candle dictionaries
            
        Returns:
            'BULLISH', 'BEARISH', or 'NEUTRAL'
        """
        if not candles or len(candles) < 3:
            return 'NEUTRAL'
        
        try:
            # Simple trend: compare recent closes to earlier closes
            early_closes = [c['close'] for c in candles[:len(candles)//2]]
            recent_closes = [c['close'] for c in candles[len(candles)//2:]]
            
            if not early_closes or not recent_closes:
                return 'NEUTRAL'
            
            early_avg = sum(early_closes) / len(early_closes)
            recent_avg = sum(recent_closes) / len(recent_closes)
            
            # Calculate percentage change
            if early_avg == 0:
                return 'NEUTRAL'
            
            change_pct = (recent_avg - early_avg) / early_avg
            
            # Classify trend based on change
            if change_pct > 0.0002:  # 0.02% move = bullish
                return 'BULLISH'
            elif change_pct < -0.0002:  # -0.02% move = bearish
                return 'BEARISH'
            else:
                return 'NEUTRAL'
        
        except Exception as e:
            logger.error(f"Error calculating trend: {e}")
            return 'NEUTRAL'
    
    def get_status(self) -> dict:
        """Get current status of multi-timeframe analyzer."""
        return {
            'candles_1min': len(self.tf1_candles),
            'tick_count': self.tick_count,
            'current_candle': self.current_1min_candle,
            'ready': len(self.tf1_candles) >= 5
        }



