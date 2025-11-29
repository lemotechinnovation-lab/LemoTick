using MediatR;
using AutoMapper;
using Microsoft.Extensions.Logging;
using InvestorManagementSystem.Application.Queries.PerformanceMetrics;
using InvestorManagementSystem.Application.DTOs;
using InvestorManagementSystem.Application.Interfaces;

namespace InvestorManagementSystem.Application.Handlers.PerformanceMetrics;

public class GetAllPerformanceMetricsHandler : IRequestHandler<GetAllPerformanceMetricsQuery, IEnumerable<PerformanceMetricDto>>
{
    private readonly IPerformanceMetricRepository _performanceMetricRepository;
    private readonly IMapper _mapper;
    private readonly ILogger<GetAllPerformanceMetricsHandler> _logger;

    public GetAllPerformanceMetricsHandler(
        IPerformanceMetricRepository performanceMetricRepository,
        IMapper mapper,
        ILogger<GetAllPerformanceMetricsHandler> logger)
    {
        _performanceMetricRepository = performanceMetricRepository;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<IEnumerable<PerformanceMetricDto>> Handle(GetAllPerformanceMetricsQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Getting all performance metrics");

        var performanceMetrics = await _performanceMetricRepository.GetAllAsync();
        return _mapper.Map<IEnumerable<PerformanceMetricDto>>(performanceMetrics);
    }
}

