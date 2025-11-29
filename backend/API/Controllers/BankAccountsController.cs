using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using InvestorManagementSystem.Infrastructure.Data;
using InvestorManagementSystem.Application.DTOs;
using InvestorManagementSystem.Core.Entities;
using InvestorManagementSystem.Infrastructure.Services;

namespace InvestorManagementSystem.API.Controllers;

/// <summary>
/// Controller for managing bank accounts
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BankAccountsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly BankVerificationService _verificationService;
    private readonly ILogger<BankAccountsController> _logger;

    public BankAccountsController(
        ApplicationDbContext context,
        BankVerificationService verificationService,
        ILogger<BankAccountsController> logger)
    {
        _context = context;
        _verificationService = verificationService;
        _logger = logger;
    }

    /// <summary>
    /// Get all bank accounts for the current investor
    /// </summary>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetBankAccounts([FromQuery] Guid? investorId)
    {
        var targetInvestorId = investorId ?? GetCurrentInvestorId();

        var bankAccounts = await _context.BankAccounts
            .Where(ba => ba.InvestorId == targetInvestorId)
            .OrderByDescending(ba => ba.IsPrimary)
            .ThenByDescending(ba => ba.AddedAt)
            .Select(ba => new BankAccountDto
            {
                Id = ba.Id,
                InvestorId = ba.InvestorId,
                AccountHolderName = ba.AccountHolderName,
                MaskedAccountNumber = BankVerificationService.MaskAccountNumber(ba.AccountNumber),
                BranchCode = ba.BranchCode,
                BankName = ba.BankName,
                AccountType = ba.AccountType,
                Status = ba.Status,
                IsPrimary = ba.IsPrimary,
                AddedAt = ba.AddedAt,
                VerifiedAt = ba.VerifiedAt,
                LastUsedAt = ba.LastUsedAt
            })
            .ToListAsync();

        return Ok(bankAccounts);
    }

    /// <summary>
    /// Get a specific bank account by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetBankAccount(Guid id)
    {
        var bankAccount = await _context.BankAccounts
            .Where(ba => ba.Id == id)
            .Select(ba => new BankAccountDto
            {
                Id = ba.Id,
                InvestorId = ba.InvestorId,
                AccountHolderName = ba.AccountHolderName,
                MaskedAccountNumber = BankVerificationService.MaskAccountNumber(ba.AccountNumber),
                BranchCode = ba.BranchCode,
                BankName = ba.BankName,
                AccountType = ba.AccountType,
                Status = ba.Status,
                IsPrimary = ba.IsPrimary,
                AddedAt = ba.AddedAt,
                VerifiedAt = ba.VerifiedAt,
                LastUsedAt = ba.LastUsedAt
            })
            .FirstOrDefaultAsync();

        if (bankAccount == null)
        {
            return NotFound(new { error = "Bank account not found" });
        }

        // Ensure user can only access their own bank accounts (unless admin)
        if (!User.IsInRole("Administrator") && bankAccount.InvestorId != GetCurrentInvestorId())
        {
            return Forbid();
        }

        return Ok(bankAccount);
    }

    /// <summary>
    /// Add a new bank account
    /// </summary>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> AddBankAccount([FromBody] AddBankAccountDto dto)
    {
        var investorId = GetCurrentInvestorId();

        // Check for duplicate account
        if (await _verificationService.IsDuplicateAccountAsync(investorId, dto.AccountNumber))
        {
            return BadRequest(new { error = "This bank account is already registered" });
        }

        // Validate account number format
        if (!_verificationService.ValidateAccountNumberFormat(dto.AccountNumber))
        {
            return BadRequest(new { error = "Invalid account number format" });
        }

        // Verify bank details
        var bankDetails = _verificationService.GetBankDetails(dto.BranchCode);
        if (bankDetails == null || !bankDetails.IsValid)
        {
            return BadRequest(new { error = "Invalid branch code" });
        }

        // Create bank account
        var bankAccount = new BankAccount
        {
            Id = Guid.NewGuid(),
            InvestorId = investorId,
            AccountHolderName = dto.AccountHolderName,
            AccountNumber = dto.AccountNumber,
            BranchCode = dto.BranchCode,
            BankName = dto.BankName,
            AccountType = dto.AccountType,
            Status = BankAccountStatus.Pending,
            IsPrimary = false,
            AddedAt = DateTime.UtcNow
        };

        // If this is the first account, make it primary
        var hasExistingAccounts = await _context.BankAccounts
            .AnyAsync(ba => ba.InvestorId == investorId && ba.Status != BankAccountStatus.Rejected);

        if (!hasExistingAccounts)
        {
            bankAccount.IsPrimary = true;
        }

        _context.BankAccounts.Add(bankAccount);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Bank account added for investor {InvestorId}: {BankAccountId}",
            investorId, bankAccount.Id);

        var result = new BankAccountDto
        {
            Id = bankAccount.Id,
            InvestorId = bankAccount.InvestorId,
            AccountHolderName = bankAccount.AccountHolderName,
            MaskedAccountNumber = BankVerificationService.MaskAccountNumber(bankAccount.AccountNumber),
            BranchCode = bankAccount.BranchCode,
            BankName = bankAccount.BankName,
            AccountType = bankAccount.AccountType,
            Status = bankAccount.Status,
            IsPrimary = bankAccount.IsPrimary,
            AddedAt = bankAccount.AddedAt
        };

        return CreatedAtAction(nameof(GetBankAccount), new { id = bankAccount.Id }, result);
    }

    /// <summary>
    /// Update a bank account
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateBankAccount(Guid id, [FromBody] UpdateBankAccountDto dto)
    {
        var bankAccount = await _context.BankAccounts.FindAsync(id);
        if (bankAccount == null)
        {
            return NotFound(new { error = "Bank account not found" });
        }

        // Ensure user can only update their own bank accounts (unless admin)
        if (!User.IsInRole("Administrator") && bankAccount.InvestorId != GetCurrentInvestorId())
        {
            return Forbid();
        }

        // Update fields
        if (dto.AccountHolderName != null)
            bankAccount.AccountHolderName = dto.AccountHolderName;

        if (dto.BankName != null)
            bankAccount.BankName = dto.BankName;

        if (dto.AccountType.HasValue)
            bankAccount.AccountType = dto.AccountType.Value;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Bank account updated: {BankAccountId}", id);

        return Ok(new { message = "Bank account updated successfully" });
    }

    /// <summary>
    /// Set a bank account as primary
    /// </summary>
    [HttpPost("{id}/set-primary")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> SetPrimaryAccount(Guid id)
    {
        var investorId = GetCurrentInvestorId();

        var bankAccount = await _context.BankAccounts
            .FirstOrDefaultAsync(ba => ba.Id == id && ba.InvestorId == investorId);

        if (bankAccount == null)
        {
            return NotFound(new { error = "Bank account not found" });
        }

        if (bankAccount.Status != BankAccountStatus.Verified)
        {
            return BadRequest(new { error = "Only verified accounts can be set as primary" });
        }

        // Remove primary flag from all other accounts
        var otherAccounts = await _context.BankAccounts
            .Where(ba => ba.InvestorId == investorId && ba.Id != id)
            .ToListAsync();

        foreach (var account in otherAccounts)
        {
            account.IsPrimary = false;
        }

        bankAccount.IsPrimary = true;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Primary bank account set for investor {InvestorId}: {BankAccountId}",
            investorId, id);

        return Ok(new { message = "Bank account set as primary successfully" });
    }

    /// <summary>
    /// Verify a bank account (Admin only)
    /// </summary>
    [HttpPost("{id}/verify")]
    [Authorize(Roles = "Administrator,ComplianceOfficer")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> VerifyBankAccount(Guid id, [FromBody] VerifyBankAccountDto dto)
    {
        var bankAccount = await _context.BankAccounts.FindAsync(id);
        if (bankAccount == null)
        {
            return NotFound(new { error = "Bank account not found" });
        }

        var verifierId = GetCurrentInvestorId();

        bankAccount.Status = dto.Status;
        bankAccount.VerificationNotes = dto.VerificationNotes;

        if (dto.Status == BankAccountStatus.Verified)
        {
            bankAccount.VerifiedAt = DateTime.UtcNow;
            bankAccount.VerifiedBy = verifierId;
        }

        await _context.SaveChangesAsync();

        _logger.LogInformation("Bank account {BankAccountId} verification status changed to {Status} by {VerifierId}",
            id, dto.Status, verifierId);

        return Ok(new { message = "Bank account verification status updated successfully" });
    }

    /// <summary>
    /// Delete a bank account
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> DeleteBankAccount(Guid id)
    {
        var investorId = GetCurrentInvestorId();

        var bankAccount = await _context.BankAccounts
            .FirstOrDefaultAsync(ba => ba.Id == id && ba.InvestorId == investorId);

        if (bankAccount == null)
        {
            return NotFound(new { error = "Bank account not found" });
        }

        if (bankAccount.IsPrimary)
        {
            // Check if there are other verified accounts
            var otherVerifiedAccounts = await _context.BankAccounts
                .Where(ba => ba.InvestorId == investorId &&
                            ba.Id != id &&
                            ba.Status == BankAccountStatus.Verified)
                .ToListAsync();

            if (otherVerifiedAccounts.Any())
            {
                return BadRequest(new
                {
                    error = "Cannot delete primary account. Please set another account as primary first."
                });
            }
        }

        _context.BankAccounts.Remove(bankAccount);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Bank account deleted: {BankAccountId}", id);

        return Ok(new { message = "Bank account deleted successfully" });
    }

    /// <summary>
    /// Get bank details by branch code
    /// </summary>
    [HttpGet("lookup/branch/{branchCode}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public IActionResult GetBankDetailsByBranchCode(string branchCode)
    {
        var bankDetails = _verificationService.GetBankDetails(branchCode);

        if (bankDetails == null || !bankDetails.IsValid)
        {
            return Ok(new BankDetailsDto { IsValid = false });
        }

        return Ok(bankDetails);
    }

    /// <summary>
    /// Get list of supported banks
    /// </summary>
    [HttpGet("supported-banks")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public IActionResult GetSupportedBanks()
    {
        var banks = _verificationService.GetSupportedBanks();
        return Ok(banks);
    }

    private Guid GetCurrentInvestorId()
    {
        var userIdClaim = User.FindFirst("userId")?.Value;
        return Guid.TryParse(userIdClaim, out var userId) ? userId : Guid.Empty;
    }
}

