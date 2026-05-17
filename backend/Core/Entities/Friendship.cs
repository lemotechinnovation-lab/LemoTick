using System.ComponentModel.DataAnnotations;

namespace InvestorManagementSystem.Core.Entities;

/// <summary>
/// Represents a friendship/friend request between two users
/// </summary>
public class Friendship
{
    public Guid Id { get; set; }

    [Required]
    public Guid RequesterId { get; set; }

    [Required]
    public Guid RecipientId { get; set; }

    [StringLength(500)]
    public string? Message { get; set; }

    [Required]
    public FriendshipStatus Status { get; set; } = FriendshipStatus.Pending;

    [Required]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? AcceptedAt { get; set; }

    public DateTime? DeclinedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    // Navigation properties
    public virtual UserProfile Requester { get; set; } = null!;
    public virtual UserProfile Recipient { get; set; } = null!;
}

/// <summary>
/// Friendship status enumeration
/// </summary>
public enum FriendshipStatus
{
    Pending = 0,
    Accepted = 1,
    Declined = 2,
    Blocked = 3,
    Cancelled = 4
}
