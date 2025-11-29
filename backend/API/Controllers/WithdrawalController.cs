using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using InvestorManagementSystem.Infrastructure.Data;
using InvestorManagementSystem.Core.Entities;
using InvestorManagementSystem.Application.DTOs;
using InvestorManagementSystem.Application.Services;
using System.Security.Claims;

namespace InvestorManagementSystem.API.Controllers;

/// <summary>
/// Controller for managing withdrawal requests
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class WithdrawalController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IEmailNotificationService _emailService;
    private readonly ILogger<WithdrawalController> _logger;
    private const decimal AUTO_APPROVE_LIMIT = 1000.00m; // Auto-approve withdrawals under R1,000

    public WithdrawalController(
        ApplicationDbContext context,
        IEmailNotificationService emailService,
        ILogger<WithdrawalController> logger)
    {
        _context = context;
        _emailService = emailService;
        _logger = logger;
    }

    /// <summary>
    /// Create a new withdrawal request
    /// </summary>
    [HttpPost("request")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> CreateWithdrawalRequest([FromBody] CreateWithdrawalRequestDto dto)
    {
        var userEmail = User.FindFirstValue(ClaimTypes.Email);
        var userId = User.FindFirstValue("investor_id");

        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var investorId = Guid.Parse(userId);
        var investor = await _context.Investors.FindAsync(investorId);

        if (investor == null)
            return NotFound(new { error = "Investor not found" });

        // Create withdrawal request
        var withdrawal = new WithdrawalRequest
        {
            Id = Guid.NewGuid(),
            InvestorId = investorId,
            Amount = dto.Amount,
            Currency = dto.Currency,
            Status = dto.Amount < AUTO_APPROVE_LIMIT ? WithdrawalStatus.Approved : WithdrawalStatus.Pending,
            RequestedAt = DateTime.UtcNow,
            BankAccountNumber = dto.BankAccountNumber,
            BankName = dto.BankName,
            AccountHolderName = dto.AccountHolderName,
            BranchCode = dto.BranchCode,
            Notes = dto.Notes
        };

        // Auto-approve small withdrawals
        if (withdrawal.Status == WithdrawalStatus.Approved)
        {
            withdrawal.ApprovedAt = DateTime.UtcNow;
            withdrawal.ApprovedBy = investorId; // System auto-approval
        }

        _context.WithdrawalRequests.Add(withdrawal);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Withdrawal request created: {WithdrawalId} for investor {InvestorId}, Amount: {Amount}",
            withdrawal.Id, investorId, dto.Amount);

        // Send email notification
        try
        {
            if (withdrawal.Status == WithdrawalStatus.Approved)
            {
                await _emailService.SendWithdrawalApprovedEmailAsync(userEmail!, withdrawal.Amount);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send withdrawal notification email");
        }

        var response = MapToDto(withdrawal, investor);
        return CreatedAtAction(nameof(GetWithdrawal), new { id = withdrawal.Id }, response);
    }

    /// <summary>
    /// Get a specific withdrawal request
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<WithdrawalRequestDto>> GetWithdrawal(Guid id)
    {
        var withdrawal = await _context.WithdrawalRequests
            .Include(w => w.Investor)
            .FirstOrDefaultAsync(w => w.Id == id);

        if (withdrawal == null)
            return NotFound();

        // Check authorization - investor can only see their own, admin/compliance can see all
        var userId = User.FindFirstValue("investor_id");
        var userRole = User.FindFirstValue(ClaimTypes.Role);

        if (withdrawal.InvestorId.ToString() != userId &&
            userRole != "Administrator" &&
            userRole != "ComplianceOfficer")
        {
            return Forbid();
        }

        return Ok(MapToDto(withdrawal, withdrawal.Investor));
    }

    /// <summary>
    /// Get all withdrawal requests for an investor
    /// </summary>
    [HttpGet("investor/{investorId}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<WithdrawalRequestDto>>> GetInvestorWithdrawals(Guid investorId)
    {
        // Check authorization
        var userId = User.FindFirstValue("investor_id");
        var userRole = User.FindFirstValue(ClaimTypes.Role);

        if (investorId.ToString() != userId &&
            userRole != "Administrator" &&
            userRole != "ComplianceOfficer")
        {
            return Forbid();
        }

        var withdrawals = await _context.WithdrawalRequests
            .Include(w => w.Investor)
            .Where(w => w.InvestorId == investorId)
            .OrderByDescending(w => w.RequestedAt)
            .ToListAsync();

        var result = withdrawals.Select(w => MapToDto(w, w.Investor)).ToList();
        return Ok(result);
    }

    /// <summary>
    /// Get all pending withdrawal requests (Admin/Compliance only)
    /// </summary>
    [HttpGet("pending")]
    [Authorize(Roles = "Administrator,ComplianceOfficer")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<WithdrawalRequestDto>>> GetPendingWithdrawals()
    {
        var withdrawals = await _context.WithdrawalRequests
            .Include(w => w.Investor)
            .Where(w => w.Status == WithdrawalStatus.Pending || w.Status == WithdrawalStatus.UnderReview)
            .OrderByDescending(w => w.RequestedAt)
            .ToListAsync();

        var result = withdrawals.Select(w => MapToDto(w, w.Investor)).ToList();
        return Ok(result);
    }

    /// <summary>
    /// Approve a withdrawal request (Admin/Compliance only)
    /// </summary>
    [HttpPost("{id}/approve")]
    [Authorize(Roles = "Administrator,ComplianceOfficer")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ApproveWithdrawal(Guid id, [FromBody] ApproveWithdrawalDto dto)
    {
        var withdrawal = await _context.WithdrawalRequests
            .Include(w => w.Investor)
            .FirstOrDefaultAsync(w => w.Id == id);

        if (withdrawal == null)
            return NotFound();

        if (withdrawal.Status != WithdrawalStatus.Pending && withdrawal.Status != WithdrawalStatus.UnderReview)
            return BadRequest(new { error = "Withdrawal is not in a state that can be approved" });

        var userId = User.FindFirstValue("investor_id");
        withdrawal.Status = WithdrawalStatus.Approved;
        withdrawal.ApprovedAt = DateTime.UtcNow;
        withdrawal.ApprovedBy = Guid.Parse(userId!);
        withdrawal.TransactionReference = dto.TransactionReference;

        if (!string.IsNullOrEmpty(dto.Notes))
            withdrawal.Notes = (withdrawal.Notes ?? "") + "\n" + dto.Notes;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Withdrawal approved: {WithdrawalId} by user {UserId}", id, userId);

        // Send email notification
        try
        {
            await _emailService.SendWithdrawalApprovedEmailAsync(
                withdrawal.Investor.Email,
                withdrawal.Amount);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send withdrawal approved email");
        }

        return Ok(new { message = "Withdrawal approved successfully", withdrawalId = id });
    }

    /// <summary>
    /// Reject a withdrawal request (Admin/Compliance only)
    /// </summary>
    [HttpPost("{id}/reject")]
    [Authorize(Roles = "Administrator,ComplianceOfficer")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RejectWithdrawal(Guid id, [FromBody] RejectWithdrawalDto dto)
    {
        var withdrawal = await _context.WithdrawalRequests
            .Include(w => w.Investor)
            .FirstOrDefaultAsync(w => w.Id == id);

        if (withdrawal == null)
            return NotFound();

        if (withdrawal.Status == WithdrawalStatus.Completed || withdrawal.Status == WithdrawalStatus.Rejected)
            return BadRequest(new { error = "Withdrawal cannot be rejected in its current state" });

        var userId = User.FindFirstValue("investor_id");
        withdrawal.Status = WithdrawalStatus.Rejected;
        withdrawal.RejectedAt = DateTime.UtcNow;
        withdrawal.RejectedBy = Guid.Parse(userId!);
        withdrawal.RejectionReason = dto.RejectionReason;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Withdrawal rejected: {WithdrawalId} by user {UserId}", id, userId);

        // Send email notification (you would create a dedicated method for this)
        try
        {
            await _emailService.SendCustomEmailAsync(
                withdrawal.Investor.Email,
                "Withdrawal Request Rejected",
                $@"<html><body>
                    <h2>Withdrawal Request Rejected</h2>
                    <p>Your withdrawal request for {withdrawal.Amount:C} has been rejected.</p>
                    <p><strong>Reason:</strong> {dto.RejectionReason}</p>
                    <p>Please contact support if you have any questions.</p>
                </body></html>"
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send withdrawal rejected email");
        }

        return Ok(new { message = "Withdrawal rejected", withdrawalId = id });
    }

    /// <summary>
    /// Cancel a withdrawal request (Investor only, before approval)
    /// </summary>
    [HttpPost("{id}/cancel")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> CancelWithdrawal(Guid id)
    {
        var withdrawal = await _context.WithdrawalRequests.FindAsync(id);

        if (withdrawal == null)
            return NotFound();

        var userId = User.FindFirstValue("investor_id");
        if (withdrawal.InvestorId.ToString() != userId)
            return Forbid();

        if (withdrawal.Status != WithdrawalStatus.Pending)
            return BadRequest(new { error = "Only pending withdrawals can be cancelled" });

        withdrawal.Status = WithdrawalStatus.Cancelled;
        await _context.SaveChangesAsync();

        _logger.LogInformation("Withdrawal cancelled: {WithdrawalId} by investor {UserId}", id, userId);

        return Ok(new { message = "Withdrawal cancelled successfully" });
    }

    /// <summary>
    /// Mark withdrawal as completed (Admin only, after bank processing)
    /// </summary>
    [HttpPost("{id}/complete")]
    [Authorize(Roles = "Administrator")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> CompleteWithdrawal(Guid id, [FromBody] ApproveWithdrawalDto dto)
    {
        var withdrawal = await _context.WithdrawalRequests.FindAsync(id);

        if (withdrawal == null)
            return NotFound();

        if (withdrawal.Status != WithdrawalStatus.Approved && withdrawal.Status != WithdrawalStatus.Processing)
            return BadRequest(new { error = "Withdrawal must be approved or processing to be completed" });

        withdrawal.Status = WithdrawalStatus.Completed;
        withdrawal.ProcessedAt = DateTime.UtcNow;

        if (!string.IsNullOrEmpty(dto.TransactionReference))
            withdrawal.TransactionReference = dto.TransactionReference;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Withdrawal completed: {WithdrawalId}", id);

        return Ok(new { message = "Withdrawal marked as completed", withdrawalId = id });
    }

    private static WithdrawalRequestDto MapToDto(WithdrawalRequest withdrawal, Investor investor)
    {
        return new WithdrawalRequestDto
        {
            Id = withdrawal.Id,
            InvestorId = withdrawal.InvestorId,
            InvestorName = $"{investor.FirstName} {investor.LastName}",
            InvestorEmail = investor.Email,
            Amount = withdrawal.Amount,
            Currency = withdrawal.Currency,
            Status = withdrawal.Status.ToString(),
            RequestedAt = withdrawal.RequestedAt,
            ApprovedAt = withdrawal.ApprovedAt,
            ApprovedBy = withdrawal.ApprovedBy,
            RejectedAt = withdrawal.RejectedAt,
            RejectedBy = withdrawal.RejectedBy,
            RejectionReason = withdrawal.RejectionReason,
            ProcessedAt = withdrawal.ProcessedAt,
            BankAccountNumber = withdrawal.BankAccountNumber,
            BankName = withdrawal.BankName,
            AccountHolderName = withdrawal.AccountHolderName,
            BranchCode = withdrawal.BranchCode,
            Notes = withdrawal.Notes,
            TransactionReference = withdrawal.TransactionReference
        };
    }
}

