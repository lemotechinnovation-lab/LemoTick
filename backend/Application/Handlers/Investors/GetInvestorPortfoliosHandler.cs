using MediatR;
using AutoMapper;
using Microsoft.Extensions.Logging;
using InvestorManagementSystem.Application.Queries.Investors;
using InvestorManagementSystem.Application.DTOs;
using InvestorManagementSystem.Application.Interfaces;

namespace InvestorManagementSystem.Application.Handlers.Investors;

public class GetInvestorPortfoliosHandler : IRequestHandler<GetInvestorPortfoliosQuery, IEnumerable<PortfolioDto>>
{
    private readonly IInvestorRepository _investorRepository;
    private readonly IMapper _mapper;
    private readonly ILogger<GetInvestorPortfoliosHandler> _logger;

    public GetInvestorPortfoliosHandler(
        IInvestorRepository investorRepository,
        IMapper mapper,
        ILogger<GetInvestorPortfoliosHandler> logger)
    {
        _investorRepository = investorRepository;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<IEnumerable<PortfolioDto>> Handle(GetInvestorPortfoliosQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Retrieving portfolios for investor ID: {InvestorId}", request.InvestorId);

        var portfolios = await _investorRepository.GetInvestorPortfoliosAsync(request.InvestorId);
        var portfolioDtos = _mapper.Map<IEnumerable<PortfolioDto>>(portfolios);

        _logger.LogInformation("Retrieved {Count} portfolios for investor {InvestorId}", portfolioDtos.Count(), request.InvestorId);
        return portfolioDtos;
    }
}
