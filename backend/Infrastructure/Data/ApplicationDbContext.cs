using Microsoft.EntityFrameworkCore;
using InvestorManagementSystem.Core.Entities;

namespace InvestorManagementSystem.Infrastructure.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    // ── Core entities ─────────────────────────────────────────────────────────
    public DbSet<Investor> Investors => Set<Investor>();
    public DbSet<Portfolio> Portfolios => Set<Portfolio>();
    public DbSet<Trade> Trades => Set<Trade>();
    public DbSet<Transaction> Transactions => Set<Transaction>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<KYCDocument> KYCDocuments => Set<KYCDocument>();
    public DbSet<PerformanceMetric> PerformanceMetrics => Set<PerformanceMetric>();
    public DbSet<BankAccount> BankAccounts => Set<BankAccount>();
    public DbSet<Fee> Fees => Set<Fee>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<WithdrawalRequest> WithdrawalRequests => Set<WithdrawalRequest>();
    public DbSet<Referral> Referrals => Set<Referral>();
    public DbSet<ReferralCommission> ReferralCommissions => Set<ReferralCommission>();
    public DbSet<SuspiciousActivityReport> SuspiciousActivityReports => Set<SuspiciousActivityReport>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<InvestorPreferences> InvestorPreferences => Set<InvestorPreferences>();

    // ── Lookup tables (named to match controller access patterns) ─────────────
    public DbSet<InvestorStatusLookup> InvestorStatusLookup => Set<InvestorStatusLookup>();
    public DbSet<UserRoleLookup> UserRoleLookup => Set<UserRoleLookup>();
    public DbSet<PortfolioStatusLookup> PortfolioStatusLookup => Set<PortfolioStatusLookup>();
    public DbSet<RiskLevelLookup> RiskLevelLookup => Set<RiskLevelLookup>();
    public DbSet<TradeTypeLookup> TradeTypeLookup => Set<TradeTypeLookup>();
    public DbSet<TradeDirectionLookup> TradeDirectionLookup => Set<TradeDirectionLookup>();
    public DbSet<TradeStatusLookup> TradeStatusLookup => Set<TradeStatusLookup>();
    public DbSet<TransactionTypeLookup> TransactionTypeLookup => Set<TransactionTypeLookup>();
    public DbSet<TransactionStatusLookup> TransactionStatusLookup => Set<TransactionStatusLookup>();
    public DbSet<NotificationTypeLookup> NotificationTypeLookup => Set<NotificationTypeLookup>();
    public DbSet<NotificationPriorityLookup> NotificationPriorityLookup => Set<NotificationPriorityLookup>();
    public DbSet<DocumentTypeLookup> DocumentTypeLookup => Set<DocumentTypeLookup>();
    public DbSet<DocumentStatusLookup> DocumentStatusLookup => Set<DocumentStatusLookup>();
    public DbSet<SARStatusLookup> SARStatusLookup => Set<SARStatusLookup>();
    public DbSet<FeeTypeLookup> FeeTypeLookup => Set<FeeTypeLookup>();
    public DbSet<FeeStatusLookup> FeeStatusLookup => Set<FeeStatusLookup>();
    public DbSet<WithdrawalStatusLookup> WithdrawalStatusLookup => Set<WithdrawalStatusLookup>();
    public DbSet<ReferralStatusLookup> ReferralStatusLookup => Set<ReferralStatusLookup>();
    public DbSet<CommissionStatusLookup> CommissionStatusLookup => Set<CommissionStatusLookup>();
    public DbSet<PaymentTypeLookup> PaymentTypeLookup => Set<PaymentTypeLookup>();
    public DbSet<PaymentMethodLookup> PaymentMethodLookup => Set<PaymentMethodLookup>();
    public DbSet<PaymentStatusLookup> PaymentStatusLookup => Set<PaymentStatusLookup>();
    public DbSet<BankAccountTypeLookup> BankAccountTypeLookup => Set<BankAccountTypeLookup>();
    public DbSet<BankAccountStatusLookup> BankAccountStatusLookup => Set<BankAccountStatusLookup>();
    public DbSet<StatementDeliveryMethodLookup> StatementDeliveryMethodLookup => Set<StatementDeliveryMethodLookup>();
    public DbSet<RiskToleranceLookup> RiskToleranceLookup => Set<RiskToleranceLookup>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ── Investor ──────────────────────────────────────────────────────────
        modelBuilder.Entity<Investor>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Email).IsUnique();
            entity.HasIndex(e => e.ReferralCode).IsUnique();

            entity.HasMany(e => e.Portfolios)
                  .WithOne(p => p.Investor)
                  .HasForeignKey(p => p.InvestorId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(e => e.Transactions)
                  .WithOne()
                  .HasForeignKey(t => t.InvestorId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(e => e.Notifications)
                  .WithOne()
                  .HasForeignKey(n => n.InvestorId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(e => e.KYCDocuments)
                  .WithOne()
                  .HasForeignKey(k => k.InvestorId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(e => e.ReferralsMade)
                  .WithOne()
                  .HasForeignKey(r => r.ReferrerInvestorId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasMany(e => e.Commissions)
                  .WithOne()
                  .HasForeignKey(c => c.ReferrerInvestorId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // ── Portfolio ─────────────────────────────────────────────────────────
        modelBuilder.Entity<Portfolio>(entity =>
        {
            entity.HasKey(e => e.Id);

            entity.HasMany(e => e.Trades)
                  .WithOne(t => t.Portfolio)
                  .HasForeignKey(t => t.PortfolioId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(e => e.PerformanceMetrics)
                  .WithOne()
                  .HasForeignKey(pm => pm.PortfolioId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // ── AuditLog ──────────────────────────────────────────────────────────
        modelBuilder.Entity<AuditLog>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Timestamp);
            entity.HasIndex(e => e.EntityType);
        });

        // ── InvestorPreferences (1-to-1) ──────────────────────────────────────
        modelBuilder.Entity<InvestorPreferences>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.InvestorId).IsUnique();
        });
    }
}
