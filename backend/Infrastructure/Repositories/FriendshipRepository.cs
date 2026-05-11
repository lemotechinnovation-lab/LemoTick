using Microsoft.EntityFrameworkCore;
using InvestorManagementSystem.Application.Interfaces;
using InvestorManagementSystem.Core.Entities;
using InvestorManagementSystem.Infrastructure.Data;

namespace InvestorManagementSystem.Infrastructure.Repositories;

public class FriendshipRepository : IFriendshipRepository
{
    private readonly ApplicationDbContext _context;

    public FriendshipRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Basic CRUD Operations
    // ═══════════════════════════════════════════════════════════════════════════

    public async Task<Friendship?> GetByIdAsync(Guid id)
    {
        return await _context.Friendships
            .Include(f => f.Requester)
            .Include(f => f.Recipient)
            .FirstOrDefaultAsync(f => f.Id == id);
    }

    public async Task<Friendship> CreateAsync(Friendship friendship)
    {
        friendship.CreatedAt = DateTime.UtcNow;
        _context.Friendships.Add(friendship);
        await _context.SaveChangesAsync();
        return friendship;
    }

    public async Task<Friendship?> UpdateAsync(Friendship friendship)
    {
        var existing = await _context.Friendships.FindAsync(friendship.Id);
        if (existing == null)
            return null;

        friendship.UpdatedAt = DateTime.UtcNow;
        _context.Entry(existing).CurrentValues.SetValues(friendship);
        await _context.SaveChangesAsync();
        return existing;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var friendship = await _context.Friendships.FindAsync(id);
        if (friendship == null)
            return false;

        _context.Friendships.Remove(friendship);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ExistsAsync(Guid id)
    {
        return await _context.Friendships.AnyAsync(f => f.Id == id);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Friend Request Queries
    // ═══════════════════════════════════════════════════════════════════════════

    public async Task<IEnumerable<Friendship>> GetReceivedRequestsAsync(Guid userId, int page = 1, int pageSize = 20)
    {
        return await _context.Friendships
            .Include(f => f.Requester)
            .Include(f => f.Recipient)
            .Where(f => f.RecipientId == userId && f.Status == FriendshipStatus.Pending)
            .OrderByDescending(f => f.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<IEnumerable<Friendship>> GetSentRequestsAsync(Guid userId, int page = 1, int pageSize = 20)
    {
        return await _context.Friendships
            .Include(f => f.Requester)
            .Include(f => f.Recipient)
            .Where(f => f.RequesterId == userId && f.Status == FriendshipStatus.Pending)
            .OrderByDescending(f => f.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<int> GetReceivedRequestsCountAsync(Guid userId)
    {
        return await _context.Friendships
            .Where(f => f.RecipientId == userId)
            .CountAsync();
    }

    public async Task<int> GetSentRequestsCountAsync(Guid userId)
    {
        return await _context.Friendships
            .Where(f => f.RequesterId == userId)
            .CountAsync();
    }

    public async Task<int> GetPendingReceivedRequestsCountAsync(Guid userId)
    {
        return await _context.Friendships
            .Where(f => f.RecipientId == userId && f.Status == FriendshipStatus.Pending)
            .CountAsync();
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Friend Queries
    // ═══════════════════════════════════════════════════════════════════════════

    public async Task<IEnumerable<Friendship>> GetFriendshipsAsync(Guid userId, int page = 1, int pageSize = 20)
    {
        return await _context.Friendships
            .Include(f => f.Requester)
            .Include(f => f.Recipient)
            .Where(f => (f.RequesterId == userId || f.RecipientId == userId) &&
                       f.Status == FriendshipStatus.Accepted)
            .OrderByDescending(f => f.AcceptedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<IEnumerable<UserProfile>> GetFriendsAsync(Guid userId, int page = 1, int pageSize = 20)
    {
        var friendships = await _context.Friendships
            .Include(f => f.Requester)
            .Include(f => f.Recipient)
            .Where(f => (f.RequesterId == userId || f.RecipientId == userId) &&
                       f.Status == FriendshipStatus.Accepted)
            .OrderByDescending(f => f.AcceptedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return friendships.Select(f => f.RequesterId == userId ? f.Recipient : f.Requester);
    }

    public async Task<int> GetFriendsCountAsync(Guid userId)
    {
        return await _context.Friendships
            .Where(f => (f.RequesterId == userId || f.RecipientId == userId) &&
                       f.Status == FriendshipStatus.Accepted)
            .CountAsync();
    }

    public async Task<IEnumerable<UserProfile>> GetOnlineFriendsAsync(Guid userId)
    {
        var friendships = await _context.Friendships
            .Include(f => f.Requester)
            .Include(f => f.Recipient)
            .Where(f => (f.RequesterId == userId || f.RecipientId == userId) &&
                       f.Status == FriendshipStatus.Accepted)
            .ToListAsync();

        var friends = friendships.Select(f => f.RequesterId == userId ? f.Recipient : f.Requester);
        return friends.Where(f => f.OnlineStatus == OnlineStatus.Online);
    }

    public async Task<int> GetOnlineFriendsCountAsync(Guid userId)
    {
        var onlineFriends = await GetOnlineFriendsAsync(userId);
        return onlineFriends.Count();
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Mutual Friends
    // ═══════════════════════════════════════════════════════════════════════════

    public async Task<IEnumerable<UserProfile>> GetMutualFriendsAsync(Guid userId1, Guid userId2, int page = 1, int pageSize = 20)
    {
        // Get user1's friend IDs
        var user1FriendIds = await _context.Friendships
            .Where(f => (f.RequesterId == userId1 || f.RecipientId == userId1) &&
                       f.Status == FriendshipStatus.Accepted)
            .Select(f => f.RequesterId == userId1 ? f.RecipientId : f.RequesterId)
            .ToListAsync();

        // Get user2's friend IDs
        var user2FriendIds = await _context.Friendships
            .Where(f => (f.RequesterId == userId2 || f.RecipientId == userId2) &&
                       f.Status == FriendshipStatus.Accepted)
            .Select(f => f.RequesterId == userId2 ? f.RecipientId : f.RequesterId)
            .ToListAsync();

        // Find mutual friend IDs
        var mutualFriendIds = user1FriendIds.Intersect(user2FriendIds).ToList();

        // Get mutual friend profiles
        return await _context.UserProfiles
            .Where(u => mutualFriendIds.Contains(u.Id))
            .OrderBy(u => u.DisplayName)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<int> GetMutualFriendsCountAsync(Guid userId1, Guid userId2)
    {
        var user1FriendIds = await _context.Friendships
            .Where(f => (f.RequesterId == userId1 || f.RecipientId == userId1) &&
                       f.Status == FriendshipStatus.Accepted)
            .Select(f => f.RequesterId == userId1 ? f.RecipientId : f.RequesterId)
            .ToListAsync();

        var user2FriendIds = await _context.Friendships
            .Where(f => (f.RequesterId == userId2 || f.RecipientId == userId2) &&
                       f.Status == FriendshipStatus.Accepted)
            .Select(f => f.RequesterId == userId2 ? f.RecipientId : f.RequesterId)
            .ToListAsync();

        return user1FriendIds.Intersect(user2FriendIds).Count();
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Relationship Status
    // ═══════════════════════════════════════════════════════════════════════════

    public async Task<Friendship?> GetFriendshipBetweenUsersAsync(Guid userId1, Guid userId2)
    {
        return await _context.Friendships
            .Include(f => f.Requester)
            .Include(f => f.Recipient)
            .FirstOrDefaultAsync(f =>
                (f.RequesterId == userId1 && f.RecipientId == userId2) ||
                (f.RequesterId == userId2 && f.RecipientId == userId1));
    }

    public async Task<string> GetRelationshipStatusAsync(Guid currentUserId, Guid targetUserId)
    {
        // Check if blocked
        var isBlocked = await _context.BlockedUsers
            .AnyAsync(b => (b.BlockerId == currentUserId && b.BlockedId == targetUserId) ||
                          (b.BlockerId == targetUserId && b.BlockedId == currentUserId));

        if (isBlocked)
            return "blocked";

        // Check friendship status
        var friendship = await GetFriendshipBetweenUsersAsync(currentUserId, targetUserId);

        if (friendship == null)
            return "none";

        return friendship.Status switch
        {
            FriendshipStatus.Accepted => "friends",
            FriendshipStatus.Pending when friendship.RequesterId == currentUserId => "pending_sent",
            FriendshipStatus.Pending when friendship.RecipientId == currentUserId => "pending_received",
            _ => "none"
        };
    }

    public async Task<bool> AreFriendsAsync(Guid userId1, Guid userId2)
    {
        return await _context.Friendships
            .AnyAsync(f =>
                ((f.RequesterId == userId1 && f.RecipientId == userId2) ||
                 (f.RequesterId == userId2 && f.RecipientId == userId1)) &&
                f.Status == FriendshipStatus.Accepted);
    }

    public async Task<bool> HasPendingRequestAsync(Guid requesterId, Guid recipientId)
    {
        return await _context.Friendships
            .AnyAsync(f => f.RequesterId == requesterId &&
                          f.RecipientId == recipientId &&
                          f.Status == FriendshipStatus.Pending);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Friend Request Actions
    // ═══════════════════════════════════════════════════════════════════════════

    public async Task<Friendship?> SendFriendRequestAsync(Guid requesterId, Guid recipientId, string? message = null)
    {
        // Check if can send request
        if (!await CanSendFriendRequestAsync(requesterId, recipientId))
            return null;

        var friendship = new Friendship
        {
            Id = Guid.NewGuid(),
            RequesterId = requesterId,
            RecipientId = recipientId,
            Message = message,
            Status = FriendshipStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };

        _context.Friendships.Add(friendship);
        await _context.SaveChangesAsync();

        return await GetByIdAsync(friendship.Id);
    }

    public async Task<bool> AcceptFriendRequestAsync(Guid requestId)
    {
        var friendship = await _context.Friendships.FindAsync(requestId);
        if (friendship == null || friendship.Status != FriendshipStatus.Pending)
            return false;

        friendship.Status = FriendshipStatus.Accepted;
        friendship.AcceptedAt = DateTime.UtcNow;
        friendship.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeclineFriendRequestAsync(Guid requestId)
    {
        var friendship = await _context.Friendships.FindAsync(requestId);
        if (friendship == null || friendship.Status != FriendshipStatus.Pending)
            return false;

        friendship.Status = FriendshipStatus.Declined;
        friendship.DeclinedAt = DateTime.UtcNow;
        friendship.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> CancelFriendRequestAsync(Guid requestId)
    {
        var friendship = await _context.Friendships.FindAsync(requestId);
        if (friendship == null || friendship.Status != FriendshipStatus.Pending)
            return false;

        friendship.Status = FriendshipStatus.Cancelled;
        friendship.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> UnfriendAsync(Guid userId1, Guid userId2)
    {
        var friendship = await GetFriendshipBetweenUsersAsync(userId1, userId2);
        if (friendship == null || friendship.Status != FriendshipStatus.Accepted)
            return false;

        _context.Friendships.Remove(friendship);
        await _context.SaveChangesAsync();
        return true;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Validation
    // ═══════════════════════════════════════════════════════════════════════════

    public async Task<bool> CanSendFriendRequestAsync(Guid requesterId, Guid recipientId)
    {
        // Can't send request to yourself
        if (requesterId == recipientId)
            return false;

        // Check if blocked
        var isBlocked = await _context.BlockedUsers
            .AnyAsync(b => (b.BlockerId == requesterId && b.BlockedId == recipientId) ||
                          (b.BlockerId == recipientId && b.BlockedId == requesterId));

        if (isBlocked)
            return false;

        // Check if already friends or has pending request
        var existingFriendship = await GetFriendshipBetweenUsersAsync(requesterId, recipientId);
        if (existingFriendship != null &&
            (existingFriendship.Status == FriendshipStatus.Accepted ||
             existingFriendship.Status == FriendshipStatus.Pending))
            return false;

        return true;
    }

    public async Task<bool> CanAcceptFriendRequestAsync(Guid requestId, Guid userId)
    {
        var friendship = await _context.Friendships.FindAsync(requestId);
        if (friendship == null)
            return false;

        // Only recipient can accept
        if (friendship.RecipientId != userId)
            return false;

        // Must be pending
        if (friendship.Status != FriendshipStatus.Pending)
            return false;

        return true;
    }
}
