import { X } from 'lucide-react';
import { PerformanceMetric } from '../pages/PerformanceMetricsPage';

interface PerformanceDetailsModalProps {
    metric: PerformanceMetric | null;
    onClose: () => void;
}

function PerformanceDetailsModal({ metric, onClose }: PerformanceDetailsModalProps) {
    if (!metric) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-gradient-to-br from-[#16124A] to-[#0B0633] rounded-xl shadow-brand-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scaleIn border border-[#2F6BFF]/30">
                {/* Header with gradient */}
                <div className="flex items-center justify-between p-3 border-b border-[#2F6BFF]/30 bg-gradient-to-r from-[#2F6BFF]/10 via-transparent to-[#FFA62B]/10">
                    <h2 className="text-small-dashboard text-[#efdede] font-bold">
                        Performance Details - {metric.portfolioName}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-red-500/20 rounded-md transition-all duration-200 hover:scale-110"
                    >
                        <X size={16} className="text-gray-300 hover:text-red-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-3 space-y-3">
                    {/* Portfolio & Date Info */}
                    <div className="space-y-2">
                        <h3 className="text-small-dashboard text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">Portfolio Information</h3>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="bg-[#0B0633] rounded-md p-2 border border-gray-700/50">
                                <div className="text-micro text-gray-400 mb-0.5">Portfolio</div>
                                <div className="text-small-dashboard text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">{metric.portfolioName}</div>
                            </div>
                            <div className="bg-[#0B0633] rounded-md p-2 border border-gray-700/50">
                                <div className="text-micro text-gray-400 mb-0.5">Date</div>
                                <div className="text-small-dashboard text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">
                                    {new Date(metric.date).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Financial Metrics */}
                    <div className="space-y-2">
                        <h3 className="text-small-dashboard text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">Financial Metrics</h3>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="bg-[#0B0633] rounded-md p-2 border border-gray-700/50">
                                <div className="text-micro text-gray-400 mb-0.5">Total Value</div>
                                <div className="text-small-dashboard text-[#efdede] font-tabular font-semibold">
                                    ${metric.totalValue.toLocaleString()}
                                </div>
                            </div>
                            <div className="bg-[#0B0633] rounded-md p-2 border border-gray-700/50">
                                <div className="text-micro text-gray-400 mb-0.5">Net Profit</div>
                                <div className={`text-small-dashboard font-tabular font-semibold ${metric.netProfit >= 0 ? 'text-green-400' : 'text-red-400'
                                    }`}>
                                    ${metric.netProfit.toLocaleString()}
                                </div>
                            </div>
                            <div className="bg-[#0B0633] rounded-md p-2 border border-gray-700/50">
                                <div className="text-micro text-gray-400 mb-0.5">Total Profit</div>
                                <div className="text-small-dashboard text-green-400 font-tabular font-semibold">
                                    ${metric.totalProfit.toLocaleString()}
                                </div>
                            </div>
                            <div className="bg-[#0B0633] rounded-md p-2 border border-gray-700/50">
                                <div className="text-micro text-gray-400 mb-0.5">Total Loss</div>
                                <div className="text-small-dashboard text-red-400 font-tabular font-semibold">
                                    ${metric.totalLoss.toLocaleString()}
                                </div>
                            </div>
                            <div className="bg-[#0B0633] rounded-md p-2 border border-gray-700/50">
                                <div className="text-micro text-gray-400 mb-0.5">Profit %</div>
                                <div className={`text-small-dashboard font-tabular font-semibold ${metric.profitPercentage >= 0 ? 'text-green-400' : 'text-red-400'
                                    }`}>
                                    {metric.profitPercentage >= 0 ? '+' : ''}{metric.profitPercentage.toFixed(2)}%
                                </div>
                            </div>
                            <div className="bg-[#0B0633] rounded-md p-2 border border-gray-700/50">
                                <div className="text-micro text-gray-400 mb-0.5">Profit Factor</div>
                                <div className="text-small-dashboard text-[#efdede] font-tabular font-semibold">
                                    {metric.profitFactor.toFixed(2)}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Risk Metrics */}
                    <div className="space-y-2">
                        <h3 className="text-small-dashboard text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">Risk Metrics</h3>
                        <div className="grid grid-cols-3 gap-2">
                            <div className="bg-[#0B0633] rounded-md p-2 border border-gray-700/50">
                                <div className="text-micro text-gray-400 mb-0.5">Drawdown</div>
                                <div className="text-small-dashboard text-yellow-400 font-tabular font-semibold">
                                    {metric.drawdown.toFixed(2)}%
                                </div>
                            </div>
                            <div className="bg-[#0B0633] rounded-md p-2 border border-gray-700/50">
                                <div className="text-micro text-gray-400 mb-0.5">Max DD</div>
                                <div className="text-small-dashboard text-red-400 font-tabular font-semibold">
                                    {metric.maxDrawdown.toFixed(2)}%
                                </div>
                            </div>
                            <div className="bg-[#0B0633] rounded-md p-2 border border-gray-700/50">
                                <div className="text-micro text-gray-400 mb-0.5">Sharpe Ratio</div>
                                <div className={`text-small-dashboard font-tabular font-semibold ${metric.sharpeRatio >= 2 ? 'text-green-400' :
                                    metric.sharpeRatio >= 1 ? 'text-yellow-400' : 'text-red-400'
                                    }`}>
                                    {metric.sharpeRatio.toFixed(2)}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Trading Statistics */}
                    <div className="space-y-2">
                        <h3 className="text-small-dashboard text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">Trading Statistics</h3>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="bg-[#0B0633] rounded-md p-2 border border-gray-700/50">
                                <div className="text-micro text-gray-400 mb-0.5">Total Trades</div>
                                <div className="text-small-dashboard text-[#efdede] font-tabular font-semibold">
                                    {metric.totalTrades}
                                </div>
                            </div>
                            <div className="bg-[#0B0633] rounded-md p-2 border border-gray-700/50">
                                <div className="text-micro text-gray-400 mb-0.5">Win Rate</div>
                                <div className="text-small-dashboard text-[#FFA62B] font-tabular font-semibold">
                                    {metric.winRate.toFixed(1)}%
                                </div>
                            </div>
                            <div className="bg-[#0B0633] rounded-md p-2 border border-gray-700/50">
                                <div className="text-micro text-gray-400 mb-0.5">Winning Trades</div>
                                <div className="text-small-dashboard text-green-400 font-tabular font-semibold">
                                    {metric.winningTrades}
                                </div>
                            </div>
                            <div className="bg-[#0B0633] rounded-md p-2 border border-gray-700/50">
                                <div className="text-micro text-gray-400 mb-0.5">Losing Trades</div>
                                <div className="text-small-dashboard text-red-400 font-tabular font-semibold">
                                    {metric.losingTrades}
                                </div>
                            </div>
                            <div className="bg-[#0B0633] rounded-md p-2 border border-gray-700/50">
                                <div className="text-micro text-gray-400 mb-0.5">Avg Win</div>
                                <div className="text-small-dashboard text-green-400 font-tabular font-semibold">
                                    ${metric.averageWin.toLocaleString()}
                                </div>
                            </div>
                            <div className="bg-[#0B0633] rounded-md p-2 border border-gray-700/50">
                                <div className="text-micro text-gray-400 mb-0.5">Avg Loss</div>
                                <div className="text-small-dashboard text-red-400 font-tabular font-semibold">
                                    ${metric.averageLoss.toLocaleString()}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Close Button */}
                    <div className="flex items-center justify-end pt-2 border-t border-gray-700/50">
                        <button
                            onClick={onClose}
                            className="px-3 py-1.5 bg-gray-700/30 hover:bg-gray-700/50 text-white rounded-md transition-colors duration-200 text-micro"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PerformanceDetailsModal;


