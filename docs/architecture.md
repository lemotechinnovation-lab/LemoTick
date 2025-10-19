# LemoTick Architecture Documentation

## System Overview

LemoTick is a modular, production-ready trading bot designed for tick-level trading on Deriv API. The architecture emphasizes reliability, scalability, and maintainability.

## High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Deriv API     │───▶│  Stream Handler │───▶│ Strategy Engine │
│   WebSocket     │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                       │
                                ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Data Store    │◀───│  Risk Manager   │◀───│ Trade Executor  │
│   (SQLite/CSV)  │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
┌─────────────────┐    ┌─────────────────┐
│   Monitoring    │◀───│   Main Bot      │
│   & Logging     │    │   Orchestrator  │
└─────────────────┘    └─────────────────┘
```

## Core Components

### 1. Main Bot Orchestrator (`main.py`)

**Purpose**: Central coordinator that manages all components and the trading loop.

**Key Responsibilities**:
- Initialize and coordinate all components
- Manage the main trading loop
- Handle graceful shutdown
- Monitor overall system health

**Key Methods**:
- `start()`: Initialize and start all components
- `stop()`: Graceful shutdown of all components
- `_trading_loop()`: Main execution loop
- `_on_tick_received()`: Handle incoming tick data

### 2. Stream Handler (`stream_handler.py`)

**Purpose**: Manages WebSocket connection to Deriv API and handles tick data streaming.

**Key Responsibilities**:
- Establish and maintain WebSocket connection
- Handle authentication with Deriv API
- Process incoming tick messages
- Manage connection failures and reconnections
- Send trade execution messages

**Key Features**:
- Automatic reconnection with exponential backoff
- Ping/pong heartbeat mechanism
- Message parsing and validation
- Thread-safe message sending

### 3. Strategy Engine (`strategy_engine.py`)

**Purpose**: Implements trading strategy logic using technical indicators.

**Key Responsibilities**:
- Update technical indicators with new tick data
- Generate trading signals based on indicator combinations
- Filter signals using volatility and RSI conditions
- Track signal generation statistics

**Technical Indicators**:
- **EMA (Exponential Moving Average)**: Fast and slow EMAs for trend detection
- **Momentum**: Price change over short timeframes
- **Volatility**: Rolling standard deviation for market condition filtering
- **RSI**: Relative Strength Index for overbought/oversold filtering

**Signal Logic**:
```python
# BUY Signal
if ema_fast > ema_slow and momentum > threshold and volatility_valid and rsi_valid:
    return SignalType.BUY

# SELL Signal  
if ema_fast < ema_slow and momentum < -threshold and volatility_valid and rsi_valid:
    return SignalType.SELL
```

### 4. Risk Manager (`risk_manager.py`)

**Purpose**: Comprehensive risk management and position sizing.

**Key Responsibilities**:
- Calculate appropriate stake sizes based on volatility and equity
- Enforce daily drawdown limits
- Manage cooldown periods after losses
- Track performance metrics
- Prevent over-trading

**Risk Controls**:
- **Position Sizing**: Kelly criterion-based stake calculation
- **Daily Limits**: Maximum drawdown and trade count limits
- **Cooldown**: Escalating cooldown periods after consecutive losses
- **Equity Protection**: Minimum equity requirements

### 5. Trade Executor (`trade_executor.py`)

**Purpose**: Handles trade execution through Deriv API.

**Key Responsibilities**:
- Request proposals from Deriv API
- Execute buy orders using proposal IDs
- Track trade status and completion
- Handle trade result callbacks

**Trade Flow**:
1. Request proposal with contract parameters
2. Receive proposal with ask price
3. Execute buy order with proposal ID
4. Monitor contract completion
5. Handle final settlement

### 6. Data Recorder (`data_recorder.py`)

**Purpose**: Persists trading data for analysis and backtesting.

**Key Responsibilities**:
- Store tick data in SQLite database
- Record trade history and results
- Track performance metrics
- Export data for analysis
- Manage data retention

**Data Storage**:
- **Ticks**: Price and timestamp data
- **Trades**: Complete trade lifecycle data
- **Performance**: Daily and session metrics
- **Configuration**: Runtime configuration snapshots

### 7. Logger (`logger.py`)

**Purpose**: Centralized logging system with structured output.

**Key Features**:
- **Structured Logging**: JSON format for machine parsing
- **Multiple Outputs**: Console, file, and error-specific logs
- **Log Rotation**: Automatic file rotation with size limits
- **Colored Console**: Human-readable colored output
- **Performance Tracking**: Specialized logging for trades and metrics

## Data Flow

### 1. Tick Processing Flow

```
Deriv API → Stream Handler → Strategy Engine → Risk Manager → Trade Executor
                ↓                ↓               ↓              ↓
            Data Recorder ← Logger ← Logger ← Logger ← Logger
