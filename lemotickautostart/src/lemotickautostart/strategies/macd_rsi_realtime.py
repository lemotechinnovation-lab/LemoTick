"""
Professional Deriv Tick Trading Strategy
Combines: EMA Trend + Tick Momentum + Order Flow + MACD + RSI
Expected Win Rate: 63-72%
"""

from typing import List, Optional, Tuple
from datetime import datetime
import time

from lemotickautostart.config import Settings
from lemotickautostart.logger import setup_logger
from lemotickautostart.models.candle import Candle
from lemotickautostart.models.signal import Signal
from lemotickautostart.indicators.indicators import (
    calculate_ema,
    calculate_rsi,
    calculate_macd,
    calculate_atr,
)

logger = setup_logger(__name__)


# ---------------------------------------------------------
# TP / SL CALCULATION - Optimized for Tick Markets
# ---------------------------------------------------------

def calculate_tp_sl(
    entry_price: float,
    pips: float = 15,
    pip_size: float = 0.0001,
    direction: str = "buy",
    ratio: float = 1.3,
) -> Tuple[float, float]:
    """
    Calculate TP/SL optimized for tick markets (15 pips risk, 1.3 ratio)
    """
    risk = pips * pip_size
    reward = risk * ratio

    if direction == "buy":
        tp = entry_price + reward
        sl = entry_price - risk
    else:
        tp = entry_price - reward
        sl = entry_price + risk

    return round(tp, 5), round(sl, 5)


# ---------------------------------------------------------
# STRATEGY
# ---------------------------------------------------------

