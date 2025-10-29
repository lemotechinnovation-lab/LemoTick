using Microsoft.Extensions.DependencyInjection;

namespace InvestorManagementSystem.Services;

public static class DependencyInjection
{
    public static IServiceCollection AddServices(this IServiceCollection services)
    {
        // Background services are registered in Program.cs
        return services;
    }
}
