using MediatR;
using InvestorManagementSystem.Application.DTOs;

namespace InvestorManagementSystem.Application.Queries.PerformanceMetrics;

public record GetPerformanceMetricsByPortfolioQuery(Guid PortfolioId) : IRequest<IEnumerable<PerformanceMetricDto>>;

