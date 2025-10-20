"""
Trade execution module for LemoTick bot.
Handles Deriv API integration for placing trades and managing positions.
"""

import time
from typing import Dict, Any, Optional, Callable
from .config import config
from .logger import logger
from .utils.helpers import generate_trade_id
from .stream_handler import StreamHandler
from .metrics import get_metrics


class TradeExecutor:
    """Handles trade execution through Deriv API."""

    def __init__(self, stream_handler: StreamHandler):
        """
        Initialize trade executor.

        Args:
            stream_handler: WebSocket stream handler for sending messages
        """
        self.stream_handler = stream_handler
        self.symbol = config.symbol
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
        self.symbol = config.get("trading.symbol", "1HZ100V")

        # Protective exits (percent of stake)
        self.take_profit_pct = float(config.get("trading.take_profit_pct", 0.20))
        self.stop_loss_pct = float(config.get("trading.stop_loss_pct", 0.20))

        # Register callbacks on the stream handler so we receive trade events
        try:
            self.stream_handler.register_trade_callbacks(
                on_proposal=self.handle_proposal_response,
                on_buy=self.handle_buy_response,
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

        logger.info("Trade executor initialized")

    def place_trade(
        self,
        signal_type: str,
        stake: float,
        on_trade_result: Optional[Callable] = None,
        entry_price: float = None,
        stop_loss_price: float = None,
        target_price: float = None,
        duration: int = None
    ) -> Optional[str]:
        """
        Place a direct buy order with SL/TP (simplified format).

        Args:
            signal_type: Trading signal (BUY/SELL)
            stake: Stake amount
            on_trade_result: Callback for trade results
            entry_price: Entry price (optional, uses current price if not provided)
            stop_loss_price: Stop loss price (optional)
            target_price: Take profit price (optional)
            duration: Contract duration in minutes (optional, uses config default if not provided)

        Returns:
            Trade ID if successful, None otherwise
        """
        try:
            # Check for active trades to prevent overlap
            if self.active_contracts:
                logger.warning(f"Active trade in progress, skipping new {signal_type} signal. Active contracts: {list(self.active_contracts.keys())}")
                return None

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
                entry_price=entry_price,
                stop_loss_price=stop_loss_price,
                target_price=target_price,
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
        entry_price: float = None,
        stop_loss_price: float = None,
        target_price: float = None,
        duration: int = None,
        on_trade_result: Optional[Callable] = None
    ) -> bool:
        """
        Execute direct buy order with optional SL/TP.

        Args:
            trade_id: Trade ID
            contract_type: Contract type (CALL/PUT)
            stake: Stake amount
            entry_price: Entry price (optional)
            stop_loss_price: Stop loss price (optional)
            target_price: Take profit price (optional)
            duration: Contract duration in minutes (optional, uses config default if not provided)
            on_trade_result: Callback for trade results

        Returns:
            True if successful, False otherwise
        """
        try:
            # For binary options, we need to use the barrier (strike price)
            # If no entry_price provided, use current price as barrier
            if entry_price is None:
                # Get current price from stream handler
                current_price = self.stream_handler.get_latest_tick(self.symbol)
                if current_price is None:
                    logger.error("No current price available for direct buy order")
                    return False
                barrier = current_price
            else:
                barrier = entry_price

            # For Deriv binary options, we need to use the proposal → buy flow
            # First request a proposal, then buy it

            # Build proposal request (Deriv API format)
            # For binary options, barrier might need different format
            duration_minutes = duration if duration is not None else self.contract_duration

            proposal_payload = {
                "proposal": 1,
                "symbol": self.symbol,
                "contract_type": contract_type,
                "duration": duration_minutes,
                "duration_unit": self.contract_duration_unit,
                "currency": "USD",
                "basis": self.contract_basis,  # Include basis field
            }

            # For binary options, set barrier appropriately based on contract type
            if contract_type == "CALL":
                proposal_payload["barrier"] = "+0.0"  # Use "+0.0" for current spot price
            elif contract_type == "PUT":
                proposal_payload["barrier"] = "-0.0"  # Use "-0.0" for current spot price

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

            # Note: SL/TP may not be supported for binary options on Deriv
            # For now, we'll rely on the contract's natural expiry

            # Send proposal request
            if not self.stream_handler.send_message(proposal_payload):
                logger.error("Failed to send proposal request")
                return False

            # Store trade information for proposal response
            trade_data = {
                "trade_id": trade_id,
                "signal_type": "BUY" if contract_type == "CALL" else "SELL",
                "contract_type": contract_type,
                "stake": stake,
                "barrier": barrier,
                "stop_loss": stop_loss_price,
                "take_profit": target_price,
                "timestamp": time.time(),
                "status": "proposal_sent",
                "on_result": on_trade_result,
            }

            # Store in active contracts (waiting for proposal response)
            self.active_contracts[trade_id] = trade_data

            # Log detailed trade information for debugging
            duration_minutes = duration if duration is not None else self.contract_duration
            logger.info(f"Placing {contract_type} for {self.symbol} - duration {duration_minutes}{self.contract_duration_unit} stake {stake} barrier {barrier}")
            logger.debug(f"Proposal payload: {proposal_payload}")

            logger.info(f"Proposal requested: {trade_id} - {contract_type} {stake} at barrier {barrier}")
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

            # Check for errors in proposal response
            error_code = proposal_data.get("error", {}).get("code")
            error_message = proposal_data.get("error", {}).get("message")

            if error_code:
                logger.error(f"Proposal error {error_code}: {error_message} for {trade_data.get('contract_type', 'unknown')} trade")
                logger.error(f"Full proposal response: {proposal_data}")
                self._cancel_trade(trade_data, f"Proposal error: {error_message}")
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

            # Update trade status
            trade_data["status"] = "active"
            trade_data["contract_id"] = contract_id
            trade_data["buy_time"] = time.time()

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

            logger.info(f"Trade executed: {trade_data['trade_id']} - Contract: {contract_id}")

            if self.metrics:
                try:
                    self.metrics.active_trades.set(len(self.active_contracts))
                except Exception:
                    pass

            # Subscribe to contract updates for completion events
            try:
                self.stream_handler.send_message(
                    {
                        "proposal_open_contract": 1,
                        "contract_id": contract_id,
                        "subscribe": 1,
                    }
                )
            except Exception:
                pass

            # Call trade result callback if provided
            if trade_data.get("on_result"):
                trade_data["on_result"](trade_data, "executed")

        except Exception as e:
            logger.error(f"Error handling buy response: {e}")

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

            logger.debug(
                f"Contract update: {contract_id} - Status: {status}, "
                f"Profit: {profit}"
            )

            # Handle contract completion
            if status in ["won", "lost", "sold"]:
                self._handle_contract_completion(contract_id, contract_data, trade_data)

        except Exception as e:
            logger.error(f"Error handling contract update: {e}")

    def _execute_sell(self, contract_id: str, reason: str = "manual") -> None:
        """Attempt to sell an active contract early to lock profit or cut loss."""
        try:
            # If we've seen that this contract can't be resold, skip sending again
            if contract_id in self._non_resellable_contracts:
                logger.debug(f"Skipping sell for {contract_id} (resale not offered)")
                return
                
            # Throttle sell attempts to prevent API spam
            self._sell_attempts[contract_id] = self._sell_attempts.get(contract_id, 0) + 1
            if self._sell_attempts[contract_id] > 3:
                self._non_resellable_contracts.add(contract_id)
                logger.debug(f"Contract {contract_id} marked as non-resellable after 3 attempts")
                return
                
            sell_payload = {"sell": contract_id, "price": 0}
            if not self.stream_handler.send_message(sell_payload):
                logger.warning(f"Failed to send sell for {contract_id}")
                return

            logger.info(f"Sell request sent for {contract_id} ({reason})")
            if self.metrics:
                try:
                    self.metrics.record_database_operation("trade_sell")
                except Exception:
                    pass
        except Exception as e:
            logger.error(f"Error executing sell: {e}")

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

    def close_all_trades(self) -> None:
        """Close all active trades (emergency function)."""
        logger.warning("Closing all active trades")

        # Note: With direct buy format, active contracts cannot be closed early
        # They will expire naturally based on their duration
        logger.info(
            f"Emergency close requested. {len(self.active_contracts)} contracts remain active (cannot be closed early)"
        )
