using MediatR;
using InvestorManagementSystem.Application.DTOs;

namespace InvestorManagementSystem.Application.Commands.Trades;

public record CreateTradeCommand(CreateTradeDto CreateTradeDto) : IRequest<TradeDto>;
