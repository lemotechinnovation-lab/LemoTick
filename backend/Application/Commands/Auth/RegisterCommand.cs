using MediatR;
using InvestorManagementSystem.Application.DTOs;

namespace InvestorManagementSystem.Application.Commands.Auth;

public record RegisterCommand(RegisterDto RegisterDto) : IRequest<AuthResponseDto?>;
