"""
Configuration management for LemoTick Autostart Bot
"""

from typing import Optional
from pathlib import Path
from pydantic_settings import BaseSettings
from pydantic import Field, validator, ConfigDict
from dotenv import load_dotenv


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # Deriv API Configuration
    deriv_api_token: str = Field(..., alias="DERIV_API_TOKEN")
    deriv_app_id: str = Field(..., alias="DERIV_APP_ID")
    deriv_ws_url: str = Field(
        default="wss://ws.derivws.com/websockets/v3",
        alias="DERIV_WS_URL"
    )
    
    # Trading Configuration
    trading_mode: str = Field(default="demo", alias="TRADING_MODE")
    symbol: str = Field(default="R_50", alias="SYMBOL")
    timeframe: str = Field(default="1m", alias="TIMEFRAME")
    stake_amount: float = Field(default=2.0, alias="STAKE_AMOUNT")
    contract_duration: int = Field(default=5, alias="CONTRACT_DURATION")
    signal_confirmation_candles: int = Field(default=1, alias="SIGNAL_CONFIRMATION_CANDLES")
    
    # Strategy Configuration - EMA
    ema_fast_period: int = Field(default=4, alias="EMA_FAST_PERIOD")
    ema_slow_period: int = Field(default=12, alias="EMA_SLOW_PERIOD")
    
    # Strategy Configuration - RSI
    rsi_period: int = Field(default=6, alias="RSI_PERIOD")
    rsi_overbought: float = Field(default=70, alias="RSI_OVERBOUGHT")
    rsi_oversold: float = Field(default=30, alias="RSI_OVERSOLD")
    
    # Strategy Configuration - MACD
    macd_fast_period: int = Field(default=3, alias="MACD_FAST_PERIOD")
    macd_slow_period: int = Field(default=6, alias="MACD_SLOW_PERIOD")
    macd_signal_period: int = Field(default=6, alias="MACD_SIGNAL_PERIOD")
    macd_min_histogram: float = Field(default=0.01, alias="MACD_MIN_HISTOGRAM")
    
    # Strategy Configuration - Bollinger Bands
    bb_period: int = Field(default=20, alias="BB_PERIOD")
    bb_deviation: float = Field(default=2.0, alias="BB_DEVIATION")
    
    # Strategy Configuration - Tick Imbalance (High-Frequency)
    strategy_type: str = Field(default="triple_indicator", alias="STRATEGY_TYPE")
    tick_window: int = Field(default=12, alias="TICK_WINDOW")
    tick_imbalance_threshold: int = Field(default=8, alias="TICK_IMBALANCE_THRESHOLD")
    ema_fast_ti: int = Field(default=9, alias="EMA_FAST_TI")
    ema_slow_ti: int = Field(default=21, alias="EMA_SLOW_TI")
    atr_period_ti: int = Field(default=14, alias="ATR_PERIOD_TI")
    atr_min_threshold: float = Field(default=0.05, alias="ATR_MIN_THRESHOLD")
    
    # Risk Management
    take_profit_pct: float = Field(default=0.40, alias="TAKE_PROFIT_PCT")
    stop_loss_pct: float = Field(default=0.0, alias="STOP_LOSS_PCT")
    take_profit_points: int = Field(default=5, alias="TAKE_PROFIT_POINTS")
    stop_loss_points: int = Field(default=2, alias="STOP_LOSS_POINTS")
    break_even_points: int = Field(default=3, alias="BREAK_EVEN_POINTS")
    break_even_lock_points: int = Field(default=1, alias="BREAK_EVEN_LOCK_POINTS")
    max_daily_loss: float = Field(default=500.0, alias="MAX_DAILY_LOSS")
    max_concurrent_trades: int = Field(default=1, alias="MAX_CONCURRENT_TRADES")
    risk_per_trade: float = Field(default=0.0018, alias="RISK_PER_TRADE")
    trade_cooldown_seconds: int = Field(default=10, alias="TRADE_COOLDOWN_SECONDS")
    max_trades_per_7_minutes: int = Field(default=3, alias="MAX_TRADES_PER_7_MINUTES")
    
    # Hedging Configuration
    enable_hedge: bool = Field(default=False, alias="ENABLE_HEDGE")
    hedge_trigger_pips: float = Field(default=-5, alias="HEDGE_TRIGGER_PIPS")
    hedge_close_profit: float = Field(default=2, alias="HEDGE_CLOSE_PROFIT")
    
    # Logging
    log_level: str = Field(default="DEBUG", alias="LOG_LEVEL")
    log_file: str = Field(default="logs/lemotickautostart.log", alias="LOG_FILE")
    
    # Monitoring
    enable_metrics: bool = Field(default=True, alias="ENABLE_METRICS")
    prometheus_port: int = Field(default=9092, alias="PROMETHEUS_PORT")
    
    # Backend Integration
    backend_url: Optional[str] = Field(default=None, alias="BACKEND_URL")
    backend_api_token: Optional[str] = Field(default=None, alias="BACKEND_API_TOKEN")
    backend_enabled: bool = Field(default=False, alias="BACKEND_ENABLED")
    portfolio_id: Optional[str] = Field(default=None, alias="PORTFOLIO_ID")
    investor_id: Optional[str] = Field(default=None, alias="INVESTOR_ID")
    
    # SignalR Integration
    signalr_url: Optional[str] = Field(default=None, alias="SIGNALR_URL")
    signalr_token: Optional[str] = Field(default=None, alias="SIGNALR_TOKEN")
    signalr_enabled: bool = Field(default=False, alias="SIGNALR_ENABLED")
    
    # Database
    database_url: str = Field(default="sqlite:///./lemotickautostart.db", alias="DATABASE_URL")
    
    # Notifications
    enable_notifications: bool = Field(default=False, alias="ENABLE_NOTIFICATIONS")
    
    # Gmail Configuration
    gmail_enabled: bool = Field(default=False, alias="GMAIL_ENABLED")
    gmail_sender: Optional[str] = Field(default=None, alias="GMAIL_SENDER")
    gmail_password: Optional[str] = Field(default=None, alias="GMAIL_PASSWORD")
    gmail_recipient: Optional[str] = Field(default=None, alias="GMAIL_RECIPIENT")
    
    # Advanced Configuration
    enable_multi_timeframe: bool = Field(default=False, alias="ENABLE_MULTI_TIMEFRAME")
    secondary_timeframe: str = Field(default="5m", alias="SECONDARY_TIMEFRAME")
    enable_adaptive_params: bool = Field(default=False, alias="ENABLE_ADAPTIVE_PARAMS")
    min_volatility: float = Field(default=0.5, alias="MIN_VOLATILITY")
    max_volatility: float = Field(default=100.0, alias="MAX_VOLATILITY")
    trading_hours: str = Field(default="00:00-23:59", alias="TRADING_HOURS")
    trading_days: str = Field(default="MON,TUE,WED,THU,FRI,SAT,SUN", alias="TRADING_DAYS")
    
    model_config = ConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )
    
    @classmethod
    def load(cls, env_file: Optional[str] = None) -> "Settings":
        """
        Load configuration from environment file.
        
        Args:
            env_file: Path to .env file (default: .env in current directory)
        
        Returns:
            Configuration instance
        """
        if env_file:
            load_dotenv(env_file, override=True)
        else:
            # Always try to load from lemotickautostart/.env first (override=True)
            load_dotenv("/root/lemotickautostart/.env", override=True)
            # Then try other locations
            for path in [".env", "lemotickautostart/.env", "config/.env", "../.env"]:
                if Path(path).exists():
                    load_dotenv(path, override=True)
                    break
        
        return cls()
    
    @validator("trading_mode")
    def validate_trading_mode(cls, v):
        if v.lower() not in ["demo", "live"]:
            raise ValueError("trading_mode must be 'demo' or 'live'")
        return v.lower()
    
    @validator("log_level")
    def validate_log_level(cls, v):
        valid_levels = ["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"]
        if v.upper() not in valid_levels:
            raise ValueError(f"log_level must be one of {valid_levels}")
        return v.upper()
    
    @validator("stake_amount")
    def validate_stake_amount(cls, v):
        if v <= 0:
            raise ValueError("stake_amount must be positive")
        return v
    
    @validator("risk_per_trade")
    def validate_risk_per_trade(cls, v):
        if v <= 0 or v > 0.05:  # Max 5% per trade
            raise ValueError("risk_per_trade must be between 0 and 0.05")
        return v


def get_settings() -> Settings:
    """Get application settings"""
    return Settings()
