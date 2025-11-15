using MediatR;
using InvestorManagementSystem.Application.DTOs;

namespace InvestorManagementSystem.Application.Commands.Auth;

public record LoginCommand(LoginDto LoginDto) : IRequest<AuthResponseDto?>;
