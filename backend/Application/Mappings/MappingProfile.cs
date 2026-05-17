using AutoMapper;
using InvestorManagementSystem.Application.DTOs;
using InvestorManagementSystem.Core.Entities;

namespace InvestorManagementSystem.Application.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // Investor mappings
        CreateMap<Investor, InvestorDto>();
        CreateMap<CreateInvestorDto, Investor>();
        CreateMap<UpdateInvestorDto, Investor>();

        // Portfolio mappings
        CreateMap<Portfolio, PortfolioDto>();
        CreateMap<CreatePortfolioDto, Portfolio>();
        CreateMap<UpdatePortfolioDto, Portfolio>();

        // Trade mappings
        CreateMap<Trade, TradeDto>();
        CreateMap<CreateTradeDto, Trade>();
        CreateMap<UpdateTradeDto, Trade>();

        // Transaction mappings
        CreateMap<Transaction, TransactionDto>();
        CreateMap<CreateTransactionDto, Transaction>();
        CreateMap<UpdateTransactionDto, Transaction>();

        // PerformanceMetric mappings
        CreateMap<PerformanceMetric, PerformanceMetricDto>();
        CreateMap<CreatePerformanceMetricDto, PerformanceMetric>();

        // Notification mappings
        CreateMap<Notification, NotificationDto>();
        CreateMap<CreateNotificationDto, Notification>();

        // ═══════════════════════════════════════════════════════════════════════════
        // Social Networking Mappings
        // ═══════════════════════════════════════════════════════════════════════════

        // UserProfile mappings
        CreateMap<UserProfile, UserProfileDto>()
            .ForMember(dest => dest.PreferredMarkets, opt => opt.MapFrom(src =>
                string.IsNullOrEmpty(src.PreferredMarkets)
                    ? new List<string>()
                    : src.PreferredMarkets.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList()))
            .ForMember(dest => dest.FriendsCount, opt => opt.Ignore())
            .ForMember(dest => dest.MutualFriendsCount, opt => opt.Ignore())
            .ForMember(dest => dest.RelationshipStatus, opt => opt.Ignore());

        CreateMap<CreateUserProfileDto, UserProfile>()
            .ForMember(dest => dest.PreferredMarkets, opt => opt.MapFrom(src =>
                src.PreferredMarkets != null && src.PreferredMarkets.Any()
                    ? string.Join(",", src.PreferredMarkets)
                    : null));

        CreateMap<UpdateUserProfileDto, UserProfile>()
            .ForMember(dest => dest.PreferredMarkets, opt => opt.MapFrom(src =>
                src.PreferredMarkets != null && src.PreferredMarkets.Any()
                    ? string.Join(",", src.PreferredMarkets)
                    : null))
            .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

        // Friendship mappings
        CreateMap<Friendship, FriendshipDto>();
        CreateMap<Friendship, FriendRequestDto>()
            .ForMember(dest => dest.RequesterUsername, opt => opt.MapFrom(src => src.Requester.Username ?? ""))
            .ForMember(dest => dest.RequesterDisplayName, opt => opt.MapFrom(src => src.Requester.DisplayName ?? ""))
            .ForMember(dest => dest.RequesterAvatarUrl, opt => opt.MapFrom(src => src.Requester.AvatarUrl))
            .ForMember(dest => dest.RequesterOnlineStatus, opt => opt.MapFrom(src => src.Requester.OnlineStatus))
            .ForMember(dest => dest.RecipientUsername, opt => opt.MapFrom(src => src.Recipient.Username ?? ""))
            .ForMember(dest => dest.RecipientDisplayName, opt => opt.MapFrom(src => src.Recipient.DisplayName ?? ""))
            .ForMember(dest => dest.RecipientAvatarUrl, opt => opt.MapFrom(src => src.Recipient.AvatarUrl))
            .ForMember(dest => dest.MutualFriendsCount, opt => opt.Ignore());

        CreateMap<SendFriendRequestDto, Friendship>()
            .ForMember(dest => dest.RecipientId, opt => opt.MapFrom(src => src.RecipientId))
            .ForMember(dest => dest.Message, opt => opt.MapFrom(src => src.Message))
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => FriendshipStatus.Pending))
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow));

        // Friend mappings
        CreateMap<UserProfile, FriendDto>()
            .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.Id))
            .ForMember(dest => dest.Username, opt => opt.MapFrom(src => src.Username ?? ""))
            .ForMember(dest => dest.DisplayName, opt => opt.MapFrom(src => src.DisplayName ?? ""))
            .ForMember(dest => dest.FriendshipId, opt => opt.Ignore())
            .ForMember(dest => dest.FriendsSince, opt => opt.Ignore())
            .ForMember(dest => dest.MutualFriendsCount, opt => opt.Ignore());

        // Friend Suggestion mappings
        CreateMap<UserProfile, FriendSuggestionDto>()
            .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.Id))
            .ForMember(dest => dest.Username, opt => opt.MapFrom(src => src.Username ?? ""))
            .ForMember(dest => dest.DisplayName, opt => opt.MapFrom(src => src.DisplayName ?? ""))
            .ForMember(dest => dest.PreferredMarkets, opt => opt.MapFrom(src =>
                string.IsNullOrEmpty(src.PreferredMarkets)
                    ? new List<string>()
                    : src.PreferredMarkets.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList()))
            .ForMember(dest => dest.MutualFriendsCount, opt => opt.Ignore())
            .ForMember(dest => dest.MatchScore, opt => opt.Ignore())
            .ForMember(dest => dest.MatchReasons, opt => opt.Ignore());

        // FriendList mappings
        CreateMap<FriendList, FriendListDto>()
            .ForMember(dest => dest.MemberCount, opt => opt.MapFrom(src => src.Members.Count));

        CreateMap<FriendList, FriendListDetailDto>()
            .ForMember(dest => dest.Members, opt => opt.Ignore())
            .ForMember(dest => dest.MemberCount, opt => opt.MapFrom(src => src.Members.Count));

        CreateMap<CreateFriendListDto, FriendList>()
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow));

        CreateMap<UpdateFriendListDto, FriendList>()
            .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
            .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

        // BlockedUser mappings
        CreateMap<BlockedUser, BlockedUserDto>()
            .ForMember(dest => dest.BlockedUserId, opt => opt.MapFrom(src => src.BlockedId))
            .ForMember(dest => dest.BlockedUsername, opt => opt.MapFrom(src => src.Blocked.Username ?? ""))
            .ForMember(dest => dest.BlockedDisplayName, opt => opt.MapFrom(src => src.Blocked.DisplayName ?? ""))
            .ForMember(dest => dest.BlockedAvatarUrl, opt => opt.MapFrom(src => src.Blocked.AvatarUrl));

        CreateMap<BlockUserDto, BlockedUser>()
            .ForMember(dest => dest.BlockedId, opt => opt.MapFrom(src => src.UserId))
            .ForMember(dest => dest.BlockedAt, opt => opt.MapFrom(src => DateTime.UtcNow));

        // PrivacySettings mappings
        CreateMap<PrivacySettings, PrivacySettingsDto>();
        CreateMap<UpdatePrivacySettingsDto, PrivacySettings>()
            .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
            .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

        // UserSearch mappings
        CreateMap<UserProfile, UserSearchResultDto>()
            .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.Id))
            .ForMember(dest => dest.Username, opt => opt.MapFrom(src => src.Username ?? ""))
            .ForMember(dest => dest.DisplayName, opt => opt.MapFrom(src => src.DisplayName ?? ""))
            .ForMember(dest => dest.FriendsCount, opt => opt.Ignore())
            .ForMember(dest => dest.MutualFriendsCount, opt => opt.Ignore())
            .ForMember(dest => dest.RelationshipStatus, opt => opt.Ignore());

        // Real-time event mappings
        CreateMap<Friendship, FriendRequestReceivedEventDto>()
            .ForMember(dest => dest.RequestId, opt => opt.MapFrom(src => src.Id))
            .ForMember(dest => dest.RequesterUsername, opt => opt.MapFrom(src => src.Requester.Username ?? ""))
            .ForMember(dest => dest.RequesterDisplayName, opt => opt.MapFrom(src => src.Requester.DisplayName ?? ""))
            .ForMember(dest => dest.RequesterAvatarUrl, opt => opt.MapFrom(src => src.Requester.AvatarUrl));

        CreateMap<Friendship, FriendRequestAcceptedEventDto>()
            .ForMember(dest => dest.FriendshipId, opt => opt.MapFrom(src => src.Id))
            .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.RequesterId))
            .ForMember(dest => dest.Username, opt => opt.MapFrom(src => src.Requester.Username ?? ""))
            .ForMember(dest => dest.DisplayName, opt => opt.MapFrom(src => src.Requester.DisplayName ?? ""))
            .ForMember(dest => dest.AvatarUrl, opt => opt.MapFrom(src => src.Requester.AvatarUrl))
            .ForMember(dest => dest.AcceptedAt, opt => opt.MapFrom(src => src.AcceptedAt ?? DateTime.UtcNow));

        CreateMap<UserProfile, UserOnlineStatusChangedEventDto>()
            .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.Id));

        CreateMap<UserProfile, ProfileUpdatedEventDto>()
            .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.Id))
            .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => src.UpdatedAt ?? DateTime.UtcNow));
    }
}
