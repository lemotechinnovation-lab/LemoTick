// Reusable Social Header Component - Modern Trading Platform
// Can be used across social pages with customizable actions

import {
    Activity,
    Bell,
    MessageCircle,
    Settings,
    Sparkles,
    TrendingUp,
    UserPlus
} from 'lucide-react';
import { ReactNode } from 'react';

interface QuickStat {
    label: string;
    value: string;
    icon: ReactNode;
    color?: string;
}

interface SocialHeaderProps {
    title: string;
    subtitle?: string;
    isLive?: boolean;
    quickStats?: QuickStat[];
    onDiscoverClick?: () => void;
    onMessagesClick?: () => void;
    onFriendRequestsClick?: () => void;
    onNotificationsClick?: () => void;
    onSettingsClick?: () => void;
    messageCount?: number;
    friendRequestCount?: number;
    hasNotification?: boolean;
    rightContent?: ReactNode;
    showDiscoverButton?: boolean;
}

export default function SocialHeader({
    title,
    subtitle = 'Real-time trading community updates',
    isLive = true,
    quickStats = [
        { label: 'Active Traders', value: '2,847', icon: <TrendingUp className="w-4 h-4 text-green-400" />, color: 'bg-green-500/10' },
        { label: 'Posts Today', value: '1,234', icon: <Activity className="w-4 h-4 text-primary" />, color: 'bg-primary/10' },
        { label: 'Trending', value: '#BTC', icon: <Sparkles className="w-4 h-4 text-accent" />, color: 'bg-accent/10' },
    ],
    onDiscoverClick,
    onMessagesClick,
    onFriendRequestsClick,
    onNotificationsClick,
    onSettingsClick,
    messageCount = 0,
    friendRequestCount = 0,
    hasNotification = false,
    rightContent,
    showDiscoverButton = true,
}: SocialHeaderProps) {
    return (
        <>
            <div className="p-5 rounded-2xl bg-card/30 hover:bg-card/40 backdrop-blur-md shadow-[0_0_20px_rgba(47,107,255,0.12)] transition-all">
                <div className="flex items-center justify-between gap-4">
                    {/* Left: Title & Live Indicator */}
                    <div className="flex items-center gap-3">
                        <div className="relative pb-2">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                                <Activity className="w-5 h-5 text-primary" />
                            </div>
                            {/* Decorative line below logo */}
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary rounded-full shadow-lg shadow-primary/50"></div>
                        </div>
                        <div>
                            <h1 className="text-base font-bold text-white flex items-center gap-2">
                                {title}
                                {isLive && (
                                    <span className="flex items-center gap-1 px-2 py-0.5 bg-green-500/20 rounded-full">
                                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                                        <span className="text-xs text-green-400 font-semibold">Live</span>
                                    </span>
                                )}
                            </h1>
                            <p className="text-xs text-gray-400 font-medium">{subtitle}</p>
                        </div>
                    </div>

                    {/* Center: Quick Stats */}
                    <div className="hidden lg:flex items-center gap-6">
                        {quickStats.map((stat, index) => (
                            <div key={index}>
                                {index > 0 && <div className="w-px h-8 bg-primary/20 mr-6"></div>}
                                <div className="flex items-center gap-2">
                                    <div className={`w-8 h-8 rounded-lg ${stat.color || 'bg-primary/10'} flex items-center justify-center`}>
                                        {stat.icon}
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 font-medium">{stat.label}</p>
                                        <p className="text-sm font-bold text-white">{stat.value}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Right: Action Buttons or Custom Content */}
                    {rightContent || (
                        <div className="flex items-center gap-2">
                            {showDiscoverButton && onDiscoverClick && (
                                <button
                                    onClick={onDiscoverClick}
                                    className="hidden md:flex items-center gap-2 px-3 py-2 bg-primary/20 hover:bg-primary text-primary hover:text-white rounded-lg transition-all text-xs font-semibold"
                                >
                                    <Sparkles className="w-4 h-4" />
                                    Discover
                                </button>
                            )}

                            {onMessagesClick && (
                                <button
                                    onClick={onMessagesClick}
                                    className="p-2 hover:bg-primary/10 rounded-lg transition-all relative"
                                >
                                    <MessageCircle className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
                                    {messageCount > 0 && (
                                        <span className="absolute top-1 right-1 px-1 min-w-4 h-4 bg-primary rounded-full flex items-center justify-center ring-2 ring-card">
                                            <span className="text-xs font-bold text-white">{messageCount}</span>
                                        </span>
                                    )}
                                </button>
                            )}

                            {onFriendRequestsClick && (
                                <button
                                    onClick={onFriendRequestsClick}
                                    className="p-2 hover:bg-primary/10 rounded-lg transition-all relative"
                                >
                                    <UserPlus className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
                                    {friendRequestCount > 0 && (
                                        <span className="absolute top-1 right-1 px-1 min-w-4 h-4 bg-accent rounded-full flex items-center justify-center ring-2 ring-card">
                                            <span className="text-xs font-bold text-white">{friendRequestCount}</span>
                                        </span>
                                    )}
                                </button>
                            )}

                            {onNotificationsClick && (
                                <button
                                    onClick={onNotificationsClick}
                                    className="p-2 hover:bg-primary/10 rounded-lg transition-all relative"
                                >
                                    <Bell className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
                                    {hasNotification && (
                                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-card"></span>
                                    )}
                                </button>
                            )}

                            {onSettingsClick && (
                                <button
                                    onClick={onSettingsClick}
                                    className="p-2 hover:bg-primary/10 rounded-lg transition-all"
                                >
                                    <Settings className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Horizontal Divider Line */}
            <div className="h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" style={{ marginBottom: 'calc(var(--spacing) * -1 + 1px)' }}></div>
        </>
    );
}
