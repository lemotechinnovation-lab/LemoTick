using Microsoft.Extensions.DependencyInjection;
using MediatR;
using FluentValidation;
using System.Reflection;
using InvestorManagementSystem.Application.Mappings;
using InvestorManagementSystem.Application.Services;
using InvestorManagementSystem.Application.Interfaces;

namespace InvestorManagementSystem.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        // Add MediatR
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly()));

        // Add AutoMapper
        services.AddAutoMapper(typeof(MappingProfile));

        // Add FluentValidation
        services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());

        // Add Application Services
        services.AddScoped<CsvExportService>();
        services.AddScoped<WebhookSignatureService>();
        services.AddScoped<IEmailNotificationService, EmailNotificationService>();
        services.AddScoped<TwoFactorAuthService>();
        services.AddScoped<StatementGenerationService>();

        // Bot Management Services
        services.AddSingleton<IBotManagementService, BotManagementService>();
        services.AddSingleton<IBotConfigurationService, BotConfigurationService>();

        // Social Networking Service
        services.AddScoped<ISocialService, SocialService>();

        return services;
    }
}
