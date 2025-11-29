namespace InvestorManagementSystem.Application.DTOs;

/// <summary>
/// Webhook payload for trade opened event
/// </summary>
public class TradeOpenedWebhookDto
{
    public string BotId { get; set; } = string.Empty;
    public Guid PortfolioId { get; set; }
    public string ExternalTradeId { get; set; } = string.Empty;
    public string Symbol { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Direction { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public decimal EntryPrice { get; set; }
    public decimal Stake { get; set; }
    public decimal? StopLoss { get; set; }
    public decimal? TakeProfit { get; set; }
    public string? Strategy { get; set; }
    public string? Signal { get; set; }
    public DateTime Timestamp { get; set; }
}

/// <summary>
/// Webhook payload for trade closed event
/// </summary>
public class TradeClosedWebhookDto
{
    public string BotId { get; set; } = string.Empty;
    public string ExternalTradeId { get; set; } = string.Empty;
    public decimal ExitPrice { get; set; }
    public decimal? Profit { get; set; }
    public decimal? Loss { get; set; }
    public string? CloseReason { get; set; }
    public DateTime Timestamp { get; set; }
}

/// <summary>
/// Webhook payload for trade updated event
/// </summary>
public class TradeUpdatedWebhookDto
{
    public string BotId { get; set; } = string.Empty;
    public string ExternalTradeId { get; set; } = string.Empty;
    public decimal? StopLoss { get; set; }
    public decimal? TakeProfit { get; set; }
    public string? Notes { get; set; }
    public DateTime Timestamp { get; set; }
}

/// <summary>
/// Webhook payload for risk alert event
/// </summary>
public class RiskAlertWebhookDto
{
    public string BotId { get; set; } = string.Empty;
    public Guid PortfolioId { get; set; }
    public string AlertType { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Severity { get; set; } = string.Empty; // "Low", "Medium", "High", "Critical"
    public decimal? CurrentDrawdown { get; set; }
    public decimal? DailyLoss { get; set; }
    public DateTime Timestamp { get; set; }
}

/// <summary>
/// Generic webhook response
/// </summary>
public class WebhookResponseDto
{
    public bool Success { get; set; }
    public string? Message { get; set; }
    public Guid? EntityId { get; set; }
    public DateTime ProcessedAt { get; set; } = DateTime.UtcNow;
}

