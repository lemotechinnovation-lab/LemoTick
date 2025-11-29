using Microsoft.AspNetCore.SignalR;
using InvestorManagementSystem.API.Hubs;

namespace InvestorManagementSystem.API.Services;

public interface ITradingBroadcastService
{
    Task BroadcastTickUpdate(string symbol, decimal price, long timestamp);
    Task BroadcastTradeOpened(Guid portfolioId, string investorId, object tradeData);
    Task BroadcastTradeClosed(Guid portfolioId, string investorId, object tradeData);
    Task BroadcastPortfolioUpdate(Guid portfolioId, string investorId, object portfolioData);
    Task BroadcastAccountBalance(string investorId, decimal balance, string currency);
}

public class TradingBroadcastService : ITradingBroadcastService
{
    private readonly IHubContext<TradingHub> _hubContext;
    private readonly ILogger<TradingBroadcastService> _logger;

    public TradingBroadcastService(
        IHubContext<TradingHub> hubContext,
        ILogger<TradingBroadcastService> logger)
    {
        _hubContext = hubContext;
        _logger = logger;
    }

    public async Task BroadcastTickUpdate(string symbol, decimal price, long timestamp)
    {
        try
        {
            var tickData = new
            {
                symbol,
                price,
                timestamp,
                dateTime = DateTimeOffset.FromUnixTimeSeconds(timestamp).DateTime
            };

            // Broadcast to all connected clients
            await _hubContext.Clients.All.SendAsync("ReceiveTickUpdate", tickData);

            _logger.LogDebug("Broadcast tick update: {Symbol} @ {Price}", symbol, price);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error broadcasting tick update");
        }
    }

    public async Task BroadcastTradeOpened(Guid portfolioId, string investorId, object tradeData)
    {
        try
        {
            // Send to specific investor
            await _hubContext.Clients.Group($"investor_{investorId}")
                .SendAsync("ReceiveTradeOpened", tradeData);

            // Send to portfolio subscribers
            await _hubContext.Clients.Group($"portfolio_{portfolioId}")
                .SendAsync("ReceiveTradeOpened", tradeData);

            // Send to all trades subscribers (admin view)
            await _hubContext.Clients.Group("all_trades")
                .SendAsync("ReceiveTradeOpened", tradeData);

            _logger.LogInformation("Broadcast trade opened for investor {InvestorId}, portfolio {PortfolioId}",
                investorId, portfolioId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error broadcasting trade opened");
        }
    }

    public async Task BroadcastTradeClosed(Guid portfolioId, string investorId, object tradeData)
    {
        try
        {
            // Send to specific investor
            await _hubContext.Clients.Group($"investor_{investorId}")
                .SendAsync("ReceiveTradeClosed", tradeData);

            // Send to portfolio subscribers
            await _hubContext.Clients.Group($"portfolio_{portfolioId}")
                .SendAsync("ReceiveTradeClosed", tradeData);

            // Send to all trades subscribers (admin view)
            await _hubContext.Clients.Group("all_trades")
                .SendAsync("ReceiveTradeClosed", tradeData);

            _logger.LogInformation("Broadcast trade closed for investor {InvestorId}, portfolio {PortfolioId}",
                investorId, portfolioId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error broadcasting trade closed");
        }
    }

    public async Task BroadcastPortfolioUpdate(Guid portfolioId, string investorId, object portfolioData)
    {
        try
        {
            // Send to specific investor
            await _hubContext.Clients.Group($"investor_{investorId}")
                .SendAsync("ReceivePortfolioUpdate", portfolioData);

            // Send to portfolio subscribers
            await _hubContext.Clients.Group($"portfolio_{portfolioId}")
                .SendAsync("ReceivePortfolioUpdate", portfolioData);

            _logger.LogDebug("Broadcast portfolio update for portfolio {PortfolioId}", portfolioId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error broadcasting portfolio update");
        }
    }

    public async Task BroadcastAccountBalance(string investorId, decimal balance, string currency)
    {
        try
        {
            var balanceData = new
            {
                balance,
                currency,
                timestamp = DateTime.UtcNow
            };

            // Send to specific investor
            await _hubContext.Clients.Group($"investor_{investorId}")
                .SendAsync("ReceiveBalanceUpdate", balanceData);

            _logger.LogDebug("Broadcast balance update for investor {InvestorId}: {Currency} {Balance}",
                investorId, currency, balance);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error broadcasting balance update");
        }
    }
}

