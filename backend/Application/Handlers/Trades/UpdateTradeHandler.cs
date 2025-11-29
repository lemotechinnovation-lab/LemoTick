using MediatR;
using AutoMapper;
using Microsoft.Extensions.Logging;
using InvestorManagementSystem.Application.Commands.Trades;
using InvestorManagementSystem.Application.DTOs;
using InvestorManagementSystem.Application.Interfaces;
using InvestorManagementSystem.Core.Entities;

namespace InvestorManagementSystem.Application.Handlers.Trades;

public class UpdateTradeHandler : IRequestHandler<UpdateTradeCommand, TradeDto?>
{
    private readonly ITradeRepository _tradeRepository;
    private readonly IMapper _mapper;
    private readonly ILogger<UpdateTradeHandler> _logger;

    public UpdateTradeHandler(
        ITradeRepository tradeRepository,
        IMapper mapper,
        ILogger<UpdateTradeHandler> logger)
    {
        _tradeRepository = tradeRepository;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<TradeDto?> Handle(UpdateTradeCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Updating trade: {TradeId}", request.Id);

        var existingTrade = await _tradeRepository.GetByIdAsync(request.Id);
        if (existingTrade == null)
        {
            _logger.LogWarning("Trade not found: {TradeId}", request.Id);
            return null;
        }

        existingTrade.Status = request.UpdateTradeDto.Status;
        existingTrade.Notes = request.UpdateTradeDto.Notes;

        if (request.UpdateTradeDto.ExitPrice.HasValue)
        {
            existingTrade.ExitPrice = request.UpdateTradeDto.ExitPrice;
            existingTrade.ExitTime = DateTime.UtcNow;

            // Calculate profit/loss
            var priceDifference = request.UpdateTradeDto.ExitPrice.Value - existingTrade.EntryPrice;
            var profitLoss = priceDifference * existingTrade.Amount;

            if (profitLoss > 0)
            {
                existingTrade.Profit = profitLoss;
                existingTrade.Loss = 0;
            }
            else
            {
                existingTrade.Profit = 0;
                existingTrade.Loss = Math.Abs(profitLoss);
            }
        }

        var updatedTrade = await _tradeRepository.UpdateAsync(existingTrade);

        _logger.LogInformation("Trade updated: {TradeId}", request.Id);

        return updatedTrade != null ? _mapper.Map<TradeDto>(updatedTrade) : null;
    }
}

