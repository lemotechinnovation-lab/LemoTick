using InvestorManagementSystem.Core.Entities;

namespace InvestorManagementSystem.Application.Interfaces;

public interface IInvestorRepository
{
    Task<IEnumerable<Investor>> GetAllAsync();
    Task<Investor?> GetByIdAsync(Guid id);
    Task<Investor> AddAsync(Investor investor);
    Task<Investor?> UpdateAsync(Investor investor);
    Task<bool> DeleteAsync(Guid id);
    Task<IEnumerable<Portfolio>> GetInvestorPortfoliosAsync(Guid investorId);
    Task<Investor?> GetByEmailAsync(string email);
}
