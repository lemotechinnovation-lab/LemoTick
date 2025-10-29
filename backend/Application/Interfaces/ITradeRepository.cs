using InvestorManagementSystem.Core.Entities;

namespace InvestorManagementSystem.Application.Interfaces;

public interface ITradeRepository
{
    Task<IEnumerable<Trade>> GetAllAsync();
    Task<Trade?> GetByIdAsync(Guid id);
    Task<Trade> AddAsync(Trade trade);
    Task<Trade?> UpdateAsync(Trade trade);
    Task<bool> DeleteAsync(Guid id);
    Task<IEnumerable<Trade>> GetByPortfolioIdAsync(Guid portfolioId);
}
