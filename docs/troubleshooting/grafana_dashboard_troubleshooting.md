# Grafana Dashboard Troubleshooting Guide

This guide addresses common issues with the LemoTick Grafana dashboard and provides solutions.

## Common Dashboard Issues

### 1. Active Trades Panel Disappearing

**Symptom:** The "Active Trades" panel appears briefly and then disappears or resets to zero.

**Causes:**
- Inconsistent metric updates
- Race condition between metric updates
- Panel configuration issues

**Solutions:**
- The metric is now updated consistently in both `trade_executor.py` and `bot_engine.py`
- Added additional logging for active trades count
- Ensured metric is updated on every tick for real-time visibility

### 2. Daily Drawdown Always Shows Zero

**Symptom:** The "Daily Drawdown" panel always displays zero regardless of actual drawdown.

**Causes:**
- Missing metric updates in the risk manager
- Drawdown calculation not linked to metrics

**Solutions:**
- Added metrics instance to RiskManager initialization
- Added explicit drawdown metric updates in `can_trade()` method
- Added verification of metric updates with logging

### 3. Win/Loss Ratio Always Shows Zero

**Symptom:** The "Win/Loss Ratio" panel always displays zero despite completed trades.

**Causes:**
- Inconsistent win rate calculation
- Metric update issues
- Potential race conditions

**Solutions:**
- Enhanced win rate metric updates with verification
- Added recovery mechanism for failed updates
- Improved logging for win rate updates
- Added forced reset capability for mismatched values

## General Dashboard Troubleshooting

### Verifying Metrics in Prometheus

To verify if metrics are being properly collected:

1. Access the Prometheus UI (typically at http://localhost:9090)
2. Go to the "Graph" tab
3. Enter the metric name (e.g., `lemotick_active_trades`) in the query field
4. Click "Execute" to see if data is being collected

### Checking Metric Values

To check current metric values:

```bash
# Using curl to query the metrics endpoint
curl http://localhost:8000/

# Look for specific metrics in the output
grep "lemotick_active_trades" -A 1
grep "lemotick_daily_drawdown" -A 1
grep "lemotick_current_win_rate" -A 1
```

### Restarting Services

If metrics are still not updating properly:

1. Restart the Prometheus service:
   ```bash
   docker-compose restart prometheus
   ```

2. Restart Grafana:
   ```bash
   docker-compose restart grafana
   ```

3. Restart the bot (if necessary):
   ```bash
   docker-compose restart lemotick-bot
   ```

### Dashboard Configuration

If panels are still not displaying correctly:

1. Edit the panel and verify it's using the correct metric
2. Check that the query is properly formatted
3. Ensure "Instant" is set to "true" for stat panels
4. Try changing the visualization type temporarily to see if data appears

## Advanced Troubleshooting

### Checking Logs for Metric Updates

Monitor the bot logs for metric update messages:

```bash
docker-compose logs -f lemotick-bot | grep "metric"
```

### Verifying Prometheus Scrape Configuration

Check the Prometheus configuration to ensure it's scraping metrics correctly:

```bash
cat monitoring/prometheus.yml
```

Ensure the scrape interval is set appropriately (e.g., 1s for real-time updates).

### Manually Testing Metrics

You can manually test metrics by using the Python Prometheus client:

```python
from prometheus_client import Gauge, start_http_server

# Create a test metric
g = Gauge('test_metric', 'Test metric')
g.set(123.45)

# Start server
start_http_server(8001)

# Keep the script running
import time
while True:
    time.sleep(1)
```

Then check if this metric appears in Prometheus.

## Contact Support

If you continue experiencing issues with the dashboard after trying these solutions, please contact support with:

1. Screenshots of the problematic panels
2. Bot logs showing metric updates
3. Prometheus logs
4. Grafana logs
