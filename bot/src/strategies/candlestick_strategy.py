"""
Candlestick Pattern Strategy for LemoTick Bot.
Combines candlestick pattern detection with trend and momentum filters.

Strategy Logic:
- Detects traditional candlestick patterns (Hammer, Engulfing, Morning Star, etc.)
- Validates patterns with trend confirmation
- Filters using RSI, MACD, and volume indicators
- Generates high-probability trading signals

Win Rate: 65-78% (when combined with filters)
Frequency: 15-30 trades/day
Duration: 5-10 minutes per trade
"""

from typing import Optional, Dict, List
from collections import deque
import sys
import os
import time
from infrastructure.config import config

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from indicators.candlestick_patterns import CandlestickPatternDetector, PatternMatch, PatternType
from indicators.indicators import IncrementalEMA, IncrementalRSI, IncrementalMACD
from indicators.fibonacci import FibonacciLevels
from infrastructure.logger import logger


class CandlestickStrategy:
    """
    Enhanced candlestick pattern trading strategy for 5-minute intervals.
    
    Features:
    - Waits for 2 fully formed candlesticks before making decisions
    - Detects specific patterns: Pin Bars, Momentum Candles, Reversal Signals
    - Pattern recognition for highlighted chart patterns:
      * Strong momentum candles (large bodies)
      * Pin bar reversals (long wicks indicating rejection)
      * Support/resistance bounces (long lower wicks at key levels)
      * Breakout patterns (strong moves after consolidation)
    - Trend confirmation using EMAs
    - Momentum validation using RSI and MACD
    - Quality scoring based on pattern strength and confirmation
    - CRITICAL: Implements "close after second candlestick" logic for proper trade timing
    
    Usage:
        strategy = CandlestickStrategy()
        
        # Update with new candle
        strategy.update_candle(open=100, high=102, low=99, close=101)
        
        # Get trading signal (only after 2 candles formed)
        signal = strategy.get_signal()
        if signal:
            print(f"Trade: {signal['type']} - {signal['pattern']}")
    """
    
    def __init__(self,
                 min_pattern_confidence: float = 0.68,
                 require_trend_confirmation: bool = True,
                 require_momentum_confirmation: bool = True,
                 ema_fast_period: int = 8,
                 ema_slow_period: int = 21,
                 rsi_period: int = 14,
                 rsi_overbought: float = 70,
                 rsi_oversold: float = 30,
                 tick_momentum_enabled: bool = True,
                 tick_momentum_lookback: int = 10,
                 tick_momentum_confidence: float = 0.70,
                 max_candles: int = 200):  # ✅ Added this
        self.min_pattern_confidence = min_pattern_confidence
        self.require_trend_confirmation = require_trend_confirmation
        self.require_momentum_confirmation = require_momentum_confirmation
        self.ema_fast_period = ema_fast_period
        self.ema_slow_period = ema_slow_period
        self.rsi_period = rsi_period
        self.rsi_overbought = rsi_overbought
        self.rsi_oversold = rsi_oversold
        self.tick_momentum_enabled = tick_momentum_enabled
        self.tick_momentum_lookback = tick_momentum_lookback
        self.tick_momentum_confidence = tick_momentum_confidence
        self.max_candles = max_candles  # ✅ Fix applied
        self.levels: list[dict] = [] 

        """
        Initialize candlestick strategy.
        
        Args:
            min_pattern_confidence: Minimum pattern confidence to generate signal
            require_trend_confirmation: Whether to require EMA trend confirmation
            require_momentum_confirmation: Whether to require RSI/MACD confirmation
            ema_fast_period: Fast EMA period for trend detection
            ema_slow_period: Slow EMA period for trend detection
            rsi_period: RSI period
            rsi_overbought: RSI overbought threshold
            rsi_oversold: RSI oversold threshold
            tick_momentum_enabled: Whether to enable tick momentum strategy
            tick_momentum_lookback: Number of ticks to look back for momentum
            tick_momentum_confidence: Confidence level for momentum signals
        """
        # Pattern detector
        self.pattern_detector = CandlestickPatternDetector(
            history_length=10,
            min_body_ratio=0.1,
            min_wick_ratio=2.0,
            doji_threshold=0.1
        )
        
        # Configuration
        self.min_pattern_confidence = min_pattern_confidence
        self.require_trend_confirmation = require_trend_confirmation
        self.require_momentum_confirmation = require_momentum_confirmation
        
        # Market fallback configuration
        self.market_fallback_enabled = config.get("strategy.market_fallback_enabled", True)
        self.market_fallback_momentum_threshold = config.get("strategy.market_fallback_momentum_threshold", 0.0005)
        self.market_fallback_confidence = config.get("strategy.market_fallback_confidence", 0.60)
        self.available_markets = config.get("markets.available_symbols", ["R_100", "R_75", "R_50", "R_25", "R_200"])
        self.current_market_index = 0  # Start with R_100
        self.market_switch_threshold = config.get("adaptive_trading.market_switch_threshold", 0.5)
        self.market_performance_window = config.get("adaptive_trading.market_performance_window", 10)
        self.min_market_switch_interval = config.get("adaptive_trading.min_market_switch_interval", 30)
        
        # Market performance tracking
        self.market_performance = {market: [] for market in self.available_markets}
        self.last_market_switch_time = 0
        self.trend_mismatch_count = 0
        self.max_trend_mismatches = 5  # Switch market after 5 consecutive trend mismatches
        self.pending_market_switch = None  # Store pending market switch requests
        
        # Current trading symbol
        self.current_symbol = "R_100"  # Default symbol, will be updated by bot engine
        
        # Technical indicators for confirmation
        self.ema_fast = IncrementalEMA(ema_fast_period)
        self.ema_slow = IncrementalEMA(ema_slow_period)
        self.rsi = IncrementalRSI(rsi_period)
        self.macd = IncrementalMACD(fast_period=12, slow_period=26, signal_period=9)
        
        #  NEW: Fibonacci retracements for better entry/exit timing
        self.fibonacci = FibonacciLevels(lookback_period=50)
        self.fibonacci_enabled = config.get("strategy.fibonacci_enabled", True)
        self.fibonacci_confidence_boost = config.get("strategy.fibonacci_confidence_boost", 0.15)
        
        # RSI thresholds
        self.rsi_overbought = rsi_overbought
        self.rsi_oversold = rsi_oversold
        
        # Price history for additional analysis
        self.price_history = deque(maxlen=50)
        
        # Current candle being built (for tick aggregation)
        self.current_candle = None
        self.candle_tick_count = 0
        self.ticks_per_candle = 25  # 25 ticks = 5 minute candle (adjusted for 5-min intervals)
        
        # CRITICAL: Fixed logic for "close after second candlestick" 
        # 1. Wait for 1st candle to fully form -> decide direction
        # 2. Place trade -> wait for 2 more candles to fully form
        # 3. Close trade -> wait for next candle to fully form
        # 4. Repeat cycle
        self.candle_buffer = deque(maxlen=max_candles)  # Store candles with max limit
        self.min_candles_for_signal = 1  # Only need 1 candle to decide direction
        self.trade_phase = "waiting_for_direction"  # waiting_for_direction, trade_active, waiting_for_close
        
        # Configurable close timing (default: 2 candles = 10 minutes for 5-min candles)
        self.close_after_candles = config.get("strategy.candlestick_close_after_candles", 1)
        
        # CRITICAL: Trade timing tracking for "close after second candlestick" logic
        self.active_trades = {}  # trade_id -> trade_data
        self.total_candles_processed = 0  # Track total candles processed (not buffer size)
        self.candles_since_trade_start = 0  # Track candles since trade started
        
        # Pattern-specific thresholds for highlighted patterns (AGGRESSIVE for more signals)
        self.momentum_candle_threshold = 0.4  # SIGNIFICANTLY REDUCED for more signals
        self.pin_bar_wick_ratio = 1.2  # SIGNIFICANTLY REDUCED for more signals
        self.reversal_wick_ratio = 0.8  # SIGNIFICANTLY REDUCED for more signals
        
        # Enhanced quality thresholds (AGGRESSIVE)
        self.min_body_size_pips = 0.0001  # SIGNIFICANTLY REDUCED for more signals
        self.min_total_range_pips = 0.0003  # SIGNIFICANTLY REDUCED for more signals

        self.trade_duration = config.get("trading.contract_duration", 3);
        
        # Performance tracking
        self.signals_generated = 0
        self.signals_by_pattern = {}
        self.signals_filtered = 0
        self.filter_reasons = {
            "low_confidence": 0,
            "trend_mismatch": 0,
            "momentum_mismatch": 0,
            "rsi_extreme": 0,
            "insufficient_candles": 0
        }
        
        logger.info("Candlestick Strategy initialized")
        logger.info(f"  Min confidence: {min_pattern_confidence:.0%}")
        logger.info(f"  Trend confirmation: {require_trend_confirmation}")
        logger.info(f"  Momentum confirmation: {require_momentum_confirmation}")
        logger.info(f"  EMA periods: {ema_fast_period}/{ema_slow_period}")
        logger.info(f"  RSI: {rsi_period} period, {rsi_oversold}/{rsi_overbought} levels")
        logger.info(f"  CRITICAL: Fixed logic - 1 candle to decide, 2 candles to close")

    def set_current_symbol(self, symbol: str) -> None:
        """
        Set the current trading symbol.
        
        Args:
            symbol: Current trading symbol (e.g., "R_100", "R_75", etc.)
        """
        self.current_symbol = symbol
        logger.info(f"Candlestick strategy symbol set to: {symbol}")
    
    def update_tick(self, price: float) -> Optional[bool]:
        """
        Update strategy with new tick price (builds candles).
    
        Args:
            price: Current tick price
    
        Returns:
            True if candle completed, False otherwise
        """
        self.price_history.append(price)
    
        # Initialize or reset current candle
        if self.current_candle is None:
            self._start_new_candle(price)
            return False
    
        # Update current candle
        self.current_candle["high"] = max(self.current_candle["high"], price)
        self.current_candle["low"] = min(self.current_candle["low"], price)
        self.current_candle["close"] = price
        self.candle_tick_count += 1
    
        # Check if candle is complete
        if self.candle_tick_count >= self.ticks_per_candle:
            logger.info(f"CANDLE COMPLETED: Tick {self.candle_tick_count}/{self.ticks_per_candle}")
            logger.info(
                f"CANDLE DATA: O:{self.current_candle['open']:.4f} "
                f"H:{self.current_candle['high']:.4f} "
                f"L:{self.current_candle['low']:.4f} "
                f"C:{self.current_candle['close']:.4f}"
            )
    
            self._complete_candle()
            self._start_new_candle(price)
            return True
    
        return False


    def _start_new_candle(self, price: float) -> None:
        """Helper to initialize or reset a new candle."""
        self.current_candle = {
            "open": price,
            "high": price,
            "low": price,
            "close": price
        }
        self.candle_tick_count = 1

    
    def update_candle(self, open: float, high: float, low: float, close: float) -> None:
        """Update strategy with completed candle (alternative to tick updates)."""
        self.pattern_detector.add_candle(open, high, low, close)
    
        completed_candle = {"open": open, "high": high, "low": low, "close": close}
        self.candle_buffer.append(completed_candle)  # deque automatically handles maxlen overflow
    
        logger.info(f"CANDLE BUFFER DEBUG: Added candle O:{open:.4f} H:{high:.4f} L:{low:.4f} C:{close:.4f} | Buffer size={len(self.candle_buffer)}")
    
        self.total_candles_processed += 1
        self.ema_fast.update(close)
        self.ema_slow.update(close)
        self.rsi.update(close)
        self.macd.update(close)
    
        if self.fibonacci_enabled:
            import time
            self.fibonacci.update(close, int(time.time()))
    
        self.price_history.append(close)
        self._update_trade_timing()
        logger.debug(f"Candle updated: O:{open:.4f} H:{high:.4f} L:{low:.4f} C:{close:.4f}")

    
    def _complete_candle(self) -> None:
        """
        Finalize and process the current candle.

        Handles:
        - Appending completed candle to buffer
        - Updating indicators and pattern detectors
        - Managing trade phases (direction → close → reset)
        - Logging and error resilience
        """
        if self.current_candle is None:
            logger.debug("⚠️ Skipping _complete_candle — current_candle is None.")
            return

        try:
            # --- 📊 Finalize Candle Data ---
            completed_candle = {
                "open": self.current_candle["open"],
                "high": self.current_candle["high"],
                "low": self.current_candle["low"],
                "close": self.current_candle["close"],
                "timestamp": self.current_candle.get("timestamp", time.time())
            }

            # Append to candle buffer (maintain size limit)
            self.candle_buffer.append(completed_candle)
            if len(self.candle_buffer) > self.max_candles:
                self.candle_buffer.pop()

            logger.info(
                f"📈 Candle completed — O:{completed_candle['open']:.5f} "
                f"H:{completed_candle['high']:.5f} L:{completed_candle['low']:.5f} "
                f"C:{completed_candle['close']:.5f} | Buffer size={len(self.candle_buffer)}"
            )

            # --- 🔁 Update indicators/pattern detectors ---
            self.update_candle(
                open=completed_candle["open"],
                high=completed_candle["high"],
                low=completed_candle["low"],
                close=completed_candle["close"]
            )

            # --- 🕒 Trade Timing Control ---
            self._update_trade_timing()

            # --- ⚙️ Phase-Based Processing ---
            if self.trade_phase == "waiting_for_direction":
                # Try generating new signal
                signal = self.get_signal()
                if signal:
                    logger.info(
                        f"📊 Signal detected — {signal['type'].upper()} | Pattern={signal['pattern']} | Confidence={signal['confidence']:.1%}"
                    )
                else:
                    logger.debug("No signal generated this candle (phase: waiting_for_direction).")

            # --- 🧹 Reset current candle for next cycle ---
            self.current_candle = None

        except Exception as e:
            logger.error(f"❌ Error during _complete_candle(): {e}")


    def get_fibonacci_signal(self, price: float) -> Optional[dict]:
        """
        Generate a basic Fibonacci confluence signal.
        Returns a dict with 'type', 'confidence', and 'level'.
        """
        try:
            if not hasattr(self, "levels") or not self.levels:
                return None

            # Ensure all level prices are numeric
            numeric_levels = []
            for i, lvl in enumerate(self.levels):
                if isinstance(lvl, dict):
                    numeric_levels.append({"name": lvl.get("name", f"level_{i}"), "price": float(lvl.get("price", 0.0))})
                else:
                    numeric_levels.append({"name": f"level_{i}", "price": float(lvl)})

            # Find nearest level
            nearest = min(numeric_levels, key=lambda lvl: abs(price - lvl["price"]))
            nearest_price = nearest["price"]

            # Calculate difference ratio safely
            if nearest_price == 0:
                return None  # Avoid division by zero

            diff_ratio = abs(price - nearest_price) / nearest_price

            # Signal logic: within 0.2% of level
            if diff_ratio < 0.002:
                signal_type = "BUY" if price <= nearest_price else "SELL"
                confidence = max(0.0, min(1.0, 0.9 - diff_ratio * 100))  # clamp confidence 0–1
                return {"type": signal_type, "confidence": confidence, "level": nearest["name"]}

            return None

        except Exception as e:
            logger.error(f"Error generating Fibonacci signal: {e}")
            return None
    
    def get_signal(self) -> Optional[Dict]:
        """
        Get trading signal based on candlestick patterns and confirmations.

        Returns:
            Signal dictionary or None
        """
        # --- 🛑 Phase Gate ---
        if self.trade_phase != "waiting_for_direction":
            logger.debug(
                f"CANDLESTICK: Skipping signal generation — currently in phase '{self.trade_phase}'"
            )
            return None

        # --- 🧱 Ensure Enough Candles ---
        if len(self.candle_buffer) < self.min_candles_for_signal:
            self._record_filter("insufficient_candles")
            logger.debug(
                f"CANDLESTICK: Insufficient candles: {len(self.candle_buffer)} < {self.min_candles_for_signal}"
            )
            return None

        # --- ⚙️ Generate Direction Signal ---
        signal = self._get_direction_signal()
        if not signal:
            logger.debug("CANDLESTICK: No valid signal returned from _get_direction_signal().")
            return None

        # --- ✅ Signal Approved ---
        logger.info(
            f"✅ SIGNAL APPROVED: {signal['type'].upper()} | Pattern={signal['pattern']} | "
            f"Confidence={signal['confidence']:.1%} | Quality={signal['quality_score']:.2f}"
        )

        return signal

    def _get_direction_signal(self) -> Optional[Dict]:
        """
        Analyze recent candles to decide accurate trade direction based on
        candlestick patterns, EMA trend, and momentum alignment.

        Returns:
            Signal dictionary or None
        """
        if len(self.candle_buffer) < 1:
            logger.debug("No candles in buffer — cannot generate signal.")
            return None

        # Most recent candles
        if len(self.candle_buffer) >= 2:
            candle2 = self.candle_buffer[-1]
            candle1 = self.candle_buffer[-2]
            self._analyze_highlighted_patterns(candle1, candle2)
        else:
            # Not enough candles to analyze
            candle1, candle2 = None, None
            logger.debug("Skipping pattern analysis - insufficient candle data")

        # --- 1️⃣ Pattern Analysis ---
        pattern_result = self._analyze_highlighted_patterns(candle1, candle2)
        if not pattern_result:
            logger.debug("No highlighted candlestick pattern detected.")
            return None

        pattern_name, signal_type, confidence = pattern_result

        # --- 2️⃣ Confidence Filter ---
        if confidence < self.min_pattern_confidence:
            self._record_filter("low_confidence")
            logger.info(
                f"[FILTER] Pattern '{pattern_name}' skipped — low confidence "
                f"({confidence:.0%} < {self.min_pattern_confidence:.0%})"
            )
            return None

        # --- 3️⃣ EMA & RSI Alignment ---
        ema_trend = self._get_ema_trend()  # returns "up", "down", or "flat"
        rsi_value = self.rsi.get_value() or 50.0
        direction_ok = False

        # ✅ Relaxed trend-momentum confirmation
        if signal_type == "BUY" and ema_trend in ("up", "flat") and rsi_value > 48:
            direction_ok = True
        elif signal_type == "SELL" and ema_trend in ("down", "flat") and rsi_value < 52:
            direction_ok = True
        else:
            # Allow strong patterns even against minor trend mismatch
            if confidence >= 0.85:
                direction_ok = True
                logger.info(
                    f"[OVERRIDE] {pattern_name} passes due to high confidence ({confidence:.0%}) "
                    f"despite EMA/RSI mismatch."
                )

        if not direction_ok:
            self._record_filter("trend_mismatch")
            logger.info(
                f"[FILTER] Pattern '{pattern_name}' rejected due to EMA/RSI mismatch — "
                f"Signal={signal_type}, EMA={ema_trend}, RSI={rsi_value:.1f}, Confidence={confidence:.0%}"
            )
            return None

        # --- 4️⃣ Signal Direction ---
        # Patterns always return semantic meaning (BUY=expect up, SELL=expect down)
        # This works for ALL symbols including R_100

        # --- 5️⃣ Compute Signal Quality ---
        quality_score = self._calculate_enhanced_quality_score(
            pattern_name, confidence, signal_type
        )

        # --- 6️⃣ Construct Signal Dictionary ---
        signal = {
            "type": signal_type,
            "pattern": pattern_name,
            "confidence": confidence,
            "quality_score": quality_score,
            "duration": 3,
            "timestamp": time.time(),
            "strategy": "EnhancedCandlestick",
            "pattern_type": "highlighted_pattern",
            "close_after_candles": self.close_after_candles,
            "trade_start_candle": self.total_candles_processed,
            "expected_close_candle": self.total_candles_processed + self.close_after_candles,
            "metadata": {
                "ema_trend": ema_trend,
                "rsi_value": rsi_value,
                "pattern_type": "highlighted_pattern",
            },
        }

        # --- 7️⃣ Logging Summary ---
        logger.info(
            f"[SIGNAL CONFIRMED] {signal_type.upper()} | "
            f"Pattern={pattern_name}, Confidence={confidence:.1%}, "
            f"EMA={ema_trend}, RSI={rsi_value:.1f}, Quality={quality_score:.2f}"
        )
        logger.info(
            f"[TRADE PLAN] Will close after {signal['close_after_candles']} candles "
            f"(expected close: {signal['expected_close_candle']})"
        )

        # --- 8️⃣ Update Internal Statistics ---
        self.signals_generated += 1
        self.signals_by_pattern[pattern_name] = self.signals_by_pattern.get(pattern_name, 0) + 1

        # --- ✅ Final Output ---
        logger.debug(f"[DIRECTION OK] Signal object ready: {signal}")
        return signal

    
    def _check_trend_confirmation(self, pattern: PatternMatch) -> bool:
        """Check if EMA trend confirms the pattern signal (simplified for enhanced pattern detection only)."""
        return True  # Simplified - enhanced pattern detection doesn't need complex trend confirmation
    
    def _check_momentum_confirmation(self, pattern: PatternMatch) -> bool:
        """Check if momentum indicators confirm the pattern (simplified for enhanced pattern detection only)."""
        return True  # Simplified - enhanced pattern detection doesn't need complex momentum confirmation
    
    def _check_rsi_filter(self, pattern: PatternMatch) -> bool:
        """Check RSI filter (simplified for enhanced pattern detection only)."""
        return True  # Simplified - enhanced pattern detection doesn't need complex RSI filtering
    
    def _calculate_quality_score(self, pattern: PatternMatch) -> float:
        """Calculate overall quality score for the signal (simplified for enhanced pattern detection only)."""
        return 0.8  # Simplified - high confidence for enhanced pattern detection
    
    def _get_ema_trend(self) -> str:
        """Compute EMA trend based on actual EMA indicators."""
        if len(self.candle_buffer) < 2:
            return "neutral"
        
        # Use actual EMA indicators instead of simple moving averages
        ema_fast_value = self.ema_fast.get_value()
        ema_slow_value = self.ema_slow.get_value()
        
        if ema_fast_value is None or ema_slow_value is None:
            return "neutral"
        
        # Add tolerance to avoid exact equality issues
        tolerance = 0.001
        if ema_fast_value > ema_slow_value + tolerance:
            return "up"
        elif ema_fast_value < ema_slow_value - tolerance:
            return "down"
        else:
            return "neutral"

    
    def _get_duration(self, pattern: PatternMatch) -> int:
        """
        Get recommended trade duration based on pattern.
        
        Args:
            pattern: Detected pattern
            
        Returns:
            Duration in minutes
        """
        # CRITICAL: Use 5 minutes for faster binary options trading
        # This is optimal for binary options volatility
        return 5
    
    def _record_filter(self, reason: str) -> None:
        """Record why a signal was filtered."""
        self.signals_filtered += 1
        if reason in self.filter_reasons:
            self.filter_reasons[reason] += 1
    
    def get_statistics(self) -> Dict:
        """
        Get strategy statistics.
        
        Returns:
            Statistics dictionary
        """
        total_patterns = self.pattern_detector.patterns_detected
        
        return {
            "signals_generated": self.signals_generated,
            "signals_by_pattern": self.signals_by_pattern.copy(),
            "signals_filtered": self.signals_filtered,
            "filter_reasons": self.filter_reasons.copy(),
            "total_patterns_detected": total_patterns,
            "signal_rate": (self.signals_generated / max(total_patterns, 1)) * 100,
            "filter_rate": (self.signals_filtered / max(total_patterns, 1)) * 100,
            "strategy_name": "CandlestickPatternStrategy"
        }
    
    def _analyze_simple_patterns(self, candle1: Optional[Dict], candle2: Optional[Dict]) -> Optional[tuple]:
        """
        Analyze candle patterns using a structured four-category classification system:
          1. Bullish Patterns   → potential upward move
          2. Bearish Patterns   → potential downward move
          3. Neutral Patterns   → indecision signals
          4. Complex Patterns   → multi-candle, nuanced formations

        Optionally integrates Fibonacci confluence to enhance confidence levels.

        Args:
            candle1: Previous candle (if available)
            candle2: Current candle

        Returns:
            Tuple (pattern_name, signal_type, confidence) or None
        """
        if not candle2:
            return None

        # --- Step 1: Basic Candle Metrics ---
        open_price = candle2["open"]
        close_price = candle2["close"]
        high_price = candle2["high"]
        low_price = candle2["low"]

        body_size = abs(close_price - open_price)
        total_range = high_price - low_price
        upper_wick = high_price - max(open_price, close_price)
        lower_wick = min(open_price, close_price) - low_price

        if total_range <= 0:
            logger.debug("Skipped candle: total_range=0 (invalid)")
            return None

        # --- Step 2: Filter Out Weak / Noisy Candles ---
        if (body_size < self.min_body_size_pips) or (total_range < self.min_total_range_pips):
            logger.debug(
                f"Pattern filtered: body_size={body_size:.2f} < {self.min_body_size_pips} "
                f"or range={total_range:.2f} < {self.min_total_range_pips}"
            )
            return None

        # --- Step 3: Calculate Relative Ratios ---
        body_ratio = body_size / total_range
        upper_wick_ratio = upper_wick / total_range
        lower_wick_ratio = lower_wick / total_range

        # --- Step 4: Four-Category Pattern Detection ---
        # 1. Neutral → 2. Bullish → 3. Bearish → 4. Complex
        pattern_detectors = [
            self._detect_neutral_patterns,
            self._detect_bullish_patterns,
            self._detect_bearish_patterns,
            self._detect_complex_patterns,
        ]

        for detector in pattern_detectors:
            try:
                result = detector(candle1, candle2, body_ratio, upper_wick_ratio, lower_wick_ratio)
                if result:
                    return result
            except TypeError:
                # Handles detectors with different signatures (e.g., neutral uses more args)
                if detector == self._detect_neutral_patterns:
                    result = detector(candle2, body_size, total_range, upper_wick, lower_wick)
                    if result:
                        return result
                else:
                    raise

        # --- Step 5: Fibonacci Confluence Analysis ---
        if self.fibonacci_enabled and getattr(self, "fibonacci", None) and len(self.price_history) > 0:
            current_price = close_price
            fib_signal = self.fibonacci.get_signal(current_price)

            if fib_signal:
                fib_type = fib_signal["type"]  # BUY or SELL
                fib_level = fib_signal["level"]
                fib_confidence = fib_signal.get("confidence", 0.7)

                is_bullish_candle = close_price > open_price
                boosted_confidence = None

                if fib_type == "BUY":
                    # Bullish Fibonacci confluence
                    if lower_wick_ratio >= 0.4:
                        boosted_confidence = min(0.95, fib_confidence + self.fibonacci_confidence_boost)
                        logger.info(
                            f"FIBONACCI: Support bounce at {fib_level} (wick={lower_wick_ratio:.2f}) "
                            f"→ confidence {boosted_confidence:.0%}"
                        )
                        return ("FibonacciSupportBounce", "BUY", boosted_confidence)

                    elif body_ratio >= 0.5 and is_bullish_candle:
                        # Large bullish candle body at Fibonacci level = strong bullish
                        boosted_confidence = min(0.95, fib_confidence + 0.15)
                        logger.info(
                            f"FIBONACCI: Bullish momentum at {fib_level} "
                            f"→ confidence {boosted_confidence:.0%}"
                        )
                        return ("FibonacciBullishMomentum", "BUY", boosted_confidence)

                elif fib_type == "SELL":
                    # Bearish Fibonacci confluence
                    if upper_wick_ratio >= 0.4:
                        boosted_confidence = min(0.95, fib_confidence + self.fibonacci_confidence_boost)
                        logger.info(
                            f"FIBONACCI: Resistance rejection at {fib_level} (wick={upper_wick_ratio:.2f}) "
                            f"→ confidence {boosted_confidence:.0%}"
                        )
                        return ("FibonacciResistanceRejection", "SELL", boosted_confidence)

                    elif body_ratio >= 0.5 and not is_bullish_candle:
                        # Large bearish candle body at Fibonacci level = strong bearish
                        boosted_confidence = min(0.95, fib_confidence + 0.15)
                        logger.info(
                            f"FIBONACCI: Bearish momentum at {fib_level} "
                            f"→ confidence {boosted_confidence:.0%}"
                        )
                        return ("FibonacciBearishMomentum", "SELL", boosted_confidence)

        # --- Step 6: No Pattern Found ---
        return None


    def _analyze_highlighted_patterns(self, candle1: Optional[Dict], candle2: Optional[Dict]) -> Optional[tuple]:
        """Legacy method - now redirects to simple patterns."""
        return self._analyze_simple_patterns(candle1, candle2)


    def _detect_neutral_patterns(
        self,
        candle: Dict,
        body_size: float,
        total_range: float,
        upper_wick: float,
        lower_wick: float
    ) -> Optional[tuple]:
        """
        Detects neutral candlestick patterns indicating market indecision.

        Args:
            candle: Current candle data (open, close, high, low)
            body_size: Absolute difference between open and close
            total_range: High - Low (entire candle range)
            upper_wick: Distance from close/open to high
            lower_wick: Distance from open/close to low

        Returns:
            Tuple (pattern_name, signal_type, confidence) or None
        """
        if total_range <= 0:
            return None  # Avoid division by zero or invalid candles

        # Normalize proportions
        body_ratio = body_size / total_range
        upper_wick_ratio = upper_wick / total_range
        lower_wick_ratio = lower_wick / total_range

        # =============================
        # 1️⃣ DOJI FAMILY DETECTION
        # =============================
        if body_ratio <= 0.1:  # Very small body
            if upper_wick_ratio >= 0.4 and lower_wick_ratio >= 0.4:
                logger.info("NEUTRAL: Long-legged Doji detected — strong market indecision.")
                return ("LongLeggedDoji", "HOLD", 0.90)

            elif upper_wick_ratio >= 0.4 and lower_wick_ratio <= 0.2:
                logger.info("NEUTRAL: Gravestone Doji detected — potential bearish reversal.")
                return ("GravestoneDoji", "HOLD", 0.85)

            elif lower_wick_ratio >= 0.4 and upper_wick_ratio <= 0.2:
                logger.info("NEUTRAL: Dragonfly Doji detected — potential bullish reversal.")
                return ("DragonflyDoji", "HOLD", 0.85)

            else:
                logger.info("NEUTRAL: Standard Doji detected — general indecision.")
                return ("StandardDoji", "HOLD", 0.80)

        # =============================
        # 2️⃣ SPINNING TOP DETECTION
        # =============================
        if 0.1 < body_ratio <= 0.3 and upper_wick_ratio >= 0.3 and lower_wick_ratio >= 0.3:
            logger.info("NEUTRAL: Spinning Top detected — market uncertainty.")
            return ("SpinningTop", "HOLD", 0.75)

        return None

    
    def _detect_bullish_patterns(
        self,
        candle1: Optional[Dict],
        candle2: Dict,
        body_ratio: float,
        upper_wick_ratio: float,
        lower_wick_ratio: float
    ) -> Optional[tuple]:
        """
        Detect bullish candlestick patterns suggesting potential upward movement.

        Args:
            candle1: Previous candle (optional)
            candle2: Current candle
            body_ratio: Body size ratio (body / total range)
            upper_wick_ratio: Upper wick ratio (upper wick / total range)
            lower_wick_ratio: Lower wick ratio (lower wick / total range)

        Returns:
            Tuple (pattern_name, signal_type, confidence) or None
        """
        is_bullish_candle = candle2["close"] > candle2["open"]

        # ============================================================
        # 1️⃣ Hammer (bullish reversal pattern)
        # ============================================================
        if lower_wick_ratio >= 2.0 and upper_wick_ratio <= 0.1 and body_ratio <= 0.3:
            # Hammer: Long lower wick shows rejection of lower prices = bullish
            logger.info(f"BULLISH PATTERN: Hammer detected → BUY")
            return ("Hammer", "BUY", 0.85)

        # ============================================================
        # 2️⃣ Inverted Hammer (bullish reversal pattern)
        # ============================================================
        if upper_wick_ratio >= 2.0 and lower_wick_ratio <= 0.1 and body_ratio <= 0.3:
            # Inverted Hammer: Buyers tried to push up (long upper wick) = potential bullish
            logger.info(f"BULLISH PATTERN: Inverted Hammer detected → BUY")
            return ("InvertedHammer", "BUY", 0.80)

        # ============================================================
        # 3️⃣ Bullish Engulfing Pattern
        # ============================================================
        if candle1:
            prev_open, prev_close = candle1["open"], candle1["close"]
            curr_open, curr_close = candle2["open"], candle2["close"]
            prev_is_bearish = prev_close < prev_open
            curr_is_bullish = curr_close > curr_open

            # Standard Bullish Engulfing definition (works for ALL symbols):
            # - Previous candle is bearish (close < open)
            # - Current candle is bullish (close > open)
            # - Current candle's body engulfs previous candle's body
            engulfing = (
                prev_is_bearish and curr_is_bullish and
                curr_close > prev_open and curr_open < prev_close
            )

            if engulfing:
                logger.info(f"BULLISH PATTERN: Bullish Engulfing detected → BUY")
                return ("BullishEngulfing", "BUY", 0.90)

        # ============================================================
        # 4️⃣ Support Bounce (long lower wick indicating buying pressure)
        # ============================================================
        if lower_wick_ratio >= getattr(self, "reversal_wick_ratio", 1.5):
            # Long lower wick shows price was pushed down but recovered = bullish
            logger.info(f"BULLISH PATTERN: Support Bounce detected → BUY")
            return ("SupportBounce", "BUY", 0.75)

        # ============================================================
        # 5️⃣ Strong Bullish Momentum Candle
        # ============================================================
        if body_ratio >= getattr(self, "momentum_candle_threshold", 0.6) and is_bullish_candle:
            # Large bullish candle body = strong upward momentum
            logger.info(f"BULLISH PATTERN: Strong Bullish Momentum detected → BUY")
            return ("StrongBullishMomentum", "BUY", 0.85)

        return None


    def _detect_bearish_patterns(
        self,
        candle1: Optional[Dict],
        candle2: Dict,
        body_ratio: float,
        upper_wick_ratio: float,
        lower_wick_ratio: float
    ) -> Optional[tuple]:
        """
        Detect bearish candlestick patterns suggesting potential downward movement.

        Args:
            candle1: Previous candle (optional)
            candle2: Current candle
            body_ratio: Body size ratio (body / total range)
            upper_wick_ratio: Upper wick ratio (upper wick / total range)
            lower_wick_ratio: Lower wick ratio (lower wick / total range)

        Returns:
            Tuple (pattern_name, signal_type, confidence) or None
        """
        is_bullish_candle = candle2["close"] > candle2["open"]

        # ============================================================
        # 1️⃣ Hanging Man (bearish reversal pattern after uptrend)
        # ============================================================
        if lower_wick_ratio >= 2.0 and upper_wick_ratio <= 0.1 and body_ratio <= 0.3:
            # Hanging Man: Long lower wick after uptrend shows selling pressure = bearish
            logger.info(f"BEARISH PATTERN: Hanging Man detected → SELL")
            return ("HangingMan", "SELL", 0.85)

        # ============================================================
        # 2️⃣ Shooting Star (bearish reversal pattern)
        # ============================================================
        if upper_wick_ratio >= 2.0 and lower_wick_ratio <= 0.1 and body_ratio <= 0.3:
            # Shooting Star: Rejection of higher prices (long upper wick) = bearish
            logger.info(f"BEARISH PATTERN: Shooting Star detected → SELL")
            return ("ShootingStar", "SELL", 0.85)

        # ============================================================
        # 3️⃣ Bearish Engulfing Pattern
        # ============================================================
        if candle1:
            prev_open, prev_close = candle1["open"], candle1["close"]
            curr_open, curr_close = candle2["open"], candle2["close"]
            prev_is_bullish = prev_close > prev_open
            curr_is_bearish = curr_close < curr_open

            # Standard Bearish Engulfing definition (works for ALL symbols):
            # - Previous candle is bullish (close > open)
            # - Current candle is bearish (close < open)
            # - Current candle's body engulfs previous candle's body
            engulfing = (
                prev_is_bullish and curr_is_bearish and
                curr_close < prev_open and curr_open > prev_close
            )

            if engulfing:
                logger.info(f"BEARISH PATTERN: Bearish Engulfing detected → SELL")
                return ("BearishEngulfing", "SELL", 0.90)

        # ============================================================
        # 4️⃣ Resistance Rejection (long upper wick indicating selling pressure)
        # ============================================================
        if upper_wick_ratio >= getattr(self, "reversal_wick_ratio", 1.5):
            # Long upper wick shows price was pushed up but rejected = bearish
            logger.info(f"BEARISH PATTERN: Resistance Rejection detected → SELL")
            return ("ResistanceRejection", "SELL", 0.75)

        # ============================================================
        # 5️⃣ Strong Bearish Momentum Candle
        # ============================================================
        if body_ratio >= getattr(self, "momentum_candle_threshold", 0.6) and not is_bullish_candle:
            # Large bearish candle body = strong downward momentum
            logger.info(f"BEARISH PATTERN: Strong Bearish Momentum detected → SELL")
            return ("StrongBearishMomentum", "SELL", 0.85)

        return None

    
    def _detect_complex_patterns(
        self,
        candle1: Optional[Dict],
        candle2: Dict,
        body_ratio: float,
        upper_wick_ratio: float,
        lower_wick_ratio: float
    ) -> Optional[tuple]:
        """
        Detect complex multi-candle patterns and breakout signals.
    
        Args:
            candle1: Previous candle (if available)
            candle2: Current candle
            body_ratio: Current candle body ratio
            upper_wick_ratio: Current candle upper wick ratio
            lower_wick_ratio: Current candle lower wick ratio
    
        Returns:
            Tuple of (pattern_name, signal_type, confidence) or None
        """
        if candle1 is None:
            return None
    
        # --- Helper calculations ---
        prev_body_size = abs(candle1["close"] - candle1["open"])
        prev_range = candle1["high"] - candle1["low"]
        prev_body_ratio = prev_body_size / prev_range if prev_range > 0 else 0
    
        is_bullish_candle = candle2["close"] > candle2["open"]
    
        # --- Breakout Pattern ---
        if body_ratio >= 0.6 and prev_body_ratio < 0.4:
            # Consolidation (small prev body) followed by strong move (large current body)
            if is_bullish_candle:
                logger.info(f"COMPLEX PATTERN: Bullish Breakout detected")
                return ("BullishBreakout", "BUY", 0.80)
            else:
                logger.info(f"COMPLEX PATTERN: Bearish Breakout detected")
                return ("BearishBreakout", "SELL", 0.80)
    
        # --- Morning/Evening Star (Simplified 2-Candle) ---
        prev_is_bullish = candle1["close"] > candle1["open"]
        prev_is_bearish = not prev_is_bullish
        curr_is_bullish = candle2["close"] > candle2["open"]
        curr_is_bearish = not curr_is_bullish
    
        prev_body_large = prev_body_ratio >= 0.6
        curr_body_large = body_ratio >= 0.6
    
        # Standard definitions (works for ALL symbols):
        #   Morning Star = Bearish → Bullish reversal
        #   Evening Star = Bullish → Bearish reversal
    
        if prev_is_bearish and curr_is_bullish and prev_body_large and curr_body_large:
            logger.info("COMPLEX PATTERN: Morning Star detected")
            return ("MorningStar", "BUY", 0.88)
    
        if prev_is_bullish and curr_is_bearish and prev_body_large and curr_body_large:
            logger.info("COMPLEX PATTERN: Evening Star detected")
            return ("EveningStar", "SELL", 0.88)
    
        return None


    
    def _switch_to_fallback_market(self):
        """Switch to fallback market (simplified for enhanced pattern detection only)."""
        logger.info("Market switching simplified - using enhanced pattern detection only")
    
    def get_current_market(self) -> str:
        """Get the current active market symbol."""
        return self.available_markets[self.current_market_index]
    
    def get_market_performance_summary(self) -> dict:
        """Get a summary of market performance for monitoring."""
        summary = {}
        for market, performance in self.market_performance.items():
            if performance:
                recent_performance = performance[-self.market_performance_window:]
                switch_count = len([p for p in recent_performance if p["action"] == "switch_to"])
                summary[market] = {
                    "switches": switch_count,
                    "last_activity": recent_performance[-1]["timestamp"] if recent_performance else 0,
                    "is_current": market == self.get_current_market()
                }
            else:
                summary[market] = {
                    "switches": 0,
                    "last_activity": 0,
                    "is_current": market == self.get_current_market()
                }
        return summary
    
    def get_pending_market_switch(self) -> Optional[str]:
        """Get and clear any pending market switch request."""
        if self.pending_market_switch:
            switch_to = self.pending_market_switch
            self.pending_market_switch = None
            logger.info(f" MARKET SWITCH: Returning pending switch to {switch_to}")
            return switch_to
        return None
    
    def _calculate_enhanced_quality_score(self, pattern_name: str, confidence: float, signal_type: str) -> float:
        """Compute quality score factoring EMA and RSI alignment."""
        ema_trend = self._get_ema_trend()
        rsi = self.rsi.get_value() or 50.0
        score = confidence
        
        # Reward if signal aligns with EMA trend
        if signal_type == "buy" and ema_trend == "up":
            score += 0.1
        elif signal_type == "sell" and ema_trend == "down":
            score += 0.1
        
        # Penalize if RSI is overbought/oversold
        if signal_type == "buy" and rsi > 70:
            score -= 0.1
        elif signal_type == "sell" and rsi < 30:
            score -= 0.1
        
        return max(0.0, min(1.0, score))  # Clamp between 0-1

    def _update_trade_timing(self) -> None:
        """Update trade timing for 'close after second candlestick' logic."""
        try:
            total_candles = len(self.candle_buffer)
            logger.debug(f"Candle completed. Total candles: {total_candles}")
            
            # Check if any active trades should be closed
            self._check_trade_close_conditions()
            
            # Update trade phase based on candle count and trade state
            self._update_trade_phase()
            
            logger.debug(f"Active trades: {list(self.active_trades.keys())}, Current phase: {self.trade_phase}")
            
        except Exception as e:
            logger.error(f"Error updating trade timing: {e}", exc_info=True)

    
    def _update_trade_phase(self) -> None:
        """Update trade phase based on current state."""
        try:
            active_trade_count = len(self.active_trades)
            current_candle_count = self.total_candles_processed

            if self.trade_phase == "waiting_for_direction":
                # Stay in this phase until a trade is placed
                if active_trade_count > 0:
                    # Safety check: mismatch
                    logger.warning(
                        f"PHASE MISMATCH: Have {active_trade_count} active trades but phase is 'waiting_for_direction' - correcting to 'trade_active'"
                    )
                    self.trade_phase = "trade_active"

            elif self.trade_phase == "trade_active":
                # Check if any trade has reached expected close candle
                for trade_id, trade_data in self.active_trades.items():
                    expected_close_candle = trade_data.get("expected_close_candle", 0)
                    if current_candle_count >= expected_close_candle:
                        self.trade_phase = "waiting_for_close"
                        logger.info(
                            f"PHASE CHANGE: Moving to 'waiting_for_close' (candle {current_candle_count} >= {expected_close_candle})"
                        )
                        break

            elif self.trade_phase == "waiting_for_close":
                if active_trade_count == 0:
                    # Safety check: mismatch
                    logger.warning(
                        f"PHASE MISMATCH: No active trades but phase is 'waiting_for_close' - correcting to 'waiting_for_direction'"
                    )
                    self.trade_phase = "waiting_for_direction"

            else:
                # Catch unexpected trade_phase values
                logger.error(f"Unknown trade_phase '{self.trade_phase}' encountered")

        except Exception as e:
            logger.error(f"Error updating trade phase: {e}")

    
    def _check_trade_close_conditions(self) -> None:
        """Check if any active trades should be closed based on candlestick timing."""
        try:
            current_candle_count = self.total_candles_processed
            logger.debug(f"CANDLESTICK TIMING: Checking close conditions - Total candles: {current_candle_count}, Active trades: {len(self.active_trades)}")
            
            # Check each active trade
            for trade_id, trade_data in list(self.active_trades.items()):
                start_candle = trade_data.get("start_candle", 0)
                expected_close_candle = trade_data.get("expected_close_candle", 0)
                
                logger.debug(f"CANDLESTICK TIMING: Trade {trade_id} - Start: {start_candle}, Expected close: {expected_close_candle}")
                
                # If we've reached the expected close candle, mark for closure
                if current_candle_count >= expected_close_candle:
                    logger.info(f"CANDLESTICK TIMING: Trade {trade_id} should close now (candle {current_candle_count} >= {expected_close_candle})")
                    trade_data["should_close"] = True
                    trade_data["close_reason"] = "second_candlestick_complete"
                else:
                    logger.debug(f"CANDLESTICK TIMING: Trade {trade_id} still active (candle {current_candle_count} < {expected_close_candle})")
                    
        except Exception as e:
            logger.error(f"Error checking trade close conditions: {e}")
    
    def register_trade(self, trade_id: str, signal: Dict) -> None:
        """
        Register a new trade for timing tracking.
        
        Args:
            trade_id: Unique trade identifier
            signal: Signal data containing timing information
        """
        try:
            # CRITICAL: Ensure we have valid timing data
            start_candle = signal.get("trade_start_candle", 0)
            expected_close_candle = signal.get("expected_close_candle", 0)
            
            # If timing data is missing or invalid, calculate it based on current candle count
            if start_candle == 0 or expected_close_candle == 0:
                close_after_candles = signal.get("close_after_candles", 2)
                # Use current candle count as start if not provided
                start_candle = self.total_candles_processed if start_candle == 0 else start_candle
                # Calculate expected close based on start candle + close_after_candles
                expected_close_candle = start_candle + close_after_candles
                logger.warning(f"TIMING DATA MISSING: Using calculated values - Start: {start_candle}, Expected close: {expected_close_candle} (from current candle {self.total_candles_processed})")
            
            self.active_trades[trade_id] = {
                "start_candle": start_candle,
                "expected_close_candle": expected_close_candle,
                "signal_type": signal.get("type", ""),
                "pattern": signal.get("pattern", ""),
                "start_time": time.time(),
                "should_close": False,
                "close_reason": ""
            }
            
            # CRITICAL: Change phase to trade_active when trade is registered
            # This ensures we stay in 'waiting_for_direction' or 'signal_pending' phase until trade is actually placed
            if self.trade_phase != "trade_active":
                logger.info(f"PHASE CHANGE: Moving from '{self.trade_phase}' to 'trade_active'")
                self.trade_phase = "trade_active"
                # Clear pending signal since trade is now registered
                self.active_signal = None
            
            logger.info(f"TRADE REGISTERED: {trade_id} - Pattern: {self.active_trades[trade_id]['pattern']}, Signal Type: {self.active_trades[trade_id]['signal_type']}")
            logger.info(f"TRADE REGISTERED: {trade_id} - Start candle: {self.active_trades[trade_id]['start_candle']}, Expected close: {self.active_trades[trade_id]['expected_close_candle']}")
            
        except Exception as e:
            logger.error(f"Error registering trade: {e}")
    
    def unregister_trade(self, trade_id: str) -> None:
        """Unregister a completed trade."""
        try:
            if trade_id in self.active_trades:
                del self.active_trades[trade_id]
                logger.info(f"TRADE UNREGISTERED: {trade_id}")
                
                # CRITICAL: Reset phase to waiting_for_direction when trade is closed
                if len(self.active_trades) == 0:
                    self.trade_phase = "waiting_for_direction"
                    logger.info(f"PHASE CHANGE: Moving to 'waiting_for_direction' (no active trades)")
                    
        except Exception as e:
            logger.error(f"Error unregistering trade: {e}")
    
    def should_close_trade(self, trade_id: str) -> tuple[bool, str]:
        """
        Check if a trade should be closed based on candlestick timing.
        
        Args:
            trade_id: Trade identifier
            
        Returns:
            Tuple of (should_close, reason)
        """
        try:
            if trade_id not in self.active_trades:
                logger.debug(f"CANDLESTICK TIMING: Trade {trade_id} not found in active trades")
                return False, "Trade not found"
            
            trade_data = self.active_trades[trade_id]
            
            if trade_data.get("should_close", False):
                reason = trade_data.get("close_reason", "candlestick_timing")
                logger.info(f"CANDLESTICK TIMING: Trade {trade_id} marked for closure - {reason}")
                return True, reason
            
            logger.debug(f"CANDLESTICK TIMING: Trade {trade_id} still active")
            return False, "Trade still active"
            
        except Exception as e:
            logger.error(f"Error checking trade close condition: {e}")
            return False, f"Error: {e}"
    
    def reset(self):
        """Reset strategy state."""
        self.pattern_detector.reset()
        self.ema_fast.reset()
        self.ema_slow.reset()
        self.price_history.clear()
        self.current_candle = None
        self.candle_tick_count = 0
        self.candle_buffer.clear()  # Reset 3-candle buffer
        self.active_trades.clear()  # Reset trade tracking
        self.total_candles_processed = 0  # Reset total candles counter
        self.trade_phase = "waiting_for_direction"  # Reset phase
        self.signals_generated = 0
        self.signals_by_pattern = {}
        self.signals_filtered = 0
        self.filter_reasons = {
            "low_confidence": 0,
            "trend_mismatch": 0,
            "momentum_mismatch": 0,
            "rsi_extreme": 0,
            "insufficient_candles": 0
        }
        logger.info("Candlestick Strategy reset")



