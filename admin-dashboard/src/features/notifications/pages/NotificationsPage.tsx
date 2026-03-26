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
                return '#4CAF50'
            case 'Warning':
                return '#FF6B35'
            case 'Error':
                return '#ef5350'
            case 'Info':
                return '#2196F3'
            default:
                return '#888'
        }
    }

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'High':
                return { bg: 'rgba(239, 83, 80, 0.2)', color: '#ef5350' }
            case 'Medium':
                return { bg: 'rgba(255, 107, 53, 0.2)', color: '#FF6B35' }
            case 'Low':
                return { bg: 'rgba(136, 136, 136, 0.2)', color: '#888' }
            default:
                return { bg: 'rgba(136, 136, 136, 0.2)', color: '#888' }
        }
    }

    const unreadCount = notifications?.filter(n => !n.isRead).length || 0

    if (isLoading) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '400px'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        border: '3px solid rgba(255, 107, 53, 0.3)',
                        borderTop: '3px solid #FF6B35',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto'
                    }} />
                    <p style={{ marginTop: '16px', color: '#888', fontSize: '14px' }}>Loading notifications...</p>
                    <style>{`
                        @keyframes spin {
                            from { transform: rotate(0deg); }
                            to { transform: rotate(360deg); }
                        }
                    `}</style>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '400px'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <p style={{ color: '#ef5350', fontSize: '16px', fontWeight: '600' }}>Error loading notifications</p>
                    <p style={{ color: '#888', fontSize: '14px', marginTop: '8px' }}>Please try refreshing the page</p>
                </div>
            </div>
        )
    }

    return (
        <div style={{ padding: '24px' }}>
            <div style={{
                marginBottom: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px'
            }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#FFF', marginBottom: '8px' }}>
                        Notifications
                    </h1>
                    <p style={{ color: '#888', fontSize: '14px' }}>
                        {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
                    </p>
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={() => markAllAsReadMutation.mutate()}
                        disabled={markAllAsReadMutation.isPending}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '12px 20px',
                            background: 'rgba(72, 92, 123, 0.3)',
                            color: '#FFF',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: markAllAsReadMutation.isPending ? 'not-allowed' : 'pointer',
                            opacity: markAllAsReadMutation.isPending ? 0.5 : 1,
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => !markAllAsReadMutation.isPending && (e.currentTarget.style.background = 'rgba(72, 92, 123, 0.5)')}
                        onMouseLeave={(e) => !markAllAsReadMutation.isPending && (e.currentTarget.style.background = 'rgba(72, 92, 123, 0.3)')}
                    >
                        <CheckCheck size={16} />
                        <span>Mark All as Read</span>
                    </button>
                )}
            </div>

            {notifications && notifications.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {notifications.map((notification) => {
                        const priorityColors = getPriorityBadge(notification.priority)
                        return (
                            <div
                                key={notification.id}
                                style={{
                                    background: !notification.isRead
                                        ? 'linear-gradient(180deg, rgba(255, 107, 53, 0.15) 0%, rgba(255, 107, 53, 0.05) 100%)'
                                        : 'linear-gradient(180deg, #1a1530 0%, #15111f 100%)',
                                    border: !notification.isRead
                                        ? '1px solid rgba(255, 107, 53, 0.3)'
                                        : '1px solid rgba(72, 92, 123, 0.3)',
                                    borderRadius: '12px',
                                    padding: '20px',
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', flex: 1 }}>
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '50%',
                                            background: !notification.isRead ? 'rgba(255, 107, 53, 0.2)' : 'rgba(72, 92, 123, 0.3)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0
                                        }}>
                                            {!notification.isRead ? (
                                                <Bell size={20} color={getTypeColor(notification.type)} />
                                            ) : (
                                                <BellOff size={20} color="#888" />
                                            )}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                                                <h3 style={{
                                                    fontSize: '16px',
                                                    fontWeight: '700',
                                                    color: !notification.isRead ? '#FFF' : '#CCC'
                                                }}>
                                                    {notification.title}
                                                </h3>
                                                <span style={{
                                                    display: 'inline-block',
                                                    padding: '4px 10px',
                                                    borderRadius: '12px',
                                                    fontSize: '11px',
                                                    fontWeight: '600',
                                                    background: priorityColors.bg,
                                                    color: priorityColors.color
                                                }}>
                                                    {notification.priority}
                                                </span>
                                            </div>
                                            <p style={{
                                                fontSize: '14px',
                                                color: !notification.isRead ? '#DDD' : '#888',
                                                marginBottom: '8px',
                                                lineHeight: '1.5'
                                            }}>
                                                {notification.message}
                                            </p>
                                            <p style={{ fontSize: '12px', color: '#666' }}>
                                                {formatDateTime(notification.createdAt)}
                                                {notification.readAt && ` • Read ${formatDateTime(notification.readAt)}`}
                                            </p>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                                        {!notification.isRead && (
                                            <button
                                                onClick={() => markAsReadMutation.mutate(notification.id)}
                                                disabled={markAsReadMutation.isPending}
                                                title="Mark as read"
                                                style={{
                                                    padding: '8px',
                                                    background: 'rgba(76, 175, 80, 0.2)',
                                                    color: '#4CAF50',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    cursor: markAsReadMutation.isPending ? 'not-allowed' : 'pointer',
                                                    opacity: markAsReadMutation.isPending ? 0.5 : 1,
                                                    transition: 'all 0.2s',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                                onMouseEnter={(e) => !markAsReadMutation.isPending && (e.currentTarget.style.background = 'rgba(76, 175, 80, 0.3)')}
                                                onMouseLeave={(e) => !markAsReadMutation.isPending && (e.currentTarget.style.background = 'rgba(76, 175, 80, 0.2)')}
                                            >
                                                <Check size={16} />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => {
                                                if (confirm('Delete this notification?')) {
                                                    deleteMutation.mutate(notification.id)
                                                }
                                            }}
                                            disabled={deleteMutation.isPending}
                                            title="Delete"
                                            style={{
                                                padding: '8px',
                                                background: 'rgba(239, 83, 80, 0.2)',
                                                color: '#ef5350',
                                                border: 'none',
                                                borderRadius: '8px',
                                                cursor: deleteMutation.isPending ? 'not-allowed' : 'pointer',
                                                opacity: deleteMutation.isPending ? 0.5 : 1,
                                                transition: 'all 0.2s',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                            onMouseEnter={(e) => !deleteMutation.isPending && (e.currentTarget.style.background = 'rgba(239, 83, 80, 0.3)')}
                                            onMouseLeave={(e) => !deleteMutation.isPending && (e.currentTarget.style.background = 'rgba(239, 83, 80, 0.2)')}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            ) : (
                <div style={{
                    background: 'linear-gradient(180deg, #1a1530 0%, #15111f 100%)',
                    border: '1px solid rgba(72, 92, 123, 0.3)',
                    borderRadius: '12px',
                    padding: '48px 24px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Bell size={48} color="#888" style={{ opacity: 0.5, marginBottom: '16px' }} />
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#FFF', marginBottom: '8px' }}>
                        No notifications
                    </h3>
                    <p style={{ fontSize: '14px', color: '#888', textAlign: 'center' }}>
                        You're all caught up! Notifications will appear here.
                    </p>
                </div>
            )}
        </div>
    )
}

