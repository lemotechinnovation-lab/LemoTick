# New Features Testing Guide

## 🎯 Overview
This guide provides step-by-step instructions for testing all newly implemented features.

## 📋 Prerequisites

1. **Database is running** (PostgreSQL via Docker)
2. **API is running** on `http://localhost:5000`
3. **Database is seeded** with test data
4. **Postman** or similar API testing tool

---

## 🚀 Quick Start

### 1. Start the Database
```bash
cd backend
docker compose -f docker-compose.postgres.yml up -d
```

### 2. Run Migrations
```bash
cd backend/Infrastructure
dotnet ef database update --startup-project ../API
```

### 3. Start the API
```bash
cd backend/API
dotnet run
```

### 4. Seed Test Data
```bash
# Use Postman or curl
POST http://localhost:5000/api/Seed/seed-quick
```

---

## 📊 Feature 1: Dashboard Summary Endpoints

### **Get Investor Dashboard Summary**
Provides a comprehensive overview of an investor's entire portfolio.

```http
GET /api/Dashboard/investor/{investorId}/summary
```

**Example Response:**
```json
{
  "investorId": "guid",
  "investorName": "John Doe",
  "email": "john.doe@example.com",
  "totalPortfolios": 3,
  "activePortfolios": 2,
  "totalInvestment": 50000.00,
  "currentValue": 55250.75,
  "totalProfit": 8500.25,
  "totalLoss": 3249.50,
  "netProfit": 5250.75,
  "profitPercentage": 10.50,
  "totalTrades": 45,
  "openTrades": 5,
  "closedTrades": 40,
  "winningTrades": 28,
  "losingTrades": 12,
  "winRate": 70.00,
  "availableBalance": 25000.00,
  "pendingTransactions": 2,
  "unreadNotifications": 5,
  "lastTradeDate": "2025-11-15T10:30:00Z",
  "lastLoginAt": "2025-11-15T09:00:00Z"
}
```

### **Get Investor Recent Activity**
Retrieves recent trades, transactions, and notifications.

```http
GET /api/Dashboard/investor/{investorId}/recent-activity?tradeCount=10&transactionCount=10&notificationCount=5
```

**Query Parameters:**
- `tradeCount` (optional, default: 10)
- `transactionCount` (optional, default: 10)
- `notificationCount` (optional, default: 5)

### **Get Portfolio Overview**
Detailed view of a single portfolio with recent performance.

```http
GET /api/Dashboard/portfolio/{portfolioId}/overview?recentTradesCount=10&performanceDays=30
```

**Query Parameters:**
- `recentTradesCount` (optional, default: 10)
- `performanceDays` (optional, default: 30)

---

## 📤 Feature 2: Data Export (CSV)

### **Export Trades to CSV**
Download trades as a CSV file with optional filtering.

```http
GET /api/Trades/export?portfolioId={guid}&startDate=2025-01-01&endDate=2025-12-31
```

**Query Parameters:**
- `portfolioId` (optional): Filter by portfolio
- `startDate` (optional): Filter from date
- `endDate` (optional): Filter to date

**Response:** CSV file download

**CSV Columns:**
- Trade ID, Portfolio ID, Portfolio Name, Symbol, Direction, Amount, Entry Price, Exit Price, 
  Entry Time, Exit Time, Profit, Loss, Status, Strategy, Risk Level, Stop Loss, Take Profit

### **Export Transactions to CSV**
Download transactions as a CSV file.

```http
GET /api/Transactions/export?investorId={guid}&startDate=2025-01-01&endDate=2025-12-31
```

**Query Parameters:**
- `investorId` (optional): Filter by investor
- `startDate` (optional): Filter from date
- `endDate` (optional): Filter to date

**Response:** CSV file download

---

## 🔗 Feature 3: Bot Webhook Integration

All webhook endpoints require HMAC signature verification for security.

### **Webhook Secret Configuration**
Add to `appsettings.json`:
```json
{
  "Webhook": {
    "Secret": "your-secure-webhook-secret-key-here"
  }
}
```

### **1. Trade Opened Webhook**
Called when the bot opens a new trade.

```http
POST /api/Webhook/trade-opened
X-Webhook-Signature: <HMAC-SHA256-signature>
Content-Type: application/json
```

**Request Body:**
```json
{
  "portfolioId": "guid",
  "symbol": "BTCUSD",
  "direction": "Buy",
  "amount": 0.5,
  "entryPrice": 43250.75,
  "stopLoss": 42000.00,
  "takeProfit": 45000.00,
  "strategy": "MeanReversion",
  "timestamp": "2025-11-15T10:30:00Z"
}
```