```

### 2. Signal Generation Flow

1. **Tick Arrival**: New price data received from Deriv
2. **Indicator Update**: Update EMA, momentum, volatility, RSI
3. **Signal Evaluation**: Check indicator combinations
4. **Risk Check**: Verify trading is allowed
5. **Stake Calculation**: Determine appropriate position size
6. **Trade Execution**: Place trade via Deriv API
7. **Result Handling**: Process trade completion

### 3. Risk Management Flow

```
Trade Signal → Risk Check → Position Sizing → Trade Execution → Result Processing
     ↓              ↓             ↓              ↓                ↓
Daily Limits → Cooldown → Equity Check → API Call → P&L Update
```

## Configuration System

### Configuration Hierarchy

1. **Default Settings**: Built-in defaults in code
2. **YAML Configuration**: `config/settings.yaml`
3. **Environment Variables**: `config/credentials.env`
4. **Runtime Overrides**: Command-line arguments

### Configuration Categories

- **Trading Parameters**: Symbols, durations, stakes
- **Risk Management**: Limits, cooldowns, sizing
- **Technical Indicators**: Periods, thresholds, filters
- **API Settings**: URLs, tokens, timeouts
- **Logging**: Levels, formats, outputs

## Error Handling

### Error Categories

1. **Connection Errors**: WebSocket disconnections, API failures
2. **Trading Errors**: Invalid orders, insufficient funds
3. **Data Errors**: Corrupted data, missing fields
4. **System Errors**: Memory issues, disk space

### Error Recovery

- **Automatic Reconnection**: WebSocket connection recovery
- **Graceful Degradation**: Continue operating with reduced functionality
- **Circuit Breakers**: Stop trading on repeated failures
- **Alert Mechanisms**: Notify operators of critical issues

## Performance Considerations

### Optimization Strategies

1. **Incremental Indicators**: Avoid recalculating full arrays
2. **Efficient Data Structures**: Use deque for rolling windows
3. **Minimal Database Operations**: Batch writes and use indexes
4. **Memory Management**: Limit historical data retention

### Monitoring

- **Latency Tracking**: Tick-to-signal-to-execution timing
- **Memory Usage**: Monitor for memory leaks
- **CPU Usage**: Track computational overhead
- **Network Performance**: WebSocket message rates

## Scalability

### Horizontal Scaling

- **Multiple Symbols**: Run separate bot instances per symbol
- **Load Distribution**: Distribute across multiple servers
- **Database Scaling**: Use external databases for high volume

### Vertical Scaling

- **Multi-threading**: Separate threads for different components
- **Async Operations**: Use asyncio for I/O operations
- **Caching**: Cache frequently accessed data

## Security

### API Security

- **Token Management**: Secure storage and rotation of API tokens
- **Environment Isolation**: Separate development and production environments
- **Network Security**: Use secure WebSocket connections

### Data Security

- **Encryption**: Encrypt sensitive data at rest
- **Access Control**: Limit database and file system access
- **Audit Logging**: Track all trading activities

## Deployment Architecture

### Docker Deployment

```
┌─────────────────┐
│   Docker Host   │
│                 │
│ ┌─────────────┐ │
│ │ LemoTick    │ │
│ │ Container   │ │
│ └─────────────┘ │
│                 │
│ ┌─────────────┐ │
│ │ Redis       │ │ (Optional)
│ │ Container   │ │
│ └─────────────┘ │
└─────────────────┘
```

### Monitoring Stack

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   LemoTick      │───▶│   Prometheus    │───▶│    Grafana      │
│   Bot           │    │   (Metrics)     │    │  (Dashboard)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Development Guidelines

### Code Organization

- **Modular Design**: Each component has a single responsibility
- **Interface Contracts**: Clear interfaces between components
- **Error Handling**: Comprehensive error handling and logging
- **Testing**: Unit tests for all components

### Best Practices

- **Configuration Management**: Externalize all configuration
- **Logging**: Comprehensive logging for debugging and monitoring
- **Documentation**: Clear documentation for all components
- **Version Control**: Proper versioning and change management

