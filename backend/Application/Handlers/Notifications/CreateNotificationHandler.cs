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
        _logger.LogInformation("Creating notification for user");

        var notification = new Notification
        {
            Id = Guid.NewGuid(),
            UserId = Guid.Empty, // This should be set by the caller or from context
            Type = request.CreateNotificationDto.Type.ToString().ToLower(),
            Title = request.CreateNotificationDto.Title,
            Message = request.CreateNotificationDto.Message,
            Icon = request.CreateNotificationDto.Icon,
            IconColor = request.CreateNotificationDto.IconColor,
            Link = request.CreateNotificationDto.Link,
            IsRead = false,
            CreatedAt = DateTime.UtcNow,
            MetadataJson = request.CreateNotificationDto.Metadata != null
                ? System.Text.Json.JsonSerializer.Serialize(request.CreateNotificationDto.Metadata)
                : null
        };

        var createdNotification = await _notificationRepository.AddAsync(notification);

        _logger.LogInformation("Notification created with ID: {NotificationId}", createdNotification.Id);

        return new NotificationDto
        {
            Id = createdNotification.Id,
            Type = request.CreateNotificationDto.Type,
            Title = createdNotification.Title,
            Message = createdNotification.Message,
            Icon = createdNotification.Icon,
            IconColor = createdNotification.IconColor,
            Link = createdNotification.Link,
            IsRead = createdNotification.IsRead,
            CreatedAt = createdNotification.CreatedAt,
            Metadata = request.CreateNotificationDto.Metadata
        };
    }
}

