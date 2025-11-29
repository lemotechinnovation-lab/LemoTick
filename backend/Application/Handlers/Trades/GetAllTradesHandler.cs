using MediatR;
using AutoMapper;
using Microsoft.Extensions.Logging;
using InvestorManagementSystem.Application.Queries.Trades;
using InvestorManagementSystem.Application.DTOs;
using InvestorManagementSystem.Application.Interfaces;

namespace InvestorManagementSystem.Application.Handlers.Trades;

public class GetAllTradesHandler : IRequestHandler<GetAllTradesQuery, IEnumerable<TradeDto>>
{
    private readonly ITradeRepository _tradeRepository;
    private readonly IMapper _mapper;
    private readonly ILogger<GetAllTradesHandler> _logger;

    public GetAllTradesHandler(
        ITradeRepository tradeRepository,
        IMapper mapper,
        ILogger<GetAllTradesHandler> logger)
    {
        _tradeRepository = tradeRepository;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<IEnumerable<TradeDto>> Handle(GetAllTradesQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Getting all trades");

        var trades = await _tradeRepository.GetAllAsync();
        return _mapper.Map<IEnumerable<TradeDto>>(trades);
    }
}

