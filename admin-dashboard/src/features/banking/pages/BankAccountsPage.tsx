import { Building2, DollarSign, Eye, EyeOff, Plus, RefreshCw, TrendingDown, TrendingUp } from 'lucide-react';
import { useState } from 'react';
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
        const refreshToast = validationToast.customValidation(
            'Refreshing bank account data...',
            {
                loadingMessage: 'Syncing with banks...',
                successMessage: 'Bank accounts updated!',
                errorMessage: 'Failed to refresh accounts',
                duration: 3000,
                delay: 1000,
            }
        );

        setIsRefreshing(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Simulate success/failure
            const success = Math.random() > 0.1; // 90% success rate

            if (success) {
                refreshToast.success('Bank accounts refreshed successfully!');
            } else {
                refreshToast.error('Failed to refresh some accounts. Please try again.');
            }
        } catch (error) {
            validationToast.networkError();
        } finally {
            setIsRefreshing(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'text-green-400 bg-green-500/20';
            case 'pending': return 'text-yellow-400 bg-yellow-500/20';
            case 'suspended': return 'text-orange-400 bg-orange-500/20';
            case 'closed': return 'text-red-400 bg-red-500/20';
            default: return 'text-gray-400 bg-gray-500/20';
        }
    };

    const getAccountTypeColor = (type: string) => {
        switch (type) {
            case 'checking': return 'text-[#2F6BFF] bg-[#2F6BFF]/20';
            case 'savings': return 'text-green-400 bg-green-500/20';
            case 'business': return 'text-[#FFA62B] bg-[#FFA62B]/20';
            default: return 'text-gray-400 bg-gray-500/20';
        }
    };

    const activeAccounts = accounts.filter(acc => acc.status === 'active').length;
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
    const totalDeposits = accounts.reduce((sum, acc) => sum + acc.totalDeposits, 0);
    const totalWithdrawals = accounts.reduce((sum, acc) => sum + acc.totalWithdrawals, 0);

    return (
        <div className="px-4 sm:px-6 lg:px-8 py-4 w-full max-w-9xl mx-auto">
            {/* Page header with gradient background */}
            <div className="relative mb-4 p-3 rounded-lg bg-gradient-to-br from-[#2F6BFF]/10 via-[#16124A] to-[#FFA62B]/10 border border-[#2F6BFF]/20">
                <div className="sm:flex sm:justify-between sm:items-center">
                    <div className="mb-2 sm:mb-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                            <div className="p-1.5 bg-[#2F6BFF]/20 rounded-lg">
                                <Building2 size={16} className="text-[#2F6BFF]" />
                            </div>
                            <h1 className="text-body-dashboard font-bold text-[#efdede] drop-shadow-[0_0_6px_rgba(160,167,181,0.3)]">Bank Accounts</h1>
                        </div>
                        <p className="text-micro text-gray-300 ml-8">Link and manage your bank accounts</p>
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
                            onClick={() => setIsLinkModalOpen(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#2F6BFF] to-[#2557c9] hover:from-[#2557c9] hover:to-[#2F6BFF] text-white transition-all duration-300 shadow-brand hover-lift text-micro"
                        >
                            <Plus size={14} />
                            <span>Link Account</span>
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
                                <Building2 size={14} className="text-[#2F6BFF]" />
                            </div>
                            <span className="text-[10px] text-gray-400 font-medium">Active</span>
                        </div>
                        <div className="text-small-dashboard font-bold text-[#efdede] font-tabular drop-shadow-[0_0_6px_rgba(160,167,181,0.3)]">{activeAccounts}/{accounts.length}</div>
                        <div className="text-[10px] text-gray-400">Bank Accounts</div>
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

                {/* Total Deposits */}
                <div className="relative overflow-hidden bg-gradient-to-br from-[#16124A] to-[#0B0633] rounded-lg p-2 border border-green-500/30 hover:border-green-500/60 transition-all duration-300 hover-lift group">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-green-500/5 rounded-full blur-xl group-hover:bg-green-500/10 transition-all duration-300"></div>
                    <div className="relative">
                        <div className="flex items-center justify-between mb-1">
                            <div className="p-0.5 bg-gradient-to-br from-green-500/20 to-green-500/5 rounded group-hover:scale-110 transition-transform duration-300">
                                <TrendingUp size={14} className="text-green-400" />
                            </div>
                            <span className="text-[10px] text-green-400 font-medium">Deposits</span>
                        </div>
                        <div className="text-small-dashboard font-bold text-green-400 font-tabular">
                            {showBalances ? `$${totalDeposits.toLocaleString()}` : '••••••'}
                        </div>
                        <div className="text-[10px] text-gray-400">Total Deposits</div>
                    </div>
                </div>

                {/* Total Withdrawals */}
                <div className="relative overflow-hidden bg-gradient-to-br from-[#16124A] to-[#0B0633] rounded-lg p-2 border border-[#FFA62B]/30 hover:border-[#FFA62B]/60 transition-all duration-300 hover-lift group">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-[#FFA62B]/5 rounded-full blur-xl group-hover:bg-[#FFA62B]/10 transition-all duration-300"></div>
                    <div className="relative">
                        <div className="flex items-center justify-between mb-1">
                            <div className="p-0.5 bg-gradient-to-br from-[#FFA62B]/20 to-[#FFA62B]/5 rounded group-hover:scale-110 transition-transform duration-300">
                                <TrendingDown size={14} className="text-[#FFA62B]" />
                            </div>
                            <span className="text-[10px] text-[#FFA62B] font-medium">Withdrawals</span>
                        </div>
                        <div className="text-small-dashboard font-bold text-[#efdede] font-tabular drop-shadow-[0_0_6px_rgba(160,167,181,0.3)]">
                            {showBalances ? `$${totalWithdrawals.toLocaleString()}` : '••••••'}
                        </div>
                        <div className="text-[10px] text-gray-400">Total Withdrawals</div>
                    </div>
                </div>
            </div>

            {/* Bank Accounts List */}
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
                                        <h3 className="text-micro text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">{account.accountName}</h3>
                                        {account.isDefault && (
                                            <span className="px-1 py-0.5 rounded text-[9px] font-semibold text-[#2F6BFF] bg-[#2F6BFF]/20">
                                                DEFAULT
                                            </span>
                                        )}
                                        <span className={`px-1 py-0.5 rounded text-[9px] font-semibold ${getAccountTypeColor(account.accountType)}`}>
                                            {account.accountType.toUpperCase()}
                                        </span>
                                        <span className={`px-1 py-0.5 rounded text-[9px] font-semibold ${getStatusColor(account.status)}`}>
                                            {account.status.toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[9px] text-gray-400">
                                        <span>{account.bankName}</span>
                                        <span>•</span>
                                        <span>{account.accountNumber}</span>
                                        <span>•</span>
                                        <span>Added: {account.createdAt}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-micro font-bold text-[#efdede] drop-shadow-[0_0_6px_rgba(160,167,181,0.3)]">
                                        {showBalances ? `$${account.balance.toLocaleString()}` : '••••••'}
                                    </div>
                                    <div className="text-[9px] text-gray-400">{account.currency}</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-5 gap-1.5 pt-1.5 border-t border-[#2F6BFF]/20">
                                <div>
                                    <div className="text-[9px] text-gray-400 mb-0.5">Total Deposits</div>
                                    <div className="text-[10px] text-green-400 font-semibold">
                                        {showBalances ? `$${account.totalDeposits.toLocaleString()}` : '••••••'}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-[9px] text-gray-400 mb-0.5">Total Withdrawals</div>
                                    <div className="text-[10px] text-[#FFA62B] font-semibold">
                                        {showBalances ? `$${account.totalWithdrawals.toLocaleString()}` : '••••••'}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-[9px] text-gray-400 mb-0.5">Last Transaction</div>
                                    <div className="text-[10px] text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">{account.lastTransaction}</div>
                                </div>
                                <div>
                                    <div className="text-[9px] text-gray-400 mb-0.5">Account Type</div>
                                    <div className="text-[10px] text-white font-semibold capitalize">{account.accountType}</div>
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
        </div >
    );
}


