# Strategy Quick Reference Card

## 🎯 Active Strategy: Triple EMA + MACD

### **One-Line Summary:**
Wait for 3 EMAs to align + MACD confirmation + 70%+ quality score = Trade

---

## 📊 Indicators (5 Total)

| Indicator | Period | Purpose |
|-----------|--------|---------|
| EMA-3 | 3 ticks | Fast response |
| EMA-8 | 8 ticks | Medium trend |
| EMA-21 | 21 ticks | Main trend |
| MACD | 3,8,3 | Momentum |
| ATR | 10 ticks | Volatility |

---

## ✅ BUY Signal

```
EMA-3 > EMA-8 > EMA-21  (all aligned)
Price > EMA-21          (structure)
MACD histogram > 0      (momentum)
Trend ≥ 2 ticks         (persistence)
Quality ≥ 70%           (scoring)
```

## ❌ SELL Signal

```
EMA-21 > EMA-8 > EMA-3  (reverse)
Price < EMA-21          (structure)
MACD histogram < 0      (momentum)
Trend ≥ 2 ticks         (persistence)
Quality ≥ 70%           (scoring)
```

---

## 💰 Position Sizing

**Base:** $1.50 (demo) / $2.00 (live)

**Win Streak:**
```
1 win  → +15% = $1.73
2 wins → +30% = $1.95
3 wins → +45% = $2.18
```

**Loss Streak:**
```
1 loss  → -25% = $1.13
2 losses → -50% = $0.75
```

---

## ⏱️ Contract Duration

**Adaptive (based on ATR):**
```
High volatility → 3 min
Medium → 5 min
Normal → 7 min
Low → 10 min
```

---

## 🛡️ Safety Limits

```
Max concurrent: 1 trade
Trade cooldown: 3 seconds
Max drawdown: 10-15%
Stop after: 5 losses
Max/hour: 10 trades
```

---

## 🎲 Market

**Primary:** R_100 (24/7 synthetic)  
**Backup:** R_75, R_50 (auto-rotation)

---

## 📈 Targets

```
Win Rate: 62-67%
Trades/Day: 40-60
Daily Profit: $12-20 (demo)
Max Drawdown: <10%
```

---

## 🚀 Launch Commands

**Demo:**
```batch
START_DEMO_TRADING.bat
```

**Live:**
```batch
START_LIVE_TRADING.bat
Type: YES, TRADE LIVE
```

---

**Strategy:** Triple EMA + MACD  
**Version:** 2.0  
**Status:** Production ✅

