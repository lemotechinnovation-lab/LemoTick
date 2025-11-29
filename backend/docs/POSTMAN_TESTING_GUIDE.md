# Postman Testing Guide - Investor Management System

## 📦 Files Included

1. **InvestorManagementSystem.postman_collection.json** - Complete API collection with 45+ endpoints
2. **InvestorManagementSystem.postman_environment.json** - Environment variables for testing

## 🚀 Quick Start

### Step 1: Import into Postman

1. Open Postman
2. Click **Import** button (top left)
3. Drag and drop both JSON files or click "Upload Files"
4. Select both:
   - `InvestorManagementSystem.postman_collection.json`
   - `InvestorManagementSystem.postman_environment.json`

### Step 2: Select Environment

1. In Postman, click the environment dropdown (top right)
2. Select **"Investor Management - Local"**

### Step 3: Start the Backend API

```bash
cd backend/API
dotnet run
```

The API will start at:
- **HTTPS**: `https://localhost:7001`
- **HTTP**: `http://localhost:5000`

### Step 4: Update Base URL (if needed)

If your API runs on a different port:
1. Click the environment name (top right)
2. Edit `base_url` variable
3. Save changes

## 📋 Testing Flow (Recommended Order)

### 1. Health Check ✅
**Folder**: Health → Health Check
- **Purpose**: Verify API is running
- **Auth**: None required
- **Expected**: 200 OK

### 2. Register New Investor 👤
**Folder**: Authentication → Register Investor
- **Purpose**: Create a new investor account
- **Auth**: None required
- **Auto-saves**: `investor_id` to environment
- **Expected**: 201 Created

### 3. Login 🔐
**Folder**: Authentication → Login
- **Purpose**: Get JWT token for authenticated requests
- **Auth**: None required
- **Auto-saves**: `jwt_token` and `investor_id` to environment
- **Expected**: 200 OK with token

> ⚠️ **Important**: After login, the JWT token is automatically saved and will be used for all subsequent requests.

### 4. Create Portfolio 💼
**Folder**: Portfolios → Create Portfolio
- **Purpose**: Create a trading portfolio for the investor
- **Auth**: Required (Bearer Token)
- **Auto-saves**: `portfolio_id` to environment
- **Expected**: 201 Created

### 5. Create Transactions 💰
**Folder**: Transactions → Create Transaction (Deposit)
- **Purpose**: Add funds to portfolio
- **Auth**: Required
- **Expected**: 201 Created

### 6. Create Trades 📈
**Folder**: Trades → Create Trade
- **Purpose**: Record a trade execution
- **Auth**: Required
- **Auto-saves**: `trade_id` to environment
- **Expected**: 201 Created

### 7. Update Trade (Close) 🎯
**Folder**: Trades → Update Trade (Close)
- **Purpose**: Close an open trade with exit price
- **Auth**: Required
- **Expected**: 200 OK

### 8. Create Performance Metrics 📊
**Folder**: Performance Metrics → Create Performance Metric
- **Purpose**: Record portfolio performance snapshot
- **Auth**: Required
- **Expected**: 201 Created

### 9. Create Notifications 🔔
**Folder**: Notifications → Create Notification
- **Purpose**: Send notification to investor
- **Auth**: Required
- **Expected**: 201 Created

## 🎯 Complete Test Scenarios

### Scenario A: New Investor Onboarding

1. **Register Investor** → Creates account
2. **Login** → Gets JWT token
3. **Get Investor By ID** → Verify profile
4. **Create Portfolio** → Setup trading account
5. **Create Transaction (Deposit)** → Add initial funds
6. **Get Transactions By Investor** → Verify transaction history

### Scenario B: Trading Workflow

1. **Login** (if not logged in)
2. **Get All Portfolios** → Select portfolio
3. **Create Trade** → Open position (EUR/USD)
4. **Get Trades By Portfolio** → View open trades
5. **Update Trade** → Close position with profit/loss
6. **Get Trade By ID** → Verify trade details
7. **Create Notification** → Notify investor of closed trade

### Scenario C: Performance Tracking

1. **Login** (if not logged in)
2. **Get Trades By Portfolio** → Analyze trading history
3. **Create Performance Metric** → Record daily/weekly metrics
4. **Get Performance Metrics By Portfolio** → View performance trend
5. **Create Transaction (Profit Distribution)** → Distribute profits

### Scenario D: Portfolio Management

