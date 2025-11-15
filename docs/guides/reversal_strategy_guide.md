# Reversal Strategy Guide - Close & Reverse on Signal Change

## Overview

The **Reversal Strategy** automatically closes your current position and opens an opposite position when the market signal changes direction. This allows the bot to quickly adapt to changing market conditions.

## How It Works

### Signal Detection
The bot continuously monitors for new trading signals (BUY/SELL). When a new signal is opposite to the current open position:

- **Current Position: Rise (BUY)** + **New Signal: SELL** → Triggers reversal
- **Current Position: Fall (SELL)** + **New Signal: BUY** → Triggers reversal

### Reversal Process

1. **Detection**: New signal is opposite to current position
2. **Validation**: Checks reversal conditions (age, profit, etc.)
3. **Close Current**: Closes the current position early
4. **Open Opposite**: Automatically opens new position in opposite direction

### Configuration

Located in `bot/config/settings.yaml` under `trading` section:

```yaml
trading:
  # Reversal Strategy Settings
  reversal_strategy_enabled: true      # Enable/disable reversal strategy
  reversal_min_profit: -10.0           # Minimum profit % to allow reversal
  reversal_max_age_seconds: 180        # Only reverse trades younger than 3 minutes
  reversal_signal_strength_min: 0.6    # Minimum signal strength (future use)
```

### Parameters Explained

#### `reversal_strategy_enabled` (true/false)
- **true**: Reversal strategy is active
- **false**: Reversal strategy is disabled (normal trading)

#### `reversal_min_profit` (-10.0 default)
- Minimum profit percentage required to allow reversal
- **Negative values** allow reversals even when position is at a loss
- Examples:
  - `-10.0` = Allow reversal if loss is less than 10%
  - `0.0` = Only reverse profitable or breakeven positions
  - `5.0` = Only reverse if profit is at least 5%

#### `reversal_max_age_seconds` (180 default)
- Maximum age of contract (in seconds) to allow reversal
- Prevents reversing contracts that are close to expiry
- **180 seconds = 3 minutes**
- Set lower for more aggressive reversals, higher for more conservative

## Examples

### Example 1: Quick Reversal (Profitable)

```
1. Open BUY position at $100.00 (stake: $2.00)
2. Price moves to $100.50 (estimated profit: +0.4%)
3. New SELL signal detected (market reversing)
4. Contract age: 45 seconds ✅ (< 180s limit)
5. Profit: +0.4% ✅ (> -10% minimum)
6. ACTION: Close BUY position, open SELL position
```

### Example 2: Reversal with Small Loss

```
1. Open SELL position at $100.00 (stake: $2.00)
2. Price moves to $100.20 (estimated loss: -0.16%)
3. New BUY signal detected (market reversing)
4. Contract age: 60 seconds ✅ (< 180s limit)
5. Loss: -0.16% ✅ (> -10% minimum)
6. ACTION: Close SELL position, open BUY position
```

### Example 3: Reversal Rejected (Too Old)

```
1. Open BUY position at $100.00 (stake: $2.00)
2. Price moves to $100.10 (estimated profit: +0.08%)
3. New SELL signal detected
4. Contract age: 200 seconds ❌ (> 180s limit)
5. ACTION: Keep current position, ignore new signal
```

### Example 4: Reversal Rejected (Too Much Loss)

```
1. Open SELL position at $100.00 (stake: $2.00)
2. Price moves to $101.50 (estimated loss: -12%)
3. New BUY signal detected
4. Contract age: 90 seconds ✅ (< 180s limit)
5. Loss: -12% ❌ (< -10% minimum)
6. ACTION: Keep current position, let it expire naturally
```

## Advantages

✅ **Quick Adaptation**: Immediately responds to market direction changes
✅ **Loss Limitation**: Can cut losses early when market reverses
✅ **Profit Capture**: Locks in profits when direction changes
✅ **Automated**: No manual intervention required

## Considerations

⚠️ **Transaction Costs**: Each reversal involves two transactions (close + open)
⚠️ **Signal Quality**: Requires good signal quality to avoid excessive reversals
⚠️ **Slippage**: Price may move between close and open

## Monitoring

The bot logs reversal events with these markers:

```
🔄 REVERSAL TRIGGERED! Closing BUY position to open SELL position
   Contract age: 45s, Estimated profit: +0.4%
✅ Reversal initiated - will open SELL position after current position closes
🔄 EXECUTING PENDING REVERSAL: Opening SELL position
✅ Reversal trade executed via callback: SELL at 100.25
```

## Best Practices

### Aggressive Reversal Settings
For markets with frequent reversals:
```yaml
reversal_min_profit: -15.0           # Accept larger losses
reversal_max_age_seconds: 240        # Longer timeframe (4 minutes)
```

### Conservative Reversal Settings
For stable markets or cautious trading:
```yaml
reversal_min_profit: 0.0             # Only reverse profitable positions
reversal_max_age_seconds: 120        # Shorter timeframe (2 minutes)
```

### Disable Reversal
To disable and return to normal trading:
```yaml
reversal_strategy_enabled: false     # Turn off reversals
```

## Technical Implementation

### Files Modified
1. **`bot/config/settings.yaml`**: Configuration settings
2. **`bot/src/core/bot_engine.py`**: Reversal detection and execution logic
3. **`bot/src/trade_executor.py`**: Pending reversal management

### Code Flow
```
1. New signal received → _on_tick_received()
2. Check for reversal → _check_and_execute_reversal()
3. Validate conditions (age, profit, direction)
4. Register pending reversal → trade_executor.register_pending_reversal()
5. Close current position → _close_contract_early()
6. Wait for sell confirmation → handle_sell_response()
7. Execute reversal → _execute_pending_reversal()
8. Open opposite position → _execute_reversal_trade()
```

## Testing

To test the reversal strategy:

1. Enable in config:
   ```yaml
   reversal_strategy_enabled: true
   ```

2. Set permissive thresholds for testing:
   ```yaml
   reversal_min_profit: -20.0
   reversal_max_age_seconds: 300
   ```

3. Monitor logs for reversal markers: `🔄`

4. Verify:
   - Current position closes when opposite signal appears
   - New position opens automatically
   - Only one position active at a time

## Troubleshooting

### Reversal Not Triggering
- Check `reversal_strategy_enabled: true`
- Verify contract age < `reversal_max_age_seconds`
- Verify profit > `reversal_min_profit`
- Confirm signal is opposite to current position

### Too Many Reversals
- Increase `reversal_min_profit` (e.g., to 0.0 or positive)
- Decrease `reversal_max_age_seconds` (e.g., to 60 seconds)
- Improve signal quality thresholds

### Reversal Not Completing
- Check logs for callback registration: "Reversal callback registered"
- Verify sell response is received
- Check for errors in `_execute_pending_reversal()`

## Support

For issues or questions about the reversal strategy, check:
- Bot logs: `bot/logs/runtime.log`
- Grafana dashboard: Monitor active trades and P&L
- Configuration: `bot/config/settings.yaml`

