using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace InvestorManagementSystem.API.Hubs;

/// <summary>
/// SignalR Hub for real-time notifications
/// </summary>
[Authorize]
public class NotificationHub : Hub
{
    private readonly ILogger<NotificationHub> _logger;
    private static readonly Dictionary<string, string> _userConnections = new();

    public NotificationHub(ILogger<NotificationHub> logger)
    {
        _logger = logger;
    }

    public override async Task OnConnectedAsync()
    {
        var userId = Context.User?.FindFirst("investor_id")?.Value;

        if (!string.IsNullOrEmpty(userId))
        {
            _userConnections[userId] = Context.ConnectionId;
            await Groups.AddToGroupAsync(Context.ConnectionId, $"user_{userId}");

            _logger.LogInformation("User {UserId} connected with connection {ConnectionId}",
                userId, Context.ConnectionId);
        }

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = Context.User?.FindFirst("investor_id")?.Value;

        if (!string.IsNullOrEmpty(userId))
        {
            _userConnections.Remove(userId);
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"user_{userId}");

            _logger.LogInformation("User {UserId} disconnected", userId);
        }

        await base.OnDisconnectedAsync(exception);
    }

    /// <summary>
    /// Client subscribes to specific notification types
    /// </summary>
    public async Task SubscribeToNotificationType(string notificationType)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"type_{notificationType}");
        _logger.LogInformation("Connection {ConnectionId} subscribed to {Type}",
            Context.ConnectionId, notificationType);
    }

    /// <summary>
    /// Client unsubscribes from specific notification types
    /// </summary>
    public async Task UnsubscribeFromNotificationType(string notificationType)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"type_{notificationType}");
        _logger.LogInformation("Connection {ConnectionId} unsubscribed from {Type}",
            Context.ConnectionId, notificationType);
    }

    /// <summary>
    /// Mark notification as read (sent from client)
    /// </summary>
    public async Task MarkAsRead(Guid notificationId)
    {
        var userId = Context.User?.FindFirst("investor_id")?.Value;
        _logger.LogInformation("User {UserId} marked notification {NotificationId} as read",
            userId, notificationId);

        // You can emit an event back or handle database update here
        await Clients.Caller.SendAsync("NotificationMarkedAsRead", notificationId);
    }

    /// <summary>
    /// Get connection ID for a specific user
    /// </summary>
    public static string? GetConnectionIdForUser(string userId)
    {
        return _userConnections.TryGetValue(userId, out var connectionId) ? connectionId : null;
    }

    /// <summary>
    /// Check if user is online
    /// </summary>
    public static bool IsUserOnline(string userId)
    {
        return _userConnections.ContainsKey(userId);
    }
}

