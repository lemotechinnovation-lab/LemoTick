using System;

namespace InvestorManagementSystem.Application.DTOs;

// ═══════════════════════════════════════════════════════════════════════════
// Message DTOs
// ═══════════════════════════════════════════════════════════════════════════

public class MessageDto
{
    public Guid Id { get; set; }
    public Guid ConversationId { get; set; }
    public Guid SenderId { get; set; }
    public string SenderName { get; set; } = string.Empty;
    public string? SenderAvatar { get; set; }
    public string Content { get; set; } = string.Empty;
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class ConversationDto
{
    public Guid Id { get; set; }
    public Guid ParticipantId { get; set; }
    public string ParticipantName { get; set; } = string.Empty;
    public string? ParticipantAvatar { get; set; }
    public string? ParticipantOnlineStatus { get; set; }
    public MessageDto? LastMessage { get; set; }
    public int UnreadCount { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class SendMessageDto
{
    public string Content { get; set; } = string.Empty;
}

public class CreateConversationDto
{
    public Guid ParticipantId { get; set; }
    public string? InitialMessage { get; set; }
}
