using MediatR;
using InvestorManagementSystem.Application.DTOs;

namespace InvestorManagementSystem.Application.Queries.Transactions;

public record GetTransactionsByPortfolioQuery(Guid PortfolioId) : IRequest<IEnumerable<TransactionDto>>;

