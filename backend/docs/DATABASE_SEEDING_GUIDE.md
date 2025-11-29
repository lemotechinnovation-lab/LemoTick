# 🌱 Database Seeding & Performance Testing Guide

## 📦 Overview

The database seeding functionality allows you to quickly populate your database with realistic test data for development and performance testing.

## 🎯 Quick Start

### 1. Start API
```bash
cd backend/API
dotnet run
```

### 2. Use Postman Collection

Import the updated collection and navigate to:
**Database Seeding & Performance** folder

## 📊 Available Endpoints

### 1. Get Database Stats
```
GET /api/Seed/stats
```
Shows current record counts for all tables.

**Response:**
```json
{
  "investors": 10000,
  "portfolios": 20000,
  "trades": 50000,
  "transactions": 30000,
  "performanceMetrics": 10000,
  "notifications": 30000,
  "totalRecords": 150000
}
```

### 2. Quick Seed (1,000 records)
```
POST /api/Seed/seed-quick
```
Fast seeding for quick testing. Creates:
- 1,000 Investors
- 2,000 Portfolios (2 per investor)
- 5,000 Trades (5 per portfolio avg)
- 3,000 Transactions (3 per investor)
- 1,000 Performance Metrics
- 3,000 Notifications

**Duration:** ~10-30 seconds

### 3. Standard Seed (10,000 records)
```
POST /api/Seed/seed?recordsPerEntity=10000
```
Standard test dataset. Creates:
- 10,000 Investors
- 20,000 Portfolios
- 50,000 Trades
- 30,000 Transactions
- 10,000 Performance Metrics
- 30,000 Notifications

**Total:** ~160,000 records
**Duration:** ~2-5 minutes

### 4. Large Seed (50,000 records)
```
POST /api/Seed/seed-large
```
Large dataset for stress testing. Creates:
- 50,000 Investors
- 100,000 Portfolios
- 250,000 Trades
- 150,000 Transactions
- 50,000 Performance Metrics
- 150,000 Notifications

**Total:** ~750,000 records
**Duration:** ~10-20 minutes

### 5. Custom Seed
```
POST /api/Seed/seed?recordsPerEntity={count}
```
Seed with custom number of records.

**Example:**
```
POST /api/Seed/seed?recordsPerEntity=5000
```

### 6. Performance Test
```
GET /api/Seed/performance-test
```
Runs various queries and measures execution time.

**Response:**
```json
{
  "getInvestors1000": {
    "count": 1000,
    "milliseconds": 45
  },
  "getPortfoliosWithInvestor1000": {
    "count": 1000,
    "milliseconds": 78
  },
  "getTradesWithPortfolio1000": {
    "count": 1000,
    "milliseconds": 62
  },
  "getInvestorsWithPortfoliosAndTrades10": {
    "count": 10,
    "milliseconds": 125
  },
  "sumAllPortfolioProfit": {
    "sum": 12500000.50,
    "milliseconds": 35
  },
  "countAllRecords": {
    "count": 160000,
    "milliseconds": 120
  }
}
```

### 7. Clear All Data ⚠️
```
DELETE /api/Seed/clear
```
**WARNING:** Deletes ALL data from ALL tables!

Use before re-seeding or resetting test environment.

## 🎭 Generated Data Features

### Realistic Data
- Valid email addresses
- South African phone numbers (+27)
- Realistic names (via Faker/Bogus)
- Proper date ranges
- Financial amounts with realistic distributions

### Data Relationships
- Each investor has 2-3 portfolios
- Each portfolio has 10-50 trades
- Each investor has 5-10 transactions
- Each portfolio has daily performance metrics (30 days)
- Each investor has 5-20 notifications

### Variety
- Multiple investor statuses (Active, Pending, KYC, etc.)
- Various trade types (Forex, Binary, CFD, Crypto, Stock)
- Different trade statuses (Open, Closed, Cancelled)
- Multiple transaction types (Deposit, Withdrawal, Profit, etc.)
- Various notification types and priorities

## 📈 Performance Testing Workflow

### Step 1: Start Clean
```
1. DELETE /api/Seed/clear
2. GET /api/Seed/stats  (verify 0 records)
```

### Step 2: Seed Database
```
3. POST /api/Seed/seed-quick  (for quick test)
   OR
   POST /api/Seed/seed  (for standard test)
   OR
   POST /api/Seed/seed-large  (for stress test)
```

### Step 3: Verify Data
```
4. GET /api/Seed/stats  (check record counts)
```

### Step 4: Performance Test
```
5. GET /api/Seed/performance-test  (measure query performance)
```

### Step 5: Test Your APIs
```
6. GET /api/Investors
7. GET /api/Portfolios
8. GET /api/Trades
9. etc...
```

## 🎯 Use Cases

### Development Testing
```bash
# Quick seed for feature development
POST /api/Seed/seed-quick
```

