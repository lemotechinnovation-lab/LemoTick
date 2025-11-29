using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using InvestorManagementSystem.Infrastructure.Data;
using InvestorManagementSystem.Application.DTOs;
using InvestorManagementSystem.Core.Entities;

namespace InvestorManagementSystem.API.Controllers;

/// <summary>
/// Controller for managing investor preferences and settings
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PreferencesController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<PreferencesController> _logger;

    public PreferencesController(
        ApplicationDbContext context,
        ILogger<PreferencesController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Get investor preferences
    /// </summary>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetPreferences([FromQuery] Guid? investorId)
    {
        var targetInvestorId = investorId ?? GetCurrentInvestorId();

        var preferences = await _context.InvestorPreferences
            .Where(p => p.InvestorId == targetInvestorId)
            .Select(p => new InvestorPreferencesDto
            {
                Id = p.Id,
                InvestorId = p.InvestorId,
                EmailNotifications = p.EmailNotifications,
                TradeNotifications = p.TradeNotifications,
                RiskAlerts = p.RiskAlerts,
                MonthlyStatements = p.MonthlyStatements,
                QuarterlyReports = p.QuarterlyReports,
                MarketingEmails = p.MarketingEmails,
                SecurityAlerts = p.SecurityAlerts,
                StatementDelivery = p.StatementDelivery,
                StatementDay = p.StatementDay,
                Currency = p.Currency,
                Language = p.Language,
                Timezone = p.Timezone,
                DateFormat = p.DateFormat,
                RiskTolerance = p.RiskTolerance,
                AutoRebalancing = p.AutoRebalancing,
                RiskAlertThreshold = p.RiskAlertThreshold,
                AutomatedTrading = p.AutomatedTrading,
                MaxDailyLossLimit = p.MaxDailyLossLimit,
                AutoStopLoss = p.AutoStopLoss,
                CreatedAt = p.CreatedAt,
                UpdatedAt = p.UpdatedAt
            })
            .FirstOrDefaultAsync();

        if (preferences == null)
        {
            // If no preferences exist, create default preferences
            var defaultPreferences = await CreateDefaultPreferencesAsync(targetInvestorId);
            return Ok(defaultPreferences);
        }

        return Ok(preferences);
    }

    /// <summary>
    /// Update investor preferences (full update)
    /// </summary>
    [HttpPut]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdatePreferences([FromBody] UpdateInvestorPreferencesDto dto)
    {
        var investorId = GetCurrentInvestorId();

        var preferences = await _context.InvestorPreferences
            .FirstOrDefaultAsync(p => p.InvestorId == investorId);

        if (preferences == null)
        {
            return NotFound(new { error = "Preferences not found. Creating default preferences." });
        }

        // Update all fields that are provided
        if (dto.EmailNotifications.HasValue)
            preferences.EmailNotifications = dto.EmailNotifications.Value;

        if (dto.TradeNotifications.HasValue)
            preferences.TradeNotifications = dto.TradeNotifications.Value;

        if (dto.RiskAlerts.HasValue)
            preferences.RiskAlerts = dto.RiskAlerts.Value;

        if (dto.MonthlyStatements.HasValue)
            preferences.MonthlyStatements = dto.MonthlyStatements.Value;

        if (dto.QuarterlyReports.HasValue)
            preferences.QuarterlyReports = dto.QuarterlyReports.Value;

        if (dto.MarketingEmails.HasValue)
            preferences.MarketingEmails = dto.MarketingEmails.Value;

        if (dto.SecurityAlerts.HasValue)
            preferences.SecurityAlerts = dto.SecurityAlerts.Value;

        if (dto.StatementDelivery.HasValue)
            preferences.StatementDelivery = dto.StatementDelivery.Value;

        if (dto.StatementDay.HasValue)
            preferences.StatementDay = dto.StatementDay.Value;

        if (!string.IsNullOrWhiteSpace(dto.Currency))
            preferences.Currency = dto.Currency;

        if (!string.IsNullOrWhiteSpace(dto.Language))
            preferences.Language = dto.Language;

        if (!string.IsNullOrWhiteSpace(dto.Timezone))
            preferences.Timezone = dto.Timezone;

        if (!string.IsNullOrWhiteSpace(dto.DateFormat))
            preferences.DateFormat = dto.DateFormat;

        if (dto.RiskTolerance.HasValue)
            preferences.RiskTolerance = dto.RiskTolerance.Value;

        if (dto.AutoRebalancing.HasValue)
            preferences.AutoRebalancing = dto.AutoRebalancing.Value;

        if (dto.RiskAlertThreshold.HasValue)
            preferences.RiskAlertThreshold = dto.RiskAlertThreshold.Value;

        if (dto.AutomatedTrading.HasValue)
            preferences.AutomatedTrading = dto.AutomatedTrading.Value;

        if (dto.MaxDailyLossLimit.HasValue)
            preferences.MaxDailyLossLimit = dto.MaxDailyLossLimit.Value;

        if (dto.AutoStopLoss.HasValue)
            preferences.AutoStopLoss = dto.AutoStopLoss.Value;

        preferences.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Preferences updated for investor {InvestorId}", investorId);

        return Ok(new { message = "Preferences updated successfully" });
    }

    /// <summary>
    /// Update notification preferences only
    /// </summary>
    [HttpPut("notifications")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> UpdateNotificationPreferences([FromBody] UpdateNotificationPreferencesDto dto)
    {
        var investorId = GetCurrentInvestorId();
        var preferences = await GetOrCreatePreferencesAsync(investorId);

        if (dto.EmailNotifications.HasValue)
            preferences.EmailNotifications = dto.EmailNotifications.Value;

        if (dto.TradeNotifications.HasValue)
            preferences.TradeNotifications = dto.TradeNotifications.Value;

        if (dto.RiskAlerts.HasValue)
            preferences.RiskAlerts = dto.RiskAlerts.Value;

        if (dto.MonthlyStatements.HasValue)
            preferences.MonthlyStatements = dto.MonthlyStatements.Value;

        if (dto.QuarterlyReports.HasValue)
            preferences.QuarterlyReports = dto.QuarterlyReports.Value;

        if (dto.MarketingEmails.HasValue)
            preferences.MarketingEmails = dto.MarketingEmails.Value;

        if (dto.SecurityAlerts.HasValue)
            preferences.SecurityAlerts = dto.SecurityAlerts.Value;

        preferences.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        _logger.LogInformation("Notification preferences updated for investor {InvestorId}", investorId);

        return Ok(new { message = "Notification preferences updated successfully" });
    }

    /// <summary>
    /// Update statement preferences only
    /// </summary>
    [HttpPut("statements")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> UpdateStatementPreferences([FromBody] StatementPreferencesDto dto)
    {
        var investorId = GetCurrentInvestorId();
        var preferences = await GetOrCreatePreferencesAsync(investorId);

        if (dto.StatementDelivery.HasValue)
            preferences.StatementDelivery = dto.StatementDelivery.Value;

        if (dto.StatementDay.HasValue)
            preferences.StatementDay = dto.StatementDay.Value;

        preferences.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        _logger.LogInformation("Statement preferences updated for investor {InvestorId}", investorId);

        return Ok(new { message = "Statement preferences updated successfully" });
    }

    /// <summary>
    /// Update risk preferences only
    /// </summary>
    [HttpPut("risk")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> UpdateRiskPreferences([FromBody] RiskPreferencesDto dto)
    {
        var investorId = GetCurrentInvestorId();
        var preferences = await GetOrCreatePreferencesAsync(investorId);

        if (dto.RiskTolerance.HasValue)
            preferences.RiskTolerance = dto.RiskTolerance.Value;

        if (dto.AutoRebalancing.HasValue)
            preferences.AutoRebalancing = dto.AutoRebalancing.Value;

        if (dto.RiskAlertThreshold.HasValue)
            preferences.RiskAlertThreshold = dto.RiskAlertThreshold.Value;

        preferences.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        _logger.LogInformation("Risk preferences updated for investor {InvestorId}", investorId);

        return Ok(new { message = "Risk preferences updated successfully" });
    }

    /// <summary>
    /// Update trading preferences only
    /// </summary>
    [HttpPut("trading")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> UpdateTradingPreferences([FromBody] TradingPreferencesDto dto)
    {
        var investorId = GetCurrentInvestorId();
        var preferences = await GetOrCreatePreferencesAsync(investorId);

        if (dto.AutomatedTrading.HasValue)
            preferences.AutomatedTrading = dto.AutomatedTrading.Value;

        if (dto.MaxDailyLossLimit.HasValue)
            preferences.MaxDailyLossLimit = dto.MaxDailyLossLimit.Value;

        if (dto.AutoStopLoss.HasValue)
            preferences.AutoStopLoss = dto.AutoStopLoss.Value;

        preferences.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        _logger.LogInformation("Trading preferences updated for investor {InvestorId}", investorId);

        return Ok(new { message = "Trading preferences updated successfully" });
    }

    /// <summary>
    /// Reset preferences to default values
    /// </summary>
    [HttpPost("reset")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> ResetPreferences()
    {
        var investorId = GetCurrentInvestorId();

        var preferences = await _context.InvestorPreferences
            .FirstOrDefaultAsync(p => p.InvestorId == investorId);

        if (preferences != null)
        {
            _context.InvestorPreferences.Remove(preferences);
        }

        var defaultPreferences = await CreateDefaultPreferencesAsync(investorId);

        _logger.LogInformation("Preferences reset to defaults for investor {InvestorId}", investorId);

        return Ok(defaultPreferences);
    }

    // Private helper methods

    private async Task<InvestorPreferences> GetOrCreatePreferencesAsync(Guid investorId)
    {
        var preferences = await _context.InvestorPreferences
            .FirstOrDefaultAsync(p => p.InvestorId == investorId);

        if (preferences == null)
        {
            preferences = new InvestorPreferences
            {
                Id = Guid.NewGuid(),
                InvestorId = investorId,
                CreatedAt = DateTime.UtcNow
            };

            _context.InvestorPreferences.Add(preferences);
            await _context.SaveChangesAsync();
        }

        return preferences;
    }

    private async Task<InvestorPreferencesDto> CreateDefaultPreferencesAsync(Guid investorId)
    {
        var preferences = new InvestorPreferences
        {
            Id = Guid.NewGuid(),
            InvestorId = investorId,
            CreatedAt = DateTime.UtcNow
        };

        _context.InvestorPreferences.Add(preferences);
        await _context.SaveChangesAsync();

        return new InvestorPreferencesDto
        {
            Id = preferences.Id,
            InvestorId = preferences.InvestorId,
            EmailNotifications = preferences.EmailNotifications,
            TradeNotifications = preferences.TradeNotifications,
            RiskAlerts = preferences.RiskAlerts,
            MonthlyStatements = preferences.MonthlyStatements,
            QuarterlyReports = preferences.QuarterlyReports,
            MarketingEmails = preferences.MarketingEmails,
            SecurityAlerts = preferences.SecurityAlerts,
            StatementDelivery = preferences.StatementDelivery,
            StatementDay = preferences.StatementDay,
            Currency = preferences.Currency,
            Language = preferences.Language,
            Timezone = preferences.Timezone,
            DateFormat = preferences.DateFormat,
            RiskTolerance = preferences.RiskTolerance,
            AutoRebalancing = preferences.AutoRebalancing,
            RiskAlertThreshold = preferences.RiskAlertThreshold,
            AutomatedTrading = preferences.AutomatedTrading,
            MaxDailyLossLimit = preferences.MaxDailyLossLimit,
            AutoStopLoss = preferences.AutoStopLoss,
            CreatedAt = preferences.CreatedAt,
            UpdatedAt = preferences.UpdatedAt
        };
    }

    private Guid GetCurrentInvestorId()
    {
        var userIdClaim = User.FindFirst("userId")?.Value;
        return Guid.TryParse(userIdClaim, out var userId) ? userId : Guid.Empty;
    }
}

