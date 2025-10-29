using InvestorManagementSystem.Core.Entities;

namespace InvestorManagementSystem.Application.DTOs;

public class PortfolioDto
{
    public Guid Id { get; set; }
    public Guid InvestorId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal InitialAmount { get; set; }
    public decimal CurrentValue { get; set; }
    public decimal TotalProfit { get; set; }
    public decimal TotalProfitPercentage { get; set; }
    public PortfolioStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public DateTime? LastTradedAt { get; set; }
}

public class CreatePortfolioDto
{
    public Guid InvestorId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal InitialAmount { get; set; }
}

public class UpdatePortfolioDto
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public PortfolioStatus Status { get; set; }
}
