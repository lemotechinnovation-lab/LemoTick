// FriendCard Component - Display friend with quick actions (Facebook-style design)

import type { Friend, OnlineStatus } from '@/types/social';
import { formatDistanceToNow } from 'date-fns';
import { Check, MessageCircle, MoreHorizontal, UserMinus, Users } from 'lucide-react';
import { useState } from 'react';

interface FriendCardProps {
    friend: Friend;
    onMessage?: (friendId: string) => void;
    onViewProfile?: (friendId: string) => void;
    onUnfriend?: (friendId: string) => void;
    onAddToList?: (friendId: string) => void;
    layout?: 'grid' | 'list';
}

export default function FriendCard({
    friend,
    onMessage,
    onViewProfile,
    onUnfriend,
    onAddToList,
    layout = 'grid',
}: FriendCardProps) {
    const [showMenu, setShowMenu] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    // Sample images array - using local images and placeholder service
    const sampleImages = [
        '/src/images/user-36-05.jpg',
        '/src/images/user-36-06.jpg',
        '/src/images/user-36-07.jpg',
        '/src/images/user-36-08.jpg',
        '/src/images/user-36-09.jpg',
        'https://i.pravatar.cc/300?img=1',
        'https://i.pravatar.cc/300?img=2',
        'https://i.pravatar.cc/300?img=3',
        'https://i.pravatar.cc/300?img=5',
        'https://i.pravatar.cc/300?img=7',
        'https://i.pravatar.cc/300?img=8',
        'https://i.pravatar.cc/300?img=9',
        'https://i.pravatar.cc/300?img=11',
        'https://i.pravatar.cc/300?img=12',
        'https://i.pravatar.cc/300?img=13',
        'https://i.pravatar.cc/300?img=14',
        'https://i.pravatar.cc/300?img=15',
        'https://i.pravatar.cc/300?img=16',
        'https://i.pravatar.cc/300?img=17',
        'https://i.pravatar.cc/300?img=18',
    ];

    // Get a consistent sample image based on user ID
    const getSampleImage = () => {
        if (friend.avatarUrl) return friend.avatarUrl;

        // Use user ID to consistently pick the same image for the same user
        const hash = friend.userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const index = hash % sampleImages.length;
        return sampleImages[index];
    };

    const avatarUrl = getSampleImage();

    const getOnlineStatusText = (status: OnlineStatus) => {
        switch (status) {
            case 'online':
                return 'Online';
            case 'away':
                return 'Away';
            case 'offline':
            default:
                return friend.lastSeen
                    ? `${formatDistanceToNow(new Date(friend.lastSeen), { addSuffix: true })}`
                    : 'Offline';
        }
    };

    if (layout === 'list') {
        return (
            <div
                className="flex items-center gap-3 p-3 rounded-lg bg-[#16124A]/30 border border-[#2F6BFF]/10 hover:bg-[#16124A]/50 hover:border-[#2F6BFF]/30 transition-all duration-200"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Avatar */}
                <div
                    className="relative cursor-pointer shrink-0"
                    onClick={() => onViewProfile?.(friend.userId)}
                >
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-[#2F6BFF]/20 to-[#FFA62B]/20">
                        <img
                            src={avatarUrl}
                            alt={friend.displayName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.onerror = null;
                                target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(friend.displayName)}&background=2F6BFF&color=fff&size=128`;
                            }}
                        />
                    </div>
                    {friend.onlineStatus === 'online' && (
                        <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-[#0B0633]"></div>
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <h3
                        className="text-sm font-semibold text-white truncate cursor-pointer hover:underline"
                        onClick={() => onViewProfile?.(friend.userId)}
                    >
                        {friend.displayName}
                    </h3>
                    <p className="text-xs text-gray-400 truncate">
                        {friend.mutualFriendsCount > 0
                            ? `${friend.mutualFriendsCount} mutual friend${friend.mutualFriendsCount !== 1 ? 's' : ''}`
                            : getOnlineStatusText(friend.onlineStatus)
                        }
                    </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    {isHovered && onMessage && (
                        <button
                            onClick={() => onMessage(friend.userId)}
                            className="p-2 bg-[#2F6BFF]/20 hover:bg-[#2F6BFF]/30 text-[#2F6BFF] rounded-lg transition-all"
                            title="Message"
                        >
                            <MessageCircle className="w-4 h-4" />
                        </button>
                    )}

                    <div className="relative">
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="p-2 hover:bg-[#2F6BFF]/20 text-gray-400 hover:text-white rounded-lg transition-all"
                        >
                            <MoreHorizontal className="w-4 h-4" />
                        </button>

                        {showMenu && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setShowMenu(false)}
                                ></div>
                                <div className="absolute right-0 mt-1 w-48 bg-[#16124A] border border-[#2F6BFF]/30 rounded-lg shadow-xl z-20 py-1">
                                    {onAddToList && (
                                        <button
                                            onClick={() => {
                                                onAddToList(friend.userId);
                                                setShowMenu(false);
                                            }}
                                            className="w-full px-4 py-2 text-left text-sm text-white hover:bg-[#2F6BFF]/20 transition-all flex items-center gap-2"
                                        >
                                            <Users className="w-4 h-4" />
                                            Add to List
                                        </button>
                                    )}
                                    {onUnfriend && (
                                        <button
                                            onClick={() => {
                                                onUnfriend(friend.userId);
                                                setShowMenu(false);
                                            }}
                                            className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/20 transition-all flex items-center gap-2"
                                        >
                                            <UserMinus className="w-4 h-4" />
                                            Unfriend
                                        </button>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Grid layout - Facebook style
    return (
        <div
            className="bg-[#16124A]/30 border border-[#2F6BFF]/10 rounded-lg overflow-hidden hover:border-[#2F6BFF]/30 transition-all duration-200 group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Avatar Section */}
            <div
                className="relative aspect-square cursor-pointer overflow-hidden bg-gradient-to-br from-[#2F6BFF]/20 to-[#FFA62B]/20"
                onClick={() => onViewProfile?.(friend.userId)}
            >
                <img
                    src={avatarUrl}
                    alt={friend.displayName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(friend.displayName)}&background=2F6BFF&color=fff&size=256`;
                    }}
                />

                {/* Online indicator */}
                {friend.onlineStatus === 'online' && (
                    <div className="absolute bottom-2 right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-[#16124A]"></div>
                )}

                {/* More menu button */}
                <div className="absolute top-2 right-2">
                    <div className="relative">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowMenu(!showMenu);
                            }}
                            className="p-1.5 bg-[#0B0633]/80 hover:bg-[#0B0633] text-white rounded-full transition-all backdrop-blur-sm"
                        >
                            <MoreHorizontal className="w-4 h-4" />
                        </button>

                        {showMenu && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowMenu(false);
                                    }}
                                ></div>
                                <div className="absolute right-0 mt-1 w-48 bg-[#16124A] border border-[#2F6BFF]/30 rounded-lg shadow-xl z-20 py-1">
                                    {onAddToList && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onAddToList(friend.userId);
                                                setShowMenu(false);
                                            }}
                                            className="w-full px-4 py-2 text-left text-sm text-white hover:bg-[#2F6BFF]/20 transition-all flex items-center gap-2"
                                        >
                                            <Users className="w-4 h-4" />
                                            Add to List
                                        </button>
                                    )}
                                    {onUnfriend && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onUnfriend(friend.userId);
                                                setShowMenu(false);
                                            }}
                                            className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/20 transition-all flex items-center gap-2"
                                        >
                                            <UserMinus className="w-4 h-4" />
                                            Unfriend
                                        </button>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Info Section */}
            <div className="p-3">
                <h3
                    className="text-sm font-semibold text-white truncate cursor-pointer hover:underline mb-1"
                    onClick={() => onViewProfile?.(friend.userId)}
                >
                    {friend.displayName}
                </h3>
                <p className="text-xs text-gray-400 truncate mb-3">
                    {friend.mutualFriendsCount > 0
                        ? `${friend.mutualFriendsCount} mutual friend${friend.mutualFriendsCount !== 1 ? 's' : ''}`
                        : getOnlineStatusText(friend.onlineStatus)
                    }
                </p>

                {/* Action Button */}
                <button
                    onClick={() => onMessage?.(friend.userId)}
                    className="w-full py-2 px-3 bg-[#2F6BFF]/20 hover:bg-[#2F6BFF]/30 text-[#2F6BFF] rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2"
                >
                    <Check className="w-4 h-4" />
                    Friends
                </button>
            </div>
        </div>
    );
}


