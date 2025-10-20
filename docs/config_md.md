# Configuration (config.yaml)

## Purpose
Holds all runtime parameters for backtesting, indicators, trading, risk management, logging, monitoring, and development modes.

## Current Issues / Limitations
1. `force_always_trade: true` in production could bypass all safety checks.
2. Volatility min/max values (0.05 - 0.50) may be too wide for some symbols.
3. RSI filter is disabled (`rsi_filter: false`) but thresholds are defined; could be confusing.
4. Redundant fields: `risk.max_concurrent_trades` and `risk_management.max_concurrent_trades` may conflict.
5. Contract durations for symbols are hardcoded; should be flexible for dynamic addition.

## Proposed Fixes / Improvements
1. **Separate production vs simulation configs:**
   - Ensure `force_always_trade` is only `true` in simulation or testing.

2. **Volatility min/max sanity check:**
   - Add validation at startup to prevent misconfiguration.

3. **Signal filters:**
   - Enable/disable indicators based on strategy config to avoid unused parameters.

4. **Merge redundant max_concurrent_trades:**
   - Use a single canonical value from `risk_management.max_concurrent_trades`.

5. **Symbol durations:**
   - Make symbol durations dynamically configurable via dictionary with defaults.

## Example Usage
```yaml
trading:
  symbol: 1HZ100V
  contract_duration: 15
  contract_duration_unit: s
  symbol_durations:
    1HZ100V: 10
    1HZ50V: 7
```

## Notes
- Keep separate sections for backtesting and live trading parameters.
- Validate YAML against schema at startup to catch errors early.

