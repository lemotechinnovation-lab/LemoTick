// Bot Configuration Types

export interface BotConfig {
    bot: BotSettings
    trading: TradingSettings
    strategy: StrategySettings
    risk_management: RiskManagementSettings
    indicators: IndicatorSettings
    account_mode: AccountModeSettings
}

export interface BotSettings {
    name: string
    version: string
    debug: boolean
    log_level: 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR'
}

export interface TradingSettings {
    symbol: string
    contract_duration: number
    contract_basis: 'stake' | 'payout'
    base_stake: number
    max_stake: number
    min_stake: number
    max_concurrent_trades: number
    max_daily_loss: number
    emergency_stop_loss: number
    risk_per_trade: number
    take_profit_pct: number
    stop_loss_pct: number
    early_closure_enabled: boolean
    min_profit_threshold: number
    max_loss_threshold: number
}

export interface StrategySettings {
    candlestick_strategy: CandlestickStrategy
    fibonacci_enabled: boolean
    fibonacci_confidence_boost: number
    mean_reversion_enabled: boolean
    tick_pattern_enabled: boolean
}

export interface CandlestickStrategy {
    enabled: boolean
    min_pattern_confidence: number
    require_trend_confirmation: boolean
    require_momentum_confirmation: boolean
    quality_threshold: number
    ticks_per_candle: number
    candlestick_close_after_candles: number
}

export interface RiskManagementSettings {
    risk_per_trade: number
    max_daily_drawdown: number
    cooldown_seconds: number
    max_concurrent_trades: number
    force_always_trade: boolean
    win_rate_protection_enabled: boolean
    min_win_rate_threshold: number
    circuit_breaker_enabled: boolean
    circuit_breaker_losses: number
    daily_loss_limit: number
    daily_trade_limit: number
    equity_protection_enabled: boolean
    max_equity_drawdown: number
}

export interface IndicatorSettings {
    ema_short_period: number
    ema_medium_period: number
    ema_long_period: number
    rsi_period: number
    rsi_overbought: number
    rsi_oversold: number
    macd_fast: number
    macd_slow: number
    macd_signal: number
    atr_period: number
    bb_period: number
    bb_std_dev: number
}

export interface AccountModeSettings {
    use_live_account: boolean
    require_explicit_confirmation: boolean
}

// Form section types for UI organization
export type ConfigSection =
    | 'bot'
    | 'trading'
    | 'strategy'
    | 'risk_management'
    | 'indicators'
    | 'account_mode'

