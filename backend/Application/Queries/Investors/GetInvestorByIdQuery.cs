using MediatR;
using InvestorManagementSystem.Application.DTOs;

namespace InvestorManagementSystem.Application.Queries.Investors;

public record GetInvestorByIdQuery(Guid Id) : IRequest<InvestorDto?>;
