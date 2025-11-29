import { api } from '@/services/api'

export interface Portfolio {
    id: string
    investorId: string
    name: string
    description?: string
    strategyType: string
    riskLevel: string
    status: string
    initialInvestment: number
    currentValue: number
    netProfit: number
    profitPercentage: number
    maxDrawdown: number
    targetReturn: number
    createdAt: string
    updatedAt: string
}

export interface CreatePortfolioRequest {
    investorId: string
    name: string
    strategyType: string
    riskLevel: string
    initialInvestment: number
    maxDrawdown?: number
    targetReturn?: number
}

export interface UpdatePortfolioRequest {
    name?: string
    strategyType?: string
    riskLevel?: string
    status?: string
    maxDrawdown?: number
    targetReturn?: number
}

export const portfolioService = {
    /**
     * Get all portfolios for an investor
     */
    getInvestorPortfolios: async (investorId: string): Promise<Portfolio[]> => {
        return api.get(`/api/Investors/${investorId}/portfolios`)
    },

    /**
     * Get portfolio by ID
     */
    getPortfolio: async (portfolioId: string): Promise<Portfolio> => {
        return api.get(`/api/Portfolios/${portfolioId}`)
    },

    /**
     * Create new portfolio
     */
    createPortfolio: async (data: CreatePortfolioRequest): Promise<Portfolio> => {
        return api.post('/api/Portfolios', data)
    },

    /**
     * Update portfolio
     */
    updatePortfolio: async (
        portfolioId: string,
        data: UpdatePortfolioRequest
    ): Promise<Portfolio> => {
        return api.put(`/api/Portfolios/${portfolioId}`, data)
    },

    /**
     * Delete portfolio
     */
    deletePortfolio: async (portfolioId: string): Promise<void> => {
        return api.delete(`/api/Portfolios/${portfolioId}`)
    },
}

