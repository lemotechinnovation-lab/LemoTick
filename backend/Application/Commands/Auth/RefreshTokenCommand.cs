using MediatR;
using InvestorManagementSystem.Application.DTOs;

namespace InvestorManagementSystem.Application.Commands.Auth;

public record RefreshTokenCommand(RefreshTokenDto RefreshTokenDto) : IRequest<AuthResponseDto?>;
