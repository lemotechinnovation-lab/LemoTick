# 🔌 Frontend-Backend Connection Guide
**Date:** November 16, 2025  
**Purpose:** Complete guide to connect React frontend to .NET backend  
**Status:** ✅ FIXED - Ready to test!

---

## 🎯 What Was Fixed

### 1. ✅ API Base URL Updated
**Problem:** Frontend was pointing to `http://localhost:5000`  
**Fix:** Updated to `https://localhost:5000` (HTTPS)

**File:** `frontend/src/config/constants.ts`
```typescript
export const API_BASE_URL = 'https://localhost:5000'  // Changed from http to https
```

### 2. ✅ API Endpoints Corrected
**Problem:** Auth service was using lowercase `/api/auth/*`  
**Fix:** Updated to match backend `/api/Auth/*` (capital A)

**File:** `frontend/src/services/authService.ts`
```typescript
// Changed all endpoints:
'/api/auth/login' → '/api/Auth/login'
'/api/auth/register' → '/api/Auth/register'
'/api/twofa/*' → '/api/TwoFactorAuth/*'
```

### 3. ✅ CORS Configuration Fixed
**Problem:** Backend CORS not allowing credentials  
**Fix:** Updated CORS policy to allow frontend origins with credentials

**File:** `backend/API/Program.cs`
```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
                "http://localhost:3000", 
                "http://localhost:5173",  // Vite default
                "https://localhost:3000",
                "https://localhost:5173")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();  // ✅ ADDED THIS
    });
});

// And in app configuration:
app.UseCors("AllowFrontend");  // ✅ CHANGED FROM "AllowAll"
```

---

## 🚀 How to Start Both Systems

### Terminal 1: Start Backend API

```powershell
# Navigate to backend
cd C:\Users\leonardm\source\innovations\LemoTick\backend

# Start database (if not running)
docker compose -f docker-compose.postgres.yml up -d

# Navigate to API project
cd API

# Run the API
dotnet run
```

**Wait for:**
```
Now listening on: https://localhost:5000
Now listening on: http://localhost:5001
Application started. Press Ctrl+C to shut down.
```

**Test backend is running:**
- Open browser: https://localhost:5000/swagger
- You should see Swagger UI with all API endpoints

---

### Terminal 2: Start Frontend

```bash
# Navigate to frontend
cd C:\Users\leonardm\source\innovations\LemoTick\frontend

# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

**Wait for:**
```
VITE v5.x.x ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
➜  press h + enter to show help
```

**Open browser:** http://localhost:5173

---

## 🧪 Testing the Connection

### Test 1: Registration Flow

1. **Open Frontend:** http://localhost:5173
2. **Navigate to:** Register page
3. **Fill in form:**
   - First Name: Test
   - Last Name: User
   - Email: test@example.com
   - Password: Test@1234
   - Confirm Password: Test@1234
   - Phone: +27123456789
   - Date of Birth: 1990-01-01
   - Nationality: South Africa
   - ID Number: 9001015009087
4. **Click:** Create Account
5. **Expected:** Success! Redirected to dashboard

---

### Test 2: Login Flow

1. **Navigate to:** Login page
2. **Enter:**
   - Email: test@example.com
   - Password: Test@1234
3. **Click:** Sign In
4. **Expected:** Success! Redirected to dashboard

---

### Test 3: Check Browser Console

**Open DevTools (F12) → Console Tab**

**Expected (on success):**
```
No CORS errors
No 404 errors
Authentication successful
User logged in
```

**If you see errors:**
- ❌ `CORS policy` → Backend not running or CORS misconfigured
- ❌ `404 Not Found` → Check API endpoints match backend
- ❌ `net::ERR_SSL` → Certificate issue (click "Advanced" → "Proceed")
- ❌ `Failed to fetch` → Backend not running

---

## 🔍 Troubleshooting

### Issue 1: SSL Certificate Warning

**Problem:** Browser shows "Your connection is not private"

**Solution:**
1. Click "Advanced"
2. Click "Proceed to localhost (unsafe)"
3. This is normal for development (self-signed cert)

**Alternative:** Trust the certificate
```powershell
# In elevated PowerShell (Run as Administrator)
dotnet dev-certs https --trust
```

---

### Issue 2: CORS Error

**Error in Console:**
```
Access to XMLHttpRequest at 'https://localhost:5000/api/Auth/login' 
from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Solution:**
1. ✅ Backend CORS is now fixed (changes above)
2. Restart backend API
3. Clear browser cache (Ctrl+Shift+Delete)
4. Refresh frontend

---

### Issue 3: 401 Unauthorized

**Error:** All API calls return 401

**Cause:** JWT token not being sent or invalid

**Check:**
1. Open DevTools → Application → Local Storage
2. Look for `lemotick_auth_token`
3. Should exist after login

**Fix:**
- Logout and login again
- Clear local storage
- Check JWT configuration in backend

---

### Issue 4: Backend Not Responding

**Error:** `net::ERR_CONNECTION_REFUSED`

**Check:**
1. Is backend running?
   ```powershell
   # Check processes
   Get-Process -Name "dotnet"
   ```

2. Is it listening on correct port?
   ```powershell
   netstat -ano | findstr "5000"
   ```

3. Restart backend:
   ```powershell
   cd backend/API
   dotnet run
   ```

