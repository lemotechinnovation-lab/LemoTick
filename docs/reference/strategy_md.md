# Strategy Engine (strategy.py)

## Purpose
The `StrategyEngine` is responsible for generating trading signals based on multiple technical indicators including EMA, Momentum, RSI, Volatility, and Bollinger Bands. It also tracks trend persistence to avoid jittery signals.

## Current Issues / Limitations
1. **Bollinger Band filter logic** may block valid signals because the current comparison uses `price < upper_band * 0.99` and `price > lower_band * 1.01`, which may rarely be true.
2. **RSI filter** is always checked even if strategy config disables it.
3. **Trend persistence counters** (`uptrend_count` and `downtrend_count`) may accumulate indefinitely if a small EMA gap persists.
4. **Signal generation logging** can be verbose; currently logs for every HOLD signal are suppressed, but debugging could be needed in edge cases.
5. No direct support for **contract duration per symbol** from config.

## Proposed Fixes / Improvements
1. **Bollinger Band filter:**  
   - Adjust thresholds to allow more realistic entry points.
   ```python
   bollinger_filter = (price < upper_band * 1.01) and (price > lower_band * 0.99)
   ```

2. **Conditional RSI check:**  
   - Allow `rsi_filter` from config to enable or disable RSI constraints.
   ```python
   if config.strategy.rsi_filter:
       if not (self.rsi_oversold < rsi < self.rsi_overbought):
           return SignalType.HOLD
   ```

3. **Trend counter reset with dead-zone:**  
   - Introduce a small dead-zone below which counters reset to zero to avoid indefinite accumulation.

4. **Expose contract duration:**  
   - Add a method to fetch `symbol_duration` from config for use by trading logic.
   ```python
   def get_contract_duration(self, symbol: str) -> int:
       return config.trading.symbol_durations.get(symbol, config.trading.contract_duration)
   ```

5. **Optional verbose logging** for HOLD signals when debug mode is enabled.

## Example Usage
```python
from strategy import StrategyEngine

engine = StrategyEngine()
signal = engine.update(price=1.23456, timestamp=1690000000)
print(signal)
```

## Notes
- The `StrategyEngine` should integrate with `RiskManager` to ensure signals are executable.
- Future improvements: add **signal confirmation** over multiple ticks to reduce false signals.

