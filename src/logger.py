"""
Centralized logging system for LemoTick bot.
Provides structured logging with file rotation and console output.
"""

import logging
import logging.handlers
import sys
import json
import time
from pathlib import Path
from typing import Any, Dict
from datetime import datetime
from .config import config


class StructuredFormatter(logging.Formatter):
    """Custom formatter for structured JSON logging."""
    
    def format(self, record: logging.LogRecord) -> str:
        """Format log record as structured JSON."""
        log_entry = {
            'timestamp': datetime.utcnow().isoformat() + 'Z',
            'level': record.levelname,
            'logger': record.name,
            'message': record.getMessage(),
            'module': record.module,
            'function': record.funcName,
            'line': record.lineno
        }
        
        # Add exception info if present
        if record.exc_info:
            log_entry['exception'] = self.formatException(record.exc_info)
        
        # Add extra fields
        if hasattr(record, 'extra_data'):
            log_entry['extra'] = record.extra_data
        
        return json.dumps(log_entry, ensure_ascii=False)


class ColoredFormatter(logging.Formatter):
    """Colored formatter for console output."""
    
    COLORS = {
        'DEBUG': '\033[36m',      # Cyan
        'INFO': '\033[32m',       # Green
        'WARNING': '\033[33m',    # Yellow
        'ERROR': '\033[31m',      # Red
        'CRITICAL': '\033[35m',   # Magenta
        'RESET': '\033[0m'        # Reset
    }
    
    def format(self, record: logging.LogRecord) -> str:
        """Format log record with colors."""
        # Add color to level name
        level_color = self.COLORS.get(record.levelname, self.COLORS['RESET'])
        record.levelname = f"{level_color}{record.levelname}{self.COLORS['RESET']}"
        
        # Format timestamp
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        
        # Create formatted message
        message = f"[{timestamp}] {record.levelname} [{record.name}] {record.getMessage()}"
        
        # Add exception info if present
        if record.exc_info:
            message += f"\n{self.formatException(record.exc_info)}"
        
        return message


