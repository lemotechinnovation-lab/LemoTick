"""
Main Trading Bot Class - Using StreamManager for Real-Time Tick Data
"""

import time
from typing import Optional, List
from datetime import datetime

from lemotickautostart.config import Settings
from lemotickautostart.logger import setup_logger
from lemotickautostart.strategies.macd_rsi_realtime import MACDRSIRealtimeStrategy
from lemotickautostart.models.candle import Candle
from lemotickautostart.models.signal import Signal
from lemotickautostart.core.position import Position
from lemotickautostart.core.statistics import BotStatistics, TradeStats
from lemotickautostart.api.deriv import DerivClient
from lemotickautostart.services.stream_manager import StreamManager
from lemotickautostart.services.backend_client import BackendClient
from lemotickautostart.services.signalr_client import SignalRClient
from lemotickautostart.services.local_trade_db import LocalTradeDB
from lemotickautostart.services.notification_service import NotificationService


logger = setup_logger(__name__)


class TradingBot:
    """Main trading bot class using real-time streaming"""
    
    def __init__(self, settings: Settings):
        """
        Initialize trading bot
        
        Args:
            settings: Application settings
        """
        self.settings = settings
        
        # Initialize MACD+RSI Real-Time strategy (73% win rate proven)
        self.strategy = MACDRSIRealtimeStrategy(settings)
        logger.info("🚀 Using MACD + RSI Real-Time Strategy (Real-Time Tick Analysis - 73% Win Rate)")
        
        # Connection
        self.deriv_client: Optional[DerivClient] = None
        self.stream_manager: Optional[StreamManager] = None
        self.backend_client: Optional[BackendClient] = None
        self.signalr_client: Optional[SignalRClient] = None
        self.local_trade_db: LocalTradeDB = LocalTradeDB("trades.json")
        self.notification_service: NotificationService = NotificationService(settings)
        
        # Trading state
        self.positions: List[Position] = []
        self.candles: List[Candle] = []
        self.is_running = False
        self.daily_loss = 0.0
        self.statistics = BotStatistics()
        self.last_trade_time = 0  # Cooldown tracking
        self.trade_cooldown_seconds = settings.trade_cooldown_seconds  # Configurable cooldown
        self.last_signal_time = 0  # Prevent signal spam
        self.signal_cooldown_seconds = 0.5  # Minimum 0.5 seconds between signal processing (real-time)
        self.trades_in_7_minutes: List[float] = []  # Track trades for frequency limit
        self.pending_trades: dict = {}  # Track trades by ID: {trade_id: position}
        
        logger.info(f"Bot initialized with settings: {settings.trading_mode}")
    
    def _on_tick(self, data: dict) -> None:
        """Handle incoming tick data from StreamManager (real-time)"""
        self._on_candle_data(data)
    
    def _on_candle_data(self, data: dict) -> None:
        """Handle incoming candle data from StreamManager (real-time ticks)"""
        try:
            # Handle initial candles batch from StreamManager
            if "candles" in data:
                candles_data = data["candles"]
                if candles_data:
                    logger.info(f"📊 Received {len(candles_data)} candles from StreamManager")
                    
                    # Process all candles
                    for candle_data in candles_data:
                        try:
                            candle = Candle(
                                timestamp=datetime.fromtimestamp(candle_data["epoch"]),
                                open=float(candle_data["open"]),
                                high=float(candle_data["high"]),
                                low=float(candle_data["low"]),
                                close=float(candle_data["close"]),
                                volume=int(candle_data.get("volume", 0))
                            )
                            self.candles.append(candle)
                        except ValueError as e:
                            logger.warning(f"Invalid candle data: {e}, skipping")
                            continue
                    
                    logger.info(f"✅ Loaded {len(self.candles)} total candles | Latest: {self.candles[-1].close}")
            
            # Handle live OHLC updates (real-time tick data from StreamManager)
            elif "ohlc" in data:
                ohlc = data["ohlc"]
                try:
                    # Validate OHLC data
                    open_price = float(ohlc["open"])
                    high_price = float(ohlc["high"])
                    low_price = float(ohlc["low"])
                    close_price = float(ohlc["close"])
                    
                    # Skip if any price is negative or invalid
                    if any(p < 0 for p in [open_price, high_price, low_price, close_price]):
                        logger.warning(f"Invalid OHLC prices: O={open_price} H={high_price} L={low_price} C={close_price}")
                        return
                    
                    candle = Candle(
                        timestamp=datetime.fromtimestamp(ohlc["open_time"]),
                        open=open_price,
                        high=high_price,
                        low=low_price,
                        close=close_price,
                        volume=0
                    )
                    
                    # Update or add candle
                    if self.candles and self.candles[-1].timestamp == candle.timestamp:
                        old_close = self.candles[-1].close
                        self.candles[-1] = candle
                        logger.debug(f"📊 RT Tick Update: {old_close} → {candle.close} | High: {candle.high} | Low: {candle.low}")
                    else:
                        self.candles.append(candle)
                        logger.debug(f"📊 RT New Candle: {candle.timestamp.strftime('%H:%M:%S')} | O: {candle.open} | C: {candle.close}")
                except ValueError as e:
                    logger.warning(f"Invalid OHLC data: {e}, skipping")
                    return
            
            # Keep only last 100 candles
            if len(self.candles) > 100:
                self.candles = self.candles[-100:]
            
            # Analyze with strategy using real-time data
            if len(self.candles) >= 50:
                try:
                    signal = self.strategy.analyze(self.candles)
                    
                    if signal:
                        # Check signal cooldown to prevent spam
                        current_time = time.time()
                        if current_time - self.last_signal_time < self.signal_cooldown_seconds:
                            logger.debug(f"Signal cooldown active: {self.signal_cooldown_seconds - (current_time - self.last_signal_time):.2f}s remaining")
                        else:
                            logger.info(f"🎯 Signal generated: {signal.direction.upper()} (strength: {signal.strength:.2f})")
                            logger.info(f"   RSI: {signal.indicators.get('rsi', 0):.2f} | MACD: {signal.indicators.get('macd', 0):.6f}")
                            
                            # Execute trade immediately on any signal (aggressive mode)
                            self._execute_trade(signal)
                            self.last_signal_time = current_time
                    else:
                        logger.debug(f"No signal (candles: {len(self.candles)})")
                except Exception as e:
                    logger.error(f"Error analyzing strategy: {e}", exc_info=True)
            else:
                logger.debug(f"⏳ Waiting for more candles: {len(self.candles)}/50")
            
            # Update positions
            self._update_positions()
            
            # Check daily loss limit
            if self.daily_loss >= self.settings.max_daily_loss:
                logger.warning(f"⚠️ Daily loss limit reached: ${self.daily_loss}")
                self.is_running = False
        
        except Exception as e:
            logger.error(f"Error processing candle data: {e}", exc_info=True)
    
    def start(self) -> None:
        """Start the trading bot with real-time streaming via StreamManager"""
        try:
            self.is_running = True
            logger.info("🚀 Starting trading bot...")
            
            # Initialize backend client
            logger.info("🔌 Initializing backend client...")
            self.backend_client = BackendClient(self.settings)
            if not self.backend_client.health_check():
                logger.warning("⚠️ Backend API not available - continuing without backend integration")
                self.backend_client = None
            else:
                logger.info("✅ Backend API connected")
            
            # Initialize SignalR client
            logger.info("📡 Initializing SignalR client...")
            self.signalr_client = SignalRClient(self.settings)
            if self.signalr_client.connect():
                logger.info("✅ SignalR connected")
                self.signalr_client.subscribe_to_portfolio(str(self.settings.portfolio_id))
            else:
                logger.warning("⚠️ SignalR not available - continuing without real-time updates")
                self.signalr_client = None
            
            # Create and connect DerivClient
            logger.info("📡 Creating DerivClient...")
            self.deriv_client = DerivClient(self.settings)
            self.deriv_client.connect()
            
            logger.info("✅ Connected to Deriv API")
            
            # Create StreamManager for real-time tick data
            logger.info("📡 Creating StreamManager for real-time ticks...")
            self.stream_manager = StreamManager(self.deriv_client.connection)
            
            # Subscribe to real-time candles via StreamManager
            # StreamManager will call _on_tick on EVERY tick update
            try:
                granularity = self._parse_timeframe(self.settings.timeframe)
                self.stream_manager.subscribe(
                    symbol=self.settings.symbol,
                    granularity=granularity,
                    callback=self._on_tick
                )
                
                logger.info(f"✅ Subscribed to real-time {self.settings.symbol} {self.settings.timeframe} candles via StreamManager (_on_tick callback)")
            
            except Exception as e:
                logger.error(f"Failed to subscribe to candles: {e}")
                raise
            
            # Keep bot running
            logger.info("✅ Bot is running. Press Ctrl+C to stop.")
            while self.is_running:
                time.sleep(1)
        
        except Exception as e:
            logger.error(f"Fatal error in bot: {e}", exc_info=True)
        
        finally:
            self.stop()
    




































































































































































































































    def _check_position_exits(self) -> None:
        """Check exits for open positions on EVERY tick (before normal exit logic)"""
        try:
            # Disabled: Let Deriv handle contract closure naturally
            # Exit logic was causing false early closures
            return
        except Exception as e:
            logger.error(f"Error in _check_position_exits: {e}", exc_info=True)

    
    def _can_execute_trade(self) -> bool:
        """Check if we can execute a trade based on concurrent trade limits"""
        # Check max concurrent trades limit
        if self.settings.max_concurrent_trades > 0:
            open_trades = len([p for p in self.positions if not p.is_closed])
            if open_trades >= self.settings.max_concurrent_trades:
                logger.debug(f"Max concurrent trades reached: {open_trades}/{self.settings.max_concurrent_trades}")
                return False
        
        return True
    
    def _execute_trade(self, signal: Signal) -> None:
        """Execute a trade based on signal"""
        try:
            # Check if we can execute based on cooldown
            if not self._can_execute_trade():
                return
            
            # No trade limits - execute immediately
            
            current_time = time.time()
            
            # Extract TP/SL from signal indicators
            tp = signal.indicators.get('tp', 0)
            sl = signal.indicators.get('sl', 0)
            
            # Create position with TP/SL from signal
            position = Position(
                symbol=self.settings.symbol,
                direction=signal.direction,
                stake=self.settings.stake_amount,
                entry_price=signal.entry_price,
                entry_time=datetime.now(),
                duration=self.settings.contract_duration,
                take_profit=tp,
                stop_loss=sl,
                take_profit_points=self.settings.take_profit_points,
                stop_loss_points=self.settings.stop_loss_points,
                break_even_points=self.settings.break_even_points,
                break_even_lock_points=self.settings.break_even_lock_points,
            )
            
            self.last_trade_time = current_time  # Update cooldown timer
            
            # Place trade via DerivClient with callback
            try:
                def on_trade_executed(trade_id: str):
                    """Callback when trade is executed"""
                    if trade_id:
                        position.trade_id = trade_id
                        self.positions.append(position)
                        self.strategy.reset_trade_counter()  # Reset tick counter for new trade
                        logger.info(f"💰 Trade executed: {position.direction} {position.symbol} @ {position.entry_price} | TP: {position.take_profit:.5f} | SL: {position.stop_loss:.5f} (ID: {trade_id})")
                        
                        # Save to local database
                        self.local_trade_db.create_trade(
                            symbol=position.symbol,
                            direction=position.direction,
                            stake=position.stake,
                            entry_price=position.entry_price,
                            duration=position.duration,
                            trade_id=trade_id
                        )
                        
                        # Send notification
                        self.notification_service.send_trade_opened(
                            symbol=position.symbol,
                            direction=position.direction,
                            stake=position.stake,
                            entry_price=position.entry_price,
                            trade_id=trade_id
                        )
                        
                        # Create trade in backend database
                        if self.backend_client:
                            self.backend_client.create_trade(
                                symbol=position.symbol,
                                direction=position.direction,
                                stake=position.stake,
                                entry_price=position.entry_price,
                                duration=position.duration,
                                trade_id=trade_id
                            )
                        
                        # Broadcast trade opened via SignalR
                        if self.signalr_client:
                            self.signalr_client.broadcast_trade_opened(
                                portfolio_id=str(self.settings.portfolio_id),
                                investor_id=self.settings.investor_id,
                                trade_data={
                                    "trade_id": trade_id,
                                    "symbol": position.symbol,
                                    "direction": position.direction,
                                    "stake": position.stake,
                                    "entry_price": position.entry_price
                                }
                            )
                
                self.deriv_client.place_trade(
                    symbol=position.symbol,
                    direction=position.direction,
                    stake=position.stake,
                    duration=position.duration,
                    on_executed=on_trade_executed
                )
            
            except Exception as e:
                logger.error(f"Error placing trade: {e}")
        
        except Exception as e:
            logger.error(f"Error executing trade: {e}", exc_info=True)
    
    def _update_positions(self) -> None:
        """Update open positions with latest price and check exits on EVERY tick"""
        try:
            for position in self.positions[:]:
                # Skip closed positions
                if position.is_closed:
                    continue
                
                # Update position with latest price
                if self.candles:
                    position.current_price = self.candles[-1].close
                    position.update_profit()
                    
                    # Increment trade tick counter for time-based exits
                    self.strategy.trade_tick_counter += 1
                    
                    # Calculate current indicators for invalid condition detection
                    ema_fast = None
                    ema_slow = None
                    histogram = None
                    rsi = None
                    momentum = None
                    ofi = None
                    
                    try:
                        from lemotickautostart.indicators.indicators import (
                            calculate_ema,
                            calculate_rsi,
                            calculate_macd,
                        )
                        
                        ema_fast_arr = calculate_ema(self.candles, 9)
                        ema_slow_arr = calculate_ema(self.candles, 21)
                        rsi_arr = calculate_rsi(self.candles, self.settings.rsi_period)
                        macd_arr = calculate_macd(
                            self.candles,
                            self.settings.macd_fast_period,
                            self.settings.macd_slow_period,
                            self.settings.macd_signal_period,
                        )
                        
                        ema_fast = ema_fast_arr[-1]["value"] if ema_fast_arr else None
                        ema_slow = ema_slow_arr[-1]["value"] if ema_slow_arr else None
                        rsi = rsi_arr[-1]["value"] if rsi_arr else None
                        macd_data = macd_arr[-1] if macd_arr else None
                        histogram = macd_data["histogram"] if macd_data else None
                        
                        momentum = self.strategy.tick_momentum(self.candles, window=8)
                        ofi = self.strategy.calculate_order_flow_imbalance(self.candles[-30:])
                    except Exception as e:
                        logger.debug(f"Error calculating indicators for exit check: {e}")
                    
                    # Check exit conditions on EVERY tick with indicator values
                    should_exit, exit_reason, new_sl = self.strategy.should_exit_trade(
                        direction=position.direction,
                        current_price=position.current_price,
                        entry_price=position.entry_price,
                        tp=position.take_profit,
                        sl=position.stop_loss,
                        ticks_held=self.strategy.trade_tick_counter,
                        ema_fast=ema_fast,
                        ema_slow=ema_slow,
                        histogram=histogram,
                        rsi=rsi,
                        momentum=momentum,
                        ofi=ofi,
                        candles=self.candles,
                    )
                    
                    # Update trailing stop loss
                    if new_sl != position.stop_loss:
                        position.stop_loss = new_sl
                    
                    # Exit if conditions met
                    if should_exit:
                        logger.info(f"🚪 EXITING TRADE: {exit_reason} | {position.direction} {position.symbol} @ {position.current_price:.5f}")
                        try:
                            self.deriv_client.close_trade(position.trade_id)
                            position.is_closed = True
                            position.close_price = position.current_price
                            position.close_time = datetime.now()
                            
                            # Update statistics
                            self.statistics.add_trade(TradeStats(
                                symbol=position.symbol,
                                direction=position.direction,
                                entry_price=position.entry_price,
                                exit_price=position.current_price,
                                profit_loss=position.profit_loss,
                                exit_reason=exit_reason
                            ))
                            
                            logger.info(f"✅ Trade closed: P&L: ${position.profit_loss:.2f}")
                            
                            # Remove closed position from list
                            self.positions.remove(position)
                        except Exception as e:
                            logger.error(f"Error closing trade: {e}")
                    
                    # Log position status for debugging
                    if position.take_profit_points:
                        points_profit = (position.current_price - position.entry_price) * 10000 if position.direction == 'rise' else (position.entry_price - position.current_price) * 10000
                        logger.debug(f"Position: {position.direction} | Entry: {position.entry_price:.4f} | Current: {position.current_price:.4f} | Points: {points_profit:.1f} | Ticks: {self.strategy.trade_tick_counter} | Reason: {exit_reason}")
        
        except Exception as e:
            logger.error(f"Error updating positions: {e}", exc_info=True)
    
    def stop(self) -> None:
        """Stop the trading bot and display statistics"""
        try:
            logger.info("🛑 Stopping trading bot...")
            self.is_running = False
            
            # Close all positions
            for position in self.positions:
                if not position.is_closed:
                    try:
                        self.deriv_client.close_trade(position.trade_id)
                    except Exception as e:
                        logger.error(f"Error closing trade: {e}")
            
            # Close connections
            if self.deriv_client:
                self.deriv_client.disconnect()
            
            if self.signalr_client:
                self.signalr_client.disconnect()
            
            if self.backend_client:
                self.backend_client.close()
            
            # Display statistics
            self.statistics.end_time = datetime.now()
            logger.info(self.statistics.get_summary())
            logger.info("✅ Bot stopped successfully")
        
        except Exception as e:
            logger.error(f"Error stopping bot: {e}", exc_info=True)
    
    def _parse_timeframe(self, timeframe: str) -> int:
        """Convert timeframe string to seconds"""
        timeframe = timeframe.lower().strip()
        
        if timeframe.endswith('m'):
            return int(timeframe[:-1]) * 60
        elif timeframe.endswith('h'):
            return int(timeframe[:-1]) * 3600
        elif timeframe.endswith('d'):
            return int(timeframe[:-1]) * 86400
        else:
            return 60  # Default to 1 minute
