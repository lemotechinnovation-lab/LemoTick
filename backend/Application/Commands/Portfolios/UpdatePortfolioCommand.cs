using MediatR;
using InvestorManagementSystem.Application.DTOs;

namespace InvestorManagementSystem.Application.Commands.Portfolios;

public record UpdatePortfolioCommand(Guid Id, UpdatePortfolioDto UpdatePortfolioDto) : IRequest<PortfolioDto?>;
