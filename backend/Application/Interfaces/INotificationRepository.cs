using InvestorManagementSystem.Core.Entities;

namespace InvestorManagementSystem.Application.Interfaces;

public interface INotificationRepository
{
    Task<IEnumerable<Notification>> GetAllAsync();
    Task<Notification?> GetByIdAsync(Guid id);
    Task<Notification> AddAsync(Notification notification);
    Task<Notification?> UpdateAsync(Notification notification);
    Task<bool> DeleteAsync(Guid id);
    Task<IEnumerable<Notification>> GetByInvestorIdAsync(Guid investorId);
    Task<IEnumerable<Notification>> GetUnreadByInvestorIdAsync(Guid investorId);
    Task<int> MarkAsReadAsync(Guid notificationId);
    Task<int> MarkAllAsReadAsync(Guid investorId);
}

