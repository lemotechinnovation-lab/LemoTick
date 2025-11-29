using MediatR;
using AutoMapper;
using Microsoft.Extensions.Logging;
using InvestorManagementSystem.Application.Commands.PerformanceMetrics;
using InvestorManagementSystem.Application.DTOs;
using InvestorManagementSystem.Application.Interfaces;
using InvestorManagementSystem.Core.Entities;

namespace InvestorManagementSystem.Application.Handlers.PerformanceMetrics;

public class CreatePerformanceMetricHandler : IRequestHandler<CreatePerformanceMetricCommand, PerformanceMetricDto>
{
    private readonly IPerformanceMetricRepository _performanceMetricRepository;
    private readonly IMapper _mapper;
    private readonly ILogger<CreatePerformanceMetricHandler> _logger;

    public CreatePerformanceMetricHandler(
        IPerformanceMetricRepository performanceMetricRepository,
        IMapper mapper,
        ILogger<CreatePerformanceMetricHandler> logger)
    {
        _performanceMetricRepository = performanceMetricRepository;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<PerformanceMetricDto> Handle(CreatePerformanceMetricCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Creating performance metric for portfolio: {PortfolioId}", request.CreatePerformanceMetricDto.PortfolioId);

        var performanceMetric = _mapper.Map<PerformanceMetric>(request.CreatePerformanceMetricDto);
        performanceMetric.Id = Guid.NewGuid();
        performanceMetric.CreatedAt = DateTime.UtcNow;

        var createdPerformanceMetric = await _performanceMetricRepository.AddAsync(performanceMetric);

        _logger.LogInformation("Performance metric created with ID: {PerformanceMetricId}", createdPerformanceMetric.Id);

        return _mapper.Map<PerformanceMetricDto>(createdPerformanceMetric);
    }
}

