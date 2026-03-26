import { AlertCircle, Bell, CheckCircle, ChevronLeft, ChevronRight, Filter, Info, Trash2, TrendingUp, XCircle } from 'lucide-react';
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
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
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

    const handleClearAll = () => {
        setNotifications([]);
        toast.success('All notifications cleared');
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'success': return 'text-green-400 bg-green-500/20 border-green-500/30';
            case 'warning': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
            case 'error': return 'text-red-400 bg-red-500/20 border-red-500/30';
            case 'trade': return 'text-[#2F6BFF] bg-[#2F6BFF]/20 border-[#2F6BFF]/30';
            case 'info': return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
            default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircle size={16} className="text-green-400" />;
            case 'warning': return <AlertCircle size={16} className="text-yellow-400" />;
            case 'error': return <XCircle size={16} className="text-red-400" />;
            case 'trade': return <TrendingUp size={16} className="text-[#2F6BFF]" />;
            case 'info': return <Info size={16} className="text-gray-400" />;
            default: return <Bell size={16} className="text-gray-400" />;
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

    // Pagination
    const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentNotifications = filteredNotifications.slice(startIndex, endIndex);

    // Reset to page 1 when filter changes
    const handleFilterChange = (filter: string) => {
        setSelectedFilter(filter);
        setCurrentPage(1);
    };

    return (
        <div className="px-4 sm:px-6 lg:px-8 py-4 w-full max-w-9xl mx-auto">
            {/* Page header */}
            <div className="relative mb-4 p-3 rounded-lg bg-gradient-to-br from-[#2F6BFF]/10 via-[#16124A] to-[#FFA62B]/10 border border-[#2F6BFF]/20">
                <div className="sm:flex sm:justify-between sm:items-center">
                    <div className="mb-2 sm:mb-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                            <div className="p-1.5 bg-[#2F6BFF]/20 rounded-lg">
                                <Bell size={16} className="text-[#2F6BFF]" />
                            </div>
                            <h1 className="text-body-dashboard font-bold text-[#efdede] drop-shadow-[0_0_6px_rgba(160,167,181,0.3)]">Notifications</h1>
                            {unreadCount > 0 && (
                                <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-[9px] font-bold">
                                    {unreadCount}
                                </span>
                            )}
                        </div>
                        <p className="text-micro text-gray-300 ml-8">Stay updated with your latest notifications</p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                        <button
                            onClick={handleMarkAllAsRead}
                            disabled={unreadCount === 0}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#2F6BFF]/30 bg-[#16124A] text-gray-300 hover:bg-[#1E1854] disabled:opacity-30 transition-all duration-300 text-micro"
                        >
                            <CheckCircle size={14} />
                            <span>Mark All Read</span>
                        </button>
                        <button
                            onClick={handleClearAll}
                            disabled={notifications.length === 0}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 disabled:opacity-30 transition-all duration-300 text-micro"
                        >
                            <Trash2 size={14} />
                            <span>Clear All</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
                {/* Unread */}
                <div className="relative overflow-hidden bg-gradient-to-br from-[#16124A] to-[#0B0633] rounded-lg p-2 border border-[#2F6BFF]/30 hover:border-[#2F6BFF]/60 transition-all duration-300 hover-lift group">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-[#2F6BFF]/5 rounded-full blur-xl group-hover:bg-[#2F6BFF]/10 transition-all duration-300"></div>
                    <div className="relative">
                        <div className="flex items-center justify-between mb-1">
                            <div className="p-0.5 bg-gradient-to-br from-[#2F6BFF]/20 to-[#2F6BFF]/5 rounded group-hover:scale-110 transition-transform duration-300">
                                <Bell size={14} className="text-[#2F6BFF]" />
                            </div>
                            <span className="text-[10px] text-gray-400 font-medium">Unread</span>
                        </div>
                        <div className="text-small-dashboard font-bold text-[#2F6BFF] font-tabular">{unreadCount}</div>
                        <div className="text-[10px] text-gray-400">New Notifications</div>
                    </div>
                </div>

                {/* Success */}
                <div className="relative overflow-hidden bg-gradient-to-br from-[#16124A] to-[#0B0633] rounded-lg p-2 border border-green-500/30 hover:border-green-500/60 transition-all duration-300 hover-lift group">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-green-500/5 rounded-full blur-xl group-hover:bg-green-500/10 transition-all duration-300"></div>
                    <div className="relative">
                        <div className="flex items-center justify-between mb-1">
                            <div className="p-0.5 bg-gradient-to-br from-green-500/20 to-green-500/5 rounded group-hover:scale-110 transition-transform duration-300">
                                <CheckCircle size={14} className="text-green-400" />
                            </div>
                            <span className="text-[10px] text-green-400 font-medium">Success</span>
                        </div>
                        <div className="text-small-dashboard font-bold text-[#efdede] font-tabular drop-shadow-[0_0_6px_rgba(160,167,181,0.3)]">{successCount}</div>
                        <div className="text-[10px] text-gray-400">Confirmations</div>
                    </div>
                </div>

                {/* Warnings */}
                <div className="relative overflow-hidden bg-gradient-to-br from-[#16124A] to-[#0B0633] rounded-lg p-2 border border-yellow-500/30 hover:border-yellow-500/60 transition-all duration-300 hover-lift group">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-500/5 rounded-full blur-xl group-hover:bg-yellow-500/10 transition-all duration-300"></div>
                    <div className="relative">
                        <div className="flex items-center justify-between mb-1">
                            <div className="p-0.5 bg-gradient-to-br from-yellow-500/20 to-yellow-500/5 rounded group-hover:scale-110 transition-transform duration-300">
                                <AlertCircle size={14} className="text-yellow-400" />
                            </div>
                            <span className="text-[10px] text-yellow-400 font-medium">Warnings</span>
                        </div>
                        <div className="text-small-dashboard font-bold text-[#efdede] font-tabular drop-shadow-[0_0_6px_rgba(160,167,181,0.3)]">{warningCount}</div>
                        <div className="text-[10px] text-gray-400">Alerts</div>
                    </div>
                </div>

                {/* Errors */}
                <div className="relative overflow-hidden bg-gradient-to-br from-[#16124A] to-[#0B0633] rounded-lg p-2 border border-red-500/30 hover:border-red-500/60 transition-all duration-300 hover-lift group">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/5 rounded-full blur-xl group-hover:bg-red-500/10 transition-all duration-300"></div>
                    <div className="relative">
                        <div className="flex items-center justify-between mb-1">
                            <div className="p-0.5 bg-gradient-to-br from-red-500/20 to-red-500/5 rounded group-hover:scale-110 transition-transform duration-300">
                                <XCircle size={14} className="text-red-400" />
                            </div>
                            <span className="text-[10px] text-red-400 font-medium">Errors</span>
                        </div>
                        <div className="text-small-dashboard font-bold text-[#efdede] font-tabular drop-shadow-[0_0_6px_rgba(160,167,181,0.3)]">{errorCount}</div>
                        <div className="text-[10px] text-gray-400">Failed Actions</div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="mb-3 flex items-center gap-2 p-2 bg-[#0B0633] border border-[#2F6BFF]/30 rounded-lg">
                <Filter size={14} className="text-gray-400" />
                <div className="flex gap-1 flex-wrap">
                    {['all', 'unread', 'success', 'warning', 'error', 'trade', 'info'].map((filter) => (
                        <button
                            key={filter}
                            onClick={() => handleFilterChange(filter)}
                            className={`px-2 py-1 rounded text-[10px] font-semibold transition-all duration-300 ${selectedFilter === filter
                                ? 'bg-[#2F6BFF] text-white'
                                : 'bg-[#16124A] text-gray-400 hover:text-[#efdede] hover:bg-[#1E1854]'
                                }`}
                        >
                            {filter.charAt(0).toUpperCase() + filter.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Notifications List */}
            <div className="space-y-1.5 mb-3">
                {filteredNotifications.length === 0 ? (
                    <div className="text-center py-6 text-gray-400 text-micro">
                        No notifications to display
                    </div>
                ) : (
                    currentNotifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`bg-gradient-to-br from-[#0B0633] to-[#16124A] rounded-lg border shadow-xl overflow-hidden hover:border-[#2F6BFF]/60 transition-all duration-300 ${notification.read ? 'border-gray-700/30 opacity-60' : 'border-[#2F6BFF]/30'
                                }`}
                        >
                            <div className="p-2">
                                <div className="flex items-start gap-2">
                                    {/* Icon */}
                                    <div className={`p-1.5 rounded-lg border ${getTypeColor(notification.type)}`}>
                                        {getTypeIcon(notification.type)}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2 mb-0.5">
                                            <h3 className="text-[10px] text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">{notification.title}</h3>
                                            <span className="text-[9px] text-gray-400 whitespace-nowrap">{notification.timestamp}</span>
                                        </div>
                                        <p className="text-[9px] text-gray-300 mb-1.5">{notification.message}</p>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2">
                                            {!notification.read && (
                                                <button
                                                    onClick={() => handleMarkAsRead(notification.id)}
                                                    className="text-[9px] text-[#2F6BFF] hover:text-[#2557c9] font-semibold transition-colors"
                                                >
                                                    Mark as read
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(notification.id)}
                                                className="text-[9px] text-red-400 hover:text-red-300 font-semibold transition-colors"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination */}
            {filteredNotifications.length > 0 && (
                <div className="flex items-center justify-between p-2 bg-[#0B0633] border border-[#2F6BFF]/30 rounded-lg">
                    <div className="text-[10px] text-gray-400">
                        Showing {startIndex + 1}-{Math.min(endIndex, filteredNotifications.length)} of {filteredNotifications.length}
                    </div>

                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="p-1 rounded bg-[#16124A] text-gray-400 hover:text-[#efdede] hover:bg-[#1E1854] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300"
                        >
                            <ChevronLeft size={14} />
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`px-2 py-1 rounded text-[10px] font-semibold transition-all duration-300 ${currentPage === page
                                    ? 'bg-[#2F6BFF] text-white'
                                    : 'bg-[#16124A] text-gray-400 hover:text-[#efdede] hover:bg-[#1E1854]'
                                    }`}
                            >
                                {page}
                            </button>
                        ))}

                        <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="p-1 rounded bg-[#16124A] text-gray-400 hover:text-[#efdede] hover:bg-[#1E1854] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300"
                        >
                            <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
