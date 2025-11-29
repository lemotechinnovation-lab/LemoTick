using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using InvestorManagementSystem.Infrastructure.Data;

namespace InvestorManagementSystem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SeedController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<SeedController> _logger;

    public SeedController(ApplicationDbContext context, ILogger<SeedController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Seed database with test data
    /// </summary>
    /// <param name="recordsPerEntity">Number of records to create per entity (default: 10000)</param>
    [HttpPost("seed")]
    public async Task<ActionResult> SeedDatabase([FromQuery] int recordsPerEntity = 10000)
    {
        try
        {
            var startTime = DateTime.UtcNow;
            _logger.LogInformation("Starting database seeding via API with {Count} records per entity", recordsPerEntity);

            var seeder = new DatabaseSeeder(_context, _logger);
            await seeder.SeedAsync(recordsPerEntity);

            var duration = DateTime.UtcNow - startTime;

            var stats = new
            {
                success = true,
                durationSeconds = duration.TotalSeconds,
                recordsCreated = new
                {
                    investors = await _context.Investors.CountAsync(),
                    portfolios = await _context.Portfolios.CountAsync(),
                    trades = await _context.Trades.CountAsync(),
                    transactions = await _context.Transactions.CountAsync(),
                    performanceMetrics = await _context.PerformanceMetrics.CountAsync(),
                    notifications = await _context.Notifications.CountAsync()
                }
            };

            return Ok(stats);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error seeding database");
            return StatusCode(500, new { error = "Failed to seed database", message = ex.Message });
        }
    }

    /// <summary>
    /// Get database statistics
    /// </summary>
    [HttpGet("stats")]
    public async Task<ActionResult> GetDatabaseStats()
    {
        try
        {
            var stats = new
            {
                investors = await _context.Investors.CountAsync(),
                portfolios = await _context.Portfolios.CountAsync(),
                trades = await _context.Trades.CountAsync(),
                transactions = await _context.Transactions.CountAsync(),
                performanceMetrics = await _context.PerformanceMetrics.CountAsync(),
                notifications = await _context.Notifications.CountAsync(),
                totalRecords = await _context.Investors.CountAsync() +
                              await _context.Portfolios.CountAsync() +
                              await _context.Trades.CountAsync() +
                              await _context.Transactions.CountAsync() +
                              await _context.PerformanceMetrics.CountAsync() +
                              await _context.Notifications.CountAsync()
            };

            return Ok(stats);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting database stats");
            return StatusCode(500, new { error = "Failed to get stats", message = ex.Message });
        }
    }

    /// <summary>
    /// Clear all data from database
    /// </summary>
    [HttpDelete("clear")]
    public async Task<ActionResult> ClearDatabase()
    {
        try
        {
            _logger.LogWarning("Clearing all data from database via API");

            var seeder = new DatabaseSeeder(_context, _logger);
            await seeder.ClearAllDataAsync();

            return Ok(new { success = true, message = "All data cleared successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error clearing database");
            return StatusCode(500, new { error = "Failed to clear database", message = ex.Message });
        }
    }

    /// <summary>
    /// Quick seed with fewer records for testing (1000 per entity)
    /// </summary>
    [HttpPost("seed-quick")]
    public async Task<ActionResult> QuickSeed()
    {
        return await SeedDatabase(1000);
    }

    /// <summary>
    /// Large seed for performance testing (50000 per entity)
    /// </summary>
    [HttpPost("seed-large")]
    public async Task<ActionResult> LargeSeed()
    {
        return await SeedDatabase(50000);
    }

    /// <summary>
    /// Performance test - measure query execution time
    /// </summary>
    [HttpGet("performance-test")]
    public async Task<ActionResult> PerformanceTest()
    {
        try
        {
            var results = new Dictionary<string, object>();

            // Test 1: Get all investors
            var sw = System.Diagnostics.Stopwatch.StartNew();
            var investors = await _context.Investors.Take(1000).ToListAsync();
            sw.Stop();
            results["getInvestors1000"] = new { count = investors.Count, milliseconds = sw.ElapsedMilliseconds };

            // Test 2: Get portfolios with investor
            sw.Restart();
            var portfolios = await _context.Portfolios
                .Include(p => p.Investor)
                .Take(1000)
                .ToListAsync();
            sw.Stop();
            results["getPortfoliosWithInvestor1000"] = new { count = portfolios.Count, milliseconds = sw.ElapsedMilliseconds };

            // Test 3: Get trades with portfolio
            sw.Restart();
            var trades = await _context.Trades
                .Include(t => t.Portfolio)
                .Take(1000)
                .ToListAsync();
            sw.Stop();
            results["getTradesWithPortfolio1000"] = new { count = trades.Count, milliseconds = sw.ElapsedMilliseconds };

            // Test 4: Complex query - investor with portfolios and trades
            sw.Restart();
            var investorWithData = await _context.Investors
                .Include(i => i.Portfolios)
                    .ThenInclude(p => p.Trades)
                .Take(10)
                .ToListAsync();
            sw.Stop();
            results["getInvestorsWithPortfoliosAndTrades10"] = new { count = investorWithData.Count, milliseconds = sw.ElapsedMilliseconds };

            // Test 5: Aggregation query
            sw.Restart();
            var totalProfit = await _context.Portfolios.SumAsync(p => p.TotalProfit);
            sw.Stop();
            results["sumAllPortfolioProfit"] = new { sum = totalProfit, milliseconds = sw.ElapsedMilliseconds };

            // Test 6: Count all records
            sw.Restart();
            var totalRecords = await _context.Investors.CountAsync() +
                              await _context.Portfolios.CountAsync() +
                              await _context.Trades.CountAsync();
            sw.Stop();
            results["countAllRecords"] = new { count = totalRecords, milliseconds = sw.ElapsedMilliseconds };

            return Ok(results);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error running performance test");
            return StatusCode(500, new { error = "Performance test failed", message = ex.Message });
        }
    }
}

