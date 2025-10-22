"""
Market selection system for Deriv Rise/Fall contracts.
Ranks and selects optimal markets based on volatility, predictability, and bot suitability.
"""

import time
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
from enum import Enum
import json
from .config import config
from .logger import logger


class MarketCategory(Enum):
    """Market categories for organization."""

    SYNTHETIC_INDICES = "synthetic_indices"
    FOREX_MAJORS = "forex_majors"
    FOREX_MINORS = "forex_minors"
    COMMODITIES = "commodities"
    CRYPTOCURRENCIES = "cryptocurrencies"
    INDICES = "indices"


@dataclass
class MarketInfo:
    """Information about a trading market."""

    symbol: str
    name: str
    category: MarketCategory
    description: str

    # Volatility metrics (1 = average, higher = more volatile)
    volatility_level: float

    # Predictability (1 = very predictable, 0 = unpredictable)
    predictability_score: float

    # Liquidity score (1 = excellent liquidity, 0 = poor)
    liquidity_score: float

    # Overall bot suitability for 1-5 min Rise/Fall (1 = excellent, 0 = poor)
    bot_suitability_score: float

    # Recommended contract durations in minutes
    recommended_durations: List[int]

    # Pros and cons
    pros: List[str]
    cons: List[str]

    # Trading hours (24/7 for most synthetics, market hours for others)
    trading_hours: str

    # Risk level (1 = low risk, 5 = very high risk)
    risk_level: int


