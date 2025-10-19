"""
Unit tests for trade executor.
"""

import pytest
from unittest.mock import Mock, patch
from src.trade_executor import TradeExecutor


class TestTradeExecutor:
    """Test TradeExecutor implementation."""
    
    def test_trade_executor_initialization(self):
        """Test trade executor initialization."""
        stream_handler = Mock()
        executor = TradeExecutor(stream_handler)
        
        assert executor.stream_handler == stream_handler
        assert len(executor.pending_proposals) == 0
        assert len(executor.active_contracts) == 0
    
    @patch('src.trade_executor.generate_trade_id')
    def test_place_trade_buy(self, mock_generate_id):
        """Test placing BUY trade."""
        mock_generate_id.return_value = "test_trade_123"
        
        stream_handler = Mock()
        executor = TradeExecutor(stream_handler)
        
        # Mock successful proposal request
        executor._request_proposal = Mock(return_value="proposal_123")
        
        trade_id = executor.place_trade("BUY", 10.0)
        
        assert trade_id == "test_trade_123"
        assert "proposal_123" in executor.pending_proposals
    
    @patch('src.trade_executor.generate_trade_id')
    def test_place_trade_sell(self, mock_generate_id):
        """Test placing SELL trade."""
        mock_generate_id.return_value = "test_trade_456"
        
        stream_handler = Mock()
        executor = TradeExecutor(stream_handler)
        
        # Mock successful proposal request
        executor._request_proposal = Mock(return_value="proposal_456")
        
        trade_id = executor.place_trade("SELL", 15.0)
        
        assert trade_id == "test_trade_456"
        assert "proposal_456" in executor.pending_proposals
    
    def test_place_trade_invalid_signal(self):
        """Test placing trade with invalid signal."""
        stream_handler = Mock()
        executor = TradeExecutor(stream_handler)
        
        trade_id = executor.place_trade("INVALID", 10.0)
        
        assert trade_id is None
    
    def test_place_trade_invalid_stake(self):
        """Test placing trade with invalid stake."""
        stream_handler = Mock()
        executor = TradeExecutor(stream_handler)
        
        # Test stake too small
        trade_id = executor.place_trade("BUY", 0.5)  # Below min_stake
        assert trade_id is None
        
        # Test stake too large
        trade_id = executor.place_trade("BUY", 1000.0)  # Above max_stake
        assert trade_id is None
    
    def test_handle_proposal_response(self):
        """Test handling proposal response."""
        stream_handler = Mock()
        executor = TradeExecutor(stream_handler)
        
        # Add pending proposal
        executor.pending_proposals["proposal_123"] = {
            'trade_id': 'test_123',
            'signal_type': 'BUY',
            'contract_type': 'CALL',
            'stake': 10.0,
            'timestamp': 1234567890,
            'status': 'pending_proposal'
        }
        
        proposal_data = {
            "id": "proposal_123",
            "ask_price": 10.5,
            "payout": 20.0,
            "spot": 100.0
        }
        
        executor.handle_proposal_response(proposal_data)
        
        # Should execute buy
        stream_handler.send_message.assert_called()
    
    def test_handle_buy_response(self):
        """Test handling buy response."""
        stream_handler = Mock()
        executor = TradeExecutor(stream_handler)
        
        # Add pending trade
        executor.pending_proposals["proposal_123"] = {
            'trade_id': 'test_123',
            'signal_type': 'BUY',
            'contract_type': 'CALL',
            'stake': 10.0,
            'timestamp': 1234567890,
            'status': 'buy_sent'
        }
        
        buy_data = {
            "buy": {
                "contract_id": "contract_456"
            }
        }
        
        executor.handle_buy_response(buy_data)
        
        # Should move to active contracts
        assert "contract_456" in executor.active_contracts
        assert len(executor.pending_proposals) == 0
    
    def test_handle_contract_update_completion(self):
        """Test handling contract completion."""
        stream_handler = Mock()
        executor = TradeExecutor(stream_handler)
        
        # Add active contract
        executor.active_contracts["contract_456"] = {
            'trade_id': 'test_123',
            'signal_type': 'BUY',
            'contract_type': 'CALL',
            'stake': 10.0,
            'timestamp': 1234567890,
            'status': 'active'
        }
        
        contract_data = {
            "contract_id": "contract_456",
            "status": "won",
            "profit": 8.0,
            "sell_price": 110.0
        }
        
        executor.handle_contract_update(contract_data)
        
        # Should remove from active contracts
        assert "contract_456" not in executor.active_contracts
    
    def test_get_trade_status(self):
        """Test getting trade status."""
        stream_handler = Mock()
        executor = TradeExecutor(stream_handler)
        
        # Add some pending proposals and active contracts
        executor.pending_proposals["proposal_1"] = {}
        executor.pending_proposals["proposal_2"] = {}
        executor.active_contracts["contract_1"] = {}
        
        status = executor.get_trade_status()
        
        assert status['pending_proposals'] == 2
        assert status['active_contracts'] == 1
        assert len(status['pending_proposal_ids']) == 2
        assert len(status['active_contract_ids']) == 1
    
    def test_close_all_trades(self):
        """Test emergency close all trades."""
        stream_handler = Mock()
        executor = TradeExecutor(stream_handler)
        
        # Add some pending proposals
        executor.pending_proposals["proposal_1"] = {
            'trade_id': 'test_1',
            'signal_type': 'BUY'
        }
        executor.pending_proposals["proposal_2"] = {
            'trade_id': 'test_2',
            'signal_type': 'SELL'
        }
        
        executor.close_all_trades()
        
        # Should clear pending proposals
        assert len(executor.pending_proposals) == 0


if __name__ == "__main__":
    pytest.main([__file__])
