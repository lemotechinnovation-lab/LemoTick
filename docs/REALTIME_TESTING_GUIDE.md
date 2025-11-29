# 🧪 Real-Time Integration Testing Guide

## 🎯 Quick Test

### 1. Start All Components

```bash
# Terminal 1: Start Backend
cd backend/API
dotnet run

# Terminal 2: Start Frontend
cd frontend
npm run dev

# Terminal 3: Start Bot (will auto-push ticks)
cd bot
python run_bot.py
```

### 2. Verify Real-Time Connection

1. **Login** to frontend (http://localhost:5173)
2. Navigate to **Dashboard**
3. Check **Live Trading Data** widget:
   - Status should show **"Live"** (green dot)
   - As bot runs, you'll see:
     - Real-time tick prices updating
     - Balance updates
     - Trade notifications
     - Portfolio metrics

## 🧪 Manual Test (Without Bot)

If you want to test without running the full bot:

```bash
# In bot directory
python test_realtime_push.py
```

This script will:
- Send 10 tick updates (2 seconds apart)
- Send balance update
- Send trade opened notification
- Send trade closed notification
- Send portfolio update

**Watch the frontend dashboard** - you should see all updates appear in real-time!

## 🔍 Troubleshooting

### Problem: "Disconnected" status

**Check 1: Is backend running?**
```bash
curl -k https://localhost:7001/api/health
# Should return 200 OK
```

**Check 2: Open browser DevTools → Console**
Look for SignalR errors. Common issues:
- `401 Unauthorized` → JWT token expired, re-login
- `Connection failed` → Backend not running
- `CORS error` → Check backend CORS config

**Check 3: Check browser DevTools → Network → WS (WebSocket)**
Should see connection to `wss://localhost:7001/tradingHub`
- Status: `101 Switching Protocols` (success)
- Messages tab should show frames

### Problem: Connected but no data

**Check 1: Is bot pushing data?**
Look at bot logs for:
```
[TICK] Tick update pushed: R_100 @ 1234.56
```

If not seeing this, bot may not be pushing. Run test script:
```bash
cd bot
python test_realtime_push.py
```

**Check 2: Backend logs**
```bash
# In backend terminal, look for:
Received tick update: R_100 @ 1234.56
Broadcast tick update: R_100 @ 1234.56
```

**Check 3: Frontend console**
Should see:
```
[TradingService] Received tick update: {symbol: 'R_100', price: 1234.56, ...}
```

### Problem: SSL/Certificate errors

**Quick Fix (Development)**:
In browser, visit `https://localhost:7001` directly and accept the certificate warning.

**Permanent Fix**:
Trust the ASP.NET development certificate:
```bash
dotnet dev-certs https --trust
```

### Problem: Bot won't start

**Check bot configuration**:
```yaml
# bot/config/settings.yaml
backend:
  backend_url: "https://localhost:7001"  # ← Must match backend port
  investor_id: "default-investor"
  portfolio_id: "00000000-0000-0000-0000-000000000001"
```

## 📊 What Data Flows

### Tick Updates (Every tick)
```
Deriv → Bot → Backend → SignalR → Frontend
Price: 1234.56
Symbol: R_100
Timestamp: 1700000000
```

### Balance Updates (On connection + trades)
```
Deriv → Bot → Backend → SignalR → Frontend
Balance: 1000.50 USD
```

### Trade Notifications (On open/close)
```
Bot → Backend → SignalR → Frontend
Trade: CALL R_100
Stake: $10
Status: OPEN/CLOSED
Profit: $15.50
```

### Portfolio Updates (Periodic)
```
Bot → Backend → SignalR → Frontend
Total Trades: 25
Win Rate: 60%
Net Profit: $100
ROI: 10%
```

## 🎨 Expected Frontend Behavior

### Live Trading Widget Shows:

1. **Connection Status**
   - 🟢 Green "Live" = Connected
   - 🟡 Yellow "Connecting..." = Connecting
   - 🔴 Red "Disconnected" = Not connected

2. **Latest Price**
   - Updates in real-time (every tick)
   - Shows price change with up/down arrows
   - Timestamp updates

3. **Mini Chart**
   - Builds up as ticks arrive
   - Shows last 30 ticks
   - Color-coded (green=up, red=down)

4. **Account Balance**
   - Updates when trades complete
   - Shows currency (USD)
   - Shows last update time

5. **Latest Trade**
   - Shows when trade opens/closes
   - Status badge (OPEN/CLOSED)
   - Profit/Loss amount

6. **Portfolio Stats**
   - Total trades
   - Win rate %
   - Net profit
   - ROI %

## 🚀 Advanced Testing

### Test Multiple Clients

1. Open multiple browser tabs
2. All should receive same updates
3. Each has independent SignalR connection

### Test Reconnection

1. Stop backend
2. Frontend shows "Disconnected"
3. Start backend
4. Frontend auto-reconnects within 5-30 seconds

### Test Portfolio Subscription

```typescript
// In browser console
import { tradingService } from '@/services/tradingService'

// Subscribe to specific portfolio
tradingService.subscribeToPortfolio('your-portfolio-id')

// Subscribe to all trades (admin)
tradingService.subscribeToAllTrades()
```

## 📝 Verification Checklist

- [ ] Backend running on port 7001
- [ ] Frontend running on port 5173
- [ ] Bot running and connected to Deriv
- [ ] Can login to frontend
- [ ] Live Trading Widget shows "Connected"
- [ ] Tick prices updating in real-time
- [ ] Browser console shows SignalR messages
- [ ] Backend logs show broadcast messages
- [ ] Bot logs show push messages

## 🎉 Success Indicators

✅ **Everything is working if you see:**

1. Live Trading Widget with green "Live" status
2. Prices updating every few seconds
3. Mini chart building up
4. Console logs show:
   ```
   [TradingService] Connected to TradingHub
   [TradingService] Received tick update: ...
   ```
5. Network tab shows active WebSocket connection
6. No errors in console or network tab

## 📚 Related Documentation

- [DERIV_REALTIME_INTEGRATION.md](./DERIV_REALTIME_INTEGRATION.md) - Full technical guide
- [BOT_MANAGEMENT_SYSTEM.md](./BOT_MANAGEMENT_SYSTEM.md) - Bot control
- [FRONTEND_BACKEND_CONNECTION_GUIDE.md](./FRONTEND_BACKEND_CONNECTION_GUIDE.md) - API setup

---

**Need Help?** Check bot logs, backend logs, and browser console for detailed error messages.

