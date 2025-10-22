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
from .market_selector import get_market_selector


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
        self.trade_executor = TradeExecutor(self.stream_handler, self.strategy_engine, self.data_recorder)

        # Initialize market selector for optimal market selection
        self.market_selector = get_market_selector()
        self.current_symbol = config.get("trading.symbol", "R_100")
        self.last_market_switch = 0

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
        last_tick_time = time.time()
        last_market_check = 0

        while self.is_running and not self.shutdown_event.is_set():
            try:
                current_time = time.time()

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

                # Check for market switching (every 5 minutes)
                if current_time - last_market_check > 300:  # Every 5 minutes
                    self._check_and_switch_market()
                    last_market_check = current_time

                # Log status periodically to show bot is alive
                if current_time - last_tick_time > 10:  # Every 10 seconds
                    logger.info(f"Bot running - Market: {self.current_symbol}, Active trades: {len(self.strategy_engine.active_trades)}")
                    last_tick_time = current_time

                # Small sleep to prevent busy waiting
                time.sleep(0.1)

            except KeyboardInterrupt:
                logger.info("Received keyboard interrupt")
                break
            except Exception as e:
                logger.error(f"Error in trading loop: {e}")
                time.sleep(1)

        logger.info("Trading loop exited")

    def _check_and_switch_market(self) -> None:
        """
        Check if market should be switched based on performance and switch if needed.
        """
        try:
            current_time = time.time()

            # Check minimum interval between switches
            min_switch_interval = config.get("strategy.min_market_switch_interval", 300)
            if current_time - self.last_market_switch < min_switch_interval:
                return

            # Check if current market should be switched
            if self.market_selector.should_switch_market(self.current_symbol):
                # Get best alternative market
                new_symbol = self.market_selector.get_best_alternative_market(
                    self.current_symbol,
                    config.get("trading.contract_duration", 1)
                )

                if new_symbol != self.current_symbol:
                    logger.info(f"Switching market from {self.current_symbol} to {new_symbol}")

                    # Update current symbol
                    self.current_symbol = new_symbol
                    self.last_market_switch = current_time

                    # Update stream handler to use new symbol
                    # Note: This would need to be implemented in stream_handler
                    # For now, we'll log the change
                    logger.info(f"Market switched to {self.current_symbol}")

                    # Update configuration
                    # Note: In a real implementation, this would update the stream subscription
                    # For now, we'll just log and track the change

            else:
                logger.debug(f"Market {self.current_symbol} performance OK, no switch needed")

        except Exception as e:
            logger.error(f"Error checking market switch: {e}")

    def _check_early_closure_conditions(self, current_price: float, epoch: int) -> None:
        """
        Check active trades for early closure conditions:
        - If 8+ ticks elapsed and trade is losing -> close immediately
        - If 8+ ticks elapsed and not losing -> start monitoring for TP
        - If price indicates significant loss (< 0) -> close immediately
        - MACD-based closure: If MACD contradicts trade direction for 5+ ticks -> close

        Args:
            current_price: Current market price
            epoch: Current timestamp
        """
        try:
            # Check active contracts in trade executor
            active_contracts = self.trade_executor.active_contracts
            
            if not active_contracts:
                return  # No active contracts to check
                
            logger.info(f"Checking early closure for {len(active_contracts)} active contracts")
            
            for contract_id, contract_data in list(active_contracts.items()):
                try:
                    # Use the trade executor's early closure logic with tick count
                    should_close, reason = self.trade_executor.should_close_early(contract_data, self.tick_count)
                    
                    # Debug logging for early closure analysis
                    logger.info(f"Early closure check for {contract_id}: should_close={should_close}, reason='{reason}'")
                    
                    if should_close:
                        logger.warning(f"EARLY CLOSURE TRIGGERED for contract {contract_id}: {reason}")
                        logger.info(f"[LemoTick] Early closure triggered for contract {contract_id}")
                        self.trade_executor._execute_sell(contract_id, f"early_closure_{reason}")
                        logger.info(f"[LemoTick] Sell request sent for contract {contract_id}")
                    else:
                        logger.debug(f"Contract {contract_id} not ready for early closure: {reason}")

                except Exception as e:
                    logger.error(f"Error checking contract {contract_id}: {e}")
                    continue

        except Exception as e:
            logger.error(f"Error in early closure check: {e}")

    def _is_trade_losing(self, signal: str, current_price: float, trade: dict) -> bool:
        """
        Determine if a trade is currently losing based on price movement relative to barrier.

        Args:
            signal: Trade signal (BUY/SELL)
            current_price: Current market price
            trade: Trade data dictionary

        Returns:
            True if trade is losing, False otherwise
        """
        try:
            # For binary options, we can estimate based on barrier and current price
            # This is an approximation since we don't have real-time indicative prices

            barrier = trade.get("barrier", 0)
            if barrier == 0:
                # No barrier info, can't determine
                return False

            if signal == "BUY":  # CALL option
                # For CALL, we're losing if current price is below barrier
                # (option is out-of-the-money)
                return current_price <= barrier
            else:  # SELL option (PUT)
                # For PUT, we're losing if current price is above barrier
                # (option is out-of-the-money)
                return current_price >= barrier

        except Exception as e:
            logger.error(f"Error checking if trade is losing: {e}")
            return False

    def _should_take_profit(self, signal: str, current_price: float, trade: dict) -> bool:
        """
        Check if take profit conditions are met based on barrier and current price.

        Args:
            signal: Trade signal (BUY/SELL)
            current_price: Current market price
            trade: Trade data dictionary

        Returns:
            True if should take profit, False otherwise
        """
        try:
            # For binary options, we can estimate profit based on barrier and current price
            # If the option is significantly in-the-money, consider taking profit

            barrier = trade.get("barrier", 0)
            if barrier == 0:
                # No barrier info, can't determine
                return False

            # Calculate distance from barrier (how in-the-money the option is)
            distance_from_barrier = abs(current_price - barrier)
            barrier_threshold = barrier * 0.001  # 0.1% threshold

            if signal == "BUY":  # CALL option
                # For CALL, we're in profit if current price is significantly above barrier
                return current_price > barrier + barrier_threshold
            else:  # SELL option (PUT)
                # For PUT, we're in profit if current price is significantly below barrier
                return current_price < barrier - barrier_threshold

        except Exception as e:
            logger.error(f"Error checking take profit condition: {e}")
            return False

    def _check_macd_contradiction(self, signal: str, trade: dict) -> bool:
        """
        Check if MACD contradicts the trade direction for 5+ consecutive ticks.
        
        Args:
            signal: Trade signal (BUY/SELL)
            trade: Trade data dictionary
            
        Returns:
            True if MACD contradicts direction for 5+ ticks, False otherwise
        """
        try:
            # Check if MACD early closure is enabled
            if not config.get("strategy.macd_early_closure_enabled", True):
                return False  # MACD early closure disabled
            
            # Get current MACD values
            macd_line, macd_signal, macd_histogram = self.strategy_engine.macd.get_value()
            
            # Check if MACD is ready
            if not self.strategy_engine.macd.is_ready():
                return False  # MACD not ready, can't make decision
            
            # Initialize MACD contradiction tracking if not exists
            if "macd_contradiction_count" not in trade:
                trade["macd_contradiction_count"] = 0
                trade["last_macd_histogram"] = macd_histogram
            
            # Check if MACD contradicts the trade direction
            macd_contradicts = False
            
            if signal == "BUY":
                # For BUY trades, MACD should be positive (bullish)
                # If MACD histogram is negative for 5+ ticks, it contradicts the BUY signal
                if macd_histogram < 0:
                    macd_contradicts = True
            elif signal == "SELL":
                # For SELL trades, MACD should be negative (bearish)  
                # If MACD histogram is positive for 5+ ticks, it contradicts the SELL signal
                if macd_histogram > 0:
                    macd_contradicts = True
            
            # Update contradiction count
            if macd_contradicts:
                trade["macd_contradiction_count"] += 1
                logger.debug(f"MACD contradicts {signal} trade: histogram={macd_histogram:.6f}, count={trade['macd_contradiction_count']}")
            else:
                # Reset count if MACD no longer contradicts
                trade["macd_contradiction_count"] = 0
                logger.debug(f"MACD supports {signal} trade: histogram={macd_histogram:.6f}, count reset to 0")
            
            # Update last MACD histogram for tracking
            trade["last_macd_histogram"] = macd_histogram
            
            # Return True if MACD has contradicted for the configured threshold
            macd_threshold = config.get("strategy.macd_contradiction_threshold", 5)
            return trade["macd_contradiction_count"] >= macd_threshold
            
        except Exception as e:
            logger.error(f"Error checking MACD contradiction: {e}")
            return False

    def _close_trade_early(self, trade: dict, reason: str) -> None:
        """
        Close a trade early based on conditions.

        Args:
            trade: Trade data dictionary
            reason: Reason for early closure
        """
        try:
            trade_id = trade.get("trade_id")
            signal = trade.get("signal", "unknown")

            if not trade_id:
                logger.error(f"Cannot close trade - no trade_id: {trade}")
                return

            logger.warning(f"Closing {signal} trade early: {reason}")

            # Call cancellation callback if available
            if self.strategy_engine.on_trade_cancel:
                try:
                    logger.info(f"Calling early closure callback for {signal} trade")
                    self.strategy_engine.on_trade_cancel(trade)
                    logger.info(f"Early closure callback completed for {signal} trade")
                except Exception as e:
                    logger.error(f"Error in early closure callback: {e}")
            else:
                logger.warning("No early closure callback set")

        except Exception as e:
            logger.error(f"Error in early trade closure: {e}")

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
            logger.debug(f"Updating strategy engine with price: {price}")
            try:
                result = self.strategy_engine.update(price, epoch)
                logger.debug(f"Strategy engine result: {result}, type: {type(result)}")
            except Exception as e:
                logger.error(f"Exception in strategy engine update: {e}")
                logger.error(f"Exception type: {type(e).__name__}")
                import traceback
                logger.error(f"Traceback: {traceback.format_exc()}")
                # Return early if strategy engine fails
                return

            try:
                if isinstance(result, tuple) and len(result) == 3:
                    signal, duration, risk_reward = result
                    logger.debug(f"Parsed signal: {signal}, duration: {duration}, risk_reward: {risk_reward}")
                elif isinstance(result, tuple) and len(result) == 2:
                    signal, duration = result
                    risk_reward = None  # No risk/reward values available
                    logger.debug(f"Parsed signal (no risk/reward): {signal}, duration: {duration}")
                else:
                    # Handle case where strategy returns just signal (for backward compatibility)
                    signal = result
                    duration = 1  # Default duration
                    risk_reward = None  # No risk/reward values available
                    logger.debug(f"Parsed single signal: {signal}")

                # Debug: Check what signal we got
                logger.debug(f"Final signal check: signal={signal}, type={type(signal)}, is_hold={signal == SignalType.HOLD}")
            except Exception as e:
                logger.error(f"Exception in signal parsing: {e}")
                logger.error(f"Exception type: {type(e).__name__}")
                import traceback
                logger.error(f"Traceback: {traceback.format_exc()}")
                # Return early if signal parsing fails
                return

            # Cleanup expired trades from strategy engine tracking
            self.strategy_engine.cleanup_expired_trades()

            # Check for active trades first - prevent new signals if trades are active
            if self.strategy_engine.active_trades:
                logger.debug(f"Active trades exist ({len(self.strategy_engine.active_trades)}), skipping new signal generation")

                # Check for early closure conditions for active trades
                self._check_early_closure_conditions(price, epoch)
                return

            # Check for trades with invalid EMA conditions after 7 ticks
            trades_to_cancel = self.strategy_engine.get_trades_to_cancel(min_ticks_before_check=7)
            if trades_to_cancel:
                logger.warning(f"Found {len(trades_to_cancel)} trades to cancel due to invalid EMA conditions after 7+ ticks")

                # Cancel the trades that no longer meet EMA conditions
                logger.info(f"Attempting to cancel {len(trades_to_cancel)} trades: {[t['signal'] for t in trades_to_cancel]}")
                self.strategy_engine.cancel_trades(trades_to_cancel)
                return

            # Handle trading signals (EMA + Pin Bar strategy)
            logger.debug(f"About to check signal: {signal}")
            if signal != SignalType.HOLD:
                logger.info(f"Generated {signal.value} signal with {duration} minute duration")
                logger.debug(f"Current active trades: {len(self.strategy_engine.active_trades)}")

                # Debug: Log risk/reward values for position sizing
                if risk_reward:
                    logger.info(f"Risk/Reward calculated: Risk={risk_reward.get('risk')}, Reward={risk_reward.get('reward')}")
                else:
                    logger.warning("No risk/reward values calculated for signal!")

                # Note: No SL/TP for CALL/PUT contracts - they only work with Multiplier contracts
                self._handle_pinbar_signal(signal, price, epoch, duration, None)

            # Log performance metrics periodically
            current_time = time.time()
            if current_time - self.last_performance_log > 300:  # Every 5 minutes
                self._log_performance_metrics()
                self.last_performance_log = current_time

        except Exception as e:
            logger.error(f"Error processing tick: {e}")
            logger.error(f"Exception type: {type(e).__name__}")
            import traceback
            logger.error(f"Traceback: {traceback.format_exc()}")

    def _handle_pinbar_signal(self, signal: SignalType, price: float, epoch: int, duration: int, risk_reward: dict = None) -> None:
        """
        Handle Pin Bar trading signal using direct buy orders.

        Args:
            signal: Trading signal
            price: Current price
            epoch: Price timestamp
            duration: Contract duration in minutes
            risk_reward: Risk/reward calculations for position sizing (optional)
        """
        try:
            # CRITICAL FIX: Wait for active trades to finish before placing new ones
            # This prevents overlapping trades and ensures proper trade waiting
            if len(self.strategy_engine.active_trades) > 0:
                active_trade_info = []
                current_time = int(time.time())

                for trade in self.strategy_engine.active_trades:
                    entry_time = trade.get("entry_time")
                    trade_duration = trade.get("duration", 1)
                    if entry_time is not None:
                        time_elapsed = current_time - entry_time
                        time_remaining = max(0, (trade_duration * 60) - time_elapsed)
                        active_trade_info.append({
                            "signal": trade.get("signal", "unknown"),
                            "time_elapsed": time_elapsed,
                            "time_remaining": time_remaining,
                            "duration": trade_duration * 60
                        })

                logger.warning(f"Active trade(s) in progress - WAITING for completion. Active trades: {len(self.strategy_engine.active_trades)}")
                for trade_info in active_trade_info:
                    logger.warning(f"  Trade {trade_info['signal']}: elapsed {trade_info['time_elapsed']}s, remaining {trade_info['time_remaining']}s")

                # DO NOT place new trades until current ones finish
                return

            # Check trade cooldown period (prevents rapid trade execution)
            current_time = time.time()
            time_since_last_trade = current_time - self.strategy_engine.last_trade_timestamp
            trade_cooldown_seconds = self.strategy_engine.trade_cooldown_seconds

            if time_since_last_trade < trade_cooldown_seconds:
                remaining_time = trade_cooldown_seconds - time_since_last_trade
                logger.info(f"TRADE COOLDOWN ACTIVE: {time_since_last_trade:.1f}s elapsed, {remaining_time:.1f}s remaining (cooldown: {trade_cooldown_seconds}s)")
                return

            # For pin bars, we use current price as barrier for binary options
            barrier_price = price

            # Revalidate signal before execution
            current_spot = self.stream_handler.get_latest_tick(self.current_symbol)
            if current_spot is None:
                logger.warning("No current spot price available, skipping trade")
                return

            # Check if market moved against us before execution (reduced buffer for faster execution)
            if signal == SignalType.BUY and current_spot < price * 0.998:  # 0.2% buffer for faster execution
                logger.warning(f"Market reversed before buy (signal: {price}, current: {current_spot})")
                return
            elif signal == SignalType.SELL and current_spot > price * 1.002:  # 0.2% buffer for faster execution
                logger.warning(f"Market reversed before sell (signal: {price}, current: {current_spot})")
                return

            # Get current indicator values for stake calculation
            indicators = self.strategy_engine.get_indicator_values()

            # Extract indicator values
            volatility = indicators.get("volatility", 0.001)
            momentum_val = indicators.get("momentum", 0.0)
            ema_5_val = indicators.get("ema_5", 0.0)
            ema_8_val = indicators.get("ema_8", 0.0)

            # Calculate stake using percentage-based risk management
            # Get signal strength from MACD histogram for stake sizing
            macd_line, macd_signal, macd_histogram = self.strategy_engine.macd.get_value()
            signal_strength = min(abs(macd_histogram) / 0.5, 1.0)  # Normalize to 0-1 range

            stake = self.risk_manager.calculate_stake(
                volatility=indicators.get("volatility", 0.001),
                confidence=0.8,  # Default confidence, could be calculated from signal quality
                signal_strength=signal_strength
            )

            # Log stake calculation for debugging
            logger.info(f"Calculated stake using percentage-based risk: {stake} (strength: {signal_strength:.2f})")

            # Place direct buy order with barrier price and duration
            # NOTE: No SL/TP for CALL/PUT contracts - only supported for Multiplier contracts

            logger.info(f"Attempting to place trade: {signal.value} stake={stake} duration={duration} symbol={self.current_symbol} (CALL/PUT - no SL/TP)")
            trade_id = self.trade_executor.place_trade(
                signal_type=signal.value,
                stake=stake,
                duration=duration,  # Use pattern-specific duration
                on_trade_result=self._on_trade_result,
            )
            logger.info(f"Trade placement result: {trade_id}")

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
                    duration=duration,
                    barrier=barrier_price,  # Store barrier for early closure logic
                    trade_id=trade_id  # Store trade_id for closing trades
                )

                logger.info(
                    f"Pin Bar direct buy: {trade_id} - {signal.value} {stake} at barrier {barrier_price} on {self.current_symbol}"
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
                # Check if this contract matches the trade signal
                # Note: status can be "buy_sent" for contracts that are being processed
                if (contract_data.get("signal_type") == trade_data.get("signal") and
                    contract_data.get("status") in ["proposal_sent", "active", "executed", "buy_sent"]):
                    contract_to_cancel = contract_id
                    break

            if contract_to_cancel:
                logger.info(f"Found active contract {contract_to_cancel} to cancel")
                # Attempt to sell/cancel the contract
                self.trade_executor._execute_sell(contract_to_cancel, "ema_condition_failed")
            else:
                logger.warning(f"No active contract found to cancel for {trade_data.get('signal')} trade. Available contracts: {list(active_contracts.keys())}")
                # Debug: Log contract details to understand the structure
                for contract_id, contract_data in active_contracts.items():
                    logger.info(f"Contract {contract_id}: signal_type={contract_data.get('signal_type')}, status={contract_data.get('status')}")
                    logger.info(f"  Looking for: signal={trade_data.get('signal')}")

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
                # Use register_executed_trade method to ensure proper data structure
                self.strategy_engine.register_executed_trade(
                    signal=signal_type,
                    entry_time=epoch,
                    entry_tick=getattr(self.strategy_engine, 'tick_count', 0),
                    duration=duration,
                    barrier=trade_data.get("barrier", 0),  # Include barrier if available
                    trade_id=trade_id  # Store trade_id for closing trades
                )

                # Update trade timestamp for cooldown mechanism
                self.strategy_engine.last_trade_timestamp = time.time()
                
                logger.info(f"Trade executed and tracked: {trade_id} - {signal_type}")

            elif status == "completed":
                # Remove from strategy engine's active trades
                self.strategy_engine.active_trades = [
                    trade for trade in self.strategy_engine.active_trades
                    if trade.get("trade_id") != trade_id
                ]

                # Remove from trade executor's active contracts
                # Use contract_id if available, otherwise use trade_id
                contract_id = trade_data.get("contract_id")
                if contract_id and contract_id in self.trade_executor.active_contracts:
                    del self.trade_executor.active_contracts[contract_id]
                elif trade_id in self.trade_executor.active_contracts:
                    del self.trade_executor.active_contracts[trade_id]

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

                # Also ensure trade executor removes the contract
                # Use contract_id if available, otherwise use trade_id
                contract_id = trade_data.get("contract_id")
                if contract_id and contract_id in self.trade_executor.active_contracts:
                    del self.trade_executor.active_contracts[contract_id]
                elif trade_id in self.trade_executor.active_contracts:
                    del self.trade_executor.active_contracts[trade_id]

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
        # Get market summary for current status
        market_summary = self.market_selector.get_market_summary()

        return {
            "is_running": self.is_running,
            "uptime": time.time() - self.start_time if self.start_time else 0,
            "tick_count": self.tick_count,
            "current_market": self.current_symbol,
            "market_summary": market_summary,
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
