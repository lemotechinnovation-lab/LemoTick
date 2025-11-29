using MediatR;
using InvestorManagementSystem.Application.DTOs;

namespace InvestorManagementSystem.Application.Queries.Transactions;

public record GetTransactionByIdQuery(Guid Id) : IRequest<TransactionDto?>;

