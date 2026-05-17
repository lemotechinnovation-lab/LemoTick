// Enhanced Timeline Page - 2026 Modern Trading Social Platform
// Unified social experience with trading focus, compact layouts, real-time updates

import { PageContainer, PageSection } from '@/components/ui/PageLayoutEnhanced';
import {
    CreatePostInput,
    MarketSentiment,
    StoryItem,
    TradingLeaderboard,
    TradingPost,
    TrendingTopics
} from '@/components/ui/SocialComponentsEnhanced';
import { getCurrentUser, mockUsers } from '@/features/social/data/mockSocialData';
import {
    Activity,
    Bell,
    Bot,
    MessageCircle,
    Settings,
    Sparkles,
    TrendingUp,
    UserPlus,
    Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TimelinePageEnhanced() {
    const navigate = useNavigate();

    // Get current user from mock data
    const user = getCurrentUser();

    const stories = [
        { id: 'current-user', name: 'Your Story', avatarUrl: user.avatar, isAddStory: true },
        { id: '2', name: mockUsers['2'].name, avatarUrl: mockUsers['2'].avatar, hasStory: true },
        { id: '1', name: mockUsers['1'].name, avatarUrl: mockUsers['1'].avatar, hasStory: true, isLive: true },
        { id: '3', name: mockUsers['3'].name, avatarUrl: mockUsers['3'].avatar, hasStory: true },
        { id: '4', name: mockUsers['4'].name, avatarUrl: mockUsers['4'].avatar, hasStory: true },
        { id: '5', name: mockUsers['5'].name, avatarUrl: mockUsers['5'].avatar, hasStory: true },
        { id: '8', name: mockUsers['8'].name, avatarUrl: mockUsers['8'].avatar, hasStory: true },
        { id: '7', name: mockUsers['7'].name, avatarUrl: mockUsers['7'].avatar, hasStory: true },
    ];

    const leaderboardData = [
        { rank: 1, id: '6', name: mockUsers['6'].name, avatar: mockUsers['6'].avatar, profit: 15420, profitPercent: 24.5, trades: 156 },
        { rank: 2, id: '7', name: mockUsers['7'].name, avatar: mockUsers['7'].avatar, profit: 12890, profitPercent: 19.8, trades: 142 },
        { rank: 3, id: '2', name: mockUsers['2'].name, avatar: mockUsers['2'].avatar, profit: 10250, profitPercent: 16.2, trades: 128 },
        { rank: 4, id: '1', name: mockUsers['1'].name, avatar: mockUsers['1'].avatar, profit: 8940, profitPercent: 14.1, trades: 115 },
        { rank: 5, id: '3', name: mockUsers['3'].name, avatar: mockUsers['3'].avatar, profit: 7650, profitPercent: 12.3, trades: 98 },
    ];

    const trendingTopics = [
        { tag: 'BTC', posts: 1245, change: 15.2 },
        { tag: 'ETH', posts: 892, change: 8.7 },
        { tag: 'DayTrading', posts: 654, change: -3.4 },
        { tag: 'CryptoSignals', posts: 543, change: 12.1 },
        { tag: 'TradingBots', posts: 432, change: 6.8 },
    ];

    const posts = [
        {
            id: '1',
            author: {
                id: '1',
                name: mockUsers['1'].name,
                avatar: mockUsers['1'].avatar,
                verified: mockUsers['1'].verified,
                role: mockUsers['1'].role
            },
            timestamp: '5 mins ago',
            type: 'trade' as const,
            content: 'Just closed my biggest trade of the month! 🚀 The market analysis paid off perfectly. Remember: patience and strategy always win over emotions.',
            tradeData: {
                pair: 'BTC/USDT',
                action: 'sell' as const,
                profit: 2450.50,
                profitPercent: 12.8,
                entry: 42150,
                exit: 47520
            },
            stats: {
                likes: 245,
                comments: 42,
                shares: 18,
                views: 1240
            },
            isLiked: false,
            isBookmarked: true
        },
        {
            id: '2',
            author: {
                id: '5',
                name: mockUsers['5'].name,
                avatar: mockUsers['5'].avatar,
                verified: mockUsers['5'].verified,
                role: mockUsers['5'].role
            },
            timestamp: '15 mins ago',
            type: 'bot-performance' as const,
            content: '📊 Weekly Performance Update: Our AI-powered bot continues to outperform the market with consistent gains. Check out the stats below!',
            botData: {
                botName: 'Alpha Scalper Pro',
                performance: 18.5,
                trades: 342,
                winRate: 72
            },
            stats: {
                likes: 189,
                comments: 56,
                shares: 34,
                views: 890
            }
        },
        {
            id: '3',
            author: {
                id: '3',
                name: mockUsers['3'].name,
                avatar: mockUsers['3'].avatar,
                verified: mockUsers['3'].verified,
                role: mockUsers['3'].role
            },
            timestamp: '1 hour ago',
            type: 'market-signal' as const,
            content: '🔥 Strong bullish signal detected on ETH! Multiple indicators aligning for a potential breakout. Entry zone: $2,850-$2,900. Target: $3,200. Stop loss: $2,750.',
            signalData: {
                pair: 'ETH/USDT',
                direction: 'bullish' as const,
                confidence: 85,
                timeframe: '4H'
            },
            stats: {
                likes: 312,
                comments: 78,
                shares: 45,
                views: 1560
            },
            isLiked: true
        },
        {
            id: '4',
            author: {
                id: '4',
                name: mockUsers['4'].name,
                avatar: mockUsers['4'].avatar,
                verified: mockUsers['4'].verified
            },
            timestamp: '2 hours ago',
            type: 'text' as const,
            content: 'Quick reminder for all traders: Never invest more than you can afford to lose. Risk management is the key to long-term success! 💡\n\nWhat\'s your #1 trading rule? Drop it in the comments! 👇\n\n#TradingTips #RiskManagement #CryptoTrading',
            stats: {
                likes: 456,
                comments: 123,
                shares: 67,
                views: 2340
            }
        },
        {
            id: '5',
            author: {
                id: '5',
                name: mockUsers['5'].name,
                avatar: mockUsers['5'].avatar,
                verified: mockUsers['5'].verified,
                role: mockUsers['5'].role
            },
            timestamp: '3 hours ago',
            type: 'media' as const,
            content: 'New video tutorial: "5 Advanced Chart Patterns Every Trader Should Know" 📚\n\nLearn how to identify and trade these powerful patterns for consistent profits. Link in bio!',
            media: {
                type: 'video' as const,
                url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
                thumbnail: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800'
            },
            stats: {
                likes: 678,
                comments: 145,
                shares: 234,
                views: 4560
            },
            isBookmarked: true
        },
        {
            id: '6',
            author: {
                id: '2',
                name: mockUsers['2'].name,
                avatar: mockUsers['2'].avatar,
                verified: mockUsers['2'].verified
            },
            timestamp: '4 hours ago',
            type: 'trade' as const,
            content: 'Caught a nice scalp on SOL! Quick 5% gain in 20 minutes. Love these volatile markets! ⚡',
            tradeData: {
                pair: 'SOL/USDT',
                action: 'buy' as const,
                profit: 125.80,
                profitPercent: 5.2,
                entry: 98.50,
                exit: 103.60
            },
            stats: {
                likes: 156,
                comments: 28,
                shares: 12,
                views: 780
            }
        },
        {
            id: '7',
            author: {
                id: '8',
                name: mockUsers['8'].name,
                avatar: mockUsers['8'].avatar,
                verified: mockUsers['8'].verified,
                role: mockUsers['8'].role
            },
            timestamp: '5 hours ago',
            type: 'market-signal' as const,
            content: '⚠️ Bearish divergence forming on BTC 1H chart. Expecting a pullback to $45,500 support level. Good opportunity to take profits or wait for re-entry.',
            signalData: {
                pair: 'BTC/USDT',
                direction: 'bearish' as const,
                confidence: 78,
                timeframe: '1H'
            },
            stats: {
                likes: 234,
                comments: 67,
                shares: 29,
                views: 1120
            }
        }
    ];

    return (
        <PageContainer maxWidth="full" className="fade-in-up relative overflow-hidden">
            <PageSection className="relative z-10">
                {/* Enhanced Header Card with Quick Stats */}
                <div className="glass-card-elevated p-6 rounded-2xl smooth-hover mb-4 border border-brand-blue/30 shadow-2xl shadow-brand-blue/10 backdrop-blur-xl bg-gradient-to-r from-brand-blue/5 via-transparent to-accent-orange/5">
                    <div className="flex items-center justify-between gap-4">
                        {/* Left: Title & Live Indicator */}
                        <div className="flex items-center gap-4">
                            <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-brand-blue/40 to-accent-orange/40 flex items-center justify-center shadow-xl shadow-brand-blue/30 glow-hover border border-brand-blue/20 group">
                                <Activity className="w-6 h-6 text-brand-blue group-hover:scale-110 transition-transform" />
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-brand-blue/20 to-accent-orange/20 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse-slow"></div>
                            </div>
                            <div>
                                <h1 className="text-lg font-bold flex items-center gap-2">
                                    <span className="bg-gradient-to-r from-brand-blue via-accent-orange to-brand-blue bg-clip-text text-transparent animate-gradient-x">
                                        Social Trading Feed
                                    </span>
                                    <span className="flex items-center gap-1.5 px-2.5 py-1 bg-green-500/20 rounded-full border border-green-400/30 shadow-lg shadow-green-500/20 animate-pulse-glow">
                                        <span className="relative w-2 h-2">
                                            <span className="absolute inset-0 bg-green-400 rounded-full animate-ping"></span>
                                            <span className="relative block w-2 h-2 bg-green-400 rounded-full shadow-lg shadow-green-400/50"></span>
                                        </span>
                                        <span className="text-xs text-green-400 font-bold">Live</span>
                                    </span>
                                </h1>
                                <p className="text-xs text-gray-400 font-medium mt-0.5">Real-time trading community updates</p>
                            </div>
                        </div>

                        {/* Center: Quick Stats */}
                        <div className="hidden lg:flex items-center gap-8">
                            <div className="flex items-center gap-3 group cursor-pointer">
                                <div className="relative w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center shadow-xl shadow-green-500/20 glow-hover border border-green-400/30 overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <TrendingUp className="w-5 h-5 text-green-400 relative z-10 group-hover:scale-110 transition-transform" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-medium group-hover:text-green-400 transition-colors">Active Traders</p>
                                    <p className="text-base font-bold text-green-400 tabular-nums">2,847</p>
                                </div>
                            </div>
                            <div className="w-px h-10 bg-gradient-to-b from-transparent via-brand-blue/50 to-transparent"></div>
                            <div className="flex items-center gap-3 group cursor-pointer">
                                <div className="relative w-10 h-10 rounded-xl bg-brand-blue/20 flex items-center justify-center shadow-xl shadow-brand-blue/20 glow-hover border border-brand-blue/30 overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <Activity className="w-5 h-5 text-brand-blue relative z-10 group-hover:scale-110 transition-transform" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-medium group-hover:text-brand-blue transition-colors">Posts Today</p>
                                    <p className="text-base font-bold text-brand-blue tabular-nums">1,234</p>
                                </div>
                            </div>
                            <div className="w-px h-10 bg-gradient-to-b from-transparent via-brand-blue/50 to-transparent"></div>
                            <div className="flex items-center gap-3 group cursor-pointer">
                                <div className="relative w-10 h-10 rounded-xl bg-accent-orange/20 flex items-center justify-center shadow-xl shadow-accent-orange/20 glow-hover border border-accent-orange/30 overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-br from-accent-orange/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <Sparkles className="w-5 h-5 text-accent-orange relative z-10 group-hover:scale-110 group-hover:rotate-12 transition-all" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-medium group-hover:text-accent-orange transition-colors">Trending</p>
                                    <p className="text-base font-bold text-accent-orange">#BTC</p>
                                </div>
                            </div>
                        </div>

                        {/* Right: Action Buttons */}
                        <div className="flex items-center gap-2">
                            <button className="hidden md:flex items-center gap-2 btn-primary-enhanced ripple focus-enhanced text-xs font-bold px-4 py-2.5 shadow-lg shadow-brand-blue/30 group relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                                <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                                <span className="relative">Discover</span>
                            </button>
                            <button className="p-2.5 smooth-hover rounded-xl relative focus-enhanced bg-brand-blue/10 hover:bg-brand-blue/20 border border-brand-blue/30 shadow-lg shadow-brand-blue/10 group">
                                <MessageCircle className="w-5 h-5 text-brand-blue group-hover:scale-110 transition-transform" />
                                <span className="absolute -top-1 -right-1 px-1.5 min-w-5 h-5 bg-gradient-to-br from-brand-blue to-[#4A7FFF] rounded-full flex items-center justify-center ring-2 ring-card shadow-lg shadow-brand-blue/50 animate-bounce-subtle">
                                    <span className="text-xs font-bold text-white">3</span>
                                </span>
                            </button>
                            <button className="p-2.5 smooth-hover rounded-xl relative focus-enhanced bg-accent-orange/10 hover:bg-accent-orange/20 border border-accent-orange/30 shadow-lg shadow-accent-orange/10 group">
                                <UserPlus className="w-5 h-5 text-accent-orange group-hover:scale-110 transition-transform" />
                                <span className="absolute -top-1 -right-1 px-1.5 min-w-5 h-5 bg-gradient-to-br from-accent-orange to-[#FFB84D] rounded-full flex items-center justify-center ring-2 ring-card shadow-lg shadow-accent-orange/50 animate-bounce-subtle">
                                    <span className="text-xs font-bold text-white">5</span>
                                </span>
                            </button>
                            <button className="p-2.5 smooth-hover rounded-xl relative focus-enhanced bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 shadow-lg shadow-red-500/10 group">
                                <Bell className="w-5 h-5 text-red-400 group-hover:animate-wiggle" />
                                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-card shadow-lg shadow-red-500/50">
                                    <span className="absolute inset-0 bg-red-500 rounded-full animate-ping"></span>
                                </span>
                            </button>
                            <button className="p-2.5 smooth-hover rounded-xl focus-enhanced bg-gray-500/10 hover:bg-gray-500/20 border border-gray-500/30 group">
                                <Settings className="w-5 h-5 text-gray-400 group-hover:text-white group-hover:rotate-90 transition-all duration-300" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Grid Layout - 3 Columns */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
                    {/* Left Sidebar - Trending & Market Info */}
                    <div className="xl:col-span-3 space-y-4 stagger-item">
                        {/* Trending Topics */}
                        <TrendingTopics topics={trendingTopics} />

                        {/* Divider */}
                        <div className="divider-enhanced"></div>

                        {/* Market Sentiment */}
                        <MarketSentiment bullish={65} bearish={25} neutral={10} />

                        {/* Divider */}
                        <div className="divider-enhanced"></div>

                        {/* Active Bots */}
                        <div className="glass-card-elevated p-5 rounded-2xl smooth-hover border border-purple-500/20 shadow-xl shadow-purple-500/10 backdrop-blur-xl relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="flex items-center justify-between mb-5 relative z-10">
                                <h3 className="text-sm font-bold flex items-center gap-2 text-white">
                                    <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center shadow-lg border border-purple-500/30 group-hover:scale-110 transition-transform">
                                        <Bot className="w-4 h-4 text-purple-400 group-hover:animate-wiggle" />
                                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></div>
                                    </div>
                                    <span className="group-hover:text-purple-400 transition-colors">Active Bots</span>
                                </h3>
                                <button className="text-xs text-brand-blue hover:text-accent-orange transition-colors font-semibold group/btn">
                                    <span className="group-hover/btn:translate-x-1 inline-block transition-transform">Manage</span>
                                </button>
                            </div>
                            <div className="space-y-3 relative z-10">
                                {[
                                    { name: 'Alpha Scalper', status: 'Running', profit: '+12.5%', color: 'text-green-400', bgColor: 'bg-green-500/20', glowColor: 'shadow-green-500/30', borderColor: 'border-green-400/30' },
                                    { name: 'Grid Master', status: 'Running', profit: '+8.2%', color: 'text-green-400', bgColor: 'bg-green-500/20', glowColor: 'shadow-green-500/30', borderColor: 'border-green-400/30' },
                                    { name: 'DCA Bot', status: 'Paused', profit: '+5.1%', color: 'text-gray-400', bgColor: 'bg-gray-500/20', glowColor: 'shadow-gray-500/20', borderColor: 'border-gray-500/30' },
                                ].map((bot, idx) => (
                                    <div
                                        key={idx}
                                        className={`flex items-center justify-between p-3 rounded-xl ${bot.bgColor} shadow-xl ${bot.glowColor} smooth-hover border ${bot.borderColor} group/bot cursor-pointer animate-fade-in-up backdrop-blur-sm`}
                                        style={{ animationDelay: `${idx * 100}ms` }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                {bot.status === 'Running' && (
                                                    <>
                                                        <span className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-75"></span>
                                                        <span className="relative block w-2.5 h-2.5 bg-green-400 rounded-full shadow-lg shadow-green-400/50"></span>
                                                    </>
                                                )}
                                                {bot.status === 'Paused' && (
                                                    <span className="block w-2.5 h-2.5 bg-gray-400 rounded-full"></span>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white group-hover/bot:text-brand-blue transition-colors">{bot.name}</p>
                                                <p className={`text-xs font-semibold ${bot.status === 'Running' ? 'text-green-400' : 'text-gray-400'}`}>{bot.status}</p>
                                            </div>
                                        </div>
                                        <p className={`text-sm font-bold ${bot.color} tabular-nums group-hover/bot:scale-110 transition-transform`}>{bot.profit}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Center Feed - Main Content */}
                    <div className="xl:col-span-6 space-y-4 stagger-item">
                        {/* Stories - Horizontal Scroll */}
                        <div className="glass-card-elevated p-5 rounded-2xl smooth-hover border border-brand-blue/20 shadow-xl shadow-brand-blue/10 backdrop-blur-xl relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-r from-brand-blue/5 via-transparent to-accent-orange/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="flex items-center gap-3 overflow-x-auto scrollbar-enhanced pb-2 pt-1 relative z-10">
                                {stories.map((story, idx) => (
                                    <div
                                        key={story.id}
                                        className="animate-fade-in-up"
                                        style={{ animationDelay: `${idx * 50}ms` }}
                                    >
                                        <StoryItem
                                            name={story.name}
                                            avatar={story.avatarUrl}
                                            hasStory={story.hasStory}
                                            isAddStory={story.isAddStory}
                                            isLive={story.isLive}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Create Post */}
                        <CreatePostInput
                            userAvatar={user.avatar}
                            userName={user.name}
                        />

                        {/* Posts Feed */}
                        <div className="space-y-4">
                            {posts.map((post, idx) => (
                                <div
                                    key={post.id}
                                    className="animate-fade-in-up"
                                    style={{ animationDelay: `${idx * 100}ms` }}
                                >
                                    <TradingPost {...post} />
                                </div>
                            ))}

                            {/* Load More */}
                            <div className="text-center py-6">
                                <button className="btn-primary-enhanced ripple focus-enhanced px-8 py-3 text-sm font-semibold rounded-xl group relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                                    <span className="relative flex items-center gap-2">
                                        Load More Posts
                                        <Activity className="w-4 h-4 group-hover:animate-spin" />
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar - Top Traders & Suggestions */}
                    <div className="xl:col-span-3 space-y-4 stagger-item">
                        {/* Leaderboard - Compact */}
                        <TradingLeaderboard entries={leaderboardData} compact />

                        {/* Divider */}
                        <div className="divider-enhanced"></div>

                        {/* Suggested Traders */}
                        <div className="glass-card-elevated p-5 rounded-2xl smooth-hover border border-brand-blue/20 shadow-xl shadow-brand-blue/10 backdrop-blur-xl relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="flex items-center justify-between mb-5 relative z-10">
                                <h3 className="text-sm font-bold flex items-center gap-2 text-white">
                                    <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-brand-blue/20 to-accent-orange/20 flex items-center justify-center shadow-lg border border-brand-blue/30 group-hover:scale-110 transition-transform">
                                        <Users className="w-4 h-4 text-brand-blue group-hover:animate-pulse" />
                                        <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></div>
                                    </div>
                                    <span className="group-hover:text-brand-blue transition-colors">Suggested Traders</span>
                                </h3>
                                <button className="text-xs text-brand-blue hover:text-accent-orange transition-colors font-semibold group/btn">
                                    <span className="group-hover/btn:translate-x-1 inline-block transition-transform">See All</span>
                                </button>
                            </div>
                            <div className="space-y-3 relative z-10">
                                {[
                                    { id: '6', name: mockUsers['6'].name, avatar: mockUsers['6'].avatar, role: mockUsers['6'].role, followers: '12.5K' },
                                    { id: '7', name: mockUsers['7'].name, avatar: mockUsers['7'].avatar, role: 'Analyst', followers: '8.2K' },
                                    { id: '2', name: mockUsers['2'].name, avatar: mockUsers['2'].avatar, role: 'Educator', followers: '15.3K' },
                                ].map((trader, idx) => (
                                    <div key={idx} className="animate-fade-in-up" style={{ animationDelay: `${idx * 100}ms` }}>
                                        <div
                                            className="flex items-center gap-3 p-3 rounded-xl smooth-hover group/trader cursor-pointer bg-brand-blue/5 hover:bg-brand-blue/15 transition-all border border-brand-blue/10 hover:border-brand-blue/30 shadow-lg hover:shadow-xl hover:shadow-brand-blue/20 backdrop-blur-sm relative overflow-hidden"
                                            onClick={() => navigate(`/social/user/${trader.id}`)}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-brand-blue/10 to-transparent opacity-0 group-hover/trader:opacity-100 transition-opacity"></div>
                                            <div className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-brand-blue/30 group-hover/trader:ring-brand-blue/60 transition-all shadow-xl shadow-brand-blue/20 group-hover/trader:scale-110 transform duration-300">
                                                <img src={trader.avatar} alt={trader.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0 relative z-10">
                                                <p className="text-sm font-bold text-white truncate group-hover/trader:text-brand-blue transition-colors">{trader.name}</p>
                                                <p className="text-xs text-brand-blue font-semibold">{trader.role} · <span className="text-gray-400">{trader.followers}</span></p>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    // Handle follow
                                                }}
                                                className="btn-secondary-enhanced ripple focus-enhanced px-4 py-2 text-xs font-bold rounded-lg shadow-lg relative z-10 group-hover/trader:scale-105 transition-transform"
                                            >
                                                Follow
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Floating Action Button - Quick Post */}
                <div className="fixed bottom-8 right-8 z-50 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
                    <button className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-blue to-[#4A7FFF] shadow-2xl shadow-brand-blue/50 flex items-center justify-center group hover:scale-110 transition-all duration-300 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                        <Sparkles className="w-6 h-6 text-white relative z-10 group-hover:rotate-12 transition-transform" />
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent-orange rounded-full flex items-center justify-center ring-2 ring-white shadow-lg animate-bounce-subtle">
                            <span className="text-xs font-bold text-white">+</span>
                        </span>
                    </button>
                </div>
            </PageSection>
        </PageContainer>
    );
}


