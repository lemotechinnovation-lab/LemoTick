using InvestorManagementSystem.Application.DTOs;
using InvestorManagementSystem.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace InvestorManagementSystem.Infrastructure.Services;

/// <summary>
/// Service for bank account verification and validation
/// </summary>
public class BankVerificationService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<BankVerificationService> _logger;

    // South African bank branch codes (sample data - in production, use a database or API)
    private static readonly Dictionary<string, string> SouthAfricanBanks = new()
    {
        // Format: BranchCode => BankName
        { "632005", "ABSA Bank" },
        { "250655", "First National Bank (FNB)" },
        { "051001", "Standard Bank" },
        { "470010", "Capitec Bank" },
        { "198765", "Nedbank" },
        { "410506", "Investec Bank" },
        { "580105", "African Bank" },
        { "450105", "Bidvest Bank" },
        { "462005", "Discovery Bank" },
        { "679000", "TymeBank" }
    };

    public BankVerificationService(
        ApplicationDbContext context,
        ILogger<BankVerificationService> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Verify if a bank account exists (basic validation)
    /// In production, integrate with bank APIs
    /// </summary>
    public async Task<bool> VerifyBankAccountAsync(string accountNumber, string branchCode)
    {
        try
        {
            // Basic validations
            if (string.IsNullOrWhiteSpace(accountNumber) || string.IsNullOrWhiteSpace(branchCode))
            {
                return false;
            }

            // Check if account number is numeric
            if (!long.TryParse(accountNumber, out _))
            {
                return false;
            }

            // Check if branch code is valid (6 digits for SA banks)
            if (!branchCode.All(char.IsDigit) || branchCode.Length != 6)
            {
                return false;
            }

            // Check if branch code exists in our database
            var bankDetails = GetBankDetails(branchCode);
            if (bankDetails == null || !bankDetails.IsValid)
            {
                _logger.LogWarning("Invalid branch code: {BranchCode}", branchCode);
                return false;
            }

            // In production, call bank API for real verification
            // await CallBankAPIForVerification(accountNumber, branchCode);

            _logger.LogInformation("Bank account verified: {AccountNumber} at {BranchCode}",
                MaskAccountNumber(accountNumber), branchCode);

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error verifying bank account");
            return false;
        }
    }

    /// <summary>
    /// Validate if account holder name matches
    /// In production, integrate with bank APIs
    /// </summary>
    public async Task<bool> ValidateAccountHolderAsync(string accountNumber, string accountHolderName)
    {
        try
        {
            // In production, call bank API to verify account holder name
            // For now, just validate the name isn't empty
            return !string.IsNullOrWhiteSpace(accountHolderName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating account holder");
            return false;
        }
    }

    /// <summary>
    /// Get bank details from branch code
    /// </summary>
    public BankDetailsDto? GetBankDetails(string branchCode)
    {
        if (SouthAfricanBanks.TryGetValue(branchCode, out var bankName))
        {
            return new BankDetailsDto
            {
                BankName = bankName,
                BranchCode = branchCode,
                BranchName = "Main Branch", // In production, fetch actual branch name
                IsValid = true
            };
        }

        return new BankDetailsDto
        {
            IsValid = false
        };
    }

    /// <summary>
    /// Perform a test deposit to verify account ownership
    /// In production, integrate with payment gateway
    /// </summary>
    public async Task<bool> PerformTestDepositAsync(Guid bankAccountId)
    {
        try
        {
            var bankAccount = await _context.BankAccounts
                .FirstOrDefaultAsync(ba => ba.Id == bankAccountId);

            if (bankAccount == null)
            {
                return false;
            }

            // In production:
            // 1. Generate random deposit amount (e.g., R1.23)
            // 2. Initiate deposit via payment gateway
            // 3. Ask user to confirm the exact amount
            // 4. Verify the amount matches

            _logger.LogInformation("Test deposit initiated for bank account: {BankAccountId}", bankAccountId);

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error performing test deposit");
            return false;
        }
    }

    /// <summary>
    /// Check if account number already exists for this investor
    /// </summary>
    public async Task<bool> IsDuplicateAccountAsync(Guid investorId, string accountNumber)
    {
        return await _context.BankAccounts
            .AnyAsync(ba => ba.InvestorId == investorId &&
                           ba.AccountNumber == accountNumber &&
                           ba.Status != Core.Entities.BankAccountStatus.Rejected);
    }

    /// <summary>
    /// Mask account number for security (show last 4 digits)
    /// </summary>
    public static string MaskAccountNumber(string accountNumber)
    {
        if (string.IsNullOrWhiteSpace(accountNumber) || accountNumber.Length < 4)
        {
            return "****";
        }

        var lastFour = accountNumber[^4..];
        return $"****{lastFour}";
    }

    /// <summary>
    /// Validate South African account number format
    /// </summary>
    public bool ValidateAccountNumberFormat(string accountNumber)
    {
        // South African account numbers are typically 9-11 digits
        if (string.IsNullOrWhiteSpace(accountNumber))
        {
            return false;
        }

        if (!accountNumber.All(char.IsDigit))
        {
            return false;
        }

        return accountNumber.Length >= 9 && accountNumber.Length <= 11;
    }

    /// <summary>
    /// Get list of supported South African banks
    /// </summary>
    public List<BankDetailsDto> GetSupportedBanks()
    {
        return SouthAfricanBanks.Select(kvp => new BankDetailsDto
        {
            BankName = kvp.Value,
            BranchCode = kvp.Key,
            BranchName = "Main Branch",
            IsValid = true
        }).ToList();
    }
}

