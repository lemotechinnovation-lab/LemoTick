using InvestorManagementSystem.Core.Entities;

namespace InvestorManagementSystem.Application.DTOs;

/// <summary>
/// KYC Document DTO for responses
/// </summary>
public class KYCDocumentDto
{
    public Guid Id { get; set; }
    public Guid InvestorId { get; set; }
    public DocumentType Type { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string StorageUrl { get; set; } = string.Empty;
    public DocumentStatus Status { get; set; }
    public string? RejectionReason { get; set; }
    public DateTime UploadedAt { get; set; }
    public DateTime? VerifiedAt { get; set; }
    public Guid? VerifiedBy { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public string? FileContentType { get; set; }
    public long FileSizeBytes { get; set; }
}

/// <summary>
/// DTO for uploading KYC documents
/// </summary>
public class UploadKYCDocumentDto
{
    public DocumentType Type { get; set; }
    public DateTime? ExpiryDate { get; set; }
    // File will be uploaded via IFormFile in controller
}

/// <summary>
/// DTO for verifying/rejecting KYC documents (Compliance Officer only)
/// </summary>
public class VerifyKYCDocumentDto
{
    public DocumentStatus Status { get; set; }  // Approved or Rejected
    public string? RejectionReason { get; set; }  // Required if Rejected
}

/// <summary>
/// KYC summary for investor
/// </summary>
public class KYCDSummaryDto
{
    public Guid InvestorId { get; set; }
    public bool IsKYCComplete { get; set; }
    public int TotalDocuments { get; set; }
    public int ApprovedDocuments { get; set; }
    public int PendingDocuments { get; set; }
    public int RejectedDocuments { get; set; }
    public List<string> MissingDocumentTypes { get; set; } = new();
    public List<KYCDocumentDto> Documents { get; set; } = new();
}

