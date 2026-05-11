// Enhanced Social Components - 2026 Modern Trading Social Platform Design
// Features: Trading-focused posts, compact layouts, real-time updates, professional styling

import {
    Activity,
    Award,
    Bookmark,
    Bot,
    Clock, Eye,
    Heart,
    Image as ImageIcon,
    MessageCircle,
    MoreHorizontal,
    Share2,
    Sparkles,
    TrendingDown,
    TrendingUp,
    Video,
    Zap
} from 'lucide-react';
import React, { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

// Post Types for Trading Platform
export type PostType = 'text' | 'trade' | 'bot-performance' | 'market-signal' | 'achievement' | 'media';

// Trading Post Card - Core component for social feed
interface TradingPostProps {
    author: {
        id?: string;
        name: string;
        avatar: string;
        verified?: boolean;
        role?: string;
    };
    timestamp: string;
    type: PostType;
    content: string;
    tradeData?: {
        pair: string;
        action: 'buy' | 'sell';
        profit?: number;
        profitPercent?: number;
        entry?: number;
        exit?: number;
    };
    botData?: {
        botName: string;
        performance: number;
        trades: number;
        winRate: number;
    };
    signalData?: {
        pair: string;
        direction: 'bullish' | 'bearish';
        confidence: number;
        timeframe: string;
    };
    media?: {
        type: 'image' | 'video';
        url: string;
        thumbnail?: string;
    };
    stats: {
        likes: number;
        comments: number;
        shares: number;
        views?: number;
    };
    isLiked?: boolean;
    isBookmarked?: boolean;
    compact?: boolean;
}

export function TradingPost({
    author,
    timestamp,
    type,
    content,
    tradeData,
    botData,
    signalData,
    media,
    stats,
    isLiked = false,
    isBookmarked = false,
    compact = false
}: TradingPostProps) {
    const navigate = useNavigate();
    const padding = compact ? 'p-3' : 'p-4';

    const handleAuthorClick = () => {
        if (author.id) {
            navigate(`/social/user/${author.id}`);
        }
    };

    return (
        <div className="glass-card-elevated rounded-2xl smooth-hover group border border-[#2F6BFF]/20 shadow-2xl shadow-[#2F6BFF]/10">
            {/* Post Header */}
            <div className={`${padding} flex items-center justify-between border-b border-[#2F6BFF]/10`}>
                <div
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={handleAuthorClick}
                >
                    <div className="relative">
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#2F6BFF]/30 to-[#FFA62B]/30 overflow-hidden ring-2 ring-[#2F6BFF]/30 group-hover:ring-[#2F6BFF]/50 transition-all shadow-lg shadow-[#2F6BFF]/20">
                            <img src={author.avatar} alt={author.name} className="w-full h-full object-cover" />
                        </div>
                        {author.verified && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-[#2F6BFF] rounded-full flex items-center justify-center ring-2 ring-card shadow-lg shadow-[#2F6BFF]/50">
                                <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                        )}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-white">{author.name}</h4>
                            {author.role && (
                                <span className="text-xs px-2.5 py-1 rounded-full bg-[#2F6BFF]/20 text-[#2F6BFF] font-bold border border-[#2F6BFF]/30">
                                    {author.role}
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-gray-400 flex items-center gap-1.5 font-semibold mt-0.5">
                            <Clock className="w-3 h-3" />
                            {timestamp}
                        </p>
                    </div>
                </div>
                <button className="p-2 hover:bg-[#2F6BFF]/10 rounded-lg transition-all">
                    <MoreHorizontal className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
                </button>
            </div>

            {/* Post Content */}
            <div className={padding}>
                {/* Enhanced Content with Paragraph Support */}
                <div className="text-sm text-white leading-relaxed mb-4 font-medium">
                    {content.split('\n').map((paragraph, idx) => {
                        // Handle empty lines as spacing
                        if (paragraph.trim() === '') {
                            return <div key={idx} className="h-3" />;
                        }

                        // Handle hashtags and mentions with styling
                        const formattedParagraph = paragraph.split(' ').map((word, wordIdx) => {
                            if (word.startsWith('#')) {
                                return (
                                    <span key={wordIdx} className="text-brand-blue hover:text-accent-orange transition-colors cursor-pointer font-bold">
                                        {word}{' '}
                                    </span>
                                );
                            } else if (word.startsWith('@')) {
                                return (
                                    <span key={wordIdx} className="text-accent-orange hover:text-brand-blue transition-colors cursor-pointer font-bold">
                                        {word}{' '}
                                    </span>
                                );
                            } else {
                                return word + ' ';
                            }
                        });

                        return (
                            <p key={idx} className="mb-3 last:mb-0">
                                {formattedParagraph}
                            </p>
                        );
                    })}
                </div>

                {/* Trade Data Card */}
                {type === 'trade' && tradeData && (
                    <div className="p-4 rounded-xl bg-gradient-to-br from-[#2F6BFF]/10 to-[#FFA62B]/10 backdrop-blur-sm mb-4 border border-[#2F6BFF]/20 shadow-lg shadow-[#2F6BFF]/10">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${tradeData.action === 'buy' ? 'bg-green-500/30 shadow-green-500/30 border border-green-400/30' : 'bg-red-500/30 shadow-red-500/30 border border-red-400/30'
                                    }`}>
                                    {tradeData.action === 'buy' ? (
                                        <TrendingUp className="w-5 h-5 text-green-400" />
                                    ) : (
                                        <TrendingDown className="w-5 h-5 text-red-400" />
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white">{tradeData.pair}</p>
                                    <p className="text-xs text-gray-400 uppercase font-bold">{tradeData.action}</p>
                                </div>
                            </div>
                            {tradeData.profit !== undefined && (
                                <div className="text-right">
                                    <p className={`text-base font-bold ${tradeData.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {tradeData.profit >= 0 ? '+' : ''}{tradeData.profit.toFixed(2)} USD
                                    </p>
                                    <p className={`text-sm font-bold ${tradeData.profitPercent && tradeData.profitPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {tradeData.profitPercent && tradeData.profitPercent >= 0 ? '+' : ''}{tradeData.profitPercent?.toFixed(2)}%
                                    </p>
                                </div>
                            )}
                        </div>
                        {(tradeData.entry || tradeData.exit) && (
                            <div className="flex items-center gap-4 text-xs pt-3 border-t border-[#2F6BFF]/10">
                                {tradeData.entry && (
                                    <div>
                                        <span className="text-gray-400 font-semibold">Entry: </span>
                                        <span className="text-white font-bold">${tradeData.entry.toLocaleString()}</span>
                                    </div>
                                )}
                                {tradeData.exit && (
                                    <div>
                                        <span className="text-gray-400 font-semibold">Exit: </span>
                                        <span className="text-white font-bold">${tradeData.exit.toLocaleString()}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Bot Performance Card */}
                {type === 'bot-performance' && botData && (
                    <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 backdrop-blur-sm mb-4 border border-purple-500/20 shadow-lg shadow-purple-500/10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-purple-500/30 flex items-center justify-center shadow-lg shadow-purple-500/30 border border-purple-400/30">
                                <Bot className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white">{botData.botName}</p>
                                <p className="text-xs text-purple-400 font-bold">Bot Performance</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="text-center p-3 rounded-xl bg-dark/30 border border-purple-500/10">
                                <p className={`text-xl font-bold ${botData.performance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {botData.performance >= 0 ? '+' : ''}{botData.performance}%
                                </p>
                                <p className="text-xs text-gray-400 font-bold mt-1">Return</p>
                            </div>
                            <div className="text-center p-3 rounded-xl bg-dark/30 border border-purple-500/10">
                                <p className="text-xl font-bold text-white">{botData.trades}</p>
                                <p className="text-xs text-gray-400 font-bold mt-1">Trades</p>
                            </div>
                            <div className="text-center p-3 rounded-xl bg-dark/30 border border-purple-500/10">
                                <p className="text-xl font-bold text-[#2F6BFF]">{botData.winRate}%</p>
                                <p className="text-xs text-gray-400 font-bold mt-1">Win Rate</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Market Signal Card */}
                {type === 'market-signal' && signalData && (
                    <div className={`p-4 rounded-xl backdrop-blur-sm mb-4 border shadow-lg ${signalData.direction === 'bullish'
                        ? 'bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20 shadow-green-500/10'
                        : 'bg-gradient-to-br from-red-500/10 to-rose-500/10 border-red-500/20 shadow-red-500/10'
                        }`}>
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${signalData.direction === 'bullish' ? 'bg-green-500/30 shadow-green-500/30 border border-green-400/30' : 'bg-red-500/30 shadow-red-500/30 border border-red-400/30'
                                    }`}>
                                    <Zap className={`w-5 h-5 ${signalData.direction === 'bullish' ? 'text-green-400' : 'text-red-400'}`} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white">{signalData.pair}</p>
                                    <p className="text-xs text-gray-400 uppercase font-bold">{signalData.direction} Signal</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-base font-bold text-white">{signalData.confidence}%</p>
                                <p className="text-xs text-gray-400 font-bold">Confidence</p>
                            </div>
                        </div>
                        <div className="text-sm text-white pt-3 border-t border-white/10">
                            <span className="text-gray-400 font-semibold">Timeframe: </span>
                            <span className="font-bold">{signalData.timeframe}</span>
                        </div>
                    </div>
                )}

                {/* Media */}
                {media && (
                    <div className="rounded-lg overflow-hidden mb-3 bg-dark/20 backdrop-blur-sm">
                        {media.type === 'image' ? (
                            <img src={media.url} alt="Post media" className="w-full max-h-80 object-cover" />
                        ) : (
                            <div className="relative aspect-video">
                                <img src={media.thumbnail || media.url} alt="Video thumbnail" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                    <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-all">
                                        <Video className="w-6 h-6 text-dark ml-1" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Post Actions */}
            <div className={`${padding} flex items-center justify-between border-t border-[#2F6BFF]/10 pt-4`}>
                <div className="flex items-center gap-1">
                    <button className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-bold text-sm ${isLiked ? 'bg-red-500/20 text-red-400 border border-red-400/30' : 'hover:bg-[#2F6BFF]/10 text-gray-400 hover:text-white border border-transparent hover:border-[#2F6BFF]/20'
                        }`}>
                        <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                        <span className="text-xs">{stats.likes}</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-[#2F6BFF]/10 text-gray-400 hover:text-white transition-all border border-transparent hover:border-[#2F6BFF]/20 font-bold text-sm">
                        <MessageCircle className="w-4 h-4" />
                        <span className="text-xs">{stats.comments}</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-[#2F6BFF]/10 text-gray-400 hover:text-white transition-all border border-transparent hover:border-[#2F6BFF]/20 font-bold text-sm">
                        <Share2 className="w-4 h-4" />
                        <span className="text-xs">{stats.shares}</span>
                    </button>
                </div>
                <div className="flex items-center gap-2">
                    {stats.views && (
                        <div className="flex items-center gap-2 px-3 text-gray-400">
                            <Eye className="w-4 h-4" />
                            <span className="text-xs font-bold">{stats.views.toLocaleString()}</span>
                        </div>
                    )}
                    <button className={`p-2 rounded-xl transition-all ${isBookmarked ? 'bg-[#FFA62B]/20 text-[#FFA62B] border border-[#FFA62B]/30' : 'hover:bg-[#2F6BFF]/10 text-gray-400 hover:text-white border border-transparent hover:border-[#2F6BFF]/20'
                        }`}>
                        <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                    </button>
                </div>
            </div>
        </div>
    );
}

// Compact Story/Status Component
interface StoryItemProps {
    name: string;
    avatar: string;
    hasStory?: boolean;
    isAddStory?: boolean;
    isLive?: boolean;
    onClick?: () => void;
}

export function StoryItem({ name, avatar, hasStory, isAddStory, isLive, onClick }: StoryItemProps) {
    return (
        <button
            onClick={onClick}
            className="flex-shrink-0 w-20 group pt-1 relative"
        >
            <div className="relative mb-1.5">
                {/* Story Ring with Gradient */}
                <div className={`relative w-16 h-16 rounded-full transition-all duration-300 ${hasStory
                    ? 'bg-gradient-to-br from-accent-orange via-brand-blue to-purple-500 p-[2.5px] group-hover:p-[3px] group-hover:shadow-xl group-hover:shadow-accent-orange/50'
                    : isAddStory
                        ? 'bg-gradient-to-br from-brand-blue/50 to-accent-orange/50 p-[2.5px] group-hover:p-[3px]'
                        : 'p-0'
                    } group-hover:scale-110 group-hover:rotate-3`}>

                    {/* Inner Circle */}
                    <div className={`w-full h-full rounded-full overflow-hidden bg-card ring-2 ring-card ${isAddStory ? 'ring-dashed ring-brand-blue/50' : ''
                        }`}>
                        {isAddStory ? (
                            <div className="w-full h-full bg-gradient-to-br from-brand-blue/20 via-accent-orange/10 to-purple-500/20 flex items-center justify-center relative overflow-hidden group-hover:from-brand-blue/30 group-hover:via-accent-orange/20 group-hover:to-purple-500/30 transition-all">
                                {/* Animated background */}
                                <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                {/* Plus Icon */}
                                <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-brand-blue to-[#4A7FFF] flex items-center justify-center shadow-lg shadow-brand-blue/50 group-hover:scale-110 group-hover:rotate-90 transition-all duration-300">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                                    </svg>
                                </div>
                            </div>
                        ) : (
                            <div className="relative w-full h-full">
                                <img
                                    src={avatar}
                                    alt={name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                                {/* Overlay on hover */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Live Badge */}
                {isLive && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 z-10">
                        <div className="relative px-2.5 py-1 bg-gradient-to-r from-red-500 to-red-600 rounded-full text-xs font-bold text-white shadow-lg shadow-red-500/50 flex items-center gap-1.5 animate-pulse-glow border border-red-400/50">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                            </span>
                            <span className="uppercase tracking-wider">Live</span>
                        </div>
                    </div>
                )}

                {/* Unread Indicator for Stories */}
                {hasStory && !isLive && (
                    <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-gradient-to-br from-accent-orange to-accent-orange/80 rounded-full flex items-center justify-center ring-2 ring-card shadow-lg shadow-accent-orange/50 group-hover:scale-125 transition-transform">
                        <Sparkles className="w-2.5 h-2.5 text-white" />
                    </div>
                )}
            </div>

            {/* Name Label */}
            <p className={`text-xs truncate text-center transition-all font-medium ${isAddStory
                ? 'text-brand-blue group-hover:text-accent-orange'
                : 'text-gray-300 group-hover:text-white'
                }`}>
                {name}
            </p>

            {/* Hover Glow Effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-brand-blue/20 to-accent-orange/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity -z-10"></div>
        </button>
    );
}

// Trading Leaderboard Widget
interface LeaderboardEntry {
    rank: number;
    id?: string;
    name: string;
    avatar: string;
    profit: number;
    profitPercent: number;
    trades: number;
}

interface TradingLeaderboardProps {
    entries: LeaderboardEntry[];
    title?: string;
    compact?: boolean;
}

export function TradingLeaderboard({ entries, title = 'Top Traders', compact = false }: TradingLeaderboardProps) {
    const navigate = useNavigate();

    return (
        <div className="glass-card-elevated p-5 rounded-2xl smooth-hover border border-accent-orange/20 shadow-xl shadow-accent-orange/10 backdrop-blur-xl relative overflow-hidden group">
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent-orange/5 via-transparent to-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            {/* Header */}
            <div className="flex items-center justify-between mb-5 relative z-10">
                <h3 className="text-sm font-bold flex items-center gap-2 text-white">
                    <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-accent-orange/20 to-yellow-500/20 flex items-center justify-center shadow-lg border border-accent-orange/30 group-hover:scale-110 transition-transform">
                        <Award className="w-4 h-4 text-accent-orange group-hover:animate-pulse" />
                        <div className="absolute inset-0 bg-gradient-to-br from-accent-orange/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></div>
                    </div>
                    <span className="group-hover:text-accent-orange transition-colors">{title}</span>
                </h3>
                <button className="text-xs text-brand-blue hover:text-accent-orange transition-colors font-semibold group/btn">
                    <span className="group-hover/btn:translate-x-1 inline-block transition-transform">View All</span>
                </button>
            </div>

            {/* Leaderboard Entries */}
            <div className="space-y-3 relative z-10">
                {entries.slice(0, compact ? 3 : 5).map((entry, idx) => (
                    <div
                        key={entry.rank}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent-orange/10 transition-all group/entry cursor-pointer border border-transparent hover:border-accent-orange/30 shadow-lg hover:shadow-xl hover:shadow-accent-orange/20 backdrop-blur-sm relative overflow-hidden animate-fade-in-up"
                        style={{ animationDelay: `${idx * 75}ms` }}
                        onClick={() => entry.id && navigate(`/social/user/${entry.id}`)}
                    >
                        {/* Hover gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-r from-accent-orange/10 to-transparent opacity-0 group-hover/entry:opacity-100 transition-opacity"></div>

                        {/* Rank Badge with Special Styling for Top 3 */}
                        <div className={`relative w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shadow-lg transition-all group-hover/entry:scale-110 z-10 ${entry.rank === 1
                            ? 'bg-gradient-to-br from-yellow-500/40 to-yellow-600/40 text-yellow-300 border-2 border-yellow-400/60 shadow-yellow-500/40 animate-pulse-slow'
                            : entry.rank === 2
                                ? 'bg-gradient-to-br from-gray-300/40 to-gray-400/40 text-gray-200 border-2 border-gray-300/60 shadow-gray-400/30'
                                : entry.rank === 3
                                    ? 'bg-gradient-to-br from-orange-600/40 to-orange-700/40 text-orange-300 border-2 border-orange-500/60 shadow-orange-600/30'
                                    : 'bg-gradient-to-br from-brand-blue/30 to-brand-blue/40 text-brand-blue border border-brand-blue/40'
                            }`}>
                            {entry.rank === 1 && (
                                <div className="absolute -top-1 -right-1 w-3 h-3">
                                    <Sparkles className="w-3 h-3 text-yellow-400 animate-pulse" />
                                </div>
                            )}
                            {entry.rank}
                        </div>

                        {/* Avatar */}
                        <div className="relative w-11 h-11 rounded-full overflow-hidden ring-2 ring-accent-orange/30 group-hover/entry:ring-accent-orange/60 transition-all shadow-xl shadow-accent-orange/20 group-hover/entry:scale-110 transform duration-300 z-10">
                            <img src={entry.avatar} alt={entry.name} className="w-full h-full object-cover" />
                            {entry.rank <= 3 && (
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                            )}
                        </div>

                        {/* Trader Info */}
                        <div className="flex-1 min-w-0 relative z-10">
                            <p className="text-sm font-bold text-white truncate group-hover/entry:text-accent-orange transition-colors">
                                {entry.name}
                            </p>
                            <p className="text-xs text-accent-orange font-semibold tabular-nums">
                                {entry.trades} trades
                            </p>
                        </div>

                        {/* Profit Display */}
                        <div className="text-right relative z-10">
                            <p className={`text-sm font-bold tabular-nums group-hover/entry:scale-110 transition-transform ${entry.profit >= 0 ? 'text-green-400' : 'text-red-400'
                                }`}>
                                {entry.profit >= 0 ? '+' : ''}{entry.profitPercent}%
                            </p>
                            <p className="text-xs text-gray-400 font-semibold">
                                ${entry.profit.toLocaleString()}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer Stats */}
            {!compact && (
                <div className="mt-5 pt-4 border-t border-white/10 relative z-10">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400 font-medium">Total Traders</span>
                        <span className="text-white font-bold tabular-nums">{entries.length.toLocaleString()}</span>
                    </div>
                </div>
            )}
        </div>
    );
}

// Market Sentiment Widget
interface MarketSentimentProps {
    bullish: number;
    bearish: number;
    neutral: number;
}

export function MarketSentiment({ bullish, bearish, neutral }: MarketSentimentProps) {
    const total = bullish + bearish + neutral;
    const bullishPercent = (bullish / total) * 100;
    const bearishPercent = (bearish / total) * 100;
    const neutralPercent = (neutral / total) * 100;

    return (
        <div className="glass-card-elevated p-5 rounded-2xl smooth-hover border border-green-500/20 shadow-xl shadow-green-500/10 backdrop-blur-xl relative overflow-hidden group">
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            {/* Header */}
            <div className="flex items-center justify-between mb-5 relative z-10">
                <h3 className="text-sm font-bold flex items-center gap-2 text-white">
                    <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-green-500/20 to-red-500/20 flex items-center justify-center shadow-lg border border-green-500/30 group-hover:scale-110 transition-transform">
                        <Activity className="w-4 h-4 text-green-400 group-hover:animate-pulse" />
                        <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></div>
                    </div>
                    <span className="group-hover:text-green-400 transition-colors">Market Sentiment</span>
                </h3>
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-500/10 rounded-full border border-green-400/30 shadow-lg">
                    <div className="relative w-2 h-2">
                        <span className="absolute inset-0 bg-green-400 rounded-full animate-ping"></span>
                        <span className="relative block w-2 h-2 bg-green-400 rounded-full shadow-lg shadow-green-400/50"></span>
                    </div>
                    <span className="text-xs text-green-400 font-bold">Live</span>
                </div>
            </div>

            {/* Sentiment Bars */}
            <div className="space-y-4 relative z-10">
                {/* Bullish */}
                <div className="group/bar">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-400 shadow-lg shadow-green-400/50 animate-pulse"></div>
                            <span className="text-sm text-white font-bold group-hover/bar:text-green-400 transition-colors">Bullish</span>
                        </div>
                        <span className="text-sm font-bold text-green-400 tabular-nums group-hover/bar:scale-110 transition-transform">{bullishPercent.toFixed(0)}%</span>
                    </div>
                    <div className="relative h-3 bg-dark/50 rounded-full overflow-hidden border border-green-500/30 shadow-inner group-hover/bar:border-green-500/50 transition-colors">
                        <div
                            className="h-full bg-gradient-to-r from-green-500 via-green-400 to-emerald-400 shadow-lg shadow-green-500/50 transition-all duration-1000 ease-out relative overflow-hidden group-hover/bar:shadow-green-500/70"
                            style={{ width: `${bullishPercent}%` }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                        </div>
                    </div>
                </div>

                {/* Bearish */}
                <div className="group/bar">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-400 shadow-lg shadow-red-400/50 animate-pulse"></div>
                            <span className="text-sm text-white font-bold group-hover/bar:text-red-400 transition-colors">Bearish</span>
                        </div>
                        <span className="text-sm font-bold text-red-400 tabular-nums group-hover/bar:scale-110 transition-transform">{bearishPercent.toFixed(0)}%</span>
                    </div>
                    <div className="relative h-3 bg-dark/50 rounded-full overflow-hidden border border-red-500/30 shadow-inner group-hover/bar:border-red-500/50 transition-colors">
                        <div
                            className="h-full bg-gradient-to-r from-red-500 via-red-400 to-rose-400 shadow-lg shadow-red-500/50 transition-all duration-1000 ease-out relative overflow-hidden group-hover/bar:shadow-red-500/70"
                            style={{ width: `${bearishPercent}%` }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                        </div>
                    </div>
                </div>

                {/* Neutral */}
                <div className="group/bar">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-gray-400 shadow-lg shadow-gray-400/50"></div>
                            <span className="text-sm text-white font-bold group-hover/bar:text-gray-300 transition-colors">Neutral</span>
                        </div>
                        <span className="text-sm font-bold text-gray-400 tabular-nums group-hover/bar:scale-110 transition-transform">{neutralPercent.toFixed(0)}%</span>
                    </div>
                    <div className="relative h-3 bg-dark/50 rounded-full overflow-hidden border border-gray-500/30 shadow-inner group-hover/bar:border-gray-500/50 transition-colors">
                        <div
                            className="h-full bg-gradient-to-r from-gray-500 via-gray-400 to-gray-300 shadow-lg shadow-gray-500/30 transition-all duration-1000 ease-out relative overflow-hidden group-hover/bar:shadow-gray-500/50"
                            style={{ width: `${neutralPercent}%` }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Summary Footer */}
            <div className="mt-5 pt-4 border-t border-white/10 relative z-10">
                <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400 font-medium">Total Traders</span>
                    <span className="text-white font-bold tabular-nums">{total.toLocaleString()}</span>
                </div>
            </div>
        </div>
    );
}

// Trending Topics Widget
interface TrendingTopic {
    tag: string;
    posts: number;
    change: number;
}

interface TrendingTopicsProps {
    topics: TrendingTopic[];
}

export function TrendingTopics({ topics }: TrendingTopicsProps) {
    return (
        <div className="glass-card-elevated p-5 rounded-2xl smooth-hover border border-brand-blue/20 shadow-xl shadow-brand-blue/10 backdrop-blur-xl relative overflow-hidden group">
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent-orange/5 via-transparent to-brand-blue/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            {/* Header */}
            <div className="flex items-center justify-between mb-5 relative z-10">
                <h3 className="text-sm font-bold flex items-center gap-2 text-white">
                    <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-accent-orange/20 to-brand-blue/20 flex items-center justify-center shadow-lg border border-accent-orange/30 group-hover:scale-110 transition-transform">
                        <TrendingUp className="w-4 h-4 text-accent-orange group-hover:animate-pulse" />
                        <div className="absolute inset-0 bg-gradient-to-br from-accent-orange/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></div>
                    </div>
                    <span className="group-hover:text-accent-orange transition-colors">Trending Topics</span>
                </h3>
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-accent-orange/10 rounded-full border border-accent-orange/30 shadow-lg">
                    <Sparkles className="w-3 h-3 text-accent-orange animate-pulse" />
                    <span className="text-xs text-accent-orange font-bold">Hot</span>
                </div>
            </div>

            {/* Topics List */}
            <div className="space-y-3 relative z-10">
                {topics.map((topic, idx) => (
                    <button
                        key={idx}
                        className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-brand-blue/10 transition-all group/topic text-left border border-transparent hover:border-brand-blue/30 shadow-lg hover:shadow-xl hover:shadow-brand-blue/20 backdrop-blur-sm relative overflow-hidden animate-fade-in-up"
                        style={{ animationDelay: `${idx * 75}ms` }}
                    >
                        {/* Hover gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-r from-brand-blue/10 to-transparent opacity-0 group-hover/topic:opacity-100 transition-opacity"></div>

                        {/* Rank Badge */}
                        <div className="relative flex items-center gap-3">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shadow-lg transition-all group-hover/topic:scale-110 ${idx === 0
                                ? 'bg-gradient-to-br from-yellow-500/30 to-yellow-600/30 text-yellow-400 border border-yellow-500/40 shadow-yellow-500/30'
                                : idx === 1
                                    ? 'bg-gradient-to-br from-gray-400/30 to-gray-500/30 text-gray-300 border border-gray-400/40 shadow-gray-400/20'
                                    : idx === 2
                                        ? 'bg-gradient-to-br from-orange-600/30 to-orange-700/30 text-orange-400 border border-orange-600/40 shadow-orange-600/20'
                                        : 'bg-gradient-to-br from-brand-blue/20 to-brand-blue/30 text-brand-blue border border-brand-blue/30'
                                }`}>
                                {idx + 1}
                            </div>

                            {/* Topic Info */}
                            <div className="flex-1 relative z-10">
                                <p className="text-sm font-bold text-brand-blue group-hover/topic:text-accent-orange transition-colors flex items-center gap-2">
                                    #{topic.tag}
                                    {idx === 0 && (
                                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-red-500/20 rounded text-xs text-red-400 border border-red-500/30 animate-pulse">
                                            <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                                            Live
                                        </span>
                                    )}
                                </p>
                                <p className="text-xs text-gray-400 font-semibold tabular-nums group-hover/topic:text-gray-300 transition-colors">
                                    {topic.posts.toLocaleString()} posts
                                </p>
                            </div>
                        </div>

                        {/* Change Badge */}
                        <div className={`relative z-10 flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-lg transition-all group-hover/topic:scale-110 shadow-lg ${topic.change > 0
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30 shadow-green-500/20'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30 shadow-red-500/20'
                            }`}>
                            {topic.change > 0 ? (
                                <TrendingUp className="w-3.5 h-3.5 group-hover/topic:animate-bounce" />
                            ) : (
                                <TrendingDown className="w-3.5 h-3.5 group-hover/topic:animate-bounce" />
                            )}
                            <span className="tabular-nums">{Math.abs(topic.change)}%</span>
                        </div>
                    </button>
                ))}
            </div>

            {/* Footer - See All */}
            <div className="mt-5 pt-4 border-t border-white/10 relative z-10">
                <button className="w-full text-center text-sm font-semibold text-brand-blue hover:text-accent-orange transition-colors group/btn flex items-center justify-center gap-2">
                    <span>View All Trending</span>
                    <TrendingUp className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    );
}

// Quick Stats Card
interface QuickStatsProps {
    stats: {
        label: string;
        value: string | number;
        change?: number;
        icon: ReactNode;
        color?: string;
    }[];
}

export function QuickStats({ stats }: QuickStatsProps) {
    return (
        <div className="grid grid-cols-2 gap-4">
            {stats.map((stat, idx) => (
                <div key={idx} className="glass-card-elevated p-4 rounded-xl smooth-hover border border-[#2F6BFF]/20 shadow-xl shadow-[#2F6BFF]/10">
                    <div className="flex items-center gap-2.5 mb-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${stat.color || 'bg-[#2F6BFF]/20 shadow-[#2F6BFF]/20'}`}>
                            {stat.icon}
                        </div>
                    </div>
                    <p className="text-xl font-bold text-white mb-1">{stat.value}</p>
                    <div className="flex items-center justify-between">
                        <p className="text-xs text-[#2F6BFF] font-bold">{stat.label}</p>
                        {stat.change !== undefined && (
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${stat.change >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                {stat.change >= 0 ? '+' : ''}{stat.change}%
                            </span>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}

// Create Post Input
interface CreatePostInputProps {
    userAvatar: string;
    userName: string;
    onPost?: (content: string, options?: { background?: string; media?: File[] }) => void;
}

export function CreatePostInput({ userAvatar, userName, onPost }: CreatePostInputProps) {
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [postContent, setPostContent] = React.useState('');
    const [selectedBackground, setSelectedBackground] = React.useState<string | null>(null);

    const backgroundColors = [
        { id: 'gradient-1', class: 'bg-gradient-to-br from-purple-500 to-pink-500' },
        { id: 'gradient-2', class: 'bg-gradient-to-br from-blue-500 to-cyan-500' },
        { id: 'gradient-3', class: 'bg-gradient-to-br from-green-500 to-emerald-500' },
        { id: 'gradient-4', class: 'bg-gradient-to-br from-orange-500 to-red-500' },
        { id: 'gradient-5', class: 'bg-gradient-to-br from-yellow-500 to-orange-500' },
        { id: 'gradient-6', class: 'bg-gradient-to-br from-indigo-500 to-purple-500' },
    ];

    const handlePost = () => {
        if (postContent.trim()) {
            onPost?.(postContent, { background: selectedBackground || undefined });
            setPostContent('');
            setSelectedBackground(null);
            setIsModalOpen(false);
        }
    };

    return (
        <>
            {/* Main Create Post Card */}
            <div className="glass-card-elevated p-4 rounded-2xl smooth-hover border border-brand-blue/20 shadow-xl shadow-brand-blue/10 backdrop-blur-xl relative overflow-hidden group">
                {/* Animated background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/5 via-transparent to-accent-orange/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                {/* Clickable Input Section */}
                <div className="flex items-center gap-3 mb-3 relative z-10">
                    <div className="relative w-11 h-11 rounded-full bg-gradient-to-br from-brand-blue/30 to-accent-orange/30 overflow-hidden ring-2 ring-brand-blue/30 shadow-xl shadow-brand-blue/20 flex-shrink-0">
                        <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex-1 px-5 py-3 bg-dark/40 backdrop-blur-sm rounded-full text-left text-sm text-gray-400 hover:bg-dark/60 transition-all font-medium border border-brand-blue/20 hover:border-brand-blue/40 shadow-inner"
                    >
                        What's on your mind, {userName}?
                    </button>
                </div>

                {/* Quick Action Buttons */}
                <div className="flex items-center justify-between pt-3 border-t border-brand-blue/10 relative z-10 gap-2">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-white hover:bg-red-500/20 rounded-xl transition-all border border-transparent hover:border-red-500/30 group/btn"
                    >
                        <Video className="w-5 h-5 text-red-400 group-hover/btn:scale-110 transition-transform" />
                        <span className="text-xs font-bold">Live video</span>
                    </button>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-white hover:bg-green-500/20 rounded-xl transition-all border border-transparent hover:border-green-500/30 group/btn"
                    >
                        <ImageIcon className="w-5 h-5 text-green-400 group-hover/btn:scale-110 transition-transform" />
                        <span className="text-xs font-bold">Photo/video</span>
                    </button>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-white hover:bg-yellow-500/20 rounded-xl transition-all border border-transparent hover:border-yellow-500/30 group/btn"
                    >
                        <span className="text-xl">😊</span>
                        <span className="text-xs font-bold">Feeling/activity</span>
                    </button>
                </div>
            </div>

            {/* Create Post Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
                    <div className="w-full max-w-lg bg-card rounded-2xl shadow-2xl border border-brand-blue/30 animate-scale-in">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-4 border-b border-brand-blue/20">
                            <h2 className="text-xl font-bold text-white">Create post</h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="w-9 h-9 rounded-full bg-dark/50 hover:bg-dark/70 flex items-center justify-center transition-all"
                            >
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* User Info & Privacy */}
                        <div className="p-4 border-b border-brand-blue/20">
                            <div className="flex items-center gap-3">
                                <div className="relative w-11 h-11 rounded-full bg-gradient-to-br from-brand-blue/30 to-accent-orange/30 overflow-hidden ring-2 ring-brand-blue/30">
                                    <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-white">{userName}</h3>
                                    <button className="flex items-center gap-1 px-2 py-1 bg-dark/50 rounded-lg text-xs font-semibold text-gray-300 hover:bg-dark/70 transition-all mt-1">
                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                                        </svg>
                                        Friends
                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Post Content Area */}
                        <div className="p-4 max-h-96 overflow-y-auto">
                            <textarea
                                value={postContent}
                                onChange={(e) => setPostContent(e.target.value)}
                                placeholder={`What's on your mind, ${userName}?`}
                                className="w-full min-h-[120px] bg-transparent text-white text-base placeholder-gray-500 focus:outline-none resize-none font-medium"
                                autoFocus
                            />

                            {/* Background Color Selector */}
                            {postContent.length > 0 && postContent.length < 100 && (
                                <div className="mt-4 flex items-center gap-2">
                                    <button
                                        onClick={() => setSelectedBackground(null)}
                                        className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center transition-all ${selectedBackground === null ? 'border-brand-blue' : 'border-gray-600 hover:border-gray-500'
                                            }`}
                                    >
                                        <span className="text-xl">Aa</span>
                                    </button>
                                    {backgroundColors.map((bg) => (
                                        <button
                                            key={bg.id}
                                            onClick={() => setSelectedBackground(bg.class)}
                                            className={`w-10 h-10 rounded-lg ${bg.class} border-2 transition-all ${selectedBackground === bg.class ? 'border-white scale-110' : 'border-transparent hover:scale-105'
                                                }`}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Preview with Background */}
                            {selectedBackground && postContent && (
                                <div className={`mt-4 p-6 rounded-xl ${selectedBackground} flex items-center justify-center min-h-[150px]`}>
                                    <p className="text-white text-2xl font-bold text-center">{postContent}</p>
                                </div>
                            )}
                        </div>

                        {/* Add to Post Section */}
                        <div className="px-4 py-3 border-t border-brand-blue/20">
                            <div className="flex items-center justify-between p-3 rounded-xl border border-brand-blue/20">
                                <span className="text-sm font-semibold text-white">Add to your post</span>
                                <div className="flex items-center gap-2">
                                    <button className="w-9 h-9 rounded-full hover:bg-dark/50 flex items-center justify-center transition-all group">
                                        <ImageIcon className="w-5 h-5 text-green-400 group-hover:scale-110 transition-transform" />
                                    </button>
                                    <button className="w-9 h-9 rounded-full hover:bg-dark/50 flex items-center justify-center transition-all group">
                                        <svg className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                                        </svg>
                                    </button>
                                    <button className="w-9 h-9 rounded-full hover:bg-dark/50 flex items-center justify-center transition-all group">
                                        <span className="text-xl group-hover:scale-110 transition-transform">😊</span>
                                    </button>
                                    <button className="w-9 h-9 rounded-full hover:bg-dark/50 flex items-center justify-center transition-all group">
                                        <svg className="w-5 h-5 text-red-400 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                    <button className="w-9 h-9 rounded-full hover:bg-dark/50 flex items-center justify-center transition-all group">
                                        <span className="text-xl group-hover:scale-110 transition-transform">GIF</span>
                                    </button>
                                    <button className="w-9 h-9 rounded-full hover:bg-dark/50 flex items-center justify-center transition-all group">
                                        <MoreHorizontal className="w-5 h-5 text-gray-400 group-hover:scale-110 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Post Button */}
                        <div className="p-4">
                            <button
                                onClick={handlePost}
                                disabled={!postContent.trim()}
                                className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${postContent.trim()
                                    ? 'bg-gradient-to-r from-brand-blue to-blue-500 hover:from-blue-500 hover:to-brand-blue text-white shadow-xl shadow-brand-blue/40 hover:shadow-2xl hover:shadow-brand-blue/50 hover:scale-[1.02]'
                                    : 'bg-dark/50 text-gray-500 cursor-not-allowed'
                                    }`}
                            >
                                Post
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
