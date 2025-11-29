using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace InvestorManagementSystem.Application.Services;

/// <summary>
/// Service for verifying webhook signatures using HMAC-SHA256
/// </summary>
public class WebhookSignatureService
{
    /// <summary>
    /// Verify HMAC-SHA256 signature for webhook payload
    /// </summary>
    /// <param name="payload">The webhook payload (JSON string)</param>
    /// <param name="signature">The signature sent by the bot (hex string)</param>
    /// <param name="secret">The shared secret key</param>
    /// <returns>True if signature is valid</returns>
    public bool VerifySignature(string payload, string signature, string secret)
    {
        try
        {
            var computedSignature = ComputeSignature(payload, secret);
            return string.Equals(computedSignature, signature, StringComparison.OrdinalIgnoreCase);
        }
        catch
        {
            return false;
        }
    }

    /// <summary>
    /// Compute HMAC-SHA256 signature for a payload
    /// </summary>
    /// <param name="payload">The payload to sign</param>
    /// <param name="secret">The shared secret key</param>
    /// <returns>Hex-encoded signature</returns>
    public string ComputeSignature(string payload, string secret)
    {
        var keyBytes = Encoding.UTF8.GetBytes(secret);
        var payloadBytes = Encoding.UTF8.GetBytes(payload);

        using var hmac = new HMACSHA256(keyBytes);
        var hashBytes = hmac.ComputeHash(payloadBytes);

        return Convert.ToHexString(hashBytes).ToLowerInvariant();
    }

    /// <summary>
    /// Verify signature from object (serializes to JSON first)
    /// </summary>
    public bool VerifySignatureFromObject<T>(T obj, string signature, string secret)
    {
        var payload = JsonSerializer.Serialize(obj);
        return VerifySignature(payload, signature, secret);
    }
}

