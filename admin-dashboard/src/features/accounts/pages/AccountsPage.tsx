import ModernAreaChart from '@/components/charts/ModernAreaChart';
import { GlassCard, StatCard, StatusBadge } from '@/components/ui/DesignSystem';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageContainer, Stack } from '@/components/ui/PageLayoutEnhanced';
import { Activity, DollarSign, Eye, EyeOff, Plus, RefreshCw, TrendingUp, Users } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { AddAccountModal, ManageAccountModal, ViewAccountModal } from '../components/AccountModals';

export interface TradingAccount {
    id: string;
    accountId: string;
    accountType: 'demo' | 'live';
    balance: number;
    currency: string;
    status: 'active' | 'suspended' | 'closed';
    totalProfit: number;
    totalLoss: number;
    netProfit: number;
    profitPercentage: number;
    openPositions: number;
    totalTrades: number;
    winRate: number;
    createdAt: string;
    lastActivity: string;
}

export default function AccountsPage() {
    const [showBalances, setShowBalances] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isManageModalOpen, setIsManageModalOpen] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState<TradingAccount | null>(null);

    const [accounts] = useState<TradingAccount[]>([
        {
            id: '1',
            accountId: 'CR123456789',
            accountType: 'demo',
            balance: 10000,
            currency: 'USD',
            status: 'active',
            totalProfit: 2450.75,
            totalLoss: 890.25,
            netProfit: 1560.50,
            profitPercentage: 15.61,
            openPositions: 3,
            totalTrades: 147,
            winRate: 68.5,
            createdAt: '2024-01-15',
            lastActivity: '2 min ago',
        },
        {
            id: '2',
            accountId: 'CR987654321',
            accountType: 'live',
            balance: 5000,
            currency: 'USD',
            status: 'active',
            totalProfit: 890.25,
            totalLoss: 340.50,
            netProfit: 549.75,
            profitPercentage: 10.99,
            openPositions: 1,
            totalTrades: 89,
            winRate: 72.1,
            createdAt: '2024-02-20',
            lastActivity: '5 min ago',
        },
        {
            id: '3',
            accountId: 'CR456789123',
            accountType: 'demo',
            balance: 8500,
            currency: 'USD',
            status: 'suspended',
            totalProfit: 1200.00,
            totalLoss: 1540.50,
            netProfit: -340.50,
            profitPercentage: -4.01,
            openPositions: 0,
            totalTrades: 203,
            winRate: 45.2,
            createdAt: '2024-03-01',
            lastActivity: '2 days ago',
        },
    ]);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast.success('Accounts refreshed successfully!');
        setIsRefreshing(false);
    };

    const getStatusBadgeType = (status: string): 'success' | 'warning' | 'error' | 'inactive' => {
        switch (status) {
            case 'active': return 'success';
            case 'suspended': return 'warning';
            case 'closed': return 'inactive';
            default: return 'inactive';
        }
    };

    const getAccountTypeBadgeType = (type: string): 'warning' | 'info' => {
        return type === 'live' ? 'warning' : 'info';
    };

    const getAccountTypeBadgeTypeForStatus = (type: string): 'warning' | 'info' => {
        return type === 'live' ? 'warning' : 'info';
    };

    const getAccountTypeColor = (type: string) => {
        return type === 'live' ? 'accent-orange' : 'brand-blue';
    };

    const activeAccounts = accounts.filter(acc => acc.status === 'active').length;
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
    const totalProfit = accounts.reduce((sum, acc) => sum + acc.netProfit, 0);
    const avgWinRate = accounts.reduce((sum, acc) => sum + acc.winRate, 0) / accounts.length;

    const balanceTrendData = Array.from({ length: 30 }, (_, i) => {
        const baseBalance = totalBalance * 0.85;
        const growth = (totalBalance - baseBalance) * (i / 29);
        const variance = Math.sin(i * 0.5) * (totalBalance * 0.03);
        return baseBalance + growth + variance;
    });

    return (
        <PageContainer maxWidth="xl">
            <PageHeader
                title="TRADING ACCOUNTS"
                description="Manage and monitor your trading accounts"
                icon={Users}
                actions={
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-brand-blue/30 bg-[#16124A] text-gray-300 hover:bg-[#1E1854] hover:border-brand-blue disabled:opacity-50 transition-all duration-300 text-sm font-semibold shadow-lg hover:shadow-brand-blue/20"
                        >
                            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                            <span className="hidden sm:inline">Refresh</span>
                        </button>
                        <button
                            onClick={() => setShowBalances(!showBalances)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-brand-blue/30 bg-[#16124A] text-gray-300 hover:bg-[#1E1854] hover:border-brand-blue transition-all duration-300 text-sm font-semibold shadow-lg hover:shadow-brand-blue/20"
                        >
                            {showBalances ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            <span className="hidden sm:inline">{showBalances ? 'Hide' : 'Show'}</span>
                        </button>
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-blue to-[#3B82F6] hover:from-[#3B82F6] hover:to-brand-blue text-white transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-brand-blue/50 text-sm font-semibold"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Add Account</span>
                        </button>
                    </div>
                }
            />

            <Stack spacing="lg">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        icon={<Users className="w-6 h-6" />}
                        value={`${activeAccounts}/${accounts.length}`}
                        label="Trading Accounts"
                        variant="blue"
                        delay={0}
                    />
                    <StatCard
                        icon={<DollarSign className="w-6 h-6" />}
                        value={showBalances ? `$${totalBalance.toLocaleString()}` : '••••••'}
                        label="Total Balance"
                        variant="green"
                        delay={100}
                    />
                    <StatCard
                        icon={<TrendingUp className="w-6 h-6" />}
                        value={showBalances ? `$${totalProfit.toFixed(2)}` : '••••••'}
                        label="Net Profit"
                        variant={totalProfit >= 0 ? 'green' : 'red'}
                        change={{
                            value: parseFloat(((totalProfit / totalBalance) * 100).toFixed(1)),
                            isPositive: totalProfit >= 0
                        }}
                        delay={200}
                    />
                    <StatCard
                        icon={<Activity className="w-6 h-6" />}
                        value={`${avgWinRate.toFixed(1)}%`}
                        label="Win Rate"
                        variant="orange"
                        delay={300}
                    />
                </div>

                <GlassCard className="p-4 sm:p-6">
                    <div className="mb-4">
                        <h3 className="text-base sm:text-lg font-bold text-[#E8B4B8] mb-1 uppercase">Account Balance Trend</h3>
                        <p className="text-sm text-gray-200 font-medium">Combined balance over the last 30 days</p>
                    </div>
                    <div className="h-48 sm:h-64">
                        <ModernAreaChart
                            data={balanceTrendData}
                            color="#10B981"
                            gradientFrom="#10B981"
                            gradientTo="#34D399"
                            showGrid={true}
                            animate={true}
                        />
                    </div>
                </GlassCard>

                {/* Trading Accounts - 3 COLUMN GRID */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-[#E8B4B8] uppercase">Your Accounts</h3>
                            <p className="text-sm text-gray-200 font-medium">Manage your trading accounts</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
                        {accounts.map((account, index) => (
                            <GlassCard
                                key={account.id}
                                variant="blue"
                                className="p-0 animate-fade-in-up"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="p-5">
                                    {/* Header */}
                                    <div className="flex items-start gap-3 mb-4">
                                        <div className={`shrink-0 w-12 h-12 rounded-xl ${account.accountType === 'live' ? 'bg-gradient-to-br from-accent-orange to-orange-600' : 'bg-gradient-to-br from-brand-blue to-blue-600'} flex items-center justify-center shadow-lg ${account.accountType === 'live' ? 'shadow-accent-orange/30 group-hover:shadow-accent-orange/50' : 'shadow-brand-blue/30 group-hover:shadow-brand-blue/50'} transition-all duration-300 group-hover:scale-110`}>
                                            <Users className="w-6 h-6 text-white" />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-brand-blue transition-colors duration-300 font-mono truncate">
                                                {account.accountId}
                                            </h3>
                                            <div className="flex flex-wrap items-center gap-1.5 mb-2">
                                                <StatusBadge
                                                    status={getAccountTypeBadgeTypeForStatus(account.accountType)}
                                                    label={account.accountType === 'live' ? '🔴 LIVE' : '🎮 DEMO'}
                                                />
                                                <StatusBadge
                                                    status={getStatusBadgeType(account.status)}
                                                    label={account.status.toUpperCase()}
                                                    pulse={account.status === 'suspended'}
                                                />
                                                {account.winRate > 70 && (
                                                    <span className="px-2 py-1 rounded-md text-[10px] font-bold bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30">
                                                        🏆 HIGH
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-xs text-gray-400 truncate">
                                                <span>Created {account.createdAt}</span>
                                                <span className="mx-1">•</span>
                                                <span>{account.lastActivity}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Balance */}
                                    <div className="relative mb-4">
                                        <div className={`absolute inset-0 ${account.netProfit >= 0 ? 'bg-gradient-to-br from-[#10B981]/20 to-[#059669]/20' : 'bg-gradient-to-br from-[#EF4444]/20 to-[#DC2626]/20'} rounded-xl blur-lg`} />
                                        <div className={`relative px-4 py-3 rounded-xl ${account.netProfit >= 0 ? 'bg-gradient-to-br from-[#10B981]/10 to-[#059669]/10 border-[#10B981]/30' : 'bg-gradient-to-br from-[#EF4444]/10 to-[#DC2626]/10 border-[#EF4444]/30'} border backdrop-blur-sm`}>
                                            <div className={`text-[10px] font-semibold ${account.netProfit >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'} mb-0.5 tracking-wider uppercase`}>Balance</div>
                                            <div className="text-2xl font-black text-white tracking-tight">
                                                {showBalances ? `$${account.balance.toLocaleString()}` : '••••••'}
                                            </div>
                                            <div className="text-xs font-medium text-gray-400">{account.currency}</div>
                                        </div>
                                    </div>

                                    {/* Metrics - 2x3 Grid */}
                                    <div className="grid grid-cols-2 gap-2 mb-4">
                                        <div className={`group/metric relative overflow-hidden p-3 rounded-lg ${account.netProfit >= 0 ? 'bg-gradient-to-br from-[#10B981]/10 to-[#059669]/5 border-[#10B981]/20 hover:border-[#10B981]/40' : 'bg-gradient-to-br from-[#EF4444]/10 to-[#DC2626]/5 border-[#EF4444]/20 hover:border-[#EF4444]/40'} border backdrop-blur-sm transition-all duration-300 hover:scale-105`}>
                                            <div className={`absolute top-0 right-0 w-16 h-16 ${account.netProfit >= 0 ? 'bg-[#10B981]/10 group-hover/metric:bg-[#10B981]/20' : 'bg-[#EF4444]/10 group-hover/metric:bg-[#EF4444]/20'} rounded-full blur-xl transition-all duration-300`} />
                                            <div className="relative">
                                                <div className="flex items-center gap-1.5 mb-1">
                                                    <TrendingUp className={`w-3 h-3 ${account.netProfit >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`} />
                                                    <div className="text-[10px] font-semibold text-gray-400 uppercase">Profit</div>
                                                </div>
                                                <div className={`text-base font-bold ${account.netProfit >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'} truncate`}>
                                                    {showBalances ? `${account.netProfit >= 0 ? '+' : ''}$${account.netProfit.toFixed(2)}` : '••••'}
                                                </div>
                                            </div>
                                        </div>

                                        <div className={`group/metric relative overflow-hidden p-3 rounded-lg ${account.profitPercentage >= 0 ? 'bg-gradient-to-br from-[#10B981]/10 to-[#059669]/5 border-[#10B981]/20 hover:border-[#10B981]/40' : 'bg-gradient-to-br from-[#EF4444]/10 to-[#DC2626]/5 border-[#EF4444]/20 hover:border-[#EF4444]/40'} border backdrop-blur-sm transition-all duration-300 hover:scale-105`}>
                                            <div className={`absolute top-0 right-0 w-16 h-16 ${account.profitPercentage >= 0 ? 'bg-[#10B981]/10 group-hover/metric:bg-[#10B981]/20' : 'bg-[#EF4444]/10 group-hover/metric:bg-[#EF4444]/20'} rounded-full blur-xl transition-all duration-300`} />
                                            <div className="relative">
                                                <div className="flex items-center gap-1.5 mb-1">
                                                    <Activity className={`w-3 h-3 ${account.profitPercentage >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`} />
                                                    <div className="text-[10px] font-semibold text-gray-400 uppercase">ROI</div>
                                                </div>
                                                <div className={`text-base font-bold ${account.profitPercentage >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'} truncate`}>
                                                    {account.profitPercentage >= 0 ? '+' : ''}{account.profitPercentage.toFixed(2)}%
                                                </div>
                                            </div>
                                        </div>

                                        <div className="group/metric relative overflow-hidden p-3 rounded-lg bg-gradient-to-br from-[#2F6BFF]/10 to-[#1E40AF]/5 border border-[#2F6BFF]/20 hover:border-[#2F6BFF]/40 backdrop-blur-sm transition-all duration-300 hover:scale-105">
                                            <div className="absolute top-0 right-0 w-16 h-16 bg-[#2F6BFF]/10 rounded-full blur-xl group-hover/metric:bg-[#2F6BFF]/20 transition-all duration-300" />
                                            <div className="relative">
                                                <div className="flex items-center gap-1.5 mb-1">
                                                    <Activity className="w-3 h-3 text-[#2F6BFF]" />
                                                    <div className="text-[10px] font-semibold text-gray-400 uppercase">Positions</div>
                                                </div>
                                                <div className="text-base font-bold text-white truncate">
                                                    {account.openPositions}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="group/metric relative overflow-hidden p-3 rounded-lg bg-gradient-to-br from-[#8B5CF6]/10 to-[#7C3AED]/5 border border-[#8B5CF6]/20 hover:border-[#8B5CF6]/40 backdrop-blur-sm transition-all duration-300 hover:scale-105">
                                            <div className="absolute top-0 right-0 w-16 h-16 bg-[#8B5CF6]/10 rounded-full blur-xl group-hover/metric:bg-[#8B5CF6]/20 transition-all duration-300" />
                                            <div className="relative">
                                                <div className="flex items-center gap-1.5 mb-1">
                                                    <Activity className="w-3 h-3 text-[#8B5CF6]" />
                                                    <div className="text-[10px] font-semibold text-gray-400 uppercase">Trades</div>
                                                </div>
                                                <div className="text-base font-bold text-white truncate">
                                                    {account.totalTrades}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="group/metric relative overflow-hidden p-3 rounded-lg bg-gradient-to-br from-[#F59E0B]/10 to-[#D97706]/5 border border-[#F59E0B]/20 hover:border-[#F59E0B]/40 backdrop-blur-sm transition-all duration-300 hover:scale-105 col-span-2">
                                            <div className="absolute top-0 right-0 w-16 h-16 bg-[#F59E0B]/10 rounded-full blur-xl group-hover/metric:bg-[#F59E0B]/20 transition-all duration-300" />
                                            <div className="relative">
                                                <div className="flex items-center gap-1.5 mb-1">
                                                    <TrendingUp className="w-3 h-3 text-[#F59E0B]" />
                                                    <div className="text-[10px] font-semibold text-gray-400 uppercase">Win Rate</div>
                                                </div>
                                                <div className="text-base font-bold text-white">
                                                    {account.winRate}%
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-stretch gap-2">
                                        <button
                                            onClick={() => {
                                                setSelectedAccount(account);
                                                setIsViewModalOpen(true);
                                            }}
                                            className="flex-1 group/btn relative overflow-hidden px-3 py-2.5 rounded-lg border border-[#2F6BFF]/30 bg-[#16124A]/50 backdrop-blur-sm text-gray-300 hover:text-white hover:border-[#2F6BFF] transition-all duration-300 text-xs font-bold hover:shadow-lg hover:shadow-[#2F6BFF]/20"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-[#2F6BFF]/0 via-[#2F6BFF]/10 to-[#2F6BFF]/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
                                            <span className="relative flex items-center justify-center gap-1.5">
                                                <Eye className="w-3.5 h-3.5" />
                                                View
                                            </span>
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSelectedAccount(account);
                                                setIsManageModalOpen(true);
                                            }}
                                            className="flex-1 group/btn relative overflow-hidden px-3 py-2.5 rounded-lg bg-gradient-to-r from-[#2F6BFF] via-[#3B82F6] to-[#2F6BFF] bg-size-200 bg-pos-0 hover:bg-pos-100 text-white transition-all duration-500 shadow-lg shadow-[#2F6BFF]/30 hover:shadow-xl hover:shadow-[#2F6BFF]/50 text-xs font-bold hover:scale-[1.02]"
                                        >
                                            <span className="relative flex items-center justify-center gap-1.5">
                                                <Users className="w-3.5 h-3.5" />
                                                Manage
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </GlassCard>
                        ))}
                    </div>
                </div>
            </Stack>

            <AddAccountModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
            <ViewAccountModal isOpen={isViewModalOpen} account={selectedAccount} onClose={() => setIsViewModalOpen(false)} />
            <ManageAccountModal isOpen={isManageModalOpen} account={selectedAccount} onClose={() => setIsManageModalOpen(false)} />
        </PageContainer>
    );
}


