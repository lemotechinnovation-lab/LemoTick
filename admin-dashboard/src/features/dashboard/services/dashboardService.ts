import { api } from '@/services/api'

export interface DashboardSummary {
    investorId: string
    investorName: string
    totalPortfolios: number
    activePortfolios: number
    totalInvestment: number
    currentValue: number
    netProfit: number
    profitPercentage: number
    totalTrades: number
    openTrades: number
    closedTrades: number
    winningTrades: number
    losingTrades: number
    winRate: number
    totalTransactions: number
    pendingWithdrawals: number
    availableBalance: number
    unreadNotifications: number
    lastLoginAt: string | null
    accountCreatedAt: string
    performanceHistory?: Array<{
        date: string  // Backend sends 'Date' but will be lowercase in JSON
        value: number // Backend sends 'Value' but will be lowercase in JSON
    }>
    portfolioSummaries?: Array<{
        portfolioId: string
        portfolioName: string
        currentValue: number
        netProfit: number
        profitPercentage: number
        status: string
    }>
}

export interface RecentActivity {
    recentTrades: Array<{
        id: string
        symbol: string
        type: string
        direction: string
        profit: number
        loss: number
        entryTime: string
        exitTime: string | null
        status: string
    }>
    recentTransactions: Array<{
        id: string
        type: string
        amount: number
        status: string
        createdAt: string
    }>
    recentNotifications: Array<{
        id: string
        title: string
        message: string
        type: string
        priority: string
        isRead: boolean
        createdAt: string
    }>
}

export interface PortfolioOverview {
    portfolioId: string
    portfolioName: string
    strategyType: string
    riskLevel: string
    initialInvestment: number
    currentValue: number
    netProfit: number
    profitPercentage: number
    totalTrades: number
    openTrades: number
    closedTrades: number
    winningTrades: number
    losingTrades: number
    winRate: number
    avgWinAmount: number
    avgLossAmount: number
    largestWin: number
    largestLoss: number
    profitFactor: number
    sharpeRatio: number
    maxDrawdown: number
    createdAt: string
    updatedAt: string
    recentTrades: Array<{
        id: string
        symbol: string
        type: string
        direction: string
        stake: number
        profit: number
        loss: number
        status: string
        entryTime: string
    }>
    performanceHistory: Array<{
        date: string
        value: number
        profit: number
    }>
}

export const dashboardService = {
    /**
     * Get investor dashboard summary
     */
    getSummary: async (investorId: string): Promise<DashboardSummary> => {
        return api.get(`/api/Dashboard/investor/${investorId}/summary`)
    },

    /**
     * Get recent activity for investor
     */
    getRecentActivity: async (
        investorId: string,
        tradeCount: number = 10,
        transactionCount: number = 10,
        notificationCount: number = 10
    ): Promise<RecentActivity> => {
        return api.get(
            `/api/Dashboard/investor/${investorId}/recent-activity?tradeCount=${tradeCount}&transactionCount=${transactionCount}&notificationCount=${notificationCount}`
        )
    },

    /**
     * Get portfolio overview
     */
    getPortfolioOverview: async (
        portfolioId: string,
        recentTradesCount: number = 10,
        performanceDays: number = 30
    ): Promise<PortfolioOverview> => {
        return api.get(
            `/api/Dashboard/portfolio/${portfolioId}/overview?recentTradesCount=${recentTradesCount}&performanceDays=${performanceDays}`
        )
    },
}

