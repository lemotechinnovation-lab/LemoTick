using MediatR;
using Microsoft.Extensions.Logging;
using InvestorManagementSystem.Application.Commands.Auth;
using InvestorManagementSystem.Application.DTOs;
using InvestorManagementSystem.Application.Interfaces;

namespace InvestorManagementSystem.Application.Handlers.Auth;

public class RegisterHandler : IRequestHandler<RegisterCommand, AuthResponseDto?>
{
    private readonly IAuthService _authService;
    private readonly ILogger<RegisterHandler> _logger;

    public RegisterHandler(IAuthService authService, ILogger<RegisterHandler> logger)
    {
        _authService = authService;
        _logger = logger;
    }

    public async Task<AuthResponseDto?> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Processing registration request for email: {Email}", request.RegisterDto.Email);

        var result = await _authService.RegisterAsync(request.RegisterDto);

        if (result == null)
        {
            _logger.LogWarning("Registration failed for email: {Email}", request.RegisterDto.Email);
        }
        else
        {
            _logger.LogInformation("Registration successful for email: {Email}", request.RegisterDto.Email);
        }

        return result;
    }
}
