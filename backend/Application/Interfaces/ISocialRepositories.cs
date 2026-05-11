using InvestorManagementSystem.Core.Entities;

namespace InvestorManagementSystem.Application.Interfaces;

// ═══════════════════════════════════════════════════════════════════════════
// IUserProfileRepository
// ═══════════════════════════════════════════════════════════════════════════

public interface IUserProfileRepository
{
    // Basic CRUD operations
    Task<UserProfile?> GetByIdAsync(Guid id);
    Task<UserProfile?> GetByInvestorIdAsync(Guid investorId);
    Task<UserProfile?> GetByUsernameAsync(string username);
    Task<UserProfile> CreateAsync(UserProfile userProfile);
    Task<UserProfile?> UpdateAsync(UserProfile userProfile);
    Task<bool> DeleteAsync(Guid id);
    Task<bool> ExistsAsync(Guid id);
    Task<bool> UsernameExistsAsync(string username, Guid? excludeUserId = null);

    // Profile queries
    Task<IEnumerable<UserProfile>> GetAllAsync(int page = 1, int pageSize = 20);
    Task<int> GetTotalCountAsync();
    Task<IEnumerable<UserProfile>> GetOnlineUsersAsync(int page = 1, int pageSize = 20);
    Task<IEnumerable<UserProfile>> GetByOnlineStatusAsync(OnlineStatus status, int page = 1, int pageSize = 20);

    // Search
    Task<(IEnumerable<UserProfile> Users, int TotalCount)> SearchAsync(
        string? query,
        TradingExperience? tradingExperience = null,
        TradingStyle? tradingStyle = null,
        int page = 1,
        int pageSize = 20);

    // Online status management
    Task<bool> UpdateOnlineStatusAsync(Guid userId, OnlineStatus status);
    Task<bool> UpdateLastSeenAsync(Guid userId, DateTime lastSeenAt);

    // Statistics
    Task<int> GetFriendsCountAsync(Guid userId);
    Task<int> GetMutualFriendsCountAsync(Guid userId1, Guid userId2);
}

// ═══════════════════════════════════════════════════════════════════════════
// IFriendshipRepository
// ═══════════════════════════════════════════════════════════════════════════

public interface IFriendshipRepository
{
    // Basic CRUD operations
    Task<Friendship?> GetByIdAsync(Guid id);
    Task<Friendship> CreateAsync(Friendship friendship);
    Task<Friendship?> UpdateAsync(Friendship friendship);
    Task<bool> DeleteAsync(Guid id);
    Task<bool> ExistsAsync(Guid id);

    // Friend request queries
    Task<IEnumerable<Friendship>> GetReceivedRequestsAsync(Guid userId, int page = 1, int pageSize = 20);
    Task<IEnumerable<Friendship>> GetSentRequestsAsync(Guid userId, int page = 1, int pageSize = 20);
    Task<int> GetReceivedRequestsCountAsync(Guid userId);
    Task<int> GetSentRequestsCountAsync(Guid userId);
    Task<int> GetPendingReceivedRequestsCountAsync(Guid userId);

    // Friend queries
    Task<IEnumerable<Friendship>> GetFriendshipsAsync(Guid userId, int page = 1, int pageSize = 20);
    Task<IEnumerable<UserProfile>> GetFriendsAsync(Guid userId, int page = 1, int pageSize = 20);
    Task<int> GetFriendsCountAsync(Guid userId);
    Task<IEnumerable<UserProfile>> GetOnlineFriendsAsync(Guid userId);
    Task<int> GetOnlineFriendsCountAsync(Guid userId);

    // Mutual friends
    Task<IEnumerable<UserProfile>> GetMutualFriendsAsync(Guid userId1, Guid userId2, int page = 1, int pageSize = 20);
    Task<int> GetMutualFriendsCountAsync(Guid userId1, Guid userId2);

    // Relationship status
    Task<Friendship?> GetFriendshipBetweenUsersAsync(Guid userId1, Guid userId2);
    Task<string> GetRelationshipStatusAsync(Guid currentUserId, Guid targetUserId);
    Task<bool> AreFriendsAsync(Guid userId1, Guid userId2);
    Task<bool> HasPendingRequestAsync(Guid requesterId, Guid recipientId);

    // Friend request actions
    Task<Friendship?> SendFriendRequestAsync(Guid requesterId, Guid recipientId, string? message = null);
    Task<bool> AcceptFriendRequestAsync(Guid requestId);
    Task<bool> DeclineFriendRequestAsync(Guid requestId);
    Task<bool> CancelFriendRequestAsync(Guid requestId);
    Task<bool> UnfriendAsync(Guid userId1, Guid userId2);

    // Validation
    Task<bool> CanSendFriendRequestAsync(Guid requesterId, Guid recipientId);
    Task<bool> CanAcceptFriendRequestAsync(Guid requestId, Guid userId);
}

// ═══════════════════════════════════════════════════════════════════════════
// IBlockedUserRepository
// ═══════════════════════════════════════════════════════════════════════════

public interface IBlockedUserRepository
{
    // Basic CRUD operations
    Task<BlockedUser?> GetByIdAsync(Guid id);
    Task<BlockedUser> CreateAsync(BlockedUser blockedUser);
    Task<bool> DeleteAsync(Guid id);
    Task<bool> ExistsAsync(Guid id);

    // Blocked user queries
    Task<IEnumerable<BlockedUser>> GetBlockedUsersAsync(Guid blockerId, int page = 1, int pageSize = 20);
    Task<int> GetBlockedUsersCountAsync(Guid blockerId);
    Task<IEnumerable<BlockedUser>> GetBlockedByUsersAsync(Guid blockedId);

