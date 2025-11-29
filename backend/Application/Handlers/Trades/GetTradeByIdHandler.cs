using MediatR;
using AutoMapper;
using Microsoft.Extensions.Logging;
using InvestorManagementSystem.Application.Queries.Trades;
using InvestorManagementSystem.Application.DTOs;
using InvestorManagementSystem.Application.Interfaces;

namespace InvestorManagementSystem.Application.Handlers.Trades;

public class GetTradeByIdHandler : IRequestHandler<GetTradeByIdQuery, TradeDto?>
{
    private readonly ITradeRepository _tradeRepository;
    private readonly IMapper _mapper;
    private readonly ILogger<GetTradeByIdHandler> _logger;

    public GetTradeByIdHandler(
        ITradeRepository tradeRepository,
        IMapper mapper,
        ILogger<GetTradeByIdHandler> logger)
    {
        _tradeRepository = tradeRepository;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<TradeDto?> Handle(GetTradeByIdQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Getting trade by ID: {TradeId}", request.Id);

        var trade = await _tradeRepository.GetByIdAsync(request.Id);
        return trade != null ? _mapper.Map<TradeDto>(trade) : null;
    }
}

