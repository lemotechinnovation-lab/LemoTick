using InvestorManagementSystem.Core.Entities;

namespace InvestorManagementSystem.Application.DTOs;

// ═══════════════════════════════════════════════════════════════════════════
// User Profile DTOs
// ═══════════════════════════════════════════════════════════════════════════

public class UserProfileDto
{
    public Guid Id { get; set; }
    public Guid InvestorId { get; set; }
    public string? Username { get; set; }
    public string? DisplayName { get; set; }
    public string? Bio { get; set; }
    public string? AvatarUrl { get; set; }
    public string? CoverImageUrl { get; set; }
    public TradingExperience? TradingExperience { get; set; }
    public TradingStyle? TradingStyle { get; set; }
    public List<string>? PreferredMarkets { get; set; }
    public ProfileVisibility ProfileVisibility { get; set; }
    public bool ShowOnlineStatus { get; set; }
    public bool ShowTradingStats { get; set; }
    public bool ShowRecentActivity { get; set; }
    public OnlineStatus OnlineStatus { get; set; }
    public DateTime? LastSeenAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    // Additional computed properties
    public int FriendsCount { get; set; }
    public int MutualFriendsCount { get; set; }
    public string? RelationshipStatus { get; set; } // 'none', 'pending_sent', 'pending_received', 'friends', 'blocked'
}

public class CreateUserProfileDto
{
    public string? Username { get; set; }
    public string? DisplayName { get; set; }
    public string? Bio { get; set; }
    public TradingExperience? TradingExperience { get; set; }
    public TradingStyle? TradingStyle { get; set; }
    public List<string>? PreferredMarkets { get; set; }
}

public class UpdateUserProfileDto
{
    public string? DisplayName { get; set; }
    public string? Bio { get; set; }
    public TradingExperience? TradingExperience { get; set; }
    public TradingStyle? TradingStyle { get; set; }
    public List<string>? PreferredMarkets { get; set; }
}

public class UploadAvatarDto
{
    public string AvatarUrl { get; set; } = string.Empty;
}

public class UploadCoverImageDto
{
    public string CoverImageUrl { get; set; } = string.Empty;
}

public class UpdateOnlineStatusDto
{
    public OnlineStatus Status { get; set; }
}

public class RelationshipStatusDto
{
    public Guid UserId { get; set; }
    public string Status { get; set; } = "none";
}

public class IsBlockedDto
{
    public Guid UserId { get; set; }
    public bool IsBlocked { get; set; }
}

// ═══════════════════════════════════════════════════════════════════════════
// Friendship DTOs
// ═══════════════════════════════════════════════════════════════════════════

