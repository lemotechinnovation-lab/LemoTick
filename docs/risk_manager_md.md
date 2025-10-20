# Risk Manager (risk_manager.py)

## Purpose
The `RiskManager` handles position sizing, drawdown limits, daily metrics, and trading controls.

## Current Issues / Limitations
1. **Consecutive losses cooldown** is exponential but can escalate too quickly with small `cooldown_after_loss` values.
2. **Stake calculation** can exceed `max_stake` if `confidence_factor` and `volatility_factor` are high.
3. **Drawdown logic** only tracks peak equity; sudden equity drops may trigger emergency stop incorrectly.
4. **Binary options P&L calculation** is simplified and may not match real contract payouts.
5. **`force_always_trade`** overrides all risk checks, which could be dangerous if accidentally enabled.

## Proposed Fixes / Improvements
1. **Clamp cooldown escalation** to avoid extremely long cooldown periods.
   ```python
   cooldown_duration = min(cooldown_duration, 3600)  # 1 hour max
   ```

2. **Improve stake calculation:**  
   - Ensure stake never exceeds both `max_stake` and a percentage of current equity.

3. **Add emergency stop integration** for extreme drawdowns.
   ```python
   if current_drawdown > self.max_daily_drawdown * 2:
       self.emergency_stop("Critical drawdown")
   ```

4. **Binary options P&L:**  
   - Implement configurable payout ratio from config.
   ```python
   payout_ratio = config.trading.get("payout_ratio", 0.8)
   ```

5. **Daily metrics reset** should also reset `consecutive_losses` to ensure correct cooldown behavior.

6. **Add method to fetch current risk status** including `can_trade` reason for UI integration.

## Example Usage
```python
from risk_manager import RiskManager

rm = RiskManager(initial_equity=1000)
can_trade, reason = rm.can_trade()
stake = rm.calculate_stake(volatility=0.02, confidence=0.9)
print(can_trade, reason, stake)
```

