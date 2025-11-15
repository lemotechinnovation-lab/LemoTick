"""
Strategy engine for LemoTick bot.
Implements signal generation logic using technical indicators.
"""

import time
from typing import Dict, Any, Optional
from enum import Enum
from indicators.indicators import (
    IncrementalEMA,
    IncrementalMomentum,
    IncrementalVolatility,
    BollingerBands,
    IncrementalStochastic,
    IncrementalMACD,
    IncrementalATR,
    IncrementalRSI,  #  Added for RSI filtering
    IncrementalROC,  #  Price Rate of Change fallback
)
from infrastructure.config import config
from infrastructure.logger import logger
from infrastructure.metrics import get_metrics

#  NEW: Multi-timeframe filter
try:
    from filters.multi_timeframe import MultiTimeframeAnalyzer
    MTF_AVAILABLE = True
except ImportError:
    MultiTimeframeAnalyzer = None
    logger.warning("Multi-timeframe analyzer not available")
    MTF_AVAILABLE = False

#  NEW: High-frequency trading strategies
try:
    from strategies.mean_reversion import MeanReversionStrategy
    MR_AVAILABLE = True
except ImportError:
    MeanReversionStrategy = None
    logger.warning("Mean reversion strategy not available")
    MR_AVAILABLE = False

try:
    from strategies.tick_patterns import TickPatternRecognizer
    TICK_PATTERN_AVAILABLE = True
except ImportError:
    TickPatternRecognizer = None
    logger.warning("Tick pattern recognizer not available")
    TICK_PATTERN_AVAILABLE = False

try:
    from strategies.statistical_arbitrage import StatisticalArbitrage
    STAT_ARB_AVAILABLE = True
except ImportError:
    StatisticalArbitrage = None
    logger.warning("Statistical arbitrage not available")
    STAT_ARB_AVAILABLE = False

try:
    from core.signal_queue import SignalQueue
    SIGNAL_QUEUE_AVAILABLE = True
except ImportError:
    SignalQueue = None
    logger.warning("Signal queue not available")
    SIGNAL_QUEUE_AVAILABLE = False

try:
    from analytics.adaptive_scorer import AdaptiveSignalScorer
    ML_AVAILABLE = True
except ImportError:
    AdaptiveSignalScorer = None
    logger.warning("ML adaptive scorer not available")
    ML_AVAILABLE = False

#  NEW: Candlestick pattern strategy
try:
    from strategies.candlestick_strategy import CandlestickStrategy
    CANDLESTICK_AVAILABLE = True
