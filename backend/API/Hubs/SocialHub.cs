using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using InvestorManagementSystem.Application.DTOs;
using InvestorManagementSystem.Application.Interfaces;
using InvestorManagementSystem.Core.Entities;

namespace InvestorManagementSystem.API.Hubs;

/// <summary>
/// SignalR Hub for real-time social networking updates
/// </summary>
[Authorize]
public class SocialHub : Hub
{
    private readonly ILogger<SocialHub> _logger;
    private readonly ISocialService _socialService;

    // Track user connections (userId -> set of connectionIds)
    private static readonly Dictionary<string, HashSet<string>> _userConnections = new();

    // Track online users
    private static readonly HashSet<string> _onlineUsers = new();

    private static readonly object _lock = new();

    public SocialHub(ILogger<SocialHub> logger, ISocialService socialService)
    {
        _logger = logger;
        _socialService = socialService;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Connection Management
    // ═══════════════════════════════════════════════════════════════════════════

    public override async Task OnConnectedAsync()
    {
        var userId = GetUserId();

        if (!string.IsNullOrEmpty(userId))
        {
            lock (_lock)
            {
                // Add connection
                if (!_userConnections.ContainsKey(userId))
                {
                    _userConnections[userId] = new HashSet<string>();
                }
                _userConnections[userId].Add(Context.ConnectionId);

                // Mark user as online
                _onlineUsers.Add(userId);
            }

            // Add to user's personal group
            await Groups.AddToGroupAsync(Context.ConnectionId, $"user_{userId}");

            // Update online status in database (silently fail if profile doesn't exist)
            if (Guid.TryParse(userId, out var userGuid))
            {
                try
                {
                    var success = await _socialService.UpdateOnlineStatusAsync(userGuid, OnlineStatus.Online);

                    if (success)
                    {
                        // Notify friends about online status change
                        await NotifyFriendsAboutOnlineStatus(userGuid, OnlineStatus.Online);
                    }
                    else
                    {
                        _logger.LogWarning("User {UserId} connected but profile not found - online status not updated", userId);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to update online status for user {UserId} on connect", userId);
                }
            }

            _logger.LogInformation("User {UserId} connected to SocialHub with connection {ConnectionId}",
                userId, Context.ConnectionId);
        }

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = GetUserId();

        if (!string.IsNullOrEmpty(userId))
        {
            bool isLastConnection = false;

            lock (_lock)
            {
                // Remove connection
                if (_userConnections.ContainsKey(userId))
                {
                    _userConnections[userId].Remove(Context.ConnectionId);

                    // If no more connections, mark as offline
                    if (_userConnections[userId].Count == 0)
                    {
                        _userConnections.Remove(userId);
                        _onlineUsers.Remove(userId);
                        isLastConnection = true;
                    }
                }
            }

            // Remove from user's personal group
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"user_{userId}");

            // Update online status if this was the last connection
            if (isLastConnection && Guid.TryParse(userId, out var userGuid))
            {
                try
                {
                    await _socialService.UpdateOnlineStatusAsync(userGuid, OnlineStatus.Offline);

                    // Notify friends about offline status
                    await NotifyFriendsAboutOnlineStatus(userGuid, OnlineStatus.Offline);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to update online status for user {UserId} on disconnect", userId);
                }
            }

            _logger.LogInformation("User {UserId} disconnected from SocialHub. Exception: {Exception}",
                userId, exception?.Message ?? "None");
        }

        await base.OnDisconnectedAsync(exception);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Client-Callable Methods
    // ═══════════════════════════════════════════════════════════════════════════

    /// <summary>
    /// Join user's personal group (called automatically on connect, but can be called manually)
    /// </summary>
    public async Task JoinUserGroup(string userId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"user_{userId}");
        _logger.LogInformation("Connection {ConnectionId} joined user group {UserId}",
            Context.ConnectionId, userId);
    }

    /// <summary>
    /// Leave user's personal group
    /// </summary>
    public async Task LeaveUserGroup(string userId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"user_{userId}");
        _logger.LogInformation("Connection {ConnectionId} left user group {UserId}",
            Context.ConnectionId, userId);
    }

    /// <summary>
    /// Update online status (Away, DoNotDisturb, etc.)
    /// </summary>
    public async Task UpdateOnlineStatus(string status)
    {
        try
        {
            var userId = GetUserId();

            if (string.IsNullOrEmpty(userId))
            {
                _logger.LogWarning("UpdateOnlineStatus called but userId is null or empty");
                throw new HubException("User ID not found in token");
            }

            if (!Guid.TryParse(userId, out var userGuid))
            {
                _logger.LogWarning("UpdateOnlineStatus called with invalid userId: {UserId}", userId);
                throw new HubException("Invalid user ID format");
            }

            if (!Enum.TryParse<OnlineStatus>(status, true, out var onlineStatus))
            {
                _logger.LogWarning("Invalid online status: {Status}", status);
                throw new HubException($"Invalid online status: {status}");
            }

            // Update in database
            var success = await _socialService.UpdateOnlineStatusAsync(userGuid, onlineStatus);

            if (!success)
            {
                _logger.LogWarning("Failed to update online status for user {UserId}", userId);
                throw new HubException("Failed to update online status");
            }

            // Notify friends
            await NotifyFriendsAboutOnlineStatus(userGuid, onlineStatus);

            _logger.LogInformation("User {UserId} updated online status to {Status}", userId, status);
        }
        catch (HubException)
        {
            throw; // Re-throw HubException as-is
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating online status");
            throw new HubException("An error occurred while updating online status");
        }
    }

