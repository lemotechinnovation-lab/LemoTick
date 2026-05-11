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

    // ── Social Networking entities ────────────────────────────────────────────
    public DbSet<UserProfile> UserProfiles => Set<UserProfile>();
    public DbSet<Friendship> Friendships => Set<Friendship>();
    public DbSet<BlockedUser> BlockedUsers => Set<BlockedUser>();
    public DbSet<FriendList> FriendLists => Set<FriendList>();
    public DbSet<FriendListMember> FriendListMembers => Set<FriendListMember>();
    public DbSet<PrivacySettings> PrivacySettings => Set<PrivacySettings>();

    // ── Messaging entities ─────────────────────────────────────────────────────
    public DbSet<Conversation> Conversations => Set<Conversation>();
    public DbSet<Message> Messages => Set<Message>();

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
                  .HasForeignKey(n => n.UserId)
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

        // ── UserProfile ───────────────────────────────────────────────────────
        modelBuilder.Entity<UserProfile>(entity =>
        {
            entity.HasKey(e => e.Id);

            // Unique indexes
            entity.HasIndex(e => e.InvestorId).IsUnique();
            entity.HasIndex(e => e.Username).IsUnique();

            // Regular indexes for performance
            entity.HasIndex(e => e.OnlineStatus);
            entity.HasIndex(e => e.LastSeenAt);

            // 1:1 relationship with Investor
            entity.HasOne(e => e.Investor)
                  .WithOne()
                  .HasForeignKey<UserProfile>(e => e.InvestorId)
                  .OnDelete(DeleteBehavior.Cascade);

            // 1:Many relationship with Friendships (as Requester)
            entity.HasMany(e => e.FriendshipsInitiated)
                  .WithOne(f => f.Requester)
                  .HasForeignKey(f => f.RequesterId)
                  .OnDelete(DeleteBehavior.Restrict);

            // 1:Many relationship with Friendships (as Recipient)
            entity.HasMany(e => e.FriendshipsReceived)
                  .WithOne(f => f.Recipient)
                  .HasForeignKey(f => f.RecipientId)
                  .OnDelete(DeleteBehavior.Restrict);

            // 1:Many relationship with BlockedUsers (as Blocker)
            entity.HasMany(e => e.BlockedUsers)
                  .WithOne(b => b.Blocker)
                  .HasForeignKey(b => b.BlockerId)
                  .OnDelete(DeleteBehavior.Restrict);

            // 1:Many relationship with BlockedUsers (as Blocked)
            entity.HasMany(e => e.BlockedByUsers)
                  .WithOne(b => b.Blocked)
                  .HasForeignKey(b => b.BlockedId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // ── Friendship ────────────────────────────────────────────────────────
        modelBuilder.Entity<Friendship>(entity =>
        {
            entity.HasKey(e => e.Id);

            // Composite indexes for efficient queries
            entity.HasIndex(e => new { e.RequesterId, e.RecipientId });
            entity.HasIndex(e => new { e.RecipientId, e.Status });
            entity.HasIndex(e => new { e.RequesterId, e.Status });
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.CreatedAt);

            // Prevent duplicate friend requests
            entity.HasIndex(e => new { e.RequesterId, e.RecipientId, e.Status })
                  .IsUnique()
                  .HasFilter("\"Status\" = 0 OR \"Status\" = 1"); // Pending or Accepted
        });

        // ── BlockedUser ───────────────────────────────────────────────────────
        modelBuilder.Entity<BlockedUser>(entity =>
        {
            entity.HasKey(e => e.Id);

            // Composite index for efficient queries
            entity.HasIndex(e => new { e.BlockerId, e.BlockedId }).IsUnique();
            entity.HasIndex(e => e.BlockedAt);
        });

        // ── FriendList ────────────────────────────────────────────────────────
        modelBuilder.Entity<FriendList>(entity =>
        {
            entity.HasKey(e => e.Id);

            // Index for owner queries
            entity.HasIndex(e => e.OwnerId);
            entity.HasIndex(e => e.CreatedAt);

            // 1:Many relationship with UserProfile (Owner)
            entity.HasOne(e => e.Owner)
                  .WithMany()
                  .HasForeignKey(e => e.OwnerId)
                  .OnDelete(DeleteBehavior.Cascade);

            // 1:Many relationship with FriendListMembers
            entity.HasMany(e => e.Members)
                  .WithOne(m => m.FriendList)
                  .HasForeignKey(m => m.FriendListId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // ── FriendListMember ──────────────────────────────────────────────────
        modelBuilder.Entity<FriendListMember>(entity =>
        {
            entity.HasKey(e => e.Id);

            // Composite index to prevent duplicate members in same list
            entity.HasIndex(e => new { e.FriendListId, e.FriendId }).IsUnique();
            entity.HasIndex(e => e.AddedAt);

            // Relationship with UserProfile (Friend)
            entity.HasOne(e => e.Friend)
                  .WithMany()
                  .HasForeignKey(e => e.FriendId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // ── PrivacySettings (1-to-1) ──────────────────────────────────────────
        modelBuilder.Entity<PrivacySettings>(entity =>
        {
            entity.HasKey(e => e.Id);

            // Unique index for 1:1 relationship
            entity.HasIndex(e => e.UserProfileId).IsUnique();

            // 1:1 relationship with UserProfile
            entity.HasOne(e => e.UserProfile)
                  .WithOne()
                  .HasForeignKey<PrivacySettings>(e => e.UserProfileId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // ── Conversation ──────────────────────────────────────────────────────
        modelBuilder.Entity<Conversation>(entity =>
        {
            entity.HasKey(e => e.Id);

            // Composite index for efficient queries
            entity.HasIndex(e => new { e.User1Id, e.User2Id });
            entity.HasIndex(e => e.UpdatedAt);

            // Prevent duplicate conversations
            entity.HasIndex(e => new { e.User1Id, e.User2Id }).IsUnique();
        });

        // ── Message ───────────────────────────────────────────────────────────
        modelBuilder.Entity<Message>(entity =>
        {
            entity.HasKey(e => e.Id);

            // Indexes for efficient queries
            entity.HasIndex(e => e.ConversationId);
            entity.HasIndex(e => new { e.ConversationId, e.CreatedAt });
            entity.HasIndex(e => new { e.ConversationId, e.IsRead });

            // Relationship with Conversation
            entity.HasOne(e => e.Conversation)
                  .WithMany()
                  .HasForeignKey(e => e.ConversationId)
                  .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
