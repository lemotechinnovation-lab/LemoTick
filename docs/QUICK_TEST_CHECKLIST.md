# ✅ Quick Test Checklist - Frontend-Backend Connection
**Date:** November 16, 2025  
**Status:** Testing Required

---

## 🚀 Systems Status

### Backend API
- **Process:** Restarted with new CORS configuration
- **URL:** https://localhost:5000
- **Swagger:** https://localhost:5000/swagger
- **CORS:** ✅ Updated to allow frontend origins with credentials

### Frontend
- **URL:** http://localhost:5173
- **API Config:** ✅ Updated to https://localhost:5000
- **Auth Service:** ✅ Fixed endpoints (/api/Auth/*)

---

## 📋 Testing Steps

### Step 1: Verify Backend is Running (1 minute)

1. **Open browser:** https://localhost:5000/swagger
2. **Expected:** Swagger UI loads
3. **If certificate warning:** 
   - Click "Advanced"
   - Click "Proceed to localhost (unsafe)"

**✅ Backend is ready when you see Swagger UI**

---

### Step 2: Test Backend API Directly (2 minutes)

In Swagger UI, test registration:

1. Find **POST /api/Auth/register**
2. Click "Try it out"
3. Use this test data:
```json
{
  "firstName": "Test",
  "lastName": "User",
  "email": "test@example.com",
  "password": "Test@1234",
  "confirmPassword": "Test@1234",
  "phoneNumber": "+27123456789",
  "dateOfBirth": "1990-01-01",
  "nationality": "South Africa",
  "idNumber": "9001015009087"
}
```
4. Click "Execute"
5. **Expected:** 200 OK + token in response

**✅ If you get a token, backend API is working!**

---

### Step 3: Start Frontend (if not running)

```bash
# Open new terminal
cd C:\Users\leonardm\source\innovations\LemoTick\frontend

# Start dev server
npm run dev
```

**Wait for:** `Local: http://localhost:5173/`

---

### Step 4: Test Frontend Registration (3 minutes)

1. **Open:** http://localhost:5173
2. **Navigate to:** Register page
3. **Fill form:**
   - First Name: Test
   - Last Name: User2
   - Email: test2@example.com
   - Password: Test@1234
   - Confirm Password: Test@1234
   - Phone: +27123456789
   - Date of Birth: 1990-01-01
   - Nationality: South Africa
   - ID Number: 9001015009088
4. **Open DevTools:** Press F12
5. **Go to:** Network tab
6. **Click:** Create Account
7. **Watch the Network tab**

**Expected:**
- Request to `https://localhost:5000/api/Auth/register`
- Status: 200 OK
- Response contains: token, refreshToken, investor object
- Redirect to dashboard

**If Success:** ✅ Connection working!  
**If Errors:** See troubleshooting below

---

### Step 5: Verify Token Storage

After successful registration/login:

1. **Open DevTools:** F12
2. **Go to:** Application tab → Local Storage
3. **Check for:**
   - `lemotick_auth_token` ✅
   - `lemotick_refresh_token` ✅
   - `lemotick_user` ✅

**✅ If all three exist, authentication is working!**

---

## 🔍 Common Issues & Solutions

### Issue 1: net::ERR_EMPTY_RESPONSE

**Cause:** Backend not running or crashed

**Solution:**
```powershell
# Check if backend is running
Get-Process -Name "dotnet"

# If not running, start it
cd C:\Users\leonardm\source\innovations\LemoTick\backend\API
dotnet run
```

---

### Issue 2: CORS Error

**Console shows:**
```
Access-Control-Allow-Origin error
```

**Solution:**
1. Backend must be restarted after CORS changes (DONE ✅)
2. Clear browser cache: Ctrl+Shift+Delete
3. Hard refresh: Ctrl+F5

---

### Issue 3: 404 Not Found

**URL shows:** `/api/auth/login` (lowercase)

**Solution:**
- Already fixed! Endpoints updated to `/api/Auth/login` (capital A)
- Clear browser cache
- Restart frontend: Ctrl+C, then `npm run dev`

---

### Issue 4: Certificate Error

**Browser shows:** "Your connection is not private"

**Solution:**
1. Click "Advanced"
2. Click "Proceed to localhost (unsafe)"
3. Or trust certificate:
```powershell
dotnet dev-certs https --trust
```

---

### Issue 5: Request Cancelled / ERR_CONNECTION_REFUSED

**Cause:** Backend not started yet

**Solution:**
```powershell
# Start backend
cd C:\Users\leonardm\source\innovations\LemoTick\backend\API
dotnet run

# Wait for: "Now listening on: https://localhost:5000"
```

---

## 🐛 Debugging Checklist

If registration fails, check:

### Backend Console
- [ ] Shows "Now listening on: https://localhost:5000"
- [ ] No errors after startup
- [ ] Shows incoming requests when you try to register

### Frontend Console (F12)
- [ ] Network tab shows request to https://localhost:5000/api/Auth/register
- [ ] Request Method: POST
- [ ] Status Code: (check for 200, 400, 500, etc.)
- [ ] No CORS errors
- [ ] No certificate errors

### Request Details
- [ ] Request Headers include: Content-Type: application/json
- [ ] Request Body has all required fields
- [ ] Response Body contains token (if successful)

---

## ✅ Success Criteria

Connection is fully working when:

1. ✅ Backend API responds to Swagger requests
2. ✅ Frontend can register new user
3. ✅ No CORS errors in console
4. ✅ Token stored in localStorage
5. ✅ Redirect to dashboard after login
6. ✅ Dashboard loads without errors

---

## 📊 What to Check Next

Once connection works:

### 1. Test Login
- Use registered credentials
- Should get new token
- Should redirect to dashboard

### 2. Test Protected Routes
- Try accessing /dashboard without login
- Should redirect to /login
- After login, should access dashboard

### 3. Test Logout
- Click logout button
- Token should be removed from localStorage
- Should redirect to login

### 4. Test Token Persistence
- Login
- Refresh page (F5)
- Should still be logged in (token persists)

---

## 🎯 Next Steps After Connection Works

1. **Create Dashboard Service**
   - Connect dashboard to real API
   - Replace mock data

2. **Create Portfolio Service**
   - List portfolios
   - Create/edit portfolios

3. **Create Transaction Service**
   - List transactions
   - Create deposits/withdrawals

4. **Build Remaining Pages**
   - Bank accounts
   - KYC documents
   - Statements
   - Referrals

---

## 💡 Pro Tips

**Tip 1:** Keep backend and frontend consoles visible
- Backend: Shows incoming requests
- Frontend: Shows CORS/network errors

**Tip 2:** Use Swagger for quick API testing
- Test endpoints before connecting frontend
- Verify backend works independently

**Tip 3:** Check Network tab first
- F12 → Network
- Shows exactly what's being sent/received
- Easier to debug than console errors

**Tip 4:** Clear cache often
- Ctrl+Shift+Delete
- Or use incognito mode
- Prevents old code from causing issues

---

## 📞 Need Help?

**Backend not starting?**
- Check: `backend/API/logs/investor-management-*.txt`
- Run: `docker ps` (database must be running)

**Frontend not building?**
- Run: `npm install` (reinstall dependencies)
- Delete: `node_modules` and reinstall

**Still stuck?**
- Test backend in Swagger first
- Test each endpoint individually
- Check browser DevTools Console + Network tabs

---

## ✅ Final Checklist

Before moving to next steps:

- [ ] Backend starts without errors
- [ ] Swagger UI loads
- [ ] Can register user in Swagger
- [ ] Frontend builds without errors
- [ ] Frontend loads in browser
- [ ] Can register user from frontend
- [ ] Token stored in localStorage
- [ ] Can login with registered user
- [ ] Dashboard loads after login
- [ ] No errors in console

**If all checked:** ✅ **READY TO BUILD FEATURES!**

---

*Last Updated: November 16, 2025*  
*Status: Ready for Testing*  
*Next: Build remaining features*


