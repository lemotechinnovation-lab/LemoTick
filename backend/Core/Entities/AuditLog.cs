using System.ComponentModel.DataAnnotations;

namespace InvestorManagementSystem.Core.Entities;

/// <summary>
/// Audit log entry for tracking system changes
/// </summary>
public class AuditLog
{
    public Guid Id { get; set; }

    [Required]
    public string EntityType { get; set; } = string.Empty; // "Investor", "Trade", "Transaction", etc.

    [Required]
    public Guid EntityId { get; set; }

    [Required]
    public string Action { get; set; } = string.Empty; // "Create", "Update", "Delete"

    public Guid? UserId { get; set; } // Investor or Admin ID

    [StringLength(100)]
    public string? UserEmail { get; set; }

    [Required]
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    public string? OldValues { get; set; } // JSON string

    public string? NewValues { get; set; } // JSON string

    [StringLength(200)]
    public string? IpAddress { get; set; }

    [StringLength(500)]
    public string? UserAgent { get; set; }
}

