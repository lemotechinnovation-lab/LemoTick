"""
Stream Manager for real-time Deriv API data streaming
Simplified version matching admin-dashboard architecture
"""

from typing import Callable, Dict, Optional, Any

from lemotickautostart.logger import setup_logger

logger = setup_logger(__name__)


class Stream:
    """Manages callbacks for a single stream"""
    
    def __init__(self):
        self.callbacks = []
    
    def subscribe(self, callback: Callable):
        """Add a callback to the stream"""
        self.callbacks.append(callback)
    
    def unsubscribe(self, callback: Callable):
        """Remove a callback from the stream"""
        self.callbacks = [c for c in self.callbacks if c != callback]
    
    def emit(self, data: Dict[str, Any]):
        """Emit data to all subscribers"""
        for cb in self.callbacks:
            try:
                cb(data)
            except Exception as e:
                logger.error(f"Error in stream callback: {e}")


class StreamManager:
    """
    Manages real-time data streams from Deriv API
    
    Features:
    - Multiple symbol streams
    - 5000 candle cache
    - Live OHLC updates
    - Subscribe/unsubscribe
    """
    
    MAX_CACHE = 5000
    
    def __init__(self, connection):
        """
        Initialize StreamManager
        
        Args:
            connection: ConnectionManager instance
        """
        self.connection = connection
        self.streams: Dict[str, Stream] = {}
        self.stream_ids: Dict[str, Optional[str]] = {}
        self.tick_cache: Dict[str, Dict[str, Any]] = {}
        
        # Listen for tick and ohlc messages
        connection.on("tick", self._on_tick)
        connection.on("ohlc", self._on_tick)
        
        logger.info("StreamManager initialized")
    
    def _get_key(self, symbol: str, granularity: int) -> str:
        """Generate cache key for stream"""
        return f"{symbol}-{granularity}"
    
    def subscribe(self, symbol: str, granularity: int, callback: Callable):
        """
        Subscribe to a stream
        
        Args:
            symbol: Trading symbol (e.g., 'R_50')
            granularity: Timeframe in seconds (60 for 1m)
            callback: Function to call with data
        """
        key = self._get_key(symbol, granularity)
        
        # Create stream if not exists
        if key not in self.streams:
            stream = Stream()
            self.streams[key] = stream
            self._create_stream(symbol, granularity)
        
        # Subscribe to stream
        self.streams[key].subscribe(callback)
        
        logger.info(f"Subscribed to {symbol} {granularity}s")
    
    def _create_stream(self, symbol: str, granularity: int):
        """Create and subscribe to a new stream"""
        key = self._get_key(symbol, granularity)
        
        request = {
            "ticks_history": symbol,
            "style": "candles",
            "granularity": granularity,
            "count": 100,
            "end": "latest",
            "adjust_start_time": 1,
            "subscribe": 1
        }
        
        def history_callback(response):
            """Handle initial history response"""
            logger.info(f"StreamManager history_callback received: {list(response.keys())}")
            
            if "error" in response:
                logger.error(f"Subscription error: {response['error']}")
                return
            
            self.tick_cache[key] = response
            
            # Store stream ID for later
            if "subscription" in response:
                self.stream_ids[key] = response["subscription"].get("id")
            
            candles_count = len(response.get('candles', []))
            logger.info(f"StreamManager: Received {candles_count} candles")
            
            # Emit to subscribers
            if key in self.streams:
                self.streams[key].emit(response)
        
        self.connection.send(request, history_callback)
    
    def _on_tick(self, data: Dict[str, Any]):
        """Handle incoming tick/ohlc data"""
        try:
            echo = data.get("echo_req", {})
            symbol = echo.get("ticks_history")
            granularity = echo.get("granularity")
            
            if not symbol or not granularity:
                return
            
            key = self._get_key(symbol, granularity)
            
            if key not in self.streams:
                return
            
            # Get cache
            cache = self.tick_cache.get(key)
            if not cache:
                return
            
            # Update cache with new OHLC
            if "ohlc" in data:
                candles = cache.get("candles", [])
                candle = {
                    "open": float(data["ohlc"]["open"]),
                    "high": float(data["ohlc"]["high"]),
                    "low": float(data["ohlc"]["low"]),
                    "close": float(data["ohlc"]["close"]),
                    "epoch": data["ohlc"]["open_time"]
                }
                
                # Update last candle or add new one
                if candles and candles[-1]["epoch"] == candle["epoch"]:
                    candles[-1] = candle
                else:
                    candles.append(candle)
                    if len(candles) > self.MAX_CACHE:
                        candles.pop(0)
                
                cache["candles"] = candles
            
            # Emit to subscribers
            self.streams[key].emit(data)
        
        except Exception as e:
            logger.error(f"Error handling tick: {e}", exc_info=True)
    
    def unsubscribe(self, symbol: str, granularity: int, callback: Callable):
        """Unsubscribe from a stream"""
        key = self._get_key(symbol, granularity)
        
        if key in self.streams:
            self.streams[key].unsubscribe(callback)
