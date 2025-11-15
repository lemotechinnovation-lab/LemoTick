# 🚀 Live Deployment Checklist - Go/No-Go Decision

**Date:** ____________  
**Prepared By:** ____________  
**Account Balance:** $____________

---

## 📋 PHASE 1: Demo Testing Results

### **Minimum Requirements (ALL must pass):**

- [ ] **Demo trading duration:** _____ days (minimum 7 days)
- [ ] **Total trades executed:** _____ (minimum 100 trades)
- [ ] **Win rate achieved:** _____% (minimum 60%)
- [ ] **Average daily profit:** $_____ (positive required)
- [ ] **Maximum drawdown:** _____% (maximum 12%)
- [ ] **Emergency stops triggered:** _____ (maximum 0)
- [ ] **Consecutive loss max:** _____ (maximum 5)

### **Performance Validation:**

- [ ] Win rate is **stable** (not declining)
- [ ] Daily profits are **consistent** (not random spikes)
- [ ] Drawdowns are **controlled** (not erratic)
- [ ] No unexplained behavior in logs
- [ ] Grafana shows all metrics correctly
- [ ] All trades can be explained by strategy

**If ANY box is unchecked → STOP, continue demo testing**

---

## 🔑 PHASE 2: Live Credentials Setup

### **Account Creation:**

- [ ] Live Deriv account created at https://deriv.com
- [ ] KYC verification **completed** (ID + address)
- [ ] Account is **active and verified**
- [ ] 2FA (Two-Factor Authentication) **enabled**
- [ ] Funding method configured

### **Funding:**

- [ ] Initial deposit amount: $_____ (recommended: $100-200)
- [ ] Amount is **affordable loss** (can lose without financial hardship)
- [ ] Withdrawal method verified and tested
- [ ] Understand deposit/withdrawal times

### **API Token Generation:**

- [ ] Live API token generated from https://app.deriv.com/account/api-token
- [ ] Token name: `LemoTick-Live-Trading`
- [ ] Required scopes selected:
  - [ ] ✅ Read
  - [ ] ✅ Trade
  - [ ] ✅ Payments
  - [ ] ✅ Trading Information
  - [ ] ❌ Admin (NOT selected)
- [ ] Token copied and saved securely
- [ ] Token tested with `test_live_token.py`
- [ ] Token confirmed as **REAL account** (not demo)

---

## ⚙️ PHASE 3: Configuration

### **Settings File:**

- [ ] `settings.yaml` updated:
  ```yaml
  account_mode:
    use_live_account: true  # ✅ Set to true
    require_explicit_confirmation: true  # ✅ Keep as true
  ```

- [ ] Live account settings reviewed:
  ```yaml
  accounts:
    real:
      min_stake: 5.0        # Start conservative
      max_stake: 10.0       # Lower than 20 for first week
      initial_equity: ___   # Match your deposit
      risk_per_trade: 0.02  # 2% (conservative)
  ```

### **Credentials File:**

- [ ] `config/credentials.live.env` created
- [ ] Live API token added (not demo token)
- [ ] File contains: `LEMOTICK_LIVE_ACCOUNT=true`
- [ ] `.gitignore` updated to exclude `*.live.env`
- [ ] Git status shows `credentials.live.env` as **ignored**

### **Security:**

- [ ] Live credentials file is **NOT in Git**
- [ ] Backup of live credentials stored **securely** (password manager)
- [ ] Demo and live tokens kept **separate**
- [ ] File permissions set (read-only if possible)

---

## 🧪 PHASE 4: Testing & Validation

### **Pre-Flight Tests:**

- [ ] Configuration loads without errors:
  ```bash
  python -c "from config import config; print('✅ OK')"
  ```

- [ ] Account mode detected as REAL:
  ```bash
  python -c "from config import config; print(f'Mode: {config.get_account_type()}')"
  # Must show: Mode: real
  ```

- [ ] Live token validates correctly:
  ```bash
  python test_live_token.py
  # Must show: REAL / LIVE account
  ```

- [ ] Stake limits correct:
  ```bash
  python -c "from config import config; print(f'Stakes: ${config.min_stake}-${config.max_stake}')"
  # Should show: Stakes: $5.0-$10.0
  ```

---

## 📊 PHASE 5: Monitoring Setup

### **Grafana Dashboard:**

- [ ] Grafana running at http://localhost:3000
- [ ] Can login (admin/admin)
- [ ] LemoTick dashboard loads
- [ ] All 12 panels show data
- [ ] Account Type panel shows **REAL** (red)

### **Logging:**

- [ ] Log directory exists: `bot/logs/`
- [ ] Can write to log files
- [ ] Log viewer ready:
  ```powershell
  Get-Content bot\logs\runtime.log -Wait -Tail 50
  ```

### **Alerts (Optional but Recommended):**

- [ ] Email alerts configured (if available)
- [ ] Telegram/Discord alerts configured (if available)
- [ ] Phone notifications enabled (if available)

---

## 🎯 PHASE 6: Risk Management Review

### **Safety Limits Verified:**

- [ ] Max concurrent trades: **1** (strictly enforced)
- [ ] Trade cooldown: **3 seconds** minimum
- [ ] Max daily trades: **50** (prevents overtrading)
- [ ] Emergency stop drawdown: **15%**
- [ ] Max consecutive losses: **5** before auto-stop
- [ ] Win rate threshold: **45%** minimum

