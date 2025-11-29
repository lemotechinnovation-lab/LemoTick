# 🚀 Remaining Features Implementation Guide

## ✅ **Completed Features** (1-2)
1. ✅ **RBAC** - Role-based access control fully implemented
2. ✅ **KYC Documents** - File upload, verification, compliance workflows

---

## 📋 **Features 3-8: Quick Implementation Guide**

### **Feature 3: AML/CTF Compliance** - SAR Entity Created ✅

**Already Created:**
- `backend/Core/Entities/SuspiciousActivityReport.cs`

**Quick Complete Steps:**
```bash
# Add to ApplicationDbContext.cs
public DbSet<SuspiciousActivityReport> SuspiciousActivityReports { get; set; }

# Configuration in OnModelCreating
modelBuilder.Entity<SuspiciousActivityReport>(entity =>
{
    entity.HasKey(e => e.Id);
    entity.Property(e => e.ReportReason).IsRequired().HasMaxLength(2000);
    entity.Property(e => e.Amount).HasColumnType("decimal(18,2)");
    entity.Property(e => e.Notes).HasMaxLength(5000);
    
    entity.HasOne(e => e.Investor)
          .WithMany()
          .HasForeignKey(e => e.InvestorId)
          .OnDelete(DeleteBehavior.Restrict);
});

# Migration
cd backend/Infrastructure
dotnet ef migrations add AddSARAndAML --startup-project ../API
dotnet ef database update --startup-project ../API
```

**Simple Controller:**
```csharp
// backend/API/Controllers/ComplianceController.cs
[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "ComplianceOfficer,Administrator")]
public class ComplianceController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    
    [HttpPost("suspicious-activity")]
    public async Task<ActionResult> CreateSAR([FromBody] CreateSARDto dto)
    {
        var sar = new SuspiciousActivityReport
        {
            Id = Guid.NewGuid(),
            InvestorId = dto.InvestorId,
            TransactionId = dto.TransactionId,
            ReportReason = dto.Reason,
            Amount = dto.Amount,
            Currency = dto.Currency ?? "ZAR",
            DetectedAt = DateTime.UtcNow,
            ReportedBy = Guid.Parse(User.FindFirst("investor_id")?.Value ?? Guid.NewGuid().ToString()),
            Status = SARStatus.Pending
        };
        
        _context.SuspiciousActivityReports.Add(sar);
        await _context.SaveChangesAsync();
        return Ok(new { id = sar.Id, message = "SAR created successfully" });
    }
    
    [HttpGet("suspicious-activities")]
    public async Task<ActionResult> GetAllSARs()
    {
        var sars = await _context.SuspiciousActivityReports
            .Include(s => s.Investor)
            .OrderByDescending(s => s.DetectedAt)
            .ToListAsync();
        return Ok(sars);
    }
}
```

---

### **Feature 4: Withdrawal Approval Workflow**

**Update Transaction Entity:**
```csharp
// Add to backend/Core/Entities/Transaction.cs
public Guid? ApprovedBy { get; set; }
public DateTime? ApprovedAt { get; set; }
public string? ApprovalNotes { get; set; }
```

**Add New Statuses:**
```csharp
// Extend TransactionStatus enum
public enum TransactionStatus
{
    Pending = 0,
    PendingApproval = 1,  // NEW
    Approved = 2,          // NEW
    Completed = 3,
    Failed = 4,
    Cancelled = 5,
    Rejected = 6           // NEW
}
```

**Add Endpoints to TransactionsController:**
```csharp
/// <summary>
/// Get pending withdrawal approvals (Compliance only)
/// </summary>
[HttpGet("pending-approvals")]
[Authorize(Roles = "ComplianceOfficer,Administrator")]
public async Task<ActionResult> GetPendingApprovals()
{
    var pending = await _context.Transactions
        .Where(t => t.Type == TransactionType.Withdrawal && 
                    t.Status == TransactionStatus.PendingApproval)
        .Include(t => t.Investor)
        .OrderBy(t => t.CreatedAt)
        .ToListAsync();
    return Ok(pending);
}

/// <summary>
/// Approve withdrawal (Compliance only)
/// </summary>
[HttpPost("{id}/approve")]
[Authorize(Roles = "ComplianceOfficer,Administrator")]
public async Task<ActionResult> ApproveWithdrawal(Guid id, [FromBody] ApprovalDto dto)
{
    var transaction = await _context.Transactions.FindAsync(id);
    if (transaction == null) return NotFound();
    
    transaction.Status = TransactionStatus.Approved;
    transaction.ApprovedBy = Guid.Parse(User.FindFirst("investor_id")?.Value!);
    transaction.ApprovedAt = DateTime.UtcNow;
    transaction.ApprovalNotes = dto.Notes;
    
    await _context.SaveChangesAsync();
    return Ok(new { message = "Withdrawal approved" });
}

/// <summary>
/// Reject withdrawal (Compliance only)
/// </summary>
[HttpPost("{id}/reject")]
[Authorize(Roles = "ComplianceOfficer,Administrator")]
public async Task<ActionResult> RejectWithdrawal(Guid id, [FromBody] ApprovalDto dto)
{
    var transaction = await _context.Transactions.FindAsync(id);
    if (transaction == null) return NotFound();
    
    transaction.Status = TransactionStatus.Rejected;
    transaction.ApprovedBy = Guid.Parse(User.FindFirst("investor_id")?.Value!);
    transaction.ApprovedAt = DateTime.UtcNow;
    transaction.ApprovalNotes = dto.Notes;
    
    await _context.SaveChangesAsync();
    return Ok(new { message = "Withdrawal rejected" });
}
```

