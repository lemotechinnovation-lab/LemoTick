"""
Position management module
"""

from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional


@dataclass
class Position:
    """Represents an open trading position"""
    
    symbol: str
    direction: str  # 'rise' or 'fall'
    stake: float
    entry_price: float
    entry_time: datetime
    duration: int  # in minutes
    take_profit: float
    stop_loss: float
    trade_id: Optional[str] = None
    current_price: float = field(default=0.0)
    profit: float = field(default=0.0)
    is_closed: bool = field(default=False)
    close_time: Optional[datetime] = None
    close_price: Optional[float] = None
    # Point-based exits (for tick imbalance strategy)
    take_profit_points: Optional[int] = None
    stop_loss_points: Optional[int] = None
    break_even_points: Optional[int] = None
    break_even_lock_points: Optional[int] = None
    break_even_triggered: bool = field(default=False)
    
    def update_profit(self):
        """Update profit/loss based on current price"""
        if self.current_price <= 0:
            return
        
        # For point-based exits, calculate profit in points
        if self.take_profit_points is not None:
            if self.direction.lower() == 'rise':
                points_profit = (self.current_price - self.entry_price) * 10000
            else:  # fall
                points_profit = (self.entry_price - self.current_price) * 10000
            
            # Convert points to approximate dollar profit (rough estimate)
            # Assuming 1 point = ~$0.01 per $1 stake
            self.profit = (points_profit / 10000) * self.stake
        else:
            # Calculate profit based on direction
            if self.direction.lower() == 'rise':
                price_change = self.current_price - self.entry_price
            else:  # fall
                price_change = self.entry_price - self.current_price
            
            # Profit is stake * (price_change / entry_price)
            self.profit = self.stake * (price_change / self.entry_price) if self.entry_price > 0 else 0
    
    def check_exit_conditions(self) -> bool:
        """
        Check if position should be closed
        
        Returns:
            True if position should be closed
        """
        if self.is_closed:
            return False
        
        # Calculate elapsed time
        elapsed_seconds = (datetime.now() - self.entry_time).total_seconds()
        elapsed_minutes = elapsed_seconds / 60
        
        # POINT-BASED EXITS (for MACD+RSI strategy)
        if self.take_profit_points is not None and self.stop_loss_points is not None:
            # Calculate price difference in points
            if self.direction.lower() == 'rise':
                points_profit = (self.current_price - self.entry_price) * 10000
            else:  # fall
                points_profit = (self.entry_price - self.current_price) * 10000
            
            # Break-even rule: when profit reaches break_even_points, move stop to entry+2
            if (self.break_even_points is not None and 
                not self.break_even_triggered and 
                points_profit >= self.break_even_points):
                
                self.break_even_triggered = True
                # Move stop loss to lock in minimum profit
                self.stop_loss_points = self.break_even_lock_points or 2
            
            # Check take profit (points) - 10 points for MACD+RSI
            if points_profit >= self.take_profit_points:
                return True
            
            # Check stop loss (points) - 5 points for MACD+RSI
            if points_profit <= -self.stop_loss_points:
                return True
        
        # DOLLAR-BASED EXITS (legacy, for triple indicator strategy)
        else:
            # Check take profit (fixed dollar amount)
            if self.take_profit > 0 and self.profit >= self.take_profit:
                return True
            
            # Check partial take profit: if profit is between $0.10 and $1.00 and trade is open > 25 seconds
            if 0.1 <= self.profit < 1.0 and elapsed_seconds > 25:
                return True
            
            # TRAILING STOP LOSS: Lock in profits as price moves favorably
            # If profit > $0.30 and trade open > 10 seconds, move stop to lock minimum profit
            if self.profit > 0.30 and elapsed_seconds > 10:
                # Lock in at least $0.20 profit (move stop to profit - $0.20)
                trailing_stop = self.profit - 0.20
                if trailing_stop > self.stop_loss:
                    self.stop_loss = trailing_stop
            
            # Check stop loss (fixed dollar amount)
            if self.stop_loss > 0 and self.profit <= -self.stop_loss:
                return True
        
        # Check duration expiry
        if elapsed_minutes >= self.duration:
            return True
        
        return False
    
    def close(self, close_price: float, close_time: Optional[datetime] = None):
        """
        Close the position
        
        Args:
            close_price: Price at which position is closed
            close_time: Time when position is closed
        """
        self.close_price = close_price
        self.close_time = close_time or datetime.now()
        self.current_price = close_price
        self.update_profit()
        self.is_closed = True
    
    def __str__(self) -> str:
        """String representation of position"""
        return (
            f"Position({self.direction.upper()} {self.symbol} @ {self.entry_price} | "
            f"Stake: ${self.stake:.2f} | Profit: ${self.profit:.2f})"
        )
