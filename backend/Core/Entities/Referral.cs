using System.ComponentModel.DataAnnotations;

namespace InvestorManagementSystem.Core.Entities;

/// <summary>
/// Represents a referral made by an investor
/// </summary>
public class Referral
{
    public Guid Id { get; set; }

    [Required]
    public Guid ReferrerInvestorId { get; set; } // The investor who made the referral

    [Required]
    public Guid ReferredInvestorId { get; set; } // The investor who was referred

    [Required]
    [StringLength(50)]
    public string ReferralCode { get; set; } = string.Empty;

    [Required]
    public DateTime ReferredAt { get; set; } = DateTime.UtcNow;

    public DateTime? ConvertedAt { get; set; } // When the referred investor made their first deposit

    [Required]
    public ReferralStatus Status { get; set; } = ReferralStatus.Pending;

    public decimal CommissionEarned { get; set; } = 0m;
    public decimal CommissionRate { get; set; } = 0.10m; // 10% default commission

    [StringLength(500)]
    public string? Notes { get; set; }

    // Navigation properties
    public virtual Investor ReferrerInvestor { get; set; } = default!;
    public virtual Investor ReferredInvestor { get; set; } = default!;
}

/// <summary>
/// Status of a referral
/// </summary>
public enum ReferralStatus
{
    Pending = 0,        // Referred but not yet signed up
    Registered = 1,     // Signed up but not deposited
    Active = 2,         // Deposited and active
    Inactive = 3,       // No longer active
    Cancelled = 4       // Referral cancelled or invalid
}

/// <summary>
/// Referral commission payout record
/// </summary>
public class ReferralCommission
{
    public Guid Id { get; set; }

    [Required]
    public Guid ReferralId { get; set; }

    [Required]
    public Guid ReferrerInvestorId { get; set; }

    [Required]
    public decimal Amount { get; set; }

    [Required]
    [StringLength(50)]
    public string Currency { get; set; } = "ZAR";

    [Required]
    public DateTime EarnedAt { get; set; } = DateTime.UtcNow;

    public DateTime? PaidAt { get; set; }

    [Required]
    public CommissionStatus Status { get; set; } = CommissionStatus.Pending;

    [StringLength(500)]
    public string? Description { get; set; }

    [StringLength(100)]
    public string? TransactionReference { get; set; }

    // Navigation properties
    public virtual Referral Referral { get; set; } = default!;
    public virtual Investor ReferrerInvestor { get; set; } = default!;
}

/// <summary>
/// Status of commission payout
/// </summary>
public enum CommissionStatus
{
    Pending = 0,
    Approved = 1,
    Paid = 2,
    Declined = 3,
    Expired = 4
}

