using System.ComponentModel.DataAnnotations;

namespace InvestorManagementSystem.Core.Entities;

/// <summary>
/// Suspicious Activity Report (SAR) for AML compliance
/// Required for FICA and FATF grey list compliance
/// </summary>
public class SuspiciousActivityReport
{
    public Guid Id { get; set; }

    [Required]
    public Guid InvestorId { get; set; }

    public Guid? TransactionId { get; set; }

    [Required]
    [StringLength(2000)]
    public string ReportReason { get; set; } = string.Empty;

    [Required]
    public decimal Amount { get; set; }

    [StringLength(50)]
    public string Currency { get; set; } = "ZAR";

    [Required]
    public DateTime DetectedAt { get; set; } = DateTime.UtcNow;

    [Required]
    public Guid ReportedBy { get; set; }  // Compliance officer or system

    [Required]
    public SARStatus Status { get; set; } = SARStatus.Pending;

    [StringLength(5000)]
    public string? Notes { get; set; }

    public DateTime? ReviewedAt { get; set; }

    public Guid? ReviewedBy { get; set; }

    public DateTime? SubmittedToFIC { get; set; }  // Submitted to Financial Intelligence Centre

    [StringLength(100)]
    public string? FICReferenceNumber { get; set; }

    // Navigation properties
    public virtual Investor Investor { get; set; } = null!;
    public virtual Transaction? Transaction { get; set; }
}

/// <summary>
/// SAR status enumeration
/// </summary>
public enum SARStatus
{
    Pending = 0,        // Detected, awaiting review
    UnderReview = 1,    // Being reviewed by compliance
    Approved = 2,       // Approved for submission to FIC
    Submitted = 3,      // Submitted to Financial Intelligence Centre
    Closed = 4,         // Case closed (false positive)
    Escalated = 5       // Escalated to law enforcement
}

