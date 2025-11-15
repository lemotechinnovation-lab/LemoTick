using MediatR;
using AutoMapper;
using Microsoft.Extensions.Logging;
using InvestorManagementSystem.Application.Queries.Investors;
using InvestorManagementSystem.Application.DTOs;
using InvestorManagementSystem.Application.Interfaces;

namespace InvestorManagementSystem.Application.Handlers.Investors;

public class GetInvestorByIdHandler : IRequestHandler<GetInvestorByIdQuery, InvestorDto?>
{
    private readonly IInvestorRepository _investorRepository;
    private readonly IMapper _mapper;
    private readonly ILogger<GetInvestorByIdHandler> _logger;

    public GetInvestorByIdHandler(
        IInvestorRepository investorRepository,
        IMapper mapper,
        ILogger<GetInvestorByIdHandler> logger)
    {
        _investorRepository = investorRepository;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<InvestorDto?> Handle(GetInvestorByIdQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Retrieving investor with ID: {InvestorId}", request.Id);

        var investor = await _investorRepository.GetByIdAsync(request.Id);
        if (investor == null)
        {
            _logger.LogWarning("Investor with ID {InvestorId} not found", request.Id);
            return null;
        }

        var investorDto = _mapper.Map<InvestorDto>(investor);
        _logger.LogInformation("Investor retrieved successfully with ID: {InvestorId}", request.Id);

        return investorDto;
    }
}
