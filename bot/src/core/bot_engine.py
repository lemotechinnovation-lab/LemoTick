"""
LemoTick Bot Engine
Main orchestrator for the trading bot with investor management integration
"""

import asyncio
import logging
from typing import Dict, Any, Optional
from datetime import datetime

from .config_manager import ConfigManager
from engine.stream_handler import StreamHandler
from engine.trade_executor import TradeExecutor
from engine.risk_manager import RiskManager
from engine.strategy_engine import StrategyEngine
from integrations.backend_client import BackendClient
from infrastructure.metrics import start_metrics_server


class LemoTickBot:
    """
    Main bot engine that orchestrates all trading activities
    with integration to the investor management system
    """
    
    def __init__(self, config: Dict[str, Any], backend_client: BackendClient):
        self.config = config
        self.backend_client = backend_client
        self.logger = logging.getLogger(__name__)
        
        # Start Prometheus metrics server
        self.logger.info("Starting Prometheus metrics server...")
        metrics = None
        try:
            # Get account type from config
            # Check if config is a dictionary (from ConfigManager) or the legacy Config class
            if isinstance(self.config, dict):
                # Use dict-style access for ConfigManager's dictionary
                is_demo = self.config.get('development', {}).get('demo_account', True)
                account_type = "DEMO" if is_demo else "REAL"
            else:
                # Use attribute access for the legacy Config class
                from infrastructure.config import config as global_config
                is_demo = global_config.is_demo_account()
                account_type = "DEMO" if is_demo else "REAL"
            
            # Start metrics server
            result, metrics = start_metrics_server()
            
            # Update account type in metrics
            if metrics:
                metrics.update_account_type(is_demo)
                self.logger.info(f"Metrics initialized for {account_type} account")
                
            if result:
                self.logger.info(f"Prometheus metrics server started successfully for {account_type} account")
            else:
                self.logger.warning("Failed to start Prometheus metrics server")
        except Exception as e:
            self.logger.error(f"Error starting metrics server: {e}")
            metrics = None
        
        # Initialize core components with metrics
        self.risk_manager = RiskManager(metrics=metrics if metrics else None)
        self.strategy_engine = StrategyEngine()
        
        # Initialize stream handler with tick callback
        self.stream_handler = StreamHandler(self._on_tick_received)
        
        # Initialize trade executor with stream handler and risk manager
        self.trade_executor = TradeExecutor(self.stream_handler, self.strategy_engine, None, self.risk_manager)
        
        # CRITICAL: Connect candlestick strategy to trade executor for timing integration
        self.logger.info(f" DEBUG: Checking candlestick strategy connection...")
        self.logger.info(f" DEBUG: hasattr(self.strategy_engine, 'candlestick_strategy') = {hasattr(self.strategy_engine, 'candlestick_strategy')}")
        if hasattr(self.strategy_engine, 'candlestick_strategy'):
            self.logger.info(f" DEBUG: self.strategy_engine.candlestick_strategy = {self.strategy_engine.candlestick_strategy}")
            if self.strategy_engine.candlestick_strategy:
                self.trade_executor.set_candlestick_strategy(self.strategy_engine.candlestick_strategy)
                # Set current symbol for inverted logic detection
                current_symbol = config.get("trading", {}).get("symbol", "R_100")
                self.strategy_engine.candlestick_strategy.set_current_symbol(current_symbol)
                self.logger.info(f" Candlestick strategy connected to trade executor for timing integration")
                self.logger.info(f" Current symbol set to: {current_symbol}")
            else:
                self.logger.warning(" DEBUG: candlestick_strategy is None")
        else:
            self.logger.warning(" DEBUG: strategy_engine does not have candlestick_strategy attribute")
        
        # Set stream handler reference in trade executor for balance updates
        self.trade_executor.stream_handler = self.stream_handler
        
        #  NEW: Set up reversal callback for trade executor
        self.logger.info("Reversal strategy disabled - using enhanced pattern detection only")
        
        # Initialize metrics
        from infrastructure.metrics import get_metrics
        self.metrics = get_metrics()
        
        # Bot state
        self.is_running = False
        self.start_time = None
        
    def _check_market_fallback_requests(self) -> None:
        """Check for pending market fallback requests from trade executor."""
        try:
            if hasattr(self.trade_executor, 'get_pending_market_fallback'):
                fallback_request = self.trade_executor.get_pending_market_fallback()
                if fallback_request:
                    from_symbol = fallback_request.get("from_symbol", "unknown")
                    to_symbol = fallback_request.get("to_symbol", "R_100")
                    error_type = fallback_request.get("error_type", "unknown")
                    
                    self.logger.warning(f" PROCESSING MARKET FALLBACK: {from_symbol} -> {to_symbol} (Reason: {error_type})")
                    
                    # Execute the market switch
                    success = self.switch_trading_symbol(to_symbol)
                    if success:
                        self.logger.info(f" MARKET FALLBACK SUCCESS: Switched to {to_symbol}")
                    else:
                        self.logger.error(f" MARKET FALLBACK FAILED: Could not switch to {to_symbol}")
                        
        except Exception as e:
            self.logger.error(f"Error checking market fallback requests: {e}")

    def _update_metrics(self):
        """Update metrics with current bot state"""
        self.logger.debug("_update_metrics called")
        try:
            # Update equity - use actual Deriv balance for display, not risk manager's configured equity
            # Priority: stream_handler.account_balance > trade_executor.current_balance > risk_manager.current_equity
            if hasattr(self.stream_handler, 'account_balance') and self.stream_handler.account_balance and self.stream_handler.account_balance > 0:
                self.metrics.update_equity(self.stream_handler.account_balance)
            elif hasattr(self.trade_executor, 'current_balance') and self.trade_executor.current_balance > 0:
                self.metrics.update_equity(self.trade_executor.current_balance)
            elif hasattr(self.risk_manager, 'current_equity') and self.risk_manager.current_equity:
                self.metrics.update_equity(float(self.risk_manager.current_equity))
            
            # Update drawdown (using risk manager's drawdown calculation)
            if hasattr(self.risk_manager, 'current_equity') and hasattr(self.risk_manager, 'peak_equity'):
                peak = self.risk_manager.peak_equity
                current = self.risk_manager.current_equity
                if peak and current and peak > 0:
                    drawdown = (peak - current) / peak
                    self.metrics.update_drawdown(drawdown)
            
            # CRITICAL: Update active trades count on EVERY tick for instant updates
            # Count ALL contracts in active_contracts (they're still active until sell response arrives)
            if hasattr(self.trade_executor, 'active_contracts'):
                active_count = len(self.trade_executor.active_contracts)
                # Force update active_trades metric on EVERY tick for real-time display
                self.metrics.update_active_trades(active_count)
                # Log only when count changes
                if not hasattr(self, '_last_active_count') or self._last_active_count != active_count:
                    self.logger.info(f" Active Trades Updated: {active_count}")
                    self._last_active_count = active_count
                self.logger.debug(f" Active trades metric updated: {active_count}")
            
            # Update profit/loss metrics from risk manager (ALWAYS update, even if zero)
            if hasattr(self.risk_manager, 'total_profit'):
                current_profit = self.risk_manager.total_profit
                # Update profit/loss metrics
                if hasattr(self.metrics, 'update_profit_loss'):
                    self.metrics.update_profit_loss(current_profit)
                    # Only log when value changes or every 100 ticks
                    if not hasattr(self, '_last_profit_logged') or abs(current_profit - getattr(self, '_last_profit_logged', 0)) > 0.01:
                        self.logger.info(f" Profit/Loss Updated: ${current_profit:.2f}")
                        self._last_profit_logged = current_profit
                else:
                    self.logger.warning("update_profit_loss method not found on metrics")
            else:
                self.logger.warning("total_profit not found on risk manager - setting to 0")
                # Set to 0 if no profit data available
                if hasattr(self.metrics, 'update_profit_loss'):
                    self.metrics.update_profit_loss(0.0)
            
            # Update win/loss ratio from risk manager (ALWAYS update, even if zero)
            if hasattr(self.risk_manager, 'total_wins') and hasattr(self.risk_manager, 'total_losses'):
                total_trades = self.risk_manager.total_wins + self.risk_manager.total_losses
                if total_trades > 0:
                    win_rate = (self.risk_manager.total_wins / total_trades) * 100
                    if hasattr(self.metrics, 'update_win_rate'):
                        self.metrics.update_win_rate(win_rate)
                        # Only log when value changes
                        if not hasattr(self, '_last_winrate_logged') or abs(win_rate - getattr(self, '_last_winrate_logged', 0)) > 0.1:
                            self.logger.info(f" Win Rate Updated: {win_rate:.1f}% ({self.risk_manager.total_wins}W/{self.risk_manager.total_losses}L)")
                            self._last_winrate_logged = win_rate
                else:
                    # No trades completed yet - show 0%
                    if hasattr(self.metrics, 'update_win_rate'):
                        self.metrics.update_win_rate(0.0)
                        if not hasattr(self, '_no_trades_logged') or not self._no_trades_logged:
                            self.logger.info(" No completed trades yet - Win Rate: 0%")
                            self._no_trades_logged = True
            else:
                self.logger.warning("total_wins or total_losses not found on risk manager")
                # Set to 0 if no trade data available
                if hasattr(self.metrics, 'update_win_rate'):
                    self.metrics.update_win_rate(0.0)
            
            # Update technical indicators from strategy engine
            if hasattr(self.strategy_engine, 'get_indicators'):
                try:
                    indicators = self.strategy_engine.get_indicators()
                    if indicators:
                        self.metrics.update_indicators(indicators)
                except Exception as e:
                    self.logger.debug(f"Could not get indicators: {e}")
            
        except Exception as e:
            self.logger.error(f"Error updating metrics: {e}")
        
    def _on_tick_received(self, price: float, timestamp: int):
        """Handle incoming tick data from the stream handler"""
        try:
            import time
            start_time = time.time()
            
            self.logger.debug(f"Processing tick: {price} at {timestamp}")
            
            # Update metrics with current state
            self.logger.debug("Calling _update_metrics from _on_tick_received")
            self._update_metrics()
            
            # Check for market fallback requests
            self._check_market_fallback_requests()
            
            # First, check for active trades and monitor them for early closure
            self._monitor_active_trades(price, timestamp)
            
            # Process tick through strategy engine
            result = self.strategy_engine.update(price, timestamp)
            
            # Handle different return formats gracefully
            if not result or len(result) < 2:
                self.logger.error(f"Unexpected return format from strategy engine: {result}")
                return
                
            if len(result) == 3:
                signal_type, duration, metadata = result  # type: ignore
            elif len(result) == 2:
                signal_type, duration = result  # type: ignore
                metadata = None
            else:
                self.logger.error(f"Unexpected return format from strategy engine: {result}")
                return
            
            # Check if we have a trading signal
            if signal_type.value != "HOLD":
                self.logger.info(f"Trading signal generated: {signal_type.value} with duration {duration}")
                
                # Record signal generation
                self.metrics.record_signal(signal_type.value)
                
                #  NEW: Check for reversal opportunity (signal opposite to current position)
                reversal_triggered = self._check_and_execute_reversal(signal_type.value, price, timestamp)
                
                if not reversal_triggered:
                    # Execute normal trade based on signal (no reversal)
                    if signal_type.value == "BUY":
                        self._execute_buy_trade(price, timestamp, metadata)
                    elif signal_type.value == "SELL":
                        self._execute_sell_trade(price, timestamp, metadata)
            else:
                # Record filtered signal (HOLD means signal was filtered out)
                self.metrics.record_filtered_signal("strategy_filter")
            
            # Record tick processing time
            processing_time = time.time() - start_time
            self.metrics.record_tick_processing_time(processing_time)
                    
        except Exception as e:
            self.logger.error(f"Error processing tick: {e}")
    
    def _monitor_active_trades(self, price: float, timestamp: int):
        """Monitor active trades for early closure at TP/SL levels"""
        try:
            # First, check for expired contracts that should have completed
            self.trade_executor._check_expired_contracts()
            
            # Create a copy of the items to avoid dictionary changed size during iteration
            active_contracts_copy = list(self.trade_executor.active_contracts.items())
            
            # Check all active contracts for early closure
            for contract_id, contract_data in active_contracts_copy:
                try:
                    # Check if contract should be closed early
                    self.logger.debug(f" DEBUG: Checking early closure for contract {contract_id}")
                    should_close, reason = self.trade_executor.should_close_early(contract_data)
                    self.logger.debug(f" DEBUG: Early closure result for {contract_id}: should_close={should_close}, reason={reason}")
                    
                    if should_close:
                        self.logger.info(f"Early closure triggered for contract {contract_id}: {reason}")
                        # Close the contract early
                        self._close_contract_early(contract_id, price, timestamp, reason)
                        
                except Exception as e:
                    self.logger.error(f"Error monitoring contract {contract_id}: {e}")
                    
        except Exception as e:
            self.logger.error(f"Error monitoring active trades: {e}")
    
    def _close_contract_early(self, contract_id: str, price: float, timestamp: int, reason: str):
        """Close a contract early due to TP/SL trigger - keeps contract until sell response arrives"""
        try:
            # Send sell request to close the contract
            sell_request = {
                "sell": contract_id,
                "price": 0  # Market close
            }
            
            # Send the sell request through stream handler
            self.stream_handler.send_message(sell_request)
            
            self.logger.info(f" Early closure request sent for contract {contract_id} at price {price}: {reason}")
            
            #  CRITICAL FIX: DO NOT remove contract from active_contracts here!
            # The contract MUST stay in active_contracts so that handle_sell_response can:
            # 1. Find the contract
            # 2. Update the risk_manager with actual P&L
            # 3. Update metrics with profit/loss
            # The contract will be removed in handle_sell_response AFTER updating risk manager
            if contract_id in self.trade_executor.active_contracts:
                # Mark as closing but KEEP in active_contracts
                self.trade_executor.active_contracts[contract_id]["status"] = "closing_early"
                self.trade_executor.active_contracts[contract_id]["early_close_reason"] = reason
                self.logger.info(f" Contract {contract_id} marked as CLOSING EARLY (waiting for sell response)")
            else:
                self.logger.warning(f"  Contract {contract_id} not found in active_contracts")
                
        except Exception as e:
            self.logger.error(f" Error closing contract {contract_id} early: {e}")
    
    def _check_and_execute_reversal(self, new_signal: str, price: float, timestamp: int) -> bool:
        """
        Check if current position should be reversed based on new signal.
        
        Args:
            new_signal: New signal direction ("BUY" or "SELL")
            price: Current price
            timestamp: Current timestamp
            
        Returns:
            True if reversal was executed, False otherwise
        """
        try:
            from infrastructure.config import config as global_config
            
            # Check if reversal strategy is enabled
            if not global_config.get("trading.reversal_strategy_enabled", False):
                return False
            
            # Check if we have an active trade
            if len(self.trade_executor.active_contracts) == 0:
                return False  # No active trade to reverse
            
            # Get reversal configuration
            reversal_min_profit = global_config.get("trading.reversal_min_profit", -10.0)  # -10% default
            reversal_max_age = global_config.get("trading.reversal_max_age_seconds", 180)  # 3 minutes default
            
            # Check all active contracts for reversal opportunity
            for contract_id, contract_data in list(self.trade_executor.active_contracts.items()):
                # Skip contracts that are already closing
                status = contract_data.get("status", "")
                if status in ["closing", "closing_early", "force_closing", "closed"]:
                    continue
                
                # Get contract direction
                contract_signal = contract_data.get("signal_type", "")
                
                # Check if signal is opposite to current position
                is_opposite = (
                    (contract_signal == "BUY" and new_signal == "SELL") or
                    (contract_signal == "SELL" and new_signal == "BUY")
                )
                
                if not is_opposite:
                    continue  # Signal is same direction, no reversal needed
                
                # Check contract age
                contract_age = timestamp - contract_data.get("timestamp", timestamp)
                if contract_age > reversal_max_age:
                    self.logger.info(f" Contract {contract_id} too old for reversal ({contract_age:.0f}s > {reversal_max_age}s)")
                    continue
                
                # Calculate current profit/loss percentage
                entry_price = contract_data.get("entry_price", price)
                stake = contract_data.get("stake", 0)
                
                # Get current contract value (estimated)
                # For binary options, we approximate based on price movement
                if contract_signal == "BUY":
                    price_change_pct = ((price - entry_price) / entry_price) * 100 if entry_price > 0 else 0
                else:  # SELL
                    price_change_pct = ((entry_price - price) / entry_price) * 100 if entry_price > 0 else 0
                
                # Estimated profit % (rough approximation for binary options)
                estimated_profit_pct = price_change_pct * 0.8  # Binary options typically have ~80% payout
                
                # Check if profit is above minimum threshold
                if estimated_profit_pct < reversal_min_profit:
                    self.logger.info(f" Contract {contract_id} profit too low for reversal ({estimated_profit_pct:.1f}% < {reversal_min_profit:.1f}%)")
                    continue
                
                # All conditions met - execute reversal!
                self.logger.info(f" REVERSAL TRIGGERED! Closing {contract_signal} position to open {new_signal} position")
                self.logger.info(f"   Contract age: {contract_age:.0f}s, Estimated profit: {estimated_profit_pct:.1f}%")
                
                # Register pending reversal in trade executor
                self.logger.info("Reversal strategy disabled - using enhanced pattern detection only")
                
                # Close the current position
                self._close_contract_early(
                    contract_id, 
                    price, 
                    timestamp, 
                    f"Reversal: {contract_signal}->{new_signal}"
                )
                
                self.logger.info(f" Reversal initiated - will open {new_signal} position after current position closes")
                
                return True  # Reversal triggered
            
            return False  # No reversal conditions met
            
        except Exception as e:
            self.logger.error(f"Error checking reversal: {e}")
            return False
    
    def _execute_reversal_trade(self, signal_type: str, price: float, timestamp: int):
        """
        Execute a reversal trade (callback from trade executor).
        
        Args:
            signal_type: Signal type ("BUY" or "SELL")
            price: Current price
            timestamp: Current timestamp
        """
        try:
            self.logger.info(f" Executing reversal trade: {signal_type} at {price}")
            
            if signal_type == "BUY":
                self._execute_buy_trade(price, timestamp)
            elif signal_type == "SELL":
                self._execute_sell_trade(price, timestamp)
            else:
                self.logger.error(f"Invalid signal type for reversal: {signal_type}")
                
        except Exception as e:
            self.logger.error(f"Error executing reversal trade: {e}")
            import traceback
            self.logger.error(traceback.format_exc())
    
    def _execute_buy_trade(self, price: float, timestamp: int, metadata: Optional[Dict] = None):
        """Execute a buy trade"""
        try:
            import time
            start_time = time.time()
            
            # CRITICAL CHECK #1: Quick check for active trades (optimized)
            # Count only non-closing active contracts
            real_active_count = sum(1 for td in self.trade_executor.active_contracts.values() 
                                   if td.get("status", "") not in ["closing", "closing_early", "force_closing", "closed"])
            
            if real_active_count >= 2:  # Allow up to 2 concurrent trades for faster execution
                return  # Silent return for speed (detailed check done in trade_executor)
            
            # CRITICAL CHECK #2: Verify with risk manager
            can_trade, reason = self.risk_manager.can_trade()
            if not can_trade:
                # Use debug level for circuit breaker to reduce log noise
                if "Circuit breaker" in reason:
                    self.logger.debug(f" Risk manager rejected BUY trade: {reason}")
                else:
                    self.logger.warning(f" Risk manager rejected BUY trade: {reason}")
                return
            
            # Get stake amount from risk manager (using default parameters)
            stake = self.risk_manager.calculate_stake()
            
            if stake > 0:
                self.logger.info(f"Executing BUY trade: stake={stake}, price={price}")
                
                # Extract signal data from metadata if available
                signal_data = None
                self.logger.info(f" DEBUG: metadata={metadata}")
                if metadata and metadata.get("signal_data"):
                    signal_data = metadata["signal_data"]
                    self.logger.info(f" TIMING DATA: Start candle: {signal_data.get('trade_start_candle', 0)}, Expected close: {signal_data.get('expected_close_candle', 0)}")
                else:
                    self.logger.warning(f" NO SIGNAL DATA: metadata={metadata}")
                
                # Place the trade through trade executor
                trade_id = self.trade_executor.place_trade(
                    signal_type="BUY",
                    stake=stake,
                    entry_price=price,
                    signal_data=signal_data
                )
                if trade_id:
                    self.logger.info(f"BUY trade placed successfully: {trade_id}")
                    # Record trade metrics
                    self.metrics.record_trade("BUY", "placed", 0.0)
                else:
                    self.logger.warning("Failed to place BUY trade")
            else:
                self.logger.debug("Risk manager rejected BUY trade (stake=0)")
            
            # Record trade execution time
            execution_time = time.time() - start_time
            self.metrics.record_trade_execution_time(execution_time)
            
        except Exception as e:
            self.logger.error(f"Error executing BUY trade: {e}")
    
    def _execute_sell_trade(self, price: float, timestamp: int, metadata: Optional[Dict] = None):
        """Execute a sell trade"""
        try:
            import time
            start_time = time.time()
            
            # CRITICAL CHECK #1: Quick check for active trades (optimized)
            # Count only non-closing active contracts
            real_active_count = sum(1 for td in self.trade_executor.active_contracts.values() 
                                   if td.get("status", "") not in ["closing", "closing_early", "force_closing", "closed"])
            
            if real_active_count >= 2:  # Allow up to 2 concurrent trades for faster execution
                return  # Silent return for speed (detailed check done in trade_executor)
            
            # CRITICAL CHECK #2: Verify with risk manager
            can_trade, reason = self.risk_manager.can_trade()
            if not can_trade:
                # Use debug level for circuit breaker to reduce log noise
                if "Circuit breaker" in reason:
                    self.logger.debug(f" Risk manager rejected SELL trade: {reason}")
                else:
                    self.logger.warning(f" Risk manager rejected SELL trade: {reason}")
                return
                
            # Get stake amount from risk manager (using default parameters)
            stake = self.risk_manager.calculate_stake()
            
            if stake > 0:
                self.logger.info(f"Executing SELL trade: stake={stake}, price={price}")
                
                # Extract signal data from metadata if available
                signal_data = None
                self.logger.info(f" DEBUG: metadata={metadata}")
                if metadata and metadata.get("signal_data"):
                    signal_data = metadata["signal_data"]
                    self.logger.info(f" TIMING DATA: Start candle: {signal_data.get('trade_start_candle', 0)}, Expected close: {signal_data.get('expected_close_candle', 0)}")
                else:
                    self.logger.warning(f" NO SIGNAL DATA: metadata={metadata}")
                
                # Place the trade through trade executor
                trade_id = self.trade_executor.place_trade(
                    signal_type="SELL",
                    stake=stake,
                    entry_price=price,
                    signal_data=signal_data
                )
                if trade_id:
                    self.logger.info(f"SELL trade placed successfully: {trade_id}")
                    # Record trade metrics
                    self.metrics.record_trade("SELL", "placed", 0.0)
                else:
                    self.logger.warning("Failed to place SELL trade")
            else:
                self.logger.debug("Risk manager rejected SELL trade (stake=0)")
            
            # Record trade execution time
            execution_time = time.time() - start_time
            self.metrics.record_trade_execution_time(execution_time)
            
        except Exception as e:
            self.logger.error(f"Error executing SELL trade: {e}")
    
    def switch_trading_symbol(self, new_symbol: str):
        """Switch the trading symbol to a different market."""
        try:
            current_symbol = self.config.get('trading', {}).get('symbol', 'R_100')
            
            if new_symbol == current_symbol:
                self.logger.info(f" Already trading {new_symbol}, no switch needed")
                return True
            
            self.logger.warning(f" MARKET SWITCH: Switching from {current_symbol} to {new_symbol}")
            
            # Update configuration
            if 'trading' not in self.config:
                self.config['trading'] = {}
            self.config['trading']['symbol'] = new_symbol
            
            # Update stream handler to subscribe to new symbol
            if hasattr(self, 'stream_handler') and self.stream_handler:
                self.logger.info(f" Updating stream handler to {new_symbol}")
                
                # Send forget_all to unsubscribe from current symbol
                self.stream_handler.send_message({"forget_all": ["ticks"]})
                
                # Subscribe to new symbol
                subscribe_payload = {
                    "ticks": new_symbol,
                    "subscribe": 1
                }
                
                if self.stream_handler.send_message(subscribe_payload):
                    self.logger.info(f" Successfully subscribed to {new_symbol}")
                else:
                    self.logger.error(f" Failed to subscribe to {new_symbol}")
                    return False
            
            # Update strategy engine if it has market awareness
            if hasattr(self, 'strategy_engine') and hasattr(self.strategy_engine, 'candlestick_strategy'):
                if self.strategy_engine.candlestick_strategy and hasattr(self.strategy_engine.candlestick_strategy, 'get_current_market'):
                    current_market = self.strategy_engine.candlestick_strategy.get_current_market()
                    self.logger.info(f" Strategy engine current market: {current_market}")
            
            self.logger.info(f" MARKET SWITCH: Successfully switched to {new_symbol}")
            return True
            
        except Exception as e:
            self.logger.error(f" MARKET SWITCH: Failed to switch to {new_symbol}: {e}")
            return False
    
    def get_market_fallback_status(self) -> dict:
        """Get the current market fallback status."""
        try:
            if hasattr(self, 'strategy_engine') and hasattr(self.strategy_engine, 'candlestick_strategy'):
                if self.strategy_engine.candlestick_strategy and hasattr(self.strategy_engine.candlestick_strategy, 'get_market_performance_summary'):
                    return self.strategy_engine.candlestick_strategy.get_market_performance_summary()
            
            return {"error": "Market fallback not available"}
        except Exception as e:
            self.logger.error(f"Error getting market fallback status: {e}")
            return {"error": str(e)}
        
    async def start(self):
        """Start the bot and all its components"""
        try:
            self.logger.info("Initializing LemoTick Bot...")
            
            # Initialize backend connection
            await self.backend_client.connect()
            
            # Start core components
            self.stream_handler.start()
            # RiskManager and TradeExecutor don't need async start
            
            self.is_running = True
            self.start_time = datetime.now()
            
            self.logger.info("LemoTick Bot started successfully")
            
            # Keep the bot running
            while self.is_running:
                await asyncio.sleep(1)
                
        except Exception as e:
            self.logger.error(f"Error starting bot: {e}")
            await self.stop()
            raise
    
    async def stop(self):
        """Stop the bot and all its components"""
        try:
            self.logger.info("Stopping LemoTick Bot...")
            
            self.is_running = False
            
            # Stop components in reverse order
            if hasattr(self, 'trade_executor'):
                if hasattr(self.trade_executor, 'stop') and callable(getattr(self.trade_executor, 'stop', None)):
                    try:
                        await self.trade_executor.stop()  # type: ignore
                    except Exception:
                        pass  # Ignore if stop is not async
            
            if hasattr(self, 'risk_manager'):
                if hasattr(self.risk_manager, 'stop') and callable(getattr(self.risk_manager, 'stop', None)):
                    try:
                        await self.risk_manager.stop()  # type: ignore
                    except Exception:
                        pass  # Ignore if stop is not async
                
            if hasattr(self, 'stream_handler') and hasattr(self.stream_handler, 'stop'):
                self.stream_handler.stop()
            
            if hasattr(self, 'backend_client'):
                await self.backend_client.disconnect()
            
            self.logger.info("LemoTick Bot stopped")
            
        except Exception as e:
            self.logger.error(f"Error stopping bot: {e}")
    
    async def get_status(self) -> Dict[str, Any]:
        """Get current bot status for investor dashboard"""
        stream_status = None
        risk_status = None
        trade_status = None
        
        if hasattr(self, 'stream_handler') and hasattr(self.stream_handler, 'get_status'):
            try:
                stream_status = await self.stream_handler.get_status()  # type: ignore
            except Exception:
                stream_status = {"status": "unavailable"}
        
        if hasattr(self, 'risk_manager') and hasattr(self.risk_manager, 'get_status'):
            try:
                risk_status = await self.risk_manager.get_status()  # type: ignore
            except Exception:
                risk_status = {"status": "unavailable"}
        
        if hasattr(self, 'trade_executor') and hasattr(self.trade_executor, 'get_status'):
            try:
                trade_status = await self.trade_executor.get_status()  # type: ignore
            except Exception:
                trade_status = {"status": "unavailable"}
        
        return {
            "is_running": self.is_running,
            "start_time": self.start_time.isoformat() if self.start_time else None,
            "uptime": (datetime.now() - self.start_time).total_seconds() if self.start_time else 0,
            "stream_status": stream_status,
            "risk_status": risk_status,
            "trade_status": trade_status
        }


