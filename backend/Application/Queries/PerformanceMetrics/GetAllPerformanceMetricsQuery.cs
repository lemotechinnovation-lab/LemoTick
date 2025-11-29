using MediatR;
using InvestorManagementSystem.Application.DTOs;

namespace InvestorManagementSystem.Application.Queries.PerformanceMetrics;

public record GetAllPerformanceMetricsQuery() : IRequest<IEnumerable<PerformanceMetricDto>>;

