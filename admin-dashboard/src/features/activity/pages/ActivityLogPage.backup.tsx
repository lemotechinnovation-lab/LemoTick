import ModernBarChart from '@/components/charts/ModernBarChart';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageCard, PageContainer, PageGrid, Stack, StatsCard } from '@/components/ui/PageLayoutEnhanced';
import { Activity, AlertCircle, CheckCircle, Clock, Filter, Info, LogIn, LogOut, Settings, TrendingUp, User, XCircle } from 'lucide-react';
import { useState } from 'react';

interface ActivityLog {
    id: string;
    type: 'login' | 'logout' | 'trade' | 'deposit' | 'withdrawal' | 'settings' | 'security' | 'error';
    action: string;
    description: string;
    timestamp: string;
    ipAddress: string;
    device: string;
    status: 'success' | 'failed' | 'pending';
}

function ActivityLogPage() {
    const [selectedFilter, setSelectedFilter] = useState<string>('all');

    const [activities] = useState<ActivityLog[]>([
        {
            id: '1',
            type: 'login',
            action: 'User Login',
            description: 'Successful login from Chrome browser',
            timestamp: '2024-04-08 14:32:15',
            ipAddress: '192.168.1.100',
            device: 'Chrome on Windows',
            status: 'success',
        },
        {
            id: '2',
            type: 'trade',
            action: 'Trade Executed',
            description: 'EUR/USD trade executed at 1.0850',
            timestamp: '2024-04-08 14:25:43',
            ipAddress: '192.168.1.100',
            device: 'Chrome on Windows',
            status: 'success',
        },
        {
            id: '3',
            type: 'deposit',
            action: 'Deposit Initiated',
            description: 'Deposit of $500 via bank transfer',
            timestamp: '2024-04-08 13:15:22',
            ipAddress: '192.168.1.100',
            device: 'Chrome on Windows',
            status: 'pending',
        },
        {
            id: '4',
            type: 'settings',
            action: 'Settings Updated',
            description: 'Email notification preferences changed',
            timestamp: '2024-04-08 12:45:10',
            ipAddress: '192.168.1.100',
            device: 'Chrome on Windows',
            status: 'success',
        },
        {
            id: '5',
            type: 'security',
            action: 'Password Changed',
            description: 'Account password was updated',
            timestamp: '2024-04-08 11:30:05',
            ipAddress: '192.168.1.100',
            device: 'Chrome on Windows',
            status: 'success',
        },
        {
            id: '6',
            type: 'trade',
            action: 'Trade Failed',
            description: 'Insufficient funds for GBP/USD trade',
            timestamp: '2024-04-08 10:15:33',
            ipAddress: '192.168.1.100',
            device: 'Chrome on Windows',
            status: 'failed',
        },
        {
            id: '7',
            type: 'withdrawal',
            action: 'Withdrawal Completed',
            description: 'Withdrawal of $200 to bank account',
            timestamp: '2024-04-07 16:20:18',
            ipAddress: '192.168.1.100',
            device: 'Chrome on Windows',
            status: 'success',
        },
        {
            id: '8',
            type: 'logout',
            action: 'User Logout',
            description: 'User logged out successfully',
            timestamp: '2024-04-07 15:45:00',
            ipAddress: '192.168.1.100',
            device: 'Chrome on Windows',
            status: 'success',
        },
    ]);

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'login': return <LogIn className="w-5 h-5 text-green-400" />;
            case 'logout': return <LogOut className="w-5 h-5 text-gray-400" />;
            case 'trade': return <TrendingUp className="w-5 h-5 text-[#2F6BFF]" />;
            case 'deposit': return <CheckCircle className="w-5 h-5 text-green-400" />;
            case 'withdrawal': return <XCircle className="w-5 h-5 text-yellow-400" />;
            case 'settings': return <Settings className="w-5 h-5 text-purple-400" />;
            case 'security': return <AlertCircle className="w-5 h-5 text-red-400" />;
            case 'error': return <XCircle className="w-5 h-5 text-red-400" />;
            default: return <Info className="w-5 h-5 text-gray-400" />;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'login': return { bg: 'rgba(76, 175, 80, 0.2)', border: 'border-green-500/30' };
            case 'logout': return { bg: 'rgba(136, 136, 136, 0.2)', border: 'border-gray-500/30' };
            case 'trade': return { bg: 'rgba(47, 107, 255, 0.2)', border: 'border-[#2F6BFF]/30' };
            case 'deposit': return { bg: 'rgba(76, 175, 80, 0.2)', border: 'border-green-500/30' };
            case 'withdrawal': return { bg: 'rgba(255, 152, 0, 0.2)', border: 'border-yellow-500/30' };
            case 'settings': return { bg: 'rgba(156, 39, 176, 0.2)', border: 'border-purple-500/30' };
            case 'security': return { bg: 'rgba(239, 83, 80, 0.2)', border: 'border-red-500/30' };
            case 'error': return { bg: 'rgba(239, 83, 80, 0.2)', border: 'border-red-500/30' };
            default: return { bg: 'rgba(136, 136, 136, 0.2)', border: 'border-gray-500/30' };
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'success': return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'failed': return 'bg-red-500/20 text-red-400 border-red-500/30';
            case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };

    const filteredActivities = activities.filter(a => {
        if (selectedFilter === 'all') return true;
        return a.type === selectedFilter;
    });

    const stats = {
        total: activities.length,
        today: activities.filter(a => a.timestamp.includes('2024-04-08')).length,
        success: activities.filter(a => a.status === 'success').length,
        failed: activities.filter(a => a.status === 'failed').length,
    };

    // Activity distribution by type
    const activityDistribution = [
        { label: 'Login', value: activities.filter(a => a.type === 'login').length, color: '#4CAF50' },
        { label: 'Trade', value: activities.filter(a => a.type === 'trade').length, color: '#2F6BFF' },
        { label: 'Deposit', value: activities.filter(a => a.type === 'deposit').length, color: '#10B981' },
        { label: 'Withdraw', value: activities.filter(a => a.type === 'withdrawal').length, color: '#FFA726' },
        { label: 'Settings', value: activities.filter(a => a.type === 'settings').length, color: '#9C27B0' },
        { label: 'Security', value: activities.filter(a => a.type === 'security').length, color: '#EF5350' },
    ];

    return (
        <PageContainer maxWidth="xl">
            <Stack spacing="lg">
                {/* Page Header */}
                <PageHeader
                    title="ACTIVITY LOG"
                    description="Track all account activities and actions"
                    icon={Activity}
                />

                {/* Stats Cards */}
                <PageGrid cols={4}>
                    <StatsCard
                        icon={<Activity className="w-5 h-5" />}
                        value={stats.total}
                        label="All Activities"
                        iconColor="text-[#2F6BFF]"
                    />
                    <StatsCard
                        icon={<Clock className="w-5 h-5" />}
                        value={stats.today}
                        label="Recent Actions"
                        iconColor="text-purple-400"
                    />
                    <StatsCard
                        icon={<CheckCircle className="w-5 h-5" />}
                        value={stats.success}
                        label="Completed"
                        iconColor="text-green-400"
                    />
                    <StatsCard
                        icon={<XCircle className="w-5 h-5" />}
                        value={stats.failed}
                        label="Errors"
                        iconColor="text-red-400"
                    />
                </PageGrid>

                {/* Activity Distribution Chart */}
                <PageCard padding="lg">
                    <h3 className="text-base font-semibold text-white mb-4">Activity Distribution by Type</h3>
                    <ModernBarChart
                        data={activityDistribution}
                        height={180}
                        showValues={true}
                    />
                </PageCard>

                {/* Filters */}
                <div className="flex items-center gap-2 p-3 bg-[#16124A]/50 border border-[#2F6BFF]/20 rounded-xl">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <div className="flex gap-2 flex-wrap">
                        {['all', 'login', 'logout', 'trade', 'deposit', 'withdrawal', 'settings', 'security'].map((filter) => (
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

                {/* Activity List */}
                <Stack spacing="md">
                    {filteredActivities.map((activity) => {
                        const typeColors = getTypeColor(activity.type);
                        return (
                            <div
                                key={activity.id}
                                className={`p-4 rounded-xl bg-[#16124A]/50 border ${typeColors.border} hover:border-opacity-100 transition-all duration-300 hover:transform hover:scale-[1.01]`}
                            >
                                <div className="flex items-start gap-3">
                                    <div
                                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                                        style={{ background: typeColors.bg }}
                                    >
                                        {getTypeIcon(activity.type)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                            <h3 className="text-base font-semibold text-white">{activity.action}</h3>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(activity.status)}`}>
                                                {activity.status}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-300 mb-2">{activity.description}</p>
                                        <div className="flex items-center gap-3 text-xs text-gray-400">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {activity.timestamp}
                                            </span>
                                            <span>•</span>
                                            <span className="flex items-center gap-1">
                                                <User className="w-3 h-3" />
                                                {activity.device}
                                            </span>
                                            <span>•</span>
                                            <span>IP: {activity.ipAddress}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </Stack>
            </Stack>
        </PageContainer>
    );
}

export default ActivityLogPage;


