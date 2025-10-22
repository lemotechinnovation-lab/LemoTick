using System.ComponentModel.DataAnnotations;

namespace InvestorManagementSystem.Core.Entities;

/// <summary>
/// Represents an investor in the system
/// </summary>
public class Investor
{
    public Guid Id { get; set; }
    
    [Required]
    [StringLength(100)]
    public string FirstName { get; set; } = string.Empty;
    
    [Required]
    [StringLength(100)]
    public string LastName { get; set; } = string.Empty;
    
    [Required]
    [EmailAddress]
    [StringLength(255)]
    public string Email { get; set; } = string.Empty;
    
    [StringLength(20)]
    public string? PhoneNumber { get; set; }
    
    [Required]
    public DateTime DateOfBirth { get; set; }
    
    [Required]
    [StringLength(50)]
    public string Nationality { get; set; } = string.Empty;
    
    [Required]
    [StringLength(20)]
    public string IdNumber { get; set; } = string.Empty;
    
    [Required]
    public InvestorStatus Status { get; set; } = InvestorStatus.Pending;
    
    [Required]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime? UpdatedAt { get; set; }
    
    public DateTime? LastLoginAt { get; set; }
    
    // Navigation properties
    public virtual ICollection<Portfolio> Portfolios { get; set; } = new List<Portfolio>();
    public virtual ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
    public virtual ICollection<Notification> Notifications { get; set; } = new List<Notification>();
}

/// <summary>
/// Investor status enumeration
/// </summary>
public enum InvestorStatus
{
    Pending = 0,
    Active = 1,
    Suspended = 2,
    Closed = 3,
    KYCRequired = 4,
    KYCPending = 5,
    KYCApproved = 6,
    KYCDenied = 7
}
