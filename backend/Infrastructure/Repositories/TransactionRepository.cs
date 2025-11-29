using Microsoft.EntityFrameworkCore;
using InvestorManagementSystem.Application.Interfaces;
using InvestorManagementSystem.Core.Entities;
using InvestorManagementSystem.Infrastructure.Data;

namespace InvestorManagementSystem.Infrastructure.Repositories;

public class TransactionRepository : ITransactionRepository
{
    private readonly ApplicationDbContext _context;

    public TransactionRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Transaction>> GetAllAsync()
    {
        return await _context.Transactions
            .Include(t => t.Investor)
            .Include(t => t.Portfolio)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();
    }

    public async Task<Transaction?> GetByIdAsync(Guid id)
    {
        return await _context.Transactions
            .Include(t => t.Investor)
            .Include(t => t.Portfolio)
            .FirstOrDefaultAsync(t => t.Id == id);
    }

    public async Task<Transaction> AddAsync(Transaction transaction)
    {
        _context.Transactions.Add(transaction);
        await _context.SaveChangesAsync();
        return transaction;
    }

    public async Task<Transaction?> UpdateAsync(Transaction transaction)
    {
        var existing = await _context.Transactions.FindAsync(transaction.Id);
        if (existing == null)
            return null;

        _context.Entry(existing).CurrentValues.SetValues(transaction);
        await _context.SaveChangesAsync();
        return existing;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var transaction = await _context.Transactions.FindAsync(id);
        if (transaction == null)
            return false;

        _context.Transactions.Remove(transaction);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<Transaction>> GetByInvestorIdAsync(Guid investorId)
    {
        return await _context.Transactions
            .Include(t => t.Portfolio)
            .Where(t => t.InvestorId == investorId)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Transaction>> GetByPortfolioIdAsync(Guid portfolioId)
    {
        return await _context.Transactions
            .Include(t => t.Investor)
            .Where(t => t.PortfolioId == portfolioId)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();
    }
}

