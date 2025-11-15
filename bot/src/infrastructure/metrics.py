"""
Prometheus metrics collection for LemoTick bot.
"""

from prometheus_client import Counter, Histogram, Gauge, start_http_server  # type: ignore
from prometheus_client.core import CollectorRegistry  # type: ignore
from typing import Dict, Optional
from infrastructure.logger import logger


class LemoTickMetrics:
    """Prometheus metrics for LemoTick bot."""

    def __init__(self, port: int = 8000):
        """Initialize metrics collector."""
        self.registry = CollectorRegistry()
        self.port = port
        
        # Account type metrics
        self.account_type = Gauge(
            "lemotick_account_type",
            "Account type (0=demo, 1=real)",
            registry=self.registry,
        )
        
        # Account name as string label
        self.account_name = Gauge(
            "lemotick_account_name",
            "Account name (demo/real)",
            ["name"],
            registry=self.registry,
        )
        
        # Set default account type to demo (0)
        self.account_type.set(0)
        self.account_name.labels(name="demo").set(1)
        self.account_name.labels(name="real").set(0)

        # Trading metrics
        self.trades_total = Counter(
            "lemotick_trades_total",
            "Total number of trades executed",
            ["action", "result", "account_type"],
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

        # Profit/Loss metrics
        self.current_profit_loss = Gauge("lemotick_current_profit_loss", "Current profit/loss amount", registry=self.registry)
        
        self.current_win_rate = Gauge("lemotick_current_win_rate", "Current win rate percentage", registry=self.registry)

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

        # Initialize gauges with baseline values so they appear immediately in Grafana
        try:
            self.websocket_connections.set(0)  # Start as disconnected
            self.current_equity.set(50.0)  # Show initial equity (matches risk manager default)
            self.daily_drawdown.set(0.0)  # No drawdown initially
            self.active_trades.set(0)  # No active trades initially
            
            # IMPORTANT: Initialize P&L metrics with 0.0 explicitly
            # These MUST be set immediately so Grafana can scrape them
            self.current_profit_loss.set(0.0)  # Start with zero profit/loss
            self.current_win_rate.set(0.0)  # Start with zero win rate
            
            # Initialize account type to demo by default
            self.account_type.set(0)  # 0 = demo, 1 = real
            
            # Initialize indicator values
            self.ema_fast_value.set(0.0)
            self.ema_slow_value.set(0.0)
            self.momentum_value.set(0.0)
            self.volatility_value.set(0.0)
            self.rsi_value.set(50.0)  # Neutral RSI
            self.macd_line_value.set(0.0)
            self.macd_signal_value.set(0.0)
            self.macd_histogram_value.set(0.0)
            
            # CRITICAL FIX: Initialize counter metrics with 0 values
            # Without this, Prometheus has no samples and rate() queries return empty
            # We need to initialize all label combinations that the dashboard queries use
            try:
                logger.info("Initializing counter metrics with baseline values...")
                
                # Initialize trades_total counter for all action types and account types
                # Increment by 0 to create the time series without affecting the count
                for action in ["BUY", "SELL"]:
                    for result in ["placed", "win", "loss"]:
                        for account_type in ["demo", "real"]:
                            # Increment by 0 creates the time series in Prometheus
                            self.trades_total.labels(action=action, result=result, account_type=account_type).inc(0)
                logger.info("   - Trades counter initialized")
                
                # Initialize signal counters
                for signal_type in ["BUY", "SELL", "HOLD"]:
                    self.signals_generated.labels(signal_type=signal_type).inc(0)
                logger.info("   - Signals counter initialized")
                
                # Initialize filter counters
                for filter_type in ["strategy_filter", "risk_filter", "time_filter"]:
                    self.signals_filtered.labels(filter_type=filter_type).inc(0)
                logger.info("   - Filters counter initialized")
                
                # Initialize database operation counters
                for operation_type in ["read", "write", "update", "delete"]:
                    self.database_operations.labels(operation_type=operation_type).inc(0)
                logger.info("   - Database operations counter initialized")
                
            except Exception as counter_error:
                import traceback
                logger.error(f"Error initializing counter metrics: {counter_error}")
                logger.error(f"Traceback: {traceback.format_exc()}")
            
            logger.info("Prometheus metrics initialized with baseline values")
            logger.info(f"   - Profit/Loss: {self.current_profit_loss._value.get()}")
            logger.info(f"   - Win Rate: {self.current_win_rate._value.get()}%")
            logger.info(f"   - Equity: ${self.current_equity._value.get()}")
            logger.info(f"   - Active Trades: {self.active_trades._value.get()}")
            logger.info(f"   - Counter metrics initialized with label combinations")
        except Exception as e:
            logger.error(f"Error initializing metrics: {e}")

    def start_server(self):
        """
        Start Prometheus metrics server.
        
        Returns:
            tuple: (success_bool, metrics_instance)
        """
        try:
            start_http_server(self.port, registry=self.registry)
            logger.info(f"Prometheus metrics server started on port {self.port}")
            return True, self
        except Exception as e:
            logger.error(f"Failed to start Prometheus server: {e}")
            return False, self

    def record_trade(self, action: str, result: str, profit: float = 0.0, account_type: Optional[str] = None):
        """Record a trade execution.
        
        Args:
            action: Trade action ("BUY" or "SELL")
            result: Trade result ("placed", "win", "loss")
            profit: Profit amount (positive for win, negative for loss)
            account_type: Account type ("demo" or "real"), auto-detected if None
        """
        # Determine account type from current account_type gauge if not explicitly provided
        if account_type is None:
            try:
                current_type = self.account_type._value.get()
                account_type = "demo" if current_type == 0 else "real"
            except:
                account_type = "demo"  # Default to demo if we can't determine
        
        try:
            self.trades_total.labels(action=action, result=result, account_type=account_type).inc()
        except Exception as e:
            logger.error(f"Error recording trade metric: {e}")
            # Try without account_type label as fallback (shouldn't happen with initialization)
            return

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
        
    def update_account_type(self, is_demo: bool) -> None:
        """
        Update account type indicator.
        
        Args:
            is_demo: True if using demo account, False if using real account
        """
        try:
            # Set account type gauge (0 = demo, 1 = real)
            self.account_type.set(0 if is_demo else 1)
            
            # Update account name labels
            if is_demo:
                self.account_name.labels(name="demo").set(1)
                self.account_name.labels(name="real").set(0)
            else:
                self.account_name.labels(name="demo").set(0)
                self.account_name.labels(name="real").set(1)
                
            logger.info(f"Updated account type metrics: {'DEMO' if is_demo else 'REAL'}")
        except Exception as e:
            logger.error(f"Error updating account type metrics: {e}")

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

    def update_profit_loss(self, profit_loss: float):
        """Update profit/loss metric - called frequently to keep Grafana updated"""
        try:
            # Ensure profit_loss is a single numeric value, not a tuple
            if isinstance(profit_loss, tuple):
                profit_loss_value = float(profit_loss[0]) if len(profit_loss) > 0 else 0.0
                logger.warning(f"profit_loss is a tuple, using first element: {profit_loss_value}")
            else:
                profit_loss_value = float(profit_loss)
            
            self.current_profit_loss.set(profit_loss_value)
            # Verify the value was set
            current_value = self.current_profit_loss._value.get()
            if current_value != profit_loss_value:
                logger.warning(f"Profit/Loss metric value mismatch: set={profit_loss_value}, actual={current_value}")
            logger.debug(f"Profit/Loss metric set: ${profit_loss_value:.2f} (verified: ${current_value:.2f})")
        except Exception as e:
            logger.error(f"Error updating profit/loss metric: {e}", exc_info=True)

    def update_win_rate(self, win_rate: float):
        """Update win rate metric - called frequently to keep Grafana updated"""
        try:
            # Ensure win_rate is a single numeric value, not a tuple
            if isinstance(win_rate, tuple):
                win_rate_float = float(win_rate[0]) if len(win_rate) > 0 else 0.0
                logger.warning(f"win_rate is a tuple, using first element: {win_rate_float}")
            else:
                # Convert to float and ensure it's a valid number
                win_rate_float = float(win_rate)
            
            # Set the metric value - CRITICAL for dashboard visibility
            self.current_win_rate.set(win_rate_float)
            
            # Verify the value was set correctly
            current_value = self.current_win_rate._value.get()
            
            # Log any discrepancy
            if abs(current_value - win_rate_float) > 0.01:
                logger.warning(f"Win rate metric value mismatch: set={win_rate_float}, actual={current_value}")
                # Force set again if there's a mismatch
                self.current_win_rate.set(win_rate_float)
                logger.warning(f"Forced reset of win rate metric to {win_rate_float}")
            
            # Log success with more visibility
            logger.info(f"Win rate metric set: {win_rate_float:.1f}% (verified: {current_value:.1f}%)")
        except Exception as e:
            logger.error(f"Error updating win rate metric: {e}", exc_info=True)
            # Attempt recovery by setting to 0
            try:
                self.current_win_rate.set(0.0)
                logger.warning("Reset win rate to 0.0 after error")
            except:
                pass


# Global metrics instance
metrics = None


def get_metrics() -> LemoTickMetrics:
    """Get global metrics instance."""
    global metrics
    if metrics is None:
        metrics = LemoTickMetrics()
    return metrics


def start_metrics_server(port: Optional[int] = None) -> tuple:
    """Start Prometheus metrics server.
    
    Returns:
        tuple: (success_bool, metrics_instance)
    """
    global metrics
    
    # Get port from environment or config, default to 8000
    if port is None:
        import os
        port = int(os.getenv("PROMETHEUS_PORT", "8000"))
    
    if metrics is None:
        metrics = LemoTickMetrics(port)
    return metrics.start_server()


