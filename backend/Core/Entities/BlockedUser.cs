using System.ComponentModel.DataAnnotations;

namespace InvestorManagementSystem.Core.Entities;

/// <summary>
/// Represents a blocked user relationship
/// </summary>
public class BlockedUser
{
    public Guid Id { get; set; }

    [Required]
    public Guid BlockerId { get; set; }

    [Required]
    public Guid BlockedId { get; set; }

    [StringLength(500)]
    public string? Reason { get; set; }

    [Required]
    public DateTime BlockedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual UserProfile Blocker { get; set; } = null!;
    public virtual UserProfile Blocked { get; set; } = null!;
}
