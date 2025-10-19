"""
Trade execution module for LemoTick bot.
Handles Deriv API integration for placing trades and managing positions.
"""

import json
import time
from typing import Dict, Any, Optional, Callable
from .config import config
from .logger import logger
from .utils.helpers import generate_trade_id
from .stream_handler import StreamHandler


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
        
        # Trade tracking
        self.pending_proposals = {}  # proposal_id -> proposal_data
        self.active_contracts = {}   # contract_id -> contract_data
        
        # Execution parameters
        self.contract_duration = config.get('trading.contract_duration', 1)  # seconds
        self.contract_duration_unit = config.get('trading.contract_duration_unit', 's')
        self.contract_basis = config.get('trading.contract_basis', 'payout')
        
        logger.info("Trade executor initialized")
    
    def place_trade(self, signal_type: str, stake: float, 
                   on_trade_result: Optional[Callable] = None) -> Optional[str]:
        """
        Place a trade based on signal.
        
        Args:
            signal_type: Trading signal (BUY/SELL)
            stake: Stake amount
            on_trade_result: Callback for trade results
            
        Returns:
            Trade ID if successful, None otherwise
        """
        try:
            # Validate inputs
            if signal_type not in ['BUY', 'SELL']:
                logger.error(f"Invalid signal type: {signal_type}")
                return None
            
            if not (self.min_stake <= stake <= self.max_stake):
                logger.error(f"Stake {stake} outside allowed range [{self.min_stake}, {self.max_stake}]")
                return None
            
            # Determine contract type
            contract_type = "CALL" if signal_type == "BUY" else "PUT"
            
            # Generate unique trade ID
            trade_id = generate_trade_id()
            
            # Request proposal
            proposal_id = self._request_proposal(contract_type, stake)
            if not proposal_id:
                logger.error("Failed to get proposal")
                return None
            
            # Store trade information
            trade_data = {
                'trade_id': trade_id,
                'signal_type': signal_type,
                'contract_type': contract_type,
                'stake': stake,
                'proposal_id': proposal_id,
                'timestamp': time.time(),
                'status': 'pending_proposal',
                'on_result': on_trade_result
            }
            
            self.pending_proposals[proposal_id] = trade_data
            
            logger.info(f"Trade initiated: {trade_id} - {contract_type} {stake}")
            return trade_id
            
        except Exception as e:
            logger.error(f"Error placing trade: {e}")
            return None
    
    def _request_proposal(self, contract_type: str, amount: float) -> Optional[str]:
        """
        Request proposal from Deriv API.
        
        Args:
            contract_type: Contract type (CALL/PUT)
            amount: Trade amount
            
        Returns:
            Proposal ID if successful, None otherwise
        """
        try:
            proposal_payload = {
                "proposal": 1,
                "subscribe": 1,
                "amount": amount,
                "basis": self.contract_basis,
                "contract_type": contract_type,
                "currency": "USD",
                "duration": self.contract_duration,
                "duration_unit": self.contract_duration_unit,
                "symbol": self.symbol
            }
            
            # Send proposal request
            if not self.stream_handler.send_message(proposal_payload):
                logger.error("Failed to send proposal request")
                return None
            
            logger.debug(f"Proposal requested: {contract_type} {amount}")
            return "pending"  # Will be updated when proposal response received
            
        except Exception as e:
            logger.error(f"Error requesting proposal: {e}")
            return None
    
    def handle_proposal_response(self, proposal_data: Dict[str, Any]) -> None:
        """
        Handle proposal response from Deriv API.
        
        Args:
            proposal_data: Proposal response data
        """
        try:
            proposal_id = proposal_data.get("id")
            if not proposal_id:
                logger.error("No proposal ID in response")
                return
            
            # Check if we have a pending proposal
            if proposal_id not in self.pending_proposals:
                logger.warning(f"Received proposal for unknown ID: {proposal_id}")
                return
            
            trade_data = self.pending_proposals[proposal_id]
            
            # Extract proposal details
            ask_price = proposal_data.get("ask_price", proposal_data.get("display_value", 0))
            payout = proposal_data.get("payout", 0)
            spot = proposal_data.get("spot", 0)
            
            logger.info(f"Proposal received: ID={proposal_id}, Ask={ask_price}, "
                       f"Payout={payout}, Spot={spot}")
            
            # Execute buy if proposal is valid
            if ask_price > 0:
                self._execute_buy(proposal_id, ask_price, trade_data)
            else:
                logger.error(f"Invalid proposal price: {ask_price}")
                self._cancel_trade(trade_data, "Invalid proposal price")
                
        except Exception as e:
            logger.error(f"Error handling proposal response: {e}")
    
    def _execute_buy(self, proposal_id: str, ask_price: float, trade_data: Dict[str, Any]) -> None:
        """
        Execute buy order using proposal ID.
        
        Args:
            proposal_id: Proposal ID from Deriv
            ask_price: Ask price from proposal
            trade_data: Trade data dictionary
        """
        try:
            buy_payload = {
                "buy": proposal_id,
                "price": ask_price
            }
            
            # Send buy request
            if not self.stream_handler.send_message(buy_payload):
                logger.error("Failed to send buy request")
                self._cancel_trade(trade_data, "Failed to send buy request")
                return
            
            # Update trade status
            trade_data['status'] = 'buy_sent'
            trade_data['ask_price'] = ask_price
            
            logger.info(f"Buy order sent: {trade_data['trade_id']} - Price: {ask_price}")
            
        except Exception as e:
            logger.error(f"Error executing buy: {e}")
            self._cancel_trade(trade_data, f"Buy execution error: {e}")
    
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
            for proposal_id, data in self.pending_proposals.items():
                if data['status'] == 'buy_sent':
                    trade_data = data
                    break
            
            if not trade_data:
                logger.warning(f"Received buy response for unknown trade")
                return
            
            # Update trade status
            trade_data['status'] = 'active'
            trade_data['contract_id'] = contract_id
            trade_data['buy_time'] = time.time()
            
            # Move to active contracts
            self.active_contracts[contract_id] = trade_data
            del self.pending_proposals[trade_data['proposal_id']]
            
            logger.info(f"Trade executed: {trade_data['trade_id']} - Contract: {contract_id}")
            
            # Call trade result callback if provided
            if trade_data.get('on_result'):
                trade_data['on_result'](trade_data, 'executed')
                
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
            sell_price = contract_data.get("sell_price", 0)
            
            logger.debug(f"Contract update: {contract_id} - Status: {status}, "
                        f"Profit: {profit}, Sell Price: {sell_price}")
            
            # Handle contract completion
            if status in ["won", "lost", "sold"]:
                self._handle_contract_completion(contract_id, contract_data, trade_data)
                
        except Exception as e:
            logger.error(f"Error handling contract update: {e}")
    
    def _handle_contract_completion(self, contract_id: str, contract_data: Dict[str, Any], 
                                  trade_data: Dict[str, Any]) -> None:
        """
        Handle contract completion.
        
        Args:
            contract_id: Contract ID
            contract_data: Contract data
            trade_data: Trade data
        """
        try:
            # Extract final details
            status = contract_data.get("status", "unknown")
            profit = contract_data.get("profit", 0)
            sell_price = contract_data.get("sell_price", 0)
            
            # Update trade data
            trade_data['status'] = 'completed'
            trade_data['completion_time'] = time.time()
            trade_data['final_profit'] = profit
            trade_data['final_status'] = status
            
            logger.info(f"Contract completed: {contract_id} - {status} - "
                       f"Profit: {profit}")
            
            # Call trade result callback if provided
            if trade_data.get('on_result'):
                trade_data['on_result'](trade_data, 'completed')
            
            # Remove from active contracts
            del self.active_contracts[contract_id]
            
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
            trade_data['status'] = 'cancelled'
            trade_data['cancellation_reason'] = reason
            trade_data['cancellation_time'] = time.time()
            
            logger.warning(f"Trade cancelled: {trade_data['trade_id']} - {reason}")
            
            # Remove from pending proposals
            if trade_data.get('proposal_id') in self.pending_proposals:
                del self.pending_proposals[trade_data['proposal_id']]
            
            # Call trade result callback if provided
            if trade_data.get('on_result'):
                trade_data['on_result'](trade_data, 'cancelled')
                
        except Exception as e:
            logger.error(f"Error cancelling trade: {e}")
    
    def get_trade_status(self) -> Dict[str, Any]:
        """
        Get current trade execution status.
        
        Returns:
            Status dictionary
        """
        return {
            'pending_proposals': len(self.pending_proposals),
            'active_contracts': len(self.active_contracts),
            'pending_proposal_ids': list(self.pending_proposals.keys()),
            'active_contract_ids': list(self.active_contracts.keys())
        }
    
    def close_all_trades(self) -> None:
        """Close all active trades (emergency function)."""
        logger.warning("Closing all active trades")
        
        # Cancel pending proposals
        for proposal_id, trade_data in list(self.pending_proposals.items()):
            self._cancel_trade(trade_data, "Emergency close")
        
        # Note: Active contracts cannot be closed early in most Deriv contract types
        # They will expire naturally
        logger.info(f"Emergency close completed. {len(self.active_contracts)} contracts remain active")

