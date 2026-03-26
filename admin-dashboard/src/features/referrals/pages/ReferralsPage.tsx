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
            case 'active': return <CheckCircle size={12} className="text-green-400" />;
            case 'pending': return <Clock size={12} className="text-yellow-400" />;
            case 'inactive': return <XCircle size={12} className="text-gray-400" />;
            default: return null;
        }
    };

    const totalReferrals = referrals.length;
    const activeReferrals = referrals.filter(r => r.status === 'active').length;
    const totalCommission = referrals.reduce((sum, r) => sum + r.commission, 0);
    const pendingReferrals = referrals.filter(r => r.status === 'pending').length;

    return (
        <div className="px-4 sm:px-6 lg:px-8 py-4 w-full max-w-9xl mx-auto">
            {/* Page header */}
            <div className="relative mb-4 p-3 rounded-lg bg-gradient-to-br from-[#2F6BFF]/10 via-[#16124A] to-[#FFA62B]/10 border border-[#2F6BFF]/20">
                <div className="sm:flex sm:justify-between sm:items-center">
                    <div className="mb-2 sm:mb-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                            <div className="p-1.5 bg-[#2F6BFF]/20 rounded-lg">
                                <Users size={16} className="text-[#2F6BFF]" />
                            </div>
                            <h1 className="text-body-dashboard font-bold text-[#efdede] drop-shadow-[0_0_6px_rgba(160,167,181,0.3)]">Referrals</h1>
                        </div>
                        <p className="text-micro text-gray-300 ml-8">Invite friends and earn rewards</p>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
                {/* Total Referrals */}
                <div className="relative overflow-hidden bg-gradient-to-br from-[#16124A] to-[#0B0633] rounded-lg p-2 border border-[#2F6BFF]/30 hover:border-[#2F6BFF]/60 transition-all duration-300 hover-lift group">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-[#2F6BFF]/5 rounded-full blur-xl group-hover:bg-[#2F6BFF]/10 transition-all duration-300"></div>
                    <div className="relative">
                        <div className="flex items-center justify-between mb-1">
                            <div className="p-0.5 bg-gradient-to-br from-[#2F6BFF]/20 to-[#2F6BFF]/5 rounded group-hover:scale-110 transition-transform duration-300">
                                <Users size={14} className="text-[#2F6BFF]" />
                            </div>
                            <span className="text-[10px] text-gray-400 font-medium">Total</span>
                        </div>
                        <div className="text-small-dashboard font-bold text-[#efdede] font-tabular drop-shadow-[0_0_6px_rgba(160,167,181,0.3)]">{totalReferrals}</div>
                        <div className="text-[10px] text-gray-400">Referrals</div>
                    </div>
                </div>

                {/* Active Referrals */}
                <div className="relative overflow-hidden bg-gradient-to-br from-[#16124A] to-[#0B0633] rounded-lg p-2 border border-green-500/30 hover:border-green-500/60 transition-all duration-300 hover-lift group">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-green-500/5 rounded-full blur-xl group-hover:bg-green-500/10 transition-all duration-300"></div>
                    <div className="relative">
                        <div className="flex items-center justify-between mb-1">
                            <div className="p-0.5 bg-gradient-to-br from-green-500/20 to-green-500/5 rounded group-hover:scale-110 transition-transform duration-300">
                                <CheckCircle size={14} className="text-green-400" />
                            </div>
                            <span className="text-[10px] text-green-400 font-medium">Active</span>
                        </div>
                        <div className="text-small-dashboard font-bold text-green-400 font-tabular">{activeReferrals}</div>
                        <div className="text-[10px] text-gray-400">Trading</div>
                    </div>
                </div>

                {/* Pending Referrals */}
                <div className="relative overflow-hidden bg-gradient-to-br from-[#16124A] to-[#0B0633] rounded-lg p-2 border border-yellow-500/30 hover:border-yellow-500/60 transition-all duration-300 hover-lift group">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-500/5 rounded-full blur-xl group-hover:bg-yellow-500/10 transition-all duration-300"></div>
                    <div className="relative">
                        <div className="flex items-center justify-between mb-1">
                            <div className="p-0.5 bg-gradient-to-br from-yellow-500/20 to-yellow-500/5 rounded group-hover:scale-110 transition-transform duration-300">
                                <Clock size={14} className="text-yellow-400" />
                            </div>
                            <span className="text-[10px] text-yellow-400 font-medium">Pending</span>
                        </div>
                        <div className="text-small-dashboard font-bold text-[#efdede] font-tabular drop-shadow-[0_0_6px_rgba(160,167,181,0.3)]">{pendingReferrals}</div>
                        <div className="text-[10px] text-gray-400">Not Active</div>
                    </div>
                </div>

                {/* Total Commission */}
                <div className="relative overflow-hidden bg-gradient-to-br from-[#16124A] to-[#0B0633] rounded-lg p-2 border border-[#FFA62B]/30 hover:border-[#FFA62B]/60 transition-all duration-300 hover-lift group">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-[#FFA62B]/5 rounded-full blur-xl group-hover:bg-[#FFA62B]/10 transition-all duration-300"></div>
                    <div className="relative">
                        <div className="flex items-center justify-between mb-1">
                            <div className="p-0.5 bg-gradient-to-br from-[#FFA62B]/20 to-[#FFA62B]/5 rounded group-hover:scale-110 transition-transform duration-300">
                                <DollarSign size={14} className="text-[#FFA62B]" />
                            </div>
                            <span className="text-[10px] text-[#FFA62B] font-medium">Earned</span>
                        </div>
                        <div className="text-small-dashboard font-bold text-[#FFA62B] font-tabular">${totalCommission.toFixed(2)}</div>
                        <div className="text-[10px] text-gray-400">Commission</div>
                    </div>
                </div>
            </div>

            {/* Referral Link Section */}
            <div className="mb-3 bg-gradient-to-br from-[#0B0633] to-[#16124A] rounded-lg border border-[#2F6BFF]/30 shadow-xl p-3">
                <h2 className="text-small-dashboard text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)] font-semibold mb-2">Your Referral Link</h2>

                <div className="space-y-2">
                    {/* Referral Code */}
                    <div>
                        <label className="block text-[10px] text-gray-400 mb-1">Referral Code</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={referralCode}
                                readOnly
                                className="flex-1 px-2 py-1.5 bg-[#16124A] border border-gray-700/50 rounded text-micro text-[#efdede] focus:outline-none"
                            />
                            <button
                                onClick={handleCopyCode}
                                className="flex items-center gap-1 px-3 py-1.5 rounded bg-[#2F6BFF]/20 hover:bg-[#2F6BFF]/30 text-[#2F6BFF] text-micro font-semibold transition-colors"
                            >
                                <Copy size={14} />
                                <span>Copy</span>
                            </button>
                        </div>
                    </div>

                    {/* Referral Link */}
                    <div>
                        <label className="block text-[10px] text-gray-400 mb-1">Referral Link</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={referralLink}
                                readOnly
                                className="flex-1 px-2 py-1.5 bg-[#16124A] border border-gray-700/50 rounded text-micro text-[#efdede] focus:outline-none"
                            />
                            <button
                                onClick={handleCopyLink}
                                className="flex items-center gap-1 px-3 py-1.5 rounded bg-[#2F6BFF]/20 hover:bg-[#2F6BFF]/30 text-[#2F6BFF] text-micro font-semibold transition-colors"
                            >
                                <Copy size={14} />
                                <span>Copy</span>
                            </button>
                            <button
                                onClick={handleShare}
                                className="flex items-center gap-1 px-3 py-1.5 rounded bg-gradient-to-r from-[#2F6BFF] to-[#2557c9] hover:from-[#2557c9] hover:to-[#2F6BFF] text-white text-micro font-semibold transition-all duration-300 shadow-brand"
                            >
                                <Share2 size={14} />
                                <span>Share</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Referrals Table */}
            <div className="bg-gradient-to-br from-[#0B0633] to-[#16124A] rounded-lg border border-[#2F6BFF]/30 shadow-xl overflow-hidden">
                <div className="p-3 border-b border-[#2F6BFF]/20">
                    <h2 className="text-small-dashboard text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">Referral History</h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-[#16124A] border-b border-[#2F6BFF]/30">
                                <th className="px-2 py-1.5 text-left text-[10px] font-semibold text-gray-300 uppercase tracking-wider">Name</th>
                                <th className="px-2 py-1.5 text-left text-[10px] font-semibold text-gray-300 uppercase tracking-wider">Email</th>
                                <th className="px-2 py-1.5 text-left text-[10px] font-semibold text-gray-300 uppercase tracking-wider">Status</th>
                                <th className="px-2 py-1.5 text-center text-[10px] font-semibold text-gray-300 uppercase tracking-wider">Trades</th>
                                <th className="px-2 py-1.5 text-right text-[10px] font-semibold text-gray-300 uppercase tracking-wider">Commission</th>
                                <th className="px-2 py-1.5 text-right text-[10px] font-semibold text-gray-300 uppercase tracking-wider">Signup Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2F6BFF]/20">
                            {referrals.map((referral) => (
                                <tr key={referral.id} className="hover:bg-[#16124A]/50 transition-colors duration-200">
                                    <td className="px-2 py-2 whitespace-nowrap">
                                        <div className="text-[10px] text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">{referral.name}</div>
                                    </td>
                                    <td className="px-2 py-2 whitespace-nowrap">
                                        <div className="text-[10px] text-gray-400">{referral.email}</div>
                                    </td>
                                    <td className="px-2 py-2 whitespace-nowrap">
                                        <div className="flex items-center gap-1">
                                            {getStatusIcon(referral.status)}
                                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${getStatusColor(referral.status)}`}>
                                                {referral.status.toUpperCase()}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-2 py-2 text-center whitespace-nowrap">
                                        <div className="text-[10px] text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">{referral.totalTrades}</div>
                                    </td>
                                    <td className="px-2 py-2 text-right whitespace-nowrap">
                                        <div className="text-[10px] text-[#FFA62B] font-semibold">${referral.commission.toFixed(2)}</div>
                                    </td>
                                    <td className="px-2 py-2 text-right whitespace-nowrap">
                                        <div className="text-[10px] text-gray-400">{referral.signupDate}</div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
