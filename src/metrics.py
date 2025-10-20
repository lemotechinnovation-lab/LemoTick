"""
Prometheus metrics collection for LemoTick bot.
"""

from prometheus_client import Counter, Histogram, Gauge, start_http_server
from prometheus_client.core import CollectorRegistry
from typing import Dict
from .logger import logger


class LemoTickMetrics:
    """Prometheus metrics for LemoTick bot."""

    def __init__(self, port: int = 8000):
        """Initialize metrics collector."""
        self.registry = CollectorRegistry()
        self.port = port

        # Trading metrics
        self.trades_total = Counter(
            "lemotick_trades_total",
            "Total number of trades executed",
            ["action", "result"],
            registry=self.registry,
        )

        self.trades_profit = Counter(
            "lemotick_trades_profit_total",
            "Total profit from trades",
            registry=self.registry,
        )

        self.trades_loss = Counter(
            "lemotick_trades_loss_total",
            "Total loss from trades",
            registry=self.registry,
        )

        # Signal metrics
        self.signals_generated = Counter(
            "lemotick_signals_generated_total",
            "Total signals generated",
            ["signal_type"],
            registry=self.registry,
        )

        self.signals_filtered = Counter(
            "lemotick_signals_filtered_total",
            "Total signals filtered out",
            ["filter_type"],
            registry=self.registry,
        )

        # Performance metrics
        self.tick_processing_time = Histogram(
            "lemotick_tick_processing_seconds",
            "Time spent processing ticks",
            buckets=[0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1.0],
            registry=self.registry,
        )

        self.trade_execution_time = Histogram(
            "lemotick_trade_execution_seconds",
            "Time spent executing trades",
            buckets=[0.1, 0.5, 1.0, 2.0, 5.0, 10.0],
            registry=self.registry,
        )

        # System metrics
        self.websocket_connections = Gauge(
            "lemotick_websocket_connections", "Number of active WebSocket connections",
            registry=self.registry,
        )

        self.websocket_reconnects = Counter(
            "lemotick_websocket_reconnects_total", "Total WebSocket reconnections",
            registry=self.registry,
        )

        self.database_operations = Counter(
            "lemotick_database_operations_total",
            "Total database operations",
            ["operation_type"],
            registry=self.registry,
        )

        # Risk metrics
        self.current_equity = Gauge("lemotick_current_equity", "Current account equity", registry=self.registry)

        self.daily_drawdown = Gauge(
            "lemotick_daily_drawdown", "Current daily drawdown percentage",
            registry=self.registry,
        )

        self.active_trades = Gauge("lemotick_active_trades", "Number of active trades", registry=self.registry)

        # Indicator metrics
        self.ema_fast_value = Gauge("lemotick_ema_fast", "Current fast EMA value", registry=self.registry)

        self.ema_slow_value = Gauge("lemotick_ema_slow", "Current slow EMA value", registry=self.registry)

        self.momentum_value = Gauge("lemotick_momentum", "Current momentum value", registry=self.registry)

        self.volatility_value = Gauge("lemotick_volatility", "Current volatility value", registry=self.registry)

        self.rsi_value = Gauge("lemotick_rsi", "Current RSI value", registry=self.registry)

        # MACD metrics
        self.macd_line_value = Gauge("lemotick_macd_line", "Current MACD line value", registry=self.registry)
        self.macd_signal_value = Gauge("lemotick_macd_signal", "Current MACD signal value", registry=self.registry)
        self.macd_histogram_value = Gauge("lemotick_macd_histogram", "Current MACD histogram value", registry=self.registry)

        logger.info(f"Prometheus metrics initialized on port {port}")

        # Initialize gauges with baseline values so they appear immediately
        try:
            self.websocket_connections.set(0)
            self.current_equity.set(0)
            self.daily_drawdown.set(0)
            self.active_trades.set(0)
            self.ema_fast_value.set(0)
            self.ema_slow_value.set(0)
            self.momentum_value.set(0)
            self.volatility_value.set(0)
            self.rsi_value.set(50)
            self.macd_line_value.set(0)
            self.macd_signal_value.set(0)
            self.macd_histogram_value.set(0)
        except Exception:
            pass

    def start_server(self):
        """Start Prometheus metrics server."""
        try:
            start_http_server(self.port, registry=self.registry)
            logger.info(f"Prometheus metrics server started on port {self.port}")
            return True
        except Exception as e:
            logger.error(f"Failed to start Prometheus server: {e}")
            return False

    def record_trade(self, action: str, result: str, profit: float = 0.0):
        """Record a trade execution."""
        self.trades_total.labels(action=action, result=result).inc()

        if result == "win":
            self.trades_profit.inc(profit)
        elif result == "loss":
            self.trades_loss.inc(abs(profit))

    def record_signal(self, signal_type: str):
        """Record a signal generation."""
        self.signals_generated.labels(signal_type=signal_type).inc()

    def record_filtered_signal(self, filter_type: str):
        """Record a filtered signal."""
        self.signals_filtered.labels(filter_type=filter_type).inc()

    def record_tick_processing_time(self, duration: float):
        """Record tick processing time."""
        self.tick_processing_time.observe(duration)

    def record_trade_execution_time(self, duration: float):
        """Record trade execution time."""
        self.trade_execution_time.observe(duration)

    def update_websocket_status(self, connected: bool):
        """Update WebSocket connection status."""
        self.websocket_connections.set(1 if connected else 0)

    def record_websocket_reconnect(self):
        """Record WebSocket reconnection."""
        self.websocket_reconnects.inc()

    def record_database_operation(self, operation_type: str):
        """Record database operation."""
        self.database_operations.labels(operation_type=operation_type).inc()

    def update_equity(self, equity: float):
        """Update current equity."""
        self.current_equity.set(equity)

    def update_drawdown(self, drawdown: float):
        """Update daily drawdown."""
        self.daily_drawdown.set(drawdown)

    def update_active_trades(self, count: int):
        """Update active trades count."""
        self.active_trades.set(count)

    def update_indicators(self, indicators: Dict[str, float]):
        """Update indicator values."""
        if "ema_fast" in indicators:
            self.ema_fast_value.set(indicators["ema_fast"])
        if "ema_slow" in indicators:
            self.ema_slow_value.set(indicators["ema_slow"])
        if "momentum" in indicators:
            self.momentum_value.set(indicators["momentum"])
        if "volatility" in indicators:
            self.volatility_value.set(indicators["volatility"])
        if "rsi" in indicators:
            self.rsi_value.set(indicators["rsi"])
        if "macd_line" in indicators:
            self.macd_line_value.set(indicators["macd_line"])
        if "macd_signal" in indicators:
            self.macd_signal_value.set(indicators["macd_signal"])
        if "macd_histogram" in indicators:
            self.macd_histogram_value.set(indicators["macd_histogram"])


# Global metrics instance
metrics = None


def get_metrics() -> LemoTickMetrics:
    """Get global metrics instance."""
    global metrics
    if metrics is None:
        metrics = LemoTickMetrics()
    return metrics


def start_metrics_server(port: int = None) -> bool:
    """Start Prometheus metrics server."""
    global metrics
    
    # Get port from environment or config, default to 8001
    if port is None:
        import os
        port = int(os.getenv("PROMETHEUS_PORT", "8001"))
    
    if metrics is None:
        metrics = LemoTickMetrics(port)
    return metrics.start_server()
