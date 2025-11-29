using Microsoft.EntityFrameworkCore;
using InvestorManagementSystem.Application.Interfaces;
using InvestorManagementSystem.Core.Entities;
using InvestorManagementSystem.Infrastructure.Data;

namespace InvestorManagementSystem.Infrastructure.Repositories;

public class PerformanceMetricRepository : IPerformanceMetricRepository
{
    private readonly ApplicationDbContext _context;

    public PerformanceMetricRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<PerformanceMetric>> GetAllAsync()
    {
        return await _context.PerformanceMetrics
            .Include(pm => pm.Portfolio)
            .OrderByDescending(pm => pm.Date)
            .ToListAsync();
    }

    public async Task<PerformanceMetric?> GetByIdAsync(Guid id)
    {
        return await _context.PerformanceMetrics
            .Include(pm => pm.Portfolio)
            .FirstOrDefaultAsync(pm => pm.Id == id);
    }

    public async Task<PerformanceMetric> AddAsync(PerformanceMetric performanceMetric)
    {
        _context.PerformanceMetrics.Add(performanceMetric);
        await _context.SaveChangesAsync();
        return performanceMetric;
    }

    public async Task<PerformanceMetric?> UpdateAsync(PerformanceMetric performanceMetric)
    {
        var existing = await _context.PerformanceMetrics.FindAsync(performanceMetric.Id);
        if (existing == null)
            return null;

        _context.Entry(existing).CurrentValues.SetValues(performanceMetric);
        await _context.SaveChangesAsync();
        return existing;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var performanceMetric = await _context.PerformanceMetrics.FindAsync(id);
        if (performanceMetric == null)
            return false;

        _context.PerformanceMetrics.Remove(performanceMetric);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<PerformanceMetric>> GetByPortfolioIdAsync(Guid portfolioId)
    {
        return await _context.PerformanceMetrics
            .Where(pm => pm.PortfolioId == portfolioId)
            .OrderByDescending(pm => pm.Date)
            .ToListAsync();
    }

    public async Task<IEnumerable<PerformanceMetric>> GetByPortfolioIdAndDateRangeAsync(Guid portfolioId, DateTime startDate, DateTime endDate)
    {
        return await _context.PerformanceMetrics
            .Where(pm => pm.PortfolioId == portfolioId && pm.Date >= startDate && pm.Date <= endDate)
            .OrderBy(pm => pm.Date)
            .ToListAsync();
    }
}

