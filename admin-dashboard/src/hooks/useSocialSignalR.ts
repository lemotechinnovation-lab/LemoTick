import { useAuthStore } from '@/features/auth/stores/authStore';
import { socialSignalRService } from '@/services/socialSignalRService';
import { useSocialStore } from '@/stores/socialStore';
import { HubConnectionState } from '@microsoft/signalr';
import { useCallback, useEffect, useState } from 'react';

// Feature flag to enable/disable social features
const ENABLE_SOCIAL_FEATURES = import.meta.env.VITE_ENABLE_SOCIAL_FEATURES === 'true';

export function useSocialSignalR() {
    const [connectionState, setConnectionState] = useState<HubConnectionState>(
        ENABLE_SOCIAL_FEATURES ? socialSignalRService.getConnectionState() : HubConnectionState.Disconnected
    );

    const { user } = useAuthStore();
    const {
        handleFriendRequestReceived,
        handleFriendRequestAccepted,
        handleFriendOnlineStatusChanged,
        handleUnfriended,
        fetchReceivedRequests,
        fetchSentRequests,
        fetchFriends,
        fetchSuggestions,
    } = useSocialStore();

    // Start connection when user is authenticated and social features are enabled
    useEffect(() => {
        if (!ENABLE_SOCIAL_FEATURES) {
            return;
        }

        if (user) {
            socialSignalRService.start().catch((error) => {
                console.warn('[SocialSignalR] Failed to start connection:', error);
            });

            // Update connection state periodically
            const interval = setInterval(() => {
                setConnectionState(socialSignalRService.getConnectionState());
            }, 1000);

            return () => {
                clearInterval(interval);
            };
        }
    }, [user]);

    // Join user group when connected
    useEffect(() => {
        if (!ENABLE_SOCIAL_FEATURES) {
            return;
        }

        if (user && connectionState === HubConnectionState.Connected) {
            socialSignalRService.joinUserGroup(user.id).catch((error) => {
                console.warn('[SocialSignalR] Failed to join user group:', error);
            });
            socialSignalRService.updateOnlineStatus(true).catch((error) => {
                console.warn('[SocialSignalR] Failed to update online status:', error);
            });
        }
    }, [user, connectionState]);

    // Setup event handlers
    useEffect(() => {
        if (!ENABLE_SOCIAL_FEATURES) {
            return;
        }

        // Friend request received
        const unsubscribeFriendRequestReceived = socialSignalRService.onFriendRequestReceived(
            (event) => {
                console.log('[useSocialSignalR] Friend request received:', event);
                handleFriendRequestReceived(event.request);

                // Show notification (optional - can integrate with toast)
                if ('Notification' in window && Notification.permission === 'granted') {
                    new Notification('New Friend Request', {
                        body: `${event.request.requester.username} sent you a friend request`,
                        icon: event.request.requester.avatarUrl || undefined,
                    });
                }
            }
        );

        // Friend request accepted
        const unsubscribeFriendRequestAccepted = socialSignalRService.onFriendRequestAccepted(
            (event) => {
                console.log('[useSocialSignalR] Friend request accepted:', event);
                handleFriendRequestAccepted(event.requestId, event.friend);

                // Show notification
                if ('Notification' in window && Notification.permission === 'granted') {
                    new Notification('Friend Request Accepted', {
                        body: `${event.friend.username} accepted your friend request`,
                        icon: event.friend.avatarUrl || undefined,
                    });
                }
            }
        );

        // Friend request declined
        const unsubscribeFriendRequestDeclined = socialSignalRService.onFriendRequestDeclined(
            (event) => {
                console.log('[useSocialSignalR] Friend request declined:', event);
                // Refresh sent requests to remove the declined one
                fetchSentRequests();
            }
        );

        // Friend request cancelled
        const unsubscribeFriendRequestCancelled = socialSignalRService.onFriendRequestCancelled(
            (event) => {
                console.log('[useSocialSignalR] Friend request cancelled:', event);
                // Refresh received requests to remove the cancelled one
                fetchReceivedRequests();
            }
        );

        // Friend removed
        const unsubscribeFriendRemoved = socialSignalRService.onFriendRemoved((event) => {
            console.log('[useSocialSignalR] Friend removed:', event);
            handleUnfriended(event.friendId);
        });

        // User online status changed
        const unsubscribeUserOnlineStatusChanged = socialSignalRService.onUserOnlineStatusChanged(
            (event) => {
                console.log('[useSocialSignalR] User online status changed:', event);
                handleFriendOnlineStatusChanged(
                    event.userId,
                    event.isOnline ? 'online' : 'offline'
                );
            }
        );

        // Profile updated
        const unsubscribeProfileUpdated = socialSignalRService.onProfileUpdated((event) => {
            console.log('[useSocialSignalR] Profile updated:', event);
            // Refresh friends list to get updated profile info
            fetchFriends();
        });

        // Friend suggestions updated
        const unsubscribeFriendSuggestionsUpdated =
            socialSignalRService.onFriendSuggestionsUpdated((event) => {
                console.log('[useSocialSignalR] Friend suggestions updated:', event);
                // Refresh suggestions
                fetchSuggestions();
            });

        // Cleanup subscriptions
        return () => {
            unsubscribeFriendRequestReceived();
            unsubscribeFriendRequestAccepted();
            unsubscribeFriendRequestDeclined();
            unsubscribeFriendRequestCancelled();
            unsubscribeFriendRemoved();
            unsubscribeUserOnlineStatusChanged();
            unsubscribeProfileUpdated();
            unsubscribeFriendSuggestionsUpdated();
        };
    }, [
        handleFriendRequestReceived,
        handleFriendRequestAccepted,
        handleFriendOnlineStatusChanged,
        handleUnfriended,
        fetchReceivedRequests,
        fetchSentRequests,
        fetchFriends,
        fetchSuggestions,
    ]);

    // Update online status when user leaves/returns
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                socialSignalRService.updateOnlineStatus(false);
            } else {
                socialSignalRService.updateOnlineStatus(true);
            }
        };

        const handleBeforeUnload = () => {
            socialSignalRService.updateOnlineStatus(false);
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    // Disconnect when component unmounts
    useEffect(() => {
        return () => {
            if (user) {
                socialSignalRService.updateOnlineStatus(false);
                socialSignalRService.leaveUserGroup(user.id);
            }
        };
    }, [user]);

    const updateOnlineStatus = useCallback((isOnline: boolean) => {
        socialSignalRService.updateOnlineStatus(isOnline);
    }, []);

    return {
        connectionState,
        isConnected: connectionState === HubConnectionState.Connected,
        updateOnlineStatus,
    };
}
