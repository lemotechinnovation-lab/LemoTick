# 🔧 Frontend Connection Fix Plan

**Date:** November 18, 2025  
**Issue:** Frontend not fully connected to backend API  
**Status:** Ready to fix

---

## 🔍 Problems Identified

### 1. Wrong API URL ❌
- **Current:** `https://localhost:5000` (in constants.ts default)
- **Correct:** `https://localhost:7001` (where backend actually runs)
- **Impact:** ALL API calls fail with connection errors

### 2. Hardcoded Portfolio Table ❌
**File:** `frontend/src/features/dashboard/pages/DashboardPage.tsx` (lines 238-251)

**Problem:**
```tsx
{['Aggressive Growth', 'Balanced', 'Conservative'].map((name, i) => (
    // Hardcoded portfolio names and values
    <td>{formatCurrency(40000 + i * 10000)}</td> // FAKE DATA
))}
```

**Should be:**
```tsx
{summary.portfolios?.map((portfolio) => (
    // Real portfolio data from API
    <td>{formatCurrency(portfolio.currentValue)}</td>
))}
```

### 3. Missing .env File ❌
- No `.env` file exists in `frontend/` directory
- Frontend falls back to wrong default values
- **Fixed:** Created `.env` with correct backend URL

### 4. Charts May Show Empty Data ⚠️
- Charts depend on `performanceHistory` from API
- If API doesn't return data, charts will be empty
- Need to verify backend returns performance history

---

## ✅ What's Already Good

### Services Are Correctly Configured ✅
All service files are properly calling real endpoints:

**dashboardService.ts:**
```typescript
getSummary: async (investorId: string) => {
    return api.get(`/api/Dashboard/investor/${investorId}/summary`)
}
```

**portfolioService.ts:**
```typescript
getInvestorPortfolios: async (investorId: string) => {
    return api.get(`/api/Portfolios/investor/${investorId}`)
}
```

**API Configuration ✅**
- Axios interceptors configured
- JWT token handling working
- Error handling implemented
- Request/response types defined

---

## 🔧 Step-by-Step Fix

### Step 1: Fix API URL ✅ DONE
**File:** `frontend/.env`

Created with correct backend URL:
```env
VITE_API_BASE_URL=https://localhost:7001
```

### Step 2: Fix Hardcoded Portfolio Table
**File:** `frontend/src/features/dashboard/pages/DashboardPage.tsx`

**Change lines 217-255:**

**Before (Hardcoded):**
```tsx
<div className="mt-6 card">
    <h3 className="mb-4 text-lg font-bold text-gray-900">Portfolio Summary</h3>
    <div className="overflow-x-auto">
        <table className="w-full">
            <thead>
                <tr className="border-b">
                    <th className="pb-3 text-left text-sm font-medium text-gray-600">Portfolio</th>
                    <th className="pb-3 text-right text-sm font-medium text-gray-600">Value</th>
                    <th className="pb-3 text-right text-sm font-medium text-gray-600">Profit/Loss</th>
                    <th className="pb-3 text-right text-sm font-medium text-gray-600">ROI</th>
                </tr>
            </thead>
            <tbody>
                {['Aggressive Growth', 'Balanced', 'Conservative'].map((name, i) => (
                    <tr key={name} className="border-b last:border-0">
                        <td className="py-4 text-sm font-medium text-gray-900">{name}</td>
                        <td className="py-4 text-right text-sm text-gray-900">
                            {formatCurrency(40000 + i * 10000)}
                        </td>
                        <td className="py-4 text-right text-sm font-medium text-green-600">
                            +{formatCurrency(5000 + i * 2000)}
                        </td>
                        <td className="py-4 text-right text-sm font-medium text-green-600">
                            {formatPercentage(12.5 + i * 3)}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
</div>
```

