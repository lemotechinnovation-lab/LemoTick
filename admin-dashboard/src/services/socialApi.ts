// Social Networking Feature - API Service Layer

import { STORAGE_KEYS } from '../config/constants';
import type {
    AddToFriendListPayload,
    ApiResponse,
    BlockedUser,
    BlockedUsersResponse,
    BlockUserRequest,
    CreateUserProfileDto,
    Friend,
    FriendList,
    FriendListCreate,
    FriendListsResponse,
    FriendListUpdate,
    FriendRequest,
    FriendRequestsResponse,
    FriendsFilterParams,
    FriendsListResponse,
    FriendSuggestion,
    FriendSuggestionsResponse,
    MutualFriendsResponse,
    PaginatedResponse,
    PaginationParams,
    PrivacySettings,
    ProfileResponse,
    RemoveFromFriendListPayload,
    SendFriendRequestPayload,
    UserProfile,
    UserProfileStats,
    UserProfileUpdate,
    UserSearchParams,
    UserSearchResult
} from '../types/social';

// Base API URL - should be configured via environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
const SOCIAL_API_PREFIX = '/api/social';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Generic fetch wrapper with error handling
 */
async function apiFetch<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<ApiResponse<T>> {
    try {
        const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);

        const url = `${API_BASE_URL}${SOCIAL_API_PREFIX}${endpoint}`;
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
                ...options.headers,
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error(`[apiFetch] Error response for ${endpoint}:`, errorData);

            // Handle ASP.NET Core validation errors
            if (errorData.errors && typeof errorData.errors === 'object') {
                const validationErrors = Object.entries(errorData.errors)
                    .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
                    .join('; ');
                throw new Error(`Validation failed: ${validationErrors}`);
            }

            const errorMessage = errorData.message || errorData.error || errorData.title || `HTTP error! status: ${response.status}`;
            throw new Error(errorMessage);
        }

        const data = await response.json();
        return {
            success: true,
            data,
            timestamp: new Date().toISOString(),
        };
    } catch (error) {
        console.error(`API Error [${endpoint}]:`, error);
        return {
            success: false,
            error: {
                code: 'API_ERROR',
                message: error instanceof Error ? error.message : 'An unknown error occurred',
            },
            timestamp: new Date().toISOString(),
        };
    }
}

/**
 * Build query string from params object
 */
function buildQueryString(params: Record<string, any>): string {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
                value.forEach(v => searchParams.append(key, String(v)));
            } else {
                searchParams.append(key, String(value));
            }
        }
    });

    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : '';
}

// ============================================================================
// Profile API
// ============================================================================

