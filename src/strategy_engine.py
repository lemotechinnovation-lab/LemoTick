"""
Strategy engine for LemoTick bot.
Implements signal generation logic using technical indicators.
"""

import time
from typing import Dict, Any, Optional
from enum import Enum
from .utils.indicators import (
    IncrementalEMA,
    IncrementalMomentum,
    IncrementalVolatility,
    BollingerBands,
    IncrementalStochastic,
    IncrementalMACD,
)
from .config import config
from .logger import logger
from .metrics import get_metrics


class SignalType(Enum):
    """Trading signal types."""

    BUY = "BUY"
    SELL = "SELL"
    HOLD = "HOLD"


class StrategyEngine:
    """Main strategy engine for signal generation."""

    def __init__(self):
        """Initialize strategy engine with EMA + Pin Bar strategy."""
        # EMA-based trend detection + Pin Bar patterns

        # Trend indicators (2/5 EMA for 1-minute timeframe - ultra-fast response)
        self.ema_2 = IncrementalEMA(config.get("indicators.ema_fast_period", 2))   # Fast EMA for 1-minute trend
        self.ema_5 = IncrementalEMA(config.get("indicators.ema_slow_period", 5))  # Slow EMA for 1-minute trend

        # Additional indicators for filtering
        self.momentum = IncrementalMomentum(lookback=5)
        self.volatility = IncrementalVolatility(config.volatility_window)
        self.bollinger_bands = BollingerBands(period=20, std_dev=2.0)
        # Stochastic (1,1,1) for 1-minute timeframe
        self.stochastic = IncrementalStochastic(k_period=1, d_period=1, slowing=1)

        # MACD for trend confirmation (optimized for 1-minute scalping)
        self.macd = IncrementalMACD(
            fast_period=config.get("indicators.macd_fast_period", 6),
            slow_period=config.get("indicators.macd_slow_period", 13),
            signal_period=config.get("indicators.macd_signal_period", 5)
        )

        # MACD crossover and momentum tracking
        self.prev_macd_line = 0.0
        self.prev_macd_signal = 0.0
        self.prev_histogram = 0.0
        self.macd_crossovers = []  # Track recent crossovers

        # Strategy parameters - EMA + Pin Bar
        self.momentum_threshold = config.momentum_threshold
        self.volatility_min = config.get("indicators.volatility_min", 0.0001)
        self.volatility_max = config.get("indicators.volatility_max", 0.01)

        # Trade management parameters
        self.trade_cooldown_ticks = config.get("strategy.trade_cooldown_ticks", 3)
        self.max_concurrent_trades = config.get("strategy.max_concurrent_trades", 1)
        self.ultra_short_trade_threshold = config.get("strategy.ultra_short_trade_threshold", 15)

        # EMA + Pin Bar parameters
        self.entry_offset = 0.0003  # 3-5 points entry offset (0.03%)
        self.risk_multiple = 2.5  # 2.5R target
        self.ema_trend_duration = 1  # 1 minute for EMA-confirmed pin bars

        # EMA + Pin Bar settings
        self.pinbar_duration_ticks = config.get("strategy.pinbar_duration_ticks", 1)  # 1 minute for EMA2/EMA5 strategy
        self.pinbar_min_wick_ratio = config.get("strategy.pinbar_min_wick_ratio", 0.1)  # 10% wick requirement (very loose)
        self.ema_trend_min_slope = config.get("strategy.ema_trend_min_slope", 0.00001)  # 0.001 point minimum slope for EMA2/EMA5

        # State tracking - Simplified for pin bars only
        self.last_signal = SignalType.HOLD
        self.last_price = None
        self.signal_history = []
        self.last_signal_timestamp = 0  # Track when last signal was generated
        self.last_trade_timestamp = 0  # Track when last trade was placed

        # Price history for pin bar detection
        self.price_history = []  # Store recent prices for pin bar detection

        # Active trade tracking for monitoring
        self.active_trades = []  # List of {"signal": str, "entry_time": int, "entry_tick": int, "ticks_elapsed": int}
        
        # Loss reversal tracking
        self.consecutive_losses = 0
        self.max_consecutive_losses = config.get("strategy.max_consecutive_losses", 2)
        self.reversal_enabled = config.get("strategy.loss_reversal_enabled", True)
        self.reversal_mode = False
        self.last_trade_result = None
        
        # Profit guarantee tracking
        self.total_trades = 0
        self.total_wins = 0
        self.total_losses = 0
        self.win_rate = 0.0
        self.consecutive_wins = 0
        self.profit_target_reached = False
        self.daily_profit_target = config.get("strategy.daily_profit_target", 50.0)  # $50 daily target
        self.current_daily_profit = 0.0
        self.last_reset_date = None

        # Tick counter for 7-tick logic
        self.tick_count = 0

        # Callback for trade cancellation (will be set by main bot)
        self.on_trade_cancel = None

        # Metrics
        try:
            self.metrics = get_metrics()
        except Exception:
            self.metrics = None

        logger.info("Strategy engine initialized")

    def update_trade_result(self, result: str, profit: float) -> None:
        """
        Update strategy based on trade result for loss reversal logic and profit tracking.
        
        Args:
            result: Trade result ("win" or "loss")
            profit: Profit/loss amount
        """
        try:
            # Update trade statistics
            self.total_trades += 1
            if result == "win":
                self.total_wins += 1
                self.consecutive_wins += 1
                self.consecutive_losses = 0
                self.current_daily_profit += profit
                self.last_trade_result = "win"
                
                # Check if daily profit target reached
                if self.current_daily_profit >= self.daily_profit_target:
                    self.profit_target_reached = True
                    logger.info(f"🎯 DAILY PROFIT TARGET REACHED: ${self.current_daily_profit:.2f}")
                
                # Exit reversal mode on win
                if self.reversal_mode:
                    self.reversal_mode = False
                    logger.info("Exiting reversal mode after win")
                    
            else:  # loss
                self.total_losses += 1
                self.consecutive_losses += 1
                self.consecutive_wins = 0
                self.current_daily_profit += profit  # profit is negative for losses
                self.last_trade_result = "loss"
                
                # Enter reversal mode after consecutive losses
                if self.consecutive_losses >= self.max_consecutive_losses:
                    self.reversal_mode = True
                    logger.info(f"Entering reversal mode after {self.consecutive_losses} consecutive losses")
            
            # Calculate win rate
            self.win_rate = (self.total_wins / self.total_trades) * 100 if self.total_trades > 0 else 0
            
            # Log performance metrics
            logger.info(f"Performance: {self.total_wins}W/{self.total_losses}L | Win Rate: {self.win_rate:.1f}% | Daily P&L: ${self.current_daily_profit:.2f}")
                    
        except Exception as e:
            logger.error(f"Error updating trade result: {e}")

    def _apply_reversal_logic(self, signal: SignalType) -> SignalType:
        """
        Apply reversal logic to the signal.
        
        Args:
            signal: Original signal
            
        Returns:
            Reversed signal if in reversal mode, original signal otherwise
        """
        if not self.reversal_enabled or not self.reversal_mode:
            return signal
            
        # Reverse the signal
        if signal == SignalType.BUY:
            logger.debug("Reversing BUY to SELL due to loss streak")
            return SignalType.SELL
        elif signal == SignalType.SELL:
            logger.debug("Reversing SELL to BUY due to loss streak")
            return SignalType.BUY
        else:
            return signal

    def _apply_profit_guarantee_logic(self, signal: SignalType) -> SignalType:
        """
        Apply profit guarantee logic to maximize profit probability.
        
        Args:
            signal: Original signal
            
        Returns:
            Modified signal based on profit guarantee rules
        """
        try:
            # Simple rule: If we're losing significantly, be more conservative
            if self.current_daily_profit < -50:  # If down more than $50
                logger.debug("In significant loss - being more conservative")
                # Only trade on very strong signals when in significant loss
                if signal != SignalType.HOLD:
                    # Skip signal filtering when RSI is disabled
                    logger.debug("Filtering signal due to significant loss - RSI check disabled")
                    return SignalType.HOLD
                return signal
            
            # Normal trading for small losses or profits
            return signal
            
        except Exception as e:
            logger.error(f"Error in profit guarantee logic: {e}")
            return signal

    def _check_daily_reset(self) -> None:
        """Check if daily reset is needed for profit tracking."""
        try:
            import datetime
            current_date = datetime.date.today()
            
            if self.last_reset_date != current_date:
                # Reset daily tracking
                self.current_daily_profit = 0.0
                self.profit_target_reached = False
                self.last_reset_date = current_date
                logger.info("Daily reset: Profit tracking reset for new day")
                
        except Exception as e:
            logger.error(f"Error in daily reset: {e}")



    def get_trades_to_cancel(self, min_ticks_before_check: int = 7) -> list:
        """
        Get list of trades with invalid EMA conditions after minimum ticks elapsed.

        For trades that have been active for at least min_ticks_before_check ticks,
        check if the original EMA conditions are still valid. If not, mark for cancellation.

        Args:
            min_ticks_before_check: Minimum ticks to wait before checking EMA conditions

        Returns:
            List of trade dictionaries with invalid EMA conditions that should be cancelled
        """
        trades_to_cancel = []
        current_timestamp = int(time.time())

        # Check each active trade
        for trade in self.active_trades:
            try:
                signal = trade.get("signal")
                entry_time = trade.get("entry_time")
                duration = trade.get("duration")
                ticks_elapsed = trade.get("ticks_elapsed", 0)

                if signal is None or entry_time is None or duration is None:
                    logger.warning(f"Trade missing required fields: {trade}")
                    continue

                # Check if trade duration has expired (in minutes)
                duration_expired = (current_timestamp - entry_time) >= (duration * 60)

                # Check if minimum ticks have elapsed before checking EMA conditions
                if ticks_elapsed < min_ticks_before_check:
                    # Don't check EMA conditions until minimum ticks have passed
                    continue

                # For ultra-short trades (≤ threshold ticks), don't attempt early cancellation
                # These trades last only seconds and should be allowed to expire naturally
                is_ultra_short_trade = duration <= self.ultra_short_trade_threshold

                if is_ultra_short_trade:
                    # For ultra-short trades, only mark as expired if fully expired
                    if duration_expired:
                        logger.debug(f"Ultra-short trade expired: {signal} after {duration} ticks")
                        trades_to_cancel.append(trade)
                    continue

                # Check EMA conditions after minimum ticks have elapsed
                ema_conditions_valid = True
                if "original_ema_bullish" in trade:
                    # Get current EMA values
                    current_ema_fast = self.ema_2.get_value()
                    current_ema_slow = self.ema_5.get_value()

                    original_bullish = trade["original_ema_bullish"]
                    original_bearish = trade["original_ema_bearish"]

                    # Check if EMA conditions are still valid (loose threshold for 7-tick check)
                    if original_bullish and current_ema_fast < current_ema_slow * 0.995:  # 0.5% tolerance for 7-tick check
                        ema_conditions_valid = False
                        logger.warning(f"EMA conditions no longer valid for {signal} trade after {ticks_elapsed} ticks: EMA2 ({current_ema_fast:.6f}) << EMA5 ({current_ema_slow:.6f})")
                    elif original_bearish and current_ema_fast > current_ema_slow * 1.005:  # 0.5% tolerance for 7-tick check
                        ema_conditions_valid = False
                        logger.warning(f"EMA conditions no longer valid for {signal} trade after {ticks_elapsed} ticks: EMA2 ({current_ema_fast:.6f}) >> EMA5 ({current_ema_slow:.6f})")

                if duration_expired or not ema_conditions_valid:
                    if not ema_conditions_valid:
                        logger.warning(f"EMA conditions no longer valid for {signal} trade after {ticks_elapsed} ticks")
                        trades_to_cancel.append(trade)

            except Exception as e:
                logger.error(f"Error processing trade in get_trades_to_cancel: {e}, trade: {trade}")
                continue

        return trades_to_cancel

    def cancel_trades(self, trades_to_cancel: list) -> None:
        """
        Cancel trades that no longer meet EMA conditions.

        Args:
            trades_to_cancel: List of trade dictionaries to cancel
        """
        for trade in trades_to_cancel:
            logger.warning(f"Attempting to cancel trade: {trade['signal']} after {trade.get('ticks_elapsed', 0)} ticks")

            # Call cancellation callback if available
            if self.on_trade_cancel:
                try:
                    logger.info(f"Calling cancellation callback for {trade['signal']} trade")
                    self.on_trade_cancel(trade)
                    logger.info(f"Cancellation callback completed for {trade['signal']} trade")
                except Exception as e:
                    logger.error(f"Error in trade cancellation callback: {e}")
            else:
                logger.warning("No cancellation callback set")

    def has_active_trades(self) -> bool:
        """
        Check if there are any active trades that haven't expired.

        Returns:
            True if there are active trades, False otherwise
        """
        current_timestamp = int(time.time())

        for trade in self.active_trades:
            try:
                entry_time = trade.get("entry_time")
                duration = trade.get("duration")

                if entry_time is None or duration is None:
                    logger.warning(f"Trade missing entry_time or duration: {trade}")
                    continue

                # Check if trade duration has expired (in minutes)
                if (current_timestamp - entry_time) < (duration * 60):
                    return True  # Found an active trade

            except Exception as e:
                logger.error(f"Error checking active trade: {e}, trade: {trade}")
                continue

        return False  # No active trades

    def register_executed_trade(self, signal: str, entry_time: int, entry_tick: int, duration: int) -> None:
        """
        Register an executed trade in the active_trades list.

        Args:
            signal: Trading signal (BUY/SELL)
            entry_time: Timestamp when trade was executed
            entry_tick: Tick count when trade was executed
            duration: Trade duration in minutes
        """
        # Store current EMA values for monitoring (handle case where EMAs might be None)
        current_ema_fast = self.ema_2.get_value()
        current_ema_slow = self.ema_5.get_value()

        # Handle None values (EMAs not initialized yet)
        if current_ema_fast is None or current_ema_slow is None:
            current_ema_bullish = None
            current_ema_bearish = None
        else:
            current_ema_bullish = current_ema_fast > current_ema_slow
            current_ema_bearish = current_ema_fast < current_ema_slow

        self.active_trades.append({
            "signal": signal,
            "entry_time": entry_time,
            "entry_tick": entry_tick,
            "ticks_elapsed": 0,
            "duration": duration,
            "original_ema_bullish": current_ema_bullish,
            "original_ema_bearish": current_ema_bearish,
            "ema_fast_value": current_ema_fast,
            "ema_slow_value": current_ema_slow
        })

    def cleanup_expired_trades(self) -> None:
        """
        Remove expired trades from active_trades list.
        """
        current_timestamp = int(time.time())
        active_trades = []

        for trade in self.active_trades:
            try:
                entry_time = trade.get("entry_time")
                duration = trade.get("duration")
                signal = trade.get("signal")

                if entry_time is None or duration is None:
                    logger.warning(f"Trade missing entry_time or duration: {trade}")
                    continue

                # Check if trade duration has expired (in minutes)
                if (current_timestamp - entry_time) < (duration * 60):
                    active_trades.append(trade)  # Keep active trade
                else:
                    logger.debug(f"Removing expired trade: {signal} from {entry_time}")

            except Exception as e:
                logger.error(f"Error processing trade in cleanup: {e}, trade: {trade}")
                continue

        self.active_trades = active_trades

        # Update metrics
        if self.metrics:
            try:
                self.metrics.update_active_trades(len(self.active_trades))
            except Exception:
                pass

    def update(self, price: float, timestamp: int) -> SignalType:
        """
        Update strategy with new price data and generate Pin Bar signal.

        Args:
            price: Current price
            timestamp: Price timestamp

        Returns:
            Generated trading signal
        """
        try:
            # Increment tick counter
            self.tick_count += 1

            # Update ticks elapsed for all active trades
            for trade in self.active_trades:
                try:
                    entry_tick = trade.get("entry_tick")
                    if entry_tick is not None:
                        trade["ticks_elapsed"] = self.tick_count - entry_tick
                except Exception as e:
                    logger.error(f"Error updating ticks elapsed: {e}, trade: {trade}")

            # Check for daily reset
            self._check_daily_reset()

            # Clean up expired trades first
            self.cleanup_expired_trades()

            # Note: Concurrent trade limit is now handled in risk manager's can_trade() method
            # This allows signal generation to continue while preventing trade execution when limit is reached

            # Check cooldown period between trades
            current_time = int(time.time())
            time_since_last_trade = current_time - self.last_trade_timestamp
            # Add random component to cooldown (base + 0-2 seconds)
            cooldown_ticks = self.trade_cooldown_ticks + (current_time % 3)

            if time_since_last_trade < cooldown_ticks:
                logger.debug(f"Trade cooldown active: {time_since_last_trade}s < {cooldown_ticks}s required")
                return SignalType.HOLD, 1

            # Update price history for pin bar detection (last 20 prices)
            self.price_history.append(price)
            if len(self.price_history) > 20:
                self.price_history = self.price_history[-20:]

            # Update EMA indicators
            ema_2_val = self.ema_2.update(price)
            ema_5_val = self.ema_5.update(price)

            self.last_price = price

            # Generate EMA + Pin Bar signal (only when no active trades and cooldown passed)
            signal, duration = self._generate_ema_pinbar_signal(price, ema_fast=ema_2_val, ema_slow=ema_5_val, timestamp=timestamp)

            # Apply reversal logic if in loss streak
            signal = self._apply_reversal_logic(signal)
            
            # Apply profit guarantee logic
            signal = self._apply_profit_guarantee_logic(signal)

            # Track signal generation
            if signal != SignalType.HOLD:
                # Record signal timestamp for fallback mechanism
                self.last_signal_timestamp = timestamp

                # Record trade timestamp for cooldown mechanism
                self.last_trade_timestamp = timestamp

                # Store signal data for potential execution
                # Trade will only be added to active_trades when actually executed

                logger.info(f"Pin Bar signal: {signal.value} at price {price}, Duration: {duration} minute")
                if self.metrics:
                    try:
                        self.metrics.record_signal(signal.value)
                    except Exception:
                        pass

            # Track signal history (simplified)
            self.signal_history.append(
                {
                    "timestamp": timestamp,
                    "price": price,
                    "signal": signal.value,
                    "duration": duration
                }
            )

            # Keep only last 1000 signals
            if len(self.signal_history) > 1000:
                self.signal_history = self.signal_history[-1000:]

            self.last_signal = signal
            return signal, duration

        except Exception as e:
            logger.error(f"Error updating strategy: {e}")
            return SignalType.HOLD, 1

    def _generate_ema_pinbar_signal(self, price: float, ema_fast: float, ema_slow: float, timestamp: int) -> tuple[SignalType, int]:
        """
        Generate EMA + Pin Bar trading signal (simplified, no RSI).

        Args:
            price: Current price
            ema_fast: Fast EMA value (configurable period, default 2)
            ema_slow: Slow EMA value (configurable period, default 5)
            timestamp: Current timestamp

        Returns:
            Tuple of (trading signal, duration in minutes)
        """
        # Need at least 3 prices for pin bar detection
        if len(self.price_history) < 3:
            return SignalType.HOLD, 1

        # Need EMA values to be initialized
        if ema_fast is None or ema_slow is None:
            return SignalType.HOLD, 1

        # Get recent prices for pattern detection
        prices = self.price_history[-3:]
        current = prices[-1]

        # Check EMA slope to avoid choppy markets (very loose threshold)
        ema_slope = abs(ema_fast - ema_slow)
        if ema_slope < self.ema_trend_min_slope:
            logger.debug(f"EMA slope too flat ({ema_slope:.6f}), skipping trade in choppy market")
            return SignalType.HOLD, 1

        # Check EMA trend
        ema_bullish = ema_fast > ema_slow  # Fast EMA above slow EMA = bullish trend
        ema_bearish = ema_fast < ema_slow  # Fast EMA below slow EMA = bearish trend

        # Update MACD for momentum confirmation
        macd_line, macd_signal, macd_histogram = self.macd.update(price)

        # Track MACD crossovers and momentum
        self._track_macd_crossover(macd_line, macd_signal, macd_histogram)

        # Enhanced EMA + Pin Bar Logic with MACD confirmation (1-minute scalping optimized)
        # For 1-minute scalping, be more permissive with MACD confirmation to ensure frequent trades

        signal_generated = False

        if ema_bullish and self._is_bullish_pinbar(prices):
            # MACD confirmation: Look for bullish crossover, growing bullish momentum, or just MACD above signal
            macd_confirms_buy = self._macd_confirms_bullish_permissive(macd_line, macd_signal, macd_histogram)

            if macd_confirms_buy:
                logger.info(f"EMA + MACD + Pin Bar BUY: EMA bullish, MACD confirms, Price={price}")
                return self._generate_pinbar_entry_signal("BUY", prices, current, self.pinbar_duration_ticks)
            else:
                logger.debug(f"EMA + Pin Bar BUY without MACD confirmation: MACD={macd_line:.6f}/{macd_signal:.6f}")

        if ema_bearish and self._is_bearish_pinbar(prices):
            # MACD confirmation: Look for bearish crossover, growing bearish momentum, or just MACD below signal
            macd_confirms_sell = self._macd_confirms_bearish_permissive(macd_line, macd_signal, macd_histogram)

            if macd_confirms_sell:
                logger.info(f"EMA + MACD + Pin Bar SELL: EMA bearish, MACD confirms, Price={price}")
                return self._generate_pinbar_entry_signal("SELL", prices, current, self.pinbar_duration_ticks)
            else:
                logger.debug(f"EMA + Pin Bar SELL without MACD confirmation: MACD={macd_line:.6f}/{macd_signal:.6f}")

        # Fallback mechanism: Generate signal if too much time has passed without any signals
        # This ensures at least 1 trade per minute or within 2 minutes maximum
        current_time = int(time.time())
        time_since_last_signal = current_time - self.last_signal_timestamp

        # If more than 90 seconds since last signal, generate fallback signal (very permissive)
        if time_since_last_signal > 90:  # 1.5 minutes
            if ema_bullish and self._is_bullish_pinbar_loose(prices):
                logger.info(f"FALLBACK BUY SIGNAL: No signals for {time_since_last_signal}s, EMA bullish, Price={price}")
                self.last_signal_timestamp = current_time
                return self._generate_pinbar_entry_signal("BUY", prices, current, self.pinbar_duration_ticks)

            if ema_bearish and self._is_bearish_pinbar_loose(prices):
                logger.info(f"FALLBACK SELL SIGNAL: No signals for {time_since_last_signal}s, EMA bearish, Price={price}")
                self.last_signal_timestamp = current_time
                return self._generate_pinbar_entry_signal("SELL", prices, current, self.pinbar_duration_ticks)

        return SignalType.HOLD, 1

    def _track_macd_crossover(self, macd_line: float, macd_signal: float, histogram: float) -> None:
        """
        Track MACD crossovers and store recent crossover data.

        Args:
            macd_line: Current MACD line value
            macd_signal: Current signal line value
            histogram: Current histogram value
        """
        # Detect crossover (MACD line crossing signal line) - more precise detection
        crossover_detected = False

        # Bullish crossover: MACD was below/equal signal, now above (and not too close)
        if (self.prev_macd_line <= self.prev_macd_signal and
            macd_line > macd_signal and
            abs(macd_line - macd_signal) > abs(self.prev_macd_line - self.prev_macd_signal) * 0.1):
            # Bullish crossover
            crossover_detected = True
            self.macd_crossovers.append({
                "type": "bullish",
                "timestamp": int(time.time()),
                "macd_line": macd_line,
                "signal_line": macd_signal,
                "histogram": histogram
            })

        # Bearish crossover: MACD was above/equal signal, now below (and not too close)
        elif (self.prev_macd_line >= self.prev_macd_signal and
              macd_line < macd_signal and
              abs(macd_line - macd_signal) > abs(self.prev_macd_line - self.prev_macd_signal) * 0.1):
            # Bearish crossover
            crossover_detected = True
            self.macd_crossovers.append({
                "type": "bearish",
                "timestamp": int(time.time()),
                "macd_line": macd_line,
                "signal_line": macd_signal,
                "histogram": histogram
            })

        # Keep only recent crossovers (last 10)
        if len(self.macd_crossovers) > 10:
            self.macd_crossovers = self.macd_crossovers[-10:]

        # Update previous values for next iteration
        self.prev_macd_line = macd_line
        self.prev_macd_signal = macd_signal
        self.prev_histogram = histogram

    def _macd_confirms_bullish(self, macd_line: float, macd_signal: float, histogram: float) -> bool:
        """
        Check if MACD confirms bullish momentum for 1-minute scalping.

        Args:
            macd_line: Current MACD line value
            macd_signal: Current signal line value
            histogram: Current histogram value

        Returns:
            True if MACD confirms bullish momentum
        """
        # Check for recent bullish crossover (within last 15 seconds for 1-minute timeframe)
        current_time = int(time.time())
        recent_bullish_crossovers = [
            crossover for crossover in self.macd_crossovers
            if crossover["type"] == "bullish" and (current_time - crossover["timestamp"]) <= 15
        ]

        if recent_bullish_crossovers:
            return True

        # Check for growing bullish momentum (histogram expanding positively)
        # More strict: histogram should be clearly positive and expanding
        histogram_growth = (histogram > self.prev_histogram and
                           histogram > 0 and
                           abs(histogram) > abs(self.prev_histogram) * 1.1)  # 10% more positive
        macd_above_signal = macd_line > macd_signal

        # Confirm if histogram is growing and MACD is above signal (bullish setup)
        if histogram_growth and macd_above_signal:
            return True

        return False

    def _macd_confirms_bullish_permissive(self, macd_line: float, macd_signal: float, histogram: float) -> bool:
        """
        Permissive MACD confirmation for 1-minute scalping - more lenient to ensure frequent trades.

        Args:
            macd_line: Current MACD line value
            macd_signal: Current signal line value
            histogram: Current histogram value

        Returns:
            True if MACD provides any bullish confirmation
        """
        # Check for recent bullish crossover (within last 20 seconds for 1-minute timeframe)
        current_time = int(time.time())
        recent_bullish_crossovers = [
            crossover for crossover in self.macd_crossovers
            if crossover["type"] == "bullish" and (current_time - crossover["timestamp"]) <= 20
        ]

        if recent_bullish_crossovers:
            return True

        # Check for growing bullish momentum (less strict)
        histogram_growth = histogram > self.prev_histogram and histogram > 0
        macd_above_signal = macd_line > macd_signal

        # Confirm if histogram is growing positively OR MACD is above signal (permissive bullish setup)
        if histogram_growth or macd_above_signal:
            return True

        # For 1-minute scalping, also accept if histogram is positive (even if not growing much)
        if histogram > 0:
            return True

        return False

    def _macd_confirms_bearish_permissive(self, macd_line: float, macd_signal: float, histogram: float) -> bool:
        """
        Permissive MACD confirmation for 1-minute scalping - more lenient to ensure frequent trades.

        Args:
            macd_line: Current MACD line value
            macd_signal: Current signal line value
            histogram: Current histogram value

        Returns:
            True if MACD provides any bearish confirmation
        """
        # Check for recent bearish crossover (within last 20 seconds for 1-minute timeframe)
        current_time = int(time.time())
        recent_bearish_crossovers = [
            crossover for crossover in self.macd_crossovers
            if crossover["type"] == "bearish" and (current_time - crossover["timestamp"]) <= 20
        ]

        if recent_bearish_crossovers:
            return True

        # Check for growing bearish momentum (less strict)
        histogram_growth = histogram < self.prev_histogram and histogram < 0
        macd_below_signal = macd_line < macd_signal

        # Confirm if histogram is growing negatively OR MACD is below signal (permissive bearish setup)
        if histogram_growth or macd_below_signal:
            return True

        # For 1-minute scalping, also accept if histogram is negative (even if not growing much)
        if histogram < 0:
            return True

        return False

    def _macd_confirms_bearish(self, macd_line: float, macd_signal: float, histogram: float) -> bool:
        """
        Check if MACD confirms bearish momentum for 1-minute scalping.

        Args:
            macd_line: Current MACD line value
            macd_signal: Current signal line value
            histogram: Current histogram value

        Returns:
            True if MACD confirms bearish momentum
        """
        # Check for recent bearish crossover (within last 15 seconds for 1-minute timeframe)
        current_time = int(time.time())
        recent_bearish_crossovers = [
            crossover for crossover in self.macd_crossovers
            if crossover["type"] == "bearish" and (current_time - crossover["timestamp"]) <= 15
        ]

        if recent_bearish_crossovers:
            return True

        # Check for growing bearish momentum (histogram expanding negatively)
        # More strict: histogram should be clearly negative and expanding
        histogram_growth = (histogram < self.prev_histogram and
                           histogram < 0 and
                           abs(histogram) > abs(self.prev_histogram) * 1.1)  # 10% more negative
        macd_below_signal = macd_line < macd_signal

        # Confirm if histogram is growing negatively and MACD is below signal (bearish setup)
        if histogram_growth and macd_below_signal:
            return True

        return False

    def _is_bullish_pinbar(self, prices: list) -> bool:
        """
        Check for bullish pin bar pattern.

        Bullish pin bar: long lower wick relative to body, short upper wick.

        Args:
            prices: List of recent prices

        Returns:
            True if bullish pin bar detected
        """
        if len(prices) < 3:
            return False

        current = prices[-1]
        prev = prices[-2]
        prev_prev = prices[-3]

        # Basic bullish pin bar (very loose requirements)
        body_size = abs(current - prev)
        if body_size == 0:  # Avoid division by zero
            return False

        lower_wick = prev - min(prev_prev, current)
        upper_wick = max(prev_prev, current) - prev

        # Very loose pinbar requirements (wick ≥10% of body)
        min_wick_ratio = body_size * self.pinbar_min_wick_ratio

        return (lower_wick >= min_wick_ratio and  # Long lower wick (≥10% of body)
                upper_wick < body_size * 1.5 and   # Upper wick < 1.5x body (loose)
                current > prev_prev)               # Bullish close vs 2 candles ago

    def _is_bearish_pinbar(self, prices: list) -> bool:
        """
        Check for bearish pin bar pattern.

        Bearish pin bar: long upper wick relative to body, short lower wick.

        Args:
            prices: List of recent prices

        Returns:
            True if bearish pin bar detected
        """
        if len(prices) < 3:
            return False

        current = prices[-1]
        prev = prices[-2]
        prev_prev = prices[-3]

        # Basic bearish pin bar (very loose requirements)
        body_size = abs(current - prev)
        if body_size == 0:  # Avoid division by zero
            return False

        upper_wick = max(prev_prev, current) - prev
        lower_wick = prev - min(prev_prev, current)

        # Very loose pinbar requirements (wick ≥10% of body)
        min_wick_ratio = body_size * self.pinbar_min_wick_ratio

        return (upper_wick >= min_wick_ratio and  # Long upper wick (≥10% of body)
                lower_wick < body_size * 1.5 and   # Lower wick < 1.5x body (loose)
                current < prev_prev and            # Bearish close vs 2 candles ago
                prev > prev_prev)                  # Pinbar opened higher (rejection from above)

    def _is_bullish_pinbar_loose(self, prices: list) -> bool:
        """
        Very loose bullish pinbar detection for fallback signals.
        Only requires basic structure, no strict wick ratios.

        Args:
            prices: List of recent prices

        Returns:
            True if basic bullish pinbar structure detected
        """
        if len(prices) < 3:
            return False

        current = prices[-1]
        prev = prices[-2]
        prev_prev = prices[-3]

        # Very basic bullish pinbar: lower close than previous, but higher than 2 candles ago
        return (current > prev_prev and current <= prev)

    def _is_bearish_pinbar_loose(self, prices: list) -> bool:
        """
        Very loose bearish pinbar detection for fallback signals.
        Only requires basic structure, no strict wick ratios.

        Args:
            prices: List of recent prices

        Returns:
            True if basic bearish pinbar structure detected
        """
        if len(prices) < 3:
            return False

        current = prices[-1]
        prev = prices[-2]
        prev_prev = prices[-3]

        # Very basic bearish pinbar: higher close than previous, but lower than 2 candles ago
        return (current < prev_prev and current >= prev)

    def _generate_pinbar_entry_signal(self, signal_type: str, prices: list, current_price: float, duration: int) -> tuple[SignalType, int]:
        """
        Generate entry signal for EMA + Pin Bar strategy with optimized duration.

        Args:
            signal_type: "BUY" or "SELL"
            prices: Recent price history
            current_price: Current price
            duration: Contract duration in minutes

        Returns:
            Tuple of (trading signal, duration in minutes)
        """

        # Use the pin bar high/low as trigger
        if signal_type == "BUY":
            # Bullish pin bar: enter above the high
            trigger_price = max(prices[-3], prices[-2])  # High of pin bar
            entry_price = trigger_price + self.entry_offset
            stop_loss_price = min(prices[-3], prices[-2])  # Low of pin bar
        else:  # SELL
            # Bearish pin bar: enter below the low
            trigger_price = min(prices[-3], prices[-2])  # Low of pin bar
            entry_price = trigger_price - self.entry_offset
            stop_loss_price = max(prices[-3], prices[-2])  # High of pin bar

        # Calculate 1R distance (entry to stop loss)
        risk_distance = abs(entry_price - stop_loss_price)

        # Calculate target price (2.5R from entry)
        if signal_type == "BUY":
            target_price = entry_price + (risk_distance * self.risk_multiple)
        else:  # SELL
            target_price = entry_price - (risk_distance * self.risk_multiple)

        logger.info(f"EMA + Pin Bar {signal_type} at {current_price}, Entry: {entry_price}, SL: {stop_loss_price}, TP: {target_price}, Duration: {duration} minute")

        return SignalType.BUY if signal_type == "BUY" else SignalType.SELL, duration


    def get_contract_duration(self, symbol: str) -> int:
        """
        Get contract duration for a specific symbol.
        
        Args:
            symbol: Trading symbol
            
        Returns:
            Contract duration in seconds
        """
        symbol_durations = config.get("trading.symbol_durations", {})
        return symbol_durations.get(symbol, config.get("trading.contract_duration", 15))

    def _log_signal_details(
        self,
        price: float,
        ema_fast: float,
        ema_slow: float,
        momentum: float,
        volatility: float,
    ) -> None:
        """Log detailed signal information."""
        logger.debug(
            f"Signal details - Price: {price}, EMA Fast: {ema_fast:.6f}, "
            f"EMA Slow: {ema_slow:.6f}, Momentum: {momentum:.6f}, "
            f"Volatility: {volatility:.6f}"
        )

    def get_indicator_values(self) -> Dict[str, float]:
        """
        Get current indicator values.

        Returns:
            Dictionary of indicator values
        """
        macd_line, macd_signal, macd_histogram = self.macd.get_value()
        indicators = {
            "ema_2": self.ema_2.get_value(),
            "ema_5": self.ema_5.get_value(),
            "momentum": self.momentum.get_value(),
            "volatility": self.volatility.get_value(),
            "macd_line": macd_line,
            "macd_signal": macd_signal,
            "macd_histogram": macd_histogram,
            "last_price": self.last_price or 0.0,
        }

        # Record MACD metrics for Prometheus
        if self.metrics:
            try:
                self.metrics.update_indicators(indicators)
            except Exception:
                pass

        return indicators

    def get_signal_statistics(self) -> Dict[str, Any]:
        """
        Get signal generation statistics.

        Returns:
            Statistics dictionary
        """
        if not self.signal_history:
            return {
                "total_signals": 0,
                "buy_signals": 0,
                "sell_signals": 0,
                "hold_signals": 0,
            }

        total = len(self.signal_history)
        buy_count = sum(1 for s in self.signal_history if s["signal"] == "BUY")
        sell_count = sum(1 for s in self.signal_history if s["signal"] == "SELL")
        hold_count = sum(1 for s in self.signal_history if s["signal"] == "HOLD")

        return {
            "total_signals": total,
            "buy_signals": buy_count,
            "sell_signals": sell_count,
            "hold_signals": hold_count,
            "buy_percentage": (buy_count / total) * 100,
            "sell_percentage": (sell_count / total) * 100,
            "hold_percentage": (hold_count / total) * 100,
        }

    def reset(self) -> None:
        """Reset all indicators and state."""
        # Reset EMA indicators
        self.ema_2.reset()
        self.ema_5.reset()

        # Reset other indicators
        self.momentum = IncrementalMomentum(lookback=5)
        self.volatility = IncrementalVolatility(config.volatility_window)
        self.bollinger_bands = BollingerBands(period=20, std_dev=2.0)

        # Reset MACD
        self.macd = IncrementalMACD(
            fast_period=config.get("indicators.macd_fast_period", 6),
            slow_period=config.get("indicators.macd_slow_period", 13),
            signal_period=config.get("indicators.macd_signal_period", 5)
        )

        # Reset MACD tracking
        self.prev_macd_line = 0.0
        self.prev_macd_signal = 0.0
        self.prev_histogram = 0.0
        self.macd_crossovers = []

        # Reset EMAs with new periods
        self.ema_2 = IncrementalEMA(config.get("indicators.ema_fast_period", 2))
        self.ema_5 = IncrementalEMA(config.get("indicators.ema_slow_period", 5))

        # Reset active trades
        self.active_trades = []

        # Reset tick counter
        self.tick_count = 0

        # Reset state
        self.last_signal = SignalType.HOLD
        self.last_price = None
        self.signal_history.clear()
        self.last_signal_timestamp = 0
        self.last_trade_timestamp = 0

        logger.info("Strategy engine reset - EMA + Pin Bar mode")

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
            "indicators": self.get_indicator_values(),
            "statistics": self.get_signal_statistics(),
            "last_signal": self.last_signal.value,
            "pin_bar_state": {
                "price_history_length": len(self.price_history),
            },
            "macd_state": {
                "crossovers_count": len(self.macd_crossovers),
                "recent_crossovers": self.macd_crossovers[-3:] if self.macd_crossovers else [],
                "current_values": {
                    "macd_line": self.macd.get_value()[0],
                    "signal_line": self.macd.get_value()[1],
                    "histogram": self.macd.get_value()[2],
                }
            },
            "parameters": {
                "momentum_threshold": self.momentum_threshold,
                "volatility_min": self.volatility_min,
                "volatility_max": self.volatility_max,
                "entry_offset": self.entry_offset,
                "risk_multiple": self.risk_multiple,
                "pinbar_duration_ticks": self.pinbar_duration_ticks,
                "pinbar_min_wick_ratio": self.pinbar_min_wick_ratio,
                "ema_trend_min_slope": self.ema_trend_min_slope,
                "macd_fast_period": config.get("indicators.macd_fast_period", 5),
                "macd_slow_period": config.get("indicators.macd_slow_period", 13),
                "macd_signal_period": config.get("indicators.macd_signal_period", 5),
            },
        }
