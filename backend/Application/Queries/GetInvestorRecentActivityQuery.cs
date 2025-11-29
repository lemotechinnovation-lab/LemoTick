using MediatR;
using InvestorManagementSystem.Application.DTOs;

namespace InvestorManagementSystem.Application.Queries;

/// <summary>
/// Query to get investor recent activity
/// </summary>
public class GetInvestorRecentActivityQuery : IRequest<RecentActivityDto>
{
    public Guid InvestorId { get; set; }
    public int TradeCount { get; set; } = 10;
    public int TransactionCount { get; set; } = 10;
    public int NotificationCount { get; set; } = 10;
}

