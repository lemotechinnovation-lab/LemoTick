# Utilities / Helpers (helpers.py)

## Purpose
This module provides helper functions for timestamping, ID generation, price and stake validation, numerical safety conversions, clamping values, calculating percentages, and other utility functions.

## Current Issues / Limitations
1. `sanitize_log_data` may fail if dictionary has nested structures; currently only sanitizes top-level keys.
2. `calculate_percentage_change` returns 0 when old value is 0, which might hide significant price jumps.
3. `clamp` and `calculate_kelly_fraction` do not validate input types (could raise TypeError on None).
4. Exponential backoff is simplistic; jitter is not included, which could cause retry thundering.

## Proposed Fixes / Improvements
1. **Sanitize nested dictionaries:**
   ```python
   def sanitize_log_data(data: Dict[str, Any]) -> Dict[str, Any]:
       sanitized = {}
       for key, value in data.items():
           if isinstance(value, dict):
               sanitized[key] = sanitize_log_data(value)
           elif any(sensitive in key.lower() for sensitive in ["token", "password", "secret", "key", "auth"]):
               sanitized[key] = "***REDACTED***"
           else:
               sanitized[key] = value
       return sanitized
   ```

2. **Handle zero old_value in percentage change more accurately:**
   ```python
   if old_value == 0:
       return float('inf') if new_value != 0 else 0.0
   ```

3. **Add type checking in clamp:**
   ```python
   if value is None:
       return min_val
   ```

4. **Exponential backoff with jitter:**
   ```python
   import random
   delay = base_delay * (2 ** attempt)
   delay = min(delay, max_delay)
   return delay * random.uniform(0.9, 1.1)  # ±10% jitter
   ```

5. **Optional verbose duration formatting:**
   - Could provide hours, minutes, seconds breakdown.

## Example Usage
```python
from helpers import get_timestamp, generate_trade_id, calculate_percentage_change

print(get_timestamp())
trade_id = generate_trade_id()
change_pct = calculate_percentage_change(100, 110)
print(trade_id, change_pct)
```

