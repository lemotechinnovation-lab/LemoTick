using Microsoft.AspNetCore.Mvc;
using MediatR;
using InvestorManagementSystem.Application.Commands.Portfolios;
using InvestorManagementSystem.Application.Queries.Portfolios;
using InvestorManagementSystem.Application.DTOs;

namespace InvestorManagementSystem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PortfoliosController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<PortfoliosController> _logger;

    public PortfoliosController(IMediator mediator, ILogger<PortfoliosController> logger)
    {
        _mediator = mediator;
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
            var portfolios = await _mediator.Send(new GetAllPortfoliosQuery());
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
            var portfolio = await _mediator.Send(new GetPortfolioByIdQuery(id));
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
            var portfolio = await _mediator.Send(new CreatePortfolioCommand(createPortfolioDto));
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
            var portfolio = await _mediator.Send(new UpdatePortfolioCommand(id, updatePortfolioDto));
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
}