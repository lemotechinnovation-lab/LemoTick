// Social Networking Feature - TypeScript Types and Interfaces

// ============================================================================
// Enums
// ============================================================================

export enum FriendshipStatus {
    PENDING = 'pending',
    ACCEPTED = 'accepted',
    DECLINED = 'declined',
    CANCELLED = 'cancelled',
}

export enum ProfileVisibility {
    PUBLIC = 'public',
    FRIENDS = 'friends',
    PRIVATE = 'private',
}

export enum FriendsListVisibility {
    PUBLIC = 'public',
    FRIENDS = 'friends',
    ONLY_ME = 'only_me',
}

export enum AllowFriendRequests {
    EVERYONE = 'everyone',
    FRIENDS_OF_FRIENDS = 'friends_of_friends',
    NO_ONE = 'no_one',
}

export enum TradingExperience {
    BEGINNER = 0,
    INTERMEDIATE = 1,
    ADVANCED = 2,
    EXPERT = 3,
}

export enum TradingStyle {
    SCALPER = 0,
    DAY_TRADER = 1,
    SWING_TRADER = 2,
    POSITION_TRADER = 3,
}

export enum PreferredMarket {
    FOREX = 'forex',
    STOCKS = 'stocks',
    CRYPTO = 'crypto',
    COMMODITIES = 'commodities',
    INDICES = 'indices',
    OPTIONS = 'options',
    FUTURES = 'futures',
}

export enum OnlineStatus {
    ONLINE = 'online',
    OFFLINE = 'offline',
    AWAY = 'away',
}

// ============================================================================
// User Profile Interfaces
// ============================================================================

export interface UserProfile {
    userId: string;
    username: string;
    displayName: string;
    email?: string;
    avatarUrl?: string;
    bio?: string;
    tradingExperience?: TradingExperience;
    tradingStyle?: TradingStyle; // Single value, not array
    preferredMarkets?: PreferredMarket[];
    profileVisibility: ProfileVisibility;
    friendsListVisibility: FriendsListVisibility;
    allowFriendRequests: AllowFriendRequests;
    isVerified?: boolean;
    onlineStatus?: OnlineStatus;
    lastSeen?: string; // ISO date string
    memberSince: string; // ISO date string
    createdAt: string; // ISO date string
    updatedAt: string; // ISO date string
}

export interface UserProfileStats {
    totalFriends: number;
    mutualFriends?: number;
    totalTrades?: number;
    winRate?: number;
    totalProfit?: number;
    achievementsCount?: number;
}

export interface UserProfileUpdate {
    bio?: string;
    tradingExperience?: TradingExperience;
    tradingStyle?: TradingStyle[];
    preferredMarkets?: PreferredMarket[];
    avatarUrl?: string;
}

export interface CreateUserProfileDto {
    username: string;
    displayName: string;
    bio?: string;
    tradingExperience?: TradingExperience;
    tradingStyle?: TradingStyle; // Single value, not array
    preferredMarkets?: string[]; // Array of strings
}

// ============================================================================
// Friendship Interfaces
// ============================================================================

export interface Friendship {
    id: string;
    userId1: string;
    userId2: string;
    status: FriendshipStatus;
    requesterId: string;
    requestMessage?: string;
    createdAt: string; // ISO date string
    acceptedAt?: string; // ISO date string
    updatedAt: string; // ISO date string
}

export interface FriendRequest {
    id: string;
    requesterId: string;
    requesterUsername: string;
    requesterDisplayName: string;
    requesterAvatarUrl?: string;
    requesterOnlineStatus: OnlineStatus;
    recipientId: string;
    recipientUsername: string;
    recipientDisplayName: string;
    recipientAvatarUrl?: string;
    message?: string;
    status: FriendshipStatus;
    createdAt: string; // ISO date string
    mutualFriendsCount: number;
}

export interface Friend {
    userId: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
    bio?: string;
    tradingExperience?: TradingExperience;
    onlineStatus: OnlineStatus;
    lastSeen?: string; // ISO date string
    friendshipDate: string; // ISO date string
    mutualFriendsCount: number;
    isBlocked?: boolean;
}

// ============================================================================
// Friend List Interfaces
// ============================================================================

export interface FriendList {
    id: string;
    userId: string;
    name: string;
    description?: string;
    memberCount: number;
    createdAt: string; // ISO date string
    updatedAt: string; // ISO date string
}

export interface FriendListMember {
    id: string;
    listId: string;
    friendId: string;
    friend: Friend;
    addedAt: string; // ISO date string
}

export interface FriendListCreate {
    name: string;
    description?: string;
}

export interface FriendListUpdate {
    name?: string;
    description?: string;
}

// ============================================================================
// Friend Suggestion Interfaces
// ============================================================================

