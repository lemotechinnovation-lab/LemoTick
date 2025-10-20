"""
Loki logging integration for LemoTick bot.
"""

import json
import time
import requests
from typing import Dict, Any, Optional
from .logger import logger


class LokiLogger:
    """Loki logging client for LemoTick."""

    def __init__(
        self,
        loki_url: str = "http://localhost:3100",
        labels: Optional[Dict[str, str]] = None,
    ):
        """Initialize Loki logger."""
        self.loki_url = loki_url.rstrip("/")
        self.push_url = f"{self.loki_url}/loki/api/v1/push"
        self.labels = labels or {
            "job": "lemotick",
            "instance": "bot-1",
            "environment": "demo",
        }

        # Batch configuration
        self.batch_size = 100
        self.batch_timeout = 5.0  # seconds
        self.batch = []
        self.last_flush = time.time()

        logger.info(f"Loki logger initialized: {self.loki_url}")

    def log(
        self, level: str, message: str, extra_data: Optional[Dict[str, Any]] = None
    ):
        """Log a message to Loki."""
        try:
            # Create log entry
            log_entry = {
                "timestamp": int(time.time() * 1000000000),  # nanoseconds
                "level": level,
                "message": message,
                "logger": "LemoTick",
            }

            # Add extra data if provided
            if extra_data:
                log_entry.update(extra_data)

            # Add to batch
            self.batch.append(log_entry)

            # Flush if batch is full or timeout reached
            if (
                len(self.batch) >= self.batch_size
                or time.time() - self.last_flush >= self.batch_timeout
            ):
                self._flush_batch()

        except Exception as e:
            logger.error(f"Loki logging error: {e}")

    def _flush_batch(self):
        """Flush batch to Loki."""
        if not self.batch:
            return

        try:
            # Create Loki payload
            streams = [
                {
                    "stream": self.labels,
                    "values": [
                        [str(entry["timestamp"]), json.dumps(entry)]
                        for entry in self.batch
                    ],
                }
            ]

            payload = {"streams": streams}

            # Send to Loki
            response = requests.post(
                self.push_url,
                json=payload,
                headers={"Content-Type": "application/json"},
                timeout=5,
            )

            if response.status_code == 204:
                logger.debug(f"Sent {len(self.batch)} log entries to Loki")
            else:
                logger.warning(
                    f"Loki push failed: {response.status_code} - {response.text}"
                )

            # Clear batch
            self.batch.clear()
            self.last_flush = time.time()

        except Exception as e:
            logger.error(f"Loki flush error: {e}")

    def log_trade(self, action: str, price: float, stake: float, result: str):
        """Log a trade execution."""
        self.log(
            "INFO",
            f"Trade executed: {action} at {price} for {stake}",
            {
                "trade_action": action,
                "trade_price": price,
                "trade_stake": stake,
                "trade_result": result,
                "event_type": "trade",
            },
        )

    def log_signal(self, signal_type: str, price: float, indicators: Dict[str, float]):
        """Log a signal generation."""
        self.log(
            "INFO",
            f"Signal generated: {signal_type} at {price}",
            {
                "signal_type": signal_type,
                "signal_price": price,
                "indicators": indicators,
                "event_type": "signal",
            },
        )

    def log_error(
        self, error_type: str, message: str, context: Optional[Dict[str, Any]] = None
    ):
        """Log an error."""
        self.log(
            "ERROR",
            f"{error_type}: {message}",
            {
                "error_type": error_type,
                "error_context": context or {},
                "event_type": "error",
            },
        )

    def log_performance(self, metric_name: str, value: float, unit: str = ""):
        """Log a performance metric."""
        self.log(
            "INFO",
            f"Performance metric: {metric_name} = {value}{unit}",
            {
                "metric_name": metric_name,
                "metric_value": value,
                "metric_unit": unit,
                "event_type": "performance",
            },
        )

    def flush(self):
        """Force flush remaining logs."""
        self._flush_batch()


# Global Loki logger instance
loki_logger = None


def get_loki_logger() -> LokiLogger:
    """Get global Loki logger instance."""
    global loki_logger
    if loki_logger is None:
        loki_logger = LokiLogger()
    return loki_logger


def log_to_loki(level: str, message: str, extra_data: Optional[Dict[str, Any]] = None):
    """Log to Loki using global instance."""
    get_loki_logger().log(level, message, extra_data)