### **2. Trade Closed Webhook**
Called when the bot closes a trade.

```http
POST /api/Webhook/trade-closed
X-Webhook-Signature: <HMAC-SHA256-signature>
```

**Request Body:**
```json
{
  "tradeId": "guid",
  "exitPrice": 44500.00,
  "profit": 625.00,
  "loss": 0,
  "exitReason": "TakeProfit",
  "timestamp": "2025-11-15T12:00:00Z"
}
```

### **3. Trade Updated Webhook**
Called when trade parameters are modified.

```http
POST /api/Webhook/trade-updated
X-Webhook-Signature: <HMAC-SHA256-signature>
```

**Request Body:**
```json
{
  "tradeId": "guid",
  "stopLoss": 43000.00,
  "takeProfit": 46000.00,
  "timestamp": "2025-11-15T11:00:00Z"
}
```

### **4. Risk Alert Webhook**
Called when risk thresholds are breached.

```http
POST /api/Webhook/risk-alert
X-Webhook-Signature: <HMAC-SHA256-signature>
```

**Request Body:**
```json
{
  "portfolioId": "guid",
  "alertType": "MaxDrawdownReached",
  "severity": "Critical",
  "message": "Portfolio has reached maximum drawdown limit",
  "currentValue": 45000.00,
  "thresholdValue": 45000.00,
  "timestamp": "2025-11-15T10:45:00Z"
}
```

**Severity Levels:** `Low`, `Medium`, `High`, `Critical`

**Generating HMAC Signature (Python Example):**
```python
import hmac
import hashlib
import json

def generate_signature(payload, secret):
    message = json.dumps(payload, separators=(',', ':'))
    signature = hmac.new(
        secret.encode('utf-8'),
        message.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()
    return signature

# Usage
payload = {"portfolioId": "...", "symbol": "BTCUSD", ...}
secret = "your-secure-webhook-secret-key-here"
signature = generate_signature(payload, secret)
# Add to header: X-Webhook-Signature: {signature}
```

---

## 📈 Feature 4: Advanced Analytics

### **Monthly Performance**
Get aggregated performance metrics by month.

```http
GET /api/Analytics/portfolio/{portfolioId}/monthly-performance?months=12
```

**Response:**
```json
{
  "portfolioId": "guid",
  "portfolioName": "Aggressive Growth",
  "monthlyData": [
    {
      "month": "2025-11",
      "totalProfit": 5250.00,
      "totalLoss": 1200.00,
      "netProfit": 4050.00,
      "tradesCount": 15,
      "winRate": 73.33
    }
  ]
}
```

### **Win/Loss Ratio**
Analyze trading performance across different dimensions.

```http
GET /api/Analytics/portfolio/{portfolioId}/win-loss-ratio?startDate=2025-01-01&endDate=2025-12-31
```

**Response:**
```json
{
  "portfolioId": "guid",
  "totalTrades": 120,
  "winningTrades": 85,
  "losingTrades": 35,
  "winRate": 70.83,
  "averageProfit": 450.25,
  "averageLoss": 280.50,
  "profitFactor": 1.60
}
```

### **Risk Analysis**
Evaluate portfolio risk metrics.

```http
GET /api/Analytics/portfolio/{portfolioId}/risk-analysis
```

**Response:**
```json
{
  "portfolioId": "guid",
  "currentDrawdown": 5.25,
  "maxDrawdown": 12.50,
  "sharpeRatio": 1.85,
  "volatility": 15.30,
  "riskLevel": "Medium"
}
```

### **Symbol Performance**
Performance breakdown by trading symbol.

```http
GET /api/Analytics/portfolio/{portfolioId}/symbol-performance?topN=10
```

### **Strategy Performance**
Performance breakdown by trading strategy.

```http
GET /api/Analytics/portfolio/{portfolioId}/strategy-performance
```

---

## 👤 Feature 5: User Profile Management

### **Get Profile**
Retrieve investor profile information.

```http
GET /api/Profile/investor/{investorId}
```

### **Update Profile**
Update investor profile details.

```http
PUT /api/Profile/investor/{investorId}
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+1234567890",
  "nationality": "US"
}
```

### **Change Password**
Securely change investor password.

```http
POST /api/Profile/investor/{investorId}/change-password
```

