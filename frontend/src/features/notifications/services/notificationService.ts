import { api } from '@/services/api'

export interface Notification {
    id: string
    investorId: string
    title: string
    message: string
    type: string
    priority: string
    isRead: boolean
    createdAt: string
    readAt: string | null
}

export interface NotificationPreferences {
    investorId: string
    emailNotifications: boolean
    emailOnDeposit: boolean
    emailOnWithdrawal: boolean
    emailOnTrade: boolean
    emailOnProfit: boolean
    emailOnLoss: boolean
    smsNotifications: boolean
    smsOnDeposit: boolean
    smsOnWithdrawal: boolean
    smsOnTrade: boolean
    pushNotifications: boolean
    pushOnDeposit: boolean
    pushOnWithdrawal: boolean
    pushOnTrade: boolean
}

export const notificationService = {
    /**
     * Get all notifications for an investor
     */
    getInvestorNotifications: async (investorId: string): Promise<Notification[]> => {
        return api.get(`/api/Notifications/investor/${investorId}`)
    },

    /**
     * Get unread notifications count
     */
    getUnreadCount: async (investorId: string): Promise<number> => {
        const response = await api.get<{ count: number }>(
            `/api/Notifications/investor/${investorId}/unread-count`
        )
        return response.count
    },

    /**
     * Mark notification as read
     */
    markAsRead: async (notificationId: string): Promise<void> => {
        return api.put(`/api/Notifications/${notificationId}/mark-as-read`)
    },

    /**
     * Mark all notifications as read
     */
    markAllAsRead: async (investorId: string): Promise<void> => {
        return api.put(`/api/Notifications/investor/${investorId}/mark-all-as-read`)
    },

    /**
     * Delete notification
     */
    deleteNotification: async (notificationId: string): Promise<void> => {
        return api.delete(`/api/Notifications/${notificationId}`)
    },

    /**
     * Get notification preferences
     */
    getPreferences: async (investorId: string): Promise<NotificationPreferences> => {
        return api.get(`/api/Preferences?investorId=${investorId}`)
    },

    /**
     * Update notification preferences
     */
    updatePreferences: async (
        investorId: string,
        preferences: Partial<NotificationPreferences>
    ): Promise<NotificationPreferences> => {
        return api.put(`/api/Preferences?investorId=${investorId}`, preferences)
    },
}

