import { QUERY_KEYS } from '@/config/constants'
import { useAuthStore } from '@features/auth/stores/authStore'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { formatDateTime } from '@utils/format'
import { Bell, BellOff, Check, CheckCheck, Trash2 } from 'lucide-react'
import { notificationService } from '../services/notificationService'

export default function NotificationsPage() {
    const { user } = useAuthStore()
    const queryClient = useQueryClient()

    // Fetch notifications
    const { data: notifications, isLoading, error } = useQuery({
        queryKey: [...QUERY_KEYS.NOTIFICATIONS, user?.id],
        queryFn: () => notificationService.getInvestorNotifications(user!.id),
        enabled: !!user?.id,
    })

    // Mark as read mutation
    const markAsReadMutation = useMutation({
        mutationFn: (notificationId: string) => notificationService.markAsRead(notificationId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [...QUERY_KEYS.NOTIFICATIONS, user?.id] })
        },
    })

    // Mark all as read mutation
    const markAllAsReadMutation = useMutation({
        mutationFn: () => notificationService.markAllAsRead(user!.id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [...QUERY_KEYS.NOTIFICATIONS, user?.id] })
        },
    })

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: (notificationId: string) => notificationService.deleteNotification(notificationId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [...QUERY_KEYS.NOTIFICATIONS, user?.id] })
        },
    })

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'Success':
                return 'text-green-600'
            case 'Warning':
                return 'text-yellow-600'
            case 'Error':
                return 'text-red-600'
            case 'Info':
                return 'text-blue-600'
            default:
                return 'text-gray-600'
        }
    }

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'High':
                return 'bg-red-100 text-red-800'
            case 'Medium':
                return 'bg-yellow-100 text-yellow-800'
            case 'Low':
                return 'bg-gray-100 text-gray-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const unreadCount = notifications?.filter(n => !n.isRead).length || 0

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading notifications...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-red-600">Error loading notifications</p>
                    <p className="text-sm text-gray-500 mt-2">Please try refreshing the page</p>
                </div>
            </div>
        )
    }

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                    <p className="text-gray-600">
                        {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
                    </p>
                </div>
                {unreadCount > 0 && (
                    <button
                        className="btn-secondary flex items-center space-x-2"
                        onClick={() => markAllAsReadMutation.mutate()}
                        disabled={markAllAsReadMutation.isPending}
                    >
                        <CheckCheck className="h-4 w-4" />
                        <span>Mark All as Read</span>
                    </button>
                )}
            </div>

            {notifications && notifications.length > 0 ? (
                <div className="space-y-3">
                    {notifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`card transition-all ${!notification.isRead ? 'bg-primary-50 border-primary-200' : 'bg-white'}`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-4 flex-1">
                                    <div className={`rounded-full p-2 ${!notification.isRead ? 'bg-primary-100' : 'bg-gray-100'}`}>
                                        {!notification.isRead ? (
                                            <Bell className={`h-5 w-5 ${getTypeColor(notification.type)}`} />
                                        ) : (
                                            <BellOff className="h-5 w-5 text-gray-400" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2">
                                            <h3 className={`font-bold ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                                                {notification.title}
                                            </h3>
                                            <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getPriorityBadge(notification.priority)}`}>
                                                {notification.priority}
                                            </span>
                                        </div>
                                        <p className={`mt-1 text-sm ${!notification.isRead ? 'text-gray-700' : 'text-gray-600'}`}>
                                            {notification.message}
                                        </p>
                                        <p className="mt-2 text-xs text-gray-500">
                                            {formatDateTime(notification.createdAt)}
                                            {notification.readAt && ` • Read ${formatDateTime(notification.readAt)}`}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2 ml-4">
                                    {!notification.isRead && (
                                        <button
                                            className="btn-secondary text-primary-600 hover:bg-primary-50"
                                            onClick={() => markAsReadMutation.mutate(notification.id)}
                                            disabled={markAsReadMutation.isPending}
                                            title="Mark as read"
                                        >
                                            <Check className="h-4 w-4" />
                                        </button>
                                    )}
                                    <button
                                        className="btn-secondary text-red-600 hover:bg-red-50"
                                        onClick={() => {
                                            if (confirm('Delete this notification?')) {
                                                deleteMutation.mutate(notification.id)
                                            }
                                        }}
                                        disabled={deleteMutation.isPending}
                                        title="Delete"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="card flex flex-col items-center justify-center py-12">
                    <Bell className="h-12 w-12 text-gray-400" />
                    <h3 className="mt-4 text-lg font-medium text-gray-900">No notifications</h3>
                    <p className="mt-2 text-center text-sm text-gray-500">
                        You're all caught up! Notifications will appear here.
                    </p>
                </div>
            )}
        </div>
    )
}

