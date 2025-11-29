using InvestorManagementSystem.Core.Entities;

namespace InvestorManagementSystem.Application.Interfaces;

public interface IPerformanceMetricRepository
{
    Task<IEnumerable<PerformanceMetric>> GetAllAsync();
    Task<PerformanceMetric?> GetByIdAsync(Guid id);
    Task<PerformanceMetric> AddAsync(PerformanceMetric performanceMetric);
    Task<PerformanceMetric?> UpdateAsync(PerformanceMetric performanceMetric);
    Task<bool> DeleteAsync(Guid id);
    Task<IEnumerable<PerformanceMetric>> GetByPortfolioIdAsync(Guid portfolioId);
    Task<IEnumerable<PerformanceMetric>> GetByPortfolioIdAndDateRangeAsync(Guid portfolioId, DateTime startDate, DateTime endDate);
}

