using MediatR;
using InvestorManagementSystem.Application.DTOs;

namespace InvestorManagementSystem.Application.Queries.Notifications;

public record GetNotificationByIdQuery(Guid Id) : IRequest<NotificationDto?>;

