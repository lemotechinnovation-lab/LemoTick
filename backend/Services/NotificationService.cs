using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace InvestorManagementSystem.Services;

public class NotificationService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<NotificationService> _logger;
    private readonly TimeSpan _period = TimeSpan.FromMinutes(1); // Check every minute

    public NotificationService(
        IServiceProvider serviceProvider,
        ILogger<NotificationService> logger)
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
                _logger.LogInformation("Processing notifications");

                using var scope = _serviceProvider.CreateScope();

                // Process pending notifications
                // This would check for new trades, performance updates, etc.
                _logger.LogInformation("Notifications processed");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing notifications");
            }

            try
            {
                await Task.Delay(_period, stoppingToken);
            }
            catch (OperationCanceledException)
            {
                break;
            }
        }
    }
}
