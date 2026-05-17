// FriendRequestCard Component - Display friend request with actions

import type { FriendRequest } from '@/types/social';
import { formatDistanceToNow } from 'date-fns';
import { Check, Clock, Eye, X } from 'lucide-react';

interface FriendRequestCardProps {
    request: FriendRequest;
    type: 'received' | 'sent';
    onAccept?: (requestId: string) => void;
    onDecline?: (requestId: string) => void;
    onCancel?: (requestId: string) => void;
    onViewProfile?: (userId: string) => void;
    loading?: boolean;
}

export default function FriendRequestCard({
    request,
    type,
    onAccept,
    onDecline,
    onCancel,
    onViewProfile,
    loading = false,
}: FriendRequestCardProps) {
    // Extract user info based on request type
    const userId = type === 'received' ? request.requesterId : request.recipientId;
    const username = type === 'received' ? request.requesterUsername : request.recipientUsername;
    const displayName = type === 'received' ? request.requesterDisplayName : request.recipientDisplayName;
    const avatarUrl = type === 'received' ? request.requesterAvatarUrl : request.recipientAvatarUrl;

    const formatTimeAgo = (dateString: string) => {
        try {
            return formatDistanceToNow(new Date(dateString), { addSuffix: true });
        } catch {
            return 'Recently';
        }
    };

    return (
        <div className="p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl bg-[#16124A]/50 border border-[#2F6BFF]/20 hover:border-[#2F6BFF] transition-all duration-300">
            {/* Request Header */}
            <div className="flex items-start gap-4 mb-4">
                {/* Avatar */}
                <div className="relative">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl overflow-hidden bg-gradient-to-br from-[#2F6BFF]/20 to-[#FFA62B]/20 flex items-center justify-center">
                        {avatarUrl ? (
                            <img
                                src={avatarUrl}
                                alt={displayName}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="text-xl font-bold text-[#2F6BFF]">
                                {displayName.charAt(0).toUpperCase()}
                            </span>
                        )}
                    </div>
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold text-white mb-1 truncate">
                        {displayName}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-400 mb-2">@{username}</p>

                    {/* Timestamp */}
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        {formatTimeAgo(request.createdAt)}
                    </div>
                </div>

                {/* View Profile Button */}
                {onViewProfile && (
                    <button
                        onClick={() => onViewProfile(userId)}
                        className="p-2 hover:bg-[#2F6BFF]/20 rounded-lg transition-all"
                        title="View Profile"
                    >
                        <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 hover:text-[#2F6BFF]" />
                    </button>
                )}
            </div>

            {/* Request Message */}
            {request.message && (
                <div className="mb-4 p-3 rounded-xl bg-[#0B0633]/50 border border-[#2F6BFF]/10">
                    <p className="text-xs sm:text-sm text-gray-300 italic">"{request.message}"</p>
                </div>
            )}

            {/* Mutual Friends Count */}
            {request.mutualFriendsCount > 0 && (
                <div className="mb-4">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[#2F6BFF]/20 text-[#2F6BFF] border border-[#2F6BFF]/30">
                        {request.mutualFriendsCount} mutual {request.mutualFriendsCount === 1 ? 'friend' : 'friends'}
                    </span>
                </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
                {type === 'received' && (
                    <>
                        {onAccept && (
                            <button
                                onClick={() => onAccept(request.id)}
                                disabled={loading}
                                className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <Check className="w-4 h-4" />
                                Accept
                            </button>
                        )}
                        {onDecline && (
                            <button
                                onClick={() => onDecline(request.id)}
                                disabled={loading}
                                className="flex-1 px-4 py-2 bg-red-500/20 border border-red-500/30 hover:border-red-500 text-red-400 rounded-xl text-sm font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <X className="w-4 h-4" />
                                Decline
                            </button>
                        )}
                    </>
                )}

                {type === 'sent' && onCancel && (
                    <button
                        onClick={() => onCancel(request.id)}
                        disabled={loading}
                        className="w-full px-4 py-2 bg-[#16124A] border border-[#2F6BFF]/30 hover:border-red-500 text-gray-300 hover:text-red-400 rounded-xl text-sm font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        <X className="w-4 h-4" />
                        Cancel Request
                    </button>
                )}
            </div>
        </div>
    );
}


