using MediatR;
using InvestorManagementSystem.Application.DTOs;

namespace InvestorManagementSystem.Application.Queries.Investors;

public record GetInvestorPortfoliosQuery(Guid InvestorId) : IRequest<IEnumerable<PortfolioDto>>;
