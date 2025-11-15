using MediatR;
using Microsoft.Extensions.Logging;
using InvestorManagementSystem.Application.Commands.Auth;
using InvestorManagementSystem.Application.Interfaces;

namespace InvestorManagementSystem.Application.Handlers.Auth;

public class ChangePasswordHandler : IRequestHandler<ChangePasswordCommand, bool>
{
    private readonly IAuthService _authService;
    private readonly ILogger<ChangePasswordHandler> _logger;

    public ChangePasswordHandler(IAuthService authService, ILogger<ChangePasswordHandler> logger)
    {
        _authService = authService;
        _logger = logger;
    }

    public async Task<bool> Handle(ChangePasswordCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Processing change password request for investor: {InvestorId}", request.InvestorId);

        var result = await _authService.ChangePasswordAsync(request.InvestorId, request.ChangePasswordDto);

        if (!result)
        {
            _logger.LogWarning("Password change failed for investor: {InvestorId}", request.InvestorId);
        }
        else
        {
            _logger.LogInformation("Password change successful for investor: {InvestorId}", request.InvestorId);
        }

        return result;
    }
}
