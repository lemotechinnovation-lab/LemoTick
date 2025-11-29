using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using InvestorManagementSystem.Application.Queries;

namespace InvestorManagementSystem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]  // All endpoints require authentication
public class DashboardController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<DashboardController> _logger;

    public DashboardController(IMediator mediator, ILogger<DashboardController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Get investor dashboard summary
    /// </summary>
    /// <param name="investorId">The investor ID</param>
    /// <returns>Dashboard summary with all key metrics</returns>
    [HttpGet("investor/{investorId}/summary")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetInvestorSummary(Guid investorId)
    {
        try
        {
            var query = new GetInvestorDashboardSummaryQuery { InvestorId = investorId };
            var result = await _mediator.Send(query);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Investor not found: {InvestorId}", investorId);
            return NotFound(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting investor summary for {InvestorId}", investorId);
            return StatusCode(500, new { error = "An error occurred while retrieving the dashboard summary" });
        }
    }

    /// <summary>
    /// Get investor recent activity
    /// </summary>
    /// <param name="investorId">The investor ID</param>
    /// <param name="tradeCount">Number of recent trades to return (default: 10)</param>
    /// <param name="transactionCount">Number of recent transactions to return (default: 10)</param>
    /// <param name="notificationCount">Number of recent notifications to return (default: 10)</param>
    /// <returns>Recent activity including trades, transactions, and notifications</returns>
    [HttpGet("investor/{investorId}/recent-activity")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetRecentActivity(
        Guid investorId,
        [FromQuery] int tradeCount = 10,
        [FromQuery] int transactionCount = 10,
        [FromQuery] int notificationCount = 10)
    {
        try
        {
            var query = new GetInvestorRecentActivityQuery
            {
                InvestorId = investorId,
                TradeCount = tradeCount,
                TransactionCount = transactionCount,
                NotificationCount = notificationCount
            };
            var result = await _mediator.Send(query);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting recent activity for investor {InvestorId}", investorId);
            return StatusCode(500, new { error = "An error occurred while retrieving recent activity" });
        }
    }

    /// <summary>
    /// Get detailed portfolio overview
    /// </summary>
    /// <param name="portfolioId">The portfolio ID</param>
    /// <param name="recentTradesCount">Number of recent trades to include (default: 10)</param>
    /// <param name="performanceDays">Number of days of performance data to include (default: 30)</param>
    /// <returns>Detailed portfolio overview with performance metrics and recent trades</returns>
    [HttpGet("portfolio/{portfolioId}/overview")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetPortfolioOverview(
        Guid portfolioId,
        [FromQuery] int recentTradesCount = 10,
        [FromQuery] int performanceDays = 30)
    {
        try
        {
            var query = new GetPortfolioOverviewQuery
            {
                PortfolioId = portfolioId,
                RecentTradesCount = recentTradesCount,
                PerformanceDays = performanceDays
            };
            var result = await _mediator.Send(query);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Portfolio not found: {PortfolioId}", portfolioId);
            return NotFound(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting portfolio overview for {PortfolioId}", portfolioId);
            return StatusCode(500, new { error = "An error occurred while retrieving the portfolio overview" });
        }
    }
}

