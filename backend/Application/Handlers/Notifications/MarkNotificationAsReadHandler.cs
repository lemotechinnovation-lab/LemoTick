using MediatR;
using Microsoft.Extensions.Logging;
using InvestorManagementSystem.Application.Commands.Notifications;
using InvestorManagementSystem.Application.Interfaces;

namespace InvestorManagementSystem.Application.Handlers.Notifications;

public class MarkNotificationAsReadHandler : IRequestHandler<MarkNotificationAsReadCommand, bool>
{
    private readonly INotificationRepository _notificationRepository;
    private readonly ILogger<MarkNotificationAsReadHandler> _logger;

    public MarkNotificationAsReadHandler(
        INotificationRepository notificationRepository,
        ILogger<MarkNotificationAsReadHandler> logger)
    {
        _notificationRepository = notificationRepository;
        _logger = logger;
    }

    public async Task<bool> Handle(MarkNotificationAsReadCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Marking notification as read: {NotificationId}", request.NotificationId);

        var result = await _notificationRepository.MarkAsReadAsync(request.NotificationId);
        return result > 0;
    }
}