**After (Real Data):**
```tsx
{/* Portfolio Summary - Now using real API data */}
{summary.portfolioSummaries && summary.portfolioSummaries.length > 0 && (
    <div className="mt-6 card">
        <h3 className="mb-4 text-lg font-bold text-gray-900">Portfolio Summary</h3>
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="border-b">
                        <th className="pb-3 text-left text-sm font-medium text-gray-600">Portfolio</th>
                        <th className="pb-3 text-right text-sm font-medium text-gray-600">Value</th>
                        <th className="pb-3 text-right text-sm font-medium text-gray-600">Profit/Loss</th>
                        <th className="pb-3 text-right text-sm font-medium text-gray-600">ROI</th>
                        <th className="pb-3 text-right text-sm font-medium text-gray-600">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {summary.portfolioSummaries.map((portfolio) => (
                        <tr key={portfolio.portfolioId} className="border-b last:border-0">
                            <td className="py-4 text-sm font-medium text-gray-900">
                                {portfolio.portfolioName}
                            </td>
                            <td className="py-4 text-right text-sm text-gray-900">
                                {formatCurrency(portfolio.currentValue)}
                            </td>
                            <td className={`py-4 text-right text-sm font-medium ${
                                portfolio.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                                {portfolio.netProfit >= 0 ? '+' : ''}
                                {formatCurrency(portfolio.netProfit)}
                            </td>
                            <td className={`py-4 text-right text-sm font-medium ${
                                portfolio.profitPercentage >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                                {formatPercentage(portfolio.profitPercentage)}
                            </td>
                            <td className="py-4 text-right text-sm">
                                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                                    portfolio.status === 'Active' 
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-gray-100 text-gray-800'
                                }`}>
                                    {portfolio.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
)}
```

### Step 3: Update DashboardSummary Type
**File:** `frontend/src/features/dashboard/services/dashboardService.ts`

**Add to DashboardSummary interface (around line 25):**
```typescript
export interface DashboardSummary {
    // ... existing fields ...
    performanceHistory?: Array<{
        date: string
        value: number
    }>
    // ADD THIS:
    portfolioSummaries?: Array<{
        portfolioId: string
        portfolioName: string
        currentValue: number
        netProfit: number
        profitPercentage: number
        status: string
    }>
}
```

### Step 4: Test Backend Endpoint

**Verify backend returns portfolio summaries:**
```bash
# Start backend
cd backend/API
dotnet run

# In another terminal, test with curl (after getting token)
curl -X GET "https://localhost:7001/api/Dashboard/investor/{investorId}/summary" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -k
```

### Step 5: Restart Frontend
```bash
cd frontend
npm run dev
```

---

## 🧪 Testing Checklist

After applying fixes:

### 1. API Connection Test
- [ ] Open browser DevTools → Network tab
- [ ] Navigate to Dashboard
- [ ] Verify API calls go to `https://localhost:7001` (not 5000)
- [ ] Check response status (should be 200 OK)
- [ ] Verify JWT token in Authorization header

### 2. Dashboard Data Test
- [ ] Dashboard shows real investor name (not "John Doe")
- [ ] Total investment shows real value (not hardcoded)
- [ ] Portfolio summary table shows real portfolios (not "Aggressive Growth")
- [ ] Charts show real performance data
- [ ] Recent activity shows real trades

### 3. Portfolio Page Test
- [ ] Portfolios load from API
- [ ] Can create new portfolio
- [ ] Portfolio cards show real data
- [ ] Risk levels correctly displayed

### 4. Authentication Test
- [ ] Can login with real credentials
- [ ] JWT token stored in localStorage
- [ ] Token included in API requests
- [ ] Logout clears token

---

## ⚠️ Common Issues & Solutions

### Issue 1: CORS Errors
**Error:** `Access to XMLHttpRequest has been blocked by CORS policy`

**Solution:** Backend already configured CORS for port 5173 (Vite), but check `backend/API/Program.cs`:
```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
                "http://localhost:3000",
                "http://localhost:5173",  // ✅ Vite port
                "https://localhost:3000",
                "https://localhost:5173")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});
```

### Issue 2: SSL Certificate Errors
**Error:** `NET::ERR_CERT_AUTHORITY_INVALID`

**Solution:** Accept the self-signed certificate:
1. Navigate to `https://localhost:7001` in browser
2. Click "Advanced"
3. Click "Proceed to localhost (unsafe)"
4. OR configure Vite proxy in `vite.config.ts`

### Issue 3: Empty Performance Charts
**Error:** Charts show but no data points

