using Microsoft.AspNetCore.Mvc;
using MediatR;
using InvestorManagementSystem.Application.Commands.PerformanceMetrics;
using InvestorManagementSystem.Application.Queries.PerformanceMetrics;
using InvestorManagementSystem.Application.DTOs;

namespace InvestorManagementSystem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PerformanceMetricsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<PerformanceMetricsController> _logger;

    public PerformanceMetricsController(IMediator mediator, ILogger<PerformanceMetricsController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Get all performance metrics
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<PerformanceMetricDto>>> GetPerformanceMetrics()
    {
        try
        {
            var metrics = await _mediator.Send(new GetAllPerformanceMetricsQuery());
            return Ok(metrics);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving performance metrics");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Get performance metric by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<PerformanceMetricDto>> GetPerformanceMetric(Guid id)
    {
        try
        {
            var metric = await _mediator.Send(new GetPerformanceMetricByIdQuery(id));
            if (metric == null)
                return NotFound();

            return Ok(metric);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving performance metric {PerformanceMetricId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Create new performance metric
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<PerformanceMetricDto>> CreatePerformanceMetric([FromBody] CreatePerformanceMetricDto createPerformanceMetricDto)
    {
        try
        {
            var metric = await _mediator.Send(new CreatePerformanceMetricCommand(createPerformanceMetricDto));
            return CreatedAtAction(nameof(GetPerformanceMetric), new { id = metric.Id }, metric);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating performance metric");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Get performance metrics by portfolio ID
    /// </summary>
    [HttpGet("portfolio/{portfolioId}")]
    public async Task<ActionResult<IEnumerable<PerformanceMetricDto>>> GetPerformanceMetricsByPortfolio(Guid portfolioId)
    {
        try
        {
            var metrics = await _mediator.Send(new GetPerformanceMetricsByPortfolioQuery(portfolioId));
            return Ok(metrics);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving performance metrics for portfolio {PortfolioId}", portfolioId);
            return StatusCode(500, "Internal server error");
        }
    }
}

