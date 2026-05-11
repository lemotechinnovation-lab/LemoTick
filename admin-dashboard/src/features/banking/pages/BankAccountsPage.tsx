import ModernBarChart from '@/components/charts/ModernBarChart';
import { PageHeader } from '@/components/ui/PageHeader';
import { ContentSection, PageContainer, PageGrid, Stack, StatsCard } from '@/components/ui/PageLayoutEnhanced';
import { Activity, Building2, DollarSign, Eye, EyeOff, Plus, RefreshCw, TrendingDown, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { LinkAccountModal, ManageAccountModal, ViewAccountModal } from '../components/BankAccountModals';

export interface BankAccount {
    id: string;
    accountName: string;
    accountNumber: string;
    bankName: string;
    accountType: 'checking' | 'savings' | 'business';
    currency: string;
    balance: number;
    status: 'active' | 'pending' | 'suspended' | 'closed';
    isDefault: boolean;
    totalDeposits: number;
    totalWithdrawals: number;
    lastTransaction: string;
    createdAt: string;
}

export default function BankAccountsPage() {
    const [showBalances, setShowBalances] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isManageModalOpen, setIsManageModalOpen] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);

    const [accounts] = useState<BankAccount[]>([
        {
            id: '1',
            accountName: 'Primary Checking',
            accountNumber: '****1234',
            bankName: 'Chase Bank',
            accountType: 'checking',
            currency: 'USD',
            balance: 15000,
            status: 'active',
            isDefault: true,
            totalDeposits: 45000,
            totalWithdrawals: 30000,
            lastTransaction: '2 hours ago',
            createdAt: '2024-01-15',
        },
        {
            id: '2',
            accountName: 'Savings Account',
            accountNumber: '****5678',
            bankName: 'Bank of America',
            accountType: 'savings',
            currency: 'USD',
            balance: 25000,
            status: 'active',
            isDefault: false,
            totalDeposits: 30000,
            totalWithdrawals: 5000,
            lastTransaction: '1 day ago',
            createdAt: '2024-02-01',
        },
        {
            id: '3',
            accountName: 'Business Account',
            accountNumber: '****9012',
            bankName: 'Wells Fargo',
            accountType: 'business',
            currency: 'USD',
            balance: 50000,
            status: 'pending',
            isDefault: false,
            totalDeposits: 50000,
            totalWithdrawals: 0,
            lastTransaction: 'Never',
            createdAt: '2024-03-05',
        },
    ]);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast.success('Bank accounts refreshed successfully!');
        setIsRefreshing(false);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'suspended': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
            case 'closed': return 'bg-red-500/20 text-red-400 border-red-500/30';
            default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };

    const getAccountTypeColor = (type: string) => {
        switch (type) {
            case 'checking': return 'bg-[#2F6BFF]/20 text-[#2F6BFF] border-[#2F6BFF]/30';
            case 'savings': return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'business': return 'bg-[#FFA62B]/20 text-[#FFA62B] border-[#FFA62B]/30';
            default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };

    const activeAccounts = accounts.filter(acc => acc.status === 'active').length;
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
    const totalDeposits = accounts.reduce((sum, acc) => sum + acc.totalDeposits, 0);
    const totalWithdrawals = accounts.reduce((sum, acc) => sum + acc.totalWithdrawals, 0);

    // Generate deposit vs withdrawal comparison data
    const accountComparisonData = accounts.map(acc => ({
        label: acc.accountName.split(' ')[0],
        value: acc.balance,
        color: '#10B981',
    }));

    return (
        <PageContainer maxWidth="xl">
            <PageHeader
                title="BANK ACCOUNTS"
                description="Link and manage your bank accounts"
                icon={Building2}
                actions={
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#2F6BFF]/30 bg-[#16124A] text-gray-300 hover:bg-[#1E1854] hover:border-[#2F6BFF] disabled:opacity-50 transition-all duration-300 text-sm font-semibold"
                        >
                            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                            <span className="hidden sm:inline">Refresh</span>
                        </button>
                        <button
                            onClick={() => setShowBalances(!showBalances)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#2F6BFF]/30 bg-[#16124A] text-gray-300 hover:bg-[#1E1854] hover:border-[#2F6BFF] transition-all duration-300 text-sm font-semibold"
                        >
                            {showBalances ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            <span className="hidden sm:inline">{showBalances ? 'Hide' : 'Show'}</span>
                        </button>
                        <button
                            onClick={() => setIsLinkModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#2F6BFF] to-[#3B82F6] hover:from-[#3B82F6] hover:to-[#2F6BFF] text-white transition-all duration-300 shadow-lg hover:shadow-xl text-sm font-semibold"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Link Account</span>
                        </button>
                    </div>
                }
            />

            <Stack spacing="lg">
                <PageGrid cols={4}>
                    <StatsCard
                        icon={<Building2 className="w-5 h-5 sm:w-6 sm:h-6" />}
                        value={`${activeAccounts}/${accounts.length}`}
                        label="Bank Accounts"
                        iconColor="text-[#2F6BFF]"
                    />
                    <StatsCard
                        icon={<DollarSign className="w-5 h-5 sm:w-6 sm:h-6" />}
                        value={showBalances ? `${totalBalance.toLocaleString()}` : '••••••'}
                        label="Total Balance"
                        iconColor="text-[#10B981]"
                    />
                    <StatsCard
                        icon={<TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />}
                        value={showBalances ? `${totalDeposits.toLocaleString()}` : '••••••'}
                        label="Total Deposits"
                        iconColor="text-[#10B981]"
                    />
                    <StatsCard
                        icon={<TrendingDown className="w-5 h-5 sm:w-6 sm:h-6" />}
                        value={showBalances ? `${totalWithdrawals.toLocaleString()}` : '••••••'}
                        label="Total Withdrawals"
                        iconColor="text-[#F59E0B]"
                    />
                </PageGrid>

                <ContentSection title="Account Balances" description="Compare balances across your linked accounts">
                    <div className="h-64">
                        <ModernBarChart
                            data={accountComparisonData}
                            showValues={true}
                            animate={true}
                        />
                    </div>
                </ContentSection>

                {/* Bank Accounts - 3 COLUMN GRID */}
                <ContentSection title="Your Bank Accounts">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
                        {accounts.map((account) => (
                            <div
                                key={account.id}
                                className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-[#1a1347]/90 via-[#16124A]/80 to-[#0B0633]/90 backdrop-blur-xl border border-white/10 hover:border-[#2F6BFF]/50 transition-all duration-500 hover:shadow-2xl hover:shadow-[#2F6BFF]/20 hover:-translate-y-1"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-[#2F6BFF]/0 via-[#2F6BFF]/5 to-[#2F6BFF]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                                <div className="relative p-5">
                                    {/* Header */}
                                    <div className="flex items-start gap-3 mb-4">
                                        <div className="shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-[#2F6BFF] to-[#1E40AF] flex items-center justify-center shadow-lg shadow-[#2F6BFF]/30 group-hover:shadow-[#2F6BFF]/50 transition-all duration-300 group-hover:scale-110">
                                            <Building2 className="w-6 h-6 text-white" />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#2F6BFF] transition-colors duration-300 truncate">
                                                {account.accountName}
                                            </h3>
                                            <div className="flex flex-wrap items-center gap-1.5 mb-2">
                                                {account.isDefault && (
                                                    <span className="px-2 py-1 rounded-md text-[10px] font-bold bg-gradient-to-r from-[#2F6BFF] to-[#3B82F6] text-white shadow-lg shadow-[#2F6BFF]/30 animate-pulse">
                                                        ⭐ DEFAULT
                                                    </span>
                                                )}
                                                <span className={`px-2 py-1 rounded-md text-[10px] font-bold border backdrop-blur-sm ${getAccountTypeColor(account.accountType)}`}>
                                                    {account.accountType.toUpperCase()}
                                                </span>
                                                <span className={`px-2 py-1 rounded-md text-[10px] font-bold border backdrop-blur-sm ${getStatusColor(account.status)}`}>
                                                    {account.status.toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="text-xs text-gray-400 truncate">
                                                <span className="font-medium text-gray-300">{account.bankName}</span>
                                                <span className="mx-1">•</span>
                                                <span className="font-mono">{account.accountNumber}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Balance */}
                                    <div className="relative mb-4">
                                        <div className="absolute inset-0 bg-gradient-to-br from-[#10B981]/20 to-[#059669]/20 rounded-xl blur-lg" />
                                        <div className="relative px-4 py-3 rounded-xl bg-gradient-to-br from-[#10B981]/10 to-[#059669]/10 border border-[#10B981]/30 backdrop-blur-sm">
                                            <div className="text-[10px] font-semibold text-[#10B981] mb-0.5 tracking-wider uppercase">Balance</div>
                                            <div className="text-2xl font-black text-white tracking-tight">
                                                {showBalances ? `$${account.balance.toLocaleString()}` : '••••••'}
                                            </div>
                                            <div className="text-xs font-medium text-gray-400">{account.currency}</div>
                                        </div>
                                    </div>

                                    {/* Metrics */}
                                    <div className="grid grid-cols-2 gap-2 mb-4">
                                        <div className="group/metric relative overflow-hidden p-3 rounded-lg bg-gradient-to-br from-[#10B981]/10 to-[#059669]/5 border border-[#10B981]/20 hover:border-[#10B981]/40 backdrop-blur-sm transition-all duration-300 hover:scale-105">
                                            <div className="absolute top-0 right-0 w-16 h-16 bg-[#10B981]/10 rounded-full blur-xl group-hover/metric:bg-[#10B981]/20 transition-all duration-300" />
                                            <div className="relative">
                                                <div className="flex items-center gap-1.5 mb-1">
                                                    <TrendingUp className="w-3 h-3 text-[#10B981]" />
                                                    <div className="text-[10px] font-semibold text-gray-400 uppercase">Deposits</div>
                                                </div>
                                                <div className="text-base font-bold text-[#10B981] truncate">
                                                    {showBalances ? `$${account.totalDeposits.toLocaleString()}` : '••••'}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="group/metric relative overflow-hidden p-3 rounded-lg bg-gradient-to-br from-[#F59E0B]/10 to-[#D97706]/5 border border-[#F59E0B]/20 hover:border-[#F59E0B]/40 backdrop-blur-sm transition-all duration-300 hover:scale-105">
                                            <div className="absolute top-0 right-0 w-16 h-16 bg-[#F59E0B]/10 rounded-full blur-xl group-hover/metric:bg-[#F59E0B]/20 transition-all duration-300" />
                                            <div className="relative">
                                                <div className="flex items-center gap-1.5 mb-1">
                                                    <TrendingDown className="w-3 h-3 text-[#F59E0B]" />
                                                    <div className="text-[10px] font-semibold text-gray-400 uppercase">Withdrawals</div>
                                                </div>
                                                <div className="text-base font-bold text-[#F59E0B] truncate">
                                                    {showBalances ? `$${account.totalWithdrawals.toLocaleString()}` : '••••'}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="group/metric relative overflow-hidden p-3 rounded-lg bg-gradient-to-br from-[#2F6BFF]/10 to-[#1E40AF]/5 border border-[#2F6BFF]/20 hover:border-[#2F6BFF]/40 backdrop-blur-sm transition-all duration-300 hover:scale-105">
                                            <div className="absolute top-0 right-0 w-16 h-16 bg-[#2F6BFF]/10 rounded-full blur-xl group-hover/metric:bg-[#2F6BFF]/20 transition-all duration-300" />
                                            <div className="relative">
                                                <div className="flex items-center gap-1.5 mb-1">
                                                    <Activity className="w-3 h-3 text-[#2F6BFF]" />
                                                    <div className="text-[10px] font-semibold text-gray-400 uppercase">Activity</div>
                                                </div>
                                                <div className="text-base font-bold text-white truncate">
                                                    {account.lastTransaction}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="group/metric relative overflow-hidden p-3 rounded-lg bg-gradient-to-br from-[#8B5CF6]/10 to-[#7C3AED]/5 border border-[#8B5CF6]/20 hover:border-[#8B5CF6]/40 backdrop-blur-sm transition-all duration-300 hover:scale-105">
                                            <div className="absolute top-0 right-0 w-16 h-16 bg-[#8B5CF6]/10 rounded-full blur-xl group-hover/metric:bg-[#8B5CF6]/20 transition-all duration-300" />
                                            <div className="relative">
                                                <div className="flex items-center gap-1.5 mb-1">
                                                    <Building2 className="w-3 h-3 text-[#8B5CF6]" />
                                                    <div className="text-[10px] font-semibold text-gray-400 uppercase">Type</div>
                                                </div>
                                                <div className="text-base font-bold text-white capitalize truncate">
                                                    {account.accountType}
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
                                                <Building2 className="w-3.5 h-3.5" />
                                                Manage
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </ContentSection>
            </Stack>

            <LinkAccountModal
                isOpen={isLinkModalOpen}
                onClose={() => setIsLinkModalOpen(false)}
            />
            <ViewAccountModal
                isOpen={isViewModalOpen}
                account={selectedAccount}
                onClose={() => {
                    setIsViewModalOpen(false);
                    setSelectedAccount(null);
                }}
            />
            <ManageAccountModal
                isOpen={isManageModalOpen}
                account={selectedAccount}
                onClose={() => {
                    setIsManageModalOpen(false);
                    setSelectedAccount(null);
                }}
            />
        </PageContainer>
    );
}
