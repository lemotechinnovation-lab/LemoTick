using MediatR;
using InvestorManagementSystem.Application.DTOs;

namespace InvestorManagementSystem.Application.Commands.Auth;

public record ChangePasswordCommand(Guid InvestorId, ChangePasswordDto ChangePasswordDto) : IRequest<bool>;
