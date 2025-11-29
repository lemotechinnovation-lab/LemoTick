using System.ComponentModel.DataAnnotations;
using InvestorManagementSystem.Core.Entities;

namespace InvestorManagementSystem.Application.DTOs;

/// <summary>
/// DTO for displaying bank account information
/// </summary>
public class BankAccountDto
{
    public Guid Id { get; set; }
    public Guid InvestorId { get; set; }
    public string AccountHolderName { get; set; } = string.Empty;

    /// <summary>
    /// Masked account number for security (e.g., "****1234")
    /// </summary>
    public string MaskedAccountNumber { get; set; } = string.Empty;

    public string BranchCode { get; set; } = string.Empty;
    public string BankName { get; set; } = string.Empty;
    public BankAccountType AccountType { get; set; }
    public BankAccountStatus Status { get; set; }
    public bool IsPrimary { get; set; }
    public DateTime AddedAt { get; set; }
    public DateTime? VerifiedAt { get; set; }
    public DateTime? LastUsedAt { get; set; }
}

/// <summary>
/// DTO for adding a new bank account
/// </summary>
public class AddBankAccountDto
{
    [Required]
    [StringLength(200)]
    public string AccountHolderName { get; set; } = string.Empty;

    [Required]
    [StringLength(50)]
    [RegularExpression(@"^\d+$", ErrorMessage = "Account number must contain only digits")]
    public string AccountNumber { get; set; } = string.Empty;

    [Required]
    [StringLength(20)]
    [RegularExpression(@"^\d{6}$", ErrorMessage = "Branch code must be 6 digits")]
    public string BranchCode { get; set; } = string.Empty;

    [Required]
    [StringLength(100)]
    public string BankName { get; set; } = string.Empty;

    [Required]
    public BankAccountType AccountType { get; set; }
}

/// <summary>
/// DTO for updating bank account details
/// </summary>
public class UpdateBankAccountDto
{
    [StringLength(200)]
    public string? AccountHolderName { get; set; }

    [StringLength(100)]
    public string? BankName { get; set; }

    public BankAccountType? AccountType { get; set; }
}

/// <summary>
/// DTO for bank account verification by admin
/// </summary>
public class VerifyBankAccountDto
{
    [Required]
    public BankAccountStatus Status { get; set; }

    [StringLength(1000)]
    public string? VerificationNotes { get; set; }
}

/// <summary>
/// DTO for bank details lookup (by branch code)
/// </summary>
public class BankDetailsDto
{
    public string BankName { get; set; } = string.Empty;
    public string BranchCode { get; set; } = string.Empty;
    public string BranchName { get; set; } = string.Empty;
    public bool IsValid { get; set; }
}

