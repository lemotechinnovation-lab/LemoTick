using MediatR;
using InvestorManagementSystem.Application.DTOs;

namespace InvestorManagementSystem.Application.Queries.Transactions;

public record GetAllTransactionsQuery() : IRequest<IEnumerable<TransactionDto>>;

