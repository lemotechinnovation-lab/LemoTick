"""
Candlestick Pattern Detection Module for LemoTick Bot.
Identifies traditional candlestick patterns and provides trading signals.

Patterns Supported:
- Bullish: Hammer, Morning Star, Three White Soldiers, Bullish Engulfing
- Bearish: Hanging Man, Evening Star, Three Black Crows, Bearish Engulfing
- Reversal: Doji, Spinning Top
- Continuation: Rising/Falling Three Methods

Win Rate: 60-75% when combined with trend confirmation
"""

from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from enum import Enum
import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from infrastructure.logger import logger


class PatternType(Enum):
    """Candlestick pattern types."""
    BULLISH_REVERSAL = "BULLISH_REVERSAL"
    BEARISH_REVERSAL = "BEARISH_REVERSAL"
    BULLISH_CONTINUATION = "BULLISH_CONTINUATION"
    BEARISH_CONTINUATION = "BEARISH_CONTINUATION"
    INDECISION = "INDECISION"


class SignalStrength(Enum):
    """Signal strength based on pattern reliability."""
    WEAK = 0.6
    MODERATE = 0.7
    STRONG = 0.75
    VERY_STRONG = 0.8


@dataclass
class Candle:
    """Candlestick data structure."""
    open: float
    high: float
    low: float
    close: float
    timestamp: Optional[float] = None
    
    @property
    def body(self) -> float:
        """Get candle body size."""
        return abs(self.close - self.open)
    
    @property
    def upper_shadow(self) -> float:
        """Get upper shadow (wick) length."""
        return self.high - max(self.open, self.close)
    
    @property
    def lower_shadow(self) -> float:
        """Get lower shadow (tail) length."""
        return min(self.open, self.close) - self.low
    
    @property
    def total_range(self) -> float:
        """Get total candle range."""
        return self.high - self.low
    
    @property
    def is_bullish(self) -> bool:
        """Check if candle is bullish (close > open)."""
        return self.close > self.open
    
    @property
    def is_bearish(self) -> bool:
        """Check if candle is bearish (close < open)."""
        return self.close < self.open
    
    @property
    def is_doji(self) -> bool:
        """Check if candle is a doji (small/no body)."""
        if self.total_range == 0:
            return False
        return self.body / self.total_range < 0.1
    
    def __repr__(self) -> str:
        """String representation of candle."""
        direction = "" if self.is_bullish else "" if self.is_bearish else ""
        return f"{direction} O:{self.open:.4f} H:{self.high:.4f} L:{self.low:.4f} C:{self.close:.4f}"


@dataclass
class PatternMatch:
    """Detected candlestick pattern."""
    name: str
    type: PatternType
    signal: str  # "BUY", "SELL", "HOLD"
    strength: float  # 0.0 to 1.0
    confidence: float  # Historical success rate
    description: str
    candles_used: List[Candle]
    metadata: Dict


