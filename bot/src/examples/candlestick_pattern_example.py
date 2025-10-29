"""
Example: Using Candlestick Pattern Detection in LemoTick Bot

This example demonstrates:
1. How to use the CandlestickPatternDetector standalone
2. How to use the CandlestickStrategy with filters
3. How to integrate with the existing trading system
4. How to combine with other strategies

Author: LemoTick Development Team
"""

import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from indicators.candlestick_patterns import CandlestickPatternDetector, PatternType
from strategies.candlestick_strategy import CandlestickStrategy
from infrastructure.logger import logger


def example_1_basic_pattern_detection():
    """Example 1: Basic pattern detection without filters."""
    print("\n" + "="*80)
    print("EXAMPLE 1: Basic Candlestick Pattern Detection")
    print("="*80)
    
    detector = CandlestickPatternDetector()
    
    # Simulate some price data - Morning Star pattern
    print("\n Simulating Morning Star pattern (Bullish Reversal)...")
    
    # Long bearish candle
    detector.add_candle(open=1000, high=1005, low=990, close=992)
    
    # Small star candle
    detector.add_candle(open=991, high=993, low=989, close=990)
    
    # Long bullish candle
    detector.add_candle(open=991, high=1003, low=990, close=1001)
    
    # Detect pattern
    signal = detector.get_signal_from_pattern(min_confidence=0.65)
    
    if signal:
        print(f"\n Pattern Detected!")
        print(f"   Pattern: {signal['pattern']}")
        print(f"   Signal: {signal['type']}")
        print(f"   Confidence: {signal['confidence']:.0%}")
        print(f"   Duration: {signal['duration']} minutes")
        print(f"   Description: {signal['metadata']['description']}")
    else:
        print("\n No pattern detected")
    
    # Show statistics
    stats = detector.get_statistics()
    print(f"\n Statistics:")
    print(f"   Total patterns detected: {stats['total_patterns_detected']}")
    print(f"   Patterns by type: {stats['patterns_by_type']}")


def example_2_strategy_with_filters():
    """Example 2: Using CandlestickStrategy with trend and momentum filters."""
    print("\n" + "="*80)
    print("EXAMPLE 2: Candlestick Strategy with Filters")
    print("="*80)
    
    strategy = CandlestickStrategy(
        min_pattern_confidence=0.70,
        require_trend_confirmation=True,
        require_momentum_confirmation=True,
        ema_fast_period=8,
        ema_slow_period=21
    )
    
    print("\n Building uptrend context...")
    
    # Build uptrend with multiple candles
    base_price = 1000.0
    for i in range(25):
        price = base_price + i * 0.5
        strategy.update_candle(
            open=price,
            high=price + 0.7,
            low=price - 0.3,
            close=price + 0.4
        )
    
    print(f"   EMA Trend: {strategy._get_ema_trend()}")
    print(f"   RSI: {strategy.rsi.get_value():.1f}")
    
    # Add bearish reversal pattern at top (Evening Star)
    print("\n Adding Evening Star pattern at top of uptrend...")
    
    last_price = base_price + 25 * 0.5
    strategy.update_candle(open=last_price, high=last_price+2, low=last_price, close=last_price+1.8)
    strategy.update_candle(open=last_price+1.9, high=last_price+2.1, low=last_price+1.7, close=last_price+1.85)
    strategy.update_candle(open=last_price+1.8, high=last_price+1.9, low=last_price-0.5, close=last_price-0.2)
    
    # Get signal
    signal = strategy.get_signal()
    
    if signal:
        print(f"\n Signal Generated!")
        print(f"   Pattern: {signal['pattern']}")
        print(f"   Signal: {signal['type']}")
        print(f"   Confidence: {signal['confidence']:.0%}")
        print(f"   Quality Score: {signal['quality_score']:.0%}")
        print(f"   Duration: {signal['duration']} minutes")
        print(f"   EMA Trend: {signal['metadata']['ema_trend']}")
        print(f"   RSI: {signal['metadata']['rsi_value']:.1f}")
    else:
        print("\n No signal (pattern filtered)")
    
    # Show statistics
    stats = strategy.get_statistics()
    print(f"\n Strategy Statistics:")
    print(f"   Signals generated: {stats['signals_generated']}")
    print(f"   Signals filtered: {stats['signals_filtered']}")
    print(f"   Signal rate: {stats['signal_rate']:.1f}%")
    if stats['filter_reasons']:
        print(f"   Filter reasons: {stats['filter_reasons']}")


