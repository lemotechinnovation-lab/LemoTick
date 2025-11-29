using MediatR;
using InvestorManagementSystem.Application.DTOs;

namespace InvestorManagementSystem.Application.Commands.PerformanceMetrics;

public record CreatePerformanceMetricCommand(CreatePerformanceMetricDto CreatePerformanceMetricDto) : IRequest<PerformanceMetricDto>;

