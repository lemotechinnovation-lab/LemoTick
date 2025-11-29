using MediatR;
using AutoMapper;
using Microsoft.Extensions.Logging;
using InvestorManagementSystem.Application.Queries.Trades;
using InvestorManagementSystem.Application.DTOs;
using InvestorManagementSystem.Application.Interfaces;

namespace InvestorManagementSystem.Application.Handlers.Trades;

public class GetTradesByPortfolioHandler : IRequestHandler<GetTradesByPortfolioQuery, IEnumerable<TradeDto>>
{
    private readonly ITradeRepository _tradeRepository;
    private readonly IMapper _mapper;
    private readonly ILogger<GetTradesByPortfolioHandler> _logger;

    public GetTradesByPortfolioHandler(
        ITradeRepository tradeRepository,
        IMapper mapper,
        ILogger<GetTradesByPortfolioHandler> logger)
    {
        _tradeRepository = tradeRepository;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<IEnumerable<TradeDto>> Handle(GetTradesByPortfolioQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Getting trades for portfolio: {PortfolioId}", request.PortfolioId);

        var trades = await _tradeRepository.GetByPortfolioIdAsync(request.PortfolioId);
        return _mapper.Map<IEnumerable<TradeDto>>(trades);
    }
}

