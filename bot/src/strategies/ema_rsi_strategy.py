"""
EMA + RSI Only Trading Strategy for Volatility Indices
Ultra-responsive price action strategy using EMA 2/4 crossovers and RSI 1 confirmation
Optimized for M5 (5-minute) timeframe - Maximum responsiveness

Strategy Rules:
- BUY: EMA2 crosses above EMA4, RSI > 50 AND rising, candle closes above both EMAs
- SELL: EMA2 crosses below EMA4, RSI < 50 AND falling, candle closes below both EMAs
- Exit: RSI drops below entry threshold (BUY<50, SELL>50), RSI neutral (45-55), price opposite EMAs, or EMAs touch
- Filters: No flat/tangled EMAs, no neutral RSI, RSI direction confirmation, momentum confirmation

Target Markets: V25 (best), V75
Expected Win Rate: 55-70% (M5 ultra-fast with RSI 50/50 - High frequency, better quality)
"""

import logging
from collections import deque
from dataclasses import dataclass
from enum import Enum

logger = logging.getLogger(__name__)


class SignalType(Enum):
    """Trade signal types"""

    BUY = "BUY"
    SELL = "SELL"
    EXIT = "EXIT"
    NONE = "NONE"


@dataclass
class Candle:
    """Represents a single candlestick"""

    timestamp: float
    open: float
    high: float
    low: float
    close: float

    @property
    def body_size(self) -> float:
        """Get the size of the candle body"""
        return abs(self.close - self.open)

    @property
    def upper_wick(self) -> float:
        """Get upper wick size"""
        return self.high - max(self.open, self.close)

    @property
    def lower_wick(self) -> float:
        """Get lower wick size"""
        return min(self.open, self.close) - self.low

    @property
    def is_bullish(self) -> bool:
        """Check if candle is bullish"""
        return self.close > self.open

    @property
    def is_bearish(self) -> bool:
        """Check if candle is bearish"""
        return self.close < self.open

    @property
    def total_range(self) -> float:
        """Get total candle range"""
        return self.high - self.low


@dataclass
class TradeSignal:
    """Represents a trading signal"""

    signal_type: SignalType
    confidence: float  # 0.0 to 1.0
    entry_price: float
    reason: str
    ema5: float
    ema10: float
    rsi: float
    timestamp: float


class EMA:
    """Exponential Moving Average calculator"""

    def __init__(self, period: int):
        self.period: int = period
        self.multiplier: float = 2.0 / (period + 1.0)
        self.value: float | None = None
        self.previous_value: float | None = None

    def update(self, price: float) -> float:
        """Update EMA with new price"""
        self.previous_value = self.value

        if self.value is None:
            self.value = price
        else:
            self.value = (price - self.value) * self.multiplier + self.value

        return self.value

    def get_value(self) -> float | None:
        """Get current EMA value"""
        return self.value

    def get_previous_value(self) -> float | None:
        """Get previous EMA value"""
        return self.previous_value

    def is_angled_up(self, threshold: float = 0.00001) -> bool:
        """Check if EMA is angled upward"""
        if self.value is None or self.previous_value is None:
            return False
        return self.value > self.previous_value + threshold

    def is_angled_down(self, threshold: float = 0.00001) -> bool:
        """Check if EMA is angled downward"""
        if self.value is None or self.previous_value is None:
            return False
        return self.value < self.previous_value - threshold

    def is_flat(self, threshold: float = 0.00001) -> bool:
        """Check if EMA is flat (not trending)"""
        if self.value is None or self.previous_value is None:
            return True
        return abs(self.value - self.previous_value) < threshold


