# 🚀 Quick Test Guide - See Your Dashboard in Action!

**Problem:** Dashboard appears empty because there's no data yet.  
**Solution:** Create test data by following this flow.

---

## ✅ Step-by-Step Test (5 minutes)

### 1. Start Both Servers

**Terminal 1 - Backend:**
```bash
cd backend/API
dotnet run
```
Wait for: `Now listening on: https://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Visit: `http://localhost:5173`

---

### 2. Create Your Account

1. Click **"Register"**
2. Fill in:
   - Full Name: Test User
   - Email: test@example.com
   - Password: Test123!
   - Date of Birth: 1990-01-01
   - Phone: +27123456789
3. Click **"Create Account"**
4. Should see: ✅ "Registration successful"

---

### 3. Login

1. Email: test@example.com
2. Password: Test123!
3. Click **"Sign In"**
4. Should redirect to Dashboard

**⚠️ Dashboard will be EMPTY at this point - this is normal!**

---

### 4. Add a Bank Account

1. Go to **"Bank Accounts"** (sidebar)
2. Click **"Add Bank Account"**
3. Fill in:
   - Account Holder: Your Name
   - Bank Name: First National Bank
   - Account Number: 1234567890
   - Branch Code: 250655
   - Account Type: Savings
   - ✅ Set as default
4. Click **"Add Account"**
5. Should see: ✅ "Bank account added successfully"

---

### 5. Create a Portfolio

1. Go to **"Portfolios"** (sidebar)
2. Click **"Create Portfolio"**
3. Fill in:
   - Name: My First Portfolio
   - Strategy: Balanced
   - Risk Level: Medium
   - Initial Investment: R10,000
   - Max Drawdown: 20%
   - Target Return: 15%
4. Click **"Create Portfolio"**
5. Should see: ✅ "Portfolio created successfully!"

---

### 6. Make a Deposit

1. Go to **"Transactions"** (sidebar)
2. Click **"Make Deposit"** (green button)
3. Fill in:
   - Amount: R10,000
   - Portfolio: Select "My First Portfolio"
   - Reference: TEST001 (optional)
   - Notes: Initial deposit (optional)
4. Click **"Confirm Deposit"**
5. Should see: ✅ "Deposit initiated successfully!"

---

### 7. Go Back to Dashboard

1. Click **"Dashboard"** (sidebar)
2. **NOW YOU SHOULD SEE:**
   - ✅ Total Investment: R10,000
   - ✅ Current Value: R10,000
   - ✅ Net Profit: R0
   - ✅ Active Portfolios: 1
   - ✅ Performance chart (may be flat initially)
   - ✅ Recent activity showing your deposit

---

## 🎯 What to Check

### Dashboard Should Show:
- ✅ **4 Summary Cards** with real numbers
- ✅ **Performance Chart** (area chart with gradient)
- ✅ **Recent Activity** list showing:
  - Your deposit transaction
- ✅ **Portfolio Summary** table

### If Dashboard is Still Empty:
1. **Check browser console** (F12) for errors
2. **Check backend is running** on https://localhost:5000
3. **Verify you're logged in** (check top-right corner for user name)
4. **Hard refresh** the page (Ctrl+Shift+R)

---

## 🧪 Advanced Testing (Optional)

### Test Withdrawal:
1. Go to **Transactions**
2. Click **"Request Withdrawal"** (orange button)
3. Try withdrawing R1,000
4. Should see validation (can't withdraw more than available)

### Test Portfolio Creation:
1. Create another portfolio with different settings
2. Dashboard should update to show 2 active portfolios

### Test Bank Account Management:
1. Add another bank account
2. Set it as default
3. Delete the first one

---

## 🔍 Troubleshooting

### "Dashboard shows empty cards"
**Cause:** No data in database yet  
**Fix:** Follow steps 4-6 to create portfolio and deposit

### "Error loading dashboard data"
**Cause:** Backend not running or connection issue  
**Fix:** 
1. Check backend terminal - should show "Now listening..."
2. Try: `https://localhost:5000/api/health` in browser
3. If SSL error, accept certificate

### "Cannot connect to backend"
**Cause:** Frontend API URL mismatch  
**Fix:**
1. Create `frontend/.env` with:
   ```
   VITE_API_BASE_URL=https://localhost:5000
   VITE_SIGNALR_HUB_URL=https://localhost:5000/hubs
   ```
2. Restart frontend: Ctrl+C, then `npm run dev`

### "Performance chart not showing"
**Cause:** Need time-series data  
**Fix:** This is normal for new portfolios. Chart will populate as trades execute.

---

## ✅ Expected Results After Testing

Your dashboard should show:
- **Total Investment:** R10,000 (or whatever you deposited)
- **Current Value:** R10,000
- **Net Profit:** R0.00 (no trades yet)
- **Active Portfolios:** 1 (or more if you created multiple)
- **Recent Activity:** Your deposit and portfolio creation
- **Portfolio Summary:** Your portfolio with metrics

---

## 📊 Sample Data for Testing

If you want more realistic data, create:
- 2-3 portfolios with different risk levels
- Multiple deposits (R5,000, R10,000, R15,000)
- Try a withdrawal request
- Add 2-3 bank accounts

The dashboard will automatically aggregate all this data!

---

## 🎊 Success Criteria

✅ Dashboard loads without errors  
✅ Summary cards show real numbers  
✅ Performance chart is visible  
✅ Recent activity shows your transactions  
✅ Portfolio summary table appears  
✅ All numbers are accurate  

---

**If you've followed all steps and dashboard is still empty, share the browser console errors (F12 → Console tab) and I'll help debug!**

---

**Last Updated:** November 18, 2025  
**Status:** Ready to Test 🚀

