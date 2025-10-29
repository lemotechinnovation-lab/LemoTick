using Microsoft.AspNetCore.Mvc;
using MediatR;
using InvestorManagementSystem.Application.Commands.Trades;
using InvestorManagementSystem.Application.Queries.Trades;
using InvestorManagementSystem.Application.DTOs;

namespace InvestorManagementSystem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TradesController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<TradesController> _logger;

    public TradesController(IMediator mediator, ILogger<TradesController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Get all trades
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<TradeDto>>> GetTrades()
    {
        try
        {
            var trades = await _mediator.Send(new GetAllTradesQuery());
            return Ok(trades);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving trades");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Get trade by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<TradeDto>> GetTrade(Guid id)
    {
        try
        {
            var trade = await _mediator.Send(new GetTradeByIdQuery(id));
            if (trade == null)
                return NotFound();

            return Ok(trade);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving trade {TradeId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Create new trade
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<TradeDto>> CreateTrade([FromBody] CreateTradeDto createTradeDto)
    {
        try
        {
            var trade = await _mediator.Send(new CreateTradeCommand(createTradeDto));
            return CreatedAtAction(nameof(GetTrade), new { id = trade.Id }, trade);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating trade");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Update trade
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<TradeDto>> UpdateTrade(Guid id, [FromBody] UpdateTradeDto updateTradeDto)
    {
        try
        {
            var trade = await _mediator.Send(new UpdateTradeCommand(id, updateTradeDto));
            if (trade == null)
                return NotFound();

            return Ok(trade);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating trade {TradeId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Get trades by portfolio ID
    /// </summary>
    [HttpGet("portfolio/{portfolioId}")]
    public async Task<ActionResult<IEnumerable<TradeDto>>> GetTradesByPortfolio(Guid portfolioId)
    {
        try
        {
            var trades = await _mediator.Send(new GetTradesByPortfolioQuery(portfolioId));
            return Ok(trades);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving trades for portfolio {PortfolioId}", portfolioId);
            return StatusCode(500, "Internal server error");
        }
    }
}