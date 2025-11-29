# 🚀 Postman Quick Start - 5 Minutes to Testing

## 📦 What You Got

3 files in the `/backend` folder:
1. ✅ **InvestorManagementSystem.postman_collection.json** - 45+ API endpoints
2. ✅ **InvestorManagementSystem.postman_environment.json** - Environment setup
3. ✅ **POSTMAN_TESTING_GUIDE.md** - Complete documentation

## ⚡ 5-Minute Setup

### 1. Import to Postman (1 min)
- Open Postman
- Click **Import** → Drag both `.json` files
- Select environment: **"Investor Management - Local"** (top right dropdown)

### 2. Start API (1 min)
```bash
cd backend/API
dotnet run
```
Wait for: `Now listening on: https://localhost:7001`

### 3. Test It Works (3 min)

#### Step 1: Health Check ✅
- Folder: **Health** → **Health Check**
- Click **Send**
- ✅ Should return: `200 OK`

#### Step 2: Register & Login 🔐
- Folder: **Authentication** → **Register Investor**
- Click **Send** → ✅ `201 Created`
- Folder: **Authentication** → **Login**
- Click **Send** → ✅ `200 OK` (token auto-saved!)

#### Step 3: Create Portfolio 💼
- Folder: **Portfolios** → **Create Portfolio**
- Click **Send** → ✅ `201 Created`

#### Step 4: Create Trade 📈
- Folder: **Trades** → **Create Trade**
- Click **Send** → ✅ `201 Created`

**DONE! 🎉** You're now testing the backend!

## 🎯 What's Included

### 8 API Categories (45+ Endpoints)

1. **Authentication** (4) - Register, Login, Refresh Token, Change Password
2. **Health** (1) - API health check
3. **Investors** (6) - Full CRUD + get portfolios
4. **Portfolios** (4) - Full CRUD operations
5. **Trades** (5) - Create, update, close trades
6. **Transactions** (7) - Deposits, withdrawals, history
7. **Performance Metrics** (4) - Track portfolio performance
8. **Notifications** (7) - Investor notifications

### Auto-Magic Features ✨

- **JWT Token**: Auto-saved after login
- **IDs**: Automatically captured from responses
- **Bearer Auth**: Pre-configured for all endpoints
- **Test Scripts**: Built-in automation

## 🔥 Common Test Flows

### Flow 1: New Investor Journey
```
Register → Login → Create Portfolio → Deposit Funds → Create Trade
```

### Flow 2: Trading Workflow
```
Login → Create Trade → Update Trade (Close) → Get Trade History
```

### Flow 3: Performance Review
```
Login → Get Trades → Create Performance Metric → Get Metrics
```

## 📊 Request Examples

All requests include realistic example data:

**Create Trade:**
```json
{
  "symbol": "EUR/USD",
  "type": 2,  // Forex
  "amount": 1.5,
  "entryPrice": 1.0850
}
```

**Create Transaction (Deposit):**
```json
{
  "type": 0,  // Deposit
  "amount": 10000.00,
  "currency": "USD"
}
```

## 🐛 Quick Fixes

**Can't connect?**
- ✅ Check API is running: `dotnet run`
- ✅ Verify URL: `https://localhost:7001/api`

**401 Unauthorized?**
- ✅ Run Login request again
- ✅ Token expires after 60 minutes

**404 Not Found?**
- ✅ Create parent resources first (Investor → Portfolio → Trade)

## 📚 Need More Details?

See **POSTMAN_TESTING_GUIDE.md** for:
- Complete endpoint reference
- Detailed test scenarios
- All enum values
- Troubleshooting guide
- Pro tips

## 🎯 Success Checklist

- [ ] Imported collection + environment
- [ ] API running on localhost:7001
- [ ] Health check: 200 OK
- [ ] Registered investor: 201 Created
- [ ] Logged in: Token saved automatically
- [ ] Created portfolio: 201 Created
- [ ] Created trade: 201 Created

**All checked? You're a testing pro! 🏆**

---

**Happy Testing!** 🚀

For issues, check the console where you ran `dotnet run` for detailed error logs.