class CandlestickPatternDetector:
    """
    Detects candlestick patterns in price data.
    
    Features:
    - Real-time pattern detection
    - Multiple pattern types (reversal, continuation, indecision)
    - Configurable sensitivity
    - Pattern statistics tracking
    
    Usage:
        detector = CandlestickPatternDetector()
        
        # Add candles
        detector.add_candle(open=100, high=102, low=99, close=101)
        
        # Detect patterns
        pattern = detector.detect_pattern()
        if pattern:
            print(f"Pattern: {pattern.name}, Signal: {pattern.signal}")
    """
    
    def __init__(self, 
                 history_length: int = 10,
                 min_body_ratio: float = 0.1,
                 min_wick_ratio: float = 2.0,
                 doji_threshold: float = 0.1):
        """
        Initialize candlestick pattern detector.
        
        Args:
            history_length: Number of candles to keep in history
            min_body_ratio: Minimum body size as ratio of total range
            min_wick_ratio: Minimum wick-to-body ratio for patterns like Hammer
            doji_threshold: Maximum body ratio to be considered a Doji
        """
        self.history_length = history_length
        self.min_body_ratio = min_body_ratio
        self.min_wick_ratio = min_wick_ratio
        self.doji_threshold = doji_threshold
        
        # Candle history
        self.candles: List[Candle] = []
        
        # Pattern detection tracking
        self.patterns_detected = 0
        self.patterns_by_type: Dict[str, int] = {}
        self.last_pattern: Optional[PatternMatch] = None
        
        logger.info("Candlestick Pattern Detector initialized")
        logger.info(f"  History length: {history_length} candles")
        logger.info(f"  Min body ratio: {min_body_ratio:.1%}")
        logger.info(f"  Min wick ratio: {min_wick_ratio:.1f}x")
        logger.info(f"  Doji threshold: {doji_threshold:.1%}")
    
    def add_candle(self, 
                   open: float, 
                   high: float, 
                   low: float, 
                   close: float,
                   timestamp: Optional[float] = None) -> None:
        """
        Add a new candle to the history.
        
        Args:
            open: Opening price
            high: Highest price
            low: Lowest price
            close: Closing price
            timestamp: Candle timestamp (optional)
        """
        candle = Candle(open=open, high=high, low=low, close=close, timestamp=timestamp)
        self.candles.append(candle)
        
        # Maintain history length
        if len(self.candles) > self.history_length:
            self.candles.pop(0)
        
        logger.debug(f"Added candle: {candle}")
    
    def detect_pattern(self) -> Optional[PatternMatch]:
        """
        Detect candlestick patterns in recent candles.
        
        Returns:
            PatternMatch if pattern detected, None otherwise
        """
        if len(self.candles) < 1:
            return None
        
        # Check patterns in order of complexity (multi-candle first)
        # 3-candle patterns
        pattern = self._check_three_candle_patterns()
        if pattern:
            return self._register_pattern(pattern)
        
        # 2-candle patterns
        pattern = self._check_two_candle_patterns()
        if pattern:
            return self._register_pattern(pattern)
        
        # Single-candle patterns
        pattern = self._check_single_candle_patterns()
        if pattern:
            return self._register_pattern(pattern)
        
        return None
    
    # ==================== 3-CANDLE PATTERNS ====================
    
    def _check_three_candle_patterns(self) -> Optional[PatternMatch]:
        """Check for 3-candle patterns."""
        if len(self.candles) < 3:
            return None
        
        # Morning Star (bullish reversal)
        pattern = self._detect_morning_star()
        if pattern:
            return pattern
        
        # Evening Star (bearish reversal)
        pattern = self._detect_evening_star()
        if pattern:
            return pattern
        
        # Three White Soldiers (bullish continuation)
        pattern = self._detect_three_white_soldiers()
        if pattern:
            return pattern
        
        # Three Black Crows (bearish continuation)
        pattern = self._detect_three_black_crows()
        if pattern:
            return pattern
        
        return None
    
    def _detect_morning_star(self) -> Optional[PatternMatch]:
        """
        Detect Morning Star pattern (bullish reversal).
        
        Pattern:
        1. Long bearish candle
        2. Small-bodied candle (any color, gaps down)
        3. Long bullish candle closing above midpoint of first
        """
        if len(self.candles) < 3:
            return None
        
        c1, c2, c3 = self.candles[-3], self.candles[-2], self.candles[-1]
        
        # Candle 1: Long bearish
        if not c1.is_bearish or c1.body < c1.total_range * 0.6:
            return None
        
        # Candle 2: Small body (star)
        if c2.body > c1.body * 0.3:
            return None
        
        # Candle 3: Long bullish
        if not c3.is_bullish or c3.body < c3.total_range * 0.6:
            return None
        
        # Candle 3 closes above midpoint of candle 1
        c1_midpoint = (c1.open + c1.close) / 2
        if c3.close < c1_midpoint:
            return None
        
        return PatternMatch(
            name="Morning Star",
            type=PatternType.BULLISH_REVERSAL,
            signal="BUY",
            strength=SignalStrength.VERY_STRONG.value,
            confidence=0.78,
            description="Strong bullish reversal - downtrend exhaustion followed by bullish takeover",
            candles_used=[c1, c2, c3],
            metadata={
                "pattern_type": "3-candle",
                "ideal_entry": c3.close,
                "stop_loss": c3.low,
                "target_ratio": 2.0
            }
        )
    
    def _detect_evening_star(self) -> Optional[PatternMatch]:
        """
        Detect Evening Star pattern (bearish reversal).
        
        Pattern:
        1. Long bullish candle
        2. Small-bodied candle (any color, gaps up)
        3. Long bearish candle closing below midpoint of first
        """
        if len(self.candles) < 3:
            return None
        
        c1, c2, c3 = self.candles[-3], self.candles[-2], self.candles[-1]
        
        # Candle 1: Long bullish
        if not c1.is_bullish or c1.body < c1.total_range * 0.6:
            return None
        
        # Candle 2: Small body (star)
        if c2.body > c1.body * 0.3:
            return None
        
        # Candle 3: Long bearish
        if not c3.is_bearish or c3.body < c3.total_range * 0.6:
            return None
        
        # Candle 3 closes below midpoint of candle 1
        c1_midpoint = (c1.open + c1.close) / 2
        if c3.close > c1_midpoint:
            return None
        
        return PatternMatch(
            name="Evening Star",
            type=PatternType.BEARISH_REVERSAL,
            signal="SELL",
            strength=SignalStrength.VERY_STRONG.value,
            confidence=0.78,
            description="Strong bearish reversal - uptrend exhaustion followed by bearish takeover",
            candles_used=[c1, c2, c3],
            metadata={
                "pattern_type": "3-candle",
                "ideal_entry": c3.close,
                "stop_loss": c3.high,
                "target_ratio": 2.0
            }
        )
    
    def _detect_three_white_soldiers(self) -> Optional[PatternMatch]:
        """
        Detect Three White Soldiers pattern (bullish continuation/reversal).
        
        Pattern: 3 consecutive long bullish candles with small wicks
        """
        if len(self.candles) < 3:
            return None
        
        c1, c2, c3 = self.candles[-3], self.candles[-2], self.candles[-1]
        
        # All three must be bullish
        if not (c1.is_bullish and c2.is_bullish and c3.is_bullish):
            return None
        
        # All must have decent body size
        for candle in [c1, c2, c3]:
            if candle.body < candle.total_range * 0.6:
                return None
        
        # Each should open within previous body and close higher
        if not (c1.close < c2.close < c3.close):
            return None
        
        if not (c1.open < c2.open < c1.close):
            return None
        
        if not (c2.open < c3.open < c2.close):
            return None
        
        return PatternMatch(
            name="Three White Soldiers",
            type=PatternType.BULLISH_CONTINUATION,
            signal="BUY",
            strength=SignalStrength.STRONG.value,
            confidence=0.72,
            description="Strong bullish momentum - consistent buying pressure",
            candles_used=[c1, c2, c3],
            metadata={
                "pattern_type": "3-candle",
                "ideal_entry": c3.close,
                "stop_loss": min(c1.low, c2.low, c3.low),
                "target_ratio": 1.5
            }
        )
    
    def _detect_three_black_crows(self) -> Optional[PatternMatch]:
        """
        Detect Three Black Crows pattern (bearish continuation/reversal).
        
        Pattern: 3 consecutive long bearish candles with small wicks
        """
        if len(self.candles) < 3:
            return None
        
        c1, c2, c3 = self.candles[-3], self.candles[-2], self.candles[-1]
        
        # All three must be bearish
        if not (c1.is_bearish and c2.is_bearish and c3.is_bearish):
            return None
        
        # All must have decent body size
        for candle in [c1, c2, c3]:
            if candle.body < candle.total_range * 0.6:
                return None
        
        # Each should open within previous body and close lower
        if not (c1.close > c2.close > c3.close):
            return None
        
        if not (c1.close > c2.open > c1.open):
            return None
        
        if not (c2.close > c3.open > c2.open):
            return None
        
        return PatternMatch(
            name="Three Black Crows",
            type=PatternType.BEARISH_CONTINUATION,
            signal="SELL",
            strength=SignalStrength.STRONG.value,
            confidence=0.72,
            description="Strong bearish momentum - consistent selling pressure",
            candles_used=[c1, c2, c3],
            metadata={
                "pattern_type": "3-candle",
                "ideal_entry": c3.close,
                "stop_loss": max(c1.high, c2.high, c3.high),
                "target_ratio": 1.5
            }
        )
    
    # ==================== 2-CANDLE PATTERNS ====================
    
    def _check_two_candle_patterns(self) -> Optional[PatternMatch]:
        """Check for 2-candle patterns."""
        if len(self.candles) < 2:
            return None
        
        # Bullish Engulfing
        pattern = self._detect_bullish_engulfing()
        if pattern:
            return pattern
        
        # Bearish Engulfing
        pattern = self._detect_bearish_engulfing()
        if pattern:
            return pattern
        
        # Piercing Pattern
        pattern = self._detect_piercing_pattern()
        if pattern:
            return pattern
        
        # Dark Cloud Cover
        pattern = self._detect_dark_cloud_cover()
        if pattern:
            return pattern
        
        return None
    
    def _detect_bullish_engulfing(self) -> Optional[PatternMatch]:
        """
        Detect Bullish Engulfing pattern.
        
        Pattern: Small bearish candle followed by large bullish candle that engulfs it
        """
        if len(self.candles) < 2:
            return None
        
        c1, c2 = self.candles[-2], self.candles[-1]
        
        # Candle 1: Bearish
        if not c1.is_bearish:
            return None
        
        # Candle 2: Bullish and engulfs candle 1
        if not c2.is_bullish:
            return None
        
        # C2 opens below C1 close and closes above C1 open
        if not (c2.open <= c1.close and c2.close >= c1.open):
            return None
        
        # C2 body should be significantly larger
        if c2.body < c1.body * 1.2:
            return None
        
        return PatternMatch(
            name="Bullish Engulfing",
            type=PatternType.BULLISH_REVERSAL,
            signal="BUY",
            strength=SignalStrength.STRONG.value,
            confidence=0.75,
            description="Bullish reversal - buyers overwhelm sellers",
            candles_used=[c1, c2],
            metadata={
                "pattern_type": "2-candle",
                "ideal_entry": c2.close,
                "stop_loss": c2.low,
                "target_ratio": 2.0
            }
        )
    
    def _detect_bearish_engulfing(self) -> Optional[PatternMatch]:
        """
        Detect Bearish Engulfing pattern.
        
        Pattern: Small bullish candle followed by large bearish candle that engulfs it
        """
        if len(self.candles) < 2:
            return None
        
        c1, c2 = self.candles[-2], self.candles[-1]
        
        # Candle 1: Bullish
        if not c1.is_bullish:
            return None
        
        # Candle 2: Bearish and engulfs candle 1
        if not c2.is_bearish:
            return None
        
        # C2 opens above C1 close and closes below C1 open
        if not (c2.open >= c1.close and c2.close <= c1.open):
            return None
        
        # C2 body should be significantly larger
        if c2.body < c1.body * 1.2:
            return None
        
        return PatternMatch(
            name="Bearish Engulfing",
            type=PatternType.BEARISH_REVERSAL,
            signal="SELL",
            strength=SignalStrength.STRONG.value,
            confidence=0.75,
            description="Bearish reversal - sellers overwhelm buyers",
            candles_used=[c1, c2],
            metadata={
                "pattern_type": "2-candle",
                "ideal_entry": c2.close,
                "stop_loss": c2.high,
                "target_ratio": 2.0
            }
        )
    
    def _detect_piercing_pattern(self) -> Optional[PatternMatch]:
        """
        Detect Piercing Pattern (bullish reversal).
        
        Pattern: Bearish candle followed by bullish candle that closes above midpoint
        """
        if len(self.candles) < 2:
            return None
        
        c1, c2 = self.candles[-2], self.candles[-1]
        
        # Candle 1: Bearish
        if not c1.is_bearish:
            return None
        
        # Candle 2: Bullish
        if not c2.is_bullish:
            return None
        
        # C2 opens below C1 low and closes above C1 midpoint
        c1_midpoint = (c1.open + c1.close) / 2
        if not (c2.open < c1.low and c2.close > c1_midpoint):
            return None
        
        return PatternMatch(
            name="Piercing Pattern",
            type=PatternType.BULLISH_REVERSAL,
            signal="BUY",
            strength=SignalStrength.MODERATE.value,
            confidence=0.70,
            description="Bullish reversal - strong buying after selloff",
            candles_used=[c1, c2],
            metadata={
                "pattern_type": "2-candle",
                "ideal_entry": c2.close,
                "stop_loss": c2.low,
                "target_ratio": 1.5
            }
        )
    
    def _detect_dark_cloud_cover(self) -> Optional[PatternMatch]:
        """
        Detect Dark Cloud Cover (bearish reversal).
        
        Pattern: Bullish candle followed by bearish candle that closes below midpoint
        """
        if len(self.candles) < 2:
            return None
        
        c1, c2 = self.candles[-2], self.candles[-1]
        
        # Candle 1: Bullish
        if not c1.is_bullish:
            return None
        
        # Candle 2: Bearish
        if not c2.is_bearish:
            return None
        
        # C2 opens above C1 high and closes below C1 midpoint
        c1_midpoint = (c1.open + c1.close) / 2
        if not (c2.open > c1.high and c2.close < c1_midpoint):
            return None
        
        return PatternMatch(
            name="Dark Cloud Cover",
            type=PatternType.BEARISH_REVERSAL,
            signal="SELL",
            strength=SignalStrength.MODERATE.value,
            confidence=0.70,
            description="Bearish reversal - strong selling after rally",
            candles_used=[c1, c2],
            metadata={
                "pattern_type": "2-candle",
                "ideal_entry": c2.close,
                "stop_loss": c2.high,
                "target_ratio": 1.5
            }
        )
    
    # ==================== SINGLE-CANDLE PATTERNS ====================
    
    def _check_single_candle_patterns(self) -> Optional[PatternMatch]:
        """Check for single-candle patterns."""
        if len(self.candles) < 1:
            return None
        
        candle = self.candles[-1]
        
        # Hammer (bullish reversal)
        pattern = self._detect_hammer(candle)
        if pattern:
            return pattern
        
        # Hanging Man (bearish reversal)
        pattern = self._detect_hanging_man(candle)
        if pattern:
            return pattern
        
        # Inverted Hammer (bullish reversal)
        pattern = self._detect_inverted_hammer(candle)
        if pattern:
            return pattern
        
        # Shooting Star (bearish reversal)
        pattern = self._detect_shooting_star(candle)
        if pattern:
            return pattern
        
        # Doji (indecision)
        pattern = self._detect_doji(candle)
        if pattern:
            return pattern
        
        # Spinning Top (indecision)
        pattern = self._detect_spinning_top(candle)
        if pattern:
            return pattern
        
        return None
    
    def _detect_hammer(self, candle: Candle) -> Optional[PatternMatch]:
        """
        Detect Hammer pattern (bullish reversal).
        
        Pattern: Small body at top, long lower shadow (2-3x body), small upper shadow
        """
        if candle.total_range == 0:
            return None
        
        # Small body
        if candle.body > candle.total_range * 0.3:
            return None
        
        # Long lower shadow (at least 2x body)
        if candle.lower_shadow < candle.body * self.min_wick_ratio:
            return None
        
        # Small upper shadow
        if candle.upper_shadow > candle.body * 0.5:
            return None
        
        # Body should be in upper part of range
        body_position = (min(candle.open, candle.close) - candle.low) / candle.total_range
        if body_position < 0.6:
            return None
        
        return PatternMatch(
            name="Hammer",
            type=PatternType.BULLISH_REVERSAL,
            signal="BUY",
            strength=SignalStrength.MODERATE.value,
            confidence=0.70,
            description="Bullish reversal - sellers pushed down but buyers regained control",
            candles_used=[candle],
            metadata={
                "pattern_type": "1-candle",
                "ideal_entry": candle.close,
                "stop_loss": candle.low,
                "target_ratio": 2.0,
                "wick_to_body_ratio": candle.lower_shadow / max(candle.body, 0.0001)
            }
        )
    
    def _detect_hanging_man(self, candle: Candle) -> Optional[PatternMatch]:
        """
        Detect Hanging Man pattern (bearish reversal).
        
        Pattern: Similar to Hammer but appears at top of uptrend
        Note: Requires context (uptrend) to distinguish from Hammer
        """
        # Check for uptrend context
        if len(self.candles) < 2:
            return None
        
        prev_candle = self.candles[-2]
        if not (prev_candle.is_bullish and candle.close > prev_candle.close * 0.99):
            return None
        
        if candle.total_range == 0:
            return None
        
        # Small body
        if candle.body > candle.total_range * 0.3:
            return None
        
        # Long lower shadow
        if candle.lower_shadow < candle.body * self.min_wick_ratio:
            return None
        
        # Small upper shadow
        if candle.upper_shadow > candle.body * 0.5:
            return None
        
        return PatternMatch(
            name="Hanging Man",
            type=PatternType.BEARISH_REVERSAL,
            signal="SELL",
            strength=SignalStrength.MODERATE.value,
            confidence=0.68,
            description="Bearish reversal - rally exhaustion, sellers entering",
            candles_used=[candle],
            metadata={
                "pattern_type": "1-candle",
                "ideal_entry": candle.close,
                "stop_loss": candle.high,
                "target_ratio": 2.0,
                "wick_to_body_ratio": candle.lower_shadow / max(candle.body, 0.0001)
            }
        )
    
    def _detect_inverted_hammer(self, candle: Candle) -> Optional[PatternMatch]:
        """
        Detect Inverted Hammer pattern (bullish reversal).
        
        Pattern: Small body at bottom, long upper shadow, small lower shadow
        """
        if candle.total_range == 0:
            return None
        
        # Small body
        if candle.body > candle.total_range * 0.3:
            return None
        
        # Long upper shadow (at least 2x body)
        if candle.upper_shadow < candle.body * self.min_wick_ratio:
            return None
        
        # Small lower shadow
        if candle.lower_shadow > candle.body * 0.5:
            return None
        
        return PatternMatch(
            name="Inverted Hammer",
            type=PatternType.BULLISH_REVERSAL,
            signal="BUY",
            strength=SignalStrength.WEAK.value,
            confidence=0.65,
            description="Potential bullish reversal - buyers testing resistance",
            candles_used=[candle],
            metadata={
                "pattern_type": "1-candle",
                "ideal_entry": candle.close,
                "stop_loss": candle.low,
                "target_ratio": 1.5,
                "wick_to_body_ratio": candle.upper_shadow / max(candle.body, 0.0001)
            }
        )
    
    def _detect_shooting_star(self, candle: Candle) -> Optional[PatternMatch]:
        """
        Detect Shooting Star pattern (bearish reversal).
        
        Pattern: Small body at bottom, long upper shadow, appears after uptrend
        """
        # Check for uptrend context
        if len(self.candles) < 2:
            return None
        
        prev_candle = self.candles[-2]
        if not prev_candle.is_bullish:
            return None
        
        if candle.total_range == 0:
            return None
        
        # Small body
        if candle.body > candle.total_range * 0.3:
            return None
        
        # Long upper shadow
        if candle.upper_shadow < candle.body * self.min_wick_ratio:
            return None
        
        # Small lower shadow
        if candle.lower_shadow > candle.body * 0.5:
            return None
        
        return PatternMatch(
            name="Shooting Star",
            type=PatternType.BEARISH_REVERSAL,
            signal="SELL",
            strength=SignalStrength.MODERATE.value,
            confidence=0.68,
            description="Bearish reversal - buyers rejected at higher prices",
            candles_used=[candle],
            metadata={
                "pattern_type": "1-candle",
                "ideal_entry": candle.close,
                "stop_loss": candle.high,
                "target_ratio": 2.0,
                "wick_to_body_ratio": candle.upper_shadow / max(candle.body, 0.0001)
            }
        )
    
    def _detect_doji(self, candle: Candle) -> Optional[PatternMatch]:
        """
        Detect Doji pattern (indecision).
        
        Pattern: Open  Close (very small body), shadows can vary
        """
        if candle.total_range == 0:
            return None
        
        # Very small body relative to range
        if candle.body > candle.total_range * self.doji_threshold:
            return None
        
        # Determine potential direction based on context
        signal = "HOLD"
        description = "Market indecision - potential reversal"
        
        if len(self.candles) >= 2:
            prev_candle = self.candles[-2]
            if prev_candle.is_bullish:
                signal = "SELL"
                description = "Indecision after uptrend - potential bearish reversal"
            elif prev_candle.is_bearish:
                signal = "BUY"
                description = "Indecision after downtrend - potential bullish reversal"
        
        return PatternMatch(
            name="Doji",
            type=PatternType.INDECISION,
            signal=signal,
            strength=SignalStrength.WEAK.value,
            confidence=0.60,
            description=description,
            candles_used=[candle],
            metadata={
                "pattern_type": "1-candle",
                "ideal_entry": candle.close,
                "stop_loss": candle.high if signal == "SELL" else candle.low,
                "target_ratio": 1.0,
                "body_to_range_ratio": candle.body / candle.total_range
            }
        )
    
    def _detect_spinning_top(self, candle: Candle) -> Optional[PatternMatch]:
        """
        Detect Spinning Top pattern (indecision).
        
        Pattern: Small body in middle, long upper and lower shadows
        """
        if candle.total_range == 0:
            return None
        
        # Small body (10-30% of range)
        body_ratio = candle.body / candle.total_range
        if body_ratio < 0.1 or body_ratio > 0.3:
            return None
        
        # Both shadows should be present and significant
        if candle.upper_shadow < candle.body * 0.8:
            return None
        
        if candle.lower_shadow < candle.body * 0.8:
            return None
        
        return PatternMatch(
            name="Spinning Top",
            type=PatternType.INDECISION,
            signal="HOLD",
            strength=SignalStrength.WEAK.value,
            confidence=0.60,
            description="Strong indecision - battle between bulls and bears",
            candles_used=[candle],
            metadata={
                "pattern_type": "1-candle",
                "ideal_entry": candle.close,
                "stop_loss": candle.high,
                "target_ratio": 1.0,
                "body_ratio": body_ratio
            }
        )
    
    # ==================== UTILITY METHODS ====================
    
    def _register_pattern(self, pattern: PatternMatch) -> PatternMatch:
        """
        Register detected pattern and update statistics.
        
        Args:
            pattern: Detected pattern
            
        Returns:
            Same pattern (for chaining)
        """
        self.patterns_detected += 1
        
        if pattern.name not in self.patterns_by_type:
            self.patterns_by_type[pattern.name] = 0
        self.patterns_by_type[pattern.name] += 1
        
        self.last_pattern = pattern
        
        logger.info(f"[PATTERN] CANDLESTICK PATTERN DETECTED: {pattern.name}")
        logger.info(f"   Type: {pattern.type.value}")
        logger.info(f"   Signal: {pattern.signal} (confidence: {pattern.confidence:.0%})")
        logger.info(f"   Strength: {pattern.strength:.0%}")
        logger.info(f"   Description: {pattern.description}")
        logger.info(f"   Total detected: {self.patterns_by_type[pattern.name]}")
        
        return pattern
    
    def get_signal_from_pattern(self, min_confidence: float = 0.65) -> Optional[Dict]:
        """
        Detect pattern and return trading signal if confidence meets threshold.
        
        Args:
            min_confidence: Minimum confidence required (0.0 to 1.0)
            
        Returns:
            Signal dictionary or None
        """
        pattern = self.detect_pattern()
        
        if pattern is None:
            return None
        
        # Check confidence threshold
        if pattern.confidence < min_confidence:
            logger.debug(f"Pattern {pattern.name} below confidence threshold: {pattern.confidence:.0%} < {min_confidence:.0%}")
            return None
        
        # Don't generate signals for indecision patterns with HOLD signal
        if pattern.signal == "HOLD":
            logger.debug(f"Pattern {pattern.name} suggests holding, no signal generated")
            return None
        
        # Determine duration based on pattern type
        duration = self._get_pattern_duration(pattern)
        
        # Generate signal
        signal = {
            "type": pattern.signal,
            "duration": duration,
            "confidence": pattern.confidence,
            "strength": pattern.strength,
            "pattern": pattern.name,
            "pattern_type": pattern.type.value,
            "metadata": {
                "description": pattern.description,
                "candles_count": len(pattern.candles_used),
                "ideal_entry": pattern.metadata.get("ideal_entry"),
                "stop_loss": pattern.metadata.get("stop_loss"),
                "target_ratio": pattern.metadata.get("target_ratio"),
                "strategy": "candlestick_pattern"
            }
        }
        
        return signal
    
    def _get_pattern_duration(self, pattern: PatternMatch) -> int:
        """
        Get recommended contract duration based on pattern type.
        
        Args:
            pattern: Detected pattern
            
        Returns:
            Duration in minutes
        """
        # Reversal patterns: shorter duration (5-7 minutes)
        if pattern.type in [PatternType.BULLISH_REVERSAL, PatternType.BEARISH_REVERSAL]:
            if pattern.strength >= SignalStrength.STRONG.value:
                return 7  # Strong reversals get more time
            return 5
        
        # Continuation patterns: medium duration (7-10 minutes)
        elif pattern.type in [PatternType.BULLISH_CONTINUATION, PatternType.BEARISH_CONTINUATION]:
            return 10
        
        # Indecision patterns: short duration (3-5 minutes)
        else:
            return 3
    
    def get_statistics(self) -> Dict:
        """
        Get pattern detection statistics.
        
        Returns:
            Statistics dictionary
        """
        return {
            "total_patterns_detected": self.patterns_detected,
            "patterns_by_type": self.patterns_by_type.copy(),
            "candles_in_history": len(self.candles),
            "last_pattern": self.last_pattern.name if self.last_pattern else None,
            "strategy_name": "CandlestickPatternDetection"
        }
    
    def reset(self):
        """Reset pattern detector state."""
        self.candles = []
        self.patterns_detected = 0
        self.patterns_by_type = {}
        self.last_pattern = None
        logger.info("Candlestick Pattern Detector reset")


