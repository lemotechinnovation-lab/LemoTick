import { api } from '@/services/api'

export interface BankAccount {
    id: string
    investorId: string
    accountHolderName: string
    bankName: string
    branchCode: string
    accountNumber: string
    accountType: string
    isDefault: boolean
    status: string
    createdAt: string
    updatedAt: string
}

export interface CreateBankAccountRequest {
    investorId: string
    accountHolderName: string
    bankName: string
    branchCode: string
    accountNumber: string
    accountType: 'Savings' | 'Checking' | 'Business'
    isDefault?: boolean
}

export interface UpdateBankAccountRequest {
    accountHolderName?: string
    bankName?: string
    branchCode?: string
    accountNumber?: string
    accountType?: 'Savings' | 'Checking' | 'Business'
    isDefault?: boolean
    status?: 'Active' | 'Inactive' | 'Suspended'
}

export const bankAccountService = {
    /**
     * Get all bank accounts for an investor
     */
    getInvestorBankAccounts: async (investorId: string): Promise<BankAccount[]> => {
        return api.get(`/api/BankAccounts?investorId=${investorId}`)
    },

    /**
     * Get bank account by ID
     */
    getBankAccount: async (accountId: string): Promise<BankAccount> => {
        return api.get(`/api/BankAccounts/${accountId}`)
    },

    /**
     * Create new bank account
     */
    createBankAccount: async (data: CreateBankAccountRequest): Promise<BankAccount> => {
        return api.post('/api/BankAccounts', data)
    },

    /**
     * Update bank account
     */
    updateBankAccount: async (
        accountId: string,
        data: UpdateBankAccountRequest
    ): Promise<BankAccount> => {
        return api.put(`/api/BankAccounts/${accountId}`, data)
    },

    /**
     * Delete bank account
     */
    deleteBankAccount: async (accountId: string): Promise<void> => {
        return api.delete(`/api/BankAccounts/${accountId}`)
    },

    /**
     * Set bank account as default
     */
    setAsDefault: async (accountId: string): Promise<void> => {
        return api.post(`/api/BankAccounts/${accountId}/set-primary`)
    },
}

