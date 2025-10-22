using System.ComponentModel.DataAnnotations;

namespace InvestorManagementSystem.Core.Entities;

/// <summary>
/// Represents performance metrics for portfolios and trades
/// </summary>
public class PerformanceMetric
{
    public Guid Id { get; set; }
    
    [Required]
    public Guid PortfolioId { get; set; }
    
    [Required]
    public DateTime Date { get; set; }
    
    [Required]
    public decimal TotalValue { get; set; }
    
    [Required]
    public decimal TotalProfit { get; set; }
    
    [Required]
    public decimal TotalLoss { get; set; }
    
    [Required]
    public decimal NetProfit { get; set; }
    
    [Required]
    public decimal ProfitPercentage { get; set; }
    
    [Required]
    public decimal Drawdown { get; set; }
    
    [Required]
    public decimal MaxDrawdown { get; set; }
    
    [Required]
    public decimal SharpeRatio { get; set; }
    
    [Required]
    public decimal WinRate { get; set; }
    
    [Required]
    public int TotalTrades { get; set; }
    
    [Required]
    public int WinningTrades { get; set; }
    
    [Required]
    public int LosingTrades { get; set; }
    
    [Required]
    public decimal AverageWin { get; set; }
    
    [Required]
    public decimal AverageLoss { get; set; }
    
    [Required]
    public decimal ProfitFactor { get; set; }
    
    [Required]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public virtual Portfolio Portfolio { get; set; } = null!;
}