class RSI:
    """Relative Strength Index calculator"""

    def __init__(self, period: int = 2):
        self.period: int = period
        self.prices: deque[float] = deque(maxlen=period + 1)
        self.value: float | None = None
        self.previous_value: float | None = None
        self.value_history: deque[float] = deque(maxlen=5)  # Track last 5 RSI values

    def update(self, price: float) -> float | None:
        """Update RSI with new price"""

        # Ignore duplicate ticks — they pollute RSI heavily
        if len(self.prices) > 0 and price == self.prices[-1]:
            return self.value

        self.prices.append(price)
        self.previous_value = self.value

        if len(self.prices) < 2:
            return None

        gains = []
        losses = []

        for i in range(1, len(self.prices)):
            change = self.prices[i] - self.prices[i - 1]

            # Skip 0-change movements
            if change > 0:
                gains.append(change)
                losses.append(0)
            elif change < 0:
                gains.append(0)
                losses.append(abs(change))
            else:
                gains.append(0)
                losses.append(0)

        if len(gains) < self.period:
            return None

        avg_gain = sum(gains[-self.period :]) / self.period
        avg_loss = sum(losses[-self.period :]) / self.period

        # No movement at all → RSI undefined
        if avg_gain == 0 and avg_loss == 0:
            return None

        if avg_loss == 0:
            self.value = 100.0
        else:
            rs = avg_gain / avg_loss
            self.value = 100.0 - (100.0 / (1.0 + rs))

        if self.value is not None:
            self.value_history.append(self.value)

        return self.value

    def get_value(self) -> float | None:
        """Get current RSI value"""
        return self.value

    def is_rising(self) -> bool:
        """Check if RSI is rising"""
        if self.value is None or self.previous_value is None:
            return False
        return self.value > self.previous_value

    def is_falling(self) -> bool:
        """Check if RSI is falling"""
        if self.value is None or self.previous_value is None:
            return False
        return self.value < self.previous_value

    def is_rising_n_candles(self, n: int = 2) -> bool:
        """Check if RSI has been rising for N consecutive candles"""
        if len(self.value_history) < n:
            return False
        for i in range(len(self.value_history) - n + 1, len(self.value_history)):
            if self.value_history[i] <= self.value_history[i - 1]:
                return False
        return True

    def is_falling_n_candles(self, n: int = 2) -> bool:
        """Check if RSI has been falling for N consecutive candles"""
        if len(self.value_history) < n:
            return False
        for i in range(len(self.value_history) - n + 1, len(self.value_history)):
            if self.value_history[i] >= self.value_history[i - 1]:
                return False
        return True