except ImportError:
    CandlestickStrategy = None
    logger.warning("Candlestick strategy not available")
    CANDLESTICK_AVAILABLE = False


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

        # Triple EMA Strategy - Dynamically configured
        ema_short_period = config.get("indicators.ema_short_period", 8)
        ema_medium_period = config.get("indicators.ema_medium_period", 21)
        ema_long_period = config.get("indicators.ema_long_period", 50)
        
        self.ema_short = IncrementalEMA(ema_short_period)
        self.ema_medium = IncrementalEMA(ema_medium_period)
        self.ema_long = IncrementalEMA(ema_long_period)
        
        logger.info(f"EMA Configuration: Short={ema_short_period}, Medium={ema_medium_period}, Long={ema_long_period}")
        
        # Backward compatibility with metrics code that uses ema_5 and ema_8
        self.ema_5 = self.ema_short  # Alias for backward compatibility
        self.ema_8 = self.ema_medium  # Alias for backward compatibility
        
        # EMAs for Mean Reversion Strategy trend confirmation
        ema_7_period = config.get("indicators.ema_7_period", 7)
        ema_15_period = config.get("indicators.ema_15_period", 15)
        self.ema_7 = IncrementalEMA(period=ema_7_period)
        self.ema_15 = IncrementalEMA(period=ema_15_period)
        logger.info(f"Mean Reversion EMAs: EMA7={ema_7_period}, EMA15={ema_15_period}")

        # Additional indicators for filtering
        self.momentum = IncrementalMomentum(lookback=5)
        self.volatility = IncrementalVolatility(config.volatility_window)
        self.bollinger_bands = BollingerBands(period=20, std_dev=2.0)
        # Stochastic (1,1,1) for 1-minute timeframe
        self.stochastic = IncrementalStochastic(k_period=1, d_period=1, slowing=1)
        
        #  RSI for overbought/oversold and trend exhaustion filtering
        rsi_period = config.get("indicators.rsi_period", 14)
        self.rsi = IncrementalRSI(period=rsi_period)
        self.rsi_overbought = config.get("indicators.rsi_overbought", 75)
        self.rsi_oversold = config.get("indicators.rsi_oversold", 25)

        # MACD for trend confirmation - Optimized for 5-min balanced scalping
        macd_fast = config.get("indicators.macd_fast_period", 8)
        macd_slow = config.get("indicators.macd_slow_period", 21)
        macd_signal = config.get("indicators.macd_signal_period", 7)
        logger.info(f"MACD Configuration: Fast={macd_fast}, Slow={macd_slow}, Signal={macd_signal}")
        self.macd = IncrementalMACD(
            fast_period=macd_fast,
            slow_period=macd_slow,
            signal_period=macd_signal
        )

        # ATR for dynamic SL/TP calculation - Optimized for scalping
        self.atr = IncrementalATR(period=config.get("indicators.atr_period", 10))

        # MACD crossover and momentum tracking
        self.prev_macd_line = 0.0
        self.prev_macd_signal = 0.0
        self.prev_histogram = 0.0
        self.macd_crossovers = []  # Track recent crossovers

        # Strategy parameters - EMA + Pin Bar
        self.momentum_threshold = config.momentum_threshold
        self.volatility_min = config.get("indicators.volatility_min", 0.0001)
        self.volatility_max = config.get("indicators.volatility_max", 0.01)

        # Trade management parameters - HIGH FREQUENCY (1 trade at a time)
        self.trade_cooldown_seconds = config.get("adaptive_trading.trade_cooldown_seconds", 0)  # No cooldown
        self.max_concurrent_trades = config.get("risk_management.max_concurrent_trades", 1)  # Read from risk_management config
        self.ultra_short_trade_threshold = config.get("strategy.ultra_short_trade_threshold", 30)

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
        self.signal_cooldown_seconds = config.get("adaptive_trading.signal_cooldown_seconds", 0)  # No cooldown for ultra HFT

        # Price history for pin bar detection
        self.price_history = []  # Store recent prices for pin bar detection

        # Active trade tracking for monitoring
        self.active_trades = []  # List of {"signal": str, "entry_time": int, "entry_tick": int, "ticks_elapsed": int}
        
        # Loss reversal tracking
        self.consecutive_losses = 0
        self.max_consecutive_losses = config.get("strategy.max_consecutive_losses", 2)
        self.reversal_enabled = config.get("strategy.loss_reversal_enabled", False)  # DISABLED - causes wrong signals
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

        #  NEW: Multi-timeframe analyzer
        self.mtf_enabled = config.get("strategy.multi_timeframe_enabled", False)
        if self.mtf_enabled and MTF_AVAILABLE and MultiTimeframeAnalyzer is not None:
            self.mtf_analyzer = MultiTimeframeAnalyzer()
            logger.info("Multi-timeframe analyzer initialized")
        else:
            self.mtf_analyzer = None
            if self.mtf_enabled:
                logger.warning("Multi-timeframe enabled in config but module not available")

        #  NEW: Mean Reversion Strategy
        self.mean_reversion_enabled = config.get("strategy.mean_reversion_enabled", False)
        if self.mean_reversion_enabled and MR_AVAILABLE and MeanReversionStrategy is not None:
            self.mean_reversion = MeanReversionStrategy(
                bollinger_bands=self.bollinger_bands,
                stochastic=self.stochastic,
                ema7=self.ema_7,
                ema15=self.ema_15
            )
            logger.info("Mean Reversion Strategy initialized with EMA7/EMA15 trend confirmation")
        else:
            self.mean_reversion = None
            if self.mean_reversion_enabled:
                logger.warning("Mean reversion enabled in config but module not available")

        #  NEW: Tick Pattern Recognizer
        self.tick_pattern_enabled = config.get("strategy.tick_pattern_enabled", False)
        if self.tick_pattern_enabled and TICK_PATTERN_AVAILABLE and TickPatternRecognizer is not None:
            self.tick_pattern_recognizer = TickPatternRecognizer()
            logger.info("Tick Pattern Recognizer initialized")
        else:
            self.tick_pattern_recognizer = None
            if self.tick_pattern_enabled:
                logger.warning("Tick pattern enabled in config but module not available")

        #  NEW: Statistical Arbitrage
        self.pairs_trading_enabled = config.get("strategy.pairs_trading_enabled", False)
        if self.pairs_trading_enabled and STAT_ARB_AVAILABLE and StatisticalArbitrage is not None:
            self.stat_arb = StatisticalArbitrage()
            logger.info("Statistical Arbitrage initialized")
        else:
            self.stat_arb = None
            if self.pairs_trading_enabled:
                logger.warning("Pairs trading enabled in config but module not available")

        #  NEW: Signal Queue System
        self.signal_queue_enabled = config.get("strategy.signal_queue_enabled", False)
        if self.signal_queue_enabled and SIGNAL_QUEUE_AVAILABLE and SignalQueue is not None:
            queue_size = config.get("strategy.signal_queue_size", 10)
            max_age = config.get("strategy.signal_queue_max_age", 30)
            self.signal_queue = SignalQueue(max_size=queue_size, max_age_seconds=max_age)
            logger.info(f"Signal Queue initialized (size: {queue_size}, max_age: {max_age}s)")
        else:
            self.signal_queue = None
            if self.signal_queue_enabled:
                logger.warning("Signal queue enabled in config but module not available")

        #  NEW: ML Adaptive Scorer
        self.ml_scoring_enabled = config.get("strategy.ml_scoring_enabled", False)
        if self.ml_scoring_enabled and ML_AVAILABLE and AdaptiveSignalScorer is not None:
            min_samples = config.get("strategy.ml_min_training_samples", 100)
            retrain_interval = config.get("strategy.ml_retrain_interval", 50)
            self.adaptive_scorer = AdaptiveSignalScorer(
                min_samples=min_samples,
                retrain_interval=retrain_interval
            )
            self.last_signal_features = None  # Store features for outcome recording
            logger.info(f"ML Adaptive Scorer initialized (min_samples: {min_samples}, retrain: {retrain_interval})")
        else:
            self.adaptive_scorer = None
            self.last_signal_features = None
            if self.ml_scoring_enabled:
                logger.warning("ML scoring enabled in config but module not available")

        #  NEW: Candlestick Pattern Strategy
        self.candlestick_enabled = config.get("strategy.candlestick_strategy_enabled", False)
        logger.info(f"CANDLESTICK DEBUG: enabled={self.candlestick_enabled}, available={CANDLESTICK_AVAILABLE}, strategy_class={CandlestickStrategy is not None}")
        if self.candlestick_enabled and CANDLESTICK_AVAILABLE and CandlestickStrategy is not None:
            min_confidence = config.get("strategy.candlestick_min_confidence", 0.70)
            require_trend = config.get("strategy.candlestick_require_trend", True)
            require_momentum = config.get("strategy.candlestick_require_momentum", False)
            ema_fast = config.get("indicators.ema_short_period", 6)
            ema_slow = config.get("indicators.ema_medium_period", 18)
            ticks_per_candle = config.get("strategy.candlestick_ticks_per_candle", 60)
            
            self.candlestick_strategy = CandlestickStrategy(
                min_pattern_confidence=min_confidence,
                require_trend_confirmation=require_trend,
                require_momentum_confirmation=require_momentum,
                ema_fast_period=ema_fast,
                ema_slow_period=ema_slow,
                rsi_period=self.rsi.period if hasattr(self, 'rsi') else 14,
                rsi_overbought=config.get("indicators.rsi_overbought", 70),
                rsi_oversold=config.get("indicators.rsi_oversold", 30)
            )
            # Set ticks per candle
            self.candlestick_strategy.ticks_per_candle = ticks_per_candle
            
            logger.info(f"Candlestick Pattern Strategy initialized:")
            logger.info(f"  Confidence threshold: {min_confidence:.0%}")
            logger.info(f"  Trend confirmation: {require_trend} (6 EMA / 18 EMA)")
            logger.info(f"  Timeframe: {ticks_per_candle} ticks = ~{ticks_per_candle//60} minute candles")
        else:
            self.candlestick_strategy = None
            if self.candlestick_enabled:
                logger.warning("Candlestick strategy enabled in config but module not available")

        #  NEW: ROC (Rate of Change) Fallback - Always fires if no other signals
        self.roc_fallback_enabled = config.get("strategy.roc_fallback_enabled", False)
        if self.roc_fallback_enabled:
            roc_period = config.get("strategy.roc_period", 18)
            self.roc_min_threshold = config.get("strategy.roc_min_threshold", 0.01)
            self.roc = IncrementalROC(period=roc_period)
            logger.info(f"ROC Fallback initialized: period={roc_period}, min_threshold={self.roc_min_threshold}%")
            logger.info(f"   ROC will fire when NO candlestick or tick patterns detected")
        else:
            self.roc = None
            self.roc_min_threshold = 0.01

        # Metrics
        try:
            self.metrics = get_metrics()
        except Exception:
            self.metrics = None

        logger.info("Strategy engine initialized successfully")

    def get_indicators(self) -> Dict[str, float]:
        """Get current indicator values for metrics."""
        try:
            indicators = {}
            
            # Get EMA values - use get_value() method with defensive checks
            try:
                ema_fast_val_raw = self.ema_short.get_value() if hasattr(self.ema_short, 'get_value') else None
                if isinstance(ema_fast_val_raw, tuple):
                    ema_fast_val = float(ema_fast_val_raw[0]) if len(ema_fast_val_raw) > 0 else 0.0
                    logger.warning(f"EMA fast get_value() returned tuple, using first element: {ema_fast_val}")
                elif ema_fast_val_raw is not None:
                    ema_fast_val = float(ema_fast_val_raw)
                else:
                    ema_fast_val = None
                if ema_fast_val is not None:
                    indicators['ema_fast'] = ema_fast_val
            except Exception as e:
                logger.warning(f"Error getting EMA fast value: {e}")
                
            try:
                ema_slow_val_raw = self.ema_medium.get_value() if hasattr(self.ema_medium, 'get_value') else None
                if isinstance(ema_slow_val_raw, tuple):
                    ema_slow_val = float(ema_slow_val_raw[0]) if len(ema_slow_val_raw) > 0 else 0.0
                    logger.warning(f"EMA slow get_value() returned tuple, using first element: {ema_slow_val}")
                elif ema_slow_val_raw is not None:
                    ema_slow_val = float(ema_slow_val_raw)
                else:
                    ema_slow_val = None
                if ema_slow_val is not None:
                    indicators['ema_slow'] = ema_slow_val
            except Exception as e:
                logger.warning(f"Error getting EMA slow value: {e}")
            
            # Get momentum value with defensive checks
            if hasattr(self.momentum, 'get_value'):
                try:
                    mom_val_raw = self.momentum.get_value()
                    if isinstance(mom_val_raw, tuple):
                        mom_val = float(mom_val_raw[0]) if len(mom_val_raw) > 0 else 0.0
                        logger.warning(f"Momentum get_value() returned tuple, using first element: {mom_val}")
                    elif mom_val_raw is not None:
                        mom_val = float(mom_val_raw)
                    else:
                        mom_val = None
                    if mom_val is not None:
                        indicators['momentum'] = mom_val
                except Exception as e:
                    logger.warning(f"Error getting momentum value: {e}")
            
            # Get volatility value with defensive checks
            if hasattr(self.volatility, 'get_value'):
                try:
                    vol_val_raw = self.volatility.get_value()
                    if isinstance(vol_val_raw, tuple):
                        vol_val = float(vol_val_raw[0]) if len(vol_val_raw) > 0 else 0.0
                        logger.warning(f"Volatility get_value() returned tuple, using first element: {vol_val}")
                    elif vol_val_raw is not None:
                        vol_val = float(vol_val_raw)
                    else:
                        vol_val = None
                    if vol_val is not None:
                        indicators['volatility'] = vol_val
                except Exception as e:
                    logger.warning(f"Error getting volatility value: {e}")
            
            # Get RSI value - use actual RSI indicator, not stochastic
            if hasattr(self.rsi, 'get_value'):
                try:
                    rsi_val_raw = self.rsi.get_value()
                    # Ensure RSI is a single float value, not a tuple
                    if isinstance(rsi_val_raw, tuple):
                        rsi_val = float(rsi_val_raw[0]) if len(rsi_val_raw) > 0 else 50.0
                        logger.warning(f"RSI get_value() returned tuple, using first element: {rsi_val}")
                    elif rsi_val_raw is not None:
                        rsi_val = float(rsi_val_raw)
                    else:
                        rsi_val = 50.0  # Default neutral RSI
                    indicators['rsi'] = rsi_val
                except Exception as e:
                    logger.warning(f"Error getting RSI value: {e}, using default 50.0")
                    indicators['rsi'] = 50.0
            
            # Get MACD values with defensive checks
            try:
                if hasattr(self.macd, 'macd_line') and self.macd.macd_line is not None:
                    macd_line_val = self.macd.macd_line
                    if isinstance(macd_line_val, tuple):
                        macd_line_val = float(macd_line_val[0]) if len(macd_line_val) > 0 else 0.0
                        logger.warning(f"MACD line attribute is a tuple, using first element: {macd_line_val}")
                    indicators['macd_line'] = float(macd_line_val)
            except Exception as e:
                logger.warning(f"Error getting MACD line value: {e}")
                
            try:
                if hasattr(self.macd, 'signal_line') and self.macd.signal_line is not None:
                    macd_signal_val = self.macd.signal_line
                    if isinstance(macd_signal_val, tuple):
                        macd_signal_val = float(macd_signal_val[0]) if len(macd_signal_val) > 0 else 0.0
                        logger.warning(f"MACD signal attribute is a tuple, using first element: {macd_signal_val}")
                    indicators['macd_signal'] = float(macd_signal_val)
            except Exception as e:
                logger.warning(f"Error getting MACD signal value: {e}")
                
            try:
                if hasattr(self.macd, 'histogram') and self.macd.histogram is not None:
                    macd_hist_val = self.macd.histogram
                    if isinstance(macd_hist_val, tuple):
                        macd_hist_val = float(macd_hist_val[0]) if len(macd_hist_val) > 0 else 0.0
                        logger.warning(f"MACD histogram attribute is a tuple, using first element: {macd_hist_val}")
                    indicators['macd_histogram'] = float(macd_hist_val)
            except Exception as e:
                logger.warning(f"Error getting MACD histogram value: {e}")
            
            # Get ATR value with defensive checks
            if hasattr(self.atr, 'get_value'):
                try:
                    atr_val_raw = self.atr.get_value()
                    if isinstance(atr_val_raw, tuple):
                        atr_val = float(atr_val_raw[0]) if len(atr_val_raw) > 0 else 0.0
                        logger.warning(f"ATR get_value() returned tuple, using first element: {atr_val}")
                    elif atr_val_raw is not None:
                        atr_val = float(atr_val_raw)
                    else:
                        atr_val = None
                    if atr_val is not None:
                        indicators['atr'] = atr_val
                except Exception as e:
                    logger.warning(f"Error getting ATR value: {e}")
            
            return indicators
            
        except Exception as e:
            logger.error(f"Error getting indicators: {e}")
            import traceback
            logger.error(f"Traceback: {traceback.format_exc()}")
            return {}

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
                    logger.info(f"DAILY PROFIT TARGET REACHED: ${self.current_daily_profit:.2f}")
                
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
            
            #  NEW: Update ML model with trade outcome
            if self.ml_scoring_enabled and self.adaptive_scorer and self.last_signal_features is not None:
                won = (result == "win")
                self.adaptive_scorer.record_trade_outcome(self.last_signal_features, won)
                logger.debug(f"ML model updated with trade outcome: {'WIN' if won else 'LOSS'}")
                
                # Clear features after recording
                self.last_signal_features = None
                    
        except Exception as e:
            logger.error(f"Error updating trade result: {e}")

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

    def register_executed_trade(
        self,
        signal: str,
        entry_time: int,
        entry_tick: int,
        duration: int,
        barrier: float = 0,
        trade_id: Optional[str] = None
    ) -> None:
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
        # Fetch current EMA values safely
        current_ema_fast = getattr(self.ema_5, "get_value", lambda: None)()
        current_ema_slow = getattr(self.ema_8, "get_value", lambda: None)()
    
        # Determine initial trend flags
        original_ema_bullish = current_ema_fast is not None and current_ema_slow is not None and current_ema_fast > current_ema_slow
        original_ema_bearish = current_ema_fast is not None and current_ema_slow is not None and current_ema_fast < current_ema_slow
    
        # Append trade to active trades
        self.active_trades.append({
            "signal": signal,
            "entry_time": entry_time,
            "entry_tick": entry_tick,
            "ticks_elapsed": 0,
            "duration": duration,
            "barrier": barrier,
            "trade_id": trade_id or "",
            "original_ema_bullish": original_ema_bullish,
            "original_ema_bearish": original_ema_bearish,
            "ema_fast_value": current_ema_fast,
            "ema_slow_value": current_ema_slow
        })
    
        logger.info(f"Registered executed trade {trade_id or 'N/A'}: {signal} at tick {entry_tick}, duration {duration} min, EMA bullish={original_ema_bullish}, EMA bearish={original_ema_bearish}")


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

    def calculate_risk_reward(self, stake: float, multiplier: float, macd_histogram: float = 0.0, current_price: Optional[float] = None) -> tuple[float, float]:
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
        # Get current ATR value for volatility-based risk calculation with defensive checks
        try:
            atr_value_raw = self.atr.get_value()
            # Ensure ATR is a single float value, not a tuple
            if isinstance(atr_value_raw, tuple):
                atr_value = float(atr_value_raw[0]) if len(atr_value_raw) > 0 else None
                logger.warning(f"ATR get_value() returned tuple in calculate_risk_reward, using first element: {atr_value}")
            elif atr_value_raw is not None:
                atr_value = float(atr_value_raw)
            else:
                atr_value = None
        except Exception as e:
            logger.error(f"Error getting ATR value in calculate_risk_reward: {e}", exc_info=True)
            atr_value = None

        if atr_value is None or atr_value <= 0:
            # Fallback to percentage-based risk calculation
            logger.warning("ATR not available, using percentage-based risk calculation")
            risk_percent = config.get('trading.stop_loss_pct', 0.35)  # 80% of stake at risk
            reward_percent = config.get('trading.take_profit_pct', 0.20)  # 0% profit target
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
        risk_amount = float(atr_value) * base_atr_multiplier * atr_multiplier

        # For binary options, reward is typically 80% of stake (fixed payout)
        # We can't control this - it's determined by the contract
        reward_target = stake * 0.8  # Typical binary options payout

        # Cap risk at 90% of stake to leave some buffer
        risk_amount = min(risk_amount, stake * 0.9)

        logger.info(f"ATR-based risk calculation: ATR={atr_value:.6f}, Risk={risk_amount:.2f}, Reward={reward_target:.2f}, Signal={macd_histogram:.6f}")

        return round(risk_amount, 2), round(reward_target, 2)

    def update(self, price: float, timestamp: int) -> tuple[SignalType, int, Optional[Dict[str, float]]]:
        """
        Update strategy with new price data and generate Pin Bar signal.

        Args:
            price: Current price
            timestamp: Price timestamp

        Returns:
            Generated trading signal
        """
        logger.debug(f"STRATEGY ENGINE UPDATE: Called with price={price}, timestamp={timestamp}")
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

            # Check for active trades - only block if max concurrent reached
            if len(self.active_trades) >= self.max_concurrent_trades:
                logger.debug(f"Max concurrent trades reached ({len(self.active_trades)}/{self.max_concurrent_trades}) - SKIPPING signal generation")
                return SignalType.HOLD, 1, None

            # Check signal cooldown period (prevents rapid back-to-back signals)
            current_time = time.time()
            time_since_last_signal = current_time - self.last_signal_timestamp

            if self.signal_cooldown_seconds > 0 and time_since_last_signal < self.signal_cooldown_seconds:
                remaining_cooldown = self.signal_cooldown_seconds - time_since_last_signal
                logger.debug(f"Signal cooldown active: {time_since_last_signal:.1f}s < {self.signal_cooldown_seconds}s required ({remaining_cooldown:.1f}s remaining)")
                return SignalType.HOLD, 1, None

            # Note: Cooldown check moved to trade execution phase, not signal generation
            # This allows the strategy to generate signals but prevents rapid trade execution

            # Update price history for pin bar detection (last 20 prices)
            self.price_history.append(price)
            if len(self.price_history) > 20:
                self.price_history = self.price_history[-20:]
            logger.info(f"Updated price history. Length: {len(self.price_history)}, Latest: {self.price_history[-1] if self.price_history else 'None'}")
            
            #  NEW: Update multi-timeframe analyzer
            if self.mtf_analyzer:
                self.mtf_analyzer.update(price, timestamp)

            # ===================================================================
            # UPDATE INDICATORS - CANDLESTICK MODE: ONLY 6 EMA & 18 EMA
            # ===================================================================
            
            # ALWAYS UPDATE: 6 EMA and 18 EMA (needed for candlestick trend confirmation)
            # Add defensive checks for tuple returns
            try:
                ema_short_raw = self.ema_short.update(price)
                if isinstance(ema_short_raw, tuple):
                    ema_short_val = float(ema_short_raw[0]) if len(ema_short_raw) > 0 else price
                    logger.warning(f"EMA short update() returned tuple, using first element: {ema_short_val}")
                else:
                    ema_short_val = float(ema_short_raw) if ema_short_raw is not None else price
            except Exception as e:
                logger.error(f"Error updating EMA short: {e}", exc_info=True)
                ema_short_val = price  # Fallback to current price
            
            try:
                ema_medium_raw = self.ema_medium.update(price)
                if isinstance(ema_medium_raw, tuple):
                    ema_medium_val = float(ema_medium_raw[0]) if len(ema_medium_raw) > 0 else price
                    logger.warning(f"EMA medium update() returned tuple, using first element: {ema_medium_val}")
                else:
                    ema_medium_val = float(ema_medium_raw) if ema_medium_raw is not None else price
            except Exception as e:
                logger.error(f"Error updating EMA medium: {e}", exc_info=True)
                ema_medium_val = price  # Fallback to current price
            
            # Update backward compatibility aliases
            self.ema_5 = self.ema_short
            self.ema_8 = self.ema_medium
            
            # Update EMA7 and EMA15 for Mean Reversion Strategy
            if self.mean_reversion_enabled:
                try:
                    self.ema_7.update(price)
                    self.ema_15.update(price)
                except Exception as e:
                    logger.error(f"Error updating EMA7/EMA15: {e}", exc_info=True)
            
            # MINIMAL INDICATOR MODE: Skip heavy indicators when using candlestick + tick patterns
            if (self.candlestick_enabled or self.tick_pattern_enabled) and not self.mean_reversion_enabled and not self.pairs_trading_enabled:
                #  CANDLESTICK + TICK PATTERN MODE: Only 6/18 EMA (tick patterns need no indicators)
                ema_long_val = None
                momentum_val = 0
                rsi_val = 50  # Neutral value (not used)
                macd_line, macd_signal_line, macd_histogram = 0, 0, 0
                atr_val = 0
                
                if self.candlestick_enabled and self.tick_pattern_enabled:
                    logger.debug("Candlestick + Tick Pattern mode: Using ONLY 6/18 EMA")
                else:
                    logger.debug("Minimal mode: Using ONLY 6/18 EMA")
            else:
                # Heavy strategies enabled: Update all indicators
                # Add defensive checks for tuple returns
                try:
                    ema_long_raw = self.ema_long.update(price)
                    if isinstance(ema_long_raw, tuple):
                        ema_long_val = float(ema_long_raw[0]) if len(ema_long_raw) > 0 else price
                        logger.warning(f"EMA long update() returned tuple, using first element: {ema_long_val}")
                    else:
                        ema_long_val = float(ema_long_raw) if ema_long_raw is not None else price
                except Exception as e:
                    logger.error(f"Error updating EMA long: {e}", exc_info=True)
                    ema_long_val = price  # Fallback to current price
                
                try:
                    momentum_raw = self.momentum.update(price)
                    if isinstance(momentum_raw, tuple):
                        momentum_val = float(momentum_raw[0]) if len(momentum_raw) > 0 else 0.0
                        logger.warning(f"Momentum update() returned tuple, using first element: {momentum_val}")
                    else:
                        momentum_val = float(momentum_raw) if momentum_raw is not None else 0.0
                except Exception as e:
                    logger.error(f"Error updating momentum: {e}", exc_info=True)
                    momentum_val = 0.0  # Neutral fallback
                
                # Update RSI with defensive checks for tuple returns
                try:
                    rsi_val_raw = self.rsi.update(price)
                    if isinstance(rsi_val_raw, tuple):
                        rsi_val = float(rsi_val_raw[0]) if len(rsi_val_raw) > 0 else 50.0
                        logger.warning(f"RSI update() returned tuple, using first element: {rsi_val}")
                    else:
                        rsi_val = float(rsi_val_raw) if rsi_val_raw is not None else 50.0
                except Exception as e:
                    logger.error(f"Error updating RSI: {e}", exc_info=True)
                    rsi_val = 50.0  # Neutral fallback
                
                # Update MACD with defensive checks
                try:
                    macd_result = self.macd.update(price)
                    if isinstance(macd_result, tuple) and len(macd_result) >= 3:
                        macd_line = float(macd_result[0])
                        macd_signal_line = float(macd_result[1])
                        macd_histogram = float(macd_result[2])
                    elif isinstance(macd_result, tuple) and len(macd_result) > 0:
                        # Handle unexpected tuple length
                        macd_line = float(macd_result[0]) if len(macd_result) > 0 else 0.0
                        macd_signal_line = float(macd_result[1]) if len(macd_result) > 1 else 0.0
                        macd_histogram = float(macd_result[2]) if len(macd_result) > 2 else 0.0
                        logger.warning(f"MACD update() returned unexpected tuple length {len(macd_result)}, using available values")
                    else:
                        logger.error(f"MACD update() returned unexpected type: {type(macd_result)}")
                        macd_line, macd_signal_line, macd_histogram = 0.0, 0.0, 0.0
                except Exception as e:
                    logger.error(f"Error updating MACD: {e}", exc_info=True)
                    macd_line, macd_signal_line, macd_histogram = 0.0, 0.0, 0.0
                
                # Update ATR with defensive checks
                try:
                    if len(self.price_history) >= 2:
                        prev_price = self.price_history[-2]
                        high = max(price, prev_price)
                        low = min(price, prev_price)
                        atr_val_raw = self.atr.update(high, low, price)
                    else:
                        atr_val_raw = self.atr.update(price, price, price)
                    
                    # Ensure ATR is a single float value, not a tuple
                    if isinstance(atr_val_raw, tuple):
                        atr_val = float(atr_val_raw[0]) if len(atr_val_raw) > 0 else 0.0
                        logger.warning(f"ATR update() returned tuple, using first element: {atr_val}")
                    elif atr_val_raw is not None:
                        atr_val = float(atr_val_raw)
                    else:
                        atr_val = 0.0
                except Exception as e:
                    logger.error(f"Error updating ATR: {e}", exc_info=True)
                    atr_val = 0.0
                
                if self.tick_count > 10:
                    logger.debug(f"All indicators updated: MACD={macd_histogram:.6f}, RSI={rsi_val:.1f}, ATR={atr_val:.6f}")

            self.last_price = price
            
            #  UPDATE ROC (Rate of Change) for fallback
            if self.roc_fallback_enabled and self.roc:
                roc_val = self.roc.update(price)
                if roc_val is not None and self.tick_count % 50 == 0:  # Log every 50 ticks
                    logger.debug(f"ROC updated: {roc_val:.3f}%")

            #  NEW: HFT Strategy Cascade (Priority Order)
            logger.debug(f"STRATEGY ENGINE: Calling _generate_hft_signal_cascade for price {price}")
            signal, duration, metadata = self._generate_hft_signal_cascade(price, timestamp, macd_histogram)
            logger.debug(f"STRATEGY ENGINE: _generate_hft_signal_cascade returned signal={signal}, duration={duration}")

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
            
            # Get MACD values with defensive checks for tuple returns
            try:
                macd_result = self.macd.get_value()
                if isinstance(macd_result, tuple) and len(macd_result) >= 3:
                    macd_line = float(macd_result[0])
                    macd_signal = float(macd_result[1])
                    macd_histogram = float(macd_result[2])
                elif isinstance(macd_result, tuple) and len(macd_result) > 0:
                    # Handle unexpected tuple length
                    macd_line = float(macd_result[0]) if len(macd_result) > 0 else 0.0
                    macd_signal = float(macd_result[1]) if len(macd_result) > 1 else 0.0
                    macd_histogram = float(macd_result[2]) if len(macd_result) > 2 else 0.0
                    logger.warning(f"MACD get_value() returned unexpected tuple length {len(macd_result)}, using available values")
                else:
                    logger.error(f"MACD get_value() returned unexpected type: {type(macd_result)}")
                    macd_line, macd_signal, macd_histogram = 0.0, 0.0, 0.0
            except Exception as e:
                logger.error(f"Error getting MACD values: {e}", exc_info=True)
                macd_line, macd_signal, macd_histogram = 0.0, 0.0, 0.0
            
            risk_amount, reward_target = self.calculate_risk_reward(stake, multiplier, macd_histogram, price)
            # Store risk/reward for position sizing
            self.current_risk_reward = {'risk': risk_amount, 'reward': reward_target}  # Store internally
            
            # CRITICAL FIX: Return metadata from _generate_hft_signal_cascade (contains signal_data with timing info)
            # Add risk/reward to metadata if it doesn't already have it
            if metadata is None:
                metadata = {}
            if 'risk' not in metadata:
                metadata['risk'] = risk_amount
            if 'reward' not in metadata:
                metadata['reward'] = reward_target
            
            return signal, duration, metadata  # Return full metadata including signal_data
        except Exception as e:
            logger.error(f"Error in update method: {e}")
            return SignalType.HOLD, 1, None  # Return None for SL/TP values in error case

    def get_adaptive_duration(self, volatility: float) -> int:
        """
        Adjust contract duration based on current market volatility.
        
        High volatility: Shorter contracts (3 min) - capture quick moves
        Normal volatility: Medium contracts (5 min) - balanced (DEFAULT)
        Low volatility: Longer contracts (7-10 min) - give trends time to develop
        
        Args:
            volatility: Current market volatility (ATR value)
            
        Returns:
            Optimal contract duration in minutes
        """
        # Check if adaptive duration is enabled
        if not config.get("strategy.volatility_adaptive_enabled", False):
            return config.get("trading.contract_duration", 3)  # Return fixed duration
        
        # Get ATR for volatility measurement with defensive checks
        try:
            atr_value_raw = self.atr.get_value()
            # Ensure ATR is a single float value, not a tuple
            if isinstance(atr_value_raw, tuple):
                atr_value = float(atr_value_raw[0]) if len(atr_value_raw) > 0 else None
                logger.warning(f"ATR get_value() returned tuple in get_adaptive_duration, using first element: {atr_value}")
            elif atr_value_raw is not None:
                atr_value = float(atr_value_raw)
            else:
                atr_value = None
        except Exception as e:
            logger.error(f"Error getting ATR value in get_adaptive_duration: {e}", exc_info=True)
            atr_value = None
        
        if atr_value is None or atr_value <= 0:
            logger.debug("ATR not available, using default 5-minute contracts")
            return 5  # Default 5 minutes
        
        # Classify volatility regime and select optimal duration
        if atr_value > 0.0025:
            # Very high volatility - use short contracts
            duration = 3
            logger.info(f"HIGH volatility ({atr_value:.6f}): 3-min contracts for quick captures")
        elif atr_value > 0.0012:
            # Medium-high volatility
            duration = 5
            logger.info(f"MEDIUM volatility ({atr_value:.6f}): 5-min contracts (optimal)")
        elif atr_value > 0.0005:
            # Normal/low volatility - use longer for better signal development
            duration = 7
            logger.info(f"LOW-MEDIUM volatility ({atr_value:.6f}): 7-min contracts")
        else:
            # Very low volatility - ranging market, use longer for reversions
            duration = 10
            logger.info(f" LOW volatility ({atr_value:.6f}): 10-min contracts for ranging market")
        
        return duration

    def calculate_signal_quality_score(self, 
                                       ema_spread: float,
                                       macd_histogram: float,
                                       volatility: float,
                                       price: float) -> float:
        """
        Calculate enhanced signal quality score with multiple factors.
        
        Args:
            ema_spread: Difference between fast and slow EMA
            macd_histogram: MACD histogram value
            volatility: Current market volatility
            price: Current price
            
        Returns:
            Signal quality score (0.0 to 1.0)
        """
        try:
            # Base quality score from traditional indicators
            base_score = 0.5
            
            # 1. EMA Spread Analysis (30% weight)
            ema_score = 0.0
            if abs(ema_spread) > 0.0001:  # Minimum spread threshold
                ema_score = min(abs(ema_spread) * 10000, 1.0)  # Scale to 0-1
            base_score += ema_score * 0.3
            
            # 2. MACD Momentum Analysis (25% weight)
            macd_score = 0.0
            if abs(macd_histogram) > 0.00001:  # Minimum momentum threshold
                macd_score = min(abs(macd_histogram) * 100000, 1.0)  # Scale to 0-1
            base_score += macd_score * 0.25
            
            # 3. Volatility Analysis (20% weight)
            volatility_score = 0.0
            if 0.0005 <= volatility <= 0.003:  # Optimal volatility range
                volatility_score = 1.0
            elif volatility < 0.0005:  # Too low volatility
                volatility_score = volatility / 0.0005 * 0.5
            else:  # Too high volatility
                volatility_score = max(0.5 - (volatility - 0.003) * 100, 0.0)
            base_score += volatility_score * 0.2
            
            # 4. Price Stability Analysis (15% weight)
            if len(self.price_history) >= 10:
                recent_prices = self.price_history[-10:]
                price_changes = [abs(recent_prices[i] - recent_prices[i-1]) / recent_prices[i-1]
                               for i in range(1, len(recent_prices))]
                avg_price_change = sum(price_changes) / len(price_changes)
                
                # Optimal price change range (not too volatile, not too stable)
                if 0.001 <= avg_price_change <= 0.005:
                    stability_score = 1.0
                elif avg_price_change < 0.001:
                    stability_score = avg_price_change / 0.001 * 0.7
                else:
                    stability_score = max(0.7 - (avg_price_change - 0.005) * 50, 0.0)
                
                base_score += stability_score * 0.15
            
            # 5. Trend Persistence Analysis (10% weight)
            trend_score = 0.0
            if hasattr(self, 'trend_persistence') and getattr(self, 'trend_persistence', 0) > 0:
                trend_persistence = getattr(self, 'trend_persistence', 0)
                trend_score = min(trend_persistence / 5.0, 1.0)  # Scale to 0-1
            base_score += trend_score * 0.1
            
            # Apply quality threshold filter
            min_quality_threshold = config.get('risk_management.signal_quality_threshold', 0.70)
            
            if base_score < min_quality_threshold:
                logger.debug(f"Signal quality {base_score:.3f} below threshold {min_quality_threshold:.3f}")
                return 0.0
            
            # Cap at 1.0
            final_score = min(base_score, 1.0)
            
            logger.debug(f"Signal quality calculated: {final_score:.3f} (EMA: {ema_score:.3f}, MACD: {macd_score:.3f}, Vol: {volatility_score:.3f})")
            
            return final_score
            
        except Exception as e:
            logger.error(f"Error calculating signal quality score: {e}")
            return 0.0

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
        # Check for extreme volatility (DISABLED for testing) with defensive checks
        try:
            atr_value_raw = self.atr.get_value()
            # Ensure ATR is a single float value, not a tuple
            if isinstance(atr_value_raw, tuple):
                atr_value = float(atr_value_raw[0]) if len(atr_value_raw) > 0 else None
                logger.warning(f"ATR get_value() returned tuple in _check_market_conditions, using first element: {atr_value}")
            elif atr_value_raw is not None:
                atr_value = float(atr_value_raw)
            else:
                atr_value = None
        except Exception as e:
            logger.error(f"Error getting ATR value in _check_market_conditions: {e}", exc_info=True)
            atr_value = None
            
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

    def _generate_hft_signal_cascade(
        self, price: float, timestamp: int, macd_histogram: float
    ) -> tuple[SignalType, int, dict]:
        """
        Enhanced Four-Category Candlestick Pattern Detection Cascade.
        Returns a trading signal based on candlestick patterns and confirmations.

        Signal types: HOLD, BUY, SELL
        """

        signal: SignalType = SignalType.HOLD
        duration = 1
        metadata = {"strategy": "none", "reason": "no signals"}

        # ------------------------------------------------------------
        # Priority 1: Candlestick Pattern Strategy (Highest Priority)
        # ------------------------------------------------------------
        logger.debug(f"CANDLESTICK CASCADE DEBUG: enabled={self.candlestick_enabled}, strategy={self.candlestick_strategy is not None}")
        if self.candlestick_enabled and self.candlestick_strategy:
            logger.debug(f"CANDLESTICK: Updating tick {price}")
            candle_complete = self.candlestick_strategy.update_tick(price)

            if candle_complete:
                logger.info(f"CANDLESTICK: Candle completed! Active trades: {len(self.active_trades)}")
                max_concurrent = config.get("trading.max_concurrent_trades", 1)

                if len(self.active_trades) < max_concurrent:
                    pattern_signal = self.candlestick_strategy.get_signal()
                else:
                    logger.debug("Skipping signal: max concurrent trades reached")
                    pattern_signal = None

                if pattern_signal:
                    min_quality = config.get("strategy.candlestick_quality_threshold", 0.75)

                    # DEBUG: Log signal details for troubleshooting
                    signal_type = pattern_signal.get('type', 'UNKNOWN')
                    quality_score = pattern_signal.get('quality_score', 0)
                    logger.info(f"CANDLESTICK SIGNAL RECEIVED: type={signal_type}, quality={quality_score}, min_quality={min_quality}, pattern={pattern_signal.get('pattern', 'N/A')}")

                    # Get signal type and validate
                    sig_type = pattern_signal.get('type', 'HOLD').upper()
                    quality = pattern_signal.get('quality_score', 0)
                    
                    logger.info(f"CANDLESTICK SIGNAL PROCESSING: type={sig_type}, quality={quality:.2f}, min_required={min_quality:.2f}")
                    
                    # -------------------
                    # BUY/SELL Patterns - Process FIRST
                    # -------------------
                    if sig_type in ['BUY', 'SELL'] and quality >= min_quality:
                        logger.info(f"✅ CANDLESTICK PATTERN APPROVED: {pattern_signal['pattern']} -> {sig_type}")
                        logger.info(f"   Confidence: {pattern_signal['confidence']:.0%}, Quality: {quality:.0%}")
                        logger.info(f"   EMA Trend: {pattern_signal['metadata']['ema_trend']}, RSI: {pattern_signal['metadata']['rsi_value']:.1f}")

                        # Set signal type
                        signal = SignalType.BUY if sig_type == "BUY" else SignalType.SELL
                        duration = pattern_signal.get("duration", 3)
                        
                        # Build metadata
                        metadata = {
                            "strategy": "candlestick_pattern",
                            "pattern": pattern_signal["pattern"],
                            "pattern_type": pattern_signal.get("pattern_type", "unknown"),
                            "confidence": pattern_signal["confidence"],
                            "quality_score": quality,
                            "ema_trend": pattern_signal["metadata"]["ema_trend"],
                            "rsi_value": pattern_signal["metadata"]["rsi_value"],
                            "reason": f"Trading Pattern: {pattern_signal['pattern']} -> {sig_type}",
                            "signal_type": sig_type,
                            "trade_start_candle": pattern_signal.get("trade_start_candle", 0),
                            "expected_close_candle": pattern_signal.get("expected_close_candle", 0),
                            "close_after_candles": pattern_signal.get("close_after_candles", 2),
                            "signal_data": pattern_signal
                        }
                        
                        logger.info(f"🚀 RETURNING {sig_type} SIGNAL - Duration: {duration}min, Pattern: {pattern_signal['pattern']}")
                        return signal, duration, metadata
                    
                    # -------------------
                    # Neutral/HOLD Patterns
                    # -------------------
                    elif sig_type == "HOLD":
                        logger.debug(f"Neutral pattern detected: {pattern_signal.get('pattern', 'N/A')} - skipping trade")
                        # Don't return, let it fall through to HOLD at end
                    else:
                        # Signal was filtered out
                        if quality < min_quality:
                            logger.warning(f"❌ Pattern '{pattern_signal.get('pattern', 'N/A')}' filtered: quality={quality:.2f} < {min_quality:.2f}")
                        else:
                            logger.warning(f"❌ Pattern '{pattern_signal.get('pattern', 'N/A')}' filtered: invalid type '{sig_type}'")

        else:
            logger.debug(f"CANDLESTICK: Disabled or unavailable (enabled={self.candlestick_enabled})")

        # ------------------------------------------------------------
        # Other strategies are disabled (HFT uses candlestick only)
        # ------------------------------------------------------------
        return SignalType.HOLD, 1, metadata


    def _generate_triple_ema_signal(self, price: float, timestamp: int) -> tuple[SignalType, int]:
        """
        Generate trading signal based on Triple EMA Strategy (configured periods).

        Args:
            price: Current price
            timestamp: Current timestamp

        Returns:
            Tuple of (trading signal, duration in minutes)
        """
        # Get current EMA values
        ema_short_val = self.ema_short.get_value()
        ema_medium_val = self.ema_medium.get_value()
        ema_long_val = self.ema_long.get_value()
        
        # For candlestick strategy, only need short and medium EMAs (long EMA is optional)
        if ema_short_val is None or ema_medium_val is None:
            logger.debug("EMA values not initialized yet (need short and medium EMAs)")
            return SignalType.HOLD, 1
        
        # Calculate trend detection first
        # DUAL EMA STRATEGY: Use only short and medium EMAs for candlestick strategy
        # Detect uptrend: EMA6 > EMA18 with minimum distance between them
        min_distance_pct = 0.00005  # Reduced from 0.0001 to 0.00005 for more sensitive trend detection
        
        # Calculate distance between EMAs as percentage of price
        short_medium_distance = (ema_short_val - ema_medium_val) / price
        
        # Simple uptrend: EMA6 > EMA18 with minimum distance
        uptrend = (ema_short_val > ema_medium_val and short_medium_distance > min_distance_pct)
        
        # Simple downtrend: EMA18 > EMA6 with minimum distance
        medium_short_distance = (ema_medium_val - ema_short_val) / price
        downtrend = (ema_medium_val > ema_short_val and medium_short_distance > min_distance_pct)
        
        # Only log detailed EMA analysis when trends are forming (optimization)
        if self.tick_count % 10 == 0 or uptrend or downtrend:
            logger.info(f"Dual EMA Analysis: Short={ema_short_val:.6f}, Medium={ema_medium_val:.6f}")

        # DUAL EMA STRATEGY: Detect trends based on EMA alignment
        dual_ema_enabled = config.get('strategy.exponential_ema_strategy', False)  # DISABLED - Use only candlestick patterns
        
        if dual_ema_enabled:
            # Log the trend status with detailed distance information
            if uptrend:
                logger.info(f"UPTREND DETECTED: EMA6 ({ema_short_val:.6f}) > EMA18 ({ema_medium_val:.6f})")
                logger.info(f"  Distance: Short-Medium={short_medium_distance:.6f}")
            elif downtrend:
                logger.info(f"DOWNTREND DETECTED: EMA18 ({ema_medium_val:.6f}) > EMA6 ({ema_short_val:.6f})")
                logger.info(f"  Distance: Medium-Short={medium_short_distance:.6f}")
            else:
                logger.info(f"NO CLEAR TREND: EMAs not properly aligned with sufficient distance")
                # Log why trend detection failed
                if ema_short_val > ema_medium_val:
                    logger.info(f"  EMAs aligned for uptrend but insufficient distance: S-M={short_medium_distance:.6f}")
                elif ema_medium_val > ema_short_val:
                    logger.info(f"  EMAs aligned for downtrend but insufficient distance: M-S={medium_short_distance:.6f}")
                else:
                    logger.info(f"  EMAs not properly aligned: Short={ema_short_val:.6f}, Medium={ema_medium_val:.6f}")
            
            # Calculate EMA spread for signal strength
            short_medium_spread = abs(ema_short_val - ema_medium_val) / price
            min_spread = config.get('strategy.ema_crossover_threshold', 0.0001)  # 0.01% minimum spread
            
            # Generate trading signals based on trend alignment
            # For PUT signals: Need confirmed downtrend
            # For CALL signals: Need confirmed uptrend
            trend_persistence = config.get('strategy.ema_trend_persistence', 3)  # 3 ticks for better confirmation
            total_spread = short_medium_spread
            
            # Track trend persistence for confirmation
            if not hasattr(self, 'uptrend_count'):
                self.uptrend_count = 0
                
            if not hasattr(self, 'downtrend_count'):
                self.downtrend_count = 0
                
            # Update trend counters
            if uptrend:
                self.uptrend_count += 1
                self.downtrend_count = 0
            elif downtrend:
                self.downtrend_count += 1
                self.uptrend_count = 0
            else:
                # No clear trend
                self.uptrend_count = 0
                self.downtrend_count = 0
            
            # Log trend persistence only when close to triggering or actively trending
            if self.uptrend_count >= trend_persistence - 1 or self.downtrend_count >= trend_persistence - 1:
                logger.info(f"Uptrend count: {self.uptrend_count}, Downtrend count: {self.downtrend_count}, Required: {trend_persistence}")
            
            # Get MACD values for confirmation with defensive checks
            try:
                macd_result = self.macd.get_value()
                if isinstance(macd_result, tuple) and len(macd_result) >= 3:
                    macd_line = float(macd_result[0])
                    macd_signal_line = float(macd_result[1])
                    macd_histogram = float(macd_result[2])
                elif isinstance(macd_result, tuple) and len(macd_result) > 0:
                    # Handle unexpected tuple length
                    macd_line = float(macd_result[0]) if len(macd_result) > 0 else 0.0
                    macd_signal_line = float(macd_result[1]) if len(macd_result) > 1 else 0.0
                    macd_histogram = float(macd_result[2]) if len(macd_result) > 2 else 0.0
                    logger.warning(f"MACD get_value() returned unexpected tuple length {len(macd_result)} in _generate_hft_signal_cascade, using available values")
                else:
                    logger.error(f"MACD get_value() returned unexpected type: {type(macd_result)} in _generate_hft_signal_cascade")
                    macd_line, macd_signal_line, macd_histogram = 0.0, 0.0, 0.0
            except Exception as e:
                logger.error(f"Error getting MACD values in _generate_hft_signal_cascade: {e}", exc_info=True)
                macd_line, macd_signal_line, macd_histogram = 0.0, 0.0, 0.0
            macd_histogram_threshold = config.get('strategy.macd_histogram_threshold', 0.00008)
            
            # Log MACD status only periodically or when trends are confirmed (optimization)
            if self.tick_count % 20 == 0 or (uptrend and self.uptrend_count >= trend_persistence) or (downtrend and self.downtrend_count >= trend_persistence):
                logger.info(f"MACD Analysis: Line={macd_line:.6f}, Signal={macd_signal_line:.6f}, Histogram={macd_histogram:.6f}")
            
            # Generate signals based on trend persistence and spread
            signal = SignalType.HOLD
            
            #  NEW: Get adaptive duration based on volatility
            current_volatility = self.volatility.get_value() or 0.001
            duration = self.get_adaptive_duration(current_volatility)
            
            # Get signal quality threshold from config
            min_signal_quality = config.get("strategy.signal_quality_min_score", 0.60)
            
            # Only generate signals if spread is significant
            if total_spread > min_spread:
                # CALL signal on strong uptrend WITH MACD CONFIRMATION
                if uptrend and self.uptrend_count >= trend_persistence:
                    # Require MACD confirmation for BUY signals ONLY if MACD has enough data
                    # Skip MACD check if we haven't had enough ticks yet (MACD needs warmup)
                    macd_ready = self.tick_count > 30  # -> INCREASED to 30 ticks for reliable MACD
                    
                    if macd_ready:
                        # 1. MACD histogram should be rising (above threshold) OR at least not strongly negative
                        # 2. Price should be above EMA50 for stronger bullish confirmation
                        macd_bullish = macd_histogram > macd_histogram_threshold
                        macd_not_contradicting = macd_histogram > -macd_histogram_threshold * 3  # Allow if not strongly bearish
                        price_above_ema50 = True  # Always true for dual EMA strategy
                        
                        # Accept if MACD confirms OR at least doesn't contradict strongly
                        if (macd_bullish or macd_not_contradicting) and price_above_ema50:
                            signal = SignalType.BUY
                            logger.info(f"BUY SIGNAL: Triple EMA uptrend + MACD OK (count: {self.uptrend_count}, spread: {total_spread:.6f}, MACD hist: {macd_histogram:.6f})")
                            logger.info(f"   Price ({price:.2f}) > EMA50 (N/A)  | MACD not contradicting ")
                        else:
                            logger.info(f"BUY blocked: EMA uptrend but MACD strongly contradicts")
                            if not macd_bullish and not macd_not_contradicting:
                                logger.info(f"   MACD strongly negative: {macd_histogram:.6f}")
                            if not price_above_ema50:
                                logger.info(f"   Price ({price:.2f}) not above EMA50 (N/A)")
                    else:
                        # MACD not ready, use EMA and price confirmation only
                        price_above_ema50 = True  # Always true for dual EMA strategy
                        if price_above_ema50:
                            signal = SignalType.BUY
                            logger.info(f"BUY SIGNAL: Triple EMA uptrend confirmed (count: {self.uptrend_count}, spread: {total_spread:.6f}) [MACD warmup: {self.tick_count} ticks])")
                            logger.info(f"   Price ({price:.2f}) > EMA50 (N/A)  | MACD warming up...")
                        else:
                            logger.info(f"BUY blocked: Price ({price:.2f}) not above EMA50 (N/A)")
                
                # PUT signal on strong downtrend WITH MACD CONFIRMATION
                elif downtrend and self.downtrend_count >= trend_persistence:
                    # Require MACD confirmation for SELL signals ONLY if MACD has enough data
                    # Skip MACD check if we haven't had enough ticks yet (MACD needs warmup)
                    macd_ready = self.tick_count > 30  # -> INCREASED to 30 ticks for reliable MACD
                    
                    if macd_ready:
                        # 1. MACD histogram should be falling (below negative threshold) OR at least not strongly positive
                        # 2. Price should be below EMA50 for stronger bearish confirmation
                        macd_bearish = macd_histogram < -macd_histogram_threshold
                        macd_not_contradicting = macd_histogram < macd_histogram_threshold * 3  # Allow if not strongly bullish
                        price_below_ema50 = True  # Always true for dual EMA strategy
                        
                        # Accept if MACD confirms OR at least doesn't contradict strongly
                        if (macd_bearish or macd_not_contradicting) and price_below_ema50:
                            signal = SignalType.SELL
                            logger.info(f" SELL SIGNAL: Triple EMA downtrend + MACD OK (count: {self.downtrend_count}, spread: {total_spread:.6f}, MACD hist: {macd_histogram:.6f})")
                            logger.info(f"   Price ({price:.2f}) < EMA50 (N/A)  | MACD not contradicting ")
                        else:
                            logger.info(f" SELL blocked: EMA downtrend but MACD strongly contradicts")
                            if not macd_bearish and not macd_not_contradicting:
                                logger.info(f"   MACD strongly positive: {macd_histogram:.6f}")
                            if not price_below_ema50:
                                logger.info(f"   Price ({price:.2f}) not below EMA50 (N/A)")
                    else:
                        # MACD not ready, use EMA and price confirmation only
                        price_below_ema50 = True  # Always true for dual EMA strategy
                        if price_below_ema50:
                            signal = SignalType.SELL
                            logger.info(f" SELL SIGNAL: Triple EMA downtrend confirmed (count: {self.downtrend_count}, spread: {total_spread:.6f}) [MACD warmup: {self.tick_count} ticks]")
                            logger.info(f"   Price ({price:.2f}) < EMA50 (N/A)  | MACD warming up...")
                        else:
                            logger.info(f" SELL blocked: Price ({price:.2f}) not below EMA50 (N/A)")
                else:
                    logger.info(f"No signal: Insufficient EMA spread ({total_spread:.6f} < {min_spread:.6f})")
            
            #  NEW: Signal quality filtering
            if signal != SignalType.HOLD:
                # Calculate signal quality score
                ema_spread = abs(ema_short_val - ema_medium_val)
                volatility = self.volatility.get_value() or 0.001
                
                quality_score = self.calculate_signal_quality_score(
                    ema_spread=ema_spread,
                    macd_histogram=macd_histogram,
                    volatility=volatility,
                    price=price
                )
                
                # Filter out low-quality signals
                if quality_score < min_signal_quality:
                    logger.info(f" Signal FILTERED: Quality {quality_score:.1%} < {min_signal_quality:.1%} threshold")
                    return SignalType.HOLD, duration
                else:
                    logger.info(f" High-quality signal: {quality_score:.1%} (threshold: {min_signal_quality:.1%})")
            
            #  NEW: RSI Filter (for overbought/oversold detection)
            if signal != SignalType.HOLD and config.get('strategy.rsi_filter', False):
                try:
                    rsi_val_raw = self.rsi.get_value()
                    # Ensure RSI is a single float value, not a tuple
                    if isinstance(rsi_val_raw, tuple):
                        rsi_current = float(rsi_val_raw[0]) if len(rsi_val_raw) > 0 else 50.0
                        logger.warning(f"RSI get_value() returned tuple in RSI filter, using first element: {rsi_current}")
                    elif rsi_val_raw is not None:
                        rsi_current = float(rsi_val_raw)
                    else:
                        rsi_current = 50.0  # Default neutral RSI
                except Exception as e:
                    logger.error(f"Error getting RSI value in RSI filter: {e}", exc_info=True)
                    rsi_current = 50.0  # Default neutral RSI
                # Don't buy when overbought, don't sell when oversold
                if signal == SignalType.BUY and rsi_current > self.rsi_overbought:
                    logger.info(f" BUY Signal FILTERED: RSI overbought ({rsi_current:.1f} > {self.rsi_overbought})")
                    return SignalType.HOLD, duration
                elif signal == SignalType.SELL and rsi_current < self.rsi_oversold:
                    logger.info(f" SELL Signal FILTERED: RSI oversold ({rsi_current:.1f} < {self.rsi_oversold})")
                    return SignalType.HOLD, duration
                else:
                    logger.info(f" RSI filter passed: {rsi_current:.1f} (range: {self.rsi_oversold}-{self.rsi_overbought})")
            
            #  NEW: Trend Exhaustion Filter (avoid late entries)
            if signal != SignalType.HOLD and config.get('strategy.trend_exhaustion_filter', False):
                try:
                    rsi_val_raw = self.rsi.get_value()
                    # Ensure RSI is a single float value, not a tuple
                    if isinstance(rsi_val_raw, tuple):
                        rsi_current = float(rsi_val_raw[0]) if len(rsi_val_raw) > 0 else 50.0
                        logger.warning(f"RSI get_value() returned tuple in trend exhaustion filter, using first element: {rsi_current}")
                    elif rsi_val_raw is not None:
                        rsi_current = float(rsi_val_raw)
                    else:
                        rsi_current = 50.0  # Default neutral RSI
                except Exception as e:
                    logger.error(f"Error getting RSI value in trend exhaustion filter: {e}", exc_info=True)
                    rsi_current = 50.0  # Default neutral RSI
                
                # Detect exhausted downtrend: Don't SELL after strong down move when RSI < 40
                if signal == SignalType.SELL and rsi_current and rsi_current < 40:
                    # Check if we had a strong downtrend (EMA50 significantly above current price)
                    price_below_ema50_pct = 0.0  # Not applicable for dual EMA strategy
                    if price_below_ema50_pct > 0.003:  # Price 0.3%+ below EMA50 = exhausted downtrend
                        logger.info(f" SELL Signal FILTERED: Trend exhaustion detected")
                        logger.info(f"   RSI oversold: {rsi_current:.1f} < 40, Price {price_below_ema50_pct:.2%} below EMA50")
                        logger.info(f"   Reason: Downtrend exhausted, expect bounce/reversal")
                        return SignalType.HOLD, duration
                
                # Detect exhausted uptrend: Don't BUY after strong up move when RSI > 60
                if signal == SignalType.BUY and rsi_current and rsi_current > 60:
                    # Check if we had a strong uptrend (price significantly above EMA50)
                    price_above_ema50_pct = 0.0  # Not applicable for dual EMA strategy
                    if price_above_ema50_pct > 0.003:  # Price 0.3%+ above EMA50 = exhausted uptrend
                        logger.info(f" BUY Signal FILTERED: Trend exhaustion detected")
                        logger.info(f"   RSI overbought: {rsi_current:.1f} > 60, Price {price_above_ema50_pct:.2%} above EMA50")
                        logger.info(f"   Reason: Uptrend exhausted, expect pullback/consolidation")
                        return SignalType.HOLD, duration
                
                logger.debug(f" Trend exhaustion filter passed")
            
            #  NEW: Trend Filter (only trade with clear EMA trend)
            if signal != SignalType.HOLD and config.get('strategy.trend_filter', False):
                ema_spread = abs(ema_short_val - ema_medium_val)
                ema_spread_pct = ema_spread / price if price > 0 else 0
                min_trend_strength = 0.00015  # 0.015% minimum EMA spread (relaxed from 0.02%)
                if ema_spread_pct < min_trend_strength:
                    logger.info(f" Signal FILTERED: Weak trend (EMA spread {ema_spread_pct:.4%} < {min_trend_strength:.4%})")
                    return SignalType.HOLD, duration
                else:
                    logger.info(f" Trend filter passed: Strong trend (EMA spread: {ema_spread_pct:.4%})")
            
            #  NEW: Volatility Filter (avoid excessive volatility)
            if signal != SignalType.HOLD and config.get('strategy.volatility_filter', False):
                current_volatility = self.volatility.get_value() or 0
                max_safe_volatility = 0.003  # Maximum 0.3% volatility
                if current_volatility > max_safe_volatility:
                    logger.info(f" Signal FILTERED: Excessive volatility ({current_volatility:.4%} > {max_safe_volatility:.4%})")
                    return SignalType.HOLD, duration
                else:
                    logger.info(f" Volatility filter passed: {current_volatility:.4%}")
            
            #  NEW: Multi-timeframe confluence check
            if signal != SignalType.HOLD and self.mtf_analyzer:
                confirmed_signal, confidence = self.mtf_analyzer.get_trend_confluence(signal.value)
                
                if confirmed_signal == 'HOLD':
                    logger.info(f" Signal FILTERED by multi-timeframe: insufficient confluence")
                    return SignalType.HOLD, duration
                else:
                    logger.info(f" Multi-timeframe confirmation: {confidence:.0%} confidence")
                
            return signal, duration
        
        # Triple EMA strategy not enabled, return HOLD
        return SignalType.HOLD, 1

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
            
            # Get MACD values with defensive checks
            try:
                macd_result = self.macd.get_value()
                if isinstance(macd_result, tuple) and len(macd_result) >= 3:
                    macd_line = float(macd_result[0])
                    macd_signal = float(macd_result[1])
                    macd_histogram = float(macd_result[2])
                elif isinstance(macd_result, tuple) and len(macd_result) > 0:
                    # Handle unexpected tuple length
                    macd_line = float(macd_result[0]) if len(macd_result) > 0 else 0.0
                    macd_signal = float(macd_result[1]) if len(macd_result) > 1 else 0.0
                    macd_histogram = float(macd_result[2]) if len(macd_result) > 2 else 0.0
                    logger.warning(f"MACD get_value() returned unexpected tuple length {len(macd_result)} in _generate_macd_fallback_signal, using available values")
                else:
                    logger.error(f"MACD get_value() returned unexpected type: {type(macd_result)} in _generate_macd_fallback_signal")
                    macd_line, macd_signal, macd_histogram = 0.0, 0.0, 0.0
            except Exception as e:
                logger.error(f"Error getting MACD values in _generate_macd_fallback_signal: {e}", exc_info=True)
                macd_line, macd_signal, macd_histogram = 0.0, 0.0, 0.0
            
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

        # Check market conditions first with defensive checks
        try:
            macd_result = self.macd.get_value()
            if isinstance(macd_result, tuple) and len(macd_result) >= 3:
                macd_line = float(macd_result[0])
                macd_signal = float(macd_result[1])
                macd_histogram = float(macd_result[2])
            elif isinstance(macd_result, tuple) and len(macd_result) > 0:
                # Handle unexpected tuple length
                macd_line = float(macd_result[0]) if len(macd_result) > 0 else 0.0
                macd_signal = float(macd_result[1]) if len(macd_result) > 1 else 0.0
                macd_histogram = float(macd_result[2]) if len(macd_result) > 2 else 0.0
                logger.warning(f"MACD get_value() returned unexpected tuple length {len(macd_result)} in _generate_complex_signal (first call), using available values")
            else:
                logger.error(f"MACD get_value() returned unexpected type: {type(macd_result)} in _generate_complex_signal (first call)")
                macd_line, macd_signal, macd_histogram = 0.0, 0.0, 0.0
        except Exception as e:
            logger.error(f"Error getting MACD values in _generate_complex_signal (first call): {e}", exc_info=True)
            macd_line, macd_signal, macd_histogram = 0.0, 0.0, 0.0
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

        # Get MACD values (already updated in main update loop) with defensive checks
        try:
            macd_result = self.macd.get_value()
            if isinstance(macd_result, tuple) and len(macd_result) >= 3:
                macd_line = float(macd_result[0])
                macd_signal = float(macd_result[1])
                macd_histogram = float(macd_result[2])
            elif isinstance(macd_result, tuple) and len(macd_result) > 0:
                # Handle unexpected tuple length
                macd_line = float(macd_result[0]) if len(macd_result) > 0 else 0.0
                macd_signal = float(macd_result[1]) if len(macd_result) > 1 else 0.0
                macd_histogram = float(macd_result[2]) if len(macd_result) > 2 else 0.0
                logger.warning(f"MACD get_value() returned unexpected tuple length {len(macd_result)} in _generate_complex_signal (second call), using available values")
            else:
                logger.error(f"MACD get_value() returned unexpected type: {type(macd_result)} in _generate_complex_signal (second call)")
                macd_line, macd_signal, macd_histogram = 0.0, 0.0, 0.0
        except Exception as e:
            logger.error(f"Error getting MACD values in _generate_complex_signal (second call): {e}", exc_info=True)
            macd_line, macd_signal, macd_histogram = 0.0, 0.0, 0.0

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
        return symbol_durations.get(symbol, config.get("trading.contract_duration", 3))


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
        # Get MACD values with defensive checks
        try:
            macd_result = self.macd.get_value()
            if isinstance(macd_result, tuple) and len(macd_result) >= 3:
                macd_line = float(macd_result[0])
                macd_signal = float(macd_result[1])
                macd_histogram = float(macd_result[2])
            elif isinstance(macd_result, tuple) and len(macd_result) > 0:
                # Handle unexpected tuple length
                macd_line = float(macd_result[0]) if len(macd_result) > 0 else 0.0
                macd_signal = float(macd_result[1]) if len(macd_result) > 1 else 0.0
                macd_histogram = float(macd_result[2]) if len(macd_result) > 2 else 0.0
                logger.warning(f"MACD get_value() returned unexpected tuple length {len(macd_result)} in get_indicator_values, using available values")
            else:
                logger.error(f"MACD get_value() returned unexpected type: {type(macd_result)} in get_indicator_values")
                macd_line, macd_signal, macd_histogram = 0.0, 0.0, 0.0
        except Exception as e:
            logger.error(f"Error getting MACD values in get_indicator_values: {e}", exc_info=True)
            macd_line, macd_signal, macd_histogram = 0.0, 0.0, 0.0
        
        # Ensure ema_5 and ema_8 exist for backward compatibility
        if not hasattr(self, 'ema_5') and hasattr(self, 'ema_short'):
            self.ema_5 = self.ema_short
        if not hasattr(self, 'ema_8') and hasattr(self, 'ema_medium'):
            self.ema_8 = self.ema_medium
            
        indicators = {
            "ema_5": self.ema_5.get_value() if hasattr(self, 'ema_5') else 0.0,
            "ema_8": self.ema_8.get_value() if hasattr(self, 'ema_8') else 0.0,
            "ema_short": self.ema_short.get_value() if hasattr(self, 'ema_short') else 0.0,
            "ema_medium": self.ema_medium.get_value() if hasattr(self, 'ema_medium') else 0.0,
            "ema_long": self.ema_long.get_value() if hasattr(self, 'ema_long') else 0.0,
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
        # Reset Triple EMA indicators
        if hasattr(self, 'ema_short'):
            self.ema_short.reset()
        if hasattr(self, 'ema_medium'):
            self.ema_medium.reset()
        if hasattr(self, 'ema_long'):
            self.ema_long.reset()
            
        # For backward compatibility with metrics code
        self.ema_5 = self.ema_short if hasattr(self, 'ema_short') else IncrementalEMA(6)
        self.ema_8 = self.ema_medium if hasattr(self, 'ema_medium') else IncrementalEMA(18)

        # Reset other indicators
        self.momentum = IncrementalMomentum(lookback=5)
        self.volatility = IncrementalVolatility(config.volatility_window)
        self.bollinger_bands = BollingerBands(period=20, std_dev=2.0)

        # Reset MACD with 5-minute balanced scalping settings
        self.macd = IncrementalMACD(
            fast_period=config.get("indicators.macd_fast_period", 8),
            slow_period=config.get("indicators.macd_slow_period", 21),
            signal_period=config.get("indicators.macd_signal_period", 7)
        )

        # Reset MACD tracking
        self.prev_macd_line = 0.0
        self.prev_macd_signal = 0.0
        self.prev_histogram = 0.0
        self.macd_crossovers = []

        # Reset Triple EMAs - 5-minute balanced scalping optimized
        self.ema_short = IncrementalEMA(config.get("indicators.ema_short_period", 8))
        self.ema_medium = IncrementalEMA(config.get("indicators.ema_medium_period", 21))
        self.ema_long = IncrementalEMA(config.get("indicators.ema_long_period", 50))

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
                "macd_fast_period": config.get("indicators.macd_fast_period", 8),
                "macd_slow_period": config.get("indicators.macd_slow_period", 21),
                "macd_signal_period": config.get("indicators.macd_signal_period", 7),
            },
        }


