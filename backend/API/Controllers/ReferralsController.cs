using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using InvestorManagementSystem.Infrastructure.Data;
using InvestorManagementSystem.Infrastructure.Services;
using InvestorManagementSystem.Application.DTOs;
using InvestorManagementSystem.Core.Entities;
using System.Security.Claims;

namespace InvestorManagementSystem.API.Controllers;

/// <summary>
/// Controller for managing referrals and commissions
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReferralsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ReferralService _referralService;
    private readonly ILogger<ReferralsController> _logger;

    public ReferralsController(
        ApplicationDbContext context,
        ReferralService referralService,
        ILogger<ReferralsController> logger)
    {
        _context = context;
        _referralService = referralService;
        _logger = logger;
    }

    /// <summary>
    /// Get or generate referral code for current investor
    /// </summary>
    [HttpGet("my-code")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<ReferralLinkDto>> GetMyReferralCode()
    {
        var investorId = GetCurrentInvestorId();
        var investor = await _context.Investors.FindAsync(investorId);

        if (investor == null)
            return NotFound();

        // Generate code if doesn't exist
        var referralCode = string.IsNullOrEmpty(investor.ReferralCode)
            ? await _referralService.GenerateReferralCodeAsync(investorId)
            : investor.ReferralCode;

        var baseUrl = $"{Request.Scheme}://{Request.Host}";
        var referralLink = $"{baseUrl}/register?ref={referralCode}";

        return Ok(new ReferralLinkDto
        {
            ReferralCode = referralCode,
            ReferralLink = referralLink,
            QrCodeDataUri = "" // Can implement QR code generation if needed
        });
    }

    /// <summary>
    /// Get referral summary for current investor
    /// </summary>
    [HttpGet("my-summary")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<ReferralSummaryDto>> GetMySummary()
    {
        var investorId = GetCurrentInvestorId();
        var investor = await _context.Investors.FindAsync(investorId);

        if (investor == null)
            return NotFound();

        var (totalReferrals, activeReferrals, totalCommission, pendingCommission) =
            await _referralService.GetReferralSummaryAsync(investorId);

        var pendingReferrals = await _context.Referrals
            .CountAsync(r => r.ReferrerInvestorId == investorId && r.Status == ReferralStatus.Pending);

        var recentReferrals = await _context.Referrals
            .Where(r => r.ReferrerInvestorId == investorId)
            .OrderByDescending(r => r.ReferredAt)
            .Take(10)
            .Include(r => r.ReferredInvestor)
            .Select(r => new ReferralDto
            {
                Id = r.Id,
                ReferrerInvestorId = r.ReferrerInvestorId,
                ReferrerName = $"{investor.FirstName} {investor.LastName}",
                ReferrerEmail = investor.Email,
                ReferredInvestorId = r.ReferredInvestorId,
                ReferredName = $"{r.ReferredInvestor.FirstName} {r.ReferredInvestor.LastName}",
                ReferredEmail = r.ReferredInvestor.Email,
                ReferralCode = r.ReferralCode,
                ReferredAt = r.ReferredAt,
                ConvertedAt = r.ConvertedAt,
                Status = r.Status.ToString(),
                CommissionEarned = r.CommissionEarned,
                CommissionRate = r.CommissionRate
            })
            .ToListAsync();

        // Get leaderboard rank
        var leaderboard = await _referralService.GetLeaderboardAsync(100);
        var rank = leaderboard.FindIndex(l => l.investorId == investorId) + 1;

        return Ok(new ReferralSummaryDto
        {
            InvestorId = investorId,
            InvestorName = $"{investor.FirstName} {investor.LastName}",
            ReferralCode = investor.ReferralCode ?? "",
            TotalReferrals = totalReferrals,
            ActiveReferrals = activeReferrals,
            PendingReferrals = pendingReferrals,
            TotalCommissionEarned = totalCommission,
            PendingCommission = pendingCommission,
            PaidCommission = totalCommission,
            LeaderboardRank = rank,
            RecentReferrals = recentReferrals
        });
    }

    /// <summary>
    /// Get all referrals made by current investor
    /// </summary>
    [HttpGet("my-referrals")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<ReferralDto>>> GetMyReferrals()
    {
        var investorId = GetCurrentInvestorId();

        var referrals = await _context.Referrals
            .Where(r => r.ReferrerInvestorId == investorId)
            .Include(r => r.ReferrerInvestor)
            .Include(r => r.ReferredInvestor)
            .OrderByDescending(r => r.ReferredAt)
            .Select(r => new ReferralDto
            {
                Id = r.Id,
                ReferrerInvestorId = r.ReferrerInvestorId,
                ReferrerName = $"{r.ReferrerInvestor.FirstName} {r.ReferrerInvestor.LastName}",
                ReferrerEmail = r.ReferrerInvestor.Email,
                ReferredInvestorId = r.ReferredInvestorId,
                ReferredName = $"{r.ReferredInvestor.FirstName} {r.ReferredInvestor.LastName}",
                ReferredEmail = r.ReferredInvestor.Email,
                ReferralCode = r.ReferralCode,
                ReferredAt = r.ReferredAt,
                ConvertedAt = r.ConvertedAt,
                Status = r.Status.ToString(),
                CommissionEarned = r.CommissionEarned,
                CommissionRate = r.CommissionRate
            })
            .ToListAsync();

        return Ok(referrals);
    }

    /// <summary>
    /// Validate a referral code
    /// </summary>
    [HttpPost("validate")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<object>> ValidateReferralCode([FromBody] string referralCode)
    {
        var isValid = await _referralService.ValidateReferralCodeAsync(referralCode);

        if (!isValid)
            return Ok(new { valid = false, message = "Invalid or inactive referral code" });

        var referrer = await _context.Investors
            .FirstOrDefaultAsync(i => i.ReferralCode == referralCode);

        return Ok(new
        {
            valid = true,
            message = "Valid referral code",
            referrerName = referrer != null ? $"{referrer.FirstName} {referrer.LastName}" : null
        });
    }

    /// <summary>
    /// Get referral leaderboard
    /// </summary>
    [HttpGet("leaderboard")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<LeaderboardEntryDto>>> GetLeaderboard([FromQuery] int top = 10)
    {
        if (top < 1 || top > 100)
            top = 10;

        var leaderboard = await _referralService.GetLeaderboardAsync(top);

        var investorIds = leaderboard.Select(l => l.investorId).ToList();
        var investors = await _context.Investors
            .Where(i => investorIds.Contains(i.Id))
            .ToDictionaryAsync(i => i.Id);

        var result = leaderboard.Select((entry, index) => new LeaderboardEntryDto
        {
            Rank = index + 1,
            InvestorId = entry.investorId,
            InvestorName = entry.name,
            Email = investors.GetValueOrDefault(entry.investorId)?.Email ?? "",
            TotalReferrals = entry.referralCount,
            ActiveReferrals = entry.referralCount, // Can refine this
            TotalCommissionEarned = entry.totalCommission,
            ReferralCode = investors.GetValueOrDefault(entry.investorId)?.ReferralCode ?? ""
        }).ToList();

        return Ok(result);
    }

    /// <summary>
    /// Get commission history for current investor
    /// </summary>
    [HttpGet("commissions")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<CommissionDto>>> GetMyCommissions()
    {
        var investorId = GetCurrentInvestorId();

        var commissions = await _context.ReferralCommissions
            .Where(c => c.ReferrerInvestorId == investorId)
            .Include(c => c.ReferrerInvestor)
            .OrderByDescending(c => c.EarnedAt)
            .Select(c => new CommissionDto
            {
                Id = c.Id,
                ReferralId = c.ReferralId,
                ReferrerInvestorId = c.ReferrerInvestorId,
                ReferrerName = $"{c.ReferrerInvestor.FirstName} {c.ReferrerInvestor.LastName}",
                Amount = c.Amount,
                Currency = c.Currency,
                EarnedAt = c.EarnedAt,
                PaidAt = c.PaidAt,
                Status = c.Status.ToString(),
                Description = c.Description,
                TransactionReference = c.TransactionReference
            })
            .ToListAsync();

        return Ok(commissions);
    }

    /// <summary>
    /// Get all commissions (Admin only)
    /// </summary>
    [HttpGet("commissions/all")]
    [Authorize(Roles = "Administrator,ComplianceOfficer")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<CommissionDto>>> GetAllCommissions(
        [FromQuery] CommissionStatus? status = null)
    {
        var query = _context.ReferralCommissions
            .Include(c => c.ReferrerInvestor)
            .AsQueryable();

        if (status.HasValue)
            query = query.Where(c => c.Status == status.Value);

        var commissions = await query
            .OrderByDescending(c => c.EarnedAt)
            .Select(c => new CommissionDto
            {
                Id = c.Id,
                ReferralId = c.ReferralId,
                ReferrerInvestorId = c.ReferrerInvestorId,
                ReferrerName = $"{c.ReferrerInvestor.FirstName} {c.ReferrerInvestor.LastName}",
                Amount = c.Amount,
                Currency = c.Currency,
                EarnedAt = c.EarnedAt,
                PaidAt = c.PaidAt,
                Status = c.Status.ToString(),
                Description = c.Description,
                TransactionReference = c.TransactionReference
            })
            .ToListAsync();

        return Ok(commissions);
    }

    /// <summary>
    /// Update commission status (Admin only)
    /// </summary>
    [HttpPut("commissions/{commissionId}/status")]
    [Authorize(Roles = "Administrator,ComplianceOfficer")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateCommissionStatus(
        Guid commissionId,
        [FromBody] UpdateCommissionStatusDto dto)
    {
        var commission = await _context.ReferralCommissions.FindAsync(commissionId);

        if (commission == null)
            return NotFound(new { error = "Commission not found" });

        commission.Status = dto.Status;

        if (dto.Status == CommissionStatus.Paid)
        {
            commission.PaidAt = DateTime.UtcNow;
            commission.TransactionReference = dto.TransactionReference;
        }

        await _context.SaveChangesAsync();

        _logger.LogInformation("Commission {CommissionId} status updated to {Status}",
            commissionId, dto.Status);

        return Ok(new { message = "Commission status updated successfully" });
    }

    /// <summary>
    /// Get all referrals (Admin only)
    /// </summary>
    [HttpGet("all")]
    [Authorize(Roles = "Administrator,ComplianceOfficer")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<ReferralDto>>> GetAllReferrals(
        [FromQuery] ReferralStatus? status = null)
    {
        var query = _context.Referrals
            .Include(r => r.ReferrerInvestor)
            .Include(r => r.ReferredInvestor)
            .AsQueryable();

        if (status.HasValue)
            query = query.Where(r => r.Status == status.Value);

        var referrals = await query
            .OrderByDescending(r => r.ReferredAt)
            .Select(r => new ReferralDto
            {
                Id = r.Id,
                ReferrerInvestorId = r.ReferrerInvestorId,
                ReferrerName = $"{r.ReferrerInvestor.FirstName} {r.ReferrerInvestor.LastName}",
                ReferrerEmail = r.ReferrerInvestor.Email,
                ReferredInvestorId = r.ReferredInvestorId,
                ReferredName = $"{r.ReferredInvestor.FirstName} {r.ReferredInvestor.LastName}",
                ReferredEmail = r.ReferredInvestor.Email,
                ReferralCode = r.ReferralCode,
                ReferredAt = r.ReferredAt,
                ConvertedAt = r.ConvertedAt,
                Status = r.Status.ToString(),
                CommissionEarned = r.CommissionEarned,
                CommissionRate = r.CommissionRate
            })
            .ToListAsync();

        return Ok(referrals);
    }

    private Guid GetCurrentInvestorId()
    {
        var userIdClaim = User.FindFirstValue("investor_id");
        return Guid.Parse(userIdClaim!);
    }
}