export interface FriendSuggestion {
    userId: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
    bio?: string;
    tradingExperience?: TradingExperience;
    mutualFriendsCount: number;
    mutualFriends?: Friend[];
    commonInterests?: string[];
    suggestionReason: string;
    suggestionScore: number;
}

// ============================================================================
// Blocked User Interfaces
// ============================================================================

export interface BlockedUser {
    id: string;
    blockerId: string;
    blockedId: string;
    blockedUser: UserProfile;
    reason?: string;
    createdAt: string; // ISO date string
}

export interface BlockUserRequest {
    userId: string;
    reason?: string;
}

// ============================================================================
// Privacy Settings Interfaces
// ============================================================================

export interface PrivacySettings {
    profileVisibility: ProfileVisibility;
    friendsListVisibility: FriendsListVisibility;
    allowFriendRequests: AllowFriendRequests;
    showOnlineStatus: boolean;
    showTradingStats: boolean;
    showRecentActivity: boolean;
}

// ============================================================================
// API Request/Response Types
// ============================================================================

export interface SendFriendRequestPayload {
    recipientId: string;
    message?: string;
}

export interface AcceptFriendRequestPayload {
    requestId: string;
}

export interface DeclineFriendRequestPayload {
    requestId: string;
}

export interface CancelFriendRequestPayload {
    requestId: string;
}

export interface UnfriendPayload {
    friendId: string;
}

export interface AddToFriendListPayload {
    listId: string;
    friendId: string;
}

export interface RemoveFromFriendListPayload {
    listId: string;
    friendId: string;
}

// ============================================================================
// Pagination and Filtering
// ============================================================================

export interface PaginationParams {
    page: number;
    pageSize: number;
}

export interface PaginatedResponse<T> {
    items: T[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

export interface FriendsFilterParams extends PaginationParams {
    search?: string;
    onlineStatus?: OnlineStatus;
    listId?: string;
    sortBy?: 'name' | 'recent_activity' | 'friendship_date';
    sortOrder?: 'asc' | 'desc';
}

export interface UserSearchParams extends PaginationParams {
    query?: string;
    tradingExperience?: TradingExperience;
    tradingStyle?: TradingStyle;
    minWinRate?: number;
}

export interface UserSearchResult {
    userId: string;
    username: string;
    displayName: string;
    bio?: string;
    avatarUrl?: string;
    tradingExperience?: TradingExperience;
    tradingStyle?: TradingStyle;
    onlineStatus: OnlineStatus;
    friendsCount: number;
    mutualFriendsCount: number;
    relationshipStatus: 'none' | 'pending_sent' | 'pending_received' | 'friends' | 'blocked';
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: any;
    };
    timestamp: string;
}

export interface ProfileResponse extends ApiResponse<UserProfile> {
    stats?: UserProfileStats;
}

export interface FriendsListResponse extends ApiResponse<PaginatedResponse<Friend>> { }

export interface FriendRequestsResponse extends ApiResponse<PaginatedResponse<FriendRequest>> { }

export interface FriendSuggestionsResponse extends ApiResponse<FriendSuggestion[]> { }

export interface BlockedUsersResponse extends ApiResponse<BlockedUser[]> { }

export interface FriendListsResponse extends ApiResponse<FriendList[]> { }

export interface MutualFriendsResponse extends ApiResponse<Friend[]> { }

// ============================================================================
// Real-time Event Types (SignalR)
// ============================================================================

export interface FriendRequestReceivedEvent {
    requestId: string;
    requester: UserProfile;
    message?: string;
    timestamp: string;
}

export interface FriendRequestAcceptedEvent {
    friendshipId: string;
    friend: Friend;
    timestamp: string;
}

export interface FriendOnlineStatusChangedEvent {
    userId: string;
    onlineStatus: OnlineStatus;
    timestamp: string;
}

export interface UnfriendedEvent {
    userId: string;
    timestamp: string;
}

// ============================================================================
// UI State Types
// ============================================================================

export interface SocialState {
    currentUserProfile: UserProfile | null;
    friends: Friend[];
    friendRequests: {
        received: FriendRequest[];
        sent: FriendRequest[];
    };
    friendSuggestions: FriendSuggestion[];
    blockedUsers: BlockedUser[];
    friendLists: FriendList[];
    loading: {
        profile: boolean;
        friends: boolean;
        requests: boolean;
        suggestions: boolean;
        blocked: boolean;
    };
    error: {
        profile: string | null;
        friends: string | null;
        requests: string | null;
        suggestions: string | null;
        blocked: string | null;
    };
}

// ============================================================================
// Utility Types
// ============================================================================

export type FriendshipRelation =
    | 'none'
    | 'pending_sent'
    | 'pending_received'
    | 'friends'
    | 'blocked'
    | 'blocked_by';

export interface UserRelationship {
    userId: string;
    relation: FriendshipRelation;
    friendshipId?: string;
    requestId?: string;
    canMessage: boolean;
    canViewProfile: boolean;
    canSendRequest: boolean;
}
