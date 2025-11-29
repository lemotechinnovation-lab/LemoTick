import { QUERY_KEYS } from '@/config/constants'
import { useAuthStore } from '@features/auth/stores/authStore'
import { useQuery } from '@tanstack/react-query'
import { formatCurrency, formatDateTime } from '@utils/format'
import { CheckCircle, Clock, Copy, Mail, Share2, Users } from 'lucide-react'
import { referralService } from '../services/referralService'

export default function ReferralsPage() {
    const { user } = useAuthStore()

    // Fetch referral stats
    const { data: stats, isLoading: statsLoading } = useQuery({
        queryKey: [...QUERY_KEYS.REFERRALS, 'stats', user?.id],
        queryFn: () => referralService.getReferralStats(user!.id),
        enabled: !!user?.id,
    })

    // Fetch referral code
    const { data: referralCode } = useQuery({
        queryKey: [...QUERY_KEYS.REFERRALS, 'code', user?.id],
        queryFn: () => referralService.getReferralCode(user!.id),
        enabled: !!user?.id,
    })

    // Fetch referrals list
    const { data: referrals, isLoading, error } = useQuery({
        queryKey: [...QUERY_KEYS.REFERRALS, user?.id],
        queryFn: () => referralService.getInvestorReferrals(user!.id),
        enabled: !!user?.id,
    })

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        // TODO: Show toast notification
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Converted':
                return 'bg-green-100 text-green-800'
            case 'Pending':
                return 'bg-yellow-100 text-yellow-800'
            case 'Expired':
                return 'bg-gray-100 text-gray-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    if (statsLoading || isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading referrals...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-red-600">Error loading referrals</p>
                    <p className="text-sm text-gray-500 mt-2">Please try refreshing the page</p>
                </div>
            </div>
        )
    }

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Referral Program</h1>
                <p className="text-gray-600">Earn commissions by referring friends and family</p>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-6">
                    <div className="card">
                        <p className="text-sm font-medium text-gray-600">Total Referrals</p>
                        <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalReferrals}</p>
                        <p className="mt-1 text-sm text-gray-500">All time</p>
                    </div>

                    <div className="card bg-green-50">
                        <p className="text-sm font-medium text-green-800">Successful</p>
                        <p className="mt-2 text-3xl font-bold text-green-900">{stats.successfulReferrals}</p>
                        <p className="mt-1 text-sm text-green-700">{stats.conversionRate.toFixed(1)}% conversion rate</p>
                    </div>

                    <div className="card bg-yellow-50">
                        <p className="text-sm font-medium text-yellow-800">Pending</p>
                        <p className="mt-2 text-3xl font-bold text-yellow-900">{stats.pendingReferrals}</p>
                        <p className="mt-1 text-sm text-yellow-700">Awaiting registration</p>
                    </div>

                    <div className="card bg-purple-50">
                        <p className="text-sm font-medium text-purple-800">Total Earned</p>
                        <p className="mt-2 text-3xl font-bold text-purple-900">
                            {formatCurrency(stats.totalCommissionEarned)}
                        </p>
                        <p className="mt-1 text-sm text-purple-700">
                            {formatCurrency(stats.totalCommissionPaid)} paid
                        </p>
                    </div>
                </div>
            )}

            {/* Referral Code Card */}
            {referralCode && (
                <div className="card bg-gradient-to-r from-primary-500 to-primary-600 text-white mb-6">
                    <h3 className="text-lg font-bold mb-4">Your Referral Code</h3>
                    <div className="flex items-center justify-between bg-white/20 rounded-lg p-4 mb-4">
                        <div className="font-mono text-2xl font-bold">{referralCode.code}</div>
                        <button
                            className="btn-secondary bg-white text-primary-600 hover:bg-gray-100 flex items-center space-x-2"
                            onClick={() => copyToClipboard(referralCode.code)}
                        >
                            <Copy className="h-4 w-4" />
                            <span>Copy</span>
                        </button>
                    </div>
                    <div className="flex items-center space-x-3">
                        <button
                            className="btn-secondary bg-white/20 hover:bg-white/30 border-white/30 text-white flex items-center space-x-2"
                            onClick={() => copyToClipboard(referralCode.shareUrl)}
                        >
                            <Share2 className="h-4 w-4" />
                            <span>Share Link</span>
                        </button>
                        <button className="btn-secondary bg-white/20 hover:bg-white/30 border-white/30 text-white flex items-center space-x-2">
                            <Mail className="h-4 w-4" />
                            <span>Send Email</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Referrals Table */}
            {referrals && referrals.length > 0 ? (
                <div className="card overflow-hidden p-0">
                    <div className="px-6 py-4 bg-gray-50 border-b">
                        <h3 className="font-bold text-gray-900 flex items-center space-x-2">
                            <Users className="h-5 w-5" />
                            <span>Your Referrals</span>
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                                        Email
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                                        Referred
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                                        Converted
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-600">
                                        Commission
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {referrals.map((referral) => (
                                    <tr key={referral.id} className="hover:bg-gray-50">
                                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                                            {referral.referralEmail || 'N/A'}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <span className={`inline-flex items-center space-x-1 rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(referral.status)}`}>
                                                {referral.status === 'Converted' ? (
                                                    <CheckCircle className="h-3 w-3" />
                                                ) : (
                                                    <Clock className="h-3 w-3" />
                                                )}
                                                <span>{referral.status}</span>
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                                            {formatDateTime(referral.createdAt)}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                                            {referral.convertedAt ? formatDateTime(referral.convertedAt) : '-'}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-right">
                                            {referral.commissionAmount ? (
                                                <span className={`font-medium ${referral.commissionPaid ? 'text-green-600' : 'text-yellow-600'}`}>
                                                    {formatCurrency(referral.commissionAmount)}
                                                    {referral.commissionPaid && ' ✓'}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="card flex flex-col items-center justify-center py-12">
                    <Users className="h-12 w-12 text-gray-400" />
                    <h3 className="mt-4 text-lg font-medium text-gray-900">No referrals yet</h3>
                    <p className="mt-2 text-center text-sm text-gray-500">
                        Start referring friends to earn commissions!
                    </p>
                </div>
            )}

            {/* Info Card */}
            <div className="card mt-6 bg-blue-50">
                <h3 className="font-bold text-gray-900 mb-3">How It Works</h3>
                <div className="space-y-2 text-sm text-gray-700">
                    <p>• <strong>Share your referral code</strong> with friends and family</p>
                    <p>• <strong>They register</strong> using your code and make their first deposit</p>
                    <p>• <strong>You earn 10% commission</strong> on their first 6 months of deposits</p>
                    <p>• <strong>Commissions are paid monthly</strong> directly to your account</p>
                </div>
                <p className="text-xs text-gray-600 mt-3">
                    Terms and conditions apply. Commissions are subject to verification and approval.
                </p>
            </div>
        </div>
    )
}

