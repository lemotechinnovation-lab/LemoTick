import { Briefcase, ChevronLeft, ChevronRight, Edit2, MoreVertical, Trash2, TrendingDown, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { Portfolio } from '../pages/PortfolioPage';

interface PortfolioListProps {
    onEdit: (portfolio: Portfolio) => void;
}

function PortfolioList({ onEdit }: PortfolioListProps) {
    const [portfolios] = useState<Portfolio[]>([
        {
            id: '1',
            investorId: 'inv-1',
            name: 'Growth Portfolio',
            description: 'High-growth technology stocks',
            initialInvestment: 50000,
            currentValue: 62500,
            totalProfit: 15000,
            totalLoss: 2500,
            netProfit: 12500,
            profitPercentage: 25.0,
            status: 'Active',
            riskLevel: 'High',
            createdAt: '2024-01-15T10:00:00Z',
            maxLossPercentage: 10,
            maxDrawdownPercentage: 15,
            dailyLossLimit: 5,
        },
        {
            id: '2',
            investorId: 'inv-1',
            name: 'Conservative Portfolio',
            description: 'Low-risk bonds and blue-chip stocks',
            initialInvestment: 100000,
            currentValue: 98500,
            totalProfit: 3500,
            totalLoss: 5000,
            netProfit: -1500,
            profitPercentage: -1.5,
            status: 'Active',
            riskLevel: 'Low',
            createdAt: '2024-02-01T10:00:00Z',
            maxLossPercentage: 5,
            maxDrawdownPercentage: 8,
            dailyLossLimit: 2,
        },
    ]);

    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Calculate pagination
    const totalPages = Math.ceil(portfolios.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentPortfolios = portfolios.slice(startIndex, endIndex);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const getStatusColor = (status: Portfolio['status']) => {
        switch (status) {
            case 'Active':
                return 'bg-green-500/10 text-green-400 border-green-500/20';
            case 'Suspended':
                return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
            case 'Closed':
                return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
            case 'UnderReview':
                return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            default:
                return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
        }
    };

    const getRiskColor = (risk: Portfolio['riskLevel']) => {
        switch (risk) {
            case 'Low':
                return 'bg-green-500/10 text-green-400';
            case 'Medium':
                return 'bg-yellow-500/10 text-yellow-400';
            case 'High':
                return 'bg-orange-500/10 text-orange-400';
            case 'VeryHigh':
                return 'bg-red-500/10 text-red-400';
            default:
                return 'bg-gray-500/10 text-gray-400';
        }
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this portfolio?')) {
            console.log('Delete portfolio:', id);
            // TODO: Implement delete API call
        }
    };

    return (
        <div className="bg-gradient-to-br from-[#16124A] to-[#0B0633] rounded-lg shadow-brand-lg overflow-hidden border border-[#2F6BFF]/20">
            {/* Table Header with gradient */}
            <div className="bg-gradient-to-r from-[#2F6BFF]/10 via-[#16124A] to-[#FFA62B]/10 px-4 py-1.5 border-b border-[#2F6BFF]/30">
                <h2 className="text-small-dashboard font-semibold text-[#efdede]">Portfolio List</h2>
                <p className="text-micro text-gray-400">View and manage all your portfolios</p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-700/50 bg-[#0B0633]/50">
                            <th className="px-3 py-2 text-left text-micro text-gray-300 font-semibold">Portfolio Name</th>
                            <th className="px-3 py-2 text-left text-micro text-gray-300 font-semibold">Initial Investment</th>
                            <th className="px-3 py-2 text-left text-micro text-gray-300 font-semibold">Current Value</th>
                            <th className="px-3 py-2 text-left text-micro text-gray-300 font-semibold">Net Profit</th>
                            <th className="px-3 py-2 text-left text-micro text-gray-300 font-semibold">Profit %</th>
                            <th className="px-3 py-2 text-left text-micro text-gray-300 font-semibold">Risk</th>
                            <th className="px-3 py-2 text-left text-micro text-gray-300 font-semibold">Status</th>
                            <th className="px-3 py-2 text-right text-micro text-gray-300 font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentPortfolios.map((portfolio, index) => (
                            <tr
                                key={portfolio.id}
                                className="border-b border-gray-700/30 hover:bg-gradient-to-r hover:from-[#2F6BFF]/10 hover:to-transparent transition-all duration-300 group"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <td className="px-3 py-2">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#2F6BFF]/20 to-[#2F6BFF]/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                            <Briefcase size={12} className="text-[#2F6BFF]" />
                                        </div>
                                        <div>
                                            <div className="text-micro font-semibold text-white group-hover:text-[#2F6BFF] transition-colors duration-300">{portfolio.name}</div>
                                            {portfolio.description && (
                                                <div className="text-micro text-gray-400">{portfolio.description}</div>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-3 py-2">
                                    <span className="text-micro text-[#efdede] font-tabular">
                                        ${portfolio.initialInvestment.toLocaleString()}
                                    </span>
                                </td>
                                <td className="px-3 py-2">
                                    <span className="text-micro text-[#efdede] font-tabular">
                                        ${portfolio.currentValue.toLocaleString()}
                                    </span>
                                </td>
                                <td className="px-3 py-2">
                                    <div className="flex items-center gap-0.5">
                                        {portfolio.netProfit >= 0 ? (
                                            <TrendingUp size={11} className="text-green-400" />
                                        ) : (
                                            <TrendingDown size={11} className="text-red-400" />
                                        )}
                                        <span
                                            className={`text-micro font-tabular ${portfolio.netProfit >= 0 ? 'text-green-400' : 'text-red-400'
                                                }`}
                                        >
                                            ${Math.abs(portfolio.netProfit).toLocaleString()}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-3 py-2">
                                    <span
                                        className={`text-micro font-tabular ${portfolio.profitPercentage >= 0 ? 'text-green-400' : 'text-red-400'
                                            }`}
                                    >
                                        {portfolio.profitPercentage >= 0 ? '+' : ''}
                                        {portfolio.profitPercentage.toFixed(2)}%
                                    </span>
                                </td>
                                <td className="px-3 py-2">
                                    <span
                                        className={`inline-flex items-center px-1.5 py-0.5 rounded text-micro font-semibold ${getRiskColor(
                                            portfolio.riskLevel
                                        )} border border-current/20`}
                                    >
                                        {portfolio.riskLevel}
                                    </span>
                                </td>
                                <td className="px-3 py-2">
                                    <span
                                        className={`inline-flex items-center px-1.5 py-0.5 rounded text-micro font-semibold border ${getStatusColor(
                                            portfolio.status
                                        )}`}
                                    >
                                        {portfolio.status}
                                    </span>
                                </td>
                                <td className="px-3 py-2">
                                    <div className="flex items-center justify-end gap-0.5 relative">
                                        <button
                                            onClick={() => onEdit(portfolio)}
                                            className="p-1 hover:bg-[#2F6BFF]/20 rounded transition-all duration-200 hover:scale-110"
                                            title="Edit"
                                        >
                                            <Edit2 size={12} className="text-[#2F6BFF]" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(portfolio.id)}
                                            className="p-1 hover:bg-red-500/20 rounded transition-all duration-200 hover:scale-110"
                                            title="Delete"
                                        >
                                            <Trash2 size={12} className="text-red-400" />
                                        </button>
                                        <button
                                            onClick={() => setOpenMenuId(openMenuId === portfolio.id ? null : portfolio.id)}
                                            className="p-1 hover:bg-[#2F6BFF]/20 rounded transition-all duration-200 hover:scale-110"
                                        >
                                            <MoreVertical size={12} className="text-gray-300" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {portfolios.length > 0 && (
                <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-700/50">
                    <div className="text-micro text-gray-400">
                        Showing {startIndex + 1} to {Math.min(endIndex, portfolios.length)} of {portfolios.length} portfolios
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="p-1 hover:bg-[#2F6BFF]/20 rounded transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                            title="Previous page"
                        >
                            <ChevronLeft size={16} className="text-gray-300" />
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                onClick={() => handlePageChange(page)}
                                className={`px-2 py-1 rounded text-micro transition-all duration-200 ${currentPage === page
                                        ? 'bg-[#2F6BFF] text-white'
                                        : 'text-gray-300 hover:bg-[#2F6BFF]/20'
                                    }`}
                            >
                                {page}
                            </button>
                        ))}

                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="p-1 hover:bg-[#2F6BFF]/20 rounded transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                            title="Next page"
                        >
                            <ChevronRight size={16} className="text-gray-300" />
                        </button>
                    </div>
                </div>
            )}

            {portfolios.length === 0 && (
                <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-[#2F6BFF]/10 mb-2">
                        <Briefcase size={20} className="text-[#2F6BFF]" />
                    </div>
                    <p className="text-micro text-gray-300 mb-0.5">No portfolios found</p>
                    <p className="text-micro text-gray-400">Create your first portfolio to get started</p>
                </div>
            )}
        </div>
    );
}

export default PortfolioList;


