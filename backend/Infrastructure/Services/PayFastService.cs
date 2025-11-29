using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Security.Cryptography;
using System.Text;
using System.Web;
using InvestorManagementSystem.Core.Entities;
using InvestorManagementSystem.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace InvestorManagementSystem.Infrastructure.Services;

/// <summary>
/// Service for PayFast payment gateway integration
/// </summary>
public class PayFastService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<PayFastService> _logger;
    private readonly IConfiguration _configuration;

    private readonly string _merchantId;
    private readonly string _merchantKey;
    private readonly string _passphrase;
    private readonly string _payFastUrl;
    private readonly bool _useSandbox;

    public PayFastService(
        ApplicationDbContext context,
        ILogger<PayFastService> logger,
        IConfiguration configuration)
    {
        _context = context;
        _logger = logger;
        _configuration = configuration;

        _useSandbox = bool.Parse(_configuration["PayFast:UseSandbox"] ?? "true");
        _merchantId = _configuration["PayFast:MerchantId"] ?? "10043734";
        _merchantKey = _configuration["PayFast:MerchantKey"] ?? "odqd4pq3xsdvi";
        _passphrase = _configuration["PayFast:Passphrase"] ?? "";
        _payFastUrl = _useSandbox
            ? "https://sandbox.payfast.co.za/eng/process"
            : "https://www.payfast.co.za/eng/process";

        _logger.LogInformation("PayFastService initialized. Sandbox mode: {Sandbox}", _useSandbox);
    }

    /// <summary>
    /// Create a payment and generate PayFast payment data
    /// </summary>
    public async Task<(Payment payment, Dictionary<string, string> paymentData)> CreatePaymentAsync(
        Guid investorId,
        decimal amount,
        string description,
        string returnUrl,
        string cancelUrl,
        string notifyUrl)
    {
        var investor = await _context.Investors.FindAsync(investorId);
        if (investor == null)
            throw new InvalidOperationException("Investor not found");

        // Create payment record
        var payment = new Payment
        {
            Id = Guid.NewGuid(),
            InvestorId = investorId,
            Type = PaymentType.Deposit,
            Method = PaymentMethod.InstantEFT,
            Amount = amount,
            Currency = "ZAR",
            Status = PaymentStatus.Pending,
            CreatedAt = DateTime.UtcNow,
            PaymentGateway = "PayFast",
            Description = description,
            PayFastMerchantId = _merchantId
        };

        _context.Payments.Add(payment);
        await _context.SaveChangesAsync();

        // Build PayFast payment data
        var paymentData = new Dictionary<string, string>
        {
            { "merchant_id", _merchantId },
            { "merchant_key", _merchantKey },
            { "return_url", returnUrl },
            { "cancel_url", cancelUrl },
            { "notify_url", notifyUrl },
            { "name_first", investor.FirstName },
            { "name_last", investor.LastName },
            { "email_address", investor.Email },
            { "m_payment_id", payment.Id.ToString() },
            { "amount", amount.ToString("F2") },
            { "item_name", "LemoTick Investment Deposit" },
            { "item_description", description },
            { "custom_str1", payment.Id.ToString() }, // Store our payment ID
            { "custom_str2", investorId.ToString() }
        };

        // Add passphrase if configured
        if (!string.IsNullOrEmpty(_passphrase))
        {
            paymentData["passphrase"] = _passphrase;
        }

        // Generate signature
        var signature = GenerateSignature(paymentData);
        paymentData["signature"] = signature;

        // Remove passphrase from data sent to PayFast (only used for signature)
        if (paymentData.ContainsKey("passphrase"))
        {
            paymentData.Remove("passphrase");
        }

        // Update payment with signature
        payment.PayFastSignature = signature;
        await _context.SaveChangesAsync();

        _logger.LogInformation("Payment {PaymentId} created for investor {InvestorId}. Amount: R{Amount}",
            payment.Id, investorId, amount);

        return (payment, paymentData);
    }

    /// <summary>
    /// Validate PayFast webhook notification (ITN)
    /// </summary>
    public async Task<bool> ValidateWebhookAsync(Dictionary<string, string> postData)
    {
        try
        {
            // 1. Verify signature
            var receivedSignature = postData.GetValueOrDefault("signature", "");
            var calculatedSignature = GenerateSignature(postData);

            if (receivedSignature != calculatedSignature)
            {
                _logger.LogWarning("PayFast webhook signature mismatch. Received: {Received}, Calculated: {Calculated}",
                    receivedSignature, calculatedSignature);
                return false;
            }

            // 2. Verify payment amount
            var paymentId = postData.GetValueOrDefault("custom_str1", "");
            if (Guid.TryParse(paymentId, out var guid))
            {
                var payment = await _context.Payments.FindAsync(guid);
                if (payment == null)
                {
                    _logger.LogWarning("Payment {PaymentId} not found for webhook validation", paymentId);
                    return false;
                }

                var amountGross = decimal.Parse(postData.GetValueOrDefault("amount_gross", "0"));
                if (Math.Abs(payment.Amount - amountGross) > 0.01m)
                {
                    _logger.LogWarning("Payment amount mismatch for {PaymentId}. Expected: {Expected}, Received: {Received}",
                        paymentId, payment.Amount, amountGross);
                    return false;
                }
            }

            // 3. Verify merchant ID
            var merchantId = postData.GetValueOrDefault("merchant_id", "");
            if (merchantId != _merchantId)
            {
                _logger.LogWarning("Merchant ID mismatch. Expected: {Expected}, Received: {Received}",
                    _merchantId, merchantId);
                return false;
            }

            _logger.LogInformation("PayFast webhook validated successfully for payment {PaymentId}", paymentId);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating PayFast webhook");
            return false;
        }
    }

    /// <summary>
    /// Process PayFast webhook notification
    /// </summary>
    public async Task<bool> ProcessWebhookAsync(Dictionary<string, string> postData)
    {
        try
        {
            var paymentId = postData.GetValueOrDefault("custom_str1", "");
            var investorId = postData.GetValueOrDefault("custom_str2", "");
            var paymentStatus = postData.GetValueOrDefault("payment_status", "");
            var pfPaymentId = postData.GetValueOrDefault("pf_payment_id", "");

            if (!Guid.TryParse(paymentId, out var paymentGuid))
            {
                _logger.LogWarning("Invalid payment ID in webhook: {PaymentId}", paymentId);
                return false;
            }

            var payment = await _context.Payments.FindAsync(paymentGuid);
            if (payment == null)
            {
                _logger.LogWarning("Payment {PaymentId} not found", paymentId);
                return false;
            }

            // Update payment based on status
            payment.PayFastPaymentId = pfPaymentId;
            payment.PaymentGatewayId = pfPaymentId;

            switch (paymentStatus.ToUpper())
            {
                case "COMPLETE":
                    payment.Status = PaymentStatus.Completed;
                    payment.CompletedAt = DateTime.UtcNow;

                    // Create corresponding transaction
                    await CreateTransactionForPaymentAsync(payment);

                    _logger.LogInformation("Payment {PaymentId} completed successfully. Amount: R{Amount}",
                        payment.Id, payment.Amount);
                    break;

                case "FAILED":
                    payment.Status = PaymentStatus.Failed;
                    payment.FailureReason = "Payment failed";
                    _logger.LogWarning("Payment {PaymentId} failed", payment.Id);
                    break;

                case "CANCELLED":
                    payment.Status = PaymentStatus.Cancelled;
                    _logger.LogInformation("Payment {PaymentId} cancelled by user", payment.Id);
                    break;

                default:
                    payment.Status = PaymentStatus.Processing;
                    _logger.LogInformation("Payment {PaymentId} status: {Status}", payment.Id, paymentStatus);
                    break;
            }

            await _context.SaveChangesAsync();
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing PayFast webhook");
            return false;
        }
    }

    /// <summary>
    /// Create a transaction record for a completed payment
    /// </summary>
    private async Task CreateTransactionForPaymentAsync(Payment payment)
    {
        try
        {
            // Check if transaction already exists
            if (payment.TransactionId.HasValue)
            {
                _logger.LogInformation("Transaction already exists for payment {PaymentId}", payment.Id);
                return;
            }

            var transaction = new Transaction
            {
                Id = Guid.NewGuid(),
                InvestorId = payment.InvestorId,
                Type = TransactionType.Deposit,
                Amount = payment.Amount,
                Currency = payment.Currency,
                Status = TransactionStatus.Completed,
                Description = payment.Description ?? "Deposit via PayFast",
                CreatedAt = DateTime.UtcNow
            };

            _context.Transactions.Add(transaction);
            payment.TransactionId = transaction.Id;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Transaction {TransactionId} created for payment {PaymentId}",
                transaction.Id, payment.Id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating transaction for payment {PaymentId}", payment.Id);
        }
    }

    /// <summary>
    /// Generate MD5 signature for PayFast
    /// </summary>
    private string GenerateSignature(Dictionary<string, string> data)
    {
        // Remove signature if present
        var dataToSign = new Dictionary<string, string>(data);
        dataToSign.Remove("signature");

        // Sort parameters and create query string
        var sortedParams = dataToSign
            .OrderBy(x => x.Key)
            .Select(x => $"{x.Key}={HttpUtility.UrlEncode(x.Value)}")
            .ToList();

        var paramString = string.Join("&", sortedParams);

        // Calculate MD5 hash
        using (var md5 = MD5.Create())
        {
            var hash = md5.ComputeHash(Encoding.UTF8.GetBytes(paramString));
            return BitConverter.ToString(hash).Replace("-", "").ToLower();
        }
    }

    /// <summary>
    /// Get payment by ID
    /// </summary>
    public async Task<Payment?> GetPaymentAsync(Guid paymentId)
    {
        return await _context.Payments
            .Include(p => p.Investor)
            .Include(p => p.Transaction)
            .FirstOrDefaultAsync(p => p.Id == paymentId);
    }

    /// <summary>
    /// Get payment statistics
    /// </summary>
    public async Task<(int total, int completed, int failed, int pending, decimal totalAmount, decimal completedAmount)>
        GetPaymentStatisticsAsync(Guid? investorId = null)
    {
        var query = _context.Payments.AsQueryable();

        if (investorId.HasValue)
            query = query.Where(p => p.InvestorId == investorId.Value);

        var total = await query.CountAsync();
        var completed = await query.CountAsync(p => p.Status == PaymentStatus.Completed);
        var failed = await query.CountAsync(p => p.Status == PaymentStatus.Failed);
        var pending = await query.CountAsync(p => p.Status == PaymentStatus.Pending);
        var totalAmount = await query.SumAsync(p => (decimal?)p.Amount) ?? 0m;
        var completedAmount = await query
            .Where(p => p.Status == PaymentStatus.Completed)
            .SumAsync(p => (decimal?)p.Amount) ?? 0m;

        return (total, completed, failed, pending, totalAmount, completedAmount);
    }

    /// <summary>
    /// Get PayFast payment URL
    /// </summary>
    public string GetPayFastUrl()
    {
        return _payFastUrl;
    }
}

