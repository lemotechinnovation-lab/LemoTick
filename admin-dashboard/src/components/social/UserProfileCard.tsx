// UserProfileCard Component - Display user profile information

import type { OnlineStatus, TradingExperience, UserProfile, UserProfileStats } from '@/types/social';
import { Eye, MessageCircle, Shield, UserCheck, UserPlus, UserX } from 'lucide-react';

interface UserProfileCardProps {
    profile: UserProfile;
    stats?: UserProfileStats;
    relationship?: 'none' | 'pending_sent' | 'pending_received' | 'friends' | 'blocked';
    onAddFriend?: () => void;
    onMessage?: () => void;
    onUnfriend?: () => void;
    onBlock?: () => void;
    onViewProfile?: () => void;
    showActions?: boolean;
    isOwnProfile?: boolean;
}

export default function UserProfileCard({
    profile,
    stats,
    relationship = 'none',
    onAddFriend,
    onMessage,
    onUnfriend,
    onBlock,
    onViewProfile,
    showActions = true,
    isOwnProfile = false,
}: UserProfileCardProps) {
    const getOnlineStatusColor = (status?: OnlineStatus) => {
        switch (status) {
            case 'online':
                return 'bg-green-500';
            case 'away':
                return 'bg-yellow-500';
            case 'offline':
            default:
                return 'bg-gray-500';
        }
    };

    const getTradingExperienceBadge = (experience?: TradingExperience) => {
        const colors: Record<number, string> = {
            0: 'bg-blue-500/20 text-blue-400 border-blue-500/30',      // Beginner
            1: 'bg-green-500/20 text-green-400 border-green-500/30',   // Intermediate
            2: 'bg-orange-500/20 text-orange-400 border-orange-500/30', // Advanced
            3: 'bg-purple-500/20 text-purple-400 border-purple-500/30', // Expert
        };
        return colors[experience ?? 0] || colors[0];
    };

    const getTradingExperienceLabel = (experience?: TradingExperience) => {
        const labels: Record<number, string> = {
            0: 'Beginner',
            1: 'Intermediate',
            2: 'Advanced',
            3: 'Expert',
        };
        return labels[experience ?? 0] || 'Beginner';
    };

    return (
        <div className="p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl bg-[#16124A]/50 border border-[#2F6BFF]/20 hover:border-[#2F6BFF] transition-all duration-300 group">
            {/* Profile Header */}
            <div className="flex items-start gap-4 mb-4">
                {/* Avatar with online status */}
                <div className="relative">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-lg sm:rounded-xl overflow-hidden bg-gradient-to-br from-[#2F6BFF]/20 to-[#FFA62B]/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                        {profile.avatarUrl ? (
                            <img
                                src={profile.avatarUrl}
                                alt={profile.displayName}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="text-2xl font-bold text-[#2F6BFF]">
                                {profile.displayName.charAt(0).toUpperCase()}
                            </span>
                        )}
                    </div>
                    {/* Online status indicator */}
                    {profile.onlineStatus && (
                        <div
                            className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-[#16124A] ${getOnlineStatusColor(
                                profile.onlineStatus
                            )}`}
                        ></div>
                    )}
                    {/* Verified badge */}
                    {profile.isVerified && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-[#2F6BFF] rounded-full flex items-center justify-center">
                            <UserCheck className="w-3 h-3 text-white" />
                        </div>
                    )}
                </div>

                {/* Profile Info */}
                <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold text-white mb-1 truncate">
                        {profile.displayName}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-400 mb-2">@{profile.username}</p>
                    {profile.tradingExperience !== undefined && (
                        <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getTradingExperienceBadge(
                                profile.tradingExperience
                            )}`}
                        >
                            {getTradingExperienceLabel(profile.tradingExperience)}
                        </span>
                    )}
                </div>
            </div>

            {/* Bio */}
            {profile.bio && (
                <p className="text-xs sm:text-sm text-gray-300 mb-4 line-clamp-2">{profile.bio}</p>
            )}

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="text-center p-3 rounded-xl bg-[#0B0633]/50">
                        <div className="text-xl font-bold text-white">{stats.totalFriends}</div>
                        <div className="text-xs text-gray-400">Friends</div>
                    </div>
                    {stats.mutualFriends !== undefined && (
                        <div className="text-center p-3 rounded-xl bg-[#0B0633]/50">
                            <div className="text-xl font-bold text-[#2F6BFF]">{stats.mutualFriends}</div>
                            <div className="text-xs text-gray-400">Mutual</div>
                        </div>
                    )}
                    {stats.totalTrades !== undefined && (
                        <div className="text-center p-3 rounded-xl bg-[#0B0633]/50">
                            <div className="text-xl font-bold text-white">{stats.totalTrades}</div>
                            <div className="text-xs text-gray-400">Trades</div>
                        </div>
                    )}
                </div>
            )}

            {/* Trading Interests */}
            {profile.preferredMarkets && profile.preferredMarkets.length > 0 && (
                <div className="mb-4">
                    <div className="text-xs text-gray-400 mb-2">Preferred Markets</div>
                    <div className="flex flex-wrap gap-2">
                        {profile.preferredMarkets.slice(0, 3).map((market) => (
                            <span
                                key={market}
                                className="px-2 py-1 rounded-lg bg-[#2F6BFF]/10 text-[#2F6BFF] text-xs font-medium"
                            >
                                {market}
                            </span>
                        ))}
                        {profile.preferredMarkets.length > 3 && (
                            <span className="px-2 py-1 rounded-lg bg-[#2F6BFF]/10 text-[#2F6BFF] text-xs font-medium">
                                +{profile.preferredMarkets.length - 3}
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Actions */}
            {showActions && !isOwnProfile && (
                <div className="flex gap-2">
                    {relationship === 'none' && onAddFriend && (
                        <button
                            onClick={onAddFriend}
                            className="flex-1 px-4 py-2 bg-gradient-to-r from-[#2F6BFF] to-[#FFA62B] text-white rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                        >
                            <UserPlus className="w-4 h-4" />
                            Add Friend
                        </button>
                    )}

                    {relationship === 'pending_sent' && (
                        <button
                            disabled
                            className="flex-1 px-4 py-2 bg-[#2F6BFF]/20 border border-[#2F6BFF]/30 text-[#2F6BFF] rounded-xl text-sm font-semibold cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <UserCheck className="w-4 h-4" />
                            Request Sent
                        </button>
                    )}

                    {relationship === 'pending_received' && (
                        <button
                            disabled
                            className="flex-1 px-4 py-2 bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 rounded-xl text-sm font-semibold cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <UserCheck className="w-4 h-4" />
                            Pending
                        </button>
                    )}

                    {relationship === 'friends' && (
                        <>
                            {onMessage && (
                                <button
                                    onClick={onMessage}
                                    className="flex-1 px-4 py-2 bg-[#2F6BFF]/20 border border-[#2F6BFF]/30 hover:border-[#2F6BFF] text-[#2F6BFF] rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                                >
                                    <MessageCircle className="w-4 h-4" />
                                    Message
                                </button>
                            )}
                            {onUnfriend && (
                                <button
                                    onClick={onUnfriend}
                                    className="px-4 py-2 bg-red-500/20 border border-red-500/30 hover:border-red-500 text-red-400 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                                >
                                    <UserX className="w-4 h-4" />
                                </button>
                            )}
                        </>
                    )}

                    {relationship === 'blocked' && (
                        <button
                            disabled
                            className="flex-1 px-4 py-2 bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl text-sm font-semibold cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <Shield className="w-4 h-4" />
                            Blocked
                        </button>
                    )}

                    {/* View Profile Button */}
                    {onViewProfile && (
                        <button
                            onClick={onViewProfile}
                            className="px-4 py-2 bg-[#16124A] border border-[#2F6BFF]/30 hover:border-[#2F6BFF] text-white rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                        >
                            <Eye className="w-4 h-4" />
                        </button>
                    )}

                    {/* Block Button */}
                    {onBlock && relationship !== 'blocked' && (
                        <button
                            onClick={onBlock}
                            className="px-4 py-2 bg-[#16124A] border border-red-500/30 hover:border-red-500 text-red-400 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                            title="Block User"
                        >
                            <Shield className="w-4 h-4" />
                        </button>
                    )}
                </div>
            )}

            {/* Own Profile Actions */}
            {showActions && isOwnProfile && onViewProfile && (
                <button
                    onClick={onViewProfile}
                    className="w-full px-4 py-2 bg-[#2F6BFF]/20 border border-[#2F6BFF]/30 hover:border-[#2F6BFF] text-[#2F6BFF] rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                >
                    <Eye className="w-4 h-4" />
                    View Profile
                </button>
            )}
        </div>
    );
}


