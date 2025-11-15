using System.ComponentModel.DataAnnotations;

namespace InvestorManagementSystem.Core.Entities;

/// <summary>
/// Represents a financial transaction (deposit, withdrawal, profit distribution)
/// </summary>
public class Transaction
{
    public Guid Id { get; set; }
    
    [Required]
    public Guid InvestorId { get; set; }
    
    public Guid? PortfolioId { get; set; }
    
    [Required]
    public TransactionType Type { get; set; }
    
    [Required]
    public decimal Amount { get; set; }
    
    [Required]
    public decimal Balance { get; set; }
    
    [Required]
    [StringLength(3)]
    public string Currency { get; set; } = "USD";
    
    [Required]
    public TransactionStatus Status { get; set; } = TransactionStatus.Pending;
    
    [StringLength(1000)]
    public string? Description { get; set; }
    
    [StringLength(100)]
    public string? Reference { get; set; }
    
    [StringLength(100)]
    public string? ExternalTransactionId { get; set; }
    
    [Required]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime? ProcessedAt { get; set; }
    
    public DateTime? FailedAt { get; set; }
    
    [StringLength(1000)]
    public string? FailureReason { get; set; }
    
    // Payment processing
    [StringLength(100)]
    public string? PaymentMethod { get; set; }
    
    [StringLength(100)]
    public string? PaymentProvider { get; set; }
    
    [StringLength(1000)]
    public string? PaymentData { get; set; } // JSON data for payment processing
    
    // Navigation properties
    public virtual Investor Investor { get; set; } = null!;
    public virtual Portfolio? Portfolio { get; set; }
}

/// <summary>
/// Transaction type enumeration
/// </summary>
public enum TransactionType
{
    Deposit = 0,
    Withdrawal = 1,
    ProfitDistribution = 2,
    Loss = 3,
    Fee = 4,
    Refund = 5,
    Bonus = 6,
    Penalty = 7
}

/// <summary>
/// Transaction status enumeration
/// </summary>
public enum TransactionStatus
{
    Pending = 0,
    Processing = 1,
    Completed = 2,
    Failed = 3,
    Cancelled = 4,
    Reversed = 5
}
