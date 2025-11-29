using System.ComponentModel.DataAnnotations;
using InvestorManagementSystem.Core.Entities;

namespace InvestorManagementSystem.Application.DTOs;

/// <summary>
/// DTO for referral information
/// </summary>
public class ReferralDto
{
    public Guid Id { get; set; }
    public Guid ReferrerInvestorId { get; set; }
    public string ReferrerName { get; set; } = string.Empty;
    public string ReferrerEmail { get; set; } = string.Empty;
    public Guid ReferredInvestorId { get; set; }
    public string ReferredName { get; set; } = string.Empty;
    public string ReferredEmail { get; set; } = string.Empty;
    public string ReferralCode { get; set; } = string.Empty;
    public DateTime ReferredAt { get; set; }
    public DateTime? ConvertedAt { get; set; }
    public string Status { get; set; } = string.Empty;
    public decimal CommissionEarned { get; set; }
    public decimal CommissionRate { get; set; }
}

/// <summary>
/// DTO for creating a referral
/// </summary>
public class CreateReferralDto
{
    [Required]
    [EmailAddress]
    public string ReferredEmail { get; set; } = string.Empty;

    [Required]
    public string ReferralCode { get; set; } = string.Empty;
}

/// <summary>
/// DTO for referral summary/statistics
/// </summary>
public class ReferralSummaryDto
{
    public Guid InvestorId { get; set; }
    public string InvestorName { get; set; } = string.Empty;
    public string ReferralCode { get; set; } = string.Empty;
    public int TotalReferrals { get; set; }
    public int ActiveReferrals { get; set; }
    public int PendingReferrals { get; set; }
    public decimal TotalCommissionEarned { get; set; }
    public decimal PendingCommission { get; set; }
    public decimal PaidCommission { get; set; }
    public int LeaderboardRank { get; set; }
    public List<ReferralDto> RecentReferrals { get; set; } = new();
}

/// <summary>
/// DTO for commission information
/// </summary>
public class CommissionDto
{
    public Guid Id { get; set; }
    public Guid ReferralId { get; set; }
    public Guid ReferrerInvestorId { get; set; }
    public string ReferrerName { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = string.Empty;
    public DateTime EarnedAt { get; set; }
    public DateTime? PaidAt { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? TransactionReference { get; set; }
}

/// <summary>
/// DTO for updating commission status
/// </summary>
public class UpdateCommissionStatusDto
{
    [Required]
    public CommissionStatus Status { get; set; }

    public string? TransactionReference { get; set; }
}

/// <summary>
/// DTO for leaderboard entry
/// </summary>
public class LeaderboardEntryDto
{
    public int Rank { get; set; }
    public Guid InvestorId { get; set; }
    public string InvestorName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public int TotalReferrals { get; set; }
    public int ActiveReferrals { get; set; }
    public decimal TotalCommissionEarned { get; set; }
    public string ReferralCode { get; set; } = string.Empty;
}

/// <summary>
/// DTO for referral link generation
/// </summary>
public class ReferralLinkDto
{
    public string ReferralCode { get; set; } = string.Empty;
    public string ReferralLink { get; set; } = string.Empty;
    public string QrCodeDataUri { get; set; } = string.Empty;
}

