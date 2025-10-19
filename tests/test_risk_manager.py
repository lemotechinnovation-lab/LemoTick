"""
Unit tests for risk manager.
"""

import pytest
import time
from src.risk_manager import RiskManager


class TestRiskManager:
    """Test RiskManager implementation."""
    
    def test_risk_manager_initialization(self):
        """Test risk manager initialization."""
        rm = RiskManager(initial_equity=1000.0)
        
        assert rm.initial_equity == 1000.0
        assert rm.current_equity == 1000.0
        assert rm.peak_equity == 1000.0
        assert rm.total_trades == 0
        assert rm.total_wins == 0
        assert rm.total_losses == 0
        assert len(rm.open_trades) == 0
    
    def test_can_trade_initial_state(self):
        """Test can_trade in initial state."""
        rm = RiskManager(initial_equity=1000.0)
        
        can_trade, reason = rm.can_trade()
        assert can_trade is True
        assert reason == "Trading allowed"
    
    def test_calculate_stake_basic(self):
        """Test basic stake calculation."""
        rm = RiskManager(initial_equity=1000.0)
        
        stake = rm.calculate_stake(volatility=0.001, confidence=1.0)
        assert stake > 0
        assert stake <= rm.max_stake
        assert stake >= rm.min_stake
    
    def test_register_trade(self):
        """Test trade registration."""
        rm = RiskManager(initial_equity=1000.0)
        
        success = rm.register_trade(
            trade_id="test_1",
            trade_type="BUY",
            stake=10.0,
            entry_price=100.0,
            timestamp=int(time.time())
        )
        
        assert success is True
        assert len(rm.open_trades) == 1
        assert rm.total_trades == 1
        assert "test_1" in rm.open_trades
    
    def test_close_trade_win(self):
        """Test closing a winning trade."""
        rm = RiskManager(initial_equity=1000.0)
        
        # Register trade
        rm.register_trade("test_1", "BUY", 10.0, 100.0, int(time.time()))
        
        # Close trade with profit
        result = rm.close_trade("test_1", 110.0, int(time.time()))
        
        assert result['trade_id'] == "test_1"
        assert result['profit'] > 0  # Should be profitable
        assert rm.total_wins == 1
        assert rm.total_losses == 0
        assert len(rm.open_trades) == 0
    
    def test_close_trade_loss(self):
        """Test closing a losing trade."""
        rm = RiskManager(initial_equity=1000.0)
        
        # Register trade
        rm.register_trade("test_1", "BUY", 10.0, 100.0, int(time.time()))
        
        # Close trade with loss
        result = rm.close_trade("test_1", 90.0, int(time.time()))
        
        assert result['trade_id'] == "test_1"
        assert result['profit'] < 0  # Should be a loss
        assert rm.total_wins == 0
        assert rm.total_losses == 1
        assert rm.consecutive_losses == 1
        assert len(rm.open_trades) == 0
    
    def test_cooldown_after_loss(self):
        """Test cooldown period after loss."""
        rm = RiskManager(initial_equity=1000.0)
        rm.cooldown_after_loss = 1.0  # 1 second cooldown
        
        # Register and close losing trade
        rm.register_trade("test_1", "BUY", 10.0, 100.0, int(time.time()))
        rm.close_trade("test_1", 90.0, int(time.time()))
        
        # Should be in cooldown
        can_trade, reason = rm.can_trade()
        assert can_trade is False
        assert "cooldown" in reason.lower()
        
        # Wait for cooldown to expire
        time.sleep(1.1)
        
        can_trade, reason = rm.can_trade()
        assert can_trade is True
    
    def test_max_concurrent_trades(self):
        """Test maximum concurrent trades limit."""
        rm = RiskManager(initial_equity=1000.0)
        rm.max_concurrent_trades = 2
        
        # Register first trade
        rm.register_trade("test_1", "BUY", 10.0, 100.0, int(time.time()))
        assert len(rm.open_trades) == 1
        
        # Register second trade
        rm.register_trade("test_2", "BUY", 10.0, 100.0, int(time.time()))
        assert len(rm.open_trades) == 2
        
        # Third trade should fail
        success = rm.register_trade("test_3", "BUY", 10.0, 100.0, int(time.time()))
        assert success is False
        assert len(rm.open_trades) == 2
    
    def test_daily_loss_limit(self):
        """Test daily loss limit functionality."""
        rm = RiskManager(initial_equity=1000.0)
        rm.max_daily_drawdown = 0.05  # 5% max drawdown
        
        # Simulate large loss
        rm.current_equity = 940.0  # 6% loss
        
        can_trade, reason = rm.can_trade()
        assert can_trade is False
        assert "drawdown" in reason.lower()
        assert rm.daily_loss_limit_triggered is True
    
    def test_update_equity(self):
        """Test equity update functionality."""
        rm = RiskManager(initial_equity=1000.0)
        
        rm.update_equity(1200.0)
        assert rm.current_equity == 1200.0
        assert rm.peak_equity == 1200.0
        
        # Update with lower equity
        rm.update_equity(1100.0)
        assert rm.current_equity == 1100.0
        assert rm.peak_equity == 1200.0  # Peak should remain
    
    def test_reset_functionality(self):
        """Test risk manager reset."""
        rm = RiskManager(initial_equity=1000.0)
        
        # Make some changes
        rm.register_trade("test_1", "BUY", 10.0, 100.0, int(time.time()))
        rm.current_equity = 1200.0
        rm.total_trades = 5
        
        # Reset
        rm.reset(new_equity=1500.0)
        
        assert rm.initial_equity == 1500.0
        assert rm.current_equity == 1500.0
        assert rm.peak_equity == 1500.0
        assert len(rm.open_trades) == 0
        assert rm.total_trades == 0
        assert rm.total_wins == 0
        assert rm.total_losses == 0


if __name__ == "__main__":
    pytest.main([__file__])

