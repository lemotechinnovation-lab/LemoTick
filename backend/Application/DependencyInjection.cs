using Microsoft.Extensions.DependencyInjection;
using MediatR;
using FluentValidation;
using System.Reflection;
using InvestorManagementSystem.Application.Mappings;

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

        return services;
    }
}
