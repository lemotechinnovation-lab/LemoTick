"""
WebSocket stream handler for Deriv API tick data.
Manages connection, authentication, and tick data streaming.
"""

import json
import time
import threading
from typing import Callable, Optional, Dict, Any
from websocket import create_connection, WebSocketConnectionClosedException
from .config import config
from .logger import logger
from .metrics import get_metrics


class StreamHandler:
    """Handles WebSocket connection and tick streaming from Deriv API."""

    def __init__(self, on_tick_callback: Callable[[float, int], None]):
        """
        Initialize stream handler.

        Args:
            on_tick_callback: Function to call when new tick data is received
        """
        self.on_tick_callback = on_tick_callback
        self.ws: Optional[Any] = None
        self.is_connected = False
        self.is_running = False
        self.reconnect_attempts = 0
        self.max_reconnect_attempts = 10
        self.reconnect_delay = 1.0
        self.last_ping_time = 0
        self.ping_interval = 30  # seconds

        # Connection parameters
        self.ws_url = f"{config.deriv_ws_url}?app_id={config.app_id}"
        self.api_token = config.api_token
        self.symbol = config.symbol
        self.metrics = get_metrics()

        # Threading
        self._stop_event = threading.Event()
        self._connection_lock = threading.Lock()
        
        # Latest tick tracking for signal revalidation
        self._latest_tick = None
        self._tick_lock = threading.Lock()

        # Optional trade message callbacks (registered by TradeExecutor)
        self._on_proposal: Optional[Callable[[Dict[str, Any]], None]] = None
        self._on_buy: Optional[Callable[[Dict[str, Any]], None]] = None
        self._on_contract_update: Optional[Callable[[Dict[str, Any]], None]] = None

    def register_trade_callbacks(
        self,
        on_proposal: Optional[Callable[[Dict[str, Any]], None]] = None,
        on_buy: Optional[Callable[[Dict[str, Any]], None]] = None,
        on_contract_update: Optional[Callable[[Dict[str, Any]], None]] = None,
    ) -> None:
        """Register callbacks for trade-related messages."""
        self._on_proposal = on_proposal
        self._on_buy = on_buy
        self._on_contract_update = on_contract_update

    def connect(self) -> bool:
        """
        Establish WebSocket connection to Deriv API.

        Returns:
            True if connection successful, False otherwise
        """
        try:
            with self._connection_lock:
                logger.info(f"Connecting to Deriv WebSocket: {self.ws_url}")

                # Create connection with SSL context that ignores certificate verification
                import ssl
                ssl_context = ssl.create_default_context()
                ssl_context.check_hostname = False
                ssl_context.verify_mode = ssl.CERT_NONE
                
                self.ws = create_connection(self.ws_url, sslopt={"cert_reqs": ssl.CERT_NONE})

                # Authenticate
                auth_payload = {"authorize": self.api_token}
                self.ws.send(json.dumps(auth_payload))

                # Wait for authentication response
                response = self._receive_message(timeout=10)
                if not response:
                    logger.error("No response to authentication request")
                    return False

                if "error" in response:
                    logger.error(f"Authentication failed: {response['error']}")
                    return False

                auth_data = response.get("authorize", {})
                # Try multiple possible fields for client ID
                client_id = (auth_data.get("client_id") or 
                           auth_data.get("loginid") or 
                           auth_data.get("user_id") or 
                           "unknown")
                logger.info(f"Successfully authenticated. Client ID: {client_id}")

                # Subscribe to ticks
                subscribe_payload = {"ticks": self.symbol}
                self.ws.send(json.dumps(subscribe_payload))

                # Wait for subscription confirmation
                sub_response = self._receive_message(timeout=5)
                if sub_response and "error" in sub_response:
                    logger.error(f"Subscription failed: {sub_response['error']}")
                    return False

                logger.info(f"Successfully subscribed to ticks for {self.symbol}")

                self.is_connected = True
                try:
                    self.metrics.update_websocket_status(True)
                except Exception:
                    pass
                self.reconnect_attempts = 0
                self.last_ping_time = time.time()

                return True

        except Exception as e:
            logger.error(f"Connection failed: {e}")
            return False

    def disconnect(self) -> None:
        """Close WebSocket connection."""
        with self._connection_lock:
            if self.ws:
                try:
                    self.ws.close()
                except Exception as e:
                    logger.warning(f"Error closing WebSocket: {e}")
                finally:
                    self.ws = None
                    self.is_connected = False
                    try:
                        self.metrics.update_websocket_status(False)
                    except Exception:
                        pass

    def start(self) -> None:
        """Start the stream handler."""
        if self.is_running:
            logger.warning("Stream handler already running")
            return

        self.is_running = True
        self._stop_event.clear()

        if not self.connect():
            logger.error("Failed to establish initial connection")
            return

        # Start message processing thread
        self._process_thread = threading.Thread(
            target=self._process_messages, daemon=True
        )
        self._process_thread.start()

        logger.info("Stream handler started")

    def stop(self) -> None:
        """Stop the stream handler."""
        if not self.is_running:
            return

        logger.info("Stopping stream handler...")
        self.is_running = False
        self._stop_event.set()

        # Wait for processing thread to finish
        if hasattr(self, "_process_thread") and self._process_thread.is_alive():
            self._process_thread.join(timeout=5)

        self.disconnect()
        logger.info("Stream handler stopped")

    def _process_messages(self) -> None:
        """Process incoming WebSocket messages."""
        while self.is_running and not self._stop_event.is_set():
            try:
                if not self.is_connected:
                    self._attempt_reconnect()
                    continue

                # Check for ping timeout
                if time.time() - self.last_ping_time > self.ping_interval:
                    self._send_ping()

                # Receive message with timeout
                message = self._receive_message(timeout=1.0)
                if message:
                    self._handle_message(message)

            except Exception as e:
                logger.error(f"Error processing messages: {e}")
                self.is_connected = False
                time.sleep(1)

    def _attempt_reconnect(self) -> None:
        """Attempt to reconnect to WebSocket."""
        if self.reconnect_attempts >= self.max_reconnect_attempts:
            logger.error("Max reconnection attempts reached. Stopping stream handler.")
            self.stop()
            return

        self.reconnect_attempts += 1
        delay = min(self.reconnect_delay * (2**self.reconnect_attempts), 60)

        logger.info(
            f"Attempting to reconnect ({self.reconnect_attempts}/{self.max_reconnect_attempts}) in {delay}s"
        )
        time.sleep(delay)

        if self.connect():
            logger.info("Reconnection successful")
            try:
                self.metrics.record_websocket_reconnect()
            except Exception:
                pass
        else:
            logger.warning(f"Reconnection attempt {self.reconnect_attempts} failed")

    def _receive_message(self, timeout: float = 1.0) -> Optional[Dict[str, Any]]:
        """
        Receive message from WebSocket with timeout.

        Args:
            timeout: Timeout in seconds

        Returns:
            Parsed message dictionary or None
        """
        try:
            self.ws.settimeout(timeout)
            raw_message = self.ws.recv()

            if raw_message:
                return json.loads(raw_message)

        except WebSocketConnectionClosedException:
            logger.warning("WebSocket connection closed")
            self.is_connected = False
        except Exception as e:
            # Only log non-timeout errors
            if "timeout" not in str(e).lower() and "timed out" not in str(e).lower():
                logger.warning(f"Error receiving message: {e}")
            # Don't mark as disconnected for timeout errors - this is normal

        return None

    def _send_ping(self) -> None:
        """Send ping to keep connection alive."""
        try:
            if self.ws:
                ping_payload = {"ping": 1}
                self.ws.send(json.dumps(ping_payload))
                self.last_ping_time = time.time()
        except Exception as e:
            logger.warning(f"Failed to send ping: {e}")
            self.is_connected = False

    def _handle_message(self, message: Dict[str, Any]) -> None:
        """
        Handle incoming WebSocket message.

        Args:
            message: Parsed message dictionary
        """
        try:
            # Handle tick data
            if "tick" in message:
                tick_data = message["tick"]
                quote = tick_data.get("quote")
                epoch = tick_data.get("epoch")

                if quote is not None:
                    try:
                        price = float(quote)
                        # Store latest tick for signal revalidation
                        with self._tick_lock:
                            self._latest_tick = price
                        self.on_tick_callback(price, epoch or int(time.time()))
                    except (ValueError, TypeError) as e:
                        logger.warning(f"Invalid tick data: {e}")

            # Handle ping response
            elif "pong" in message:
                logger.debug("Received pong")
            
            # Handle ping messages from server
            elif message.get("msg_type") == "ping":
                logger.debug("Ping received from server, ignoring.")
                return

            # Handle error messages
            elif "error" in message:
                error_data = message["error"]
                logger.error(f"API Error: {error_data}")

                # Handle specific error types
                if error_data.get("code") == "InvalidToken":
                    logger.error("Invalid API token. Please check your credentials.")
                    self.stop()

            # Handle proposal responses (for trade execution)
            elif "proposal" in message:
                # Forward proposal responses to executor if registered
                logger.debug("Received proposal response")
                if self._on_proposal:
                    try:
                        self._on_proposal(message.get("proposal", {}))
                    except Exception as e:
                        logger.warning(f"Proposal callback error: {e}")

            # Handle buy responses
            elif "buy" in message:
                # Forward buy responses to executor if registered
                logger.debug("Received buy response")
                if self._on_buy:
                    try:
                        self._on_buy(message)
                    except Exception as e:
                        logger.warning(f"Buy callback error: {e}")

            # Contract updates
            elif message.get("msg_type") == "proposal_open_contract":
                if self._on_contract_update:
                    try:
                        self._on_contract_update(message.get("proposal_open_contract", {}))
                    except Exception as e:
                        logger.warning(f"Contract update callback error: {e}")

            # Log unknown message types (but don't spam for ping messages)
            else:
                msg_type = message.get("msg_type", "unknown")
                if msg_type not in ["ping", "pong"]:
                    logger.debug(f"Unknown message type: {list(message.keys())}")
                else:
                    logger.debug(f"Received {msg_type} message from server")

        except Exception as e:
            logger.error(f"Error handling message: {e}")

    def send_message(self, message: Dict[str, Any]) -> bool:
        """
        Send message to WebSocket.

        Args:
            message: Message dictionary to send

        Returns:
            True if message sent successfully, False otherwise
        """
        try:
            if self.ws and self.is_connected:
                self.ws.send(json.dumps(message))
                return True
            else:
                logger.warning("Cannot send message: WebSocket not connected")
                return False
        except Exception as e:
            logger.error(f"Failed to send message: {e}")
            self.is_connected = False
            return False

    def get_connection_status(self) -> Dict[str, Any]:
        """
        Get current connection status.

        Returns:
            Status dictionary
        """
        return {
            "is_connected": self.is_connected,
            "is_running": self.is_running,
            "reconnect_attempts": self.reconnect_attempts,
            "symbol": self.symbol,
            "last_ping": self.last_ping_time,
        }

    def get_latest_tick(self, symbol: str) -> Optional[float]:
        """
        Get the latest tick price for signal revalidation.
        
        Args:
            symbol: Symbol to get tick for (for future multi-symbol support)
            
        Returns:
            Latest tick price or None if not available
        """
        with self._tick_lock:
            return self._latest_tick