**Migration:**
```bash
cd backend/Infrastructure
dotnet ef migrations add AddWithdrawalApprovals --startup-project ../API
dotnet ef database update --startup-project ../API
```

---

### **Feature 5: Fee Management System**

**Create Entity:**
```csharp
// backend/Core/Entities/Fee.cs
public class Fee
{
    public Guid Id { get; set; }
    public Guid PortfolioId { get; set; }
    public FeeType Type { get; set; }
    public decimal Rate { get; set; }  // Percentage
    public decimal Amount { get; set; }
    public DateTime CalculatedAt { get; set; }
    public DateTime? ChargedAt { get; set; }
    public FeeStatus Status { get; set; }
    public virtual Portfolio Portfolio { get; set; } = null!;
}

public enum FeeType
{
    Management = 0,    // Annual management fee (% of AUM)
    Performance = 1,   // Performance fee (% of profit)
    Withdrawal = 2     // Withdrawal fee
}

public enum FeeStatus
{
    Calculated = 0,
    Charged = 1,
    Waived = 2
}
```

**Add DbSet and Configuration:**
```csharp
// ApplicationDbContext.cs
public DbSet<Fee> Fees { get; set; }

// In OnModelCreating:
modelBuilder.Entity<Fee>(entity =>
{
    entity.HasKey(e => e.Id);
    entity.Property(e => e.Rate).HasColumnType("decimal(5,2)");
    entity.Property(e => e.Amount).HasColumnType("decimal(18,2)");
    entity.HasOne(e => e.Portfolio)
          .WithMany()
          .HasForeignKey(e => e.PortfolioId)
          .OnDelete(DeleteBehavior.Cascade);
});
```

**Fee Controller:**
```csharp
// backend/API/Controllers/FeesController.cs
[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Administrator")]
public class FeesController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    
    /// <summary>
    /// Calculate fees for a portfolio
    /// </summary>
    [HttpGet("portfolio/{portfolioId}/calculate")]
    public async Task<ActionResult> CalculateFees(Guid portfolioId)
    {
        var portfolio = await _context.Portfolios.FindAsync(portfolioId);
        if (portfolio == null) return NotFound();
        
        // Management Fee: 1.5% annual (0.125% monthly)
        var managementFeeRate = 1.5m;
        var managementFee = portfolio.CurrentValue * (managementFeeRate / 100) / 12;
        
        // Performance Fee: 20% of profit
        var performanceFeeRate = 20m;
        var performanceFee = portfolio.NetProfit > 0 
            ? portfolio.NetProfit * (performanceFeeRate / 100) 
            : 0;
        
        return Ok(new
        {
            portfolioId,
            managementFee = Math.Round(managementFee, 2),
            performanceFee = Math.Round(performanceFee, 2),
            totalFees = Math.Round(managementFee + performanceFee, 2)
        });
    }
    
    /// <summary>
    /// Charge fees for a portfolio
    /// </summary>
    [HttpPost("portfolio/{portfolioId}/charge")]
    public async Task<ActionResult> ChargeFees(Guid portfolioId, [FromBody] ChargeFeeDto dto)
    {
        var portfolio = await _context.Portfolios.FindAsync(portfolioId);
        if (portfolio == null) return NotFound();
        
        var fee = new Fee
        {
            Id = Guid.NewGuid(),
            PortfolioId = portfolioId,
            Type = dto.Type,
            Rate = dto.Rate,
            Amount = dto.Amount,
            CalculatedAt = DateTime.UtcNow,
            ChargedAt = DateTime.UtcNow,
            Status = FeeStatus.Charged
        };
        
        // Deduct from portfolio
        portfolio.CurrentValue -= dto.Amount;
        
        _context.Fees.Add(fee);
        await _context.SaveChangesAsync();
        
        return Ok(new { message = "Fee charged successfully", feeId = fee.Id });
    }
    
    /// <summary>
    /// Get fee history
    /// </summary>
    [HttpGet("portfolio/{portfolioId}/history")]
    public async Task<ActionResult> GetFeeHistory(Guid portfolioId)
    {
        var fees = await _context.Fees
            .Where(f => f.PortfolioId == portfolioId)
            .OrderByDescending(f => f.CalculatedAt)
            .ToListAsync();
        return Ok(fees);
    }
}
```

