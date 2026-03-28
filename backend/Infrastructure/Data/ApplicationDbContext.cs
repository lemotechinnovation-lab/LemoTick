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

    // ── Lookup tables ─────────────────────────────────────────────────────────
    public DbSet<InvestorStatusLookup> InvestorStatusLookups => Set<InvestorStatusLookup>();
    public DbSet<UserRoleLookup> UserRoleLookups => Set<UserRoleLookup>();
    public DbSet<PortfolioStatusLookup> PortfolioStatusLookups => Set<PortfolioStatusLookup>();
    public DbSet<RiskLevelLookup> RiskLevelLookups => Set<RiskLevelLookup>();
    public DbSet<TradeTypeLookup> TradeTypeLookups => Set<TradeTypeLookup>();
    public DbSet<TradeDirectionLookup> TradeDirectionLookups => Set<TradeDirectionLookup>();
    public DbSet<TradeStatusLookup> TradeStatusLookups => Set<TradeStatusLookup>();
    public DbSet<TransactionTypeLookup> TransactionTypeLookups => Set<TransactionTypeLookup>();
    public DbSet<TransactionStatusLookup> TransactionStatusLookups => Set<TransactionStatusLookup>();
    public DbSet<NotificationTypeLookup> NotificationTypeLookups => Set<NotificationTypeLookup>();
    public DbSet<NotificationPriorityLookup> NotificationPriorityLookups => Set<NotificationPriorityLookup>();
    public DbSet<DocumentTypeLookup> DocumentTypeLookups => Set<DocumentTypeLookup>();
    public DbSet<DocumentStatusLookup> DocumentStatusLookups => Set<DocumentStatusLookup>();
    public DbSet<SARStatusLookup> SARStatusLookups => Set<SARStatusLookup>();
    public DbSet<FeeTypeLookup> FeeTypeLookups => Set<FeeTypeLookup>();
    public DbSet<FeeStatusLookup> FeeStatusLookups => Set<FeeStatusLookup>();
    public DbSet<WithdrawalStatusLookup> WithdrawalStatusLookups => Set<WithdrawalStatusLookup>();
    public DbSet<ReferralStatusLookup> ReferralStatusLookups => Set<ReferralStatusLookup>();
    public DbSet<CommissionStatusLookup> CommissionStatusLookups => Set<CommissionStatusLookup>();
    public DbSet<PaymentTypeLookup> PaymentTypeLookups => Set<PaymentTypeLookup>();
    public DbSet<PaymentMethodLookup> PaymentMethodLookups => Set<PaymentMethodLookup>();
    public DbSet<PaymentStatusLookup> PaymentStatusLookups => Set<PaymentStatusLookup>();
    public DbSet<BankAccountTypeLookup> BankAccountTypeLookups => Set<BankAccountTypeLookup>();
    public DbSet<BankAccountStatusLookup> BankAccountStatusLookups => Set<BankAccountStatusLookup>();
    public DbSet<StatementDeliveryMethodLookup> StatementDeliveryMethodLookups => Set<StatementDeliveryMethodLookup>();
    public DbSet<RiskToleranceLookup> RiskToleranceLookups => Set<RiskToleranceLookup>();

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
                  .WithOne()
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
                  .WithOne()
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

        // ── InvestorPreferences (1-to-1 with Investor) ────────────────────────
        modelBuilder.Entity<InvestorPreferences>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.InvestorId).IsUnique();
        });

        // ── SuspiciousActivityReport ──────────────────────────────────────────
        modelBuilder.Entity<SuspiciousActivityReport>(entity =>
        {
            entity.HasKey(e => e.Id);
        });
    }
}
