using MediatR;
using AutoMapper;
using Microsoft.Extensions.Logging;
using InvestorManagementSystem.Application.Commands.Investors;
using InvestorManagementSystem.Application.DTOs;
using InvestorManagementSystem.Application.Interfaces;
using InvestorManagementSystem.Core.Entities;

namespace InvestorManagementSystem.Application.Handlers.Investors;

public class UpdateInvestorHandler : IRequestHandler<UpdateInvestorCommand, InvestorDto?>
{
    private readonly IInvestorRepository _investorRepository;
    private readonly IMapper _mapper;
    private readonly ILogger<UpdateInvestorHandler> _logger;

    public UpdateInvestorHandler(
        IInvestorRepository investorRepository,
        IMapper mapper,
        ILogger<UpdateInvestorHandler> logger)
    {
        _investorRepository = investorRepository;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<InvestorDto?> Handle(UpdateInvestorCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Updating investor with ID: {InvestorId}", request.Id);

        var existingInvestor = await _investorRepository.GetByIdAsync(request.Id);
        if (existingInvestor == null)
        {
            _logger.LogWarning("Investor with ID {InvestorId} not found", request.Id);
            return null;
        }

        _mapper.Map(request.UpdateInvestorDto, existingInvestor);
        existingInvestor.UpdatedAt = DateTime.UtcNow;

        var updatedInvestor = await _investorRepository.UpdateAsync(existingInvestor);
        if (updatedInvestor == null)
        {
            _logger.LogError("Failed to update investor with ID: {InvestorId}", request.Id);
            return null;
        }

        _logger.LogInformation("Investor updated successfully with ID: {InvestorId}", request.Id);
        return _mapper.Map<InvestorDto>(updatedInvestor);
    }
}
