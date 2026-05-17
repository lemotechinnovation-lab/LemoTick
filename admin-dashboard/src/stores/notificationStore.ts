// Notification Store - Manages user notifications

import { create } from 'zustand';

// ============================================================================
// Types
// ============================================================================

export enum NotificationType {
    TRADE_ALERT = 'trade_alert',
    KYC_UPDATE = 'kyc_update',
    DEPOSIT = 'deposit',
    WITHDRAWAL = 'withdrawal',
    SYSTEM = 'system',
    SOCIAL = 'social',
    FRIEND_REQUEST = 'friend_request',
    MESSAGE = 'message',
}

export interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    icon?: string;
    iconColor?: string;
    link?: string;
    isRead: boolean;
    createdAt: string;
    metadata?: Record<string, any>;
}

// ============================================================================
// State Interface
// ============================================================================

interface NotificationState {
    notifications: Notification[];
    unreadCount: number;
    loading: boolean;
    error: string | null;

    // Actions
    fetchNotifications: () => Promise<void>;
    markAsRead: (notificationId: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    deleteNotification: (notificationId: string) => Promise<void>;
    clearAll: () => Promise<void>;

    // Real-time updates
    addNotification: (notification: Notification) => void;

    // Utility
    getUnreadCount: () => number;
}

// ============================================================================
// Store Implementation
// ============================================================================

export const useNotificationStore = create<NotificationState>((set, get) => ({
    notifications: [],
    unreadCount: 0,
    loading: false,
    error: null,

    // Fetch notifications from backend
    fetchNotifications: async () => {
        set({ loading: true, error: null });

        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('/api/notification', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            set({
                notifications: data,
                unreadCount: data.filter((n: Notification) => !n.isRead).length,
                loading: false,
            });
        } catch (error: any) {
            console.error('[notificationStore] Error fetching notifications:', error);
            set({
                error: error.message || 'Failed to fetch notifications',
                loading: false,
            });
        }
    },

    // Mark notification as read
    markAsRead: async (notificationId: string) => {
        try {
            const token = localStorage.getItem('authToken');
            await fetch(`/api/notification/${notificationId}/read`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            set((state) => ({
                notifications: state.notifications.map((n) =>
                    n.id === notificationId ? { ...n, isRead: true } : n
                ),
                unreadCount: Math.max(0, state.unreadCount - 1),
            }));
        } catch (error: any) {
            console.error('[notificationStore] Error marking notification as read:', error);
        }
    },

    // Mark all notifications as read
    markAllAsRead: async () => {
        try {
            const token = localStorage.getItem('authToken');
            await fetch('/api/notification/read-all', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            set((state) => ({
                notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
                unreadCount: 0,
            }));
        } catch (error: any) {
            console.error('[notificationStore] Error marking all as read:', error);
        }
    },

    // Delete a notification
    deleteNotification: async (notificationId: string) => {
        try {
            const token = localStorage.getItem('authToken');
            await fetch(`/api/notification/${notificationId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            set((state) => {
                const notification = state.notifications.find(n => n.id === notificationId);
                const wasUnread = notification && !notification.isRead;

                return {
                    notifications: state.notifications.filter((n) => n.id !== notificationId),
                    unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
                };
            });
        } catch (error: any) {
            console.error('[notificationStore] Error deleting notification:', error);
        }
    },

    // Clear all notifications
    clearAll: async () => {
        try {
            const token = localStorage.getItem('authToken');
            await fetch('/api/notification/clear', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            set({
                notifications: [],
                unreadCount: 0,
            });
        } catch (error: any) {
            console.error('[notificationStore] Error clearing notifications:', error);
        }
    },

    // Add notification (for real-time updates via SignalR)
    addNotification: (notification: Notification) => {
        set((state) => ({
            notifications: [notification, ...state.notifications],
            unreadCount: notification.isRead ? state.unreadCount : state.unreadCount + 1,
        }));
    },

    // Get unread count
    getUnreadCount: () => {
        return get().unreadCount;
    },
}));
