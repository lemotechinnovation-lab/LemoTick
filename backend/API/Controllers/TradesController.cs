using Microsoft.AspNetCore.Mvc;
using InvestorManagementSystem.Application.DTOs;
using InvestorManagementSystem.Application.Interfaces;

namespace InvestorManagementSystem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TradesController : ControllerBase
{
    private readonly ITradeService _tradeService;
    private readonly ILogger<TradesController> _logger;

    public TradesController(ITradeService tradeService, ILogger<TradesController> logger)
    {
        _tradeService = tradeService;
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
            var trades = await _tradeService.GetAllTradesAsync();
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
            var trade = await _tradeService.GetTradeByIdAsync(id);
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
    /// Create new trade (from bot)
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<TradeDto>> CreateTrade([FromBody] CreateTradeDto createTradeDto)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var trade = await _tradeService.CreateTradeAsync(createTradeDto);
            return CreatedAtAction(nameof(GetTrade), new { id = trade.Id }, trade);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating trade");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Update trade (from bot)
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<TradeDto>> UpdateTrade(Guid id, [FromBody] UpdateTradeDto updateTradeDto)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var trade = await _tradeService.UpdateTradeAsync(id, updateTradeDto);
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
    /// Get trades by portfolio
    /// </summary>
    [HttpGet("portfolio/{portfolioId}")]
    public async Task<ActionResult<IEnumerable<TradeDto>>> GetTradesByPortfolio(Guid portfolioId)
    {
        try
        {
            var trades = await _tradeService.GetTradesByPortfolioAsync(portfolioId);
            return Ok(trades);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving trades for portfolio {PortfolioId}", portfolioId);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Get active trades
    /// </summary>
    [HttpGet("active")]
    public async Task<ActionResult<IEnumerable<TradeDto>>> GetActiveTrades()
    {
        try
        {
            var trades = await _tradeService.GetActiveTradesAsync();
            return Ok(trades);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving active trades");
            return StatusCode(500, "Internal server error");
        }
    }
}
