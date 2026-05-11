import ModernBarChart from '@/components/charts/ModernBarChart';
import { PageHeader } from '@/components/ui/PageHeader';
import { ContentSection, PageCard, PageContainer, PageGrid, Stack, StatsCard } from '@/components/ui/PageLayoutEnhanced';
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
            case 'login': return <LogIn className="w-6 h-6 text-green-400" />;
            case 'logout': return <LogOut className="w-6 h-6 text-gray-400" />;
            case 'trade': return <TrendingUp className="w-6 h-6 text-[#2F6BFF]" />;
            case 'deposit': return <CheckCircle className="w-6 h-6 text-green-400" />;
            case 'withdrawal': return <XCircle className="w-6 h-6 text-yellow-400" />;
            case 'settings': return <Settings className="w-6 h-6 text-purple-400" />;
            case 'security': return <AlertCircle className="w-6 h-6 text-red-400" />;
            case 'error': return <XCircle className="w-6 h-6 text-red-400" />;
            default: return <Info className="w-6 h-6 text-gray-400" />;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'login': return { from: 'from-green-500/10', to: 'to-green-600/5', border: 'border-green-500/30' };
            case 'logout': return { from: 'from-gray-500/10', to: 'to-gray-600/5', border: 'border-gray-500/30' };
            case 'trade': return { from: 'from-[#2F6BFF]/10', to: 'to-[#1E40AF]/5', border: 'border-[#2F6BFF]/30' };
            case 'deposit': return { from: 'from-green-500/10', to: 'to-green-600/5', border: 'border-green-500/30' };
            case 'withdrawal': return { from: 'from-yellow-500/10', to: 'to-yellow-600/5', border: 'border-yellow-500/30' };
            case 'settings': return { from: 'from-purple-500/10', to: 'to-purple-600/5', border: 'border-purple-500/30' };
            case 'security': return { from: 'from-red-500/10', to: 'to-red-600/5', border: 'border-red-500/30' };
            case 'error': return { from: 'from-red-500/10', to: 'to-red-600/5', border: 'border-red-500/30' };
            default: return { from: 'from-gray-500/10', to: 'to-gray-600/5', border: 'border-gray-500/30' };
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

                {/* Activity Cards - 3 COLUMN GRID */}
                <ContentSection title="Activity Timeline">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
                        {filteredActivities.map((activity) => {
                            const typeColors = getTypeColor(activity.type);
                            return (
                                <div
                                    key={activity.id}
                                    className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-[#1a1347]/90 via-[#16124A]/80 to-[#0B0633]/90 backdrop-blur-xl border border-white/10 hover:border-[#2F6BFF]/50 transition-all duration-500 hover:shadow-2xl hover:shadow-[#2F6BFF]/20 hover:-translate-y-1"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-[#2F6BFF]/0 via-[#2F6BFF]/5 to-[#2F6BFF]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                                    <div className="relative p-5">
                                        {/* Header */}
                                        <div className="flex items-start gap-3 mb-4">
                                            <div className={`shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${typeColors.from} ${typeColors.to} flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110 border ${typeColors.border}`}>
                                                {getTypeIcon(activity.type)}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-base font-bold text-white mb-2 group-hover:text-[#2F6BFF] transition-colors duration-300 truncate">
                                                    {activity.action}
                                                </h3>
                                                <span className={`px-2 py-1 rounded-md text-[10px] font-bold border backdrop-blur-sm ${getStatusColor(activity.status)}`}>
                                                    {activity.status.toUpperCase()}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Description */}
                                        <p className="text-xs text-gray-300 mb-4 line-clamp-2">{activity.description}</p>

                                        {/* Metrics */}
                                        <div className="grid grid-cols-1 gap-2">
                                            <div className="group/metric relative overflow-hidden p-3 rounded-lg bg-gradient-to-br from-[#2F6BFF]/10 to-[#1E40AF]/5 border border-[#2F6BFF]/20 hover:border-[#2F6BFF]/40 backdrop-blur-sm transition-all duration-300 hover:scale-105">
                                                <div className="absolute top-0 right-0 w-16 h-16 bg-[#2F6BFF]/10 rounded-full blur-xl group-hover/metric:bg-[#2F6BFF]/20 transition-all duration-300" />
                                                <div className="relative">
                                                    <div className="flex items-center gap-1.5 mb-1">
                                                        <Clock className="w-3 h-3 text-[#2F6BFF]" />
                                                        <div className="text-[10px] font-semibold text-gray-400 uppercase">Timestamp</div>
                                                    </div>
                                                    <div className="text-sm font-bold text-white truncate">{activity.timestamp}</div>
                                                </div>
                                            </div>

                                            <div className="group/metric relative overflow-hidden p-3 rounded-lg bg-gradient-to-br from-[#8B5CF6]/10 to-[#7C3AED]/5 border border-[#8B5CF6]/20 hover:border-[#8B5CF6]/40 backdrop-blur-sm transition-all duration-300 hover:scale-105">
                                                <div className="absolute top-0 right-0 w-16 h-16 bg-[#8B5CF6]/10 rounded-full blur-xl group-hover/metric:bg-[#8B5CF6]/20 transition-all duration-300" />
                                                <div className="relative">
                                                    <div className="flex items-center gap-1.5 mb-1">
                                                        <User className="w-3 h-3 text-[#8B5CF6]" />
                                                        <div className="text-[10px] font-semibold text-gray-400 uppercase">Device</div>
                                                    </div>
                                                    <div className="text-sm font-bold text-white truncate">{activity.device}</div>
                                                </div>
                                            </div>

                                            <div className="group/metric relative overflow-hidden p-3 rounded-lg bg-gradient-to-br from-[#F59E0B]/10 to-[#D97706]/5 border border-[#F59E0B]/20 hover:border-[#F59E0B]/40 backdrop-blur-sm transition-all duration-300 hover:scale-105">
                                                <div className="absolute top-0 right-0 w-16 h-16 bg-[#F59E0B]/10 rounded-full blur-xl group-hover/metric:bg-[#F59E0B]/20 transition-all duration-300" />
                                                <div className="relative">
                                                    <div className="flex items-center gap-1.5 mb-1">
                                                        <Info className="w-3 h-3 text-[#F59E0B]" />
                                                        <div className="text-[10px] font-semibold text-gray-400 uppercase">IP Address</div>
                                                    </div>
                                                    <div className="text-sm font-bold text-white font-mono truncate">{activity.ipAddress}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </ContentSection>
            </Stack>
        </PageContainer>
    );
}

export default ActivityLogPage;
