using MediatR;
using InvestorManagementSystem.Application.DTOs;
using InvestorManagementSystem.Application.Queries;
using InvestorManagementSystem.Application.Interfaces;

namespace InvestorManagementSystem.Application.Handlers.Dashboard;

public class GetInvestorRecentActivityHandler : IRequestHandler<GetInvestorRecentActivityQuery, RecentActivityDto>
{
    private readonly IPortfolioRepository _portfolioRepository;
    private readonly ITradeRepository _tradeRepository;
    private readonly ITransactionRepository _transactionRepository;
    private readonly INotificationRepository _notificationRepository;

    public GetInvestorRecentActivityHandler(
        IPortfolioRepository portfolioRepository,
        ITradeRepository tradeRepository,
        ITransactionRepository transactionRepository,
        INotificationRepository notificationRepository)
    {
        _portfolioRepository = portfolioRepository;
        _tradeRepository = tradeRepository;
        _transactionRepository = transactionRepository;
        _notificationRepository = notificationRepository;
    }

    public async Task<RecentActivityDto> Handle(GetInvestorRecentActivityQuery request, CancellationToken cancellationToken)
    {
        // Get portfolio IDs for this investor
        var portfolios = await _portfolioRepository.GetByInvestorIdAsync(request.InvestorId);
        var portfolioList = portfolios.ToList();

        // Get recent trades from all portfolios
        var allTrades = new List<Core.Entities.Trade>();
        foreach (var portfolio in portfolioList)
        {
            var trades = await _tradeRepository.GetByPortfolioIdAsync(portfolio.Id);
            allTrades.AddRange(trades);
        }

        var recentTrades = allTrades
            .OrderByDescending(t => t.EntryTime)
            .Take(request.TradeCount)
            .Select(t =>
            {
                var portfolio = portfolioList.First(p => p.Id == t.PortfolioId);
                return new RecentTradeDto
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
                };
            })
            .ToList();

        // Get recent transactions
        var transactions = await _transactionRepository.GetByInvestorIdAsync(request.InvestorId);
        var recentTransactions = transactions
            .OrderByDescending(t => t.CreatedAt)
            .Take(request.TransactionCount)
            .Select(t => new RecentTransactionDto
            {
                Id = t.Id,
                Type = t.Type.ToString(),
                Amount = t.Amount,
                Currency = t.Currency,
                Status = t.Status.ToString(),
                Description = t.Description,
                CreatedAt = t.CreatedAt
            })
            .ToList();

        // Get recent notifications
        var notifications = await _notificationRepository.GetByInvestorIdAsync(request.InvestorId);
        var recentNotifications = notifications
            .OrderByDescending(n => n.CreatedAt)
            .Take(request.NotificationCount)
            .Select(n => new NotificationDto
            {
                Id = n.Id,
                Title = n.Title,
                Message = n.Message,
                Type = Enum.Parse<NotificationType>(n.Type, true),
                Icon = n.Icon,
                IconColor = n.IconColor,
                Link = n.Link,
                IsRead = n.IsRead,
                CreatedAt = n.CreatedAt,
                Metadata = string.IsNullOrEmpty(n.MetadataJson)
                    ? null
                    : System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(n.MetadataJson)
            })
            .ToList();

        return new RecentActivityDto
        {
            RecentTrades = recentTrades,
            RecentTransactions = recentTransactions,
            RecentNotifications = recentNotifications
        };
    }
}

