using InvestorManagementSystem.Core.Entities;

namespace InvestorManagementSystem.Application.DTOs;

public class TradeDto
{
    public Guid Id { get; set; }
    public Guid PortfolioId { get; set; }
    public string Symbol { get; set; } = string.Empty;
    public TradeType Type { get; set; }
    public decimal Amount { get; set; }
    public decimal EntryPrice { get; set; }
    public decimal? ExitPrice { get; set; }
    public decimal? Profit { get; set; }
    public decimal? ProfitPercentage { get; set; }
    public TradeStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ClosedAt { get; set; }
    public string? Notes { get; set; }
}

public class CreateTradeDto
{
    public Guid PortfolioId { get; set; }
    public string Symbol { get; set; } = string.Empty;
    public TradeType Type { get; set; }
    public decimal Amount { get; set; }
    public decimal EntryPrice { get; set; }
    public string? Notes { get; set; }
}

public class UpdateTradeDto
{
    public decimal? ExitPrice { get; set; }
    public TradeStatus Status { get; set; }
    public string? Notes { get; set; }
}
