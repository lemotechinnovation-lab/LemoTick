using MediatR;
using AutoMapper;
using Microsoft.Extensions.Logging;
using InvestorManagementSystem.Application.Commands.Transactions;
using InvestorManagementSystem.Application.DTOs;
using InvestorManagementSystem.Application.Interfaces;
using InvestorManagementSystem.Core.Entities;

namespace InvestorManagementSystem.Application.Handlers.Transactions;

public class UpdateTransactionHandler : IRequestHandler<UpdateTransactionCommand, TransactionDto?>
{
    private readonly ITransactionRepository _transactionRepository;
    private readonly IMapper _mapper;
    private readonly ILogger<UpdateTransactionHandler> _logger;

    public UpdateTransactionHandler(
        ITransactionRepository transactionRepository,
        IMapper mapper,
        ILogger<UpdateTransactionHandler> logger)
    {
        _transactionRepository = transactionRepository;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<TransactionDto?> Handle(UpdateTransactionCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Updating transaction: {TransactionId}", request.Id);

        var existingTransaction = await _transactionRepository.GetByIdAsync(request.Id);
        if (existingTransaction == null)
        {
            _logger.LogWarning("Transaction not found: {TransactionId}", request.Id);
            return null;
        }

        existingTransaction.Status = request.UpdateTransactionDto.Status;
        existingTransaction.Description = request.UpdateTransactionDto.Description;

        if (request.UpdateTransactionDto.Status == TransactionStatus.Completed)
        {
            existingTransaction.ProcessedAt = DateTime.UtcNow;
        }
        else if (request.UpdateTransactionDto.Status == TransactionStatus.Failed)
        {
            existingTransaction.FailedAt = DateTime.UtcNow;
            existingTransaction.FailureReason = request.UpdateTransactionDto.FailureReason;
        }

        var updatedTransaction = await _transactionRepository.UpdateAsync(existingTransaction);

        _logger.LogInformation("Transaction updated: {TransactionId}", request.Id);

        return updatedTransaction != null ? _mapper.Map<TransactionDto>(updatedTransaction) : null;
    }
}

