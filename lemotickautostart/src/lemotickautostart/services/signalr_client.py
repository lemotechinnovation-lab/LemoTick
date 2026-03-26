"""
SignalR Client - WebSocket client for real-time updates to admin dashboard
"""

import asyncio
import json
from typing import Optional, Callable, Dict, Any
from datetime import datetime

from lemotickautostart.config import Settings
from lemotickautostart.logger import setup_logger

logger = setup_logger(__name__)

try:
    from signalrcore.hub_connection import HubConnection
    from signalrcore.hub_connection_config import HubConnectionConfig
    SIGNALR_AVAILABLE = True
except ImportError:
    SIGNALR_AVAILABLE = False
    logger.warning("signalrcore not installed. SignalR features will be disabled.")


class SignalRClient:
    """WebSocket client for SignalR hub communication"""
    
    def __init__(self, settings: Settings):
        """Initialize SignalR client"""
        self.settings = settings
        self.hub_url = settings.signalr_url
        self.token = settings.signalr_token
        self.connection: Optional[HubConnection] = None
        self.is_connected = False
        
        if SIGNALR_AVAILABLE:
            self._setup_connection()
        else:
            logger.warning("SignalR client disabled - signalrcore not installed")
    
    def _setup_connection(self):
        """Setup SignalR connection"""
        try:
            config = HubConnectionConfig(
                self.hub_url,
                options={
                    "access_token_factory": lambda: self.token,
                    "reconnect_interval": 5,
                    "max_reconnect_attempts": 10,
                    "skip_negotiation": False,
                    "transport": ["websockets"]
                }
            )
            
            self.connection = HubConnection(config)
            
            # Register event handlers
            self.connection.on_open(self._on_connected)
            self.connection.on_close(self._on_disconnected)
            self.connection.on_error(self._on_error)
            
            logger.info(f"SignalR client configured: {self.hub_url}")
        
        except Exception as e:
            logger.error(f"Error setting up SignalR connection: {e}")
    
    def _on_connected(self):
        """Handle connection opened"""
        self.is_connected = True
        logger.info("✅ Connected to SignalR hub")
    
    def _on_disconnected(self):
        """Handle connection closed"""
        self.is_connected = False
        logger.warning("⚠️ Disconnected from SignalR hub")
    
    def _on_error(self, error):
        """Handle connection error"""
        logger.error(f"SignalR error: {error}")
    
    def connect(self) -> bool:
        """Connect to SignalR hub"""
        if not SIGNALR_AVAILABLE:
            logger.warning("SignalR not available - skipping connection")
            return False
        
        try:
            if self.connection:
                self.connection.start()
                logger.info("SignalR connection started")
                return True
            else:
                logger.error("SignalR connection not configured")
                return False
        
        except Exception as e:
            logger.error(f"Error connecting to SignalR: {e}")
            return False
    
    def disconnect(self):
        """Disconnect from SignalR hub"""
        try:
            if self.connection and self.is_connected:
                self.connection.stop()
                logger.info("SignalR connection stopped")
        
        except Exception as e:
            logger.error(f"Error disconnecting from SignalR: {e}")
    
    def broadcast_trade_opened(self, portfolio_id: str, investor_id: str, 
                              trade_data: Dict[str, Any]) -> bool:
        """Broadcast trade opened event"""
        if not self.is_connected:
            logger.warning("SignalR not connected - cannot broadcast trade opened")
            return False
        
        try:
            payload = {
                "portfolioId": portfolio_id,
                "investorId": investor_id,
                "tradeId": trade_data.get("trade_id"),
                "symbol": trade_data.get("symbol"),
                "direction": trade_data.get("direction"),
                "stake": trade_data.get("stake"),
                "entryPrice": trade_data.get("entry_price"),
                "entryTime": datetime.utcnow().isoformat(),
                "status": "Open"
            }
            
            self.connection.send("BroadcastTradeOpened", [payload])
            logger.info(f"✅ Broadcast trade opened: {trade_data.get('trade_id')}")
            return True
        
        except Exception as e:
            logger.error(f"Error broadcasting trade opened: {e}")
            return False
    
    def broadcast_trade_closed(self, portfolio_id: str, investor_id: str, 
                              trade_data: Dict[str, Any]) -> bool:
        """Broadcast trade closed event"""
        if not self.is_connected:
            logger.warning("SignalR not connected - cannot broadcast trade closed")
            return False
        
        try:
            payload = {
                "portfolioId": portfolio_id,
                "investorId": investor_id,
                "tradeId": trade_data.get("trade_id"),
                "symbol": trade_data.get("symbol"),
                "direction": trade_data.get("direction"),
                "stake": trade_data.get("stake"),
                "entryPrice": trade_data.get("entry_price"),
                "exitPrice": trade_data.get("exit_price"),
                "profit": trade_data.get("profit"),
                "profitPct": trade_data.get("profit_pct"),
                "entryTime": trade_data.get("entry_time"),
                "exitTime": datetime.utcnow().isoformat(),
                "status": "Closed"
            }
            
            self.connection.send("BroadcastTradeClosed", [payload])
            logger.info(f"✅ Broadcast trade closed: {trade_data.get('trade_id')}")
            return True
        
        except Exception as e:
            logger.error(f"Error broadcasting trade closed: {e}")
            return False
    
    def broadcast_portfolio_update(self, portfolio_id: str, investor_id: str, 
                                  portfolio_data: Dict[str, Any]) -> bool:
        """Broadcast portfolio update event"""
        if not self.is_connected:
            logger.warning("SignalR not connected - cannot broadcast portfolio update")
            return False
        
        try:
            payload = {
                "portfolioId": portfolio_id,
                "investorId": investor_id,
                "balance": portfolio_data.get("balance"),
                "equity": portfolio_data.get("equity"),
                "marginUsed": portfolio_data.get("margin_used"),
                "openTrades": portfolio_data.get("open_trades"),
                "totalProfit": portfolio_data.get("total_profit"),
                "winRate": portfolio_data.get("win_rate"),
                "updatedAt": datetime.utcnow().isoformat()
            }
            
            self.connection.send("BroadcastPortfolioUpdate", [payload])
            logger.debug(f"✅ Broadcast portfolio update")
            return True
        
        except Exception as e:
            logger.error(f"Error broadcasting portfolio update: {e}")
            return False
    
    def broadcast_tick_update(self, symbol: str, price: float, timestamp: int) -> bool:
        """Broadcast tick update event"""
        if not self.is_connected:
            logger.debug("SignalR not connected - cannot broadcast tick update")
            return False
        
        try:
            payload = {
                "symbol": symbol,
                "price": price,
                "timestamp": timestamp,
                "dateTime": datetime.fromtimestamp(timestamp).isoformat()
            }
            
            self.connection.send("BroadcastTickUpdate", [payload])
            logger.debug(f"✅ Broadcast tick update: {symbol} @ {price}")
            return True
        
        except Exception as e:
            logger.error(f"Error broadcasting tick update: {e}")
            return False
    
    def subscribe_to_portfolio(self, portfolio_id: str) -> bool:
        """Subscribe to portfolio updates"""
        if not self.is_connected:
            logger.warning("SignalR not connected - cannot subscribe to portfolio")
            return False
        
        try:
            self.connection.send("SubscribeToPortfolio", [str(portfolio_id)])
            logger.info(f"✅ Subscribed to portfolio: {portfolio_id}")
            return True
        
        except Exception as e:
            logger.error(f"Error subscribing to portfolio: {e}")
            return False
    
    def subscribe_to_all_trades(self) -> bool:
        """Subscribe to all trades (admin view)"""
        if not self.is_connected:
            logger.warning("SignalR not connected - cannot subscribe to all trades")
            return False
        
        try:
            self.connection.send("SubscribeToAllTrades", [])
            logger.info("✅ Subscribed to all trades")
            return True
        
        except Exception as e:
            logger.error(f"Error subscribing to all trades: {e}")
            return False
