"""
Backend Client for Investor Management System Integration
Handles communication with the .NET backend API
"""

import aiohttp
import asyncio
import logging
from typing import Dict, Any, Optional, List
from datetime import datetime
import json


class BackendClient:
    """
    Client for communicating with the investor management backend
    """
    
    def __init__(self, config: Dict[str, Any]):
        self.base_url = config.get('backend_url', 'http://localhost:5000')
        self.api_key = config.get('backend_api_key')
        self.session: Optional[aiohttp.ClientSession] = None
        self.logger = logging.getLogger(__name__)
        
        # API endpoints
        self.endpoints = {
            'investors': '/api/investors',
            'portfolios': '/api/portfolios',
            'trades': '/api/trades',
            'performance': '/api/performance',
            'notifications': '/api/notifications'
        }
    
    async def connect(self):
        """Initialize HTTP session"""
        try:
            headers = {
                'Content-Type': 'application/json',
                'User-Agent': 'LemoTick-Bot/1.0'
            }
            
            if self.api_key:
                headers['Authorization'] = f'Bearer {self.api_key}'
            
            self.session = aiohttp.ClientSession(
                base_url=self.base_url,
                headers=headers,
                timeout=aiohttp.ClientTimeout(total=30)
            )
            
            self.logger.info("Backend client connected successfully")
            
        except Exception as e:
            self.logger.error(f"Failed to connect to backend: {e}")
            raise
    
    async def disconnect(self):
        """Close HTTP session"""
        if self.session:
            await self.session.close()
            self.logger.info("Backend client disconnected")
    
    async def create_trade_record(self, trade_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Record a trade in the backend system"""
        try:
            if not self.session:
                self.logger.warning("Backend client not connected")
                return None
            
            async with self.session.post(
                f"{self.endpoints['trades']}",
                json=trade_data
            ) as response:
                if response.status == 201:
                    result = await response.json()
                    self.logger.info(f"Trade recorded successfully: {result.get('id')}")
                    return result
                else:
                    self.logger.error(f"Failed to record trade: {response.status}")
                    return None
                    
        except Exception as e:
            self.logger.error(f"Error recording trade: {e}")
            return None
    
    async def update_portfolio_performance(self, portfolio_id: str, performance_data: Dict[str, Any]) -> bool:
        """Update portfolio performance metrics"""
        try:
            if not self.session:
                return False
            
            async with self.session.put(
                f"{self.endpoints['portfolios']}/{portfolio_id}/performance",
                json=performance_data
            ) as response:
                if response.status == 200:
                    self.logger.info(f"Portfolio performance updated: {portfolio_id}")
                    return True
                else:
                    self.logger.error(f"Failed to update portfolio: {response.status}")
                    return False
                    
        except Exception as e:
            self.logger.error(f"Error updating portfolio: {e}")
            return False
    
    async def get_investor_portfolios(self) -> List[Dict[str, Any]]:
        """Get all investor portfolios"""
        try:
            if not self.session:
                return []
            
            async with self.session.get(self.endpoints['portfolios']) as response:
                if response.status == 200:
                    portfolios = await response.json()
                    return portfolios
                else:
                    self.logger.error(f"Failed to get portfolios: {response.status}")
                    return []
                    
        except Exception as e:
            self.logger.error(f"Error getting portfolios: {e}")
            return []
    
    async def send_notification(self, investor_id: str, notification_data: Dict[str, Any]) -> bool:
        """Send notification to investor"""
        try:
            if not self.session:
                return False
            
            notification_data['investor_id'] = investor_id
            
            async with self.session.post(
                f"{self.endpoints['notifications']}",
                json=notification_data
            ) as response:
                if response.status == 201:
                    self.logger.info(f"Notification sent to investor: {investor_id}")
                    return True
                else:
                    self.logger.error(f"Failed to send notification: {response.status}")
                    return False
                    
        except Exception as e:
            self.logger.error(f"Error sending notification: {e}")
            return False
    
    async def get_risk_limits(self, portfolio_id: str) -> Dict[str, Any]:
        """Get risk limits for a portfolio"""
        try:
            if not self.session:
                return {}
            
            async with self.session.get(
                f"{self.endpoints['portfolios']}/{portfolio_id}/risk-limits"
            ) as response:
                if response.status == 200:
                    limits = await response.json()
                    return limits
                else:
                    self.logger.error(f"Failed to get risk limits: {response.status}")
                    return {}
                    
        except Exception as e:
            self.logger.error(f"Error getting risk limits: {e}")
            return {}
    
    async def health_check(self) -> bool:
        """Check if backend is healthy"""
        try:
            if not self.session:
                return False
            
            async with self.session.get('/api/health') as response:
                return response.status == 200
                
        except Exception as e:
            self.logger.error(f"Backend health check failed: {e}")
            return False
