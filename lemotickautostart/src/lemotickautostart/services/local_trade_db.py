"""
Local Trade Database - Simple JSON-based trade tracking
Fallback when backend API is not available
"""

import json
import os
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Optional

from lemotickautostart.logger import setup_logger

logger = setup_logger(__name__)


class LocalTradeDB:
    """Simple local trade database using JSON file"""
    
    def __init__(self, db_path: str = "trades.json"):
        """Initialize local trade database"""
        self.db_path = Path(db_path)
        self.trades: List[Dict] = []
        self._load()
        logger.info(f"LocalTradeDB initialized: {self.db_path}")
    
    def _load(self):
        """Load trades from JSON file"""
        try:
            if self.db_path.exists():
                with open(self.db_path, 'r') as f:
                    self.trades = json.load(f)
                logger.info(f"Loaded {len(self.trades)} trades from {self.db_path}")
            else:
                self.trades = []
                logger.info(f"No existing trades file, starting fresh")
        except Exception as e:
            logger.error(f"Error loading trades: {e}")
            self.trades = []
    
    def _save(self):
        """Save trades to JSON file"""
        try:
            with open(self.db_path, 'w') as f:
                json.dump(self.trades, f, indent=2, default=str)
        except Exception as e:
            logger.error(f"Error saving trades: {e}")
    
    def create_trade(self, symbol: str, direction: str, stake: float, entry_price: float,
                    duration: int, trade_id: str) -> Dict:
        """Create a new trade record"""
        trade = {
            "id": trade_id,
            "symbol": symbol,
            "direction": direction.upper(),
            "stake": stake,
            "entryPrice": entry_price,
            "entryTime": datetime.utcnow().isoformat(),
            "duration": duration,
            "status": "Open",
            "exitPrice": None,
            "exitTime": None,
            "profit": None,
            "loss": None
        }
        
        self.trades.append(trade)
        self._save()
        logger.info(f"✅ Trade created locally: {trade_id}")
        return trade
    
    def update_trade(self, trade_id: str, exit_price: float, profit: float,
                    status: str = "Closed") -> Optional[Dict]:
        """Update a trade record"""
        for trade in self.trades:
            if trade["id"] == trade_id:
                trade["exitPrice"] = exit_price
                trade["exitTime"] = datetime.utcnow().isoformat()
                trade["profit"] = profit
                trade["loss"] = -profit if profit < 0 else 0
                trade["status"] = status
                self._save()
                logger.info(f"✅ Trade updated locally: {trade_id}")
                return trade
        
        logger.warning(f"Trade not found: {trade_id}")
        return None
    
    def get_open_trades(self) -> List[Dict]:
        """Get all open trades"""
        open_trades = [t for t in self.trades if t["status"] == "Open"]
        return open_trades
    
    def get_closed_trades(self) -> List[Dict]:
        """Get all closed trades"""
        closed_trades = [t for t in self.trades if t["status"] == "Closed"]
        return closed_trades
    
    def get_all_trades(self) -> List[Dict]:
        """Get all trades"""
        return self.trades
    
    def get_trade(self, trade_id: str) -> Optional[Dict]:
        """Get a specific trade"""
        for trade in self.trades:
            if trade["id"] == trade_id:
                return trade
        return None
    
    def get_statistics(self) -> Dict:
        """Get trade statistics"""
        closed_trades = self.get_closed_trades()
        
        if not closed_trades:
            return {
                "total_trades": len(self.trades),
                "open_trades": len(self.get_open_trades()),
                "closed_trades": 0,
                "winning_trades": 0,
                "losing_trades": 0,
                "win_rate": 0,
                "total_profit": 0,
                "total_loss": 0,
                "net_profit": 0
            }
        
        winning_trades = [t for t in closed_trades if t.get("profit", 0) > 0]
        losing_trades = [t for t in closed_trades if t.get("profit", 0) < 0]
        
        total_profit = sum(t.get("profit", 0) for t in winning_trades)
        total_loss = sum(abs(t.get("profit", 0)) for t in losing_trades)
        net_profit = total_profit - total_loss
        
        win_rate = (len(winning_trades) / len(closed_trades) * 100) if closed_trades else 0
        
        return {
            "total_trades": len(self.trades),
            "open_trades": len(self.get_open_trades()),
            "closed_trades": len(closed_trades),
            "winning_trades": len(winning_trades),
            "losing_trades": len(losing_trades),
            "win_rate": round(win_rate, 2),
            "total_profit": round(total_profit, 2),
            "total_loss": round(total_loss, 2),
            "net_profit": round(net_profit, 2)
        }
