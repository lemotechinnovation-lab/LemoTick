using MediatR;
using InvestorManagementSystem.Application.DTOs;

namespace InvestorManagementSystem.Application.Queries.Investors;

public record GetAllInvestorsQuery() : IRequest<IEnumerable<InvestorDto>>;
