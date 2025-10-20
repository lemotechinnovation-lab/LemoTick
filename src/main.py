"""
Main entry point for LemoTick trading bot.
Orchestrates all components and manages the trading loop.
"""

import time
import signal
import sys
import threading
from .config import config
from .logger import logger
from .stream_handler import StreamHandler
from .strategy_engine import StrategyEngine, SignalType
from .trade_executor import TradeExecutor
from .risk_manager import RiskManager
from .data_recorder import DataRecorder
from .metrics import get_metrics, start_metrics_server
from .loki_logger import get_loki_logger


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

        # Set up trade cancellation callback
        self.strategy_engine.on_trade_cancel = self._cancel_trade_by_strategy

        # Initialize monitoring
        self.metrics = get_metrics()
        self.loki_logger = get_loki_logger()

        # Performance tracking
        self.start_time = None
        self.tick_count = 0
        self.last_performance_log = 0

        # Setup signal handlers for graceful shutdown
        signal.signal(signal.SIGINT, self._signal_handler)
        signal.signal(signal.SIGTERM, self._signal_handler)

        # Start monitoring services
        if config.get("monitoring.prometheus_enabled", True):
            # Use environment variable for port, default to 8000 for Docker compatibility
            import os
            port = int(os.getenv("PROMETHEUS_PORT", "8000"))
            if start_metrics_server(port=port):
                logger.info(f"Prometheus metrics server started on port {port}")
            else:
                logger.warning(f"Failed to start Prometheus server on port {port}")

        logger.info("LemoTick bot initialized")

    def start(self) -> None:
        """Start the trading bot."""
        if self.is_running:
            logger.warning("Bot is already running")
            return

        logger.info("Starting LemoTick bot...")

        try:
            # Save initial configuration
            self.data_recorder.save_config_snapshot(
                {"settings": config.settings, "start_time": time.time()}
            )

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
                    logger.warning(
                        "WebSocket disconnected, waiting for reconnection..."
                    )
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
            if config.get("data.tick_storage", True):
                self.data_recorder.record_tick(price, epoch)

            # Update strategy engine
            result = self.strategy_engine.update(price, epoch)
            if isinstance(result, tuple):
                signal, duration = result
            else:
                # Handle case where strategy returns just signal (for backward compatibility)
                signal = result
                duration = 1  # Default duration


            # Cleanup expired trades from strategy engine tracking
            self.strategy_engine.cleanup_expired_trades()

            # Check for trades with invalid EMA conditions after 7 ticks
            trades_to_cancel = self.strategy_engine.get_trades_to_cancel(min_ticks_before_check=7)
            if trades_to_cancel:
                logger.warning(f"Found {len(trades_to_cancel)} trades to cancel due to invalid EMA conditions after 7+ ticks")

                # Cancel the trades that no longer meet EMA conditions
                logger.info(f"Attempting to cancel {len(trades_to_cancel)} trades: {[t['signal'] for t in trades_to_cancel]}")
                self.strategy_engine.cancel_trades(trades_to_cancel)

            # Handle trading signals (EMA + Pin Bar strategy)
            if signal != SignalType.HOLD:
                logger.info(f"Generated {signal.value} signal with {duration} minute duration")
                logger.debug(f"Current active trades: {len(self.strategy_engine.active_trades)}")
                if self.strategy_engine.active_trades:
                    logger.debug(f"Active trade details: {[(t['signal'], t.get('entry_time', 'unknown'), t.get('ticks_elapsed', 0)) for t in self.strategy_engine.active_trades]}")
                self._handle_pinbar_signal(signal, price, epoch, duration)

            # Log performance metrics periodically
            current_time = time.time()
            if current_time - self.last_performance_log > 300:  # Every 5 minutes
                self._log_performance_metrics()
                self.last_performance_log = current_time

        except Exception as e:
            logger.error(f"Error processing tick: {e}")

    def _handle_pinbar_signal(self, signal: SignalType, price: float, epoch: int, duration: int) -> None:
        """
        Handle Pin Bar trading signal using direct buy orders.

        Args:
            signal: Trading signal
            price: Current price
            epoch: Price timestamp
            duration: Contract duration in minutes
        """
        try:
            # Check for active trades before placing new ones
            if self.strategy_engine.has_active_trades():
                logger.warning(f"Active trade(s) in progress, skipping new {signal.value} signal")
                return

            # For pin bars, we use current price as barrier for binary options
            barrier_price = price

            # Revalidate signal before execution
            current_spot = self.stream_handler.get_latest_tick(config.symbol)
            if current_spot is None:
                logger.warning("No current spot price available, skipping trade")
                return

            # Check if market moved against us before execution
            if signal == SignalType.BUY and current_spot < price * 0.995:  # 0.5% buffer
                logger.warning(f"Market reversed before buy (signal: {price}, current: {current_spot})")
                return
            elif signal == SignalType.SELL and current_spot > price * 1.005:  # 0.5% buffer
                logger.warning(f"Market reversed before sell (signal: {price}, current: {current_spot})")
                return

            # Get current indicator values for stake calculation
            indicators = self.strategy_engine.get_indicator_values()

            # Extract indicator values
            volatility = indicators.get("volatility", 0.001)
            momentum_val = indicators.get("momentum", 0.0)
            ema_2_val = indicators.get("ema_2", 0.0)
            ema_5_val = indicators.get("ema_5", 0.0)

            # Calculate base stake size
            base_stake = self.risk_manager.calculate_stake(volatility)

            # Apply dynamic stake sizing for profit guarantee
            win_rate = getattr(self.strategy_engine, 'win_rate', 0.0)
            consecutive_wins = getattr(self.strategy_engine, 'consecutive_wins', 0)
            consecutive_losses = getattr(self.strategy_engine, 'consecutive_losses', 0)

            stake = self.risk_manager.calculate_dynamic_stake(
                base_stake=base_stake,
                win_rate=win_rate,
                consecutive_wins=consecutive_wins,
                consecutive_losses=consecutive_losses
            )

            # Place direct buy order with barrier price and duration
            trade_id = self.trade_executor.place_trade(
                signal_type=signal.value,
                stake=stake,
                entry_price=barrier_price,  # Use current price as barrier for binary options
                duration=duration,  # Use pattern-specific duration
                on_trade_result=self._on_trade_result,
            )

            if trade_id:
                # Register trade with risk manager
                self.risk_manager.register_trade(
                    trade_id=trade_id,
                    trade_type=signal.value,
                    stake=stake,
                    entry_price=price,
                    timestamp=epoch,
                )

                # Register executed trade in strategy engine for monitoring
                self.strategy_engine.register_executed_trade(
                    signal=signal.value,
                    entry_time=epoch,
                    entry_tick=self.strategy_engine.tick_count,
                    duration=duration
                )

                logger.info(
                    f"Pin Bar direct buy: {trade_id} - {signal.value} {stake} at barrier {barrier_price}"
                )

        except Exception as e:
            logger.error(f"Error handling Pin Bar signal: {e}")

    def _cancel_trade_by_strategy(self, trade_data: dict) -> None:
        """
        Cancel a trade based on strategy conditions (e.g., 7-tick EMA condition failure).

        Args:
            trade_data: Trade data dictionary containing signal and other info
        """
        try:
            logger.warning(f"Strategy requesting cancellation of {trade_data['signal']} trade")

            # For Deriv binary options, we need to find the active contract and sell it
            # We don't have direct access to contract_id here, so we'll need to find it
            # by looking at active contracts in the trade executor

            # Get all active contracts
            active_contracts = self.trade_executor.active_contracts

            # Find the contract that matches this trade (by signal type and status)
            contract_to_cancel = None
            for contract_id, contract_data in active_contracts.items():
                if (contract_data.get("signal_type") == trade_data.get("signal") and
                    contract_data.get("status") == "active"):
                    contract_to_cancel = contract_id
                    break

            if contract_to_cancel:
                logger.info(f"Found active contract {contract_to_cancel} to cancel")
                # Attempt to sell/cancel the contract
                self.trade_executor._execute_sell(contract_to_cancel, "ema_condition_failed")
            else:
                logger.warning(f"No active contract found to cancel for {trade_data.get('signal')} trade. Available contracts: {list(active_contracts.keys())}")

        except Exception as e:
            logger.error(f"Error cancelling trade by strategy: {e}")

    def _on_trade_result(self, trade_data: dict, status: str) -> None:
        """
        Handle trade result callback.

        Args:
            trade_data: Trade data dictionary
            status: Trade status
        """
        try:
            # Defensive check for trade_data
            if not trade_data or not isinstance(trade_data, dict):
                logger.error(f"Invalid trade_data received: {trade_data}")
                return

            trade_id = trade_data.get("trade_id")
            signal_type = trade_data.get("signal_type")

            # Ensure we have a valid trade_id
            if not trade_id:
                logger.error(f"No trade_id in trade_data: {trade_data}")
                return

            if status == "executed":
                # Trade was successfully placed, add to strategy engine's active trades
                duration = trade_data.get("duration", 1)  # Default to 1 minute if not specified
                epoch = trade_data.get("timestamp", int(time.time()))

                # Add to strategy engine's active trades for proper tracking
                self.strategy_engine.active_trades.append({
                    "signal": signal_type,
                    "entry_time": epoch,
                    "entry_tick": getattr(self.strategy_engine, 'tick_count', 0),
                    "duration": duration,
                    "trade_id": trade_id
                })

                logger.info(f"Trade executed and tracked: {trade_id} - {signal_type}")

            elif status == "completed":
                # Remove from strategy engine's active trades
                self.strategy_engine.active_trades = [
                    trade for trade in self.strategy_engine.active_trades
                    if trade.get("trade_id") != trade_id
                ]

                # Update risk manager
                profit = trade_data.get("final_profit", 0)
                exit_price = trade_data.get("exit_price", 0)
                completion_time = trade_data.get("completion_time", int(time.time()))

                self.risk_manager.close_trade(
                    trade_id=trade_id, exit_price=exit_price, timestamp=completion_time
                )

                # Update strategy with trade result for reversal logic
                result = "win" if profit > 0 else "loss"
                self.strategy_engine.update_trade_result(result, profit)

                # Record trade in database
                self.data_recorder.record_trade(trade_data)

                logger.info(f"Trade completed and removed from tracking: {trade_id} - P&L: {profit}")

            elif status == "cancelled":
                # Remove from strategy engine's active trades
                self.strategy_engine.active_trades = [
                    trade for trade in self.strategy_engine.active_trades
                    if trade.get("trade_id") != trade_id
                ]

                logger.warning(f"Trade cancelled and removed from tracking: {trade_id}")
                # Ensure capacity is freed
                try:
                    self.risk_manager.remove_trade(trade_id)
                except Exception:
                    pass

        except Exception as e:
            logger.error(f"Error handling trade result for status {status}: {e}")
            logger.error(f"Trade data received: {trade_data}")

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
                "uptime_seconds": uptime,
                "tick_count": self.tick_count,
                "risk_metrics": risk_metrics,
                "strategy_stats": strategy_stats,
                "executor_status": executor_status,
                "connection_status": self.stream_handler.get_connection_status(),
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
                    "session_uptime": uptime,
                    "total_ticks": self.tick_count,
                    "final_equity": self.risk_manager.current_equity,
                    "total_trades": self.risk_manager.total_trades,
                    "total_profit": self.risk_manager.total_profit,
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
            "is_running": self.is_running,
            "uptime": time.time() - self.start_time if self.start_time else 0,
            "tick_count": self.tick_count,
            "risk_metrics": self.risk_manager.get_risk_metrics(),
            "strategy_status": self.strategy_engine.get_strategy_status(),
            "executor_status": self.trade_executor.get_trade_status(),
            "connection_status": self.stream_handler.get_connection_status(),
            "database_stats": self.data_recorder.get_database_stats(),
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
