# 🔧 Fix Backend 404 Error

**Problem:** Frontend shows `404 Not Found` for dashboard API  
**Cause:** Backend failed to start because the exe file is locked by another process

---

## ✅ Quick Fix (2 minutes)

### Step 1: Kill the Locked Process

**Option A: Task Manager (Easiest)**
1. Press `Ctrl + Shift + Esc` to open Task Manager
2. Go to "Details" tab
3. Find `InvestorManagementSystem.API.exe`
4. Right-click → **End Task**
5. If it asks for admin, click "Yes"

**Option B: PowerShell as Admin**
```powershell
# Right-click PowerShell → Run as Administrator
taskkill /F /IM InvestorManagementSystem.API.exe /T
```

---

### Step 2: Restart Backend

```bash
cd backend/API
dotnet run
```

**Wait for:** `Now listening on: https://localhost:5000`

---

### Step 3: Refresh Frontend

- Go back to your browser
- Press `Ctrl + Shift + R` (hard refresh)
- Dashboard should now load!

---

## 🎯 Expected Result

After restart, you should see:
- ✅ No more 404 errors in console
- ✅ Dashboard loads with data
- ✅ Portfolio shows R0.00 (not RNaN)

---

## 🐛 Why This Happened

Your backend was already running from before. When you tried `dotnet run` again:
- Windows locked the `.exe` file (process still running)
- Build failed after 10 retries
- Frontend couldn't connect → 404 errors

**Solution:** Always kill the old process before restarting!

---

## 📊 About Your Portfolio Data

I notice your portfolio shows:
- Current Value: R 0.00 ✅
- Initial Investment: RNaN ❌
- Net Profit: RNaN ❌

**This means:** The portfolio was created but needs a deposit to have proper values.

**To fix:**
1. Go to "Transactions" page
2. Click "Make Deposit" (green button)
3. Deposit R10,000 to your "Test" portfolio
4. Go back to Dashboard
5. Values will update to real numbers!

---

## ✅ Verification Checklist

After killing the process and restarting backend:

1. **Check Terminal:**
   ```
   ✅ Now listening on: https://localhost:5000
   ✅ Application started. Press Ctrl+C to shut down.
   ```

2. **Check Browser Console (F12):**
   ```
   ✅ No 404 errors
   ✅ GET /api/Dashboard/investor/.../summary → 200 OK
   ```

3. **Check Dashboard:**
   ```
   ✅ No "Error loading dashboard data" message
   ✅ Cards show real numbers (even if 0)
   ✅ Chart appears (even if empty)
   ```

---

## 🚀 Quick Test After Fix

1. Dashboard loads ✅
2. Create a deposit ✅
3. Dashboard updates ✅
4. All pages work ✅

---

**Need more help?** Share any new error messages from the console!

