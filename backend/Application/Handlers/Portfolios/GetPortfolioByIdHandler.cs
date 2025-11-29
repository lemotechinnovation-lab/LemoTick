using MediatR;
using AutoMapper;
using Microsoft.Extensions.Logging;
using InvestorManagementSystem.Application.Queries.Portfolios;
using InvestorManagementSystem.Application.DTOs;
using InvestorManagementSystem.Application.Interfaces;

namespace InvestorManagementSystem.Application.Handlers.Portfolios;

public class GetPortfolioByIdHandler : IRequestHandler<GetPortfolioByIdQuery, PortfolioDto?>
{
    private readonly IPortfolioRepository _portfolioRepository;
    private readonly IMapper _mapper;
    private readonly ILogger<GetPortfolioByIdHandler> _logger;

    public GetPortfolioByIdHandler(
        IPortfolioRepository portfolioRepository,
        IMapper mapper,
        ILogger<GetPortfolioByIdHandler> logger)
    {
        _portfolioRepository = portfolioRepository;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<PortfolioDto?> Handle(GetPortfolioByIdQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Getting portfolio by ID: {PortfolioId}", request.Id);

        var portfolio = await _portfolioRepository.GetByIdAsync(request.Id);
        return portfolio != null ? _mapper.Map<PortfolioDto>(portfolio) : null;
    }
}

