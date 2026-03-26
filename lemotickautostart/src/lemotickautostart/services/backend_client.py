"""
Backend API Client - HTTP REST client for C# backend communication
"""

import requests
import json
from typing import Optional, Dict, Any
from datetime import datetime
from uuid import UUID

from lemotickautostart.config import Settings
from lemotickautostart.logger import setup_logger

logger = setup_logger(__name__)


class BackendClient:
    """HTTP REST client for backend API communication"""
    
    def __init__(self, settings: Settings):
        """Initialize backend client"""
        self.settings = settings
        self.base_url = settings.backend_url.rstrip('/')
        self.api_token = settings.backend_api_token
        self.portfolio_id = settings.portfolio_id
        self.investor_id = settings.investor_id
        self.session = requests.Session()
        self.session.headers.update({
            'Authorization': f'Bearer {self.api_token}',
            'Content-Type': 'application/json'
        })
        
        logger.info(f"BackendClient initialized: {self.base_url}")
    
    def _make_request(self, method: str, endpoint: str, data: Optional[Dict] = None) -> Optional[Dict]:
        """Make HTTP request to backend"""
        try:
            url = f"{self.base_url}{endpoint}"
            
            if method.upper() == 'GET':
                response = self.session.get(url)
            elif method.upper() == 'POST':
                response = self.session.post(url, json=data)
            elif method.upper() == 'PUT':
                response = self.session.put(url, json=data)
            elif method.upper() == 'DELETE':
                response = self.session.delete(url)
            else:
                logger.error(f"Unsupported HTTP method: {method}")
                return None
            
            if response.status_code in [200, 201]:
                return response.json()
            else:
                logger.error(f"Backend API error: {response.status_code} - {response.text}")
                return None
        
        except Exception as e:
            logger.error(f"Error making request to {endpoint}: {e}")
            return None
    
    def create_trade(self, symbol: str, direction: str, stake: float, entry_price: float, 
                    duration: int, trade_id: str) -> Optional[Dict]:
        """Create trade in backend database"""
        try:
            trade_data = {
                "portfolioId": str(self.portfolio_id),
                "symbol": symbol,
                "type": "Spot",  # Default to Spot
                "direction": direction.upper(),  # RISE or FALL
                "amount": stake,
                "entryPrice": entry_price,
                "stake": stake,
                "status": "Open",
                "entryTime": datetime.utcnow().isoformat(),
                "strategy": "TripleIndicator",
                "signal": f"{direction.upper()}_signal",
                "externalTradeId": trade_id  # Store Deriv trade ID
            }
            
            response = self._make_request('POST', '/api/trades', trade_data)
            
            if response:
                logger.info(f"✅ Trade created in backend: {response.get('id')}")
                return response
            else:
                logger.error("Failed to create trade in backend")
                return None
        
        except Exception as e:
            logger.error(f"Error creating trade: {e}")
            return None
    
    def update_trade(self, trade_id: str, exit_price: float, profit: float, 
                    status: str = "Closed") -> Optional[Dict]:
        """Update trade in backend database"""
        try:
            trade_data = {
                "exitPrice": exit_price,
                "profit": profit,
                "loss": -profit if profit < 0 else 0,
                "status": status,
                "exitTime": datetime.utcnow().isoformat()
            }
            
            response = self._make_request('PUT', f'/api/trades/{trade_id}', trade_data)
            
            if response:
                logger.info(f"✅ Trade updated in backend: {trade_id}")
                return response
            else:
                logger.error(f"Failed to update trade: {trade_id}")
                return None
        
        except Exception as e:
            logger.error(f"Error updating trade: {e}")
            return None
    
    def get_portfolio(self) -> Optional[Dict]:
        """Get portfolio details from backend"""
        try:
            response = self._make_request('GET', f'/api/portfolios/{self.portfolio_id}')
            
            if response:
                logger.debug(f"✅ Portfolio fetched: {response.get('name')}")
                return response
            else:
                logger.error(f"Failed to fetch portfolio: {self.portfolio_id}")
                return None
        
        except Exception as e:
            logger.error(f"Error fetching portfolio: {e}")
            return None
    
    def get_portfolio_trades(self) -> Optional[list]:
        """Get all trades for portfolio"""
        try:
            response = self._make_request('GET', f'/api/trades/portfolio/{self.portfolio_id}')
            
            if response:
                logger.debug(f"✅ Portfolio trades fetched: {len(response)} trades")
                return response
            else:
                logger.error(f"Failed to fetch portfolio trades: {self.portfolio_id}")
                return None
        
        except Exception as e:
            logger.error(f"Error fetching portfolio trades: {e}")
            return None
    
    def get_all_trades(self) -> Optional[list]:
        """Get all trades"""
        try:
            response = self._make_request('GET', '/api/trades')
            
            if response:
                logger.debug(f"✅ All trades fetched: {len(response)} trades")
                return response
            else:
                logger.error("Failed to fetch all trades")
                return None
        
        except Exception as e:
            logger.error(f"Error fetching all trades: {e}")
            return None
    
    def send_portfolio_update(self, balance: float, equity: float, margin_used: float) -> bool:
        """Send portfolio update to backend"""
        try:
            portfolio_data = {
                "balance": balance,
                "equity": equity,
                "marginUsed": margin_used,
                "updatedAt": datetime.utcnow().isoformat()
            }
            
            response = self._make_request('PUT', f'/api/portfolios/{self.portfolio_id}', portfolio_data)
            
            if response:
                logger.debug(f"✅ Portfolio update sent")
                return True
            else:
                logger.error("Failed to send portfolio update")
                return False
        
        except Exception as e:
            logger.error(f"Error sending portfolio update: {e}")
            return False
    
    def health_check(self) -> bool:
        """Check backend API health"""
        try:
            response = self._make_request('GET', '/api/health')
            
            if response:
                logger.info("✅ Backend API is healthy")
                return True
            else:
                logger.error("Backend API health check failed")
                return False
        
        except Exception as e:
            logger.error(f"Error checking backend health: {e}")
            return False
    
    def close(self):
        """Close session"""
        self.session.close()
        logger.info("BackendClient session closed")
