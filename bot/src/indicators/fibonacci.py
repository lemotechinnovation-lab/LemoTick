"""
Fibonacci retracements and extensions indicator for LemoTick bot.
Implements key Fibonacci levels for better trade entry/exit timing.
"""

from typing import Dict, List, Optional, Tuple, Any
from infrastructure.logger import logger


class FibonacciLevels:
    """
    Fibonacci retracements and extensions calculator.
    
    Key levels:
    - Retracements: 23.6%, 38.2%, 50%, 61.8%, 78.6%
    - Extensions: 127.2%, 161.8%, 200%, 261.8%
    """
    
    def __init__(self, lookback_period: int = 50):
        """
        Initialize Fibonacci calculator.
        
        Args:
            lookback_period: Number of candles to look back for swing high/low
        """
        self.lookback_period = lookback_period
        self.price_history = []
        
        # Standard Fibonacci levels
        self.retracement_levels = [0.0, 0.236, 0.382, 0.5, 0.618, 0.786, 1.0]
        self.extension_levels = [1.272, 1.618, 2.0, 2.618]
        
        # Current swing high/low
        self.swing_high = None
        self.swing_low = None
        self.swing_high_time = None
        self.swing_low_time = None
        
        logger.info(f"Fibonacci levels initialized with {lookback_period} candle lookback")
    
    def update(self, price: float, timestamp: int) -> Dict[str, float]:
        """
        Update Fibonacci levels with new price data.
        
        Args:
            price: Current price
            timestamp: Current timestamp
            
        Returns:
            Dictionary with Fibonacci levels and current position
        """
        self.price_history.append({"price": price, "timestamp": timestamp})
        
        # Keep only recent history
        if len(self.price_history) > self.lookback_period:
            self.price_history = self.price_history[-self.lookback_period:]
        
        # Update swing high/low
        self._update_swing_levels()
        
        # Calculate current Fibonacci levels
        return self._calculate_levels()
    
    def _update_swing_levels(self):
        """Update swing high and low points."""
        if len(self.price_history) < 10:  # Need minimum data
            return
        
        # Find swing high (highest point in recent period)
        recent_prices = [p["price"] for p in self.price_history[-20:]]  # Last 20 candles
        current_high = max(recent_prices)
        current_low = min(recent_prices)
        
        # Update swing high if we have a new high
        if self.swing_high is None or current_high > self.swing_high:
            self.swing_high = current_high
            self.swing_high_time = self.price_history[-1]["timestamp"]
        
        # Update swing low if we have a new low
        if self.swing_low is None or current_low < self.swing_low:
            self.swing_low = current_low
            self.swing_low_time = self.price_history[-1]["timestamp"]
    
    def _calculate_levels(self) -> Dict[str, Any]:
        """
        Calculate Fibonacci retracement and extension levels.
        
        Returns:
            Dictionary with all Fibonacci levels
        """
        if self.swing_high is None or self.swing_low is None:
            return {"error": "Insufficient data for Fibonacci calculation"}
        
        # Calculate price range
        price_range = self.swing_high - self.swing_low
        
        if price_range <= 0:
            return {"error": "No price range for Fibonacci calculation"}
        
        levels = {}
        
        # Calculate retracement levels (from swing high to swing low)
        for level in self.retracement_levels:
            retracement_price = self.swing_high - (price_range * level)
            levels[f"retracement_{level:.3f}"] = retracement_price
        
        # Calculate extension levels (beyond swing low)
        for level in self.extension_levels:
            extension_price = self.swing_high - (price_range * level)
            levels[f"extension_{level:.3f}"] = extension_price
        
        # Add current swing levels
        levels["swing_high"] = self.swing_high
        levels["swing_low"] = self.swing_low
        levels["price_range"] = price_range
        
        return levels
    
    def get_signal(self, current_price: float) -> Optional[Dict]:
        """
        Get trading signal based on Fibonacci levels.
        
        Args:
            current_price: Current market price
            
        Returns:
            Signal dictionary or None
        """
        if self.swing_high is None or self.swing_low is None:
            return None
        
        levels = self._calculate_levels()
        if "error" in levels:
            return None
        
        # Check if price is near key Fibonacci levels (AGGRESSIVE)
        tolerance = 0.002  # INCREASED to 0.2% tolerance for more signals
        
        # Key retracement levels for trading (MORE LEVELS)
        key_levels = {
            "retracement_0.382": "BUY",    # 38.2% retracement - strong support
            "retracement_0.618": "BUY",    # 61.8% retracement - golden ratio
            "retracement_0.236": "BUY",    # CHANGED: 23.6% retracement - also support
            "retracement_0.786": "SELL",   # 78.6% retracement - strong resistance
            "retracement_0.5": "BUY",      # ADDED: 50% retracement - neutral support
        }
        
        for level_name, signal_type in key_levels.items():
            if level_name in levels:
                level_price = levels[level_name]
                
                # Check if current price is near this level
                if abs(current_price - level_price) <= tolerance:
                    confidence = self._calculate_level_confidence(level_name, current_price)
                    
                    return {
                        "type": signal_type,
                        "level": level_name,
                        "level_price": level_price,
                        "confidence": confidence,
                        "reason": f"Price near {level_name} level"
                    }
        
        return None
    
    def _calculate_level_confidence(self, level_name: str, current_price: float) -> float:
        """
        Calculate confidence based on Fibonacci level strength.
        
        Args:
            level_name: Name of the Fibonacci level
            current_price: Current market price
            
        Returns:
            Confidence score (0.0 to 1.0)
        """
        # Base confidence by level strength (REDUCED for more signals)
        level_strength = {
            "retracement_0.382": 0.65,  # REDUCED from 0.75
            "retracement_0.618": 0.70,  # REDUCED from 0.80
            "retracement_0.236": 0.55,  # REDUCED from 0.60
            "retracement_0.786": 0.60,  # REDUCED from 0.70
            "retracement_0.5": 0.50,    # ADDED: 50% level
        }
        
        base_confidence = level_strength.get(level_name, 0.5)
        
        # Adjust confidence based on how close we are to the level
        if self.swing_high and self.swing_low:
            price_range = self.swing_high - self.swing_low
            if price_range > 0:
                level_price = self._calculate_levels()[level_name]
                distance_pct = abs(current_price - level_price) / price_range
                
                # Closer to level = higher confidence
                distance_factor = max(0.1, 1.0 - (distance_pct * 10))
                return min(0.95, base_confidence * distance_factor)
        
        return base_confidence
    
    def get_level_distance(self, current_price: float) -> Dict[str, float]:
        """
        Get distance to nearest Fibonacci levels.
        
        Args:
            current_price: Current market price
            
        Returns:
            Dictionary with distances to key levels
        """
        levels = self._calculate_levels()
        if "error" in levels:
            return {}
        
        distances = {}
        key_levels = ["retracement_0.382", "retracement_0.618", "retracement_0.236", "retracement_0.786"]
        
        for level_name in key_levels:
            if level_name in levels:
                level_price = levels[level_name]
                distance = abs(current_price - level_price)
                distance_pct = (distance / current_price) * 100
                distances[level_name] = {
                    "price": level_price,
                    "distance": distance,
                    "distance_pct": distance_pct
                }
        
        return distances
    
    def is_near_level(self, current_price: float, tolerance_pct: float = 0.1) -> Optional[str]:
        """
        Check if current price is near any Fibonacci level.
        
        Args:
            current_price: Current market price
            tolerance_pct: Tolerance percentage (default 0.1%)
            
        Returns:
            Level name if near, None otherwise
        """
        distances = self.get_level_distance(current_price)
        
        for level_name, data in distances.items():
            if isinstance(data, dict) and data["distance_pct"] <= tolerance_pct:
                return level_name
        
        return None
    
    def get_trend_context(self) -> str:
        """
        Get overall trend context based on Fibonacci levels.
        
        Returns:
            "BULLISH", "BEARISH", or "NEUTRAL"
        """
        if self.swing_high is None or self.swing_low is None:
            return "NEUTRAL"
        
        # Simple trend determination based on recent price action
        if len(self.price_history) >= 5:
            recent_prices = [p["price"] for p in self.price_history[-5:]]
            if recent_prices[-1] > recent_prices[0]:
                return "BULLISH"
            elif recent_prices[-1] < recent_prices[0]:
                return "BEARISH"
        
        return "NEUTRAL"


