"""
Trading statistics and performance tracking module
"""

from dataclasses import dataclass, field
from datetime import datetime
from typing import List, Optional
from lemotickautostart.logger import setup_logger


logger = setup_logger(__name__)


@dataclass
class TradeStats:
    """Statistics for a single trade"""
    trade_id: str
    direction: str
    entry_price: float
    exit_price: float
    stake: float
    profit: float
    profit_pct: float
    entry_time: datetime
    exit_time: datetime
    duration_minutes: float
    is_win: bool


@dataclass
class BotStatistics:
    """Aggregated bot performance statistics"""
    total_trades: int = 0
    winning_trades: int = 0
    losing_trades: int = 0
    total_profit: float = 0.0
    total_loss: float = 0.0
    net_profit: float = 0.0
    win_rate: float = 0.0
    average_win: float = 0.0
    average_loss: float = 0.0
    profit_factor: float = 0.0
    largest_win: float = 0.0
    largest_loss: float = 0.0
    consecutive_wins: int = 0
    consecutive_losses: int = 0
    max_consecutive_wins: int = 0
    max_consecutive_losses: int = 0
    trades: List[TradeStats] = field(default_factory=list)
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    
    def add_trade(self, trade: TradeStats) -> None:
        """
        Add a completed trade and update statistics.
        
        Args:
            trade: Completed trade statistics
        """
        self.trades.append(trade)
        self.total_trades += 1
        
        if trade.is_win:
            self.winning_trades += 1
            self.total_profit += trade.profit
            self.consecutive_wins += 1
            self.consecutive_losses = 0
            
            if trade.profit > self.largest_win:
                self.largest_win = trade.profit
            
            if self.consecutive_wins > self.max_consecutive_wins:
                self.max_consecutive_wins = self.consecutive_wins
        else:
            self.losing_trades += 1
            self.total_loss += abs(trade.profit)
            self.consecutive_losses += 1
            self.consecutive_wins = 0
            
            if trade.profit < self.largest_loss:
                self.largest_loss = trade.profit
            
            if self.consecutive_losses > self.max_consecutive_losses:
                self.max_consecutive_losses = self.consecutive_losses
        
        self.net_profit = self.total_profit - self.total_loss
        self._recalculate_metrics()
    
    def _recalculate_metrics(self) -> None:
        """Recalculate derived metrics"""
        if self.total_trades > 0:
            self.win_rate = (self.winning_trades / self.total_trades) * 100
        
        if self.winning_trades > 0:
            self.average_win = self.total_profit / self.winning_trades
        
        if self.losing_trades > 0:
            self.average_loss = self.total_loss / self.losing_trades
        
        if self.total_loss > 0:
            self.profit_factor = self.total_profit / self.total_loss
    
    def get_summary(self) -> str:
        """Get formatted statistics summary"""
        return f"""
╔════════════════════════════════════════════════════════════╗
║                    TRADING STATISTICS                      ║
╠════════════════════════════════════════════════════════════╣
║ Total Trades:        {self.total_trades:>40} ║
║ Winning Trades:      {self.winning_trades:>40} ║
║ Losing Trades:       {self.losing_trades:>40} ║
║ Win Rate:            {self.win_rate:>39.2f}% ║
║                                                            ║
║ Total Profit:        ${self.total_profit:>39.2f} ║
║ Total Loss:          ${self.total_loss:>39.2f} ║
║ Net Profit:          ${self.net_profit:>39.2f} ║
║                                                            ║
║ Average Win:         ${self.average_win:>39.2f} ║
║ Average Loss:        ${self.average_loss:>39.2f} ║
║ Profit Factor:       {self.profit_factor:>40.2f} ║
║                                                            ║
║ Largest Win:         ${self.largest_win:>39.2f} ║
║ Largest Loss:        ${self.largest_loss:>39.2f} ║
║ Max Consecutive Wins: {self.max_consecutive_wins:>38} ║
║ Max Consecutive Losses: {self.max_consecutive_losses:>36} ║
╚════════════════════════════════════════════════════════════╝
"""
    
    def __str__(self) -> str:
        """String representation"""
        return self.get_summary()
