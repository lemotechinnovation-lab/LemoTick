using Microsoft.AspNetCore.SignalR;
using InvestorManagementSystem.API.Hubs;
using InvestorManagementSystem.Application.Services;

namespace InvestorManagementSystem.API.Services;

/// <summary>
/// Implementation of IRealTimeNotificationService using SignalR
/// </summary>
public class SignalRNotificationService : IRealTimeNotificationService
{
    private readonly IHubContext<NotificationHub> _hubContext;
    private readonly ILogger<SignalRNotificationService> _logger;

    public SignalRNotificationService(
        IHubContext<NotificationHub> hubContext,
        ILogger<SignalRNotificationService> logger)
    {
        _hubContext = hubContext;
        _logger = logger;
    }

    public async Task SendNotificationToUserAsync(string userId, object notification)
    {
        try
        {
            await _hubContext.Clients
                .Group($"user_{userId}")
                .SendAsync("ReceiveNotification", notification);

            _logger.LogInformation("Sent notification to user {UserId}", userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send notification to user {UserId}", userId);
        }
    }

    public async Task SendNotificationToAllAsync(object notification)
    {
        try
        {
            await _hubContext.Clients.All.SendAsync("ReceiveNotification", notification);
            _logger.LogInformation("Sent notification to all users");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send notification to all users");
        }
    }

    public async Task SendNotificationToGroupAsync(string groupName, object notification)
    {
        try
        {
            await _hubContext.Clients
                .Group(groupName)
                .SendAsync("ReceiveNotification", notification);

            _logger.LogInformation("Sent notification to group {GroupName}", groupName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send notification to group {GroupName}", groupName);
        }
    }

    public bool IsUserOnline(string userId)
    {
        return NotificationHub.IsUserOnline(userId);
    }
}

