using MediatR;
using InvestorManagementSystem.Application.DTOs;

namespace InvestorManagementSystem.Application.Queries;

/// <summary>
/// Query to get investor dashboard summary
/// </summary>
public class GetInvestorDashboardSummaryQuery : IRequest<DashboardSummaryDto>
{
    public Guid InvestorId { get; set; }
}

