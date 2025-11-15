using Microsoft.AspNetCore.Mvc;
using MediatR;
using InvestorManagementSystem.Application.Commands.Investors;
using InvestorManagementSystem.Application.Queries.Investors;
using InvestorManagementSystem.Application.DTOs;

namespace InvestorManagementSystem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InvestorsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<InvestorsController> _logger;

    public InvestorsController(IMediator mediator, ILogger<InvestorsController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Get all investors
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<InvestorDto>>> GetInvestors()
    {
        try
        {
            var investors = await _mediator.Send(new GetAllInvestorsQuery());
            return Ok(investors);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving investors");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Get investor by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<InvestorDto>> GetInvestor(Guid id)
    {
        try
        {
            var investor = await _mediator.Send(new GetInvestorByIdQuery(id));
            if (investor == null)
                return NotFound();

            return Ok(investor);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving investor {InvestorId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Create new investor
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<InvestorDto>> CreateInvestor([FromBody] CreateInvestorDto createInvestorDto)
    {
        try
        {
            var investor = await _mediator.Send(new CreateInvestorCommand(createInvestorDto));
            return CreatedAtAction(nameof(GetInvestor), new { id = investor.Id }, investor);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating investor");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Update investor
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<InvestorDto>> UpdateInvestor(Guid id, [FromBody] UpdateInvestorDto updateInvestorDto)
    {
        try
        {
            var investor = await _mediator.Send(new UpdateInvestorCommand(id, updateInvestorDto));
            if (investor == null)
                return NotFound();

            return Ok(investor);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating investor {InvestorId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Delete investor
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteInvestor(Guid id)
    {
        try
        {
            var result = await _mediator.Send(new DeleteInvestorCommand(id));
            if (!result)
                return NotFound();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting investor {InvestorId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Get investor portfolios
    /// </summary>
    [HttpGet("{id}/portfolios")]
    public async Task<ActionResult<IEnumerable<PortfolioDto>>> GetInvestorPortfolios(Guid id)
    {
        try
        {
            var portfolios = await _mediator.Send(new GetInvestorPortfoliosQuery(id));
            return Ok(portfolios);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving portfolios for investor {InvestorId}", id);
            return StatusCode(500, "Internal server error");
        }
    }
}