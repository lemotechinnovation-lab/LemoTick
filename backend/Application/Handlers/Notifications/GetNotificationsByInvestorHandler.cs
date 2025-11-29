using MediatR;
using AutoMapper;
using Microsoft.Extensions.Logging;
using InvestorManagementSystem.Application.Queries.Notifications;
using InvestorManagementSystem.Application.DTOs;
using InvestorManagementSystem.Application.Interfaces;

namespace InvestorManagementSystem.Application.Handlers.Notifications;

public class GetNotificationsByInvestorHandler : IRequestHandler<GetNotificationsByInvestorQuery, IEnumerable<NotificationDto>>
{
    private readonly INotificationRepository _notificationRepository;
    private readonly IMapper _mapper;
    private readonly ILogger<GetNotificationsByInvestorHandler> _logger;

    public GetNotificationsByInvestorHandler(
        INotificationRepository notificationRepository,
        IMapper mapper,
        ILogger<GetNotificationsByInvestorHandler> logger)
    {
        _notificationRepository = notificationRepository;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<IEnumerable<NotificationDto>> Handle(GetNotificationsByInvestorQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Getting notifications for investor: {InvestorId}", request.InvestorId);

        var notifications = await _notificationRepository.GetByInvestorIdAsync(request.InvestorId);
        return _mapper.Map<IEnumerable<NotificationDto>>(notifications);
    }
}

