using MediatR;
using AutoMapper;
using Microsoft.Extensions.Logging;
using InvestorManagementSystem.Application.Commands.Portfolios;
using InvestorManagementSystem.Application.DTOs;
using InvestorManagementSystem.Application.Interfaces;
using InvestorManagementSystem.Core.Entities;

namespace InvestorManagementSystem.Application.Handlers.Portfolios;

public class CreatePortfolioHandler : IRequestHandler<CreatePortfolioCommand, PortfolioDto>
{
    private readonly IPortfolioRepository _portfolioRepository;
    private readonly IMapper _mapper;
    private readonly ILogger<CreatePortfolioHandler> _logger;

    public CreatePortfolioHandler(
        IPortfolioRepository portfolioRepository,
        IMapper mapper,
        ILogger<CreatePortfolioHandler> logger)
    {
        _portfolioRepository = portfolioRepository;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<PortfolioDto> Handle(CreatePortfolioCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Creating portfolio for investor: {InvestorId}", request.CreatePortfolioDto.InvestorId);

        var portfolio = _mapper.Map<Portfolio>(request.CreatePortfolioDto);
        portfolio.Id = Guid.NewGuid();
        portfolio.Status = PortfolioStatus.Active;
        portfolio.RiskLevel = RiskLevel.Medium;
        portfolio.CurrentValue = request.CreatePortfolioDto.InitialAmount;
        portfolio.InitialInvestment = request.CreatePortfolioDto.InitialAmount;
        portfolio.TotalProfit = 0;
        portfolio.TotalLoss = 0;
        portfolio.NetProfit = 0;
        portfolio.ProfitPercentage = 0;
        portfolio.CreatedAt = DateTime.UtcNow;

        var createdPortfolio = await _portfolioRepository.AddAsync(portfolio);

        _logger.LogInformation("Portfolio created with ID: {PortfolioId}", createdPortfolio.Id);

        return _mapper.Map<PortfolioDto>(createdPortfolio);
    }
}

