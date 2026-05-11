import { SOCIAL_SIGNALR_HUB_URL, STORAGE_KEYS } from '@/config/constants';
import type {
    Friend,
    FriendRequest,
    FriendSuggestion,
    UserProfile
} from '@/types/social';
import * as signalR from '@microsoft/signalr';

// Real-time event types
export interface FriendRequestReceivedEvent {
    request: FriendRequest;
    timestamp: Date;
}

export interface FriendRequestAcceptedEvent {
    requestId: string;
    friend: Friend;
    timestamp: Date;
}

export interface FriendRequestDeclinedEvent {
    requestId: string;
    senderId: string;
    timestamp: Date;
}

export interface FriendRequestCancelledEvent {
    requestId: string;
    receiverId: string;
    timestamp: Date;
}

export interface FriendRemovedEvent {
    friendId: string;
    timestamp: Date;
}

export interface UserOnlineStatusChangedEvent {
    userId: string;
    isOnline: boolean;
    lastSeen?: Date;
    timestamp: Date;
}

export interface ProfileUpdatedEvent {
    userId: string;
    profile: Partial<UserProfile>;
    timestamp: Date;
}

export interface FriendSuggestionsUpdatedEvent {
    suggestions: FriendSuggestion[];
    timestamp: Date;
}

class SocialSignalRService {
    private connection: signalR.HubConnection | null = null;
    private isConnecting = false;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;

    // Event callbacks
    private friendRequestReceivedCallbacks: Array<(event: FriendRequestReceivedEvent) => void> = [];
    private friendRequestAcceptedCallbacks: Array<(event: FriendRequestAcceptedEvent) => void> = [];
    private friendRequestDeclinedCallbacks: Array<(event: FriendRequestDeclinedEvent) => void> = [];
    private friendRequestCancelledCallbacks: Array<(event: FriendRequestCancelledEvent) => void> = [];
    private friendRemovedCallbacks: Array<(event: FriendRemovedEvent) => void> = [];
    private userOnlineStatusChangedCallbacks: Array<(event: UserOnlineStatusChangedEvent) => void> = [];
    private profileUpdatedCallbacks: Array<(event: ProfileUpdatedEvent) => void> = [];
    private friendSuggestionsUpdatedCallbacks: Array<(event: FriendSuggestionsUpdatedEvent) => void> = [];

    constructor() {
        // Connection will be initialized when start() is called
    }

    private initializeConnection() {
        const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);

        if (!token) {
            console.warn('[SocialSignalR] No authentication token found');
            return;
        }

        this.connection = new signalR.HubConnectionBuilder()
            .withUrl(SOCIAL_SIGNALR_HUB_URL, {
                accessTokenFactory: () => token,
            })
            .withAutomaticReconnect({
                nextRetryDelayInMilliseconds: (retryContext) => {
                    if (retryContext.previousRetryCount < this.maxReconnectAttempts) {
                        return Math.min(1000 * Math.pow(2, retryContext.previousRetryCount), 30000);
                    }
                    return null;
                },
            })
            .configureLogging(signalR.LogLevel.Information)
            .build();

