using MediatR;
using AutoMapper;
using Microsoft.Extensions.Logging;
using InvestorManagementSystem.Application.Commands.Portfolios;
using InvestorManagementSystem.Application.DTOs;
using InvestorManagementSystem.Application.Interfaces;

namespace InvestorManagementSystem.Application.Handlers.Portfolios;

public class UpdatePortfolioHandler : IRequestHandler<UpdatePortfolioCommand, PortfolioDto?>
{
    private readonly IPortfolioRepository _portfolioRepository;
    private readonly IMapper _mapper;
    private readonly ILogger<UpdatePortfolioHandler> _logger;

    public UpdatePortfolioHandler(
        IPortfolioRepository portfolioRepository,
        IMapper mapper,
        ILogger<UpdatePortfolioHandler> logger)
    {
        _portfolioRepository = portfolioRepository;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<PortfolioDto?> Handle(UpdatePortfolioCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Updating portfolio: {PortfolioId}", request.Id);

        var existingPortfolio = await _portfolioRepository.GetByIdAsync(request.Id);
        if (existingPortfolio == null)
        {
            _logger.LogWarning("Portfolio not found: {PortfolioId}", request.Id);
            return null;
        }

        existingPortfolio.Name = request.UpdatePortfolioDto.Name;
        existingPortfolio.Description = request.UpdatePortfolioDto.Description;
        existingPortfolio.Status = request.UpdatePortfolioDto.Status;
        existingPortfolio.UpdatedAt = DateTime.UtcNow;

        var updatedPortfolio = await _portfolioRepository.UpdateAsync(existingPortfolio);

        _logger.LogInformation("Portfolio updated: {PortfolioId}", request.Id);

        return updatedPortfolio != null ? _mapper.Map<PortfolioDto>(updatedPortfolio) : null;
    }
}

