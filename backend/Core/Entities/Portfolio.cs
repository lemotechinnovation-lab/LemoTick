using System.ComponentModel.DataAnnotations;

namespace InvestorManagementSystem.Core.Entities;

/// <summary>
/// Represents an investor's portfolio
/// </summary>
public class Portfolio
{
    public Guid Id { get; set; }
    
    [Required]
    public Guid InvestorId { get; set; }
    
    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;
    
    [StringLength(500)]
    public string? Description { get; set; }
    
    [Required]
    public decimal InitialInvestment { get; set; }
    
    [Required]
    public decimal CurrentValue { get; set; }
    
    [Required]
    public decimal TotalProfit { get; set; }
    
    [Required]
    public decimal TotalLoss { get; set; }
    
    [Required]
    public decimal NetProfit { get; set; }
    
    [Required]
    public decimal ProfitPercentage { get; set; }
    
    [Required]
    public PortfolioStatus Status { get; set; } = PortfolioStatus.Active;
    
    [Required]
    public RiskLevel RiskLevel { get; set; } = RiskLevel.Medium;
    
    [Required]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime? UpdatedAt { get; set; }
    
    public DateTime? ClosedAt { get; set; }
    
    // Risk management settings
    [Required]
    public decimal MaxLossPercentage { get; set; } = 10.0m; // 10% max loss
    
    [Required]
    public decimal MaxDrawdownPercentage { get; set; } = 15.0m; // 15% max drawdown
    
    [Required]
    public decimal DailyLossLimit { get; set; } = 5.0m; // 5% daily loss limit
    
    // Navigation properties
    public virtual Investor Investor { get; set; } = null!;
    public virtual ICollection<Trade> Trades { get; set; } = new List<Trade>();
    public virtual ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
    public virtual ICollection<PerformanceMetric> PerformanceMetrics { get; set; } = new List<PerformanceMetric>();
}

/// <summary>
/// Portfolio status enumeration
/// </summary>
public enum PortfolioStatus
{
    Active = 0,
    Suspended = 1,
    Closed = 2,
    UnderReview = 3
}

/// <summary>
/// Risk level enumeration
/// </summary>
public enum RiskLevel
{
    Low = 0,
    Medium = 1,
    High = 2,
    VeryHigh = 3
}
