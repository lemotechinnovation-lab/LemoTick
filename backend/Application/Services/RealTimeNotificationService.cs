namespace InvestorManagementSystem.Application.Services;

/// <summary>
/// Interface for sending real-time notifications
/// Implementation will be in API layer using SignalR
/// </summary>
public interface IRealTimeNotificationService
{
    Task SendNotificationToUserAsync(string userId, object notification);
    Task SendNotificationToAllAsync(object notification);
    Task SendNotificationToGroupAsync(string groupName, object notification);
    bool IsUserOnline(string userId);
}

/// <summary>
/// Real-time notification DTOs
/// </summary>
public class RealTimeNotificationDto
{
    public Guid Id { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
    public string? ActionUrl { get; set; }
    public string? ActionText { get; set; }
    public Dictionary<string, object>? Data { get; set; }
}

public class TradeNotificationDto
{
    public string Type { get; set; } = string.Empty; // "trade_opened", "trade_closed"
    public string Symbol { get; set; } = string.Empty;
    public string Direction { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public decimal? Profit { get; set; }
    public decimal? Loss { get; set; }
    public DateTime Timestamp { get; set; }
}

public class PriceAlertDto
{
    public string Symbol { get; set; } = string.Empty;
    public decimal CurrentPrice { get; set; }
    public decimal AlertPrice { get; set; }
    public string Direction { get; set; } = string.Empty; // "above", "below"
    public DateTime Timestamp { get; set; }
}

