using MediatR;
using InvestorManagementSystem.Application.DTOs;

namespace InvestorManagementSystem.Application.Queries.Notifications;

public record GetNotificationsByInvestorQuery(Guid InvestorId) : IRequest<IEnumerable<NotificationDto>>;

