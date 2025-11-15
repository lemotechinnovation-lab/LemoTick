"""
Trade Executor for LemoTick Bot
--------------------------------
Handles placement, validation, and management of trades via Deriv API.

✅ Features:
 - Standard binary options direction mapping (BUY→CALL, SELL→PUT)
 - 1.5% risk-based stake sizing (via RiskManager)
 - Concurrency lock + timeout recovery
 - Pattern and entry validation logging
 - Full proposal → buy → update → sell lifecycle
 - Auto take-profit / stop-loss close
 - Equity & PnL tracking

Author: LemoTick Core
"""

import time
import threading
import logging
from typing import Optional, Callable, Dict, Any

logger = logging.getLogger(__name__)

def generate_trade_id() -> str:
    return f"trade_{int(time.time() * 1000)}"


class TradeExecutor:
    def __init__(self, stream_handler, strategy_engine, config, risk_manager):
        self.stream_handler = stream_handler
        self.strategy_engine = strategy_engine
        self.config = config or {}
        self.risk_manager = risk_manager

        self.active_contracts: Dict[str, Dict] = {}
        self._placing_trade = False
        self._placing_trade_start_time = 0
        self._trade_lock = threading.Lock()

        self.contract_duration = 3  # default 3 minutes
        self.min_stake = 1.0
        self.max_stake = 1000.0

        # Register API callbacks
        self.stream_handler.register_trade_callbacks(
            on_proposal=self._on_proposal_response,
            on_buy=self._on_buy_response,
            on_sell=self._on_sell_response,
            on_sell_error=self._on_sell_error,
            on_contract_update=self._on_contract_update,
        )

    # ------------------------------------------------------------------ #
    # 🔹 MAIN TRADE EXECUTION LOGIC
    # ------------------------------------------------------------------ #

    def place_trade(
            self,
            stake: float,
            on_trade_result: Optional[Callable] = None,
            duration: Optional[int] = None,
            signal_data: Optional[Dict] = None,
            signal_type: Optional[str] = None,
        ) -> Optional[str]:
            """Primary entry point for trade placement."""
            if not signal_type:
                logger.error("[TRADE] ❌ Missing signal_type.")
                return None
    
            signal_type = signal_type.upper()
            symbol = self.config.get("trading", {}).get("symbol", "R_100")
    
            # ------------------ Direction Mapping ------------------ #
            # Strategy returns semantic meaning: BUY=expect price up, SELL=expect price down
            # This applies to ALL symbols including R_100 (synthetic indices)
            # 
            # For binary options:
            #   - BUY signal (expect price UP) → CALL contract (profits when price rises)
            #   - SELL signal (expect price DOWN) → PUT contract (profits when price falls)
            #
            # Note: R_100, R_75, etc. are NOT inverted - patterns are read directly from their charts
            mapping = {"BUY": "CALL", "SELL": "PUT"}
    
            contract_type = mapping.get(signal_type)
            if not contract_type:
                logger.error(f"[TRADE] ❌ Unknown signal_type={signal_type}")
                return None
    
            logger.info(f"[TRADE] 📊 {symbol} | Signal={signal_type} → {contract_type}")
    
            # ------------------ Concurrency & Stake ---------------- #
            with self._trade_lock:
                trade_id = generate_trade_id()
                try:
                    # prevent multiple concurrent trades
                    if self._placing_trade:
                        elapsed = time.time() - self._placing_trade_start_time
                        if elapsed < 45:
                            logger.warning(f"[TRADE] ⏳ Placement blocked ({elapsed:.1f}s elapsed).")
                            return None
                        logger.warning(f"[TRADE] 🧭 Timeout exceeded, unlocking after {elapsed:.1f}s.")
                        self._placing_trade = False
    
                    # Clean up any invalid contracts (those without proper contract_id)
                    invalid_keys = [k for k, v in self.active_contracts.items() 
                                   if not v.get("contract_id") or not str(v.get("contract_id")).isdigit()]
                    for key in invalid_keys:
                        logger.warning(f"[TRADE] 🧹 Removing invalid contract: {key}")
                        del self.active_contracts[key]
                    
                    # limit concurrent open trades (exclude pending, closing, closed)
                    active = [t for t in self.active_contracts.values() 
                             if t.get("status") not in ["pending", "closing", "closing_early", "force_closing", "closed", "sold"]]
                    max_concurrent = self.config.get("trading", {}).get("max_concurrent_trades_24_7", 1)
                    if len(active) >= max_concurrent:
                        logger.warning(f"[TRADE] ⚠️ Max concurrent trades reached ({len(active)}/{max_concurrent})")
                        for t in active:
                            logger.warning(f"  - Contract {t.get('contract_id', 'pending')}: status={t.get('status')}")
                        return None
    
                    # ------------------ Stake Validation ---------------- #
                    equity = getattr(self.risk_manager, "current_equity", self.risk_manager.initial_equity)
                    max_stake_allowed = equity * 0.015  # 1.5% risk cap
    
                    # Cap stake if above risk limit
                    if stake > max_stake_allowed:
                        logger.info(f"[RISK] Stake adjusted {stake:.2f} → {max_stake_allowed:.2f} (1.5% cap)")
                        stake = max_stake_allowed
    
                    # 🔹 Fix: Always adjust stake to fit within min/max bounds, never reject the trade
                    if stake < self.min_stake:
                        logger.warning(f"[RISK] Stake {stake:.2f} below min, using {self.min_stake:.2f}")
                        stake = self.min_stake
                    elif stake > self.max_stake:
                        logger.warning(f"[RISK] Stake {stake:.2f} above max, using {self.max_stake:.2f}")
                        stake = self.max_stake
    
                    logger.info(f"[RISK] Final stake after validation: {stake:.2f} | Equity: {equity:.2f} | Min: {self.min_stake:.2f} | Max: {self.max_stake:.2f}")
    
                    # Optional pattern analysis for debugging
                    self._analyze_highlighted_patterns(signal_data)
    
                    # ------------------ Execute Trade ---------------- #
                    self._placing_trade = True
                    self._placing_trade_start_time = time.time()
    
                    success = self._execute_direct_buy(
                        trade_id=trade_id,
                        contract_type=contract_type,
                        stake=stake,
                        duration=duration or self.contract_duration,
                        signal_type=signal_type,
                        signal_data=signal_data,
                        on_trade_result=on_trade_result,
                    )
    
                    if success:
                        self.active_contracts[trade_id] = {
                            "trade_id": trade_id,
                            "symbol": symbol,
                            "type": contract_type,
                            "stake": stake,
                            "status": "pending",  # pending until we get contract_id
                            "timestamp": time.time(),  # consistent field name
                            "signal_type": signal_type,
                            "signal_data": signal_data or {},
                        }
                        logger.info(f"[TRADE] ✅ Executed {contract_type} | ID={trade_id}")
                        return trade_id
                    else:
                        logger.error(f"[TRADE] ❌ Failed to execute trade for {contract_type}")
                        return None
    
                except Exception as e:
                    logger.error(f"[TRADE] 💥 Exception placing trade: {e}", exc_info=True)
                    return None
    
                finally:
                    self._placing_trade = False
                    logger.debug("[LOCK] Released after trade attempt.")


    # ------------------------------------------------------------------ #
    # 🔹 INTERNAL EXECUTION SIMULATION / API CALL
    # ------------------------------------------------------------------ #

    def _execute_direct_buy(
        self,
        trade_id: str,
        contract_type: str,
        stake: float,
        duration: int,
        signal_type: str,
        signal_data: Optional[Dict] = None,
        on_trade_result: Optional[Callable] = None,
    ) -> bool:
        """
        Executes a direct Deriv buy contract request through StreamHandler.
        Returns True if the request was sent successfully, False otherwise.
        """

        try:
            # ------------------ Basic validation ------------------ #
            if not self.stream_handler:
                logger.error("[TRADE] ❌ StreamHandler not initialized — cannot place trade.")
                return False

            if not self.stream_handler.is_connected:
                logger.error("[TRADE] ❌ WebSocket not connected — cannot execute buy.")
                return False

            # ------------------ Build proposal payload ------------------ #
            symbol = self.config.get("trading", {}).get("symbol", "R_100")
            currency = self.config.get("account", {}).get("currency", "USD")

            proposal = {
                "buy": 1,
                "price": stake,  # limit to stake amount
                "parameters": {
                    "amount": float(stake),
                    "basis": "stake",
                    "contract_type": contract_type,
                    "currency": currency,
                    "duration": int(duration),
                    "duration_unit": "m",
                    "symbol": symbol,
                },
            }

            logger.info(f"[TRADE] 🚀 Sending buy request to Deriv: {proposal}")

            # ------------------ Send via StreamHandler ------------------ #
            success = self.stream_handler.send_message(proposal)
            if not success:
                logger.error("[TRADE] ❌ Failed to send buy message to WebSocket")
                return False

            # Optionally attach signal metadata for post-trade analytics
            if signal_data:
                logger.debug(f"[META] Signal data attached to {trade_id}: {signal_data}")

            # Log success
            logger.info(
                f"[TRADE] ✅ Buy request sent | ID={trade_id} | "
                f"Type={contract_type} | Stake={stake:.2f} | Duration={duration}m | Symbol={symbol}"
            )

            # Note: Don't add to active_contracts yet - wait for buy response with actual contract_id
            # This prevents accumulation of "pending" contracts that never get removed
            
            return True

        except Exception as e:
            logger.error(f"[TRADE] 💥 Exception in _execute_direct_buy: {e}", exc_info=True)
            return False

    # ------------------------------------------------------------------ #
    # 🔹 SUPPORT UTILITIES
    # ------------------------------------------------------------------ #

    def _analyze_highlighted_patterns(self, signal_data: Optional[Dict]) -> None:
        if not signal_data:
            return
        pattern = signal_data.get("pattern_name") or signal_data.get("fallback") or "unknown"
        conf = signal_data.get("confidence", 0)
        logger.info(f"[PATTERN] 🎯 {pattern} | Confidence={conf:.2f}")

    # ------------------------------------------------------------------ #
    # 🔹 CALLBACK HANDLERS (Deriv)
    # ------------------------------------------------------------------ #

    def _on_proposal_response(self, data: Dict[str, Any]) -> None:
        try:
            if "error" in data:
                logger.error(f"[PROPOSAL] ❌ {data['error'].get('message')}")
                return
            p = data.get("proposal", {})
            logger.info(f"[PROPOSAL] 💵 {p.get('symbol')} {p.get('contract_type')} @ {p.get('display_value')}")
        except Exception as e:
            logger.error(f"[PROPOSAL] Exception: {e}", exc_info=True)

    def _on_buy_response(self, data: Dict[str, Any]) -> None:
        try:
            if "error" in data:
                logger.error(f"[BUY] ❌ {data['error'].get('message')}")
                self._placing_trade = False  # unlock if buy failed
                return
            buy = data.get("buy", {})
            cid = buy.get("contract_id")
            if cid:
                # Find the pending trade and update it with contract_id (don't create duplicate)
                pending_trade = None
                pending_trade_id = None
                for tid, tdata in self.active_contracts.items():
                    if tdata.get("status") == "pending" and not tdata.get("contract_id"):
                        pending_trade = tdata
                        pending_trade_id = tid
                        break
                
                if pending_trade:
                    # Update existing trade entry
                    pending_trade["contract_id"] = cid
                    pending_trade["status"] = "open"
                    pending_trade["entry_price"] = buy.get("buy_price", 0)
                    pending_trade["stake"] = buy.get("buy_price", pending_trade.get("stake", 0))
                    logger.info(f"[BUY] ✅ Contract opened ID={cid} (trade_id={pending_trade_id})")
                else:
                    # No pending trade found - create new entry (shouldn't happen normally)
                    logger.warning(f"[BUY] No pending trade found for contract {cid}, creating new entry")
                    self.active_contracts[f"contract_{cid}"] = {
                        "contract_id": cid,
                        "stake": buy.get("buy_price", 0),
                        "status": "open",
                        "timestamp": time.time(),
                        "entry_price": buy.get("buy_price", 0),
                    }
                
                self._subscribe_to_contract_updates(cid)
                self._placing_trade = False  # unlock after successful buy
        except Exception as e:
            logger.error(f"[BUY] Exception: {e}", exc_info=True)
            self._placing_trade = False  # unlock on error

    def _subscribe_to_contract_updates(self, contract_id: str) -> None:
        try:
            if not contract_id:
                return
            logger.info(f"[CONTRACT] 🔔 Subscribe {contract_id}")
            if hasattr(self.stream_handler, "subscribe_to_contract"):
                self.stream_handler.subscribe_to_contract(contract_id)
        except Exception as e:
            logger.error(f"[CONTRACT] Subscription error: {e}", exc_info=True)

    def _on_contract_update(self, update: Dict[str, Any]) -> None:
        try:
            c = update.get("contract")
            if not c:
                return
            cid = c.get("contract_id")
            profit = c.get("profit", 0)
            status = c.get("status")
            logger.info(f"[UPDATE] 📈 {cid} | Profit={profit:.2f} | Status={status}")

            tp = getattr(self.risk_manager, "take_profit", 1.3)
            sl = getattr(self.risk_manager, "stop_loss", -1.0)
            if profit >= tp or profit <= sl:
                logger.info(f"[UPDATE] 🚨 Auto-close {cid} (TP/SL reached)")
                if hasattr(self.stream_handler, "sell_contract"):
                    self.stream_handler.sell_contract(cid)

            if status in ["sold", "expired"]:
                self._finalize_contract(cid, profit, c.get("sell_price"))
        except Exception as e:
            logger.error(f"[UPDATE] Exception: {e}", exc_info=True)

    def _on_sell_response(self, data: Dict[str, Any]) -> None:
        try:
            s = data.get("sell", {})
            cid = s.get("contract_id")
            profit = s.get("profit", 0)
            logger.info(f"[SELL] ✅ {cid} closed | Profit={profit:.2f}")
            self._finalize_contract(cid, profit, s.get("sell_price"))
        except Exception as e:
            logger.error(f"[SELL] Exception: {e}", exc_info=True)

    def _on_sell_error(self, error: Dict[str, Any]) -> None:
        try:
            msg = error.get("message") or str(error)
            logger.error(f"[SELL] ❌ Error: {msg}")
        except Exception as e:
            logger.error(f"[SELL] Exception logging error: {e}", exc_info=True)

    # ------------------------------------------------------------------ #
    # 🔹 CLEANUP & EQUITY UPDATE
    # ------------------------------------------------------------------ #

    def _finalize_contract(self, contract_id: str, profit: float, sell_price: Optional[float]) -> None:
        if not contract_id:
            return
        
        # Find the trade by contract_id (active_contracts is keyed by trade_id)
        trade_id_to_remove = None
        for tid, tdata in self.active_contracts.items():
            if tdata.get("contract_id") == contract_id:
                trade_id_to_remove = tid
                break
        
        if not trade_id_to_remove:
            logger.warning(f"[FINALIZE] Contract {contract_id} not found in active_contracts")
            return
        
        trade = self.active_contracts.pop(trade_id_to_remove)
        old_eq = getattr(self.risk_manager, "current_equity", self.risk_manager.initial_equity)
        new_eq = old_eq + profit
        self.risk_manager.current_equity = new_eq
        
        # Update strategy engine win/loss stats
        result = "WIN" if profit > 0 else "LOSS"
        if hasattr(self.strategy_engine, 'total_wins') and hasattr(self.strategy_engine, 'total_losses'):
            if profit > 0:
                self.strategy_engine.total_wins += 1
            else:
                self.strategy_engine.total_losses += 1
        
        logger.info(f"[FINALIZE] 🏁 {contract_id} {result} | PnL={profit:.2f} | Equity {old_eq:.2f}→{new_eq:.2f}")