        this.setupEventHandlers();
    }

    private setupEventHandlers() {
        if (!this.connection) return;

        // Friend request received
        this.connection.on('ReceiveFriendRequest', (event: FriendRequestReceivedEvent) => {
            console.log('[SocialSignalR] Friend request received:', event);
            this.friendRequestReceivedCallbacks.forEach((callback) => callback(event));
        });

        // Friend request accepted
        this.connection.on('FriendRequestAccepted', (event: FriendRequestAcceptedEvent) => {
            console.log('[SocialSignalR] Friend request accepted:', event);
            this.friendRequestAcceptedCallbacks.forEach((callback) => callback(event));
        });

        // Friend request declined
        this.connection.on('FriendRequestDeclined', (event: FriendRequestDeclinedEvent) => {
            console.log('[SocialSignalR] Friend request declined:', event);
            this.friendRequestDeclinedCallbacks.forEach((callback) => callback(event));
        });

        // Friend request cancelled
        this.connection.on('FriendRequestCancelled', (event: FriendRequestCancelledEvent) => {
            console.log('[SocialSignalR] Friend request cancelled:', event);
            this.friendRequestCancelledCallbacks.forEach((callback) => callback(event));
        });

        // Friend removed
        this.connection.on('FriendRemoved', (event: FriendRemovedEvent) => {
            console.log('[SocialSignalR] Friend removed:', event);
            this.friendRemovedCallbacks.forEach((callback) => callback(event));
        });

        // User online status changed
        this.connection.on('UserOnlineStatusChanged', (event: UserOnlineStatusChangedEvent) => {
            console.log('[SocialSignalR] User online status changed:', event);
            this.userOnlineStatusChangedCallbacks.forEach((callback) => callback(event));
        });

        // Profile updated
        this.connection.on('ProfileUpdated', (event: ProfileUpdatedEvent) => {
            console.log('[SocialSignalR] Profile updated:', event);
            this.profileUpdatedCallbacks.forEach((callback) => callback(event));
        });

        // Friend suggestions updated
        this.connection.on('FriendSuggestionsUpdated', (event: FriendSuggestionsUpdatedEvent) => {
            console.log('[SocialSignalR] Friend suggestions updated:', event);
            this.friendSuggestionsUpdatedCallbacks.forEach((callback) => callback(event));
        });

        // Notification received
        this.connection.on('ReceiveNotification', (notification: any) => {
            console.log('[SocialSignalR] Notification received:', notification);
            // Import dynamically to avoid circular dependencies
            import('@/stores/notificationStore').then(({ useNotificationStore }) => {
                useNotificationStore.getState().addNotification(notification);
            });
        });

        // Message received
        this.connection.on('ReceiveMessage', (message: any) => {
            console.log('[SocialSignalR] Message received:', message);
            // Import dynamically to avoid circular dependencies
            import('@/stores/messageStore').then(({ useMessageStore }) => {
                useMessageStore.getState().addMessage(message);
            });
        });

        // Conversation updated
        this.connection.on('ConversationUpdated', (conversation: any) => {
            console.log('[SocialSignalR] Conversation updated:', conversation);
            // Import dynamically to avoid circular dependencies
            import('@/stores/messageStore').then(({ useMessageStore }) => {
                useMessageStore.getState().updateConversation(conversation);
            });
        });

        // Connection events
        this.connection.onreconnecting((error) => {
            console.warn('[SocialSignalR] Reconnecting...', error);
            this.reconnectAttempts++;
        });

        this.connection.onreconnected(() => {
            console.log('[SocialSignalR] Reconnected successfully');
            this.reconnectAttempts = 0;
        });

        this.connection.onclose((error) => {
            console.error('[SocialSignalR] Connection closed', error);
            // Attempt to reconnect after a delay
            if (this.reconnectAttempts < this.maxReconnectAttempts) {
                setTimeout(() => this.start(), 5000);
            }
        });
    }

    async start() {
        if (!this.connection) {
            this.initializeConnection();
        }

        if (!this.connection) {
            console.error('[SocialSignalR] Failed to initialize connection');
            return;
        }

        if (this.isConnecting || this.connection.state === signalR.HubConnectionState.Connected) {
            return;
        }

        this.isConnecting = true;

        try {
            await this.connection.start();
            console.log('[SocialSignalR] Connected to SocialHub');
            this.reconnectAttempts = 0;
        } catch (error) {
            console.error('[SocialSignalR] Error connecting to SocialHub:', error);
            // Retry connection after delay
            if (this.reconnectAttempts < this.maxReconnectAttempts) {
                this.reconnectAttempts++;
                setTimeout(() => this.start(), 5000);
            }
        } finally {
            this.isConnecting = false;
        }
    }

    async stop() {
        try {
            await this.connection?.stop();
            console.log('[SocialSignalR] Disconnected from SocialHub');
        } catch (error) {
            console.error('[SocialSignalR] Error disconnecting:', error);
        }
    }

    // Hub methods to invoke server-side actions
    async joinUserGroup(userId: string) {
        if (this.connection?.state === signalR.HubConnectionState.Connected) {
            try {
                await this.connection.invoke('JoinUserGroup', userId);
                console.log(`[SocialSignalR] Joined user group: ${userId}`);
            } catch (error) {
                console.error('[SocialSignalR] Error joining user group:', error);
            }
        }
    }

    async leaveUserGroup(userId: string) {
        if (this.connection?.state === signalR.HubConnectionState.Connected) {
            try {
                await this.connection.invoke('LeaveUserGroup', userId);
                console.log(`[SocialSignalR] Left user group: ${userId}`);
            } catch (error) {
                console.error('[SocialSignalR] Error leaving user group:', error);
            }
        }
    }

    async updateOnlineStatus(isOnline: boolean) {
        if (this.connection?.state === signalR.HubConnectionState.Connected) {
            try {
                // Convert boolean to OnlineStatus enum string
                const status = isOnline ? 'Online' : 'Offline';
                await this.connection.invoke('UpdateOnlineStatus', status);
                console.log(`[SocialSignalR] Updated online status: ${status}`);
            } catch (error) {
                console.error('[SocialSignalR] Error updating online status:', error);
            }
        }
    }

    // Event subscription methods
    onFriendRequestReceived(callback: (event: FriendRequestReceivedEvent) => void) {
        this.friendRequestReceivedCallbacks.push(callback);
        return () => {
            this.friendRequestReceivedCallbacks = this.friendRequestReceivedCallbacks.filter(
                (cb) => cb !== callback
            );
        };
    }

    onFriendRequestAccepted(callback: (event: FriendRequestAcceptedEvent) => void) {
        this.friendRequestAcceptedCallbacks.push(callback);
        return () => {
            this.friendRequestAcceptedCallbacks = this.friendRequestAcceptedCallbacks.filter(
                (cb) => cb !== callback
            );
        };
    }

    onFriendRequestDeclined(callback: (event: FriendRequestDeclinedEvent) => void) {
        this.friendRequestDeclinedCallbacks.push(callback);
        return () => {
            this.friendRequestDeclinedCallbacks = this.friendRequestDeclinedCallbacks.filter(
                (cb) => cb !== callback
            );
        };
    }

    onFriendRequestCancelled(callback: (event: FriendRequestCancelledEvent) => void) {
        this.friendRequestCancelledCallbacks.push(callback);
        return () => {
            this.friendRequestCancelledCallbacks = this.friendRequestCancelledCallbacks.filter(
                (cb) => cb !== callback
            );
        };
    }

    onFriendRemoved(callback: (event: FriendRemovedEvent) => void) {
        this.friendRemovedCallbacks.push(callback);
        return () => {
            this.friendRemovedCallbacks = this.friendRemovedCallbacks.filter((cb) => cb !== callback);
        };
    }

    onUserOnlineStatusChanged(callback: (event: UserOnlineStatusChangedEvent) => void) {
        this.userOnlineStatusChangedCallbacks.push(callback);
        return () => {
            this.userOnlineStatusChangedCallbacks = this.userOnlineStatusChangedCallbacks.filter(
                (cb) => cb !== callback
            );
        };
    }

    onProfileUpdated(callback: (event: ProfileUpdatedEvent) => void) {
        this.profileUpdatedCallbacks.push(callback);
        return () => {
            this.profileUpdatedCallbacks = this.profileUpdatedCallbacks.filter((cb) => cb !== callback);
        };
    }

    onFriendSuggestionsUpdated(callback: (event: FriendSuggestionsUpdatedEvent) => void) {
        this.friendSuggestionsUpdatedCallbacks.push(callback);
        return () => {
            this.friendSuggestionsUpdatedCallbacks = this.friendSuggestionsUpdatedCallbacks.filter(
                (cb) => cb !== callback
            );
        };
    }

    getConnectionState() {
        return this.connection?.state || signalR.HubConnectionState.Disconnected;
    }

    isConnected() {
        return this.connection?.state === signalR.HubConnectionState.Connected;
    }
}

// Export singleton instance
export const socialSignalRService = new SocialSignalRService();
