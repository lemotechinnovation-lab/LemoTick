using MediatR;
using AutoMapper;
using Microsoft.Extensions.Logging;
using InvestorManagementSystem.Application.Queries.PerformanceMetrics;
using InvestorManagementSystem.Application.DTOs;
using InvestorManagementSystem.Application.Interfaces;

namespace InvestorManagementSystem.Application.Handlers.PerformanceMetrics;

public class GetPerformanceMetricsByPortfolioHandler : IRequestHandler<GetPerformanceMetricsByPortfolioQuery, IEnumerable<PerformanceMetricDto>>
{
    private readonly IPerformanceMetricRepository _performanceMetricRepository;
    private readonly IMapper _mapper;
    private readonly ILogger<GetPerformanceMetricsByPortfolioHandler> _logger;

    public GetPerformanceMetricsByPortfolioHandler(
        IPerformanceMetricRepository performanceMetricRepository,
        IMapper mapper,
        ILogger<GetPerformanceMetricsByPortfolioHandler> logger)
    {
        _performanceMetricRepository = performanceMetricRepository;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<IEnumerable<PerformanceMetricDto>> Handle(GetPerformanceMetricsByPortfolioQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Getting performance metrics for portfolio: {PortfolioId}", request.PortfolioId);

        var performanceMetrics = await _performanceMetricRepository.GetByPortfolioIdAsync(request.PortfolioId);
        return _mapper.Map<IEnumerable<PerformanceMetricDto>>(performanceMetrics);
    }
}

