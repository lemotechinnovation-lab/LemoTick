using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using InvestorManagementSystem.Infrastructure.Data;
using InvestorManagementSystem.Core.Entities;

namespace InvestorManagementSystem.Infrastructure.Services;

/// <summary>
/// Service for managing referrals and commissions
/// </summary>
public class ReferralService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<ReferralService> _logger;
    private const decimal DEFAULT_COMMISSION_RATE = 0.10m; // 10%

    public ReferralService(ApplicationDbContext context, ILogger<ReferralService> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Generate a unique referral code for an investor
    /// </summary>
    public async Task<string> GenerateReferralCodeAsync(Guid investorId)
    {
        var investor = await _context.Investors.FindAsync(investorId);
        if (investor == null)
            throw new InvalidOperationException("Investor not found");

        // If investor already has a code, return it
        if (!string.IsNullOrEmpty(investor.ReferralCode))
            return investor.ReferralCode;

        // Generate unique code based on investor name and ID
        var baseCode = $"{investor.FirstName}{investor.LastName}".ToUpper();
        baseCode = new string(baseCode.Where(char.IsLetterOrDigit).Take(6).ToArray());

        // Add random suffix for uniqueness
        var uniqueSuffix = GenerateRandomString(4);
        var referralCode = $"{baseCode}{uniqueSuffix}";

        // Ensure uniqueness
        while (await _context.Investors.AnyAsync(i => i.ReferralCode == referralCode))
        {
            uniqueSuffix = GenerateRandomString(4);
            referralCode = $"{baseCode}{uniqueSuffix}";
        }

        // Save to investor
        investor.ReferralCode = referralCode;
        await _context.SaveChangesAsync();

        _logger.LogInformation("Generated referral code {Code} for investor {InvestorId}", referralCode, investorId);
        return referralCode;
    }

    /// <summary>
    /// Validate and apply a referral code during registration
    /// </summary>
    public async Task<bool> ApplyReferralCodeAsync(Guid newInvestorId, string referralCode)
    {
        try
        {
            // Find the referrer by code
            var referrer = await _context.Investors
                .FirstOrDefaultAsync(i => i.ReferralCode == referralCode && i.Status == InvestorStatus.Active);

            if (referrer == null)
            {
                _logger.LogWarning("Invalid referral code: {Code}", referralCode);
                return false;
            }

            // Check if new investor already has a referrer
            var newInvestor = await _context.Investors.FindAsync(newInvestorId);
            if (newInvestor == null || newInvestor.ReferredBy.HasValue)
            {
                _logger.LogWarning("Investor {InvestorId} already has a referrer or doesn't exist", newInvestorId);
                return false;
            }

            // Cannot refer yourself
            if (referrer.Id == newInvestorId)
            {
                _logger.LogWarning("Investor {InvestorId} attempted to refer themselves", newInvestorId);
                return false;
            }

            // Create referral record
            var referral = new Referral
            {
                Id = Guid.NewGuid(),
                ReferrerInvestorId = referrer.Id,
                ReferredInvestorId = newInvestorId,
                ReferralCode = referralCode,
                ReferredAt = DateTime.UtcNow,
                Status = ReferralStatus.Registered,
                CommissionRate = DEFAULT_COMMISSION_RATE
            };

            _context.Referrals.Add(referral);

            // Update investor's ReferredBy field
            newInvestor.ReferredBy = referrer.Id;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Referral applied: {ReferrerId} referred {ReferredId} with code {Code}",
                referrer.Id, newInvestorId, referralCode);

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error applying referral code {Code} for investor {InvestorId}",
                referralCode, newInvestorId);
            return false;
        }
    }

    /// <summary>
    /// Mark a referral as converted (when referred investor makes first deposit)
    /// </summary>
    public async Task MarkReferralAsConvertedAsync(Guid referredInvestorId, decimal depositAmount)
    {
        try
        {
            var referral = await _context.Referrals
                .FirstOrDefaultAsync(r => r.ReferredInvestorId == referredInvestorId && r.Status == ReferralStatus.Registered);

            if (referral == null)
            {
                _logger.LogInformation("No pending referral found for investor {InvestorId}", referredInvestorId);
                return;
            }

            // Update referral status
            referral.Status = ReferralStatus.Active;
            referral.ConvertedAt = DateTime.UtcNow;

            // Calculate commission
            var commissionAmount = depositAmount * referral.CommissionRate;
            referral.CommissionEarned += commissionAmount;

            // Create commission record
            var commission = new ReferralCommission
            {
                Id = Guid.NewGuid(),
                ReferralId = referral.Id,
                ReferrerInvestorId = referral.ReferrerInvestorId,
                Amount = commissionAmount,
                Currency = "ZAR",
                EarnedAt = DateTime.UtcNow,
                Status = CommissionStatus.Pending,
                Description = $"Commission from first deposit of referred investor (R{depositAmount:N2})"
            };

            _context.ReferralCommissions.Add(commission);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Referral {ReferralId} converted. Commission R{Commission:N2} earned by {ReferrerId}",
                referral.Id, commissionAmount, referral.ReferrerInvestorId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error marking referral as converted for investor {InvestorId}", referredInvestorId);
        }
    }

    /// <summary>
    /// Calculate and award ongoing commissions (e.g., percentage of trading fees)
    /// </summary>
    public async Task AwardOngoingCommissionAsync(Guid referredInvestorId, decimal amount, string description)
    {
        try
        {
            var referral = await _context.Referrals
                .FirstOrDefaultAsync(r => r.ReferredInvestorId == referredInvestorId && r.Status == ReferralStatus.Active);

            if (referral == null)
                return;

            var commissionAmount = amount * referral.CommissionRate;
            referral.CommissionEarned += commissionAmount;

            var commission = new ReferralCommission
            {
                Id = Guid.NewGuid(),
                ReferralId = referral.Id,
                ReferrerInvestorId = referral.ReferrerInvestorId,
                Amount = commissionAmount,
                Currency = "ZAR",
                EarnedAt = DateTime.UtcNow,
                Status = CommissionStatus.Pending,
                Description = description
            };

            _context.ReferralCommissions.Add(commission);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Ongoing commission R{Commission:N2} awarded to {ReferrerId}",
                commissionAmount, referral.ReferrerInvestorId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error awarding ongoing commission for investor {InvestorId}", referredInvestorId);
        }
    }

    /// <summary>
    /// Get referral summary for an investor
    /// </summary>
    public async Task<(int totalReferrals, int activeReferrals, decimal totalCommission, decimal pendingCommission)>
        GetReferralSummaryAsync(Guid investorId)
    {
        var totalReferrals = await _context.Referrals
            .CountAsync(r => r.ReferrerInvestorId == investorId);

        var activeReferrals = await _context.Referrals
            .CountAsync(r => r.ReferrerInvestorId == investorId && r.Status == ReferralStatus.Active);

        var totalCommission = await _context.ReferralCommissions
            .Where(c => c.ReferrerInvestorId == investorId && c.Status == CommissionStatus.Paid)
            .SumAsync(c => (decimal?)c.Amount) ?? 0m;

        var pendingCommission = await _context.ReferralCommissions
            .Where(c => c.ReferrerInvestorId == investorId &&
                       (c.Status == CommissionStatus.Pending || c.Status == CommissionStatus.Approved))
            .SumAsync(c => (decimal?)c.Amount) ?? 0m;

        return (totalReferrals, activeReferrals, totalCommission, pendingCommission);
    }

    /// <summary>
    /// Get leaderboard of top referrers
    /// </summary>
    public async Task<List<(Guid investorId, string name, int referralCount, decimal totalCommission)>>
        GetLeaderboardAsync(int topCount = 10)
    {
        var leaderboard = await _context.Referrals
            .GroupBy(r => r.ReferrerInvestorId)
            .Select(g => new
            {
                InvestorId = g.Key,
                ReferralCount = g.Count(),
                ActiveCount = g.Count(r => r.Status == ReferralStatus.Active),
                TotalCommission = g.Sum(r => r.CommissionEarned)
            })
            .OrderByDescending(x => x.ActiveCount)
            .ThenByDescending(x => x.TotalCommission)
            .Take(topCount)
            .ToListAsync();

        var investorIds = leaderboard.Select(l => l.InvestorId).ToList();
        var investors = await _context.Investors
            .Where(i => investorIds.Contains(i.Id))
            .ToDictionaryAsync(i => i.Id, i => $"{i.FirstName} {i.LastName}");

        return leaderboard.Select(l => (
            l.InvestorId,
            investors.GetValueOrDefault(l.InvestorId, "Unknown"),
            l.ReferralCount,
            l.TotalCommission
        )).ToList();
    }

    /// <summary>
    /// Validate referral code format and availability
    /// </summary>
    public async Task<bool> ValidateReferralCodeAsync(string referralCode)
    {
        if (string.IsNullOrWhiteSpace(referralCode))
            return false;

        return await _context.Investors.AnyAsync(i => i.ReferralCode == referralCode && i.Status == InvestorStatus.Active);
    }

    private string GenerateRandomString(int length)
    {
        const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        var random = new Random();
        return new string(Enumerable.Range(0, length)
            .Select(_ => chars[random.Next(chars.Length)])
            .ToArray());
    }
}