1. **Login** (if not logged in)
2. **Get All Portfolios** → View all portfolios
3. **Update Portfolio** → Change name/status
4. **Get Investor Portfolios** → View investor's portfolios
5. **Get Transactions By Portfolio** → Check transaction history
6. **Get Performance Metrics By Portfolio** → Review performance

## 📊 Endpoint Reference

### Authentication (4 endpoints)
- ✅ POST `/Auth/register` - Register new investor
- ✅ POST `/Auth/login` - Login and get JWT token
- ✅ POST `/Auth/refresh-token` - Refresh expired token
- ✅ POST `/Auth/change-password` - Change password

### Health (1 endpoint)
- ✅ GET `/Health` - API health check

### Investors (6 endpoints)
- ✅ GET `/Investors` - Get all investors
- ✅ GET `/Investors/{id}` - Get investor by ID
- ✅ POST `/Investors` - Create investor
- ✅ PUT `/Investors/{id}` - Update investor
- ✅ DELETE `/Investors/{id}` - Delete investor
- ✅ GET `/Investors/{id}/portfolios` - Get investor's portfolios

### Portfolios (4 endpoints)
- ✅ GET `/Portfolios` - Get all portfolios
- ✅ GET `/Portfolios/{id}` - Get portfolio by ID
- ✅ POST `/Portfolios` - Create portfolio
- ✅ PUT `/Portfolios/{id}` - Update portfolio

### Trades (5 endpoints)
- ✅ GET `/Trades` - Get all trades
- ✅ GET `/Trades/{id}` - Get trade by ID
- ✅ POST `/Trades` - Create trade
- ✅ PUT `/Trades/{id}` - Update trade (close position)
- ✅ GET `/Trades/portfolio/{portfolioId}` - Get trades by portfolio

### Transactions (7 endpoints)
- ✅ GET `/Transactions` - Get all transactions
- ✅ GET `/Transactions/{id}` - Get transaction by ID
- ✅ POST `/Transactions` - Create transaction (deposit/withdrawal)
- ✅ PUT `/Transactions/{id}` - Update transaction status
- ✅ GET `/Transactions/investor/{investorId}` - Get by investor
- ✅ GET `/Transactions/portfolio/{portfolioId}` - Get by portfolio

### Performance Metrics (4 endpoints)
- ✅ GET `/PerformanceMetrics` - Get all metrics
- ✅ GET `/PerformanceMetrics/{id}` - Get metric by ID
- ✅ POST `/PerformanceMetrics` - Create metric
- ✅ GET `/PerformanceMetrics/portfolio/{portfolioId}` - Get by portfolio

### Notifications (7 endpoints)
- ✅ GET `/Notifications` - Get all notifications
- ✅ GET `/Notifications/{id}` - Get notification by ID
- ✅ POST `/Notifications` - Create notification
- ✅ GET `/Notifications/investor/{investorId}` - Get by investor
- ✅ GET `/Notifications/investor/{investorId}/unread` - Get unread
- ✅ PUT `/Notifications/{id}/mark-as-read` - Mark as read
- ✅ PUT `/Notifications/investor/{investorId}/mark-all-as-read` - Mark all

**Total: 45 Endpoints** 🎉

## 🔐 Authentication

Most endpoints require authentication. The collection uses **Bearer Token** authentication.

### How it works:
1. Login with valid credentials
2. JWT token is automatically saved to environment variable `jwt_token`
3. All subsequent requests automatically include the token in the Authorization header
4. Token expires after 60 minutes (configurable in appsettings.json)

### Manual Token Update:
If needed, you can manually set the token:
1. Click Environments (top right)
2. Edit `jwt_token` variable
3. Paste your token
4. Save

## 📝 Request Body Examples

