// Social Networking Feature - Zustand Store

import { socialApi } from '@/services/socialApi';
import type {
    BlockedUser,
    CreateUserProfileDto,
    Friend,
    FriendList,
    FriendListCreate,
    FriendListUpdate,
    FriendRequest,
    FriendsFilterParams,
    FriendSuggestion,
    PrivacySettings,
    SendFriendRequestPayload,
    UserProfile,
    UserProfileUpdate,
    UserSearchParams,
    UserSearchResult
} from '@/types/social';
import { create } from 'zustand';

// ============================================================================
// State Interface
// ============================================================================

interface SocialState {
    // Current user profile
    currentUserProfile: UserProfile | null;

    // Friends data
    friends: Friend[];
    friendsPagination: {
        currentPage: number;
        pageSize: number;
        totalPages: number;
        totalItems: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    } | null;

    // Friend requests
    receivedRequests: FriendRequest[];
    sentRequests: FriendRequest[];

    // Friend suggestions
    suggestions: FriendSuggestion[];

    // User search results
    searchResults: UserSearchResult[];
    searchPagination: {
        currentPage: number;
        pageSize: number;
        totalPages: number;
        totalItems: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    } | null;

    // Blocked users
    blockedUsers: BlockedUser[];

    // Friend lists
    friendLists: FriendList[];

    // Privacy settings
    privacySettings: PrivacySettings | null;

    // Loading states
    loading: {
        profile: boolean;
        friends: boolean;
        requests: boolean;
        suggestions: boolean;
        search: boolean;
        blocked: boolean;
        lists: boolean;
        privacy: boolean;
    };
    isLoading: {
        sendFriendRequest: boolean;
        acceptFriendRequest: boolean;
        declineFriendRequest: boolean;
        cancelFriendRequest: boolean;
        unfriend: boolean;
    };

    // Error states
    error: {
        profile: string | null;
        friends: string | null;
        requests: string | null;
        suggestions: string | null;
        search: string | null;
        blocked: string | null;
        lists: string | null;
        privacy: string | null;
    };

    // Actions - Profile
    createProfile: (data: CreateUserProfileDto) => Promise<void>;
    fetchMyProfile: () => Promise<void>;
    fetchUserProfile: (userId: string) => Promise<UserProfile | null>;
    updateProfile: (updates: UserProfileUpdate) => Promise<void>;
    uploadAvatar: (file: File) => Promise<void>;

    // Actions - Friend Requests
    sendFriendRequest: (payload: SendFriendRequestPayload) => Promise<void>;
    fetchReceivedRequests: () => Promise<void>;
    fetchSentRequests: () => Promise<void>;
    acceptFriendRequest: (requestId: string) => Promise<void>;
    declineFriendRequest: (requestId: string) => Promise<void>;
    cancelFriendRequest: (requestId: string) => Promise<void>;

    // Actions - Friends Management
    fetchFriends: (params?: FriendsFilterParams) => Promise<void>;
    unfriend: (userId: string) => Promise<void>;
    fetchMutualFriends: (userId: string) => Promise<Friend[]>;

    // Actions - Friend Suggestions
    fetchSuggestions: () => Promise<void>;
    dismissSuggestion: (userId: string) => Promise<void>;
    refreshSuggestions: () => Promise<void>;

    // Actions - User Search
    searchUsers: (params: UserSearchParams) => Promise<void>;
    clearSearchResults: () => void;

    // Actions - Friend Lists
    fetchFriendLists: () => Promise<void>;
    createFriendList: (data: FriendListCreate) => Promise<void>;
    updateFriendList: (listId: string, data: FriendListUpdate) => Promise<void>;
    deleteFriendList: (listId: string) => Promise<void>;
    addToFriendList: (listId: string, friendId: string) => Promise<void>;
    removeFromFriendList: (listId: string, friendId: string) => Promise<void>;

    // Actions - Privacy & Blocking
    fetchPrivacySettings: () => Promise<void>;
    updatePrivacySettings: (settings: Partial<PrivacySettings>) => Promise<void>;
    blockUser: (userId: string, reason?: string) => Promise<void>;
    unblockUser: (userId: string) => Promise<void>;
    fetchBlockedUsers: () => Promise<void>;

