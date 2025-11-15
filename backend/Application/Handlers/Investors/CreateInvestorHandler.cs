using MediatR;
using AutoMapper;
using Microsoft.Extensions.Logging;
using InvestorManagementSystem.Application.Commands.Investors;
using InvestorManagementSystem.Application.DTOs;
using InvestorManagementSystem.Application.Interfaces;
using InvestorManagementSystem.Core.Entities;

namespace InvestorManagementSystem.Application.Handlers.Investors;

public class CreateInvestorHandler : IRequestHandler<CreateInvestorCommand, InvestorDto>
{
    private readonly IInvestorRepository _investorRepository;
    private readonly IMapper _mapper;
    private readonly ILogger<CreateInvestorHandler> _logger;

    public CreateInvestorHandler(
        IInvestorRepository investorRepository,
        IMapper mapper,
        ILogger<CreateInvestorHandler> logger)
    {
        _investorRepository = investorRepository;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<InvestorDto> Handle(CreateInvestorCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Creating investor with email: {Email}", request.CreateInvestorDto.Email);

        var investor = _mapper.Map<Investor>(request.CreateInvestorDto);
        investor.Id = Guid.NewGuid();
        investor.Status = InvestorStatus.Pending;
        investor.CreatedAt = DateTime.UtcNow;

        var createdInvestor = await _investorRepository.AddAsync(investor);

        _logger.LogInformation("Investor created with ID: {InvestorId}", createdInvestor.Id);

        return _mapper.Map<InvestorDto>(createdInvestor);
    }
}
