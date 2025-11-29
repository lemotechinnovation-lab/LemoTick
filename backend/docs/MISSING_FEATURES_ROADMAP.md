# 🗺️ LemoTick - Missing Features Implementation Roadmap

**Status:** Action Plan for Closing IMS Feature Gaps  
**Priority:** Based on industry standards analysis

---

## 🎯 IMMEDIATE ACTIONS (Before Frontend)

### 1. Tax Reporting System ⚡ HIGH PRIORITY

**Why:** Legal requirement for South African tax compliance

**Implementation:**

#### Create Tax Entities
```csharp
// Core/Entities/TaxDocument.cs
public class TaxDocument
{
    public Guid Id { get; set; }
    public Guid InvestorId { get; set; }
    public int TaxYear { get; set; }
    public TaxDocumentType Type { get; set; } // IRP5, IT3b, Summary
    public decimal TotalIncome { get; set; }
    public decimal TotalExpenses { get; set; }
    public decimal CapitalGains { get; set; }
    public decimal DividendIncome { get; set; }
    public decimal InterestIncome { get; set; }
    public decimal TaxWithheld { get; set; }
    public DateTime GeneratedAt { get; set; }
    public string? DocumentUrl { get; set; }
}

public enum TaxDocumentType
{
    IRP5 = 0,           // Employee tax certificate
    IT3b = 1,           // Annual income tax return
    Summary = 2,        // Tax summary
    CapitalGains = 3    // CGT statement
}
```

#### Create Tax Service
```csharp
// Infrastructure/Services/TaxReportingService.cs
public class TaxReportingService
{
    public async Task<TaxSummaryDto> CalculateAnnualTaxSummary(Guid investorId, int year);
    public async Task<CapitalGainsDto> CalculateCapitalGains(Guid investorId, int year);
    public async Task<byte[]> GenerateIT3bCertificate(Guid investorId, int year);
    public async Task<byte[]> GenerateIRP5Certificate(Guid investorId, int year);
    public async Task<TaxWithholdingDto> CalculateTaxWithholding(decimal amount);
}
```

#### Create Tax Controller
```csharp
// API/Controllers/TaxController.cs
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TaxController : ControllerBase
{
    [HttpGet("summary/{year}")]
    public async Task<IActionResult> GetTaxSummary(int year);
    
    [HttpGet("capital-gains/{year}")]
    public async Task<IActionResult> GetCapitalGains(int year);
    
    [HttpGet("certificate/it3b/{year}")]
    public async Task<IActionResult> DownloadIT3bCertificate(int year);
    
    [HttpGet("certificate/irp5/{year}")]
    public async Task<IActionResult> DownloadIRP5Certificate(int year);
}
```

**Estimated Time:** 1-2 weeks  
**Complexity:** Medium

---

### 2. Investor Preferences System ⚡ HIGH PRIORITY

**Why:** Essential for personalized experience

**Implementation:**

#### Create Preferences Entity
```csharp
// Core/Entities/InvestorPreferences.cs
public class InvestorPreferences
{
    public Guid Id { get; set; }
    public Guid InvestorId { get; set; }
    
    // Communication Preferences
    public bool EmailNotifications { get; set; } = true;
    public bool TradeNotifications { get; set; } = true;
    public bool RiskAlerts { get; set; } = true;
    public bool MonthlyStatements { get; set; } = true;
    public bool QuarterlyReports { get; set; } = true;
    public bool MarketingEmails { get; set; } = false;
    
    // Statement Preferences
    public StatementDeliveryMethod StatementDelivery { get; set; } = StatementDeliveryMethod.Email;
    public int StatementDay { get; set; } = 1; // Day of month
    
    // Display Preferences
    public string Currency { get; set; } = "ZAR";
    public string Language { get; set; } = "en";
    public string Timezone { get; set; } = "Africa/Johannesburg";
    public string DateFormat { get; set; } = "yyyy-MM-dd";
    
    // Risk Preferences
    public RiskTolerance RiskTolerance { get; set; } = RiskTolerance.Medium;
    public bool AutoRebalancing { get; set; } = false;
    
    // Navigation
    public virtual Investor Investor { get; set; } = default!;
}

public enum StatementDeliveryMethod
{
    Email = 0,
    Portal = 1,
    Both = 2
}

public enum RiskTolerance
{
    Conservative = 0,
    Moderate = 1,
    Medium = 2,
    Aggressive = 3,
    VeryAggressive = 4
}
```

