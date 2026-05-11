using Microsoft.AspNetCore.SignalR;
using InvestorManagementSystem.API.Hubs;
using InvestorManagementSystem.Application.DTOs;
using InvestorManagementSystem.Core.Entities;

namespace InvestorManagementSystem.API.Services;

/// <summary>
/// Service for broadcasting social networking events via SignalR
/// </summary>
public class SocialBroadcastService : ISocialBroadcastService
{
    private readonly IHubContext<SocialHub> _hubContext;
    private readonly ILogger<SocialBroadcastService> _logger;

    public SocialBroadcastService(
        IHubContext<SocialHub> hubContext,
        ILogger<SocialBroadcastService> logger)
    {
        _hubContext = hubContext;
        _logger = logger;
    }

    public async Task BroadcastFriendRequestReceived(Guid recipientId, FriendRequestReceivedEventDto eventDto)
    {
        try
        {
            await _hubContext.Clients
                .Group($"user_{recipientId}")
                .SendAsync("ReceiveFriendRequest", eventDto);

            _logger.LogInformation("Broadcast friend request received to user {RecipientId}", recipientId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error broadcasting friend request received to user {RecipientId}", recipientId);
        }
    }

    public async Task BroadcastFriendRequestAccepted(Guid requesterId, FriendRequestAcceptedEventDto eventDto)
    {
        try
        {
            await _hubContext.Clients
                .Group($"user_{requesterId}")
                .SendAsync("FriendRequestAccepted", eventDto);

            _logger.LogInformation("Broadcast friend request accepted to user {RequesterId}", requesterId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error broadcasting friend request accepted to user {RequesterId}", requesterId);
        }
    }

    public async Task BroadcastFriendRequestDeclined(Guid requesterId, FriendRequestDeclinedEventDto eventDto)
    {
        try
        {
            await _hubContext.Clients
                .Group($"user_{requesterId}")
                .SendAsync("FriendRequestDeclined", eventDto);

            _logger.LogInformation("Broadcast friend request declined to user {RequesterId}", requesterId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error broadcasting friend request declined to user {RequesterId}", requesterId);
        }
    }

    public async Task BroadcastFriendRequestCancelled(Guid recipientId, Guid requestId)
    {
        try
        {
            await _hubContext.Clients
                .Group($"user_{recipientId}")
                .SendAsync("FriendRequestCancelled", new { RequestId = requestId });

            _logger.LogInformation("Broadcast friend request cancelled to user {RecipientId}", recipientId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error broadcasting friend request cancelled to user {RecipientId}", recipientId);
        }
    }

    public async Task BroadcastFriendRemoved(Guid userId, FriendRemovedEventDto eventDto)
    {
        try
        {
            await _hubContext.Clients
                .Group($"user_{userId}")
                .SendAsync("FriendRemoved", eventDto);

            _logger.LogInformation("Broadcast friend removed to user {UserId}", userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error broadcasting friend removed to user {UserId}", userId);
        }
    }

    public async Task BroadcastOnlineStatusChange(Guid userId, OnlineStatus status)
    {
        try
        {
            var eventDto = new UserOnlineStatusChangedEventDto
            {
                UserId = userId,
                OnlineStatus = status,
                LastSeenAt = status == OnlineStatus.Offline ? DateTime.UtcNow : null
            };

            // This will be handled by the SocialHub itself when status changes
            // But we can also broadcast directly if needed
            await _hubContext.Clients
                .Group($"user_{userId}")
                .SendAsync("UserOnlineStatusChanged", eventDto);

            _logger.LogInformation("Broadcast online status change for user {UserId} to {Status}", userId, status);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error broadcasting online status change for user {UserId}", userId);
        }
    }

    public async Task BroadcastProfileUpdate(Guid userId, ProfileUpdatedEventDto eventDto)
    {
        try
        {
            await _hubContext.Clients
                .Group($"user_{userId}")
                .SendAsync("ProfileUpdated", eventDto);

            _logger.LogInformation("Broadcast profile update for user {UserId}", userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error broadcasting profile update for user {UserId}", userId);
        }
    }

    public async Task BroadcastFriendSuggestionsUpdate(Guid userId, int newSuggestionsCount)
    {
        try
        {
            await _hubContext.Clients
                .Group($"user_{userId}")
                .SendAsync("FriendSuggestionsUpdated", new
                {
                    NewSuggestionsCount = newSuggestionsCount,
                    UpdatedAt = DateTime.UtcNow
                });

            _logger.LogInformation("Broadcast friend suggestions update to user {UserId}", userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error broadcasting friend suggestions update to user {UserId}", userId);
        }
    }

    public bool IsUserOnline(Guid userId)
    {
        return SocialHub.IsUserOnline(userId.ToString());
    }

    public int GetOnlineUserCount()
    {
        return SocialHub.GetOnlineUserCount();
    }
}
