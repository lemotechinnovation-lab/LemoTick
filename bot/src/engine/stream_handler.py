"""
WebSocket stream handler for Deriv API tick data.
Handles connection, authentication, tick streaming + proposal/buy/sell routing.
"""

import json
import ssl
import threading
import time
from typing import TYPE_CHECKING, Any, Callable, Dict, Optional, TypedDict, cast, final

try:
    from websocket import (
        WebSocketConnectionClosedException,
        create_connection,
    )
except ImportError:
    create_connection = None  # type: ignore
    WebSocketConnectionClosedException = Exception  # type: ignore

from infrastructure.config import config
from infrastructure.logger import logger
from infrastructure.metrics import get_metrics

# ---------------------------- TypedDict Models ----------------------------


class AuthData(TypedDict, total=False):
    client_id: str
    loginid: str
    user_id: str
    balance: float
    currency: str


class TickData(TypedDict, total=False):
    quote: Any
    epoch: Optional[int]
    symbol: Optional[str]


class ErrorData(TypedDict, total=False):
    code: str
    message: Optional[str]


class ProposalOpenContract(TypedDict, total=False):
    contract_id: Optional[int]
    id: Optional[int]


# =============================== STREAM HANDLER ===============================


@final
class StreamHandler:
    """Handles WebSocket connection and tick + trade message routing from Deriv."""

    def __init__(self, on_tick_callback: Callable[[float, int], None]) -> None:
        self.on_tick_callback = on_tick_callback

        self.ws: Optional[Any] = None
        self.is_running = False
        self.is_connected = False

        self.ws_url = f"{config.deriv_ws_url}?app_id={config.app_id}"
        self.api_token = config.api_token

        self.metrics = get_metrics()
        self._stop_event = threading.Event()

        self._connection_lock = threading.Lock()
        self._process_thread: Optional[threading.Thread] = None

        # Tick cache
        self._tick_lock = threading.Lock()
        self._latest_tick: Optional[float] = None

        # Timeouts
        self.last_ping_time = 0.0
        self.ping_interval = 30.0
        self._consecutive_timeouts = 0
        self._timeout_log_threshold = 5

        # Trade callbacks
        self._on_proposal: Optional[Callable[[Dict[str, Any]], None]] = None
        self._on_buy: Optional[Callable[[Dict[str, Any]], None]] = None
        self._on_sell: Optional[Callable[[Dict[str, Any]], None]] = None
        self._on_sell_error: Optional[Callable[[Dict[str, Any]], None]] = None
        self._on_contract_update: Optional[Callable[[Dict[str, Any]], None]] = None

        # Account info
        self.account_balance: Optional[float] = None
        self.account_currency: Optional[str] = None

    # ----------------------------------------------------------------------
    # Callback registration
    # ----------------------------------------------------------------------

    def register_trade_callbacks(
        self,
        on_proposal: Optional[Callable[[Dict[str, Any]], None]] = None,
        on_buy: Optional[Callable[[Dict[str, Any]], None]] = None,
        on_sell: Optional[Callable[[Dict[str, Any]], None]] = None,
        on_sell_error: Optional[Callable[[Dict[str, Any]], None]] = None,
        on_contract_update: Optional[Callable[[Dict[str, Any]], None]] = None,
    ) -> None:
        self._on_proposal = on_proposal
        self._on_buy = on_buy
        self._on_sell = on_sell
        self._on_sell_error = on_sell_error
        self._on_contract_update = on_contract_update

    # ----------------------------------------------------------------------
    # WebSocket Connection
    # ----------------------------------------------------------------------

    def connect(self) -> bool:
        """Open WS + authenticate + subscribe to ticks."""
        try:
            with self._connection_lock:
                if create_connection is None:
                    logger.error("websocket.create_connection unavailable")
                    return False

                logger.info(f"Connecting to Deriv WebSocket: {self.ws_url}")

                self.ws = create_connection(
                    self.ws_url, sslopt={"cert_reqs": ssl.CERT_NONE}
                )

                # Authorize
                self.ws.send(json.dumps({"authorize": self.api_token}))
                auth = self._receive_message(timeout=10)

                if not auth or "error" in auth:
                    logger.error(f"Auth failed: {auth}")
                    return False

                raw_auth: Dict[str, Any] = auth.get("authorize", {}) or {}

                # Pyright-safe TypedDict cast
                auth_data: AuthData = cast(AuthData, cast(object, raw_auth))

                client_id = (
                    auth_data.get("client_id")
                    or auth_data.get("loginid")
                    or auth_data.get("user_id")
                    or "unknown"
                )

                bal = auth_data.get("balance")
                cur = auth_data.get("currency") or "USD"

                if bal is not None:
                    logger.info(
                        f"Authenticated: {auth_data.get('loginid')} Balance {cur} {bal}"
                    )
                    self.metrics.update_equity(float(bal))

                self.account_balance = float(bal) if bal is not None else None
                self.account_currency = cur or "USD"

                # Subscribe to ticks
                self.ws.send(json.dumps({"ticks": config.symbol}))
                sub_resp = self._receive_message(timeout=5)

                if sub_resp and "error" in sub_resp:
                    logger.error(f"Tick subscribe failed: {sub_resp['error']}")
                    return False

                logger.info(f"Subscribed to ticks: {config.symbol}")

                self.is_connected = True
                self.metrics.update_websocket_status(True)
                self.last_ping_time = time.time()

                return True

        except Exception as e:
            logger.error(f"Connection failed: {e}")
            return False

    # ----------------------------------------------------------------------

    def disconnect(self) -> None:
        with self._connection_lock:
            if self.ws:
                try:
                    self.ws.close()
                except Exception:
                    pass
            self.ws = None
            self.is_connected = False
            self.metrics.update_websocket_status(False)

    # ----------------------------------------------------------------------

    def start(self) -> None:
        if self.is_running:
            return

        self.is_running = True
        self._stop_event.clear()

        self.connect()

        self._process_thread = threading.Thread(
            target=self._process_messages, daemon=True
        )
        self._process_thread.start()

    # ----------------------------------------------------------------------

    def stop(self) -> None:
        self.is_running = False
        self._stop_event.set()

        if self._process_thread:
            self._process_thread.join(timeout=5)

        self.disconnect()

    # ----------------------------------------------------------------------
    # Message loop
    # ----------------------------------------------------------------------

    def _process_messages(self) -> None:
        while self.is_running and not self._stop_event.is_set():
            if not self.is_connected:
                time.sleep(1)
                self.connect()
                continue

            if time.time() - self.last_ping_time > self.ping_interval:
                self._send_ping()

            msg = self._receive_message(timeout=1.0)
            if msg:
                self._handle_message(msg)

    # ----------------------------------------------------------------------
    # Receiving
    # ----------------------------------------------------------------------

    def _receive_message(self, timeout: float = 1.0) -> Optional[Dict[str, Any]]:
        try:
            if not self.ws:
                return None

            try:
                self.ws.settimeout(timeout)
            except Exception:
                pass

            raw = self.ws.recv()
            if not raw:
                return None

            self._consecutive_timeouts = 0
            msg = json.loads(raw)
            return msg if isinstance(msg, dict) else None

        except WebSocketConnectionClosedException:
            self.is_connected = False
        except Exception as e:
            if "timed" in str(e).lower():
                self._consecutive_timeouts += 1
                if self._consecutive_timeouts >= self._timeout_log_threshold:
                    logger.warning(f"Receive timeout x{self._consecutive_timeouts}")
                return None
            logger.warning(f"Error receiving WS msg: {e}")
            self.is_connected = False

        return None

    # ----------------------------------------------------------------------
    # Sending
    # ----------------------------------------------------------------------

    def _send_ping(self) -> None:
        if not self.ws:
            return
        try:
            self.ws.send(json.dumps({"ping": 1}))
            self.last_ping_time = time.time()
        except Exception:
            self.is_connected = False

    # ----------------------------------------------------------------------
    # MAIN ROUTER — handles ALL Deriv messages
    # ----------------------------------------------------------------------

    def _handle_message(self, message: Dict[str, Any]) -> None:
        try:
            # ======================= TICK =======================
            if "tick" in message:
                tick_raw = message.get("tick", {}) or {}
                tick: TickData = cast(TickData, tick_raw)

                quote = tick.get("quote")
                epoch = tick.get("epoch")

                if quote is not None:
                    try:
                        price = float(quote)
                        ts = int(epoch) if epoch else int(time.time())
                        with self._tick_lock:
                            self._latest_tick = price
                        self.on_tick_callback(price, ts)
                    except Exception as e:
                        logger.warning(f"Bad tick data: {e}")

                # ⚠ DO NOT RETURN — proposal/buy messages may be in same packet

            # ===================== PROPOSAL =====================
            if message.get("msg_type") == "proposal" or "proposal" in message:
                if self._on_proposal:
                    self._on_proposal(dict(message))

            # ======================= BUY ========================
            if message.get("msg_type") == "buy" or "buy" in message:
                if self._on_buy:
                    self._on_buy(dict(message))

            # ======================= SELL =======================
            if message.get("msg_type") == "sell" or "sell" in message:
                if self._on_sell:
                    self._on_sell(dict(message))

            # =================== SELL ERROR =====================
            if "error" in message:
                err = message.get("error")
                if err and isinstance(err, dict):
                    code = err.get("code")
                    if code in ("InvalidOfferings", "InvalidSellContractProposal"):
                        if self._on_sell_error:
                            self._on_sell_error(dict(message))

            # ========== PROPOSAL OPEN CONTRACT UPDATE ==========
            if "proposal_open_contract" in message:
                poc_raw = message.get("proposal_open_contract", {}) or {}
                poc: ProposalOpenContract = cast(ProposalOpenContract, poc_raw)
                if self._on_contract_update:
                    self._on_contract_update(dict(poc))

        except Exception as e:
            logger.error(f"Message routing error: {e}")

    # ----------------------------------------------------------------------
    # Helpers
    # ----------------------------------------------------------------------

    def send_message(self, payload: Dict[str, Any]) -> bool:
        try:
            if self.ws and self.is_connected:
                self.ws.send(json.dumps(payload))
                return True
            logger.warning("Cannot send WS message: disconnected")
            return False
        except Exception as e:
            logger.error(f"WS send error: {e}")
            self.is_connected = False
            return False

    # ----------------------------------------------------------------------

    def get_latest_tick(self, symbol: str) -> Optional[float]:
        with self._tick_lock:
            return self._latest_tick
