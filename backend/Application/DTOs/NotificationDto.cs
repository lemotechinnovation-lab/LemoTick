using System;
using System.Collections.Generic;

namespace InvestorManagementSystem.Application.DTOs;

// ═══════════════════════════════════════════════════════════════════════════
// Notification DTOs
// ═══════════════════════════════════════════════════════════════════════════

public enum NotificationType
{
    TradeAlert,
    KycUpdate,
    Deposit,
    Withdrawal,
    System,
    Social,
    FriendRequest,
    Message
}

public class NotificationDto
{
    public Guid Id { get; set; }
    public NotificationType Type { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string? Icon { get; set; }
    public string? IconColor { get; set; }
    public string? Link { get; set; }
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; }
    public Dictionary<string, object>? Metadata { get; set; }
}

public class CreateNotificationDto
{
    public NotificationType Type { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string? Icon { get; set; }
    public string? IconColor { get; set; }
    public string? Link { get; set; }
    public Dictionary<string, object>? Metadata { get; set; }
}

public class NotificationStatsDto
{
    public int TotalCount { get; set; }
    public int UnreadCount { get; set; }
}
