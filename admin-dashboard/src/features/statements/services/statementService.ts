import { api } from '@/services/api'

export interface Statement {
    id: string
    investorId: string
    portfolioId: string | null
    statementType: string
    periodStart: string
    periodEnd: string
    generatedAt: string
    fileName: string
    filePath: string
    fileSize: number
}

export interface GenerateStatementRequest {
    investorId: string
    portfolioId?: string
    statementType: 'Monthly' | 'Quarterly' | 'Annual' | 'Custom'
    periodStart: string
    periodEnd: string
    includeTransactions?: boolean
    includeTrades?: boolean
    includePerformance?: boolean
}

export const statementService = {
    /**
     * Get all statements for an investor
     * Note: Backend generates statements on demand, doesn't store them
     */
    getInvestorStatements: async (_investorId: string): Promise<Statement[]> => {
        // Backend doesn't have a list endpoint, return empty array
        // Statements are generated on-demand via monthly/quarterly/annual endpoints
        return Promise.resolve([])
    },

    /**
     * Get statement by ID
     */
    getStatement: async (_statementId: string): Promise<Statement> => {
        throw new Error('Not implemented in backend - use generate methods')
    },

    /**
     * Generate new statement (monthly for current month)
     */
    generateStatement: async (investorId: string): Promise<void> => {
        const now = new Date()
        const year = now.getFullYear()
        const month = now.getMonth() + 1
        // This downloads the PDF
        return api.get(`/api/Statements/monthly?investorId=${investorId}&year=${year}&month=${month}&sendEmail=true`)
    },

    /**
     * Download statement
     */
    downloadStatement: async (_statementId: string): Promise<void> => {
        throw new Error('Not implemented in backend - use generate methods')
    },

    /**
     * Get portfolio statements
     */
    getPortfolioStatements: async (_portfolioId: string): Promise<Statement[]> => {
        return Promise.resolve([])
    },

    /**
     * Delete statement
     */
    deleteStatement: async (_statementId: string): Promise<void> => {
        throw new Error('Not implemented in backend - statements are not stored')
    },
}

