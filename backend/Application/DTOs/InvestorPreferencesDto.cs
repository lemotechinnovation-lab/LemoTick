using System.ComponentModel.DataAnnotations;
using InvestorManagementSystem.Core.Entities;

namespace InvestorManagementSystem.Application.DTOs;

/// <summary>
/// DTO for displaying investor preferences
/// </summary>
public class InvestorPreferencesDto
{
    public Guid Id { get; set; }
    public Guid InvestorId { get; set; }

    // Communication Preferences
    public bool EmailNotifications { get; set; }
    public bool TradeNotifications { get; set; }
    public bool RiskAlerts { get; set; }
    public bool MonthlyStatements { get; set; }
    public bool QuarterlyReports { get; set; }
    public bool MarketingEmails { get; set; }
    public bool SecurityAlerts { get; set; }

    // Statement Preferences
    public StatementDeliveryMethod StatementDelivery { get; set; }
    public int StatementDay { get; set; }

    // Display Preferences
    public string Currency { get; set; } = "ZAR";
    public string Language { get; set; } = "en";
    public string Timezone { get; set; } = "Africa/Johannesburg";
    public string DateFormat { get; set; } = "yyyy-MM-dd";

    // Risk Preferences
    public RiskTolerance RiskTolerance { get; set; }
    public bool AutoRebalancing { get; set; }
    public decimal RiskAlertThreshold { get; set; }

    // Trading Preferences
    public bool AutomatedTrading { get; set; }
    public decimal MaxDailyLossLimit { get; set; }
    public bool AutoStopLoss { get; set; }

    // Metadata
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

/// <summary>
/// DTO for updating investor preferences
/// </summary>
public class UpdateInvestorPreferencesDto
{
    // Communication Preferences
    public bool? EmailNotifications { get; set; }
    public bool? TradeNotifications { get; set; }
    public bool? RiskAlerts { get; set; }
    public bool? MonthlyStatements { get; set; }
    public bool? QuarterlyReports { get; set; }
    public bool? MarketingEmails { get; set; }
    public bool? SecurityAlerts { get; set; }

    // Statement Preferences
    public StatementDeliveryMethod? StatementDelivery { get; set; }

    [Range(1, 28)]
    public int? StatementDay { get; set; }

    // Display Preferences
    [StringLength(3)]
    public string? Currency { get; set; }

    [StringLength(10)]
    public string? Language { get; set; }

    [StringLength(100)]
    public string? Timezone { get; set; }

    [StringLength(50)]
    public string? DateFormat { get; set; }

    // Risk Preferences
    public RiskTolerance? RiskTolerance { get; set; }
    public bool? AutoRebalancing { get; set; }

    [Range(0, 100)]
    public decimal? RiskAlertThreshold { get; set; }

    // Trading Preferences
    public bool? AutomatedTrading { get; set; }

    [Range(0, 100)]
    public decimal? MaxDailyLossLimit { get; set; }

    public bool? AutoStopLoss { get; set; }
}

/// <summary>
/// DTO for updating notification preferences only
/// </summary>
public class UpdateNotificationPreferencesDto
{
    public bool? EmailNotifications { get; set; }
    public bool? TradeNotifications { get; set; }
    public bool? RiskAlerts { get; set; }
    public bool? MonthlyStatements { get; set; }
    public bool? QuarterlyReports { get; set; }
    public bool? MarketingEmails { get; set; }
    public bool? SecurityAlerts { get; set; }
}

/// <summary>
/// DTO for updating statement preferences only
/// </summary>
public class StatementPreferencesDto
{
    public StatementDeliveryMethod? StatementDelivery { get; set; }

    [Range(1, 28)]
    public int? StatementDay { get; set; }
}

/// <summary>
/// DTO for updating risk preferences only
/// </summary>
public class RiskPreferencesDto
{
    public RiskTolerance? RiskTolerance { get; set; }
    public bool? AutoRebalancing { get; set; }

    [Range(0, 100)]
    public decimal? RiskAlertThreshold { get; set; }
}

/// <summary>
/// DTO for updating trading preferences only
/// </summary>
public class TradingPreferencesDto
{
    public bool? AutomatedTrading { get; set; }

    [Range(0, 100)]
    public decimal? MaxDailyLossLimit { get; set; }

    public bool? AutoStopLoss { get; set; }
}

