using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;
using InvestorManagementSystem.Application.DTOs;
using InvestorManagementSystem.Core.Entities;
using InvestorManagementSystem.Infrastructure.Data;
using InvestorManagementSystem.API.Hubs;
using Microsoft.EntityFrameworkCore;

namespace InvestorManagementSystem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MessageController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<MessageController> _logger;
    private readonly IHubContext<SocialHub> _hubContext;

    public MessageController(
        ApplicationDbContext context,
        ILogger<MessageController> logger,
        IHubContext<SocialHub> hubContext)
    {
        _context = context;
        _logger = logger;
        _hubContext = hubContext;
    }

    /// <summary>
    /// Get all conversations for the current user
    /// </summary>
    [HttpGet("conversations")]
    public async Task<ActionResult<List<ConversationDto>>> GetConversations()
    {
        try
        {
            var userId = GetCurrentUserId();

            // Get all conversations where user is a participant
            var conversations = await _context.Set<Conversation>()
                .Where(c => c.User1Id == userId || c.User2Id == userId)
                .OrderByDescending(c => c.UpdatedAt)
                .ToListAsync();

            var conversationDtos = new List<ConversationDto>();

            foreach (var conversation in conversations)
            {
                // Determine the other participant
                var participantId = conversation.User1Id == userId ? conversation.User2Id : conversation.User1Id;

                // Get participant profile
                var participant = await _context.UserProfiles
                    .FirstOrDefaultAsync(p => p.InvestorId == participantId);

                if (participant == null) continue;

                // Get last message
                var lastMessage = await _context.Set<Message>()
                    .Where(m => m.ConversationId == conversation.Id)
                    .OrderByDescending(m => m.CreatedAt)
                    .FirstOrDefaultAsync();

                // Count unread messages
                var unreadCount = await _context.Set<Message>()
                    .Where(m => m.ConversationId == conversation.Id && m.SenderId != userId && !m.IsRead)
                    .CountAsync();

                conversationDtos.Add(new ConversationDto
                {
                    Id = conversation.Id,
                    ParticipantId = participantId,
                    ParticipantName = participant.DisplayName,
                    ParticipantAvatar = participant.AvatarUrl,
                    ParticipantOnlineStatus = participant.OnlineStatus.ToString().ToLower(),
                    LastMessage = lastMessage != null ? new MessageDto
                    {
                        Id = lastMessage.Id,
                        ConversationId = lastMessage.ConversationId,
                        SenderId = lastMessage.SenderId,
                        SenderName = lastMessage.SenderId == userId ? "You" : participant.DisplayName,
                        SenderAvatar = lastMessage.SenderId == userId ? null : participant.AvatarUrl,
                        Content = lastMessage.Content,
                        IsRead = lastMessage.IsRead,
                        CreatedAt = lastMessage.CreatedAt,
                        UpdatedAt = lastMessage.UpdatedAt
                    } : null,
                    UnreadCount = unreadCount,
                    UpdatedAt = conversation.UpdatedAt
                });
            }

            return Ok(conversationDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting conversations");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    /// <summary>
    /// Get messages for a specific conversation
    /// </summary>
    [HttpGet("conversations/{conversationId}/messages")]
    public async Task<ActionResult<List<MessageDto>>> GetMessages(Guid conversationId, [FromQuery] int limit = 50)
    {
        try
        {
            var userId = GetCurrentUserId();

            // Verify user is part of the conversation
            var conversation = await _context.Set<Conversation>()
                .FirstOrDefaultAsync(c => c.Id == conversationId && (c.User1Id == userId || c.User2Id == userId));

            if (conversation == null)
                return NotFound(new { error = "Conversation not found" });

            // Get messages
            var messages = await _context.Set<Message>()
                .Where(m => m.ConversationId == conversationId)
                .OrderByDescending(m => m.CreatedAt)
                .Take(limit)
                .ToListAsync();

            // Get sender profiles
            var senderIds = messages.Select(m => m.SenderId).Distinct().ToList();
            var senders = await _context.UserProfiles
                .Where(p => senderIds.Contains(p.InvestorId))
                .ToDictionaryAsync(p => p.InvestorId, p => p);

            var messageDtos = messages.Select(m =>
            {
                var sender = senders.GetValueOrDefault(m.SenderId);
                return new MessageDto
                {
                    Id = m.Id,
                    ConversationId = m.ConversationId,
                    SenderId = m.SenderId,
                    SenderName = sender?.DisplayName ?? "Unknown",
                    SenderAvatar = sender?.AvatarUrl,
                    Content = m.Content,
                    IsRead = m.IsRead,
                    CreatedAt = m.CreatedAt,
                    UpdatedAt = m.UpdatedAt
                };
            }).Reverse().ToList(); // Reverse to get chronological order

            return Ok(messageDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting messages");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    /// <summary>
    /// Send a message in a conversation
    /// </summary>
    [HttpPost("conversations/{conversationId}/messages")]
    public async Task<ActionResult<MessageDto>> SendMessage(Guid conversationId, [FromBody] SendMessageDto dto)
    {
        try
        {
            var userId = GetCurrentUserId();

            // Verify user is part of the conversation
            var conversation = await _context.Set<Conversation>()
                .FirstOrDefaultAsync(c => c.Id == conversationId && (c.User1Id == userId || c.User2Id == userId));

            if (conversation == null)
                return NotFound(new { error = "Conversation not found" });

            // Create message
            var message = new Message
            {
                Id = Guid.NewGuid(),
                ConversationId = conversationId,
                SenderId = userId,
                Content = dto.Content,
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };

            _context.Set<Message>().Add(message);

            // Update conversation timestamp
            conversation.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            // Get sender profile
            var sender = await _context.UserProfiles
                .FirstOrDefaultAsync(p => p.InvestorId == userId);

            var messageDto = new MessageDto
            {
                Id = message.Id,
                ConversationId = message.ConversationId,
                SenderId = message.SenderId,
                SenderName = sender?.DisplayName ?? "Unknown",
                SenderAvatar = sender?.AvatarUrl,
                Content = message.Content,
                IsRead = message.IsRead,
                CreatedAt = message.CreatedAt,
                UpdatedAt = message.UpdatedAt
            };

            // Send real-time notification via SignalR
            var recipientId = conversation.User1Id == userId ? conversation.User2Id : conversation.User1Id;
            await _hubContext.Clients.Group($"user_{recipientId}").SendAsync("ReceiveMessage", messageDto);
            _logger.LogInformation("Sent real-time message notification to user {RecipientId}", recipientId);

            return CreatedAtAction(nameof(GetMessages), new { conversationId }, messageDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending message");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    /// <summary>
    /// Mark all messages in a conversation as read
    /// </summary>
    [HttpPost("conversations/{conversationId}/read")]
    public async Task<IActionResult> MarkAsRead(Guid conversationId)
    {
        try
        {
            var userId = GetCurrentUserId();

            // Verify user is part of the conversation
            var conversation = await _context.Set<Conversation>()
                .FirstOrDefaultAsync(c => c.Id == conversationId && (c.User1Id == userId || c.User2Id == userId));

            if (conversation == null)
                return NotFound(new { error = "Conversation not found" });

            // Mark all messages from other user as read
            await _context.Set<Message>()
                .Where(m => m.ConversationId == conversationId && m.SenderId != userId && !m.IsRead)
                .ExecuteUpdateAsync(setters => setters.SetProperty(m => m.IsRead, true));

            return Ok(new { message = "Conversation marked as read" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error marking conversation as read");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    /// <summary>
    /// Delete a conversation
    /// </summary>
    [HttpDelete("conversations/{conversationId}")]
    public async Task<IActionResult> DeleteConversation(Guid conversationId)
    {
        try
        {
            var userId = GetCurrentUserId();

            // Verify user is part of the conversation
            var conversation = await _context.Set<Conversation>()
                .FirstOrDefaultAsync(c => c.Id == conversationId && (c.User1Id == userId || c.User2Id == userId));

            if (conversation == null)
                return NotFound(new { error = "Conversation not found" });

            // Delete all messages in the conversation
            await _context.Set<Message>()
                .Where(m => m.ConversationId == conversationId)
                .ExecuteDeleteAsync();

            // Delete the conversation
            _context.Set<Conversation>().Remove(conversation);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Conversation deleted" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting conversation");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    /// <summary>
    /// Create a new conversation
    /// </summary>
    [HttpPost("conversations")]
    public async Task<ActionResult<ConversationDto>> CreateConversation([FromBody] CreateConversationDto dto)
    {
        try
        {
            var userId = GetCurrentUserId();

            // Check if conversation already exists
            var existingConversation = await _context.Set<Conversation>()
                .FirstOrDefaultAsync(c =>
                    (c.User1Id == userId && c.User2Id == dto.ParticipantId) ||
                    (c.User1Id == dto.ParticipantId && c.User2Id == userId));

            if (existingConversation != null)
            {
                // Return existing conversation
                var participant = await _context.UserProfiles
                    .FirstOrDefaultAsync(p => p.InvestorId == dto.ParticipantId);

                if (participant == null)
                    return NotFound(new { error = "Participant not found" });

                return Ok(new ConversationDto
                {
                    Id = existingConversation.Id,
                    ParticipantId = dto.ParticipantId,
                    ParticipantName = participant.DisplayName,
                    ParticipantAvatar = participant.AvatarUrl,
                    ParticipantOnlineStatus = participant.OnlineStatus.ToString().ToLower(),
                    LastMessage = null,
                    UnreadCount = 0,
                    UpdatedAt = existingConversation.UpdatedAt
                });
            }

            // Create new conversation
            var conversation = new Conversation
            {
                Id = Guid.NewGuid(),
                User1Id = userId,
                User2Id = dto.ParticipantId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Set<Conversation>().Add(conversation);

            // Send initial message if provided
            if (!string.IsNullOrEmpty(dto.InitialMessage))
            {
                var message = new Message
                {
                    Id = Guid.NewGuid(),
                    ConversationId = conversation.Id,
                    SenderId = userId,
                    Content = dto.InitialMessage,
                    IsRead = false,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Set<Message>().Add(message);
            }

            await _context.SaveChangesAsync();

            // Get participant profile
            var participantProfile = await _context.UserProfiles
                .FirstOrDefaultAsync(p => p.InvestorId == dto.ParticipantId);

            if (participantProfile == null)
                return NotFound(new { error = "Participant not found" });

            var conversationDto = new ConversationDto
            {
                Id = conversation.Id,
                ParticipantId = dto.ParticipantId,
                ParticipantName = participantProfile.DisplayName,
                ParticipantAvatar = participantProfile.AvatarUrl,
                ParticipantOnlineStatus = participantProfile.OnlineStatus.ToString().ToLower(),
                LastMessage = null,
                UnreadCount = 0,
                UpdatedAt = conversation.UpdatedAt
            };

            return CreatedAtAction(nameof(GetConversations), conversationDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating conversation");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    private Guid GetCurrentUserId()
    {
        var userIdClaim = User.FindFirstValue("investor_id");
        if (string.IsNullOrEmpty(userIdClaim))
            throw new UnauthorizedAccessException("User ID not found in token");

        return Guid.Parse(userIdClaim);
    }
}
