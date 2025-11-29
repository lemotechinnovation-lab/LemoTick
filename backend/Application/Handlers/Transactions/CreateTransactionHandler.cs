using MediatR;
using AutoMapper;
using Microsoft.Extensions.Logging;
using InvestorManagementSystem.Application.Commands.Transactions;
using InvestorManagementSystem.Application.DTOs;
using InvestorManagementSystem.Application.Interfaces;
using InvestorManagementSystem.Core.Entities;

namespace InvestorManagementSystem.Application.Handlers.Transactions;

public class CreateTransactionHandler : IRequestHandler<CreateTransactionCommand, TransactionDto>
{
    private readonly ITransactionRepository _transactionRepository;
    private readonly IInvestorRepository _investorRepository;
    private readonly IMapper _mapper;
    private readonly ILogger<CreateTransactionHandler> _logger;

    public CreateTransactionHandler(
        ITransactionRepository transactionRepository,
        IInvestorRepository investorRepository,
        IMapper mapper,
        ILogger<CreateTransactionHandler> logger)
    {
        _transactionRepository = transactionRepository;
        _investorRepository = investorRepository;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<TransactionDto> Handle(CreateTransactionCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Creating transaction for investor: {InvestorId}", request.CreateTransactionDto.InvestorId);

        // Get investor's current transactions to calculate balance
        var investorTransactions = await _transactionRepository.GetByInvestorIdAsync(request.CreateTransactionDto.InvestorId);
        var currentBalance = investorTransactions.LastOrDefault()?.Balance ?? 0;

        var transaction = _mapper.Map<Transaction>(request.CreateTransactionDto);
        transaction.Id = Guid.NewGuid();
        transaction.Status = TransactionStatus.Pending;
        transaction.CreatedAt = DateTime.UtcNow;

        // Calculate new balance based on transaction type
        switch (request.CreateTransactionDto.Type)
        {
            case TransactionType.Deposit:
            case TransactionType.ProfitDistribution:
            case TransactionType.Refund:
            case TransactionType.Bonus:
                transaction.Balance = currentBalance + request.CreateTransactionDto.Amount;
                break;
            case TransactionType.Withdrawal:
            case TransactionType.Loss:
            case TransactionType.Fee:
            case TransactionType.Penalty:
                transaction.Balance = currentBalance - request.CreateTransactionDto.Amount;
                break;
            default:
                transaction.Balance = currentBalance;
                break;
        }

        var createdTransaction = await _transactionRepository.AddAsync(transaction);

        _logger.LogInformation("Transaction created with ID: {TransactionId}", createdTransaction.Id);

        return _mapper.Map<TransactionDto>(createdTransaction);
    }
}

