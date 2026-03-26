import { api } from '@/services/api'

export interface Transaction {
    id: string
    investorId: string
    portfolioId: string | null
    type: string
    amount: number
    currency: string
    status: string
    description: string | null
    reference: string | null
    createdAt: string
    completedAt: string | null
}

export interface CreateTransactionRequest {
    investorId: string
    portfolioId?: string
    type: 'Deposit' | 'Withdrawal' | 'ProfitDistribution' | 'Fee' | 'Adjustment'
    amount: number
    currency?: string
    description?: string
    reference?: string
}

export const transactionService = {
    /**
     * Get all transactions for an investor
     */
    getInvestorTransactions: async (investorId: string): Promise<Transaction[]> => {
        return api.get(`/api/Transactions/investor/${investorId}`)
    },

    /**
     * Get transaction by ID
     */
    getTransaction: async (transactionId: string): Promise<Transaction> => {
        return api.get(`/api/Transactions/${transactionId}`)
    },

    /**
     * Create new transaction
     */
    createTransaction: async (
        data: CreateTransactionRequest
    ): Promise<Transaction> => {
        return api.post('/api/Transactions', data)
    },

    /**
     * Get transactions by portfolio
     */
    getPortfolioTransactions: async (portfolioId: string): Promise<Transaction[]> => {
        return api.get(`/api/Transactions/portfolio/${portfolioId}`)
    },

    /**
     * Export transactions to CSV
     */
    exportTransactions: async (
        investorId?: string,
        startDate?: string,
        endDate?: string
    ): Promise<void> => {
        const params = new URLSearchParams()
        if (investorId) params.append('investorId', investorId)
        if (startDate) params.append('startDate', startDate)
        if (endDate) params.append('endDate', endDate)

        const queryString = params.toString()
        const url = `/api/Transactions/export${queryString ? `?${queryString}` : ''}`

        await api.downloadFile(url, `transactions_${new Date().toISOString().split('T')[0]}.csv`)
    },
}

