using MediatR;
using Microsoft.Extensions.Logging;
using InvestorManagementSystem.Application.Commands.Notifications;
using InvestorManagementSystem.Application.Interfaces;

namespace InvestorManagementSystem.Application.Handlers.Notifications;

public class MarkAllNotificationsAsReadHandler : IRequestHandler<MarkAllNotificationsAsReadCommand, int>
{
    private readonly INotificationRepository _notificationRepository;
    private readonly ILogger<MarkAllNotificationsAsReadHandler> _logger;

    public MarkAllNotificationsAsReadHandler(
        INotificationRepository notificationRepository,
        ILogger<MarkAllNotificationsAsReadHandler> logger)
    {
        _notificationRepository = notificationRepository;
        _logger = logger;
    }

    public async Task<int> Handle(MarkAllNotificationsAsReadCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Marking all notifications as read for investor: {InvestorId}", request.InvestorId);

        var result = await _notificationRepository.MarkAllAsReadAsync(request.InvestorId);

        _logger.LogInformation("Marked {Count} notifications as read", result);

        return result;
    }
}

