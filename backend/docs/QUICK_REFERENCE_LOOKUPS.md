# 🔍 Quick Reference: Lookup Tables

## Summary
✅ **22 lookup tables** for all enums - **ALL COMPLETE**

---

## Quick Access

### Test All Lookups
```bash
# Get all lookup tables in one call
curl http://localhost:5000/api/lookups/all
```

### Database Query
```sql
-- Check all lookup tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%Lookup';

-- Should return 22 tables
```

---

## Complete List (Alphabetical)

| # | Lookup Table | Enum Values | API Endpoint |
|---|-------------|-------------|--------------|
| 1 | CommissionStatusLookup | 5 | `/api/lookups/commission-statuses` |
| 2 | DocumentStatusLookup | 5 | `/api/lookups/document-statuses` |
| 3 | DocumentTypeLookup | 6 | `/api/lookups/document-types` |
| 4 | FeeStatusLookup | 4 | `/api/lookups/fee-statuses` |
| 5 | FeeTypeLookup | 4 | `/api/lookups/fee-types` |
| 6 | InvestorStatusLookup | 8 | `/api/lookups/investor-statuses` |
| 7 | NotificationPriorityLookup | 4 | `/api/lookups/notification-priorities` |
| 8 | NotificationTypeLookup | 10 | `/api/lookups/notification-types` |
| 9 | PaymentMethodLookup | 6 | `/api/lookups/payment-methods` |
| 10 | PaymentStatusLookup | 7 | `/api/lookups/payment-statuses` |
| 11 | PaymentTypeLookup | 5 | `/api/lookups/payment-types` |
| 12 | PortfolioStatusLookup | 4 | `/api/lookups/portfolio-statuses` |
| 13 | ReferralStatusLookup | 5 | `/api/lookups/referral-statuses` |
| 14 | RiskLevelLookup | 4 | `/api/lookups/risk-levels` |
| 15 | SARStatusLookup | 6 | `/api/lookups/sar-statuses` |
| 16 | TradeDirectionLookup | 4 | `/api/lookups/trade-directions` |
| 17 | TradeStatusLookup | 5 | `/api/lookups/trade-statuses` |
| 18 | TradeTypeLookup | 5 | `/api/lookups/trade-types` |
| 19 | TransactionStatusLookup | 6 | `/api/lookups/transaction-statuses` |
| 20 | TransactionTypeLookup | 8 | `/api/lookups/transaction-types` |
| 21 | UserRoleLookup | 5 | `/api/lookups/user-roles` |
| 22 | WithdrawalStatusLookup | 7 | `/api/lookups/withdrawal-statuses` |

**Total Enum Values:** 120+

---

## Migration Commands

```bash
# Navigate to Infrastructure project
cd backend/Infrastructure

# List all migrations
dotnet ef migrations list --startup-project ../API/InvestorManagementSystem.API.csproj

# Check pending migrations (should be none)
dotnet ef migrations list --startup-project ../API/InvestorManagementSystem.API.csproj | grep -i pending

# If needed: Add new migration
dotnet ef migrations add MigrationName --startup-project ../API/InvestorManagementSystem.API.csproj

# If needed: Apply migrations
dotnet ef database update --startup-project ../API/InvestorManagementSystem.API.csproj

# Verify database
dotnet ef database update --startup-project ../API/InvestorManagementSystem.API.csproj --verbose
```

---

## Testing Examples

### 1. Get Investor Statuses
```bash
curl http://localhost:5000/api/lookups/investor-statuses
```

**Response:**
```json
[
  {"id": 0, "name": "Pending", "description": "Account pending activation"},
  {"id": 1, "name": "Active", "description": "Active investor account"},
  {"id": 2, "name": "Suspended", "description": "Account temporarily suspended"}
]
```

### 2. Get Payment Methods
```bash
curl http://localhost:5000/api/lookups/payment-methods
```

**Response:**
```json
[
  {"id": 0, "name": "InstantEFT", "description": "Instant EFT payment"},
  {"id": 1, "name": "CreditCard", "description": "Credit card payment"},
  {"id": 2, "name": "DebitCard", "description": "Debit card payment"}
]
```

### 3. Get All Lookups
```bash
curl http://localhost:5000/api/lookups/all
```

**Returns:** All 22 lookup tables in a single JSON object

---

## Database Verification

### Check All Lookup Tables
```sql
-- PostgreSQL
SELECT 
    schemaname,
    tablename,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.tablename) as column_count
FROM pg_tables t
WHERE schemaname = 'public' 
AND tablename LIKE '%Lookup'
ORDER BY tablename;
```

### Check Lookup Data
```sql
-- Example: Check InvestorStatus values
SELECT * FROM "InvestorStatusLookup" ORDER BY "DisplayOrder";

-- Count all lookup values
SELECT 
    'InvestorStatusLookup' as table_name, COUNT(*) as value_count FROM "InvestorStatusLookup"
UNION ALL
SELECT 'UserRoleLookup', COUNT(*) FROM "UserRoleLookup"
UNION ALL
SELECT 'PaymentMethodLookup', COUNT(*) FROM "PaymentMethodLookup"
-- ... repeat for all 22 tables
ORDER BY table_name;
```