export const profileApi = {
    /**
     * Create a new user profile
     */
    async createProfile(data: CreateUserProfileDto): Promise<ProfileResponse> {
        console.log('[socialApi] Creating profile with data:', JSON.stringify(data, null, 2));
        return apiFetch<UserProfile>('/profile', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    /**
     * Get user profile by ID
     */
    async getProfile(userId: string): Promise<ProfileResponse> {
        return apiFetch<UserProfile>(`/profile/${userId}`);
    },

    /**
     * Get current user's profile
     */
    async getMyProfile(): Promise<ProfileResponse> {
        return apiFetch<UserProfile>('/profile/me');
    },

    /**
     * Update current user's profile
     */
    async updateProfile(updates: UserProfileUpdate): Promise<ProfileResponse> {
        return apiFetch<UserProfile>('/profile', {
            method: 'PUT',
            body: JSON.stringify(updates),
        });
    },

    /**
     * Get user's profile statistics
     */
    async getProfileStats(userId: string): Promise<ApiResponse<UserProfileStats>> {
        return apiFetch<UserProfileStats>(`/profile/${userId}/stats`);
    },

    /**
     * Upload profile avatar
     */
    async uploadAvatar(file: File): Promise<ApiResponse<{ avatarUrl: string }>> {
        const formData = new FormData();
        formData.append('avatar', file);

        const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);

        try {
            const response = await fetch(`${API_BASE_URL}${SOCIAL_API_PREFIX}/profile/avatar`, {
                method: 'POST',
                headers: {
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Upload failed: ${response.status}`);
            }

            const data = await response.json();
            return {
                success: true,
                data,
                timestamp: new Date().toISOString(),
            };
        } catch (error) {
            return {
                success: false,
                error: {
                    code: 'UPLOAD_ERROR',
                    message: error instanceof Error ? error.message : 'Avatar upload failed',
                },
                timestamp: new Date().toISOString(),
            };
        }
    },
};

// ============================================================================
// Friend Request API
// ============================================================================

export const friendRequestApi = {
    /**
     * Send a friend request
     */
    async sendRequest(payload: SendFriendRequestPayload): Promise<ApiResponse<FriendRequest>> {
        console.log('[friendRequestApi] Sending request with payload:', payload);
        console.log('[friendRequestApi] Payload JSON:', JSON.stringify(payload));
        return apiFetch<FriendRequest>('/requests', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    },

    /**
     * Get received friend requests
     */
    async getReceivedRequests(page: number = 1, pageSize: number = 20): Promise<FriendRequestsResponse> {
        return apiFetch<PaginatedResponse<FriendRequest>>(`/requests/received?page=${page}&pageSize=${pageSize}`);
    },

    /**
     * Get sent friend requests
     */
    async getSentRequests(page: number = 1, pageSize: number = 20): Promise<FriendRequestsResponse> {
        return apiFetch<PaginatedResponse<FriendRequest>>(`/requests/sent?page=${page}&pageSize=${pageSize}`);
    },

    /**
     * Accept a friend request
     */
    async acceptRequest(requestId: string): Promise<ApiResponse<FriendRequest>> {
        return apiFetch<FriendRequest>(`/requests/${requestId}/accept`, {
            method: 'POST',
        });
    },

    /**
     * Decline a friend request
     */
    async declineRequest(requestId: string): Promise<ApiResponse<FriendRequest>> {
        return apiFetch<FriendRequest>(`/requests/${requestId}/decline`, {
            method: 'POST',
        });
    },

    /**
     * Cancel a sent friend request
     */
    async cancelRequest(requestId: string): Promise<ApiResponse<void>> {
        return apiFetch<void>(`/requests/${requestId}`, {
            method: 'DELETE',
        });
    },
};

// ============================================================================
// Friends Management API
// ============================================================================

export const friendsApi = {
    /**
     * Get friends list with filtering and pagination
     */
    async getFriends(params?: FriendsFilterParams): Promise<FriendsListResponse> {
        const queryString = params ? buildQueryString(params) : '';
        return apiFetch<PaginatedResponse<Friend>>(`/friends${queryString}`);
    },

    /**
     * Get a specific friend's details
     */
    async getFriend(userId: string): Promise<ApiResponse<Friend>> {
        return apiFetch<Friend>(`/friends/${userId}`);
    },

    /**
     * Unfriend a user
     */
    async unfriend(userId: string): Promise<ApiResponse<void>> {
        return apiFetch<void>(`/friends/${userId}`, {
            method: 'DELETE',
        });
    },

    /**
     * Get mutual friends with another user
     */
    async getMutualFriends(userId: string): Promise<MutualFriendsResponse> {
        return apiFetch<Friend[]>(`/profile/${userId}/mutual-friends`);
    },

    /**
     * Get user's friends list (for viewing other users' friends)
     */
    async getUserFriends(userId: string, params?: PaginationParams): Promise<FriendsListResponse> {
        const queryString = params ? buildQueryString(params) : '';
        return apiFetch<PaginatedResponse<Friend>>(`/profile/${userId}/friends${queryString}`);
    },
};

// ============================================================================
// Friend Suggestions API
// ============================================================================

export const suggestionsApi = {
    /**
     * Get friend suggestions
     */
    async getSuggestions(): Promise<FriendSuggestionsResponse> {
        return apiFetch<FriendSuggestion[]>('/suggestions');
    },

    /**
     * Dismiss a friend suggestion
     */
    async dismissSuggestion(userId: string): Promise<ApiResponse<void>> {
        return apiFetch<void>(`/suggestions/${userId}/dismiss`, {
            method: 'POST',
        });
    },

    /**
     * Refresh friend suggestions
     */
    async refreshSuggestions(): Promise<FriendSuggestionsResponse> {
        return apiFetch<FriendSuggestion[]>('/suggestions/refresh', {
            method: 'POST',
        });
    },
};

// ============================================================================
// Friend Lists API
// ============================================================================

export const friendListsApi = {
    /**
     * Get all friend lists
     */
    async getLists(): Promise<FriendListsResponse> {
        return apiFetch<FriendList[]>('/lists');
    },

    /**
     * Get a specific friend list with members
     */
    async getList(listId: string): Promise<ApiResponse<FriendList & { members: Friend[] }>> {
        return apiFetch<FriendList & { members: Friend[] }>(`/lists/${listId}`);
    },

    /**
     * Create a new friend list
     */
    async createList(data: FriendListCreate): Promise<ApiResponse<FriendList>> {
        return apiFetch<FriendList>('/lists', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    /**
     * Update a friend list
     */
    async updateList(listId: string, data: FriendListUpdate): Promise<ApiResponse<FriendList>> {
        return apiFetch<FriendList>(`/lists/${listId}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    /**
     * Delete a friend list
     */
    async deleteList(listId: string): Promise<ApiResponse<void>> {
        return apiFetch<void>(`/lists/${listId}`, {
            method: 'DELETE',
        });
    },

    /**
     * Add a friend to a list
     */
    async addToList(payload: AddToFriendListPayload): Promise<ApiResponse<void>> {
        return apiFetch<void>(`/lists/${payload.listId}/members`, {
            method: 'POST',
            body: JSON.stringify({ friendId: payload.friendId }),
        });
    },

    /**
     * Remove a friend from a list
     */
    async removeFromList(payload: RemoveFromFriendListPayload): Promise<ApiResponse<void>> {
        return apiFetch<void>(`/lists/${payload.listId}/members/${payload.friendId}`, {
            method: 'DELETE',
        });
    },
};

// ============================================================================
// Privacy & Blocking API
// ============================================================================

export const privacyApi = {
    /**
     * Get privacy settings
     */
    async getPrivacySettings(): Promise<ApiResponse<PrivacySettings>> {
        return apiFetch<PrivacySettings>('/privacy');
    },

    /**
     * Update privacy settings
     */
    async updatePrivacySettings(settings: Partial<PrivacySettings>): Promise<ApiResponse<PrivacySettings>> {
        return apiFetch<PrivacySettings>('/privacy', {
            method: 'PUT',
            body: JSON.stringify(settings),
        });
    },

    /**
     * Block a user
     */
    async blockUser(payload: BlockUserRequest): Promise<ApiResponse<BlockedUser>> {
        return apiFetch<BlockedUser>('/block', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    },

    /**
     * Unblock a user
     */
    async unblockUser(userId: string): Promise<ApiResponse<void>> {
        return apiFetch<void>(`/block/${userId}`, {
            method: 'DELETE',
        });
    },

    /**
     * Get blocked users list
     */
    async getBlockedUsers(): Promise<BlockedUsersResponse> {
        return apiFetch<BlockedUser[]>('/blocked');
    },
};

// ============================================================================
// User Search API
// ============================================================================

export const searchApi = {
    /**
     * Search for users
     */
    async searchUsers(params: UserSearchParams): Promise<ApiResponse<PaginatedResponse<UserSearchResult>>> {
        const queryString = buildQueryString(params);
        return apiFetch<PaginatedResponse<UserSearchResult>>(`/search${queryString}`);
    },

    /**
     * Get user by username
     */
    async getUserByUsername(username: string): Promise<ProfileResponse> {
        return apiFetch<UserProfile>(`/users/username/${username}`);
    },
};

// ============================================================================
// Relationship API
// ============================================================================

export const relationshipApi = {
    /**
     * Get relationship status with another user
     */
    async getRelationship(userId: string): Promise<ApiResponse<{
        relation: string;
        friendshipId?: string;
        requestId?: string;
        canMessage: boolean;
        canViewProfile: boolean;
        canSendRequest: boolean;
    }>> {
        return apiFetch(`/users/${userId}/relationship`);
    },
};

// ============================================================================
// Export all APIs
// ============================================================================

export const socialApi = {
    profile: profileApi,
    friendRequests: friendRequestApi,
    friends: friendsApi,
    suggestions: suggestionsApi,
    friendLists: friendListsApi,
    privacy: privacyApi,
    search: searchApi,
    relationship: relationshipApi,
};

export default socialApi;