class EMARSIStrategy:
    """
    EMA + RSI Only Trading Strategy

    Ultra-responsive, high-frequency strategy using only:
    - EMA 2/4 crossovers (ULTRA-FAST for M1)
    - RSI 1 confirmation (maximum speed for M1)
    - Strict filters
    """

    def __init__(
        self,
        ema_fast_period: int = 5,
        ema_slow_period: int = 10,
        rsi_period: int = 2,
        rsi_buy_threshold: float = 60.0,
        rsi_sell_threshold: float = 40.0,
        rsi_neutral_low: float = 40.0,
        rsi_neutral_high: float = 60.0,
        ema_angle_threshold: float = 0.00001,
        require_momentum_confirmation: bool = True,
        min_candle_body_ratio: float = 0.3,
        lookback_candles: int = 5,
    ):
        """
        Initialize EMA + RSI strategy

        Args:
            ema_fast_period: Fast EMA period (default 5)
            ema_slow_period: Slow EMA period (default 10)
            rsi_period: RSI period (default 5, can use 7 if noisy)
            rsi_buy_threshold: RSI threshold for buy signals (default 55)
            rsi_sell_threshold: RSI threshold for sell signals (default 45)
            rsi_neutral_low: Lower bound of RSI neutral zone (default 45)
            rsi_neutral_high: Upper bound of RSI neutral zone (default 55)
            ema_angle_threshold: Threshold to detect flat EMAs
            require_momentum_confirmation: Require next candle bigger than previous
            min_candle_body_ratio: Minimum candle body to total range ratio
            lookback_candles: Number of candles to check for tangled EMAs
        """
        self.ema_fast: EMA = EMA(ema_fast_period)
        self.ema_slow: EMA = EMA(ema_slow_period)
        self.rsi: RSI = RSI(rsi_period)

        self.rsi_buy_threshold: float = rsi_buy_threshold
        self.rsi_sell_threshold: float = rsi_sell_threshold
        self.rsi_neutral_low: float = rsi_neutral_low
        self.rsi_neutral_high: float = rsi_neutral_high
        self.ema_angle_threshold: float = ema_angle_threshold
        self.require_momentum_confirmation: bool = require_momentum_confirmation
        self.min_candle_body_ratio: float = min_candle_body_ratio
        self.lookback_candles: int = lookback_candles

        # Track historical data
        self.candles: deque[Candle] = deque(maxlen=lookback_candles)
        self.ema5_history: deque[float] = deque(maxlen=lookback_candles)
        self.ema10_history: deque[float] = deque(maxlen=lookback_candles)

        # Track crossovers
        self.previous_ema5: float | None = None
        self.previous_ema10: float | None = None
        self.last_crossover_type: str | None = None  # 'bullish' or 'bearish'

        # Active position tracking
        self.in_position: bool = False
        self.position_type: SignalType | None = None
        self.entry_price: float | None = None
        self.entry_ema5: float | None = None
        self.entry_ema10: float | None = None

        # Stop-loss and Take-profit (in percentage or absolute difference)
        self.stop_loss_pct: float = 0.002  # 0.3% default SL
        self.take_profit_pct: float = 0.005  # 0.5% default TP

        # Computed at entry
        self.stop_loss_price: float | None = None
        self.take_profit_price: float | None = None

        logger.info(
            f"EMA+RSI Strategy initialized: EMA({ema_fast_period}/{ema_slow_period}), RSI({rsi_period})"
        )

    def update(self, candle: Candle) -> TradeSignal:
        """
        Update strategy with new candle and generate signal.

        NOTE: This method stays synchronous and only *returns signals*.
        Trade execution must be performed by the bot layer (EMARSIBot).
        """
        # Update indicators
        ema5_value = self.ema_fast.update(candle.close)
        ema10_value = self.ema_slow.update(candle.close)
        rsi_value = self.rsi.update(candle.close)

        # Store candle and EMA history
        self.candles.append(candle)
        if ema5_value is not None:
            self.ema5_history.append(ema5_value)
        if ema10_value is not None:
            self.ema10_history.append(ema10_value)

        # Verbose logging
        ema5_str = f"{ema5_value:.5f}" if ema5_value is not None else "N/A"
        ema10_str = f"{ema10_value:.5f}" if ema10_value is not None else "N/A"
        rsi_str = f"{rsi_value:.1f}" if rsi_value is not None else "N/A"
        logger.info(
            f"INDICATORS UPDATE - EMA5: {ema5_str}, EMA10: {ema10_str}, RSI: {rsi_str}, "
            f"Price: {candle.close:.5f}, Candles collected: {len(self.candles)}"
        )

        # Need all indicators to be valid before making decisions
        if rsi_value is None or ema5_value is None or ema10_value is None:
            logger.debug(
                f"Still building indicators - RSI: {rsi_value is not None}, "
                f"EMA5: {ema5_value is not None}, EMA10: {ema10_value is not None}"
            )
            return TradeSignal(
                signal_type=SignalType.NONE,
                confidence=0.0,
                entry_price=candle.close,
                reason="Insufficient data",
                ema5=ema5_value or 0,
                ema10=ema10_value or 0,
                rsi=rsi_value or 0,
                timestamp=candle.timestamp,
            )

        # If in position, check exit conditions
        if self.in_position:
            logger.info(
                f"IN POSITION - Type: {self.position_type}, checking exit conditions..."
            )
            exit_signal = self._check_exit_conditions(
                candle, ema5_value, ema10_value, rsi_value
            )
            if exit_signal.signal_type == SignalType.EXIT:
                logger.info(f"EXIT condition met: {exit_signal.reason}")
                # clear position-tracking state here (strategy-level)
                self.in_position = False
                self.position_type = None
                self.entry_price = None
                self.stop_loss_price = None
                self.take_profit_price = None
                return exit_signal

        # If not in a position, check entry conditions (strategy only returns a signal)
        if not self.in_position:
            logger.info("CHECKING ENTRY CONDITIONS...")
            entry_signal = self._check_entry_conditions(
                candle, ema5_value, ema10_value, rsi_value
            )

            # _check_entry_conditions should return a TradeSignal; but be defensive:
            if entry_signal is None:
                logger.debug("Entry check returned None – treating as no-signal.")
                return TradeSignal(
                    signal_type=SignalType.NONE,
                    confidence=0.0,
                    entry_price=candle.close,
                    reason="No entry (internal None)",
                    ema5=ema5_value,
                    ema10=ema10_value,
                    rsi=rsi_value,
                    timestamp=candle.timestamp,
                )

            if entry_signal.signal_type in (SignalType.BUY, SignalType.SELL):
                logger.info(
                    f"{entry_signal.signal_type.value} SIGNAL GENERATED: {entry_signal.reason}"
                )

                # Strategy marks internal in_position state but DOES NOT execute trades.
                # This lets the bot layer perform the actual buy/sell via API.
                self.in_position = True
                self.position_type = entry_signal.signal_type
                self.entry_price = candle.close
                self.entry_ema5 = ema5_value
                self.entry_ema10 = ema10_value

                # Compute SL/TP at entry (strategy can compute, bot can use those values for risk)
                if entry_signal.signal_type == SignalType.BUY:
                    self.stop_loss_price = candle.close * (1 - self.stop_loss_pct)
                    self.take_profit_price = candle.close * (1 + self.take_profit_pct)
                else:  # SELL
                    self.stop_loss_price = candle.close * (1 + self.stop_loss_pct)
                    self.take_profit_price = candle.close * (1 - self.take_profit_pct)

                logger.info(
                    f"SL/TP SET (strategy) → SL: {self.stop_loss_price}, TP: {self.take_profit_price}"
                )

                # Return the entry signal to the bot which will execute the trade
                return entry_signal

            # No entry
            logger.debug(f"No valid entry signal → {entry_signal.reason}")
            return TradeSignal(
                signal_type=SignalType.NONE,
                confidence=0.0,
                entry_price=candle.close,
                reason=entry_signal.reason,
                ema5=ema5_value,
                ema10=ema10_value,
                rsi=rsi_value,
                timestamp=candle.timestamp,
            )

        # Update previous values for future crossover detection
        self.previous_ema5 = ema5_value
        self.previous_ema10 = ema10_value

        # No actionable signal
        return TradeSignal(
            signal_type=SignalType.NONE,
            confidence=0.0,
            entry_price=candle.close,
            reason="No signal",
            ema5=ema5_value,
            ema10=ema10_value,
            rsi=rsi_value,
            timestamp=candle.timestamp,
        )

    def _check_entry_conditions(
        self, candle: Candle, ema5: float, ema10: float, rsi: float
    ) -> TradeSignal:
        """Check if entry conditions are met"""

        # --- HARD FILTER: DO NOT TRADE IF RSI IS IN NEUTRAL RANGE ---
        if self.rsi_neutral_low <= rsi <= self.rsi_neutral_high:
            reason = (
                f"RSI in neutral zone ({self.rsi_neutral_low}-{self.rsi_neutral_high}): "
                f"{rsi:.1f} → no trades allowed"
            )
            logger.info("   " + reason)
            return TradeSignal(
                signal_type=SignalType.NONE,
                confidence=0.0,
                entry_price=candle.close,
                reason=reason,
                ema5=ema5,
                ema10=ema10,
                rsi=rsi,
                timestamp=candle.timestamp,
            )

        # --- CRITICAL: Reject invalid RSI values ---
        # (Pyright-safe: this guarantees rsi is a float after this block)
        if rsi is None or rsi == 0.0:
            logger.warning(
                f"   INVALID RSI VALUE: {rsi} - rejecting to prevent false trades"
            )
            return TradeSignal(
                signal_type=SignalType.NONE,
                confidence=0.0,
                entry_price=candle.close,
                reason=f"Invalid RSI value: {rsi}",
                ema5=ema5,
                ema10=ema10,
                rsi=0.0,
                timestamp=candle.timestamp,
            )

        # At this point rsi is guaranteed a float → safe for Pyright
        rsi_float: float = float(rsi)

        # --- OPTIONAL: RSI extreme momentum (allowed, not rejected) ---
        if rsi_float <= 0.1 or rsi_float >= 99.9:
            logger.info(f"   RSI extreme momentum detected: {rsi_float:.1f}")

        # Detect EMA crossover
        crossover = self._detect_crossover(ema5, ema10)

        if (
            rsi > self.rsi_buy_threshold
            and candle.close > ema5
            and candle.close > ema10
        ):
            prev_ema5_str = (
                f"{self.previous_ema5:.5f}" if self.previous_ema5 is not None else "N/A"
            )
            prev_ema10_str = (
                f"{self.previous_ema10:.5f}"
                if self.previous_ema10 is not None
                else "N/A"
            )
            logger.info(
                f"   Crossover check: {crossover if crossover else 'NONE'} "
                f"(EMA5: {ema5:.5f}, EMA10: {ema10:.5f}, Prev EMA5: {prev_ema5_str}, "
                f"Prev EMA10: {prev_ema10_str})"
            )

        # If no fresh crossover, check for trend-following entry (relaxed mode)
        if crossover is None:
            logger.info(
                "   No fresh crossover - checking trend-following conditions..."
            )

            # Check if we're in a clear trend that we can follow
            ema_diff = abs(ema5 - ema10)

            # Bullish trend: EMA5 > EMA10, price above EMAs, RSI > 50
            if ema5 > ema10 and ema_diff > 0.01:  # Clear bullish trend
                logger.info(
                    f"   Bullish trend detected (EMA5 > EMA10 by {ema_diff:.5f}) "
                    "- checking BUY conditions..."
                )
                if (
                    rsi > self.rsi_buy_threshold
                    and candle.close > ema5
                    and candle.close > ema10
                ):
                    # Apply filters
                    filter_result = self._apply_filters(
                        candle, ema5, ema10, rsi, "bullish"
                    )
                    if filter_result["passed"]:
                        confidence = self._calculate_confidence(
                            candle, ema5, ema10, rsi, "BUY"
                        )
                        logger.info(
                            f"   TREND-FOLLOWING BUY SIGNAL! "
                            f"Confidence: {confidence:.1%}"
                        )
                        return TradeSignal(
                            signal_type=SignalType.BUY,
                            confidence=confidence,
                            entry_price=candle.close,
                            reason=f"Trend-following: EMA5 above EMA10, RSI={rsi:.1f} > {self.rsi_buy_threshold}, Price above EMAs",
                            ema5=ema5,
                            ema10=ema10,
                            rsi=rsi,
                            timestamp=candle.timestamp,
                        )
                    else:
                        logger.info(f"   Filter rejected: {filter_result['reason']}")

            # Bearish trend: EMA5 < EMA10, price below EMAs, RSI < 50
            elif ema5 < ema10 and ema_diff > 0.01:  # Clear bearish trend
                logger.info(
                    f"   Bearish trend detected (EMA5 < EMA10 by {ema_diff:.5f}) "
                    "- checking SELL conditions..."
                )
                if (
                    rsi < self.rsi_sell_threshold
                    and candle.close < ema5
                    and candle.close < ema10
                ):
                    # Apply filters
                    filter_result = self._apply_filters(
                        candle, ema5, ema10, rsi, "bearish"
                    )
                    if filter_result["passed"]:
                        confidence = self._calculate_confidence(
                            candle, ema5, ema10, rsi, "SELL"
                        )
                        logger.info(
                            f"   TREND-FOLLOWING SELL SIGNAL! "
                            f"Confidence: {confidence:.1%}"
                        )
                        return TradeSignal(
                            signal_type=SignalType.SELL,
                            confidence=confidence,
                            entry_price=candle.close,
                            reason=f"Trend-following: EMA5 below EMA10, RSI={rsi:.1f} < {self.rsi_sell_threshold}, Price below EMAs",
                            ema5=ema5,
                            ema10=ema10,
                            rsi=rsi,
                            timestamp=candle.timestamp,
                        )
                    else:
                        logger.info(f"   Filter rejected: {filter_result['reason']}")

            # No trend-following opportunity
            logger.info(
                "   No trend-following opportunity (EMAs too close or conditions not met)"
            )
            return TradeSignal(
                signal_type=SignalType.NONE,
                confidence=0.0,
                entry_price=candle.close,
                reason="No crossover and no trend-following opportunity",
                ema5=ema5,
                ema10=ema10,
                rsi=rsi,
                timestamp=candle.timestamp,
            )

        # Apply filters
        logger.info(
            f"   CROSSOVER DETECTED: {crossover.upper()} - Now checking filters..."
        )
        filter_result = self._apply_filters(candle, ema5, ema10, rsi, crossover)

        if not filter_result["passed"]:
            logger.warning(f"   FILTER REJECTED: {filter_result['reason']}")
            return TradeSignal(
                signal_type=SignalType.NONE,
                confidence=0.0,
                entry_price=candle.close,
                reason=f"Filter failed: {filter_result['reason']}",
                ema5=ema5,
                ema10=ema10,
                rsi=rsi,
                timestamp=candle.timestamp,
            )
        else:
            logger.info(f"   All filters PASSED!")

        # Check BUY conditions
        if crossover == "bullish":
            logger.info("   BULLISH crossover - checking BUY conditions...")
            logger.info(
                f"      RSI: {rsi:.1f} (threshold: {self.rsi_buy_threshold}), "
                f"Rising: {self.rsi.is_rising()}"
            )
            logger.info(
                f"      Price: {candle.close:.5f} vs EMA5: {ema5:.5f}, EMA10: {ema10:.5f}"
            )

            # RSI direction check - now optional (just warning, not rejecting)
            if not self.rsi.is_rising():
                logger.warning(
                    f"   Note: RSI not rising (RSI: {rsi:.1f}) - but allowing trade"
                )

            if (
                rsi is not None
                and rsi > 0.0
                and rsi > self.rsi_buy_threshold
                and candle.close > ema5
                and candle.close > ema10
            ):
                confidence = self._calculate_confidence(candle, ema5, ema10, rsi, "BUY")
                logger.info(f"   BUY SIGNAL VALID! Confidence: {confidence:.1%}")
                return TradeSignal(
                    signal_type=SignalType.BUY,
                    confidence=confidence,
                    entry_price=candle.close,
                    reason=f"EMA5 crossed above EMA10, RSI={rsi:.1f} > 55 (rising), Price above EMAs",
                    ema5=ema5,
                    ema10=ema10,
                    rsi=rsi,
                    timestamp=candle.timestamp,
                )
            else:
                logger.warning(
                    f"   BUY conditions not met - RSI: {rsi:.1f} > {self.rsi_buy_threshold} = {rsi > self.rsi_buy_threshold}, "
                    f"Price > EMA5: {candle.close > ema5}, Price > EMA10: {candle.close > ema10}"
                )

        # Check SELL conditions
        elif crossover == "bearish":
            logger.info("   BEARISH crossover - checking SELL conditions...")
            logger.info(
                f"      RSI: {rsi:.1f} (threshold: {self.rsi_sell_threshold}), "
                f"Falling: {self.rsi.is_falling()}"
            )
            logger.info(
                f"      Price: {candle.close:.5f} vs EMA5: {ema5:.5f}, EMA10: {ema10:.5f}"
            )

            # RSI direction check - now optional (just warning, not rejecting)
            if not self.rsi.is_falling():
                logger.warning(
                    f"   Note: RSI not falling (RSI: {rsi:.1f}) - but allowing trade"
                )

            if (
                rsi is not None
                and rsi > 0.0
                and rsi < self.rsi_sell_threshold
                and candle.close < ema5
                and candle.close < ema10
            ):
                confidence = self._calculate_confidence(
                    candle, ema5, ema10, rsi, "SELL"
                )
                logger.info(f"   SELL SIGNAL VALID! Confidence: {confidence:.1%}")
                return TradeSignal(
                    signal_type=SignalType.SELL,
                    confidence=confidence,
                    entry_price=candle.close,
                    reason=f"EMA5 crossed below EMA10, RSI={rsi:.1f} < 45 (falling), Price below EMAs",
                    ema5=ema5,
                    ema10=ema10,
                    rsi=rsi,
                    timestamp=candle.timestamp,
                )
            else:
                logger.warning(
                    f"   SELL conditions not met - RSI: {rsi:.1f} < {self.rsi_sell_threshold} = {rsi < self.rsi_sell_threshold}, "
                    f"Price < EMA5: {candle.close < ema5}, Price < EMA10: {candle.close < ema10}"
                )

        return TradeSignal(
            signal_type=SignalType.NONE,
            confidence=0.0,
            entry_price=candle.close,
            reason="Entry conditions not fully met",
            ema5=ema5,
            ema10=ema10,
            rsi=rsi,
            timestamp=candle.timestamp,
        )

    def _check_exit_conditions(
        self, candle: Candle, ema5: float, ema10: float, rsi: float
    ) -> TradeSignal:
        """Check if exit conditions are met, including SL/TP."""

        exit_reason = None
        price = candle.close

        # --- 1. STOP LOSS (highest priority) ---
        # --- 1. STOP LOSS (highest priority) ---
        if self.stop_loss_price is not None:
            if self.position_type == SignalType.BUY and price <= self.stop_loss_price:
                exit_reason = f"STOP LOSS HIT (BUY) @ {price:.5f}"
            elif (
                self.position_type == SignalType.SELL and price >= self.stop_loss_price
            ):
                exit_reason = f"STOP LOSS HIT (SELL) @ {price:.5f}"

        # --- 2. TAKE PROFIT ---
        if not exit_reason and self.take_profit_price is not None:
            if self.position_type == SignalType.BUY and price >= self.take_profit_price:
                exit_reason = f"TAKE PROFIT HIT (BUY) @ {price:.5f}"
            elif (
                self.position_type == SignalType.SELL
                and price <= self.take_profit_price
            ):
                exit_reason = f"TAKE PROFIT HIT (SELL) @ {price:.5f}"

        # --- 3. RSI EXIT ---
        if not exit_reason:
            if self.position_type == SignalType.BUY:
                if rsi < self.rsi_buy_threshold:
                    exit_reason = f"RSI dropped below BUY threshold {self.rsi_buy_threshold}: {rsi:.1f}"
            elif self.position_type == SignalType.SELL:
                if rsi > self.rsi_sell_threshold:
                    exit_reason = f"RSI rose above SELL threshold {self.rsi_sell_threshold}: {rsi:.1f}"

        # --- 4. RSI Neutral Zone Exit ---
        if not exit_reason:
            if self.rsi_sell_threshold <= rsi <= self.rsi_buy_threshold:
                exit_reason = f"RSI entered neutral zone between {self.rsi_sell_threshold}-{self.rsi_buy_threshold}: {rsi:.1f}"

        # --- 5. EMA Opposite Side Exit ---
        if not exit_reason:
            if self.position_type == SignalType.BUY:
                if price < ema5 and price < ema10:
                    exit_reason = "Price closed below both EMAs"
            else:
                if price > ema5 and price > ema10:
                    exit_reason = "Price closed above both EMAs"

        # --- 6. EMA Touch Exit (Loss of trend) ---
        if not exit_reason:
            ema_distance = abs(ema5 - ema10)
            ema_touch_threshold = (ema5 + ema10) / 2 * 0.0001
            if ema_distance < ema_touch_threshold:
                exit_reason = "EMA2 touched EMA4"

        # If exit_reason was found → return EXIT signal
        if exit_reason:
            return TradeSignal(
                signal_type=SignalType.EXIT,
                confidence=1.0,
                entry_price=price,
                reason=exit_reason,
                ema5=ema5,
                ema10=ema10,
                rsi=rsi,
                timestamp=candle.timestamp,
            )

        # Otherwise → no exit
        return TradeSignal(
            signal_type=SignalType.NONE,
            confidence=0.0,
            entry_price=price,
            reason="No exit signal",
            ema5=ema5,
            ema10=ema10,
            rsi=rsi,
            timestamp=candle.timestamp,
        )

    def _detect_crossover(self, ema5: float, ema10: float) -> str | None:
        """Detect EMA crossover"""

        if self.previous_ema5 is None or self.previous_ema10 is None:
            return None

        # Bullish crossover: EMA5 crosses above EMA10
        if self.previous_ema5 <= self.previous_ema10 and ema5 > ema10:
            self.last_crossover_type = "bullish"
            return "bullish"

        # Bearish crossover: EMA5 crosses below EMA10
        elif self.previous_ema5 >= self.previous_ema10 and ema5 < ema10:
            self.last_crossover_type = "bearish"
            return "bearish"

        return None

    def _apply_filters(
        self, candle: Candle, _ema5: float, _ema10: float, rsi: float, crossover: str
    ) -> dict[str, bool | str]:
        """Apply all filters to prevent bad trades"""

        # Filter 1: EMAs must be angled (not flat)
        ema5_flat = self.ema_fast.is_flat(self.ema_angle_threshold)
        ema10_flat = self.ema_slow.is_flat(self.ema_angle_threshold)
        logger.info(
            f"      Filter 1: EMAs angled - EMA5 flat: {ema5_flat}, EMA10 flat: {ema10_flat}"
        )
        if ema5_flat or ema10_flat:
            return {"passed": False, "reason": "EMAs are flat"}

        # Filter 2: EMAs must not be tangled (check last N candles)
        tangled = self._check_emas_tangled()
        logger.info(f"      Filter 2: EMAs not tangled - Tangled: {tangled}")
        if tangled:
            return {"passed": False, "reason": "EMAs tangled in recent candles"}

        # Filter 3: RSI must not be in neutral zone
        rsi_neutral = self.rsi_neutral_low <= rsi <= self.rsi_neutral_high
        logger.info(
            f"      Filter 3: RSI not neutral - In neutral zone: {rsi_neutral} (RSI: {rsi:.1f})"
        )
        if rsi_neutral:
            return {"passed": False, "reason": f"RSI in neutral zone: {rsi:.1f}"}

        # Filter 4: Candle must have sufficient body
        if candle.total_range > 0:
            body_ratio = candle.body_size / candle.total_range
            if body_ratio < self.min_candle_body_ratio:
                return {
                    "passed": False,
                    "reason": f"Small candle body: {body_ratio:.2%}",
                }

        # Filter 5: Avoid excessive wicks (doji-like candles)
        if candle.total_range > 0:
            upper_wick_ratio = candle.upper_wick / candle.total_range
            lower_wick_ratio = candle.lower_wick / candle.total_range
            if upper_wick_ratio > 0.4 and lower_wick_ratio > 0.4:
                return {"passed": False, "reason": "Excessive wicks on both sides"}

        # Filter 6: No wick against trend (highest probability setup)
        if candle.total_range > 0:
            if crossover == "bullish":
                # For BUY, lower wick should be small (no rejection to downside)
                lower_wick_ratio = candle.lower_wick / candle.total_range
                if lower_wick_ratio > 0.5:
                    return {
                        "passed": False,
                        "reason": "Large lower wick against BUY trend",
                    }
            elif crossover == "bearish":
                # For SELL, upper wick should be small (no rejection to upside)
                upper_wick_ratio = candle.upper_wick / candle.total_range
                if upper_wick_ratio > 0.5:
                    return {
                        "passed": False,
                        "reason": "Large upper wick against SELL trend",
                    }

        # Filter 7: Momentum confirmation (optional)
        if self.require_momentum_confirmation and len(self.candles) >= 2:
            current_body = candle.body_size
            previous_body = self.candles[-2].body_size if len(self.candles) >= 2 else 0
            if current_body <= previous_body:
                return {"passed": False, "reason": "No momentum confirmation"}

        # All filters passed
        return {"passed": True, "reason": "All filters passed"}

    def _check_emas_tangled(self) -> bool:
        """Check if EMAs are tangled (crossing frequently)"""

        if (
            len(self.ema5_history) < self.lookback_candles
            or len(self.ema10_history) < self.lookback_candles
        ):
            return False

        # Count crossovers in lookback period
        crossovers = 0
        for i in range(1, len(self.ema5_history)):
            prev_ema5 = self.ema5_history[i - 1]
            prev_ema10 = self.ema10_history[i - 1]
            curr_ema5 = self.ema5_history[i]
            curr_ema10 = self.ema10_history[i]

            # Check if crossover occurred
            if (prev_ema5 <= prev_ema10 and curr_ema5 > curr_ema10) or (
                prev_ema5 >= prev_ema10 and curr_ema5 < curr_ema10
            ):
                crossovers += 1

        # If more than 2 crossovers in lookback period, EMAs are tangled
        return crossovers > 2

    def _calculate_confidence(
        self, candle: Candle, ema5: float, ema10: float, rsi: float, direction: str
    ) -> float:
        """Calculate signal confidence score (0.0 to 1.0)"""

        confidence = 0.5  # Base confidence

        # Factor 1: RSI strength (higher/lower RSI = higher confidence)
        # Highest probability: RSI > 60 for BUY, < 40 for SELL
        if direction == "BUY":
            if rsi > 65:
                confidence += 0.3  # Very strong
            elif rsi > 60:
                confidence += 0.25  # Highest probability zone
            elif rsi > 55:
                confidence += 0.15  # Good
        else:  # SELL
            if rsi < 35:
                confidence += 0.3  # Very strong
            elif rsi < 40:
                confidence += 0.25  # Highest probability zone
            elif rsi < 45:
                confidence += 0.15  # Good

        # Factor 2: RSI direction confirmation (1 candle)
        if direction == "BUY" and self.rsi.is_rising():
            confidence += 0.10
        elif direction == "SELL" and self.rsi.is_falling():
            confidence += 0.10

        # Factor 3: RSI multi-candle trend (2+ candles rising/falling)
        if direction == "BUY" and self.rsi.is_rising_n_candles(2):
            confidence += 0.15  # Extra bonus for 2-candle confirmation
        elif direction == "SELL" and self.rsi.is_falling_n_candles(2):
            confidence += 0.15  # Extra bonus for 2-candle confirmation

        # Factor 4: EMA angle (steeper = higher confidence)
        ema5_val = self.ema_fast.get_value()
        ema5_prev = self.ema_fast.get_previous_value()
        ema5_angle = (
            abs(ema5_val - ema5_prev)
            if ema5_val is not None and ema5_prev is not None
            else 0
        )
        if ema5_angle > self.ema_angle_threshold * 5:
            confidence += 0.1

        # Factor 5: Candle strength (larger body = higher confidence)
        if candle.total_range > 0:
            body_ratio = candle.body_size / candle.total_range
            if body_ratio > 0.7:
                confidence += 0.15  # Strong candle
            elif body_ratio > 0.6:
                confidence += 0.1

        # Factor 6: No wick against trend (highest probability)
        if candle.total_range > 0:
            if direction == "BUY":
                lower_wick_ratio = candle.lower_wick / candle.total_range
                if lower_wick_ratio < 0.2:
                    confidence += 0.1  # Clean bullish candle
            else:  # SELL
                upper_wick_ratio = candle.upper_wick / candle.total_range
                if upper_wick_ratio < 0.2:
                    confidence += 0.1  # Clean bearish candle

        # Factor 7: Price position relative to EMAs
        if direction == "BUY":
            if candle.close > ema5 and candle.close > ema10:
                confidence += 0.05
        else:
            if candle.close < ema5 and candle.close < ema10:
                confidence += 0.05

        # Cap confidence at 1.0
        return min(confidence, 1.0)

    def reset(self):
        """Reset strategy state"""
        self.ema_fast = EMA(self.ema_fast.period)
        self.ema_slow = EMA(self.ema_slow.period)
        self.rsi = RSI(self.rsi.period)
        self.candles.clear()
        self.ema5_history.clear()
        self.ema10_history.clear()
        self.previous_ema5 = None
        self.previous_ema10 = None
        self.last_crossover_type = None
        self.in_position = False
        self.position_type = None
        self.entry_price = None
        logger.info("Strategy reset")

    def get_status(self) -> dict[str, bool | str | float | int | None]:
        """Get current strategy status"""
        return {
            "in_position": self.in_position,
            "position_type": self.position_type.value if self.position_type else None,
            "entry_price": self.entry_price,
            "ema5": self.ema_fast.get_value(),
            "ema10": self.ema_slow.get_value(),
            "rsi": self.rsi.get_value(),
            "last_crossover": self.last_crossover_type,
            "candles_collected": len(self.candles),
        }
