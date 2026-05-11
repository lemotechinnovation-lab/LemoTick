using Microsoft.EntityFrameworkCore;
using InvestorManagementSystem.Application.Interfaces;
using InvestorManagementSystem.Core.Entities;
using InvestorManagementSystem.Infrastructure.Data;

namespace InvestorManagementSystem.Infrastructure.Repositories;

public class PrivacySettingsRepository : IPrivacySettingsRepository
{
    private readonly ApplicationDbContext _context;

    public PrivacySettingsRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Basic CRUD Operations
    // ═══════════════════════════════════════════════════════════════════════════

    public async Task<PrivacySettings?> GetByIdAsync(Guid id)
    {
        return await _context.PrivacySettings
            .Include(ps => ps.UserProfile)
            .FirstOrDefaultAsync(ps => ps.Id == id);
    }

    public async Task<PrivacySettings?> GetByUserProfileIdAsync(Guid userProfileId)
    {
        return await _context.PrivacySettings
            .Include(ps => ps.UserProfile)
            .FirstOrDefaultAsync(ps => ps.UserProfileId == userProfileId);
    }

    public async Task<PrivacySettings> CreateAsync(PrivacySettings privacySettings)
    {
        privacySettings.CreatedAt = DateTime.UtcNow;
        _context.PrivacySettings.Add(privacySettings);
        await _context.SaveChangesAsync();
        return privacySettings;
    }

    public async Task<PrivacySettings?> UpdateAsync(PrivacySettings privacySettings)
    {
        var existing = await _context.PrivacySettings.FindAsync(privacySettings.Id);
        if (existing == null)
            return null;

        privacySettings.UpdatedAt = DateTime.UtcNow;
        _context.Entry(existing).CurrentValues.SetValues(privacySettings);
        await _context.SaveChangesAsync();
        return existing;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var privacySettings = await _context.PrivacySettings.FindAsync(id);
        if (privacySettings == null)
            return false;

        _context.PrivacySettings.Remove(privacySettings);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ExistsAsync(Guid id)
    {
        return await _context.PrivacySettings.AnyAsync(ps => ps.Id == id);
    }

    public async Task<bool> ExistsForUserAsync(Guid userProfileId)
    {
        return await _context.PrivacySettings.AnyAsync(ps => ps.UserProfileId == userProfileId);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Privacy Checks
    // ═══════════════════════════════════════════════════════════════════════════

    public async Task<bool> CanViewProfileAsync(Guid viewerId, Guid targetUserId)
    {
        // Can always view own profile
        if (viewerId == targetUserId)
            return true;

        var settings = await GetByUserProfileIdAsync(targetUserId);
        if (settings == null)
            return true; // Default to public if no settings

        return settings.ProfileVisibility switch
        {
            ProfileVisibility.Public => true,
            ProfileVisibility.FriendsOnly => await AreFriendsAsync(viewerId, targetUserId),
            ProfileVisibility.Private => false,
            _ => true
        };
    }

    public async Task<bool> CanViewFriendsListAsync(Guid viewerId, Guid targetUserId)
    {
        // Can always view own friends list
        if (viewerId == targetUserId)
            return true;

        var settings = await GetByUserProfileIdAsync(targetUserId);
        if (settings == null)
            return true; // Default to public if no settings

        return settings.FriendsListVisibility switch
        {
            FriendsListVisibility.Public => true,
            FriendsListVisibility.FriendsOnly => await AreFriendsAsync(viewerId, targetUserId),
            FriendsListVisibility.OnlyMe => false,
            _ => true
        };
    }

    public async Task<bool> CanSendFriendRequestAsync(Guid senderId, Guid recipientId)
    {
        var settings = await GetByUserProfileIdAsync(recipientId);
        if (settings == null)
            return true; // Default to everyone if no settings

        return settings.WhoCanSendFriendRequests switch
        {
            FriendRequestPermission.Everyone => true,
            FriendRequestPermission.FriendsOfFriends => await AreFriendsOfFriendsAsync(senderId, recipientId),
            FriendRequestPermission.NoOne => false,
            _ => true
        };
    }

    public async Task<ProfileVisibility> GetProfileVisibilityAsync(Guid userId)
    {
        var settings = await GetByUserProfileIdAsync(userId);
        return settings?.ProfileVisibility ?? ProfileVisibility.Public;
    }

    public async Task<FriendsListVisibility> GetFriendsListVisibilityAsync(Guid userId)
    {
        var settings = await GetByUserProfileIdAsync(userId);
        return settings?.FriendsListVisibility ?? FriendsListVisibility.Public;
    }

    public async Task<FriendRequestPermission> GetFriendRequestPermissionAsync(Guid userId)
    {
        var settings = await GetByUserProfileIdAsync(userId);
        return settings?.WhoCanSendFriendRequests ?? FriendRequestPermission.Everyone;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Create Default Settings
    // ═══════════════════════════════════════════════════════════════════════════

    public async Task<PrivacySettings> CreateDefaultSettingsAsync(Guid userProfileId)
    {
        var settings = new PrivacySettings
        {
            Id = Guid.NewGuid(),
            UserProfileId = userProfileId,
            ProfileVisibility = ProfileVisibility.Public,
            FriendsListVisibility = FriendsListVisibility.Public,
            WhoCanSendFriendRequests = FriendRequestPermission.Everyone,
            ShowOnlineStatus = true,
            ShowTradingStats = true,
            ShowRecentActivity = true,
            CreatedAt = DateTime.UtcNow
        };

        return await CreateAsync(settings);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Helper Methods
    // ═══════════════════════════════════════════════════════════════════════════

    private async Task<bool> AreFriendsAsync(Guid userId1, Guid userId2)
    {
        return await _context.Friendships
            .AnyAsync(f =>
                ((f.RequesterId == userId1 && f.RecipientId == userId2) ||
                 (f.RequesterId == userId2 && f.RecipientId == userId1)) &&
                f.Status == FriendshipStatus.Accepted);
    }

    private async Task<bool> AreFriendsOfFriendsAsync(Guid userId1, Guid userId2)
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

        // Check if they have mutual friends
        return user1Friends.Intersect(user2Friends).Any();
    }
}
