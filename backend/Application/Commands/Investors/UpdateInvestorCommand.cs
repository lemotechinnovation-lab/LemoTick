using MediatR;
using InvestorManagementSystem.Application.DTOs;

namespace InvestorManagementSystem.Application.Commands.Investors;

public record UpdateInvestorCommand(Guid Id, UpdateInvestorDto UpdateInvestorDto) : IRequest<InvestorDto?>;
