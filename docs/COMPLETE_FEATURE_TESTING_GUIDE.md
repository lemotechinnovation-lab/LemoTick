# 🧪 Complete Feature Testing Guide
**Date:** November 16, 2025  
**Purpose:** Test all 24 controllers and 100+ endpoints  
**Timeline:** 2-4 hours for complete testing

---

## 🚀 Quick Start

### Prerequisites
1. Backend API running (`cd backend/API && dotnet run`)
2. Database running (`docker compose -f docker-compose.postgres.yml up -d`)
3. Postman installed (or use Swagger at https://localhost:7001/swagger)

---

## 📋 TESTING CHECKLIST (24 Controllers)

### ✅ Core Features (8 controllers)

#### 1. Authentication Controller ✅
**Base:** `/api/Auth`

```json
// Test 1: Register new investor
POST /api/Auth/register
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@test.com",
  "password": "Test@1234",
  "confirmPassword": "Test@1234",
  "phoneNumber": "+27123456789",
  "dateOfBirth": "1990-01-01",
  "nationality": "South Africa",
  "idNumber": "9001015009087"
}

// Expected: 201 Created + JWT token
// Save token for subsequent requests

// Test 2: Login
POST /api/Auth/login
{
  "email": "john.doe@test.com",
  "password": "Test@1234"
}

// Expected: 200 OK + JWT token + investor details

// Test 3: Change Password
POST /api/Auth/change-password
Headers: Authorization: Bearer {token}
{
  "currentPassword": "Test@1234",
  "newPassword": "NewTest@1234",
  "confirmNewPassword": "NewTest@1234"
}

// Expected: 200 OK

// Test 4: Refresh Token
POST /api/Auth/refresh-token
{
  "refreshToken": "{refresh_token_from_login}"
}

// Expected: 200 OK + new JWT token
```

**Status:** [ ] All tests passed

---

#### 2. Investors Controller ✅
**Base:** `/api/Investors`

```json
// Test 1: Get investor by ID
GET /api/Investors/{investorId}
Headers: Authorization: Bearer {token}

// Expected: 200 OK + investor details

// Test 2: Update investor
PUT /api/Investors/{investorId}
{
  "phoneNumber": "+27987654321",
  "nationality": "South Africa"
}

// Expected: 200 OK

// Test 3: Get investor's portfolios
GET /api/Investors/{investorId}/portfolios

// Expected: 200 OK + array of portfolios
```

**Status:** [ ] All tests passed

---

#### 3. Portfolios Controller ✅
**Base:** `/api/Portfolios`

```json
// Test 1: Create portfolio
POST /api/Portfolios
{
  "investorId": "{investorId}",
  "name": "My First Portfolio",
  "strategyType": "Aggressive",
  "riskLevel": "High",
  "initialInvestment": 10000.00,
  "maxDrawdown": 15.0,
  "targetReturn": 30.0
}

// Expected: 201 Created + portfolio ID

// Test 2: Get portfolio
GET /api/Portfolios/{portfolioId}

// Expected: 200 OK + portfolio details

// Test 3: Update portfolio
PUT /api/Portfolios/{portfolioId}
{
  "name": "Updated Portfolio Name",
  "riskLevel": "Medium"
}

// Expected: 200 OK
```

**Status:** [ ] All tests passed

---

#### 4. Trades Controller ✅
**Base:** `/api/Trades`

```json
// Test 1: Create trade
POST /api/Trades
{
  "portfolioId": "{portfolioId}",
  "symbol": "R_100",
  "type": "Binary",
  "direction": "Call",
  "entryPrice": 1234.56,
  "amount": 1.0,
  "stake": 5.00,
  "status": "Open",
  "entryTime": "2025-11-16T10:00:00Z",
  "strategy": "Triple EMA"
}

// Expected: 201 Created

// Test 2: Get portfolio trades
GET /api/Trades/portfolio/{portfolioId}

// Expected: 200 OK + array of trades

// Test 3: Update trade (close)
PUT /api/Trades/{tradeId}
{
  "exitPrice": 1240.00,
  "profit": 4.20,
  "loss": 0.00,
  "status": "Closed",
  "exitTime": "2025-11-16T10:05:00Z"
}

// Expected: 200 OK

// Test 4: Export trades to CSV
GET /api/Trades/export?portfolioId={portfolioId}

// Expected: 200 OK + CSV file download
```

**Status:** [ ] All tests passed

---

#### 5. Transactions Controller ✅
**Base:** `/api/Transactions`

```json
// Test 1: Create deposit
POST /api/Transactions
{
  "investorId": "{investorId}",
  "portfolioId": "{portfolioId}",
  "type": "Deposit",
  "amount": 5000.00,
  "currency": "ZAR",
  "description": "Initial deposit"
}

// Expected: 201 Created

// Test 2: Get investor transactions
GET /api/Transactions/investor/{investorId}

// Expected: 200 OK + array of transactions

// Test 3: Export transactions to CSV
GET /api/Transactions/export?investorId={investorId}

// Expected: 200 OK + CSV file download
```

**Status:** [ ] All tests passed

---

#### 6. Notifications Controller ✅
**Base:** `/api/Notifications`

```json
// Test 1: Get investor notifications
GET /api/Notifications/investor/{investorId}

// Expected: 200 OK + array of notifications

// Test 2: Mark as read
PUT /api/Notifications/{notificationId}/read

// Expected: 200 OK

// Test 3: Get unread count
GET /api/Notifications/investor/{investorId}/unread-count

// Expected: 200 OK + { "count": 5 }
```

**Status:** [ ] All tests passed

---

#### 7. Performance Metrics Controller ✅
**Base:** `/api/PerformanceMetrics`

```json
// Test 1: Create performance snapshot
POST /api/PerformanceMetrics
{
  "portfolioId": "{portfolioId}",
  "totalReturn": 15.5,
  "sharpeRatio": 1.8,
  "maxDrawdown": 8.5,
  "winRate": 65.0,
  "profitFactor": 1.45,
  "periodStart": "2025-11-01T00:00:00Z",
  "periodEnd": "2025-11-16T00:00:00Z"
}

// Expected: 201 Created

// Test 2: Get portfolio metrics
GET /api/PerformanceMetrics/portfolio/{portfolioId}

// Expected: 200 OK + array of metrics
```

**Status:** [ ] All tests passed

---

#### 8. Health Controller ✅
**Base:** `/api/Health`

```json
// Test 1: Health check
GET /api/Health

// Expected: 200 OK + { "status": "Healthy", "timestamp": "..." }
```

**Status:** [ ] All tests passed

---

### ✅ Advanced Features (7 controllers)

#### 9. Dashboard Controller ✅
**Base:** `/api/Dashboard`

```json
// Test 1: Get investor summary
GET /api/Dashboard/investor/{investorId}/summary

// Expected: 200 OK + comprehensive dashboard data
// Should include: totalInvestment, currentValue, netProfit, totalTrades, winRate, etc.

// Test 2: Get recent activity
GET /api/Dashboard/investor/{investorId}/recent-activity?tradeCount=10&transactionCount=10&notificationCount=10

// Expected: 200 OK + recent trades, transactions, notifications

// Test 3: Get portfolio overview
GET /api/Dashboard/portfolio/{portfolioId}/overview?recentTradesCount=10&performanceDays=30

// Expected: 200 OK + detailed portfolio metrics + recent trades + performance history
```

**Status:** [ ] All tests passed

---

#### 10. Analytics Controller ✅
**Base:** `/api/Analytics`

```json
// Test 1: Monthly performance
GET /api/Analytics/portfolio/{portfolioId}/monthly-performance?year=2025

// Expected: 200 OK + array of 12 months with performance data

// Test 2: Win/Loss ratio
GET /api/Analytics/portfolio/{portfolioId}/win-loss-ratio?startDate=2025-11-01&endDate=2025-11-16

// Expected: 200 OK + winRate, lossRate, winCount, lossCount, avgWin, avgLoss

// Test 3: Risk analysis
GET /api/Analytics/portfolio/{portfolioId}/risk-analysis?days=30

// Expected: 200 OK + maxDrawdown, currentDrawdown, sharpeRatio, volatility

// Test 4: Symbol performance
GET /api/Analytics/portfolio/{portfolioId}/symbol-performance

// Expected: 200 OK + performance breakdown by symbol (R_100, R_75, etc.)

// Test 5: Strategy performance
GET /api/Analytics/portfolio/{portfolioId}/strategy-performance

// Expected: 200 OK + performance breakdown by strategy (Triple EMA, etc.)
```

**Status:** [ ] All tests passed

---

#### 11. Webhook Controller ✅
**Base:** `/api/Webhook`

```json
// Test 1: Trade opened webhook
POST /api/Webhook/trade-opened
Headers:
  X-Webhook-Signature: {hmac_signature}
{
  "portfolioId": "{portfolioId}",
  "symbol": "R_100",
  "direction": "Call",
  "stake": 5.00,
  "entryPrice": 1234.56,
  "strategy": "Triple EMA",
  "timestamp": "2025-11-16T10:00:00Z"
}

// Expected: 200 OK

// Test 2: Trade closed webhook
POST /api/Webhook/trade-closed
Headers:
  X-Webhook-Signature: {hmac_signature}
{
  "tradeId": "{tradeId}",
  "exitPrice": 1240.00,
  "profit": 4.20,
  "outcome": "Win",
  "timestamp": "2025-11-16T10:05:00Z"
}

// Expected: 200 OK

// Test 3: Risk alert webhook
POST /api/Webhook/risk-alert
Headers:
  X-Webhook-Signature: {hmac_signature}
{
  "portfolioId": "{portfolioId}",
  "alertType": "DrawdownThreshold",
  "currentDrawdown": 12.5,
  "threshold": 15.0,
  "message": "Approaching max drawdown",
  "timestamp": "2025-11-16T10:00:00Z"
}

// Expected: 200 OK
```

**Status:** [ ] All tests passed

---

#### 12. Profile Controller ✅
**Base:** `/api/Profile`

```json
// Test 1: Get profile
GET /api/Profile/investor/{investorId}

// Expected: 200 OK + full investor profile

// Test 2: Update profile
PUT /api/Profile/investor/{investorId}
{
  "phoneNumber": "+27111222333",
  "nationality": "South Africa"
}

// Expected: 200 OK

// Test 3: Change password
POST /api/Profile/investor/{investorId}/change-password
{
  "currentPassword": "Test@1234",
  "newPassword": "NewTest@1234",
  "confirmNewPassword": "NewTest@1234"
}

// Expected: 200 OK

// Test 4: Get notification preferences
GET /api/Profile/investor/{investorId}/notifications

// Expected: 200 OK + notification settings

// Test 5: Update notification preferences
PUT /api/Profile/investor/{investorId}/notifications
{
  "emailNotifications": true,
  "smsNotifications": false,
  "tradeAlerts": true,
  "performanceReports": true
}

// Expected: 200 OK
```

**Status:** [ ] All tests passed

---

#### 13. Two-Factor Auth Controller ✅
**Base:** `/api/TwoFactorAuth`

```json
// Test 1: Check 2FA status
GET /api/TwoFactorAuth/status

// Expected: 200 OK + { "enabled": false }

// Test 2: Enable 2FA
POST /api/TwoFactorAuth/enable

// Expected: 200 OK + QR code (base64) + backup codes

// Test 3: Verify setup
POST /api/TwoFactorAuth/verify-setup
{
  "code": "123456"
}

// Expected: 200 OK + { "success": true }

// Test 4: Verify login code
POST /api/TwoFactorAuth/verify-login
{
  "code": "123456"
}

// Expected: 200 OK

// Test 5: Disable 2FA
POST /api/TwoFactorAuth/disable
{
  "password": "Test@1234"
}

// Expected: 200 OK
```

**Status:** [ ] All tests passed

---

#### 14. Seed Controller ✅
**Base:** `/api/Seed`

```json
// Test 1: Seed standard data (100 records each)
POST /api/Seed/seed-standard

// Expected: 200 OK + statistics

// Test 2: Seed large data (1000+ records each)
POST /api/Seed/seed-large

// Expected: 200 OK + statistics (may take 1-2 minutes)

// Test 3: Clear all data
DELETE /api/Seed/clear

// Expected: 200 OK + { "message": "All data cleared" }
```

**Status:** [ ] All tests passed

---

#### 15. Lookups Controller ✅
**Base:** `/api/Lookups`

```json
// Test 1: Get countries
GET /api/Lookups/countries

// Expected: 200 OK + array of countries

// Test 2: Get currencies
GET /api/Lookups/currencies

// Expected: 200 OK + array of currencies

// Test 3: Get South African banks
GET /api/Lookups/banks

// Expected: 200 OK + array of SA banks

// Test 4: Get document types
GET /api/Lookups/document-types

// Expected: 200 OK + array of KYC document types

// Test 5: Get transaction types
GET /api/Lookups/transaction-types

// Expected: 200 OK + array of transaction types
```

**Status:** [ ] All tests passed

---

### ✅ Security & Compliance (4 controllers)

#### 16. KYC Controller ✅ **[NEWLY DISCOVERED]**
**Base:** `/api/KYC`

```json
// Test 1: Get KYC summary
GET /api/KYC/investor/{investorId}/summary

// Expected: 200 OK + KYC status, uploaded documents, missing documents

// Test 2: Upload KYC document
POST /api/KYC/upload
Content-Type: multipart/form-data
{
  "investorId": "{investorId}",
  "type": "IdDocument",
  "file": [file],
  "expiryDate": "2030-01-01"
}

// Expected: 201 Created + document ID

// Test 3: Get investor documents
GET /api/KYC/investor/{investorId}/documents

// Expected: 200 OK + array of documents

// Test 4: Download document
GET /api/KYC/document/{documentId}/download

// Expected: 200 OK + file download

// Test 5: Verify document (Compliance Officer)
PUT /api/KYC/document/{documentId}/verify
Headers: Authorization: Bearer {compliance_officer_token}
{
  "approved": true,
  "notes": "Document verified successfully"
}

// Expected: 200 OK

// Test 6: Delete document
DELETE /api/KYC/document/{documentId}

// Expected: 200 OK
```

**Status:** [ ] All tests passed

---

#### 17. Compliance Controller ✅ **[NEWLY DISCOVERED]**
**Base:** `/api/Compliance`
**Required Role:** ComplianceOfficer or Administrator

```json
// Test 1: Create Suspicious Activity Report (SAR)
POST /api/Compliance/suspicious-activity
{
  "investorId": "{investorId}",
  "transactionId": "{transactionId}",
  "reportReason": "Large unusual transaction",
  "amount": 50000.00,
  "currency": "ZAR",
  "notes": "Multiple large deposits in short period"
}

// Expected: 201 Created + SAR ID

// Test 2: Get all SARs
GET /api/Compliance/suspicious-activities

// Expected: 200 OK + array of SARs

// Test 3: Get SAR details
GET /api/Compliance/suspicious-activity/{id}

// Expected: 200 OK + full SAR details

// Test 4: Review SAR
PUT /api/Compliance/suspicious-activity/{id}/review
{
  "status": "Reviewed",
  "reviewNotes": "No further action required",
  "actionTaken": "None"
}

// Expected: 200 OK

// Test 5: PEP screening
POST /api/Compliance/pep-screening
{
  "investorId": "{investorId}",
  "screeningNotes": "Checked against PEP database"
}

// Expected: 200 OK + screening result

// Test 6: Get high-risk investors
GET /api/Compliance/high-risk-investors

// Expected: 200 OK + array of high-risk investors

// Test 7: Get large transactions
GET /api/Compliance/large-transactions?threshold=10000&days=30

// Expected: 200 OK + array of large transactions
```

**Status:** [ ] All tests passed

---

#### 18. Withdrawal Controller ✅ **[NEWLY DISCOVERED]**
**Base:** `/api/Withdrawal`

```json
// Test 1: Create withdrawal request
POST /api/Withdrawal/request
{
  "investorId": "{investorId}",
  "portfolioId": "{portfolioId}",
  "amount": 500.00,
  "bankAccountId": "{bankAccountId}",
  "reason": "Profit withdrawal"
}

// Expected: 201 Created + withdrawal ID
// Note: Auto-approved if < R1,000

// Test 2: Get my withdrawal requests
GET /api/Withdrawal/my-requests

// Expected: 200 OK + array of withdrawal requests

// Test 3: Get pending approvals (Admin only)
GET /api/Withdrawal/pending
Headers: Authorization: Bearer {admin_token}

// Expected: 200 OK + array of pending withdrawals

// Test 4: Approve withdrawal (Admin only)
POST /api/Withdrawal/{id}/approve
{
  "approverNotes": "Approved after verification"
}

// Expected: 200 OK

// Test 5: Reject withdrawal (Admin only)
POST /api/Withdrawal/{id}/reject
{
  "reason": "Insufficient verification",
  "notes": "Additional documents required"
}

// Expected: 200 OK

// Test 6: Check withdrawal status
GET /api/Withdrawal/{id}/status

// Expected: 200 OK + { "status": "Approved", "amount": 500.00, ... }
```

**Status:** [ ] All tests passed

---

### ✅ Financial Operations (3 controllers)

#### 19. Fees Controller ✅ **[NEWLY DISCOVERED]**
**Base:** `/api/Fees`
**Required Role:** Administrator

```json
// Test 1: Calculate fees for portfolio
GET /api/Fees/portfolio/{portfolioId}/calculate

// Expected: 200 OK + 
// {
//   "managementFee": 15.00,
//   "performanceFee": 125.00,
//   "withdrawalFee": 0.00,
//   "totalFees": 140.00
// }

// Test 2: Charge fees
POST /api/Fees/portfolio/{portfolioId}/charge
{
  "feeType": "Management",
  "amount": 15.00,
  "description": "Monthly management fee"
}

// Expected: 201 Created + fee ID + transaction created

// Test 3: Get fee history
GET /api/Fees/portfolio/{portfolioId}/history

// Expected: 200 OK + array of historical fees

// Test 4: Get investor fee summary
GET /api/Fees/investor/{investorId}/summary

// Expected: 200 OK + total fees paid, breakdown by type

// Test 5: Get pending fees (Admin)
GET /api/Fees/pending

// Expected: 200 OK + array of fees awaiting charge

// Test 6: Waive fee (Admin)
POST /api/Fees/{feeId}/waive
{
  "reason": "Special promotion",
  "notes": "First-time investor waiver"
}

// Expected: 200 OK
```

**Status:** [ ] All tests passed

---

#### 20. Bank Accounts Controller ✅ **[NEWLY DISCOVERED]**
**Base:** `/api/BankAccounts`

```json
// Test 1: Add bank account
POST /api/BankAccounts
{
  "investorId": "{investorId}",
  "bankName": "Standard Bank",
  "accountNumber": "123456789",
  "accountType": "Cheque",
  "branchCode": "051001",
  "accountHolder": "John Doe"
}

// Expected: 201 Created + account ID

// Test 2: Get my bank accounts
GET /api/BankAccounts/my-accounts

// Expected: 200 OK + array of bank accounts

// Test 3: Update bank account
PUT /api/BankAccounts/{id}
{
  "accountType": "Savings"
}

// Expected: 200 OK

// Test 4: Set primary account
POST /api/BankAccounts/{id}/set-primary

// Expected: 200 OK

// Test 5: Verify bank account (Admin)
POST /api/BankAccounts/{id}/verify
{
  "verified": true,
  "verificationNotes": "Verified via bank statement"
}

// Expected: 200 OK

// Test 6: Delete bank account
DELETE /api/BankAccounts/{id}

// Expected: 200 OK
```

**Status:** [ ] All tests passed

---

#### 21. Payments Controller ✅ **[NEWLY DISCOVERED]**
**Base:** `/api/Payments`

```json
// Test 1: Initiate payment (PayFast)
POST /api/Payments/initiate
{
  "investorId": "{investorId}",
  "amount": 1000.00,
  "paymentMethod": "PayFast",
  "returnUrl": "https://yoursite.com/payment-success"
}

// Expected: 200 OK + payment URL to redirect user

// Test 2: Check payment status
GET /api/Payments/{paymentId}/status

// Expected: 200 OK + { "status": "Pending", "amount": 1000.00, ... }

// Test 3: Payment webhook (from PayFast)
POST /api/Payments/webhook
{
  // PayFast webhook data
  "m_payment_id": "{paymentId}",
  "pf_payment_id": "12345",
  "payment_status": "COMPLETE",
  "amount_gross": "1000.00"
}

// Expected: 200 OK

// Test 4: Get payment history
GET /api/Payments/history

// Expected: 200 OK + array of payments
```

**Status:** [ ] All tests passed

---

### ✅ Growth Features (3 controllers)

#### 22. Referrals Controller ✅ **[NEWLY DISCOVERED]**
**Base:** `/api/Referrals`

```json
// Test 1: Get my referral code
GET /api/Referrals/my-code

// Expected: 200 OK + 
// {
//   "referralCode": "JOHN-1A2B3C",
//   "referralLink": "https://lemotick.com/register?ref=JOHN-1A2B3C",
//   "totalReferrals": 5,
//   "totalCommissions": 250.00
// }

// Test 2: Validate referral code
POST /api/Referrals/validate-code
{
  "code": "JOHN-1A2B3C"
}

// Expected: 200 OK + { "valid": true, "referrerName": "John Doe" }

// Test 3: Get my referrals
GET /api/Referrals/my-referrals

// Expected: 200 OK + array of referrals made

// Test 4: Get my commissions
GET /api/Referrals/my-commissions

// Expected: 200 OK + array of commissions earned

// Test 5: Get leaderboard
GET /api/Referrals/leaderboard?limit=10

// Expected: 200 OK + top 10 referrers

// Test 6: Get referral stats
GET /api/Referrals/stats

// Expected: 200 OK + 
// {
//   "totalReferrals": 5,
//   "activeReferrals": 3,
//   "totalCommissions": 250.00,
//   "pendingCommissions": 50.00
// }
```

**Status:** [ ] All tests passed

---

#### 23. Statements Controller ✅ **[NEWLY DISCOVERED]**
**Base:** `/api/Statements`

```json
// Test 1: Generate monthly statement
GET /api/Statements/monthly?investorId={investorId}&year=2025&month=11

// Expected: 200 OK + PDF file or HTML statement

// Test 2: Generate quarterly statement
GET /api/Statements/quarterly?investorId={investorId}&year=2025&quarter=4

// Expected: 200 OK + PDF file or HTML statement

// Test 3: Generate annual statement
GET /api/Statements/annual?investorId={investorId}&year=2025

// Expected: 200 OK + PDF file or HTML statement

// Test 4: Custom date range statement
GET /api/Statements/portfolio/{portfolioId}/custom?startDate=2025-11-01&endDate=2025-11-16

// Expected: 200 OK + statement data

// Test 5: Email statement
POST /api/Statements/email
{
  "investorId": "{investorId}",
  "statementType": "Monthly",
  "year": 2025,
  "month": 11
}

// Expected: 200 OK + { "sent": true, "email": "john.doe@test.com" }

// Test 6: Get statement history
GET /api/Statements/history

// Expected: 200 OK + array of generated statements
```

**Status:** [ ] All tests passed

---

#### 24. Preferences Controller ✅ **[NEWLY DISCOVERED]**
**Base:** `/api/Preferences`

```json
// Test 1: Get preferences
GET /api/Preferences

// Expected: 200 OK + all investor preferences

// Test 2: Update preferences
PUT /api/Preferences
{
  "language": "en",
  "currency": "ZAR",
  "timezone": "Africa/Johannesburg",
  "emailNotifications": true,
  "smsNotifications": false,
  "twoFactorEnabled": false
}

// Expected: 200 OK

// Test 3: Update notification settings
PUT /api/Preferences/notifications
{
  "tradeAlerts": true,
  "performanceReports": true,
  "marketingEmails": false,
  "systemAlerts": true
}

// Expected: 200 OK

// Test 4: Update risk settings
PUT /api/Preferences/risk-settings
{
  "riskTolerance": "Medium",
  "maxDrawdownAlert": 10.0,
  "stopLossDefault": 5.0
}

// Expected: 200 OK
```

**Status:** [ ] All tests passed

---

## 📊 TESTING SUMMARY

### Completion Status

```
Total Controllers: 24
Completed Tests: [ ] / 24

Core Features: [ ] / 8
Advanced Features: [ ] / 7
Security & Compliance: [ ] / 4
Financial Operations: [ ] / 3
Growth Features: [ ] / 3
```

### Time Estimate
- Core Features: 30-45 minutes
- Advanced Features: 45-60 minutes
- Security & Compliance: 30-45 minutes
- Financial Operations: 20-30 minutes
- Growth Features: 20-30 minutes

**Total:** 2-4 hours for complete testing

---

## 🎯 QUICK TEST SEQUENCE (15 minutes)

If you have limited time, test these critical flows:

### 1. Authentication Flow (5 minutes)
1. Register → Login → Get JWT token
2. 2FA Enable → Verify → Login with 2FA
3. Change password

### 2. Investor Journey (5 minutes)
1. Create portfolio
2. Upload KYC documents
3. Add bank account
4. Make deposit (transaction)
5. View dashboard

### 3. Trading Flow (5 minutes)
1. Bot creates trade (webhook)
2. Trade closes (webhook)
3. View analytics
4. Generate statement
5. Request withdrawal

---

## 🐛 BUG REPORTING

If you find issues, document:

1. **Endpoint:** Which endpoint failed
2. **Request:** Full request body
3. **Expected:** What you expected
4. **Actual:** What actually happened
5. **Status Code:** HTTP status code
6. **Error Message:** Full error message

**Example:**
```
Endpoint: POST /api/KYC/upload
Request: { investorId: "...", type: "IdDocument", file: [...] }
Expected: 201 Created
Actual: 500 Internal Server Error
Error: "File path not configured"
```

---

## ✅ ACCEPTANCE CRITERIA

For each controller to be considered "production-ready":

- [ ] All endpoints return correct status codes
- [ ] Authorization works correctly (401/403 when appropriate)
- [ ] Data validation works (400 for invalid data)
- [ ] Database operations succeed
- [ ] No unhandled exceptions (500 errors)
- [ ] Response format matches documentation
- [ ] Performance acceptable (<500ms for most endpoints)

---

## 🚀 NEXT STEPS AFTER TESTING

1. **Document findings** - Create list of issues found
2. **Fix critical bugs** - Address any 500 errors or security issues
3. **Update Postman collection** - Add newly discovered endpoints
4. **Performance test** - Test with large datasets
5. **Security audit** - Review authorization on all endpoints
6. **Integration test** - Test complete user journeys

---

*Created: November 16, 2025*  
*Controllers: 24*  
*Endpoints: 100+*  
*Estimated Testing Time: 2-4 hours*