---

## Entity → Lookup Mapping

| Entity | Property | Enum Type | Lookup Table |
|--------|----------|-----------|--------------|
| Investor | Status | InvestorStatus | InvestorStatusLookup |
| Investor | Role | UserRole | UserRoleLookup |
| Portfolio | Status | PortfolioStatus | PortfolioStatusLookup |
| Portfolio | RiskLevel | RiskLevel | RiskLevelLookup |
| Trade | Type | TradeType | TradeTypeLookup |
| Trade | Direction | TradeDirection | TradeDirectionLookup |
| Trade | Status | TradeStatus | TradeStatusLookup |
| Transaction | Type | TransactionType | TransactionTypeLookup |
| Transaction | Status | TransactionStatus | TransactionStatusLookup |
| Notification | Type | NotificationType | NotificationTypeLookup |
| Notification | Priority | NotificationPriority | NotificationPriorityLookup |
| KYCDocument | Type | DocumentType | DocumentTypeLookup |
| KYCDocument | Status | DocumentStatus | DocumentStatusLookup |
| SuspiciousActivityReport | Status | SARStatus | SARStatusLookup |
| Fee | Type | FeeType | FeeTypeLookup |
| Fee | Status | FeeStatus | FeeStatusLookup |
| WithdrawalRequest | Status | WithdrawalStatus | WithdrawalStatusLookup |
| Referral | Status | ReferralStatus | ReferralStatusLookup |
| ReferralCommission | Status | CommissionStatus | CommissionStatusLookup |
| Payment | Type | PaymentType | PaymentTypeLookup |
| Payment | Method | PaymentMethod | PaymentMethodLookup |
| Payment | Status | PaymentStatus | PaymentStatusLookup |

---

## Add New Enum Value (Example)

### 1. Update Seed Data
```csharp
// In ApplicationDbContext.cs
modelBuilder.Entity<InvestorStatusLookup>().HasData(
    // ... existing values ...
    new InvestorStatusLookup 
    { 
        Id = 8, 
        Name = "Verified", 
        Description = "Fully verified account",
        DisplayOrder = 9,
        IsActive = true
    }
);
```

### 2. Create Migration
```bash
cd backend/Infrastructure
dotnet ef migrations add AddNewInvestorStatus --startup-project ../API
```

### 3. Apply Migration
```bash
dotnet ef database update --startup-project ../API
```

### 4. Update Enum (if needed)
```csharp
// In Investor.cs
public enum InvestorStatus
{
    // ... existing values ...
    Verified = 8
}
```

---

## Troubleshooting

### Problem: Lookup table not appearing
```bash
# Check if migration was applied
dotnet ef migrations list --startup-project ../API

# If pending, apply it
dotnet ef database update --startup-project ../API
```

### Problem: Seed data missing
```bash
# Check database
psql -U your_user -d your_database
SELECT * FROM "InvestorStatusLookup";

# If empty, may need to re-run migration
dotnet ef database update --startup-project ../API --verbose
```

### Problem: API returns empty
```bash
# Check if API is filtering by IsActive
# All lookups should have IsActive = true by default

# Test endpoint
curl -v http://localhost:5000/api/lookups/investor-statuses
```

---

## Build & Test

```bash
# Build entire solution
cd backend
dotnet build InvestorManagementSystem.sln

# Run API
cd API
dotnet run

# In another terminal, test lookups
curl http://localhost:5000/api/lookups/all | jq
```

---

## Files Reference

| File | Purpose |
|------|---------|
| `Core/Entities/LookupTables.cs` | All lookup table class definitions |
| `Infrastructure/Data/ApplicationDbContext.cs` | DbSets, configurations, seed data |
| `API/Controllers/LookupsController.cs` | API endpoints |
| `Infrastructure/Migrations/*.cs` | Database migration files |

---

## Status: ✅ COMPLETE

All 22 enum types have corresponding lookup tables with full implementation.

---

**Quick Test:**
```bash
curl http://localhost:5000/api/lookups/all | jq 'keys'
```

**Expected Output:**
```json
[
  "commissionStatuses",
  "documentStatuses",
  "documentTypes",
  "feeStatuses",
  "feeTypes",
  "investorStatuses",
  "notificationPriorities",
  "notificationTypes",
  "paymentMethods",
  "paymentStatuses",
  "paymentTypes",
  "portfolioStatuses",
  "referralStatuses",
  "riskLevels",
  "sarStatuses",
  "tradeDirections",
  "tradeStatuses",
  "tradeTypes",
  "transactionStatuses",
  "transactionTypes",
  "userRoles",
  "withdrawalStatuses"
]
```

