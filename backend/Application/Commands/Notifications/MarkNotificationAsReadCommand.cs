using MediatR;

namespace InvestorManagementSystem.Application.Commands.Notifications;

public record MarkNotificationAsReadCommand(Guid NotificationId) : IRequest<bool>;

