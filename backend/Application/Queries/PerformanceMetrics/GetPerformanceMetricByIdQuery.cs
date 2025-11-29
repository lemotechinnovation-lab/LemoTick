using MediatR;
using InvestorManagementSystem.Application.DTOs;

namespace InvestorManagementSystem.Application.Queries.PerformanceMetrics;

public record GetPerformanceMetricByIdQuery(Guid Id) : IRequest<PerformanceMetricDto?>;

