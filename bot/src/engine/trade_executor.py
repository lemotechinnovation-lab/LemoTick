# trade_executor.py
"""
TradeExecutor
--------------
Responsible for:
  - preparing proposals
  - sending proposal -> receiving proposal responses
  - placing buys (market entries)
  - early sell (market exit)
  - tracking open contracts and mapping responses from StreamHandler callbacks
Integrates with: stream_handler.StreamHandler
"""

import asyncio
import time
import uuid
from dataclasses import dataclass
from typing import Any, Callable, Dict, Optional, TypedDict, Union

from infrastructure.logger import logger  # your logger instance
from infrastructure.metrics import get_metrics


class ProposalData(TypedDict, total=False):
    id: str
    price: float
    req_id: str


class BuyData(TypedDict, total=False):
    contract_id: int
    buy_price: float
    price: float
    id: int


class SellData(TypedDict, total=False):
    sell_price: float
    price: float


# Simple container for trade results
@dataclass
class TradeResult:
    success: bool
    reason: str = ""
    contract_id: Optional[int] = None
    buy_price: Optional[float] = None
    sell_price: Optional[float] = None
    raw_response: Optional[Dict[str, Any]] = None


class TradeExecutor:
    """
    Orchestrates trade lifecycle via StreamHandler.

    Usage:
        executor = TradeExecutor(stream_handler)
        await executor.buy_market(symbol, amount, duration, barrier=None)
        await executor.sell_at_market(contract_id)
    """

    def __init__(self, stream_handler):
        self.stream = stream_handler
        self.metrics = get_metrics()
        self._pending_proposals_payloads: Dict[str, Dict[str, Any]] = {}
        self._pending_proposals: Dict[str, asyncio.Future[Dict[str, Any]]] = {}
        self._pending_buys: Dict[str, asyncio.Future[Dict[str, Any]]] = {}
        self._pending_sells: Dict[str, asyncio.Future[Dict[str, Any]]] = {}

        self._open_contracts: Dict[
            int, Dict[str, Any]
        ] = {}  # contract_id -> contract data

        # Register callbacks on stream handler
        self.stream.register_trade_callbacks(
            on_proposal=self._on_proposal,
            on_buy=self._on_buy,
            on_sell=self._on_sell,
            on_sell_error=self._on_sell_error,
            on_contract_update=self._on_contract_update,
        )

        # local asyncio loop
        try:
            self._loop = asyncio.get_running_loop()
        except RuntimeError:
            self._loop = asyncio.new_event_loop()
            asyncio.set_event_loop(self._loop)

        logger.info("TradeExecutor initialized")

    # -----------------------
    # Public API
    # -----------------------
    async def buy_market(
        self,
        symbol: str,
        amount: float,
        duration: int,
        contract_type: str = "buy",
        currency: Optional[str] = None,
        **extra,
    ) -> TradeResult:
        """
        Place a market BUY (entry) using Deriv's proposal -> buy flow.
        Returns TradeResult.
        """
        correlation_id = str(uuid.uuid4())
        fut = self._loop.create_future()
        self._pending_proposals[correlation_id] = fut

        proposal_payload = self._build_proposal_payload(
            symbol, amount, duration, contract_type, correlation_id, currency, **extra
        )

        self._pending_proposals_payloads[correlation_id] = dict(proposal_payload)

        logger.info(
            f"[EXECUTOR] Sending proposal ({correlation_id}) for {symbol} amount={amount}"
        )
        sent = self.stream.send_message(proposal_payload)
        if not sent:
            # cleanup
            fut.cancel()
            self._pending_proposals.pop(correlation_id, None)
            self._pending_proposals_payloads.pop(correlation_id, None)
            return TradeResult(
                success=False, reason="Failed to send proposal (WS disconnected)"
            )

        try:
            # Increase timeout to 8-10s to tolerate network latency
            proposal_resp = await asyncio.wait_for(fut, timeout=10.0)
        except asyncio.TimeoutError:
            self._pending_proposals.pop(correlation_id, None)
            self._pending_proposals_payloads.pop(correlation_id, None)
            logger.warning(
                "[EXECUTOR] Proposal timed out - no response received. "
                "Saved payload removed."
            )
            return TradeResult(success=False, reason="Proposal timed out")

        # defensive: ensure proposal_resp is a dict
        if not isinstance(proposal_resp, dict):
            logger.warning("[EXECUTOR] Proposal response not dict, ignoring")
            return TradeResult(success=False, reason="Invalid proposal response type")

        # Check for errors in proposal response (only reject if error is meaningful)
        if proposal_resp.get("error") not in (None, {}, ""):
            logger.warning(f"[EXECUTOR] Proposal response error: {proposal_resp}")
            return TradeResult(
                success=False, reason=f"Proposal error: {proposal_resp.get('error')}"
            )

        # Proposal valid — now place buy
        buy_correlation = str(uuid.uuid4())
        buy_fut = self._loop.create_future()
        self._pending_buys[buy_correlation] = buy_fut

        buy_payload = self._build_buy_payload(proposal_resp, buy_correlation)
        logger.info(f"[EXECUTOR] Sending buy ({buy_correlation})")
        sent = self.stream.send_message(buy_payload)
        if not sent:
            buy_fut.cancel()
            self._pending_buys.pop(buy_correlation, None)
            return TradeResult(
                success=False, reason="Failed to send buy (WS disconnected)"
            )

        try:
            # Slightly longer buy wait (server may take extra time)
            buy_resp = await asyncio.wait_for(buy_fut, timeout=10.0)
        except asyncio.TimeoutError:
            self._pending_buys.pop(buy_correlation, None)
            logger.warning("[EXECUTOR] Buy timed out")
            return TradeResult(success=False, reason="Buy timed out")

        # Process buy response
        if buy_resp.get("error") not in (None, {}, ""):
            logger.warning(f"[EXECUTOR] Buy response error: {buy_resp}")
            return TradeResult(
                success=False, reason=f"Buy error: {buy_resp.get('error')}"
            )

        contract_id = self._extract_contract_id_from_buy(buy_resp)
        buy_price = self._extract_buy_price(buy_resp)

        # store open contract metadata
        if contract_id is not None:
            self._open_contracts[contract_id] = {
                "contract_id": contract_id,
                "buy_resp": buy_resp,
                "symbol": symbol,
                "amount": amount,
                "buy_price": buy_price,
                "timestamp": time.time(),
            }

        logger.info(
            f"[EXECUTOR] Buy successful. Contract ID: {contract_id}, price: {buy_price}"
        )
        return TradeResult(
            success=True,
            contract_id=contract_id,
            buy_price=buy_price,
            raw_response=buy_resp,
        )

    async def sell_at_market(
        self, contract_id: int, price_limit: Optional[float] = None
    ) -> TradeResult:
        """
        Attempt early sell (market). Returns TradeResult.
        """
        if contract_id not in self._open_contracts:
            msg = f"Unknown contract {contract_id}"
            logger.warning("[EXECUTOR] " + msg)
            return TradeResult(success=False, reason=msg)

        correlation = str(uuid.uuid4())
        fut = self._loop.create_future()
        self._pending_sells[correlation] = fut

        sell_payload = {
            "sell": contract_id,
            "price": price_limit if price_limit is not None else 0,
            "command": "sell",
            "req_id": correlation,
        }

        logger.info(
            f"[EXECUTOR] Sending sell request for contract {contract_id} (corr={correlation})"
        )
        sent = self.stream.send_message(sell_payload)
        if not sent:
            fut.cancel()
            self._pending_sells.pop(correlation, None)
            return TradeResult(
                success=False, reason="Failed to send sell (WS disconnected)"
            )

        try:
            sell_resp = await asyncio.wait_for(fut, timeout=5.0)
        except asyncio.TimeoutError:
            self._pending_sells.pop(correlation, None)
            logger.warning("[EXECUTOR] Sell timed out")
            return TradeResult(success=False, reason="Sell timed out")

        if sell_resp.get("error"):
            logger.warning(f"[EXECUTOR] Sell response error: {sell_resp}")
            # Mark contract as not sellable if appropriate
            return TradeResult(
                success=False,
                reason=f"Sell error: {sell_resp.get('error')}",
                raw_response=sell_resp,
            )

        sell_price = self._extract_sell_price(sell_resp)
        # Remove from open contracts if sold
        if contract_id in self._open_contracts:
            self._open_contracts.pop(contract_id, None)

        logger.info(
            f"[EXECUTOR] Sell successful contract {contract_id} sold at {sell_price}"
        )
        return TradeResult(
            success=True,
            contract_id=contract_id,
            sell_price=sell_price,
            raw_response=sell_resp,
        )

    # -----------------------
    # Internal helpers
    # -----------------------

    def _build_proposal_payload(
        self,
        symbol: str,
        amount: float,
        duration: int,
        contract_type: str,
        currency: str,
        **extra: Any,
    ) -> Dict[str, Any]:
        # STEP 1: Capture UUID object first
        uid = uuid.uuid4()

        # STEP 2: Extract integer property from UUID (Pyright now recognizes it)
        uid_int: int = uid.int

        # STEP 3: Make safe 31-bit req_id
        req_id: int = uid_int & 0x7FFFFFFF

        payload: Dict[str, Any] = {
            "proposal": 1,
            "symbol": symbol,
            "amount": float(amount),
            "basis": "stake",
            "contract_type": contract_type.upper(),
            "duration": int(duration),
            "currency": currency or "USD",
            "req_id": req_id,
        }

        payload.update(extra)
        return payload

    def _build_buy_payload(
        self, proposal_resp: Dict[str, Any], buy_correlation: str
    ) -> Dict[str, Any]:
        proposal: ProposalData = proposal_resp.get("proposal", {})  # TypedDict

        buy_payload: Dict[str, Any] = {
            "buy": 1,
            "proposal_id": proposal.get("id") or proposal_resp.get("proposal_id"),
            "req_id": buy_correlation,
        }

        if "echo_req" in proposal_resp:
            buy_payload["echo_req"] = proposal_resp["echo_req"]

        return buy_payload

    def _extract_contract_id_from_buy(self, buy_resp: Dict[str, Any]) -> Optional[int]:
        """
        Extract contract ID safely with pyright strict typing.
        """

        buy_data: BuyData = buy_resp.get("buy", {})

        # Pyright-safe union type (TypedDict OR dict)
        contract_data: Union[BuyData, Dict[str, Any]] = (
            buy_data or buy_resp.get("contract", {}) or buy_resp
        )

        # Pull possible values
        raw_value: Any = (
            contract_data.get("contract_id")
            or contract_data.get("id")
            or contract_data.get("longcode")
        )

        if raw_value is None:
            return None

        try:
            return int(raw_value)
        except Exception:
            return None

    def _extract_buy_price(self, buy_resp: Dict[str, Any]) -> Optional[float]:
        buy_data: BuyData = buy_resp.get("buy", {})

        raw_value: Any = (
            buy_data.get("buy_price")
            or buy_resp.get("buy_price")
            or buy_resp.get("price")
        )

        if raw_value is None:
            return None

        try:
            return float(raw_value)
        except Exception:
            return None

    def _extract_sell_price(self, sell_resp: Dict[str, Any]) -> Optional[float]:
        sell_data: SellData = sell_resp.get("sell", {})

        raw_value: Any = (
            sell_data.get("sell_price")
            or sell_resp.get("sell_price")
            or sell_resp.get("price")
        )

        if raw_value is None:
            return None

        try:
            return float(raw_value)
        except Exception:
            return None

    # -----------------------
    # Stream callbacks (registered on StreamHandler)
    # -----------------------
    def _on_proposal(self, message: dict[str, Any]) -> None:
        """
        Called by StreamHandler when a 'proposal' message arrives.

        Matching strategy (priority):
         1) echo_req.req_id
         2) top-level req_id
         3) try to match echo_req content with saved proposal payloads (symbol/amount/duration/contract_type)
         4) if exactly one pending proposal exists, use it (last-resort)
        """
        try:
            logger.debug(f"[EXECUTOR] _on_proposal raw message: {message}")

            echo_req = message.get("echo_req", {}) or {}
            # Primary: echo_req.req_id
            req_id = echo_req.get("req_id") or message.get("req_id")

            # Try to match by proposal_id (some flows use proposal_id)
            if not req_id:
                prop = message.get("proposal", {}) or {}
                # maybe the server returned the original req under proposal.req_id
                req_id = prop.get("req_id") or message.get("proposal_id")

            # If still not found, attempt content-based matching: compare echo_req to saved payloads
            if not req_id:
                # echo_req often contains the original fields (symbol, amount, duration, contract_type)
                if echo_req:
                    candidates = []
                    for pid, payload in self._pending_proposals_payloads.items():
                        # match a few key fields conservatively
                        matches = True
                        for k in ("symbol", "amount", "duration", "contract_type"):
                            # both may be absent, that's ok
                            if k in echo_req and k in payload:
                                # Normalize numeric types to float for comparison
                                try:
                                    left = (
                                        float(echo_req[k])
                                        if isinstance(echo_req[k], (int, float, str))
                                        else echo_req[k]
                                    )
                                    right = (
                                        float(payload[k])
                                        if isinstance(payload[k], (int, float, str))
                                        else payload[k]
                                    )
                                except Exception:
                                    left = echo_req[k]
                                    right = payload[k]
                                if left != right:
                                    matches = False
                                    break
                        if matches:
                            candidates.append(pid)

                    if len(candidates) == 1:
                        req_id = candidates[0]
                        logger.debug(
                            f"[EXECUTOR] Matched proposal by content -> {req_id}"
                        )
                    elif len(candidates) > 1:
                        logger.debug(
                            f"[EXECUTOR] Multiple proposal candidates matched by content: {candidates}"
                        )

            # Last-resort: if there's exactly one pending proposal, assume it
            if not req_id and len(self._pending_proposals) == 1:
                req_id = next(iter(self._pending_proposals.keys()))
                logger.debug(
                    f"[EXECUTOR] Using sole pending proposal id fallback: {req_id}"
                )

            if not req_id:
                logger.debug(
                    "[EXECUTOR] Proposal without req_id and no match - message ignored"
                )
                return

            fut = self._pending_proposals.pop(req_id, None)
            # cleanup saved payload
            self._pending_proposals_payloads.pop(req_id, None)

            if fut:
                if not fut.done():
                    logger.debug(
                        f"[EXECUTOR] Resolving proposal future for req_id={req_id}"
                    )
                    self._loop.call_soon_threadsafe(fut.set_result, message)
                else:
                    logger.debug(f"[EXECUTOR] Future for req_id={req_id} already done")
            else:
                logger.debug(
                    f"[EXECUTOR] No pending future for proposal req_id={req_id} - storing as unsolicited"
                )
        except Exception as e:
            logger.warning(f"[EXECUTOR] Error handling proposal: {e}")

    def _on_buy(self, message: dict[str, Any]) -> None:
        """
        Called on buy response. Try to match by echo_req.req_id, req_id, buy.req_id.
        If none, try to match using contract id or fallback to single pending buy.
        """
        try:
            logger.debug(f"[EXECUTOR] _on_buy raw message: {message}")

            echo_req = message.get("echo_req", {}) or {}
            req_id = (
                echo_req.get("req_id")
                or message.get("req_id")
                or (message.get("buy", {}) or {}).get("req_id")
            )

            if not req_id and len(self._pending_buys) == 1:
                req_id = next(iter(self._pending_buys.keys()))
                logger.debug(f"[EXECUTOR] Using sole pending buy fallback: {req_id}")

            fut = self._pending_buys.pop(req_id, None) if req_id else None

            if fut and not fut.done():
                logger.debug(f"[EXECUTOR] Resolving buy future for req_id={req_id}")
                self._loop.call_soon_threadsafe(fut.set_result, message)
                return

            # No pending future — try to extract contract and persist
            contract_id = self._extract_contract_id_from_buy(message)
            if contract_id:
                self._open_contracts[contract_id] = {
                    "contract_id": contract_id,
                    "buy_resp": message,
                    "timestamp": time.time(),
                }
                logger.debug(
                    f"[EXECUTOR] Stored open contract from unsolicited buy message: {contract_id}"
                )
            else:
                logger.debug(
                    "[EXECUTOR] Unmatched buy message (no req_id, no contract_id) — logged for inspection"
                )

        except Exception as e:
            logger.warning(f"[EXECUTOR] Error handling buy msg: {e}")

    def _on_sell(self, message: dict[str, Any]) -> None:
        """
        Called when sell response arrives. Map to pending sell by req_id.
        """
        try:
            req_id = message.get("req_id") or message.get("echo_req", {}).get("req_id")
            if not req_id and len(self._pending_sells) == 1:
                req_id = next(iter(self._pending_sells.keys()))
            fut = self._pending_sells.pop(req_id, None)
            if fut and not fut.done():
                self._loop.call_soon_threadsafe(fut.set_result, message)
            else:
                # If not pending, still log
                logger.debug(f"[EXECUTOR] Sell response (no pending) : {message}")
        except Exception as e:
            logger.warning(f"[EXECUTOR] Error handling sell msg: {e}")

    def _on_sell_error(self, message: dict[str, Any]) -> None:
        """
        Called when sell error arrives (e.g. 'InvalidSellContractProposal').
        We'll try to map it to a pending sell by contract id if possible.
        """
        try:
            # Map to pending sell futures if possible (best-effort)
            # Some messages include 'contract_id' in error
            contract_id = message.get("contract_id") or message.get("error", {}).get(
                "contract_id"
            )
            # Try to resolve a pending sell future and notify
            if self._pending_sells:
                # Just pop one and set error
                req_id, fut = self._pending_sells.popitem()
                if not fut.done():
                    self._loop.call_soon_threadsafe(fut.set_result, {"error": message})
        except Exception as e:
            logger.warning(f"[EXECUTOR] Error handling sell_error msg: {e}")

    def _on_contract_update(self, message: dict[str, Any]) -> None:
        """
        Called when proposal_open_contract updates arrive. Store/update contract state.
        """
        try:
            contract = message or {}
            contract_id = contract.get("contract_id") or contract.get("id")
            if contract_id:
                try:
                    cid = int(contract_id)
                except Exception:
                    cid = contract_id
                # merge or set
                existing = self._open_contracts.get(cid, {})
                existing.update(contract)
                self._open_contracts[cid] = existing
                logger.debug(f"[EXECUTOR] Contract update saved for {cid}")
        except Exception as e:
            logger.warning(f"[EXECUTOR] Error saving contract update: {e}")

    # -----------------------
    # Utility
    # -----------------------

    def list_open_contracts(self) -> Dict[int, Dict[str, Any]]:
        return dict(self._open_contracts)

    def is_contract_open(self, contract_id: int) -> bool:
        return contract_id in self._open_contracts
