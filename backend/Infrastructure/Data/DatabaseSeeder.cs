using Bogus;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using InvestorManagementSystem.Core.Entities;

namespace InvestorManagementSystem.Infrastructure.Data;

/// <summary>
/// Seeds the database with realistic fake data using Bogus
/// </summary>
public class DatabaseSeeder
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger _logger;

    public DatabaseSeeder(ApplicationDbContext context, ILogger logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task SeedAsync(int recordsPerEntity = 10000)
    {
        _logger.LogInformation("Seeding database with {Count} records per entity", recordsPerEntity);

        await SeedLookupTablesAsync();
        var investors = await SeedInvestorsAsync(recordsPerEntity);
        var portfolios = await SeedPortfoliosAsync(investors, recordsPerEntity);
        await SeedTradesAsync(portfolios, recordsPerEntity);
        await SeedTransactionsAsync(investors, portfolios, recordsPerEntity);
        await SeedNotificationsAsync(investors, recordsPerEntity / 5);
        await SeedPerformanceMetricsAsync(portfolios, recordsPerEntity / 10);

        _logger.LogInformation("Database seeding completed");
    }

    public async Task ClearAllDataAsync()
    {
        _logger.LogWarning("Clearing all data from database");

        await _context.Database.ExecuteSqlRawAsync("DELETE FROM \"AuditLogs\"");
        await _context.Database.ExecuteSqlRawAsync("DELETE FROM \"PerformanceMetrics\"");
        await _context.Database.ExecuteSqlRawAsync("DELETE FROM \"Notifications\"");
        await _context.Database.ExecuteSqlRawAsync("DELETE FROM \"Transactions\"");
        await _context.Database.ExecuteSqlRawAsync("DELETE FROM \"Trades\"");
        await _context.Database.ExecuteSqlRawAsync("DELETE FROM \"Portfolios\"");
        await _context.Database.ExecuteSqlRawAsync("DELETE FROM \"Investors\"");

        _logger.LogInformation("All data cleared");
    }

    // ── Lookup tables ─────────────────────────────────────────────────────────

    private async Task SeedLookupTablesAsync()
    {
        if (await _context.InvestorStatusLookup.AnyAsync()) return;

        _context.InvestorStatusLookup.AddRange(
            new InvestorStatusLookup { Name = "Pending", Description = "Awaiting approval", DisplayOrder = 1 },
            new InvestorStatusLookup { Name = "Active", Description = "Active investor", DisplayOrder = 2 },
            new InvestorStatusLookup { Name = "Suspended", Description = "Account suspended", DisplayOrder = 3 },
            new InvestorStatusLookup { Name = "Closed", Description = "Account closed", DisplayOrder = 4 },
            new InvestorStatusLookup { Name = "KYC Required", Description = "KYC documents needed", DisplayOrder = 5 }
        );

        _context.UserRoleLookup.AddRange(
            new UserRoleLookup { Name = "Investor", Description = "Regular investor", DisplayOrder = 1 },
            new UserRoleLookup { Name = "Administrator", Description = "System administrator", DisplayOrder = 2 },
            new UserRoleLookup { Name = "ComplianceOfficer", Description = "Compliance oversight", DisplayOrder = 3 },
            new UserRoleLookup { Name = "Support", Description = "Customer support", DisplayOrder = 4 },
            new UserRoleLookup { Name = "Auditor", Description = "Read-only auditor", DisplayOrder = 5 }
        );

        _context.PortfolioStatusLookup.AddRange(
            new PortfolioStatusLookup { Name = "Active", DisplayOrder = 1 },
            new PortfolioStatusLookup { Name = "Suspended", DisplayOrder = 2 },
            new PortfolioStatusLookup { Name = "Closed", DisplayOrder = 3 },
            new PortfolioStatusLookup { Name = "Under Review", DisplayOrder = 4 }
        );

        _context.RiskLevelLookup.AddRange(
            new RiskLevelLookup { Name = "Low", DisplayOrder = 1 },
            new RiskLevelLookup { Name = "Medium", DisplayOrder = 2 },
            new RiskLevelLookup { Name = "High", DisplayOrder = 3 },
            new RiskLevelLookup { Name = "Very High", DisplayOrder = 4 }
        );

        _context.TradeTypeLookup.AddRange(
            new TradeTypeLookup { Name = "Binary Option", DisplayOrder = 1 },
            new TradeTypeLookup { Name = "CFD", DisplayOrder = 2 },
            new TradeTypeLookup { Name = "Forex", DisplayOrder = 3 },
            new TradeTypeLookup { Name = "Crypto", DisplayOrder = 4 },
            new TradeTypeLookup { Name = "Stock", DisplayOrder = 5 }
        );

        _context.TradeDirectionLookup.AddRange(
            new TradeDirectionLookup { Name = "Buy", DisplayOrder = 1 },
            new TradeDirectionLookup { Name = "Sell", DisplayOrder = 2 },
            new TradeDirectionLookup { Name = "Rise", DisplayOrder = 3 },
            new TradeDirectionLookup { Name = "Fall", DisplayOrder = 4 }
        );

        _context.TradeStatusLookup.AddRange(
            new TradeStatusLookup { Name = "Open", DisplayOrder = 1 },
            new TradeStatusLookup { Name = "Closed", DisplayOrder = 2 },
            new TradeStatusLookup { Name = "Cancelled", DisplayOrder = 3 },
            new TradeStatusLookup { Name = "Expired", DisplayOrder = 4 },
            new TradeStatusLookup { Name = "Failed", DisplayOrder = 5 }
        );

        _context.TransactionTypeLookup.AddRange(
            new TransactionTypeLookup { Name = "Deposit", DisplayOrder = 1 },
            new TransactionTypeLookup { Name = "Withdrawal", DisplayOrder = 2 },
            new TransactionTypeLookup { Name = "Profit", DisplayOrder = 3 },
            new TransactionTypeLookup { Name = "Fee", DisplayOrder = 4 }
        );

        _context.TransactionStatusLookup.AddRange(
            new TransactionStatusLookup { Name = "Pending", DisplayOrder = 1 },
            new TransactionStatusLookup { Name = "Completed", DisplayOrder = 2 },
            new TransactionStatusLookup { Name = "Failed", DisplayOrder = 3 },
            new TransactionStatusLookup { Name = "Reversed", DisplayOrder = 4 }
        );

        _context.NotificationTypeLookup.AddRange(
            new NotificationTypeLookup { Name = "Trade Alert", DisplayOrder = 1 },
            new NotificationTypeLookup { Name = "System", DisplayOrder = 2 },
            new NotificationTypeLookup { Name = "KYC", DisplayOrder = 3 },
            new NotificationTypeLookup { Name = "Payment", DisplayOrder = 4 }
        );

        _context.NotificationPriorityLookup.AddRange(
            new NotificationPriorityLookup { Name = "Low", DisplayOrder = 1 },
            new NotificationPriorityLookup { Name = "Normal", DisplayOrder = 2 },
            new NotificationPriorityLookup { Name = "High", DisplayOrder = 3 },
            new NotificationPriorityLookup { Name = "Critical", DisplayOrder = 4 }
        );

        _context.DocumentTypeLookup.AddRange(
            new DocumentTypeLookup { Name = "ID Document", DisplayOrder = 1 },
            new DocumentTypeLookup { Name = "Proof of Address", DisplayOrder = 2 },
            new DocumentTypeLookup { Name = "Bank Statement", DisplayOrder = 3 },
            new DocumentTypeLookup { Name = "Tax Certificate", DisplayOrder = 4 }
        );

        _context.DocumentStatusLookup.AddRange(
            new DocumentStatusLookup { Name = "Pending", DisplayOrder = 1 },
            new DocumentStatusLookup { Name = "Approved", DisplayOrder = 2 },
            new DocumentStatusLookup { Name = "Rejected", DisplayOrder = 3 }
        );

        _context.SARStatusLookup.AddRange(
            new SARStatusLookup { Name = "Open", DisplayOrder = 1 },
            new SARStatusLookup { Name = "Under Review", DisplayOrder = 2 },
            new SARStatusLookup { Name = "Closed", DisplayOrder = 3 },
            new SARStatusLookup { Name = "Escalated", DisplayOrder = 4 }
        );

        _context.FeeTypeLookup.AddRange(
            new FeeTypeLookup { Name = "Management", DisplayOrder = 1 },
            new FeeTypeLookup { Name = "Performance", DisplayOrder = 2 },
            new FeeTypeLookup { Name = "Withdrawal", DisplayOrder = 3 }
        );

        _context.FeeStatusLookup.AddRange(
            new FeeStatusLookup { Name = "Pending", DisplayOrder = 1 },
            new FeeStatusLookup { Name = "Charged", DisplayOrder = 2 },
            new FeeStatusLookup { Name = "Waived", DisplayOrder = 3 }
        );

        _context.WithdrawalStatusLookup.AddRange(
            new WithdrawalStatusLookup { Name = "Pending", DisplayOrder = 1 },
            new WithdrawalStatusLookup { Name = "Approved", DisplayOrder = 2 },
            new WithdrawalStatusLookup { Name = "Rejected", DisplayOrder = 3 },
            new WithdrawalStatusLookup { Name = "Completed", DisplayOrder = 4 }
        );

        _context.ReferralStatusLookup.AddRange(
            new ReferralStatusLookup { Name = "Pending", DisplayOrder = 1 },
            new ReferralStatusLookup { Name = "Active", DisplayOrder = 2 },
            new ReferralStatusLookup { Name = "Expired", DisplayOrder = 3 }
        );

        _context.CommissionStatusLookup.AddRange(
            new CommissionStatusLookup { Name = "Pending", DisplayOrder = 1 },
            new CommissionStatusLookup { Name = "Paid", DisplayOrder = 2 },
            new CommissionStatusLookup { Name = "Voided", DisplayOrder = 3 }
        );

        _context.PaymentTypeLookup.AddRange(
            new PaymentTypeLookup { Name = "Deposit", DisplayOrder = 1 },
            new PaymentTypeLookup { Name = "Withdrawal", DisplayOrder = 2 }
        );

        _context.PaymentMethodLookup.AddRange(
            new PaymentMethodLookup { Name = "PayFast", DisplayOrder = 1 },
            new PaymentMethodLookup { Name = "Bank Transfer", DisplayOrder = 2 },
            new PaymentMethodLookup { Name = "Credit Card", DisplayOrder = 3 }
        );

        _context.PaymentStatusLookup.AddRange(
            new PaymentStatusLookup { Name = "Pending", DisplayOrder = 1 },
            new PaymentStatusLookup { Name = "Completed", DisplayOrder = 2 },
            new PaymentStatusLookup { Name = "Failed", DisplayOrder = 3 }
        );

        _context.BankAccountTypeLookup.AddRange(
            new BankAccountTypeLookup { Name = "Cheque", DisplayOrder = 1 },
            new BankAccountTypeLookup { Name = "Savings", DisplayOrder = 2 }
        );

        _context.BankAccountStatusLookup.AddRange(
            new BankAccountStatusLookup { Name = "Active", DisplayOrder = 1 },
            new BankAccountStatusLookup { Name = "Suspended", DisplayOrder = 2 }
        );

        _context.StatementDeliveryMethodLookup.AddRange(
            new StatementDeliveryMethodLookup { Name = "Email", DisplayOrder = 1 },
            new StatementDeliveryMethodLookup { Name = "Portal", DisplayOrder = 2 }
        );

        _context.RiskToleranceLookup.AddRange(
            new RiskToleranceLookup { Name = "Conservative", DisplayOrder = 1 },
            new RiskToleranceLookup { Name = "Moderate", DisplayOrder = 2 },
            new RiskToleranceLookup { Name = "Aggressive", DisplayOrder = 3 }
        );

        await _context.SaveChangesAsync();
        _logger.LogInformation("Lookup tables seeded");
    }

    // ── Investors ─────────────────────────────────────────────────────────────

    private async Task<List<Investor>> SeedInvestorsAsync(int count)
    {
        if (await _context.Investors.AnyAsync())
            return await _context.Investors.Take(count).ToListAsync();

        var faker = new Faker<Investor>()
            .RuleFor(i => i.Id, _ => Guid.NewGuid())
            .RuleFor(i => i.FirstName, f => f.Name.FirstName())
            .RuleFor(i => i.LastName, f => f.Name.LastName())
            .RuleFor(i => i.Email, (f, i) => f.Internet.Email(i.FirstName, i.LastName))
            .RuleFor(i => i.PhoneNumber, f => f.Phone.PhoneNumber("+27 ## ### ####"))
            .RuleFor(i => i.DateOfBirth, f => f.Date.Past(40, DateTime.UtcNow.AddYears(-18)))
            .RuleFor(i => i.Nationality, f => f.Address.Country())
            .RuleFor(i => i.IdNumber, f => f.Random.Replace("##########"))
            .RuleFor(i => i.Status, f => f.PickRandom<InvestorStatus>())
            .RuleFor(i => i.Role, _ => UserRole.Investor)
            .RuleFor(i => i.ReferralCode, f => f.Random.AlphaNumeric(8).ToUpper())
            .RuleFor(i => i.PasswordHash, f => f.Internet.Password(20))
            .RuleFor(i => i.PasswordSalt, f => f.Internet.Password(20))
            .RuleFor(i => i.CreatedAt, f => f.Date.Past(3));

        var investors = faker.Generate(count);
        await _context.Investors.AddRangeAsync(investors);
        await _context.SaveChangesAsync();
        _logger.LogInformation("Seeded {Count} investors", investors.Count);
        return investors;
    }

    // ── Portfolios ────────────────────────────────────────────────────────────

    private async Task<List<Portfolio>> SeedPortfoliosAsync(List<Investor> investors, int countPerInvestor)
    {
        if (await _context.Portfolios.AnyAsync())
            return await _context.Portfolios.Take(countPerInvestor).ToListAsync();

        var portfolios = new List<Portfolio>();
        var faker = new Faker();

        foreach (var investor in investors.Take(countPerInvestor / 2))
        {
            var initial = faker.Finance.Amount(1000, 100000);
            var current = initial * faker.Random.Decimal(0.5m, 2.0m);
            var profit = current > initial ? current - initial : 0;
            var loss = current < initial ? initial - current : 0;

            portfolios.Add(new Portfolio
            {
                Id = Guid.NewGuid(),
                InvestorId = investor.Id,
                Name = $"{faker.Commerce.ProductAdjective()} Portfolio",
                Description = faker.Lorem.Sentence(),
                InitialInvestment = initial,
                CurrentValue = current,
                TotalProfit = profit,
                TotalLoss = loss,
                NetProfit = profit - loss,
                ProfitPercentage = initial > 0 ? (current - initial) / initial * 100 : 0,
                Status = faker.PickRandom<PortfolioStatus>(),
                RiskLevel = faker.PickRandom<RiskLevel>(),
                CreatedAt = faker.Date.Past(2),
            });
        }

        await _context.Portfolios.AddRangeAsync(portfolios);
        await _context.SaveChangesAsync();
        _logger.LogInformation("Seeded {Count} portfolios", portfolios.Count);
        return portfolios;
    }

    // ── Trades ────────────────────────────────────────────────────────────────

    private async Task SeedTradesAsync(List<Portfolio> portfolios, int countPerPortfolio)
    {
        if (await _context.Trades.AnyAsync()) return;

        var faker = new Faker();
        var symbols = new[] { "EURUSD", "GBPUSD", "USDJPY", "BTCUSD", "ETHUSD", "AAPL", "GOOGL", "TSLA" };
        var trades = new List<Trade>();

        foreach (var portfolio in portfolios.Take(100))
        {
            for (int i = 0; i < Math.Min(countPerPortfolio / portfolios.Count + 1, 50); i++)
            {
                var entry = faker.Finance.Amount(100, 10000);
                var isWin = faker.Random.Bool();
                var exit = isWin ? entry * faker.Random.Decimal(1.01m, 1.5m) : entry * faker.Random.Decimal(0.5m, 0.99m);

                trades.Add(new Trade
                {
                    Id = Guid.NewGuid(),
                    PortfolioId = portfolio.Id,
                    Symbol = faker.PickRandom(symbols),
                    Type = faker.PickRandom<TradeType>(),
                    Direction = faker.PickRandom<TradeDirection>(),
                    Amount = faker.Finance.Amount(100, 5000),
                    EntryPrice = entry,
                    ExitPrice = exit,
                    Stake = faker.Finance.Amount(10, 500),
                    Profit = isWin ? exit - entry : null,
                    Loss = !isWin ? entry - exit : null,
                    Status = faker.PickRandom<TradeStatus>(),
                    EntryTime = faker.Date.Past(1),
                    BotId = faker.Random.AlphaNumeric(12),
                    ExternalTradeId = faker.Random.AlphaNumeric(16),
                });
            }
        }

        await _context.Trades.AddRangeAsync(trades);
        await _context.SaveChangesAsync();
        _logger.LogInformation("Seeded {Count} trades", trades.Count);
    }

    // ── Transactions ──────────────────────────────────────────────────────────

    private async Task SeedTransactionsAsync(List<Investor> investors, List<Portfolio> portfolios, int count)
    {
        if (await _context.Transactions.AnyAsync()) return;

        var faker = new Faker<Transaction>()
            .RuleFor(t => t.Id, _ => Guid.NewGuid())
            .RuleFor(t => t.InvestorId, f => f.PickRandom(investors).Id)
            .RuleFor(t => t.Type, f => f.PickRandom<TransactionType>())
            .RuleFor(t => t.Amount, f => f.Finance.Amount(100, 50000))
            .RuleFor(t => t.Balance, f => f.Finance.Amount(0, 100000))
            .RuleFor(t => t.Currency, _ => "ZAR")
            .RuleFor(t => t.Status, f => f.PickRandom<TransactionStatus>())
            .RuleFor(t => t.CreatedAt, f => f.Date.Past(2))
            .RuleFor(t => t.Reference, f => f.Random.AlphaNumeric(12).ToUpper());

        var transactions = faker.Generate(count);
        await _context.Transactions.AddRangeAsync(transactions);
        await _context.SaveChangesAsync();
        _logger.LogInformation("Seeded {Count} transactions", transactions.Count);
    }

    // ── Notifications ─────────────────────────────────────────────────────────

    private async Task SeedNotificationsAsync(List<Investor> investors, int count)
    {
        if (await _context.Notifications.AnyAsync()) return;

        var faker = new Faker();
        var notifications = new List<Notification>();
        var types = new[] { "trade_alert", "kyc_update", "deposit", "withdrawal", "system", "social" };
        var titles = new[] {
            "Trade Executed Successfully",
            "KYC Document Approved",
            "Deposit Confirmed",
            "Withdrawal Processed",
            "System Maintenance Notice",
            "New Friend Request"
        };

        for (int i = 0; i < count; i++)
        {
            var type = faker.PickRandom(types);
            notifications.Add(new Notification
            {
                Id = Guid.NewGuid(),
                UserId = faker.PickRandom(investors).Id,
                Type = type,
                Title = faker.PickRandom(titles),
                Message = faker.Lorem.Paragraph(),
                Icon = null,
                IconColor = null,
                Link = null,
                IsRead = faker.Random.Bool(),
                CreatedAt = faker.Date.Past(1),
                MetadataJson = null
            });
        }

        await _context.Notifications.AddRangeAsync(notifications);
        await _context.SaveChangesAsync();
        _logger.LogInformation("Seeded {Count} notifications", notifications.Count);
    }

    // ── Performance Metrics ───────────────────────────────────────────────────

    private async Task SeedPerformanceMetricsAsync(List<Portfolio> portfolios, int count)
    {
        if (await _context.PerformanceMetrics.AnyAsync()) return;

        var faker = new Faker<PerformanceMetric>()
            .RuleFor(pm => pm.Id, _ => Guid.NewGuid())
            .RuleFor(pm => pm.PortfolioId, f => f.PickRandom(portfolios).Id)
            .RuleFor(pm => pm.Date, f => f.Date.Past(1))
            .RuleFor(pm => pm.TotalTrades, f => f.Random.Int(10, 500))
            .RuleFor(pm => pm.WinningTrades, (f, pm) => f.Random.Int(0, pm.TotalTrades))
            .RuleFor(pm => pm.LosingTrades, (f, pm) => pm.TotalTrades - pm.WinningTrades)
            .RuleFor(pm => pm.TotalProfit, f => f.Finance.Amount(0, 50000))
            .RuleFor(pm => pm.TotalLoss, f => f.Finance.Amount(0, 20000))
            .RuleFor(pm => pm.NetProfit, (f, pm) => pm.TotalProfit - pm.TotalLoss)
            .RuleFor(pm => pm.TotalValue, f => f.Finance.Amount(5000, 200000))
            .RuleFor(pm => pm.WinRate, (f, pm) => pm.TotalTrades > 0 ? (decimal)pm.WinningTrades / pm.TotalTrades * 100 : 0)
            .RuleFor(pm => pm.ProfitPercentage, f => f.Random.Decimal(-30, 100))
            .RuleFor(pm => pm.Drawdown, f => f.Random.Decimal(0, 20))
            .RuleFor(pm => pm.MaxDrawdown, f => f.Random.Decimal(0, 40))
            .RuleFor(pm => pm.SharpeRatio, f => f.Random.Decimal(-1, 3))
            .RuleFor(pm => pm.AverageWin, f => f.Finance.Amount(50, 2000))
            .RuleFor(pm => pm.AverageLoss, f => f.Finance.Amount(20, 1000))
            .RuleFor(pm => pm.ProfitFactor, f => f.Random.Decimal(0.5m, 3))
            .RuleFor(pm => pm.CreatedAt, f => f.Date.Past(1));

        var metrics = faker.Generate(count);
        await _context.PerformanceMetrics.AddRangeAsync(metrics);
        await _context.SaveChangesAsync();
        _logger.LogInformation("Seeded {Count} performance metrics", metrics.Count);
    }
}