    // Block management
    Task<BlockedUser?> BlockUserAsync(Guid blockerId, Guid blockedId, string? reason = null);
    Task<bool> UnblockUserAsync(Guid blockerId, Guid blockedId);
    Task<bool> IsBlockedAsync(Guid blockerId, Guid blockedId);
    Task<bool> IsBlockedByAsync(Guid userId, Guid potentialBlockerId);
    Task<bool> HasBlockRelationshipAsync(Guid userId1, Guid userId2);

    // Get specific block
    Task<BlockedUser?> GetBlockAsync(Guid blockerId, Guid blockedId);
}

// ═══════════════════════════════════════════════════════════════════════════
// IFriendListRepository
// ═══════════════════════════════════════════════════════════════════════════

public interface IFriendListRepository
{
    // Basic CRUD operations
    Task<FriendList?> GetByIdAsync(Guid id);
    Task<FriendList> CreateAsync(FriendList friendList);
    Task<FriendList?> UpdateAsync(FriendList friendList);
    Task<bool> DeleteAsync(Guid id);
    Task<bool> ExistsAsync(Guid id);

    // Friend list queries
    Task<IEnumerable<FriendList>> GetUserListsAsync(Guid ownerId, int page = 1, int pageSize = 20);
    Task<int> GetUserListsCountAsync(Guid ownerId);
    Task<FriendList?> GetWithMembersAsync(Guid id);

    // Member management
    Task<bool> AddMemberAsync(Guid friendListId, Guid friendId);
    Task<bool> RemoveMemberAsync(Guid friendListId, Guid friendId);
    Task<bool> IsMemberAsync(Guid friendListId, Guid friendId);
    Task<IEnumerable<UserProfile>> GetMembersAsync(Guid friendListId, int page = 1, int pageSize = 20);
    Task<int> GetMemberCountAsync(Guid friendListId);

    // List membership queries
    Task<IEnumerable<FriendList>> GetListsContainingFriendAsync(Guid ownerId, Guid friendId);
    Task<bool> CanAddMemberAsync(Guid friendListId, Guid friendId);

    // Validation
    Task<bool> IsOwnerAsync(Guid friendListId, Guid userId);
}

// ═══════════════════════════════════════════════════════════════════════════
// IPrivacySettingsRepository
// ═══════════════════════════════════════════════════════════════════════════

public interface IPrivacySettingsRepository
{
    // Basic CRUD operations
    Task<PrivacySettings?> GetByIdAsync(Guid id);
    Task<PrivacySettings?> GetByUserProfileIdAsync(Guid userProfileId);
    Task<PrivacySettings> CreateAsync(PrivacySettings privacySettings);
    Task<PrivacySettings?> UpdateAsync(PrivacySettings privacySettings);
    Task<bool> DeleteAsync(Guid id);
    Task<bool> ExistsAsync(Guid id);
    Task<bool> ExistsForUserAsync(Guid userProfileId);

    // Privacy checks
    Task<bool> CanViewProfileAsync(Guid viewerId, Guid targetUserId);
    Task<bool> CanViewFriendsListAsync(Guid viewerId, Guid targetUserId);
    Task<bool> CanSendFriendRequestAsync(Guid senderId, Guid recipientId);
    Task<ProfileVisibility> GetProfileVisibilityAsync(Guid userId);
    Task<FriendsListVisibility> GetFriendsListVisibilityAsync(Guid userId);
    Task<FriendRequestPermission> GetFriendRequestPermissionAsync(Guid userId);

    // Create default settings
    Task<PrivacySettings> CreateDefaultSettingsAsync(Guid userProfileId);
}

// ═══════════════════════════════════════════════════════════════════════════
// IFriendSuggestionRepository
// ═══════════════════════════════════════════════════════════════════════════

public interface IFriendSuggestionRepository
{
    // Get suggestions
    Task<IEnumerable<UserProfile>> GetSuggestionsAsync(Guid userId, int page = 1, int pageSize = 20);
    Task<int> GetSuggestionsCountAsync(Guid userId);

    // Calculate match score
    Task<int> CalculateMatchScoreAsync(Guid userId1, Guid userId2);
    Task<List<string>> GetMatchReasonsAsync(Guid userId1, Guid userId2);

    // Dismissed suggestions (could be stored in cache or separate table)
    Task<bool> DismissSuggestionAsync(Guid userId, Guid suggestedUserId);
    Task<bool> IsDismissedAsync(Guid userId, Guid suggestedUserId);
    Task<bool> RefreshSuggestionsAsync(Guid userId);
}

// ═══════════════════════════════════════════════════════════════════════════
// ISocialStatisticsRepository
// ═══════════════════════════════════════════════════════════════════════════

public interface ISocialStatisticsRepository
{
    // User statistics
    Task<int> GetTotalFriendsAsync(Guid userId);
    Task<int> GetPendingReceivedRequestsAsync(Guid userId);
    Task<int> GetPendingSentRequestsAsync(Guid userId);
    Task<int> GetOnlineFriendsAsync(Guid userId);
    Task<int> GetBlockedUsersAsync(Guid userId);
    Task<int> GetFriendListsAsync(Guid userId);

    // Global statistics
    Task<int> GetTotalUsersAsync();
    Task<int> GetTotalFriendshipsAsync();
    Task<int> GetTotalPendingRequestsAsync();
    Task<int> GetActiveUsersAsync(TimeSpan timeSpan);

    // Activity statistics
    Task<Dictionary<DateTime, int>> GetFriendRequestsOverTimeAsync(Guid userId, DateTime startDate, DateTime endDate);
    Task<Dictionary<DateTime, int>> GetNewFriendsOverTimeAsync(Guid userId, DateTime startDate, DateTime endDate);
}
