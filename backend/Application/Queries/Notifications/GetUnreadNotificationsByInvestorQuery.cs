using MediatR;
using InvestorManagementSystem.Application.DTOs;

namespace InvestorManagementSystem.Application.Queries.Notifications;

public record GetUnreadNotificationsByInvestorQuery(Guid InvestorId) : IRequest<IEnumerable<NotificationDto>>;

