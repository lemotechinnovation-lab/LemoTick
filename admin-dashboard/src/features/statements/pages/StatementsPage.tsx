import ModernAreaChart from '@/components/charts/ModernAreaChart';
import { PageHeader } from '@/components/ui/PageHeader';
import { ContentSection, PageContainer, PageGrid, Stack, StatsCard } from '@/components/ui/PageLayoutEnhanced';
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

    // Generate statement size trend data
    const statementSizeData = statements.slice(0, 6).reverse().map(stmt =>
        parseFloat(stmt.fileSize.replace(' MB', ''))
    );

    return (
        <PageContainer maxWidth="xl">
            {/* Page Header */}
            <PageHeader
                title="STATEMENTS"
                description="Access and download your financial statements"
                icon={FileText}
                actions={
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#2F6BFF]/30 bg-[#16124A] text-gray-300 hover:bg-[#1E1854] hover:border-[#2F6BFF] disabled:opacity-50 transition-all duration-300 text-sm font-semibold"
                        >
                            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                            <span>Refresh</span>
                        </button>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#2F6BFF]/30 bg-[#16124A] text-gray-300 hover:bg-[#1E1854] hover:border-[#2F6BFF] transition-all duration-300 text-sm font-semibold"
                        >
                            <Filter className="w-4 h-4" />
                            <span>Filters</span>
                        </button>
                    </div>
                }
            />

            <Stack spacing="lg">
                {/* Stats Cards */}
                <PageGrid cols={4}>
                    {/* Available Statements */}
                    <StatsCard
                        icon={<FileText className="w-5 h-5 sm:w-6 sm:h-6" />}
                        value={totalAvailable.toString()}
                        label="Ready to Download"
                        iconColor="text-[#10B981]"
                    />

                    {/* Processing */}
                    <StatsCard
                        icon={<RefreshCw className="w-5 h-5 sm:w-6 sm:h-6" />}
                        value={totalProcessing.toString()}
                        label="Being Generated"
                        iconColor="text-[#F59E0B]"
                    />

                    {/* Monthly Statements */}
                    <StatsCard
                        icon={<Calendar className="w-5 h-5 sm:w-6 sm:h-6" />}
                        value={totalMonthly.toString()}
                        label="Monthly Reports"
                        iconColor="text-[#2F6BFF]"
                    />

                    {/* Quarterly Statements */}
                    <StatsCard
                        icon={<Calendar className="w-5 h-5 sm:w-6 sm:h-6" />}
                        value={totalQuarterly.toString()}
                        label="Quarterly Reports"
                        iconColor="text-[#8B5CF6]"
                    />
                </PageGrid>

                {/* Statement Size Trend */}
                <ContentSection title="Statement File Sizes" description="File size trends across recent statements">
                    <div className="h-48 sm:h-64">
                        <ModernAreaChart
                            data={statementSizeData}
                            color="#8B5CF6"
                            gradientFrom="#8B5CF6"
                            gradientTo="#A78BFA"
                            showGrid={true}
                            animate={true}
                        />
                    </div>
                </ContentSection>

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
                            placeholder="Search by period or statement ID..."
                            className="w-full pl-12 pr-4 py-3 bg-[#16124A]/50 border border-[#2F6BFF]/20 rounded-xl text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#2F6BFF] transition-all duration-200"
                        />
                    </div>

                    {/* Filter Options */}
                    {showFilters && (
                        <div className="grid grid-cols-1 md:grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 p-4 sm:p-6 bg-[#16124A]/50 border border-[#2F6BFF]/20 rounded-xl animate-fadeIn w-full max-w-full">
                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-2">Statement Type</label>
                                <select
                                    value={selectedType}
                                    onChange={(e) => handleFilterChange(setSelectedType, e.target.value)}
                                    className="w-full px-4 py-3 bg-[#0B0633] border border-[#2F6BFF]/20 rounded-xl text-sm text-white focus:outline-none focus:border-[#2F6BFF] transition-all duration-200"
                                >
                                    <option value="all">All Types</option>
                                    <option value="monthly">Monthly</option>
                                    <option value="quarterly">Quarterly</option>
                                    <option value="annual">Annual</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-2">Status</label>
                                <select
                                    value={selectedStatus}
                                    onChange={(e) => handleFilterChange(setSelectedStatus, e.target.value)}
                                    className="w-full px-4 py-3 bg-[#0B0633] border border-[#2F6BFF]/20 rounded-xl text-sm text-white focus:outline-none focus:border-[#2F6BFF] transition-all duration-200"
                                >
                                    <option value="all">All Status</option>
                                    <option value="available">Available</option>
                                    <option value="processing">Processing</option>
                                    <option value="pending">Pending</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Statements Table */}
                    <div className="bg-[#16124A]/50 rounded-2xl border border-[#2F6BFF]/20 shadow-xl overflow-hidden mt-4">

                        {/* ── MOBILE: stacked card view ── */}
                        <div className="sm:hidden divide-y divide-[#2F6BFF]/10">
                            {paginatedStatements.length === 0 ? (
                                <div className="text-center py-10 text-gray-400 text-sm">No statements found</div>
                            ) : paginatedStatements.map((statement) => (
                                <div key={statement.id} className="p-4 hover:bg-[#2F6BFF]/5 transition-colors">
                                    {/* Row 1: period + badges */}
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <div>
                                            <div className="text-sm text-white font-semibold">{statement.period}</div>
                                            <div className="text-xs text-gray-400">{statement.startDate} – {statement.endDate}</div>
                                        </div>
                                        <div className="flex gap-1.5 flex-wrap justify-end">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getTypeColor(statement.type)}`}>{statement.type.toUpperCase()}</span>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(statement.status)}`}>{statement.status.toUpperCase()}</span>
                                        </div>
                                    </div>
                                    {/* Row 2: stats */}
                                    <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
                                        <div className="bg-[#2F6BFF]/5 rounded-lg p-2">
                                            <div className="text-gray-400 mb-0.5">Transactions</div>
                                            <div className="text-white font-semibold">{statement.totalTransactions}</div>
                                        </div>
                                        <div className="bg-[#2F6BFF]/5 rounded-lg p-2">
                                            <div className="text-gray-400 mb-0.5">Opening</div>
                                            <div className="text-white font-semibold">${statement.openingBalance.toLocaleString()}</div>
                                        </div>
                                        <div className="bg-[#2F6BFF]/5 rounded-lg p-2">
                                            <div className="text-gray-400 mb-0.5">Closing</div>
                                            <div className="text-white font-semibold">${statement.closingBalance.toLocaleString()}</div>
                                        </div>
                                    </div>
                                    {/* Row 3: actions */}
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handleView(statement)} disabled={statement.status !== 'available'}
                                            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#2F6BFF]/20 hover:bg-[#2F6BFF]/30 text-[#2F6BFF] text-xs font-semibold transition-all border border-[#2F6BFF]/30 disabled:opacity-30 disabled:cursor-not-allowed">
                                            <Eye className="w-3.5 h-3.5" /> View
                                        </button>
                                        <button onClick={() => handleDownload(statement)} disabled={statement.status !== 'available'}
                                            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-green-500/20 hover:bg-green-500/30 text-green-400 text-xs font-semibold transition-all border border-green-500/30 disabled:opacity-30 disabled:cursor-not-allowed">
                                            <Download className="w-3.5 h-3.5" /> Download
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* ── DESKTOP: full table ── */}
                        <div className="hidden sm:block overflow-x-auto w-full">
                            <table className="w-full min-w-[600px]">
                                <thead>
                                    <tr className="bg-gradient-to-r from-[#2F6BFF]/10 to-transparent border-b border-[#2F6BFF]/30">
                                        <th className="px-4 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Period</th>
                                        <th className="px-4 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Type</th>
                                        <th className="px-4 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Status</th>
                                        <th className="px-4 py-4 text-right text-xs font-semibold text-gray-300 uppercase tracking-wider">Transactions</th>
                                        <th className="px-4 py-4 text-right text-xs font-semibold text-gray-300 uppercase tracking-wider">Opening</th>
                                        <th className="px-4 py-4 text-right text-xs font-semibold text-gray-300 uppercase tracking-wider">Closing</th>
                                        <th className="px-4 py-4 text-center text-xs font-semibold text-gray-300 uppercase tracking-wider">Size</th>
                                        <th className="px-4 py-4 text-center text-xs font-semibold text-gray-300 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#2F6BFF]/10">
                                    {paginatedStatements.map((statement) => (
                                        <tr key={statement.id} className="hover:bg-[#2F6BFF]/5 transition-colors duration-200">
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <div className="text-sm text-white font-semibold">{statement.period}</div>
                                                <div className="text-xs text-gray-400">{statement.startDate} - {statement.endDate}</div>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getTypeColor(statement.type)}`}>{statement.type.toUpperCase()}</span>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(statement.status)}`}>{statement.status.toUpperCase()}</span>
                                            </td>
                                            <td className="px-4 py-4 text-right whitespace-nowrap">
                                                <div className="text-sm text-white font-semibold">{statement.totalTransactions}</div>
                                            </td>
                                            <td className="px-4 py-4 text-right whitespace-nowrap">
                                                <div className="text-sm text-white font-semibold">${statement.openingBalance.toLocaleString()}</div>
                                            </td>
                                            <td className="px-4 py-4 text-right whitespace-nowrap">
                                                <div className="text-sm text-white font-semibold">${statement.closingBalance.toLocaleString()}</div>
                                            </td>
                                            <td className="px-4 py-4 text-center whitespace-nowrap">
                                                <div className="text-sm text-gray-400">{statement.fileSize}</div>
                                            </td>
                                            <td className="px-4 py-4 text-center whitespace-nowrap">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button onClick={() => handleView(statement)} disabled={statement.status !== 'available'}
                                                        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-[#2F6BFF]/20 hover:bg-[#2F6BFF]/30 text-[#2F6BFF] text-xs font-semibold transition-all duration-200 border border-[#2F6BFF]/30 hover:border-[#2F6BFF] disabled:opacity-30 disabled:cursor-not-allowed">
                                                        <Eye className="w-4 h-4" /><span>View</span>
                                                    </button>
                                                    <button onClick={() => handleDownload(statement)} disabled={statement.status !== 'available'}
                                                        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-green-500/20 hover:bg-green-500/30 text-green-400 text-xs font-semibold transition-all duration-200 border border-green-500/30 hover:border-green-500 disabled:opacity-30 disabled:cursor-not-allowed">
                                                        <Download className="w-4 h-4" /><span>Download</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {paginatedStatements.length === 0 && (
                                <div className="text-center py-12 text-gray-400 text-sm">No statements found matching your criteria</div>
                            )}
                        </div>

                        {/* Pagination */}
                        {filteredStatements.length > 0 && (
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-4 sm:px-6 py-4 border-t border-[#2F6BFF]/20 bg-gradient-to-r from-[#2F6BFF]/5 to-transparent">
                                <div className="text-sm text-gray-400">
                                    Showing {startIndex + 1} to {Math.min(endIndex, filteredStatements.length)} of {filteredStatements.length} statements
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                        className="p-2 rounded-xl bg-[#0B0633] border border-[#2F6BFF]/30 text-gray-300 hover:bg-[#16124A] hover:border-[#2F6BFF] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <div className="flex items-center gap-2">
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                            <button
                                                key={page}
                                                onClick={() => setCurrentPage(page)}
                                                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${currentPage === page
                                                    ? 'bg-[#2F6BFF] text-white shadow-lg'
                                                    : 'bg-[#0B0633] border border-[#2F6BFF]/30 text-gray-300 hover:bg-[#16124A] hover:border-[#2F6BFF] hover:text-white'
                                                    }`}
                                            >
                                                {page}
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                        disabled={currentPage === totalPages}
                                        className="p-2 rounded-xl bg-[#0B0633] border border-[#2F6BFF]/30 text-gray-300 hover:bg-[#16124A] hover:border-[#2F6BFF] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </Stack>
        </PageContainer>
    );
}


