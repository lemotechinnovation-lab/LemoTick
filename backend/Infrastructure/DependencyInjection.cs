using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using InvestorManagementSystem.Application.Interfaces;
using InvestorManagementSystem.Infrastructure.Data;
using InvestorManagementSystem.Infrastructure.Repositories;

namespace InvestorManagementSystem.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        // Database - Support both SQL Server and PostgreSQL
        var connectionString = configuration.GetConnectionString("DefaultConnection");
        var databaseProvider = configuration["DatabaseProvider"] ?? "PostgreSQL";

        services.AddDbContext<ApplicationDbContext>(options =>
        {
            if (databaseProvider.Equals("PostgreSQL", StringComparison.OrdinalIgnoreCase))
            {
                options.UseNpgsql(connectionString, b =>
                    b.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName));
            }
            else
            {
                options.UseSqlServer(connectionString, b =>
                    b.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName));
            }
        });

        // Repositories
        services.AddScoped<IInvestorRepository, InvestorRepository>();
        services.AddScoped<IPortfolioRepository, PortfolioRepository>();
        services.AddScoped<ITradeRepository, TradeRepository>();

        return services;
    }
}
