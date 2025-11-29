using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using InvestorManagementSystem.Infrastructure.Data;
using InvestorManagementSystem.Application.Services;
using InvestorManagementSystem.Application.DTOs;
using System.Security.Claims;

namespace InvestorManagementSystem.API.Controllers;

/// <summary>
/// Controller for Two-Factor Authentication operations
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TwoFactorAuthController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly TwoFactorAuthService _twoFactorService;
    private readonly ILogger<TwoFactorAuthController> _logger;

    public TwoFactorAuthController(
        ApplicationDbContext context,
        TwoFactorAuthService twoFactorService,
        ILogger<TwoFactorAuthController> logger)
    {
        _context = context;
        _twoFactorService = twoFactorService;
        _logger = logger;
    }

    /// <summary>
    /// Get 2FA status for the current user
    /// </summary>
    [HttpGet("status")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<TwoFactorStatusDto>> GetStatus()
    {
        var userEmail = User.FindFirstValue(ClaimTypes.Email);
        if (string.IsNullOrEmpty(userEmail))
            return Unauthorized();

        var investor = await _context.Investors
            .FirstOrDefaultAsync(i => i.Email == userEmail);

        if (investor == null)
            return NotFound(new { error = "Investor not found" });

        return Ok(new TwoFactorStatusDto
        {
            IsEnabled = investor.TwoFactorEnabled,
            EnabledAt = investor.TwoFactorEnabledAt
        });
    }

    /// <summary>
    /// Enable 2FA for the current user (Step 1: Generate QR code)
    /// </summary>
    [HttpPost("enable")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<Enable2FADto>> Enable2FA()
    {
        var userEmail = User.FindFirstValue(ClaimTypes.Email);
        if (string.IsNullOrEmpty(userEmail))
            return Unauthorized();

        var investor = await _context.Investors
            .FirstOrDefaultAsync(i => i.Email == userEmail);

        if (investor == null)
            return NotFound(new { error = "Investor not found" });

        if (investor.TwoFactorEnabled)
            return BadRequest(new { error = "2FA is already enabled for this account" });

        // Generate new secret
        var secret = _twoFactorService.GenerateSecret();
        var qrCodeImage = _twoFactorService.GenerateQRCodeImage(userEmail, secret);
        var backupCodes = _twoFactorService.GenerateBackupCodes();

        // Store secret temporarily (will be confirmed in next step)
        investor.TwoFactorSecret = secret;
        await _context.SaveChangesAsync();

        _logger.LogInformation("2FA setup initiated for investor {Email}", userEmail);

        return Ok(new Enable2FADto
        {
            Secret = secret,
            QRCodeImage = qrCodeImage,
            BackupCodes = backupCodes
        });
    }

    /// <summary>
    /// Verify and confirm 2FA setup (Step 2: Verify code from authenticator app)
    /// </summary>
    [HttpPost("verify-setup")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> VerifySetup([FromBody] Verify2FASetupDto dto)
    {
        var userEmail = User.FindFirstValue(ClaimTypes.Email);
        if (string.IsNullOrEmpty(userEmail))
            return Unauthorized();

        var investor = await _context.Investors
            .FirstOrDefaultAsync(i => i.Email == userEmail);

        if (investor == null)
            return NotFound(new { error = "Investor not found" });

        if (investor.TwoFactorEnabled)
            return BadRequest(new { error = "2FA is already enabled" });

        if (string.IsNullOrEmpty(investor.TwoFactorSecret))
            return BadRequest(new { error = "2FA setup not initiated. Please call /enable first" });

        // Verify the code
        if (!_twoFactorService.VerifyCode(investor.TwoFactorSecret, dto.Code))
        {
            _logger.LogWarning("Failed 2FA verification attempt for investor {Email}", userEmail);
            return BadRequest(new { error = "Invalid verification code" });
        }

        // Enable 2FA
        investor.TwoFactorEnabled = true;
        investor.TwoFactorEnabledAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        _logger.LogInformation("2FA successfully enabled for investor {Email}", userEmail);

        return Ok(new { message = "2FA has been successfully enabled" });
    }

    /// <summary>
    /// Disable 2FA for the current user
    /// </summary>
    [HttpPost("disable")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Disable2FA([FromBody] Disable2FADto dto)
    {
        var userEmail = User.FindFirstValue(ClaimTypes.Email);
        if (string.IsNullOrEmpty(userEmail))
            return Unauthorized();

        var investor = await _context.Investors
            .FirstOrDefaultAsync(i => i.Email == userEmail);

        if (investor == null)
            return NotFound(new { error = "Investor not found" });

        if (!investor.TwoFactorEnabled)
            return BadRequest(new { error = "2FA is not enabled for this account" });

        // Verify the code before disabling
        if (!_twoFactorService.VerifyCode(investor.TwoFactorSecret!, dto.Code))
        {
            _logger.LogWarning("Failed 2FA disable attempt for investor {Email}", userEmail);
            return BadRequest(new { error = "Invalid verification code" });
        }

        // Disable 2FA
        investor.TwoFactorEnabled = false;
        investor.TwoFactorSecret = null;
        investor.TwoFactorEnabledAt = null;
        await _context.SaveChangesAsync();

        _logger.LogInformation("2FA disabled for investor {Email}", userEmail);

        return Ok(new { message = "2FA has been successfully disabled" });
    }

    /// <summary>
    /// Verify 2FA code during login (called by AuthController)
    /// </summary>
    [HttpPost("verify-login")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> VerifyLoginCode([FromBody] Verify2FALoginDto dto)
    {
        var investor = await _context.Investors
            .FirstOrDefaultAsync(i => i.Email == dto.Email);

        if (investor == null)
            return BadRequest(new { error = "Invalid credentials" });

        if (!investor.TwoFactorEnabled || string.IsNullOrEmpty(investor.TwoFactorSecret))
            return BadRequest(new { error = "2FA is not enabled for this account" });

        if (!_twoFactorService.VerifyCode(investor.TwoFactorSecret, dto.Code))
        {
            _logger.LogWarning("Failed 2FA login verification for investor {Email}", dto.Email);
            return BadRequest(new { error = "Invalid verification code" });
        }

        _logger.LogInformation("Successful 2FA login verification for investor {Email}", dto.Email);
        return Ok(new { message = "2FA verification successful", isValid = true });
    }

    /// <summary>
    /// Get current TOTP code (for testing only - remove in production)
    /// </summary>
    [HttpGet("current-code")]
    [ApiExplorerSettings(IgnoreApi = true)] // Hide from Swagger in production
    public async Task<IActionResult> GetCurrentCode()
    {
        var userEmail = User.FindFirstValue(ClaimTypes.Email);
        if (string.IsNullOrEmpty(userEmail))
            return Unauthorized();

        var investor = await _context.Investors
            .FirstOrDefaultAsync(i => i.Email == userEmail);

        if (investor == null || string.IsNullOrEmpty(investor.TwoFactorSecret))
            return NotFound(new { error = "2FA not configured" });

        var code = _twoFactorService.GetCurrentCode(investor.TwoFactorSecret);

        return Ok(new { code, expiresIn = "30 seconds" });
    }
}