**Solution:** Backend needs to return performanceHistory:
```csharp
// In DashboardController.cs, ensure summary includes:
summary.PerformanceHistory = await GetPerformanceHistory(investorId);
```

### Issue 4: "No portfolios" Message
**Error:** Dashboard loads but shows empty state

**Possible Causes:**
1. No portfolios created yet → Create a portfolio
2. API returning empty array → Check backend logs
3. Wrong investor ID → Verify login returns correct user.id

---

## 📋 Backend Verification Steps

### 1. Check Backend API is Running
```bash
cd backend/API
dotnet run

# Should see:
# info: Microsoft.Hosting.Lifetime[14]
#       Now listening on: https://localhost:7001
```

### 2. Check Database Connection
```bash
cd backend
docker compose -f docker-compose.postgres.yml ps

# Should see postgres container running
```

### 3. Test Health Endpoint
```bash
curl https://localhost:7001/api/Health -k

# Should return: { "status": "Healthy" }
```

### 4. Test Register Endpoint
```bash
curl -X POST "https://localhost:7001/api/Authentication/register" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "password": "Test123!@#",
    "phoneNumber": "0123456789",
    "dateOfBirth": "1990-01-01",
    "nationality": "South African",
    "idNumber": "9001010000000"
  }' \
  -k
```

### 5. Test Login Endpoint
```bash
curl -X POST "https://localhost:7001/api/Authentication/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#"
  }' \
  -k
```

---

## 🚀 Quick Start After Fixes

### Terminal 1: Start Backend
```bash
cd backend
docker compose -f docker-compose.postgres.yml up -d
cd API
dotnet run
```

### Terminal 2: Start Frontend
```bash
cd frontend
npm run dev
```

### Browser
1. Navigate to `http://localhost:5173`
2. Register a new account
3. Login
4. Create a portfolio
5. Add a transaction (deposit)
6. Verify data shows correctly

---

## 📊 Expected API Flow

### 1. User Registration
```
POST /api/Authentication/register
→ Returns { token, refreshToken, user }
→ Frontend stores in localStorage
→ Redirects to dashboard
```

### 2. Dashboard Load
```
GET /api/Dashboard/investor/{id}/summary
→ Returns real investor data
→ Dashboard displays:
   - Total investment
   - Current value
   - Net profit
   - Active portfolios
   - Performance chart data
   - Recent activity
```

### 3. Portfolio Load
```
GET /api/Portfolios/investor/{id}
→ Returns array of portfolios
→ Portfolio page displays cards with:
   - Portfolio name
   - Current value
   - Risk level
   - Profit/loss
```

---

## 🎯 Success Criteria

Frontend is fully functional when:

✅ All API calls go to `https://localhost:7001`  
✅ Dashboard shows real data (not hardcoded)  
✅ Charts display actual performance history  
✅ Portfolio table shows real portfolios  
✅ Can create/view portfolios  
✅ Authentication works end-to-end  
✅ Recent activity shows real trades  
✅ No console errors in browser  
✅ Network tab shows 200 OK responses  
✅ JWT tokens properly attached to requests  

---

## 📝 Files to Update

**Already Updated:**
- [x] `frontend/.env` - Created with correct API URL

**Need to Update:**
- [ ] `frontend/src/features/dashboard/pages/DashboardPage.tsx` - Remove hardcoded portfolio table
- [ ] `frontend/src/features/dashboard/services/dashboardService.ts` - Add portfolioSummaries type

**Optional Enhancements:**
- [ ] Add loading skeletons for better UX
- [ ] Add error retry logic
- [ ] Implement optimistic updates
- [ ] Add real-time SignalR connection
- [ ] Implement chart animations
- [ ] Add export to CSV/PDF features

---

## 🔍 Next Steps

1. **Apply the fixes above** (DashboardPage.tsx changes)
2. **Restart frontend** (`npm run dev`)
3. **Test thoroughly** using checklist
4. **Report any issues** for further fixes

---

**Status:** Ready to implement  
**Priority:** HIGH - Blocking frontend functionality  
**Estimated Time:** 30 minutes to apply all fixes  
**Risk:** LOW - Changes are isolated and well-defined

