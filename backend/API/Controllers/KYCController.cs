using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using InvestorManagementSystem.Application.DTOs;
using InvestorManagementSystem.Infrastructure.Data;
using InvestorManagementSystem.Core.Entities;

namespace InvestorManagementSystem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class KYCController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<KYCController> _logger;
    private readonly IWebHostEnvironment _environment;

    public KYCController(
        ApplicationDbContext context,
        ILogger<KYCController> logger,
        IWebHostEnvironment environment)
    {
        _context = context;
        _logger = logger;
        _environment = environment;
    }

    /// <summary>
    /// Get KYC summary for an investor
    /// </summary>
    [HttpGet("investor/{investorId}/summary")]
    public async Task<ActionResult<KYCDSummaryDto>> GetKYCSummary(Guid investorId)
    {
        try
        {
            var investor = await _context.Investors.FindAsync(investorId);
            if (investor == null)
                return NotFound(new { error = "Investor not found" });

            var documents = await _context.KYCDocuments
                .Where(d => d.InvestorId == investorId)
                .OrderByDescending(d => d.UploadedAt)
                .ToListAsync();

            var requiredTypes = new[] { DocumentType.IdDocument, DocumentType.ProofOfAddress };
            var uploadedTypes = documents.Select(d => d.Type).Distinct().ToList();
            var missingTypes = requiredTypes.Where(t => !uploadedTypes.Contains(t))
                .Select(t => t.ToString()).ToList();

            var isComplete = documents.Count(d => d.Status == DocumentStatus.Approved) >= requiredTypes.Length
                          && missingTypes.Count == 0;

            var summary = new KYCDSummaryDto
            {
                InvestorId = investorId,
                IsKYCComplete = isComplete,
                TotalDocuments = documents.Count,
                ApprovedDocuments = documents.Count(d => d.Status == DocumentStatus.Approved),
                PendingDocuments = documents.Count(d => d.Status == DocumentStatus.Pending || d.Status == DocumentStatus.UnderReview),
                RejectedDocuments = documents.Count(d => d.Status == DocumentStatus.Rejected),
                MissingDocumentTypes = missingTypes,
                Documents = documents.Select(d => new KYCDocumentDto
                {
                    Id = d.Id,
                    InvestorId = d.InvestorId,
                    Type = d.Type,
                    FileName = d.FileName,
                    StorageUrl = d.StorageUrl,
                    Status = d.Status,
                    RejectionReason = d.RejectionReason,
                    UploadedAt = d.UploadedAt,
                    VerifiedAt = d.VerifiedAt,
                    VerifiedBy = d.VerifiedBy,
                    ExpiryDate = d.ExpiryDate,
                    FileContentType = d.FileContentType,
                    FileSizeBytes = d.FileSizeBytes
                }).ToList()
            };

            return Ok(summary);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting KYC summary for investor {InvestorId}", investorId);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Upload a KYC document (Investor only)
    /// </summary>
    [HttpPost("investor/{investorId}/upload")]
    public async Task<ActionResult<KYCDocumentDto>> UploadDocument(
        Guid investorId,
        [FromForm] DocumentType documentType,
        [FromForm] IFormFile file,
        [FromForm] DateTime? expiryDate = null)
    {
        try
        {
            // Validate file
            if (file == null || file.Length == 0)
                return BadRequest(new { error = "No file provided" });

            // Validate file size (max 10MB)
            if (file.Length > 10 * 1024 * 1024)
                return BadRequest(new { error = "File size exceeds 10MB limit" });

            // Validate file type
            var allowedTypes = new[] { "image/jpeg", "image/png", "image/jpg", "application/pdf" };
            if (!allowedTypes.Contains(file.ContentType.ToLower()))
                return BadRequest(new { error = "Invalid file type. Only JPEG, PNG, and PDF allowed" });

            var investor = await _context.Investors.FindAsync(investorId);
            if (investor == null)
                return NotFound(new { error = "Investor not found" });

            // Create uploads directory if it doesn't exist
            var uploadsPath = Path.Combine(_environment.ContentRootPath, "uploads", "kyc", investorId.ToString());
            Directory.CreateDirectory(uploadsPath);

            // Generate unique filename
            var fileExtension = Path.GetExtension(file.FileName);
            var uniqueFileName = $"{documentType}_{Guid.NewGuid()}{fileExtension}";
            var filePath = Path.Combine(uploadsPath, uniqueFileName);

            // Save file
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Create document record
            var document = new KYCDocument
            {
                Id = Guid.NewGuid(),
                InvestorId = investorId,
                Type = documentType,
                FileName = file.FileName,
                StorageUrl = $"/uploads/kyc/{investorId}/{uniqueFileName}",
                Status = DocumentStatus.Pending,
                UploadedAt = DateTime.UtcNow,
                ExpiryDate = expiryDate,
                FileContentType = file.ContentType,
                FileSizeBytes = file.Length
            };

            _context.KYCDocuments.Add(document);
            await _context.SaveChangesAsync();

            _logger.LogInformation("KYC document uploaded: {DocumentId} for investor {InvestorId}", document.Id, investorId);

            var dto = new KYCDocumentDto
            {
                Id = document.Id,
                InvestorId = document.InvestorId,
                Type = document.Type,
                FileName = document.FileName,
                StorageUrl = document.StorageUrl,
                Status = document.Status,
                UploadedAt = document.UploadedAt,
                ExpiryDate = document.ExpiryDate,
                FileContentType = document.FileContentType,
                FileSizeBytes = document.FileSizeBytes
            };

            return CreatedAtAction(nameof(GetDocument), new { documentId = document.Id }, dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading KYC document for investor {InvestorId}", investorId);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Get a specific KYC document
    /// </summary>
    [HttpGet("documents/{documentId}")]
    public async Task<ActionResult<KYCDocumentDto>> GetDocument(Guid documentId)
    {
        try
        {
            var document = await _context.KYCDocuments.FindAsync(documentId);
            if (document == null)
                return NotFound(new { error = "Document not found" });

            var dto = new KYCDocumentDto
            {
                Id = document.Id,
                InvestorId = document.InvestorId,
                Type = document.Type,
                FileName = document.FileName,
                StorageUrl = document.StorageUrl,
                Status = document.Status,
                RejectionReason = document.RejectionReason,
                UploadedAt = document.UploadedAt,
                VerifiedAt = document.VerifiedAt,
                VerifiedBy = document.VerifiedBy,
                ExpiryDate = document.ExpiryDate,
                FileContentType = document.FileContentType,
                FileSizeBytes = document.FileSizeBytes
            };

            return Ok(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting KYC document {DocumentId}", documentId);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Verify or reject a KYC document (Compliance Officer only)
    /// </summary>
    [HttpPut("documents/{documentId}/verify")]
    [Authorize(Roles = "ComplianceOfficer,Administrator")]
    public async Task<ActionResult> VerifyDocument(Guid documentId, [FromBody] VerifyKYCDocumentDto dto)
    {
        try
        {
            var document = await _context.KYCDocuments.FindAsync(documentId);
            if (document == null)
                return NotFound(new { error = "Document not found" });

            if (dto.Status == DocumentStatus.Rejected && string.IsNullOrEmpty(dto.RejectionReason))
                return BadRequest(new { error = "Rejection reason is required when rejecting a document" });

            // Get current user ID from claims (simplified - in production, get from JWT)
            var userId = Guid.NewGuid(); // TODO: Get from User.Claims

            document.Status = dto.Status;
            document.RejectionReason = dto.RejectionReason;
            document.VerifiedAt = DateTime.UtcNow;
            document.VerifiedBy = userId;

            await _context.SaveChangesAsync();

            // If approved, check if all required docs are approved and update investor status
            if (dto.Status == DocumentStatus.Approved)
            {
                var allDocs = await _context.KYCDocuments
                    .Where(d => d.InvestorId == document.InvestorId)
                    .ToListAsync();

                var hasIdDoc = allDocs.Any(d => d.Type == DocumentType.IdDocument && d.Status == DocumentStatus.Approved);
                var hasProofOfAddress = allDocs.Any(d => d.Type == DocumentType.ProofOfAddress && d.Status == DocumentStatus.Approved);

                if (hasIdDoc && hasProofOfAddress)
                {
                    var investor = await _context.Investors.FindAsync(document.InvestorId);
                    if (investor != null && investor.Status == InvestorStatus.KYCPending)
                    {
                        investor.Status = InvestorStatus.KYCApproved;
                        await _context.SaveChangesAsync();
                        _logger.LogInformation("Investor {InvestorId} KYC approved", document.InvestorId);
                    }
                }
            }

            _logger.LogInformation("KYC document {DocumentId} {Status} by {UserId}",
                documentId, dto.Status, userId);

            return Ok(new { message = $"Document {dto.Status.ToString().ToLower()} successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error verifying KYC document {DocumentId}", documentId);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Delete a KYC document
    /// </summary>
    [HttpDelete("documents/{documentId}")]
    public async Task<ActionResult> DeleteDocument(Guid documentId)
    {
        try
        {
            var document = await _context.KYCDocuments.FindAsync(documentId);
            if (document == null)
                return NotFound(new { error = "Document not found" });

            // Delete physical file
            var filePath = Path.Combine(_environment.ContentRootPath, document.StorageUrl.TrimStart('/'));
            if (System.IO.File.Exists(filePath))
            {
                System.IO.File.Delete(filePath);
            }

            _context.KYCDocuments.Remove(document);
            await _context.SaveChangesAsync();

            _logger.LogInformation("KYC document {DocumentId} deleted", documentId);

            return Ok(new { message = "Document deleted successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting KYC document {DocumentId}", documentId);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Get all pending KYC documents (Compliance Officer only)
    /// </summary>
    [HttpGet("pending")]
    [Authorize(Roles = "ComplianceOfficer,Administrator")]
    public async Task<ActionResult<List<KYCDocumentDto>>> GetPendingDocuments()
    {
        try
        {
            var documents = await _context.KYCDocuments
                .Where(d => d.Status == DocumentStatus.Pending || d.Status == DocumentStatus.UnderReview)
                .OrderBy(d => d.UploadedAt)
                .Include(d => d.Investor)
                .Select(d => new KYCDocumentDto
                {
                    Id = d.Id,
                    InvestorId = d.InvestorId,
                    Type = d.Type,
                    FileName = d.FileName,
                    StorageUrl = d.StorageUrl,
                    Status = d.Status,
                    UploadedAt = d.UploadedAt,
                    FileContentType = d.FileContentType,
                    FileSizeBytes = d.FileSizeBytes
                })
                .ToListAsync();

            return Ok(documents);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting pending KYC documents");
            return StatusCode(500, "Internal server error");
        }
    }
}

