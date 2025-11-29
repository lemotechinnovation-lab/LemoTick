namespace InvestorManagementSystem.Application.DTOs;

/// <summary>
/// Summary dashboard data for an investor
/// </summary>
public class DashboardSummaryDto
{
    public Guid InvestorId { get; set; }
    public string InvestorName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;

    // Portfolio Summary
    public int TotalPortfolios { get; set; }
    public int ActivePortfolios { get; set; }
    public decimal TotalInvestment { get; set; }
    public decimal CurrentValue { get; set; }
    public decimal TotalProfit { get; set; }
    public decimal TotalLoss { get; set; }
    public decimal NetProfit { get; set; }
    public decimal ProfitPercentage { get; set; }

    // Trading Summary
    public int TotalTrades { get; set; }
    public int OpenTrades { get; set; }
    public int ClosedTrades { get; set; }
    public int WinningTrades { get; set; }
    public int LosingTrades { get; set; }
    public decimal WinRate { get; set; }

    // Account Summary
    public decimal AvailableBalance { get; set; }
    public int PendingTransactions { get; set; }
    public int UnreadNotifications { get; set; }

    // Recent Activity
    public DateTime? LastTradeDate { get; set; }
    public DateTime? LastLoginAt { get; set; }

    // Portfolio Details
    public List<DashboardPortfolioSummaryDto> PortfolioSummaries { get; set; } = new();

    // Performance History (for charts)
    public List<PerformanceHistoryDto> PerformanceHistory { get; set; } = new();
}

/// <summary>
/// Individual portfolio summary for dashboard
/// </summary>
public class DashboardPortfolioSummaryDto
{
    public Guid PortfolioId { get; set; }
    public string PortfolioName { get; set; } = string.Empty;
    public decimal CurrentValue { get; set; }
    public decimal NetProfit { get; set; }
    public decimal ProfitPercentage { get; set; }
    public string Status { get; set; } = string.Empty;
}

/// <summary>
/// Performance history data point for charts
/// </summary>
public class PerformanceHistoryDto
{
    public DateTime Date { get; set; }
    public decimal Value { get; set; }
}

/// <summary>
/// Recent activity for an investor
/// </summary>
public class RecentActivityDto
{
    public List<RecentTradeDto> RecentTrades { get; set; } = new();
    public List<RecentTransactionDto> RecentTransactions { get; set; } = new();
    public List<NotificationDto> RecentNotifications { get; set; } = new();
}

/// <summary>
/// Recent trade summary
/// </summary>
public class RecentTradeDto
{
    public Guid Id { get; set; }
    public string Symbol { get; set; } = string.Empty;
    public string Direction { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public decimal EntryPrice { get; set; }
    public decimal? ExitPrice { get; set; }
    public decimal? Profit { get; set; }
    public decimal? Loss { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime EntryTime { get; set; }
    public DateTime? ExitTime { get; set; }
    public string PortfolioName { get; set; } = string.Empty;
}

/// <summary>
/// Recent transaction summary
/// </summary>
public class RecentTransactionDto
{
    public Guid Id { get; set; }
    public string Type { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// Portfolio overview with performance metrics
/// </summary>
public class PortfolioOverviewDto
{
    public Guid PortfolioId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string RiskLevel { get; set; } = string.Empty;

    // Financial Data
    public decimal InitialInvestment { get; set; }
    public decimal CurrentValue { get; set; }
    public decimal TotalProfit { get; set; }
    public decimal TotalLoss { get; set; }
    public decimal NetProfit { get; set; }
    public decimal ProfitPercentage { get; set; }

    // Trading Data
    public int TotalTrades { get; set; }
    public int OpenTrades { get; set; }
    public int ClosedTrades { get; set; }
    public decimal WinRate { get; set; }

    // Risk Management
    public decimal MaxLossPercentage { get; set; }
    public decimal MaxDrawdownPercentage { get; set; }
    public decimal DailyLossLimit { get; set; }
    public decimal CurrentDrawdown { get; set; }

    // Recent Performance
    public List<DailyPerformanceDto> RecentPerformance { get; set; } = new();

    // Recent Trades
    public List<RecentTradeDto> RecentTrades { get; set; } = new();
}

/// <summary>
/// Daily performance data point
/// </summary>
public class DailyPerformanceDto
{
    public DateTime Date { get; set; }
    public decimal Value { get; set; }
    public decimal Profit { get; set; }
    public decimal Loss { get; set; }
    public decimal NetProfit { get; set; }
}

