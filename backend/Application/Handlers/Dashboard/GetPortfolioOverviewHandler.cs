using MediatR;
using InvestorManagementSystem.Application.DTOs;
using InvestorManagementSystem.Application.Queries;
using InvestorManagementSystem.Application.Interfaces;
using InvestorManagementSystem.Core.Entities;

namespace InvestorManagementSystem.Application.Handlers.Dashboard;

public class GetPortfolioOverviewHandler : IRequestHandler<GetPortfolioOverviewQuery, PortfolioOverviewDto>
{
    private readonly IPortfolioRepository _portfolioRepository;
    private readonly ITradeRepository _tradeRepository;
    private readonly IPerformanceMetricRepository _performanceMetricRepository;

    public GetPortfolioOverviewHandler(
        IPortfolioRepository portfolioRepository,
        ITradeRepository tradeRepository,
        IPerformanceMetricRepository performanceMetricRepository)
    {
        _portfolioRepository = portfolioRepository;
        _tradeRepository = tradeRepository;
        _performanceMetricRepository = performanceMetricRepository;
    }

    public async Task<PortfolioOverviewDto> Handle(GetPortfolioOverviewQuery request, CancellationToken cancellationToken)
    {
        // Get portfolio
        var portfolio = await _portfolioRepository.GetByIdAsync(request.PortfolioId);
        if (portfolio == null)
            throw new KeyNotFoundException($"Portfolio with ID {request.PortfolioId} not found");

        // Get trades
        var trades = (await _tradeRepository.GetByPortfolioIdAsync(request.PortfolioId)).ToList();

        // Get recent trades
        var recentTrades = trades
            .OrderByDescending(t => t.EntryTime)
            .Take(request.RecentTradesCount)
            .Select(t => new RecentTradeDto
            {
                Id = t.Id,
                Symbol = t.Symbol,
                Direction = t.Direction.ToString(),
                Amount = t.Amount,
                EntryPrice = t.EntryPrice,
                ExitPrice = t.ExitPrice,
                Profit = t.Profit,
                Loss = t.Loss,
                Status = t.Status.ToString(),
                EntryTime = t.EntryTime,
                ExitTime = t.ExitTime,
                PortfolioName = portfolio.Name
            })
            .ToList();

        // Get recent performance metrics
        var performanceMetrics = (await _performanceMetricRepository.GetByPortfolioIdAsync(request.PortfolioId)).ToList();
        var recentPerformance = performanceMetrics
            .OrderByDescending(pm => pm.Date)
            .Take(request.PerformanceDays)
            .Select(pm => new DailyPerformanceDto
            {
                Date = pm.Date,
                Value = pm.TotalValue,
                Profit = pm.TotalProfit,
                Loss = pm.TotalLoss,
                NetProfit = pm.NetProfit
            })
            .OrderBy(p => p.Date)
            .ToList();

        // Calculate trading metrics
        var closedTrades = trades.Where(t => t.Status == TradeStatus.Closed).ToList();
        var winningTrades = closedTrades.Count(t => t.Profit.HasValue && t.Profit > 0);
        var winRate = closedTrades.Any() ? (decimal)winningTrades / closedTrades.Count * 100 : 0;

        // Calculate current drawdown (simplified)
        var highestValue = portfolio.InitialInvestment + portfolio.TotalProfit;
        var currentDrawdown = highestValue > 0
            ? ((highestValue - portfolio.CurrentValue) / highestValue) * 100
            : 0;

        return new PortfolioOverviewDto
        {
            PortfolioId = portfolio.Id,
            Name = portfolio.Name,
            Status = portfolio.Status.ToString(),
            RiskLevel = portfolio.RiskLevel.ToString(),

            // Financial Data
            InitialInvestment = portfolio.InitialInvestment,
            CurrentValue = portfolio.CurrentValue,
            TotalProfit = portfolio.TotalProfit,
            TotalLoss = portfolio.TotalLoss,
            NetProfit = portfolio.NetProfit,
            ProfitPercentage = portfolio.ProfitPercentage,

            // Trading Data
            TotalTrades = trades.Count,
            OpenTrades = trades.Count(t => t.Status == TradeStatus.Open),
            ClosedTrades = closedTrades.Count,
            WinRate = Math.Round(winRate, 2),

            // Risk Management
            MaxLossPercentage = portfolio.MaxLossPercentage,
            MaxDrawdownPercentage = portfolio.MaxDrawdownPercentage,
            DailyLossLimit = portfolio.DailyLossLimit,
            CurrentDrawdown = Math.Round(currentDrawdown, 2),

            // Recent Data
            RecentPerformance = recentPerformance,
            RecentTrades = recentTrades
        };
    }
}

