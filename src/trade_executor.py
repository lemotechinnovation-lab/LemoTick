"""
Trade execution module for LemoTick bot.
Handles Deriv API integration for placing trades and managing positions.
"""

import time
from typing import Dict, Any, Optional, Callable, List
from .config import config
from .logger import logger
from .utils.helpers import generate_trade_id, calculate_dynamic_ticks_sl_tp, calculate_tick_size_for_symbol
from .stream_handler import StreamHandler
from .metrics import get_metrics


class TradeExecutor:
    """Handles trade execution through Deriv API."""

    def __init__(self, stream_handler: StreamHandler, strategy_engine=None, data_recorder=None):
        """
        Initialize trade executor.

        Args:
            stream_handler: WebSocket stream handler for sending messages
            strategy_engine: Strategy engine for active trades checking
            data_recorder: Data recorder for database operations
        """
        self.stream_handler = stream_handler
        self.strategy_engine = strategy_engine
        self.data_recorder = data_recorder
        # Note: Using config.symbol dynamically instead of storing as instance variable
        self.min_stake = config.min_stake
        self.max_stake = config.max_stake

        # Trade tracking - Simplified for direct buy orders
        self.active_contracts = {}  # contract_id -> contract_data

        # Execution parameters
        self.contract_duration = config.get("trading.contract_duration", 1)  # minutes
        self.contract_duration_unit = config.get("trading.contract_duration_unit", "m")  # minutes
        self.contract_basis = config.get("trading.contract_basis", "payout")
        
        # Symbol-specific durations
        self.symbol_durations = config.get("trading.symbol_durations", {})

        # Protective exits (percent of stake) - for monitoring purposes
        self.take_profit_pct = float(config.get("trading.take_profit_pct", 0.20))
        self.stop_loss_pct = float(config.get("trading.stop_loss_pct", 0.20))

        # Early closure settings for Rise/Fall optimization
        self.early_closure_enabled = config.get("trading.early_closure_enabled", True)
        self.min_profit_threshold = float(config.get("trading.min_profit_threshold", 0.05))  # 5% minimum profit
        self.max_loss_threshold = float(config.get("trading.max_loss_threshold", 0.15))    # 15% maximum loss
        self.early_closure_check_interval = config.get("trading.early_closure_check_interval", 10)  # Check every 10 seconds

        # Register callbacks on the stream handler so we receive trade events
        try:
            self.stream_handler.register_trade_callbacks(
                on_proposal=self.handle_proposal_response,
                on_buy=self.handle_buy_response,
                on_sell=self.handle_sell_response,
                on_sell_error=self.handle_sell_error,
                on_contract_update=self.handle_contract_update,
            )
        except Exception:
            # Backward compatible if stream handler does not support registration
            pass

        # Metrics
        try:
            self.metrics = get_metrics()
        except Exception:
            self.metrics = None

        # Track contracts where resale is not offered to avoid repeated errors
        self._non_resellable_contracts = set()
        self._sell_attempts = {}  # Track sell attempts per contract
        self._last_sell_attempt = {}  # Track last sell attempt time for cooldown

        # Clear any stuck contracts from previous sessions
        self._clear_stuck_contracts()

        logger.info("Trade executor initialized")

    def _get_atr_value(self) -> float:
        """Get current ATR value from strategy engine."""
        try:
            if self.strategy_engine and hasattr(self.strategy_engine, 'atr'):
                return self.strategy_engine.atr.get_value() or 0.0
        except Exception:
            pass
        return 0.0

    def _calculate_signal_strength(self) -> float:
        """Calculate signal strength from MACD histogram."""
        try:
            if self.strategy_engine and hasattr(self.strategy_engine, 'macd'):
                macd_line, macd_signal, macd_histogram = self.strategy_engine.macd.get_value()
                # Normalize histogram to 0-1 range
                return min(abs(macd_histogram) / 0.5, 1.0)
        except Exception:
            pass
        return 0.5  # Default medium strength

    def _get_market_volatility(self) -> float:
        """Get market volatility estimate."""
        try:
            if self.strategy_engine and hasattr(self.strategy_engine, 'volatility'):
                volatility = self.strategy_engine.volatility.get_value()
                if volatility:
                    return min(volatility, 1.0)  # Cap at 1.0
        except Exception:
            pass
        return 0.001  # Default low volatility

    def _calculate_otm_probability(self, barrier_offset: float, current_price: float, contract_type: str) -> float:
        """
        Calculate approximate OTM probability for a given barrier.

        This is a simplified calculation - in practice you'd need more sophisticated models.
        """
        try:
            # Simple approximation based on barrier distance from current price
            distance_pct = barrier_offset / current_price

            # Assume normal distribution with 68% within 1 std dev
            # Approximate probability as distance from mean
            base_probability = min(distance_pct * 2.0, 0.5)  # Max 50% for extreme OTM

            # Adjust for contract type (calls vs puts may have different probabilities)
            if contract_type == "CALL":
                # Calls typically have slightly higher OTM probability
                return base_probability * 1.1
            else:
                # Puts typically have slightly lower OTM probability
                return base_probability * 0.9

        except Exception:
            return 0.25  # Default 25% OTM probability

    def place_trade(
        self,
        signal_type: str,
        stake: float,
        on_trade_result: Optional[Callable] = None,
        entry_price: float = None,
        duration: int = None
    ) -> Optional[str]:
        """
        Place a direct buy order (CALL/PUT binary options - no SL/TP support).

        Args:
            signal_type: Trading signal (BUY/SELL)
            stake: Stake amount
            on_trade_result: Callback for trade results
            entry_price: Entry price (optional, uses current price if not provided)
            duration: Contract duration in minutes (optional, uses config default if not provided)

        Returns:
            Trade ID if successful, None otherwise

        NOTE: SL/TP is only supported for Multiplier contracts (MULTUP/MULTDOWN),
              not for CALL/PUT binary options contracts.
        """
        try:
            # Check for active trades to prevent overlap (relaxed for faster execution)
            if self.strategy_engine and len(self.strategy_engine.active_trades) > 0:
                logger.debug(f"Active trade in progress, but allowing new signal for faster execution. Active trades: {len(self.strategy_engine.active_trades)}")
                # Continue with trade placement instead of skipping

            # Validate inputs
            if signal_type not in ["BUY", "SELL"]:
                logger.error(f"Invalid signal type: {signal_type}")
                return None

            if not (self.min_stake <= stake <= self.max_stake):
                logger.error(
                    f"Stake {stake} outside allowed range [{self.min_stake}, {self.max_stake}]"
                )
                return None

            # Use CALL/PUT contracts for 1HZ100V synthetic index (Deriv API standard)
            contract_type = "CALL" if signal_type == "BUY" else "PUT"

            # Generate unique trade ID
            trade_id = generate_trade_id()

            # Execute direct buy order
            success = self._execute_direct_buy(
                trade_id=trade_id,
                contract_type=contract_type,
                stake=stake,
                duration=duration,
                on_trade_result=on_trade_result
            )

            if success:
                logger.info(f"Direct buy order placed: {trade_id} - {contract_type} {stake}")
                return trade_id
            else:
                logger.error("Failed to place direct buy order")
                return None

        except Exception as e:
            logger.error(f"Error placing trade: {e}")
            return None

    def _execute_direct_buy(
        self,
        trade_id: str,
        contract_type: str,
        stake: float,
        duration: int = None,
        on_trade_result: Optional[Callable] = None
    ) -> bool:
        """
        Execute direct buy order (CALL/PUT binary options - no SL/TP).

        Args:
            trade_id: Trade ID
            contract_type: Contract type (CALL/PUT)
            stake: Stake amount
            duration: Contract duration in minutes (optional, uses config default if not provided)
            on_trade_result: Callback for trade results

        Returns:
            True if successful, False otherwise

        NOTE: SL/TP parameters removed since they're not supported for CALL/PUT contracts.
              Use Multiplier contracts (MULTUP/MULTDOWN) if you need SL/TP functionality.
        """
        try:
            # For binary options, we need to use the barrier (strike price)
            # Get current price for out-of-money barrier calculation
            current_price = self.stream_handler.get_latest_tick(config.symbol)
            if current_price is None:
                logger.error("No current price available for direct buy order")
                return False
            barrier = current_price

            # For Deriv binary options, we need to use the proposal → buy flow
            # First request a proposal, then buy it

            # Build proposal request (Deriv API format)
            # For binary options, barrier might need different format
            duration_minutes = duration if duration is not None else self.contract_duration

            # Optimized proposal payload for Rise/Fall contracts
            proposal_payload = {
                "proposal": 1,
                "symbol": config.symbol,
                "contract_type": contract_type,
                "duration": duration_minutes,
                "duration_unit": self.contract_duration_unit,
                "currency": "USD",
                "basis": self.contract_basis,
                "amount": stake,  # Specify amount directly for better quote accuracy
                # Note: SL/TP not supported for Rise/Fall CALL/PUT contracts
                # Only available for Multiplier contracts (MULTUP/MULTDOWN)
            }

            # OPTIMIZED OTM BARRIER CALCULATION for Rise/Fall contracts
            # Use closer barriers for better win rate (1.5:1 ratio optimization)
            atr_value = self._get_atr_value()
            signal_strength = self._calculate_signal_strength()

            # Optimized barrier offset for Rise/Fall (closer barriers = better win rate)
            if atr_value and atr_value > 0:
                # Reduced ATR multiplier for closer barriers (better win rate)
                base_atr_multiplier = config.get('trading.otm_atr_multiplier', 0.3)  # 0.3x ATR (reduced from 0.5x)

                # Minimal signal strength adjustment for Rise/Fall
                signal_multiplier = 1.0 + (signal_strength * 0.2)  # 1.0x to 1.2x (reduced from 0.5x)

                # Reduced volatility multiplier for Rise/Fall
                volatility = self._get_market_volatility()
                volatility_multiplier = 1.0 + (volatility * 1.0)  # 1.0x to 2.0x (reduced from 3.0x)

                dynamic_offset = atr_value * base_atr_multiplier * signal_multiplier * volatility_multiplier
                barrier_offset = min(dynamic_offset, current_price * 0.01)  # Cap at 1% of price (reduced from 2%)
            else:
                # Fallback to percentage-based if ATR not available (optimized for Rise/Fall)
                base_offset_pct = config.get('trading.otm_base_offset_pct', 0.002)  # 0.2% (reduced from 0.5%)
                barrier_offset = current_price * base_offset_pct

            barrier_offset = round(barrier_offset, 2)  # Round to 2 decimal places

            # Apply OTM probability checking - stricter for Rise/Fall (better win rate)
            otm_probability = self._calculate_otm_probability(barrier_offset, current_price, contract_type)
            max_otm_probability = config.get('trading.max_otm_probability', 0.15)  # Max 15% OTM probability (reduced from 25%)

            if otm_probability > max_otm_probability:
                logger.warning(f"OTM probability too high ({otm_probability:.2f}), reducing barrier offset for better win rate")
                # Reduce barrier offset to bring probability within acceptable range
                while otm_probability > max_otm_probability and barrier_offset > 0.001:
                    barrier_offset *= 0.7  # Reduce by 30% (more aggressive reduction)
                    barrier_offset = round(barrier_offset, 2)
                    otm_probability = self._calculate_otm_probability(barrier_offset, current_price, contract_type)

            if contract_type == "CALL":
                barrier = current_price + barrier_offset  # Above current price
                # Ensure barrier offset has exactly 2 decimal places maximum
                barrier_offset_str = f"{barrier_offset:.2f}"
                if len(barrier_offset_str.split('.')[-1]) > 2:
                    barrier_offset_str = barrier_offset_str[:barrier_offset_str.rfind('.') + 3]
                proposal_payload["barrier"] = f"+{barrier_offset_str}"
            elif contract_type == "PUT":
                barrier = current_price - barrier_offset  # Below current price
                # Ensure barrier offset has exactly 2 decimal places maximum
                barrier_offset_str = f"{barrier_offset:.2f}"
                if len(barrier_offset_str.split('.')[-1]) > 2:
                    barrier_offset_str = barrier_offset_str[:barrier_offset_str.rfind('.') + 3]
                proposal_payload["barrier"] = f"-{barrier_offset_str}"

            logger.info(f"Dynamic OTM barrier: {barrier:.4f} (offset: {barrier_offset:.4f}, prob: {otm_probability:.2f})")

            # Add the correct money field according to the basis
            if str(self.contract_basis).lower() in ("stake", "amount"):
                proposal_payload["amount"] = stake
            else:
                # If using payout basis, set desired payout
                if str(self.contract_basis).lower() == "payout":
                    proposal_payload["payout"] = stake  # Use stake as payout for now
                else:
                    # Default to amount
                    proposal_payload["amount"] = stake

            # Debug logging
            logger.debug(f"Proposal payload: {proposal_payload}")

            # Note: SL/TP is NOT supported for CALL/PUT binary options contracts on Deriv
            # SL/TP only works with Multiplier contracts (MULTUP/MULTDOWN)
            # For binary options, we rely on the contract's natural expiry

            # Send proposal request
            if not self.stream_handler.send_message(proposal_payload):
                logger.error("Failed to send proposal request")
                return False

            # Store trade information for proposal response
            # NOTE: No SL/TP for CALL/PUT contracts - only for Multiplier contracts
            trade_data = {
                "trade_id": trade_id,
                "signal_type": "BUY" if contract_type == "CALL" else "SELL",
                "contract_type": contract_type,
                "stake": stake,
                "barrier": barrier,
                "entry_price": current_price,  # Store entry price for TP/SL calculations
                "timestamp": time.time(),
                "status": "proposal_sent",
                "on_result": on_trade_result,
            }

            # Store in active contracts (waiting for proposal response)
            self.active_contracts[trade_id] = trade_data

            # Log detailed trade information for debugging
            duration_minutes = duration if duration is not None else self.contract_duration
            logger.info(f"Placing {contract_type} for {config.symbol} - duration {duration_minutes}{self.contract_duration_unit} stake {stake} barrier {barrier:.2f} (OTM)")
            logger.debug(f"Proposal payload: {proposal_payload}")

            logger.info(f"Proposal requested: {trade_id} - {contract_type} {stake} at barrier {barrier:.2f} (OTM = Out-The-Money)")
            return True

        except Exception as e:
            logger.error(f"Error executing direct buy: {e}")
            return False


    def handle_proposal_response(self, proposal_data: Dict[str, Any]) -> None:
        """
        Handle proposal response from Deriv API.

        Args:
            proposal_data: Proposal response data
        """
        try:
            # Safer proposal ID extraction (handle different response formats)
            proposal_id = (proposal_data.get("id") or
                          proposal_data.get("proposal", {}).get("id") or
                          proposal_data.get("proposal", {}).get("proposal_id"))

            if not proposal_id:
                logger.error(f"No proposal ID found in response: {proposal_data}")
                return

            # Find corresponding trade data
            trade_data = None
            for tid, data in self.active_contracts.items():
                if data.get("status") == "proposal_sent":
                    trade_data = data
                    break

            if not trade_data:
                logger.warning(f"Received proposal for unknown trade: {proposal_id}")
                return

            # Extract proposal details
            ask_price = proposal_data.get("ask_price", 0)
            payout = proposal_data.get("payout", 0)

            # Enhanced error handling for Rise/Fall proposal responses
            error_code = proposal_data.get("error", {}).get("code")
            error_message = proposal_data.get("error", {}).get("message")

            if error_code:
                # Handle specific Deriv API errors for Rise/Fall contracts
                if error_code == "InvalidSymbol":
                    logger.error(f"Rise/Fall contract error: Invalid symbol {config.symbol}")
                elif error_code == "InvalidContractType":
                    logger.error(f"Rise/Fall contract error: Invalid contract type {trade_data.get('contract_type', 'unknown')}")
                elif error_code == "InvalidAmount":
                    logger.error(f"Rise/Fall contract error: Invalid stake amount {trade_data.get('stake', 'unknown')}")
                elif error_code == "MarketClosed":
                    logger.error("Rise/Fall contract error: Market is closed")
                elif error_code == "RateLimited":
                    logger.error("Rise/Fall contract error: Rate limited - too many requests")
                else:
                    logger.error(f"Rise/Fall contract error {error_code}: {error_message}")

                logger.error(f"Full proposal response: {proposal_data}")
                self._cancel_trade(trade_data, f"Proposal error {error_code}: {error_message}")
                return

            if ask_price <= 0:
                logger.error(f"Invalid proposal price: {ask_price} for {trade_data.get('contract_type', 'unknown')} trade")
                logger.error(f"Full proposal response: {proposal_data}")
                self._cancel_trade(trade_data, "Invalid proposal price")
                return

            # Execute buy order with proposal
            buy_payload = {"buy": proposal_id, "price": ask_price}

            if not self.stream_handler.send_message(buy_payload):
                logger.error("Failed to send buy request")
                self._cancel_trade(trade_data, "Failed to send buy request")
                return

            # Update trade status
            trade_data["status"] = "buy_sent"
            trade_data["ask_price"] = ask_price
            trade_data["payout"] = payout

            logger.info(f"Buy order sent: {trade_data['trade_id']} - Price: {ask_price}")

        except Exception as e:
            logger.error(f"Error handling proposal response: {e}")
            logger.error(f"Proposal data received: {proposal_data}")

    def handle_buy_response(self, buy_data: Dict[str, Any]) -> None:
        """
        Handle buy response from Deriv API.

        Args:
            buy_data: Buy response data
        """
        try:
            logger.info(f"Received buy response: {buy_data}")
            buy_info = buy_data.get("buy", {})
            contract_id = buy_info.get("contract_id")

            if not contract_id:
                logger.error("No contract ID in buy response")
                return

            # Find corresponding trade data
            trade_data = None
            for tid, data in self.active_contracts.items():
                if data.get("status") == "buy_sent":
                    trade_data = data
                    break

            if not trade_data:
                logger.warning("Received buy response for unknown trade")
                return

            # Enhanced error handling for buy response
            if not contract_id:
                logger.error("Rise/Fall contract error: No contract ID in buy response")
                self._cancel_trade(trade_data, "No contract ID in buy response")
                return

            # Check for buy errors in the response
            if "error" in buy_data:
                error_code = buy_data["error"].get("code")
                error_message = buy_data["error"].get("message")
                logger.error(f"Rise/Fall buy error {error_code}: {error_message}")
                self._cancel_trade(trade_data, f"Buy error {error_code}: {error_message}")
                return

            # Update trade status
            trade_data["status"] = "active"
            trade_data["contract_id"] = contract_id
            trade_data["buy_time"] = time.time()
            
            # Get entry spot from current market price (this is the actual contract basis/entry price)
            # For Rise/Fall contracts, we use the current market price as the entry spot
            # Note: buy_price in the response is the stake amount, not the entry price
            entry_spot = self.stream_handler.get_latest_tick(config.symbol)
            if entry_spot:
                trade_data["entry_spot"] = entry_spot
                logger.info(f"Entry spot captured from current market price: {entry_spot} for contract {contract_id}")
            else:
                # Fallback to trade entry price if current price not available
                trade_data["entry_spot"] = trade_data.get("entry_price", 0)
                logger.warning(f"Current price not available, using trade entry price: {trade_data['entry_spot']}")
            
            # Store buy_price from API response for SL/TP calculations
            buy_price = buy_info.get("buy_price", 1)
            if buy_price > 0:
                trade_data["buy_price"] = buy_price
                logger.info(f"Buy price stored for SL/TP calculations: {buy_price} for contract {contract_id}")

            # Fix contract lookup mismatch: re-key by contract_id for contract updates
            # Find the current key (trade_id) and move to contract_id key
            current_key = None
            for k, v in list(self.active_contracts.items()):
                if v is trade_data:
                    current_key = k
                    break

            if current_key and current_key != contract_id:
                # Move entry to use contract_id as key for contract updates
                self.active_contracts[contract_id] = self.active_contracts.pop(current_key)
            elif not current_key:
                logger.error("Rise/Fall contract error: Could not find trade data in active contracts")
                return

            logger.info(f"Trade executed: {trade_data['trade_id']} - Contract: {contract_id}")

            if self.metrics:
                try:
                    self.metrics.active_trades.set(len(self.active_contracts))
                except Exception:
                    pass

            # For Rise/Fall contracts, we don't need continuous subscriptions
            # We can check contract status later using proposal_open_contract without subscribe: 1
            # This reduces WebSocket traffic and improves performance

            # Call trade result callback if provided
            if trade_data.get("on_result"):
                trade_data["on_result"](trade_data, "executed")

        except Exception as e:
            logger.error(f"Error handling buy response: {e}")

    def handle_sell_response(self, sell_data: Dict[str, Any]) -> None:
        """
        Handle sell response from Deriv API.

        Args:
            sell_data: Sell response data
        """
        try:
            logger.info(f"Received sell response: {sell_data}")
            sell_info = sell_data.get("sell", {})
            contract_id = sell_info.get("contract_id")
            sold_for = sell_info.get("sold_for", 0)
            transaction_id = sell_info.get("transaction_id")

            if not contract_id:
                logger.error("No contract ID in sell response")
                return

            # Find corresponding trade data
            trade_data = None
            for tid, data in self.active_contracts.items():
                if data.get("contract_id") == contract_id:
                    trade_data = data
                    break

            if not trade_data:
                logger.warning("Received sell response for unknown contract")
                return

            # Update trade status
            trade_data["status"] = "closed"
            trade_data["sell_price"] = sold_for
            trade_data["sell_time"] = time.time()
            trade_data["transaction_id"] = transaction_id

            # Calculate final profit/loss
            stake = trade_data.get("stake", 0)
            profit = sold_for - stake
            trade_data["final_profit"] = profit
            trade_data["final_status"] = "win" if profit > 0 else "loss"

            logger.info(f"Trade closed successfully: Contract {contract_id} - Sold for: {sold_for}, Profit: {profit:.2f}")

            # Call trade result callback if provided
            if trade_data.get("on_result"):
                trade_data["on_result"](trade_data, "closed")

            # Remove from active contracts
            if contract_id in self.active_contracts:
                del self.active_contracts[contract_id]

            # Update trade status in database
            if self.data_recorder:
                try:
                    self.data_recorder.update_trade_status(contract_id, "closed", exit_price=sold_for, profit=profit)
                    logger.info(f"Trade marked as closed in database: {contract_id}")
                except Exception as e:
                    logger.error(f"Error updating trade status in database: {e}")

            # Metrics
            if self.metrics:
                try:
                    result_label = "win" if profit > 0 else "loss"
                    self.metrics.record_trade(
                        action=trade_data.get("signal_type", "unknown"),
                        result=result_label,
                        profit=abs(profit),
                    )
                    self.metrics.active_trades.set(len(self.active_contracts))
                except Exception:
                    pass

        except Exception as e:
            logger.error(f"Error handling sell response: {e}")

    def handle_sell_error(self, error_data: Dict[str, Any]) -> None:
        """
        Handle sell error response from Deriv API.

        Args:
            error_data: Error response data
        """
        try:
            error_code = error_data.get("code", "Unknown")
            error_message = error_data.get("message", "Unknown error")
            
            logger.warning(f"Sell error received: {error_code} - {error_message}")
            
            # Handle specific error types
            if error_code == "InvalidOfferings":
                # Mark contracts as non-resellable to prevent further attempts
                logger.info("Contract resale not offered - marking as non-resellable")
                # We can't identify the specific contract from the error, so we'll handle this
                # in the _execute_sell method by tracking failed attempts
                
        except Exception as e:
            logger.error(f"Error handling sell error: {e}")

    def handle_contract_update(self, contract_data: Dict[str, Any]) -> None:
        """
        Handle contract update from Deriv API.

        Args:
            contract_data: Contract update data
        """
        try:
            contract_id = contract_data.get("contract_id")
            if not contract_id:
                return

            # Check if we have this contract
            if contract_id not in self.active_contracts:
                return

            trade_data = self.active_contracts[contract_id]

            # Extract contract details
            status = contract_data.get("status", "unknown")
            profit = contract_data.get("profit", 0)
            
            # Check for sellability information
            is_sell_available = contract_data.get("is_sell_available", False)
            sell_price = contract_data.get("sell_price", 0)
            current_spot = contract_data.get("current_spot", 0)

            logger.debug(
                f"Contract update: {contract_id} - Status: {status}, "
                f"Profit: {profit}, Sellable: {is_sell_available}, Sell Price: {sell_price}"
            )
            
            # Store sellability information for early closure decisions
            if is_sell_available:
                trade_data["is_sell_available"] = True
                trade_data["sell_price"] = sell_price
                trade_data["current_spot"] = current_spot
            else:
                trade_data["is_sell_available"] = False

            # Handle contract completion
            if status in ["won", "lost", "sold"]:
                self._handle_contract_completion(contract_id, contract_data, trade_data)

        except Exception as e:
            logger.error(f"Error handling contract update: {e}")

    def _can_sell_early(self, contract_data: Dict[str, Any]) -> bool:
        """Check if a contract can be sold early (Rise/Fall optimized)."""
        try:
            # For Rise/Fall contracts, early closure is always possible
            # Check if we haven't exceeded sell attempts for this contract
            contract_id = contract_data.get("contract_id")
            if not contract_id:
                return False

            if contract_id in self._non_resellable_contracts:
                return False

            sell_attempts = self._sell_attempts.get(contract_id, 0)
            return sell_attempts < 3  # Allow up to 3 attempts

        except Exception as e:
            logger.error(f"Error checking if contract can be sold early: {e}")
            return False

    def _execute_sell(self, contract_id: str, reason: str = "manual") -> None:
        """Attempt to sell an active contract early to lock profit or cut loss (Rise/Fall optimized)."""
        try:
            logger.info(f"[LemoTick] _execute_sell called for contract {contract_id} - reason: {reason}")
            # Check if contract can be sold early
            if contract_id in self._non_resellable_contracts:
                logger.debug(f"Skipping sell for {contract_id} (resale not offered)")
                return

            # Check cooldown period (30 seconds between sell attempts for same contract)
            current_time = time.time()
            last_attempt = self._last_sell_attempt.get(contract_id, 0)
            if current_time - last_attempt < 10:
                logger.debug(f"Sell attempt for {contract_id} in cooldown period")
                return
                
            # Throttle sell attempts to prevent API spam
            self._sell_attempts[contract_id] = self._sell_attempts.get(contract_id, 0) + 1
            if self._sell_attempts[contract_id] > 2:  # Reduced from 3 to 2 attempts
                self._non_resellable_contracts.add(contract_id)
                logger.warning(f"Contract {contract_id} marked as non-resellable after {self._sell_attempts[contract_id]} attempts")
                return
                
            # Update last sell attempt time
            self._last_sell_attempt[contract_id] = current_time

            # Convert contract_id to integer if it's a string
            try:
                if isinstance(contract_id, str):
                    # Try to convert string to integer
                    contract_id_int = int(contract_id)
                else:
                    contract_id_int = contract_id
            except (ValueError, TypeError):
                logger.error(f"Invalid contract_id format: {contract_id} (expected integer)")
                return

            # Use correct Deriv API format for selling Rise/Fall contracts
            # Based on feedback: {"sell": <integer_contract_id>, "price": 0}
            sell_payload = {
                "sell": contract_id_int,  # Use integer contract_id directly
                "price": 0  # Market price
            }
            
            logger.info(f"[LemoTick] Sending sell request: {sell_payload}")
            
            if not self.stream_handler.send_message(sell_payload):
                logger.warning(f"[LemoTick] Failed to send sell for {contract_id}")
                return

            logger.info(f"[LemoTick] Sell request sent for contract {contract_id_int} ({reason}) - Price: 0 (market)")
            logger.info(f"[LemoTick] Sell request sent for contract {contract_id_int}")
            
            # Update trade status in database
            if self.data_recorder:
                try:
                    self.data_recorder.update_trade_status(contract_id, "closing")
                    logger.info(f"Trade status updated in database: {contract_id} -> closing")
                except Exception as e:
                    logger.error(f"Error updating trade status in database: {e}")
            
            if self.metrics:
                try:
                    self.metrics.record_database_operation("trade_sell")
                except Exception:
                    pass
        except Exception as e:
            logger.error(f"Error executing sell: {e}")

    def _check_contract_sellability(self, contract_id: str) -> Optional[Dict[str, Any]]:
        """
        Check if a contract is sellable using proposal_open_contract.
        
        Args:
            contract_id: Contract ID to check
            
        Returns:
            Contract status data if available, None otherwise
        """
        try:
            # Convert contract_id to integer if it's a string
            try:
                if isinstance(contract_id, str):
                    contract_id_int = int(contract_id)
                else:
                    contract_id_int = contract_id  # pyright: ignore[reportUnreachable]
            except (ValueError, TypeError):
                logger.error(f"Invalid contract_id format: {contract_id} (expected integer)")
                return {"is_sell_available": False, "sell_price": 0}

            # Send proposal_open_contract request to check sellability
            status_payload = {
                "proposal_open_contract": 1,
                "contract_id": contract_id_int
            }
            
            if not self.stream_handler.send_message(status_payload):
                logger.error(f"Failed to send contract status request for {contract_id}")
                return None
                
            # Note: The response will be handled by handle_contract_update
            # For now, we'll return a placeholder - in a real implementation,
            # you'd need to wait for the response or use a synchronous approach
            return {"is_sell_available": True, "sell_price": 0}  # Placeholder
            
        except Exception as e:
            logger.error(f"Error checking contract sellability: {e}")
            return None

    def _handle_contract_completion(
        self,
        contract_id: str,
        contract_data: Dict[str, Any],
        trade_data: Dict[str, Any],
    ) -> None:
        """
        Handle contract completion (direct buy format).

        Args:
            contract_id: Contract ID
            contract_data: Contract data
            trade_data: Trade data
        """
        try:
            # Extract final details
            status = contract_data.get("status", "unknown")
            profit = contract_data.get("profit", 0)

            # Update trade data
            trade_data["status"] = "completed"
            trade_data["completion_time"] = time.time()
            trade_data["final_profit"] = profit
            trade_data["final_status"] = status

            logger.info(
                f"Direct buy completed: {contract_id} - {status} - " f"Profit: {profit}"
            )

            # Call trade result callback if provided
            if trade_data.get("on_result"):
                trade_data["on_result"](trade_data, "completed")

            # Remove from active contracts
            del self.active_contracts[contract_id]

            # Metrics
            if self.metrics:
                try:
                    result_label = "win" if profit > 0 else "loss"
                    logger.debug(f"Recording trade metrics: {result_label}, profit: {profit}")
                    self.metrics.record_trade(
                        action=trade_data.get("signal_type", "unknown"),
                        result=result_label,
                        profit=abs(profit),
                    )
                    self.metrics.active_trades.set(len(self.active_contracts))
                    logger.debug("Trade metrics recorded successfully")
                except Exception as e:
                    logger.error(f"Error recording trade metrics: {e}")
            else:
                logger.warning("Metrics instance is None, cannot record trade metrics")

        except Exception as e:
            logger.error(f"Error handling contract completion: {e}")

    def _cancel_trade(self, trade_data: Dict[str, Any], reason: str) -> None:
        """
        Cancel a trade due to error.

        Args:
            trade_data: Trade data
            reason: Cancellation reason
        """
        try:
            trade_data["status"] = "cancelled"
            trade_data["cancellation_reason"] = reason
            trade_data["cancellation_time"] = time.time()

            logger.warning(f"Trade cancelled: {trade_data['trade_id']} - {reason}")

            # Remove from pending proposals
            if trade_data.get("proposal_id") in self.pending_proposals:
                del self.pending_proposals[trade_data["proposal_id"]]

            # Call trade result callback if provided
            if trade_data.get("on_result"):
                trade_data["on_result"](trade_data, "cancelled")

        except Exception as e:
            logger.error(f"Error cancelling trade: {e}")

    def get_trade_status(self) -> Dict[str, Any]:
        """
        Get current trade execution status (direct buy format).

        Returns:
            Status dictionary
        """
        return {
            "active_contracts": len(self.active_contracts),
            "active_contract_ids": list(self.active_contracts.keys()),
        }

    def _clear_stuck_contracts(self) -> None:
        """Clear any stuck contracts from previous sessions that may prevent new trading."""
        if self.active_contracts:
            logger.warning(f"Clearing {len(self.active_contracts)} stuck contracts from previous session")
            # Clear all active contracts that may be stuck
            self.active_contracts.clear()
            logger.info("Stuck contracts cleared - ready for new trading session")
        else:
            logger.debug("No stuck contracts found")

    def check_contract_status(self, contract_id: str) -> Optional[Dict[str, Any]]:
        """
        Check the status of a specific contract (Rise/Fall optimized).

        Args:
            contract_id: Contract ID to check

        Returns:
            Contract status data if found, None otherwise
        """
        try:
            # Convert contract_id to integer if it's a string
            try:
                if isinstance(contract_id, str):
                    contract_id_int = int(contract_id)
                else:
                    contract_id_int = contract_id
            except (ValueError, TypeError):
                logger.error(f"Invalid contract_id format: {contract_id} (expected integer)")
                return {"is_sell_available": False, "sell_price": 0}

            # Send proposal_open_contract request without subscription for efficient checking
            status_payload = {
                "proposal_open_contract": 1,
                "contract_id": contract_id_int
            }

            # This will be handled by the stream handler and routed back to handle_contract_update
            if not self.stream_handler.send_message(status_payload):
                logger.error(f"Failed to send contract status request for {contract_id}")
                return None

            return self.active_contracts.get(contract_id)
        except Exception as e:
            logger.error(f"Error checking contract status: {e}")
            return None

    def check_all_contracts_status(self) -> Dict[str, Any]:
        """
        Check status of all active contracts (Rise/Fall optimized).

        Returns:
            Dictionary with contract statuses
        """
        results = {}
        for contract_id in list(self.active_contracts.keys()):
            status = self.check_contract_status(contract_id)
            if status:
                results[contract_id] = status
        return results

    def should_close_early(self, contract_data: Dict[str, Any], ticks_received: int = 0) -> tuple[bool, str]:
        """
        Check if contract should be closed early based on tick-based SL/TP system.

        Dynamic Tick-Based System:
        - Calculate ticks to SL/TP based on entry price and risk parameters
        - Use symbol-specific tick sizes for accurate calculations
        - Implement profit protection and MACD-based early closure

        Args:
            contract_data: Contract data from active_contracts
            ticks_received: Number of ticks received since trade entry

        Returns:
            Tuple of (should_close, reason)
        """
        try:
            if not self.early_closure_enabled:
                return False, "Early closure disabled"

            contract_id = contract_data.get("contract_id")
            if not contract_id:
                # Debug: Log the contract data structure
                logger.debug(f"Contract data structure: {contract_data}")
                return False, "No contract ID"

            stake = contract_data.get("stake", 0)
            if stake <= 0:
                return False, "Invalid stake amount"

            # Get contract age to avoid closing too early (minimum 3 seconds)
            contract_age = time.time() - contract_data.get("buy_time", 0)
            min_age_seconds = 3  # Minimum age before any closure checks

            if contract_age < min_age_seconds:
                return False, f"Contract too new ({contract_age:.1f}s < {min_age_seconds}s)"

            # Opposite direction closure system for Volatility 10 Index
            if ticks_received > 0:
                # Get current price
                current_price = self.stream_handler.get_latest_tick(config.symbol)
                if not current_price:
                    return False, "No current price available"
                
                # Check MACD-based opposite direction closure conditions
                should_close, reason = self._check_macd_opposite_direction_closure(
                    contract_data, current_price, ticks_received
                )
                if should_close:
                    return True, reason

            # TICK-BASED SL/TP SYSTEM
            # Calculate dynamic tick-based stop loss and take profit levels
            
            # Get contract details
            signal_type = contract_data.get("signal_type", "")
            barrier = contract_data.get("barrier", 0)
            # Use entry_spot (contract basis) instead of entry_price for accurate calculations
            entry_price = contract_data.get("entry_spot", contract_data.get("entry_price", 0))
            symbol = config.symbol

            # Use buy_price from API response for SL/TP calculations (this is the contract basis)
            buy_price = contract_data.get("buy_price", 1)
            
            # If buy_price is zero, sell immediately (invalid contract)
            if buy_price == 0:
                return True, "Invalid contract: buy_price is zero"
            
            # Initialize tick-based SL/TP if not already calculated
            if "ticks_sl" not in contract_data or "ticks_tp" not in contract_data:
                try:
                    # Calculate tick-based SL/TP using dynamic parameters
                    risk_percentage = config.get("risk_management.risk_per_trade_pct", 0.005)  # 0.5% risk
                    reward_multiplier = config.get("trading.reward_multiplier", 1.5)  # 1.5:1 reward ratio
                    
                    ticks_sl, ticks_tp = calculate_dynamic_ticks_sl_tp(
                        entry_price=buy_price,
                        symbol=symbol,
                        risk_percentage=risk_percentage,
                        reward_multiplier=reward_multiplier
                    )
                    
                    # Store calculated values
                    contract_data["ticks_sl"] = ticks_sl
                    contract_data["ticks_tp"] = ticks_tp
                    contract_data["tick_size"] = calculate_tick_size_for_symbol(symbol)
                    
                    logger.info(f"Tick-based SL/TP calculated for {contract_id}: SL={ticks_sl:.1f} ticks, TP={ticks_tp:.1f} ticks (entry_spot: {entry_price})")
                    
                except Exception as e:
                    logger.error(f"Error calculating tick-based SL/TP: {e}")
                    # Fallback to time-based closure
                    if contract_age > 30:
                        return True, f"Time-based fallback after {contract_age:.1f}s (SL/TP calc error)"
                    return False, f"Contract age {contract_age:.1f}s < 30s threshold (SL/TP calc error)"
            
            # Get calculated tick values
            ticks_sl = contract_data.get("ticks_sl", 0)
            ticks_tp = contract_data.get("ticks_tp", 0)
            tick_size = contract_data.get("tick_size", 0.005)
            
            # Initialize profit protection tracking
            if "profit_protection" not in contract_data:
                contract_data["profit_protection"] = {
                    "was_profitable": False,
                    "negative_ticks": 0,
                    "max_profit_pct": 0.0
                }
            
            profit_protection = contract_data["profit_protection"]
            
            # TICK-BASED PRICE MOVEMENT ANALYSIS
            # Calculate ticks moved from entry spot (contract basis) to current price
            current_price = self.stream_handler.get_latest_tick(config.symbol)
            if not current_price:
                return False, "No current price available"
            
            # Calculate ticks moved from entry spot (contract basis)
            price_difference = current_price - entry_price
            ticks_moved = abs(price_difference) / tick_size
            
            # Check contract type for proper TP/SL logic
            contract_type = contract_data.get("contract_type", "")
            
            if contract_type == "CALL" or signal_type == "BUY":
                # For CALL contracts, we want price to go UP
                ticks_up = price_difference / tick_size  # Positive if price went up
                
                # Update profit protection tracking
                if ticks_up > 0:
                    # Trade is profitable
                    if not profit_protection["was_profitable"]:
                        profit_protection["was_profitable"] = True
                        profit_protection["negative_ticks"] = 0
                    profit_protection["max_profit_pct"] = max(profit_protection["max_profit_pct"], ticks_up * tick_size / entry_price)
                elif profit_protection["was_profitable"]:
                    # Was profitable, now negative - start countdown
                    profit_protection["negative_ticks"] += 1
                    if profit_protection["negative_ticks"] >= 10:
                        return True, f"Profit Protection: Was profitable ({profit_protection['max_profit_pct']:.2%}), now negative for 10+ ticks"
                
                # TICK-BASED TAKE PROFIT: Close if we've moved up by TP ticks
                if ticks_up >= ticks_tp:
                    return True, f"Take Profit: Price up {ticks_up:.1f} ticks >= {ticks_tp:.1f} ticks target"
                
                # TICK-BASED STOP LOSS: Close if we've moved down by SL ticks
                if ticks_up <= -ticks_sl:
                    return True, f"Stop Loss: Price down {abs(ticks_up):.1f} ticks >= {ticks_sl:.1f} ticks stop"
                    
            elif contract_type == "PUT" or signal_type == "SELL":
                # For PUT contracts, we want price to go DOWN
                ticks_down = -price_difference / tick_size  # Positive if price went down
                
                # Update profit protection tracking
                if ticks_down > 0:
                    # Trade is profitable
                    if not profit_protection["was_profitable"]:
                        profit_protection["was_profitable"] = True
                        profit_protection["negative_ticks"] = 0
                    profit_protection["max_profit_pct"] = max(profit_protection["max_profit_pct"], ticks_down * tick_size / entry_price)
                elif profit_protection["was_profitable"]:
                    # Was profitable, now negative - start countdown
                    profit_protection["negative_ticks"] += 1
                    if profit_protection["negative_ticks"] >= 10:
                        return True, f"Profit Protection: Was profitable ({profit_protection['max_profit_pct']:.2%}), now negative for 10+ ticks"
                
                # TICK-BASED TAKE PROFIT: Close if we've moved down by TP ticks
                if ticks_down >= ticks_tp:
                    return True, f"Take Profit: Price down {ticks_down:.1f} ticks >= {ticks_tp:.1f} ticks target"
                
                # TICK-BASED STOP LOSS: Close if we've moved up by SL ticks
                if ticks_down <= -ticks_sl:
                    return True, f"Stop Loss: Price up {abs(ticks_down):.1f} ticks >= {ticks_sl:.1f} ticks stop"
            
            # FALLBACK: Maximum time limit (60 seconds) to prevent indefinite holding
            max_hold_time = 60  # 60 seconds maximum hold time
            if contract_age > max_hold_time:
                return True, f"Maximum hold time reached: {contract_age:.1f}s > {max_hold_time}s"
            
            # Debug profit protection status
            if profit_protection["was_profitable"]:
                logger.debug(f"Profit Protection: Was profitable ({profit_protection['max_profit_pct']:.2%}), negative ticks: {profit_protection['negative_ticks']}/10")
            
            return False, f"Price movement: {ticks_moved:.1f} ticks (SL: {ticks_sl:.1f}, TP: {ticks_tp:.1f})"

        except Exception as e:
            logger.error(f"Error checking early closure conditions: {e}")
            return False, f"Error: {e}"

    def _check_macd_opposite_direction_closure(self, contract_data: Dict[str, Any], current_price: float, ticks_received: int) -> tuple[bool, str]:
        """
        Check MACD-based opposite direction closure conditions.
        
        Args:
            contract_data: Contract data
            current_price: Current market price
            ticks_received: Number of ticks received
            
        Returns:
            Tuple of (should_close, reason)
        """
        try:
            signal_type = contract_data.get("signal_type", "")
            
            if not self.strategy_engine:
                return False, "No strategy engine available"
            
            # Get MACD values from strategy engine
            macd_values = self.strategy_engine.get_indicator_values()
            if not macd_values or "macd" not in macd_values:
                return False, "No MACD data available"
            
            current_macd = macd_values.get("macd", 0)
            current_signal = macd_values.get("macd_signal", 0)
            
            # Track MACD direction changes in contract data
            if "macd_history" not in contract_data:
                contract_data["macd_history"] = []
                contract_data["macd_direction_changes"] = 0
            
            # Add current MACD to history
            contract_data["macd_history"].append(current_macd)
            
            # Keep only last 10 MACD values
            if len(contract_data["macd_history"]) > 10:
                contract_data["macd_history"] = contract_data["macd_history"][-10:]
            
            # Check for MACD direction changes (opposite direction)
            if len(contract_data["macd_history"]) >= 2:
                prev_macd = contract_data["macd_history"][-2]
                curr_macd = contract_data["macd_history"][-1]
                
                # Check if MACD crossed zero line (direction change)
                if signal_type in ["BUY", "RISE"]:
                    # For BUY/RISE, we want MACD to stay positive
                    if prev_macd > 0 and curr_macd <= 0:
                        contract_data["macd_direction_changes"] += 1
                        logger.info(f"MACD crossed below zero for {signal_type} trade: {prev_macd:.4f} -> {curr_macd:.4f}")
                        
                elif signal_type in ["SELL", "FALL"]:
                    # For SELL/FALL, we want MACD to stay negative
                    if prev_macd < 0 and curr_macd >= 0:
                        contract_data["macd_direction_changes"] += 1
                        logger.info(f"MACD crossed above zero for {signal_type} trade: {prev_macd:.4f} -> {curr_macd:.4f}")
            
            # Check closure conditions
            direction_changes = contract_data.get("macd_direction_changes", 0)
            
            if direction_changes >= 5:
                return True, f"MACD opposite direction: {direction_changes} direction changes detected"
            
            # Fallback after 15 ticks
            if ticks_received >= 15:
                return True, f"MACD-based closure after {ticks_received} ticks (fallback)"
                
            return False, f"MACD analysis: {signal_type}, direction changes: {direction_changes}, MACD: {current_macd:.4f}, ticks: {ticks_received}"
            
        except Exception as e:
            logger.error(f"Error checking MACD opposite direction closure: {e}")
            return False, f"Error in MACD analysis: {e}"

    def _get_current_profit_loss(self, contract_id: str, stake: float) -> Optional[float]:
        """
        Get current profit/loss for a contract.

        Args:
            contract_id: Contract ID to check
            stake: Original stake amount

        Returns:
            Current profit/loss amount, None if cannot determine
        """
        try:
            # Send proposal_open_contract request to get current contract value
            status_payload = {
                "proposal_open_contract": 1,
                "contract_id": contract_id
            }

            # This will trigger handle_contract_update with current contract data
            # For now, we'll simulate getting the current value
            # In a real implementation, you'd need to track the contract updates

            # For this demo, we'll simulate profit/loss based on time and stake
            contract_age = time.time() - self.active_contracts.get(contract_id, {}).get("buy_time", 0)

            # Simulate profit/loss movement (this is just for demo)
            # In reality, this would come from actual contract updates
            if contract_age < 10:
                # Early in contract - small movements
                simulated_pl = (contract_age / 10) * stake * 0.1  # Up to 10% of stake
            elif contract_age < 30:
                # Mid contract - moderate movements
                simulated_pl = stake * 0.3 + (contract_age - 10) / 20 * stake * 0.4
            else:
                # Later in contract - higher movements
                simulated_pl = stake * 0.7 + (contract_age - 30) / 15 * stake * 0.8

            # Add some randomness to simulate market movement
            import random
            simulated_pl += random.uniform(-stake * 0.2, stake * 0.2)

            logger.debug(f"Current P&L for {contract_id}: {simulated_pl:.2f} (simulated)")
            return simulated_pl

        except Exception as e:
            logger.error(f"Error getting current P&L for {contract_id}: {e}")
            return None

    def perform_early_closure_check(self, ticks_received: int = 0) -> None:
        """Perform early closure checks on all active contracts."""
        try:
            if not self.early_closure_enabled:
                return

            contracts_to_close = []
            current_time = time.time()
            
            for contract_id, contract_data in list(self.active_contracts.items()):
                # Skip contracts that are already marked as non-resellable
                if contract_id in self._non_resellable_contracts:
                    continue
                    
                # Skip contracts that have already been attempted to be sold multiple times
                if self._sell_attempts.get(contract_id, 0) >= 2:
                    continue
                    
                # Skip contracts in cooldown period
                last_attempt = self._last_sell_attempt.get(contract_id, 0)
                if current_time - last_attempt < 30:
                    continue
                    
                should_close, reason = self.should_close_early(contract_data, ticks_received)
                if should_close:
                    contracts_to_close.append((contract_id, reason))

            # Close contracts that meet early closure criteria
            for contract_id, reason in contracts_to_close:
                logger.info(f"Closing contract {contract_id} early: {reason}")
                self._execute_sell(contract_id, f"early_closure_{reason}")

        except Exception as e:
            logger.error(f"Error in early closure check: {e}")

    def close_all_trades(self) -> None:
        """Close all active trades (emergency function)."""
        logger.warning("Closing all active trades")

        # For Rise/Fall contracts, we can attempt to close them early if profitable
        closed_count = 0
        for contract_id in list(self.active_contracts.keys()):
            try:
                # Check if contract can be sold profitably
                contract_data = self.active_contracts[contract_id]
                if self._can_sell_early(contract_data):
                    self._execute_sell(contract_id, "emergency_close")
                    closed_count += 1
            except Exception as e:
                logger.error(f"Error closing contract {contract_id}: {e}")

        logger.info(
            f"Emergency close requested. Attempted to close {closed_count} contracts, "
            f"{len(self.active_contracts)} contracts remain active"
        )
