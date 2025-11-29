# ⚡ Quick Start - Real-Time Integration Test

## 🎯 **3-Step Test** (5 minutes)

### **Step 1: Start Backend** ✅ (DONE - Running in background)

The backend is now running on `https://localhost:7001`

### **Step 2: Open Frontend & Login**

```bash
# In a NEW terminal:
cd C:\Users\leonardm\source\innovations\LemoTick\frontend
npm run dev
```

Then:
1. Open browser: `http://localhost:5173`
2. **Login** with your credentials
3. Go to **Dashboard**
4. Look for **"Live Trading Data"** widget

### **Step 3: Run Test Script**

```bash
# In ANOTHER terminal:
cd C:\Users\leonardm\source\innovations\LemoTick\bot
python test_realtime_push.py
```

## 🎬 **What You'll See**

### In Terminal (Test Script):
```
[TICK] Pushing tick updates...
  [OK] Tick 1: R_100 @ 1234.56789
  [OK] Tick 2: R_100 @ 1235.12345
  ...
[BALANCE] Pushing balance update...
  [OK] Balance update
[TRADE] Pushing trade opened...
  [OK] Trade opened
```

### In Frontend Dashboard:
- **Live Trading Data** widget shows:
  - 🟢 **"Live"** (green dot) = Connected!
  - **Latest Price** updating in real-time
  - **Mini Chart** building up
  - **Account Balance**: USD 1,000.50
  - **Latest Trade**: CALL R_100
  - **Portfolio Stats**: 25 trades, 60% win rate

### In Browser Console (F12):
```
[TradingService] Connected to TradingHub
[TradingService] Received tick update: {symbol: 'R_100', price: 1234.56, ...}
[TradingService] Received balance update: {balance: 1000.50, ...}
[TradingService] Received trade opened: {...}
```

## 🚨 **Troubleshooting**

### ❌ "Disconnected" Status

**Check 1**: Is backend running?
```bash
curl -k https://localhost:7001/api/health
# Should return: Healthy
```

**Check 2**: Are you logged in?
- Must be logged into frontend
- JWT token must be valid

**Check 3**: Browser Console (F12)
- Look for SignalR errors
- If `401 Unauthorized` → Logout & re-login

### ❌ Connected but No Data

**Run the test script**:
```bash
cd bot
python test_realtime_push.py
```

Should see `[OK]` messages. If `[FAIL]` → Backend not running.

## ✅ **Success Checklist**

- [ ] Backend running (port 7001)
- [ ] Frontend running (port 5173)
- [ ] Logged into frontend
- [ ] Dashboard shows "Live Trading Data" widget
- [ ] Widget shows "Live" (green dot)
- [ ] Test script shows `[OK]` for all tests
- [ ] Frontend shows updating prices
- [ ] Browser console shows SignalR messages

## 🎉 **Next Steps**

Once test script works:

### **Option A: Test with Real Bot**

```bash
cd bot
python run_bot.py
```

The bot will automatically push real tick data as it trades!

### **Option B: Keep Testing**

Run the test script multiple times:
```bash
python test_realtime_push.py
```

Watch the dashboard update in real-time!

---

## 📞 **Need Help?**

**Check these in order:**
1. Backend logs - Look for "Received tick update"
2. Browser console (F12) - Look for SignalR messages  
3. Test script output - Should show `[OK]`

**Common Issues:**
- **Connection refused** → Backend not running
- **401 Unauthorized** → Not logged in or token expired
- **No data** → Test script not running

**Still stuck?** Check full guide: `REALTIME_TESTING_GUIDE.md`

