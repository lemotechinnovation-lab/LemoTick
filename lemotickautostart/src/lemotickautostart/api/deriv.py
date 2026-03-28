"""
Deriv API Client - High-level interface using simplified ConnectionManager + StreamManager
"""

import time
from typing import Optional, Callable

from lemotickautostart.config import Settings
from lemotickautostart.logger import setup_logger
from lemotickautostart.services.connection_manager import ConnectionManager
from lemotickautostart.services.stream_manager import StreamManager

logger = setup_logger(__name__)


class DerivClient:
    """High-level Deriv API client"""
    
    def __init__(self, settings: Settings):
        """Initialize Deriv client"""
        self.settings = settings
        self.connection = ConnectionManager(app_id=settings.deriv_app_id)
        self.stream_manager = StreamManager(self.connection)
        self.on_candle: Optional[Callable] = None
        self.authorized = False
        
        logger.info("DerivClient initialized")
    
    def connect(self):
        """Connect to Deriv API"""
        self.connection.connect()
        
        # Wait for connection
        timeout = 30
        start = time.time()
        while not self.connection.connected and (time.time() - start) < timeout:
            time.sleep(0.1)
        
        if not self.connection.connected:
            raise Exception("Failed to connect to Deriv API")
        
        logger.info("✅ Connected to Deriv API")
        
        # Authorize
        self._authorize()
    
    def _authorize(self):
        """Authorize with API token"""
        logger.info("🔐 Authorizing...")
        
        # Use a flag to track authorization
        self.authorized = False
        
        def auth_callback(response):
            if "error" in response:
                logger.error(f"Authorization failed: {response['error']}")
                return
            
            self.authorized = True
            logger.info("✅ Authorized successfully")
        
        self.connection.send(
            {"authorize": self.settings.deriv_api_token},
            auth_callback
        )
        
        # Wait for authorization
        import time
        timeout = 10
        start = time.time()
        while not self.authorized and (time.time() - start) < timeout:
            time.sleep(0.1)
    
    def subscribe_to_candles(self, symbol: str, timeframe: str):
        """Subscribe to real-time candles"""
        granularity = self._parse_timeframe(timeframe)
        
        def candle_callback(data):
            if self.on_candle:
                self.on_candle(data)
        
        self.stream_manager.subscribe(symbol, granularity, candle_callback)
        logger.info(f"✅ Subscribed to {symbol} {timeframe} candles")
    
    def place_trade(self, symbol: str, direction: str, stake: float, duration: int, on_executed=None) -> Optional[str]:
        """Place a trade"""
        contract_type = "CALL" if direction == "rise" else "PUT"
        
        proposal_request = {
            "proposal": 1,
            "amount": stake,
            "basis": "stake",
            "contract_type": contract_type,
            "currency": "USD",
            "duration": duration,
            "duration_unit": "m",
            "symbol": symbol,
        }
        
        trade_id = [None]  # Use list to allow modification in nested function
        
        def proposal_callback(response):
            if "error" in response:
                logger.error(f"Proposal failed: {response['error']}")
                return
            
            proposal_id = response.get("proposal", {}).get("id")
            price = response.get("proposal", {}).get("ask_price")
            
            if not proposal_id or not price:
                logger.error("Invalid proposal response")
                return
            
            buy_request = {
                "buy": proposal_id,
                "price": price
            }
            
            def buy_callback(buy_response):
                if "error" in buy_response:
                    logger.error(f"Buy failed: {buy_response['error']}")
                    return
                
                trade_id[0] = buy_response.get("buy", {}).get("contract_id")
                logger.info(f"💰 Trade executed: {trade_id[0]}")
                
                # Call the callback if provided
                if on_executed:
                    on_executed(trade_id[0])
            
            self.connection.send(buy_request, buy_callback)
        
        self.connection.send(proposal_request, proposal_callback)
        return trade_id[0]
    
    def get_open_trades(self) -> list:
        """Get all open trades"""
        open_trades = []
        response_received = [False]
        
        def portfolio_callback(response):
            if "error" in response:
                logger.error(f"Portfolio fetch failed: {response['error']}")
                response_received[0] = True
                return
            
            positions = response.get("portfolio", {}).get("positions", [])
            for position in positions:
                contract_id = position.get("contract_id")
                if contract_id:
                    open_trades.append(contract_id)
            
            response_received[0] = True
        
        self.connection.send({"portfolio": 1}, portfolio_callback)
        
        # Wait for response
        timeout = 5
        start = time.time()
        while not response_received[0] and (time.time() - start) < timeout:
            time.sleep(0.1)
        
        return open_trades
    
    def close_trade(self, trade_id: str) -> bool:
        """Close a trade"""
        close_result = [False]
        response_received = [False]
        
        def close_callback(response):
            if "error" in response:
                logger.error(f"Close  failed for {trade_id}: {response['error']}")
                close_result[0] = False
            else:
                sell_response = response.get("sell")
                if sell_response:
                    logger.info(f"✅ Trade closed: {trade_id}")
                    close_result[0] = True
                else:
                    logger.error(f"Close failed for {trade_id}: No sell response")
                    close_result[0] = False
            
            response_received[0] = True
        
        self.connection.send(
            {"sell": trade_id, "price": 0},
            close_callback
        )
        
        # Wait for response
        timeout = 5
        start = time.time()
        while not response_received[0] and (time.time() - start) < timeout:
            time.sleep(0.1)
        
        return close_result[0]
    
    def disconnect(self):
        """Disconnect from Deriv API"""
        self.connection.close()
        logger.info("Disconnected from Deriv API")
    
    def _parse_timeframe(self, timeframe: str) -> int:
        """Convert timeframe string to seconds"""
        timeframe = timeframe.lower().strip()
        
        if timeframe.endswith('m'):
            return int(timeframe[:-1]) * 60
        elif timeframe.endswith('h'):
            return int(timeframe[:-1]) * 3600
        elif timeframe.endswith('d'):
            return int(timeframe[:-1]) * 86400
        else:
            return 60
