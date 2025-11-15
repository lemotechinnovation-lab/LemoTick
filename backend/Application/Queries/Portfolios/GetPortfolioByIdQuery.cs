using MediatR;
using InvestorManagementSystem.Application.DTOs;

namespace InvestorManagementSystem.Application.Queries.Portfolios;

public record GetPortfolioByIdQuery(Guid Id) : IRequest<PortfolioDto?>;
