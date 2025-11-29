using MediatR;
using AutoMapper;
using Microsoft.Extensions.Logging;
using InvestorManagementSystem.Application.Queries.PerformanceMetrics;
using InvestorManagementSystem.Application.DTOs;
using InvestorManagementSystem.Application.Interfaces;

namespace InvestorManagementSystem.Application.Handlers.PerformanceMetrics;

public class GetPerformanceMetricByIdHandler : IRequestHandler<GetPerformanceMetricByIdQuery, PerformanceMetricDto?>
{
    private readonly IPerformanceMetricRepository _performanceMetricRepository;
    private readonly IMapper _mapper;
    private readonly ILogger<GetPerformanceMetricByIdHandler> _logger;

    public GetPerformanceMetricByIdHandler(
        IPerformanceMetricRepository performanceMetricRepository,
        IMapper mapper,
        ILogger<GetPerformanceMetricByIdHandler> logger)
    {
        _performanceMetricRepository = performanceMetricRepository;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<PerformanceMetricDto?> Handle(GetPerformanceMetricByIdQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Getting performance metric by ID: {PerformanceMetricId}", request.Id);

        var performanceMetric = await _performanceMetricRepository.GetByIdAsync(request.Id);
        return performanceMetric != null ? _mapper.Map<PerformanceMetricDto>(performanceMetric) : null;
    }
}

