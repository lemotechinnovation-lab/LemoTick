using MediatR;
using AutoMapper;
using Microsoft.Extensions.Logging;
using InvestorManagementSystem.Application.Commands.Notifications;
using InvestorManagementSystem.Application.DTOs;
using InvestorManagementSystem.Application.Interfaces;
using InvestorManagementSystem.Core.Entities;

namespace InvestorManagementSystem.Application.Handlers.Notifications;

public class CreateNotificationHandler : IRequestHandler<CreateNotificationCommand, NotificationDto>
{
    private readonly INotificationRepository _notificationRepository;
    private readonly IMapper _mapper;
    private readonly ILogger<CreateNotificationHandler> _logger;

    public CreateNotificationHandler(
        INotificationRepository notificationRepository,
        IMapper mapper,
        ILogger<CreateNotificationHandler> logger)
    {
        _notificationRepository = notificationRepository;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<NotificationDto> Handle(CreateNotificationCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Creating notification for investor: {InvestorId}", request.CreateNotificationDto.InvestorId);

        var notification = _mapper.Map<Notification>(request.CreateNotificationDto);
        notification.Id = Guid.NewGuid();
        notification.IsRead = false;
        notification.CreatedAt = DateTime.UtcNow;

        var createdNotification = await _notificationRepository.AddAsync(notification);

        _logger.LogInformation("Notification created with ID: {NotificationId}", createdNotification.Id);

        return _mapper.Map<NotificationDto>(createdNotification);
    }
}

