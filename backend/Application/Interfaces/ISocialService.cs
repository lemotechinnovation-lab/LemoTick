using InvestorManagementSystem.Application.DTOs;
using InvestorManagementSystem.Core.Entities;

namespace InvestorManagementSystem.Application.Interfaces;

public interface ISocialService
{
    // ═══════════════════════════════════════════════════════════════════════════
    // User Profile Management
    // ═══════════════════════════════════════════════════════════════════════════
    Task<UserProfileDto?> GetProfileAsync(Guid userId, Guid? viewerId = null);
    Task<UserProfileDto?> GetProfileByInvestorIdAsync(Guid investorId, Guid? viewerId = null);
    Task<UserProfileDto?> GetProfileByUsernameAsync(string username, Guid? viewerId = null);
    Task<UserProfileDto?> CreateProfileAsync(Guid investorId, CreateUserProfileDto dto);
    Task<UserProfileDto?> UpdateProfileAsync(Guid userId, UpdateUserProfileDto dto);
    Task<bool> UploadAvatarAsync(Guid userId, UploadAvatarDto dto);
    Task<bool> UploadCoverImageAsync(Guid userId, UploadCoverImageDto dto);
    Task<bool> UpdateOnlineStatusAsync(Guid investorId, OnlineStatus status);
    Task<PagedResultDto<UserSearchResultDto>> SearchUsersAsync(Guid currentUserId, UserSearchDto searchDto);

    // ═══════════════════════════════════════════════════════════════════════════
    // Friend Request Management
    // ═══════════════════════════════════════════════════════════════════════════
    Task<FriendRequestDto?> SendFriendRequestAsync(Guid requesterId, SendFriendRequestDto dto);
    Task<bool> AcceptFriendRequestAsync(Guid userId, Guid requestId);
    Task<bool> DeclineFriendRequestAsync(Guid userId, Guid requestId);
    Task<bool> CancelFriendRequestAsync(Guid userId, Guid requestId);
    Task<PagedResultDto<FriendRequestDto>> GetReceivedRequestsAsync(Guid userId, PaginationDto pagination);
    Task<PagedResultDto<FriendRequestDto>> GetSentRequestsAsync(Guid userId, PaginationDto pagination);

    // ═══════════════════════════════════════════════════════════════════════════
    // Friend Management
    // ═══════════════════════════════════════════════════════════════════════════
    Task<PagedResultDto<FriendDto>> GetFriendsAsync(Guid userId, PaginationDto pagination);
    Task<bool> UnfriendAsync(Guid userId, Guid friendId);
    Task<MutualFriendsDto> GetMutualFriendsAsync(Guid userId1, Guid userId2, PaginationDto pagination);
    Task<string> GetRelationshipStatusAsync(Guid currentUserId, Guid targetUserId);

    // ═══════════════════════════════════════════════════════════════════════════
    // Friend Suggestions
    // ═══════════════════════════════════════════════════════════════════════════
    Task<PagedResultDto<FriendSuggestionDto>> GetSuggestionsAsync(Guid userId, PaginationDto pagination);
    Task<bool> DismissSuggestionAsync(Guid userId, Guid suggestedUserId);
    Task<bool> RefreshSuggestionsAsync(Guid userId);

    // ═══════════════════════════════════════════════════════════════════════════
    // Friend List Management
    // ═══════════════════════════════════════════════════════════════════════════
    Task<PagedResultDto<FriendListDto>> GetFriendListsAsync(Guid userId, PaginationDto pagination);
    Task<FriendListDetailDto?> GetFriendListAsync(Guid userId, Guid listId);
    Task<FriendListDto?> CreateFriendListAsync(Guid userId, CreateFriendListDto dto);
    Task<FriendListDto?> UpdateFriendListAsync(Guid userId, Guid listId, UpdateFriendListDto dto);
    Task<bool> DeleteFriendListAsync(Guid userId, Guid listId);
    Task<bool> AddToFriendListAsync(Guid userId, Guid listId, Guid friendId);
    Task<bool> RemoveFromFriendListAsync(Guid userId, Guid listId, Guid friendId);

    // ═══════════════════════════════════════════════════════════════════════════
    // Block Management
    // ═══════════════════════════════════════════════════════════════════════════
    Task<PagedResultDto<BlockedUserDto>> GetBlockedUsersAsync(Guid userId, PaginationDto pagination);
    Task<bool> BlockUserAsync(Guid userId, BlockUserDto dto);
    Task<bool> UnblockUserAsync(Guid userId, Guid blockedUserId);
    Task<bool> IsBlockedAsync(Guid userId, Guid otherUserId);

    // ═══════════════════════════════════════════════════════════════════════════
    // Privacy Settings
    // ═══════════════════════════════════════════════════════════════════════════
    Task<PrivacySettingsDto?> GetPrivacySettingsAsync(Guid userId);
    Task<PrivacySettingsDto?> UpdatePrivacySettingsAsync(Guid userId, UpdatePrivacySettingsDto dto);

    // ═══════════════════════════════════════════════════════════════════════════
    // Statistics
    // ═══════════════════════════════════════════════════════════════════════════
    Task<SocialStatsDto> GetSocialStatsAsync(Guid userId);
}