class MarketSelector:
    """Market selection system for optimal Rise/Fall trading."""

    def __init__(self):
        """Initialize market selector with comprehensive market database."""
        self.markets = self._initialize_market_database()
        self.current_market = None
        self.market_rotation_enabled = config.get("strategy.market_rotation_enabled", True)
        self.market_switch_threshold = config.get("strategy.market_switch_threshold", 0.1)  # Switch if performance drops by 10%

        # Performance tracking per market
        self.market_performance = {}

        logger.info(f"Market selector initialized with {len(self.markets)} markets")

    def _initialize_market_database(self) -> Dict[str, MarketInfo]:
        """
        Initialize comprehensive database of Deriv markets for Rise/Fall contracts.

        Returns:
            Dictionary of market symbol -> MarketInfo
        """
        markets = {}

        # === SYNTHETIC INDICES (Best for bots) ===
        # R_100 - Most balanced for 1-5 min trades
        markets["R_100"] = MarketInfo(
            symbol="R_100",
            name="Volatility 100 Index",
            category=MarketCategory.SYNTHETIC_INDICES,
            description="Algorithmic index with moderate volatility, perfect for 1-5 minute Rise/Fall",
            volatility_level=1.0,  # Baseline
            predictability_score=0.95,  # Very predictable algorithmic movement
            liquidity_score=1.0,  # Excellent liquidity, no slippage
            bot_suitability_score=0.98,  # Near perfect for bots
            recommended_durations=[1, 2, 3, 5],
            pros=[
                "24/7 availability",
                "Predictable algorithmic price movement",
                "No real-world news impact",
                "Smooth volatility patterns",
                "High liquidity, no slippage",
                "Perfect for EMA + MACD strategies"
            ],
            cons=[
                "Less 'trendy' than forex/crypto",
                "May feel artificial to manual traders"
            ],
            trading_hours="24/7",
            risk_level=1  # Very low risk for bots
        )

        # R_75 - High volatility, good for shorter timeframes
        markets["R_75"] = MarketInfo(
            symbol="R_75",
            name="Volatility 75 Index",
            category=MarketCategory.SYNTHETIC_INDICES,
            description="Higher volatility synthetic index, excellent for 1-minute scalping",
            volatility_level=1.2,  # Higher than R_100
            predictability_score=0.92,
            liquidity_score=1.0,
            bot_suitability_score=0.95,
            recommended_durations=[1, 2, 3],
            pros=[
                "24/7 availability",
                "Higher volatility for more signals",
                "Very predictable patterns",
                "Excellent for ultra-fast 1-minute strategies",
                "No slippage issues"
            ],
            cons=[
                "May be too volatile for longer durations",
                "Requires faster signal processing"
            ],
            trading_hours="24/7",
            risk_level=2
        )

        # R_50 - Smoother, more predictable
        markets["R_50"] = MarketInfo(
            symbol="R_50",
            name="Volatility 50 Index",
            category=MarketCategory.SYNTHETIC_INDICES,
            description="Smoother synthetic index, ideal for 3-5 minute contracts",
            volatility_level=0.8,  # Lower than R_100
            predictability_score=0.96,
            liquidity_score=1.0,
            bot_suitability_score=0.94,
            recommended_durations=[3, 5, 10],
            pros=[
                "24/7 availability",
                "Very smooth, predictable trends",
                "Lower volatility reduces noise",
                "Perfect for longer 1-5 min contracts",
                "Excellent signal-to-noise ratio"
            ],
            cons=[
                "Fewer signals than higher volatility indices",
                "May be too slow for ultra-fast scalping"
            ],
            trading_hours="24/7",
            risk_level=1
        )

        # R_25 - Very smooth, ultra-low volatility
        markets["R_25"] = MarketInfo(
            symbol="R_25",
            name="Volatility 25 Index",
            category=MarketCategory.SYNTHETIC_INDICES,
            description="Ultra-smooth synthetic index, best for very short timeframes",
            volatility_level=0.6,
            predictability_score=0.97,
            liquidity_score=1.0,
            bot_suitability_score=0.90,
            recommended_durations=[1, 2, 3],
            pros=[
                "24/7 availability",
                "Extremely smooth price movement",
                "Highest predictability",
                "Perfect for noise-sensitive strategies",
                "Minimal false signals"
            ],
            cons=[
                "Very few trading opportunities",
                "May be too slow for active trading",
                "Smaller price movements"
            ],
            trading_hours="24/7",
            risk_level=1
        )

        # R_200 - Ultra high volatility (use with caution)
        markets["R_200"] = MarketInfo(
            symbol="R_200",
            name="Volatility 200 Index",
            category=MarketCategory.SYNTHETIC_INDICES,
            description="Ultra-high volatility synthetic index for experienced bots only",
            volatility_level=2.0,
            predictability_score=0.85,
            liquidity_score=0.95,
            bot_suitability_score=0.75,  # Risky for most bots
            recommended_durations=[1, 2],
            pros=[
                "24/7 availability",
                "High frequency of signals",
                "Large price movements",
                "Good for testing signal accuracy"
            ],
            cons=[
                "Very high volatility increases risk",
                "May generate too many false signals",
                "Requires robust risk management",
                "Not suitable for most strategies"
            ],
            trading_hours="24/7",
            risk_level=4
        )

        # === FOREX MAJORS (Good alternatives) ===
        # EUR/USD - Most liquid forex pair
        markets["frxEURUSD"] = MarketInfo(
            symbol="frxEURUSD",
            name="EUR/USD",
            category=MarketCategory.FOREX_MAJORS,
            description="Most liquid forex pair, good for trend-following strategies",
            volatility_level=0.7,
            predictability_score=0.75,
            liquidity_score=1.0,
            bot_suitability_score=0.80,
            recommended_durations=[5, 10, 15],
            pros=[
                "Highest liquidity in forex",
                "Well-defined trends",
                "Tight spreads",
                "Good for news-neutral windows"
            ],
            cons=[
                "News spikes can hit SL/TP",
                "Market hours only (not 24/7)",
                "Weekend gaps",
                "Central bank announcements affect price"
            ],
            trading_hours="24/5 (closed weekends)",
            risk_level=2
        )

        # GBP/USD - Higher volatility than EUR/USD
        markets["frxGBPUSD"] = MarketInfo(
            symbol="frxGBPUSD",
            name="GBP/USD",
            category=MarketCategory.FOREX_MAJORS,
            description="British Pound vs USD, higher volatility than EUR/USD",
            volatility_level=0.9,
            predictability_score=0.70,
            liquidity_score=0.95,
            bot_suitability_score=0.75,
            recommended_durations=[5, 10, 15],
            pros=[
                "Higher volatility provides more signals",
                "Strong trends during London session",
                "Good liquidity"
            ],
            cons=[
                "Very sensitive to UK news/events",
                "Large gaps on weekends",
                "Unpredictable during major announcements",
                "Market hours only"
            ],
            trading_hours="24/5 (closed weekends)",
            risk_level=3
        )

        # USD/JPY - Popular safe haven pair
        markets["frxUSDJPY"] = MarketInfo(
            symbol="frxUSDJPY",
            name="USD/JPY",
            category=MarketCategory.FOREX_MAJORS,
            description="US Dollar vs Japanese Yen, popular safe haven pair",
            volatility_level=0.8,
            predictability_score=0.72,
            liquidity_score=0.90,
            bot_suitability_score=0.70,
            recommended_durations=[5, 10, 15],
            pros=[
                "Good liquidity",
                "Often trends well",
                "Lower sensitivity to some news"
            ],
            cons=[
                "Bank of Japan interventions",
                "Market hours differences",
                "Weekend gaps",
                "Less volatile than GBP/USD"
            ],
            trading_hours="24/5 (closed weekends)",
            risk_level=2
        )

        # === COMMODITIES (For experienced traders) ===
        # Gold (XAU/USD)
        markets["frxXAUUSD"] = MarketInfo(
            symbol="frxXAUUSD",
            name="Gold (XAU/USD)",
            category=MarketCategory.COMMODITIES,
            description="Gold vs USD, strong momentum in intraday sessions",
            volatility_level=1.1,
            predictability_score=0.65,
            liquidity_score=0.85,
            bot_suitability_score=0.60,  # Risky for short timeframes
            recommended_durations=[10, 15, 30],
            pros=[
                "Strong momentum during active sessions",
                "Good liquidity",
                "Safe haven asset with clear trends"
            ],
            cons=[
                "High volatility during global events",
                "Gaps due to news/geopolitical events",
                "Market hours only",
                "Requires careful SL adjustment",
                "Not ideal for 1-5 minute trades"
            ],
            trading_hours="24/5 (closed weekends)",
            risk_level=4
        )

        # Crude Oil (WTI)
        markets["frxWTICOUSD"] = MarketInfo(
            symbol="frxWTICOUSD",
            name="WTI Crude Oil",
            category=MarketCategory.COMMODITIES,
            description="West Texas Intermediate Crude Oil, very volatile commodity",
            volatility_level=1.8,
            predictability_score=0.55,
            liquidity_score=0.80,
            bot_suitability_score=0.45,  # Too volatile for most bots
            recommended_durations=[15, 30, 60],
            pros=[
                "High volatility provides opportunities",
                "Strong trends during active hours"
            ],
            cons=[
                "Extremely volatile",
                "Major gaps from global events",
                "OPEC decisions cause massive moves",
                "Market hours only",
                "Not suitable for short timeframes",
                "High risk of large losses"
            ],
            trading_hours="24/5 (closed weekends)",
            risk_level=5
        )

        # === CRYPTOCURRENCIES (Very high risk) ===
        # Bitcoin (BTC/USD)
        markets["frxBTCUSD"] = MarketInfo(
            symbol="frxBTCUSD",
            name="Bitcoin (BTC/USD)",
            category=MarketCategory.CRYPTOCURRENCIES,
            description="Bitcoin vs USD, extremely volatile cryptocurrency",
            volatility_level=3.0,  # Extremely volatile
            predictability_score=0.35,  # Very unpredictable
            liquidity_score=0.75,
            bot_suitability_score=0.25,  # Not suitable for most bots
            recommended_durations=[60, 120, 240],  # Longer timeframes only
            pros=[
                "Large price swings",
                "High profit potential",
                "24/7 trading"
            ],
            cons=[
                "Extremely volatile and unpredictable",
                "Massive price gaps",
                "Regulatory news causes huge moves",
                "Market manipulation concerns",
                "Not suitable for short-term Rise/Fall",
                "High risk of total loss"
            ],
            trading_hours="24/7",
            risk_level=5
        )

        # Ethereum (ETH/USD)
        markets["frxETHUSD"] = MarketInfo(
            symbol="frxETHUSD",
            name="Ethereum (ETH/USD)",
            category=MarketCategory.CRYPTOCURRENCIES,
            description="Ethereum vs USD, volatile altcoin",
            volatility_level=2.5,
            predictability_score=0.40,
            liquidity_score=0.70,
            bot_suitability_score=0.30,
            recommended_durations=[60, 120],
            pros=[
                "Large price movements",
                "24/7 trading",
                "Growing market"
            ],
            cons=[
                "Even more volatile than Bitcoin",
                "Regulatory uncertainty",
                "Tech issues can cause crashes",
                "Not suitable for short timeframes",
                "High manipulation risk"
            ],
            trading_hours="24/7",
            risk_level=5
        )

        return markets

    def get_market_ranking(self, timeframe_minutes: int = 1) -> List[Tuple[str, MarketInfo, float]]:
        """
        Get ranked list of markets for a specific timeframe.

        Args:
            timeframe_minutes: Contract duration in minutes

        Returns:
            List of (symbol, market_info, score) sorted by suitability
        """
        scored_markets = []

        for symbol, market in self.markets.items():
            # Base score from bot suitability
            score = market.bot_suitability_score

            # Adjust for timeframe compatibility
            if timeframe_minutes in market.recommended_durations:
                score *= 1.2  # Bonus for recommended duration
            elif timeframe_minutes < min(market.recommended_durations):
                score *= 0.7  # Penalty for too short
            elif timeframe_minutes > max(market.recommended_durations):
                score *= 0.8  # Penalty for too long

            # Consider current market conditions (simplified)
            # In a real implementation, this would check actual market data

            scored_markets.append((symbol, market, score))

        # Sort by score (highest first)
        scored_markets.sort(key=lambda x: x[2], reverse=True)

        return scored_markets

    def select_optimal_market(self, timeframe_minutes: int = 1) -> str:
        """
        Select the optimal market for current conditions.

        Args:
            timeframe_minutes: Contract duration in minutes

        Returns:
            Symbol of selected market
        """
        ranking = self.get_market_ranking(timeframe_minutes)

        if not ranking:
            logger.warning("No markets available for selection")
            return "R_100"  # Fallback

        best_symbol, best_market, best_score = ranking[0]

        logger.info(f"Selected market {best_symbol} with score {best_score:.3f} for {timeframe_minutes}min contracts")
        logger.info(f"Market details: {best_market.name} - {best_market.description}")

        return best_symbol

    def get_market_info(self, symbol: str) -> Optional[MarketInfo]:
        """
        Get detailed information about a specific market.

        Args:
            symbol: Market symbol

        Returns:
            MarketInfo object or None if not found
        """
        return self.markets.get(symbol)

    def get_markets_by_category(self, category: MarketCategory) -> Dict[str, MarketInfo]:
        """
        Get all markets in a specific category.

        Args:
            category: Market category

        Returns:
            Dictionary of symbol -> MarketInfo
        """
        return {
            symbol: market
            for symbol, market in self.markets.items()
            if market.category == category
        }

    def update_market_performance(self, symbol: str, win_rate: float, avg_profit: float) -> None:
        """
        Update performance tracking for a market.

        Args:
            symbol: Market symbol
            win_rate: Current win rate (0-1)
            avg_profit: Average profit per trade
        """
        if symbol not in self.market_performance:
            self.market_performance[symbol] = []

        self.market_performance[symbol].append({
            "timestamp": time.time(),
            "win_rate": win_rate,
            "avg_profit": avg_profit
        })

        # Keep only last 100 entries per market
        if len(self.market_performance[symbol]) > 100:
            self.market_performance[symbol] = self.market_performance[symbol][-100:]

        logger.debug(f"Updated performance for {symbol}: WR={win_rate:.1%}, AvgP={avg_profit:.2f}")

    def should_switch_market(self, current_symbol: str) -> bool:
        """
        Determine if market should be switched based on performance.

        Args:
            current_symbol: Currently active market

        Returns:
            True if market should be switched
        """
        if not self.market_rotation_enabled:
            return False

        if current_symbol not in self.market_performance:
            return False

        # Get recent performance (last 10 trades)
        recent_performance = self.market_performance[current_symbol][-10:]

        if len(recent_performance) < 5:  # Need minimum data
            return False

        # Calculate recent metrics
        recent_win_rate = sum(p["win_rate"] for p in recent_performance) / len(recent_performance)
        recent_avg_profit = sum(p["avg_profit"] for p in recent_performance) / len(recent_performance)

        # Switch if performance is poor
        threshold_win_rate = 0.5  # Below 50% win rate
        threshold_profit = 0.0    # Negative average profit

        should_switch = (
            recent_win_rate < threshold_win_rate or
            recent_avg_profit < threshold_profit
        )

        if should_switch:
            logger.warning(f"Market {current_symbol} performance poor: WR={recent_win_rate:.1%}, AvgP={recent_avg_profit:.2f}")

        return should_switch

    def get_best_alternative_market(self, current_symbol: str, timeframe_minutes: int = 1) -> str:
        """
        Get best alternative market when current market performance is poor.

        Args:
            current_symbol: Currently underperforming market
            timeframe_minutes: Contract duration in minutes

        Returns:
            Symbol of best alternative market
        """
        ranking = self.get_market_ranking(timeframe_minutes)

        # Find current market and get alternatives
        current_index = None
        for i, (symbol, _, _) in enumerate(ranking):
            if symbol == current_symbol:
                current_index = i
                break

        if current_index is None:
            # Current market not in ranking, return best available
            return ranking[0][0] if ranking else current_symbol

        # Get next best market (skip current if it's the best)
        for i in range(current_index + 1, len(ranking)):
            symbol, market, score = ranking[i]
            # Only switch to markets in same or better categories
            if market.category in [MarketCategory.SYNTHETIC_INDICES, MarketCategory.FOREX_MAJORS]:
                logger.info(f"Switching from {current_symbol} to {symbol} (score: {score:.3f})")
                return symbol

        # If no good alternatives, stay with current
        logger.warning(f"No suitable alternative markets found for {current_symbol}")
        return current_symbol

    def get_market_summary(self) -> Dict:
        """
        Get comprehensive market summary for monitoring.

        Returns:
            Dictionary with market statistics and recommendations
        """
        # Get rankings for 1-minute timeframe (most common)
        ranking_1min = self.get_market_ranking(1)
        ranking_5min = self.get_market_ranking(5)

        # Count markets by category
        category_counts = {}
        for market in self.markets.values():
            category = market.category.value
            category_counts[category] = category_counts.get(category, 0) + 1

        # Get top recommendations
        top_1min = ranking_1min[:3] if ranking_1min else []
        top_5min = ranking_5min[:3] if ranking_5min else []

        return {
            "total_markets": len(self.markets),
            "category_distribution": category_counts,
            "top_1min_markets": [
                {"symbol": symbol, "name": market.name, "score": score}
                for symbol, market, score in top_1min
            ],
            "top_5min_markets": [
                {"symbol": symbol, "name": market.name, "score": score}
                for symbol, market, score in top_5min
            ],
            "synthetic_indices_count": category_counts.get(MarketCategory.SYNTHETIC_INDICES.value, 0),
            "forex_markets_count": category_counts.get(MarketCategory.FOREX_MAJORS.value, 0) +
                                 category_counts.get(MarketCategory.FOREX_MINORS.value, 0),
            "commodities_count": category_counts.get(MarketCategory.COMMODITIES.value, 0),
            "crypto_count": category_counts.get(MarketCategory.CRYPTOCURRENCIES.value, 0)
        }


# Global market selector instance
market_selector = MarketSelector()


def get_market_selector() -> MarketSelector:
    """Get the global market selector instance."""
    return market_selector
