using MediatR;
using InvestorManagementSystem.Application.DTOs;

namespace InvestorManagementSystem.Application.Queries;

/// <summary>
/// Query to get monthly performance analytics
/// </summary>
public class GetMonthlyPerformanceQuery : IRequest<List<MonthlyPerformanceDto>>
{
    public Guid PortfolioId { get; set; }
    public int Months { get; set; } = 12;
}

