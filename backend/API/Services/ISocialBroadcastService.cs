using InvestorManagementSystem.Application.DTOs;
using InvestorManagementSystem.Core.Entities;

namespace InvestorManagementSystem.API.Services;

/// <summary>
/// Service for broadcasting social networking events via SignalR
/// </summary>
public interface ISocialBroadcastService
{
    /// <summary>
    /// Broadcast friend request received event
    /// </summary>
    Task BroadcastFriendRequestReceived(Guid recipientId, FriendRequestReceivedEventDto eventDto);

    /// <summary>
    /// Broadcast friend request accepted event
    /// </summary>
    Task BroadcastFriendRequestAccepted(Guid requesterId, FriendRequestAcceptedEventDto eventDto);

    /// <summary>
    /// Broadcast friend request declined event
    /// </summary>
    Task BroadcastFriendRequestDeclined(Guid requesterId, FriendRequestDeclinedEventDto eventDto);

    /// <summary>
    /// Broadcast friend request cancelled event
    /// </summary>
    Task BroadcastFriendRequestCancelled(Guid recipientId, Guid requestId);

    /// <summary>
    /// Broadcast friend removed event
    /// </summary>
    Task BroadcastFriendRemoved(Guid userId, FriendRemovedEventDto eventDto);

    /// <summary>
    /// Broadcast online status change to friends
    /// </summary>
    Task BroadcastOnlineStatusChange(Guid userId, OnlineStatus status);

    /// <summary>
    /// Broadcast profile update to friends
    /// </summary>
    Task BroadcastProfileUpdate(Guid userId, ProfileUpdatedEventDto eventDto);

    /// <summary>
    /// Broadcast friend suggestions update
    /// </summary>
    Task BroadcastFriendSuggestionsUpdate(Guid userId, int newSuggestionsCount);

    /// <summary>
    /// Check if user is online
    /// </summary>
    bool IsUserOnline(Guid userId);

    /// <summary>
    /// Get online user count
    /// </summary>
    int GetOnlineUserCount();
}
