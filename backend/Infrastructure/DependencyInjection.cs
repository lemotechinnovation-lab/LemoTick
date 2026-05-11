using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Http;
using InvestorManagementSystem.Application.Interfaces;
using InvestorManagementSystem.Infrastructure.Data;
using InvestorManagementSystem.Infrastructure.Repositories;
using InvestorManagementSystem.Infrastructure.Middleware;
using InvestorManagementSystem.Infrastructure.Services;

namespace InvestorManagementSystem.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        // Register Audit Interceptor (HttpContextAccessor registered in API layer)
        services.AddScoped<AuditInterceptor>();

        // Database - Support both SQL Server and PostgreSQL
        var connectionString = configuration.GetConnectionString("DefaultConnection");
        var databaseProvider = configuration["DatabaseProvider"] ?? "PostgreSQL";

        services.AddDbContext<ApplicationDbContext>((serviceProvider, options) =>
        {
            var interceptor = serviceProvider.GetService<AuditInterceptor>();
            if (interceptor != null)
            {
                options.AddInterceptors(interceptor);
            }

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
        services.AddScoped<ITransactionRepository, TransactionRepository>();
        services.AddScoped<IPerformanceMetricRepository, PerformanceMetricRepository>();
        services.AddScoped<INotificationRepository, NotificationRepository>();

        // Social Networking Repositories
        services.AddScoped<IUserProfileRepository, UserProfileRepository>();
        services.AddScoped<IFriendshipRepository, FriendshipRepository>();
        services.AddScoped<IBlockedUserRepository, BlockedUserRepository>();
        services.AddScoped<IFriendListRepository, FriendListRepository>();
        services.AddScoped<IPrivacySettingsRepository, PrivacySettingsRepository>();
        services.AddScoped<IFriendSuggestionRepository, FriendSuggestionRepository>();
        services.AddScoped<ISocialStatisticsRepository, SocialStatisticsRepository>();

        // File Storage Service
        services.AddSingleton<IFileStorageService, LocalFileStorageService>();

        // Referral Service
        services.AddScoped<ReferralService>();

        // Payment Service
        services.AddScoped<PayFastService>();

        // Bank Verification Service
        services.AddScoped<BankVerificationService>();

        return services;
    }
}
