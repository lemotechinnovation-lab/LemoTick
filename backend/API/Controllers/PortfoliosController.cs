using Microsoft.AspNetCore.Mvc;
using InvestorManagementSystem.Application.DTOs;
using InvestorManagementSystem.Application.Interfaces;

namespace InvestorManagementSystem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PortfoliosController : ControllerBase
{
    private readonly IPortfolioService _portfolioService;
    private readonly ILogger<PortfoliosController> _logger;

    public PortfoliosController(IPortfolioService portfolioService, ILogger<PortfoliosController> logger)
    {
        _portfolioService = portfolioService;
        _logger = logger;
    }

    /// <summary>
    /// Get all portfolios
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<PortfolioDto>>> GetPortfolios()
    {
        try
        {
            var portfolios = await _portfolioService.GetAllPortfoliosAsync();
            return Ok(portfolios);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving portfolios");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Get portfolio by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<PortfolioDto>> GetPortfolio(Guid id)
    {
        try
        {
            var portfolio = await _portfolioService.GetPortfolioByIdAsync(id);
            if (portfolio == null)
                return NotFound();

            return Ok(portfolio);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving portfolio {PortfolioId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Create new portfolio
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<PortfolioDto>> CreatePortfolio([FromBody] CreatePortfolioDto createPortfolioDto)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var portfolio = await _portfolioService.CreatePortfolioAsync(createPortfolioDto);
            return CreatedAtAction(nameof(GetPortfolio), new { id = portfolio.Id }, portfolio);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating portfolio");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Update portfolio
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<PortfolioDto>> UpdatePortfolio(Guid id, [FromBody] UpdatePortfolioDto updatePortfolioDto)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var portfolio = await _portfolioService.UpdatePortfolioAsync(id, updatePortfolioDto);
            if (portfolio == null)
                return NotFound();

            return Ok(portfolio);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating portfolio {PortfolioId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Get portfolio performance
    /// </summary>
    [HttpGet("{id}/performance")]
    public async Task<ActionResult<PerformanceDto>> GetPortfolioPerformance(Guid id)
    {
        try
        {
            var performance = await _portfolioService.GetPortfolioPerformanceAsync(id);
            if (performance == null)
                return NotFound();

            return Ok(performance);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving performance for portfolio {PortfolioId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Get portfolio risk limits
    /// </summary>
    [HttpGet("{id}/risk-limits")]
    public async Task<ActionResult<RiskLimitsDto>> GetPortfolioRiskLimits(Guid id)
    {
        try
        {
            var riskLimits = await _portfolioService.GetPortfolioRiskLimitsAsync(id);
            if (riskLimits == null)
                return NotFound();

            return Ok(riskLimits);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving risk limits for portfolio {PortfolioId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Update portfolio risk limits
    /// </summary>
    [HttpPut("{id}/risk-limits")]
    public async Task<ActionResult<RiskLimitsDto>> UpdatePortfolioRiskLimits(Guid id, [FromBody] RiskLimitsDto riskLimitsDto)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var riskLimits = await _portfolioService.UpdatePortfolioRiskLimitsAsync(id, riskLimitsDto);
            if (riskLimits == null)
                return NotFound();

            return Ok(riskLimits);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating risk limits for portfolio {PortfolioId}", id);
            return StatusCode(500, "Internal server error");
        }
    }
}
