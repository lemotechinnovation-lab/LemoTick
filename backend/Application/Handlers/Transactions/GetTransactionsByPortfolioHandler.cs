using MediatR;
using AutoMapper;
using Microsoft.Extensions.Logging;
using InvestorManagementSystem.Application.Queries.Transactions;
using InvestorManagementSystem.Application.DTOs;
using InvestorManagementSystem.Application.Interfaces;

namespace InvestorManagementSystem.Application.Handlers.Transactions;

public class GetTransactionsByPortfolioHandler : IRequestHandler<GetTransactionsByPortfolioQuery, IEnumerable<TransactionDto>>
{
    private readonly ITransactionRepository _transactionRepository;
    private readonly IMapper _mapper;
    private readonly ILogger<GetTransactionsByPortfolioHandler> _logger;

    public GetTransactionsByPortfolioHandler(
        ITransactionRepository transactionRepository,
        IMapper mapper,
        ILogger<GetTransactionsByPortfolioHandler> logger)
    {
        _transactionRepository = transactionRepository;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<IEnumerable<TransactionDto>> Handle(GetTransactionsByPortfolioQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Getting transactions for portfolio: {PortfolioId}", request.PortfolioId);

        var transactions = await _transactionRepository.GetByPortfolioIdAsync(request.PortfolioId);
        return _mapper.Map<IEnumerable<TransactionDto>>(transactions);
    }
}

