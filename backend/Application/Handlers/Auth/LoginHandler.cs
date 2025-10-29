using MediatR;
using Microsoft.Extensions.Logging;
using InvestorManagementSystem.Application.Commands.Auth;
using InvestorManagementSystem.Application.DTOs;
using InvestorManagementSystem.Application.Interfaces;

namespace InvestorManagementSystem.Application.Handlers.Auth;

public class LoginHandler : IRequestHandler<LoginCommand, AuthResponseDto?>
{
    private readonly IAuthService _authService;
    private readonly ILogger<LoginHandler> _logger;

    public LoginHandler(IAuthService authService, ILogger<LoginHandler> logger)
    {
        _authService = authService;
        _logger = logger;
    }

    public async Task<AuthResponseDto?> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Processing login request for email: {Email}", request.LoginDto.Email);

        var result = await _authService.LoginAsync(request.LoginDto);

        if (result == null)
        {
            _logger.LogWarning("Login failed for email: {Email}", request.LoginDto.Email);
        }
        else
        {
            _logger.LogInformation("Login successful for email: {Email}", request.LoginDto.Email);
        }

        return result;
    }
}
