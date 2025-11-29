using MediatR;
using AutoMapper;
using Microsoft.Extensions.Logging;
using InvestorManagementSystem.Application.Queries.Portfolios;
using InvestorManagementSystem.Application.DTOs;
using InvestorManagementSystem.Application.Interfaces;

namespace InvestorManagementSystem.Application.Handlers.Portfolios;

public class GetAllPortfoliosHandler : IRequestHandler<GetAllPortfoliosQuery, IEnumerable<PortfolioDto>>
{
    private readonly IPortfolioRepository _portfolioRepository;
    private readonly IMapper _mapper;
    private readonly ILogger<GetAllPortfoliosHandler> _logger;

    public GetAllPortfoliosHandler(
        IPortfolioRepository portfolioRepository,
        IMapper mapper,
        ILogger<GetAllPortfoliosHandler> logger)
    {
        _portfolioRepository = portfolioRepository;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<IEnumerable<PortfolioDto>> Handle(GetAllPortfoliosQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Getting all portfolios");

        var portfolios = await _portfolioRepository.GetAllAsync();
        return _mapper.Map<IEnumerable<PortfolioDto>>(portfolios);
    }
}