class Logger:
    """Centralized logger for LemoTick bot."""
    
    _instance = None
    _initialized = False
    
    def __new__(cls):
        """Singleton pattern implementation."""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        """Initialize logger if not already initialized."""
        if not self._initialized:
            self._setup_logging()
            self._initialized = True
    
    def _setup_logging(self) -> None:
        """Setup logging configuration."""
        # Create logs directory
        logs_dir = Path("logs")
        logs_dir.mkdir(exist_ok=True)
        
        # Get log level from config
        log_level = getattr(logging, config.log_level.upper(), logging.INFO)
        
        # Create root logger
        self.logger = logging.getLogger('LemoTick')
        self.logger.setLevel(log_level)
        
        # Clear any existing handlers
        self.logger.handlers.clear()
        
        # Console handler with colored output
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(log_level)
        console_formatter = ColoredFormatter(
            fmt='[%(asctime)s] %(levelname)s [%(name)s] %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        console_handler.setFormatter(console_formatter)
        self.logger.addHandler(console_handler)
        
        # File handler with structured JSON logging
        file_handler = logging.handlers.RotatingFileHandler(
            logs_dir / 'runtime.log',
            maxBytes=10*1024*1024,  # 10MB
            backupCount=5
        )
        file_handler.setLevel(log_level)
        file_formatter = StructuredFormatter()
        file_handler.setFormatter(file_formatter)
        self.logger.addHandler(file_handler)
        
        # Error file handler for errors and above
        error_handler = logging.handlers.RotatingFileHandler(
            logs_dir / 'error.log',
            maxBytes=5*1024*1024,   # 5MB
            backupCount=3
        )
        error_handler.setLevel(logging.ERROR)
        error_handler.setFormatter(file_formatter)
        self.logger.addHandler(error_handler)
        
        # Prevent propagation to root logger
        self.logger.propagate = False
        
        # Log initialization
        self.info("Logger initialized successfully")
    
    def debug(self, message: str, extra_data: Dict[str, Any] = None) -> None:
        """Log debug message."""
        self._log(logging.DEBUG, message, extra_data)
    
    def info(self, message: str, extra_data: Dict[str, Any] = None) -> None:
        """Log info message."""
        self._log(logging.INFO, message, extra_data)
    
    def warning(self, message: str, extra_data: Dict[str, Any] = None) -> None:
        """Log warning message."""
        self._log(logging.WARNING, message, extra_data)
    
    def error(self, message: str, extra_data: Dict[str, Any] = None) -> None:
        """Log error message."""
        self._log(logging.ERROR, message, extra_data)
    
    def critical(self, message: str, extra_data: Dict[str, Any] = None) -> None:
        """Log critical message."""
        self._log(logging.CRITICAL, message, extra_data)
    
    def _log(self, level: int, message: str, extra_data: Dict[str, Any] = None) -> None:
        """Internal logging method."""
        # Create log record with extra data
        record = self.logger.makeRecord(
            self.logger.name, level, "", 0, message, (), None
        )
        
        if extra_data:
            record.extra_data = extra_data
        
        self.logger.handle(record)
    
    def log_trade(self, trade_data: Dict[str, Any]) -> None:
        """Log trade-specific information."""
        self.info(f"Trade executed: {trade_data.get('trade_id', 'unknown')}", {
            'trade_type': 'execution',
            'trade_data': trade_data
        })
    
    def log_signal(self, signal_type: str, price: float, indicators: Dict[str, Any]) -> None:
        """Log signal generation."""
        self.info(f"Signal generated: {signal_type} at {price}", {
            'signal_type': 'generation',
            'signal': signal_type,
            'price': price,
            'indicators': indicators
        })
    
    def log_performance(self, performance_data: Dict[str, Any]) -> None:
        """Log performance metrics."""
        self.info("Performance metrics updated", {
            'metrics_type': 'performance',
            'data': performance_data
        })
    
    def log_api_call(self, endpoint: str, method: str, status_code: int, 
                    duration: float, response_size: int = 0) -> None:
        """Log API call information."""
        self.info(f"API call: {method} {endpoint} - {status_code} ({duration:.3f}s)", {
            'api_type': 'call',
            'endpoint': endpoint,
            'method': method,
            'status_code': status_code,
            'duration': duration,
            'response_size': response_size
        })
    
    def log_risk_event(self, event_type: str, details: Dict[str, Any]) -> None:
        """Log risk management events."""
        self.warning(f"Risk event: {event_type}", {
            'risk_type': 'event',
            'event': event_type,
            'details': details
        })
    
    def set_level(self, level: str) -> None:
        """Change logging level dynamically."""
        try:
            new_level = getattr(logging, level.upper())
            self.logger.setLevel(new_level)
            
            # Update all handlers
            for handler in self.logger.handlers:
                handler.setLevel(new_level)
            
            self.info(f"Log level changed to {level}")
        except AttributeError:
            self.error(f"Invalid log level: {level}")
    
    def get_handler_stats(self) -> Dict[str, Any]:
        """Get statistics about log handlers."""
        stats = {
            'handlers': len(self.logger.handlers),
            'level': logging.getLevelName(self.logger.level),
            'handlers_info': []
        }
        
        for handler in self.logger.handlers:
            handler_info = {
                'type': type(handler).__name__,
                'level': logging.getLevelName(handler.level),
                'formatter': type(handler.formatter).__name__ if handler.formatter else None
            }
            
            # Add file-specific info
            if hasattr(handler, 'baseFilename'):
                handler_info['filename'] = handler.baseFilename
                if hasattr(handler, 'maxBytes'):
                    handler_info['max_bytes'] = handler.maxBytes
                if hasattr(handler, 'backupCount'):
                    handler_info['backup_count'] = handler.backupCount
            
            stats['handlers_info'].append(handler_info)
        
        return stats


# Global logger instance
logger = Logger()


# Convenience functions for easy access
def debug(message: str, extra_data: Dict[str, Any] = None) -> None:
    """Log debug message."""
    logger.debug(message, extra_data)


def info(message: str, extra_data: Dict[str, Any] = None) -> None:
    """Log info message."""
    logger.info(message, extra_data)


def warning(message: str, extra_data: Dict[str, Any] = None) -> None:
    """Log warning message."""
    logger.warning(message, extra_data)


def error(message: str, extra_data: Dict[str, Any] = None) -> None:
    """Log error message."""
    logger.error(message, extra_data)


def critical(message: str, extra_data: Dict[str, Any] = None) -> None:
    """Log critical message."""
    logger.critical(message, extra_data)

