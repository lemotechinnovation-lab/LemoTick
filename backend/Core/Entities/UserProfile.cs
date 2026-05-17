using System.ComponentModel.DataAnnotations;

namespace InvestorManagementSystem.Core.Entities;

/// <summary>
/// Extended user profile for social networking features
/// </summary>
public class UserProfile
{
    public Guid Id { get; set; }

    [Required]
    public Guid InvestorId { get; set; }

    [StringLength(50)]
    public string? Username { get; set; }

    [StringLength(100)]
    public string? DisplayName { get; set; }

    [StringLength(500)]
    public string? Bio { get; set; }

    [StringLength(255)]
    public string? AvatarUrl { get; set; }

    [StringLength(255)]
    public string? CoverImageUrl { get; set; }

    public TradingExperience? TradingExperience { get; set; }

    public TradingStyle? TradingStyle { get; set; }

    [StringLength(500)]
    public string? PreferredMarkets { get; set; } // Comma-separated list

    public ProfileVisibility ProfileVisibility { get; set; } = ProfileVisibility.Public;

    public bool ShowOnlineStatus { get; set; } = true;

    public bool ShowTradingStats { get; set; } = true;

    public bool ShowRecentActivity { get; set; } = true;

    public OnlineStatus OnlineStatus { get; set; } = OnlineStatus.Offline;

    public DateTime? LastSeenAt { get; set; }

    [Required]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    // Navigation properties
    public virtual Investor Investor { get; set; } = null!;
    public virtual ICollection<Friendship> FriendshipsInitiated { get; set; } = new List<Friendship>();
    public virtual ICollection<Friendship> FriendshipsReceived { get; set; } = new List<Friendship>();
    public virtual ICollection<BlockedUser> BlockedUsers { get; set; } = new List<BlockedUser>();
    public virtual ICollection<BlockedUser> BlockedByUsers { get; set; } = new List<BlockedUser>();
}

/// <summary>
/// Trading experience level
/// </summary>
public enum TradingExperience
{
    Beginner = 0,
    Intermediate = 1,
    Advanced = 2,
    Expert = 3
}

/// <summary>
/// Trading style preference
/// </summary>
public enum TradingStyle
{
    Scalper = 0,
    DayTrader = 1,
    SwingTrader = 2,
    PositionTrader = 3
}

/// <summary>
/// Profile visibility settings
/// </summary>
public enum ProfileVisibility
{
    Public = 0,
    FriendsOnly = 1,
    Private = 2
}

/// <summary>
/// Online status
/// </summary>
public enum OnlineStatus
{
    Offline = 0,
    Online = 1,
    Away = 2,
    DoNotDisturb = 3
}
