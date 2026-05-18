using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using InvestorManagementSystem.Application.DTOs;
using InvestorManagementSystem.Infrastructure.Data;
using InvestorManagementSystem.Core.Entities;
using System.Globalization;

namespace InvestorManagementSystem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]  // All endpoints require authentication
public class AnalyticsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<AnalyticsController> _logger;

    public AnalyticsController(ApplicationDbContext context, ILogger<AnalyticsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Get monthly performance analytics for a portfolio 
    /// </summary>
    [HttpGet("portfolio/{portfolioId}/monthly-performance")]
    public async Task<IActionResult> GetMonthlyPerformance(Guid portfolioId, [FromQuery] int months = 12)
    {
        try
        {
            var startDate = DateTime.UtcNow.AddMonths(-months);

            var trades = await _context.Trades
                .Where(t => t.PortfolioId == portfolioId &&
                           t.Status == TradeStatus.Closed &&
                           t.ExitTime >= startDate)
                .ToListAsync();

            var monthlyData = trades
                .Where(t => t.ExitTime.HasValue)
                .GroupBy(t => new { t.ExitTime!.Value.Year, t.ExitTime.Value.Month })
                .Select(g => new MonthlyPerformanceDto
                {
                    Year = g.Key.Year,
                    Month = g.Key.Month,
                    MonthName = CultureInfo.CurrentCulture.DateTimeFormat.GetMonthName(g.Key.Month),
                    TotalProfit = g.Where(t => t.Profit.HasValue).Sum(t => t.Profit!.Value),
                    TotalLoss = g.Where(t => t.Loss.HasValue).Sum(t => t.Loss!.Value),
                    NetProfit = g.Where(t => t.Profit.HasValue).Sum(t => t.Profit!.Value) -
                               g.Where(t => t.Loss.HasValue).Sum(t => t.Loss!.Value),
                    TotalTrades = g.Count(),
                    WinningTrades = g.Count(t => t.Profit.HasValue && t.Profit > 0),
                    LosingTrades = g.Count(t => t.Loss.HasValue && t.Loss > 0)
                })
                .OrderBy(m => m.Year).ThenBy(m => m.Month)
                .ToList();

            foreach (var month in monthlyData)
            {
                month.WinRate = month.TotalTrades > 0 ? (decimal)month.WinningTrades / month.TotalTrades * 100 : 0;
                month.ProfitPercentage = Math.Round(month.NetProfit, 2);
            }

            return Ok(monthlyData);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting monthly performance");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Get win/loss ratio analytics for a portfolio
    /// </summary>
    [HttpGet("portfolio/{portfolioId}/win-loss-ratio")]
    public async Task<IActionResult> GetWinLossRatio(Guid portfolioId)
    {
        try
        {
            var trades = await _context.Trades
                .Where(t => t.PortfolioId == portfolioId && t.Status == TradeStatus.Closed)
                .ToListAsync();

            if (!trades.Any())
                return Ok(new WinLossRatioDto());

            var winningTrades = trades.Where(t => t.Profit.HasValue && t.Profit > 0).ToList();
            var losingTrades = trades.Where(t => t.Loss.HasValue && t.Loss > 0).ToList();

            var totalProfit = winningTrades.Sum(t => t.Profit!.Value);
            var totalLoss = losingTrades.Sum(t => t.Loss!.Value);
            var averageWin = winningTrades.Any() ? totalProfit / winningTrades.Count : 0;
            var averageLoss = losingTrades.Any() ? totalLoss / losingTrades.Count : 0;
            var profitFactor = totalLoss > 0 ? totalProfit / totalLoss : 0;

            var result = new WinLossRatioDto
            {
                TotalTrades = trades.Count,
                WinningTrades = winningTrades.Count,
                LosingTrades = losingTrades.Count,
                WinRate = (decimal)winningTrades.Count / trades.Count * 100,
                LossRate = (decimal)losingTrades.Count / trades.Count * 100,
                AverageWin = Math.Round(averageWin, 2),
                AverageLoss = Math.Round(averageLoss, 2),
                ProfitFactor = Math.Round(profitFactor, 2),
                ExpectancyPerTrade = Math.Round((totalProfit - totalLoss) / trades.Count, 2)
            };

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting win/loss ratio");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Get risk analysis for an investor
    /// </summary>
    [HttpGet("investor/{investorId}/risk-analysis")]
    public async Task<IActionResult> GetRiskAnalysis(Guid investorId)
    {
        try
        {
            var portfolios = await _context.Portfolios
                .Where(p => p.InvestorId == investorId)
                .ToListAsync();

            var results = new List<RiskAnalysisDto>();

            foreach (var portfolio in portfolios)
            {
                var todayStart = DateTime.UtcNow.Date;
                var todayTrades = await _context.Trades
                    .Where(t => t.PortfolioId == portfolio.Id &&
                               t.EntryTime >= todayStart &&
                               t.Status == TradeStatus.Closed)
                    .ToListAsync();

                var todayLoss = todayTrades.Where(t => t.Loss.HasValue).Sum(t => t.Loss!.Value);
                var highestValue = portfolio.InitialInvestment + portfolio.TotalProfit;
                var currentDrawdown = highestValue > 0
                    ? ((highestValue - portfolio.CurrentValue) / highestValue) * 100
                    : 0;

                var warnings = new List<string>();
                if (currentDrawdown > portfolio.MaxDrawdownPercentage * 0.8m)
                    warnings.Add($"Approaching max drawdown limit ({currentDrawdown:F2}% of {portfolio.MaxDrawdownPercentage}%)");

                if (todayLoss > portfolio.DailyLossLimit * 0.8m)
                    warnings.Add($"Approaching daily loss limit ({todayLoss:C} of {portfolio.DailyLossLimit:C})");

                results.Add(new RiskAnalysisDto
                {
                    PortfolioId = portfolio.Id,
                    PortfolioName = portfolio.Name,
                    RiskLevel = portfolio.RiskLevel.ToString(),
                    CurrentDrawdown = Math.Round(currentDrawdown, 2),
                    MaxDrawdown = Math.Round(portfolio.MaxDrawdownPercentage, 2),
                    MaxDrawdownPercentage = portfolio.MaxDrawdownPercentage,
                    DailyLossLimit = portfolio.DailyLossLimit,
                    CurrentDailyLoss = Math.Round(todayLoss, 2),
                    IsRiskLimitExceeded = currentDrawdown > portfolio.MaxDrawdownPercentage ||
                                         todayLoss > portfolio.DailyLossLimit,
                    RiskWarnings = warnings
                });
            }

            return Ok(results);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting risk analysis");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Get symbol performance analytics for a portfolio
    /// </summary>
    [HttpGet("portfolio/{portfolioId}/symbol-performance")]
    public async Task<IActionResult> GetSymbolPerformance(Guid portfolioId)
    {
        try
        {
            var trades = await _context.Trades
                .Where(t => t.PortfolioId == portfolioId && t.Status == TradeStatus.Closed)
                .ToListAsync();

            var symbolData = trades
                .GroupBy(t => t.Symbol)
                .Select(g =>
                {
                    var wins = g.Where(t => t.Profit.HasValue && t.Profit > 0).ToList();
                    var losses = g.Where(t => t.Loss.HasValue && t.Loss > 0).ToList();
                    var totalProfit = wins.Sum(t => t.Profit!.Value);
                    var totalLoss = losses.Sum(t => t.Loss!.Value);

                    return new SymbolPerformanceDto
                    {
                        Symbol = g.Key,
                        TotalTrades = g.Count(),
                        WinningTrades = wins.Count,
                        LosingTrades = losses.Count,
                        WinRate = g.Count() > 0 ? (decimal)wins.Count / g.Count() * 100 : 0,
                        TotalProfit = totalProfit,
                        TotalLoss = totalLoss,
                        NetProfit = totalProfit - totalLoss,
                        AverageProfit = wins.Any() ? totalProfit / wins.Count : 0,
                        AverageLoss = losses.Any() ? totalLoss / losses.Count : 0,
                        ProfitFactor = totalLoss > 0 ? totalProfit / totalLoss : 0
                    };
                })
                .OrderByDescending(s => s.NetProfit)
                .ToList();

            foreach (var symbol in symbolData)
            {
                symbol.TotalProfit = Math.Round(symbol.TotalProfit, 2);
                symbol.TotalLoss = Math.Round(symbol.TotalLoss, 2);
                symbol.NetProfit = Math.Round(symbol.NetProfit, 2);
                symbol.AverageProfit = Math.Round(symbol.AverageProfit, 2);
                symbol.AverageLoss = Math.Round(symbol.AverageLoss, 2);
                symbol.ProfitFactor = Math.Round(symbol.ProfitFactor, 2);
                symbol.WinRate = Math.Round(symbol.WinRate, 2);
            }

            return Ok(symbolData);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting symbol performance");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Get strategy performance analytics for a portfolio
    /// </summary>
    [HttpGet("portfolio/{portfolioId}/strategy-performance")]
    public async Task<IActionResult> GetStrategyPerformance(Guid portfolioId)
    {
        try
        {
            var trades = await _context.Trades
                .Where(t => t.PortfolioId == portfolioId &&
                           t.Status == TradeStatus.Closed &&
                           !string.IsNullOrEmpty(t.Strategy))
                .ToListAsync();

            var strategyData = trades
                .GroupBy(t => t.Strategy!)
                .Select(g =>
                {
                    var wins = g.Where(t => t.Profit.HasValue && t.Profit > 0).ToList();
                    var losses = g.Where(t => t.Loss.HasValue && t.Loss > 0).ToList();
                    var totalProfit = wins.Sum(t => t.Profit!.Value);
                    var totalLoss = losses.Sum(t => t.Loss!.Value);

                    return new StrategyPerformanceDto
                    {
                        Strategy = g.Key,
                        TotalTrades = g.Count(),
                        WinningTrades = wins.Count,
                        LosingTrades = losses.Count,
                        WinRate = g.Count() > 0 ? (decimal)wins.Count / g.Count() * 100 : 0,
                        TotalProfit = Math.Round(totalProfit, 2),
                        TotalLoss = Math.Round(totalLoss, 2),
                        NetProfit = Math.Round(totalProfit - totalLoss, 2),
                        ProfitFactor = totalLoss > 0 ? Math.Round(totalProfit / totalLoss, 2) : 0
                    };
                })
                .OrderByDescending(s => s.NetProfit)
                .ToList();

            return Ok(strategyData);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting strategy performance");
            return StatusCode(500, "Internal server error");
        }
    }
}

