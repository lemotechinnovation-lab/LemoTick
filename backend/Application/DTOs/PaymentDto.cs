using System.ComponentModel.DataAnnotations;
using InvestorManagementSystem.Core.Entities;

namespace InvestorManagementSystem.Application.DTOs;

/// <summary>
/// DTO for creating a payment
/// </summary>
public class CreatePaymentDto
{
    [Required]
    public Guid InvestorId { get; set; }

    [Required]
    public PaymentType Type { get; set; }

    [Required]
    public PaymentMethod Method { get; set; }

    [Required]
    [Range(0.01, (double)decimal.MaxValue)]
    public decimal Amount { get; set; }

    [StringLength(3)]
    public string Currency { get; set; } = "ZAR";

    [StringLength(500)]
    public string? Description { get; set; }

    [StringLength(200)]
    public string? ReturnUrl { get; set; }

    [StringLength(200)]
    public string? CancelUrl { get; set; }

    [StringLength(200)]
    public string? NotifyUrl { get; set; }
}

/// <summary>
/// DTO for payment response
/// </summary>
public class PaymentDto
{
    public Guid Id { get; set; }
    public Guid InvestorId { get; set; }
    public string InvestorName { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Method { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public string? PaymentGateway { get; set; }
    public string? PaymentGatewayId { get; set; }
    public string? Description { get; set; }
    public string? FailureReason { get; set; }
}

/// <summary>
/// DTO for PayFast payment initiation response
/// </summary>
public class PayFastPaymentResponseDto
{
    public Guid PaymentId { get; set; }
    public string PayFastUrl { get; set; } = string.Empty;
    public Dictionary<string, string> PaymentData { get; set; } = new();
}

/// <summary>
/// DTO for PayFast webhook notification (ITN - Instant Transaction Notification)
/// </summary>
public class PayFastWebhookDto
{
    [Required]
    public string m_payment_id { get; set; } = string.Empty;

    public string pf_payment_id { get; set; } = string.Empty;

    [Required]
    public string payment_status { get; set; } = string.Empty;

    public string item_name { get; set; } = string.Empty;
    public string item_description { get; set; } = string.Empty;

    [Required]
    public decimal amount_gross { get; set; }

    public decimal amount_fee { get; set; }
    public decimal amount_net { get; set; }

    public string custom_str1 { get; set; } = string.Empty; // Can store PaymentId
    public string custom_str2 { get; set; } = string.Empty;
    public string custom_str3 { get; set; } = string.Empty;
    public string custom_str4 { get; set; } = string.Empty;
    public string custom_str5 { get; set; } = string.Empty;

    public string custom_int1 { get; set; } = string.Empty;
    public string custom_int2 { get; set; } = string.Empty;
    public string custom_int3 { get; set; } = string.Empty;
    public string custom_int4 { get; set; } = string.Empty;
    public string custom_int5 { get; set; } = string.Empty;

    public string name_first { get; set; } = string.Empty;
    public string name_last { get; set; } = string.Empty;
    public string email_address { get; set; } = string.Empty;

    public string merchant_id { get; set; } = string.Empty;
    public string signature { get; set; } = string.Empty;
}

/// <summary>
/// DTO for payment statistics
/// </summary>
public class PaymentStatisticsDto
{
    public int TotalPayments { get; set; }
    public int CompletedPayments { get; set; }
    public int FailedPayments { get; set; }
    public int PendingPayments { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal CompletedAmount { get; set; }
    public decimal AverageAmount { get; set; }
    public Dictionary<string, int> PaymentsByMethod { get; set; } = new();
    public Dictionary<string, decimal> AmountByMethod { get; set; } = new();
}

