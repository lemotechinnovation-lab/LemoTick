using Microsoft.EntityFrameworkCore;
using InvestorManagementSystem.Application.Interfaces;
using InvestorManagementSystem.Core.Entities;
using InvestorManagementSystem.Infrastructure.Data;

namespace InvestorManagementSystem.Infrastructure.Repositories;

public class SocialStatisticsRepository : ISocialStatisticsRepository
{
    private readonly ApplicationDbContext _context;

    public SocialStatisticsRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // User Statistics
    // ═══════════════════════════════════════════════════════════════════════════

    public async Task<int> GetTotalFriendsAsync(Guid userId)
    {
        return await _context.Friendships
            .Where(f => (f.RequesterId == userId || f.RecipientId == userId) &&
                       f.Status == FriendshipStatus.Accepted)
            .CountAsync();
    }

    public async Task<int> GetPendingReceivedRequestsAsync(Guid userId)
    {
        return await _context.Friendships
            .Where(f => f.RecipientId == userId && f.Status == FriendshipStatus.Pending)
            .CountAsync();
    }

    public async Task<int> GetPendingSentRequestsAsync(Guid userId)
    {
        return await _context.Friendships
            .Where(f => f.RequesterId == userId && f.Status == FriendshipStatus.Pending)
            .CountAsync();
    }

    public async Task<int> GetOnlineFriendsAsync(Guid userId)
    {
        var friendships = await _context.Friendships
            .Include(f => f.Requester)
            .Include(f => f.Recipient)
            .Where(f => (f.RequesterId == userId || f.RecipientId == userId) &&
                       f.Status == FriendshipStatus.Accepted)
            .ToListAsync();

        var friends = friendships.Select(f => f.RequesterId == userId ? f.Recipient : f.Requester);
        return friends.Count(f => f.OnlineStatus == OnlineStatus.Online);
    }

    public async Task<int> GetBlockedUsersAsync(Guid userId)
    {
        return await _context.BlockedUsers
            .Where(b => b.BlockerId == userId)
            .CountAsync();
    }

    public async Task<int> GetFriendListsAsync(Guid userId)
    {
        return await _context.FriendLists
            .Where(fl => fl.OwnerId == userId)
            .CountAsync();
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Global Statistics
    // ═══════════════════════════════════════════════════════════════════════════

    public async Task<int> GetTotalUsersAsync()
    {
        return await _context.UserProfiles.CountAsync();
    }

    public async Task<int> GetTotalFriendshipsAsync()
    {
        return await _context.Friendships
            .Where(f => f.Status == FriendshipStatus.Accepted)
            .CountAsync();
    }

    public async Task<int> GetTotalPendingRequestsAsync()
    {
        return await _context.Friendships
            .Where(f => f.Status == FriendshipStatus.Pending)
            .CountAsync();
    }

    public async Task<int> GetActiveUsersAsync(TimeSpan timeSpan)
    {
        var cutoffTime = DateTime.UtcNow.Subtract(timeSpan);
        return await _context.UserProfiles
            .Where(u => u.LastSeenAt.HasValue && u.LastSeenAt.Value >= cutoffTime)
            .CountAsync();
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Activity Statistics
    // ═══════════════════════════════════════════════════════════════════════════

    public async Task<Dictionary<DateTime, int>> GetFriendRequestsOverTimeAsync(Guid userId, DateTime startDate, DateTime endDate)
    {
        var requests = await _context.Friendships
            .Where(f => (f.RequesterId == userId || f.RecipientId == userId) &&
                       f.CreatedAt >= startDate && f.CreatedAt <= endDate)
            .GroupBy(f => f.CreatedAt.Date)
            .Select(g => new { Date = g.Key, Count = g.Count() })
            .ToListAsync();

        return requests.ToDictionary(r => r.Date, r => r.Count);
    }

    public async Task<Dictionary<DateTime, int>> GetNewFriendsOverTimeAsync(Guid userId, DateTime startDate, DateTime endDate)
    {
        var newFriends = await _context.Friendships
            .Where(f => (f.RequesterId == userId || f.RecipientId == userId) &&
                       f.Status == FriendshipStatus.Accepted &&
                       f.AcceptedAt.HasValue &&
                       f.AcceptedAt.Value >= startDate &&
                       f.AcceptedAt.Value <= endDate)
            .GroupBy(f => f.AcceptedAt!.Value.Date)
            .Select(g => new { Date = g.Key, Count = g.Count() })
            .ToListAsync();

        return newFriends.ToDictionary(r => r.Date, r => r.Count);
    }
}
