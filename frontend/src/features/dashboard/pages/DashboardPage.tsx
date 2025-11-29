import { QUERY_KEYS } from '@/config/constants'
import { useAuthStore } from '@features/auth/stores/authStore'
import { useQuery } from '@tanstack/react-query'
import { formatCurrency, formatDateTime, formatPercentage } from '@utils/format'
import { Activity, Briefcase, DollarSign, TrendingUp } from 'lucide-react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { LiveTradingWidget } from '../components/LiveTradingWidget'
import { dashboardService } from '../services/dashboardService'

export default function DashboardPage() {
    const { user } = useAuthStore()

    // Fetch dashboard summary from API
    const { data: summary, isLoading, error } = useQuery({
        queryKey: [...QUERY_KEYS.DASHBOARD, 'summary', user?.id],
        queryFn: () => dashboardService.getSummary(user!.id),
        enabled: !!user?.id,
    })

    // Fetch recent activity
    const { data: recentActivity } = useQuery({
        queryKey: [...QUERY_KEYS.DASHBOARD, 'recent-activity', user?.id],
        queryFn: () => dashboardService.getRecentActivity(user!.id),
        enabled: !!user?.id,
    })

    // Show loading state
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        )
    }

    // Show error state
    if (error || !summary) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-red-600">Error loading dashboard data</p>
                    <p className="text-sm text-gray-500 mt-2">Please try refreshing the page</p>
                </div>
            </div>
        )
    }

    const cards = [
        {
            title: 'Total Investment',
            value: formatCurrency(summary.totalInvestment),
            icon: DollarSign,
            color: 'bg-blue-500',
        },
        {
            title: 'Current Value',
            value: formatCurrency(summary.currentValue),
            icon: TrendingUp,
            color: 'bg-green-500',
        },
        {
            title: 'Net Profit',
            value: formatCurrency(summary.netProfit),
            change: summary.profitPercentage > 0 ? `+${formatPercentage(summary.profitPercentage)}` : formatPercentage(summary.profitPercentage),
            icon: Activity,
            color: summary.netProfit >= 0 ? 'bg-purple-500' : 'bg-red-500',
        },
        {
            title: 'Active Portfolios',
            value: summary.activePortfolios.toString(),
            subtitle: `${summary.openTrades} open trades`,
            icon: Briefcase,
            color: 'bg-orange-500',
        },
    ]

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                    Welcome back, {summary.investorName}!
                </h1>
                <p className="text-gray-600">Here's your investment performance overview</p>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {cards.map((card) => (
                    <div key={card.title} className="card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                                <p className="mt-2 text-3xl font-bold text-gray-900">{card.value}</p>
                                {card.change && (
                                    <p className="mt-1 text-sm font-medium text-green-600">
                                        {card.change}
                                    </p>
                                )}
                                {card.subtitle && (
                                    <p className="mt-1 text-sm text-gray-500">{card.subtitle}</p>
                                )}
                            </div>
                            <div className={`rounded-full p-3 ${card.color}`}>
                                <card.icon className="h-6 w-6 text-white" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Live Trading Widget */}
            <div className="mt-6">
                <LiveTradingWidget />
            </div>

            {/* Charts and Activity */}
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
                {/* Performance Chart */}
                <div className="card">
                    <h3 className="mb-4 text-lg font-bold text-gray-900">
                        Performance Overview
                    </h3>
                    {summary.currentValue > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <AreaChart
                                data={summary.performanceHistory || []}
                                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                            >
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fontSize: 12 }}
                                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                />
                                <YAxis
                                    tick={{ fontSize: 12 }}
                                    tickFormatter={(value) => `R${(value / 1000).toFixed(0)}k`}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                                    formatter={(value: number) => [`R${value.toFixed(2)}`, 'Portfolio Value']}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#3b82f6"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorValue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-[250px] text-gray-400">
                            <svg className="h-16 w-16 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                            </svg>
                            <p className="text-sm font-medium">No performance data yet</p>
                            <p className="text-xs mt-1">Add funds to your portfolio to see performance</p>
                        </div>
                    )}
                </div>

                {/* Recent Activity */}
                <div className="card">
                    <h3 className="mb-4 text-lg font-bold text-gray-900">Recent Activity</h3>
                    <div className="space-y-4">
                        {recentActivity && (recentActivity.recentTrades.length > 0 || recentActivity.recentTransactions.length > 0) ? (
                            <>
                                {/* Recent Trades */}
                                {recentActivity.recentTrades.slice(0, 3).map((trade) => (
                                    <div key={trade.id} className="flex items-center justify-between border-b pb-3">
                                        <div className="flex items-center space-x-3">
                                            <div className={`h-2 w-2 rounded-full ${trade.status === 'Closed' ?
                                                (trade.profit && trade.profit > 0 ? 'bg-green-500' : 'bg-red-500')
                                                : 'bg-blue-500'
                                                }`} />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {trade.symbol} {trade.direction} Trade
                                                </p>
                                                <p className="text-xs text-gray-500">{formatDateTime(trade.entryTime)}</p>
                                            </div>
                                        </div>
                                        {trade.status === 'Closed' && (
                                            <span className={`text-sm font-medium ${(trade.profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                {(trade.profit || 0) >= 0 ? '+' : ''}
                                                {formatCurrency(trade.profit || trade.loss || 0)}
                                            </span>
                                        )}
                                    </div>
                                ))}
                                {/* Recent Transactions */}
                                {recentActivity.recentTransactions.slice(0, 2).map((transaction) => (
                                    <div key={transaction.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                                        <div className="flex items-center space-x-3">
                                            <div className={`h-2 w-2 rounded-full ${transaction.type === 'Deposit' ? 'bg-green-500' : 'bg-orange-500'
                                                }`} />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {transaction.type}
                                                </p>
                                                <p className="text-xs text-gray-500">{formatDateTime(transaction.createdAt)}</p>
                                            </div>
                                        </div>
                                        <span className={`text-sm font-medium ${transaction.type === 'Deposit' ? 'text-green-600' : 'text-orange-600'
                                            }`}>
                                            {transaction.type === 'Deposit' ? '+' : '-'}
                                            {formatCurrency(transaction.amount)}
                                        </span>
                                    </div>
                                ))}
                            </>
                        ) : (
                            <p className="text-center text-gray-500 py-8">No recent activity</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Portfolio Summary - Using Real API Data */}
            {summary.portfolioSummaries && summary.portfolioSummaries.length > 0 && (
                <div className="mt-6 card">
                    <h3 className="mb-4 text-lg font-bold text-gray-900">Portfolio Summary</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="pb-3 text-left text-sm font-medium text-gray-600">
                                        Portfolio
                                    </th>
                                    <th className="pb-3 text-right text-sm font-medium text-gray-600">
                                        Value
                                    </th>
                                    <th className="pb-3 text-right text-sm font-medium text-gray-600">
                                        Profit/Loss
                                    </th>
                                    <th className="pb-3 text-right text-sm font-medium text-gray-600">
                                        ROI
                                    </th>
                                    <th className="pb-3 text-right text-sm font-medium text-gray-600">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {summary.portfolioSummaries.map((portfolio) => (
                                    <tr key={portfolio.portfolioId} className="border-b last:border-0">
                                        <td className="py-4 text-sm font-medium text-gray-900">
                                            {portfolio.portfolioName}
                                        </td>
                                        <td className="py-4 text-right text-sm text-gray-900">
                                            {formatCurrency(portfolio.currentValue)}
                                        </td>
                                        <td className={`py-4 text-right text-sm font-medium ${portfolio.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                            {portfolio.netProfit >= 0 ? '+' : ''}
                                            {formatCurrency(portfolio.netProfit)}
                                        </td>
                                        <td className={`py-4 text-right text-sm font-medium ${portfolio.profitPercentage >= 0 ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                            {formatPercentage(portfolio.profitPercentage)}
                                        </td>
                                        <td className="py-4 text-right text-sm">
                                            <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${portfolio.status === 'Active'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {portfolio.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}

