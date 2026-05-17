using AutoMapper;
using Microsoft.Extensions.Logging;
using InvestorManagementSystem.Application.DTOs;
using InvestorManagementSystem.Application.Interfaces;
using InvestorManagementSystem.Core.Entities;

namespace InvestorManagementSystem.Application.Services;

public class SocialService : ISocialService
{
    private readonly IUserProfileRepository _userProfileRepo;
    private readonly IFriendshipRepository _friendshipRepo;
    private readonly IBlockedUserRepository _blockedUserRepo;
    private readonly IFriendListRepository _friendListRepo;
    private readonly IPrivacySettingsRepository _privacySettingsRepo;
    private readonly IFriendSuggestionRepository _suggestionRepo;
    private readonly ISocialStatisticsRepository _statsRepo;
    private readonly IMapper _mapper;
    private readonly ILogger<SocialService> _logger;

    public SocialService(
        IUserProfileRepository userProfileRepo,
        IFriendshipRepository friendshipRepo,
        IBlockedUserRepository blockedUserRepo,
        IFriendListRepository friendListRepo,
        IPrivacySettingsRepository privacySettingsRepo,
        IFriendSuggestionRepository suggestionRepo,
        ISocialStatisticsRepository statsRepo,
        IMapper mapper,
        ILogger<SocialService> logger)
    {
        _userProfileRepo = userProfileRepo;
        _friendshipRepo = friendshipRepo;
        _blockedUserRepo = blockedUserRepo;
        _friendListRepo = friendListRepo;
        _privacySettingsRepo = privacySettingsRepo;
        _suggestionRepo = suggestionRepo;
        _statsRepo = statsRepo;
        _mapper = mapper;
        _logger = logger;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // User Profile Management
    // ═══════════════════════════════════════════════════════════════════════════

    public async Task<UserProfileDto?> GetProfileAsync(Guid userId, Guid? viewerId = null)
    {
        try
        {
            var profile = await _userProfileRepo.GetByIdAsync(userId);

            // Auto-create profile if it doesn't exist
            if (profile == null)
            {
                _logger.LogInformation("Profile not found for user {UserId}, creating default profile", userId);
                profile = await CreateDefaultProfileAsync(userId);
                if (profile == null)
                {
                    _logger.LogError("Failed to create default profile for user {UserId}", userId);
                    return null;
                }
            }

            // Check privacy if viewer is specified
            if (viewerId.HasValue && viewerId.Value != userId)
            {
                var canView = await _privacySettingsRepo.CanViewProfileAsync(viewerId.Value, userId);
                if (!canView)
                    return null;
            }

            var dto = _mapper.Map<UserProfileDto>(profile);

            // Add computed properties
            dto.FriendsCount = await _friendshipRepo.GetFriendsCountAsync(userId);

            if (viewerId.HasValue)
            {
                dto.MutualFriendsCount = await _userProfileRepo.GetMutualFriendsCountAsync(viewerId.Value, userId);
                dto.RelationshipStatus = await _friendshipRepo.GetRelationshipStatusAsync(viewerId.Value, userId);
            }

            return dto;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting profile for user {UserId}", userId);
            return null;
        }
    }

    public async Task<UserProfileDto?> GetProfileByInvestorIdAsync(Guid investorId, Guid? viewerId = null)
    {
        try
        {
            var profile = await _userProfileRepo.GetByInvestorIdAsync(investorId);

            if (profile == null)
            {
                _logger.LogInformation("Profile not found for investor {InvestorId}", investorId);
                return null;
            }

            // Check privacy if viewer is specified
            if (viewerId.HasValue && viewerId.Value != profile.Id)
            {
                var canView = await _privacySettingsRepo.CanViewProfileAsync(viewerId.Value, profile.Id);
                if (!canView)
                    return null;
            }

            var dto = _mapper.Map<UserProfileDto>(profile);

            // Add computed properties
            dto.FriendsCount = await _friendshipRepo.GetFriendsCountAsync(profile.Id);

            if (viewerId.HasValue)
            {
                dto.MutualFriendsCount = await _userProfileRepo.GetMutualFriendsCountAsync(viewerId.Value, profile.Id);
                dto.RelationshipStatus = await _friendshipRepo.GetRelationshipStatusAsync(viewerId.Value, profile.Id);
            }

            return dto;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting profile for investor {InvestorId}", investorId);
            return null;
        }
    }

    private async Task<UserProfile?> CreateDefaultProfileAsync(Guid userId)
    {
        try
        {
            var profile = new UserProfile
            {
                Id = Guid.NewGuid(),
                InvestorId = userId,
                Username = $"user_{userId.ToString().Substring(0, 8)}",
                DisplayName = "New User",
                Bio = null,
                AvatarUrl = null,
                CoverImageUrl = null,
                TradingExperience = Core.Entities.TradingExperience.Beginner,
                TradingStyle = null,
                PreferredMarkets = null,
                ProfileVisibility = ProfileVisibility.Public,
                ShowOnlineStatus = true,
                ShowTradingStats = true,
                ShowRecentActivity = true,
                OnlineStatus = Core.Entities.OnlineStatus.Offline,
                LastSeenAt = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _userProfileRepo.CreateAsync(profile);

            // Also create default privacy settings
            var privacySettings = new PrivacySettings
            {
                Id = Guid.NewGuid(),
                UserProfileId = profile.Id,
                ProfileVisibility = ProfileVisibility.Public,
                FriendsListVisibility = FriendsListVisibility.FriendsOnly,
                WhoCanSendFriendRequests = FriendRequestPermission.Everyone,
                ShowOnlineStatus = true,
                ShowTradingStats = true,
                ShowRecentActivity = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _privacySettingsRepo.CreateAsync(privacySettings);

            return profile;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating default profile for user {UserId}", userId);
            return null;
        }
    }

    public async Task<UserProfileDto?> GetProfileByUsernameAsync(string username, Guid? viewerId = null)
    {
        try
        {
            var profile = await _userProfileRepo.GetByUsernameAsync(username);
            if (profile == null)
                return null;

            return await GetProfileAsync(profile.Id, viewerId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting profile by username {Username}", username);
            return null;
        }
    }

    public async Task<UserProfileDto?> CreateProfileAsync(Guid investorId, CreateUserProfileDto dto)
    {
        try
        {
            // Check if profile already exists
            var existing = await _userProfileRepo.GetByInvestorIdAsync(investorId);
            if (existing != null)
            {
                _logger.LogWarning("Profile already exists for investor {InvestorId}", investorId);
                return null;
            }

            // Check username availability
            if (!string.IsNullOrEmpty(dto.Username))
            {
                var usernameExists = await _userProfileRepo.UsernameExistsAsync(dto.Username);
                if (usernameExists)
                {
                    _logger.LogWarning("Username {Username} already exists", dto.Username);
                    return null;
                }
            }

            var profile = _mapper.Map<UserProfile>(dto);
            profile.Id = Guid.NewGuid();
            profile.InvestorId = investorId;

            var created = await _userProfileRepo.CreateAsync(profile);

            // Create default privacy settings
            await _privacySettingsRepo.CreateDefaultSettingsAsync(created.Id);

            return _mapper.Map<UserProfileDto>(created);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating profile for investor {InvestorId}", investorId);
            return null;
        }
    }

    public async Task<UserProfileDto?> UpdateProfileAsync(Guid userId, UpdateUserProfileDto dto)
    {
        try
        {
            var profile = await _userProfileRepo.GetByIdAsync(userId);
            if (profile == null)
                return null;

            _mapper.Map(dto, profile);
            var updated = await _userProfileRepo.UpdateAsync(profile);

            return updated != null ? _mapper.Map<UserProfileDto>(updated) : null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating profile for user {UserId}", userId);
            return null;
        }
    }

    public async Task<bool> UploadAvatarAsync(Guid userId, UploadAvatarDto dto)
    {
        try
        {
            var profile = await _userProfileRepo.GetByIdAsync(userId);
            if (profile == null)
                return false;

            profile.AvatarUrl = dto.AvatarUrl;
            profile.UpdatedAt = DateTime.UtcNow;

            await _userProfileRepo.UpdateAsync(profile);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading avatar for user {UserId}", userId);
            return false;
        }
    }

    public async Task<bool> UploadCoverImageAsync(Guid userId, UploadCoverImageDto dto)
    {
        try
        {
            var profile = await _userProfileRepo.GetByIdAsync(userId);
            if (profile == null)
                return false;

            profile.CoverImageUrl = dto.CoverImageUrl;
            profile.UpdatedAt = DateTime.UtcNow;

            await _userProfileRepo.UpdateAsync(profile);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading cover image for user {UserId}", userId);
            return false;
        }
    }

    public async Task<bool> UpdateOnlineStatusAsync(Guid investorId, OnlineStatus status)
    {
        try
        {
            // Get profile by investor ID
            var profile = await _userProfileRepo.GetByInvestorIdAsync(investorId);
            if (profile == null)
            {
                _logger.LogWarning("Profile not found for investor {InvestorId}", investorId);
                return false;
            }

            return await _userProfileRepo.UpdateOnlineStatusAsync(profile.Id, status);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating online status for investor {InvestorId}", investorId);
            return false;
        }
    }

    public async Task<PagedResultDto<UserSearchResultDto>> SearchUsersAsync(Guid currentUserId, UserSearchDto searchDto)
    {
        try
        {
            var (users, totalCount) = await _userProfileRepo.SearchAsync(
                searchDto.Query,
                searchDto.TradingExperience,
                searchDto.TradingStyle,
                searchDto.Page,
                searchDto.PageSize);

            var results = new List<UserSearchResultDto>();

            foreach (var user in users)
            {
                var dto = _mapper.Map<UserSearchResultDto>(user);
                dto.FriendsCount = await _friendshipRepo.GetFriendsCountAsync(user.Id);
                dto.MutualFriendsCount = await _userProfileRepo.GetMutualFriendsCountAsync(currentUserId, user.Id);
                dto.RelationshipStatus = await _friendshipRepo.GetRelationshipStatusAsync(currentUserId, user.Id);
                results.Add(dto);
            }

            return new PagedResultDto<UserSearchResultDto>
            {
                Items = results,
                TotalCount = totalCount,
                Page = searchDto.Page,
                PageSize = searchDto.PageSize
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching users");
            return new PagedResultDto<UserSearchResultDto>();
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Friend Request Management
    // ═══════════════════════════════════════════════════════════════════════════

    public async Task<FriendRequestDto?> SendFriendRequestAsync(Guid requesterId, SendFriendRequestDto dto)
    {
        try
        {
            // Check privacy settings
            var canSend = await _privacySettingsRepo.CanSendFriendRequestAsync(requesterId, dto.RecipientId);
            if (!canSend)
            {
                _logger.LogWarning("User {RequesterId} cannot send friend request to {RecipientId} due to privacy settings",
                    requesterId, dto.RecipientId);
                return null;
            }

            var friendship = await _friendshipRepo.SendFriendRequestAsync(requesterId, dto.RecipientId, dto.Message);
            if (friendship == null)
                return null;

            var friendRequestDto = _mapper.Map<FriendRequestDto>(friendship);
            friendRequestDto.MutualFriendsCount = await _userProfileRepo.GetMutualFriendsCountAsync(requesterId, dto.RecipientId);

            return friendRequestDto;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending friend request from {RequesterId} to {RecipientId}",
                requesterId, dto.RecipientId);
            return null;
        }
    }

    public async Task<bool> AcceptFriendRequestAsync(Guid userId, Guid requestId)
    {
        try
        {
            if (!await _friendshipRepo.CanAcceptFriendRequestAsync(requestId, userId))
                return false;

            return await _friendshipRepo.AcceptFriendRequestAsync(requestId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error accepting friend request {RequestId} by user {UserId}", requestId, userId);
            return false;
        }
    }

    public async Task<bool> DeclineFriendRequestAsync(Guid userId, Guid requestId)
    {
        try
        {
            if (!await _friendshipRepo.CanAcceptFriendRequestAsync(requestId, userId))
                return false;

            return await _friendshipRepo.DeclineFriendRequestAsync(requestId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error declining friend request {RequestId} by user {UserId}", requestId, userId);
            return false;
        }
    }

    public async Task<bool> CancelFriendRequestAsync(Guid userId, Guid requestId)
    {
        try
        {
            var friendship = await _friendshipRepo.GetByIdAsync(requestId);
            if (friendship == null || friendship.RequesterId != userId)
                return false;

            return await _friendshipRepo.CancelFriendRequestAsync(requestId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error canceling friend request {RequestId} by user {UserId}", requestId, userId);
            return false;
        }
    }

    public async Task<PagedResultDto<FriendRequestDto>> GetReceivedRequestsAsync(Guid userId, PaginationDto pagination)
    {
        try
        {
            var requests = await _friendshipRepo.GetReceivedRequestsAsync(userId, pagination.Page, pagination.PageSize);
            var totalCount = await _friendshipRepo.GetReceivedRequestsCountAsync(userId);

            var dtos = new List<FriendRequestDto>();
            foreach (var request in requests)
            {
                var dto = _mapper.Map<FriendRequestDto>(request);
                dto.MutualFriendsCount = await _userProfileRepo.GetMutualFriendsCountAsync(userId, request.RequesterId);
                dtos.Add(dto);
            }

            return new PagedResultDto<FriendRequestDto>
            {
                Items = dtos,
                TotalCount = totalCount,
                Page = pagination.Page,
                PageSize = pagination.PageSize
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting received requests for user {UserId}", userId);
            return new PagedResultDto<FriendRequestDto>();
        }
    }

    public async Task<PagedResultDto<FriendRequestDto>> GetSentRequestsAsync(Guid userId, PaginationDto pagination)
    {
        try
        {
            var requests = await _friendshipRepo.GetSentRequestsAsync(userId, pagination.Page, pagination.PageSize);
            var totalCount = await _friendshipRepo.GetSentRequestsCountAsync(userId);

            var dtos = new List<FriendRequestDto>();
            foreach (var request in requests)
            {
                var dto = _mapper.Map<FriendRequestDto>(request);
                dto.MutualFriendsCount = await _userProfileRepo.GetMutualFriendsCountAsync(userId, request.RecipientId);
                dtos.Add(dto);
            }

            return new PagedResultDto<FriendRequestDto>
            {
                Items = dtos,
                TotalCount = totalCount,
                Page = pagination.Page,
                PageSize = pagination.PageSize
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting sent requests for user {UserId}", userId);
            return new PagedResultDto<FriendRequestDto>();
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Friend Management
    // ═══════════════════════════════════════════════════════════════════════════

    public async Task<PagedResultDto<FriendDto>> GetFriendsAsync(Guid userId, PaginationDto pagination)
    {
        try
        {
            var friendships = await _friendshipRepo.GetFriendshipsAsync(userId, pagination.Page, pagination.PageSize);
            var totalCount = await _friendshipRepo.GetFriendsCountAsync(userId);

            var dtos = new List<FriendDto>();
            foreach (var friendship in friendships)
            {
                var friend = friendship.RequesterId == userId ? friendship.Recipient : friendship.Requester;
                var dto = _mapper.Map<FriendDto>(friend);
                dto.FriendshipId = friendship.Id;
                dto.FriendsSince = friendship.AcceptedAt ?? friendship.CreatedAt;
                dto.MutualFriendsCount = await _userProfileRepo.GetMutualFriendsCountAsync(userId, friend.Id);
                dtos.Add(dto);
            }

            return new PagedResultDto<FriendDto>
            {
                Items = dtos,
                TotalCount = totalCount,
                Page = pagination.Page,
                PageSize = pagination.PageSize
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting friends for user {UserId}", userId);
            return new PagedResultDto<FriendDto>();
        }
    }

    public async Task<bool> UnfriendAsync(Guid userId, Guid friendId)
    {
        try
        {
            return await _friendshipRepo.UnfriendAsync(userId, friendId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error unfriending {FriendId} by user {UserId}", friendId, userId);
            return false;
        }
    }

    public async Task<MutualFriendsDto> GetMutualFriendsAsync(Guid userId1, Guid userId2, PaginationDto pagination)
    {
        try
        {
            var mutualFriends = await _friendshipRepo.GetMutualFriendsAsync(userId1, userId2, pagination.Page, pagination.PageSize);
            var totalCount = await _friendshipRepo.GetMutualFriendsCountAsync(userId1, userId2);

            var dtos = mutualFriends.Select(f => _mapper.Map<FriendDto>(f)).ToList();

            return new MutualFriendsDto
            {
                UserId = userId2,
                MutualFriends = dtos,
                TotalCount = totalCount
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting mutual friends between {UserId1} and {UserId2}", userId1, userId2);
            return new MutualFriendsDto { UserId = userId2, MutualFriends = new List<FriendDto>(), TotalCount = 0 };
        }
    }

    public async Task<string> GetRelationshipStatusAsync(Guid currentUserId, Guid targetUserId)
    {
        try
        {
            return await _friendshipRepo.GetRelationshipStatusAsync(currentUserId, targetUserId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting relationship status between {CurrentUserId} and {TargetUserId}",
                currentUserId, targetUserId);
            return "none";
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Friend Suggestions
    // ═══════════════════════════════════════════════════════════════════════════

    public async Task<PagedResultDto<FriendSuggestionDto>> GetSuggestionsAsync(Guid userId, PaginationDto pagination)
    {
        try
        {
            var suggestions = await _suggestionRepo.GetSuggestionsAsync(userId, pagination.Page, pagination.PageSize);
            var totalCount = await _suggestionRepo.GetSuggestionsCountAsync(userId);

            var dtos = new List<FriendSuggestionDto>();
            foreach (var suggestion in suggestions)
            {
                var dto = _mapper.Map<FriendSuggestionDto>(suggestion);
                dto.MutualFriendsCount = await _userProfileRepo.GetMutualFriendsCountAsync(userId, suggestion.Id);
                dto.MatchScore = await _suggestionRepo.CalculateMatchScoreAsync(userId, suggestion.Id);
                dto.MatchReasons = await _suggestionRepo.GetMatchReasonsAsync(userId, suggestion.Id);
                dtos.Add(dto);
            }

            return new PagedResultDto<FriendSuggestionDto>
            {
                Items = dtos,
                TotalCount = totalCount,
                Page = pagination.Page,
                PageSize = pagination.PageSize
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting suggestions for user {UserId}", userId);
            return new PagedResultDto<FriendSuggestionDto>();
        }
    }

    public async Task<bool> DismissSuggestionAsync(Guid userId, Guid suggestedUserId)
    {
        try
        {
            return await _suggestionRepo.DismissSuggestionAsync(userId, suggestedUserId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error dismissing suggestion {SuggestedUserId} for user {UserId}",
                suggestedUserId, userId);
            return false;
        }
    }

    public async Task<bool> RefreshSuggestionsAsync(Guid userId)
    {
        try
        {
            return await _suggestionRepo.RefreshSuggestionsAsync(userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error refreshing suggestions for user {UserId}", userId);
            return false;
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Friend List Management
    // ═══════════════════════════════════════════════════════════════════════════

    public async Task<PagedResultDto<FriendListDto>> GetFriendListsAsync(Guid userId, PaginationDto pagination)
    {
        try
        {
            var lists = await _friendListRepo.GetUserListsAsync(userId, pagination.Page, pagination.PageSize);
            var totalCount = await _friendListRepo.GetUserListsCountAsync(userId);

            var dtos = lists.Select(l => _mapper.Map<FriendListDto>(l)).ToList();

            return new PagedResultDto<FriendListDto>
            {
                Items = dtos,
                TotalCount = totalCount,
                Page = pagination.Page,
                PageSize = pagination.PageSize
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting friend lists for user {UserId}", userId);
            return new PagedResultDto<FriendListDto>();
        }
    }

    public async Task<FriendListDetailDto?> GetFriendListAsync(Guid userId, Guid listId)
    {
        try
        {
            if (!await _friendListRepo.IsOwnerAsync(listId, userId))
                return null;

            var list = await _friendListRepo.GetWithMembersAsync(listId);
            if (list == null)
                return null;

            var dto = _mapper.Map<FriendListDetailDto>(list);

            var members = await _friendListRepo.GetMembersAsync(listId);
            dto.Members = members.Select(m => _mapper.Map<FriendDto>(m)).ToList();

            return dto;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting friend list {ListId} for user {UserId}", listId, userId);
            return null;
        }
    }

    public async Task<FriendListDto?> CreateFriendListAsync(Guid userId, CreateFriendListDto dto)
    {
        try
        {
            var friendList = _mapper.Map<FriendList>(dto);
            friendList.Id = Guid.NewGuid();
            friendList.OwnerId = userId;

            var created = await _friendListRepo.CreateAsync(friendList);
            return _mapper.Map<FriendListDto>(created);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating friend list for user {UserId}", userId);
            return null;
        }
    }

    public async Task<FriendListDto?> UpdateFriendListAsync(Guid userId, Guid listId, UpdateFriendListDto dto)
    {
        try
        {
            if (!await _friendListRepo.IsOwnerAsync(listId, userId))
                return null;

            var friendList = await _friendListRepo.GetByIdAsync(listId);
            if (friendList == null)
                return null;

            _mapper.Map(dto, friendList);
            var updated = await _friendListRepo.UpdateAsync(friendList);

            return updated != null ? _mapper.Map<FriendListDto>(updated) : null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating friend list {ListId} for user {UserId}", listId, userId);
            return null;
        }
    }

    public async Task<bool> DeleteFriendListAsync(Guid userId, Guid listId)
    {
        try
        {
            if (!await _friendListRepo.IsOwnerAsync(listId, userId))
                return false;

            return await _friendListRepo.DeleteAsync(listId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting friend list {ListId} for user {UserId}", listId, userId);
            return false;
        }
    }

    public async Task<bool> AddToFriendListAsync(Guid userId, Guid listId, Guid friendId)
    {
        try
        {
            if (!await _friendListRepo.IsOwnerAsync(listId, userId))
                return false;

            return await _friendListRepo.AddMemberAsync(listId, friendId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding friend {FriendId} to list {ListId} for user {UserId}",
                friendId, listId, userId);
            return false;
        }
    }

    public async Task<bool> RemoveFromFriendListAsync(Guid userId, Guid listId, Guid friendId)
    {
        try
        {
            if (!await _friendListRepo.IsOwnerAsync(listId, userId))
                return false;

            return await _friendListRepo.RemoveMemberAsync(listId, friendId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error removing friend {FriendId} from list {ListId} for user {UserId}",
                friendId, listId, userId);
            return false;
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Block Management
    // ═══════════════════════════════════════════════════════════════════════════

    public async Task<PagedResultDto<BlockedUserDto>> GetBlockedUsersAsync(Guid userId, PaginationDto pagination)
    {
        try
        {
            var blockedUsers = await _blockedUserRepo.GetBlockedUsersAsync(userId, pagination.Page, pagination.PageSize);
            var totalCount = await _blockedUserRepo.GetBlockedUsersCountAsync(userId);

            var dtos = blockedUsers.Select(b => _mapper.Map<BlockedUserDto>(b)).ToList();

            return new PagedResultDto<BlockedUserDto>
            {
                Items = dtos,
                TotalCount = totalCount,
                Page = pagination.Page,
                PageSize = pagination.PageSize
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting blocked users for user {UserId}", userId);
            return new PagedResultDto<BlockedUserDto>();
        }
    }

    public async Task<bool> BlockUserAsync(Guid userId, BlockUserDto dto)
    {
        try
        {
            var blocked = await _blockedUserRepo.BlockUserAsync(userId, dto.UserId, dto.Reason);
            return blocked != null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error blocking user {BlockedUserId} by user {UserId}", dto.UserId, userId);
            return false;
        }
    }

    public async Task<bool> UnblockUserAsync(Guid userId, Guid blockedUserId)
    {
        try
        {
            return await _blockedUserRepo.UnblockUserAsync(userId, blockedUserId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error unblocking user {BlockedUserId} by user {UserId}", blockedUserId, userId);
            return false;
        }
    }

    public async Task<bool> IsBlockedAsync(Guid userId, Guid otherUserId)
    {
        try
        {
            return await _blockedUserRepo.HasBlockRelationshipAsync(userId, otherUserId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking block status between {UserId} and {OtherUserId}", userId, otherUserId);
            return false;
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Privacy Settings
    // ═══════════════════════════════════════════════════════════════════════════

    public async Task<PrivacySettingsDto?> GetPrivacySettingsAsync(Guid userId)
    {
        try
        {
            var settings = await _privacySettingsRepo.GetByUserProfileIdAsync(userId);
            if (settings == null)
            {
                // Create default settings if not exists
                settings = await _privacySettingsRepo.CreateDefaultSettingsAsync(userId);
            }

            return _mapper.Map<PrivacySettingsDto>(settings);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting privacy settings for user {UserId}", userId);
            return null;
        }
    }

    public async Task<PrivacySettingsDto?> UpdatePrivacySettingsAsync(Guid userId, UpdatePrivacySettingsDto dto)
    {
        try
        {
            var settings = await _privacySettingsRepo.GetByUserProfileIdAsync(userId);
            if (settings == null)
                return null;

            _mapper.Map(dto, settings);
            var updated = await _privacySettingsRepo.UpdateAsync(settings);

            return updated != null ? _mapper.Map<PrivacySettingsDto>(updated) : null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating privacy settings for user {UserId}", userId);
            return null;
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Statistics
    // ═══════════════════════════════════════════════════════════════════════════

    public async Task<SocialStatsDto> GetSocialStatsAsync(Guid userId)
    {
        try
        {
            return new SocialStatsDto
            {
                TotalFriends = await _statsRepo.GetTotalFriendsAsync(userId),
                PendingReceivedRequests = await _statsRepo.GetPendingReceivedRequestsAsync(userId),
                PendingSentRequests = await _statsRepo.GetPendingSentRequestsAsync(userId),
                OnlineFriends = await _statsRepo.GetOnlineFriendsAsync(userId),
                BlockedUsers = await _statsRepo.GetBlockedUsersAsync(userId),
                FriendLists = await _statsRepo.GetFriendListsAsync(userId)
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting social stats for user {UserId}", userId);
            return new SocialStatsDto();
        }
    }
}
