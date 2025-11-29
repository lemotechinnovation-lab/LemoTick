using MediatR;
using InvestorManagementSystem.Application.DTOs;

namespace InvestorManagementSystem.Application.Queries.Notifications;

public record GetAllNotificationsQuery() : IRequest<IEnumerable<NotificationDto>>;

