using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace InvestorManagementSystem.Application.Services;

/// <summary>
/// Email notification service interface
/// </summary>
public interface IEmailNotificationService
{
    Task SendTradeClosedNotificationAsync(string email, string tradeDetails);
    Task SendRiskAlertNotificationAsync(string email, string alertMessage);
    Task SendWelcomeEmailAsync(string email, string name);
    Task SendPasswordResetEmailAsync(string email, string resetLink);
    Task SendKYCApprovedEmailAsync(string email, string name);
    Task SendKYCRejectedEmailAsync(string email, string name, string reason);
    Task SendWithdrawalApprovedEmailAsync(string email, decimal amount);
    Task SendTwoFactorEnabledEmailAsync(string email, string name);
    Task SendCustomEmailAsync(string to, string subject, string htmlBody, string? plainTextBody = null);
}

/// <summary>
/// Email notification service implementation using SMTP (MailKit)
/// </summary>
public class EmailNotificationService : IEmailNotificationService
{
    private readonly ILogger<EmailNotificationService> _logger;
    private readonly IConfiguration _configuration;
    private readonly string _smtpHost;
    private readonly int _smtpPort;
    private readonly string _smtpUser;
    private readonly string _smtpPassword;
    private readonly string _fromEmail;
    private readonly string _fromName;
    private readonly bool _enableSsl;

    public EmailNotificationService(ILogger<EmailNotificationService> logger, IConfiguration configuration)
    {
        _logger = logger;
        _configuration = configuration;

        // Read SMTP settings from configuration
        _smtpHost = configuration["Email:SmtpHost"] ?? "smtp.gmail.com";
        _smtpPort = int.Parse(configuration["Email:SmtpPort"] ?? "587");
        _smtpUser = configuration["Email:SmtpUser"] ?? "";
        _smtpPassword = configuration["Email:SmtpPassword"] ?? "";
        _fromEmail = configuration["Email:FromEmail"] ?? "noreply@lemotick.com";
        _fromName = configuration["Email:FromName"] ?? "LemoTick";
        _enableSsl = bool.Parse(configuration["Email:EnableSsl"] ?? "true");
    }

    public async Task SendTradeClosedNotificationAsync(string email, string tradeDetails)
    {
        var subject = "Trade Closed - LemoTick";
        var htmlBody = $@"
<html>
<body style='font-family: Arial, sans-serif;'>
    <h2>Trade Closed</h2>
    <p>Your trade has been closed with the following details:</p>
    <div style='background-color: #f5f5f5; padding: 15px; border-radius: 5px;'>
        {tradeDetails}
    </div>
    <p>You can view more details in your dashboard.</p>
    <p>Best regards,<br/>The LemoTick Team</p>
</body>
</html>";

        await SendCustomEmailAsync(email, subject, htmlBody);
    }

    public async Task SendRiskAlertNotificationAsync(string email, string alertMessage)
    {
        var subject = "⚠️ Risk Alert - LemoTick";
        var htmlBody = $@"
<html>
<body style='font-family: Arial, sans-serif;'>
    <h2 style='color: #d32f2f;'>⚠️ Risk Alert</h2>
    <p>An important risk alert has been triggered for your account:</p>
    <div style='background-color: #ffebee; padding: 15px; border-radius: 5px; border-left: 4px solid #d32f2f;'>
        {alertMessage}
    </div>
    <p>Please review your positions and take appropriate action.</p>
    <p>Best regards,<br/>The LemoTick Team</p>
</body>
</html>";

        await SendCustomEmailAsync(email, subject, htmlBody);
    }

    public async Task SendWelcomeEmailAsync(string email, string name)
    {
        var subject = "Welcome to LemoTick!";
        var htmlBody = $@"
<html>
<body style='font-family: Arial, sans-serif;'>
    <h2>Welcome to LemoTick, {name}!</h2>
    <p>Thank you for joining us. We're excited to have you on board.</p>
    <p>Your account has been successfully created. You can now:</p>
    <ul>
        <li>Create and manage portfolios</li>
        <li>Track your trades in real-time</li>
        <li>Monitor performance metrics</li>
        <li>Access detailed analytics</li>
    </ul>
    <p><a href='https://lemotick.com/dashboard' style='background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;'>Go to Dashboard</a></p>
    <p>If you have any questions, feel free to contact our support team.</p>
    <p>Best regards,<br/>The LemoTick Team</p>
</body>
</html>";

        await SendCustomEmailAsync(email, subject, htmlBody);
    }

    public async Task SendPasswordResetEmailAsync(string email, string resetLink)
    {
        var subject = "Password Reset Request - LemoTick";
        var htmlBody = $@"
<html>
<body style='font-family: Arial, sans-serif;'>
    <h2>Password Reset Request</h2>
    <p>We received a request to reset your password. Click the button below to reset it:</p>
    <p><a href='{resetLink}' style='background-color: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;'>Reset Password</a></p>
    <p>This link will expire in 24 hours.</p>
    <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
    <p>Best regards,<br/>The LemoTick Team</p>
</body>
</html>";

        await SendCustomEmailAsync(email, subject, htmlBody);
    }

