using System.ComponentModel.DataAnnotations;

namespace InvestorManagementSystem.Core.Entities;

/// <summary>
/// Base class for all lookup tables
/// </summary>
public abstract class LookupBase
{
    [Key]
    public int Id { get; set; }

    [Required]
    [StringLength(50)]
    public string Name { get; set; } = string.Empty;

    [StringLength(200)]
    public string? Description { get; set; }

    public bool IsActive { get; set; } = true;

    public int DisplayOrder { get; set; }
}

// ==================== INVESTOR RELATED ====================

public class InvestorStatusLookup : LookupBase { }

public class UserRoleLookup : LookupBase { }

// ==================== PORTFOLIO RELATED ====================

public class PortfolioStatusLookup : LookupBase { }

public class RiskLevelLookup : LookupBase { }

// ==================== TRADE RELATED ====================

public class TradeTypeLookup : LookupBase { }

public class TradeDirectionLookup : LookupBase { }

public class TradeStatusLookup : LookupBase { }

// ==================== TRANSACTION RELATED ====================

public class TransactionTypeLookup : LookupBase { }

public class TransactionStatusLookup : LookupBase { }

// ==================== NOTIFICATION RELATED ====================

public class NotificationTypeLookup : LookupBase { }

public class NotificationPriorityLookup : LookupBase { }

// ==================== KYC RELATED ====================

public class DocumentTypeLookup : LookupBase { }

public class DocumentStatusLookup : LookupBase { }

// ==================== COMPLIANCE RELATED ====================

public class SARStatusLookup : LookupBase { }

// ==================== FEE RELATED ====================

public class FeeTypeLookup : LookupBase { }

public class FeeStatusLookup : LookupBase { }

// ==================== WITHDRAWAL RELATED ====================

public class WithdrawalStatusLookup : LookupBase { }

// ==================== REFERRAL RELATED ====================

public class ReferralStatusLookup : LookupBase { }

public class CommissionStatusLookup : LookupBase { }

// ==================== PAYMENT RELATED ====================

public class PaymentTypeLookup : LookupBase { }

public class PaymentMethodLookup : LookupBase { }

public class PaymentStatusLookup : LookupBase { }

// ==================== BANKING RELATED ====================

public class BankAccountTypeLookup : LookupBase { }

public class BankAccountStatusLookup : LookupBase { }

// ==================== PREFERENCES RELATED ====================

public class StatementDeliveryMethodLookup : LookupBase { }

public class RiskToleranceLookup : LookupBase { }

