"""
Backend Client for Investor Management System Integration
Handles communication with the .NET backend API
"""

import logging
from typing import Any, Dict, List, Optional

import aiohttp


class BackendClient:
    """
    Client for communicating with the investor management backend
    """

    def __init__(self, config: Dict[str, Any]):
        # Guard against None config
        if config is None:
            config = {}
        self.base_url = config.get("backend_url", "http://localhost:5000")
        self.api_key = config.get("backend_api_key")
        self.session: Optional[aiohttp.ClientSession] = None
        self.logger = logging.getLogger(__name__)

        # API endpoints
        self.endpoints = {
            "investors": "/api/investors",
            "portfolios": "/api/portfolios",
            "trades": "/api/trades",
            "performance": "/api/performance",
            "notifications": "/api/notifications",
        }

    async def connect(self):
        """Initialize HTTP session"""
        try:
            headers = {
                "Content-Type": "application/json",
                "User-Agent": "LemoTick-Bot/1.0",
            }

            if self.api_key:
                headers["Authorization"] = f"Bearer {self.api_key}"

            self.session = aiohttp.ClientSession(
                base_url=self.base_url,
                headers=headers,
                timeout=aiohttp.ClientTimeout(total=30),
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

    async def create_trade_record(
        self, trade_data: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        """Record a trade in the backend system"""
        try:
            if not self.session:
                self.logger.warning("Backend client not connected")
                return None

            async with self.session.post(
                f"{self.endpoints['trades']}", json=trade_data
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

    async def update_portfolio_performance(
        self, portfolio_id: str, performance_data: Dict[str, Any]
    ) -> bool:
        """Update portfolio performance metrics"""
        try:
            if not self.session:
                return False

            async with self.session.put(
                f"{self.endpoints['portfolios']}/{portfolio_id}/performance",
                json=performance_data,
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

            async with self.session.get(self.endpoints["portfolios"]) as response:
                if response.status == 200:
                    portfolios = await response.json()
                    return portfolios
                else:
                    self.logger.error(f"Failed to get portfolios: {response.status}")
                    return []

        except Exception as e:
            self.logger.error(f"Error getting portfolios: {e}")
            return []

    async def send_notification(
        self, investor_id: str, notification_data: Dict[str, Any]
    ) -> bool:
        """Send notification to investor"""
        try:
            if not self.session:
                return False

            notification_data["investor_id"] = investor_id

            async with self.session.post(
                f"{self.endpoints['notifications']}", json=notification_data
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

            async with self.session.get("/api/health") as response:
                return response.status == 200

        except Exception as e:
            self.logger.error(f"Backend health check failed: {e}")
            return False

    async def push_tick_update(self, symbol: str, price: float, timestamp: int) -> bool:
        """Push real-time tick update to backend"""
        try:
            if not self.session:
                return False

            data = {"symbol": symbol, "price": price, "timestamp": timestamp}

            async with self.session.post(
                "/api/derivwebhook/tick", json=data
            ) as response:
                if response.status == 200:
                    self.logger.debug(f"Tick update pushed: {symbol} @ {price}")
                    return True
                else:
                    self.logger.warning(
                        f"Failed to push tick update: {response.status}"
                    )
                    return False

        except Exception as e:
            self.logger.error(f"Error pushing tick update: {e}")
            return False

    async def push_trade_opened(self, trade_data: Dict[str, Any]) -> bool:
        """Push trade opened notification to backend"""
        try:
            if not self.session:
                return False

            async with self.session.post(
                "/api/derivwebhook/trade/opened", json=trade_data
            ) as response:
                if response.status == 200:
                    self.logger.info(
                        f"Trade opened notification pushed: {trade_data.get('tradeId')}"
                    )
                    return True
                else:
                    self.logger.warning(
                        f"Failed to push trade opened: {response.status}"
                    )
                    return False

        except Exception as e:
            self.logger.error(f"Error pushing trade opened: {e}")
            return False

    async def push_trade_closed(self, trade_data: Dict[str, Any]) -> bool:
        """Push trade closed notification to backend"""
        try:
            if not self.session:
                return False

            async with self.session.post(
                "/api/derivwebhook/trade/closed", json=trade_data
            ) as response:
                if response.status == 200:
                    self.logger.info(
                        f"Trade closed notification pushed: {trade_data.get('tradeId')}"
                    )
                    return True
                else:
                    self.logger.warning(
                        f"Failed to push trade closed: {response.status}"
                    )
                    return False

        except Exception as e:
            self.logger.error(f"Error pushing trade closed: {e}")
            return False

    async def push_portfolio_update(self, portfolio_data: Dict[str, Any]) -> bool:
        """Push portfolio update to backend"""
        try:
            if not self.session:
                return False

            async with self.session.post(
                "/api/derivwebhook/portfolio/update", json=portfolio_data
            ) as response:
                if response.status == 200:
                    self.logger.debug(
                        f"Portfolio update pushed: {portfolio_data.get('portfolioId')}"
                    )
                    return True
                else:
                    self.logger.warning(
                        f"Failed to push portfolio update: {response.status}"
                    )
                    return False

        except Exception as e:
            self.logger.error(f"Error pushing portfolio update: {e}")
            return False

    async def push_balance_update(
        self, investor_id: str, balance: float, currency: str = "USD"
    ) -> bool:
        """Push account balance update to backend"""
        try:
            if not self.session:
                return False

            data = {"investorId": investor_id, "balance": balance, "currency": currency}

            async with self.session.post(
                "/api/derivwebhook/balance", json=data
            ) as response:
                if response.status == 200:
                    self.logger.debug(
                        f"Balance update pushed: {investor_id} - {currency} {balance}"
                    )
                    return True
                else:
                    self.logger.warning(
                        f"Failed to push balance update: {response.status}"
                    )
                    return False

        except Exception as e:
            self.logger.error(f"Error pushing balance update: {e}")
            return False