    // Actions - Real-time Updates
    handleFriendRequestReceived: (request: FriendRequest) => void;
    handleFriendRequestAccepted: (friendshipId: string, friend: Friend) => void;
    handleFriendOnlineStatusChanged: (userId: string, onlineStatus: string) => void;
    handleUnfriended: (userId: string) => void;

    // Utility Actions
    clearErrors: () => void;
    clearError: (key: keyof SocialState['error']) => void;
    reset: () => void;
}

// ============================================================================
// Initial State
// ============================================================================

const initialState = {
    currentUserProfile: null,
    friends: [],
    friendsPagination: null,
    receivedRequests: [],
    sentRequests: [],
    suggestions: [],
    searchResults: [],
    searchPagination: null,
    blockedUsers: [],
    friendLists: [],
    privacySettings: null,
    loading: {
        profile: false,
        friends: false,
        requests: false,
        suggestions: false,
        search: false,
        blocked: false,
        lists: false,
        privacy: false,
    },
    isLoading: {
        sendFriendRequest: false,
        acceptFriendRequest: false,
        declineFriendRequest: false,
        cancelFriendRequest: false,
        unfriend: false,
    },
    error: {
        profile: null,
        friends: null,
        requests: null,
        suggestions: null,
        search: null,
        blocked: null,
        lists: null,
        privacy: null,
    },
};

// ============================================================================
// Store Implementation
// ============================================================================

