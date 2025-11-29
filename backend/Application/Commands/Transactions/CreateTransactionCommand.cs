using MediatR;
using InvestorManagementSystem.Application.DTOs;

namespace InvestorManagementSystem.Application.Commands.Transactions;

public record CreateTransactionCommand(CreateTransactionDto CreateTransactionDto) : IRequest<TransactionDto>;