def example_3_tick_to_candle_aggregation():
    """Example 3: Building candles from tick data."""
    print("\n" + "="*80)
    print("EXAMPLE 3: Tick-to-Candle Aggregation")
    print("="*80)
    
    strategy = CandlestickStrategy()
    strategy.ticks_per_candle = 10  # 10 ticks per candle (for demo)
    
    print("\n Processing tick stream...")
    
    import random
    
    base_price = 1000.0
    candles_completed = 0
    
    for i in range(150):  # 150 ticks = 15 candles
        # Simulate price movement
        price = base_price + random.uniform(-1, 1) + (i * 0.02)
        
        # Update with tick
        candle_complete = strategy.update_tick(price)
        
        if candle_complete:
            candles_completed += 1
            print(f"   Candle #{candles_completed} completed at price {price:.2f}")
            
            # Check for pattern every 3rd candle
            if candles_completed % 3 == 0:
                signal = strategy.get_signal()
                if signal:
                    print(f"       Signal: {signal['type']} - {signal['pattern']}")
    
    print(f"\n Processed 150 ticks -> {candles_completed} candles")
    
    stats = strategy.get_statistics()
    print(f"   Signals generated: {stats['signals_generated']}")


def example_4_pattern_types():
    """Example 4: Demonstrating different pattern types."""
    print("\n" + "="*80)
    print("EXAMPLE 4: Different Pattern Types")
    print("="*80)
    
    detector = CandlestickPatternDetector()
    
    patterns_to_test = [
        {
            "name": "Hammer (Bullish Reversal)",
            "candles": [
                (100, 102, 95, 101),  # Hammer: small body, long lower shadow
            ]
        },
        {
            "name": "Bullish Engulfing (2-candle)",
            "candles": [
                (100, 101, 98, 99),   # Small bearish
                (98, 105, 97, 104),   # Large bullish engulfing
            ]
        },
        {
            "name": "Three White Soldiers (Bullish Continuation)",
            "candles": [
                (100, 104, 99, 103),
                (102, 106, 101, 105),
                (104, 108, 103, 107),
            ]
        },
        {
            "name": "Doji (Indecision)",
            "candles": [
                (100, 103, 99, 102),  # Bullish candle
                (102, 103, 101, 102), # Doji
            ]
        }
    ]
    
    for test in patterns_to_test:
        print(f"\n Testing: {test['name']}")
        detector.reset()
        
        for candle in test['candles']:
            detector.add_candle(open=candle[0], high=candle[1], low=candle[2], close=candle[3])
        
        pattern = detector.detect_pattern()
        if pattern:
            print(f"    Detected: {pattern.name}")
            print(f"   Signal: {pattern.signal}, Confidence: {pattern.confidence:.0%}")
            print(f"   Type: {pattern.type.value}")
        else:
            print(f"    Pattern not detected (may need more context)")


def example_5_integration_ready():
    """Example 5: Production-ready integration code."""
    print("\n" + "="*80)
    print("EXAMPLE 5: Production Integration Template")
    print("="*80)
    
    print("""
    # In your main bot engine (strategy_engine.py), add:
    
    from strategies.candlestick_strategy import CandlestickStrategy
    
    class StrategyEngine:
        def __init__(self):
            # ... existing code ...
            
            # Add candlestick strategy
            self.candlestick_strategy = CandlestickStrategy(
                min_pattern_confidence=0.70,
                require_trend_confirmation=True,
                require_momentum_confirmation=True
            )
            
            logger.info("Candlestick pattern strategy enabled")
        
        def on_tick(self, tick_data):
            # ... existing tick processing ...
            
            # Update candlestick strategy (builds candles from ticks)
            candle_complete = self.candlestick_strategy.update_tick(tick_data['price'])
            
            if candle_complete:
                # Check for candlestick pattern signal
                signal = self.candlestick_strategy.get_signal()
                
                if signal:
                    # Add to signal queue or execute
                    quality_score = signal['quality_score']
                    
                    if self.signal_queue and quality_score >= 0.75:
                        self.signal_queue.add_signal(signal, quality_score)
                        logger.info(f"Candlestick signal queued: {signal['pattern']}")
                    
                    # Or execute directly
                    # self.execute_signal(signal)
        
        def on_candle(self, ohlc_data):
            # If you receive OHLC data directly, use this:
            self.candlestick_strategy.update_candle(
                open=ohlc_data['open'],
                high=ohlc_data['high'],
                low=ohlc_data['low'],
                close=ohlc_data['close']
            )
            
            signal = self.candlestick_strategy.get_signal()
            if signal:
                # Process signal
                pass
    
    # Configuration options (add to settings.yaml or config):
    
    candlestick_strategy:
      enabled: true
      min_confidence: 0.70
      require_trend_confirmation: true
      require_momentum_confirmation: true
      ema_fast_period: 8
      ema_slow_period: 21
      rsi_period: 14
      rsi_overbought: 70
      rsi_oversold: 30
    """)


def main():
    """Run all examples."""
    print("\n" + "="*80)
    print("CANDLESTICK PATTERN DETECTION - EXAMPLES")
    print("="*80)
    
    try:
        example_1_basic_pattern_detection()
        example_2_strategy_with_filters()
        example_3_tick_to_candle_aggregation()
        example_4_pattern_types()
        example_5_integration_ready()
        
        print("\n" + "="*80)
        print(" ALL EXAMPLES COMPLETED SUCCESSFULLY")
        print("="*80)
        
    except Exception as e:
        print(f"\n Error running examples: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()



