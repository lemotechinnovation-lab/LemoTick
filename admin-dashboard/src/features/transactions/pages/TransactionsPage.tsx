import { ArrowDownLeft, ArrowUpRight, Calendar, ChevronLeft, ChevronRight, Download, Eye, Filter, RefreshCw, Search, X } from 'lucide-react';
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

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'deposit': return 'text-green-400 bg-green-500/20';
            case 'withdrawal': return 'text-[#FFA62B] bg-[#FFA62B]/20';
            case 'trade': return 'text-[#2F6BFF] bg-[#2F6BFF]/20';
            case 'fee': return 'text-red-400 bg-red-500/20';
            case 'bonus': return 'text-purple-400 bg-purple-500/20';
            case 'refund': return 'text-yellow-400 bg-yellow-500/20';
            default: return 'text-gray-400 bg-gray-500/20';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'text-green-400 bg-green-500/20';
            case 'pending': return 'text-yellow-400 bg-yellow-500/20';
            case 'failed': return 'text-red-400 bg-red-500/20';
            case 'cancelled': return 'text-gray-400 bg-gray-500/20';
            default: return 'text-gray-400 bg-gray-500/20';
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

    return (
        <div className="px-4 sm:px-6 lg:px-8 py-4 w-full max-w-9xl mx-auto">
            {/* Page header */}
            <div className="relative mb-4 p-3 rounded-lg bg-gradient-to-br from-[#2F6BFF]/10 via-[#16124A] to-[#FFA62B]/10 border border-[#2F6BFF]/20">
                <div className="sm:flex sm:justify-between sm:items-center">
                    <div className="mb-2 sm:mb-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                            <div className="p-1.5 bg-[#2F6BFF]/20 rounded-lg">
                                <Calendar size={16} className="text-[#2F6BFF]" />
                            </div>
                            <h1 className="text-body-dashboard font-bold text-[#efdede] drop-shadow-[0_0_6px_rgba(160,167,181,0.3)]">Transactions</h1>
                        </div>
                        <p className="text-micro text-gray-300 ml-8">View and manage your transaction history</p>
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
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#2F6BFF]/30 bg-[#16124A] text-gray-300 hover:bg-[#1E1854] transition-all duration-300 text-micro"
                        >
                            <Filter size={14} />
                            <span>Filters</span>
                        </button>
                        <button
                            onClick={handleExport}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#2F6BFF] to-[#2557c9] hover:from-[#2557c9] hover:to-[#2F6BFF] text-white transition-all duration-300 shadow-brand hover-lift text-micro"
                        >
                            <Download size={14} />
                            <span>Export</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
                {/* Total Deposits */}
                <div className="relative overflow-hidden bg-gradient-to-br from-[#16124A] to-[#0B0633] rounded-lg p-2 border border-green-500/30 hover:border-green-500/60 transition-all duration-300 hover-lift group">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-green-500/5 rounded-full blur-xl group-hover:bg-green-500/10 transition-all duration-300"></div>
                    <div className="relative">
                        <div className="flex items-center justify-between mb-1">
                            <div className="p-0.5 bg-gradient-to-br from-green-500/20 to-green-500/5 rounded group-hover:scale-110 transition-transform duration-300">
                                <ArrowDownLeft size={14} className="text-green-400" />
                            </div>
                            <span className="text-[10px] text-green-400 font-medium">Deposits</span>
                        </div>
                        <div className="text-small-dashboard font-bold text-green-400 font-tabular">${totalDeposits.toLocaleString()}</div>
                        <div className="text-[10px] text-gray-400">Total Deposits</div>
                    </div>
                </div>

                {/* Total Withdrawals */}
                <div className="relative overflow-hidden bg-gradient-to-br from-[#16124A] to-[#0B0633] rounded-lg p-2 border border-[#FFA62B]/30 hover:border-[#FFA62B]/60 transition-all duration-300 hover-lift group">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-[#FFA62B]/5 rounded-full blur-xl group-hover:bg-[#FFA62B]/10 transition-all duration-300"></div>
                    <div className="relative">
                        <div className="flex items-center justify-between mb-1">
                            <div className="p-0.5 bg-gradient-to-br from-[#FFA62B]/20 to-[#FFA62B]/5 rounded group-hover:scale-110 transition-transform duration-300">
                                <ArrowUpRight size={14} className="text-[#FFA62B]" />
                            </div>
                            <span className="text-[10px] text-[#FFA62B] font-medium">Withdrawals</span>
                        </div>
                        <div className="text-small-dashboard font-bold text-[#efdede] font-tabular drop-shadow-[0_0_6px_rgba(160,167,181,0.3)]">${totalWithdrawals.toLocaleString()}</div>
                        <div className="text-[10px] text-gray-400">Total Withdrawals</div>
                    </div>
                </div>

                {/* Total Fees */}
                <div className="relative overflow-hidden bg-gradient-to-br from-[#16124A] to-[#0B0633] rounded-lg p-2 border border-red-500/30 hover:border-red-500/60 transition-all duration-300 hover-lift group">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/5 rounded-full blur-xl group-hover:bg-red-500/10 transition-all duration-300"></div>
                    <div className="relative">
                        <div className="flex items-center justify-between mb-1">
                            <div className="p-0.5 bg-gradient-to-br from-red-500/20 to-red-500/5 rounded group-hover:scale-110 transition-transform duration-300">
                                <X size={14} className="text-red-400" />
                            </div>
                            <span className="text-[10px] text-red-400 font-medium">Fees</span>
                        </div>
                        <div className="text-small-dashboard font-bold text-[#efdede] font-tabular drop-shadow-[0_0_6px_rgba(160,167,181,0.3)]">${totalFees.toLocaleString()}</div>
                        <div className="text-[10px] text-gray-400">Total Fees</div>
                    </div>
                </div>

                {/* Net Amount */}
                <div className="relative overflow-hidden bg-gradient-to-br from-[#16124A] to-[#0B0633] rounded-lg p-2 border border-[#2F6BFF]/30 hover:border-[#2F6BFF]/60 transition-all duration-300 hover-lift group">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-[#2F6BFF]/5 rounded-full blur-xl group-hover:bg-[#2F6BFF]/10 transition-all duration-300"></div>
                    <div className="relative">
                        <div className="flex items-center justify-between mb-1">
                            <div className="p-0.5 bg-gradient-to-br from-[#2F6BFF]/20 to-[#2F6BFF]/5 rounded group-hover:scale-110 transition-transform duration-300">
                                <Calendar size={14} className="text-[#2F6BFF]" />
                            </div>
                            <span className="text-[10px] text-gray-400 font-medium">Net</span>
                        </div>
                        <div className={`text-small-dashboard font-bold font-tabular ${netAmount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            ${Math.abs(netAmount).toLocaleString()}
                        </div>
                        <div className="text-[10px] text-gray-400">Net Amount</div>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="mb-3 space-y-2">
                {/* Search Bar */}
                <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1);
                        }}
                        placeholder="Search by description or reference..."
                        className="w-full pl-9 pr-3 py-1.5 bg-[#0B0633] border border-gray-700/50 rounded-md text-micro text-[#efdede] placeholder-gray-400 focus:outline-none focus:border-[#2F6BFF] transition-colors duration-200"
                    />
                </div>

                {/* Filter Options */}
                {showFilters && (
                    <div className="grid grid-cols-2 gap-2 p-2 bg-[#0B0633] border border-gray-700/50 rounded-md animate-fadeIn">
                        <div>
                            <label className="block text-[10px] text-gray-400 mb-1">Type</label>
                            <select
                                value={selectedType}
                                onChange={(e) => handleFilterChange(setSelectedType, e.target.value)}
                                className="w-full px-2 py-1 bg-[#16124A] border border-gray-700/50 rounded text-micro text-[#efdede] focus:outline-none focus:border-[#2F6BFF] transition-colors"
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
                            <label className="block text-[10px] text-gray-400 mb-1">Status</label>
                            <select
                                value={selectedStatus}
                                onChange={(e) => handleFilterChange(setSelectedStatus, e.target.value)}
                                className="w-full px-2 py-1 bg-[#16124A] border border-gray-700/50 rounded text-micro text-[#efdede] focus:outline-none focus:border-[#2F6BFF] transition-colors"
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
            </div>

            {/* Transactions Table */}
            <div className="bg-gradient-to-br from-[#0B0633] to-[#16124A] rounded-lg border border-[#2F6BFF]/30 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-[#16124A] border-b border-[#2F6BFF]/30">
                                <th className="px-2 py-1.5 text-left text-[10px] font-semibold text-gray-300 uppercase tracking-wider">Date/Time</th>
                                <th className="px-2 py-1.5 text-left text-[10px] font-semibold text-gray-300 uppercase tracking-wider">Description</th>
                                <th className="px-2 py-1.5 text-left text-[10px] font-semibold text-gray-300 uppercase tracking-wider">Type</th>
                                <th className="px-2 py-1.5 text-left text-[10px] font-semibold text-gray-300 uppercase tracking-wider">Status</th>
                                <th className="px-2 py-1.5 text-right text-[10px] font-semibold text-gray-300 uppercase tracking-wider">Amount</th>
                                <th className="px-2 py-1.5 text-right text-[10px] font-semibold text-gray-300 uppercase tracking-wider">Balance</th>
                                <th className="px-2 py-1.5 text-center text-[10px] font-semibold text-gray-300 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2F6BFF]/20">
                            {paginatedTransactions.map((transaction) => (
                                <tr key={transaction.id} className="hover:bg-[#16124A]/50 transition-colors duration-200">
                                    <td className="px-2 py-2 whitespace-nowrap">
                                        <div className="text-[10px] text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">{transaction.date}</div>
                                        <div className="text-[9px] text-gray-400">{transaction.timestamp}</div>
                                    </td>
                                    <td className="px-2 py-2">
                                        <div className="flex items-center gap-1.5">
                                            <div className="p-0.5 bg-[#16124A] rounded flex-shrink-0">
                                                {getTypeIcon(transaction.type)}
                                            </div>
                                            <div>
                                                <div className="text-[10px] text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">{transaction.description}</div>
                                                <div className="text-[9px] text-gray-400">{transaction.reference}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-2 py-2 whitespace-nowrap">
                                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${getTypeColor(transaction.type)}`}>
                                            {transaction.type.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-2 py-2 whitespace-nowrap">
                                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${getStatusColor(transaction.status)}`}>
                                            {transaction.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-2 py-2 text-right whitespace-nowrap">
                                        <div className={`text-[10px] font-bold ${transaction.amount >= 0 ? 'text-green-400' : 'text-white'}`}>
                                            {transaction.amount >= 0 ? '+' : ''}{transaction.amount.toLocaleString()} {transaction.currency}
                                        </div>
                                        {transaction.fee && transaction.fee > 0 && (
                                            <div className="text-[9px] text-gray-400">Fee: ${transaction.fee}</div>
                                        )}
                                    </td>
                                    <td className="px-2 py-2 text-right whitespace-nowrap">
                                        <div className="text-[10px] text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">${transaction.balance?.toLocaleString()}</div>
                                    </td>
                                    <td className="px-2 py-2 text-center whitespace-nowrap">
                                        <button
                                            onClick={() => {
                                                setSelectedTransaction(transaction);
                                                setIsViewModalOpen(true);
                                            }}
                                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#2F6BFF]/20 hover:bg-[#2F6BFF]/30 text-[#2F6BFF] text-[9px] font-semibold transition-colors"
                                        >
                                            <Eye size={10} />
                                            <span>View</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {paginatedTransactions.length === 0 && (
                        <div className="text-center py-8 text-gray-400 text-micro">
                            No transactions found matching your criteria
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {filteredTransactions.length > 0 && (
                    <div className="flex items-center justify-between px-3 py-2 border-t border-[#2F6BFF]/30 bg-[#16124A]">
                        <div className="text-[10px] text-gray-400">
                            Showing {startIndex + 1} to {Math.min(endIndex, filteredTransactions.length)} of {filteredTransactions.length} transactions
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="p-1 rounded bg-[#0B0633] border border-[#2F6BFF]/30 text-gray-300 hover:bg-[#1E1854] hover:text-[#efdede] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
                            >
                                <ChevronLeft size={14} />
                            </button>
                            <div className="flex items-center gap-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all duration-200 ${currentPage === page
                                            ? 'bg-[#2F6BFF] text-white'
                                            : 'bg-[#0B0633] border border-[#2F6BFF]/30 text-gray-300 hover:bg-[#1E1854] hover:text-[#efdede]'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="p-1 rounded bg-[#0B0633] border border-[#2F6BFF]/30 text-gray-300 hover:bg-[#1E1854] hover:text-[#efdede] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
                            >
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* View Transaction Modal */}
            {isViewModalOpen && selectedTransaction && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
                    <div className="bg-gradient-to-br from-[#16124A] to-[#0B0633] rounded-xl shadow-brand-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scaleIn border border-[#2F6BFF]/30">
                        {/* Header */}
                        <div className="flex items-center justify-between p-3 border-b border-[#2F6BFF]/30 bg-gradient-to-r from-[#2F6BFF]/10 via-transparent to-[#FFA62B]/10">
                            <div className="flex items-center gap-2">
                                <Eye size={16} className="text-[#2F6BFF]" />
                                <h2 className="text-small-dashboard text-[#efdede] font-bold">Transaction Details</h2>
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
                                <h3 className="text-small-dashboard text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">Transaction Information</h3>
                                <div className="grid grid-cols-2 gap-2">
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
                                <h3 className="text-small-dashboard text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">Amount Details</h3>
                                <div className="grid grid-cols-2 gap-2">
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
                                <h3 className="text-small-dashboard text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">Description</h3>
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
        </div>
    );
}
