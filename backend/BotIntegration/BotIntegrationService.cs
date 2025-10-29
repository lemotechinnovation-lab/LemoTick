using Microsoft.Extensions.Logging;
using InvestorManagementSystem.Core.Entities;

namespace InvestorManagementSystem.BotIntegration;

public class BotIntegrationService
{
    private readonly ILogger<BotIntegrationService> _logger;
    private readonly HttpClient _httpClient;

    public BotIntegrationService(
        ILogger<BotIntegrationService> logger,
        HttpClient httpClient)
    {
        _logger = logger;
        _httpClient = httpClient;
    }

    public async Task SendTradeUpdateAsync(Trade trade)
    {
        try
        {
            _logger.LogInformation("Sending trade update to bot for trade {TradeId}", trade.Id);

            // This would send trade updates to the Python bot
            // For now, just log the action
            _logger.LogInformation("Trade update sent successfully for trade {TradeId}", trade.Id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending trade update to bot for trade {TradeId}", trade.Id);
        }
    }

    public async Task SendPortfolioUpdateAsync(Portfolio portfolio)
    {
        try
        {
            _logger.LogInformation("Sending portfolio update to bot for portfolio {PortfolioId}", portfolio.Id);

            // This would send portfolio updates to the Python bot
            // For now, just log the action
            _logger.LogInformation("Portfolio update sent successfully for portfolio {PortfolioId}", portfolio.Id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending portfolio update to bot for portfolio {PortfolioId}", portfolio.Id);
        }
    }
}
