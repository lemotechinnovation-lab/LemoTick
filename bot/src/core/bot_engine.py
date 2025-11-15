"""
LemoTick Bot Engine
Main orchestrator for the trading bot with investor management integration
"""

import asyncio
import logging
import time
from typing import Dict, Any, Optional
from datetime import datetime

from .config_manager import ConfigManager
from engine.stream_handler import StreamHandler
from engine.trade_executor import TradeExecutor
from engine.risk_manager import RiskManager
from engine.strategy_engine import StrategyEngine
from integrations.backend_client import BackendClient
from infrastructure.metrics import start_metrics_server, get_metrics
from strategies.position_manager import MeanReversionPositionManager


class LemoTickBot:
    """
    Main bot engine orchestrating trading activities
    with investor management integration
    """

    def __init__(self, config: Dict[str, Any], backend_client: BackendClient):
        self.config = config
        self.backend_client = backend_client
        self.logger = logging.getLogger(__name__)
        self.is_running = False
        self.start_time = None

        # Initialize metrics
        self.logger.info("Starting Prometheus metrics server...")
        metrics = None
        try:
            # Determine account type
            if isinstance(config, dict):
                is_demo = config.get('development', {}).get('demo_account', True)
            else:
                from infrastructure.config import config as global_config
                is_demo = global_config.is_demo_account()
            account_type = "DEMO" if is_demo else "REAL"

            # Start metrics server
            result, metrics = start_metrics_server()
            if metrics:
                metrics.update_account_type(is_demo)
                self.logger.info(f"Metrics initialized for {account_type} account")
            self.logger.info(f"Prometheus metrics server {'started successfully' if result else 'failed to start'} for {account_type} account")
        except Exception as e:
            self.logger.error(f"Error starting metrics server: {e}")
            metrics = None

        self.metrics = get_metrics()

        # Initialize core components
        self.risk_manager = RiskManager(metrics=metrics)
        self.strategy_engine = StrategyEngine()
        self.stream_handler = StreamHandler(self._on_tick_received)
        self.trade_executor = TradeExecutor(self.stream_handler, self.strategy_engine, None, self.risk_manager)
        self.trade_executor.stream_handler = self.stream_handler
        
        # Initialize position manager for mean reversion strategy
        self.position_manager = MeanReversionPositionManager(
            ema7=self.strategy_engine.ema_7,
            ema15=self.strategy_engine.ema_15
        )

        self.logger.info(f"Reversal strategy disabled - using enhanced pattern detection only")
        self.logger.debug(f"DEBUG: hasattr(strategy_engine, 'candlestick_strategy') = {hasattr(self.strategy_engine, 'candlestick_strategy')}")

    def _update_metrics(self):
        """Update all bot metrics"""
        try:
            # Drawdown - Add defensive checks for tuples
            if hasattr(self.risk_manager, 'current_equity') and hasattr(self.risk_manager, 'peak_equity'):
                try:
                    peak_raw = self.risk_manager.peak_equity
                    current_raw = self.risk_manager.current_equity
                    
                    # Ensure equity values are numeric (not tuples)
                    if isinstance(peak_raw, tuple):
                        peak = float(peak_raw[0]) if len(peak_raw) > 0 else 0.0
                        self.logger.warning(f"peak_equity is a tuple, using first element: {peak}")
                    else:
                        peak = float(peak_raw) if peak_raw is not None else 0.0
                    
                    if isinstance(current_raw, tuple):
                        current = float(current_raw[0]) if len(current_raw) > 0 else 0.0
                        self.logger.warning(f"current_equity is a tuple, using first element: {current}")
                    else:
                        current = float(current_raw) if current_raw is not None else 0.0
                    
                    if peak > 0:
                        drawdown = (peak - current) / peak
                        # Ensure drawdown is a single float value, not a tuple
                        if isinstance(drawdown, tuple):
                            drawdown = float(drawdown[0]) if len(drawdown) > 0 else 0.0
                            self.logger.warning(f"drawdown calculated as tuple, using first element: {drawdown}")
                        self.metrics.update_drawdown(drawdown)
                except Exception as e:
                    self.logger.error(f"Error calculating drawdown: {e}", exc_info=True)

            # Active trades
            if hasattr(self.trade_executor, 'active_contracts'):
                active_count = len(self.trade_executor.active_contracts)
                self.metrics.update_active_trades(active_count)
                if getattr(self, '_last_active_count', None) != active_count:
                    self.logger.info(f"Active Trades Updated: {active_count}")
                    self._last_active_count = active_count

            # Profit/Loss - Calculate from equity difference (risk_manager.total_profit is never updated)
            if hasattr(self.risk_manager, 'current_equity') and hasattr(self.risk_manager, 'initial_equity'):
                try:
                    current_equity_raw = self.risk_manager.current_equity
                    initial_equity_raw = self.risk_manager.initial_equity
                    
                    # Ensure equity values are numeric (not tuples)
                    if isinstance(current_equity_raw, tuple):
                        current_equity = float(current_equity_raw[0]) if len(current_equity_raw) > 0 else 0.0
                        self.logger.warning(f"current_equity is a tuple, using first element: {current_equity}")
                    else:
                        current_equity = float(current_equity_raw) if current_equity_raw is not None else 0.0
                    
                    if isinstance(initial_equity_raw, tuple):
                        initial_equity = float(initial_equity_raw[0]) if len(initial_equity_raw) > 0 else 0.0
                        self.logger.warning(f"initial_equity is a tuple, using first element: {initial_equity}")
                    else:
                        initial_equity = float(initial_equity_raw) if initial_equity_raw is not None else 0.0
                    
                    # Calculate total profit as difference between current and initial equity
                    current_profit = current_equity - initial_equity
                    
                    if hasattr(self.metrics, 'update_profit_loss'):
                        self.metrics.update_profit_loss(current_profit)
                        if abs(current_profit - getattr(self, '_last_profit_logged', 0)) > 0.01:
                            self.logger.info(f"Profit/Loss Updated: ${current_profit:.2f}")
                            self._last_profit_logged = current_profit
                except Exception as e:
                    self.logger.error(f"Error calculating profit/loss: {e}", exc_info=True)

            # Win/Loss ratio - Read from strategy_engine where these values are actually updated
            if hasattr(self.strategy_engine, 'total_wins') and hasattr(self.strategy_engine, 'total_losses'):
                try:
                    wins_raw = self.strategy_engine.total_wins
                    losses_raw = self.strategy_engine.total_losses
                    
                    # Ensure wins and losses are numeric (not tuples)
                    if isinstance(wins_raw, tuple):
                        wins = int(wins_raw[0]) if len(wins_raw) > 0 else 0
                        self.logger.warning(f"strategy_engine.total_wins is a tuple, using first element: {wins}")
                    else:
                        wins = int(wins_raw) if wins_raw is not None else 0
                    
                    if isinstance(losses_raw, tuple):
                        losses = int(losses_raw[0]) if len(losses_raw) > 0 else 0
                        self.logger.warning(f"strategy_engine.total_losses is a tuple, using first element: {losses}")
                    else:
                        losses = int(losses_raw) if losses_raw is not None else 0
                    
                    total = wins + losses
                    win_rate = float((wins / total) * 100 if total > 0 else 0)
                    
                    # Ensure win_rate is a single float value, not a tuple
                    if isinstance(win_rate, tuple):
                        win_rate = float(win_rate[0]) if len(win_rate) > 0 else 0.0
                        self.logger.warning(f"win_rate calculated as tuple, using first element: {win_rate}")
                    
                    if hasattr(self.metrics, 'update_win_rate'):
                        self.metrics.update_win_rate(win_rate)
                        if abs(win_rate - getattr(self, '_last_winrate_logged', 0)) > 0.1:
                            self.logger.info(f"Win Rate Updated: {win_rate:.1f}% ({wins}W/{losses}L)")
                            self._last_winrate_logged = win_rate
                except Exception as e:
                    self.logger.error(f"Error calculating win rate: {e}", exc_info=True)

            # Technical indicators - Add defensive checks for tuples in indicator values
            if hasattr(self.strategy_engine, 'get_indicators'):
                try:
                    indicators = self.strategy_engine.get_indicators()
                    if indicators:
                        # Ensure all indicator values are numeric (not tuples)
                        clean_indicators = {}
                        for key, value in indicators.items():
                            if isinstance(value, tuple):
                                clean_value = float(value[0]) if len(value) > 0 else 0.0
                                self.logger.warning(f"Indicator {key} is a tuple, using first element: {clean_value}")
                                clean_indicators[key] = clean_value
                            elif value is not None:
                                try:
                                    clean_indicators[key] = float(value)
                                except (ValueError, TypeError):
                                    self.logger.warning(f"Indicator {key} cannot be converted to float: {value}")
                                    clean_indicators[key] = 0.0
                            else:
                                clean_indicators[key] = 0.0
                        if clean_indicators:
                            self.metrics.update_indicators(clean_indicators)
                except Exception as e:
                    self.logger.error(f"Error updating indicators: {e}", exc_info=True)

        except Exception as e:
            self.logger.error(f"Error updating metrics: {e}", exc_info=True)

    def _on_tick_received(self, price: float, timestamp: int):
        """Handle incoming tick data"""
        try:
            self.logger.debug(f"[TICK] _on_tick_received called with price={price}, timestamp={timestamp}")
            start_time = time.time()
            self._update_metrics()
            self._monitor_active_trades(price, timestamp)

            # Strategy signal
            result = self.strategy_engine.update(price, timestamp)
            if not result or len(result) < 2:
                self.logger.error(f"❌ Unexpected return format from strategy engine: {result}")
                return
            
            # Unpack result, defaulting metadata to None if not provided
            if len(result) == 3:
                signal_type, duration, metadata = result  # type: ignore
            elif len(result) == 2:
                signal_type, duration = result  # type: ignore
                metadata = None
            else:
                self.logger.error(f"❌ Unexpected return format from strategy engine: {result}")
                return

            if signal_type.value != "HOLD":
                self.logger.info(f"🎯 TRADING SIGNAL RECEIVED: {signal_type.value}, duration {duration}min")
                pattern = metadata.get('pattern', 'N/A') if metadata else 'N/A'
                quality = metadata.get('quality_score', 0) if metadata else 0
                self.logger.info(f"   Pattern: {pattern}")
                self.logger.info(f"   Quality: {quality:.2f}")
                
                self.metrics.record_signal(signal_type.value)
                reversal_triggered = self._check_and_execute_reversal(signal_type.value, price, timestamp)
                if not reversal_triggered:
                    self.logger.info(f"🔄 Executing {signal_type.value} trade (no reversal triggered)")
                    if signal_type.value == "BUY":
                        self._execute_buy_trade(price, timestamp, metadata)
                    elif signal_type.value == "SELL":
                        self._execute_sell_trade(price, timestamp, metadata)
                else:
                    self.logger.info(f"🔄 Reversal triggered, skipping normal trade execution")
            else:
                self.logger.debug(f"Signal is HOLD, skipping trade execution")
                self.metrics.record_filtered_signal("strategy_filter")

            self.metrics.record_tick_processing_time(time.time() - start_time)

        except Exception as e:
            self.logger.error(f"[TICK] Error processing tick: {e}", exc_info=True)

    def _monitor_active_trades(self, price: float, timestamp: int):
        """Monitor active trades for TP/SL - APPLIES TO ALL STRATEGIES"""
        try:
            # 🧹 PERIODIC CLEANUP: Remove stale contracts that have been in transitional states for too long
            current_time = time.time()
            stale_contracts = []
            
            for trade_id, trade_data in list(self.trade_executor.active_contracts.items()):
                status = trade_data.get("status")
                contract_id = trade_data.get("contract_id")
                trade_timestamp = trade_data.get("timestamp", current_time)
                
                # 🔥 FIX: Check for invalid/future timestamps (age would be negative)
                if trade_timestamp > current_time + 10:  # More than 10 seconds in future
                    stale_contracts.append((trade_id, status or "no_status", f"invalid future timestamp ({trade_timestamp} > {current_time})"))
                    continue
                
                trade_age = current_time - trade_timestamp
                
                # Safeguard: if age is still negative (shouldn't happen), treat as invalid
                if trade_age < 0:
                    self.logger.error(f"🚨 Contract {contract_id or trade_id} has negative age {trade_age:.1f}s - removing")
                    stale_contracts.append((trade_id, status or "no_status", f"negative age {trade_age:.1f}s"))
                    continue
                
                # Remove trades without a contract_id that are >10 seconds old (never got buy confirmation)
                if not contract_id and trade_age > 10:
                    stale_contracts.append((trade_id, status or "no_status", f"no contract_id for {trade_age:.0f}s"))
                    continue
                
                # Remove contracts that have been "closed" or "sold" for >5 seconds (should have been removed by _on_contract_update)
                if status in ["closed", "sold"]:
                    closed_at = trade_data.get("closed_at", 0)
                    if current_time - closed_at > 5:
                        stale_contracts.append((trade_id, status, f"{status} for >5s"))
                
                # Remove contracts stuck in "closing_early" for >30 seconds (API likely failed to close)
                elif status in ["closing_early", "closing", "force_closing"]:
                    close_requested_at = trade_data.get("close_requested_at", trade_timestamp)
                    if current_time - close_requested_at > 30:
                        stale_contracts.append((trade_id, status, "stuck closing for >30s"))
                
                # 🔥 NEW: Remove "open" contracts that have been open for >5 minutes (3min contract + 2min buffer)
                # This catches contracts that expired naturally but didn't send a closure update
                elif status == "open" and trade_age > 300:  # 5 minutes
                    stale_contracts.append((trade_id, status, f"expired (open for {trade_age:.0f}s > 300s)"))
            
            # Remove stale contracts
            for trade_id, status, reason in stale_contracts:
                contract_id = self.trade_executor.active_contracts[trade_id].get("contract_id", "unknown")
                self.logger.warning(f"🧹 Cleaning up stale contract: {contract_id} ({status}) - {reason}")
                self.trade_executor.active_contracts.pop(trade_id, None)
            
            if stale_contracts:
                self.logger.info(f"📊 Active contracts after cleanup: {len(self.trade_executor.active_contracts)}")
            
            # First pass: Add ALL positions to monitoring and check individual closure conditions
            for trade_id, trade_data in list(self.trade_executor.active_contracts.items()):
                contract_id = trade_data.get("contract_id")
                if not contract_id:
                    continue
                
                # Skip if contract is already closing or closed
                status = trade_data.get("status")
                if status in ["closing", "closing_early", "force_closing", "closed", "sold"]:
                    continue
                
                # Skip if contract is marked as non-resellable (will expire naturally)
                if trade_data.get("non_resellable", False):
                    continue
                
                # Get strategy info (for logging)
                signal_data = trade_data.get("signal_data", {})
                strategy_source = signal_data.get("strategy", "unknown")
                
                # ✅ MONITOR ALL TRADES (not just mean_reversion)
                # Add to position manager if not already monitored
                if not self.position_manager.get_position_info(contract_id):
                    signal_type = trade_data.get("signal_type", "")
                    entry_price = trade_data.get("entry_price", 0)
                    stake = trade_data.get("stake", 0)
                    
                    if signal_type and entry_price > 0:
                        self.position_manager.add_position(
                            contract_id=contract_id,
                            signal_type=signal_type,
                            entry_price=entry_price,
                            stake=stake,
                            metadata=signal_data
                        )
                        self.logger.info(f"📊 Monitoring {strategy_source} position: {contract_id} ({signal_type})")
                
                # Get current profit (if available from contract updates)
                current_profit = trade_data.get("profit")
                
                # Check if individual position should be closed (TP/SL/Trend Reversal)
                should_close, reason = self.position_manager.check_position(
                    contract_id=contract_id,
                    current_price=price,
                    current_profit=current_profit
                )
                
                if should_close:
                    self.logger.info(f"🔔 Closing {strategy_source} position: {contract_id} - {reason}")
                    self._close_contract_early(contract_id, price, timestamp, reason)
                    self.position_manager.mark_closed(contract_id, reason)
            
            # Second pass: Check for multi-position closure scenarios
            # (e.g., if one position is losing and winning position is only covering it)
            if self.position_manager.get_active_positions_count() >= 2:
                positions_to_close = self.position_manager.check_multi_position_closure(
                    self.trade_executor.active_contracts
                )
                
                if positions_to_close:
                    self.logger.warning(f"🔔🔔 Multi-position closure triggered: {len(positions_to_close)} positions")
                    for contract_id, reason in positions_to_close:
                        self.logger.info(f"   Closing {contract_id}: {reason}")
                        self._close_contract_early(contract_id, price, timestamp, reason)
                        self.position_manager.mark_closed(contract_id, reason)
            
            # Cleanup old positions from monitoring
            self.position_manager.cleanup_old_positions(max_age_seconds=300)
            
        except Exception as e:
            self.logger.error(f"Error monitoring active trades: {e}", exc_info=True)

    def _close_contract_early(self, contract_id: str, price: float, timestamp: int, reason: str):
        """Close a contract early without removing from active_contracts"""
        try:
            # Send sell request to Deriv API
            self.stream_handler.send_message({"sell": contract_id, "price": 0})
            
            # 🔥 CRITICAL FIX: active_contracts is keyed by trade_id, not contract_id
            # Find the trade_id that corresponds to this contract_id
            trade_found = False
            for trade_id, trade_data in self.trade_executor.active_contracts.items():
                if trade_data.get("contract_id") == contract_id:
                    trade_data["status"] = "closing_early"
                    trade_data["early_close_reason"] = reason
                    trade_data["close_requested_at"] = time.time()
                    self.logger.info(f"✅ Contract {contract_id} marked CLOSING EARLY (trade_id: {trade_id})")
                    trade_found = True
                    break
            
            if not trade_found:
                self.logger.warning(f"⚠️ Contract {contract_id} not found in active_contracts")
        except Exception as e:
            self.logger.error(f"💥 Error closing contract {contract_id} early: {e}")

    def _check_and_execute_reversal(self, new_signal: str, price: float, timestamp: int) -> bool:
        """Check and execute a reversal trade if conditions met"""
        try:
            from infrastructure.config import config as global_config
            if not global_config.get("trading.reversal_strategy_enabled", False):
                return False

            for contract_id, contract in self.trade_executor.active_contracts.items():
                if contract.get("status") in ["closing", "closing_early", "force_closing", "closed"]:
                    continue
                contract_signal = contract.get("signal_type")
                if contract_signal == new_signal:
                    continue
                
                # Check position age - must be between min and max age
                age = timestamp - contract.get("timestamp", timestamp)
                min_age = global_config.get("trading.reversal_min_age_seconds", 60)
                max_age = global_config.get("trading.reversal_max_age_seconds", 180)
                
                # Skip if position is too young (prevent immediate reversals)
                if age < min_age:
                    self.logger.debug(f"⏳ Reversal skipped: Position too young ({age}s < {min_age}s minimum)")
                    continue
                
                # Skip if position is too old (no longer relevant to reverse)
                if age > max_age:
                    self.logger.debug(f"⏰ Reversal skipped: Position too old ({age}s > {max_age}s maximum)")
                    continue

                # Check profit threshold - only reverse if loss is within acceptable range
                entry_price = contract.get("entry_price", price)
                stake = contract.get("stake", 0)
                price_change = ((price - entry_price)/entry_price*100) if contract_signal=="BUY" else ((entry_price - price)/entry_price*100)
                est_profit = price_change * 0.8
                min_profit_threshold = global_config.get("trading.reversal_min_profit", -10.0)
                
                if est_profit < min_profit_threshold:
                    self.logger.debug(f"💸 Reversal skipped: Loss too large ({est_profit:.1f}% < {min_profit_threshold:.1f}%)")
                    continue

                self.logger.info(f"REVERSAL TRIGGERED: {contract_signal}->{new_signal} | Age={age}s | Profit≈{est_profit:.1f}%")
                self._close_contract_early(contract_id, price, timestamp, f"Reversal {contract_signal}->{new_signal}")
                time.sleep(1.5)
                self.trade_executor.place_trade(stake=stake, duration=3,
                                                signal_data={"source": "reversal", "reversed_from": contract_signal},
                                                signal_type=new_signal)
                return True
            return False
        except Exception as e:
            self.logger.error(f"Error during reversal check: {e}", exc_info=True)
            return False

    def _execute_buy_trade(self, price: float, timestamp: int, metadata: Optional[Dict] = None):
        """Execute a buy trade"""
        try:
            self.logger.info(f"[TRADE] BUY trade execution started at price={price}, timestamp={timestamp}")
            
            # Clean up invalid contracts before counting
            invalid_keys = [k for k, v in self.trade_executor.active_contracts.items() 
                           if not v.get("contract_id") or not str(v.get("contract_id")).isdigit()]
            for key in invalid_keys:
                self.logger.warning(f"[TRADE] 🧹 Removing invalid contract: {key}")
                del self.trade_executor.active_contracts[key]
            
            real_active_count = sum(1 for td in self.trade_executor.active_contracts.values()
                                    if td.get("status") not in ["pending", "closing", "closing_early", "force_closing", "closed"])
            max_trades = self.config.get("risk_management.max_concurrent_trades", 1)
            if real_active_count >= max_trades:
                self.logger.warning(f"[TRADE] BUY trade rejected: Max active trades reached ({real_active_count}/{max_trades})")
                # Log which contracts are currently active for debugging
                for trade_id, td in self.trade_executor.active_contracts.items():
                    contract_id = td.get("contract_id", "pending")
                    status = td.get("status", "unknown")
                    age = time.time() - td.get("timestamp", time.time())
                    self.logger.warning(f"  Active contract: {contract_id} | Status: {status} | Age: {age:.0f}s")
                return

            can_trade, reason = self.risk_manager.can_trade()
            if not can_trade:
                self.logger.warning(f"[TRADE] BUY trade rejected by risk manager: {reason}")
                return

            # 🎯 EMA PRICE POSITION FILTER: For UPTREND (BUY), price must be ABOVE both EMAs
            self.logger.info(f"[EMA FILTER] Starting BUY EMA filter check at price={price:.5f}")
            
            # Check which strategy is active and use its EMAs
            ema_fast_val = None
            ema_slow_val = None
            
            if hasattr(self.strategy_engine, 'candlestick_strategy') and self.strategy_engine.candlestick_strategy:
                # Use candlestick strategy EMAs (ema_fast/ema_slow)
                self.logger.info(f"[EMA FILTER] Using candlestick strategy EMAs")
                ema_fast_val = self.strategy_engine.candlestick_strategy.ema_fast.get_value() if self.strategy_engine.candlestick_strategy.ema_fast else None
                ema_slow_val = self.strategy_engine.candlestick_strategy.ema_slow.get_value() if self.strategy_engine.candlestick_strategy.ema_slow else None
                self.logger.info(f"[EMA FILTER] Candlestick EMAs: fast={ema_fast_val}, slow={ema_slow_val}")
            elif self.strategy_engine.ema_7 and self.strategy_engine.ema_15:
                # Use mean reversion EMAs (ema_7/ema_15)
                self.logger.info(f"[EMA FILTER] Using mean reversion EMAs")
                ema_fast_val = self.strategy_engine.ema_7.get_value() if self.strategy_engine.ema_7 else None
                ema_slow_val = self.strategy_engine.ema_15.get_value() if self.strategy_engine.ema_15 else None
                self.logger.info(f"[EMA FILTER] Mean reversion EMAs: ema7={ema_fast_val}, ema15={ema_slow_val}")
            else:
                self.logger.error(f"[EMA FILTER] No EMAs found! candlestick_strategy={hasattr(self.strategy_engine, 'candlestick_strategy')}, ema_7={hasattr(self.strategy_engine, 'ema_7')}")
            
            if ema_fast_val is None or ema_slow_val is None:
                self.logger.warning(f"❌ [EMA FILTER] BUY REJECTED: EMAs not initialized yet (fast={ema_fast_val}, slow={ema_slow_val})")
                return
            
            # Check trend direction first (ema_fast > ema_slow for uptrend)
            if ema_fast_val <= ema_slow_val:
                self.logger.warning(f"❌ [EMA FILTER] BUY REJECTED: NOT in uptrend (EMA_fast={ema_fast_val:.5f} <= EMA_slow={ema_slow_val:.5f})")
                return
            
            # Check price position (price must be above both EMAs for uptrend entry)
            if price <= ema_fast_val or price <= ema_slow_val:
                self.logger.warning(f"❌ [EMA FILTER] BUY REJECTED: Price={price:.5f} not above both EMAs (EMA_fast={ema_fast_val:.5f}, EMA_slow={ema_slow_val:.5f})")
                return
            
            self.logger.info(f"✅ [EMA FILTER] BUY APPROVED: Price={price:.5f} > EMA_fast={ema_fast_val:.5f} > EMA_slow={ema_slow_val:.5f}")

            stake = self.risk_manager.calculate_stake()
            if stake <= 0:
                self.logger.warning(f"[TRADE] BUY trade rejected: Stake={stake} (must be > 0)")
                return

            self.logger.info(f"[TRADE] BUY trade checks passed: stake={stake}, can_trade=True")
            signal_data = metadata.get("signal_data") if metadata else None
            trade_id = self.trade_executor.place_trade(stake=stake, signal_data=signal_data, signal_type="BUY")
            if trade_id:
                self.logger.info(f"[TRADE] ✅ BUY trade placed successfully: {trade_id}")
                self.metrics.record_trade("BUY", "placed", 0.0)
                
                # Register position with position manager if from mean reversion strategy
                if metadata and metadata.get("strategy") == "mean_reversion":
                    # Note: contract_id not available yet, will be added when confirmed
                    self.logger.info(f"[POSITION] Mean reversion BUY position initiated: {trade_id}")
            else:
                self.logger.error(f"[TRADE] ❌ Failed to place BUY trade - place_trade returned None")

        except Exception as e:
            self.logger.error(f"[TRADE] Error executing BUY trade: {e}", exc_info=True)

    def _execute_sell_trade(self, price: float, timestamp: int, metadata: Optional[Dict] = None):
        """Execute a sell trade"""
        try:
            self.logger.info(f"[TRADE] SELL trade execution started at price={price}, timestamp={timestamp}")
            
            # Clean up invalid contracts before counting
            invalid_keys = [k for k, v in self.trade_executor.active_contracts.items() 
                           if not v.get("contract_id") or not str(v.get("contract_id")).isdigit()]
            for key in invalid_keys:
                self.logger.warning(f"[TRADE] 🧹 Removing invalid contract: {key}")
                del self.trade_executor.active_contracts[key]
            
            real_active_count = sum(1 for td in self.trade_executor.active_contracts.values()
                                    if td.get("status") not in ["pending", "closing", "closing_early", "force_closing", "closed"])
            max_trades = self.config.get("risk_management.max_concurrent_trades", 1)
            if real_active_count >= max_trades:
                self.logger.warning(f"[TRADE] SELL trade rejected: Max active trades reached ({real_active_count}/{max_trades})")
                # Log which contracts are currently active for debugging
                for trade_id, td in self.trade_executor.active_contracts.items():
                    contract_id = td.get("contract_id", "pending")
                    status = td.get("status", "unknown")
                    age = time.time() - td.get("timestamp", time.time())
                    self.logger.warning(f"  Active contract: {contract_id} | Status: {status} | Age: {age:.0f}s")
                return

            can_trade, reason = self.risk_manager.can_trade()
            if not can_trade:
                self.logger.warning(f"[TRADE] SELL trade rejected by risk manager: {reason}")
                return

            # 🎯 EMA PRICE POSITION FILTER: For DOWNTREND (SELL), price must be BELOW both EMAs
            self.logger.info(f"[EMA FILTER] Starting SELL EMA filter check at price={price:.5f}")
            
            # Check which strategy is active and use its EMAs
            ema_fast_val = None
            ema_slow_val = None
            
            if hasattr(self.strategy_engine, 'candlestick_strategy') and self.strategy_engine.candlestick_strategy:
                # Use candlestick strategy EMAs (ema_fast/ema_slow)
                self.logger.info(f"[EMA FILTER] Using candlestick strategy EMAs")
                ema_fast_val = self.strategy_engine.candlestick_strategy.ema_fast.get_value() if self.strategy_engine.candlestick_strategy.ema_fast else None
                ema_slow_val = self.strategy_engine.candlestick_strategy.ema_slow.get_value() if self.strategy_engine.candlestick_strategy.ema_slow else None
                self.logger.info(f"[EMA FILTER] Candlestick EMAs: fast={ema_fast_val}, slow={ema_slow_val}")
            elif self.strategy_engine.ema_7 and self.strategy_engine.ema_15:
                # Use mean reversion EMAs (ema_7/ema_15)
                self.logger.info(f"[EMA FILTER] Using mean reversion EMAs")
                ema_fast_val = self.strategy_engine.ema_7.get_value() if self.strategy_engine.ema_7 else None
                ema_slow_val = self.strategy_engine.ema_15.get_value() if self.strategy_engine.ema_15 else None
                self.logger.info(f"[EMA FILTER] Mean reversion EMAs: ema7={ema_fast_val}, ema15={ema_slow_val}")
            else:
                self.logger.error(f"[EMA FILTER] No EMAs found! candlestick_strategy={hasattr(self.strategy_engine, 'candlestick_strategy')}, ema_7={hasattr(self.strategy_engine, 'ema_7')}")
            
            if ema_fast_val is None or ema_slow_val is None:
                self.logger.warning(f"❌ [EMA FILTER] SELL REJECTED: EMAs not initialized yet (fast={ema_fast_val}, slow={ema_slow_val})")
                return
            
            # Check trend direction first (ema_fast < ema_slow for downtrend)
            if ema_fast_val >= ema_slow_val:
                self.logger.warning(f"❌ [EMA FILTER] SELL REJECTED: NOT in downtrend (EMA_fast={ema_fast_val:.5f} >= EMA_slow={ema_slow_val:.5f})")
                return
            
            # Check price position (price must be below both EMAs for downtrend entry)
            if price >= ema_fast_val or price >= ema_slow_val:
                self.logger.warning(f"❌ [EMA FILTER] SELL REJECTED: Price={price:.5f} not below both EMAs (EMA_fast={ema_fast_val:.5f}, EMA_slow={ema_slow_val:.5f})")
                return
            
            self.logger.info(f"✅ [EMA FILTER] SELL APPROVED: Price={price:.5f} < EMA_fast={ema_fast_val:.5f} < EMA_slow={ema_slow_val:.5f}")

            stake = self.risk_manager.calculate_stake()
            if stake <= 0:
                self.logger.warning(f"[TRADE] SELL trade rejected: Stake={stake} (must be > 0)")
                return

            self.logger.info(f"[TRADE] SELL trade checks passed: stake={stake}, can_trade=True")
            signal_data = metadata.get("signal_data") if metadata else None
            trade_id = self.trade_executor.place_trade(stake=stake, signal_data=signal_data, signal_type="SELL")
            if trade_id:
                self.logger.info(f"[TRADE] ✅ SELL trade placed successfully: {trade_id}")
                self.metrics.record_trade("SELL", "placed", 0.0)
                
                # Register position with position manager if from mean reversion strategy
                if metadata and metadata.get("strategy") == "mean_reversion":
                    # Note: contract_id not available yet, will be added when confirmed
                    self.logger.info(f"[POSITION] Mean reversion SELL position initiated: {trade_id}")
            else:
                self.logger.error(f"[TRADE] ❌ Failed to place SELL trade - place_trade returned None")

        except Exception as e:
            self.logger.error(f"[TRADE] Error executing SELL trade: {e}", exc_info=True)

    async def start(self):
        """Start the bot and all components"""
        try:
            self.logger.info("Initializing LemoTick Bot...")
            await self.backend_client.connect()
            self.stream_handler.start()
            self.is_running = True
            self.start_time = datetime.now()
            self.logger.info("LemoTick Bot started")
            while self.is_running:
                await asyncio.sleep(1)
        except Exception as e:
            self.logger.error(f"Error starting bot: {e}")
            await self.stop()
            raise

    async def stop(self):
        """Stop the bot and all components"""
        self.logger.info("Stopping LemoTick Bot...")
        self.is_running = False
        for comp in [self.trade_executor, self.risk_manager]:
            if hasattr(comp, 'stop') and callable(comp.stop):
                try: await comp.stop()  # type: ignore
                except Exception: pass
        if hasattr(self.stream_handler, 'stop'): self.stream_handler.stop()
        if hasattr(self.backend_client, 'disconnect'): await self.backend_client.disconnect()
        self.logger.info("LemoTick Bot stopped")

    async def get_status(self) -> Dict[str, Any]:
        """Get bot status for dashboard"""
        async def _safe_status(comp):
            if hasattr(comp, 'get_status'):
                try: return await comp.get_status()  # type: ignore
                except Exception: return {"status": "unavailable"}
            return {"status": "unknown"}

        return {
            "is_running": self.is_running,
            "start_time": self.start_time.isoformat() if self.start_time else None,
            "uptime": (datetime.now() - self.start_time).total_seconds() if self.start_time else 0,
            "stream_status": await _safe_status(self.stream_handler),
            "risk_status": await _safe_status(self.risk_manager),
            "trade_status": await _safe_status(self.trade_executor),
        }
