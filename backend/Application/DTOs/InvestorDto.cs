using InvestorManagementSystem.Core.Entities;

namespace InvestorManagementSystem.Application.DTOs;

public class InvestorDto
{
    public Guid Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public DateTime DateOfBirth { get; set; }
    public string Nationality { get; set; } = string.Empty;
    public string IdNumber { get; set; } = string.Empty;
    public InvestorStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public DateTime? LastLoginAt { get; set; }
}

public class CreateInvestorDto
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public DateTime DateOfBirth { get; set; }
    public string Nationality { get; set; } = string.Empty;
    public string IdNumber { get; set; } = string.Empty;
}

public class UpdateInvestorDto
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public string Nationality { get; set; } = string.Empty;
    public InvestorStatus Status { get; set; }
}
