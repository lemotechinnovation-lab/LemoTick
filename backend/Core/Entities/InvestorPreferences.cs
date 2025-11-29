using System.ComponentModel.DataAnnotations;

namespace InvestorManagementSystem.Core.Entities;

/// <summary>
/// Represents investor preferences and settings
/// </summary>
public class InvestorPreferences
{
    public Guid Id { get; set; }

    [Required]
    public Guid InvestorId { get; set; }

    // ==================== COMMUNICATION PREFERENCES ====================

    /// <summary>
    /// Receive email notifications for account activities
    /// </summary>
    public bool EmailNotifications { get; set; } = true;

    /// <summary>
    /// Receive notifications for trade executions
    /// </summary>
    public bool TradeNotifications { get; set; } = true;

    /// <summary>
    /// Receive risk alerts when thresholds are breached
    /// </summary>
    public bool RiskAlerts { get; set; } = true;

    /// <summary>
    /// Receive monthly statements via email
    /// </summary>
    public bool MonthlyStatements { get; set; } = true;

    /// <summary>
    /// Receive quarterly reports
    /// </summary>
    public bool QuarterlyReports { get; set; } = true;

    /// <summary>
    /// Receive marketing and promotional emails
    /// </summary>
    public bool MarketingEmails { get; set; } = false;

    /// <summary>
    /// Receive security alerts (login, 2FA changes, etc.)
    /// </summary>
    public bool SecurityAlerts { get; set; } = true;

    // ==================== STATEMENT PREFERENCES ====================

    /// <summary>
    /// How to deliver statements
    /// </summary>
    public StatementDeliveryMethod StatementDelivery { get; set; } = StatementDeliveryMethod.Email;

    /// <summary>
    /// Day of month to send statements (1-28)
    /// </summary>
    [Range(1, 28)]
    public int StatementDay { get; set; } = 1;

    // ==================== DISPLAY PREFERENCES ====================

    /// <summary>
    /// Preferred currency display (default ZAR)
    /// </summary>
    [Required]
    [StringLength(3)]
    public string Currency { get; set; } = "ZAR";

    /// <summary>
    /// Preferred language code (ISO 639-1)
    /// </summary>
    [Required]
    [StringLength(10)]
    public string Language { get; set; } = "en";

    /// <summary>
    /// Preferred timezone (IANA timezone)
    /// </summary>
    [Required]
    [StringLength(100)]
    public string Timezone { get; set; } = "Africa/Johannesburg";

    /// <summary>
    /// Preferred date format
    /// </summary>
    [Required]
    [StringLength(50)]
    public string DateFormat { get; set; } = "yyyy-MM-dd";

    // ==================== RISK PREFERENCES ====================

    /// <summary>
    /// Investor's risk tolerance level
    /// </summary>
    public RiskTolerance RiskTolerance { get; set; } = RiskTolerance.Medium;

    /// <summary>
    /// Enable automatic portfolio rebalancing
    /// </summary>
    public bool AutoRebalancing { get; set; } = false;

    /// <summary>
    /// Threshold for risk alerts (percentage)
    /// </summary>
    [Range(0, 100)]
    public decimal RiskAlertThreshold { get; set; } = 10.0m;

    // ==================== TRADING PREFERENCES ====================

    /// <summary>
    /// Allow automated trading bot to trade on behalf
    /// </summary>
    public bool AutomatedTrading { get; set; } = true;

    /// <summary>
    /// Maximum daily loss limit (percentage)
    /// </summary>
    [Range(0, 100)]
    public decimal MaxDailyLossLimit { get; set; } = 5.0m;

    /// <summary>
    /// Enable stop-loss orders automatically
    /// </summary>
    public bool AutoStopLoss { get; set; } = true;

    // ==================== METADATA ====================

    [Required]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    // Navigation properties
    public virtual Investor Investor { get; set; } = default!;
}

/// <summary>
/// Statement delivery method
/// </summary>
public enum StatementDeliveryMethod
{
    Email = 0,          // Send via email
    Portal = 1,         // Available in portal only
    Both = 2            // Both email and portal
}

/// <summary>
/// Risk tolerance levels
/// </summary>
public enum RiskTolerance
{
    Conservative = 0,   // Very low risk tolerance
    Moderate = 1,       // Low to moderate risk
    Medium = 2,         // Medium risk (balanced)
    Aggressive = 3,     // High risk tolerance
    VeryAggressive = 4  // Very high risk tolerance
}