### **Conservative First Week Settings:**

- [ ] Min stake: $5 (not higher)
- [ ] Max stake: $10 (not $20 yet)
- [ ] Risk per trade: 2% (not 3%)
- [ ] Max drawdown: 10% (strict)

**Plan:** Increase limits gradually after first week if performance is good

---

## 📅 PHASE 7: Deployment Plan

### **Day 1 (First Live Trades):**

**Time:** ___________  
**Plan:**
- [ ] Start bot at time when you can monitor for 2-4 hours
- [ ] Watch first 10 trades closely
- [ ] Verify each trade in Deriv account
- [ ] Check P&L calculations match
- [ ] Stop after 2 hours or 10 trades (whichever comes first)

**Targets:**
- Win rate: 55%+ (6/10 wins)
- No errors in logs
- Grafana updating correctly

**Go/No-Go:**
- ✅ Continue if targets met
- ❌ Stop and review if targets missed

---

### **Day 2-3 (Validation):**

**Plan:**
- [ ] Run for full trading days
- [ ] Monitor at least every 2 hours
- [ ] Review end-of-day results

**Targets:**
- Win rate: 58%+
- Daily profit: $8+
- Max drawdown: <10%

---

### **Day 4-7 (Standard Operation):**

**Plan:**
- [ ] Continue with normal monitoring
- [ ] Review performance daily
- [ ] Weekly summary on Day 7

**Targets:**
- Win rate: 60%+
- Weekly profit: $50+
- Stable performance

---

## 🛑 PHASE 8: Emergency Procedures

### **Stop Trading If:**

- [ ] Win rate drops below 50%
- [ ] Drawdown exceeds 12%
- [ ] 5 consecutive losses
- [ ] Unexpected behavior
- [ ] Any ERROR in logs
- [ ] Trades don't match strategy

### **Emergency Stop Process:**

1. Press **Ctrl+C** to stop bot
2. Check Deriv account for open positions
3. Close any open positions manually if needed
4. Review logs: `bot/logs/runtime.log`
5. Identify what went wrong
6. Fix issue before restarting
7. Consider returning to demo for testing

### **Emergency Contacts:**

- Deriv Support: https://deriv.com/contact-us
- Your phone: ____________
- Backup monitoring person: ____________

---

## 📞 PHASE 9: Communication Plan

### **Who to Notify:**

- [ ] ____________ (primary contact)
- [ ] ____________ (secondary contact)
- [ ] ____________ (technical support)

### **When to Notify:**

- [ ] Before starting live trading
- [ ] After first day (results summary)
- [ ] If emergency stop triggered
- [ ] Weekly performance review

---

## ✅ FINAL GO/NO-GO DECISION

**Review this section immediately before starting:**

### **GO Criteria (ALL must be YES):**

- [ ] Demo performance meets all targets
- [ ] Live credentials obtained and tested
- [ ] Configuration reviewed and correct
- [ ] Monitoring systems operational
- [ ] Emergency procedures understood
- [ ] Can afford to lose entire deposit
- [ ] Have time to monitor closely
- [ ] Mentally prepared for losses

### **NO-GO Criteria (ANY is reason to delay):**

- [ ] Demo win rate <60%
- [ ] Haven't tested for full week
- [ ] Don't understand some settings
- [ ] Monitoring not working
- [ ] Can't afford potential losses
- [ ] Too busy to monitor
- [ ] Have doubts or concerns

---

## 🎯 Decision

**Date:** ____________  
**Time:** ____________

**Decision:** [ ] GO / [ ] NO-GO

**If GO:**
- Signature: ____________
- Start time: ____________
- Initial balance: $____________
- Target for Day 1: ____________

**If NO-GO:**
- Reason: ________________________________
- What needs to be fixed: ________________________________
- Retest date: ____________

---

## 📊 Week 1 Tracking

### **Daily Log:**

**Day 1:**
- Trades: _____
- Win Rate: _____%
- P&L: $_____
- Issues: ____________

**Day 2:**
- Trades: _____
- Win Rate: _____%
- P&L: $_____
- Issues: ____________

**Day 3:**
- Trades: _____
- Win Rate: _____%
- P&L: $_____
- Issues: ____________

**Day 4:**
- Trades: _____
- Win Rate: _____%
- P&L: $_____
- Issues: ____________

**Day 5:**
- Trades: _____
- Win Rate: _____%
- P&L: $_____
- Issues: ____________

**Day 6:**
- Trades: _____
- Win Rate: _____%
- P&L: $_____
- Issues: ____________

**Day 7:**
- Trades: _____
- Win Rate: _____%
- P&L: $_____
- Issues: ____________

### **Week 1 Summary:**

- Total Trades: _____
- Overall Win Rate: _____%
- Total P&L: $_____
- Best Day: $_____
- Worst Day: $_____
- Max Drawdown: _____%

**Week 1 Result:** [ ] SUCCESS / [ ] NEEDS ADJUSTMENT / [ ] RETURN TO DEMO

---

## 🎓 Remember

**Trading involves risk of loss.**

- Start small
- Monitor closely
- Scale gradually
- Only risk what you can afford to lose
- Don't panic on losses
- Trust the strategy
- Review performance regularly

**This checklist is your safety net. Use it.**

---

**Checklist Version:** 1.0  
**Last Updated:** October 25, 2025  
**Status:** Ready for use

