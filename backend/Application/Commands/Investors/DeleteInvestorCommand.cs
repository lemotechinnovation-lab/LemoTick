using MediatR;

namespace InvestorManagementSystem.Application.Commands.Investors;

public record DeleteInvestorCommand(Guid Id) : IRequest<bool>;
