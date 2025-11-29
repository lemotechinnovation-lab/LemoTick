namespace InvestorManagementSystem.Application.DTOs;

/// <summary>
/// Trade export DTO for CSV
/// </summary>
public class TradeExportDto
{
    public string Symbol { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Direction { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public decimal EntryPrice { get; set; }
    public decimal? ExitPrice { get; set; }
    public decimal Stake { get; set; }
    public decimal? Profit { get; set; }
    public decimal? Loss { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime EntryTime { get; set; }
    public DateTime? ExitTime { get; set; }
    public string? Strategy { get; set; }
    public string? Signal { get; set; }
    public string PortfolioName { get; set; } = string.Empty;
}

/// <summary>
/// Transaction export DTO for CSV
/// </summary>
public class TransactionExportDto
{
    public string Type { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public decimal Balance { get; set; }
    public string Currency { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Reference { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ProcessedAt { get; set; }
    public string? PaymentMethod { get; set; }
    public string? PaymentProvider { get; set; }
}

/// <summary>
/// Portfolio performance export DTO for CSV
/// </summary>
public class PortfolioPerformanceExportDto
{
    public string PortfolioName { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public decimal TotalValue { get; set; }
    public decimal TotalProfit { get; set; }
    public decimal TotalLoss { get; set; }
    public decimal NetProfit { get; set; }
    public decimal ProfitPercentage { get; set; }
    public decimal Drawdown { get; set; }
    public decimal WinRate { get; set; }
    public int TotalTrades { get; set; }
    public int WinningTrades { get; set; }
    public int LosingTrades { get; set; }
}

