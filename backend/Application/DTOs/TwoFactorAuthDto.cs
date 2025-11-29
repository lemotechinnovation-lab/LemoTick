using System.ComponentModel.DataAnnotations;

namespace InvestorManagementSystem.Application.DTOs;

/// <summary>
/// DTO for enabling 2FA
/// </summary>
public class Enable2FADto
{
    public string Secret { get; set; } = string.Empty;
    public string QRCodeImage { get; set; } = string.Empty;
    public List<string> BackupCodes { get; set; } = new();
}

/// <summary>
/// DTO for verifying and confirming 2FA setup
/// </summary>
public class Verify2FASetupDto
{
    [Required]
    [StringLength(6, MinimumLength = 6)]
    public string Code { get; set; } = string.Empty;
}

/// <summary>
/// DTO for 2FA login verification
/// </summary>
public class Verify2FALoginDto
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    [StringLength(6, MinimumLength = 6)]
    public string Code { get; set; } = string.Empty;
}

/// <summary>
/// DTO for 2FA status response
/// </summary>
public class TwoFactorStatusDto
{
    public bool IsEnabled { get; set; }
    public DateTime? EnabledAt { get; set; }
}

/// <summary>
/// DTO for disabling 2FA
/// </summary>
public class Disable2FADto
{
    [Required]
    [StringLength(6, MinimumLength = 6)]
    public string Code { get; set; } = string.Empty;
}

