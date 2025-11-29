using OtpNet;
using QRCoder;
using System.Security.Cryptography;

namespace InvestorManagementSystem.Application.Services;

/// <summary>
/// Service for handling Two-Factor Authentication (2FA) operations
/// </summary>
public class TwoFactorAuthService
{
    /// <summary>
    /// Generate a new secret key for TOTP
    /// </summary>
    public string GenerateSecret()
    {
        var key = KeyGeneration.GenerateRandomKey(20); // 160-bit key
        return Base32Encoding.ToString(key);
    }

    /// <summary>
    /// Generate a QR code for authenticator app setup
    /// </summary>
    /// <param name="email">User's email</param>
    /// <param name="secret">TOTP secret</param>
    /// <param name="issuer">Application name</param>
    /// <returns>Base64-encoded PNG image of QR code</returns>
    public string GenerateQRCodeImage(string email, string secret, string issuer = "LemoTick")
    {
        var qrCodeUrl = $"otpauth://totp/{issuer}:{email}?secret={secret}&issuer={issuer}";

        using var qrGenerator = new QRCodeGenerator();
        using var qrCodeData = qrGenerator.CreateQrCode(qrCodeUrl, QRCodeGenerator.ECCLevel.Q);
        using var qrCode = new PngByteQRCode(qrCodeData);
        var qrCodeImage = qrCode.GetGraphic(20);

        return Convert.ToBase64String(qrCodeImage);
    }

    /// <summary>
    /// Verify a TOTP code
    /// </summary>
    /// <param name="secret">User's TOTP secret</param>
    /// <param name="code">6-digit code to verify</param>
    /// <param name="window">Time window for validation (default: 1 = ±30 seconds)</param>
    /// <returns>True if code is valid</returns>
    public bool VerifyCode(string secret, string code, int window = 1)
    {
        if (string.IsNullOrWhiteSpace(secret) || string.IsNullOrWhiteSpace(code))
            return false;

        try
        {
            var secretBytes = Base32Encoding.ToBytes(secret);
            var totp = new Totp(secretBytes);

            // Verify with time window (allows for slight time differences)
            var currentTime = DateTime.UtcNow;

            for (int i = -window; i <= window; i++)
            {
                var timeStep = currentTime.AddSeconds(i * 30);
                var expectedCode = totp.ComputeTotp(timeStep);

                if (expectedCode == code)
                    return true;
            }

            return false;
        }
        catch
        {
            return false;
        }
    }

    /// <summary>
    /// Generate backup codes for account recovery
    /// </summary>
    /// <param name="count">Number of backup codes to generate</param>
    /// <returns>List of backup codes</returns>
    public List<string> GenerateBackupCodes(int count = 10)
    {
        var codes = new List<string>();

        for (int i = 0; i < count; i++)
        {
            // Generate 8-character alphanumeric code
            var bytes = new byte[6];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(bytes);
            }

            var code = Convert.ToBase64String(bytes)
                .Replace("+", "")
                .Replace("/", "")
                .Replace("=", "")
                .Substring(0, 8)
                .ToUpper();

            codes.Add($"{code.Substring(0, 4)}-{code.Substring(4, 4)}");
        }

        return codes;
    }

    /// <summary>
    /// Get the current TOTP code for a secret (useful for testing)
    /// </summary>
    public string GetCurrentCode(string secret)
    {
        var secretBytes = Base32Encoding.ToBytes(secret);
        var totp = new Totp(secretBytes);
        return totp.ComputeTotp();
    }
}

