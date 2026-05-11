using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using InvestorManagementSystem.Application.Interfaces;
using InvestorManagementSystem.Core.Entities;
using InvestorManagementSystem.Infrastructure.Data;

namespace InvestorManagementSystem.Infrastructure.Repositories;

public class FriendSuggestionRepository : IFriendSuggestionRepository
{
    private readonly ApplicationDbContext _context;
    private readonly IMemoryCache _cache;
    private const string DismissedCacheKeyPrefix = "dismissed_suggestions_";
    private const int CacheExpirationHours = 24;

    public FriendSuggestionRepository(ApplicationDbContext context, IMemoryCache cache)
    {
        _context = context;
        _cache = cache;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Get Suggestions
    // ═══════════════════════════════════════════════════════════════════════════

    public async Task<IEnumerable<UserProfile>> GetSuggestionsAsync(Guid userId, int page = 1, int pageSize = 20)
    {
        // Get user's friends
        var userFriendIds = await GetUserFriendIdsAsync(userId);

        // Get dismissed suggestions
        var dismissedIds = GetDismissedSuggestions(userId);

        // Get friends of friends (excluding user, user's friends, and dismissed)
        var friendsOfFriends = await _context.Friendships
            .Where(f => userFriendIds.Contains(f.RequesterId) || userFriendIds.Contains(f.RecipientId))
            .Where(f => f.Status == FriendshipStatus.Accepted)
            .Select(f => userFriendIds.Contains(f.RequesterId) ? f.RecipientId : f.RequesterId)
            .Where(id => id != userId && !userFriendIds.Contains(id) && !dismissedIds.Contains(id))
            .Distinct()
            .ToListAsync();

        // Get user profile for matching
        var userProfile = await _context.UserProfiles.FindAsync(userId);
        if (userProfile == null)
            return Enumerable.Empty<UserProfile>();

        // Get potential suggestions
        var suggestions = await _context.UserProfiles
            .Where(u => friendsOfFriends.Contains(u.Id))
            .ToListAsync();

        // Calculate match scores and sort
        var scoredSuggestions = suggestions
            .Select(s => new
            {
                Profile = s,
                Score = CalculateMatchScoreSync(userProfile, s)
            })
            .OrderByDescending(s => s.Score)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(s => s.Profile);

        return scoredSuggestions;
    }

    public async Task<int> GetSuggestionsCountAsync(Guid userId)
    {
        var userFriendIds = await GetUserFriendIdsAsync(userId);
        var dismissedIds = GetDismissedSuggestions(userId);

        var friendsOfFriends = await _context.Friendships
            .Where(f => userFriendIds.Contains(f.RequesterId) || userFriendIds.Contains(f.RecipientId))
            .Where(f => f.Status == FriendshipStatus.Accepted)
            .Select(f => userFriendIds.Contains(f.RequesterId) ? f.RecipientId : f.RequesterId)
            .Where(id => id != userId && !userFriendIds.Contains(id) && !dismissedIds.Contains(id))
            .Distinct()
            .CountAsync();

        return await Task.FromResult(friendsOfFriends);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Calculate Match Score
    // ═══════════════════════════════════════════════════════════════════════════

    public async Task<int> CalculateMatchScoreAsync(Guid userId1, Guid userId2)
    {
        var user1 = await _context.UserProfiles.FindAsync(userId1);
        var user2 = await _context.UserProfiles.FindAsync(userId2);

        if (user1 == null || user2 == null)
            return 0;

        return CalculateMatchScoreSync(user1, user2);
    }

    public async Task<List<string>> GetMatchReasonsAsync(Guid userId1, Guid userId2)
    {
        var user1 = await _context.UserProfiles.FindAsync(userId1);
        var user2 = await _context.UserProfiles.FindAsync(userId2);

        if (user1 == null || user2 == null)
            return new List<string>();

        var reasons = new List<string>();

        // Mutual friends
        var mutualCount = await GetMutualFriendsCountAsync(userId1, userId2);
        if (mutualCount > 0)
            reasons.Add($"{mutualCount} mutual friend{(mutualCount > 1 ? "s" : "")}");

        // Same trading experience
        if (user1.TradingExperience.HasValue && user2.TradingExperience.HasValue &&
            user1.TradingExperience == user2.TradingExperience)
            reasons.Add($"Both {user1.TradingExperience} traders");

        // Same trading style
        if (user1.TradingStyle.HasValue && user2.TradingStyle.HasValue &&
            user1.TradingStyle == user2.TradingStyle)
            reasons.Add($"Both {user1.TradingStyle}s");

        // Similar markets
        if (!string.IsNullOrEmpty(user1.PreferredMarkets) && !string.IsNullOrEmpty(user2.PreferredMarkets))
        {
            var markets1 = user1.PreferredMarkets.Split(',', StringSplitOptions.RemoveEmptyEntries);
            var markets2 = user2.PreferredMarkets.Split(',', StringSplitOptions.RemoveEmptyEntries);
            var commonMarkets = markets1.Intersect(markets2).Count();
            if (commonMarkets > 0)
                reasons.Add($"{commonMarkets} common market{(commonMarkets > 1 ? "s" : "")}");
        }

        return reasons;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Dismissed Suggestions
    // ═══════════════════════════════════════════════════════════════════════════

    public async Task<bool> DismissSuggestionAsync(Guid userId, Guid suggestedUserId)
    {
        var dismissedIds = GetDismissedSuggestions(userId);
        dismissedIds.Add(suggestedUserId);

        var cacheKey = $"{DismissedCacheKeyPrefix}{userId}";
        _cache.Set(cacheKey, dismissedIds, TimeSpan.FromHours(CacheExpirationHours));

        return await Task.FromResult(true);
    }

    public async Task<bool> IsDismissedAsync(Guid userId, Guid suggestedUserId)
    {
        var dismissedIds = GetDismissedSuggestions(userId);
        return await Task.FromResult(dismissedIds.Contains(suggestedUserId));
    }

    public async Task<bool> RefreshSuggestionsAsync(Guid userId)
    {
        var cacheKey = $"{DismissedCacheKeyPrefix}{userId}";
        _cache.Remove(cacheKey);
        return await Task.FromResult(true);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Helper Methods
    // ═══════════════════════════════════════════════════════════════════════════

    private async Task<List<Guid>> GetUserFriendIdsAsync(Guid userId)
    {
        return await _context.Friendships
            .Where(f => (f.RequesterId == userId || f.RecipientId == userId) &&
                       f.Status == FriendshipStatus.Accepted)
            .Select(f => f.RequesterId == userId ? f.RecipientId : f.RequesterId)
            .ToListAsync();
    }

    private async Task<int> GetMutualFriendsCountAsync(Guid userId1, Guid userId2)
    {
        var user1Friends = await GetUserFriendIdsAsync(userId1);
        var user2Friends = await GetUserFriendIdsAsync(userId2);
        return user1Friends.Intersect(user2Friends).Count();
    }

    private HashSet<Guid> GetDismissedSuggestions(Guid userId)
    {
        var cacheKey = $"{DismissedCacheKeyPrefix}{userId}";
        return _cache.GetOrCreate(cacheKey, entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(CacheExpirationHours);
            return new HashSet<Guid>();
        }) ?? new HashSet<Guid>();
    }

    private int CalculateMatchScoreSync(UserProfile user1, UserProfile user2)
    {
        int score = 0;

        // Mutual friends (0-40 points)
        var mutualCount = GetMutualFriendsCountAsync(user1.Id, user2.Id).Result;
        score += Math.Min(mutualCount * 10, 40);

        // Same trading experience (20 points)
        if (user1.TradingExperience.HasValue && user2.TradingExperience.HasValue &&
            user1.TradingExperience == user2.TradingExperience)
            score += 20;

        // Same trading style (20 points)
        if (user1.TradingStyle.HasValue && user2.TradingStyle.HasValue &&
            user1.TradingStyle == user2.TradingStyle)
            score += 20;

        // Similar markets (0-20 points)
        if (!string.IsNullOrEmpty(user1.PreferredMarkets) && !string.IsNullOrEmpty(user2.PreferredMarkets))
        {
            var markets1 = user1.PreferredMarkets.Split(',', StringSplitOptions.RemoveEmptyEntries);
            var markets2 = user2.PreferredMarkets.Split(',', StringSplitOptions.RemoveEmptyEntries);
            var commonMarkets = markets1.Intersect(markets2).Count();
            score += Math.Min(commonMarkets * 5, 20);
        }

        return Math.Min(score, 100); // Cap at 100
    }
}
