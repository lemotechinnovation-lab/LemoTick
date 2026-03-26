import { Activity, ChevronLeft, ChevronRight, Eye, TrendingDown, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { PerformanceMetric } from '../pages/PerformanceMetricsPage';
import PerformanceDetailsModal from './PerformanceDetailsModal';

function PerformanceList() {
    const [metrics] = useState<PerformanceMetric[]>([
        {
            id: '1',
            portfolioId: 'p1',
            portfolioName: 'Growth Portfolio',
            date: '2024-03-01',
            totalValue: 62500,
            totalProfit: 15000,
            totalLoss: 2500,
            netProfit: 12500,
            profitPercentage: 25.0,
            drawdown: 5.2,
            maxDrawdown: 8.5,
            sharpeRatio: 2.15,
            winRate: 68.5,
            totalTrades: 45,
            winningTrades: 31,
            losingTrades: 14,
            averageWin: 850,
            averageLoss: 320,
            profitFactor: 2.65,
            createdAt: '2024-03-01T10:00:00Z',
        },
        {
            id: '2',
            portfolioId: 'p2',
            portfolioName: 'Conservative Portfolio',
            date: '2024-03-01',
            totalValue: 98500,
            totalProfit: 3500,
            totalLoss: 5000,
            netProfit: -1500,
            profitPercentage: -1.5,
            drawdown: 2.8,
            maxDrawdown: 4.2,
            sharpeRatio: 1.55,
            winRate: 62.5,
            totalTrades: 32,
            winningTrades: 20,
            losingTrades: 12,
            averageWin: 425,
            averageLoss: 280,
            profitFactor: 1.52,
            createdAt: '2024-03-01T10:00:00Z',
        },
    ]);

    const [currentPage, setCurrentPage] = useState(1);
    const [selectedMetric, setSelectedMetric] = useState<PerformanceMetric | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const itemsPerPage = 5;

    // Calculate pagination
    const totalPages = Math.ceil(metrics.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentMetrics = metrics.slice(startIndex, endIndex);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleViewDetails = (metric: PerformanceMetric) => {
        setSelectedMetric(metric);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedMetric(null);
    };

    return (
        <div className="bg-gradient-to-br from-[#16124A] to-[#0B0633] rounded-lg shadow-brand-lg overflow-hidden border border-[#2F6BFF]/20">
            {/* Table Header with gradient */}
            <div className="bg-gradient-to-r from-[#2F6BFF]/10 via-[#16124A] to-[#FFA62B]/10 px-4 py-1.5 border-b border-[#2F6BFF]/30">
                <h2 className="text-small-dashboard font-semibold text-[#efdede]">Performance Metrics</h2>
                <p className="text-micro text-gray-400">View detailed performance analytics</p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-700/50 bg-[#0B0633]/50">
                            <th className="px-3 py-2 text-left text-micro text-gray-300 font-semibold">Portfolio</th>
                            <th className="px-3 py-2 text-left text-micro text-gray-300 font-semibold">Date</th>
                            <th className="px-3 py-2 text-left text-micro text-gray-300 font-semibold">Total Value</th>
                            <th className="px-3 py-2 text-left text-micro text-gray-300 font-semibold">Net Profit</th>
                            <th className="px-3 py-2 text-left text-micro text-gray-300 font-semibold">Win Rate</th>
                            <th className="px-3 py-2 text-left text-micro text-gray-300 font-semibold">Sharpe</th>
                            <th className="px-3 py-2 text-left text-micro text-gray-300 font-semibold">Trades</th>
                            <th className="px-3 py-2 text-right text-micro text-gray-300 font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentMetrics.map((metric, index) => (
                            <tr
                                key={metric.id}
                                className="border-b border-gray-700/30 hover:bg-gradient-to-r hover:from-[#2F6BFF]/10 hover:to-transparent transition-all duration-300 group"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <td className="px-3 py-2">
                                    <div className="text-micro font-semibold text-white group-hover:text-[#2F6BFF] transition-colors duration-300">
                                        {metric.portfolioName}
                                    </div>
                                </td>
                                <td className="px-3 py-2">
                                    <span className="text-micro text-gray-300">
                                        {new Date(metric.date).toLocaleDateString()}
                                    </span>
                                </td>
                                <td className="px-3 py-2">
                                    <span className="text-micro text-[#efdede] font-tabular">
                                        ${metric.totalValue.toLocaleString()}
                                    </span>
                                </td>
                                <td className="px-3 py-2">
                                    <div className="flex items-center gap-0.5">
                                        {metric.netProfit >= 0 ? (
                                            <TrendingUp size={11} className="text-green-400" />
                                        ) : (
                                            <TrendingDown size={11} className="text-red-400" />
                                        )}
                                        <span
                                            className={`text-micro font-tabular ${metric.netProfit >= 0 ? 'text-green-400' : 'text-red-400'
                                                }`}
                                        >
                                            ${Math.abs(metric.netProfit).toLocaleString()}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-3 py-2">
                                    <span className="text-micro text-[#efdede] font-tabular">
                                        {metric.winRate.toFixed(1)}%
                                    </span>
                                </td>
                                <td className="px-3 py-2">
                                    <span className={`text-micro font-tabular ${metric.sharpeRatio >= 2 ? 'text-green-400' :
                                        metric.sharpeRatio >= 1 ? 'text-yellow-400' : 'text-red-400'
                                        }`}>
                                        {metric.sharpeRatio.toFixed(2)}
                                    </span>
                                </td>
                                <td className="px-3 py-2">
                                    <div className="text-micro text-[#efdede]">
                                        <span className="text-green-400">{metric.winningTrades}</span>
                                        <span className="text-gray-400">/</span>
                                        <span className="text-red-400">{metric.losingTrades}</span>
                                    </div>
                                </td>
                                <td className="px-3 py-2">
                                    <div className="flex items-center justify-end gap-0.5 relative">
                                        <button
                                            onClick={() => handleViewDetails(metric)}
                                            className="p-1 hover:bg-[#2F6BFF]/20 rounded transition-all duration-200 hover:scale-110"
                                            title="View Details"
                                        >
                                            <Eye size={12} className="text-[#2F6BFF]" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {metrics.length > 0 && (
                <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-700/50">
                    <div className="text-micro text-gray-400">
                        Showing {startIndex + 1} to {Math.min(endIndex, metrics.length)} of {metrics.length} metrics
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

            {metrics.length === 0 && (
                <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-[#2F6BFF]/10 mb-2">
                        <Activity size={20} className="text-[#2F6BFF]" />
                    </div>
                    <p className="text-micro text-gray-300 mb-0.5">No performance metrics found</p>
                    <p className="text-micro text-gray-400">Performance data will appear here</p>
                </div>
            )}

            {/* Performance Details Modal */}
            {isModalOpen && (
                <PerformanceDetailsModal
                    metric={selectedMetric}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
}

export default PerformanceList;
