using Microsoft.EntityFrameworkCore;
using InvestorManagementSystem.Application.Interfaces;
using InvestorManagementSystem.Core.Entities;
using InvestorManagementSystem.Infrastructure.Data;

namespace InvestorManagementSystem.Infrastructure.Repositories;

public class TradeRepository : ITradeRepository
{
    private readonly ApplicationDbContext _context;

    public TradeRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Trade>> GetAllAsync()
    {
        return await _context.Trades
            .Include(t => t.Portfolio)
            .ToListAsync();
    }

    public async Task<Trade?> GetByIdAsync(Guid id)
    {
        return await _context.Trades
            .Include(t => t.Portfolio)
            .FirstOrDefaultAsync(t => t.Id == id);
    }

    public async Task<Trade> AddAsync(Trade trade)
    {
        _context.Trades.Add(trade);
        await _context.SaveChangesAsync();
        return trade;
    }

    public async Task<Trade?> UpdateAsync(Trade trade)
    {
        var existingTrade = await _context.Trades.FindAsync(trade.Id);
        if (existingTrade == null)
            return null;

        _context.Entry(existingTrade).CurrentValues.SetValues(trade);
        await _context.SaveChangesAsync();
        return existingTrade;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var trade = await _context.Trades.FindAsync(id);
        if (trade == null)
            return false;

        _context.Trades.Remove(trade);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<Trade>> GetByPortfolioIdAsync(Guid portfolioId)
    {
        return await _context.Trades
            .Include(t => t.Portfolio)
            .Where(t => t.PortfolioId == portfolioId)
            .ToListAsync();
    }
}