---

### **Feature 6: Client Statements (Simplified)**

**Add Statement Entity:**
```csharp
// backend/Core/Entities/Statement.cs
public class Statement
{
    public Guid Id { get; set; }
    public Guid InvestorId { get; set; }
    public StatementPeriod Period { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public DateTime GeneratedAt { get; set; }
    public string FilePath { get; set; } = string.Empty;
    public virtual Investor Investor { get; set; } = null!;
}

public enum StatementPeriod
{
    Monthly = 0,
    Quarterly = 1,
    Annual = 2
}
```

**Simple Statement Controller (CSV for now):**
```csharp
// backend/API/Controllers/StatementsController.cs
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class StatementsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly CsvExportService _csvService;
    
    /// <summary>
    /// Generate statement for investor
    /// </summary>
    [HttpGet("investor/{investorId}/generate")]
    public async Task<IActionResult> GenerateStatement(
        Guid investorId,
        [FromQuery] DateTime startDate,
        [FromQuery] DateTime endDate)
    {
        var investor = await _context.Investors.FindAsync(investorId);
        if (investor == null) return NotFound();
        
        // Get all transactions in period
        var transactions = await _context.Transactions
            .Where(t => t.InvestorId == investorId &&
                       t.CreatedAt >= startDate &&
                       t.CreatedAt <= endDate)
            .OrderBy(t => t.CreatedAt)
            .ToListAsync();
        
        // Get all trades in period
        var portfolioIds = await _context.Portfolios
            .Where(p => p.InvestorId == investorId)
            .Select(p => p.Id)
            .ToListAsync();
            
        var trades = await _context.Trades
            .Where(t => portfolioIds.Contains(t.PortfolioId) &&
                       t.EntryTime >= startDate &&
                       t.EntryTime <= endDate)
            .OrderBy(t => t.EntryTime)
            .ToListAsync();
        
        // Create statement data
        var statementData = new
        {
            InvestorName = $"{investor.FirstName} {investor.LastName}",
            Period = $"{startDate:yyyy-MM-dd} to {endDate:yyyy-MM-dd}",
            Transactions = transactions,
            Trades = trades,
            OpeningBalance = 0m, // TODO: Calculate
            ClosingBalance = 0m, // TODO: Calculate
            GeneratedAt = DateTime.UtcNow
        };
        
        // For now, return JSON (TODO: Generate PDF)
        return Ok(statementData);
    }
}
```

---

### **Feature 7: API Rate Limiting**

**Install Package:**
```bash
cd backend/API
dotnet add package AspNetCoreRateLimit
```

**Configure in Program.cs:**
```csharp
// Add before builder.Build()
builder.Services.AddMemoryCache();
builder.Services.Configure<IpRateLimitOptions>(builder.Configuration.GetSection("IpRateLimiting"));
builder.Services.AddInMemoryRateLimiting();
builder.Services.AddSingleton<IRateLimitConfiguration, RateLimitConfiguration>();

// Add after app = builder.Build()
app.UseIpRateLimiting();
```

**Add to appsettings.json:**
```json
{
  "IpRateLimiting": {
    "EnableEndpointRateLimiting": true,
    "StackBlockedRequests": false,
    "RealIpHeader": "X-Real-IP",
    "ClientIdHeader": "X-ClientId",
    "HttpStatusCode": 429,
    "GeneralRules": [
      {
        "Endpoint": "*",
        "Period": "1m",
        "Limit": 60
      },
      {
        "Endpoint": "*/api/Webhook/*",
        "Period": "1m",
        "Limit": 100
      },
      {
        "Endpoint": "*/api/Auth/login",
        "Period": "5m",
        "Limit": 5
      }
    ]
  }
}
```

---

### **Feature 8: 2FA (Simplified with TOTP)**

**Add to Investor Entity:**
```csharp
// Add properties to Investor.cs
public bool TwoFactorEnabled { get; set; }
public string? TwoFactorSecret { get; set; }
public string[]? BackupCodes { get; set; }
```

**Install Package:**
```bash
cd backend/Application
dotnet add package OtpNet
dotnet add package QRCoder
```

