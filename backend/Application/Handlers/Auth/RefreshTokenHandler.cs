using MediatR;
using Microsoft.Extensions.Logging;
using InvestorManagementSystem.Application.Commands.Auth;
using InvestorManagementSystem.Application.DTOs;
using InvestorManagementSystem.Application.Interfaces;

namespace InvestorManagementSystem.Application.Handlers.Auth;

public class RefreshTokenHandler : IRequestHandler<RefreshTokenCommand, AuthResponseDto?>
{
    private readonly IAuthService _authService;
    private readonly ILogger<RefreshTokenHandler> _logger;

    public RefreshTokenHandler(IAuthService authService, ILogger<RefreshTokenHandler> logger)
    {
        _authService = authService;
        _logger = logger;
    }

    public async Task<AuthResponseDto?> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Processing refresh token request");

        var result = await _authService.RefreshTokenAsync(request.RefreshTokenDto.RefreshToken);

        if (result == null)
        {
            _logger.LogWarning("Token refresh failed");
        }
        else
        {
            _logger.LogInformation("Token refresh successful");
        }

        return result;
    }
}
