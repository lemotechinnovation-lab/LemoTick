import { Activity, DollarSign, Percent, TrendingUp } from 'lucide-react';
import PerformanceList from '../components/PerformanceList';

export interface PerformanceMetric {
    id: string;
    portfolioId: string;
    portfolioName: string;
    date: string;
    totalValue: number;
    totalProfit: number;
    totalLoss: number;
    netProfit: number;
    profitPercentage: number;
    drawdown: number;
    maxDrawdown: number;
    sharpeRatio: number;
    winRate: number;
    totalTrades: number;
    winningTrades: number;
    losingTrades: number;
    averageWin: number;
    averageLoss: number;
    profitFactor: number;
    createdAt: string;
}

function PerformanceMetricsPage() {
    // Mock stats - replace with real data
    const stats = {
        totalValue: 161000,
        totalProfit: 11000,
        avgWinRate: 65.5,
        avgSharpeRatio: 1.85,
    };

    return (
        <div className="px-4 sm:px-6 lg:px-8 py-4 w-full max-w-9xl mx-auto">
            {/* Page header with gradient background */}
            <div className="relative mb-4 p-3 rounded-lg bg-gradient-to-br from-[#2F6BFF]/10 via-[#16124A] to-[#FFA62B]/10 border border-[#2F6BFF]/20">
                <div className="sm:flex sm:justify-between sm:items-center">
                    <div className="mb-2 sm:mb-0">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="p-1.5 bg-[#2F6BFF]/20 rounded-lg">
                                <Activity size={16} className="text-[#2F6BFF]" />
                            </div>
                            <h1 className="text-body-dashboard font-bold text-[#efdede] drop-shadow-[0_0_6px_rgba(160,167,181,0.3)]">Performance Metrics</h1>
                        </div>
                        <p className="text-micro text-gray-300 ml-8">Track and analyze portfolio performance</p>
                    </div>
                </div>
            </div>

            {/* Stats Cards with enhanced styling */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                {/* Total Value */}
                <div className="relative overflow-hidden bg-gradient-to-br from-[#16124A] to-[#0B0633] rounded-lg p-2.5 border border-[#2F6BFF]/30 hover:border-[#2F6BFF]/60 transition-all duration-300 hover-lift group">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-[#2F6BFF]/5 rounded-full blur-xl group-hover:bg-[#2F6BFF]/10 transition-all duration-300"></div>
                    <div className="relative">
                        <div className="flex items-center justify-between mb-1.5">
                            <div className="p-1 bg-gradient-to-br from-[#2F6BFF]/20 to-[#2F6BFF]/5 rounded-md group-hover:scale-110 transition-transform duration-300">
                                <DollarSign size={16} className="text-[#2F6BFF]" />
                            </div>
                            <span className="text-micro text-gray-400 font-medium">Value</span>
                        </div>
                        <div className="text-data-label font-bold text-[#efdede] drop-shadow-[0_0_3px_rgba(160,167,181,0.2)] font-tabular">${stats.totalValue.toLocaleString()}</div>
                        <div className="text-micro text-gray-400">Total Portfolio Value</div>
                    </div>
                </div>

                {/* Total Profit */}
                <div className="relative overflow-hidden bg-gradient-to-br from-[#16124A] to-[#0B0633] rounded-lg p-2.5 border border-green-500/30 hover:border-green-500/60 transition-all duration-300 hover-lift group">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/5 rounded-full blur-xl group-hover:bg-green-500/10 transition-all duration-300"></div>
                    <div className="relative">
                        <div className="flex items-center justify-between mb-1.5">
                            <div className="p-1 bg-gradient-to-br from-green-500/20 to-green-500/5 rounded-md group-hover:scale-110 transition-transform duration-300">
                                <TrendingUp size={16} className="text-green-400" />
                            </div>
                            <span className="text-micro text-green-400 font-medium">Profit</span>
                        </div>
                        <div className="text-data-label font-bold text-green-400 font-tabular">${stats.totalProfit.toLocaleString()}</div>
                        <div className="text-micro text-gray-400">Total Net Profit</div>
                    </div>
                </div>

                {/* Win Rate */}
                <div className="relative overflow-hidden bg-gradient-to-br from-[#16124A] to-[#0B0633] rounded-lg p-2.5 border border-[#FFA62B]/30 hover:border-[#FFA62B]/60 transition-all duration-300 hover-lift group">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-[#FFA62B]/5 rounded-full blur-xl group-hover:bg-[#FFA62B]/10 transition-all duration-300"></div>
                    <div className="relative">
                        <div className="flex items-center justify-between mb-1.5">
                            <div className="p-1 bg-gradient-to-br from-[#FFA62B]/20 to-[#FFA62B]/5 rounded-md group-hover:scale-110 transition-transform duration-300">
                                <Percent size={16} className="text-[#FFA62B]" />
                            </div>
                            <span className="text-micro text-[#FFA62B] font-medium">Win Rate</span>
                        </div>
                        <div className="text-data-label font-bold text-[#FFA62B] font-tabular">{stats.avgWinRate.toFixed(1)}%</div>
                        <div className="text-micro text-gray-400">Average Win Rate</div>
                    </div>
                </div>

                {/* Sharpe Ratio */}
                <div className="relative overflow-hidden bg-gradient-to-br from-[#16124A] to-[#0B0633] rounded-lg p-2.5 border border-purple-500/30 hover:border-purple-500/60 transition-all duration-300 hover-lift group">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/5 rounded-full blur-xl group-hover:bg-purple-500/10 transition-all duration-300"></div>
                    <div className="relative">
                        <div className="flex items-center justify-between mb-1.5">
                            <div className="p-1 bg-gradient-to-br from-purple-500/20 to-purple-500/5 rounded-md group-hover:scale-110 transition-transform duration-300">
                                <Activity size={16} className="text-purple-400" />
                            </div>
                            <span className="text-micro text-purple-400 font-medium">Sharpe</span>
                        </div>
                        <div className="text-data-label font-bold text-purple-400 font-tabular">{stats.avgSharpeRatio.toFixed(2)}</div>
                        <div className="text-micro text-gray-400">Sharpe Ratio</div>
                    </div>
                </div>
            </div>

            {/* Performance List */}
            <PerformanceList />
        </div>
    );
}

export default PerformanceMetricsPage;
