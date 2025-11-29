using MediatR;

namespace InvestorManagementSystem.Application.Commands.Notifications;

public record MarkAllNotificationsAsReadCommand(Guid InvestorId) : IRequest<int>;

