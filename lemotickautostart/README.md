# LemoTick Autostart Bot

A professional Python trading bot for Deriv API using real-time streaming and triple indicator strategy.

## Project Structure

```
lemotickautostart/
├── src/lemotickautostart/
│   ├── __main__.py              # Entry point
│   ├── config.py                # Configuration management
│   ├── logger.py                # Logging setup
│   ├── api/
│   │   └── deriv.py             # Deriv API client
│   ├── core/
│   │   ├── bot.py               # Main trading bot
│   │   ├── position.py          # Position management
│   │   └── statistics.py        # Trade statistics
│   ├── indicators/
│   │   └── indicators.py        # RSI, MACD, Bollinger Bands, EMA
│   ├── models/
│   │   ├── candle.py            # Candle data model
│   │   └── signal.py            # Trading signal model
│   ├── services/
│   │   ├── connection_manager.py # WebSocket connection management
│   │   └── stream_manager.py    # Real-time data streaming
│   └── strategies/
│       └── triple_indicator.py  # Triple indicator strategy
├── .env                         # Configuration (API token, settings)
├── .env.example                 # Example configuration
├── pyproject.toml               # Project metadata
└── requirements.txt             # Python dependencies
```

## Quick Start

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Configure .env:**
   ```bash
   cp .env.example .env
   # Edit .env with your Deriv API token and settings
   ```

3. **Run the bot:**
   ```bash
   python -m lemotickautostart
   ```

## Configuration

Edit `.env` to customize:
- `DERIV_API_TOKEN` - Your Deriv API token
- `TRADING_MODE` - 'demo' or 'live'
- `SYMBOL` - Trading symbol (e.g., R_50)
- `TIMEFRAME` - Candle timeframe (e.g., 1m)
- `STAKE_AMOUNT` - Trade stake in USD
- `CONTRACT_DURATION` - Trade duration in minutes
- `RSI_OVERBOUGHT` / `RSI_OVERSOLD` - RSI thresholds
- `MAX_CONCURRENT_TRADES` - Maximum open trades

## Strategy

The bot uses a **Triple Indicator Strategy**:
- **RSI** - Momentum indicator (overbought/oversold detection)
- **MACD** - Trend confirmation
- **Bollinger Bands** - Volatility analysis
- **EMA** - Trend direction

Signals are generated when:
- **RISE**: RSI < RSI_OVERSOLD AND MACD histogram > threshold
- **FALL**: RSI > RSI_OVERBOUGHT AND MACD histogram < -threshold

## Trade Management

- **Max Concurrent Trades**: 3 (configurable)
- **Trade Cooldown**: 30 seconds between trades
- **Signal Cooldown**: 5 seconds between signal processing
- **Take Profit**: 40% (configurable)
- **Stop Loss**: Disabled (configurable)
- **Duration**: 5 minutes per trade

## Deployment

The bot runs as a systemd service on Linux:
```bash
systemctl start lemotickautostart.service
systemctl status lemotickautostart.service
```

## Monitoring

View real-time logs:
```bash
tail -f logs/bot.log
```

## Key Features

✅ Real-time WebSocket streaming from Deriv API
✅ Correct indicator calculations (RSI, MACD, Bollinger Bands, EMA)
✅ Trade cooldown and signal throttling
✅ Position tracking and statistics
✅ Comprehensive logging
✅ Configurable strategy parameters
✅ Demo and live trading modes
