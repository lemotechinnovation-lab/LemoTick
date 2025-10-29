using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Http;

namespace InvestorManagementSystem.BotIntegration;

public static class DependencyInjection
{
    public static IServiceCollection AddBotIntegrationServices(this IServiceCollection services)
    {
        services.AddHttpClient<BotIntegrationService>();
        services.AddScoped<BotIntegrationService>();

        return services;
    }
}
