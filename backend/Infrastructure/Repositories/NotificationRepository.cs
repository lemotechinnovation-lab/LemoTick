using Microsoft.EntityFrameworkCore;
using InvestorManagementSystem.Application.Interfaces;
using InvestorManagementSystem.Core.Entities;
using InvestorManagementSystem.Infrastructure.Data;

namespace InvestorManagementSystem.Infrastructure.Repositories;

public class NotificationRepository : INotificationRepository
{
    private readonly ApplicationDbContext _context;

    public NotificationRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Notification>> GetAllAsync()
    {
        return await _context.Notifications
            .Include(n => n.Investor)
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync();
    }

    public async Task<Notification?> GetByIdAsync(Guid id)
    {
        return await _context.Notifications
            .Include(n => n.Investor)
            .FirstOrDefaultAsync(n => n.Id == id);
    }

    public async Task<Notification> AddAsync(Notification notification)
    {
        _context.Notifications.Add(notification);
        await _context.SaveChangesAsync();
        return notification;
    }

    public async Task<Notification?> UpdateAsync(Notification notification)
    {
        var existing = await _context.Notifications.FindAsync(notification.Id);
        if (existing == null)
            return null;

        _context.Entry(existing).CurrentValues.SetValues(notification);
        await _context.SaveChangesAsync();
        return existing;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var notification = await _context.Notifications.FindAsync(id);
        if (notification == null)
            return false;

        _context.Notifications.Remove(notification);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<Notification>> GetByInvestorIdAsync(Guid investorId)
    {
        return await _context.Notifications
            .Where(n => n.InvestorId == investorId)
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Notification>> GetUnreadByInvestorIdAsync(Guid investorId)
    {
        return await _context.Notifications
            .Where(n => n.InvestorId == investorId && !n.IsRead)
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync();
    }

    public async Task<int> MarkAsReadAsync(Guid notificationId)
    {
        var notification = await _context.Notifications.FindAsync(notificationId);
        if (notification == null)
            return 0;

        notification.IsRead = true;
        notification.ReadAt = DateTime.UtcNow;
        return await _context.SaveChangesAsync();
    }

    public async Task<int> MarkAllAsReadAsync(Guid investorId)
    {
        var unreadNotifications = await _context.Notifications
            .Where(n => n.InvestorId == investorId && !n.IsRead)
            .ToListAsync();

        foreach (var notification in unreadNotifications)
        {
            notification.IsRead = true;
            notification.ReadAt = DateTime.UtcNow;
        }

        return await _context.SaveChangesAsync();
    }
}

