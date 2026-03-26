import { api } from '@/services/api'

export interface Referral {
    id: string
    referrerId: string
    referredInvestorId: string | null
    referralCode: string
    referralEmail: string | null
    status: string
    commissionAmount: number | null
    commissionPaid: boolean
    createdAt: string
    convertedAt: string | null
}

export interface ReferralStats {
    investorId: string
    totalReferrals: number
    successfulReferrals: number
    pendingReferrals: number
    totalCommissionEarned: number
    totalCommissionPaid: number
    totalCommissionPending: number
    conversionRate: number
}

export interface CreateReferralRequest {
    referralEmail: string
    message?: string
}

export const referralService = {
    /**
     * Get referral statistics for an investor (uses /my-summary endpoint)
     */
    getReferralStats: async (_investorId: string): Promise<ReferralStats> => {
        const summary = await api.get<any>(`/api/Referrals/my-summary`)
        return {
            investorId: summary.investorId,
            totalReferrals: summary.totalReferrals,
            successfulReferrals: summary.activeReferrals,
            pendingReferrals: summary.pendingReferrals,
            totalCommissionEarned: summary.totalCommissionEarned,
            totalCommissionPaid: summary.paidCommission,
            totalCommissionPending: summary.pendingCommission,
            conversionRate: summary.totalReferrals > 0 ? (summary.activeReferrals / summary.totalReferrals) * 100 : 0,
        }
    },

    /**
     * Get all referrals for an investor
     */
    getInvestorReferrals: async (_investorId: string): Promise<Referral[]> => {
        const referrals = await api.get<any[]>(`/api/Referrals/my-referrals`)
        return referrals.map(r => ({
            id: r.id,
            referrerId: r.referrerInvestorId,
            referredInvestorId: r.referredInvestorId,
            referralCode: r.referralCode,
            referralEmail: r.referredEmail,
            status: r.status,
            commissionAmount: r.commissionEarned,
            commissionPaid: r.status === 'Active',
            createdAt: r.referredAt,
            convertedAt: r.convertedAt,
        }))
    },

    /**
     * Get investor's referral code
     */
    getReferralCode: async (_investorId: string): Promise<{ code: string; shareUrl: string }> => {
        const response = await api.get<any>(`/api/Referrals/my-code`)
        return {
            code: response.referralCode,
            shareUrl: response.referralLink,
        }
    },

    /**
     * Create (send) a new referral
     */
    createReferral: async (
        investorId: string,
        data: CreateReferralRequest
    ): Promise<Referral> => {
        return api.post('/api/Referrals', {
            referrerId: investorId,
            ...data,
        })
    },

    /**
     * Get referral by ID
     */
    getReferral: async (referralId: string): Promise<Referral> => {
        return api.get(`/api/Referrals/${referralId}`)
    },

    /**
     * Resend referral email
     */
    resendReferral: async (referralId: string): Promise<void> => {
        return api.post(`/api/Referrals/${referralId}/resend`)
    },
}