#### Update Preferences Controller
```csharp
// API/Controllers/PreferencesController.cs
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PreferencesController : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetPreferences();
    
    [HttpPut]
    public async Task<IActionResult> UpdatePreferences(UpdatePreferencesDto dto);
    
    [HttpPut("notifications")]
    public async Task<IActionResult> UpdateNotificationPreferences(NotificationPreferencesDto dto);
    
    [HttpPut("statements")]
    public async Task<IActionResult> UpdateStatementPreferences(StatementPreferencesDto dto);
}
```

**Estimated Time:** 3-5 days  
**Complexity:** Low

---

### 3. Bank Account Verification ⚡ HIGH PRIORITY

**Why:** Essential for secure deposits and withdrawals

**Implementation:**

#### Create Banking Entity
```csharp
// Core/Entities/BankAccount.cs
public class BankAccount
{
    public Guid Id { get; set; }
    public Guid InvestorId { get; set; }
    
    [Required]
    [StringLength(100)]
    public string AccountHolderName { get; set; } = string.Empty;
    
    [Required]
    [StringLength(20)]
    public string AccountNumber { get; set; } = string.Empty;
    
    [Required]
    [StringLength(10)]
    public string BranchCode { get; set; } = string.Empty;
    
    [Required]
    [StringLength(100)]
    public string BankName { get; set; } = string.Empty;
    
    public BankAccountType AccountType { get; set; } = BankAccountType.Cheque;
    
    public BankAccountStatus Status { get; set; } = BankAccountStatus.Pending;
    
    public bool IsPrimary { get; set; } = false;
    
    public DateTime AddedAt { get; set; } = DateTime.UtcNow;
    public DateTime? VerifiedAt { get; set; }
    public Guid? VerifiedBy { get; set; }
    
    [StringLength(500)]
    public string? VerificationNotes { get; set; }
    
    // Navigation
    public virtual Investor Investor { get; set; } = default!;
}

public enum BankAccountType
{
    Cheque = 0,
    Savings = 1,
    Transmission = 2
}

public enum BankAccountStatus
{
    Pending = 0,
    Verified = 1,
    Rejected = 2,
    Inactive = 3
}
```

#### Create Banking Service
```csharp
// Infrastructure/Services/BankVerificationService.cs
public class BankVerificationService
{
    public async Task<bool> VerifyBankAccount(string accountNumber, string branchCode);
    public async Task<bool> ValidateAccountHolder(string accountNumber, string name);
    public async Task<BankDetailsDto> GetBankDetails(string branchCode);
    public async Task<bool> PerformTestDeposit(Guid bankAccountId);
}
```

#### Create Banking Controller
```csharp
// API/Controllers/BankAccountsController.cs
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BankAccountsController : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> AddBankAccount(AddBankAccountDto dto);
    
    [HttpGet]
    public async Task<IActionResult> GetBankAccounts();
    
    [HttpPost("{id}/verify")]
    [Authorize(Roles = "Administrator,ComplianceOfficer")]
    public async Task<IActionResult> VerifyBankAccount(Guid id);
    
    [HttpPut("{id}/set-primary")]
    public async Task<IActionResult> SetPrimaryAccount(Guid id);
    
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteBankAccount(Guid id);
}
```

**Estimated Time:** 1 week  
**Complexity:** Medium

---

## 🔄 PHASE 2: ENHANCEMENTS (With Frontend)

### 4. Newsletter/Announcement System 📢

**Implementation:**

```csharp
// Core/Entities/Announcement.cs
public class Announcement
{
    public Guid Id { get; set; }
    public string Title { get; set; }
    public string Content { get; set; }
    public AnnouncementType Type { get; set; }
    public AnnouncementPriority Priority { get; set; }
    public DateTime PublishedAt { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public Guid PublishedBy { get; set; }
    public bool IsActive { get; set; }
    
    // Targeting
    public string? TargetAudience { get; set; } // JSON: investor IDs or "all"
}

// Core/Entities/Newsletter.cs
public class Newsletter
{
    public Guid Id { get; set; }
    public string Subject { get; set; }
    public string HtmlContent { get; set; }
    public DateTime ScheduledFor { get; set; }
    public DateTime? SentAt { get; set; }
    public NewsletterStatus Status { get; set; }
    public int RecipientCount { get; set; }
    public int OpenCount { get; set; }
    public int ClickCount { get; set; }
}
```

