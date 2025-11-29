using Microsoft.AspNetCore.Mvc;
using MediatR;
using InvestorManagementSystem.Application.Commands.Transactions;
using InvestorManagementSystem.Application.Queries.Transactions;
using InvestorManagementSystem.Application.DTOs;
using InvestorManagementSystem.Application.Services;
using Microsoft.EntityFrameworkCore;
using InvestorManagementSystem.Infrastructure.Data;

namespace InvestorManagementSystem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TransactionsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<TransactionsController> _logger;
    private readonly CsvExportService _csvExportService;
    private readonly ApplicationDbContext _context;

    public TransactionsController(IMediator mediator, ILogger<TransactionsController> logger, CsvExportService csvExportService, ApplicationDbContext context)
    {
        _mediator = mediator;
        _logger = logger;
        _csvExportService = csvExportService;
        _context = context;
    }

    /// <summary>
    /// Get all transactions
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<TransactionDto>>> GetTransactions()
    {
        try
        {
            var transactions = await _mediator.Send(new GetAllTransactionsQuery());
            return Ok(transactions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving transactions");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Get transaction by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<TransactionDto>> GetTransaction(Guid id)
    {
        try
        {
            var transaction = await _mediator.Send(new GetTransactionByIdQuery(id));
            if (transaction == null)
                return NotFound();

            return Ok(transaction);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving transaction {TransactionId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Create new transaction
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<TransactionDto>> CreateTransaction([FromBody] CreateTransactionDto createTransactionDto)
    {
        try
        {
            var transaction = await _mediator.Send(new CreateTransactionCommand(createTransactionDto));
            return CreatedAtAction(nameof(GetTransaction), new { id = transaction.Id }, transaction);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating transaction");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Update transaction
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<TransactionDto>> UpdateTransaction(Guid id, [FromBody] UpdateTransactionDto updateTransactionDto)
    {
        try
        {
            var transaction = await _mediator.Send(new UpdateTransactionCommand(id, updateTransactionDto));
            if (transaction == null)
                return NotFound();

            return Ok(transaction);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating transaction {TransactionId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Get transactions by investor ID
    /// </summary>
    [HttpGet("investor/{investorId}")]
    public async Task<ActionResult<IEnumerable<TransactionDto>>> GetTransactionsByInvestor(Guid investorId)
    {
        try
        {
            var transactions = await _mediator.Send(new GetTransactionsByInvestorQuery(investorId));
            return Ok(transactions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving transactions for investor {InvestorId}", investorId);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Get transactions by portfolio ID
    /// </summary>
    [HttpGet("portfolio/{portfolioId}")]
    public async Task<ActionResult<IEnumerable<TransactionDto>>> GetTransactionsByPortfolio(Guid portfolioId)
    {
        try
        {
            var transactions = await _mediator.Send(new GetTransactionsByPortfolioQuery(portfolioId));
            return Ok(transactions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving transactions for portfolio {PortfolioId}", portfolioId);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Export transactions to CSV
    /// </summary>
    /// <param name="investorId">Optional: Filter by investor ID</param>
    /// <param name="startDate">Optional: Filter by start date</param>
    /// <param name="endDate">Optional: Filter by end date</param>
    /// <returns>CSV file download</returns>
    [HttpGet("export")]
    public async Task<IActionResult> ExportTransactions(
        [FromQuery] Guid? investorId = null,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        try
        {
            var query = _context.Transactions.AsQueryable();

            // Apply filters
            if (investorId.HasValue)
                query = query.Where(t => t.InvestorId == investorId.Value);

            if (startDate.HasValue)
                query = query.Where(t => t.CreatedAt >= startDate.Value);

            if (endDate.HasValue)
                query = query.Where(t => t.CreatedAt <= endDate.Value);

            var transactions = await query
                .OrderByDescending(t => t.CreatedAt)
                .Select(t => new TransactionExportDto
                {
                    Type = t.Type.ToString(),
                    Amount = t.Amount,
                    Balance = t.Balance,
                    Currency = t.Currency,
                    Status = t.Status.ToString(),
                    Description = t.Description,
                    Reference = t.Reference,
                    CreatedAt = t.CreatedAt,
                    ProcessedAt = t.ProcessedAt,
                    PaymentMethod = t.PaymentMethod,
                    PaymentProvider = t.PaymentProvider
                })
                .ToListAsync();

            var csvData = _csvExportService.ExportTradesToCsv(transactions);
            var fileName = $"transactions_{DateTime.UtcNow:yyyyMMddHHmmss}.csv";

            return File(csvData, "text/csv", fileName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exporting transactions");
            return StatusCode(500, "Internal server error");
        }
    }
}