public class FriendshipDto
{
    public Guid Id { get; set; }
    public Guid RequesterId { get; set; }
    public Guid RecipientId { get; set; }
    public string? Message { get; set; }
    public FriendshipStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? AcceptedAt { get; set; }
    public DateTime? DeclinedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class FriendRequestDto
{
    public Guid Id { get; set; }
    public Guid RequesterId { get; set; }
    public string RequesterUsername { get; set; } = string.Empty;
    public string RequesterDisplayName { get; set; } = string.Empty;
    public string? RequesterAvatarUrl { get; set; }
    public OnlineStatus RequesterOnlineStatus { get; set; }
    public Guid RecipientId { get; set; }
    public string RecipientUsername { get; set; } = string.Empty;
    public string RecipientDisplayName { get; set; } = string.Empty;
    public string? RecipientAvatarUrl { get; set; }
    public string? Message { get; set; }
    public FriendshipStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public int MutualFriendsCount { get; set; }
}

public class SendFriendRequestDto
{
    public Guid RecipientId { get; set; }
    public string? Message { get; set; }
}

public class AcceptFriendRequestDto
{
    public Guid RequestId { get; set; }
}

public class DeclineFriendRequestDto
{
    public Guid RequestId { get; set; }
}

public class CancelFriendRequestDto
{
    public Guid RequestId { get; set; }
}

// ═══════════════════════════════════════════════════════════════════════════
// Friend DTOs
// ═══════════════════════════════════════════════════════════════════════════

public class FriendDto
{
    public Guid FriendshipId { get; set; }
    public Guid UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string? Bio { get; set; }
    public string? AvatarUrl { get; set; }
    public OnlineStatus OnlineStatus { get; set; }
    public DateTime? LastSeenAt { get; set; }
    public TradingExperience? TradingExperience { get; set; }
    public TradingStyle? TradingStyle { get; set; }
    public DateTime FriendsSince { get; set; }
    public int MutualFriendsCount { get; set; }
}

public class UnfriendDto
{
    public Guid FriendId { get; set; }
}

public class MutualFriendsDto
{
    public Guid UserId { get; set; }
    public List<FriendDto> MutualFriends { get; set; } = new();
    public int TotalCount { get; set; }
}

// ═══════════════════════════════════════════════════════════════════════════
// Friend Suggestion DTOs
// ═══════════════════════════════════════════════════════════════════════════

public class FriendSuggestionDto
{
    public Guid UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string? Bio { get; set; }
    public string? AvatarUrl { get; set; }
    public TradingExperience? TradingExperience { get; set; }
    public TradingStyle? TradingStyle { get; set; }
    public List<string>? PreferredMarkets { get; set; }
    public int MutualFriendsCount { get; set; }
    public int MatchScore { get; set; } // 0-100
    public List<string> MatchReasons { get; set; } = new();
}

public class DismissSuggestionDto
{
    public Guid UserId { get; set; }
}

// ═══════════════════════════════════════════════════════════════════════════
// Friend List DTOs
// ═══════════════════════════════════════════════════════════════════════════

public class FriendListDto
{
    public Guid Id { get; set; }
    public Guid OwnerId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Color { get; set; }
    public string? Icon { get; set; }
    public int MemberCount { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class FriendListDetailDto
{
    public Guid Id { get; set; }
    public Guid OwnerId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Color { get; set; }
    public string? Icon { get; set; }
    public List<FriendDto> Members { get; set; } = new();
    public int MemberCount { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class CreateFriendListDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Color { get; set; }
    public string? Icon { get; set; }
}

public class UpdateFriendListDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Color { get; set; }
    public string? Icon { get; set; }
}

public class AddToFriendListDto
{
    public Guid FriendListId { get; set; }
    public Guid FriendId { get; set; }
}

public class RemoveFromFriendListDto
{
    public Guid FriendListId { get; set; }
    public Guid FriendId { get; set; }
}

// ═══════════════════════════════════════════════════════════════════════════
// Blocked User DTOs
// ═══════════════════════════════════════════════════════════════════════════

public class BlockedUserDto
{
    public Guid Id { get; set; }
    public Guid BlockedUserId { get; set; }
    public string BlockedUsername { get; set; } = string.Empty;
    public string BlockedDisplayName { get; set; } = string.Empty;
    public string? BlockedAvatarUrl { get; set; }
    public string? Reason { get; set; }
    public DateTime BlockedAt { get; set; }
}

public class BlockUserDto
{
    public Guid UserId { get; set; }
    public string? Reason { get; set; }
}

public class UnblockUserDto
{
    public Guid UserId { get; set; }
}

// ═══════════════════════════════════════════════════════════════════════════
// Privacy Settings DTOs
// ═══════════════════════════════════════════════════════════════════════════

public class PrivacySettingsDto
{
    public Guid Id { get; set; }
    public Guid UserProfileId { get; set; }
    public ProfileVisibility ProfileVisibility { get; set; }
    public FriendsListVisibility FriendsListVisibility { get; set; }
    public FriendRequestPermission WhoCanSendFriendRequests { get; set; }
    public bool ShowOnlineStatus { get; set; }
    public bool ShowTradingStats { get; set; }
    public bool ShowRecentActivity { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class UpdatePrivacySettingsDto
{
    public ProfileVisibility? ProfileVisibility { get; set; }
    public FriendsListVisibility? FriendsListVisibility { get; set; }
    public FriendRequestPermission? WhoCanSendFriendRequests { get; set; }
    public bool? ShowOnlineStatus { get; set; }
    public bool? ShowTradingStats { get; set; }
    public bool? ShowRecentActivity { get; set; }
}

// ═══════════════════════════════════════════════════════════════════════════
// Search DTOs
// ═══════════════════════════════════════════════════════════════════════════

public class UserSearchDto
{
    public string? Query { get; set; }
    public TradingExperience? TradingExperience { get; set; }
    public TradingStyle? TradingStyle { get; set; }
    public int? MinWinRate { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

public class UserSearchResultDto
{
    public Guid UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string? Bio { get; set; }
    public string? AvatarUrl { get; set; }
    public TradingExperience? TradingExperience { get; set; }
    public TradingStyle? TradingStyle { get; set; }
    public OnlineStatus OnlineStatus { get; set; }
    public int FriendsCount { get; set; }
    public int MutualFriendsCount { get; set; }
    public string RelationshipStatus { get; set; } = "none"; // 'none', 'pending_sent', 'pending_received', 'friends', 'blocked'
}

// ═══════════════════════════════════════════════════════════════════════════
// Pagination DTOs
// ═══════════════════════════════════════════════════════════════════════════

public class PagedResultDto<T>
{
    public List<T> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
    public bool HasPreviousPage => Page > 1;
    public bool HasNextPage => Page < TotalPages;
}

public class PaginationDto
{
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

// ═══════════════════════════════════════════════════════════════════════════
// Statistics DTOs
// ═══════════════════════════════════════════════════════════════════════════

public class SocialStatsDto
{
    public int TotalFriends { get; set; }
    public int PendingReceivedRequests { get; set; }
    public int PendingSentRequests { get; set; }
    public int OnlineFriends { get; set; }
    public int BlockedUsers { get; set; }
    public int FriendLists { get; set; }
}

// ═══════════════════════════════════════════════════════════════════════════
// Real-time Event DTOs (for SignalR)
// ═══════════════════════════════════════════════════════════════════════════

public class FriendRequestReceivedEventDto
{
    public Guid RequestId { get; set; }
    public Guid RequesterId { get; set; }
    public string RequesterUsername { get; set; } = string.Empty;
    public string RequesterDisplayName { get; set; } = string.Empty;
    public string? RequesterAvatarUrl { get; set; }
    public string? Message { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class FriendRequestAcceptedEventDto
{
    public Guid FriendshipId { get; set; }
    public Guid UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public DateTime AcceptedAt { get; set; }
}

public class FriendRequestDeclinedEventDto
{
    public Guid RequestId { get; set; }
    public Guid UserId { get; set; }
    public DateTime DeclinedAt { get; set; }
}

public class FriendRemovedEventDto
{
    public Guid FriendshipId { get; set; }
    public Guid UserId { get; set; }
    public DateTime RemovedAt { get; set; }
}

public class UserOnlineStatusChangedEventDto
{
    public Guid UserId { get; set; }
    public OnlineStatus OnlineStatus { get; set; }
    public DateTime? LastSeenAt { get; set; }
}

public class ProfileUpdatedEventDto
{
    public Guid UserId { get; set; }
    public string? DisplayName { get; set; }
    public string? AvatarUrl { get; set; }
    public DateTime UpdatedAt { get; set; }
}
