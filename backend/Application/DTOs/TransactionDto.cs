using InvestorManagementSystem.Core.Entities;

namespace InvestorManagementSystem.Application.DTOs;

public class TransactionDto
{
    public Guid Id { get; set; }
    public Guid InvestorId { get; set; }
    public Guid? PortfolioId { get; set; }
    public TransactionType Type { get; set; }
    public decimal Amount { get; set; }
    public decimal Balance { get; set; }
    public string Currency { get; set; } = "USD";
    public TransactionStatus Status { get; set; }
    public string? Description { get; set; }
    public string? Reference { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ProcessedAt { get; set; }
    public string? PaymentMethod { get; set; }
}

public class CreateTransactionDto
{
    public Guid InvestorId { get; set; }
    public Guid? PortfolioId { get; set; }
    public TransactionType Type { get; set; }
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "USD";
    public string? Description { get; set; }
    public string? Reference { get; set; }
    public string? PaymentMethod { get; set; }
}

public class UpdateTransactionDto
{
    public TransactionStatus Status { get; set; }
    public string? Description { get; set; }
    public string? FailureReason { get; set; }
}