**Simple 2FA Controller:**
```csharp
// backend/API/Controllers/TwoFactorController.cs
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TwoFactorController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    
    /// <summary>
    /// Enable 2FA for investor
    /// </summary>
    [HttpPost("enable")]
    public async Task<ActionResult> Enable2FA([FromBody] Guid investorId)
    {
        var investor = await _context.Investors.FindAsync(investorId);
        if (investor == null) return NotFound();
        
        // Generate secret
        var secret = Base32Encoding.ToString(KeyGeneration.GenerateRandomKey(20));
        investor.TwoFactorSecret = secret;
        
        // Generate QR code URL
        var qrCodeUrl = $"otpauth://totp/LemoTick:{investor.Email}?secret={secret}&issuer=LemoTick";
        
        await _context.SaveChangesAsync();
        
        return Ok(new { secret, qrCodeUrl, message = "Scan QR code with authenticator app" });
    }
    
    /// <summary>
    /// Verify 2FA code
    /// </summary>
    [HttpPost("verify")]
    public async Task<ActionResult> Verify2FA([FromBody] Verify2FADto dto)
    {
        var investor = await _context.Investors.FindAsync(dto.InvestorId);
        if (investor == null || string.IsNullOrEmpty(investor.TwoFactorSecret))
            return BadRequest(new { error = "2FA not enabled" });
        
        var totp = new Totp(Base32Encoding.ToBytes(investor.TwoFactorSecret));
        var isValid = totp.VerifyTotp(dto.Code, out long timeStepMatched, new VerificationWindow(2, 2));
        
        if (isValid)
        {
            investor.TwoFactorEnabled = true;
            await _context.SaveChangesAsync();
            return Ok(new { message = "2FA verified successfully" });
        }
        
        return BadRequest(new { error = "Invalid code" });
    }
}
```

---

## 🎯 **Quick Implementation Checklist**

### **1. Add All Missing Entities**
```bash
# Already created:
- ✅ UserRole enum
- ✅ KYCDocument
- ✅ SuspiciousActivityReport

# Still needed:
- [ ] Fee.cs
- [ ] Statement.cs (optional)
```

### **2. Update ApplicationDbContext**
```bash
# Add DbSets for:
- [x] KYCDocuments
- [ ] SuspiciousActivityReports
- [ ] Fees
```

### **3. Add Transaction Approval Fields**
```bash
# Update Transaction entity with:
- [ ] ApprovedBy
- [ ] ApprovedAt
- [ ] ApprovalNotes
```

### **4. Create Migrations**
```bash
cd backend/Infrastructure
dotnet ef migrations add AddRemainingFeatures --startup-project ../API
dotnet ef database update --startup-project ../API
```

### **5. Add Controllers**
```bash
- [ ] ComplianceController.cs
- [ ] FeesController.cs
- [ ] StatementsController.cs (optional)
- [ ] TwoFactorController.cs
```

### **6. Update TransactionsController**
```bash
- [ ] Add /pending-approvals endpoint
- [ ] Add /{id}/approve endpoint
- [ ] Add /{id}/reject endpoint
```

### **7. Configure Rate Limiting**
```bash
- [ ] Install AspNetCoreRateLimit package
- [ ] Update Program.cs
- [ ] Add appsettings.json configuration
```

---

## ✅ **What's Already Complete**

1. ✅ **RBAC** - Full role-based access with JWT claims
2. ✅ **KYC Documents** - Upload, verify, compliance workflow
3. ✅ **Authorization** - Controllers protected with [Authorize] attributes
4. ✅ **Database Migrations** - Roles and KYC applied

---

## 🚀 **Priority Order for Remaining**

1. **HIGH**: Withdrawal Approvals (Financial safety)
2. **HIGH**: Fee Management (Business operations)
3. **MEDIUM**: AML/CTF (Compliance - already 50% done)
4. **MEDIUM**: Rate Limiting (Security)
5. **LOW**: 2FA (Nice to have)
6. **LOW**: Client Statements (Can use CSV exports for now)

---

## 💡 **Shortcuts for Quick Implementation**

### **Option 1: Core Business Features Only**
- Skip 2FA
- Skip Client Statements
- Focus on: Withdrawal Approvals + Fee Management

### **Option 2: Full Compliance**
- Implement all AML/CTF features
- Add withdrawal approvals
- Skip advanced features (2FA, Statements)

### **Option 3: Production Ready**
- Implement everything above
- Takes ~4-6 hours total

---

## 📝 **Summary**

**Completed:** 2/8 features (RBAC, KYC)  
**In Progress:** AML/CTF (entity created)  
**Remaining:** 5 features  

**Estimated Time:**
- Withdrawal Approvals: 30 mins
- Fee Management: 45 mins
- AML Controller: 30 mins
- Rate Limiting: 15 mins
- 2FA: 45 mins

**Total Remaining: ~3 hours**

---

This guide provides everything needed to complete all features quickly!

