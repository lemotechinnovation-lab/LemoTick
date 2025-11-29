using System.ComponentModel.DataAnnotations;

namespace InvestorManagementSystem.Core.Entities;

/// <summary>
/// Represents a KYC (Know Your Customer) document uploaded by an investor
/// Required for FICA compliance in South Africa
/// </summary>
public class KYCDocument
{
    public Guid Id { get; set; }

    [Required]
    public Guid InvestorId { get; set; }

    [Required]
    public DocumentType Type { get; set; }

    [Required]
    [StringLength(500)]
    public string FileName { get; set; } = string.Empty;

    [Required]
    [StringLength(1000)]
    public string StorageUrl { get; set; } = string.Empty;

    [Required]
    public DocumentStatus Status { get; set; } = DocumentStatus.Pending;

    [StringLength(2000)]
    public string? RejectionReason { get; set; }

    [Required]
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

    public DateTime? VerifiedAt { get; set; }

    public Guid? VerifiedBy { get; set; }  // Compliance officer who verified

    public DateTime? ExpiryDate { get; set; }

    // File metadata
    [StringLength(100)]
    public string? FileContentType { get; set; }

    public long FileSizeBytes { get; set; }

    // Navigation property
    public virtual Investor Investor { get; set; } = null!;
}

/// <summary>
/// Types of KYC documents required for compliance
/// </summary>
public enum DocumentType
{
    IdDocument = 0,           // South African ID or Passport
    ProofOfAddress = 1,       // Utility bill, bank statement (< 3 months)
    ProofOfBanking = 2,       // Bank statement or letter
    TaxClearance = 3,         // Tax clearance certificate (optional)
    SourceOfFunds = 4,        // Declaration of source of funds
    Other = 5                 // Other supporting documents
}

/// <summary>
/// Status of KYC document verification
/// </summary>
public enum DocumentStatus
{
    Pending = 0,              // Uploaded, awaiting verification
    UnderReview = 1,          // Being reviewed by compliance
    Approved = 2,             // Verified and approved
    Rejected = 3,             // Rejected - needs replacement
    Expired = 4               // Document has expired
}