    public async Task SendKYCApprovedEmailAsync(string email, string name)
    {
        var subject = "✅ KYC Documents Approved - LemoTick";
        var htmlBody = $@"
<html>
<body style='font-family: Arial, sans-serif;'>
    <h2>✅ KYC Documents Approved</h2>
    <p>Dear {name},</p>
    <p>Great news! Your KYC documents have been verified and approved.</p>
    <p>Your account is now fully activated and you have access to all features.</p>
    <p><a href='https://lemotick.com/dashboard' style='background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;'>Go to Dashboard</a></p>
    <p>Best regards,<br/>The LemoTick Team</p>
</body>
</html>";

        await SendCustomEmailAsync(email, subject, htmlBody);
    }

    public async Task SendKYCRejectedEmailAsync(string email, string name, string reason)
    {
        var subject = "❌ KYC Documents Rejected - Action Required";
        var htmlBody = $@"
<html>
<body style='font-family: Arial, sans-serif;'>
    <h2>KYC Documents Rejected</h2>
    <p>Dear {name},</p>
    <p>Unfortunately, we were unable to verify your KYC documents for the following reason:</p>
    <div style='background-color: #ffebee; padding: 15px; border-radius: 5px; border-left: 4px solid #d32f2f;'>
        {reason}
    </div>
    <p>Please re-upload the required documents to complete your verification.</p>
    <p><a href='https://lemotick.com/kyc/upload' style='background-color: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;'>Upload Documents</a></p>
    <p>If you have any questions, please contact our support team.</p>
    <p>Best regards,<br/>The LemoTick Team</p>
</body>
</html>";

        await SendCustomEmailAsync(email, subject, htmlBody);
    }

    public async Task SendWithdrawalApprovedEmailAsync(string email, decimal amount)
    {
        var subject = "Withdrawal Approved - LemoTick";
        var htmlBody = $@"
<html>
<body style='font-family: Arial, sans-serif;'>
    <h2>✅ Withdrawal Approved</h2>
    <p>Your withdrawal request has been approved.</p>
    <div style='background-color: #e8f5e9; padding: 15px; border-radius: 5px;'>
        <strong>Amount:</strong> R {amount:N2}
    </div>
    <p>The funds will be transferred to your registered bank account within 2-3 business days.</p>
    <p>Best regards,<br/>The LemoTick Team</p>
</body>
</html>";

        await SendCustomEmailAsync(email, subject, htmlBody);
    }

    public async Task SendTwoFactorEnabledEmailAsync(string email, string name)
    {
        var subject = "🔒 Two-Factor Authentication Enabled - LemoTick";
        var htmlBody = $@"
<html>
<body style='font-family: Arial, sans-serif;'>
    <h2>🔒 Two-Factor Authentication Enabled</h2>
    <p>Dear {name},</p>
    <p>Two-factor authentication has been successfully enabled for your account.</p>
    <p>Your account is now more secure. You'll need to enter a verification code from your authenticator app when signing in.</p>
    <p>If you didn't enable 2FA, please contact support immediately.</p>
    <p>Best regards,<br/>The LemoTick Team</p>
</body>
</html>";

        await SendCustomEmailAsync(email, subject, htmlBody);
    }

    public async Task SendCustomEmailAsync(string to, string subject, string htmlBody, string? plainTextBody = null)
    {
        try
        {
            // Skip sending if SMTP is not configured
            if (string.IsNullOrWhiteSpace(_smtpUser) || string.IsNullOrWhiteSpace(_smtpPassword))
            {
                _logger.LogWarning("SMTP not configured. Email not sent to {Email}. Subject: {Subject}", to, subject);
                return;
            }

            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(_fromName, _fromEmail));
            message.To.Add(new MailboxAddress("", to));
            message.Subject = subject;

            var bodyBuilder = new BodyBuilder
            {
                HtmlBody = htmlBody,
                TextBody = plainTextBody ?? StripHtml(htmlBody)
            };

            message.Body = bodyBuilder.ToMessageBody();

            using var client = new SmtpClient();

            // Connect to SMTP server
            await client.ConnectAsync(_smtpHost, _smtpPort, _enableSsl ? SecureSocketOptions.StartTls : SecureSocketOptions.None);

            // Authenticate
            await client.AuthenticateAsync(_smtpUser, _smtpPassword);

            // Send email
            await client.SendAsync(message);

            // Disconnect
            await client.DisconnectAsync(true);

            _logger.LogInformation("Email sent successfully to {Email}. Subject: {Subject}", to, subject);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {Email}. Subject: {Subject}", to, subject);
            throw;
        }
    }

    /// <summary>
    /// Strip HTML tags from string (simple implementation)
    /// </summary>
    private string StripHtml(string html)
    {
        if (string.IsNullOrWhiteSpace(html))
            return string.Empty;

        // Simple HTML strip - replace with proper library if needed
        return System.Text.RegularExpressions.Regex.Replace(html, "<.*?>", string.Empty);
    }
}
