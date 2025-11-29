using InvestorManagementSystem.Core.Entities;

namespace InvestorManagementSystem.Application.DTOs;

public class NotificationDto
{
    public Guid Id { get; set; }
    public Guid InvestorId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public NotificationType Type { get; set; }
    public NotificationPriority Priority { get; set; }
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ReadAt { get; set; }
    public string? ActionUrl { get; set; }
    public string? ActionText { get; set; }
}

public class CreateNotificationDto
{
    public Guid InvestorId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public NotificationType Type { get; set; }
    public NotificationPriority Priority { get; set; } = NotificationPriority.Normal;
    public string? ActionUrl { get; set; }
    public string? ActionText { get; set; }
}

public class MarkNotificationAsReadDto
{
    public Guid NotificationId { get; set; }
}