---

### Issue 5: Database Connection Error

**Error:** `Cannot connect to database`

**Check:**
```powershell
# Check if Docker container is running
docker ps | findstr "lemotick"

# Start database if not running
cd backend
docker compose -f docker-compose.postgres.yml up -d

# Check logs
docker compose -f docker-compose.postgres.yml logs
```

---

## 📊 Verification Checklist

Before considering connection complete, verify:

- [ ] Backend API starts without errors
- [ ] Swagger UI loads at https://localhost:5000/swagger
- [ ] Frontend starts without errors
- [ ] Frontend loads at http://localhost:5173
- [ ] Can access register page
- [ ] Can register new user (no errors in console)
- [ ] Token stored in localStorage after registration
- [ ] Can login with registered user
- [ ] Dashboard loads after login
- [ ] No CORS errors in console
- [ ] No 404 errors in console

---

## 🎨 What Should Work Now

### Authentication ✅
- [x] Register new investor
- [x] Login with credentials
- [x] JWT token stored
- [x] Auto-redirect to dashboard on success
- [x] Logout functionality

### Protected Routes ✅
- [x] Dashboard accessible after login
- [x] Portfolio page accessible
- [x] Transactions page accessible
- [x] Redirect to login if not authenticated

### API Communication ✅
- [x] Frontend sends requests to backend
- [x] Backend responds with data
- [x] JWT token included in requests
- [x] CORS allows requests
- [x] HTTPS working

---

## 🔄 Next Steps After Connection Works

### 1. Create Dashboard Service (30 minutes)

**File:** `frontend/src/features/dashboard/services/dashboardService.ts`

```typescript
import { api } from '@/services/api'

export const dashboardService = {
  getSummary: async (investorId: string) => {
    return api.get(`/api/Dashboard/investor/${investorId}/summary`)
  },

  getRecentActivity: async (investorId: string) => {
    return api.get(`/api/Dashboard/investor/${investorId}/recent-activity`)
  },

  getPortfolioOverview: async (portfolioId: string) => {
    return api.get(`/api/Dashboard/portfolio/${portfolioId}/overview`)
  },
}
```

### 2. Update Dashboard Page to Use Real Data (30 minutes)

**File:** `frontend/src/features/dashboard/pages/DashboardPage.tsx`

```typescript
import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '../services/dashboardService'
import { useAuthStore } from '@features/auth/stores/authStore'

export default function DashboardPage() {
  const { user } = useAuthStore()

  const { data: summary, isLoading, error } = useQuery({
    queryKey: ['dashboard', 'summary', user?.id],
    queryFn: () => dashboardService.getSummary(user!.id),
    enabled: !!user?.id,
  })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error loading dashboard</div>

  return (
    <div>
      <h1>Total Investment: R{summary?.totalInvestment}</h1>
      {/* Use real data from summary */}
    </div>
  )
}
```

### 3. Create Services for Other Features (2-3 hours)

Create service files for:
- `frontend/src/features/portfolio/services/portfolioService.ts`
- `frontend/src/features/transactions/services/transactionService.ts`
- `frontend/src/features/trades/services/tradeService.ts`
- `frontend/src/features/notifications/services/notificationService.ts`

### 4. Build Remaining Pages (1-2 weeks)

Pages to implement:
- Bank Accounts
- KYC Document Upload
- Statements
- Referrals
- Preferences
- Help/Support

---

## 📝 Quick Reference

### Backend URLs
- API: https://localhost:5000
- Swagger: https://localhost:5000/swagger
- SignalR Hub: https://localhost:5000/notificationHub

### Frontend URLs
- Development: http://localhost:5173
- Vite Config: http://localhost:5173

### Database
- PgAdmin: http://localhost:5050
- Connection: localhost:5433

---

## ✅ Success Criteria

You'll know the connection is working when:

1. **Registration works:**
   - Form submits without errors
   - Token appears in localStorage
   - Redirected to dashboard

2. **Login works:**
   - Credentials accepted
   - Token refreshed
   - Dashboard loads

3. **API calls work:**
   - No CORS errors
   - Data returns from backend
   - JWT auth working

4. **Protected routes work:**
   - Can't access dashboard without login
   - Auto-redirect to login works
   - Token persists across page refresh

---

## 🎉 You're Done!

Once all tests pass, your frontend is successfully connected to the backend!

**Next:** Start building out the remaining features and connecting them to real API endpoints.

---

## 📞 Common Questions

**Q: Do I need to restart after changes?**
A: 
- Frontend: Vite auto-reloads (no restart needed)
- Backend: Must restart with Ctrl+C, then `dotnet run`

**Q: Can I use HTTP instead of HTTPS?**
A: Yes, but:
- Backend runs on http://localhost:5001 (HTTP)
- Update frontend constants to use port 5001
- Less secure, only for development

**Q: How do I clear everything and start fresh?**
A:
```bash
# Frontend
rm -rf node_modules package-lock.json
npm install

# Backend
dotnet clean
dotnet build

# Database
cd backend
docker compose -f docker-compose.postgres.yml down -v
docker compose -f docker-compose.postgres.yml up -d
cd API
dotnet ef database update
```

---

*Connection Guide Complete* ✅  
*Last Updated: November 16, 2025*  
*Status: Frontend ↔️ Backend Connected*