export const useSocialStore = create<SocialState>((set, get) => ({
    ...initialState,

    // ========================================================================
    // Profile Actions
    // ========================================================================

    createProfile: async (data: CreateUserProfileDto) => {
        set((state) => ({
            loading: { ...state.loading, profile: true },
            error: { ...state.error, profile: null },
        }));

        try {
            const response = await socialApi.profile.createProfile(data);

            if (response.success && response.data) {
                set((state) => ({
                    currentUserProfile: response.data!,
                    loading: { ...state.loading, profile: false },
                }));
            } else {
                throw new Error(response.error?.message || 'Failed to create profile');
            }
        } catch (error: any) {
            set((state) => ({
                loading: { ...state.loading, profile: false },
                error: { ...state.error, profile: error.message },
            }));
            throw error;
        }
    },

    fetchMyProfile: async () => {
        set((state) => ({
            loading: { ...state.loading, profile: true },
            error: { ...state.error, profile: null },
        }));

        try {
            const response = await socialApi.profile.getMyProfile();

            if (response.success && response.data) {
                set((state) => ({
                    currentUserProfile: response.data!,
                    loading: { ...state.loading, profile: false },
                }));
            } else {
                // Check if it's a 404 (profile not found)
                if (response.error?.message?.includes('404') || response.error?.message?.includes('not found')) {
                    set((state) => ({
                        loading: { ...state.loading, profile: false },
                        error: { ...state.error, profile: 'Profile not found. Please create your profile first.' },
                    }));
                } else {
                    throw new Error(response.error?.message || 'Failed to fetch profile');
                }
            }
        } catch (error: any) {
            // Check if it's a 404 error
            const is404 = error.message?.includes('404') || error.message?.includes('not found');
            set((state) => ({
                loading: { ...state.loading, profile: false },
                error: {
                    ...state.error,
                    profile: is404
                        ? 'Profile not found. Please create your profile first.'
                        : error.message
                },
            }));
        }
    },

    fetchUserProfile: async (userId: string) => {
        try {
            const response = await socialApi.profile.getProfile(userId);

            if (response.success && response.data) {
                return response.data;
            } else {
                throw new Error(response.error?.message || 'Failed to fetch user profile');
            }
        } catch (error: any) {
            console.error('Error fetching user profile:', error);
            return null;
        }
    },

    updateProfile: async (updates: UserProfileUpdate) => {
        set((state) => ({
            loading: { ...state.loading, profile: true },
            error: { ...state.error, profile: null },
        }));

        try {
            const response = await socialApi.profile.updateProfile(updates);

            if (response.success && response.data) {
                set((state) => ({
                    currentUserProfile: response.data!,
                    loading: { ...state.loading, profile: false },
                }));
            } else {
                throw new Error(response.error?.message || 'Failed to update profile');
            }
        } catch (error: any) {
            set((state) => ({
                loading: { ...state.loading, profile: false },
                error: { ...state.error, profile: error.message },
            }));
            throw error;
        }
    },

    uploadAvatar: async (file: File) => {
        set((state) => ({
            loading: { ...state.loading, profile: true },
            error: { ...state.error, profile: null },
        }));

        try {
            const response = await socialApi.profile.uploadAvatar(file);

            if (response.success && response.data) {
                // Update current profile with new avatar URL
                set((state) => ({
                    currentUserProfile: state.currentUserProfile
                        ? { ...state.currentUserProfile, avatarUrl: response.data!.avatarUrl }
                        : null,
                    loading: { ...state.loading, profile: false },
                }));
            } else {
                throw new Error(response.error?.message || 'Failed to upload avatar');
            }
        } catch (error: any) {
            set((state) => ({
                loading: { ...state.loading, profile: false },
                error: { ...state.error, profile: error.message },
            }));
            throw error;
        }
    },

    // ========================================================================
    // Friend Request Actions
    // ========================================================================

    sendFriendRequest: async (payload: SendFriendRequestPayload) => {
        set((state) => ({
            loading: { ...state.loading, requests: true },
            error: { ...state.error, requests: null },
        }));

        try {
            console.log('[socialStore] Sending friend request with payload:', payload);
            const response = await socialApi.friendRequests.sendRequest(payload);
            console.log('[socialStore] Friend request response:', response);

            if (response.success && response.data) {
                // Optimistically add to sent requests
                set((state) => ({
                    sentRequests: [...state.sentRequests, response.data!],
                    loading: { ...state.loading, requests: false },
                }));
            } else {
                throw new Error(response.error?.message || 'Failed to send friend request');
            }
        } catch (error: any) {
            console.error('[socialStore] Friend request error:', error);
            set((state) => ({
                loading: { ...state.loading, requests: false },
                error: { ...state.error, requests: error.message },
            }));
            throw error;
        }
    },

    fetchReceivedRequests: async () => {
        set((state) => ({
            loading: { ...state.loading, requests: true },
            error: { ...state.error, requests: null },
        }));

        try {
            const response = await socialApi.friendRequests.getReceivedRequests();

            if (response.success && response.data) {
                // Backend returns paginated data with items array
                const items = Array.isArray(response.data.items) ? response.data.items : [];
                console.log('[socialStore] Received requests:', items);

                set((state) => ({
                    receivedRequests: items,
                    loading: { ...state.loading, requests: false },
                }));
            } else {
                throw new Error(response.error?.message || 'Failed to fetch received requests');
            }
        } catch (error: any) {
            console.error('[socialStore] Error fetching received requests:', error);
            set((state) => ({
                loading: { ...state.loading, requests: false },
                error: { ...state.error, requests: error.message },
            }));
        }
    },

    fetchSentRequests: async () => {
        set((state) => ({
            loading: { ...state.loading, requests: true },
            error: { ...state.error, requests: null },
        }));

        try {
            const response = await socialApi.friendRequests.getSentRequests();

            if (response.success && response.data) {
                // Backend returns paginated data with items array
                const items = Array.isArray(response.data.items) ? response.data.items : [];
                console.log('[socialStore] Sent requests:', items);

                set((state) => ({
                    sentRequests: items,
                    loading: { ...state.loading, requests: false },
                }));
            } else {
                throw new Error(response.error?.message || 'Failed to fetch sent requests');
            }
        } catch (error: any) {
            console.error('[socialStore] Error fetching sent requests:', error);
            set((state) => ({
                loading: { ...state.loading, requests: false },
                error: { ...state.error, requests: error.message },
            }));
        }
    },

    acceptFriendRequest: async (requestId: string) => {
        set((state) => ({
            isLoading: { ...state.isLoading, acceptFriendRequest: true },
            error: { ...state.error, requests: null },
        }));

        try {
            const response = await socialApi.friendRequests.acceptRequest(requestId);

            if (response.success) {
                // Remove from received requests
                set((state) => ({
                    receivedRequests: state.receivedRequests.filter((req) => req.id !== requestId),
                    isLoading: { ...state.isLoading, acceptFriendRequest: false },
                }));

                // Refresh friends list
                await get().fetchFriends();
            } else {
                throw new Error(response.error?.message || 'Failed to accept friend request');
            }
        } catch (error: any) {
            set((state) => ({
                isLoading: { ...state.isLoading, acceptFriendRequest: false },
                error: { ...state.error, requests: error.message },
            }));
            throw error;
        }
    },

    declineFriendRequest: async (requestId: string) => {
        set((state) => ({
            isLoading: { ...state.isLoading, declineFriendRequest: true },
            error: { ...state.error, requests: null },
        }));

        try {
            const response = await socialApi.friendRequests.declineRequest(requestId);

            if (response.success) {
                // Remove from received requests
                set((state) => ({
                    receivedRequests: state.receivedRequests.filter((req) => req.id !== requestId),
                    isLoading: { ...state.isLoading, declineFriendRequest: false },
                }));
            } else {
                throw new Error(response.error?.message || 'Failed to decline friend request');
            }
        } catch (error: any) {
            set((state) => ({
                isLoading: { ...state.isLoading, declineFriendRequest: false },
                error: { ...state.error, requests: error.message },
            }));
            throw error;
        }
    },

    cancelFriendRequest: async (requestId: string) => {
        set((state) => ({
            loading: { ...state.loading, requests: true },
            error: { ...state.error, requests: null },
        }));

        try {
            const response = await socialApi.friendRequests.cancelRequest(requestId);

            if (response.success) {
                // Remove from sent requests
                set((state) => ({
                    sentRequests: state.sentRequests.filter((req) => req.id !== requestId),
                    loading: { ...state.loading, requests: false },
                }));
            } else {
                throw new Error(response.error?.message || 'Failed to cancel friend request');
            }
        } catch (error: any) {
            set((state) => ({
                loading: { ...state.loading, requests: false },
                error: { ...state.error, requests: error.message },
            }));
            throw error;
        }
    },

    // ========================================================================
    // Friends Management Actions
    // ========================================================================

    fetchFriends: async (params?: FriendsFilterParams) => {
        set((state) => ({
            loading: { ...state.loading, friends: true },
            error: { ...state.error, friends: null },
        }));

        try {
            const response = await socialApi.friends.getFriends(params);

            if (response.success && response.data) {
                set((state) => ({
                    friends: response.data!.items,
                    friendsPagination: {
                        currentPage: response.data!.page,
                        pageSize: response.data!.pageSize,
                        totalPages: response.data!.totalPages,
                        totalItems: response.data!.totalCount,
                        hasNextPage: response.data!.hasNextPage,
                        hasPreviousPage: response.data!.hasPreviousPage,
                    },
                    loading: { ...state.loading, friends: false },
                }));
            } else {
                throw new Error(response.error?.message || 'Failed to fetch friends');
            }
        } catch (error: any) {
            set((state) => ({
                loading: { ...state.loading, friends: false },
                error: { ...state.error, friends: error.message },
            }));
        }
    },

    unfriend: async (userId: string) => {
        set((state) => ({
            loading: { ...state.loading, friends: true },
            error: { ...state.error, friends: null },
        }));

        try {
            const response = await socialApi.friends.unfriend(userId);

            if (response.success) {
                // Optimistically remove from friends list
                set((state) => ({
                    friends: state.friends.filter((friend) => friend.userId !== userId),
                    loading: { ...state.loading, friends: false },
                }));
            } else {
                throw new Error(response.error?.message || 'Failed to unfriend user');
            }
        } catch (error: any) {
            set((state) => ({
                loading: { ...state.loading, friends: false },
                error: { ...state.error, friends: error.message },
            }));
            throw error;
        }
    },

    fetchMutualFriends: async (userId: string) => {
        try {
            const response = await socialApi.friends.getMutualFriends(userId);

            if (response.success && response.data) {
                return response.data;
            } else {
                throw new Error(response.error?.message || 'Failed to fetch mutual friends');
            }
        } catch (error: any) {
            console.error('Error fetching mutual friends:', error);
            return [];
        }
    },

    // ========================================================================
    // Friend Suggestions Actions
    // ========================================================================

    fetchSuggestions: async () => {
        set((state) => ({
            loading: { ...state.loading, suggestions: true },
            error: { ...state.error, suggestions: null },
        }));

        try {
            const response = await socialApi.suggestions.getSuggestions();

            if (response.success && response.data) {
                set((state) => ({
                    suggestions: response.data!,
                    loading: { ...state.loading, suggestions: false },
                }));
            } else {
                throw new Error(response.error?.message || 'Failed to fetch suggestions');
            }
        } catch (error: any) {
            set((state) => ({
                loading: { ...state.loading, suggestions: false },
                error: { ...state.error, suggestions: error.message },
            }));
        }
    },

    dismissSuggestion: async (userId: string) => {
        try {
            const response = await socialApi.suggestions.dismissSuggestion(userId);

            if (response.success) {
                // Remove from suggestions
                set((state) => ({
                    suggestions: state.suggestions.filter((suggestion) => suggestion.userId !== userId),
                }));
            } else {
                throw new Error(response.error?.message || 'Failed to dismiss suggestion');
            }
        } catch (error: any) {
            console.error('Error dismissing suggestion:', error);
            throw error;
        }
    },

    refreshSuggestions: async () => {
        set((state) => ({
            loading: { ...state.loading, suggestions: true },
            error: { ...state.error, suggestions: null },
        }));

        try {
            const response = await socialApi.suggestions.refreshSuggestions();

            if (response.success && response.data) {
                set((state) => ({
                    suggestions: response.data!,
                    loading: { ...state.loading, suggestions: false },
                }));
            } else {
                throw new Error(response.error?.message || 'Failed to refresh suggestions');
            }
        } catch (error: any) {
            set((state) => ({
                loading: { ...state.loading, suggestions: false },
                error: { ...state.error, suggestions: error.message },
            }));
        }
    },

    // ========================================================================
    // User Search Actions
    // ========================================================================

    searchUsers: async (params: UserSearchParams) => {
        set((state) => ({
            loading: { ...state.loading, search: true },
            error: { ...state.error, search: null },
        }));

        try {
            console.log('[socialStore] Searching users with params:', params);
            const response = await socialApi.search.searchUsers(params);
            console.log('[socialStore] Search response:', response);

            if (response.success && response.data) {
                console.log('[socialStore] Search results:', response.data);

                // Backend returns { items, totalCount, page, pageSize, totalPages, hasNextPage, hasPreviousPage }
                // We need to map it to our expected format
                const results = response.data as any;
                set((state) => ({
                    searchResults: results.items || [],
                    searchPagination: {
                        currentPage: results.page,
                        pageSize: results.pageSize,
                        totalPages: results.totalPages,
                        totalItems: results.totalCount,
                        hasNextPage: results.hasNextPage,
                        hasPreviousPage: results.hasPreviousPage,
                    },
                    loading: { ...state.loading, search: false },
                }));
            } else {
                throw new Error(response.error?.message || 'Failed to search users');
            }
        } catch (error: any) {
            console.error('[socialStore] Search error:', error);
            set((state) => ({
                loading: { ...state.loading, search: false },
                error: { ...state.error, search: error.message },
            }));
        }
    },

    clearSearchResults: () => {
        set({
            searchResults: [],
            searchPagination: null,
        });
    },

    // ========================================================================
    // Friend Lists Actions
    // ========================================================================

    fetchFriendLists: async () => {
        set((state) => ({
            loading: { ...state.loading, lists: true },
            error: { ...state.error, lists: null },
        }));

        try {
            const response = await socialApi.friendLists.getLists();

            if (response.success && response.data) {
                set((state) => ({
                    friendLists: response.data!,
                    loading: { ...state.loading, lists: false },
                }));
            } else {
                throw new Error(response.error?.message || 'Failed to fetch friend lists');
            }
        } catch (error: any) {
            set((state) => ({
                loading: { ...state.loading, lists: false },
                error: { ...state.error, lists: error.message },
            }));
        }
    },

    createFriendList: async (data: FriendListCreate) => {
        set((state) => ({
            loading: { ...state.loading, lists: true },
            error: { ...state.error, lists: null },
        }));

        try {
            const response = await socialApi.friendLists.createList(data);

            if (response.success && response.data) {
                set((state) => ({
                    friendLists: [...state.friendLists, response.data!],
                    loading: { ...state.loading, lists: false },
                }));
            } else {
                throw new Error(response.error?.message || 'Failed to create friend list');
            }
        } catch (error: any) {
            set((state) => ({
                loading: { ...state.loading, lists: false },
                error: { ...state.error, lists: error.message },
            }));
            throw error;
        }
    },

    updateFriendList: async (listId: string, data: FriendListUpdate) => {
        set((state) => ({
            loading: { ...state.loading, lists: true },
            error: { ...state.error, lists: null },
        }));

        try {
            const response = await socialApi.friendLists.updateList(listId, data);

            if (response.success && response.data) {
                set((state) => ({
                    friendLists: state.friendLists.map((list) =>
                        list.id === listId ? response.data! : list
                    ),
                    loading: { ...state.loading, lists: false },
                }));
            } else {
                throw new Error(response.error?.message || 'Failed to update friend list');
            }
        } catch (error: any) {
            set((state) => ({
                loading: { ...state.loading, lists: false },
                error: { ...state.error, lists: error.message },
            }));
            throw error;
        }
    },

    deleteFriendList: async (listId: string) => {
        set((state) => ({
            loading: { ...state.loading, lists: true },
            error: { ...state.error, lists: null },
        }));

        try {
            const response = await socialApi.friendLists.deleteList(listId);

            if (response.success) {
                set((state) => ({
                    friendLists: state.friendLists.filter((list) => list.id !== listId),
                    loading: { ...state.loading, lists: false },
                }));
            } else {
                throw new Error(response.error?.message || 'Failed to delete friend list');
            }
        } catch (error: any) {
            set((state) => ({
                loading: { ...state.loading, lists: false },
                error: { ...state.error, lists: error.message },
            }));
            throw error;
        }
    },

    addToFriendList: async (listId: string, friendId: string) => {
        try {
            const response = await socialApi.friendLists.addToList({ listId, friendId });

            if (response.success) {
                // Update the member count for the list
                set((state) => ({
                    friendLists: state.friendLists.map((list) =>
                        list.id === listId ? { ...list, memberCount: list.memberCount + 1 } : list
                    ),
                }));
            } else {
                throw new Error(response.error?.message || 'Failed to add friend to list');
            }
        } catch (error: any) {
            console.error('Error adding friend to list:', error);
            throw error;
        }
    },

    removeFromFriendList: async (listId: string, friendId: string) => {
        try {
            const response = await socialApi.friendLists.removeFromList({ listId, friendId });

            if (response.success) {
                // Update the member count for the list
                set((state) => ({
                    friendLists: state.friendLists.map((list) =>
                        list.id === listId ? { ...list, memberCount: Math.max(0, list.memberCount - 1) } : list
                    ),
                }));
            } else {
                throw new Error(response.error?.message || 'Failed to remove friend from list');
            }
        } catch (error: any) {
            console.error('Error removing friend from list:', error);
            throw error;
        }
    },

    // ========================================================================
    // Privacy & Blocking Actions
    // ========================================================================

    fetchPrivacySettings: async () => {
        set((state) => ({
            loading: { ...state.loading, privacy: true },
            error: { ...state.error, privacy: null },
        }));

        try {
            const response = await socialApi.privacy.getPrivacySettings();

            if (response.success && response.data) {
                set((state) => ({
                    privacySettings: response.data!,
                    loading: { ...state.loading, privacy: false },
                }));
            } else {
                // If privacy settings don't exist (404), set default values instead of throwing error
                if (response.error?.message?.includes('not found') || response.error?.message?.includes('404')) {
                    set((state) => ({
                        privacySettings: null,
                        loading: { ...state.loading, privacy: false },
                        error: { ...state.error, privacy: null }, // Don't show error for missing settings
                    }));
                } else {
                    throw new Error(response.error?.message || 'Failed to fetch privacy settings');
                }
            }
        } catch (error: any) {
            // Check if it's a 404 error (privacy settings not found)
            const is404 = error.message?.includes('404') || error.message?.includes('not found');
            set((state) => ({
                loading: { ...state.loading, privacy: false },
                error: {
                    ...state.error,
                    privacy: is404 ? null : error.message, // Don't show error for 404
                },
                privacySettings: is404 ? null : state.privacySettings,
            }));
        }
    },

    updatePrivacySettings: async (settings: Partial<PrivacySettings>) => {
        set((state) => ({
            loading: { ...state.loading, privacy: true },
            error: { ...state.error, privacy: null },
        }));

        try {
            const response = await socialApi.privacy.updatePrivacySettings(settings);

            if (response.success && response.data) {
                set((state) => ({
                    privacySettings: response.data!,
                    loading: { ...state.loading, privacy: false },
                }));
            } else {
                throw new Error(response.error?.message || 'Failed to update privacy settings');
            }
        } catch (error: any) {
            set((state) => ({
                loading: { ...state.loading, privacy: false },
                error: { ...state.error, privacy: error.message },
            }));
            throw error;
        }
    },

    blockUser: async (userId: string, reason?: string) => {
        set((state) => ({
            loading: { ...state.loading, blocked: true },
            error: { ...state.error, blocked: null },
        }));

        try {
            const response = await socialApi.privacy.blockUser({ userId, reason });

            if (response.success && response.data) {
                set((state) => ({
                    blockedUsers: [...state.blockedUsers, response.data!],
                    // Remove from friends if they were friends
                    friends: state.friends.filter((friend) => friend.userId !== userId),
                    loading: { ...state.loading, blocked: false },
                }));
            } else {
                throw new Error(response.error?.message || 'Failed to block user');
            }
        } catch (error: any) {
            set((state) => ({
                loading: { ...state.loading, blocked: false },
                error: { ...state.error, blocked: error.message },
            }));
            throw error;
        }
    },

    unblockUser: async (userId: string) => {
        set((state) => ({
            loading: { ...state.loading, blocked: true },
            error: { ...state.error, blocked: null },
        }));

        try {
            const response = await socialApi.privacy.unblockUser(userId);

            if (response.success) {
                set((state) => ({
                    blockedUsers: state.blockedUsers.filter((blocked) => blocked.blockedId !== userId),
                    loading: { ...state.loading, blocked: false },
                }));
            } else {
                throw new Error(response.error?.message || 'Failed to unblock user');
            }
        } catch (error: any) {
            set((state) => ({
                loading: { ...state.loading, blocked: false },
                error: { ...state.error, blocked: error.message },
            }));
            throw error;
        }
    },

    fetchBlockedUsers: async () => {
        set((state) => ({
            loading: { ...state.loading, blocked: true },
            error: { ...state.error, blocked: null },
        }));

        try {
            const response = await socialApi.privacy.getBlockedUsers();

            if (response.success && response.data) {
                set((state) => ({
                    blockedUsers: response.data!,
                    loading: { ...state.loading, blocked: false },
                }));
            } else {
                throw new Error(response.error?.message || 'Failed to fetch blocked users');
            }
        } catch (error: any) {
            set((state) => ({
                loading: { ...state.loading, blocked: false },
                error: { ...state.error, blocked: error.message },
            }));
        }
    },

    // ========================================================================
    // Real-time Update Handlers
    // ========================================================================

    handleFriendRequestReceived: (request: FriendRequest) => {
        set((state) => ({
            receivedRequests: [request, ...state.receivedRequests],
        }));
    },

    handleFriendRequestAccepted: (friendshipId: string, friend: Friend) => {
        set((state) => ({
            friends: [friend, ...state.friends],
            sentRequests: state.sentRequests.filter((req) => req.id !== friendshipId),
        }));
    },

    handleFriendOnlineStatusChanged: (userId: string, onlineStatus: string) => {
        set((state) => ({
            friends: state.friends.map((friend) =>
                friend.userId === userId
                    ? { ...friend, onlineStatus: onlineStatus as any }
                    : friend
            ),
        }));
    },

    handleUnfriended: (userId: string) => {
        set((state) => ({
            friends: state.friends.filter((friend) => friend.userId !== userId),
        }));
    },

    // ========================================================================
    // Utility Actions
    // ========================================================================

    clearErrors: () => {
        set({
            error: {
                profile: null,
                friends: null,
                requests: null,
                suggestions: null,
                search: null,
                blocked: null,
                lists: null,
                privacy: null,
            },
        });
    },

    clearError: (key: keyof SocialState['error']) => {
        set((state) => ({
            error: { ...state.error, [key]: null },
        }));
    },

    reset: () => {
        set(initialState);
    },
}));

export default useSocialStore;
