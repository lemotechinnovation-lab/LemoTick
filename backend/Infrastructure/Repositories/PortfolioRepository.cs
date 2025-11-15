using Microsoft.EntityFrameworkCore;
using InvestorManagementSystem.Application.Interfaces;
using InvestorManagementSystem.Core.Entities;
using InvestorManagementSystem.Infrastructure.Data;

namespace InvestorManagementSystem.Infrastructure.Repositories;

public class PortfolioRepository : IPortfolioRepository
{
    private readonly ApplicationDbContext _context;

    public PortfolioRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Portfolio>> GetAllAsync()
    {
        return await _context.Portfolios
            .Include(p => p.Investor)
            .Include(p => p.Trades)
            .Include(p => p.PerformanceMetrics)
            .ToListAsync();
    }

    public async Task<Portfolio?> GetByIdAsync(Guid id)
    {
        return await _context.Portfolios
            .Include(p => p.Investor)
            .Include(p => p.Trades)
            .Include(p => p.PerformanceMetrics)
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<Portfolio> AddAsync(Portfolio portfolio)
    {
        _context.Portfolios.Add(portfolio);
        await _context.SaveChangesAsync();
        return portfolio;
    }

    public async Task<Portfolio?> UpdateAsync(Portfolio portfolio)
    {
        var existingPortfolio = await _context.Portfolios.FindAsync(portfolio.Id);
        if (existingPortfolio == null)
            return null;

        _context.Entry(existingPortfolio).CurrentValues.SetValues(portfolio);
        await _context.SaveChangesAsync();
        return existingPortfolio;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var portfolio = await _context.Portfolios.FindAsync(id);
        if (portfolio == null)
            return false;

        _context.Portfolios.Remove(portfolio);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<Portfolio>> GetByInvestorIdAsync(Guid investorId)
    {
        return await _context.Portfolios
            .Include(p => p.Trades)
            .Include(p => p.PerformanceMetrics)
            .Where(p => p.InvestorId == investorId)
            .ToListAsync();
    }
}
