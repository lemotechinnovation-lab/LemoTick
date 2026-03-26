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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'text-green-400 bg-green-500/20';
            case 'suspended': return 'text-yellow-400 bg-yellow-500/20';
            case 'closed': return 'text-red-400 bg-red-500/20';
            default: return 'text-gray-400 bg-gray-500/20';
        }
    };

    const getAccountTypeColor = (type: string) => {
        return type === 'live' ? 'text-[#FFA62B] bg-[#FFA62B]/20' : 'text-[#2F6BFF] bg-[#2F6BFF]/20';
    };

    const activeAccounts = accounts.filter(acc => acc.status === 'active').length;
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
    const totalProfit = accounts.reduce((sum, acc) => sum + acc.netProfit, 0);
    const avgWinRate = accounts.reduce((sum, acc) => sum + acc.winRate, 0) / accounts.length;

    return (
        <div className="px-4 sm:px-6 lg:px-8 py-4 w-full max-w-9xl mx-auto">
            {/* Page header with gradient background */}
            <div className="relative mb-4 p-3 rounded-lg bg-gradient-to-br from-[#2F6BFF]/10 via-[#16124A] to-[#FFA62B]/10 border border-[#2F6BFF]/20">
                <div className="sm:flex sm:justify-between sm:items-center">
                    <div className="mb-2 sm:mb-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                            <div className="p-1.5 bg-[#2F6BFF]/20 rounded-lg">
                                <Users size={16} className="text-[#2F6BFF]" />
                            </div>
                            <h1 className="text-body-dashboard font-bold text-[#efdede] drop-shadow-[0_0_6px_rgba(160,167,181,0.3)]">Trading Accounts</h1>
                        </div>
                        <p className="text-micro text-gray-300 ml-8">Manage and monitor your trading accounts</p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                        <button
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#2F6BFF]/30 bg-[#16124A] text-gray-300 hover:bg-[#1E1854] disabled:opacity-50 transition-all duration-300 text-micro"
                        >
                            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
                            <span>Refresh</span>
                        </button>
                        <button
                            onClick={() => setShowBalances(!showBalances)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#2F6BFF]/30 bg-[#16124A] text-gray-300 hover:bg-[#1E1854] transition-all duration-300 text-micro"
                        >
                            {showBalances ? <EyeOff size={14} /> : <Eye size={14} />}
                            <span>{showBalances ? 'Hide' : 'Show'}</span>
                        </button>
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#2F6BFF] to-[#2557c9] hover:from-[#2557c9] hover:to-[#2F6BFF] text-white transition-all duration-300 shadow-brand hover-lift text-micro"
                        >
                            <Plus size={14} />
                            <span>Add Account</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
                {/* Active Accounts */}
                <div className="relative overflow-hidden bg-gradient-to-br from-[#16124A] to-[#0B0633] rounded-lg p-2 border border-[#2F6BFF]/30 hover:border-[#2F6BFF]/60 transition-all duration-300 hover-lift group">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-[#2F6BFF]/5 rounded-full blur-xl group-hover:bg-[#2F6BFF]/10 transition-all duration-300"></div>
                    <div className="relative">
                        <div className="flex items-center justify-between mb-1">
                            <div className="p-0.5 bg-gradient-to-br from-[#2F6BFF]/20 to-[#2F6BFF]/5 rounded group-hover:scale-110 transition-transform duration-300">
                                <Users size={14} className="text-[#2F6BFF]" />
                            </div>
                            <span className="text-[10px] text-gray-400 font-medium">Active</span>
                        </div>
                        <div className="text-small-dashboard font-bold text-[#efdede] font-tabular drop-shadow-[0_0_6px_rgba(160,167,181,0.3)]">{activeAccounts}/{accounts.length}</div>
                        <div className="text-[10px] text-gray-400">Trading Accounts</div>
                    </div>
                </div>

                {/* Total Balance */}
                <div className="relative overflow-hidden bg-gradient-to-br from-[#16124A] to-[#0B0633] rounded-lg p-2 border border-[#2F6BFF]/30 hover:border-[#2F6BFF]/60 transition-all duration-300 hover-lift group">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-[#2F6BFF]/5 rounded-full blur-xl group-hover:bg-[#2F6BFF]/10 transition-all duration-300"></div>
                    <div className="relative">
                        <div className="flex items-center justify-between mb-1">
                            <div className="p-0.5 bg-gradient-to-br from-[#2F6BFF]/20 to-[#2F6BFF]/5 rounded group-hover:scale-110 transition-transform duration-300">
                                <DollarSign size={14} className="text-[#2F6BFF]" />
                            </div>
                            <span className="text-[10px] text-gray-400 font-medium">Balance</span>
                        </div>
                        <div className="text-small-dashboard font-bold text-[#efdede] font-tabular drop-shadow-[0_0_6px_rgba(160,167,181,0.3)]">
                            {showBalances ? `$${totalBalance.toLocaleString()}` : '••••••'}
                        </div>
                        <div className="text-[10px] text-gray-400">Total Balance</div>
                    </div>
                </div>

                {/* Total Profit */}
                <div className={`relative overflow-hidden bg-gradient-to-br from-[#16124A] to-[#0B0633] rounded-lg p-2 border ${totalProfit >= 0 ? 'border-green-500/30 hover:border-green-500/60' : 'border-red-500/30 hover:border-red-500/60'} transition-all duration-300 hover-lift group`}>
                    <div className={`absolute top-0 right-0 w-16 h-16 ${totalProfit >= 0 ? 'bg-green-500/5' : 'bg-red-500/5'} rounded-full blur-xl group-hover:${totalProfit >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'} transition-all duration-300`}></div>
                    <div className="relative">
                        <div className="flex items-center justify-between mb-1">
                            <div className={`p-0.5 bg-gradient-to-br ${totalProfit >= 0 ? 'from-green-500/20 to-green-500/5' : 'from-red-500/20 to-red-500/5'} rounded group-hover:scale-110 transition-transform duration-300`}>
                                <TrendingUp size={14} className={totalProfit >= 0 ? 'text-green-400' : 'text-red-400'} />
                            </div>
                            <span className={`text-[10px] ${totalProfit >= 0 ? 'text-green-400' : 'text-red-400'} font-medium`}>Profit</span>
                        </div>
                        <div className={`text-small-dashboard font-bold ${totalProfit >= 0 ? 'text-green-400' : 'text-red-400'} font-tabular`}>
                            {showBalances ? `$${totalProfit.toFixed(2)}` : '••••••'}
                        </div>
                        <div className="text-[10px] text-gray-400">Net Profit</div>
                    </div>
                </div>

                {/* Avg Win Rate */}
                <div className="relative overflow-hidden bg-gradient-to-br from-[#16124A] to-[#0B0633] rounded-lg p-2 border border-[#FFA62B]/30 hover:border-[#FFA62B]/60 transition-all duration-300 hover-lift group">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-[#FFA62B]/5 rounded-full blur-xl group-hover:bg-[#FFA62B]/10 transition-all duration-300"></div>
                    <div className="relative">
                        <div className="flex items-center justify-between mb-1">
                            <div className="p-0.5 bg-gradient-to-br from-[#FFA62B]/20 to-[#FFA62B]/5 rounded group-hover:scale-110 transition-transform duration-300">
                                <Activity size={14} className="text-[#FFA62B]" />
                            </div>
                            <span className="text-[10px] text-[#FFA62B] font-medium">Win Rate</span>
                        </div>
                        <div className="text-small-dashboard font-bold text-[#efdede] font-tabular drop-shadow-[0_0_6px_rgba(160,167,181,0.3)]">{avgWinRate.toFixed(1)}%</div>
                        <div className="text-[10px] text-gray-400">Average Success</div>
                    </div>
                </div>
            </div>

            {/* Accounts List */}
            <div className="space-y-1.5">
                {accounts.map((account) => (
                    <div
                        key={account.id}
                        className="bg-gradient-to-br from-[#0B0633] to-[#16124A] rounded-lg border border-[#2F6BFF]/30 shadow-xl overflow-hidden hover:border-[#2F6BFF]/60 transition-all duration-300"
                    >
                        <div className="p-2">
                            <div className="flex items-start justify-between mb-1.5">
                                <div className="flex-1">
                                    <div className="flex items-center gap-1.5 mb-0.5">
                                        <h3 className="text-micro text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">{account.accountId}</h3>
                                        <span className={`px-1 py-0.5 rounded text-[9px] font-semibold ${getAccountTypeColor(account.accountType)}`}>
                                            {account.accountType.toUpperCase()}
                                        </span>
                                        <span className={`px-1 py-0.5 rounded text-[9px] font-semibold ${getStatusColor(account.status)}`}>
                                            {account.status.toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[9px] text-gray-400">
                                        <span>Created: {account.createdAt}</span>
                                        <span>•</span>
                                        <span>Last activity: {account.lastActivity}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-small-dashboard font-bold text-[#efdede] drop-shadow-[0_0_6px_rgba(160,167,181,0.3)]">
                                        {showBalances ? `$${account.balance.toLocaleString()}` : '••••••'}
                                    </div>
                                    <div className="text-[10px] text-gray-400">{account.currency}</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-6 gap-1.5 pt-1.5 border-t border-[#2F6BFF]/20">
                                <div>
                                    <div className="text-[10px] text-gray-400 mb-0.5">Net Profit</div>
                                    <div className={`text-micro font-semibold ${account.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {showBalances ? `$${account.netProfit.toFixed(2)}` : '••••••'}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-gray-400 mb-0.5">ROI</div>
                                    <div className={`text-micro font-semibold ${account.profitPercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {account.profitPercentage >= 0 ? '+' : ''}{account.profitPercentage.toFixed(2)}%
                                    </div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-gray-400 mb-0.5">Open Positions</div>
                                    <div className="text-micro text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">{account.openPositions}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-gray-400 mb-0.5">Total Trades</div>
                                    <div className="text-micro text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">{account.totalTrades}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-gray-400 mb-0.5">Win Rate</div>
                                    <div className="text-micro text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">{account.winRate}%</div>
                                </div>
                                <div className="flex items-end justify-end gap-1">
                                    <button
                                        onClick={() => {
                                            setSelectedAccount(account);
                                            setIsViewModalOpen(true);
                                        }}
                                        className="px-1.5 py-0.5 rounded bg-[#2F6BFF]/20 hover:bg-[#2F6BFF]/30 text-[#2F6BFF] text-[9px] font-semibold transition-colors"
                                    >
                                        View
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSelectedAccount(account);
                                            setIsManageModalOpen(true);
                                        }}
                                        className="px-1.5 py-0.5 rounded bg-[#2F6BFF]/20 hover:bg-[#2F6BFF]/30 text-[#2F6BFF] text-[9px] font-semibold transition-colors"
                                    >
                                        Manage
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modals */}
            <AddAccountModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
            <ViewAccountModal isOpen={isViewModalOpen} account={selectedAccount} onClose={() => setIsViewModalOpen(false)} />
            <ManageAccountModal isOpen={isManageModalOpen} account={selectedAccount} onClose={() => setIsManageModalOpen(false)} />
        </div>
    );
}

