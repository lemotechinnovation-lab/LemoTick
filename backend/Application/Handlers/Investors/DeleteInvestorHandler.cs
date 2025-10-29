using MediatR;
using Microsoft.Extensions.Logging;
using InvestorManagementSystem.Application.Commands.Investors;
using InvestorManagementSystem.Application.Interfaces;

namespace InvestorManagementSystem.Application.Handlers.Investors;

public class DeleteInvestorHandler : IRequestHandler<DeleteInvestorCommand, bool>
{
    private readonly IInvestorRepository _investorRepository;
    private readonly ILogger<DeleteInvestorHandler> _logger;

    public DeleteInvestorHandler(
        IInvestorRepository investorRepository,
        ILogger<DeleteInvestorHandler> logger)
    {
        _investorRepository = investorRepository;
        _logger = logger;
    }

    public async Task<bool> Handle(DeleteInvestorCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Deleting investor with ID: {InvestorId}", request.Id);

        var result = await _investorRepository.DeleteAsync(request.Id);

        if (result)
        {
            _logger.LogInformation("Investor deleted successfully with ID: {InvestorId}", request.Id);
        }
        else
        {
            _logger.LogWarning("Investor with ID {InvestorId} not found for deletion", request.Id);
        }

        return result;
    }
}
