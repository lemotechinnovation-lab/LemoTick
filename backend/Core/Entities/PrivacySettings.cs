using System.ComponentModel.DataAnnotations;

namespace InvestorManagementSystem.Core.Entities;

/// <summary>
/// Privacy settings for a user profile
/// </summary>
public class PrivacySettings
{
    public Guid Id { get; set; }

    [Required]
    public Guid UserProfileId { get; set; }

    [Required]
    public ProfileVisibility ProfileVisibility { get; set; } = ProfileVisibility.Public;

    [Required]
    public FriendsListVisibility FriendsListVisibility { get; set; } = FriendsListVisibility.Public;

    [Required]
    public FriendRequestPermission WhoCanSendFriendRequests { get; set; } = FriendRequestPermission.Everyone;

    public bool ShowOnlineStatus { get; set; } = true;

    public bool ShowTradingStats { get; set; } = true;

    public bool ShowRecentActivity { get; set; } = true;

    [Required]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    // Navigation property
    public virtual UserProfile UserProfile { get; set; } = null!;
}

/// <summary>
/// Friends list visibility settings
/// </summary>
public enum FriendsListVisibility
{
    Public = 0,
    FriendsOnly = 1,
    OnlyMe = 2
}

/// <summary>
/// Friend request permission settings
/// </summary>
public enum FriendRequestPermission
{
    Everyone = 0,
    FriendsOfFriends = 1,
    NoOne = 2
}
