using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using InvestorManagementSystem.Application.DTOs;
using InvestorManagementSystem.Application.Services;
using InvestorManagementSystem.Infrastructure.Data;
using InvestorManagementSystem.Core.Entities;

namespace InvestorManagementSystem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class WebhookController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly WebhookSignatureService _signatureService;
    private readonly ILogger<WebhookController> _logger;
    private readonly IConfiguration _configuration;

    public WebhookController(
        ApplicationDbContext context,
        WebhookSignatureService signatureService,
        ILogger<WebhookController> logger,
        IConfiguration configuration)
    {
        _context = context;
        _signatureService = signatureService;
        _logger = logger;
        _configuration = configuration;
    }

    /// <summary>
    /// Webhook endpoint for trade opened event
    /// </summary>
    /// <param name="payload">Trade opened webhook payload</param>
    /// <returns>Webhook response</returns>
    [HttpPost("trade-opened")]
    public async Task<IActionResult> TradeOpened([FromBody] TradeOpenedWebhookDto payload)
    {
        try
        {
            // Verify signature (in production)
            // var signature = Request.Headers["X-Webhook-Signature"].ToString();
            // var secret = _configuration["Webhook:Secret"] ?? throw new Exception("Webhook secret not configured");
            // if (!_signatureService.VerifySignatureFromObject(payload, signature, secret))
            // {
            //     _logger.LogWarning("Invalid webhook signature for trade-opened");
            //     return Unauthorized(new { error = "Invalid signature" });
            // }

            _logger.LogInformation("Processing trade-opened webhook for ExternalTradeId: {ExternalTradeId}", payload.ExternalTradeId);

            // Verify portfolio exists
            var portfolio = await _context.Portfolios.FindAsync(payload.PortfolioId);
            if (portfolio == null)
            {
                _logger.LogWarning("Portfolio not found: {PortfolioId}", payload.PortfolioId);
                return NotFound(new { error = $"Portfolio {payload.PortfolioId} not found" });
            }

            // Parse enums
            if (!Enum.TryParse<TradeType>(payload.Type, out var tradeType))
                return BadRequest(new { error = $"Invalid trade type: {payload.Type}" });

            if (!Enum.TryParse<TradeDirection>(payload.Direction, out var tradeDirection))
                return BadRequest(new { error = $"Invalid trade direction: {payload.Direction}" });

            // Create trade
            var trade = new Trade
            {
                Id = Guid.NewGuid(),
                PortfolioId = payload.PortfolioId,
                Symbol = payload.Symbol,
                Type = tradeType,
                Direction = tradeDirection,
                Amount = payload.Amount,
                EntryPrice = payload.EntryPrice,
                Stake = payload.Stake,
                StopLoss = payload.StopLoss,
                TakeProfit = payload.TakeProfit,
                Status = TradeStatus.Open,
                EntryTime = payload.Timestamp,
                Strategy = payload.Strategy,
                Signal = payload.Signal,
                BotId = payload.BotId,
                ExternalTradeId = payload.ExternalTradeId
            };

            _context.Trades.Add(trade);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Trade created successfully: {TradeId}", trade.Id);

            return Ok(new WebhookResponseDto
            {
                Success = true,
                Message = "Trade created successfully",
                EntityId = trade.Id
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing trade-opened webhook");
            return StatusCode(500, new WebhookResponseDto
            {
                Success = false,
                Message = "An error occurred while processing the webhook"
            });
        }
    }

    /// <summary>
    /// Webhook endpoint for trade closed event
    /// </summary>
    [HttpPost("trade-closed")]
    public async Task<IActionResult> TradeClosed([FromBody] TradeClosedWebhookDto payload)
    {
        try
        {
            _logger.LogInformation("Processing trade-closed webhook for ExternalTradeId: {ExternalTradeId}", payload.ExternalTradeId);

            // Find trade by external ID
            var trade = await _context.Trades
                .Include(t => t.Portfolio)
                .FirstOrDefaultAsync(t => t.ExternalTradeId == payload.ExternalTradeId);

            if (trade == null)
            {
                _logger.LogWarning("Trade not found: {ExternalTradeId}", payload.ExternalTradeId);
                return NotFound(new { error = $"Trade with ExternalTradeId {payload.ExternalTradeId} not found" });
            }

            // Update trade
            trade.ExitPrice = payload.ExitPrice;
            trade.ExitTime = payload.Timestamp;
            trade.Profit = payload.Profit;
            trade.Loss = payload.Loss;
            trade.Status = TradeStatus.Closed;
            if (!string.IsNullOrEmpty(payload.CloseReason))
                trade.Notes = trade.Notes + $" Close reason: {payload.CloseReason}";

            // Update portfolio metrics
            if (payload.Profit.HasValue && payload.Profit > 0)
                trade.Portfolio.TotalProfit += payload.Profit.Value;
            else if (payload.Loss.HasValue && payload.Loss > 0)
                trade.Portfolio.TotalLoss += payload.Loss.Value;

            trade.Portfolio.NetProfit = trade.Portfolio.TotalProfit - trade.Portfolio.TotalLoss;
            trade.Portfolio.ProfitPercentage = trade.Portfolio.InitialInvestment > 0
                ? (trade.Portfolio.NetProfit / trade.Portfolio.InitialInvestment) * 100
                : 0;
            trade.Portfolio.CurrentValue = trade.Portfolio.InitialInvestment + trade.Portfolio.NetProfit;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Trade closed successfully: {TradeId}", trade.Id);

            return Ok(new WebhookResponseDto
            {
                Success = true,
                Message = "Trade closed successfully",
                EntityId = trade.Id
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing trade-closed webhook");
            return StatusCode(500, new WebhookResponseDto
            {
                Success = false,
                Message = "An error occurred while processing the webhook"
            });
        }
    }

    /// <summary>
    /// Webhook endpoint for trade updated event
    /// </summary>
    [HttpPost("trade-updated")]
    public async Task<IActionResult> TradeUpdated([FromBody] TradeUpdatedWebhookDto payload)
    {
        try
        {
            _logger.LogInformation("Processing trade-updated webhook for ExternalTradeId: {ExternalTradeId}", payload.ExternalTradeId);

            var trade = await _context.Trades
                .FirstOrDefaultAsync(t => t.ExternalTradeId == payload.ExternalTradeId);

            if (trade == null)
            {
                _logger.LogWarning("Trade not found: {ExternalTradeId}", payload.ExternalTradeId);
                return NotFound(new { error = $"Trade with ExternalTradeId {payload.ExternalTradeId} not found" });
            }

            // Update trade
            if (payload.StopLoss.HasValue)
                trade.StopLoss = payload.StopLoss;

            if (payload.TakeProfit.HasValue)
                trade.TakeProfit = payload.TakeProfit;

            if (!string.IsNullOrEmpty(payload.Notes))
                trade.Notes = payload.Notes;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Trade updated successfully: {TradeId}", trade.Id);

            return Ok(new WebhookResponseDto
            {
                Success = true,
                Message = "Trade updated successfully",
                EntityId = trade.Id
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing trade-updated webhook");
            return StatusCode(500, new WebhookResponseDto
            {
                Success = false,
                Message = "An error occurred while processing the webhook"
            });
        }
    }

    /// <summary>
    /// Webhook endpoint for risk alert event
    /// </summary>
    [HttpPost("risk-alert")]
    public async Task<IActionResult> RiskAlert([FromBody] RiskAlertWebhookDto payload)
    {
        try
        {
            _logger.LogWarning("Processing risk-alert webhook for PortfolioId: {PortfolioId}, AlertType: {AlertType}",
                payload.PortfolioId, payload.AlertType);

            // Verify portfolio exists
            var portfolio = await _context.Portfolios
                .Include(p => p.Investor)
                .FirstOrDefaultAsync(p => p.Id == payload.PortfolioId);

            if (portfolio == null)
            {
                _logger.LogWarning("Portfolio not found: {PortfolioId}", payload.PortfolioId);
                return NotFound(new { error = $"Portfolio {payload.PortfolioId} not found" });
            }

            // Parse notification type and priority
            var notificationType = NotificationType.RiskAlert;
            var priority = payload.Severity switch
            {
                "Critical" => NotificationPriority.Critical,
                "High" => NotificationPriority.High,
                "Medium" => NotificationPriority.Normal,
                _ => NotificationPriority.Low
            };

            // Create notification
            var notification = new Notification
            {
                Id = Guid.NewGuid(),
                InvestorId = portfolio.InvestorId,
                Title = $"Risk Alert: {payload.AlertType}",
                Message = payload.Message,
                Type = notificationType,
                Priority = priority,
                IsRead = false,
                CreatedAt = payload.Timestamp
            };

            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Risk alert notification created: {NotificationId}", notification.Id);

            return Ok(new WebhookResponseDto
            {
                Success = true,
                Message = "Risk alert notification created",
                EntityId = notification.Id
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing risk-alert webhook");
            return StatusCode(500, new WebhookResponseDto
            {
                Success = false,
                Message = "An error occurred while processing the webhook"
            });
        }
    }
}

