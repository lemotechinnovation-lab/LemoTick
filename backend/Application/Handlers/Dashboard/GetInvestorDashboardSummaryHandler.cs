using MediatR;
using Microsoft.EntityFrameworkCore;
using InvestorManagementSystem.Application.DTOs;
using InvestorManagementSystem.Application.Queries;
using InvestorManagementSystem.Application.Interfaces;
using InvestorManagementSystem.Core.Entities;

namespace InvestorManagementSystem.Application.Handlers.Dashboard;

public class GetInvestorDashboardSummaryHandler : IRequestHandler<GetInvestorDashboardSummaryQuery, DashboardSummaryDto>
{
    private readonly IInvestorRepository _investorRepository;
    private readonly IPortfolioRepository _portfolioRepository;
    private readonly ITradeRepository _tradeRepository;
    private readonly ITransactionRepository _transactionRepository;
    private readonly INotificationRepository _notificationRepository;

    public GetInvestorDashboardSummaryHandler(
        IInvestorRepository investorRepository,
        IPortfolioRepository portfolioRepository,
        ITradeRepository tradeRepository,
        ITransactionRepository transactionRepository,
        INotificationRepository notificationRepository)
    {
        _investorRepository = investorRepository;
        _portfolioRepository = portfolioRepository;
        _tradeRepository = tradeRepository;
        _transactionRepository = transactionRepository;
        _notificationRepository = notificationRepository;
    }

    public async Task<DashboardSummaryDto> Handle(GetInvestorDashboardSummaryQuery request, CancellationToken cancellationToken)
    {
        // Get investor
        var investor = await _investorRepository.GetByIdAsync(request.InvestorId);
        if (investor == null)
            throw new KeyNotFoundException($"Investor with ID {request.InvestorId} not found");

        // Get portfolios
        var portfolios = await _portfolioRepository.GetByInvestorIdAsync(request.InvestorId);
        var portfolioList = portfolios.ToList();
        var portfolioIds = portfolioList.Select(p => p.Id).ToList();

        // Get trades
        var allTrades = new List<Trade>();
        foreach (var portfolioId in portfolioIds)
        {
            var trades = await _tradeRepository.GetByPortfolioIdAsync(portfolioId);
            allTrades.AddRange(trades);
        }

        // Get transactions
        var transactions = (await _transactionRepository.GetByInvestorIdAsync(request.InvestorId)).ToList();

        // Get unread notifications count
        var unreadNotifications = (await _notificationRepository.GetUnreadByInvestorIdAsync(request.InvestorId)).Count();

        // Calculate summary
        var totalInvestment = portfolioList.Sum(p => p.InitialInvestment);
        var currentValue = portfolioList.Sum(p => p.CurrentValue);
        var totalProfit = portfolioList.Sum(p => p.TotalProfit);
        var totalLoss = portfolioList.Sum(p => p.TotalLoss);
        var netProfit = totalProfit - totalLoss;
        var profitPercentage = totalInvestment > 0 ? (netProfit / totalInvestment) * 100 : 0;

        // Calculate trading summary
        var closedTrades = allTrades.Where(t => t.Status == TradeStatus.Closed).ToList();
        var winningTrades = closedTrades.Count(t => t.Profit.HasValue && t.Profit > 0);
        var losingTrades = closedTrades.Count(t => t.Loss.HasValue && t.Loss > 0);
        var winRate = closedTrades.Any() ? (decimal)winningTrades / closedTrades.Count * 100 : 0;

        // Calculate available balance (completed deposits - withdrawals)
        var completedTransactions = transactions.Where(t => t.Status == TransactionStatus.Completed).ToList();
        var deposits = completedTransactions.Where(t => t.Type == TransactionType.Deposit).Sum(t => t.Amount);
        var withdrawals = completedTransactions.Where(t => t.Type == TransactionType.Withdrawal).Sum(t => t.Amount);
        var availableBalance = deposits - withdrawals - totalInvestment + currentValue;

        // Generate performance history (last 30 days)
        var performanceHistory = new List<PerformanceHistoryDto>();
        var today = DateTime.UtcNow.Date;
        for (int i = 29; i >= 0; i--)
        {
            var date = today.AddDays(-i);
            // For now, show current value. Later this can be from PerformanceMetric records
            performanceHistory.Add(new PerformanceHistoryDto
            {
                Date = date,
                Value = currentValue
            });
        }

        return new DashboardSummaryDto
        {
            InvestorId = investor.Id,
            InvestorName = $"{investor.FirstName} {investor.LastName}",
            Email = investor.Email,

            // Portfolio Summary
            TotalPortfolios = portfolioList.Count,
            ActivePortfolios = portfolioList.Count(p => p.Status == PortfolioStatus.Active),
            TotalInvestment = totalInvestment,
            CurrentValue = currentValue,
            TotalProfit = totalProfit,
            TotalLoss = totalLoss,
            NetProfit = netProfit,
            ProfitPercentage = Math.Round(profitPercentage, 2),

            // Trading Summary
            TotalTrades = allTrades.Count,
            OpenTrades = allTrades.Count(t => t.Status == TradeStatus.Open),
            ClosedTrades = closedTrades.Count,
            WinningTrades = winningTrades,
            LosingTrades = losingTrades,
            WinRate = Math.Round(winRate, 2),

            // Account Summary
            AvailableBalance = Math.Round(availableBalance, 2),
            PendingTransactions = transactions.Count(t => t.Status == TransactionStatus.Pending),
            UnreadNotifications = unreadNotifications,

            // Recent Activity
            LastTradeDate = allTrades.OrderByDescending(t => t.EntryTime).FirstOrDefault()?.EntryTime,
            LastLoginAt = investor.LastLoginAt,

            // Portfolio Details
            PortfolioSummaries = portfolioList.Select(p => new DashboardPortfolioSummaryDto
            {
                PortfolioId = p.Id,
                PortfolioName = p.Name,
                CurrentValue = p.CurrentValue,
                NetProfit = p.NetProfit,
                ProfitPercentage = Math.Round(p.ProfitPercentage, 2),
                Status = p.Status.ToString()
            }).ToList(),

            // Performance History
            PerformanceHistory = performanceHistory
        };
    }
}