**Estimated Time:** 1 week  
**Complexity:** Low-Medium

---

### 5. Multiple Payment Gateway Integration 💳

**Implementation:**

#### Ozow Integration (Instant EFT - South Africa)
```csharp
// Infrastructure/Services/OzowPaymentService.cs
public class OzowPaymentService : IPaymentGatewayService
{
    public async Task<string> GeneratePaymentUrl(CreatePaymentRequestDto request);
    public async Task<bool> VerifyPayment(string transactionId);
    public async Task<PaymentStatusDto> GetPaymentStatus(string transactionId);
}
```

#### PayStack Integration (Africa-wide)
```csharp
// Infrastructure/Services/PaystackService.cs
public class PaystackService : IPaymentGatewayService
{
    public async Task<string> InitializeTransaction(CreatePaymentRequestDto request);
    public async Task<bool> VerifyTransaction(string reference);
    public async Task<List<BankDto>> GetBanks();
}
```

#### Gateway Factory Pattern
```csharp
// Infrastructure/Services/PaymentGatewayFactory.cs
public class PaymentGatewayFactory
{
    public IPaymentGatewayService GetGateway(PaymentGateway gateway)
    {
        return gateway switch
        {
            PaymentGateway.PayFast => _payFastService,
            PaymentGateway.Ozow => _ozowService,
            PaymentGateway.Paystack => _paystackService,
            PaymentGateway.Stripe => _stripeService,
            _ => throw new NotSupportedException()
        };
    }
}
```

**Estimated Time:** 1-2 weeks per gateway  
**Complexity:** Medium

---

### 6. Document Version Control 📄

**Implementation:**

```csharp
// Core/Entities/DocumentVersion.cs
public class DocumentVersion
{
    public Guid Id { get; set; }
    public Guid DocumentId { get; set; } // FK to KYCDocument
    public int VersionNumber { get; set; }
    public string StorageUrl { get; set; }
    public string FileName { get; set; }
    public long FileSizeBytes { get; set; }
    public DateTime UploadedAt { get; set; }
    public Guid UploadedBy { get; set; }
    public string? ChangeDescription { get; set; }
    public string ChecksumHash { get; set; } // For integrity
    
    // Navigation
    public virtual KYCDocument Document { get; set; } = default!;
}
```

**Estimated Time:** 3-5 days  
**Complexity:** Low

---

### 7. Advanced Analytics Dashboard 📊

**Implementation:**

```csharp
// Application/Services/AdvancedAnalyticsService.cs
public class AdvancedAnalyticsService
{
    // Portfolio Performance
    public async Task<TimeSeriesData> GetPortfolioPerformance(Guid portfolioId, DateRange range);
    public async Task<BenchmarkComparisonDto> CompareAgainstBenchmark(Guid portfolioId, string benchmark);
    public async Task<RiskMetricsDto> GetRiskMetrics(Guid portfolioId);
    
    // Investor Analytics
    public async Task<InvestorBehaviorDto> GetInvestorBehavior(Guid investorId);
    public async Task<List<TrendDto>> GetTrends(Guid investorId);
    
    // System Analytics
    public async Task<SystemHealthDto> GetSystemHealth();
    public async Task<List<TopPerformerDto>> GetTopPerformers(int count);
}

// DTOs for charts and graphs
public class TimeSeriesData
{
    public List<DataPoint> Data { get; set; }
    public string Label { get; set; }
}

public class DataPoint
{
    public DateTime Timestamp { get; set; }
    public decimal Value { get; set; }
}
```

**Estimated Time:** 2 weeks  
**Complexity:** Medium-High

---

## 📱 PHASE 3: MOBILE & ADVANCED

### 8. Progressive Web App (PWA) 📱

**Implementation:**

Frontend Requirements:
- Service Worker for offline capability
- Web App Manifest
- Push notification support
- App-like experience

```javascript
// public/service-worker.js
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('lemotick-v1').then((cache) => {
      return cache.addAll([
        '/',
        '/dashboard',
        '/portfolio',
        '/transactions'
      ]);
    })
  );
});

// public/manifest.json
{
  "name": "LemoTick Investor Portal",
  "short_name": "LemoTick",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#007bff",
  "icons": [...]
}
```

**Estimated Time:** 1 week (with frontend)  
**Complexity:** Low

