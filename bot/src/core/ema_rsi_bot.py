"""
EMA+RSI Bot Engine (decision-only)
- Receives ticks from StreamHandler (via on_tick callback)
- Updates EMARSIStrategy
- On BUY/SELL signals asks TradeExecutor to execute trade
- Monitors exits (via strategy exit signals AND executor's contract updates)
"""

import asyncio
from typing import Any, Optional

from engine.risk_manager import RiskManager
from engine.stream_handler import StreamHandler
from engine.trade_executor import TradeExecutor
from infrastructure.logger import logger
from infrastructure.metrics import get_metrics
from strategies.ema_rsi_strategy import (
    Candle,
    EMARSIStrategy,
    SignalType,
)


class EMARSIBot:
    def __init__(
        self,
        config: dict[str, Any],
        backend_client: Any,
        loop: Optional[asyncio.AbstractEventLoop] = None,
    ) -> None:
        # Store config + backend client
        self.config = config
        self.backend_client = backend_client

        # Event loop
        try:
            self.loop = loop or asyncio.get_running_loop()
        except RuntimeError:
            # No running loop -> create one
            self.loop = asyncio.new_event_loop()
            asyncio.set_event_loop(self.loop)

        # Initialize stream handler
        self.stream = StreamHandler(on_tick_callback=self._on_tick_threadsafe)

        # Trade executor
        self.executor = TradeExecutor(self.stream)

        # Strategy instance
        logger.info("Initializing EMARSIStrategy...")
        self.strategy = EMARSIStrategy()
        logger.info("EMARSIStrategy initialized successfully")

        # Risk manager
        logger.info("Getting metrics instance...")
        self.metrics = get_metrics()
        logger.info("Metrics instance retrieved")

        logger.info("Initializing RiskManager...")
        try:
            self.risk_manager = RiskManager(config=config, metrics=self.metrics)
            logger.info(f"RiskManager initialized: {self.risk_manager.account_type} account, equity=${self.risk_manager.initial_equity:.2f}")
        except Exception as e:
            logger.error(f"CRITICAL: Failed to initialize RiskManager: {e}", exc_info=True)
            raise RuntimeError(f"RiskManager initialization failed: {e}") from e

        # Tracking state
        self._running: bool = False

        self._active_contract_id: Optional[int] = None
        self._active_position_type: Optional[SignalType] = None
        self._active_entry_price: Optional[float] = None

        # RSI neutral zone
        self._rsi_neutral_low = config.get("strategy.rsi.neutral_zone_low", 40.0)
        self._rsi_neutral_high = config.get("strategy.rsi.neutral_zone_high", 60.0)

        self._current_candle: dict[str, float] | None = None
        self._last_tick_ts: int | None = None

    # ---------------------------------------------------------------------
    # Public lifecycle
    # ---------------------------------------------------------------------

    async def start(self) -> None:
        logger.info("Starting EMARSIBot...")

        self.stream.start()
        self._running = True

        try:
            while self._running:
                await asyncio.sleep(1)
        finally:
            logger.info("EMARSIBot stopped")

    async def stop(self) -> None:
        logger.info("Stopping EMARSIBot...")
        self._running = False
        self.stream.stop()

    # ---------------------------------------------------------------------
    # Tick handler (thread → asyncio)
    # ---------------------------------------------------------------------

    def _on_tick_threadsafe(self, price: float, timestamp: int) -> None:
        """Called from StreamHandler thread; schedule async handler"""
        try:
            if self.loop.is_running():
                self.loop.call_soon_threadsafe(
                    asyncio.create_task,
                    self._on_tick_async(price, timestamp),
                )
            else:
                asyncio.run(self._on_tick_async(price, timestamp))
        except Exception as e:
            logger.error(f"Failed to schedule tick handler: {e}", exc_info=True)

    async def _on_tick_async(self, price: float, timestamp: int):
        """
        Aggregates ticks into 1-second candles and routes signals correctly.
        """
        try:
            timeframe = 1  # 1-second candles

            # --- Initialize first candle ---
            if self._current_candle is None:
                self._current_candle = {
                    "timestamp": timestamp,
                    "open": price,
                    "high": price,
                    "low": price,
                    "close": price,
                }
                self._last_tick_ts = timestamp
                return

            # --- Update current candle ---
            self._current_candle["high"] = max(self._current_candle["high"], price)
            self._current_candle["low"] = min(self._current_candle["low"], price)
            self._current_candle["close"] = price

            # --- Candle complete? Safe check for None ---
            if (
                self._last_tick_ts is not None
                and (timestamp - self._last_tick_ts) >= timeframe
            ):
                candle = Candle(
                    timestamp=self._current_candle["timestamp"],
                    open=self._current_candle["open"],
                    high=self._current_candle["high"],
                    low=self._current_candle["low"],
                    close=self._current_candle["close"],
                )

                # --- Update strategy ---
                signal = self.strategy.update(candle)

                # --- Route signals properly ---
                if signal.signal_type in (SignalType.BUY, SignalType.SELL):
                    await self._handle_entry_signal(signal, candle)

                elif signal.signal_type == SignalType.EXIT:
                    await self._handle_exit_signal(signal, candle)

                # --- Reset candle for next period ---
                self._current_candle = None
                self._last_tick_ts = timestamp

        except Exception as e:
            logger.error(f"Error in tick handling: {e}", exc_info=True)

    # ---------------------------------------------------------------------
    # Entry logic
    # ---------------------------------------------------------------------

    async def _handle_entry_signal(self, signal: Any, candle: Candle) -> None:
        logger.info(
            f"ENTRY SIGNAL: {signal.signal_type.value} — reason: {signal.reason}"
        )

        # DO NOT validate RSI here — strategy already fully validated everything

        stake = self.risk_manager.calculate_stake()

        try:
            buy_result = await self.executor.buy_market(
                symbol=self.config.get("trading.symbol", "R_25"),
                amount=stake,
                duration=self.config.get("strategy.duration", 5),
                contract_type="call" if signal.signal_type == SignalType.BUY else "put",
            )
        except Exception as e:
            logger.error(f"Executor buy failed: {e}", exc_info=True)
            return

        if not buy_result.success:
            logger.warning(f"Buy failed → {buy_result.reason}")
            return

        self._active_contract_id = buy_result.contract_id
        self._active_position_type = signal.signal_type
        self._active_entry_price = buy_result.buy_price

        logger.info(
            f"Opened {signal.signal_type.value} "
            f"contract={self._active_contract_id} entry_price={self._active_entry_price}"
        )

    # ---------------------------------------------------------------------
    # Exit logic
    # ---------------------------------------------------------------------

    async def _handle_exit_signal(self, signal: Any, candle: Candle) -> None:
        logger.info(f"EXIT SIGNAL: {signal.reason}")

        if not self._active_contract_id:
            logger.info("No active position → skipping exit")
            return

        try:
            sell_result = await self.executor.sell_at_market(self._active_contract_id)
        except Exception as e:
            logger.error(f"Executor sell failed: {e}", exc_info=True)
            return

        if not sell_result.success:
            logger.warning(
                f"Exit failed for contract {self._active_contract_id}: "
                f"{sell_result.reason}"
            )
            self._active_contract_id = None
            self._active_entry_price = None
            self._active_position_type = None
            return

        logger.info(
            f"Exit SUCCESS — contract={sell_result.contract_id} sell_price={sell_result.sell_price}"
        )

        self._active_contract_id = None
        self._active_position_type = None
        self._active_entry_price = None