### API Testing
```bash
# Standard dataset
POST /api/Seed/seed?recordsPerEntity=10000
```

### Performance Testing
```bash
# Large dataset
POST /api/Seed/seed-large

# Then measure
GET /api/Seed/performance-test
```

### Load Testing
```bash
# Very large dataset
POST /api/Seed/seed?recordsPerEntity=100000
```

## ⏱️ Expected Performance

### Seeding Time
| Records | Duration | Total Data |
|---------|----------|------------|
| 1,000 | ~15 sec | ~15,000 records |
| 10,000 | ~3 min | ~160,000 records |
| 50,000 | ~15 min | ~800,000 records |
| 100,000 | ~30 min | ~1,600,000 records |

### Query Performance (with 10k base records)
| Query | Expected Time |
|-------|---------------|
| Get 1000 investors | < 100ms |
| Get portfolios with joins | < 150ms |
| Complex nested query | < 300ms |
| Aggregation (SUM) | < 200ms |
| Count all | < 500ms |

## 🔍 Monitoring Progress

### Via API Logs
Watch the console where `dotnet run` is executing:
```
[11:00:00 INF] Starting database seeding with 10000 records per entity
[11:00:05 INF] Seeded 1000/10000 investors
[11:00:10 INF] Seeded 2000/10000 investors
...
[11:02:30 INF] ✅ Completed seeding 10000 investors
```

### Via Database
```bash
# Check progress in PostgreSQL
docker exec lemotick-investor-postgres psql -U lemotick_user -d InvestorManagementSystemDb -c "
SELECT 
    'Investors' as table_name, COUNT(*) as count FROM \"Investors\"
UNION ALL
SELECT 'Portfolios', COUNT(*) FROM \"Portfolios\"
UNION ALL
SELECT 'Trades', COUNT(*) FROM \"Trades\";
"
```

### Via Postman
```
GET /api/Seed/stats
```

## 🐛 Troubleshooting

### Seeding is Slow
- **Cause:** Database not optimized, running on slow disk
- **Solution:** Run on SSD, increase PostgreSQL memory settings

### Out of Memory
- **Cause:** Seeding too many records at once
- **Solution:** Use smaller batch sizes or increase available RAM

### Timeout Error
- **Cause:** HTTP request timeout (default 30 sec)
- **Solution:** 
  - For large seeds, monitor progress via logs
  - Endpoint continues running even after timeout
  - Check logs and stats endpoint for completion

### Duplicate Key Errors
- **Cause:** Database already contains data
- **Solution:** 
  ```
  DELETE /api/Seed/clear
  ```

### Performance Test Shows Slow Queries
- **Causes:**
  - Too much data in database
  - Missing indexes
  - Cold cache
- **Solutions:**
  - Run test multiple times (first is always slower)
  - Check database indexes
  - Analyze query plans

## 💡 Pro Tips

### 1. Start Small
```bash
# Always start with quick seed for testing
POST /api/Seed/seed-quick
```

### 2. Clear Between Tests
```bash
# Clear before each major test
DELETE /api/Seed/clear
POST /api/Seed/seed?recordsPerEntity=10000
```

### 3. Monitor Database Size
```bash
docker exec lemotick-investor-postgres psql -U lemotick_user -d InvestorManagementSystemDb -c "
SELECT pg_size_pretty(pg_database_size('InvestorManagementSystemDb'));
"
```

### 4. Backup Before Large Seeds
```bash
# Backup before seeding large datasets
docker exec -t lemotick-investor-postgres pg_dump -U lemotick_user InvestorManagementSystemDb > backup_before_seed.sql
```

### 5. Use PgAdmin for Visualization
- Access: http://localhost:5050
- View data distributions
- Analyze table sizes
- Check query performance

## 📊 Sample Workflow: Complete Performance Test

```bash
# 1. Clear existing data
DELETE /api/Seed/clear

# 2. Get baseline
GET /api/Seed/stats

# 3. Seed 10,000 records
POST /api/Seed/seed

# 4. Verify seeding
GET /api/Seed/stats

# 5. Run performance test
GET /api/Seed/performance-test

# 6. Test specific endpoints
GET /api/Investors?page=1&pageSize=100
GET /api/Portfolios?page=1&pageSize=100
GET /api/Trades?page=1&pageSize=100

# 7. Check database size
GET /api/Seed/stats

# 8. Clear when done
DELETE /api/Seed/clear
```

## 🎉 Ready to Test!

Your database seeding system includes:
- ✅ 7 API endpoints
- ✅ Multiple seeding options (quick, standard, large, custom)
- ✅ Performance testing
- ✅ Database statistics
- ✅ Clear functionality
- ✅ Realistic test data with proper relationships
- ✅ Progress monitoring
- ✅ Postman collection integration

**Start with Quick Seed and work your way up!** 🚀

---

**Note:** All seeding endpoints have no authentication for easy testing. In production, add proper authorization!

