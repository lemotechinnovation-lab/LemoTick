using MediatR;
using AutoMapper;
using Microsoft.Extensions.Logging;
using InvestorManagementSystem.Application.Queries.Investors;
using InvestorManagementSystem.Application.DTOs;
using InvestorManagementSystem.Application.Interfaces;

namespace InvestorManagementSystem.Application.Handlers.Investors;

public class GetAllInvestorsHandler : IRequestHandler<GetAllInvestorsQuery, IEnumerable<InvestorDto>>
{
    private readonly IInvestorRepository _investorRepository;
    private readonly IMapper _mapper;
    private readonly ILogger<GetAllInvestorsHandler> _logger;

    public GetAllInvestorsHandler(
        IInvestorRepository investorRepository,
        IMapper mapper,
        ILogger<GetAllInvestorsHandler> logger)
    {
        _investorRepository = investorRepository;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<IEnumerable<InvestorDto>> Handle(GetAllInvestorsQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Retrieving all investors");

        var investors = await _investorRepository.GetAllAsync();
        var investorDtos = _mapper.Map<IEnumerable<InvestorDto>>(investors);

        _logger.LogInformation("Retrieved {Count} investors", investorDtos.Count());
        return investorDtos;
    }
}
