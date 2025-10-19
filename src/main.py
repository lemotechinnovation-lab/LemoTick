"""
Main entry point for LemoTick trading bot.
Orchestrates all components and manages the trading loop.
"""

import time
import signal
import sys
import threading
from typing import Optional
from .config import config
from .logger import logger
from .stream_handler import StreamHandler
from .strategy_engine import StrategyEngine, SignalType
from .trade_executor import TradeExecutor
from .risk_manager import RiskManager
from .data_recorder import DataRecorder


class LemoTickBot:
    """Main trading bot orchestrator."""
    
    def __init__(self):
        """Initialize the trading bot."""
        self.is_running = False
        self.shutdown_event = threading.Event()
        
        # Initialize components
        self.risk_manager = RiskManager(initial_equity=1000.0)
        self.data_recorder = DataRecorder()
        self.strategy_engine = StrategyEngine()
        self.stream_handler = StreamHandler(self._on_tick_received)
        self.trade_executor = TradeExecutor(self.stream_handler)
        
        # Performance tracking
        self.start_time = None
        self.tick_count = 0
        self.last_performance_log = 0
        
        # Setup signal handlers for graceful shutdown
        signal.signal(signal.SIGINT, self._signal_handler)
        signal.signal(signal.SIGTERM, self._signal_handler)
        
        logger.info("LemoTick bot initialized")
    
    def start(self) -> None:
        """Start the trading bot."""
        if self.is_running:
            logger.warning("Bot is already running")
            return
        
        logger.info("Starting LemoTick bot...")
        
        try:
            # Save initial configuration
            self.data_recorder.save_config_snapshot({
                'settings': config.settings,
                'start_time': time.time()
            })
            
            # Start stream handler
            self.stream_handler.start()
            
            # Start performance monitoring thread
            self._start_performance_monitor()
            
            self.is_running = True
            self.start_time = time.time()
            
            logger.info("LemoTick bot started successfully")
            
            # Main trading loop
            self._trading_loop()
            
        except Exception as e:
            logger.error(f"Error starting bot: {e}")
            self.stop()
            raise
    
    def stop(self) -> None:
        """Stop the trading bot gracefully."""
        if not self.is_running:
            return
        
        logger.info("Stopping LemoTick bot...")
        
        self.is_running = False
        self.shutdown_event.set()
        
        # Stop stream handler
        if self.stream_handler:
            self.stream_handler.stop()
        
        # Record final performance metrics
        self._record_final_metrics()
        
        logger.info("LemoTick bot stopped")
    
    def _trading_loop(self) -> None:
        """Main trading loop."""
        logger.info("Entering main trading loop")
        
        while self.is_running and not self.shutdown_event.is_set():
            try:
                # Check if we can trade
                can_trade, reason = self.risk_manager.can_trade()
                if not can_trade:
                    logger.debug(f"Trading paused: {reason}")
                    time.sleep(1)
                    continue
                
                # Check connection status
                if not self.stream_handler.is_connected:
                    logger.warning("WebSocket disconnected, waiting for reconnection...")
                    time.sleep(5)
                    continue
                
                # Small sleep to prevent busy waiting
                time.sleep(0.1)
                
            except KeyboardInterrupt:
                logger.info("Received keyboard interrupt")
                break
            except Exception as e:
                logger.error(f"Error in trading loop: {e}")
                time.sleep(1)
        
        logger.info("Trading loop exited")
    
    def _on_tick_received(self, price: float, epoch: int) -> None:
        """
        Handle incoming tick data.
        
        Args:
            price: Tick price
            epoch: Tick epoch timestamp
        """
        try:
            self.tick_count += 1
            
            # Record tick data
            if config.get('data.tick_storage', True):
                self.data_recorder.record_tick(price, epoch)
            
            # Update strategy engine
            signal = self.strategy_engine.update(price, epoch)
            
            # Handle trading signals
            if signal != SignalType.HOLD:
                self._handle_trading_signal(signal, price, epoch)
            
            # Log performance metrics periodically
            current_time = time.time()
            if current_time - self.last_performance_log > 300:  # Every 5 minutes
                self._log_performance_metrics()
                self.last_performance_log = current_time
                
        except Exception as e:
            logger.error(f"Error processing tick: {e}")
    
    def _handle_trading_signal(self, signal: SignalType, price: float, epoch: int) -> None:
        """
        Handle trading signal from strategy engine.
        
        Args:
            signal: Trading signal
            price: Current price
            epoch: Price timestamp
        """
        try:
            # Get current indicator values for stake calculation
            indicators = self.strategy_engine.get_indicator_values()
            volatility = indicators.get('volatility', 0.001)
            
            # Calculate stake size
            stake = self.risk_manager.calculate_stake(volatility)
            
            # Place trade
            trade_id = self.trade_executor.place_trade(
                signal_type=signal.value,
                stake=stake,
                on_trade_result=self._on_trade_result
            )
            
            if trade_id:
                # Register trade with risk manager
                self.risk_manager.register_trade(
                    trade_id=trade_id,
                    trade_type=signal.value,
                    stake=stake,
                    entry_price=price,
                    timestamp=epoch
                )
                
                logger.info(f"Trade placed: {trade_id} - {signal.value} {stake} at {price}")
            
        except Exception as e:
            logger.error(f"Error handling trading signal: {e}")
    
    def _on_trade_result(self, trade_data: dict, status: str) -> None:
        """
        Handle trade result callback.
        
        Args:
            trade_data: Trade data dictionary
            status: Trade status
        """
        try:
            trade_id = trade_data.get('trade_id')
            
            if status == 'completed':
                # Update risk manager
                profit = trade_data.get('final_profit', 0)
                exit_price = trade_data.get('exit_price', 0)
                completion_time = trade_data.get('completion_time', int(time.time()))
                
                result = self.risk_manager.close_trade(
                    trade_id=trade_id,
                    exit_price=exit_price,
                    timestamp=completion_time
                )
                
                # Record trade in database
                self.data_recorder.record_trade(trade_data)
                
                logger.info(f"Trade completed: {trade_id} - P&L: {profit}")
                
            elif status == 'cancelled':
                logger.warning(f"Trade cancelled: {trade_id}")
                # Remove from risk manager tracking if needed
                
        except Exception as e:
            logger.error(f"Error handling trade result: {e}")
    
    def _start_performance_monitor(self) -> None:
        """Start performance monitoring thread."""
        def monitor_performance():
            while self.is_running and not self.shutdown_event.is_set():
                try:
                    time.sleep(300)  # Check every 5 minutes
                    
                    if self.is_running:
                        self._log_performance_metrics()
                        
                except Exception as e:
                    logger.error(f"Error in performance monitor: {e}")
        
        monitor_thread = threading.Thread(target=monitor_performance, daemon=True)
        monitor_thread.start()
    
    def _log_performance_metrics(self) -> None:
        """Log current performance metrics."""
        try:
            # Get risk metrics
            risk_metrics = self.risk_manager.get_risk_metrics()
            
            # Get strategy statistics
            strategy_stats = self.strategy_engine.get_signal_statistics()
            
            # Get trade executor status
            executor_status = self.trade_executor.get_trade_status()
            
            # Calculate uptime
            uptime = time.time() - self.start_time if self.start_time else 0
            
            metrics = {
                'uptime_seconds': uptime,
                'tick_count': self.tick_count,
                'risk_metrics': risk_metrics,
                'strategy_stats': strategy_stats,
                'executor_status': executor_status,
                'connection_status': self.stream_handler.get_connection_status()
            }
            
            logger.log_performance(metrics)
            
        except Exception as e:
            logger.error(f"Error logging performance metrics: {e}")
    
    def _record_final_metrics(self) -> None:
        """Record final performance metrics before shutdown."""
        try:
            if self.start_time:
                uptime = time.time() - self.start_time
                
                final_metrics = {
                    'session_uptime': uptime,
                    'total_ticks': self.tick_count,
                    'final_equity': self.risk_manager.current_equity,
                    'total_trades': self.risk_manager.total_trades,
                    'total_profit': self.risk_manager.total_profit
                }
                
                logger.info("Final session metrics", final_metrics)
                
        except Exception as e:
            logger.error(f"Error recording final metrics: {e}")
    
    def _signal_handler(self, signum, frame) -> None:
        """Handle shutdown signals."""
        logger.info(f"Received signal {signum}, initiating graceful shutdown...")
        self.stop()
        sys.exit(0)
    
    def get_bot_status(self) -> dict:
        """
        Get comprehensive bot status.
        
        Returns:
            Bot status dictionary
        """
        return {
            'is_running': self.is_running,
            'uptime': time.time() - self.start_time if self.start_time else 0,
            'tick_count': self.tick_count,
            'risk_metrics': self.risk_manager.get_risk_metrics(),
            'strategy_status': self.strategy_engine.get_strategy_status(),
            'executor_status': self.trade_executor.get_trade_status(),
            'connection_status': self.stream_handler.get_connection_status(),
            'database_stats': self.data_recorder.get_database_stats()
        }


def main():
    """Main entry point."""
    try:
        # Initialize and start bot
        bot = LemoTickBot()
        bot.start()
        
    except KeyboardInterrupt:
        logger.info("Received keyboard interrupt, shutting down...")
    except Exception as e:
        logger.critical(f"Fatal error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()

