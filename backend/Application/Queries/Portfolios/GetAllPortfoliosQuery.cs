using MediatR;
using InvestorManagementSystem.Application.DTOs;

namespace InvestorManagementSystem.Application.Queries.Portfolios;

public record GetAllPortfoliosQuery() : IRequest<IEnumerable<PortfolioDto>>;