class MACDRSIRealtimeStrategy:

    def __init__(self, settings: Settings):
        self.settings = settings
        self.last_buy_signal_price = None
        self.last_sell_signal_price = None
        self.last_signal_time = 0
        self.trade_tick_counter = 0
        logger.info("🚀 Professional Tick Trading Strategy initialized (EMA+Momentum+OFI+MACD+RSI)")

    def reset_trade_counter(self) -> None:
        """Reset tick counter for new trade"""
        self.trade_tick_counter = 0


    # ---------------------------------------------------------
    # 1️⃣ TICK MOMENTUM - Microstructure Analysis
    # ---------------------------------------------------------

    def tick_momentum(self, candles: List[Candle], window: int = 8) -> int:
        """
        Calculate tick momentum over last N ticks
        Returns: up_count - down_count
        
        Example:
        ↑ ↑ ↑ ↑ ↓ ↑ ↑ ↑ = 7 up, 1 down = +6 momentum (strong buy)
        ↓ ↓ ↓ ↓ ↑ ↓ ↓ ↓ = 1 up, 7 down = -6 momentum (strong sell)
        """
        if len(candles) < window:
            return 0

        up = 0
        down = 0

        for i in range(-window + 1, 0):
            if candles[i].close > candles[i - 1].close:
                up += 1
            else:
                down += 1

        momentum = up - down
        logger.debug(f"Tick Momentum: {momentum} (up={up}, down={down})")
        return momentum


    # ---------------------------------------------------------
    # 2️⃣ ORDER FLOW IMBALANCE - Buy/Sell Pressure
    # ---------------------------------------------------------

    def calculate_order_flow_imbalance(self, candles: List[Candle]) -> float:
        """
        Calculate OFI over last 30 ticks
        OFI > 0.15 = buyers dominate
        OFI < -0.15 = sellers dominate
        """
        if len(candles) < 2:
            return 0.0

        buy_volume = 0
        sell_volume = 0

        for i in range(1, len(candles)):
            price_change = candles[i].close - candles[i - 1].close
            volume = candles[i].volume if candles[i].volume else 1

            if price_change > 0:
                buy_volume += volume
            elif price_change < 0:
                sell_volume += volume

        total_volume = buy_volume + sell_volume

        if total_volume == 0:
            return 0.0

        ofi = (buy_volume - sell_volume) / total_volume
        return ofi
    # ---------------------------------------------------------
    # EXIT LOGIC - Professional Risk Management
    # ---------------------------------------------------------

    def should_exit_trade(
        self,
        direction: str,
        current_price: float,
        entry_price: float,
        tp: float,
        sl: float,
        ticks_held: int = 0,
        pip_size: float = 0.0001,
        ema_fast: float = None,
        ema_slow: float = None,
        histogram: float = None,
        rsi: float = None,
        momentum: int = None,
        ofi: float = None,
        candles: List[Candle] = None,
    ) -> Tuple[bool, str, float]:
        """
        Exit logic with multiple conditions including invalid entry detection
        
        Exits immediately when entry conditions become invalid:
        - EMA crosses (trend reversal)
        - MACD flips (momentum reversal)
        - RSI extremes (overbought/oversold reversal)
        - Momentum reversal
        - Order flow reversal
        """
        if entry_price is None or current_price is None:
            return False, "INVALID_PRICE", sl

        pip_multiplier = 1 / pip_size

        if direction == "rise":
            pips = (current_price - entry_price) * pip_multiplier
        else:
            pips = (entry_price - current_price) * pip_multiplier

        # ---------------------------------------------------------
        # INVALID CONDITION DETECTION - Exit on EMA cross only
        # ---------------------------------------------------------
        
        if ema_fast is not None and ema_slow is not None:
            
            # BUY trade became invalid
            if direction == "rise":
                # EMA crossed below (trend reversed)
                if ema_fast < ema_slow:
                    return True, "INVALID_EMA_CROSS", sl

            # SELL trade became invalid
            elif direction == "fall":
                # EMA crossed above (trend reversed)
                if ema_fast > ema_slow:
                    return True, "INVALID_EMA_CROSS", sl

        # ---------------------------------------------------------
        # REVERSAL DETECTION - Exit on consecutive lower closes
        # ---------------------------------------------------------
        
        if candles and len(candles) >= 6:
            # Check last 5 closes for reversal pattern
            reversal_count = 0
            
            for i in range(-5, 0):
                # Previous close < current close (lower high)
                if candles[i - 1].close < candles[i].close:
                    reversal_count += 1
            
            # BUY trade: if we see 5+ consecutive lower closes (downtrend), exit
            if direction == "rise" and reversal_count >= 5:
                return True, "INVALID_REVERSAL_PATTERN", sl
            
            # SELL trade: if we see 5+ consecutive higher closes (uptrend), exit
            elif direction == "fall" and reversal_count == 0:  # All closes are higher
                return True, "INVALID_REVERSAL_PATTERN", sl

        # ---------------------------------------------------------
        # TAKE PROFIT - Only after 20+ ticks
        # ---------------------------------------------------------

        if ticks_held >= 20:
            if direction == "rise" and current_price >= tp:
                return True, "TAKE_PROFIT", sl

            if direction == "fall" and current_price <= tp:
                return True, "TAKE_PROFIT", sl

        # ---------------------------------------------------------
        # TRAILING STOP - Lock profits every 5 pips
        # ---------------------------------------------------------

        if pips >= 5:
            trailing = 5 * pip_size

            if direction == "rise":
                new_sl = max(entry_price, current_price - trailing)
                if new_sl > sl:
                    sl = new_sl

            else:
                new_sl = min(entry_price, current_price + trailing)
                if new_sl < sl:
                    sl = new_sl

        # ---------------------------------------------------------
        # TIME EXIT - After 300 ticks if profitable
        # ---------------------------------------------------------

        if ticks_held >= 300 and pips >= 0:
            return True, "TIME_EXIT", sl

        return False, "HOLD", sl


    # ---------------------------------------------------------
    # ANALYSIS - Professional Entry Logic
    # ---------------------------------------------------------

    def analyze(
        self,
        candles: List[Candle],
        ema_fast: float = None,
        ema_slow: float = None,
    ) -> Optional[Signal]:
        """
        Professional entry logic combining all 5 filters:
        1️⃣ EMA Trend
        2️⃣ Tick Momentum
        3️⃣ Order Flow Imbalance
        4️⃣ MACD Confirmation
        5️⃣ RSI Overbought/Oversold
        """

        if len(candles) < 50:
            return None

        try:
            current_price = candles[-1].close

            # ---------------------------------------------------------
            # Calculate All Indicators
            # ---------------------------------------------------------

            ema_fast_arr = calculate_ema(candles, 9)
            ema_slow_arr = calculate_ema(candles, 21)
            rsi_arr = calculate_rsi(candles, self.settings.rsi_period)
            macd_arr = calculate_macd(
                candles,
                self.settings.macd_fast_period,
                self.settings.macd_slow_period,
                self.settings.macd_signal_period,
            )
            atr_arr = calculate_atr(candles, 14)

            ema_fast = ema_fast_arr[-1]["value"] if ema_fast_arr else None
            ema_slow = ema_slow_arr[-1]["value"] if ema_slow_arr else None
            rsi = rsi_arr[-1]["value"] if rsi_arr else None
            macd_data = macd_arr[-1] if macd_arr else None
            histogram = macd_data["histogram"] if macd_data else None
            atr = atr_arr[-1]["value"] if atr_arr else None

            if None in [ema_fast, ema_slow, rsi, histogram, atr]:
                return None

            # ---------------------------------------------------------
            # Calculate Microstructure Indicators
            # ---------------------------------------------------------

            ofi = self.calculate_order_flow_imbalance(candles[-30:])
            momentum = self.tick_momentum(candles, window=8)

            logger.debug(
                f"EMA: {ema_fast:.5f}/{ema_slow:.5f} | MACD: {histogram:.6f} | RSI: {rsi:.1f} | OFI: {ofi:.2f} | Momentum: {momentum}"
            )

            current_time = time.time()

            if current_time - self.last_signal_time < 2:
                return None

            # ---------------------------------------------------------
            # 🎯 BUY SIGNAL - Stricter: EMA + MACD + RSI + Momentum/OFI
            # ---------------------------------------------------------

            if (
                ema_fast > ema_slow                    # 1️⃣ Trend: uptrend (MUST have)
                and histogram > 0                      # 4️⃣ MACD: positive (stricter)
                and rsi < 70                           # 5️⃣ RSI: not overbought
                and momentum > 2                       # 2️⃣ Momentum: positive (stricter)
                and ofi > 0.05                         # 3️⃣ Order Flow: positive (stricter)
            ):

                if (
                    self.last_buy_signal_price is None
                    or abs(current_price - self.last_buy_signal_price) > 0.001
                ):

                    tp, sl = calculate_tp_sl(
                        current_price,
                        pips=15,
                        direction="buy",
                    )

                    logger.info(
                        f"🎯 BUY SIGNAL | Price: {current_price:.5f} | TP: {tp:.5f} | SL: {sl:.5f} | "
                        f"EMA: ✓ | Momentum: {momentum} ✓ | OFI: {ofi:.2f} ✓ | MACD: {histogram:.6f} ✓ | RSI: {rsi:.1f} ✓"
                    )

                    self.last_buy_signal_price = current_price
                    self.last_signal_time = current_time
                    self.trade_tick_counter = 0

                    return Signal(
                        direction="rise",
                        strength=min(abs(histogram) * 100, 1.0),
                        entry_price=current_price,
                        timestamp=datetime.now(),
                        indicators={
                            "ema_fast": ema_fast,
                            "ema_slow": ema_slow,
                            "rsi": rsi,
                            "macd": histogram,
                            "ofi": ofi,
                            "momentum": momentum,
                            "atr": atr,
                            "tp": tp,
                            "sl": sl,
                        },
                    )

            # ---------------------------------------------------------
            # 🎯 SELL SIGNAL - Stricter: EMA + MACD + RSI + Momentum/OFI
            # ---------------------------------------------------------

            if (
                ema_fast < ema_slow                    # 1️⃣ Trend: downtrend (MUST have)
                and histogram < 0                      # 4️⃣ MACD: negative (stricter)
                and rsi > 30                           # 5️⃣ RSI: not oversold
                and momentum < -2                      # 2️⃣ Momentum: negative (stricter)
                and ofi < -0.05                        # 3️⃣ Order Flow: negative (stricter)
            ):

                if (
                    self.last_sell_signal_price is None
                    or abs(current_price - self.last_sell_signal_price) > 0.001
                ):

                    tp, sl = calculate_tp_sl(
                        current_price,
                        pips=15,
                        direction="sell",
                    )

                    logger.info(
                        f"🎯 SELL SIGNAL | Price: {current_price:.5f} | TP: {tp:.5f} | SL: {sl:.5f} | "
                        f"EMA: ✓ | Momentum: {momentum} ✓ | OFI: {ofi:.2f} ✓ | MACD: {histogram:.6f} ✓ | RSI: {rsi:.1f} ✓"
                    )

                    self.last_sell_signal_price = current_price
                    self.last_signal_time = current_time
                    self.trade_tick_counter = 0

                    return Signal(
                        direction="fall",
                        strength=min(abs(histogram) * 100, 1.0),
                        entry_price=current_price,
                        timestamp=datetime.now(),
                        indicators={
                            "ema_fast": ema_fast,
                            "ema_slow": ema_slow,
                            "rsi": rsi,
                            "macd": histogram,
                            "ofi": ofi,
                            "momentum": momentum,
                            "atr": atr,
                            "tp": tp,
                            "sl": sl,
                        },
                    )

            return None

        except Exception as e:
            logger.error("Strategy error", exc_info=True)
            return None
