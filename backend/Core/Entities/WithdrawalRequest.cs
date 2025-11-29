using System.ComponentModel.DataAnnotations;

namespace InvestorManagementSystem.Core.Entities;

/// <summary>
/// Represents a withdrawal request from an investor
/// </summary>
public class WithdrawalRequest
{
    public Guid Id { get; set; }

    [Required]
    public Guid InvestorId { get; set; }

    [Required]
    public decimal Amount { get; set; }

    [Required]
    [StringLength(50)]
    public string Currency { get; set; } = "ZAR";

    [Required]
    public WithdrawalStatus Status { get; set; } = WithdrawalStatus.Pending;

    [Required]
    public DateTime RequestedAt { get; set; } = DateTime.UtcNow;

    public DateTime? ApprovedAt { get; set; }
    public Guid? ApprovedBy { get; set; } // User ID who approved

    public DateTime? RejectedAt { get; set; }
    public Guid? RejectedBy { get; set; } // User ID who rejected

    [StringLength(500)]
    public string? RejectionReason { get; set; }

    public DateTime? ProcessedAt { get; set; }

    [StringLength(200)]
    public string? BankAccountNumber { get; set; }

    [StringLength(100)]
    public string? BankName { get; set; }

    [StringLength(200)]
    public string? AccountHolderName { get; set; }

    [StringLength(50)]
    public string? BranchCode { get; set; }

    [StringLength(1000)]
    public string? Notes { get; set; }

    [StringLength(100)]
    public string? TransactionReference { get; set; } // Bank transaction reference

    // Navigation property
    public virtual Investor Investor { get; set; } = default!;
}

/// <summary>
/// Withdrawal request status enumeration
/// </summary>
public enum WithdrawalStatus
{
    Pending = 0,             // Awaiting review
    UnderReview = 1,         // Being reviewed by compliance
    Approved = 2,            // Approved, pending processing
    Processing = 3,          // Being processed by bank
    Completed = 4,           // Successfully completed
    Rejected = 5,            // Rejected by admin/compliance
    Cancelled = 6            // Cancelled by investor
}

