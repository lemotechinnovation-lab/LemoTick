using MediatR;
using AutoMapper;
using Microsoft.Extensions.Logging;
using InvestorManagementSystem.Application.Queries.Transactions;
using InvestorManagementSystem.Application.DTOs;
using InvestorManagementSystem.Application.Interfaces;

namespace InvestorManagementSystem.Application.Handlers.Transactions;

public class GetTransactionsByInvestorHandler : IRequestHandler<GetTransactionsByInvestorQuery, IEnumerable<TransactionDto>>
{
    private readonly ITransactionRepository _transactionRepository;
    private readonly IMapper _mapper;
    private readonly ILogger<GetTransactionsByInvestorHandler> _logger;

    public GetTransactionsByInvestorHandler(
        ITransactionRepository transactionRepository,
        IMapper mapper,
        ILogger<GetTransactionsByInvestorHandler> logger)
    {
        _transactionRepository = transactionRepository;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<IEnumerable<TransactionDto>> Handle(GetTransactionsByInvestorQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Getting transactions for investor: {InvestorId}", request.InvestorId);

        var transactions = await _transactionRepository.GetByInvestorIdAsync(request.InvestorId);
        return _mapper.Map<IEnumerable<TransactionDto>>(transactions);
    }
}

