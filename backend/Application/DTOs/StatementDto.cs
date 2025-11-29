using System.ComponentModel.DataAnnotations;

namespace InvestorManagementSystem.Application.DTOs;

/// <summary>
/// DTO for statement generation request
/// </summary>
public class GenerateStatementRequestDto
{
    [Required]
    public Guid InvestorId { get; set; }

    [Required]
    public StatementPeriodType PeriodType { get; set; }

    [Required]
    [Range(2020, 2100)]
    public int Year { get; set; }

    // For monthly statements
    [Range(1, 12)]
    public int? Month { get; set; }

    // For quarterly statements
    [Range(1, 4)]
    public int? Quarter { get; set; }

    // Option to email the statement
    public bool SendEmail { get; set; } = false;
}

/// <summary>
/// Statement period types
/// </summary>
public enum StatementPeriodType
{
    Monthly = 0,
    Quarterly = 1,
    Annual = 2,
    Custom = 3
}

/// <summary>
/// Complete statement data for PDF generation
/// </summary>
public class StatementDataDto
{
    public Guid InvestorId { get; set; }
    public string InvestorName { get; set; } = string.Empty;
    public string InvestorEmail { get; set; } = string.Empty;
    public string IdNumber { get; set; } = string.Empty;

    public string StatementPeriod { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public DateTime GeneratedAt { get; set; }

    // Portfolio Summary
    public List<PortfolioSummaryDto> Portfolios { get; set; } = new();
    public decimal TotalInvestment { get; set; }
    public decimal TotalCurrentValue { get; set; }
    public decimal TotalProfit { get; set; }
    public decimal TotalLoss { get; set; }
    public decimal NetProfit { get; set; }
    public decimal ReturnPercentage { get; set; }

    // Transactions
    public List<StatementTransactionDto> Transactions { get; set; } = new();
    public decimal TotalDeposits { get; set; }
    public decimal TotalWithdrawals { get; set; }

    // Trades
    public List<StatementTradeDto> Trades { get; set; } = new();
    public int TotalTrades { get; set; }
    public int WinningTrades { get; set; }
    public int LosingTrades { get; set; }
    public decimal WinRate { get; set; }

    // Fees
    public List<StatementFeeDto> Fees { get; set; } = new();
    public decimal TotalFees { get; set; }
}

public class PortfolioSummaryDto
{
    public string Name { get; set; } = string.Empty;
    public decimal InitialValue { get; set; }
    public decimal CurrentValue { get; set; }
    public decimal Profit { get; set; }
    public decimal Loss { get; set; }
    public decimal NetProfit { get; set; }
    public decimal ReturnPercentage { get; set; }
}

public class StatementTransactionDto
{
    public DateTime Date { get; set; }
    public string Type { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}

public class StatementTradeDto
{
    public DateTime EntryDate { get; set; }
    public DateTime? ExitDate { get; set; }
    public string Symbol { get; set; } = string.Empty;
    public string Direction { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public decimal EntryPrice { get; set; }
    public decimal? ExitPrice { get; set; }
    public decimal? Profit { get; set; }
    public decimal? Loss { get; set; }
    public string Status { get; set; } = string.Empty;
}

public class StatementFeeDto
{
    public DateTime Date { get; set; }
    public string Type { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Description { get; set; } = string.Empty;
}

