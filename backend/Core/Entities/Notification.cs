using System.ComponentModel.DataAnnotations;

namespace InvestorManagementSystem.Core.Entities;

/// <summary>
/// Represents a notification sent to investors
/// </summary>
public class Notification
{
    public Guid Id { get; set; }
    
    [Required]
    public Guid InvestorId { get; set; }
    
    [Required]
    [StringLength(200)]
    public string Title { get; set; } = string.Empty;
    
    [Required]
    [StringLength(2000)]
    public string Message { get; set; } = string.Empty;
    
    [Required]
    public NotificationType Type { get; set; }
    
    [Required]
    public NotificationPriority Priority { get; set; } = NotificationPriority.Normal;
    
    [Required]
    public bool IsRead { get; set; } = false;
    
    [Required]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime? ReadAt { get; set; }
    
    [StringLength(1000)]
    public string? ActionUrl { get; set; }
    
    [StringLength(100)]
    public string? ActionText { get; set; }
    
    // Navigation properties
    public virtual Investor Investor { get; set; } = null!;
}

/// <summary>
/// Notification type enumeration
/// </summary>
public enum NotificationType
{
    TradeExecuted = 0,
    TradeClosed = 1,
    ProfitDistribution = 2,
    LossAlert = 3,
    RiskAlert = 4,
    SystemUpdate = 5,
    AccountUpdate = 6,
    SecurityAlert = 7,
    Marketing = 8,
    General = 9
}

/// <summary>
/// Notification priority enumeration
/// </summary>
public enum NotificationPriority
{
    Low = 0,
    Normal = 1,
    High = 2,
    Critical = 3
}
