import { PageHeader, PageHeaderAction } from '@/components/ui/PageHeader';
import { ContentSection, PageCard, PageContainer, PageGrid, PageSection, StatsCard } from '@/components/ui/PageLayoutEnhanced';
import {
    AlertCircle,
    BarChart3,
    Briefcase,
    DollarSign,
    Eye,
    Percent,
    PieChart,
    Plus,
    Settings,
    TrendingDown,
    TrendingUp
} from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
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

    // Mock portfolios data
    const [portfolios] = useState<Portfolio[]>([
        {
            id: '1',
            investorId: 'inv-1',
            name: 'Growth Portfolio',
            description: 'High-growth technology stocks and crypto assets',
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
        {
            id: '3',
            investorId: 'inv-1',
            name: 'Balanced Portfolio',
            description: 'Mix of stocks, bonds, and commodities',
            initialInvestment: 75000,
            currentValue: 82000,
            totalProfit: 9500,
            totalLoss: 2500,
            netProfit: 7000,
            profitPercentage: 9.33,
            status: 'Active',
            riskLevel: 'Medium',
            createdAt: '2024-03-10T10:00:00Z',
            maxLossPercentage: 7,
            maxDrawdownPercentage: 10,
            dailyLossLimit: 3,
        },
    ]);

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

    // Calculate aggregate stats
    const stats = {
        totalPortfolios: portfolios.length,
        totalValue: portfolios.reduce((sum, p) => sum + p.currentValue, 0),
        totalInvestment: portfolios.reduce((sum, p) => sum + p.initialInvestment, 0),
        totalProfit: portfolios.reduce((sum, p) => sum + p.netProfit, 0),
    };

    const overallProfitPercentage = ((stats.totalProfit / stats.totalInvestment) * 100).toFixed(2);

    const getStatusColor = (status: Portfolio['status']) => {
        switch (status) {
            case 'Active':
                return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'Suspended':
                return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'Closed':
                return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
            case 'UnderReview':
                return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            default:
                return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };

    const getRiskColor = (risk: Portfolio['riskLevel']) => {
        switch (risk) {
            case 'Low':
                return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'Medium':
                return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'High':
                return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
            case 'VeryHigh':
                return 'bg-red-500/20 text-red-400 border-red-500/30';
            default:
                return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };

    const formatCurrency = (amount: number) => {
        return `R ${amount.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    return (
        <PageContainer maxWidth="xl" className="fade-in-up relative overflow-hidden">
            {/* Animated Background Orbs */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-20 left-10 w-96 h-96 bg-brand-blue/20 rounded-full blur-3xl animate-float"></div>
                <div className="absolute top-40 right-20 w-80 h-80 bg-accent-orange/15 rounded-full blur-3xl animate-float-delayed"></div>
                <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-purple-500/15 rounded-full blur-3xl animate-float-slow"></div>
                <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-green-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
            </div>

            {/* Page Header */}
            <PageHeader
                title="PORTFOLIOS"
                description="Manage and monitor your investment portfolios"
                icon={Briefcase}
                actions={
                    <PageHeaderAction onClick={handleCreate} icon={Plus}>
                        Create Portfolio
                    </PageHeaderAction>
                }
            />

            {/* Overview Stats */}
            <PageSection spacing="normal">
                <PageGrid cols={4} gap="sm">
                    <StatsCard
                        icon={<Briefcase className="w-6 h-6" />}
                        value={stats.totalPortfolios}
                        label="Total Portfolios"
                        iconColor="text-[#2F6BFF]"
                    />
                    <StatsCard
                        icon={<DollarSign className="w-6 h-6" />}
                        value={formatCurrency(stats.totalValue)}
                        label="Total Portfolio Value"
                        trend={{ value: parseFloat(overallProfitPercentage), isPositive: stats.totalProfit >= 0 }}
                        iconColor="text-[#10B981]"
                    />
                    <StatsCard
                        icon={<BarChart3 className="w-6 h-6" />}
                        value={formatCurrency(stats.totalInvestment)}
                        label="Total Investment"
                        iconColor="text-[#8B5CF6]"
                    />
                    <StatsCard
                        icon={<TrendingUp className="w-6 h-6" />}
                        value={formatCurrency(stats.totalProfit)}
                        label="Net Profit/Loss"
                        trend={{ value: parseFloat(overallProfitPercentage), isPositive: stats.totalProfit >= 0 }}
                        iconColor="text-[#F59E0B]"
                    />
                </PageGrid>
            </PageSection>

            {/* Portfolio Cards Grid - 3 COLUMN COMPACT */}
            <PageSection spacing="normal">
                <ContentSection
                    title="Your Portfolios"
                    actions={
                        <button className="px-4 py-2 bg-[#16124A] border border-[#2F6BFF]/30 hover:border-[#2F6BFF] text-white rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2">
                            <PieChart className="w-4 h-4" />
                            Grid View
                        </button>
                    }
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
                        {portfolios.map((portfolio) => (
                            <div
                                key={portfolio.id}
                                className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-[#1a1347]/90 via-[#16124A]/80 to-[#0B0633]/90 backdrop-blur-xl border border-white/10 hover:border-[#2F6BFF]/50 transition-all duration-500 hover:shadow-2xl hover:shadow-[#2F6BFF]/20 hover:-translate-y-1"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-[#2F6BFF]/0 via-[#2F6BFF]/5 to-[#2F6BFF]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                                <div className="relative p-5">
                                    {/* Portfolio Header */}
                                    <div className="flex items-start gap-3 mb-4">
                                        <div className="shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-[#2F6BFF] to-[#1E40AF] flex items-center justify-center shadow-lg shadow-[#2F6BFF]/30 group-hover:shadow-[#2F6BFF]/50 transition-all duration-300 group-hover:scale-110">
                                            <Briefcase className="w-6 h-6 text-white" />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#2F6BFF] transition-colors duration-300 truncate">
                                                {portfolio.name}
                                            </h3>
                                            <div className="flex flex-wrap items-center gap-1.5">
                                                <span className={`px-2 py-1 rounded-md text-[10px] font-bold border backdrop-blur-sm ${getStatusColor(portfolio.status)}`}>
                                                    {portfolio.status.toUpperCase()}
                                                </span>
                                                <span className={`px-2 py-1 rounded-md text-[10px] font-bold border backdrop-blur-sm ${getRiskColor(portfolio.riskLevel)}`}>
                                                    {portfolio.riskLevel.toUpperCase()} RISK
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    {portfolio.description && (
                                        <p className="text-xs text-gray-400 mb-4 line-clamp-2">{portfolio.description}</p>
                                    )}

                                    {/* Current Value */}
                                    <div className="relative mb-4">
                                        <div className={`absolute inset-0 ${portfolio.netProfit >= 0 ? 'bg-gradient-to-br from-[#10B981]/20 to-[#059669]/20' : 'bg-gradient-to-br from-[#EF4444]/20 to-[#DC2626]/20'} rounded-xl blur-lg`} />
                                        <div className={`relative px-4 py-3 rounded-xl ${portfolio.netProfit >= 0 ? 'bg-gradient-to-br from-[#10B981]/10 to-[#059669]/10 border-[#10B981]/30' : 'bg-gradient-to-br from-[#EF4444]/10 to-[#DC2626]/10 border-[#EF4444]/30'} border backdrop-blur-sm`}>
                                            <div className={`text-[10px] font-semibold ${portfolio.netProfit >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'} mb-0.5 tracking-wider uppercase`}>Current Value</div>
                                            <div className="text-2xl font-black text-white tracking-tight">
                                                {formatCurrency(portfolio.currentValue)}
                                            </div>
                                            <div className="text-xs font-medium text-gray-400">
                                                Initial: {formatCurrency(portfolio.initialInvestment)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Metrics - 2x2 Grid */}
                                    <div className="grid grid-cols-2 gap-2 mb-4">
                                        <div className={`group/metric relative overflow-hidden p-3 rounded-lg ${portfolio.netProfit >= 0 ? 'bg-gradient-to-br from-[#10B981]/10 to-[#059669]/5 border-[#10B981]/20 hover:border-[#10B981]/40' : 'bg-gradient-to-br from-[#EF4444]/10 to-[#DC2626]/5 border-[#EF4444]/20 hover:border-[#EF4444]/40'} border backdrop-blur-sm transition-all duration-300 hover:scale-105`}>
                                            <div className={`absolute top-0 right-0 w-16 h-16 ${portfolio.netProfit >= 0 ? 'bg-[#10B981]/10 group-hover/metric:bg-[#10B981]/20' : 'bg-[#EF4444]/10 group-hover/metric:bg-[#EF4444]/20'} rounded-full blur-xl transition-all duration-300`} />
                                            <div className="relative">
                                                <div className="flex items-center gap-1.5 mb-1">
                                                    {portfolio.netProfit >= 0 ? <TrendingUp className="w-3 h-3 text-[#10B981]" /> : <TrendingDown className="w-3 h-3 text-[#EF4444]" />}
                                                    <div className="text-[10px] font-semibold text-gray-400 uppercase">Net P/L</div>
                                                </div>
                                                <div className={`text-base font-bold ${portfolio.netProfit >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'} truncate`}>
                                                    {portfolio.netProfit >= 0 ? '+' : ''}{formatCurrency(portfolio.netProfit)}
                                                </div>
                                            </div>
                                        </div>

                                        <div className={`group/metric relative overflow-hidden p-3 rounded-lg ${portfolio.profitPercentage >= 0 ? 'bg-gradient-to-br from-[#10B981]/10 to-[#059669]/5 border-[#10B981]/20 hover:border-[#10B981]/40' : 'bg-gradient-to-br from-[#EF4444]/10 to-[#DC2626]/5 border-[#EF4444]/20 hover:border-[#EF4444]/40'} border backdrop-blur-sm transition-all duration-300 hover:scale-105`}>
                                            <div className={`absolute top-0 right-0 w-16 h-16 ${portfolio.profitPercentage >= 0 ? 'bg-[#10B981]/10 group-hover/metric:bg-[#10B981]/20' : 'bg-[#EF4444]/10 group-hover/metric:bg-[#EF4444]/20'} rounded-full blur-xl transition-all duration-300`} />
                                            <div className="relative">
                                                <div className="flex items-center gap-1.5 mb-1">
                                                    <Percent className="w-3 h-3 text-[#F59E0B]" />
                                                    <div className="text-[10px] font-semibold text-gray-400 uppercase">ROI</div>
                                                </div>
                                                <div className={`text-base font-bold ${portfolio.profitPercentage >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'} truncate`}>
                                                    {portfolio.profitPercentage >= 0 ? '+' : ''}{portfolio.profitPercentage.toFixed(2)}%
                                                </div>
                                            </div>
                                        </div>

                                        <div className="group/metric relative overflow-hidden p-3 rounded-lg bg-gradient-to-br from-[#2F6BFF]/10 to-[#1E40AF]/5 border border-[#2F6BFF]/20 hover:border-[#2F6BFF]/40 backdrop-blur-sm transition-all duration-300 hover:scale-105">
                                            <div className="absolute top-0 right-0 w-16 h-16 bg-[#2F6BFF]/10 rounded-full blur-xl group-hover/metric:bg-[#2F6BFF]/20 transition-all duration-300" />
                                            <div className="relative">
                                                <div className="flex items-center gap-1.5 mb-1">
                                                    <AlertCircle className="w-3 h-3 text-[#2F6BFF]" />
                                                    <div className="text-[10px] font-semibold text-gray-400 uppercase">Max Loss</div>
                                                </div>
                                                <div className="text-base font-bold text-white truncate">
                                                    {portfolio.maxLossPercentage}%
                                                </div>
                                            </div>
                                        </div>

                                        <div className="group/metric relative overflow-hidden p-3 rounded-lg bg-gradient-to-br from-[#8B5CF6]/10 to-[#7C3AED]/5 border border-[#8B5CF6]/20 hover:border-[#8B5CF6]/40 backdrop-blur-sm transition-all duration-300 hover:scale-105">
                                            <div className="absolute top-0 right-0 w-16 h-16 bg-[#8B5CF6]/10 rounded-full blur-xl group-hover/metric:bg-[#8B5CF6]/20 transition-all duration-300" />
                                            <div className="relative">
                                                <div className="flex items-center gap-1.5 mb-1">
                                                    <TrendingDown className="w-3 h-3 text-[#8B5CF6]" />
                                                    <div className="text-[10px] font-semibold text-gray-400 uppercase">Drawdown</div>
                                                </div>
                                                <div className="text-base font-bold text-white truncate">
                                                    {portfolio.maxDrawdownPercentage}%
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-stretch gap-2">
                                        <Link
                                            to={`/portfolio/${portfolio.id}`}
                                            className="flex-1 group/btn relative overflow-hidden px-3 py-2.5 rounded-lg border border-[#2F6BFF]/30 bg-[#16124A]/50 backdrop-blur-sm text-gray-300 hover:text-white hover:border-[#2F6BFF] transition-all duration-300 text-xs font-bold hover:shadow-lg hover:shadow-[#2F6BFF]/20 flex items-center justify-center gap-1.5"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-[#2F6BFF]/0 via-[#2F6BFF]/10 to-[#2F6BFF]/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
                                            <span className="relative flex items-center gap-1.5">
                                                <Eye className="w-3.5 h-3.5" />
                                                View
                                            </span>
                                        </Link>
                                        <button
                                            onClick={() => handleEdit(portfolio)}
                                            className="flex-1 group/btn relative overflow-hidden px-3 py-2.5 rounded-lg bg-gradient-to-r from-[#2F6BFF] via-[#3B82F6] to-[#2F6BFF] bg-size-200 bg-pos-0 hover:bg-pos-100 text-white transition-all duration-500 shadow-lg shadow-[#2F6BFF]/30 hover:shadow-xl hover:shadow-[#2F6BFF]/50 text-xs font-bold hover:scale-[1.02] flex items-center justify-center gap-1.5"
                                        >
                                            <span className="relative flex items-center gap-1.5">
                                                <Settings className="w-3.5 h-3.5" />
                                                Manage
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </ContentSection>
            </PageSection>

            {/* Performance Overview */}
            <PageSection spacing="normal">
                <PageGrid cols={2} gap="sm">
                    {/* Asset Allocation */}
                    <PageCard padding="md">
                        <ContentSection
                            title="Asset Allocation"
                            actions={<PieChart className="w-5 h-5 text-[#2F6BFF]" />}
                        >
                            <div className="h-48 flex items-center justify-center text-gray-400 mb-6">
                                <div className="text-center">
                                    <PieChart className="w-12 h-12 mx-auto mb-4 text-[#2F6BFF]/50" />
                                    <p>Chart visualization will be integrated here</p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-[#2F6BFF]"></div>
                                        <span className="text-sm text-gray-300">Stocks</span>
                                    </div>
                                    <span className="text-sm font-semibold text-white">45%</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-[#10B981]"></div>
                                        <span className="text-sm text-gray-300">Crypto</span>
                                    </div>
                                    <span className="text-sm font-semibold text-white">30%</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-[#F59E0B]"></div>
                                        <span className="text-sm text-gray-300">Bonds</span>
                                    </div>
                                    <span className="text-sm font-semibold text-white">15%</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-[#8B5CF6]"></div>
                                        <span className="text-sm text-gray-300">Commodities</span>
                                    </div>
                                    <span className="text-sm font-semibold text-white">10%</span>
                                </div>
                            </div>
                        </ContentSection>
                    </PageCard>

                    {/* Performance Metrics */}
                    <PageCard padding="md">
                        <ContentSection
                            title="Performance Metrics"
                            actions={<Percent className="w-5 h-5 text-[#2F6BFF]" />}
                        >
                            <div className="space-y-4">
                                <div className="p-4 rounded-xl bg-[#0B0633]/50">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-gray-400">Overall ROI</span>
                                        <span className={`text-lg font-bold ${parseFloat(overallProfitPercentage) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            {parseFloat(overallProfitPercentage) >= 0 ? '+' : ''}{overallProfitPercentage}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-[#0B0633] rounded-full h-2">
                                        <div
                                            className="bg-gradient-to-r from-[#10B981] to-[#34D399] h-2 rounded-full transition-all duration-500"
                                            style={{ width: `${Math.min(Math.abs(parseFloat(overallProfitPercentage)) * 5, 100)}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-4 rounded-xl bg-[#0B0633]/50">
                                    <span className="text-sm text-gray-400">Best Performing</span>
                                    <span className="text-sm font-semibold text-white">Growth Portfolio</span>
                                </div>

                                <div className="flex items-center justify-between p-4 rounded-xl bg-[#0B0633]/50">
                                    <span className="text-sm text-gray-400">Total Portfolios</span>
                                    <span className="text-sm font-semibold text-white">{stats.totalPortfolios} Active</span>
                                </div>

                                <div className="flex items-center justify-between p-4 rounded-xl bg-[#0B0633]/50">
                                    <span className="text-sm text-gray-400">Average Risk</span>
                                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                                        Medium
                                    </span>
                                </div>
                            </div>
                        </ContentSection>
                    </PageCard>
                </PageGrid>
            </PageSection>

            {/* Portfolio Modal */}
            {isModalOpen && (
                <PortfolioModal
                    portfolio={selectedPortfolio}
                    onClose={handleCloseModal}
                />
            )}
        </PageContainer>
    );
}

export default PortfolioPage;
