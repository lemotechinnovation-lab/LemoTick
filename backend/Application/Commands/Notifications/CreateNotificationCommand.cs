using MediatR;
using InvestorManagementSystem.Application.DTOs;

namespace InvestorManagementSystem.Application.Commands.Notifications;

public record CreateNotificationCommand(CreateNotificationDto CreateNotificationDto) : IRequest<NotificationDto>;