class FibonacciConfluence:
    """
    Fibonacci confluence analyzer for multiple timeframes.
    """
    
    def __init__(self):
        """Initialize confluence analyzer."""
        self.timeframes = {
            "1m": FibonacciLevels(lookback_period=20),
            "5m": FibonacciLevels(lookback_period=50),
            "15m": FibonacciLevels(lookback_period=100)
        }
    
    def update(self, price: float, timestamp: int) -> Dict[str, Any]:
        """
        Update all timeframes with new price data.
        
        Args:
            price: Current price
            timestamp: Current timestamp
            
        Returns:
            Confluence analysis results
        """
        confluence_data = {}
        
        for timeframe, fib_calc in self.timeframes.items():
            confluence_data[timeframe] = fib_calc.update(price, timestamp)
        
        return confluence_data
    
    def get_confluence_signal(self, current_price: float) -> Optional[Dict]:
        """
        Get signal based on Fibonacci confluence across timeframes.
        
        Args:
            current_price: Current market price
            
        Returns:
            Confluence signal or None
        """
        confluence_score = 0
        signals = []
        
        for timeframe, fib_calc in self.timeframes.items():
            signal = fib_calc.get_signal(current_price)
            if signal:
                confluence_score += 1
                signals.append({
                    "timeframe": timeframe,
                    "signal": signal["type"],
                    "level": signal["level"],
                    "confidence": signal["confidence"]
                })
        
        if confluence_score >= 2:  # At least 2 timeframes agree
            # Calculate overall confidence
            avg_confidence = sum(s["confidence"] for s in signals) / len(signals)
            
            # Determine dominant signal
            buy_signals = sum(1 for s in signals if s["signal"] == "BUY")
            sell_signals = sum(1 for s in signals if s["signal"] == "SELL")
            
            if buy_signals > sell_signals:
                dominant_signal = "BUY"
            elif sell_signals > buy_signals:
                dominant_signal = "SELL"
            else:
                return None  # Conflicting signals
            
            return {
                "type": dominant_signal,
                "confluence_score": confluence_score,
                "confidence": avg_confidence,
                "timeframes": signals,
                "reason": f"Fibonacci confluence across {confluence_score} timeframes"
            }
        
        return None


