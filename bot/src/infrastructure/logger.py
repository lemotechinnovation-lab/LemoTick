"""
Centralized logging system for LemoTick Bot.
Safe for Windows console, Pyright clean, UTF-8 file logging.
"""

import io
import json
import logging
import logging.handlers
import os
import sys
import time
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, Optional, cast


# =====================================================================
# Structured JSON file formatter
# =====================================================================
class StructuredFormatter(logging.Formatter):
    """Custom formatter for structured JSON logging (file only)."""

    def format(self, record: logging.LogRecord) -> str:
        log_entry = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }

        if record.exc_info:
            log_entry["exception"] = self.formatException(record.exc_info)

        extra_data = getattr(record, "extra_data", None)
        if extra_data is not None:
            log_entry["extra"] = extra_data

        return json.dumps(log_entry, ensure_ascii=False)


# =====================================================================
# Console (colored) formatter with Windows-safe emoji replacement
# =====================================================================
class ColoredFormatter(logging.Formatter):
    """Formatter for pretty console logs."""

    COLORS = {
        "DEBUG": "\033[36m",
        "INFO": "\033[32m",
        "WARNING": "\033[33m",
        "ERROR": "\033[31m",
        "CRITICAL": "\033[35m",
        "RESET": "\033[0m",
    }

    # windows-safe fallback replacements (avoids UnicodeEncodeError)
    SAFE_REPLACEMENTS = {
        "⚠️": "[!]",
        "❌": "[X]",
        "✔️": "[OK]",
        "🚀": "[GO]",
        "📈": "[UP]",
        "📉": "[DOWN]",
        "💰": "[$]",
        "🎯": "[TARGET]",
        "🔥": "[HOT]",
        "→": "->",
        "←": "<-",
    }

    def format(self, record: logging.LogRecord) -> str:
        level_color = self.COLORS.get(record.levelname, self.COLORS["RESET"])
        record.levelname = f"{level_color}{record.levelname}{self.COLORS['RESET']}"

        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        try:
            msg = record.getMessage()
        except Exception:
            msg = str(record.msg)

        # On Windows console, sanitize emojis before encoding
        if sys.platform == "win32":
            for emoji, replacement in self.SAFE_REPLACEMENTS.items():
                msg = msg.replace(emoji, replacement)
            # final force-sanitize: replace non-cp1252 characters
            msg = msg.encode("cp1252", errors="replace").decode("cp1252")

        if record.exc_info:
            return (
                f"[{timestamp}] {record.levelname} [{record.name}] {msg}\n"
                f"{self.formatException(record.exc_info)}"
            )

        return f"[{timestamp}] {record.levelname} [{record.name}] {msg}"


# =====================================================================
# Safe rotating file handler (Pyright-clean, allows stream=None)
# =====================================================================
class SafeRotatingFileHandler(logging.handlers.RotatingFileHandler):
    """
    RotatingFileHandler that safely handles file lock errors,
    without violating Pyright typing rules.
    """

    # Pyright-safe override: DO NOT assign None to stream
    def doRollover(self) -> None:
        try:
            super().doRollover()
            return
        except Exception:
            pass

        try:
            time.sleep(0.1)
            super().doRollover()
            return
        except Exception:
            pass

        # Last-resort manual rotation (no stream assignment)
        try:
            if os.path.exists(self.baseFilename):
                backup = self.baseFilename + ".1"
                if os.path.exists(backup):
                    os.remove(backup)
                os.rename(self.baseFilename, backup)

            # Re-open file safely
            new_stream = self._open()
            self.acquire()
            try:
                if self.stream:
                    self.stream.close()
                self.stream = new_stream  # type: ignore[assignment]
            finally:
                self.release()

        except Exception:
            print(
                f"WARNING: Could not rotate log file {self.baseFilename}. File logging may be limited."
            )


# =====================================================================
# Logger Singleton
# =====================================================================
class Logger:
    _instance = None
    _initialized = False

    logger: Optional[logging.Logger] = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    # --------------------------------------------------------------
    # Initialization
    # --------------------------------------------------------------
    def __init__(self):
        if not self._initialized:
            self._setup()
            self._initialized = True

    # --------------------------------------------------------------
    # Setup logging system
    # --------------------------------------------------------------
    def _setup(self) -> None:
        logs_dir = Path("logs")
        logs_dir.mkdir(exist_ok=True)

        # ====================================
        # Force UTF-8 for stdout (Windows safe)
        # ====================================
        if sys.platform == "win32":
            stdout = sys.stdout
            if hasattr(stdout, "reconfigure"):
                try:
                    cast(io.TextIOWrapper, stdout).reconfigure(
                        encoding="utf-8",
                        errors="replace",
                    )
                except Exception:
                    pass

        root = logging.getLogger("LemoTick")
        root.setLevel(logging.INFO)
        root.handlers.clear()
        root.propagate = False

        # Console handler (safe for Windows)
        console = logging.StreamHandler(sys.stdout)
        console.setLevel(logging.INFO)
        console.setFormatter(
            ColoredFormatter("[%(asctime)s] %(levelname)s [%(name)s] %(message)s")
        )

        # File handler — main log
        file_handler = SafeRotatingFileHandler(
            logs_dir / "runtime.log",
            maxBytes=5_000_000,
            backupCount=5,
            encoding="utf-8",
        )
        file_handler.setLevel(logging.INFO)
        file_handler.setFormatter(StructuredFormatter())

        # Error handler
        error_handler = SafeRotatingFileHandler(
            logs_dir / "error.log",
            maxBytes=2_000_000,
            backupCount=2,
            encoding="utf-8",
        )
        error_handler.setLevel(logging.ERROR)
        error_handler.setFormatter(StructuredFormatter())

        root.addHandler(console)
        root.addHandler(file_handler)
        root.addHandler(error_handler)

        self.logger = root
        self.logger.info("Logger initialized successfully")

    # --------------------------------------------------------------
    # Generic logging wrapper
    # --------------------------------------------------------------
    def _log(
        self,
        level: int,
        message: str,
        extra_data: Optional[Dict[str, Any]] = None,
        exc_info: bool = False,
    ):
        assert self.logger is not None
        record = self.logger.makeRecord(
            self.logger.name,
            level,
            "",
            0,
            message,
            (),
            sys.exc_info() if exc_info else None,
        )
        if extra_data:
            record.extra_data = extra_data  # type: ignore[attr-defined]
        self.logger.handle(record)

    def debug(self, message: str, extra_data: Optional[Dict[str, Any]] = None):
        self._log(logging.DEBUG, message, extra_data)

    def info(self, message: str, extra_data: Optional[Dict[str, Any]] = None):
        self._log(logging.INFO, message, extra_data)

    def warning(self, message: str, extra_data: Optional[Dict[str, Any]] = None):
        self._log(logging.WARNING, message, extra_data)

    def error(
        self,
        message: str,
        extra_data: Optional[Dict[str, Any]] = None,
        exc_info: bool = False,
    ):
        self._log(logging.ERROR, message, extra_data, exc_info=exc_info)


# Singleton
logger = Logger()


# =====================================================================
# Backwards compatibility
# =====================================================================
def setup_logging() -> Logger:
    """Older modules still import this — keep for compatibility."""
    return Logger()
