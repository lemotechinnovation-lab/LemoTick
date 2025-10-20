# LemoTick Monitoring Setup Guide

## 🎯 Overview

This guide shows you how to set up comprehensive monitoring for your LemoTick trading bot using Prometheus, Loki, and Grafana.

## 📊 What You'll Get

### **Real-time Dashboards:**
- Trading performance metrics
- Technical indicator values
- System health monitoring
- Risk management alerts

### **Alerting System:**
- Critical alerts (high drawdown, connection loss)
- Warning alerts (performance issues)
- Info alerts (trading activity)

### **Log Aggregation:**
- Centralized log storage
- Structured log search
- Performance analysis

## 🚀 Quick Start

### **1. Start Monitoring Stack**
```bash
# Start all monitoring services
python setup_monitoring.py

# Or manually with Docker Compose
docker-compose -f docker-compose.monitoring.yml up -d
```

### **2. Access Dashboards**
- **Grafana**: http://localhost:3000 (admin/admin)
- **Prometheus**: http://localhost:9090
- **Loki**: http://localhost:3100

### **3. Start Your Bot**
```bash
# Bot will automatically expose metrics on port 8000
python -m src
```

## 📈 Dashboard Panels

### **Trading Performance**
- **Current Equity**: Real-time account balance
- **Daily Drawdown**: Risk monitoring
- **Win/Loss Ratio**: Trading success rate
- **Trades Over Time**: Activity patterns

### **Technical Indicators**
- **EMA Fast/Slow**: Trend analysis
- **Momentum**: Price movement strength
- **Volatility**: Market conditions
- **RSI**: Overbought/oversold levels

### **System Health**
- **WebSocket Status**: Connection monitoring
- **Processing Latency**: Performance metrics
- **Database Operations**: Data persistence health
- **Signal Generation**: Trading logic activity

## 🚨 Alerting Rules

### **Critical Alerts**
- **High Drawdown**: >5% daily drawdown
- **WebSocket Disconnected**: No connection to Deriv
- **Low Equity**: Account balance <$1000

### **Warning Alerts**
- **Excessive Reconnections**: Network instability
- **High Loss Rate**: >70% recent losses
- **High Processing Latency**: >100ms tick processing

### **Info Alerts**
- **No Trades**: Extended inactivity
- **No Signals**: Market conditions not met
- **Excessive Filtering**: High signal rejection rate

## 🔧 Customization Options

### **1. Dashboard Customization**

#### **Add Custom Panels:**
```json
{
  "title": "Custom Metric",
  "type": "graph",
  "targets": [
    {
      "expr": "your_custom_metric",
      "legendFormat": "Custom Value"
    }
  ]
}
```

#### **Modify Refresh Intervals:**
- **Real-time**: 1s (for active trading)
- **Standard**: 5s (default)
- **Overview**: 30s (for long-term trends)

### **2. Alerting Customization**

#### **Adjust Thresholds:**
```yaml
# In monitoring/lemotick_rules.yml
- alert: CustomAlert
  expr: your_metric > your_threshold
  for: 2m
  labels:
    severity: warning
```

#### **Add Notification Channels:**
- **Email**: SMTP configuration
- **Slack**: Webhook integration
- **Discord**: Bot notifications
- **Telegram**: Bot messages

### **3. Metrics Customization**

#### **Add Custom Metrics:**
```python
# In src/metrics.py
self.custom_metric = Counter(
    'lemotick_custom_total',
    'Custom metric description'
)
```

#### **Modify Collection Intervals:**
```yaml
# In monitoring/prometheus.yml
scrape_interval: 5s  # More frequent collection
```

## 📊 Advanced Monitoring

### **1. Performance Analysis**

#### **Latency Monitoring:**
- Tick processing time
- Trade execution time
- Database operation latency
- WebSocket response time

#### **Throughput Monitoring:**
- Trades per minute
- Signals per minute
- Database operations per minute
- Log entries per minute

### **2. Business Metrics**

#### **Trading Performance:**
- Profit factor
- Sharpe ratio
- Maximum drawdown
- Win rate
- Average trade duration

#### **Risk Metrics:**
- Current equity
- Daily P&L
- Position sizing
- Risk per trade
- Cooldown status

### **3. System Metrics**

#### **Resource Usage:**
- CPU utilization
- Memory usage
- Disk I/O
- Network traffic

#### **Application Health:**
- Error rates
- Exception counts
- Database connections
- WebSocket stability

## 🔍 Troubleshooting

### **Common Issues:**

#### **1. Metrics Not Appearing**
```bash
# Check if metrics endpoint is accessible
curl http://localhost:8000/metrics

# Check Prometheus targets
# Go to http://localhost:9090/targets
```

#### **2. Alerts Not Firing**
```bash
# Check alert rules
# Go to http://localhost:9090/alerts

# Verify rule syntax
promtool check rules monitoring/lemotick_rules.yml
```

#### **3. Logs Not Appearing in Loki**
```bash
# Check Promtail logs
docker logs promtail

# Verify log file paths
# Check monitoring/promtail.yml configuration
```

### **Performance Optimization:**

#### **1. Reduce Metrics Collection**
```yaml
# In monitoring/prometheus.yml
scrape_interval: 30s  # Less frequent collection
```

#### **2. Optimize Dashboard Queries**
- Use shorter time ranges
- Reduce panel refresh rates
- Limit concurrent queries

#### **3. Log Retention**
```yaml
# In monitoring/loki.yml
limits_config:
  max_chunk_age: 1h
  chunk_target_size: 1048576
```

## 📚 Additional Resources

### **Documentation:**
- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [Loki Documentation](https://grafana.com/docs/loki/)

### **Best Practices:**
- Set up proper alerting thresholds
- Monitor system resources
- Regular backup of configurations
- Test alerting rules regularly

### **Security Considerations:**
- Use strong passwords
- Enable HTTPS in production
- Restrict network access
- Regular security updates

## 🎯 Next Steps

1. **Customize dashboards** for your specific needs
2. **Set up notification channels** for alerts
3. **Create custom metrics** for business logic
4. **Implement log analysis** for debugging
5. **Set up automated backups** of configurations

Your LemoTick bot now has enterprise-grade monitoring! 🚀
