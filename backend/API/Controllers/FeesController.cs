using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using InvestorManagementSystem.Infrastructure.Data;
using InvestorManagementSystem.Core.Entities;

namespace InvestorManagementSystem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Administrator")]
public class FeesController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<FeesController> _logger;

    public FeesController(ApplicationDbContext context, ILogger<FeesController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Calculate fees for a portfolio
    /// </summary>
    [HttpGet("portfolio/{portfolioId}/calculate")]
    public async Task<ActionResult> CalculateFees(Guid portfolioId)
    {
        try
        {
            var portfolio = await _context.Portfolios.FindAsync(portfolioId);
            if (portfolio == null)
                return NotFound(new { error = "Portfolio not found" });

            // Management Fee: 1.5% annual (divided by 12 for monthly)
            var managementFeeRate = 1.5m;
            var monthlyManagementFee = portfolio.CurrentValue * (managementFeeRate / 100) / 12;

            // Performance Fee: 20% of profit (high watermark concept)
            var performanceFeeRate = 20m;
            var performanceFee = portfolio.NetProfit > 0
                ? portfolio.NetProfit * (performanceFeeRate / 100)
                : 0;

            // Withdrawal Fee: 0.5% (if applicable)
            var withdrawalFeeRate = 0.5m;

            return Ok(new
            {
                portfolioId,
                portfolioName = portfolio.Name,
                currentValue = portfolio.CurrentValue,
                netProfit = portfolio.NetProfit,
                fees = new
                {
                    management = new
                    {
                        rate = managementFeeRate,
                        monthlyAmount = Math.Round(monthlyManagementFee, 2),
                        annualAmount = Math.Round(portfolio.CurrentValue * (managementFeeRate / 100), 2)
                    },
                    performance = new
                    {
                        rate = performanceFeeRate,
                        amount = Math.Round(performanceFee, 2),
                        applicable = portfolio.NetProfit > 0
                    },
                    withdrawal = new
                    {
                        rate = withdrawalFeeRate,
                        description = "Applied on withdrawal amount"
                    }
                },
                totalMonthlyFees = Math.Round(monthlyManagementFee + performanceFee, 2)
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calculating fees for portfolio {PortfolioId}", portfolioId);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Charge fee to a portfolio
    /// </summary>
    [HttpPost("portfolio/{portfolioId}/charge")]
    public async Task<ActionResult> ChargeFee(Guid portfolioId, [FromBody] ChargeFeeDto dto)
    {
        try
        {
            var portfolio = await _context.Portfolios.FindAsync(portfolioId);
            if (portfolio == null)
                return NotFound(new { error = "Portfolio not found" });

            // Validate sufficient balance
            if (portfolio.CurrentValue < dto.Amount)
                return BadRequest(new { error = "Insufficient portfolio balance to charge fee" });

            var fee = new Fee
            {
                Id = Guid.NewGuid(),
                PortfolioId = portfolioId,
                Type = dto.Type,
                Rate = dto.Rate,
                Amount = dto.Amount,
                CalculatedAt = DateTime.UtcNow,
                ChargedAt = DateTime.UtcNow,
                Status = FeeStatus.Charged,
                Description = dto.Description
            };

            // Deduct fee from portfolio
            portfolio.CurrentValue -= dto.Amount;
            portfolio.UpdatedAt = DateTime.UtcNow;

            _context.Fees.Add(fee);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Fee charged: {FeeId} of {Amount} to portfolio {PortfolioId}",
                fee.Id, dto.Amount, portfolioId);

            return CreatedAtAction(nameof(GetFee), new { id = fee.Id }, new
            {
                feeId = fee.Id,
                message = "Fee charged successfully",
                amount = fee.Amount,
                newPortfolioValue = portfolio.CurrentValue
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error charging fee to portfolio {PortfolioId}", portfolioId);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Get fee by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult> GetFee(Guid id)
    {
        try
        {
            var fee = await _context.Fees
                .Include(f => f.Portfolio)
                .FirstOrDefaultAsync(f => f.Id == id);

            if (fee == null)
                return NotFound(new { error = "Fee not found" });

            return Ok(new
            {
                fee.Id,
                fee.PortfolioId,
                PortfolioName = fee.Portfolio.Name,
                fee.Type,
                fee.Rate,
                fee.Amount,
                fee.CalculatedAt,
                fee.ChargedAt,
                fee.Status,
                fee.Description
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving fee {FeeId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Get fee history for a portfolio
    /// </summary>
    [HttpGet("portfolio/{portfolioId}/history")]
    [Authorize]  // All authenticated users can view their portfolio fees
    public async Task<ActionResult> GetFeeHistory(
        Guid portfolioId,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        try
        {
            var portfolio = await _context.Portfolios.FindAsync(portfolioId);
            if (portfolio == null)
                return NotFound(new { error = "Portfolio not found" });

            var query = _context.Fees
                .Where(f => f.PortfolioId == portfolioId);

            if (startDate.HasValue)
                query = query.Where(f => f.CalculatedAt >= startDate.Value);

            if (endDate.HasValue)
                query = query.Where(f => f.CalculatedAt <= endDate.Value);

            var fees = await query
                .OrderByDescending(f => f.CalculatedAt)
                .Select(f => new
                {
                    f.Id,
                    f.Type,
                    f.Rate,
                    f.Amount,
                    f.CalculatedAt,
                    f.ChargedAt,
                    f.Status,
                    f.Description
                })
                .ToListAsync();

            var summary = new
            {
                portfolioId,
                portfolioName = portfolio.Name,
                totalFees = fees.Where(f => f.Status == FeeStatus.Charged).Sum(f => f.Amount),
                feeCount = fees.Count,
                byType = fees
                    .Where(f => f.Status == FeeStatus.Charged)
                    .GroupBy(f => f.Type)
                    .Select(g => new
                    {
                        type = g.Key.ToString(),
                        count = g.Count(),
                        totalAmount = g.Sum(f => f.Amount)
                    }),
                fees
            };

            return Ok(summary);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving fee history for portfolio {PortfolioId}", portfolioId);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Waive a fee (Administrator only)
    /// </summary>
    [HttpPost("{id}/waive")]
    public async Task<ActionResult> WaiveFee(Guid id, [FromBody] WaiveFeeDto dto)
    {
        try
        {
            var fee = await _context.Fees
                .Include(f => f.Portfolio)
                .FirstOrDefaultAsync(f => f.Id == id);

            if (fee == null)
                return NotFound(new { error = "Fee not found" });

            if (fee.Status == FeeStatus.Charged)
            {
                // Refund the fee to portfolio
                fee.Portfolio.CurrentValue += fee.Amount;
                fee.Status = FeeStatus.Waived;
            }
            else if (fee.Status == FeeStatus.Calculated)
            {
                fee.Status = FeeStatus.Waived;
            }
            else
            {
                return BadRequest(new { error = "Fee cannot be waived in current status" });
            }

            fee.Description = $"{fee.Description} | WAIVED: {dto.Reason}";
            await _context.SaveChangesAsync();

            _logger.LogInformation("Fee {FeeId} waived for portfolio {PortfolioId}. Reason: {Reason}",
                id, fee.PortfolioId, dto.Reason);

            return Ok(new { message = "Fee waived successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error waiving fee {FeeId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Charge monthly management fees for all active portfolios (Admin/System)
    /// </summary>
    [HttpPost("charge-monthly-management")]
    public async Task<ActionResult> ChargeMonthlyManagementFees()
    {
        try
        {
            var activePortfolios = await _context.Portfolios
                .Where(p => p.Status == PortfolioStatus.Active)
                .ToListAsync();

            var managementFeeRate = 1.5m;
            var feesCharged = new List<object>();

            foreach (var portfolio in activePortfolios)
            {
                var monthlyFee = portfolio.CurrentValue * (managementFeeRate / 100) / 12;

                if (monthlyFee > 0 && portfolio.CurrentValue >= monthlyFee)
                {
                    var fee = new Fee
                    {
                        Id = Guid.NewGuid(),
                        PortfolioId = portfolio.Id,
                        Type = FeeType.Management,
                        Rate = managementFeeRate,
                        Amount = Math.Round(monthlyFee, 2),
                        CalculatedAt = DateTime.UtcNow,
                        ChargedAt = DateTime.UtcNow,
                        Status = FeeStatus.Charged,
                        Description = $"Monthly management fee - {DateTime.UtcNow:MMMM yyyy}"
                    };

                    portfolio.CurrentValue -= fee.Amount;
                    _context.Fees.Add(fee);

                    feesCharged.Add(new
                    {
                        portfolioId = portfolio.Id,
                        portfolioName = portfolio.Name,
                        amount = fee.Amount
                    });
                }
            }

            await _context.SaveChangesAsync();

            _logger.LogInformation("Monthly management fees charged: {Count} portfolios, Total: {Total}",
                feesCharged.Count, feesCharged.Sum(f => ((dynamic)f).amount));

            return Ok(new
            {
                message = "Monthly management fees charged successfully",
                portfoliosCharged = feesCharged.Count,
                totalAmount = feesCharged.Sum(f => ((dynamic)f).amount),
                fees = feesCharged
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error charging monthly management fees");
            return StatusCode(500, "Internal server error");
        }
    }
}

// DTOs for fee management
public class ChargeFeeDto
{
    public FeeType Type { get; set; }
    public decimal Rate { get; set; }
    public decimal Amount { get; set; }
    public string? Description { get; set; }
}

public class WaiveFeeDto
{
    public string Reason { get; set; } = string.Empty;
}

