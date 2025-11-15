using Microsoft.EntityFrameworkCore;
using InvestorManagementSystem.Application.Interfaces;
using InvestorManagementSystem.Core.Entities;
using InvestorManagementSystem.Infrastructure.Data;

namespace InvestorManagementSystem.Infrastructure.Repositories;

public class InvestorRepository : IInvestorRepository
{
    private readonly ApplicationDbContext _context;

    public InvestorRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Investor>> GetAllAsync()
    {
        return await _context.Investors
            .Include(i => i.Portfolios)
            .Include(i => i.Transactions)
            .Include(i => i.Notifications)
            .ToListAsync();
    }

    public async Task<Investor?> GetByIdAsync(Guid id)
    {
        return await _context.Investors
            .Include(i => i.Portfolios)
            .Include(i => i.Transactions)
            .Include(i => i.Notifications)
            .FirstOrDefaultAsync(i => i.Id == id);
    }

    public async Task<Investor> AddAsync(Investor investor)
    {
        _context.Investors.Add(investor);
        await _context.SaveChangesAsync();
        return investor;
    }

    public async Task<Investor?> UpdateAsync(Investor investor)
    {
        var existingInvestor = await _context.Investors.FindAsync(investor.Id);
        if (existingInvestor == null)
            return null;

        _context.Entry(existingInvestor).CurrentValues.SetValues(investor);
        await _context.SaveChangesAsync();
        return existingInvestor;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var investor = await _context.Investors.FindAsync(id);
        if (investor == null)
            return false;

        _context.Investors.Remove(investor);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<Portfolio>> GetInvestorPortfoliosAsync(Guid investorId)
    {
        return await _context.Portfolios
            .Include(p => p.Trades)
            .Include(p => p.PerformanceMetrics)
            .Where(p => p.InvestorId == investorId)
            .ToListAsync();
    }

    public async Task<Investor?> GetByEmailAsync(string email)
    {
        return await _context.Investors
            .FirstOrDefaultAsync(i => i.Email == email);
    }
}
