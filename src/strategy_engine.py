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
    IncrementalATR,
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

        # Trend indicators (5/8 EMA for Rise/Fall optimization)
        self.ema_5 = IncrementalEMA(config.get("indicators.ema_fast_period", 5))   # Fast EMA (5-period)
        self.ema_8 = IncrementalEMA(config.get("indicators.ema_slow_period", 8))  # Slow EMA (8-period)

        # Additional indicators for filtering
        self.momentum = IncrementalMomentum(lookback=5)
        self.volatility = IncrementalVolatility(config.volatility_window)
        self.bollinger_bands = BollingerBands(period=20, std_dev=2.0)
        # Stochastic (1,1,1) for 1-minute timeframe
        self.stochastic = IncrementalStochastic(k_period=1, d_period=1, slowing=1)

        # MACD for trend confirmation (1-second data strategy)
        macd_fast = config.get("indicators.macd_fast_period", 2)
        macd_slow = config.get("indicators.macd_slow_period", 5)
        macd_signal = config.get("indicators.macd_signal_period", 1)
        logger.info(f"MACD Configuration: Fast={macd_fast}, Slow={macd_slow}, Signal={macd_signal}")
        self.macd = IncrementalMACD(
            fast_period=macd_fast,
            slow_period=macd_slow,
            signal_period=macd_signal
        )

        # ATR for dynamic SL/TP calculation
        self.atr = IncrementalATR(period=config.get("indicators.atr_period", 14))

        # MACD crossover and momentum tracking
        self.prev_macd_line = 0.0
        self.prev_macd_signal = 0.0
        self.prev_histogram = 0.0
        self.macd_crossovers = []  # Track recent crossovers

        # Strategy parameters - EMA + Pin Bar
        self.momentum_threshold = config.momentum_threshold
        self.volatility_min = config.get("indicators.volatility_min", 0.0001)
        self.volatility_max = config.get("indicators.volatility_max", 0.01)

        # Trade management parameters - ENHANCED COOLDOWN
        self.trade_cooldown_seconds = config.get("strategy.trade_cooldown_seconds", 60)  # Increased to 60 seconds for proper cooldown
        self.max_concurrent_trades = config.get("strategy.max_concurrent_trades", 1)
        self.ultra_short_trade_threshold = config.get("strategy.ultra_short_trade_threshold", 15)

        # EMA + Pin Bar parameters
        self.entry_offset = 0.0003  # 3-5 points entry offset (0.03%)
        self.risk_multiple = 2.5  # 2.5R target
        self.ema_trend_duration = 1  # 1 minute for EMA-confirmed pin bars

        # EMA + Pin Bar settings
        self.pinbar_duration_ticks = config.get("strategy.pinbar_duration_ticks", 1)  # 1 minute for EMA2/EMA5 strategy
        self.pinbar_min_wick_ratio = config.get("strategy.pinbar_min_wick_ratio", 3.0)  # 3x wick-to-body ratio (research requirement)
        # No EMA slope requirement - matches proven strategy exactly

        # State tracking - Simplified for pin bars only
        self.last_signal = SignalType.HOLD
        self.last_price = None
        self.signal_history = []
        self.last_signal_timestamp = 0  # Track when last signal was generated
        self.last_trade_timestamp = time.time() - 20  # Track when last trade was placed (start 20s ago to allow immediate trading)

        # Cooldown mechanism to prevent rapid back-to-back trades/signals
        self.signal_cooldown_seconds = 10  # 10 seconds cooldown between signals for faster trading

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
                    current_ema_fast = self.ema_5.get_value()
                    current_ema_slow = self.ema_8.get_value()

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

    def register_executed_trade(self, signal: str, entry_time: int, entry_tick: int, duration: int, barrier: float = 0, trade_id: str = None) -> None:
        """
        Register an executed trade in the active_trades list.

        Args:
            signal: Trading signal (BUY/SELL)
            entry_time: Timestamp when trade was executed
            entry_tick: Tick count when trade was executed
            duration: Trade duration in minutes
            barrier: Barrier price for the trade (for early closure logic)
            trade_id: Trade identifier for closing trades
        """
        # Store current EMA values for monitoring (handle case where EMAs might be None)
        current_ema_fast = self.ema_5.get_value()
        current_ema_slow = self.ema_8.get_value()

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
            "barrier": barrier,
            "trade_id": trade_id,
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

    def calculate_risk_reward(self, stake: float, multiplier: float, macd_histogram: float = 0.0, current_price: float = None) -> tuple[float, float]:
        """
        Calculate ATR-based risk/reward targets for position sizing (NOT for SL/TP execution).

        NOTE: For CALL/PUT binary options, SL/TP is NOT supported by Deriv API.
        These calculations are for risk management and position sizing only.

        Args:
            stake: Stake amount
            multiplier: Risk multiplier
            macd_histogram: MACD histogram for signal strength
            current_price: Current price for ATR-based calculation

        Returns:
            Tuple of (risk_amount, reward_target) - for position sizing, not execution
        """
        # Get current ATR value for volatility-based risk calculation
        atr_value = self.atr.get_value()

        if atr_value is None or atr_value <= 0:
            # Fallback to percentage-based risk calculation
            logger.warning("ATR not available, using percentage-based risk calculation")
            risk_percent = config.get('trading.stop_loss_pct', 0.8)  # 80% of stake at risk
            reward_percent = config.get('trading.take_profit_pct', 0.2)  # 20% profit target
            risk_amount = round(stake * risk_percent, 2)
            reward_target = round(stake * reward_percent, 2)
            return risk_amount, reward_target
        else:
            logger.info(f"ATR ready: {atr_value:.6f}, using ATR-based risk calculation")

        # ATR-based risk calculation for position sizing
        # Use ATR multiplier for dynamic risk sizing based on volatility
        base_atr_multiplier = config.get('trading.atr_multiplier_risk', 1.0)  # 1.0x ATR for risk

        # Adjust based on signal strength (MACD histogram)
        if abs(macd_histogram) > 0.5:
            # Strong signal - can accept higher risk for higher reward
            atr_multiplier = 0.8  # Lower risk for strong signals (confidence)
        elif abs(macd_histogram) > 0.3:
            # Medium signal - moderate risk
            atr_multiplier = 1.0
        else:
            # Weak signal - higher risk caution
            atr_multiplier = 1.2  # Higher risk multiplier for weak signals

        # Calculate risk amount based on ATR (volatility-adjusted)
        risk_amount = atr_value * base_atr_multiplier * atr_multiplier

        # For binary options, reward is typically 80% of stake (fixed payout)
        # We can't control this - it's determined by the contract
        reward_target = stake * 0.8  # Typical binary options payout

        # Cap risk at 90% of stake to leave some buffer
        risk_amount = min(risk_amount, stake * 0.9)

        logger.info(f"ATR-based risk calculation: ATR={atr_value:.6f}, Risk={risk_amount:.2f}, Reward={reward_target:.2f}, Signal={macd_histogram:.6f}")

        return round(risk_amount, 2), round(reward_target, 2)

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
            logger.debug(f"Tick count incremented to: {self.tick_count}")

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

            # Check for active trades - prevent signal generation when trades are active
            if len(self.active_trades) > 0:
                logger.warning(f"Active trade(s) in progress - SKIPPING signal generation. Active trades: {len(self.active_trades)}")
                return SignalType.HOLD, 1

            # Check signal cooldown period (prevents rapid back-to-back signals)
            current_time = time.time()
            time_since_last_signal = current_time - self.last_signal_timestamp

            if time_since_last_signal < self.signal_cooldown_seconds:
                remaining_cooldown = self.signal_cooldown_seconds - time_since_last_signal
                logger.debug(f"Signal cooldown active: {time_since_last_signal:.1f}s < {self.signal_cooldown_seconds}s required ({remaining_cooldown:.1f}s remaining)")
                return SignalType.HOLD, 1

        # Note: Cooldown check moved to trade execution phase, not signal generation
        # This allows the strategy to generate signals but prevents rapid trade execution

            # Update price history for pin bar detection (last 20 prices)
            self.price_history.append(price)
            if len(self.price_history) > 20:
                self.price_history = self.price_history[-20:]
            logger.info(f"Updated price history. Length: {len(self.price_history)}, Latest: {self.price_history[-1] if self.price_history else 'None'}")

            # Update EMA indicators
            ema_5_val = self.ema_5.update(price)
            ema_8_val = self.ema_8.update(price)

            # Update momentum indicator
            momentum_val = self.momentum.update(price)

            # Update ATR indicator with tick data (approximation)
            # Since we don't have OHLC, we'll use consecutive price differences as proxy for volatility
            # This is an approximation - for better ATR, we'd need actual OHLC data
            if len(self.price_history) >= 2:
                prev_price = self.price_history[-2]
                high = max(price, prev_price)
                low = min(price, prev_price)
                atr_val = self.atr.update(high, low, price)
            else:
                # For first price, use current price for all OHLC (ATR will be 0 initially)
                atr_val = self.atr.update(price, price, price)

            self.last_price = price

            # Generate EMA + Pin Bar signal (only when no active trades and cooldown passed)
            signal, duration = self._generate_ema_pinbar_signal(price, ema_fast=ema_5_val, ema_slow=ema_8_val, timestamp=timestamp)

            # Apply reversal logic if in loss streak
            signal = self._apply_reversal_logic(signal)
            
            # Apply profit guarantee logic
            signal = self._apply_profit_guarantee_logic(signal)

            # Track signal generation
            if signal != SignalType.HOLD:
                # Record signal timestamp for cooldown mechanism (use current time for accuracy)
                self.last_signal_timestamp = time.time()

                # Note: last_trade_timestamp is only updated when a trade is actually executed, not when signals are generated

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
            stake = config.get('trading.stake', 10.0)  # Retrieve from config
            multiplier = config.get('trading.multiplier', 50)  # Retrieve from config
            macd_line, macd_signal, macd_histogram = self.macd.get_value()
            risk_amount, reward_target = self.calculate_risk_reward(stake, multiplier, macd_histogram, price)
            # Store risk/reward for position sizing, but return signal, duration, and risk info
            self.current_risk_reward = {'risk': risk_amount, 'reward': reward_target}  # Store internally
            return signal, duration, {'risk': risk_amount, 'reward': reward_target}  # Return for position sizing
        except Exception as e:
            logger.error(f"Error in update method: {e}")
            return SignalType.HOLD, 1, None  # Return None for SL/TP values in error case

    def _check_market_conditions(self, price: float, ema_fast: float, ema_slow: float, macd_histogram: float) -> tuple[bool, str]:
        """
        Check if market conditions are suitable for trading.

        Args:
            price: Current price
            ema_fast: Fast EMA value
            ema_slow: Slow EMA value
            macd_histogram: MACD histogram value

        Returns:
            Tuple of (conditions_ok, reason)
        """
        # Check for extreme volatility (DISABLED for testing)
        atr_value = self.atr.get_value()
        if atr_value and atr_value > 0:
            volatility_ratio = atr_value / price
            max_volatility_ratio = config.get('strategy.max_volatility_ratio', 1.0)  # 100% - disabled
            if volatility_ratio > max_volatility_ratio:
                return False, f"Extreme volatility: ATR/Price = {volatility_ratio:.4f} > {max_volatility_ratio:.4f}"

        # Check for flat/choppy markets (DISABLED for testing)
        # Use absolute points for more reliable detection in flat markets
        ema_spread_pct = abs(ema_fast - ema_slow) / price
        ema_spread_points = abs(ema_fast - ema_slow)
        min_ema_spread = config.get('strategy.min_ema_spread', 0.0)  # 0% - disabled

        if ema_spread_pct < min_ema_spread:
            return False, f"Choppy/flat market: EMA spread = {ema_spread_points:.2f} points ({ema_spread_pct:.6f}) < {min_ema_spread:.6f}"

        # Check for low MACD momentum (DISABLED for testing)
        min_macd_momentum = config.get('strategy.min_macd_momentum', 0.0)  # 0 - disabled
        if abs(macd_histogram) < min_macd_momentum:
            return False, f"Low MACD momentum: |histogram| = {abs(macd_histogram):.6f} < {min_macd_momentum:.6f}"

        # Check for price stability (too many price changes in short time)
        if len(self.price_history) >= 10:
            recent_prices = self.price_history[-10:]
            price_changes = [abs(recent_prices[i] - recent_prices[i-1]) / recent_prices[i-1]
                           for i in range(1, len(recent_prices))]
            avg_price_change = sum(price_changes) / len(price_changes)
            max_avg_change = config.get('strategy.max_avg_price_change', 1.0)  # 100% - disabled
            if avg_price_change > max_avg_change:
                return False, f"Unstable price action: avg change = {avg_price_change:.4f} > {max_avg_change:.4f}"

        return True, "Market conditions OK"

    def _generate_ema_pinbar_signal(self, price: float, ema_fast: float, ema_slow: float, timestamp: int) -> tuple[SignalType, int]:
        """
        Generate Exponential EMA crossover signal optimized for Rise/Fall contracts.

        Args:
            price: Current price
            ema_fast: Fast EMA value (configurable period, default 5)
            ema_slow: Slow EMA value (configurable period, default 13)
            timestamp: Current timestamp

        Returns:
            Tuple of (trading signal, duration in minutes)
        """
        logger.info(f"Generating Exponential EMA signal for price: {price}, EMA: {ema_fast:.6f}/{ema_slow:.6f}")

        # Need EMA values to be initialized
        if ema_fast is None or ema_slow is None:
            logger.debug("EMA values not initialized yet")
            return SignalType.HOLD, 1

        # EXPONENTIAL EMA STRATEGY: Proper EMA crossover for Rise/Fall optimization
        # Check if exponential EMA strategy is enabled
        exponential_ema_enabled = config.get('strategy.exponential_ema_strategy', True)
        
        if exponential_ema_enabled:
            # Exponential EMA crossover strategy for Rise/Fall
            ema_bullish = ema_fast > ema_slow
            ema_bearish = ema_fast < ema_slow
            
            # Calculate EMA spread for signal strength
            ema_spread = abs(ema_fast - ema_slow) / price
            min_spread = config.get('strategy.ema_crossover_threshold', 0.0001)  # 0.01% minimum spread
            
            # Check for EMA crossover confirmation
            crossover_confirmation = config.get('strategy.ema_crossover_confirmation', True)
            trend_persistence = config.get('strategy.ema_trend_persistence', 2)
            
            # Track trend persistence for crossover confirmation
            if not hasattr(self, 'ema_trend_count'):
                self.ema_trend_count = 0
                self.last_ema_trend = None
            
            # Update trend persistence counter
            current_trend = "bullish" if ema_bullish else "bearish" if ema_bearish else "neutral"
            if current_trend == self.last_ema_trend:
                self.ema_trend_count += 1
            else:
                self.ema_trend_count = 1
                self.last_ema_trend = current_trend
            
            logger.info(f"Exponential EMA Analysis: Fast={ema_fast:.6f}, Slow={ema_slow:.6f}, Bullish={ema_bullish}, Bearish={ema_bearish}, Spread={ema_spread:.6f}, Trend Count={self.ema_trend_count}")
            
            # BUY SIGNAL: Fast EMA above Slow EMA (bullish trend)
            if (ema_bullish and 
                ema_spread > min_spread and 
                (not crossover_confirmation or self.ema_trend_count >= trend_persistence)):
                logger.info(f"BUY SIGNAL: Exponential EMA crossover - Fast EMA above Slow EMA")
                logger.info(f"   EMA: {ema_fast:.6f}>{ema_slow:.6f} (spread: {ema_spread:.6f}, trend count: {self.ema_trend_count})")
                return SignalType.BUY, self.pinbar_duration_ticks
            
            # SELL SIGNAL: Fast EMA below Slow EMA (bearish trend)
            if (ema_bearish and 
                ema_spread > min_spread and 
                (not crossover_confirmation or self.ema_trend_count >= trend_persistence)):
                logger.info(f"SELL SIGNAL: Exponential EMA crossover - Fast EMA below Slow EMA")
                logger.info(f"   EMA: {ema_fast:.6f}<{ema_slow:.6f} (spread: {ema_spread:.6f}, trend count: {self.ema_trend_count})")
                return SignalType.SELL, self.pinbar_duration_ticks
            
            # FALLBACK SIGNAL: Use MACD analysis with reduced EMA strictness
            if not (ema_bullish or ema_bearish) or ema_spread <= min_spread:
                logger.info("No clear EMA signal - checking MACD fallback")
                return self._generate_macd_fallback_signal(price, ema_fast, ema_slow, timestamp)
            
            # No signal - EMAs too close, no clear trend, or insufficient persistence
            if ema_spread <= min_spread:
                logger.debug(f"No signal: EMA spread {ema_spread:.6f} <= {min_spread:.6f}")
            elif crossover_confirmation and self.ema_trend_count < trend_persistence:
                logger.debug(f"No signal: Trend persistence {self.ema_trend_count} < {trend_persistence}")
            else:
                logger.debug(f"No signal: No clear EMA trend")
            return SignalType.HOLD, 1
        
        else:
            # Original complex strategy (fallback)
            return self._generate_complex_signal(price, ema_fast, ema_slow, timestamp)

    def _generate_macd_fallback_signal(self, price: float, ema_fast: float, ema_slow: float, timestamp: int) -> tuple[SignalType, int]:
        """
        Generate fallback signal using MACD analysis with reduced EMA strictness.
        
        Args:
            price: Current price
            ema_fast: Fast EMA value
            ema_slow: Slow EMA value
            timestamp: Current timestamp
            
        Returns:
            Tuple of (trading signal, duration in minutes)
        """
        try:
            # Check if MACD fallback is enabled
            if not config.get('strategy.macd_fallback_enabled', True):
                logger.debug("MACD fallback signals disabled")
                return SignalType.HOLD, 1
            
            # Get MACD values
            macd_line, macd_signal, macd_histogram = self.macd.get_value()
            
            # Check if MACD is ready
            if not self.macd.is_ready():
                logger.info(f"MACD not ready for fallback signal - need more data")
                return SignalType.HOLD, 1
            
            # Calculate EMA spread with reduced strictness for fallback
            ema_spread = abs(ema_fast - ema_slow) / price
            fallback_strictness = config.get('strategy.macd_fallback_ema_strictness', 0.5)
            fallback_min_spread = config.get('strategy.ema_crossover_threshold', 0.0001) * fallback_strictness
            
            # Check if we have any EMA trend (even weak)
            ema_bullish = ema_fast > ema_slow
            ema_bearish = ema_fast < ema_slow
            
            logger.info(f"MACD Fallback Analysis: MACD Line={macd_line:.6f}, Histogram={macd_histogram:.6f}, EMA Spread={ema_spread:.6f}")
            
            # FALLBACK BUY SIGNAL: MACD line above zero AND histogram high above zero
            if (macd_line > 0 and macd_histogram > 0 and 
                (ema_bullish or ema_spread > fallback_min_spread)):
                logger.info(f"FALLBACK BUY SIGNAL: MACD line above zero ({macd_line:.6f}) and histogram positive ({macd_histogram:.6f})")
                return SignalType.BUY, self.pinbar_duration_ticks
            
            # FALLBACK SELL SIGNAL: MACD line below zero AND histogram low below zero
            if (macd_line < 0 and macd_histogram < 0 and 
                (ema_bearish or ema_spread > fallback_min_spread)):
                logger.info(f"FALLBACK SELL SIGNAL: MACD line below zero ({macd_line:.6f}) and histogram negative ({macd_histogram:.6f})")
                return SignalType.SELL, self.pinbar_duration_ticks
            
            # No fallback signal available
            logger.debug("No MACD fallback signal available")
            return SignalType.HOLD, 1
            
        except Exception as e:
            logger.error(f"Error in MACD fallback signal generation: {e}")
            return SignalType.HOLD, 1
    
    def _generate_complex_signal(self, price: float, ema_fast: float, ema_slow: float, timestamp: int) -> tuple[SignalType, int]:
        """
        Generate complex EMA + Pin Bar + MACD signal (original strategy).
        
        Args:
            price: Current price
            ema_fast: Fast EMA value
            ema_slow: Slow EMA value
            timestamp: Current timestamp
            
        Returns:
            Tuple of (trading signal, duration in minutes)
        """
        logger.info(f"Generating complex EMA + Pin Bar signal for price: {price}, EMA: {ema_fast}/{ema_slow}")

        # Check market conditions first
        macd_line, macd_signal, macd_histogram = self.macd.get_value()
        conditions_ok, reason = self._check_market_conditions(price, ema_fast, ema_slow, macd_histogram)

        if not conditions_ok:
            logger.info(f"Market conditions not suitable for trading: {reason}")
            return SignalType.HOLD, 1

        # Need at least 3 prices for pin bar detection
        if len(self.price_history) < 3:
            return SignalType.HOLD, 1

        # Get recent prices for pattern detection
        prices = self.price_history[-3:]
        current = prices[-1]

        # Check EMA trend (EMA5/EMA8 logic)
        ema_bullish = ema_fast > ema_slow  # EMA5 above EMA8 = bullish trend
        ema_bearish = ema_fast < ema_slow  # EMA5 below EMA8 = bearish trend

        # Debug logging for EMA values
        logger.info(f"EMA Analysis: Fast={ema_fast:.6f}, Slow={ema_slow:.6f}, Bullish={ema_bullish}, Bearish={ema_bearish}")

        # Update MACD for momentum confirmation
        macd_line, macd_signal, macd_histogram = self.macd.update(price)

        # Debug logging for MACD values
        logger.info(f"MACD Analysis: Line={macd_line:.6f}, Signal={macd_signal:.6f}, Hist={macd_histogram:.6f}, Ready={self.macd.is_ready()}")

        # Update previous MACD values for histogram change tracking
        self.prev_macd_line = macd_line
        self.prev_macd_signal = macd_signal
        self.prev_histogram = macd_histogram

        # Track MACD crossovers and momentum
        self._track_macd_crossover(macd_line, macd_signal, macd_histogram)

        # Check if MACD is properly initialized (EMAs need time to warm up)
        macd_ready = self.macd.is_ready()
        
        # Debug MACD status
        if not macd_ready:
            current_updates, required_updates = self.macd.get_initialization_status()
            logger.info(f"MACD not ready: {current_updates}/{required_updates} updates, tick {self.tick_count}")

        # MACD confirmation - very permissive for volatile markets
        if macd_ready:
            macd_strength_threshold = config.get('strategy.macd_strength_threshold', 0.05)
            macd_confirms_buy = (macd_line > macd_signal and
                               abs(macd_histogram) > macd_strength_threshold)
            macd_confirms_sell = (macd_line < macd_signal and
                                abs(macd_histogram) > macd_strength_threshold)
        else:
            # MACD not ready yet, use EMA trend confirmation
            macd_confirms_buy = (ema_fast > ema_slow)  # Just EMA trend
            macd_confirms_sell = (ema_fast < ema_slow)  # Just EMA trend
            logger.debug(f"MACD not ready (tick {self.tick_count}), using EMA-only: fast={ema_fast:.6f}, slow={ema_slow:.6f}")

        # EMA trend strength confirmation
        ema_trend_strength = abs(ema_fast - ema_slow) / price
        ema_trend_threshold = config.get('strategy.ema_trend_threshold', 0.001)  # 0.1%
        ema_confirms_bullish = ema_bullish and ema_trend_strength > ema_trend_threshold
        ema_confirms_bearish = ema_bearish and ema_trend_strength > ema_trend_threshold

        # Check for pin bar patterns
        logger.info(f"Price History Length: {len(self.price_history)}")
        if len(self.price_history) >= 3:
            recent_prices = self.price_history[-5:] if len(self.price_history) >= 5 else self.price_history[-3:]
            bullish_pinbar = self._is_bullish_pinbar(recent_prices)
            bearish_pinbar = self._is_bearish_pinbar(recent_prices)
            logger.info(f"Pin Bar Analysis: Bullish={bullish_pinbar}, Bearish={bearish_pinbar}, RecentPrices={recent_prices}")
        else:
            bullish_pinbar = False
            bearish_pinbar = False
            logger.info(f"Pin Bar Analysis: Waiting for price history (need 3+ prices), Current: {len(self.price_history)}")

        # BUY SIGNAL: EMA + MACD + Pin Bar confirmation
        if macd_ready:
            buy_conditions = (
                ema_confirms_bullish and
                macd_confirms_buy and
                bullish_pinbar
            )
        else:
            buy_conditions = ema_confirms_bullish and bullish_pinbar

        if buy_conditions:
            logger.info(f"BUY SIGNAL: EMA + MACD + Pin Bar confirmation")
            logger.info(f"   EMA: {ema_fast:.6f}>{ema_slow:.6f} (strength: {ema_trend_strength:.4f})")
            if macd_ready:
                logger.info(f"   MACD: {macd_line:.6f}>{macd_signal:.6f} (hist: {macd_histogram:.6f})")
            logger.info(f"   Pin Bar: Bullish pattern detected")
            return SignalType.BUY, self.pinbar_duration_ticks

        # SELL SIGNAL: EMA + MACD + Pin Bar confirmation
        if macd_ready:
            sell_conditions = (
                ema_confirms_bearish and
                macd_confirms_sell and
                bearish_pinbar
            )
        else:
            sell_conditions = ema_confirms_bearish and bearish_pinbar

        if sell_conditions:
            logger.info(f"SELL SIGNAL: EMA + MACD + Pin Bar confirmation")
            logger.info(f"   EMA: {ema_fast:.6f}<{ema_slow:.6f} (strength: {ema_trend_strength:.4f})")
            if macd_ready:
                logger.info(f"   MACD: {macd_line:.6f}<{macd_signal:.6f} (hist: {macd_histogram:.6f})")
            logger.info(f"   Pin Bar: Bearish pattern detected")
            return SignalType.SELL, self.pinbar_duration_ticks

        # Debug logging to understand why signals aren't being generated
        logger.info(f"Signal conditions check:")
        logger.info(f"  EMA bullish: {ema_confirms_bullish}, bearish: {ema_confirms_bearish}")
        logger.info(f"  MACD buy: {macd_confirms_buy}, sell: {macd_confirms_sell}")
        logger.info(f"  MACD ready: {macd_ready}")
        logger.info(f"  Pin Bar: Bullish={bullish_pinbar}, Bearish={bearish_pinbar}")

        # No signal - all conditions must align simultaneously
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

    def _macd_histogram_increasing(self, macd_line: float, macd_signal: float, histogram: float) -> bool:
        """
        Check if MACD histogram shows increasing bullish momentum.

        Args:
            macd_line: Current MACD line value
            macd_signal: Current signal line value
            histogram: Current histogram value

        Returns:
            True if histogram is increasing (bullish momentum)
        """
        # Check if histogram is positive and growing (increasing bullish momentum)
        if histogram > 0 and histogram > self.prev_histogram:
            return True

        # Check if histogram is crossing from negative to positive (bullish reversal)
        if self.prev_histogram < 0 and histogram > 0:
            return True

        # Check for bullish divergence (histogram growing while negative but MACD improving)
        if (histogram < 0 and histogram > self.prev_histogram and
            macd_line > self.prev_macd_line):
            return True

        # For ultra-fast settings, also accept if histogram is positive (even if not growing much)
        if histogram > 0:
            return True

        return False

    def _macd_histogram_decreasing(self, macd_line: float, macd_signal: float, histogram: float) -> bool:
        """
        Check if MACD histogram shows decreasing bearish momentum.

        Args:
            macd_line: Current MACD line value
            macd_signal: Current signal line value
            histogram: Current histogram value

        Returns:
            True if histogram is decreasing (bearish momentum)
        """
        # Check if histogram is negative and growing more negative (increasing bearish momentum)
        if histogram < 0 and histogram < self.prev_histogram:
            return True

        # Check if histogram is crossing from positive to negative (bearish reversal)
        if self.prev_histogram > 0 and histogram < 0:
            return True

        # Check for bearish divergence (histogram growing negative while MACD deteriorating)
        if (histogram > 0 and histogram < self.prev_histogram and
            macd_line < self.prev_macd_line):
            return True

        # For ultra-fast settings, also accept if histogram is negative (even if not growing much)
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
        Simplified bullish pin bar detection for tick data.
        
        For tick-based trading, we look for price rejection patterns:
        - Price moved down significantly then recovered
        - Current price is higher than recent low
        - Shows buying pressure after a dip

        Args:
            prices: List of recent prices (last 5 prices)

        Returns:
            True if bullish pin bar pattern detected
        """
        if len(prices) < 3:
            return False

        # Get recent price data
        current_price = prices[-1]
        recent_prices = prices[-5:] if len(prices) >= 5 else prices
        
        # Find the low and high of recent prices
        recent_low = min(recent_prices)
        recent_high = max(recent_prices)
        
        # Simple bullish pin bar: price dipped then recovered
        # Check if current price is significantly above the recent low
        price_range = recent_high - recent_low
        if price_range > 0:
            # Current price should be in upper 60% of recent range
            price_position = (current_price - recent_low) / price_range
            
            # Check for lower wick: was there a significant dip?
            has_lower_wick = (recent_low < min(prices[-3:]))  # Low was below recent prices
            
            # Bullish pin bar: price in upper range with lower wick
            bullish_pinbar = (
                price_position > 0.6 and  # Price in upper 60% of range
                has_lower_wick and        # Had a lower wick (dip)
                current_price > recent_low  # Current price above the low
            )
            
            if bullish_pinbar:
                logger.info(f"Bullish Pin Bar pattern detected: Close in upper range, has lower wick")
            return bullish_pinbar

        return False

    def _is_bearish_pinbar(self, prices: list) -> bool:
        """
        Simplified bearish pin bar detection for tick data.
        
        For tick-based trading, we look for price rejection patterns:
        - Price moved up significantly then fell back
        - Current price is lower than recent high
        - Shows selling pressure after a spike

        Args:
            prices: List of recent prices (last 5 prices)

        Returns:
            True if bearish pin bar pattern detected
        """
        if len(prices) < 3:
            return False

        # Get recent price data
        current_price = prices[-1]
        recent_prices = prices[-5:] if len(prices) >= 5 else prices
        
        # Find the low and high of recent prices
        recent_low = min(recent_prices)
        recent_high = max(recent_prices)
        
        # Simple bearish pin bar: price spiked then fell back
        # Check if current price is significantly below the recent high
        price_range = recent_high - recent_low
        if price_range > 0:
            # Current price should be in lower 60% of recent range
            price_position = (current_price - recent_low) / price_range
            
            # Check for upper wick: was there a significant spike?
            has_upper_wick = (recent_high > max(prices[-3:]))  # High was above recent prices
            
            # Bearish pin bar: price in lower range with upper wick
            bearish_pinbar = (
                price_position < 0.4 and  # Price in lower 60% of range
                has_upper_wick and        # Had an upper wick (spike)
                current_price < recent_high  # Current price below the high
            )
            
            if bearish_pinbar:
                logger.info(f"Bearish Pin Bar pattern detected: Close in lower range, has upper wick")
            return bearish_pinbar

        return False

    def _is_previous_candle_bullish(self, prices: list) -> bool:
        """
        Check if the previous candle (just completed) was bullish.

        Args:
            prices: List of recent prices

        Returns:
            True if previous candle was bullish (closed higher)
        """
        if len(prices) < 3:
            return False

        prev_candle = prices[-2]  # Previous candle close
        prev_prev_candle = prices[-3]  # Candle before previous

        # Previous candle was bullish if it closed higher than the candle before it
        return prev_candle > prev_prev_candle

    def _is_previous_candle_bearish(self, prices: list) -> bool:
        """
        Check if the previous candle (just completed) was bearish.

        Args:
            prices: List of recent prices

        Returns:
            True if previous candle was bearish (closed lower)
        """
        if len(prices) < 3:
            return False

        prev_candle = prices[-2]  # Previous candle close
        prev_prev_candle = prices[-3]  # Candle before previous

        # Previous candle was bearish if it closed lower than the candle before it
        return prev_candle < prev_prev_candle

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
            "ema_5": self.ema_5.get_value(),
            "ema_8": self.ema_8.get_value(),
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
        self.ema_5.reset()
        self.ema_8.reset()

        # Reset other indicators
        self.momentum = IncrementalMomentum(lookback=5)
        self.volatility = IncrementalVolatility(config.volatility_window)
        self.bollinger_bands = BollingerBands(period=20, std_dev=2.0)

        # Reset MACD with 1-second data settings
        self.macd = IncrementalMACD(
            fast_period=config.get("indicators.macd_fast_period", 2),
            slow_period=config.get("indicators.macd_slow_period", 5),
            signal_period=config.get("indicators.macd_signal_period", 1)
        )

        # Reset MACD tracking
        self.prev_macd_line = 0.0
        self.prev_macd_signal = 0.0
        self.prev_histogram = 0.0
        self.macd_crossovers = []

        # Reset EMAs with new periods
        self.ema_5 = IncrementalEMA(config.get("indicators.ema_fast_period", 5))
        self.ema_8 = IncrementalEMA(config.get("indicators.ema_slow_period", 8))

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
                "macd_fast_period": config.get("indicators.macd_fast_period", 2),
                "macd_slow_period": config.get("indicators.macd_slow_period", 5),
                "macd_signal_period": config.get("indicators.macd_signal_period", 1),
            },
        }
