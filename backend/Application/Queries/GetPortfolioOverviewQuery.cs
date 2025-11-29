using MediatR;
using InvestorManagementSystem.Application.DTOs;

namespace InvestorManagementSystem.Application.Queries;

/// <summary>
/// Query to get detailed portfolio overview
/// </summary>
public class GetPortfolioOverviewQuery : IRequest<PortfolioOverviewDto>
{
    public Guid PortfolioId { get; set; }
    public int RecentTradesCount { get; set; } = 10;
    public int PerformanceDays { get; set; } = 30;
}

