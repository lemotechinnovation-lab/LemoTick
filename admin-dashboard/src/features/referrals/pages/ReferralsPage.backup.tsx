import ModernAreaChart from '@/components/charts/ModernAreaChart';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageCard, PageContainer, PageGrid, PageSection, Stack } from '@/components/ui/PageLayoutEnhanced';
import { CheckCircle, Clock, Copy, DollarSign, Share2, Users, XCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export interface Referral {
    id: string;
    name: string;
    email: string;
    status: 'active' | 'pending' | 'inactive';
    signupDate: string;
    totalTrades: number;
    commission: number;
    level: number;
}

export default function ReferralsPage() {
    const referralCode = 'ACME2024XYZ';
    const referralLink = `https://app.example.com/signup?ref=${referralCode}`;

    const [referrals] = useState<Referral[]>([
        {
            id: '1',
            name: 'John Smith',
            email: 'john.smith@example.com',
            status: 'active',
            signupDate: '2024-03-01',
            totalTrades: 45,
            commission: 125.50,
            level: 1,
        },
        {
            id: '2',
            name: 'Sarah Johnson',
            email: 'sarah.j@example.com',
            status: 'active',
            signupDate: '2024-03-05',
            totalTrades: 32,
            commission: 89.25,
            level: 1,
        },
        {
            id: '3',
            name: 'Mike Wilson',
            email: 'mike.w@example.com',
            status: 'pending',
            signupDate: '2024-03-08',
            totalTrades: 0,
            commission: 0,
            level: 1,
        },
        {
            id: '4',
            name: 'Emily Davis',
            email: 'emily.d@example.com',
            status: 'active',
            signupDate: '2024-02-28',
            totalTrades: 67,
            commission: 198.75,
            level: 1,
        },
        {
            id: '5',
            name: 'Robert Brown',
            email: 'robert.b@example.com',
            status: 'inactive',
            signupDate: '2024-02-15',
            totalTrades: 12,
            commission: 34.50,
            level: 1,
        },
    ]);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(referralLink);
        toast.success('Referral link copied to clipboard!');
    };

    const handleCopyCode = () => {
        navigator.clipboard.writeText(referralCode);
        toast.success('Referral code copied to clipboard!');
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: 'Join me on this trading platform',
                text: `Use my referral code: ${referralCode}`,
                url: referralLink,
            });
        } else {
            toast.info('Share feature not supported on this browser');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'text-green-400 bg-green-500/20';
            case 'pending': return 'text-yellow-400 bg-yellow-500/20';
            case 'inactive': return 'text-gray-400 bg-gray-500/20';
            default: return 'text-gray-400 bg-gray-500/20';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active': return <CheckCircle className="w-4 h-4 text-green-400" />;
            case 'pending': return <Clock className="w-4 h-4 text-yellow-400" />;
            case 'inactive': return <XCircle className="w-4 h-4 text-gray-400" />;
            default: return null;
        }
    };

    const totalReferrals = referrals.length;
    const activeReferrals = referrals.filter(r => r.status === 'active').length;
    const totalCommission = referrals.reduce((sum, r) => sum + r.commission, 0);
    const pendingReferrals = referrals.filter(r => r.status === 'pending').length;

    // Commission trend data (last 30 days)
    const commissionTrend = [12, 15, 18, 22, 19, 25, 28, 32, 29, 35, 38, 42, 45, 48, 52, 55, 58, 62, 65, 68, 72, 75, 78, 82, 85, 89, 92, 95, 98, totalCommission];

    return (
        <PageContainer>
            <Stack spacing="lg">
                {/* Page Header */}
                <PageHeader
                    title="REFERRALS"
                    description="Invite friends and earn rewards"
                    icon={Users}
                />

                {/* Stats Cards */}
                <PageGrid cols={4} gap="lg">
                    {/* Total Referrals */}
                    <PageCard hover>
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-[#2F6BFF]/20 to-[#3B82F6]/20 rounded-xl flex items-center justify-center">
                                <Users className="w-5 h-5 text-[#2F6BFF]" />
                            </div>
                            <span className="text-xs text-gray-400 font-semibold">Total</span>
                        </div>
                        <div className="text-2xl font-bold text-white mb-1">{totalReferrals}</div>
                        <div className="text-xs text-gray-400">Referrals</div>
                    </PageCard>

                    {/* Active Referrals */}
                    <PageCard hover className="border-green-500/20 hover:border-green-500">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-500/20 to-green-400/20 rounded-xl flex items-center justify-center">
                                <CheckCircle className="w-5 h-5 text-green-400" />
                            </div>
                            <span className="text-xs text-green-400 font-semibold">Active</span>
                        </div>
                        <div className="text-2xl font-bold text-green-400 mb-1">{activeReferrals}</div>
                        <div className="text-xs text-gray-400">Trading</div>
                    </PageCard>

                    {/* Pending Referrals */}
                    <PageCard hover className="border-yellow-500/20 hover:border-yellow-500">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-yellow-500/20 to-yellow-400/20 rounded-xl flex items-center justify-center">
                                <Clock className="w-5 h-5 text-yellow-400" />
                            </div>
                            <span className="text-xs text-yellow-400 font-semibold">Pending</span>
                        </div>
                        <div className="text-2xl font-bold text-white mb-1">{pendingReferrals}</div>
                        <div className="text-xs text-gray-400">Not Active</div>
                    </PageCard>

                    {/* Total Commission */}
                    <PageCard hover className="border-[#FFA62B]/20 hover:border-[#FFA62B]">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-[#FFA62B]/20 to-[#F59E0B]/20 rounded-xl flex items-center justify-center">
                                <DollarSign className="w-5 h-5 text-[#FFA62B]" />
                            </div>
                            <span className="text-xs text-[#FFA62B] font-semibold">Earned</span>
                        </div>
                        <div className="text-2xl font-bold text-[#FFA62B] mb-1">${totalCommission.toFixed(2)}</div>
                        <div className="text-xs text-gray-400">Commission</div>
                    </PageCard>
                </PageGrid>

                {/* Commission Trend Chart */}
                <PageCard padding="lg">
                    <h3 className="text-base font-semibold text-white mb-4">Commission Earnings (Last 30 Days)</h3>
                    <ModernAreaChart
                        data={commissionTrend}
                        color="#FFA62B"
                        gradientFrom="#FFA62B"
                        gradientTo="#F59E0B"
                        height={180}
                        showGrid={true}
                    />
                </PageCard>

                {/* Referral Link Section */}
                <PageCard padding="lg">
                    <h2 className="text-base font-semibold text-white mb-4">Your Referral Link</h2>

                    <Stack spacing="md">
                        {/* Referral Code */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-300 mb-2">Referral Code</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={referralCode}
                                    readOnly
                                    className="flex-1 px-3 py-2 bg-[#16124A] border border-gray-700/50 rounded-xl text-sm text-[#efdede] focus:outline-none"
                                />
                                <button
                                    onClick={handleCopyCode}
                                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#2F6BFF]/20 border border-[#2F6BFF]/30 hover:border-[#2F6BFF] text-[#2F6BFF] text-xs font-semibold transition-all duration-300"
                                >
                                    <Copy className="w-4 h-4" />
                                    <span>Copy</span>
                                </button>
                            </div>
                        </div>

                        {/* Referral Link */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-300 mb-2">Referral Link</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={referralLink}
                                    readOnly
                                    className="flex-1 px-3 py-2 bg-[#16124A] border border-gray-700/50 rounded-xl text-sm text-[#efdede] focus:outline-none"
                                />
                                <button
                                    onClick={handleCopyLink}
                                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#2F6BFF]/20 border border-[#2F6BFF]/30 hover:border-[#2F6BFF] text-[#2F6BFF] text-xs font-semibold transition-all duration-300"
                                >
                                    <Copy className="w-4 h-4" />
                                    <span>Copy</span>
                                </button>
                                <button
                                    onClick={handleShare}
                                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-[#2F6BFF] to-[#3B82F6] hover:from-[#3B82F6] hover:to-[#2F6BFF] text-white text-xs font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                                >
                                    <Share2 className="w-4 h-4" />
                                    <span>Share</span>
                                </button>
                            </div>
                        </div>
                    </Stack>
                </PageCard>

                {/* Referrals Table */}
                <PageCard padding="lg">
                    <div className="border-b border-[#2F6BFF]/20 bg-gradient-to-r from-[#2F6BFF]/10 to-transparent pb-4 mb-4">
                        <h2 className="text-base font-semibold text-white">Referral History</h2>
                    </div>

                    <div className="overflow-x-auto w-full">
                        <table className="w-full min-w-[600px]">
                            <thead>
                                <tr className="bg-gradient-to-r from-[#2F6BFF]/10 to-transparent border-b border-[#2F6BFF]/30">
                                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Name</th>
                                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Email</th>
                                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Status</th>
                                    <th className="px-4 sm:px-6 py-3 text-center text-xs font-semibold text-gray-300 uppercase tracking-wider">Trades</th>
                                    <th className="px-4 sm:px-6 py-3 text-right text-xs font-semibold text-gray-300 uppercase tracking-wider">Commission</th>
                                    <th className="px-4 sm:px-6 py-3 text-right text-xs font-semibold text-gray-300 uppercase tracking-wider">Signup Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#2F6BFF]/20">
                                {referrals.map((referral) => (
                                    <tr key={referral.id} className="hover:bg-[#16124A]/50 transition-colors duration-200">
                                        <td className="px-4 sm:px-6 py-3 whitespace-nowrap">
                                            <div className="text-sm font-semibold text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">{referral.name}</div>
                                        </td>
                                        <td className="px-4 sm:px-6 py-3 whitespace-nowrap">
                                            <div className="text-xs text-gray-400">{referral.email}</div>
                                        </td>
                                        <td className="px-4 sm:px-6 py-3 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                {getStatusIcon(referral.status)}
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(referral.status)}`}>
                                                    {referral.status.toUpperCase()}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 sm:px-6 py-3 text-center whitespace-nowrap">
                                            <div className="text-sm font-semibold text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">{referral.totalTrades}</div>
                                        </td>
                                        <td className="px-4 sm:px-6 py-3 text-right whitespace-nowrap">
                                            <div className="text-sm text-[#FFA62B] font-semibold">${referral.commission.toFixed(2)}</div>
                                        </td>
                                        <td className="px-4 sm:px-6 py-3 text-right whitespace-nowrap">
                                            <div className="text-xs text-gray-400">{referral.signupDate}</div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </PageCard>
            </Stack>
        </PageContainer>
    );
}