    /// <summary>
    /// Subscribe to friend's updates
    /// </summary>
    public async Task SubscribeToFriend(string friendId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"friend_{friendId}");
        _logger.LogInformation("Connection {ConnectionId} subscribed to friend {FriendId}",
            Context.ConnectionId, friendId);
    }

    /// <summary>
    /// Unsubscribe from friend's updates
    /// </summary>
    public async Task UnsubscribeFromFriend(string friendId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"friend_{friendId}");
        _logger.LogInformation("Connection {ConnectionId} unsubscribed from friend {FriendId}",
            Context.ConnectionId, friendId);
    }

    /// <summary>
    /// Ping to keep connection alive
    /// </summary>
    public async Task Ping()
    {
        await Clients.Caller.SendAsync("Pong", DateTime.UtcNow);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Server-Side Broadcasting Methods (called from controllers/services)
    // ═══════════════════════════════════════════════════════════════════════════

    /// <summary>
    /// Send friend request notification to recipient
    /// </summary>
    public async Task SendFriendRequestNotification(Guid recipientId, FriendRequestReceivedEventDto eventDto)
    {
        await Clients.Group($"user_{recipientId}").SendAsync("ReceiveFriendRequest", eventDto);
        _logger.LogInformation("Sent friend request notification to user {RecipientId}", recipientId);
    }

    /// <summary>
    /// Notify requester that their friend request was accepted
    /// </summary>
    public async Task SendFriendRequestAcceptedNotification(Guid requesterId, FriendRequestAcceptedEventDto eventDto)
    {
        await Clients.Group($"user_{requesterId}").SendAsync("FriendRequestAccepted", eventDto);
        _logger.LogInformation("Sent friend request accepted notification to user {RequesterId}", requesterId);
    }

    /// <summary>
    /// Notify requester that their friend request was declined
    /// </summary>
    public async Task SendFriendRequestDeclinedNotification(Guid requesterId, FriendRequestDeclinedEventDto eventDto)
    {
        await Clients.Group($"user_{requesterId}").SendAsync("FriendRequestDeclined", eventDto);
        _logger.LogInformation("Sent friend request declined notification to user {RequesterId}", requesterId);
    }

    /// <summary>
    /// Notify recipient that a friend request was cancelled
    /// </summary>
    public async Task SendFriendRequestCancelledNotification(Guid recipientId, Guid requestId)
    {
        await Clients.Group($"user_{recipientId}").SendAsync("FriendRequestCancelled", new { RequestId = requestId });
        _logger.LogInformation("Sent friend request cancelled notification to user {RecipientId}", recipientId);
    }

    /// <summary>
    /// Notify user that they were unfriended
    /// </summary>
    public async Task SendFriendRemovedNotification(Guid userId, FriendRemovedEventDto eventDto)
    {
        await Clients.Group($"user_{userId}").SendAsync("FriendRemoved", eventDto);
        _logger.LogInformation("Sent friend removed notification to user {UserId}", userId);
    }

    /// <summary>
    /// Notify friends about online status change
    /// </summary>
    public async Task NotifyFriendsAboutOnlineStatus(Guid userId, OnlineStatus status)
    {
        try
        {
            // Get user's friends
            var friends = await _socialService.GetFriendsAsync(userId, new PaginationDto { Page = 1, PageSize = 1000 });

            var eventDto = new UserOnlineStatusChangedEventDto
            {
                UserId = userId,
                OnlineStatus = status,
                LastSeenAt = status == OnlineStatus.Offline ? DateTime.UtcNow : null
            };

            // Notify each friend
            foreach (var friend in friends.Items)
            {
                await Clients.Group($"user_{friend.UserId}").SendAsync("UserOnlineStatusChanged", eventDto);
            }

            _logger.LogInformation("Notified {Count} friends about user {UserId} status change to {Status}",
                friends.Items.Count, userId, status);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error notifying friends about online status change for user {UserId}", userId);
        }
    }

    /// <summary>
    /// Notify friends about profile update
    /// </summary>
    public async Task NotifyFriendsAboutProfileUpdate(Guid userId, ProfileUpdatedEventDto eventDto)
    {
        try
        {
            // Get user's friends
            var friends = await _socialService.GetFriendsAsync(userId, new PaginationDto { Page = 1, PageSize = 1000 });

            // Notify each friend
            foreach (var friend in friends.Items)
            {
                await Clients.Group($"user_{friend.UserId}").SendAsync("ProfileUpdated", eventDto);
            }

            _logger.LogInformation("Notified {Count} friends about user {UserId} profile update",
                friends.Items.Count, userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error notifying friends about profile update for user {UserId}", userId);
        }
    }

    /// <summary>
    /// Notify user about new friend suggestions
    /// </summary>
    public async Task SendFriendSuggestionsUpdate(Guid userId, int newSuggestionsCount)
    {
        await Clients.Group($"user_{userId}").SendAsync("FriendSuggestionsUpdated", new
        {
            NewSuggestionsCount = newSuggestionsCount,
            UpdatedAt = DateTime.UtcNow
        });
        _logger.LogInformation("Sent friend suggestions update to user {UserId}", userId);
    }

    /// <summary>
    /// Broadcast message to all online users (admin only)
    /// </summary>
    public async Task BroadcastToAll(string message)
    {
        await Clients.All.SendAsync("SystemMessage", new
        {
            Message = message,
            Timestamp = DateTime.UtcNow
        });
        _logger.LogInformation("Broadcast system message to all users");
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Notification Methods
    // ═══════════════════════════════════════════════════════════════════════════

    /// <summary>
    /// Send notification to a specific user
    /// </summary>
    public async Task SendNotification(Guid userId, NotificationDto notification)
    {
        await Clients.Group($"user_{userId}").SendAsync("ReceiveNotification", notification);
        _logger.LogInformation("Sent notification {NotificationId} to user {UserId}", notification.Id, userId);
    }

    /// <summary>
    /// Send notification to multiple users
    /// </summary>
    public async Task SendNotificationToUsers(List<Guid> userIds, NotificationDto notification)
    {
        foreach (var userId in userIds)
        {
            await Clients.Group($"user_{userId}").SendAsync("ReceiveNotification", notification);
        }
        _logger.LogInformation("Sent notification {NotificationId} to {Count} users", notification.Id, userIds.Count);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Messaging Methods
    // ═══════════════════════════════════════════════════════════════════════════

    /// <summary>
    /// Send message to a specific user
    /// </summary>
    public async Task SendMessage(Guid recipientId, MessageDto message)
    {
        await Clients.Group($"user_{recipientId}").SendAsync("ReceiveMessage", message);
        _logger.LogInformation("Sent message {MessageId} to user {RecipientId}", message.Id, recipientId);
    }

    /// <summary>
    /// Notify user about conversation update (new message, read status, etc.)
    /// </summary>
    public async Task SendConversationUpdate(Guid userId, ConversationDto conversation)
    {
        await Clients.Group($"user_{userId}").SendAsync("ConversationUpdated", conversation);
        _logger.LogInformation("Sent conversation update {ConversationId} to user {UserId}", conversation.Id, userId);
    }

    /// <summary>
    /// Notify user that someone is typing in a conversation
    /// </summary>
    public async Task SendTypingIndicator(Guid recipientId, Guid conversationId, string senderName)
    {
        await Clients.Group($"user_{recipientId}").SendAsync("UserTyping", new
        {
            ConversationId = conversationId,
            SenderName = senderName,
            Timestamp = DateTime.UtcNow
        });
        _logger.LogInformation("Sent typing indicator for conversation {ConversationId} to user {RecipientId}", conversationId, recipientId);
    }

    /// <summary>
    /// Notify user that messages in a conversation have been read
    /// </summary>
    public async Task SendMessageReadReceipt(Guid senderId, Guid conversationId, DateTime readAt)
    {
        await Clients.Group($"user_{senderId}").SendAsync("MessagesRead", new
        {
            ConversationId = conversationId,
            ReadAt = readAt
        });
        _logger.LogInformation("Sent read receipt for conversation {ConversationId} to user {SenderId}", conversationId, senderId);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Static Helper Methods
    // ═══════════════════════════════════════════════════════════════════════════

    /// <summary>
    /// Get all connection IDs for a specific user
    /// </summary>
    public static List<string> GetConnectionIdsForUser(string userId)
    {
        lock (_lock)
        {
            return _userConnections.TryGetValue(userId, out var connections)
                ? connections.ToList()
                : new List<string>();
        }
    }

    /// <summary>
    /// Check if user is online
    /// </summary>
    public static bool IsUserOnline(string userId)
    {
        lock (_lock)
        {
            return _onlineUsers.Contains(userId);
        }
    }

    /// <summary>
    /// Get count of online users
    /// </summary>
    public static int GetOnlineUserCount()
    {
        lock (_lock)
        {
            return _onlineUsers.Count;
        }
    }

    /// <summary>
    /// Get all online user IDs
    /// </summary>
    public static List<string> GetOnlineUserIds()
    {
        lock (_lock)
        {
            return _onlineUsers.ToList();
        }
    }

    /// <summary>
    /// Get total connection count
    /// </summary>
    public static int GetTotalConnectionCount()
    {
        lock (_lock)
        {
            return _userConnections.Values.Sum(connections => connections.Count);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Private Helper Methods
    // ═══════════════════════════════════════════════════════════════════════════

    private string? GetUserId()
    {
        return Context.User?.FindFirst("investor_id")?.Value;
    }
}
