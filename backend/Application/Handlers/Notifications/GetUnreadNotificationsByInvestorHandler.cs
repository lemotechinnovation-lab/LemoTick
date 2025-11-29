using MediatR;
using AutoMapper;
using Microsoft.Extensions.Logging;
using InvestorManagementSystem.Application.Queries.Notifications;
using InvestorManagementSystem.Application.DTOs;
using InvestorManagementSystem.Application.Interfaces;

namespace InvestorManagementSystem.Application.Handlers.Notifications;

public class GetUnreadNotificationsByInvestorHandler : IRequestHandler<GetUnreadNotificationsByInvestorQuery, IEnumerable<NotificationDto>>
{
    private readonly INotificationRepository _notificationRepository;
    private readonly IMapper _mapper;
    private readonly ILogger<GetUnreadNotificationsByInvestorHandler> _logger;

    public GetUnreadNotificationsByInvestorHandler(
        INotificationRepository notificationRepository,
        IMapper mapper,
        ILogger<GetUnreadNotificationsByInvestorHandler> logger)
    {
        _notificationRepository = notificationRepository;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<IEnumerable<NotificationDto>> Handle(GetUnreadNotificationsByInvestorQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Getting unread notifications for investor: {InvestorId}", request.InvestorId);

        var notifications = await _notificationRepository.GetUnreadByInvestorIdAsync(request.InvestorId);
        return _mapper.Map<IEnumerable<NotificationDto>>(notifications);
    }
}