### Create Investor
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phoneNumber": "+27123456789",
  "dateOfBirth": "1990-01-15",
  "nationality": "South African",
  "idNumber": "9001155800087"
}
```

### Create Portfolio
```json
{
  "investorId": "{{investor_id}}",
  "name": "Growth Portfolio",
  "description": "Aggressive growth strategy",
  "initialAmount": 50000.00
}
```

### Create Trade
```json
{
  "portfolioId": "{{portfolio_id}}",
  "symbol": "EUR/USD",
  "type": 2,
  "amount": 1.5,
  "entryPrice": 1.0850,
  "notes": "Bullish trend on 1H chart"
}
```

### Trade Types (type field):
- `0` = BinaryOption
- `1` = CFD
- `2` = Forex
- `3` = Crypto
- `4` = Stock

### Trade Status (status field):
- `0` = Open
- `1` = Closed
- `2` = Cancelled
- `3` = Expired
- `4` = Failed

### Transaction Types:
- `0` = Deposit
- `1` = Withdrawal
- `2` = ProfitDistribution
- `3` = Loss
- `4` = Fee
- `5` = Refund
- `6` = Bonus
- `7` = Penalty

### Transaction Status:
- `0` = Pending
- `1` = Processing
- `2` = Completed
- `3` = Failed
- `4` = Cancelled
- `5` = Reversed

### Notification Types:
- `0` = TradeExecuted
- `1` = TradeClosed
- `2` = ProfitDistribution
- `3` = LossAlert
- `4` = RiskAlert
- `5` = SystemUpdate
- `6` = AccountUpdate
- `7` = SecurityAlert
- `8` = Marketing
- `9` = General

### Notification Priority:
- `0` = Low
- `1` = Normal
- `2` = High
- `3` = Critical

## 🧪 Testing Tips

### 1. Use Test Scripts
Some requests include test scripts that automatically save IDs to environment variables. Check the "Tests" tab in Postman.

### 2. Check Response Status
- **200 OK** - Success (GET, PUT)
- **201 Created** - Resource created (POST)
- **204 No Content** - Success, no response body (DELETE)
- **400 Bad Request** - Invalid request data
- **401 Unauthorized** - Missing or invalid JWT token
- **404 Not Found** - Resource doesn't exist
- **500 Internal Server Error** - Server error

### 3. View Environment Variables
Click the eye icon (👁️) next to the environment dropdown to see all current values.

### 4. Reset Environment
To start fresh:
1. Delete all environment variable values except `base_url`
2. Register a new investor
3. Login again

### 5. Database Reset
If you need to reset the database:
```bash
cd backend/API
dotnet ef database drop
dotnet ef database update
# Or just delete the database file if using SQLite
```

## 🐛 Troubleshooting

### Issue: "Could not get any response"
- ✅ Verify API is running (`dotnet run`)
- ✅ Check base_url matches your API port
- ✅ Disable SSL verification in Postman settings (for self-signed certs)

### Issue: "401 Unauthorized"
- ✅ Login again to refresh JWT token
- ✅ Check token is saved in environment (eye icon)
- ✅ Verify token hasn't expired (60 min default)

### Issue: "404 Not Found"
- ✅ Check endpoint URL is correct
- ✅ Verify resource ID exists in database
- ✅ Make sure you created the resource first

### Issue: "500 Internal Server Error"
- ✅ Check API console for detailed error
- ✅ Verify request body format is correct
- ✅ Check all required fields are provided
- ✅ Ensure database connection is working

## 🔄 Environment Variables

The collection uses these variables (auto-populated by test scripts):

| Variable | Description | Auto-Set By |
|----------|-------------|-------------|
| `base_url` | API base URL | Manual |
| `jwt_token` | JWT authentication token | Login request |
| `investor_id` | Current investor ID | Register/Login |
| `portfolio_id` | Current portfolio ID | Create Portfolio |
| `trade_id` | Current trade ID | Create Trade |
| `transaction_id` | Current transaction ID | Create Transaction |
| `metric_id` | Current metric ID | Create Performance Metric |
| `notification_id` | Current notification ID | Create Notification |

## 📚 Additional Resources

- **API Documentation**: Check Swagger UI at `https://localhost:7001/swagger`
- **Backend Code**: See `/backend/API/Controllers/` for implementation
- **Database**: PostgreSQL (see appsettings.json for connection string)

## 🎯 Success Checklist

- [ ] Imported collection and environment
- [ ] Selected correct environment
- [ ] Started backend API (dotnet run)
- [ ] Health check returns 200 OK
- [ ] Registered new investor (201 Created)
- [ ] Logged in successfully (token saved)
- [ ] Created portfolio (201 Created)
- [ ] Created transaction (201 Created)
- [ ] Created trade (201 Created)
- [ ] Closed trade (200 OK)
- [ ] Created performance metric (201 Created)
- [ ] Created notification (201 Created)
- [ ] Retrieved data using GET endpoints

## 💡 Pro Tips

1. **Use Folders**: Run entire folders by clicking "Run" button next to folder name
2. **Collection Runner**: Use Collection Runner for automated testing sequences
3. **Pre-request Scripts**: Add setup logic before requests
4. **Variables**: Use `{{variable_name}}` syntax in URLs and request bodies
5. **Export Results**: Save test results for documentation

---

**Happy Testing! 🚀**

If you encounter any issues, check the API logs in the console where you ran `dotnet run`.

