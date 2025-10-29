using MediatR;
using InvestorManagementSystem.Application.DTOs;

namespace InvestorManagementSystem.Application.Queries.Trades;

public record GetAllTradesQuery() : IRequest<IEnumerable<TradeDto>>;
