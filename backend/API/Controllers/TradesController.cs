using Microsoft.AspNetCore.Mvc;
using MediatR;
using InvestorManagementSystem.Application.Commands.Trades;
using InvestorManagementSystem.Application.Queries.Trades;
using InvestorManagementSystem.Application.DTOs;
using InvestorManagementSystem.Application.Services;
using Microsoft.EntityFrameworkCore;
using InvestorManagementSystem.Infrastructure.Data;

namespace InvestorManagementSystem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TradesController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<TradesController> _logger;
    private readonly CsvExportService _csvExportService;
    private readonly ApplicationDbContext _context;

    public TradesController(IMediator mediator, ILogger<TradesController> logger, CsvExportService csvExportService, ApplicationDbContext context)
    {
        _mediator = mediator;
        _logger = logger;
        _csvExportService = csvExportService;
        _context = context;
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

    /// <summary>
    /// Export trades to CSV
    /// </summary>
    /// <param name="portfolioId">Optional: Filter by portfolio ID</param>
    /// <param name="startDate">Optional: Filter by start date</param>
    /// <param name="endDate">Optional: Filter by end date</param>
    /// <returns>CSV file download</returns>
    [HttpGet("export")]
    public async Task<IActionResult> ExportTrades(
        [FromQuery] Guid? portfolioId = null,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        try
        {
            var query = _context.Trades
                .Include(t => t.Portfolio)
                .AsQueryable();

            // Apply filters
            if (portfolioId.HasValue)
                query = query.Where(t => t.PortfolioId == portfolioId.Value);

            if (startDate.HasValue)
                query = query.Where(t => t.EntryTime >= startDate.Value);

            if (endDate.HasValue)
                query = query.Where(t => t.EntryTime <= endDate.Value);

            var trades = await query
                .OrderByDescending(t => t.EntryTime)
                .Select(t => new TradeExportDto
                {
                    Symbol = t.Symbol,
                    Type = t.Type.ToString(),
                    Direction = t.Direction.ToString(),
                    Amount = t.Amount,
                    EntryPrice = t.EntryPrice,
                    ExitPrice = t.ExitPrice,
                    Stake = t.Stake,
                    Profit = t.Profit,
                    Loss = t.Loss,
                    Status = t.Status.ToString(),
                    EntryTime = t.EntryTime,
                    ExitTime = t.ExitTime,
                    Strategy = t.Strategy,
                    Signal = t.Signal,
                    PortfolioName = t.Portfolio.Name
                })
                .ToListAsync();

            var csvData = _csvExportService.ExportTradesToCsv(trades);
            var fileName = $"trades_{DateTime.UtcNow:yyyyMMddHHmmss}.csv";

            return File(csvData, "text/csv", fileName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exporting trades");
            return StatusCode(500, "Internal server error");
        }
    }
}