**Request Body:**
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword456!",
  "confirmNewPassword": "NewPassword456!"
}
```

### **Get Notification Preferences**
Retrieve notification settings.

```http
GET /api/Profile/investor/{investorId}/notifications
```

### **Update Notification Preferences**
Configure notification settings.

```http
PUT /api/Profile/investor/{investorId}/notifications
```

**Request Body:**
```json
{
  "emailNotifications": true,
  "smsNotifications": false,
  "pushNotifications": true,
  "tradeAlerts": true,
  "performanceReports": true,
  "securityAlerts": true
}
```

---

## 🔐 Feature 6: Audit Logging

Audit logs are automatically created for all entity changes. Query them via database:

```sql
-- Get recent audit logs
SELECT * FROM "AuditLogs" 
ORDER BY "Timestamp" DESC 
LIMIT 100;

-- Get audit logs for specific entity
SELECT * FROM "AuditLogs" 
WHERE "EntityType" = 'Portfolio' AND "EntityId" = 'your-portfolio-guid'
ORDER BY "Timestamp" DESC;

-- Get audit logs by user
SELECT * FROM "AuditLogs" 
WHERE "UserEmail" = 'john.doe@example.com'
ORDER BY "Timestamp" DESC;
```

**Audit Log Structure:**
- Entity Type (e.g., "Portfolio", "Trade")
- Entity ID
- Action (e.g., "Created", "Updated", "Deleted")
- User ID & Email
- Timestamp
- Old Values (JSON)
- New Values (JSON)
- IP Address
- User Agent

---

## 🧪 Complete Testing Workflow

### **Step 1: Setup**
```bash
# Start services
docker compose -f backend/docker-compose.postgres.yml up -d
cd backend/API && dotnet run
```

### **Step 2: Seed Data**
```http
POST /api/Seed/seed-standard
```
*(Creates 10,000 records per entity)*

### **Step 3: Get Test IDs**
```http
GET /api/Seed/stats
```
*Copy `investorId` and `portfolioId` for testing*

### **Step 4: Test Dashboard**
```http
GET /api/Dashboard/investor/{investorId}/summary
GET /api/Dashboard/investor/{investorId}/recent-activity
GET /api/Dashboard/portfolio/{portfolioId}/overview
```

### **Step 5: Test Exports**
```http
GET /api/Trades/export?portfolioId={portfolioId}
GET /api/Transactions/export?investorId={investorId}
```
*(Should download CSV files)*

### **Step 6: Test Analytics**
```http
GET /api/Analytics/portfolio/{portfolioId}/monthly-performance
GET /api/Analytics/portfolio/{portfolioId}/win-loss-ratio
GET /api/Analytics/portfolio/{portfolioId}/risk-analysis
GET /api/Analytics/portfolio/{portfolioId}/symbol-performance
GET /api/Analytics/portfolio/{portfolioId}/strategy-performance
```

### **Step 7: Test Profile**
```http
GET /api/Profile/investor/{investorId}
GET /api/Profile/investor/{investorId}/notifications
```

### **Step 8: Verify Audit Logs**
Check database for audit entries:
```sql
SELECT * FROM "AuditLogs" ORDER BY "Timestamp" DESC LIMIT 20;
```

---

## 🐛 Troubleshooting

### API Not Starting
```bash
cd backend/API
dotnet build
dotnet run --urls "http://localhost:5000"
```

### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Restart if needed
docker compose -f backend/docker-compose.postgres.yml restart
```

### Webhook Signature Errors
- Ensure webhook secret matches in both bot and API
- Verify HMAC signature generation matches expected format
- Check that payload JSON has no extra whitespace

### Empty Analytics Results
- Ensure database is seeded with sufficient data
- Check date range filters aren't excluding all data
- Verify portfolio has closed trades for some analytics

---

## 📚 Related Documentation

- **[NEW_FEATURES_SUMMARY.md](./NEW_FEATURES_SUMMARY.md)** - Detailed feature descriptions and code
- **[POSTMAN_TESTING_GUIDE.md](./POSTMAN_TESTING_GUIDE.md)** - General Postman testing guide
- **[DATABASE_SEEDING_GUIDE.md](./DATABASE_SEEDING_GUIDE.md)** - Database seeding instructions
- **[DOCKER_DATABASE_GUIDE.md](./DOCKER_DATABASE_GUIDE.md)** - Docker database management

---

## ✅ Success Criteria

All features are working correctly if:

1. ✅ Dashboard returns comprehensive investor summary
2. ✅ CSV exports download with correct data
3. ✅ Webhooks accept valid signatures and reject invalid ones
4. ✅ Analytics return meaningful insights with seeded data
5. ✅ Profile updates persist correctly
6. ✅ Audit logs capture all entity changes

---

**Happy Testing! 🚀**