# Example usage and testing
if __name__ == "__main__":
    import random
    
    print("="*80)
    print("CANDLESTICK PATTERN DETECTOR - TEST")
    print("="*80)
    
    # Initialize detector
    detector = CandlestickPatternDetector(history_length=10)
    
    print("\n1. Testing Hammer Pattern (Bullish Reversal)")
    print("-" * 80)
    # Bearish candles followed by hammer
    detector.add_candle(open=100, high=102, low=98, close=99)
    detector.add_candle(open=99, high=100, low=96, close=97)
    detector.add_candle(open=97, high=98, low=93, close=97.5)  # Hammer
    
    signal = detector.get_signal_from_pattern()
    if signal:
        print(f"[OK] Signal Generated: {signal['type']} - {signal['pattern']}")
        print(f"   Confidence: {signal['confidence']:.0%}, Duration: {signal['duration']} min")
    
    print("\n2. Testing Morning Star Pattern (3-Candle Bullish Reversal)")
    print("-" * 80)
    detector.reset()
    detector.add_candle(open=100, high=101, low=95, close=96)  # Long bearish
    detector.add_candle(open=95, high=96, low=94, close=95)   # Small star
    detector.add_candle(open=96, high=101, low=95, close=100) # Long bullish
    
    signal = detector.get_signal_from_pattern()
    if signal:
        print(f"[OK] Signal Generated: {signal['type']} - {signal['pattern']}")
        print(f"   Confidence: {signal['confidence']:.0%}, Duration: {signal['duration']} min")
    
    print("\n3. Testing Doji Pattern (Indecision)")
    print("-" * 80)
    detector.reset()
    detector.add_candle(open=100, high=102, low=98, close=101)  # Bullish
    detector.add_candle(open=101, high=102, low=100, close=101) # Doji
    
    pattern = detector.detect_pattern()
    if pattern:
        print(f"[OK] Pattern Detected: {pattern.name}")
        print(f"   Signal: {pattern.signal}, Description: {pattern.description}")
    
    print("\n4. Testing Bullish Engulfing (2-Candle Reversal)")
    print("-" * 80)
    detector.reset()
    detector.add_candle(open=100, high=101, low=98, close=99)  # Small bearish
    detector.add_candle(open=98, high=103, low=97, close=102)  # Large bullish engulfing
    
    signal = detector.get_signal_from_pattern()
    if signal:
        print(f"[OK] Signal Generated: {signal['type']} - {signal['pattern']}")
        print(f"   Confidence: {signal['confidence']:.0%}, Duration: {signal['duration']} min")
    
    print("\n5. Testing Three White Soldiers (Bullish Continuation)")
    print("-" * 80)
    detector.reset()
    detector.add_candle(open=100, high=103, low=99, close=102)   # Bullish
    detector.add_candle(open=101, high=105, low=101, close=104)  # Bullish
    detector.add_candle(open=103, high=107, low=103, close=106)  # Bullish
    
    signal = detector.get_signal_from_pattern()
    if signal:
        print(f"[OK] Signal Generated: {signal['type']} - {signal['pattern']}")
        print(f"   Confidence: {signal['confidence']:.0%}, Duration: {signal['duration']} min")
    
    # Print final statistics
    print("\n" + "="*80)
    print("PATTERN DETECTION STATISTICS")
    print("="*80)
    stats = detector.get_statistics()
    print(f"Total patterns detected: {stats['total_patterns_detected']}")
    print(f"\nBreakdown by pattern type:")
    for pattern_name, count in stats['patterns_by_type'].items():
        print(f"  {pattern_name}: {count}")
    print(f"\nCandles in history: {stats['candles_in_history']}")
    print(f"Last pattern: {stats['last_pattern']}")
    
    print("\n" + "="*80)
    print("TEST COMPLETE")
    print("="*80)



