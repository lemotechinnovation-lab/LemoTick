using MediatR;
using InvestorManagementSystem.Application.DTOs;

namespace InvestorManagementSystem.Application.Queries.Trades;

public record GetTradeByIdQuery(Guid Id) : IRequest<TradeDto?>;
