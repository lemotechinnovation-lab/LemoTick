using MediatR;
using InvestorManagementSystem.Application.DTOs;

namespace InvestorManagementSystem.Application.Commands.Portfolios;

public record CreatePortfolioCommand(CreatePortfolioDto CreatePortfolioDto) : IRequest<PortfolioDto>;
