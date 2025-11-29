namespace InvestorManagementSystem.Application.DTOs;

/// <summary>
/// Monthly performance analytics
/// </summary>
public class MonthlyPerformanceDto
{
    public int Year { get; set; }
    public int Month { get; set; }
    public string MonthName { get; set; } = string.Empty;
    public decimal TotalValue { get; set; }
    public decimal TotalProfit { get; set; }
    public decimal TotalLoss { get; set; }
    public decimal NetProfit { get; set; }
    public decimal ProfitPercentage { get; set; }
    public int TotalTrades { get; set; }
    public int WinningTrades { get; set; }
    public int LosingTrades { get; set; }
    public decimal WinRate { get; set; }
}

/// <summary>
/// Win/Loss ratio analytics
/// </summary>
public class WinLossRatioDto
{
    public int TotalTrades { get; set; }
    public int WinningTrades { get; set; }
    public int LosingTrades { get; set; }
    public decimal WinRate { get; set; }
    public decimal LossRate { get; set; }
    public decimal AverageWin { get; set; }
    public decimal AverageLoss { get; set; }
    public decimal ProfitFactor { get; set; }
    public decimal ExpectancyPerTrade { get; set; }
}

/// <summary>
/// Risk analysis metrics
/// </summary>
public class RiskAnalysisDto
{
    public Guid PortfolioId { get; set; }
    public string PortfolioName { get; set; } = string.Empty;
    public string RiskLevel { get; set; } = string.Empty;
    public decimal CurrentDrawdown { get; set; }
    public decimal MaxDrawdown { get; set; }
    public decimal MaxDrawdownPercentage { get; set; }
    public decimal DailyLossLimit { get; set; }
    public decimal CurrentDailyLoss { get; set; }
    public bool IsRiskLimitExceeded { get; set; }
    public List<string> RiskWarnings { get; set; } = new();
}

/// <summary>
/// Symbol performance analytics
/// </summary>
public class SymbolPerformanceDto
{
    public string Symbol { get; set; } = string.Empty;
    public int TotalTrades { get; set; }
    public int WinningTrades { get; set; }
    public int LosingTrades { get; set; }
    public decimal WinRate { get; set; }
    public decimal TotalProfit { get; set; }
    public decimal TotalLoss { get; set; }
    public decimal NetProfit { get; set; }
    public decimal AverageProfit { get; set; }
    public decimal AverageLoss { get; set; }
    public decimal ProfitFactor { get; set; }
}

/// <summary>
/// Strategy performance analytics
/// </summary>
public class StrategyPerformanceDto
{
    public string Strategy { get; set; } = string.Empty;
    public int TotalTrades { get; set; }
    public int WinningTrades { get; set; }
    public int LosingTrades { get; set; }
    public decimal WinRate { get; set; }
    public decimal TotalProfit { get; set; }
    public decimal TotalLoss { get; set; }
    public decimal NetProfit { get; set; }
    public decimal ProfitFactor { get; set; }
}

/// <summary>
/// Trading hours analytics
/// </summary>
public class TradingHoursDto
{
    public int Hour { get; set; }
    public int TotalTrades { get; set; }
    public int WinningTrades { get; set; }
    public decimal WinRate { get; set; }
    public decimal NetProfit { get; set; }
}

