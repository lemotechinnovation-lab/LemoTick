using Microsoft.EntityFrameworkCore;
using InvestorManagementSystem.Application.Interfaces;
using InvestorManagementSystem.Core.Entities;
using InvestorManagementSystem.Infrastructure.Data;

namespace InvestorManagementSystem.Infrastructure.Repositories;

public class BlockedUserRepository : IBlockedUserRepository
{
    private readonly ApplicationDbContext _context;

    public BlockedUserRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Basic CRUD Operations
    // ═══════════════════════════════════════════════════════════════════════════

    public async Task<BlockedUser?> GetByIdAsync(Guid id)
    {
        return await _context.BlockedUsers
            .Include(b => b.Blocker)
            .Include(b => b.Blocked)
            .FirstOrDefaultAsync(b => b.Id == id);
    }

    public async Task<BlockedUser> CreateAsync(BlockedUser blockedUser)
    {
        blockedUser.BlockedAt = DateTime.UtcNow;
        _context.BlockedUsers.Add(blockedUser);
        await _context.SaveChangesAsync();
        return blockedUser;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var blockedUser = await _context.BlockedUsers.FindAsync(id);
        if (blockedUser == null)
            return false;

        _context.BlockedUsers.Remove(blockedUser);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ExistsAsync(Guid id)
    {
        return await _context.BlockedUsers.AnyAsync(b => b.Id == id);
    }

    public async Task<BlockedUser?> GetBlockAsync(Guid blockerId, Guid blockedId)
    {
        return await _context.BlockedUsers
            .Include(b => b.Blocker)
            .Include(b => b.Blocked)
            .FirstOrDefaultAsync(b => b.BlockerId == blockerId && b.BlockedId == blockedId);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Blocked User Queries
    // ═══════════════════════════════════════════════════════════════════════════

    public async Task<IEnumerable<BlockedUser>> GetBlockedUsersAsync(Guid blockerId, int page = 1, int pageSize = 20)
    {
        return await _context.BlockedUsers
            .Include(b => b.Blocker)
            .Include(b => b.Blocked)
            .Where(b => b.BlockerId == blockerId)
            .OrderByDescending(b => b.BlockedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<int> GetBlockedUsersCountAsync(Guid blockerId)
    {
        return await _context.BlockedUsers
            .Where(b => b.BlockerId == blockerId)
            .CountAsync();
    }

    public async Task<IEnumerable<BlockedUser>> GetBlockedByUsersAsync(Guid blockedId)
    {
        return await _context.BlockedUsers
            .Include(b => b.Blocker)
            .Include(b => b.Blocked)
            .Where(b => b.BlockedId == blockedId)
            .ToListAsync();
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Block Management
    // ═══════════════════════════════════════════════════════════════════════════

    public async Task<BlockedUser?> BlockUserAsync(Guid blockerId, Guid blockedId, string? reason = null)
    {
        // Check if already blocked
        if (await IsBlockedAsync(blockerId, blockedId))
            return null;

        // Can't block yourself
        if (blockerId == blockedId)
            return null;

        var blockedUser = new BlockedUser
        {
            Id = Guid.NewGuid(),
            BlockerId = blockerId,
            BlockedId = blockedId,
            Reason = reason,
            BlockedAt = DateTime.UtcNow
        };

        _context.BlockedUsers.Add(blockedUser);

        // Remove any existing friendship
        var friendship = await _context.Friendships
            .FirstOrDefaultAsync(f =>
                (f.RequesterId == blockerId && f.RecipientId == blockedId) ||
                (f.RequesterId == blockedId && f.RecipientId == blockerId));

        if (friendship != null)
        {
            _context.Friendships.Remove(friendship);
        }

        await _context.SaveChangesAsync();

        return await GetByIdAsync(blockedUser.Id);
    }

    public async Task<bool> UnblockUserAsync(Guid blockerId, Guid blockedId)
    {
        var blockedUser = await GetBlockAsync(blockerId, blockedId);
        if (blockedUser == null)
            return false;

        _context.BlockedUsers.Remove(blockedUser);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> IsBlockedAsync(Guid blockerId, Guid blockedId)
    {
        return await _context.BlockedUsers
            .AnyAsync(b => b.BlockerId == blockerId && b.BlockedId == blockedId);
    }

    public async Task<bool> IsBlockedByAsync(Guid userId, Guid potentialBlockerId)
    {
        return await _context.BlockedUsers
            .AnyAsync(b => b.BlockerId == potentialBlockerId && b.BlockedId == userId);
    }

    public async Task<bool> HasBlockRelationshipAsync(Guid userId1, Guid userId2)
    {
        return await _context.BlockedUsers
            .AnyAsync(b =>
                (b.BlockerId == userId1 && b.BlockedId == userId2) ||
                (b.BlockerId == userId2 && b.BlockedId == userId1));
    }
}
