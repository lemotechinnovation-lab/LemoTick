using InvestorManagementSystem.Core.Entities;

namespace InvestorManagementSystem.Application.Interfaces;

public interface ITransactionRepository
{
    Task<IEnumerable<Transaction>> GetAllAsync();
    Task<Transaction?> GetByIdAsync(Guid id);
    Task<Transaction> AddAsync(Transaction transaction);
    Task<Transaction?> UpdateAsync(Transaction transaction);
    Task<bool> DeleteAsync(Guid id);
    Task<IEnumerable<Transaction>> GetByInvestorIdAsync(Guid investorId);
    Task<IEnumerable<Transaction>> GetByPortfolioIdAsync(Guid portfolioId);
}

