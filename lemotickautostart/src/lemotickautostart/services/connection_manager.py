"""
Connection Manager for Deriv API WebSocket
Simplified version matching admin-dashboard architecture
"""

import json
import threading
import time
import websocket
from typing import Callable, Dict, Optional, Any

from lemotickautostart.logger import setup_logger

logger = setup_logger(__name__)


class ConnectionManager:
    """
    Manages WebSocket connection to Deriv API
    
    Features:
    - Auto reconnect
    - Request/response matching with req_id
    - Event emission for different message types
    - Ping/pong keep-alive
    """
    
    EVENT_CONNECTION_OPEN = "connection_open"
    EVENT_CONNECTION_CLOSE = "connection_close"
    
    def __init__(self, app_id: str = "1089", endpoint: str = "wss://ws.derivws.com/websockets/v3"):
        """Initialize ConnectionManager"""
        self.url = f"{endpoint}?app_id={app_id}"
        self.ws: Optional[websocket.WebSocketApp] = None
        self.req_id = 1
        self.pending_requests: Dict[int, Callable] = {}
        self.listeners: Dict[str, list] = {}
        self.connected = False
        self.reconnect_delay = 3
        self._ping_thread: Optional[threading.Thread] = None
        
        logger.info(f"ConnectionManager initialized: {self.url}")
    
    def connect(self):
        """Connect to Deriv WebSocket"""
        def on_open(ws):
            logger.info("✅ Connected to Deriv")
            self.connected = True
            self._emit(self.EVENT_CONNECTION_OPEN)
        
        def on_close(ws, *args):
            logger.warning("❌ WebSocket closed")
            self.connected = False
            self._emit(self.EVENT_CONNECTION_CLOSE)
            time.sleep(self.reconnect_delay)
            logger.info("🔁 Reconnecting...")
            self.connect()
        
        def on_message(ws, message):
            try:
                data = json.loads(message)
                
                # Emit by message type
                msg_type = data.get("msg_type")
                if msg_type:
                    self._emit(msg_type, data)
                
                # Handle response to pending request
                req_id = data.get("req_id")
                if req_id and req_id in self.pending_requests:
                    callback = self.pending_requests.pop(req_id)
                    callback(data)
            except json.JSONDecodeError:
                logger.error(f"Failed to decode message: {message}")
            except Exception as e:
                logger.error(f"Error handling message: {e}", exc_info=True)
        
        def on_error(ws, error):
            logger.error(f"❌ WebSocket error: {error}")
        
        try:
            self.ws = websocket.WebSocketApp(
                self.url,
                on_open=on_open,
                on_close=on_close,
                on_message=on_message,
                on_error=on_error
            )
            
            # Run in background thread
            thread = threading.Thread(target=self.ws.run_forever, daemon=True)
            thread.start()
            
            self._start_ping()
        
        except Exception as e:
            logger.error(f"Error connecting: {e}", exc_info=True)
    
    def send(self, payload: Dict[str, Any], callback: Optional[Callable] = None):
        """Send request with optional callback"""
        payload["req_id"] = self.req_id
        
        if callback:
            self.pending_requests[self.req_id] = callback
        
        self.req_id += 1
        
        if self.ws:
            try:
                self.ws.send(json.dumps(payload))
            except Exception as e:
                logger.error(f"Error sending request: {e}")
    
    def on(self, event: str, callback: Callable):
        """Register event listener"""
        if event not in self.listeners:
            self.listeners[event] = []
        self.listeners[event].append(callback)
    
    def _emit(self, event: str, data: Optional[Dict[str, Any]] = None):
        """Emit event to all listeners"""
        if event not in self.listeners:
            return
        
        for cb in self.listeners[event]:
            try:
                if data:
                    cb(data)
                else:
                    cb()
            except Exception as e:
                logger.error(f"Error in event callback: {e}", exc_info=True)
    
    def _start_ping(self):
        """Start ping keep-alive"""
        def ping_loop():
            while True:
                if self.connected:
                    try:
                        self.send({"ping": 1})
                    except Exception as e:
                        logger.debug(f"Ping error: {e}")
                time.sleep(15)
        
        self._ping_thread = threading.Thread(target=ping_loop, daemon=True)
        self._ping_thread.start()
    
    def close(self):
        """Close connection"""
        try:
            if self.ws:
                self.ws.close()
            logger.info("ConnectionManager closed")
        except Exception as e:
            logger.error(f"Error closing connection: {e}")
