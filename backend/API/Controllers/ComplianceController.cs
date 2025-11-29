using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using InvestorManagementSystem.Infrastructure.Data;
using InvestorManagementSystem.Core.Entities;

namespace InvestorManagementSystem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "ComplianceOfficer,Administrator")]
public class ComplianceController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<ComplianceController> _logger;

    public ComplianceController(ApplicationDbContext context, ILogger<ComplianceController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Create Suspicious Activity Report (SAR)
    /// </summary>
    [HttpPost("suspicious-activity")]
    public async Task<ActionResult> CreateSAR([FromBody] CreateSARDto dto)
    {
        try
        {
            // Get current user ID from JWT claims
            var userIdClaim = User.FindFirst("investor_id")?.Value;
            var userId = !string.IsNullOrEmpty(userIdClaim) ? Guid.Parse(userIdClaim) : Guid.NewGuid();

            var sar = new SuspiciousActivityReport
            {
                Id = Guid.NewGuid(),
                InvestorId = dto.InvestorId,
                TransactionId = dto.TransactionId,
                ReportReason = dto.ReportReason,
                Amount = dto.Amount,
                Currency = dto.Currency ?? "ZAR",
                DetectedAt = DateTime.UtcNow,
                ReportedBy = userId,
                Status = SARStatus.Pending,
                Notes = dto.Notes
            };

            _context.SuspiciousActivityReports.Add(sar);
            await _context.SaveChangesAsync();

            _logger.LogInformation("SAR created: {SARId} for investor {InvestorId} by {UserId}",
                sar.Id, dto.InvestorId, userId);

            return CreatedAtAction(nameof(GetSAR), new { id = sar.Id }, new
            {
                id = sar.Id,
                message = "Suspicious Activity Report created successfully"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating SAR");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Get all Suspicious Activity Reports
    /// </summary>
    [HttpGet("suspicious-activities")]
    public async Task<ActionResult> GetAllSARs([FromQuery] SARStatus? status = null)
    {
        try
        {
            var query = _context.SuspiciousActivityReports
                .Include(s => s.Investor)
                .Include(s => s.Transaction)
                .AsQueryable();

            if (status.HasValue)
                query = query.Where(s => s.Status == status.Value);

            var sars = await query
                .OrderByDescending(s => s.DetectedAt)
                .Select(s => new
                {
                    s.Id,
                    s.InvestorId,
                    InvestorName = $"{s.Investor.FirstName} {s.Investor.LastName}",
                    s.TransactionId,
                    s.ReportReason,
                    s.Amount,
                    s.Currency,
                    s.DetectedAt,
                    s.Status,
                    s.ReviewedAt,
                    s.SubmittedToFIC,
                    s.FICReferenceNumber
                })
                .ToListAsync();

            return Ok(sars);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving SARs");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Get specific SAR by ID
    /// </summary>
    [HttpGet("suspicious-activities/{id}")]
    public async Task<ActionResult> GetSAR(Guid id)
    {
        try
        {
            var sar = await _context.SuspiciousActivityReports
                .Include(s => s.Investor)
                .Include(s => s.Transaction)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (sar == null)
                return NotFound(new { error = "SAR not found" });

            return Ok(new
            {
                sar.Id,
                sar.InvestorId,
                InvestorName = $"{sar.Investor.FirstName} {sar.Investor.LastName}",
                sar.TransactionId,
                sar.ReportReason,
                sar.Amount,
                sar.Currency,
                sar.DetectedAt,
                sar.ReportedBy,
                sar.Status,
                sar.Notes,
                sar.ReviewedAt,
                sar.ReviewedBy,
                sar.SubmittedToFIC,
                sar.FICReferenceNumber
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving SAR {SARId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Update SAR status
    /// </summary>
    [HttpPut("suspicious-activities/{id}/status")]
    public async Task<ActionResult> UpdateSARStatus(Guid id, [FromBody] UpdateSARStatusDto dto)
    {
        try
        {
            var sar = await _context.SuspiciousActivityReports.FindAsync(id);
            if (sar == null)
                return NotFound(new { error = "SAR not found" });

            var userIdClaim = User.FindFirst("investor_id")?.Value;
            var userId = !string.IsNullOrEmpty(userIdClaim) ? Guid.Parse(userIdClaim) : Guid.NewGuid();

            sar.Status = dto.Status;
            sar.Notes = dto.Notes ?? sar.Notes;
            sar.ReviewedAt = DateTime.UtcNow;
            sar.ReviewedBy = userId;

            if (dto.Status == SARStatus.Submitted)
            {
                sar.SubmittedToFIC = DateTime.UtcNow;
                sar.FICReferenceNumber = dto.FICReferenceNumber;
            }

            await _context.SaveChangesAsync();

            _logger.LogInformation("SAR {SARId} status updated to {Status} by {UserId}",
                id, dto.Status, userId);

            return Ok(new { message = $"SAR status updated to {dto.Status}" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating SAR status for {SARId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Get pending SARs (for dashboard)
    /// </summary>
    [HttpGet("pending-review")]
    public async Task<ActionResult> GetPendingSARs()
    {
        try
        {
            var pendingSARs = await _context.SuspiciousActivityReports
                .Where(s => s.Status == SARStatus.Pending || s.Status == SARStatus.UnderReview)
                .Include(s => s.Investor)
                .OrderBy(s => s.DetectedAt)
                .Select(s => new
                {
                    s.Id,
                    s.InvestorId,
                    InvestorName = $"{s.Investor.FirstName} {s.Investor.LastName}",
                    s.Amount,
                    s.Currency,
                    s.DetectedAt,
                    s.Status,
                    s.ReportReason
                })
                .ToListAsync();

            return Ok(pendingSARs);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving pending SARs");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Get high-risk investors (with multiple SARs)
    /// </summary>
    [HttpGet("high-risk-investors")]
    public async Task<ActionResult> GetHighRiskInvestors()
    {
        try
        {
            var highRiskInvestors = await _context.SuspiciousActivityReports
                .GroupBy(s => s.InvestorId)
                .Where(g => g.Count() >= 2)  // 2 or more SARs
                .Select(g => new
                {
                    InvestorId = g.Key,
                    SARCount = g.Count(),
                    TotalAmount = g.Sum(s => s.Amount),
                    LatestSAR = g.OrderByDescending(s => s.DetectedAt).FirstOrDefault()!.DetectedAt,
                    OpenSARs = g.Count(s => s.Status == SARStatus.Pending || s.Status == SARStatus.UnderReview)
                })
                .OrderByDescending(x => x.SARCount)
                .ToListAsync();

            // Get investor details
            var investorIds = highRiskInvestors.Select(x => x.InvestorId).ToList();
            var investors = await _context.Investors
                .Where(i => investorIds.Contains(i.Id))
                .Select(i => new { i.Id, i.FirstName, i.LastName, i.Email, i.Status })
                .ToDictionaryAsync(i => i.Id);

            var result = highRiskInvestors.Select(hr => new
            {
                hr.InvestorId,
                InvestorName = investors.ContainsKey(hr.InvestorId)
                    ? $"{investors[hr.InvestorId].FirstName} {investors[hr.InvestorId].LastName}"
                    : "Unknown",
                Email = investors.ContainsKey(hr.InvestorId) ? investors[hr.InvestorId].Email : null,
                Status = investors.ContainsKey(hr.InvestorId) ? investors[hr.InvestorId].Status.ToString() : "Unknown",
                hr.SARCount,
                hr.TotalAmount,
                hr.LatestSAR,
                hr.OpenSARs,
                RiskLevel = hr.SARCount >= 5 ? "Critical" : hr.SARCount >= 3 ? "High" : "Medium"
            });

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving high-risk investors");
            return StatusCode(500, "Internal server error");
        }
    }
}

// DTOs for compliance
public class CreateSARDto
{
    public Guid InvestorId { get; set; }
    public Guid? TransactionId { get; set; }
    public string ReportReason { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string? Currency { get; set; }
    public string? Notes { get; set; }
}

public class UpdateSARStatusDto
{
    public SARStatus Status { get; set; }
    public string? Notes { get; set; }
    public string? FICReferenceNumber { get; set; }
}

