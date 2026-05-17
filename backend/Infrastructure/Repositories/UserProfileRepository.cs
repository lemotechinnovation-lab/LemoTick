using Microsoft.EntityFrameworkCore;
using InvestorManagementSystem.Application.Interfaces;
using InvestorManagementSystem.Core.Entities;
using InvestorManagementSystem.Infrastructure.Data;

namespace InvestorManagementSystem.Infrastructure.Repositories;

public class UserProfileRepository : IUserProfileRepository
{
    private readonly ApplicationDbContext _context;

    public UserProfileRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Basic CRUD Operations
    // ═══════════════════════════════════════════════════════════════════════════

    public async Task<UserProfile?> GetByIdAsync(Guid id)
    {
        return await _context.UserProfiles
            .Include(u => u.Investor)
            .FirstOrDefaultAsync(u => u.Id == id);
    }

    public async Task<UserProfile?> GetByInvestorIdAsync(Guid investorId)
    {
        return await _context.UserProfiles
            .Include(u => u.Investor)
            .FirstOrDefaultAsync(u => u.InvestorId == investorId);
    }

    public async Task<UserProfile?> GetByUsernameAsync(string username)
    {
        return await _context.UserProfiles
            .Include(u => u.Investor)
            .FirstOrDefaultAsync(u => u.Username == username);
    }

    public async Task<UserProfile> CreateAsync(UserProfile userProfile)
    {
        userProfile.CreatedAt = DateTime.UtcNow;
        _context.UserProfiles.Add(userProfile);
        await _context.SaveChangesAsync();
        return userProfile;
    }

    public async Task<UserProfile?> UpdateAsync(UserProfile userProfile)
    {
        var existing = await _context.UserProfiles.FindAsync(userProfile.Id);
        if (existing == null)
            return null;

        userProfile.UpdatedAt = DateTime.UtcNow;
        _context.Entry(existing).CurrentValues.SetValues(userProfile);
        await _context.SaveChangesAsync();
        return existing;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var userProfile = await _context.UserProfiles.FindAsync(id);
        if (userProfile == null)
            return false;

        _context.UserProfiles.Remove(userProfile);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ExistsAsync(Guid id)
    {
        return await _context.UserProfiles.AnyAsync(u => u.Id == id);
    }

    public async Task<bool> UsernameExistsAsync(string username, Guid? excludeUserId = null)
    {
        var query = _context.UserProfiles.Where(u => u.Username == username);

        if (excludeUserId.HasValue)
            query = query.Where(u => u.Id != excludeUserId.Value);

        return await query.AnyAsync();
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Profile Queries
    // ═══════════════════════════════════════════════════════════════════════════

    public async Task<IEnumerable<UserProfile>> GetAllAsync(int page = 1, int pageSize = 20)
    {
        return await _context.UserProfiles
            .Include(u => u.Investor)
            .OrderBy(u => u.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<int> GetTotalCountAsync()
    {
        return await _context.UserProfiles.CountAsync();
    }

    public async Task<IEnumerable<UserProfile>> GetOnlineUsersAsync(int page = 1, int pageSize = 20)
    {
        return await _context.UserProfiles
            .Include(u => u.Investor)
            .Where(u => u.OnlineStatus == OnlineStatus.Online)
            .OrderBy(u => u.LastSeenAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<IEnumerable<UserProfile>> GetByOnlineStatusAsync(OnlineStatus status, int page = 1, int pageSize = 20)
    {
        return await _context.UserProfiles
            .Include(u => u.Investor)
            .Where(u => u.OnlineStatus == status)
            .OrderBy(u => u.LastSeenAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Search
    // ═══════════════════════════════════════════════════════════════════════════

    public async Task<(IEnumerable<UserProfile> Users, int TotalCount)> SearchAsync(
        string? query,
        TradingExperience? tradingExperience = null,
        TradingStyle? tradingStyle = null,
        int page = 1,
        int pageSize = 20)
    {
        var queryable = _context.UserProfiles
            .Include(u => u.Investor)
            .AsQueryable();

        // Text search
        if (!string.IsNullOrWhiteSpace(query))
        {
            var searchTerm = query.ToLower();
            queryable = queryable.Where(u =>
                (u.Username != null && u.Username.ToLower().Contains(searchTerm)) ||
                (u.DisplayName != null && u.DisplayName.ToLower().Contains(searchTerm)) ||
                (u.Bio != null && u.Bio.ToLower().Contains(searchTerm)));
        }

        // Filter by trading experience
        if (tradingExperience.HasValue)
        {
            queryable = queryable.Where(u => u.TradingExperience == tradingExperience.Value);
        }

        // Filter by trading style
        if (tradingStyle.HasValue)
        {
            queryable = queryable.Where(u => u.TradingStyle == tradingStyle.Value);
        }

        var totalCount = await queryable.CountAsync();

        var users = await queryable
            .OrderBy(u => u.Username)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (users, totalCount);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Online Status Management
    // ═══════════════════════════════════════════════════════════════════════════

    public async Task<bool> UpdateOnlineStatusAsync(Guid userId, OnlineStatus status)
    {
        var userProfile = await _context.UserProfiles.FindAsync(userId);
        if (userProfile == null)
            return false;

        userProfile.OnlineStatus = status;
        userProfile.LastSeenAt = DateTime.UtcNow;
        userProfile.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> UpdateLastSeenAsync(Guid userId, DateTime lastSeenAt)
    {
        var userProfile = await _context.UserProfiles.FindAsync(userId);
        if (userProfile == null)
            return false;

        userProfile.LastSeenAt = lastSeenAt;
        userProfile.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return true;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Statistics
    // ═══════════════════════════════════════════════════════════════════════════

    public async Task<int> GetFriendsCountAsync(Guid userId)
    {
        return await _context.Friendships
            .Where(f => (f.RequesterId == userId || f.RecipientId == userId) &&
                       f.Status == FriendshipStatus.Accepted)
            .CountAsync();
    }

    public async Task<int> GetMutualFriendsCountAsync(Guid userId1, Guid userId2)
    {
        // Get user1's friends
        var user1Friends = await _context.Friendships
            .Where(f => (f.RequesterId == userId1 || f.RecipientId == userId1) &&
                       f.Status == FriendshipStatus.Accepted)
            .Select(f => f.RequesterId == userId1 ? f.RecipientId : f.RequesterId)
            .ToListAsync();

        // Get user2's friends
        var user2Friends = await _context.Friendships
            .Where(f => (f.RequesterId == userId2 || f.RecipientId == userId2) &&
                       f.Status == FriendshipStatus.Accepted)
            .Select(f => f.RequesterId == userId2 ? f.RecipientId : f.RequesterId)
            .ToListAsync();

        // Count mutual friends
        return user1Friends.Intersect(user2Friends).Count();
    }
}
