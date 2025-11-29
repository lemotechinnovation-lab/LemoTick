using System.ComponentModel.DataAnnotations;

namespace InvestorManagementSystem.Application.DTOs;

/// <summary>
/// DTO for creating a withdrawal request
/// </summary>
public class CreateWithdrawalRequestDto
{
    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than 0")]
    public decimal Amount { get; set; }

    [Required]
    [StringLength(50)]
    public string Currency { get; set; } = "ZAR";

    [Required]
    [StringLength(200)]
    public string BankAccountNumber { get; set; } = string.Empty;

    [Required]
    [StringLength(100)]
    public string BankName { get; set; } = string.Empty;

    [Required]
    [StringLength(200)]
    public string AccountHolderName { get; set; } = string.Empty;

    [Required]
    [StringLength(50)]
    public string BranchCode { get; set; } = string.Empty;

    [StringLength(1000)]
    public string? Notes { get; set; }
}

/// <summary>
/// DTO for withdrawal request details
/// </summary>
public class WithdrawalRequestDto
{
    public Guid Id { get; set; }
    public Guid InvestorId { get; set; }
    public string InvestorName { get; set; } = string.Empty;
    public string InvestorEmail { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime RequestedAt { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public Guid? ApprovedBy { get; set; }
    public DateTime? RejectedAt { get; set; }
    public Guid? RejectedBy { get; set; }
    public string? RejectionReason { get; set; }
    public DateTime? ProcessedAt { get; set; }
    public string? BankAccountNumber { get; set; }
    public string? BankName { get; set; }
    public string? AccountHolderName { get; set; }
    public string? BranchCode { get; set; }
    public string? Notes { get; set; }
    public string? TransactionReference { get; set; }
}

/// <summary>
/// DTO for approving a withdrawal request
/// </summary>
public class ApproveWithdrawalDto
{
    [StringLength(100)]
    public string? TransactionReference { get; set; }

    [StringLength(500)]
    public string? Notes { get; set; }
}

/// <summary>
/// DTO for rejecting a withdrawal request
/// </summary>
public class RejectWithdrawalDto
{
    [Required]
    [StringLength(500)]
    public string RejectionReason { get; set; } = string.Empty;
}

