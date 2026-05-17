// FriendSuggestionCard Component - Display friend suggestion with actions

import type { FriendSuggestion, TradingExperience } from '@/types/social';
import { TrendingUp, UserPlus, Users, X } from 'lucide-react';

interface FriendSuggestionCardProps {
    suggestion: FriendSuggestion;
    onAddFriend?: (userId: string) => void;
    onDismiss?: (userId: string) => void;
    loading?: boolean;
}

export default function FriendSuggestionCard({
    suggestion,
    onAddFriend,
    onDismiss,
    loading = false,
}: FriendSuggestionCardProps) {
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
        <div className="p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl bg-[#16124A]/50 border border-[#2F6BFF]/20 hover:border-[#2F6BFF] transition-all duration-300 group relative">
            {/* Dismiss Button */}
            {onDismiss && (
                <button
                    onClick={() => onDismiss(suggestion.userId)}
                    disabled={loading}
                    className="absolute top-4 right-4 p-2 hover:bg-red-500/20 rounded-lg transition-all disabled:opacity-50"
                    title="Dismiss suggestion"
                >
                    <X className="w-4 h-4 text-gray-400 hover:text-red-400" />
                </button>
            )}

            {/* Suggestion Header */}
            <div className="flex flex-col items-center mb-4">
                {/* Avatar */}
                <div className="relative mb-3">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-gradient-to-br from-[#2F6BFF]/20 to-[#FFA62B]/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                        {suggestion.avatarUrl ? (
                            <img
                                src={suggestion.avatarUrl}
                                alt={suggestion.displayName}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="text-3xl font-bold text-[#2F6BFF]">
                                {suggestion.displayName.charAt(0).toUpperCase()}
                            </span>
                        )}
                    </div>
                    {/* Suggestion Score Badge */}
                    {suggestion.suggestionScore >= 80 && (
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-[#2F6BFF] to-[#FFA62B] rounded-full flex items-center justify-center">
                            <TrendingUp className="w-3 h-3 text-white" />
                        </div>
                    )}
                </div>

                {/* User Info */}
                <h3 className="text-base sm:text-lg font-semibold text-white mb-1 text-center truncate w-full">
                    {suggestion.displayName}
                </h3>
                <p className="text-xs sm:text-sm text-gray-400 mb-2">@{suggestion.username}</p>
            </div>

            {/* Bio */}
            {suggestion.bio && (
                <p className="text-xs sm:text-sm text-gray-400 mb-4 line-clamp-2 text-center">{suggestion.bio}</p>
            )}

            {/* Trading Experience */}
            {suggestion.tradingExperience !== undefined && (
                <div className="flex justify-center mb-4">
                    <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getTradingExperienceBadge(
                            suggestion.tradingExperience
                        )}`}
                    >
                        {getTradingExperienceLabel(suggestion.tradingExperience)}
                    </span>
                </div>
            )}

            {/* Mutual Friends */}
            {suggestion.mutualFriendsCount > 0 && (
                <div className="mb-4">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <Users className="w-4 h-4 text-[#2F6BFF]" />
                        <span className="text-sm font-semibold text-[#2F6BFF]">
                            {suggestion.mutualFriendsCount} mutual friend
                            {suggestion.mutualFriendsCount !== 1 ? 's' : ''}
                        </span>
                    </div>
                    {/* Show mutual friends avatars if available */}
                    {suggestion.mutualFriends && suggestion.mutualFriends.length > 0 && (
                        <div className="flex justify-center -space-x-2">
                            {suggestion.mutualFriends.slice(0, 3).map((friend) => (
                                <div
                                    key={friend.userId}
                                    className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-[#2F6BFF]/20 to-[#FFA62B]/20 border-2 border-[#16124A] flex items-center justify-center"
                                    title={friend.displayName}
                                >
                                    {friend.avatarUrl ? (
                                        <img
                                            src={friend.avatarUrl}
                                            alt={friend.displayName}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-xs font-bold text-[#2F6BFF]">
                                            {friend.displayName.charAt(0).toUpperCase()}
                                        </span>
                                    )}
                                </div>
                            ))}
                            {suggestion.mutualFriendsCount > 3 && (
                                <div className="w-8 h-8 rounded-full bg-[#2F6BFF]/20 border-2 border-[#16124A] flex items-center justify-center">
                                    <span className="text-xs font-bold text-[#2F6BFF]">
                                        +{suggestion.mutualFriendsCount - 3}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Common Interests */}
            {suggestion.commonInterests && suggestion.commonInterests.length > 0 && (
                <div className="mb-4">
                    <div className="text-xs text-gray-400 mb-2 text-center">Common Interests</div>
                    <div className="flex flex-wrap justify-center gap-2">
                        {suggestion.commonInterests.slice(0, 3).map((interest) => (
                            <span
                                key={interest}
                                className="px-2 py-1 rounded-lg bg-[#2F6BFF]/10 text-[#2F6BFF] text-xs font-medium"
                            >
                                {interest}
                            </span>
                        ))}
                        {suggestion.commonInterests.length > 3 && (
                            <span className="px-2 py-1 rounded-lg bg-[#2F6BFF]/10 text-[#2F6BFF] text-xs font-medium">
                                +{suggestion.commonInterests.length - 3}
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Suggestion Reason */}
            {suggestion.suggestionReason && (
                <div className="mb-4 p-3 rounded-xl bg-[#0B0633]/50 border border-[#2F6BFF]/10">
                    <p className="text-xs text-gray-400 text-center">{suggestion.suggestionReason}</p>
                </div>
            )}

            {/* Add Friend Button */}
            {onAddFriend && (
                <button
                    onClick={() => onAddFriend(suggestion.userId)}
                    disabled={loading}
                    className="w-full px-4 py-2 bg-gradient-to-r from-[#2F6BFF] to-[#FFA62B] text-white rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    <UserPlus className="w-4 h-4" />
                    Add Friend
                </button>
            )}
        </div>
    );
}


