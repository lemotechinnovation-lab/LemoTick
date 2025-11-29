using System.ComponentModel.DataAnnotations;

namespace InvestorManagementSystem.Core.Entities;

/// <summary>
/// Represents a payment transaction
/// </summary>
public class Payment
{
    public Guid Id { get; set; }

    [Required]
    public Guid InvestorId { get; set; }

    [Required]
    public PaymentType Type { get; set; }

    [Required]
    public PaymentMethod Method { get; set; }

    [Required]
    public decimal Amount { get; set; }

    [Required]
    [StringLength(3)]
    public string Currency { get; set; } = "ZAR";

    [Required]
    public PaymentStatus Status { get; set; } = PaymentStatus.Pending;

    [Required]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? CompletedAt { get; set; }

    [StringLength(200)]
    public string? PaymentGateway { get; set; } // "PayFast", "Stripe", etc.

    [StringLength(200)]
    public string? PaymentGatewayId { get; set; } // External payment ID

    [StringLength(200)]
    public string? PaymentToken { get; set; } // For payment session/token

    [StringLength(500)]
    public string? Description { get; set; }

    [StringLength(500)]
    public string? FailureReason { get; set; }

    // PayFast specific fields
    [StringLength(100)]
    public string? PayFastPaymentId { get; set; }

    [StringLength(100)]
    public string? PayFastMerchantId { get; set; }

    [StringLength(200)]
    public string? PayFastSignature { get; set; }

    // Transaction linking
    public Guid? TransactionId { get; set; }

    [StringLength(1000)]
    public string? Metadata { get; set; } // JSON for additional data

    // Navigation properties
    public virtual Investor Investor { get; set; } = default!;
    public virtual Transaction? Transaction { get; set; }
}

/// <summary>
/// Type of payment
/// </summary>
public enum PaymentType
{
    Deposit = 0,
    Withdrawal = 1,
    Fee = 2,
    Refund = 3,
    Commission = 4
}

/// <summary>
/// Payment method
/// </summary>
public enum PaymentMethod
{
    InstantEFT = 0,
    CreditCard = 1,
    DebitCard = 2,
    BankTransfer = 3,
    Bitcoin = 4,
    Other = 5
}

/// <summary>
/// Payment status
/// </summary>
public enum PaymentStatus
{
    Pending = 0,        // Payment initiated
    Processing = 1,     // Being processed by gateway
    Completed = 2,      // Successfully completed
    Failed = 3,         // Failed
    Cancelled = 4,      // Cancelled by user
    Refunded = 5,       // Refunded
    ChargedBack = 6     // Charged back
}

