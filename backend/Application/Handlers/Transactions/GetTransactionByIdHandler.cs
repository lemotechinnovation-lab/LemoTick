using MediatR;
using AutoMapper;
using Microsoft.Extensions.Logging;
using InvestorManagementSystem.Application.Queries.Transactions;
using InvestorManagementSystem.Application.DTOs;
using InvestorManagementSystem.Application.Interfaces;

namespace InvestorManagementSystem.Application.Handlers.Transactions;

public class GetTransactionByIdHandler : IRequestHandler<GetTransactionByIdQuery, TransactionDto?>
{
    private readonly ITransactionRepository _transactionRepository;
    private readonly IMapper _mapper;
    private readonly ILogger<GetTransactionByIdHandler> _logger;

    public GetTransactionByIdHandler(
        ITransactionRepository transactionRepository,
        IMapper mapper,
        ILogger<GetTransactionByIdHandler> logger)
    {
        _transactionRepository = transactionRepository;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<TransactionDto?> Handle(GetTransactionByIdQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Getting transaction by ID: {TransactionId}", request.Id);

        var transaction = await _transactionRepository.GetByIdAsync(request.Id);
        return transaction != null ? _mapper.Map<TransactionDto>(transaction) : null;
    }
}

