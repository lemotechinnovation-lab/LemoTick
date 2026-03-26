import { Briefcase, DollarSign, Plus, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import PortfolioList from '../components/PortfolioList';
import PortfolioModal from '../components/PortfolioModal';

export interface Portfolio {
    id: string;
    investorId: string;
    name: string;
    description?: string;
    initialInvestment: number;
    currentValue: number;
    totalProfit: number;
    totalLoss: number;
    netProfit: number;
    profitPercentage: number;
    status: 'Active' | 'Suspended' | 'Closed' | 'UnderReview';
    riskLevel: 'Low' | 'Medium' | 'High' | 'VeryHigh';
    createdAt: string;
    updatedAt?: string;
    closedAt?: string;
    maxLossPercentage: number;
    maxDrawdownPercentage: number;
    dailyLossLimit: number;
}

function PortfolioPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);

    const handleCreate = () => {
        setSelectedPortfolio(null);
        setIsModalOpen(true);
    };

    const handleEdit = (portfolio: Portfolio) => {
        setSelectedPortfolio(portfolio);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedPortfolio(null);
    };

    // Mock stats - replace with real data
    const stats = {
        totalPortfolios: 2,
        totalValue: 161000,
        totalProfit: 11000,
        profitPercentage: 7.33,
    };

    return (
        <div className="px-4 sm:px-6 lg:px-8 py-4 w-full max-w-9xl mx-auto">
            {/* Page header with gradient background */}
            <div className="relative mb-4 p-3 rounded-lg bg-gradient-to-br from-[#2F6BFF]/10 via-[#16124A] to-[#FFA62B]/10 border border-[#2F6BFF]/20">
                <div className="sm:flex sm:justify-between sm:items-center">
                    <div className="mb-2 sm:mb-0">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="p-1.5 bg-[#2F6BFF]/20 rounded-lg">
                                <Briefcase size={16} className="text-[#2F6BFF]" />
                            </div>
                            <h1 className="text-body-dashboard font-bold text-[#efdede] drop-shadow-[0_0_6px_rgba(160,167,181,0.3)]">Portfolios</h1>
                        </div>
                        <p className="text-micro text-gray-300 ml-8">Manage and monitor your investment portfolios</p>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
                        <button
                            onClick={handleCreate}
                            className="btn bg-gradient-to-r from-[#2F6BFF] to-[#2557c9] hover:from-[#2557c9] hover:to-[#2F6BFF] text-white px-4 py-1.5 rounded-lg transition-all duration-300 flex items-center gap-1.5 shadow-brand hover-lift"
                        >
                            <Plus size={14} />
                            <span className="text-micro font-semibold">Create Portfolio</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Cards with enhanced styling */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                {/* Total Portfolios */}
                <div className="relative overflow-hidden bg-gradient-to-br from-[#16124A] to-[#0B0633] rounded-lg p-2.5 border border-[#2F6BFF]/30 hover:border-[#2F6BFF]/60 transition-all duration-300 hover-lift group">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-[#2F6BFF]/5 rounded-full blur-xl group-hover:bg-[#2F6BFF]/10 transition-all duration-300"></div>
                    <div className="relative">
                        <div className="flex items-center justify-between mb-1.5">
                            <div className="p-1 bg-gradient-to-br from-[#2F6BFF]/20 to-[#2F6BFF]/5 rounded-md group-hover:scale-110 transition-transform duration-300">
                                <Briefcase size={16} className="text-[#2F6BFF]" />
                            </div>
                            <span className="text-micro text-gray-400 font-medium">Total</span>
                        </div>
                        <div className="text-data-label font-bold text-[#efdede] drop-shadow-[0_0_3px_rgba(160,167,181,0.2)] font-tabular">{stats.totalPortfolios}</div>
                        <div className="text-micro text-gray-400">Active Portfolios</div>
                    </div>
                </div>

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
                        <div className="text-micro text-gray-400">Net Profit</div>
                    </div>
                </div>

                {/* Profit Percentage */}
                <div className="relative overflow-hidden bg-gradient-to-br from-[#16124A] to-[#0B0633] rounded-lg p-2.5 border border-[#FFA62B]/30 hover:border-[#FFA62B]/60 transition-all duration-300 hover-lift group">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-[#FFA62B]/5 rounded-full blur-xl group-hover:bg-[#FFA62B]/10 transition-all duration-300"></div>
                    <div className="relative">
                        <div className="flex items-center justify-between mb-1.5">
                            <div className="p-1 bg-gradient-to-br from-[#FFA62B]/20 to-[#FFA62B]/5 rounded-md group-hover:scale-110 transition-transform duration-300">
                                <TrendingUp size={16} className="text-[#FFA62B]" />
                            </div>
                            <span className="text-micro text-[#FFA62B] font-medium">ROI</span>
                        </div>
                        <div className="text-data-label font-bold text-[#FFA62B] font-tabular">+{stats.profitPercentage.toFixed(2)}%</div>
                        <div className="text-micro text-gray-400">Return on Investment</div>
                    </div>
                </div>
            </div>

            {/* Portfolio List */}
            <PortfolioList onEdit={handleEdit} />

            {/* Portfolio Modal */}
            {isModalOpen && (
                <PortfolioModal
                    portfolio={selectedPortfolio}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
}

export default PortfolioPage;
