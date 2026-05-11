import { PageHeader } from '@/components/ui/PageHeader';
import { ContentSection, PageCard, PageContainer, PageGrid, PageSection, StatsCard } from '@/components/ui/PageLayoutEnhanced';
import { AlertCircle, Bell, BellOff, Check, CheckCircle, Filter, Info, Trash2, TrendingUp, XCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export interface Notification {
    id: string;
    type: 'info' | 'success' | 'warning' | 'error' | 'trade';
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
}

export default function NotificationsFullPage() {
    const [selectedFilter, setSelectedFilter] = useState<string>('all');
    const [notifications, setNotifications] = useState<Notification[]>([
        {
            id: '1',
            type: 'success',
            title: 'Trade Executed Successfully',
            message: 'Your EUR/USD trade has been executed at 1.0850',
            timestamp: '2 minutes ago',
            read: false,
        },
        {
            id: '2',
            type: 'trade',
            title: 'Position Closed',
            message: 'Your GBP/USD position closed with +$125.50 profit',
            timestamp: '15 minutes ago',
            read: false,
        },
        {
            id: '3',
            type: 'info',
            title: 'Account Verified',
            message: 'Your identity document has been approved',
            timestamp: '1 hour ago',
            read: true,
        },
        {
            id: '4',
            type: 'warning',
            title: 'Low Balance Alert',
            message: 'Your account balance is below $100. Please deposit funds.',
            timestamp: '2 hours ago',
            read: false,
        },
        {
            id: '5',
            type: 'error',
            title: 'Trade Failed',
            message: 'Insufficient funds to execute trade',
            timestamp: '3 hours ago',
            read: true,
        },
        {
            id: '6',
            type: 'success',
            title: 'Deposit Confirmed',
            message: 'Your deposit of $500 has been credited to your account',
            timestamp: '5 hours ago',
            read: true,
        },
        {
            id: '7',
            type: 'info',
            title: 'New Feature Available',
            message: 'Check out our new AI-powered trading indicators',
            timestamp: '1 day ago',
            read: true,
        },
        {
            id: '8',
            type: 'trade',
            title: 'Stop Loss Triggered',
            message: 'Your USD/JPY position was closed at stop loss',
            timestamp: '1 day ago',
            read: true,
        },
    ]);

    const handleMarkAsRead = (id: string) => {
        setNotifications(notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
        ));
        toast.success('Notification marked as read');
    };

    const handleMarkAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
        toast.success('All notifications marked as read');
    };

    const handleDelete = (id: string) => {
        setNotifications(notifications.filter(n => n.id !== id));
        toast.success('Notification deleted');
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'success': return { bg: 'rgba(76, 175, 80, 0.2)', color: '#4CAF50', border: 'border-green-500/30' };
            case 'warning': return { bg: 'rgba(255, 152, 0, 0.2)', color: '#FFA726', border: 'border-yellow-500/30' };
            case 'error': return { bg: 'rgba(239, 83, 80, 0.2)', color: '#ef5350', border: 'border-red-500/30' };
            case 'trade': return { bg: 'rgba(47, 107, 255, 0.2)', color: '#2F6BFF', border: 'border-[#2F6BFF]/30' };
            case 'info': return { bg: 'rgba(136, 136, 136, 0.2)', color: '#888', border: 'border-gray-500/30' };
            default: return { bg: 'rgba(136, 136, 136, 0.2)', color: '#888', border: 'border-gray-500/30' };
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircle className="w-6 h-6 text-green-400" />;
            case 'warning': return <AlertCircle className="w-6 h-6 text-yellow-400" />;
            case 'error': return <XCircle className="w-6 h-6 text-red-400" />;
            case 'trade': return <TrendingUp className="w-6 h-6 text-[#2F6BFF]" />;
            case 'info': return <Info className="w-6 h-6 text-gray-400" />;
            default: return <Bell className="w-6 h-6 text-gray-400" />;
        }
    };

    const filteredNotifications = notifications.filter(n => {
        if (selectedFilter === 'all') return true;
        if (selectedFilter === 'unread') return !n.read;
        return n.type === selectedFilter;
    });

    const unreadCount = notifications.filter(n => !n.read).length;
    const successCount = notifications.filter(n => n.type === 'success').length;
    const warningCount = notifications.filter(n => n.type === 'warning').length;
    const errorCount = notifications.filter(n => n.type === 'error').length;

    return (
        <PageContainer maxWidth="xl">
            <PageHeader
                title="NOTIFICATIONS"
                description={unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
                icon={Bell}
                badge={unreadCount > 0 ? unreadCount.toString() : undefined}
                actions={
                    unreadCount > 0 ? (
                        <button
                            onClick={handleMarkAllAsRead}
                            className="bg-gradient-to-r from-[#2F6BFF] to-[#FFA62B] text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                        >
                            <CheckCircle className="w-5 h-5" />
                            Mark All as Read
                        </button>
                    ) : undefined
                }
            />

            {/* Stats Cards */}
            <PageSection>
                <PageGrid cols={4}>
                    <StatsCard
                        icon={<Bell className="w-5 h-5" />}
                        value={unreadCount}
                        label="New Notifications"
                    />
                    <StatsCard
                        icon={<CheckCircle className="w-5 h-5" />}
                        value={successCount}
                        label="Confirmations"
                        iconColor="text-green-400"
                    />
                    <StatsCard
                        icon={<AlertCircle className="w-5 h-5" />}
                        value={warningCount}
                        label="Alerts"
                        iconColor="text-yellow-400"
                    />
                    <StatsCard
                        icon={<XCircle className="w-5 h-5" />}
                        value={errorCount}
                        label="Failed Actions"
                        iconColor="text-red-400"
                    />
                </PageGrid>
            </PageSection>

            {/* Filters */}
            <PageSection>
                <div className="flex items-center gap-2 p-3 bg-[#16124A]/50 border border-[#2F6BFF]/20 rounded-xl">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <div className="flex gap-2 flex-wrap">
                        {['all', 'unread', 'success', 'warning', 'error', 'trade', 'info'].map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setSelectedFilter(filter)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-300 ${selectedFilter === filter
                                    ? 'bg-[#2F6BFF] text-white'
                                    : 'bg-[#0B0633] text-gray-400 hover:text-white hover:bg-[#1E1854]'
                                    }`}
                            >
                                {filter.charAt(0).toUpperCase() + filter.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </PageSection>

            {/* Notifications List */}
            <PageSection>
                <ContentSection>
                    {filteredNotifications.length === 0 ? (
                        <PageCard>
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-gradient-to-br from-[#2F6BFF]/20 to-[#FFA62B]/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <Bell className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-2">
                                    No notifications
                                </h3>
                                <p className="text-sm text-gray-400">
                                    No notifications match your current filter
                                </p>
                            </div>
                        </PageCard>
                    ) : (
                        <div className="grid gap-4">
                            {filteredNotifications.map((notification) => {
                                const typeColors = getTypeColor(notification.type);
                                return (
                                    <div
                                        key={notification.id}
                                        className={`p-4 rounded-xl border transition-all duration-300 hover:transform hover:scale-[1.01] ${!notification.read
                                            ? `bg-[#16124A]/50 ${typeColors.border} hover:border-opacity-100`
                                            : 'bg-[#16124A]/50 border-[#2F6BFF]/20 hover:border-[#2F6BFF] opacity-70'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-start gap-3 flex-1">
                                                <div
                                                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                                                    style={{ background: typeColors.bg }}
                                                >
                                                    {!notification.read ? (
                                                        getTypeIcon(notification.type)
                                                    ) : (
                                                        <BellOff className="w-5 h-5 text-gray-400" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                                        <h3 className={`text-base font-semibold ${!notification.read ? 'text-white' : 'text-gray-300'}`}>
                                                            {notification.title}
                                                        </h3>
                                                        <span className="text-xs text-gray-400">
                                                            {notification.timestamp}
                                                        </span>
                                                    </div>
                                                    <p className={`text-xs leading-relaxed ${!notification.read ? 'text-gray-200' : 'text-gray-400'}`}>
                                                        {notification.message}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1.5 shrink-0">
                                                {!notification.read && (
                                                    <button
                                                        onClick={() => handleMarkAsRead(notification.id)}
                                                        title="Mark as read"
                                                        className="p-1.5 bg-green-500/20 border border-green-500/30 text-green-400 rounded-xl hover:bg-green-500/30 transition-all duration-300 flex items-center justify-center"
                                                    >
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(notification.id)}
                                                    title="Delete"
                                                    className="p-1.5 bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl hover:bg-red-500/30 transition-all duration-300 flex items-center justify-center"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </ContentSection>
            </PageSection>
        </PageContainer>
    );
}
