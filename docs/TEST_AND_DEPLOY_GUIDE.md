# 🧪 Test & Deploy Guide
**Quick reference for testing and deploying your platform**

---

## 🧪 **TESTING (Do This First!)**

### **1. Quick Health Check (5 minutes):**

```bash
# Check backend is running
netstat -ano | findstr ":5000"
# Should show LISTENING

# Check frontend is running  
netstat -ano | findstr ":5173"
# Should show LISTENING

# Check database
docker ps | findstr "postgres"
# Should show postgres container running
```

### **2. Open Frontend:**
```
http://localhost:5173
```

### **3. Test User Journey:**
1. Register new user
2. Login
3. Check dashboard loads
4. Navigate to each page
5. Verify no console errors (F12)

### **4. Add Test Data via Swagger:**
```
https://localhost:5000/swagger
```

Create:
- POST /api/Portfolios - Add portfolio
- POST /api/Transactions - Add transaction
- POST /api/BankAccounts - Add bank account

Then refresh frontend and see data populate!

---

## 🚀 **DEPLOYMENT CHECKLIST**

### **Pre-Deployment:**
- [ ] All tests passing
- [ ] No console errors
- [ ] Environment variables configured
- [ ] Database backup taken
- [ ] SSL certificates ready

### **Deployment:**
- [ ] Deploy database
- [ ] Deploy backend API
- [ ] Deploy frontend
- [ ] Configure domain/DNS
- [ ] Test production URLs

### **Post-Deployment:**
- [ ] Smoke tests on production
- [ ] Monitor logs for errors
- [ ] Setup monitoring/alerts
- [ ] Create admin user
- [ ] Announce launch!

---

## 📝 **ENVIRONMENT VARIABLES**

### **Backend (.env):**
```
ConnectionStrings__DefaultConnection=...
JwtSettings__Secret=...
JwtSettings__Issuer=...
JwtSettings__Audience=...
EmailSettings__SmtpServer=...
EmailSettings__SmtpPort=...
EmailSettings__Username=...
EmailSettings__Password=...
```

### **Frontend (.env):**
```
VITE_API_BASE_URL=https://your-api-domain.com
VITE_SIGNALR_HUB_URL=https://your-api-domain.com/notificationHub
```

---

## 🎯 **LAUNCH DAY CHECKLIST**

- [ ] Final testing complete
- [ ] Backup everything
- [ ] Deploy to production
- [ ] Test production URLs
- [ ] Monitor for 1 hour
- [ ] Announce to first users
- [ ] Have support ready

---

**YOU'RE READY TO LAUNCH!** 🚀

