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
/// Controller for managing payments via PayFast
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class PaymentsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly PayFastService _payFastService;
    private readonly ILogger<PaymentsController> _logger;

    public PaymentsController(
        ApplicationDbContext context,
        PayFastService payFastService,
        ILogger<PaymentsController> logger)
    {
        _context = context;
        _payFastService = payFastService;
        _logger = logger;
    }

    /// <summary>
    /// Initiate a payment (create payment and get PayFast form data)
    /// </summary>
    [HttpPost("initiate")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<PayFastPaymentResponseDto>> InitiatePayment([FromBody] CreatePaymentDto dto)
    {
        try
        {
            var investorId = GetCurrentInvestorId();

            // Validate amount
            if (dto.Amount < 5m)
                return BadRequest(new { error = "Minimum deposit amount is R5" });

            // Build URLs
            var baseUrl = $"{Request.Scheme}://{Request.Host}";
            var returnUrl = dto.ReturnUrl ?? $"{baseUrl}/payments/success";
            var cancelUrl = dto.CancelUrl ?? $"{baseUrl}/payments/cancel";
            var notifyUrl = dto.NotifyUrl ?? $"{baseUrl}/api/payments/webhook";

            var description = dto.Description ?? $"Deposit of R{dto.Amount:N2}";

            // Create payment and get PayFast data
            var (payment, paymentData) = await _payFastService.CreatePaymentAsync(
                investorId,
                dto.Amount,
                description,
                returnUrl,
                cancelUrl,
                notifyUrl
            );

            var response = new PayFastPaymentResponseDto
            {
                PaymentId = payment.Id,
                PayFastUrl = _payFastService.GetPayFastUrl(),
                PaymentData = paymentData
            };

            _logger.LogInformation("Payment {PaymentId} initiated for investor {InvestorId}. Amount: R{Amount}",
                payment.Id, investorId, dto.Amount);

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error initiating payment");
            return StatusCode(500, new { error = "Failed to initiate payment" });
        }
    }

    /// <summary>
    /// PayFast webhook endpoint (ITN - Instant Transaction Notification)
    /// </summary>
    [HttpPost("webhook")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> PayFastWebhook()
    {
        try
        {
            // Read POST data
            var postData = new Dictionary<string, string>();
            foreach (var key in Request.Form.Keys)
            {
                postData[key] = Request.Form[key].ToString();
            }

            _logger.LogInformation("PayFast webhook received. Data: {Data}",
                string.Join(", ", postData.Select(kv => $"{kv.Key}={kv.Value}")));

            // Validate webhook
            if (!await _payFastService.ValidateWebhookAsync(postData))
            {
                _logger.LogWarning("PayFast webhook validation failed");
                return BadRequest("Invalid webhook");
            }

            // Process webhook
            var success = await _payFastService.ProcessWebhookAsync(postData);

            if (success)
            {
                _logger.LogInformation("PayFast webhook processed successfully");
                return Ok();
            }

            _logger.LogWarning("PayFast webhook processing failed");
            return BadRequest("Webhook processing failed");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing PayFast webhook");
            return StatusCode(500, "Webhook processing error");
        }
    }

    /// <summary>
    /// Get payment by ID
    /// </summary>
    [HttpGet("{paymentId}")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<PaymentDto>> GetPayment(Guid paymentId)
    {
        var payment = await _payFastService.GetPaymentAsync(paymentId);

        if (payment == null)
            return NotFound(new { error = "Payment not found" });

        // Check authorization
        var investorId = GetCurrentInvestorId();
        var userRole = User.FindFirstValue(ClaimTypes.Role);

        if (payment.InvestorId != investorId && userRole != "Administrator" && userRole != "ComplianceOfficer")
            return Forbid();

        var dto = new PaymentDto
        {
            Id = payment.Id,
            InvestorId = payment.InvestorId,
            InvestorName = $"{payment.Investor.FirstName} {payment.Investor.LastName}",
            Type = payment.Type.ToString(),
            Method = payment.Method.ToString(),
            Amount = payment.Amount,
            Currency = payment.Currency,
            Status = payment.Status.ToString(),
            CreatedAt = payment.CreatedAt,
            CompletedAt = payment.CompletedAt,
            PaymentGateway = payment.PaymentGateway,
            PaymentGatewayId = payment.PaymentGatewayId,
            Description = payment.Description,
            FailureReason = payment.FailureReason
        };

        return Ok(dto);
    }

    /// <summary>
    /// Get payment history for current investor
    /// </summary>
    [HttpGet("my-payments")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<PaymentDto>>> GetMyPayments(
        [FromQuery] PaymentStatus? status = null)
    {
        var investorId = GetCurrentInvestorId();

        var query = _context.Payments
            .Where(p => p.InvestorId == investorId)
            .Include(p => p.Investor)
            .AsQueryable();

        if (status.HasValue)
            query = query.Where(p => p.Status == status.Value);

        var payments = await query
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => new PaymentDto
            {
                Id = p.Id,
                InvestorId = p.InvestorId,
                InvestorName = $"{p.Investor.FirstName} {p.Investor.LastName}",
                Type = p.Type.ToString(),
                Method = p.Method.ToString(),
                Amount = p.Amount,
                Currency = p.Currency,
                Status = p.Status.ToString(),
                CreatedAt = p.CreatedAt,
                CompletedAt = p.CompletedAt,
                PaymentGateway = p.PaymentGateway,
                PaymentGatewayId = p.PaymentGatewayId,
                Description = p.Description,
                FailureReason = p.FailureReason
            })
            .ToListAsync();

        return Ok(payments);
    }

    /// <summary>
    /// Get all payments (Admin only)
    /// </summary>
    [HttpGet("all")]
    [Authorize(Roles = "Administrator,ComplianceOfficer")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<PaymentDto>>> GetAllPayments(
        [FromQuery] PaymentStatus? status = null,
        [FromQuery] Guid? investorId = null)
    {
        var query = _context.Payments
            .Include(p => p.Investor)
            .AsQueryable();

        if (status.HasValue)
            query = query.Where(p => p.Status == status.Value);

        if (investorId.HasValue)
            query = query.Where(p => p.InvestorId == investorId.Value);

        var payments = await query
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => new PaymentDto
            {
                Id = p.Id,
                InvestorId = p.InvestorId,
                InvestorName = $"{p.Investor.FirstName} {p.Investor.LastName}",
                Type = p.Type.ToString(),
                Method = p.Method.ToString(),
                Amount = p.Amount,
                Currency = p.Currency,
                Status = p.Status.ToString(),
                CreatedAt = p.CreatedAt,
                CompletedAt = p.CompletedAt,
                PaymentGateway = p.PaymentGateway,
                PaymentGatewayId = p.PaymentGatewayId,
                Description = p.Description,
                FailureReason = p.FailureReason
            })
            .ToListAsync();

        return Ok(payments);
    }

    /// <summary>
    /// Get payment statistics
    /// </summary>
    [HttpGet("statistics")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<PaymentStatisticsDto>> GetStatistics()
    {
        var investorId = GetCurrentInvestorId();
        var userRole = User.FindFirstValue(ClaimTypes.Role);

        // Admin can see all statistics, investors only their own
        Guid? filterInvestorId = (userRole == "Administrator" || userRole == "ComplianceOfficer")
            ? null
            : investorId;

        var (total, completed, failed, pending, totalAmount, completedAmount) =
            await _payFastService.GetPaymentStatisticsAsync(filterInvestorId);

        var payments = await _context.Payments
            .Where(p => !filterInvestorId.HasValue || p.InvestorId == filterInvestorId.Value)
            .ToListAsync();

        var paymentsByMethod = payments
            .GroupBy(p => p.Method.ToString())
            .ToDictionary(g => g.Key, g => g.Count());

        var amountByMethod = payments
            .Where(p => p.Status == PaymentStatus.Completed)
            .GroupBy(p => p.Method.ToString())
            .ToDictionary(g => g.Key, g => g.Sum(p => p.Amount));

        var stats = new PaymentStatisticsDto
        {
            TotalPayments = total,
            CompletedPayments = completed,
            FailedPayments = failed,
            PendingPayments = pending,
            TotalAmount = totalAmount,
            CompletedAmount = completedAmount,
            AverageAmount = completed > 0 ? completedAmount / completed : 0,
            PaymentsByMethod = paymentsByMethod,
            AmountByMethod = amountByMethod
        };

        return Ok(stats);
    }

    private Guid GetCurrentInvestorId()
    {
        var userIdClaim = User.FindFirstValue("investor_id");
        return Guid.Parse(userIdClaim!);
    }
}

