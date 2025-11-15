using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using InvestorManagementSystem.Application.Interfaces;

namespace InvestorManagementSystem.Services;

public class PerformanceCalculationService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<PerformanceCalculationService> _logger;
    private readonly TimeSpan _period = TimeSpan.FromMinutes(5); // Calculate every 5 minutes

    public PerformanceCalculationService(
        IServiceProvider serviceProvider,
        ILogger<PerformanceCalculationService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                _logger.LogInformation("Starting performance calculation");

                using var scope = _serviceProvider.CreateScope();
                var portfolioRepository = scope.ServiceProvider.GetRequiredService<IPortfolioRepository>();

                // Get all portfolios and calculate performance
                var portfolios = await portfolioRepository.GetAllAsync();

                foreach (var portfolio in portfolios)
                {
                    // Calculate current value, profit, etc.
                    // This would integrate with the bot's trading results
                    _logger.LogInformation("Calculating performance for portfolio {PortfolioId}", portfolio.Id);
                }

                _logger.LogInformation("Performance calculation completed");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during performance calculation");
            }

            await Task.Delay(_period, stoppingToken);
        }
    }
}
