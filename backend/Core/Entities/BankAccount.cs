using System.ComponentModel.DataAnnotations;

namespace InvestorManagementSystem.Core.Entities;

/// <summary>
/// Represents a bank account belonging to an investor
/// Used for deposits and withdrawals
/// </summary>
public class BankAccount
{
    public Guid Id { get; set; }

    [Required]
    public Guid InvestorId { get; set; }

    [Required]
    [StringLength(200)]
    public string AccountHolderName { get; set; } = string.Empty;

    [Required]
    [StringLength(50)]
    public string AccountNumber { get; set; } = string.Empty;

    [Required]
    [StringLength(20)]
    public string BranchCode { get; set; } = string.Empty;

    [Required]
    [StringLength(100)]
    public string BankName { get; set; } = string.Empty;

    [Required]
    public BankAccountType AccountType { get; set; } = BankAccountType.Cheque;

    [Required]
    public BankAccountStatus Status { get; set; } = BankAccountStatus.Pending;

    public bool IsPrimary { get; set; } = false;

    [Required]
    public DateTime AddedAt { get; set; } = DateTime.UtcNow;

    public DateTime? VerifiedAt { get; set; }

    public Guid? VerifiedBy { get; set; }

    [StringLength(1000)]
    public string? VerificationNotes { get; set; }

    public DateTime? LastUsedAt { get; set; }

    // Navigation properties
    public virtual Investor Investor { get; set; } = default!;
}

/// <summary>
/// Bank account type enumeration
/// </summary>
public enum BankAccountType
{
    Cheque = 0,         // Current/Cheque account
    Savings = 1,        // Savings account
    Transmission = 2    // Transmission account
}

/// <summary>
/// Bank account verification status
/// </summary>
public enum BankAccountStatus
{
    Pending = 0,        // Added but not verified
    Verified = 1,       // Verified and active
    Rejected = 2,       // Rejected during verification
    Inactive = 3        // Deactivated by user or admin
}

