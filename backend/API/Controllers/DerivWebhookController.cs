using Microsoft.AspNetCore.Mvc;
using InvestorManagementSystem.API.Services;

namespace InvestorManagementSystem.API.Controllers;

/// <summary>
/// Receives real-time trading data from the bot and broadcasts to connected clients
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class DerivWebhookController : ControllerBase
{
    private readonly ITradingBroadcastService _broadcastService;
    private readonly ILogger<DerivWebhookController> _logger;

    public DerivWebhookController(
        ITradingBroadcastService broadcastService,
        ILogger<DerivWebhookController> logger)
    {
        _broadcastService = broadcastService;
        _logger = logger;
    }

    /// <summary>
    /// Receive tick update from bot
    /// </summary>
    [HttpPost("tick")]
    public async Task<IActionResult> ReceiveTickUpdate([FromBody] TickUpdateRequest request)
    {
        try
        {
            _logger.LogDebug("Received tick update: {Symbol} @ {Price}", request.Symbol, request.Price);

            await _broadcastService.BroadcastTickUpdate(
                request.Symbol,
                request.Price,
                request.Timestamp);

            return Ok(new { message = "Tick update broadcast successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing tick update");
            return StatusCode(500, new { message = "Error processing tick update" });
        }
    }

    /// <summary>
    /// Receive trade opened notification from bot
    /// </summary>
    [HttpPost("trade/opened")]
    public async Task<IActionResult> ReceiveTradeOpened([FromBody] TradeNotificationRequest request)
    {
        try
        {
            _logger.LogInformation("Received trade opened notification for investor {InvestorId}", request.InvestorId);

            await _broadcastService.BroadcastTradeOpened(
                request.PortfolioId,
                request.InvestorId,
                request);

            return Ok(new { message = "Trade opened notification broadcast successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing trade opened notification");
            return StatusCode(500, new { message = "Error processing trade opened notification" });
        }
    }

    /// <summary>
    /// Receive trade closed notification from bot
    /// </summary>
    [HttpPost("trade/closed")]
    public async Task<IActionResult> ReceiveTradeClosed([FromBody] TradeNotificationRequest request)
    {
        try
        {
            _logger.LogInformation("Received trade closed notification for investor {InvestorId}", request.InvestorId);

            await _broadcastService.BroadcastTradeClosed(
                request.PortfolioId,
                request.InvestorId,
                request);

            return Ok(new { message = "Trade closed notification broadcast successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing trade closed notification");
            return StatusCode(500, new { message = "Error processing trade closed notification" });
        }
    }

    /// <summary>
    /// Receive portfolio update from bot
    /// </summary>
    [HttpPost("portfolio/update")]
    public async Task<IActionResult> ReceivePortfolioUpdate([FromBody] PortfolioUpdateRequest request)
    {
        try
        {
            _logger.LogDebug("Received portfolio update for portfolio {PortfolioId}", request.PortfolioId);

            await _broadcastService.BroadcastPortfolioUpdate(
                request.PortfolioId,
                request.InvestorId,
                request);

            return Ok(new { message = "Portfolio update broadcast successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing portfolio update");
            return StatusCode(500, new { message = "Error processing portfolio update" });
        }
    }

    /// <summary>
    /// Receive account balance update from bot
    /// </summary>
    [HttpPost("balance")]
    public async Task<IActionResult> ReceiveBalanceUpdate([FromBody] BalanceUpdateRequest request)
    {
        try
        {
            _logger.LogDebug("Received balance update for investor {InvestorId}", request.InvestorId);

            await _broadcastService.BroadcastAccountBalance(
                request.InvestorId,
                request.Balance,
                request.Currency);

            return Ok(new { message = "Balance update broadcast successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing balance update");
            return StatusCode(500, new { message = "Error processing balance update" });
        }
    }
}

// Request DTOs
public class TickUpdateRequest
{
    public string Symbol { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public long Timestamp { get; set; }
}

public class TradeNotificationRequest
{
    public string InvestorId { get; set; } = string.Empty;
    public Guid PortfolioId { get; set; }
    public string TradeId { get; set; } = string.Empty;
    public string Symbol { get; set; } = string.Empty;
    public string Direction { get; set; } = string.Empty;
    public decimal Stake { get; set; }
    public decimal? EntryPrice { get; set; }
    public decimal? ExitPrice { get; set; }
    public decimal? Profit { get; set; }
    public decimal? Loss { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
}

public class PortfolioUpdateRequest
{
    public string InvestorId { get; set; } = string.Empty;
    public Guid PortfolioId { get; set; }
    public decimal CurrentValue { get; set; }
    public decimal TotalProfit { get; set; }
    public decimal TotalLoss { get; set; }
    public decimal NetProfit { get; set; }
    public decimal ProfitPercentage { get; set; }
    public int TotalTrades { get; set; }
    public int WinningTrades { get; set; }
    public int LosingTrades { get; set; }
}

public class BalanceUpdateRequest
{
    public string InvestorId { get; set; } = string.Empty;
    public decimal Balance { get; set; }
    public string Currency { get; set; } = "USD";
}

