using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using InvestorManagementSystem.Infrastructure.Data;
using InvestorManagementSystem.Application.Services;
using InvestorManagementSystem.Application.DTOs;
using InvestorManagementSystem.Core.Entities;
using System.Security.Claims;

namespace InvestorManagementSystem.API.Controllers;

/// <summary>
/// Controller for generating and managing investor statements
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class StatementsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly StatementGenerationService _statementService;
    private readonly IEmailNotificationService _emailService;
    private readonly ILogger<StatementsController> _logger;

    public StatementsController(
        ApplicationDbContext context,
        StatementGenerationService statementService,
        IEmailNotificationService emailService,
        ILogger<StatementsController> logger)
    {
        _context = context;
        _statementService = statementService;
        _emailService = emailService;
        _logger = logger;
    }

    /// <summary>
    /// Generate monthly statement
    /// </summary>
    [HttpGet("monthly")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetMonthlyStatement(
        [FromQuery] Guid? investorId,
        [FromQuery] int year,
        [FromQuery] int month,
        [FromQuery] bool sendEmail = false)
    {
        // Validate
        if (month < 1 || month > 12)
            return BadRequest(new { error = "Month must be between 1 and 12" });

        if (year < 2020 || year > DateTime.UtcNow.Year)
            return BadRequest(new { error = "Invalid year" });

        // Determine investor
        var targetInvestorId = await GetAuthorizedInvestorId(investorId);
        if (targetInvestorId == Guid.Empty)
            return Forbid();

        var startDate = new DateTime(year, month, 1, 0, 0, 0, DateTimeKind.Utc);
        var endDate = startDate.AddMonths(1).AddDays(-1);

        var data = await GetStatementData(targetInvestorId, startDate, endDate, $"Monthly Statement - {startDate:MMMM yyyy}");

        if (data == null)
            return NotFound(new { error = "Investor not found" });

        var pdfBytes = _statementService.GenerateStatement(data);

        // Send email if requested
        if (sendEmail)
        {
            await SendStatementEmail(data.InvestorEmail, pdfBytes, $"Statement_{startDate:yyyy_MM}.pdf", data.StatementPeriod);
        }

        return File(pdfBytes, "application/pdf", $"Statement_{data.InvestorName}_{startDate:yyyy_MM}.pdf");
    }

    /// <summary>
    /// Generate quarterly statement
    /// </summary>
    [HttpGet("quarterly")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetQuarterlyStatement(
        [FromQuery] Guid? investorId,
        [FromQuery] int year,
        [FromQuery] int quarter,
        [FromQuery] bool sendEmail = false)
    {
        // Validate
        if (quarter < 1 || quarter > 4)
            return BadRequest(new { error = "Quarter must be between 1 and 4" });

        if (year < 2020 || year > DateTime.UtcNow.Year)
            return BadRequest(new { error = "Invalid year" });

        // Determine investor
        var targetInvestorId = await GetAuthorizedInvestorId(investorId);
        if (targetInvestorId == Guid.Empty)
            return Forbid();

        var startMonth = (quarter - 1) * 3 + 1;
        var startDate = new DateTime(year, startMonth, 1, 0, 0, 0, DateTimeKind.Utc);
        var endDate = startDate.AddMonths(3).AddDays(-1);

        var data = await GetStatementData(targetInvestorId, startDate, endDate, $"Quarterly Statement - Q{quarter} {year}");

        if (data == null)
            return NotFound(new { error = "Investor not found" });

        var pdfBytes = _statementService.GenerateStatement(data);

        // Send email if requested
        if (sendEmail)
        {
            await SendStatementEmail(data.InvestorEmail, pdfBytes, $"Statement_{year}_Q{quarter}.pdf", data.StatementPeriod);
        }

        return File(pdfBytes, "application/pdf", $"Statement_{data.InvestorName}_{year}_Q{quarter}.pdf");
    }

    /// <summary>
    /// Generate annual statement
    /// </summary>
    [HttpGet("annual")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetAnnualStatement(
        [FromQuery] Guid? investorId,
        [FromQuery] int year,
        [FromQuery] bool sendEmail = false)
    {
        // Validate
        if (year < 2020 || year > DateTime.UtcNow.Year)
            return BadRequest(new { error = "Invalid year" });

        // Determine investor
        var targetInvestorId = await GetAuthorizedInvestorId(investorId);
        if (targetInvestorId == Guid.Empty)
            return Forbid();

        var startDate = new DateTime(year, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        var endDate = new DateTime(year, 12, 31, 23, 59, 59, DateTimeKind.Utc);

        var data = await GetStatementData(targetInvestorId, startDate, endDate, $"Annual Statement - {year}");

        if (data == null)
            return NotFound(new { error = "Investor not found" });

        var pdfBytes = _statementService.GenerateStatement(data);

        // Send email if requested
        if (sendEmail)
        {
            await SendStatementEmail(data.InvestorEmail, pdfBytes, $"Statement_{year}.pdf", data.StatementPeriod);
        }

        return File(pdfBytes, "application/pdf", $"Statement_{data.InvestorName}_{year}.pdf");
    }

    /// <summary>
    /// Generate custom date range statement
    /// </summary>
    [HttpGet("custom")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetCustomStatement(
        [FromQuery] Guid? investorId,
        [FromQuery] DateTime startDate,
        [FromQuery] DateTime endDate,
        [FromQuery] bool sendEmail = false)
    {
        // Validate
        if (startDate >= endDate)
            return BadRequest(new { error = "Start date must be before end date" });

        if ((endDate - startDate).TotalDays > 365)
            return BadRequest(new { error = "Date range cannot exceed 1 year" });

        // Determine investor
        var targetInvestorId = await GetAuthorizedInvestorId(investorId);
        if (targetInvestorId == Guid.Empty)
            return Forbid();

        // Ensure UTC
        startDate = DateTime.SpecifyKind(startDate, DateTimeKind.Utc);
        endDate = DateTime.SpecifyKind(endDate, DateTimeKind.Utc);

        var data = await GetStatementData(
            targetInvestorId,
            startDate,
            endDate,
            $"Custom Statement - {startDate:dd MMM yyyy} to {endDate:dd MMM yyyy}");

        if (data == null)
            return NotFound(new { error = "Investor not found" });

        var pdfBytes = _statementService.GenerateStatement(data);

        // Send email if requested
        if (sendEmail)
        {
            await SendStatementEmail(data.InvestorEmail, pdfBytes, $"Statement_Custom_{startDate:yyyyMMdd}_{endDate:yyyyMMdd}.pdf", data.StatementPeriod);
        }

        return File(pdfBytes, "application/pdf", $"Statement_{data.InvestorName}_Custom.pdf");
    }

    /// <summary>
    /// Email a statement without downloading
    /// </summary>
    [HttpPost("email")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> EmailStatement([FromBody] GenerateStatementRequestDto request)
    {
        // Determine investor
        var targetInvestorId = await GetAuthorizedInvestorId(request.InvestorId);
        if (targetInvestorId == Guid.Empty)
            return Forbid();

        DateTime startDate, endDate;
        string period;

        // Calculate date range based on period type
        switch (request.PeriodType)
        {
            case StatementPeriodType.Monthly:
                if (!request.Month.HasValue)
                    return BadRequest(new { error = "Month is required for monthly statements" });
                startDate = new DateTime(request.Year, request.Month.Value, 1, 0, 0, 0, DateTimeKind.Utc);
                endDate = startDate.AddMonths(1).AddDays(-1);
                period = $"Monthly Statement - {startDate:MMMM yyyy}";
                break;

            case StatementPeriodType.Quarterly:
                if (!request.Quarter.HasValue)
                    return BadRequest(new { error = "Quarter is required for quarterly statements" });
                var startMonth = (request.Quarter.Value - 1) * 3 + 1;
                startDate = new DateTime(request.Year, startMonth, 1, 0, 0, 0, DateTimeKind.Utc);
                endDate = startDate.AddMonths(3).AddDays(-1);
                period = $"Quarterly Statement - Q{request.Quarter} {request.Year}";
                break;

            case StatementPeriodType.Annual:
                startDate = new DateTime(request.Year, 1, 1, 0, 0, 0, DateTimeKind.Utc);
                endDate = new DateTime(request.Year, 12, 31, 23, 59, 59, DateTimeKind.Utc);
                period = $"Annual Statement - {request.Year}";
                break;

            default:
                return BadRequest(new { error = "Invalid period type" });
        }

        var data = await GetStatementData(targetInvestorId, startDate, endDate, period);

        if (data == null)
            return NotFound(new { error = "Investor not found" });

        var pdfBytes = _statementService.GenerateStatement(data);
        await SendStatementEmail(data.InvestorEmail, pdfBytes, $"Statement_{startDate:yyyy_MM}.pdf", period);

        _logger.LogInformation("Statement emailed to {Email} for period {Period}", data.InvestorEmail, period);

        return Ok(new { message = "Statement has been sent to your email", period });
    }

    private async Task<Guid> GetAuthorizedInvestorId(Guid? requestedInvestorId)
    {
        var userIdClaim = User.FindFirstValue("investor_id");
        var userRole = User.FindFirstValue(ClaimTypes.Role);

        if (string.IsNullOrEmpty(userIdClaim))
            return Guid.Empty;

        var currentUserId = Guid.Parse(userIdClaim);

        // Admin/Compliance can generate for any investor
        if (userRole == "Administrator" || userRole == "ComplianceOfficer")
        {
            return requestedInvestorId ?? currentUserId;
        }

        // Regular investors can only generate their own statements
        if (requestedInvestorId.HasValue && requestedInvestorId.Value != currentUserId)
        {
            return Guid.Empty;
        }

        return currentUserId;
    }

    private async Task<StatementDataDto?> GetStatementData(Guid investorId, DateTime startDate, DateTime endDate, string period)
    {
        var investor = await _context.Investors.FindAsync(investorId);
        if (investor == null)
            return null;

        // Get portfolios
        var portfolios = await _context.Portfolios
            .Where(p => p.InvestorId == investorId)
            .ToListAsync();

        var portfolioIds = portfolios.Select(p => p.Id).ToList();

        // Get transactions in period
        var transactions = await _context.Transactions
            .Where(t => t.InvestorId == investorId && t.CreatedAt >= startDate && t.CreatedAt <= endDate)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();

        // Get trades in period
        var trades = await _context.Trades
            .Where(t => portfolioIds.Contains(t.PortfolioId) && t.EntryTime >= startDate && t.EntryTime <= endDate)
            .Include(t => t.Portfolio)
            .OrderByDescending(t => t.EntryTime)
            .ToListAsync();

        // Get fees in period
        var fees = await _context.Fees
            .Where(f => portfolioIds.Contains(f.PortfolioId) && f.CalculatedAt >= startDate && f.CalculatedAt <= endDate)
            .OrderByDescending(f => f.CalculatedAt)
            .ToListAsync();

        // Calculate summaries
        var totalInvestment = portfolios.Sum(p => p.InitialInvestment);
        var totalCurrentValue = portfolios.Sum(p => p.CurrentValue);
        var totalProfit = portfolios.Sum(p => p.TotalProfit);
        var totalLoss = portfolios.Sum(p => p.TotalLoss);
        var netProfit = totalProfit - totalLoss;
        var returnPercentage = totalInvestment > 0 ? (netProfit / totalInvestment) * 100 : 0;

        var completedTransactions = transactions.Where(t => t.Status == TransactionStatus.Completed).ToList();
        var totalDeposits = completedTransactions.Where(t => t.Type == TransactionType.Deposit).Sum(t => t.Amount);
        var totalWithdrawals = completedTransactions.Where(t => t.Type == TransactionType.Withdrawal).Sum(t => t.Amount);

        var closedTrades = trades.Where(t => t.Status == TradeStatus.Closed).ToList();
        var winningTrades = closedTrades.Count(t => t.Profit.HasValue && t.Profit > 0);
        var losingTrades = closedTrades.Count(t => t.Loss.HasValue && t.Loss > 0);
        var winRate = closedTrades.Any() ? (decimal)winningTrades / closedTrades.Count * 100 : 0;

        var totalFees = fees.Sum(f => f.Amount);

        return new StatementDataDto
        {
            InvestorId = investorId,
            InvestorName = $"{investor.FirstName} {investor.LastName}",
            InvestorEmail = investor.Email,
            IdNumber = investor.IdNumber,
            StatementPeriod = period,
            StartDate = startDate,
            EndDate = endDate,
            GeneratedAt = DateTime.UtcNow,

            // Portfolio Summary
            Portfolios = portfolios.Select(p => new PortfolioSummaryDto
            {
                Name = p.Name,
                InitialValue = p.InitialInvestment,
                CurrentValue = p.CurrentValue,
                Profit = p.TotalProfit,
                Loss = p.TotalLoss,
                NetProfit = p.NetProfit,
                ReturnPercentage = p.ProfitPercentage
            }).ToList(),
            TotalInvestment = totalInvestment,
            TotalCurrentValue = totalCurrentValue,
            TotalProfit = totalProfit,
            TotalLoss = totalLoss,
            NetProfit = netProfit,
            ReturnPercentage = returnPercentage,

            // Transactions
            Transactions = transactions.Select(t => new StatementTransactionDto
            {
                Date = t.CreatedAt,
                Type = t.Type.ToString(),
                Amount = t.Amount,
                Currency = t.Currency,
                Status = t.Status.ToString(),
                Description = t.Description ?? ""
            }).ToList(),
            TotalDeposits = totalDeposits,
            TotalWithdrawals = totalWithdrawals,

            // Trades
            Trades = trades.Select(t => new StatementTradeDto
            {
                EntryDate = t.EntryTime,
                ExitDate = t.ExitTime,
                Symbol = t.Symbol,
                Direction = t.Direction.ToString(),
                Amount = t.Amount,
                EntryPrice = t.EntryPrice,
                ExitPrice = t.ExitPrice,
                Profit = t.Profit,
                Loss = t.Loss,
                Status = t.Status.ToString()
            }).ToList(),
            TotalTrades = trades.Count,
            WinningTrades = winningTrades,
            LosingTrades = losingTrades,
            WinRate = winRate,

            // Fees
            Fees = fees.Select(f => new StatementFeeDto
            {
                Date = f.CalculatedAt,
                Type = f.Type.ToString(),
                Amount = f.Amount,
                Description = f.Description ?? ""
            }).ToList(),
            TotalFees = totalFees
        };
    }

    private async Task SendStatementEmail(string email, byte[] pdfBytes, string filename, string period)
    {
        try
        {
            var subject = $"Your Investment Statement - {period}";
            var htmlBody = $@"
<html>
<body style='font-family: Arial, sans-serif;'>
    <h2>Investment Statement</h2>
    <p>Dear Investor,</p>
    <p>Please find attached your investment statement for <strong>{period}</strong>.</p>
    <p>This statement includes:</p>
    <ul>
        <li>Portfolio performance summary</li>
        <li>Transaction history</li>
        <li>Trading activity</li>
        <li>Fees breakdown</li>
    </ul>
    <p>If you have any questions about your statement, please contact our support team.</p>
    <p>Best regards,<br/>The LemoTick Team</p>
</body>
</html>";

            // Note: QuestPDF attachment support would need MailKit integration enhancement
            await _emailService.SendCustomEmailAsync(email, subject, htmlBody);

            _logger.LogInformation("Statement email sent to {Email}", email);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send statement email to {Email}", email);
        }
    }
}

