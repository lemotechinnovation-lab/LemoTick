using MediatR;
using AutoMapper;
using Microsoft.Extensions.Logging;
using InvestorManagementSystem.Application.Queries.Transactions;
using InvestorManagementSystem.Application.DTOs;
using InvestorManagementSystem.Application.Interfaces;

namespace InvestorManagementSystem.Application.Handlers.Transactions;

public class GetAllTransactionsHandler : IRequestHandler<GetAllTransactionsQuery, IEnumerable<TransactionDto>>
{
    private readonly ITransactionRepository _transactionRepository;
    private readonly IMapper _mapper;
    private readonly ILogger<GetAllTransactionsHandler> _logger;

    public GetAllTransactionsHandler(
        ITransactionRepository transactionRepository,
        IMapper mapper,
        ILogger<GetAllTransactionsHandler> logger)
    {
        _transactionRepository = transactionRepository;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<IEnumerable<TransactionDto>> Handle(GetAllTransactionsQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Getting all transactions");

        var transactions = await _transactionRepository.GetAllAsync();
        return _mapper.Map<IEnumerable<TransactionDto>>(transactions);
    }
}

