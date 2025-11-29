using MediatR;
using AutoMapper;
using Microsoft.Extensions.Logging;
using InvestorManagementSystem.Application.Queries.Notifications;
using InvestorManagementSystem.Application.DTOs;
using InvestorManagementSystem.Application.Interfaces;

namespace InvestorManagementSystem.Application.Handlers.Notifications;

public class GetAllNotificationsHandler : IRequestHandler<GetAllNotificationsQuery, IEnumerable<NotificationDto>>
{
    private readonly INotificationRepository _notificationRepository;
    private readonly IMapper _mapper;
    private readonly ILogger<GetAllNotificationsHandler> _logger;

    public GetAllNotificationsHandler(
        INotificationRepository notificationRepository,
        IMapper mapper,
        ILogger<GetAllNotificationsHandler> logger)
    {
        _notificationRepository = notificationRepository;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<IEnumerable<NotificationDto>> Handle(GetAllNotificationsQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Getting all notifications");

        var notifications = await _notificationRepository.GetAllAsync();
        return _mapper.Map<IEnumerable<NotificationDto>>(notifications);
    }
}

