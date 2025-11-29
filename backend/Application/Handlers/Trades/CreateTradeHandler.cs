using MediatR;
using AutoMapper;
using Microsoft.Extensions.Logging;
using InvestorManagementSystem.Application.Commands.Trades;
using InvestorManagementSystem.Application.DTOs;
using InvestorManagementSystem.Application.Interfaces;
using InvestorManagementSystem.Core.Entities;

namespace InvestorManagementSystem.Application.Handlers.Trades;

public class CreateTradeHandler : IRequestHandler<CreateTradeCommand, TradeDto>
{
    private readonly ITradeRepository _tradeRepository;
    private readonly IMapper _mapper;
    private readonly ILogger<CreateTradeHandler> _logger;

    public CreateTradeHandler(
        ITradeRepository tradeRepository,
        IMapper mapper,
        ILogger<CreateTradeHandler> logger)
    {
        _tradeRepository = tradeRepository;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<TradeDto> Handle(CreateTradeCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Creating trade for portfolio: {PortfolioId}", request.CreateTradeDto.PortfolioId);

        var trade = _mapper.Map<Trade>(request.CreateTradeDto);
        trade.Id = Guid.NewGuid();
        trade.Status = TradeStatus.Open;
        trade.EntryTime = DateTime.UtcNow;
        trade.Stake = request.CreateTradeDto.Amount * request.CreateTradeDto.EntryPrice;
        trade.Direction = TradeDirection.Buy; // Default, can be set based on logic

        var createdTrade = await _tradeRepository.AddAsync(trade);

        _logger.LogInformation("Trade created with ID: {TradeId}", createdTrade.Id);

        return _mapper.Map<TradeDto>(createdTrade);
    }
}

