using InvestorManagementSystem.Core.Entities;

namespace InvestorManagementSystem.Application.Interfaces;

public interface IPortfolioRepository
{
    Task<IEnumerable<Portfolio>> GetAllAsync();
    Task<Portfolio?> GetByIdAsync(Guid id);
    Task<Portfolio> AddAsync(Portfolio portfolio);
    Task<Portfolio?> UpdateAsync(Portfolio portfolio);
    Task<bool> DeleteAsync(Guid id);
    Task<IEnumerable<Portfolio>> GetByInvestorIdAsync(Guid investorId);
}
