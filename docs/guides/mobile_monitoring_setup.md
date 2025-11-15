# 📱 Mobile Monitoring Setup Guide

Monitor your LemoTick trading bot from your phone - **3 easy options!**

---

## 🎯 **Option 1: Deriv Mobile App** ⭐ **EASIEST (2 minutes)**

### **Best For:** Quick trade monitoring, account balance

### **Setup:**
1. **Download App**:
   - **Android**: [Deriv GO on Google Play](https://play.google.com/store/apps/details?id=com.deriv.app)
   - **iOS**: [Deriv GO on App Store](https://apps.apple.com/app/deriv-go/id1550561298)

2. **Login**:
   - Use same email/password from `bot/config/credentials.demo.env`
   - Or login with OAuth (Google/Facebook)

3. **View Trades**:
   - Open app → Portfolio tab
   - See all trades placed by your bot
   - Real-time P&L, contract status

### **What You Can See:**
- ✅ Active contracts (live trades)
- ✅ Trade history (past 24 hours)
- ✅ Account balance (current equity)
- ✅ Individual trade P&L
- ✅ Contract details (entry, duration, payout)
- ❌ Bot-specific metrics (win rate, strategy, signals)

### **Pros:**
- ✅ No setup required
- ✅ Official Deriv app
- ✅ Real-time data
- ✅ Secure

### **Cons:**
- ❌ Only shows trades, not bot analytics
- ❌ Can't see why bot made decisions
- ❌ No performance charts

---

## 📊 **Option 2: Grafana Mobile + Ngrok** ⭐ **BEST FOR ANALYTICS**

### **Best For:** Full dashboard access, charts, metrics

### **Setup:**

#### **Step 1: Install Ngrok (One-time)**
1. Download Ngrok: https://ngrok.com/download
2. Extract to `C:\ngrok\`
3. Sign up (free): https://dashboard.ngrok.com/signup
4. Get auth token: https://dashboard.ngrok.com/get-started/your-authtoken
5. Run: `ngrok config add-authtoken YOUR_TOKEN`

#### **Step 2: Expose Grafana (Every Time You Want Mobile Access)**
1. **Start your bot** (this starts Grafana on port 3000)
2. **Open new terminal** and run:
   ```powershell
   ngrok http 3000
   ```
3. **Copy the URL** shown (example: `https://abc123.ngrok.io`)
4. **Open on phone** browser

#### **Step 3: Access Dashboard**
1. Open the Ngrok URL on your phone
2. Login: `admin` / `admin`
3. View LemoTick dashboard

### **What You Can See:**
- ✅ Live P&L chart
- ✅ Win rate gauge
- ✅ Active trades count
- ✅ Equity tracking over time
- ✅ Signal generation stats
- ✅ Strategy performance
- ✅ Full Grafana dashboards

### **Security Note:**
⚠️ Ngrok URL is public but Grafana requires login. Change default password:
- Open Grafana → Settings → Change admin password

### **Pros:**
- ✅ Full analytics
- ✅ Beautiful charts
- ✅ All metrics
- ✅ Works from anywhere

### **Cons:**
- ⚠️ Requires Ngrok running
- ⚠️ URL changes each time (upgrade to static URL for $8/month)

---

## 📲 **Option 3: Telegram Notifications** ⭐ **BEST FOR ALERTS**

### **Best For:** Real-time trade alerts, critical notifications

### **Setup:**

#### **Step 1: Create Telegram Bot**
1. Open Telegram app
2. Search for `@BotFather`
3. Send: `/newbot`
4. Follow instructions (choose a name)
5. **Copy your bot token** (looks like: `123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11`)

#### **Step 2: Get Your Chat ID**
1. Search for `@userinfobot` on Telegram
2. Send: `/start`
3. **Copy your ID** (looks like: `123456789`)

#### **Step 3: Configure LemoTick**
1. Edit `bot/config/credentials.env`:
   ```env
   TELEGRAM_BOT_TOKEN=your_bot_token_here
   TELEGRAM_CHAT_ID=your_chat_id_here
   ```

2. Install required library:
   ```powershell
   pip install requests
   ```

3. **Restart your bot** - it will now send notifications!

### **What You'll Receive:**
- 🔔 **Trade Opened**: Signal, stake, entry price, strategy
- 📊 **Trade Closed**: Result (WIN/LOSS), P&L, win rate
- 📈 **Hourly Summary**: Performance stats
- 🚨 **Critical Alerts**: Circuit breaker, emergency stop, errors

### **Example Messages:**
```
📈 TRADE OPENED

Signal: BUY
Stake: $3.00
Duration: 5 min
Entry: 828.50
Strategy: Triple EMA
```

```
✅ TRADE CLOSED - WIN

Signal: BUY
Stake: $3.00
P&L: +$2.40 (+80.0%)
Win Rate: 65.0%
Equity: $52.40
```

### **Pros:**
- ✅ Instant notifications
- ✅ No need to check app
- ✅ Critical alerts
- ✅ Works anywhere

### **Cons:**
- ⚠️ Need to create Telegram bot (5 min setup)

---

## 🖥️ **Option 4: Remote Desktop**

### **Best For:** Full control, debugging, log viewing

### **Apps:**
- **Microsoft Remote Desktop** (Free)
  - Android: [Google Play](https://play.google.com/store/apps/details?id=com.microsoft.rdc.androidx)
  - iOS: [App Store](https://apps.apple.com/app/remote-desktop-mobile/id714464092)

- **Chrome Remote Desktop** (Free, web-based)
  - Setup: https://remotedesktop.google.com/

### **What You Can Do:**
- ✅ Full PC access from phone
- ✅ View live logs
- ✅ Start/stop bot
- ✅ Edit settings
- ✅ Access Grafana locally

### **Setup:**
See Windows Remote Desktop setup guide: https://support.microsoft.com/en-us/windows/how-to-use-remote-desktop-5fe128d5-8fb1-7a23-3b8a-41e636865e8c

---

## 🚀 **QUICK START RECOMMENDATIONS**

### **For Immediate Monitoring (Today):**
1. ✅ **Download Deriv GO app** (2 minutes)
2. ✅ Login and view trades
3. ✅ Basic monitoring ready!

### **For Full Analytics (10 minutes):**
1. ✅ **Run** `setup_mobile_monitoring.bat`
2. ✅ Open Ngrok URL on phone
3. ✅ Access Grafana dashboards

### **For Push Notifications (15 minutes):**
1. ✅ **Create Telegram bot** (@BotFather)
2. ✅ **Get chat ID** (@userinfobot)
3. ✅ **Add to credentials.env**
4. ✅ Restart bot

---

## 📊 **Comparison Table**

| Feature | Deriv App | Grafana+Ngrok | Telegram | Remote Desktop |
|---------|-----------|---------------|----------|----------------|
| **Setup Time** | 2 min ⚡ | 10 min | 15 min | 20 min |
| **Trade View** | ✅ | ✅ | ✅ | ✅ |
| **Win Rate** | ❌ | ✅ | ✅ | ✅ |
| **Charts** | Basic | ✅ Full | ❌ | ✅ |
| **Push Alerts** | ✅ | ❌ | ✅ | ❌ |
| **Full Logs** | ❌ | ❌ | ❌ | ✅ |
| **Remote Control** | ❌ | ❌ | ❌ | ✅ |
| **Always On** | ✅ | ⚠️ Ngrok running | ✅ | ✅ |
| **Cost** | Free | Free | Free | Free |

---

## ⚡ **MY RECOMMENDATION**

**Use ALL THREE together:**

1. **Deriv GO** - Quick balance checks
2. **Telegram** - Real-time trade alerts
3. **Grafana+Ngrok** - Weekly performance review

**Total Setup: ~20 minutes for complete mobile monitoring!** 📱

---

## 🔧 **Troubleshooting**

### **Deriv App Not Showing Trades:**
- ✅ Make sure you're logged into the **same account** as bot
- ✅ Check account type (Demo vs Real)
- ✅ Refresh the Portfolio tab

### **Ngrok Not Working:**
- ✅ Make sure Grafana is running (bot must be running)
- ✅ Check firewall settings
- ✅ Verify Ngrok is on port 3000

### **Telegram Not Sending:**
- ✅ Verify bot token and chat ID are correct
- ✅ Message your bot first (send `/start`)
- ✅ Check `pip install requests` is installed

---

## 📞 **Need Help?**

Check logs for errors:
```powershell
cat bot/logs/runtime.log
```

All notifications will appear in logs even if Telegram fails.

