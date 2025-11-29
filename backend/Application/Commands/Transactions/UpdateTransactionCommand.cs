using MediatR;
using InvestorManagementSystem.Application.DTOs;

namespace InvestorManagementSystem.Application.Commands.Transactions;

public record UpdateTransactionCommand(Guid Id, UpdateTransactionDto UpdateTransactionDto) : IRequest<TransactionDto?>;

