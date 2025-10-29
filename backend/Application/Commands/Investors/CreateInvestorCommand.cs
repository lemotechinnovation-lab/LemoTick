using MediatR;
using InvestorManagementSystem.Application.DTOs;

namespace InvestorManagementSystem.Application.Commands.Investors;

public record CreateInvestorCommand(CreateInvestorDto CreateInvestorDto) : IRequest<InvestorDto>;
