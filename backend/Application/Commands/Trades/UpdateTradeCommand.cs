using MediatR;
using InvestorManagementSystem.Application.DTOs;

namespace InvestorManagementSystem.Application.Commands.Trades;

public record UpdateTradeCommand(Guid Id, UpdateTradeDto UpdateTradeDto) : IRequest<TradeDto?>;
