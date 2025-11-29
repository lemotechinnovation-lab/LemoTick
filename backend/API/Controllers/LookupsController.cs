using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using InvestorManagementSystem.Infrastructure.Data;
using InvestorManagementSystem.Core.Entities;

namespace InvestorManagementSystem.API.Controllers;

/// <summary>
/// Controller for accessing lookup tables (reference data)
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class LookupsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<LookupsController> _logger;

    public LookupsController(ApplicationDbContext context, ILogger<LookupsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Get all active lookup values for all lookup types
    /// </summary>
    [HttpGet("all")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllLookups()
    {
        var lookups = new
        {
            InvestorStatuses = await _context.InvestorStatusLookup
                .Where(l => l.IsActive)
                .OrderBy(l => l.DisplayOrder)
                .Select(l => new { l.Id, l.Name, l.Description })
                .ToListAsync(),

            UserRoles = await _context.UserRoleLookup
                .Where(l => l.IsActive)
                .OrderBy(l => l.DisplayOrder)
                .Select(l => new { l.Id, l.Name, l.Description })
                .ToListAsync(),

            PortfolioStatuses = await _context.PortfolioStatusLookup
                .Where(l => l.IsActive)
                .OrderBy(l => l.DisplayOrder)
                .Select(l => new { l.Id, l.Name, l.Description })
                .ToListAsync(),

            RiskLevels = await _context.RiskLevelLookup
                .Where(l => l.IsActive)
                .OrderBy(l => l.DisplayOrder)
                .Select(l => new { l.Id, l.Name, l.Description })
                .ToListAsync(),

            TradeTypes = await _context.TradeTypeLookup
                .Where(l => l.IsActive)
                .OrderBy(l => l.DisplayOrder)
                .Select(l => new { l.Id, l.Name, l.Description })
                .ToListAsync(),

            TradeDirections = await _context.TradeDirectionLookup
                .Where(l => l.IsActive)
                .OrderBy(l => l.DisplayOrder)
                .Select(l => new { l.Id, l.Name, l.Description })
                .ToListAsync(),

            TradeStatuses = await _context.TradeStatusLookup
                .Where(l => l.IsActive)
                .OrderBy(l => l.DisplayOrder)
                .Select(l => new { l.Id, l.Name, l.Description })
                .ToListAsync(),

            TransactionTypes = await _context.TransactionTypeLookup
                .Where(l => l.IsActive)
                .OrderBy(l => l.DisplayOrder)
                .Select(l => new { l.Id, l.Name, l.Description })
                .ToListAsync(),

            TransactionStatuses = await _context.TransactionStatusLookup
                .Where(l => l.IsActive)
                .OrderBy(l => l.DisplayOrder)
                .Select(l => new { l.Id, l.Name, l.Description })
                .ToListAsync(),

            NotificationTypes = await _context.NotificationTypeLookup
                .Where(l => l.IsActive)
                .OrderBy(l => l.DisplayOrder)
                .Select(l => new { l.Id, l.Name, l.Description })
                .ToListAsync(),

            NotificationPriorities = await _context.NotificationPriorityLookup
                .Where(l => l.IsActive)
                .OrderBy(l => l.DisplayOrder)
                .Select(l => new { l.Id, l.Name, l.Description })
                .ToListAsync(),

            DocumentTypes = await _context.DocumentTypeLookup
                .Where(l => l.IsActive)
                .OrderBy(l => l.DisplayOrder)
                .Select(l => new { l.Id, l.Name, l.Description })
                .ToListAsync(),

            DocumentStatuses = await _context.DocumentStatusLookup
                .Where(l => l.IsActive)
                .OrderBy(l => l.DisplayOrder)
                .Select(l => new { l.Id, l.Name, l.Description })
                .ToListAsync(),

            SARStatuses = await _context.SARStatusLookup
                .Where(l => l.IsActive)
                .OrderBy(l => l.DisplayOrder)
                .Select(l => new { l.Id, l.Name, l.Description })
                .ToListAsync(),

            FeeTypes = await _context.FeeTypeLookup
                .Where(l => l.IsActive)
                .OrderBy(l => l.DisplayOrder)
                .Select(l => new { l.Id, l.Name, l.Description })
                .ToListAsync(),

            FeeStatuses = await _context.FeeStatusLookup
                .Where(l => l.IsActive)
                .OrderBy(l => l.DisplayOrder)
                .Select(l => new { l.Id, l.Name, l.Description })
                .ToListAsync(),

            WithdrawalStatuses = await _context.WithdrawalStatusLookup
                .Where(l => l.IsActive)
                .OrderBy(l => l.DisplayOrder)
                .Select(l => new { l.Id, l.Name, l.Description })
                .ToListAsync(),

            ReferralStatuses = await _context.ReferralStatusLookup
                .Where(l => l.IsActive)
                .OrderBy(l => l.DisplayOrder)
                .Select(l => new { l.Id, l.Name, l.Description })
                .ToListAsync(),

            CommissionStatuses = await _context.CommissionStatusLookup
                .Where(l => l.IsActive)
                .OrderBy(l => l.DisplayOrder)
                .Select(l => new { l.Id, l.Name, l.Description })
                .ToListAsync(),

            PaymentTypes = await _context.PaymentTypeLookup
                .Where(l => l.IsActive)
                .OrderBy(l => l.DisplayOrder)
                .Select(l => new { l.Id, l.Name, l.Description })
                .ToListAsync(),

            PaymentMethods = await _context.PaymentMethodLookup
                .Where(l => l.IsActive)
                .OrderBy(l => l.DisplayOrder)
                .Select(l => new { l.Id, l.Name, l.Description })
                .ToListAsync(),

            PaymentStatuses = await _context.PaymentStatusLookup
                .Where(l => l.IsActive)
                .OrderBy(l => l.DisplayOrder)
                .Select(l => new { l.Id, l.Name, l.Description })
                .ToListAsync(),

            BankAccountTypes = await _context.BankAccountTypeLookup
                .Where(l => l.IsActive)
                .OrderBy(l => l.DisplayOrder)
                .Select(l => new { l.Id, l.Name, l.Description })
                .ToListAsync(),

            BankAccountStatuses = await _context.BankAccountStatusLookup
                .Where(l => l.IsActive)
                .OrderBy(l => l.DisplayOrder)
                .Select(l => new { l.Id, l.Name, l.Description })
                .ToListAsync(),

            StatementDeliveryMethods = await _context.StatementDeliveryMethodLookup
                .Where(l => l.IsActive)
                .OrderBy(l => l.DisplayOrder)
                .Select(l => new { l.Id, l.Name, l.Description })
                .ToListAsync(),

            RiskTolerances = await _context.RiskToleranceLookup
                .Where(l => l.IsActive)
                .OrderBy(l => l.DisplayOrder)
                .Select(l => new { l.Id, l.Name, l.Description })
                .ToListAsync()
        };

        return Ok(lookups);
    }

    // ==================== INDIVIDUAL LOOKUP ENDPOINTS ====================

    [HttpGet("investor-statuses")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetInvestorStatuses()
    {
        var data = await _context.InvestorStatusLookup
            .Where(l => l.IsActive)
            .OrderBy(l => l.DisplayOrder)
            .ToListAsync();
        return Ok(data);
    }

    [HttpGet("user-roles")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetUserRoles()
    {
        var data = await _context.UserRoleLookup
            .Where(l => l.IsActive)
            .OrderBy(l => l.DisplayOrder)
            .ToListAsync();
        return Ok(data);
    }

    [HttpGet("portfolio-statuses")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPortfolioStatuses()
    {
        var data = await _context.PortfolioStatusLookup
            .Where(l => l.IsActive)
            .OrderBy(l => l.DisplayOrder)
            .ToListAsync();
        return Ok(data);
    }

    [HttpGet("risk-levels")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetRiskLevels()
    {
        var data = await _context.RiskLevelLookup
            .Where(l => l.IsActive)
            .OrderBy(l => l.DisplayOrder)
            .ToListAsync();
        return Ok(data);
    }

    [HttpGet("trade-types")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetTradeTypes()
    {
        var data = await _context.TradeTypeLookup
            .Where(l => l.IsActive)
            .OrderBy(l => l.DisplayOrder)
            .ToListAsync();
        return Ok(data);
    }

    [HttpGet("trade-directions")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetTradeDirections()
    {
        var data = await _context.TradeDirectionLookup
            .Where(l => l.IsActive)
            .OrderBy(l => l.DisplayOrder)
            .ToListAsync();
        return Ok(data);
    }

    [HttpGet("trade-statuses")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetTradeStatuses()
    {
        var data = await _context.TradeStatusLookup
            .Where(l => l.IsActive)
            .OrderBy(l => l.DisplayOrder)
            .ToListAsync();
        return Ok(data);
    }

    [HttpGet("transaction-types")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetTransactionTypes()
    {
        var data = await _context.TransactionTypeLookup
            .Where(l => l.IsActive)
            .OrderBy(l => l.DisplayOrder)
            .ToListAsync();
        return Ok(data);
    }

    [HttpGet("transaction-statuses")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetTransactionStatuses()
    {
        var data = await _context.TransactionStatusLookup
            .Where(l => l.IsActive)
            .OrderBy(l => l.DisplayOrder)
            .ToListAsync();
        return Ok(data);
    }

    [HttpGet("notification-types")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetNotificationTypes()
    {
        var data = await _context.NotificationTypeLookup
            .Where(l => l.IsActive)
            .OrderBy(l => l.DisplayOrder)
            .ToListAsync();
        return Ok(data);
    }

    [HttpGet("notification-priorities")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetNotificationPriorities()
    {
        var data = await _context.NotificationPriorityLookup
            .Where(l => l.IsActive)
            .OrderBy(l => l.DisplayOrder)
            .ToListAsync();
        return Ok(data);
    }

    [HttpGet("document-types")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetDocumentTypes()
    {
        var data = await _context.DocumentTypeLookup
            .Where(l => l.IsActive)
            .OrderBy(l => l.DisplayOrder)
            .ToListAsync();
        return Ok(data);
    }

    [HttpGet("document-statuses")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetDocumentStatuses()
    {
        var data = await _context.DocumentStatusLookup
            .Where(l => l.IsActive)
            .OrderBy(l => l.DisplayOrder)
            .ToListAsync();
        return Ok(data);
    }

    [HttpGet("sar-statuses")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSARStatuses()
    {
        var data = await _context.SARStatusLookup
            .Where(l => l.IsActive)
            .OrderBy(l => l.DisplayOrder)
            .ToListAsync();
        return Ok(data);
    }

    [HttpGet("fee-types")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetFeeTypes()
    {
        var data = await _context.FeeTypeLookup
            .Where(l => l.IsActive)
            .OrderBy(l => l.DisplayOrder)
            .ToListAsync();
        return Ok(data);
    }

    [HttpGet("fee-statuses")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetFeeStatuses()
    {
        var data = await _context.FeeStatusLookup
            .Where(l => l.IsActive)
            .OrderBy(l => l.DisplayOrder)
            .ToListAsync();
        return Ok(data);
    }

    [HttpGet("withdrawal-statuses")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetWithdrawalStatuses()
    {
        var data = await _context.WithdrawalStatusLookup
            .Where(l => l.IsActive)
            .OrderBy(l => l.DisplayOrder)
            .ToListAsync();
        return Ok(data);
    }

    [HttpGet("referral-statuses")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetReferralStatuses()
    {
        var data = await _context.ReferralStatusLookup
            .Where(l => l.IsActive)
            .OrderBy(l => l.DisplayOrder)
            .ToListAsync();
        return Ok(data);
    }

    [HttpGet("commission-statuses")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCommissionStatuses()
    {
        var data = await _context.CommissionStatusLookup
            .Where(l => l.IsActive)
            .OrderBy(l => l.DisplayOrder)
            .ToListAsync();
        return Ok(data);
    }

    [HttpGet("payment-types")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPaymentTypes()
    {
        var data = await _context.PaymentTypeLookup
            .Where(l => l.IsActive)
            .OrderBy(l => l.DisplayOrder)
            .ToListAsync();
        return Ok(data);
    }

    [HttpGet("payment-methods")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPaymentMethods()
    {
        var data = await _context.PaymentMethodLookup
            .Where(l => l.IsActive)
            .OrderBy(l => l.DisplayOrder)
            .ToListAsync();
        return Ok(data);
    }

    [HttpGet("payment-statuses")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPaymentStatuses()
    {
        var data = await _context.PaymentStatusLookup
            .Where(l => l.IsActive)
            .OrderBy(l => l.DisplayOrder)
            .ToListAsync();
        return Ok(data);
    }

    [HttpGet("bank-account-types")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetBankAccountTypes()
    {
        var data = await _context.BankAccountTypeLookup
            .Where(l => l.IsActive)
            .OrderBy(l => l.DisplayOrder)
            .ToListAsync();
        return Ok(data);
    }

    [HttpGet("bank-account-statuses")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetBankAccountStatuses()
    {
        var data = await _context.BankAccountStatusLookup
            .Where(l => l.IsActive)
            .OrderBy(l => l.DisplayOrder)
            .ToListAsync();
        return Ok(data);
    }

    [HttpGet("statement-delivery-methods")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetStatementDeliveryMethods()
    {
        var data = await _context.StatementDeliveryMethodLookup
            .Where(l => l.IsActive)
            .OrderBy(l => l.DisplayOrder)
            .ToListAsync();
        return Ok(data);
    }

    [HttpGet("risk-tolerances")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetRiskTolerances()
    {
        var data = await _context.RiskToleranceLookup
            .Where(l => l.IsActive)
            .OrderBy(l => l.DisplayOrder)
            .ToListAsync();
        return Ok(data);
    }
}

