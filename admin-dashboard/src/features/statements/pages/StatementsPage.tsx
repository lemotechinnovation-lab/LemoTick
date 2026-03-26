import { Calendar, ChevronLeft, ChevronRight, Download, Eye, FileText, Filter, RefreshCw, Search } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export interface Statement {
    id: string;
    period: string;
    type: 'monthly' | 'quarterly' | 'annual';
    startDate: string;
    endDate: string;
    status: 'available' | 'processing' | 'pending';
    fileSize: string;
    generatedDate: string;
    totalTransactions: number;
    openingBalance: number;
    closingBalance: number;
    totalDeposits: number;
    totalWithdrawals: number;
}

export default function StatementsPage() {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState<string>('all');
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [showFilters, setShowFilters] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const [statements] = useState<Statement[]>([
        {
            id: 'STMT001',
            period: 'March 2024',
            type: 'monthly',
            startDate: '2024-03-01',
            endDate: '2024-03-31',
            status: 'available',
            fileSize: '2.4 MB',
            generatedDate: '2024-04-01',
            totalTransactions: 45,
            openingBalance: 10000,
            closingBalance: 15000,
            totalDeposits: 8000,
            totalWithdrawals: 3000,
        },
        {
            id: 'STMT002',
            period: 'February 2024',
            type: 'monthly',
            startDate: '2024-02-01',
            endDate: '2024-02-29',
            status: 'available',
            fileSize: '2.1 MB',
            generatedDate: '2024-03-01',
            totalTransactions: 38,
            openingBalance: 8500,
            closingBalance: 10000,
            totalDeposits: 5000,
            totalWithdrawals: 3500,
        },
        {
            id: 'STMT003',
            period: 'Q1 2024',
            type: 'quarterly',
            startDate: '2024-01-01',
            endDate: '2024-03-31',
            status: 'processing',
            fileSize: '6.8 MB',
            generatedDate: '2024-04-05',
            totalTransactions: 125,
            openingBalance: 5000,
            closingBalance: 15000,
            totalDeposits: 20000,
            totalWithdrawals: 10000,
        },
        {
            id: 'STMT004',
            period: 'January 2024',
            type: 'monthly',
            startDate: '2024-01-01',
            endDate: '2024-01-31',
            status: 'available',
            fileSize: '1.9 MB',
            generatedDate: '2024-02-01',
            totalTransactions: 32,
            openingBalance: 5000,
            closingBalance: 8500,
            totalDeposits: 6000,
            totalWithdrawals: 2500,
        },
        {
            id: 'STMT005',
            period: 'December 2023',
            type: 'monthly',
            startDate: '2023-12-01',
            endDate: '2023-12-31',
            status: 'available',
            fileSize: '2.3 MB',
            generatedDate: '2024-01-01',
            totalTransactions: 41,
            openingBalance: 4000,
            closingBalance: 5000,
            totalDeposits: 4500,
            totalWithdrawals: 3500,
        },
        {
            id: 'STMT006',
            period: 'Q4 2023',
            type: 'quarterly',
            startDate: '2023-10-01',
            endDate: '2023-12-31',
            status: 'available',
            fileSize: '6.2 MB',
            generatedDate: '2024-01-05',
            totalTransactions: 118,
            openingBalance: 3000,
            closingBalance: 5000,
            totalDeposits: 12000,
            totalWithdrawals: 10000,
        },
    ]);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast.success('Statements refreshed successfully!');
        setIsRefreshing(false);
    };

    const handleDownload = (statement: Statement) => {
        if (statement.status === 'available') {
            toast.success(`Downloading ${statement.period} statement...`);
        } else {
            toast.error('Statement is not available for download yet');
        }
    };

    const handleView = (statement: Statement) => {
        if (statement.status === 'available') {
            toast.success(`Opening ${statement.period} statement...`);
        } else {
            toast.error('Statement is not available for viewing yet');
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'monthly': return 'text-[#2F6BFF] bg-[#2F6BFF]/20';
            case 'quarterly': return 'text-purple-400 bg-purple-500/20';
            case 'annual': return 'text-[#FFA62B] bg-[#FFA62B]/20';
            default: return 'text-gray-400 bg-gray-500/20';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'available': return 'text-green-400 bg-green-500/20';
            case 'processing': return 'text-yellow-400 bg-yellow-500/20';
            case 'pending': return 'text-gray-400 bg-gray-500/20';
            default: return 'text-gray-400 bg-gray-500/20';
        }
    };

    const filteredStatements = statements.filter(stmt => {
        const matchesSearch = stmt.period.toLowerCase().includes(searchQuery.toLowerCase()) ||
            stmt.id.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = selectedType === 'all' || stmt.type === selectedType;
        const matchesStatus = selectedStatus === 'all' || stmt.status === selectedStatus;
        return matchesSearch && matchesType && matchesStatus;
    });

    // Pagination
    const totalPages = Math.ceil(filteredStatements.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedStatements = filteredStatements.slice(startIndex, endIndex);

    const handleFilterChange = (setter: (value: string) => void, value: string) => {
        setter(value);
        setCurrentPage(1);
    };

    const totalAvailable = statements.filter(s => s.status === 'available').length;
    const totalProcessing = statements.filter(s => s.status === 'processing').length;
    const totalMonthly = statements.filter(s => s.type === 'monthly').length;
    const totalQuarterly = statements.filter(s => s.type === 'quarterly').length;

    return (
        <div className="px-4 sm:px-6 lg:px-8 py-4 w-full max-w-9xl mx-auto">
            {/* Page header */}
            <div className="relative mb-4 p-3 rounded-lg bg-gradient-to-br from-[#2F6BFF]/10 via-[#16124A] to-[#FFA62B]/10 border border-[#2F6BFF]/20">
                <div className="sm:flex sm:justify-between sm:items-center">
                    <div className="mb-2 sm:mb-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                            <div className="p-1.5 bg-[#2F6BFF]/20 rounded-lg">
                                <FileText size={16} className="text-[#2F6BFF]" />
                            </div>
                            <h1 className="text-body-dashboard font-bold text-[#efdede] drop-shadow-[0_0_6px_rgba(160,167,181,0.3)]">Statements</h1>
                        </div>
                        <p className="text-micro text-gray-300 ml-8">Access and download your financial statements</p>
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
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
                {/* Available Statements */}
                <div className="relative overflow-hidden bg-gradient-to-br from-[#16124A] to-[#0B0633] rounded-lg p-2 border border-green-500/30 hover:border-green-500/60 transition-all duration-300 hover-lift group">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-green-500/5 rounded-full blur-xl group-hover:bg-green-500/10 transition-all duration-300"></div>
                    <div className="relative">
                        <div className="flex items-center justify-between mb-1">
                            <div className="p-0.5 bg-gradient-to-br from-green-500/20 to-green-500/5 rounded group-hover:scale-110 transition-transform duration-300">
                                <FileText size={14} className="text-green-400" />
                            </div>
                            <span className="text-[10px] text-green-400 font-medium">Available</span>
                        </div>
                        <div className="text-small-dashboard font-bold text-green-400 font-tabular">{totalAvailable}</div>
                        <div className="text-[10px] text-gray-400">Ready to Download</div>
                    </div>
                </div>

                {/* Processing */}
                <div className="relative overflow-hidden bg-gradient-to-br from-[#16124A] to-[#0B0633] rounded-lg p-2 border border-yellow-500/30 hover:border-yellow-500/60 transition-all duration-300 hover-lift group">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-500/5 rounded-full blur-xl group-hover:bg-yellow-500/10 transition-all duration-300"></div>
                    <div className="relative">
                        <div className="flex items-center justify-between mb-1">
                            <div className="p-0.5 bg-gradient-to-br from-yellow-500/20 to-yellow-500/5 rounded group-hover:scale-110 transition-transform duration-300">
                                <RefreshCw size={14} className="text-yellow-400" />
                            </div>
                            <span className="text-[10px] text-yellow-400 font-medium">Processing</span>
                        </div>
                        <div className="text-small-dashboard font-bold text-[#efdede] font-tabular drop-shadow-[0_0_6px_rgba(160,167,181,0.3)]">{totalProcessing}</div>
                        <div className="text-[10px] text-gray-400">Being Generated</div>
                    </div>
                </div>

                {/* Monthly Statements */}
                <div className="relative overflow-hidden bg-gradient-to-br from-[#16124A] to-[#0B0633] rounded-lg p-2 border border-[#2F6BFF]/30 hover:border-[#2F6BFF]/60 transition-all duration-300 hover-lift group">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-[#2F6BFF]/5 rounded-full blur-xl group-hover:bg-[#2F6BFF]/10 transition-all duration-300"></div>
                    <div className="relative">
                        <div className="flex items-center justify-between mb-1">
                            <div className="p-0.5 bg-gradient-to-br from-[#2F6BFF]/20 to-[#2F6BFF]/5 rounded group-hover:scale-110 transition-transform duration-300">
                                <Calendar size={14} className="text-[#2F6BFF]" />
                            </div>
                            <span className="text-[10px] text-gray-400 font-medium">Monthly</span>
                        </div>
                        <div className="text-small-dashboard font-bold text-[#efdede] font-tabular drop-shadow-[0_0_6px_rgba(160,167,181,0.3)]">{totalMonthly}</div>
                        <div className="text-[10px] text-gray-400">Monthly Reports</div>
                    </div>
                </div>

                {/* Quarterly Statements */}
                <div className="relative overflow-hidden bg-gradient-to-br from-[#16124A] to-[#0B0633] rounded-lg p-2 border border-purple-500/30 hover:border-purple-500/60 transition-all duration-300 hover-lift group">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/5 rounded-full blur-xl group-hover:bg-purple-500/10 transition-all duration-300"></div>
                    <div className="relative">
                        <div className="flex items-center justify-between mb-1">
                            <div className="p-0.5 bg-gradient-to-br from-purple-500/20 to-purple-500/5 rounded group-hover:scale-110 transition-transform duration-300">
                                <Calendar size={14} className="text-purple-400" />
                            </div>
                            <span className="text-[10px] text-gray-400 font-medium">Quarterly</span>
                        </div>
                        <div className="text-small-dashboard font-bold text-[#efdede] font-tabular drop-shadow-[0_0_6px_rgba(160,167,181,0.3)]">{totalQuarterly}</div>
                        <div className="text-[10px] text-gray-400">Quarterly Reports</div>
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
                        placeholder="Search by period or statement ID..."
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
                                <option value="monthly">Monthly</option>
                                <option value="quarterly">Quarterly</option>
                                <option value="annual">Annual</option>
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
                                <option value="available">Available</option>
                                <option value="processing">Processing</option>
                                <option value="pending">Pending</option>
                            </select>
                        </div>
                    </div>
                )}
            </div>

            {/* Statements Table */}
            <div className="bg-gradient-to-br from-[#0B0633] to-[#16124A] rounded-lg border border-[#2F6BFF]/30 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-[#16124A] border-b border-[#2F6BFF]/30">
                                <th className="px-2 py-1.5 text-left text-[10px] font-semibold text-gray-300 uppercase tracking-wider">Period</th>
                                <th className="px-2 py-1.5 text-left text-[10px] font-semibold text-gray-300 uppercase tracking-wider">Type</th>
                                <th className="px-2 py-1.5 text-left text-[10px] font-semibold text-gray-300 uppercase tracking-wider">Status</th>
                                <th className="px-2 py-1.5 text-right text-[10px] font-semibold text-gray-300 uppercase tracking-wider">Transactions</th>
                                <th className="px-2 py-1.5 text-right text-[10px] font-semibold text-gray-300 uppercase tracking-wider">Opening</th>
                                <th className="px-2 py-1.5 text-right text-[10px] font-semibold text-gray-300 uppercase tracking-wider">Closing</th>
                                <th className="px-2 py-1.5 text-center text-[10px] font-semibold text-gray-300 uppercase tracking-wider">Size</th>
                                <th className="px-2 py-1.5 text-center text-[10px] font-semibold text-gray-300 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2F6BFF]/20">
                            {paginatedStatements.map((statement) => (
                                <tr key={statement.id} className="hover:bg-[#16124A]/50 transition-colors duration-200">
                                    <td className="px-2 py-2 whitespace-nowrap">
                                        <div className="text-[10px] text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">{statement.period}</div>
                                        <div className="text-[9px] text-gray-400">{statement.startDate} - {statement.endDate}</div>
                                    </td>
                                    <td className="px-2 py-2 whitespace-nowrap">
                                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${getTypeColor(statement.type)}`}>
                                            {statement.type.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-2 py-2 whitespace-nowrap">
                                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${getStatusColor(statement.status)}`}>
                                            {statement.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-2 py-2 text-right whitespace-nowrap">
                                        <div className="text-[10px] text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">{statement.totalTransactions}</div>
                                    </td>
                                    <td className="px-2 py-2 text-right whitespace-nowrap">
                                        <div className="text-[10px] text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">${statement.openingBalance.toLocaleString()}</div>
                                    </td>
                                    <td className="px-2 py-2 text-right whitespace-nowrap">
                                        <div className="text-[10px] text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">${statement.closingBalance.toLocaleString()}</div>
                                    </td>
                                    <td className="px-2 py-2 text-center whitespace-nowrap">
                                        <div className="text-[10px] text-gray-400">{statement.fileSize}</div>
                                    </td>
                                    <td className="px-2 py-2 text-center whitespace-nowrap">
                                        <div className="flex items-center justify-center gap-1">
                                            <button
                                                onClick={() => handleView(statement)}
                                                disabled={statement.status !== 'available'}
                                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#2F6BFF]/20 hover:bg-[#2F6BFF]/30 text-[#2F6BFF] text-[9px] font-semibold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                            >
                                                <Eye size={10} />
                                                <span>View</span>
                                            </button>
                                            <button
                                                onClick={() => handleDownload(statement)}
                                                disabled={statement.status !== 'available'}
                                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-green-500/20 hover:bg-green-500/30 text-green-400 text-[9px] font-semibold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                            >
                                                <Download size={10} />
                                                <span>Download</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {paginatedStatements.length === 0 && (
                        <div className="text-center py-8 text-gray-400 text-micro">
                            No statements found matching your criteria
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {filteredStatements.length > 0 && (
                    <div className="flex items-center justify-between px-3 py-2 border-t border-[#2F6BFF]/30 bg-[#16124A]">
                        <div className="text-[10px] text-gray-400">
                            Showing {startIndex + 1} to {Math.min(endIndex, filteredStatements.length)} of {filteredStatements.length} statements
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
        </div>
    );
}