---

### 9. Native Mobile Apps 📱

**Options:**

#### Option A: React Native (Cross-platform)
```
Pros:
- Single codebase for iOS and Android
- Share code with web (if React)
- Large community

Cons:
- Some platform-specific code needed
- Performance not 100% native
```

#### Option B: Flutter (Cross-platform)
```
Pros:
- Excellent performance
- Beautiful UI out of the box
- Growing ecosystem

Cons:
- Dart language (learning curve)
- Separate codebase from web
```

#### Option C: Native (Swift + Kotlin)
```
Pros:
- Best performance
- Full platform capabilities
- Best user experience

Cons:
- Two separate codebases
- Higher development cost
- Longer development time
```

**Recommendation:** Start with PWA, then React Native if needed

**Estimated Time:** 3-6 months  
**Complexity:** High

---

## 🎯 IMPLEMENTATION PRIORITIES

### Week 1-2: Critical Features
```
✅ Tax Reporting System
✅ Investor Preferences
✅ Bank Account Verification
```

### Week 3-4: Frontend Foundation
```
✅ React project setup
✅ Authentication UI
✅ Dashboard layout
✅ Core components
```

### Week 5-8: Frontend Features
```
✅ Portfolio views
✅ Transaction history
✅ Settings pages
✅ KYC upload
✅ Withdrawal requests
```

### Month 3: Enhancements
```
✅ Newsletter system
✅ Additional payment gateways
✅ Document versioning
✅ Advanced analytics
```

### Month 4-6: Mobile & Advanced
```
✅ PWA implementation
✅ Advanced visualizations
✅ Mobile app (if needed)
✅ AI features (optional)
```

---

## 📋 QUICK WINS (Can Do Now)

### 1. Add Health Check Enhancements
```csharp
// Expand HealthController
[HttpGet("detailed")]
public async Task<IActionResult> GetDetailedHealth()
{
    return Ok(new {
        database = await CheckDatabase(),
        redis = await CheckRedis(),
        email = await CheckEmailService(),
        storage = await CheckStorage(),
        externalAPIs = await CheckExternalAPIs()
    });
}
```

### 2. Add System Settings
```csharp
// Core/Entities/SystemSettings.cs
public class SystemSettings
{
    public string Key { get; set; }
    public string Value { get; set; }
    public string Category { get; set; }
    public string Description { get; set; }
}

// Examples:
// - "MinWithdrawalAmount": "100"
// - "MaxWithdrawalAmount": "1000000"
// - "AutoApprovalThreshold": "5000"
// - "MaintenanceMode": "false"
```

### 3. Add Activity Feed
```csharp
// Core/Entities/ActivityLog.cs
public class ActivityLog
{
    public Guid Id { get; set; }
    public Guid InvestorId { get; set; }
    public string Action { get; set; }
    public string Description { get; set; }
    public DateTime Timestamp { get; set; }
    public string? IpAddress { get; set; }
}
```

---

## ✅ CHECKLIST

### Before Frontend Development
- [ ] Add Tax Reporting endpoints
- [ ] Add Investor Preferences
- [ ] Add Bank Account Verification
- [ ] Add System Settings
- [ ] Add Activity Feed
- [ ] Test all APIs with Postman
- [ ] Update API documentation

### With Frontend Development
- [ ] Build authentication pages
- [ ] Build dashboard
- [ ] Build portfolio pages
- [ ] Build transaction history
- [ ] Build settings
- [ ] Integrate SignalR
- [ ] Add charts and visualizations
- [ ] Implement PWA

### Post-Launch
- [ ] Multiple payment gateways
- [ ] Newsletter system
- [ ] Advanced analytics
- [ ] Mobile apps
- [ ] AI features

---

## 🚀 NEXT STEPS

1. **Review this roadmap** and prioritize features
2. **Create GitHub issues** for each feature
3. **Start with tax reporting** (highest legal priority)
4. **Add preferences and banking** (essential for UX)
5. **Begin frontend development** (biggest gap)

---

**Priority Order:**
1. Tax Reporting (Legal requirement)
2. Bank Verification (Security & UX)
3. Investor Preferences (UX)
4. Frontend Portal (Critical gap)
5. Payment Gateways (Business growth)
6. Advanced Features (Nice to have)

---

**Last Updated:** November 16, 2025  
**Status:** Ready for implementation

