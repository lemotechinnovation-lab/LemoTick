namespace InvestorManagementSystem.Application.DTOs;

public class PerformanceMetricDto
{
    public Guid Id { get; set; }
    public Guid PortfolioId { get; set; }
    public DateTime Date { get; set; }
    public decimal TotalValue { get; set; }
    public decimal TotalProfit { get; set; }
    public decimal TotalLoss { get; set; }
    public decimal NetProfit { get; set; }
    public decimal ProfitPercentage { get; set; }
    public decimal Drawdown { get; set; }
    public decimal MaxDrawdown { get; set; }
    public decimal SharpeRatio { get; set; }
    public decimal WinRate { get; set; }
    public int TotalTrades { get; set; }
    public int WinningTrades { get; set; }
    public int LosingTrades { get; set; }
    public decimal AverageWin { get; set; }
    public decimal AverageLoss { get; set; }
    public decimal ProfitFactor { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreatePerformanceMetricDto
{
    public Guid PortfolioId { get; set; }
    public DateTime Date { get; set; }
    public decimal TotalValue { get; set; }
    public decimal TotalProfit { get; set; }
    public decimal TotalLoss { get; set; }
    public decimal NetProfit { get; set; }
    public decimal ProfitPercentage { get; set; }
    public decimal Drawdown { get; set; }
    public decimal MaxDrawdown { get; set; }
    public decimal SharpeRatio { get; set; }
    public decimal WinRate { get; set; }
    public int TotalTrades { get; set; }
    public int WinningTrades { get; set; }
    public int LosingTrades { get; set; }
    public decimal AverageWin { get; set; }
    public decimal AverageLoss { get; set; }
    public decimal ProfitFactor { get; set; }
}

