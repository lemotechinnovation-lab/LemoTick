using System.ComponentModel.DataAnnotations;

namespace InvestorManagementSystem.Core.Entities;

/// <summary>
/// Represents an investor in the system
/// </summary>
public class Investor
{
    public Guid Id { get; set; }

    [Required]
    [StringLength(100)]
    public string FirstName { get; set; } = string.Empty;

    [Required]
    [StringLength(100)]
    public string LastName { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [StringLength(255)]
    public string Email { get; set; } = string.Empty;

    [StringLength(20)]
    public string? PhoneNumber { get; set; }

    [Required]
    public DateTime DateOfBirth { get; set; }

    [Required]
    [StringLength(50)]
    public string Nationality { get; set; } = string.Empty;

    [Required]
    [StringLength(20)]
    public string IdNumber { get; set; } = string.Empty;

    [Required]
    public InvestorStatus Status { get; set; } = InvestorStatus.Pending;

    [Required]
    public UserRole Role { get; set; } = UserRole.Investor;

    // Two-Factor Authentication fields
    public bool TwoFactorEnabled { get; set; } = false;
    [StringLength(256)]
    public string? TwoFactorSecret { get; set; }
    public DateTime? TwoFactorEnabledAt { get; set; }

    // Referral fields
    [StringLength(20)]
    public string? ReferralCode { get; set; } // Unique referral code for this investor
    public Guid? ReferredBy { get; set; } // ID of the investor who referred them

    [Required]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    public DateTime? LastLoginAt { get; set; }

    // Authentication fields
    [Required]
    public string PasswordHash { get; set; } = string.Empty;

    [Required]
    public string PasswordSalt { get; set; } = string.Empty;

    // Navigation properties
    public virtual ICollection<Portfolio> Portfolios { get; set; } = new List<Portfolio>();
    public virtual ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
    public virtual ICollection<Notification> Notifications { get; set; } = new List<Notification>();
    public virtual ICollection<KYCDocument> KYCDocuments { get; set; } = new List<KYCDocument>();
    public virtual ICollection<Referral> ReferralsMade { get; set; } = new List<Referral>(); // Referrals this investor has made
    public virtual ICollection<ReferralCommission> Commissions { get; set; } = new List<ReferralCommission>(); // Commissions earned
}

/// <summary>
/// Investor status enumeration
/// </summary>
public enum InvestorStatus
{
    Pending = 0,
    Active = 1,
    Suspended = 2,
    Closed = 3,
    KYCRequired = 4,
    KYCPending = 5,
    KYCApproved = 6,
    KYCDenied = 7
}

/// <summary>
/// User role enumeration for role-based access control
/// </summary>
public enum UserRole
{
    Investor = 0,           // Regular investor
    Administrator = 1,      // System administrator
    ComplianceOfficer = 2,  // Compliance oversight and KYC verification
    Support = 3,            // Customer support
    Auditor = 4             // Read-only auditor access
}
