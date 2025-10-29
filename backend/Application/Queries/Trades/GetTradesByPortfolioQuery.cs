using MediatR;
using InvestorManagementSystem.Application.DTOs;

namespace InvestorManagementSystem.Application.Queries.Trades;

public record GetTradesByPortfolioQuery(Guid PortfolioId) : IRequest<IEnumerable<TradeDto>>;
