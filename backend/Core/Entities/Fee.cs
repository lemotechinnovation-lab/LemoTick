using System.ComponentModel.DataAnnotations;

namespace InvestorManagementSystem.Core.Entities;

/// <summary>
/// Represents fees charged to portfolios (management, performance, withdrawal)
/// </summary>
public class Fee
{
    public Guid Id { get; set; }

    [Required]
    public Guid PortfolioId { get; set; }

    [Required]
    public FeeType Type { get; set; }

    [Required]
    public decimal Rate { get; set; }  // Percentage rate (e.g., 1.5 for 1.5%)

    [Required]
    public decimal Amount { get; set; }

    [Required]
    public DateTime CalculatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? ChargedAt { get; set; }

    [Required]
    public FeeStatus Status { get; set; } = FeeStatus.Calculated;

    [StringLength(500)]
    public string? Description { get; set; }

    // Navigation property
    public virtual Portfolio Portfolio { get; set; } = null!;
}

/// <summary>
/// Types of fees charged
/// </summary>
public enum FeeType
{
    Management = 0,      // Annual management fee (% of AUM)
    Performance = 1,     // Performance fee (% of profit above high watermark)
    Withdrawal = 2,      // Withdrawal fee
    Transaction = 3      // Transaction fee
}

/// <summary>
/// Fee status enumeration
/// </summary>
public enum FeeStatus
{
    Calculated = 0,      // Calculated but not yet charged
    Charged = 1,         // Charged to portfolio
    Waived = 2,          // Waived by administrator
    Refunded = 3         // Refunded to investor
}

