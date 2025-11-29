using MediatR;
using AutoMapper;
using Microsoft.Extensions.Logging;
using InvestorManagementSystem.Application.Queries.Notifications;
using InvestorManagementSystem.Application.DTOs;
using InvestorManagementSystem.Application.Interfaces;

namespace InvestorManagementSystem.Application.Handlers.Notifications;

public class GetNotificationByIdHandler : IRequestHandler<GetNotificationByIdQuery, NotificationDto?>
{
    private readonly INotificationRepository _notificationRepository;
    private readonly IMapper _mapper;
    private readonly ILogger<GetNotificationByIdHandler> _logger;

    public GetNotificationByIdHandler(
        INotificationRepository notificationRepository,
        IMapper mapper,
        ILogger<GetNotificationByIdHandler> logger)
    {
        _notificationRepository = notificationRepository;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<NotificationDto?> Handle(GetNotificationByIdQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Getting notification by ID: {NotificationId}", request.Id);

        var notification = await _notificationRepository.GetByIdAsync(request.Id);
        return notification != null ? _mapper.Map<NotificationDto>(notification) : null;
    }
}

