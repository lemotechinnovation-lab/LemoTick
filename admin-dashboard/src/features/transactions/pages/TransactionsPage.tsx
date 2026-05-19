import ModernBarChart from '@/components/charts/ModernBarChart';
import { GlassCard, StatCard, StatusBadge } from '@/components/ui/DesignSystem';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageContainer, Stack } from '@/components/ui/PageLayoutEnhanced';
import { ArrowDownLeft, ArrowUpRight, Calendar, ChevronLeft, ChevronRight, Download, Eye, Filter, RefreshCw, Search, TrendingUp, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export interface Transaction {
    id: string;
    type: 'deposit' | 'withdrawal' | 'trade' | 'fee' | 'bonus' | 'refund';
    amount: number;
    currency: string;
    status: 'completed' | 'pending' | 'failed' | 'cancelled';
    description: string;
    reference: string;
    account: string;
    date: string;
    timestamp: string;
    fee?: number;
    balance?: number;
}

export default function TransactionsPage() {
    const [showFilters, setShowFilters] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState<string>('all');
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const [transactions] = useState<Transaction[]>([
        {
            id: 'TXN001',
            type: 'deposit',
            amount: 5000,
            currency: 'USD',
            status: 'completed',
            description: 'Bank Transfer Deposit',
            reference: 'DEP-2024-001',
            account: 'Primary Checking',
            date: '2024-03-08',
            timestamp: '10:30 AM',
            fee: 0,
            balance: 15000,
        },
        {
            id: 'TXN002',
            type: 'trade',
            amount: -250,
            currency: 'USD',
            status: 'completed',
            description: 'EUR/USD Trade',
            reference: 'TRD-2024-045',
            account: 'Trading Account',
            date: '2024-03-08',
            timestamp: '09:15 AM',
            fee: 2.5,
            balance: 14750,
        },
        {
            id: 'TXN003',
            type: 'withdrawal',
            amount: -1000,
            currency: 'USD',
            status: 'pending',
            description: 'Bank Transfer Withdrawal',
            reference: 'WTH-2024-012',
            account: 'Primary Checking',
            date: '2024-03-07',
            timestamp: '03:45 PM',
            fee: 10,
            balance: 13750,
        },
        {
            id: 'TXN004',
            type: 'bonus',
            amount: 100,
            currency: 'USD',
            status: 'completed',
            description: 'Referral Bonus',
            reference: 'BON-2024-008',
            account: 'Trading Account',
            date: '2024-03-07',
            timestamp: '11:20 AM',
            fee: 0,
            balance: 14850,
        },
        {
            id: 'TXN005',
            type: 'fee',
            amount: -15,
            currency: 'USD',
            status: 'completed',
            description: 'Monthly Account Fee',
            reference: 'FEE-2024-003',
            account: 'Trading Account',
            date: '2024-03-06',
            timestamp: '12:00 AM',
            fee: 0,
            balance: 14750,
        },
        {
            id: 'TXN006',
            type: 'trade',
            amount: 450,
            currency: 'USD',
            status: 'completed',
            description: 'GBP/USD Trade Profit',
            reference: 'TRD-2024-044',
            account: 'Trading Account',
            date: '2024-03-05',
            timestamp: '02:30 PM',
            fee: 2.5,
            balance: 14765,
        },
    ]);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast.success('Transactions refreshed successfully!');
        setIsRefreshing(false);
    };

    const handleExport = () => {
        toast.success('Exporting transactions...');
    };

    const getTypeBadgeType = (type: string): 'success' | 'error' | 'warning' | 'info' => {
        switch (type) {
            case 'deposit': return 'success';
            case 'withdrawal': return 'warning';
            case 'trade': return 'info';
            case 'fee': return 'error';
            case 'bonus': return 'success';
            case 'refund': return 'warning';
            default: return 'info';
        }
    };

    const getStatusBadgeType = (status: string): 'success' | 'error' | 'warning' | 'info' | 'pending' => {
        switch (status) {
            case 'completed': return 'success';
            case 'pending': return 'pending';
            case 'failed': return 'error';
            case 'cancelled': return 'warning';
            default: return 'info';
        }
    };

    const getTypeIcon = (type: string) => {
        return type === 'deposit' || type === 'bonus' || type === 'refund' ? (
            <ArrowDownLeft size={12} className="text-green-400" />
        ) : (
            <ArrowUpRight size={12} className="text-[#FFA62B]" />
        );
    };

    const filteredTransactions = transactions.filter(txn => {
        const matchesSearch = txn.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            txn.reference.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = selectedType === 'all' || txn.type === selectedType;
        const matchesStatus = selectedStatus === 'all' || txn.status === selectedStatus;
        return matchesSearch && matchesType && matchesStatus;
    });

    // Pagination
    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

    // Reset to page 1 when filters change
    const handleFilterChange = (setter: (value: string) => void, value: string) => {
        setter(value);
        setCurrentPage(1);
    };

    const totalDeposits = transactions.filter(t => t.type === 'deposit').reduce((sum, t) => sum + t.amount, 0);
    const totalWithdrawals = Math.abs(transactions.filter(t => t.type === 'withdrawal').reduce((sum, t) => sum + t.amount, 0));
    const totalFees = Math.abs(transactions.filter(t => t.type === 'fee').reduce((sum, t) => sum + t.amount, 0));
    const netAmount = transactions.reduce((sum, t) => sum + t.amount, 0);

    // Generate transaction flow data (last 7 days)
    const transactionFlowData = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        const dayTransactions = transactions.filter(t => {
            const txDate = new Date(t.date);
            return txDate.toDateString() === date.toDateString();
        });
        const dayTotal = dayTransactions.reduce((sum, t) => sum + t.amount, 0);
        return {
            label: date.toLocaleDateString('en-US', { weekday: 'short' }),
            value: Math.abs(dayTotal) || Math.random() * 2000 + 500,
            color: '#2F6BFF',
        };
    });

    return (
        <PageContainer maxWidth="xl">
            {/* Page Header */}
            <PageHeader
                title="TRANSACTIONS"
                description="View and manage your transaction history"
                icon={Calendar}
                actions={
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-brand-blue/30 bg-[#16124A] text-gray-300 hover:bg-[#1E1854] hover:border-brand-blue disabled:opacity-50 transition-all duration-300 text-sm font-semibold"
                        >
                            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                            <span>Refresh</span>
                        </button>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-brand-blue/30 bg-[#16124A] text-gray-300 hover:bg-[#1E1854] hover:border-brand-blue transition-all duration-300 text-sm font-semibold"
                        >
                            <Filter className="w-4 h-4" />
                            <span>Filters</span>
                        </button>
                        <button
                            onClick={handleExport}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-blue to-[#3B82F6] hover:from-[#3B82F6] hover:to-brand-blue text-white transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-brand-blue/30 text-sm font-semibold"
                        >
                            <Download className="w-4 h-4" />
                            <span>Export</span>
                        </button>
                    </div>
                }
            />

            <Stack spacing="lg">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Total Deposits */}
                    <StatCard
                        icon={<ArrowDownLeft className="w-6 h-6" />}
                        value={`$${totalDeposits.toLocaleString()}`}
                        label="Total Deposits"
                        variant="green"
                        delay={0}
                    />

                    {/* Total Withdrawals */}
                    <StatCard
                        icon={<ArrowUpRight className="w-6 h-6" />}
                        value={`$${totalWithdrawals.toLocaleString()}`}
                        label="Total Withdrawals"
                        variant="orange"
                        delay={100}
                    />

                    {/* Total Fees */}
                    <StatCard
                        icon={<X className="w-6 h-6" />}
                        value={`$${totalFees.toLocaleString()}`}
                        label="Total Fees"
                        variant="red"
                        delay={200}
                    />

                    {/* Net Amount */}
                    <StatCard
                        icon={<TrendingUp className="w-6 h-6" />}
                        value={`$${Math.abs(netAmount).toLocaleString()}`}
                        label="Net Amount"
                        variant={netAmount >= 0 ? 'green' : 'red'}
                        change={{
                            value: parseFloat(((netAmount / (totalDeposits || 1)) * 100).toFixed(1)),
                            isPositive: netAmount >= 0
                        }}
                        delay={300}
                    />
                </div>

                {/* Transaction Flow Chart */}
                <GlassCard className="p-4 sm:p-6">
                    <div className="mb-4">
                        <h3 className="text-base sm:text-lg font-bold text-[#E8B4B8] mb-1 uppercase">Transaction Activity</h3>
                        <p className="text-sm text-gray-200 font-medium">Daily transaction volume over the last 7 days</p>
                    </div>
                    <div className="h-48 sm:h-64">
                        <ModernBarChart
                            data={transactionFlowData}
                            showValues={true}
                            animate={true}
                        />
                    </div>
                </GlassCard>

                {/* Search and Filters */}
                <div className="space-y-4">
                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="w-4 h-4 sm:w-5 sm:h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                            placeholder="Search by description or reference..."
                            className="w-full pl-12 pr-4 py-3 bg-[#16124A]/50 border border-brand-blue/20 rounded-xl text-sm text-white placeholder-gray-400 focus:outline-none focus:border-brand-blue transition-all duration-200"
                        />
                    </div>

                    {/* Filter Options */}
                    {showFilters && (
                        <div className="grid grid-cols-1 md:grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 p-4 sm:p-6 bg-[#16124A]/50 border border-brand-blue/20 rounded-xl animate-fadeIn w-full max-w-full">
                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-2">Transaction Type</label>
                                <select
                                    value={selectedType}
                                    onChange={(e) => handleFilterChange(setSelectedType, e.target.value)}
                                    className="w-full px-4 py-3 bg-[#0B0633] border border-brand-blue/20 rounded-xl text-sm text-white focus:outline-none focus:border-brand-blue transition-all duration-200"
                                >
                                    <option value="all">All Types</option>
                                    <option value="deposit">Deposits</option>
                                    <option value="withdrawal">Withdrawals</option>
                                    <option value="trade">Trades</option>
                                    <option value="fee">Fees</option>
                                    <option value="bonus">Bonuses</option>
                                    <option value="refund">Refunds</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-2">Status</label>
                                <select
                                    value={selectedStatus}
                                    onChange={(e) => handleFilterChange(setSelectedStatus, e.target.value)}
                                    className="w-full px-4 py-3 bg-[#0B0633] border border-brand-blue/20 rounded-xl text-sm text-white focus:outline-none focus:border-brand-blue transition-all duration-200"
                                >
                                    <option value="all">All Status</option>
                                    <option value="completed">Completed</option>
                                    <option value="pending">Pending</option>
                                    <option value="failed">Failed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Transactions Table */}
                    <GlassCard variant="blue" className="overflow-hidden mt-4 p-0">

                        {/* ── MOBILE: stacked card view ── */}
                        <div className="sm:hidden divide-y divide-brand-blue/10">
                            {paginatedTransactions.length === 0 ? (
                                <div className="text-center py-10 text-gray-400 text-sm">No transactions found</div>
                            ) : paginatedTransactions.map((transaction, index) => (
                                <div
                                    key={transaction.id}
                                    className="p-4 hover:bg-brand-blue/5 transition-colors animate-fade-in-up"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    {/* Row 1: icon + description + amount */}
                                    <div className="flex items-center justify-between gap-3 mb-3">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-9 h-9 bg-gradient-to-br from-brand-blue/20 to-brand-blue/10 rounded-xl flex items-center justify-center flex-shrink-0 border border-brand-blue/30">
                                                {getTypeIcon(transaction.type)}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="text-sm text-white font-semibold truncate">{transaction.description}</div>
                                                <div className="text-xs text-gray-400">{transaction.reference}</div>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <div className={`text-sm font-bold ${transaction.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                {transaction.amount >= 0 ? '+' : ''}{transaction.amount.toLocaleString()} {transaction.currency}
                                            </div>
                                            {transaction.fee && transaction.fee > 0 && (
                                                <div className="text-xs text-gray-400">Fee: ${transaction.fee}</div>
                                            )}
                                        </div>
                                    </div>
                                    {/* Row 2: date + badges + view */}
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-xs text-gray-400">{transaction.date} · {transaction.timestamp}</span>
                                            <StatusBadge status={getTypeBadgeType(transaction.type)} label={transaction.type.toUpperCase()} size="md" />
                                            <StatusBadge status={getStatusBadgeType(transaction.status)} label={transaction.status.toUpperCase()} pulse={transaction.status === 'pending'} size="md" />
                                        </div>
                                        <button
                                            onClick={() => { setSelectedTransaction(transaction); setIsViewModalOpen(true); }}
                                            className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand-blue/20 hover:bg-brand-blue/30 text-brand-blue text-xs font-semibold transition-all border border-brand-blue/30"
                                        >
                                            <Eye className="w-3 h-3" />
                                            View
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* ── DESKTOP: full table ── */}
                        <div className="hidden sm:block overflow-x-auto w-full">
                            <table className="w-full min-w-[600px]">
                                <thead>
                                    <tr className="bg-gradient-to-r from-brand-blue/10 to-transparent border-b border-brand-blue/30">
                                        <th className="px-4 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Date/Time</th>
                                        <th className="px-4 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Description</th>
                                        <th className="px-4 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Type</th>
                                        <th className="px-4 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Status</th>
                                        <th className="px-4 py-4 text-right text-xs font-semibold text-gray-300 uppercase tracking-wider">Amount</th>
                                        <th className="px-4 py-4 text-right text-xs font-semibold text-gray-300 uppercase tracking-wider">Balance</th>
                                        <th className="px-4 py-4 text-center text-xs font-semibold text-gray-300 uppercase tracking-wider">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-brand-blue/10">
                                    {paginatedTransactions.map((transaction, index) => (
                                        <tr
                                            key={transaction.id}
                                            className="hover:bg-brand-blue/5 transition-colors duration-200 animate-fade-in-up"
                                            style={{ animationDelay: `${index * 50}ms` }}
                                        >
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <div className="text-sm text-white font-semibold">{transaction.date}</div>
                                                <div className="text-xs text-gray-400">{transaction.timestamp}</div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-gradient-to-br from-brand-blue/20 to-brand-blue/10 rounded-xl flex items-center justify-center flex-shrink-0 border border-brand-blue/30">
                                                        {getTypeIcon(transaction.type)}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm text-white font-semibold">{transaction.description}</div>
                                                        <div className="text-xs text-gray-400">{transaction.reference}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <StatusBadge status={getTypeBadgeType(transaction.type)} label={transaction.type.toUpperCase()} size="md" />
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <StatusBadge status={getStatusBadgeType(transaction.status)} label={transaction.status.toUpperCase()} pulse={transaction.status === 'pending'} size="md" />
                                            </td>
                                            <td className="px-4 py-4 text-right whitespace-nowrap">
                                                <div className={`text-sm font-bold ${transaction.amount >= 0 ? 'text-green-400' : 'text-white'}`}>
                                                    {transaction.amount >= 0 ? '+' : ''}{transaction.amount.toLocaleString()} {transaction.currency}
                                                </div>
                                                {transaction.fee && transaction.fee > 0 && (
                                                    <div className="text-xs text-gray-400">Fee: ${transaction.fee}</div>
                                                )}
                                            </td>
                                            <td className="px-4 py-4 text-right whitespace-nowrap">
                                                <div className="text-sm text-white font-semibold">${transaction.balance?.toLocaleString()}</div>
                                            </td>
                                            <td className="px-4 py-4 text-center whitespace-nowrap">
                                                <button
                                                    onClick={() => { setSelectedTransaction(transaction); setIsViewModalOpen(true); }}
                                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-blue/20 hover:bg-brand-blue/30 text-brand-blue text-xs font-semibold transition-all duration-200 border border-brand-blue/30 hover:border-brand-blue hover:shadow-lg hover:shadow-brand-blue/20"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    <span>View</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {paginatedTransactions.length === 0 && (
                                <div className="text-center py-12 text-gray-400 text-sm">No transactions found matching your criteria</div>
                            )}
                        </div>

                        {/* Pagination */}
                        {filteredTransactions.length > 0 && (
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-4 sm:px-6 py-4 border-t border-brand-blue/20 bg-gradient-to-r from-brand-blue/5 to-transparent">
                                <div className="text-sm text-gray-400">
                                    Showing {startIndex + 1} to {Math.min(endIndex, filteredTransactions.length)} of {filteredTransactions.length} transactions
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                        className="p-2 rounded-xl bg-[#0B0633] border border-brand-blue/30 text-gray-300 hover:bg-[#16124A] hover:border-brand-blue hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <div className="flex items-center gap-2">
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                            <button
                                                key={page}
                                                onClick={() => setCurrentPage(page)}
                                                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${currentPage === page
                                                    ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/30'
                                                    : 'bg-[#0B0633] border border-brand-blue/30 text-gray-300 hover:bg-[#16124A] hover:border-brand-blue hover:text-white'
                                                    }`}
                                            >
                                                {page}
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                        disabled={currentPage === totalPages}
                                        className="p-2 rounded-xl bg-[#0B0633] border border-brand-blue/30 text-gray-300 hover:bg-[#16124A] hover:border-brand-blue hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </GlassCard>
                </div>
            </Stack>

            {/* View Transaction Modal */}
            {isViewModalOpen && selectedTransaction && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
                    <div className="bg-gradient-to-br from-[#16124A] to-[#0B0633] rounded-xl shadow-brand-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scaleIn border border-[#2F6BFF]/30">
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-3 border-b border-[#2F6BFF]/30 bg-gradient-to-r from-[#2F6BFF]/10 via-transparent to-[#FFA62B]/10">
                            <div className="flex items-center gap-2">
                                <Eye size={16} className="text-[#2F6BFF]" />
                                <h2 className="text-lg text-[#FCB839] font-bold">Transaction Details</h2>
                            </div>
                            <button
                                onClick={() => {
                                    setIsViewModalOpen(false);
                                    setSelectedTransaction(null);
                                }}
                                className="p-1 hover:bg-red-500/20 rounded-md transition-all duration-200 hover:scale-110"
                            >
                                <X size={16} className="text-gray-300 hover:text-red-400" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-3 space-y-3">
                            {/* Transaction Info */}
                            <div className="space-y-2">
                                <h3 className="text-lg text-[#E8B4B8] font-bold uppercase">Transaction Information</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-full">
                                    <div className="p-2 bg-[#0B0633] border border-gray-700/50 rounded-md">
                                        <div className="text-[10px] text-gray-400 mb-0.5">Transaction ID</div>
                                        <div className="text-micro text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">{selectedTransaction.id}</div>
                                    </div>
                                    <div className="p-2 bg-[#0B0633] border border-gray-700/50 rounded-md">
                                        <div className="text-[10px] text-gray-400 mb-0.5">Reference</div>
                                        <div className="text-micro text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">{selectedTransaction.reference}</div>
                                    </div>
                                    <div className="p-2 bg-[#0B0633] border border-gray-700/50 rounded-md">
                                        <div className="text-[10px] text-gray-400 mb-0.5">Type</div>
                                        <div className="text-micro text-[#efdede] font-semibold capitalize">{selectedTransaction.type}</div>
                                    </div>
                                    <div className="p-2 bg-[#0B0633] border border-gray-700/50 rounded-md">
                                        <div className="text-[10px] text-gray-400 mb-0.5">Status</div>
                                        <div className="text-micro text-[#efdede] font-semibold capitalize">{selectedTransaction.status}</div>
                                    </div>
                                    <div className="p-2 bg-[#0B0633] border border-gray-700/50 rounded-md">
                                        <div className="text-[10px] text-gray-400 mb-0.5">Date</div>
                                        <div className="text-micro text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">{selectedTransaction.date}</div>
                                    </div>
                                    <div className="p-2 bg-[#0B0633] border border-gray-700/50 rounded-md">
                                        <div className="text-[10px] text-gray-400 mb-0.5">Time</div>
                                        <div className="text-micro text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">{selectedTransaction.timestamp}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Amount Details */}
                            <div className="space-y-2">
                                <h3 className="text-lg text-[#E8B4B8] font-bold uppercase">Amount Details</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-full">
                                    <div className="p-2 bg-[#0B0633] border border-gray-700/50 rounded-md">
                                        <div className="text-[10px] text-gray-400 mb-0.5">Amount</div>
                                        <div className={`text-micro font-semibold ${selectedTransaction.amount >= 0 ? 'text-green-400' : 'text-white'}`}>
                                            {selectedTransaction.amount >= 0 ? '+' : ''}{selectedTransaction.amount.toLocaleString()} {selectedTransaction.currency}
                                        </div>
                                    </div>
                                    <div className="p-2 bg-[#0B0633] border border-gray-700/50 rounded-md">
                                        <div className="text-[10px] text-gray-400 mb-0.5">Fee</div>
                                        <div className="text-micro text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">${selectedTransaction.fee || 0}</div>
                                    </div>
                                    <div className="p-2 bg-[#0B0633] border border-gray-700/50 rounded-md">
                                        <div className="text-[10px] text-gray-400 mb-0.5">Account</div>
                                        <div className="text-micro text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">{selectedTransaction.account}</div>
                                    </div>
                                    <div className="p-2 bg-[#0B0633] border border-gray-700/50 rounded-md">
                                        <div className="text-[10px] text-gray-400 mb-0.5">Balance After</div>
                                        <div className="text-micro text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">${selectedTransaction.balance?.toLocaleString()}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <h3 className="text-lg text-[#E8B4B8] font-bold uppercase">Description</h3>
                                <div className="p-2 bg-[#0B0633] border border-gray-700/50 rounded-md">
                                    <div className="text-micro text-[#efdede]">{selectedTransaction.description}</div>
                                </div>
                            </div>

                            {/* Close Button */}
                            <div className="flex items-center justify-end pt-2 border-t border-gray-700/50">
                                <button
                                    onClick={() => {
                                        setIsViewModalOpen(false);
                                        setSelectedTransaction(null);
                                    }}
                                    className="px-3 py-1.5 bg-[#2F6BFF] hover:bg-[#2557c9] text-white rounded-md transition-colors duration-200 text-micro"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </PageContainer>
    );
}


