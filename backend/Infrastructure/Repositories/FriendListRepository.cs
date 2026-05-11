using Microsoft.EntityFrameworkCore;
using InvestorManagementSystem.Application.Interfaces;
using InvestorManagementSystem.Core.Entities;
using InvestorManagementSystem.Infrastructure.Data;

namespace InvestorManagementSystem.Infrastructure.Repositories;

public class FriendListRepository : IFriendListRepository
{
    private readonly ApplicationDbContext _context;

    public FriendListRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Basic CRUD Operations
    // ═══════════════════════════════════════════════════════════════════════════

    public async Task<FriendList?> GetByIdAsync(Guid id)
    {
        return await _context.FriendLists
            .Include(fl => fl.Owner)
            .Include(fl => fl.Members)
            .FirstOrDefaultAsync(fl => fl.Id == id);
    }

    public async Task<FriendList> CreateAsync(FriendList friendList)
    {
        friendList.CreatedAt = DateTime.UtcNow;
        _context.FriendLists.Add(friendList);
        await _context.SaveChangesAsync();
        return friendList;
    }

    public async Task<FriendList?> UpdateAsync(FriendList friendList)
    {
        var existing = await _context.FriendLists.FindAsync(friendList.Id);
        if (existing == null)
            return null;

        friendList.UpdatedAt = DateTime.UtcNow;
        _context.Entry(existing).CurrentValues.SetValues(friendList);
        await _context.SaveChangesAsync();
        return existing;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var friendList = await _context.FriendLists.FindAsync(id);
        if (friendList == null)
            return false;

        _context.FriendLists.Remove(friendList);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ExistsAsync(Guid id)
    {
        return await _context.FriendLists.AnyAsync(fl => fl.Id == id);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Friend List Queries
    // ═══════════════════════════════════════════════════════════════════════════

    public async Task<IEnumerable<FriendList>> GetUserListsAsync(Guid ownerId, int page = 1, int pageSize = 20)
    {
        return await _context.FriendLists
            .Include(fl => fl.Owner)
            .Include(fl => fl.Members)
            .Where(fl => fl.OwnerId == ownerId)
            .OrderBy(fl => fl.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<int> GetUserListsCountAsync(Guid ownerId)
    {
        return await _context.FriendLists
            .Where(fl => fl.OwnerId == ownerId)
            .CountAsync();
    }

    public async Task<FriendList?> GetWithMembersAsync(Guid id)
    {
        return await _context.FriendLists
            .Include(fl => fl.Owner)
            .Include(fl => fl.Members)
                .ThenInclude(m => m.Friend)
            .FirstOrDefaultAsync(fl => fl.Id == id);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Member Management
    // ═══════════════════════════════════════════════════════════════════════════

    public async Task<bool> AddMemberAsync(Guid friendListId, Guid friendId)
    {
        // Check if list exists
        if (!await ExistsAsync(friendListId))
            return false;

        // Check if already a member
        if (await IsMemberAsync(friendListId, friendId))
            return false;

        // Check if can add member (must be friends)
        if (!await CanAddMemberAsync(friendListId, friendId))
            return false;

        var member = new FriendListMember
        {
            Id = Guid.NewGuid(),
            FriendListId = friendListId,
            FriendId = friendId,
            AddedAt = DateTime.UtcNow
        };

        _context.FriendListMembers.Add(member);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> RemoveMemberAsync(Guid friendListId, Guid friendId)
    {
        var member = await _context.FriendListMembers
            .FirstOrDefaultAsync(m => m.FriendListId == friendListId && m.FriendId == friendId);

        if (member == null)
            return false;

        _context.FriendListMembers.Remove(member);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> IsMemberAsync(Guid friendListId, Guid friendId)
    {
        return await _context.FriendListMembers
            .AnyAsync(m => m.FriendListId == friendListId && m.FriendId == friendId);
    }

    public async Task<IEnumerable<UserProfile>> GetMembersAsync(Guid friendListId, int page = 1, int pageSize = 20)
    {
        var members = await _context.FriendListMembers
            .Include(m => m.Friend)
            .Where(m => m.FriendListId == friendListId)
            .OrderBy(m => m.AddedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return members.Select(m => m.Friend);
    }

    public async Task<int> GetMemberCountAsync(Guid friendListId)
    {
        return await _context.FriendListMembers
            .Where(m => m.FriendListId == friendListId)
            .CountAsync();
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // List Membership Queries
    // ═══════════════════════════════════════════════════════════════════════════

    public async Task<IEnumerable<FriendList>> GetListsContainingFriendAsync(Guid ownerId, Guid friendId)
    {
        return await _context.FriendLists
            .Include(fl => fl.Owner)
            .Include(fl => fl.Members)
            .Where(fl => fl.OwnerId == ownerId &&
                        fl.Members.Any(m => m.FriendId == friendId))
            .ToListAsync();
    }

    public async Task<bool> CanAddMemberAsync(Guid friendListId, Guid friendId)
    {
        var friendList = await _context.FriendLists.FindAsync(friendListId);
        if (friendList == null)
            return false;

        // Check if they are friends
        var areFriends = await _context.Friendships
            .AnyAsync(f =>
                ((f.RequesterId == friendList.OwnerId && f.RecipientId == friendId) ||
                 (f.RequesterId == friendId && f.RecipientId == friendList.OwnerId)) &&
                f.Status == FriendshipStatus.Accepted);

        return areFriends;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Validation
    // ═══════════════════════════════════════════════════════════════════════════

    public async Task<bool> IsOwnerAsync(Guid friendListId, Guid userId)
    {
        var friendList = await _context.FriendLists.FindAsync(friendListId);
        return friendList != null && friendList.OwnerId == userId;
    }
}
