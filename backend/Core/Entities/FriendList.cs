using System.ComponentModel.DataAnnotations;

namespace InvestorManagementSystem.Core.Entities;

/// <summary>
/// Represents a custom friend list/group
/// </summary>
public class FriendList
{
    public Guid Id { get; set; }

    [Required]
    public Guid OwnerId { get; set; }

    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;

    [StringLength(500)]
    public string? Description { get; set; }

    [StringLength(50)]
    public string? Color { get; set; }

    [StringLength(50)]
    public string? Icon { get; set; }

    [Required]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    // Navigation properties
    public virtual UserProfile Owner { get; set; } = null!;
    public virtual ICollection<FriendListMember> Members { get; set; } = new List<FriendListMember>();
}

/// <summary>
/// Represents membership in a friend list
/// </summary>
public class FriendListMember
{
    public Guid Id { get; set; }

    [Required]
    public Guid FriendListId { get; set; }

    [Required]
    public Guid FriendId { get; set; }

    [Required]
    public DateTime AddedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual FriendList FriendList { get; set; } = null!;
    public virtual UserProfile Friend { get; set; } = null!;
}
