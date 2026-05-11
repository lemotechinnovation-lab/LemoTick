// SocialProfilePageEnhanced - User's own profile with Timeline UI styling
// Modern glassmorphism design matching TimelinePageEnhanced - 2026 Enhanced

import { PageContainer, PageSection } from '@/components/ui/PageLayoutEnhanced';
import { TradingPost } from '@/components/ui/SocialComponentsEnhanced';
import { Activity, Award, Briefcase, Calendar, Camera, Edit, GraduationCap, Heart, MapPin, MessageCircle, Play, Plus, Settings, Sparkles, TrendingUp, UserPlus, Users as UsersIcon, Video } from 'lucide-react';
import { useState } from 'react';

type MainTab = 'posts' | 'about' | 'friends' | 'photos' | 'videos';

export default function SocialProfilePageEnhanced() {
    const [activeTab, setActiveTab] = useState<MainTab>('posts');

    // Mock user data - replace with actual user data from store
    const user = {
        name: 'John Trader',
        bio: 'Professional trader | Crypto enthusiast | Building wealth through smart investments',
        friendsCount: 542,
        followersCount: 1250,
        avatarUrl: '/src/images/user-avatar-32.png',
        coverUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&h=400&fit=crop',
    };

    const mainTabs = [
        { id: 'posts' as MainTab, label: 'Posts', count: 2 },
        { id: 'about' as MainTab, label: 'About' },
        { id: 'friends' as MainTab, label: 'Friends', count: user.friendsCount },
        { id: 'photos' as MainTab, label: 'Photos', count: 247 },
        { id: 'videos' as MainTab, label: 'Videos', count: 34 },
    ];

    // Sample posts using TradingPost component
    const posts = [
        {
            id: '1',
            author: {
                name: user.name,
                avatar: user.avatarUrl,
                verified: true,
                role: 'Pro Trader'
            },
            timestamp: '2 hours ago',
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
                name: user.name,
                avatar: user.avatarUrl,
                verified: true,
                role: 'Pro Trader'
            },
            timestamp: '1 day ago',
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
            id: '3',
            author: {
                name: user.name,
                avatar: user.avatarUrl,
                verified: true
            },
            timestamp: '2 days ago',
            type: 'text' as const,
            content: 'Quick reminder for all traders: Never invest more than you can afford to lose. Risk management is the key to long-term success! 💡\n\nWhat\'s your #1 trading rule? Drop it in the comments! 👇',
            stats: {
                likes: 456,
                comments: 123,
                shares: 67,
                views: 2340
            }
        },
        {
            id: '4',
            author: {
                name: user.name,
                avatar: user.avatarUrl,
                verified: true,
                role: 'Pro Trader'
            },
            timestamp: '3 days ago',
            type: 'bot-performance' as const,
            content: '📊 Weekly Performance Update: My AI-powered bot continues to outperform the market with consistent gains. Check out the stats below!',
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
        }
    ];

    return (
        <PageContainer maxWidth="full" className="fade-in-up relative overflow-hidden">
            {/* Animated Background Orbs */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-20 left-10 w-96 h-96 bg-brand-blue/20 rounded-full blur-3xl animate-float"></div>
                <div className="absolute top-40 right-20 w-80 h-80 bg-accent-orange/15 rounded-full blur-3xl animate-float-delayed"></div>
                <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-purple-500/15 rounded-full blur-3xl animate-float-slow"></div>
                <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-green-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
            </div>

            {/* Cover Photo */}
            <div className="relative w-full h-64 sm:h-80 lg:h-96 bg-gradient-to-br from-brand-blue/20 to-accent-orange/20 z-10">
                {user.coverUrl ? (
                    <img
                        src={user.coverUrl}
                        alt="Cover"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center text-gray-400">
                            <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Add Cover Photo</p>
                        </div>
                    </div>
                )}

                {/* Edit Cover Button */}
                <button className="absolute bottom-4 right-4 btn-secondary-enhanced ripple focus-enhanced px-4 py-2.5 text-sm font-bold shadow-lg shadow-brand-blue/20 group relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    <Camera className="w-4 h-4 inline-block mr-2 group-hover:scale-110 transition-transform" />
                    <span className="relative">Edit cover</span>
                </button>
            </div>

            {/* Profile Info Section */}
            <PageSection className="relative z-10">
                <div className="relative -mt-20 sm:-mt-24">
                    {/* Profile Header Card */}
                    <div className="glass-card-elevated p-6 rounded-2xl smooth-hover mb-4 border border-brand-blue/30 shadow-2xl shadow-brand-blue/10 backdrop-blur-xl bg-gradient-to-r from-brand-blue/5 via-transparent to-accent-orange/5">
                        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4">
                            {/* Profile Picture */}
                            <div className="relative -mt-16 sm:-mt-20">
                                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-card bg-gradient-to-br from-brand-blue/30 to-accent-orange/30 overflow-hidden ring-4 ring-brand-blue/20 shadow-2xl shadow-brand-blue/30 group-hover:ring-brand-blue/40 transition-all">
                                    <img
                                        src={user.avatarUrl}
                                        alt={user.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <button className="absolute bottom-2 right-2 w-10 h-10 bg-gradient-to-br from-brand-blue to-[#4A7FFF] hover:from-accent-orange hover:to-[#FFB84D] rounded-full flex items-center justify-center transition-all shadow-xl shadow-brand-blue/50 group">
                                    <Camera className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                                </button>
                            </div>

                            {/* Name and Info */}
                            <div className="flex-1 text-center sm:text-left">
                                <h1 className="text-2xl sm:text-3xl font-bold mb-1 flex items-center justify-center sm:justify-start gap-2">
                                    <span className="bg-gradient-to-r from-brand-blue via-accent-orange to-brand-blue bg-clip-text text-transparent">
                                        {user.name}
                                    </span>
                                    <span className="inline-flex items-center justify-center w-6 h-6 bg-brand-blue/20 rounded-full border border-brand-blue/40 shadow-lg shadow-brand-blue/30">
                                        <Award className="w-3.5 h-3.5 text-brand-blue" />
                                    </span>
                                </h1>
                                <div className="flex items-center justify-center sm:justify-start gap-4 mb-2">
                                    <div className="flex items-center gap-1.5 text-sm">
                                        <UsersIcon className="w-4 h-4 text-brand-blue" />
                                        <span className="font-bold text-brand-blue">{user.friendsCount}</span>
                                        <span className="text-gray-400">friends</span>
                                    </div>
                                    <div className="w-1 h-1 rounded-full bg-gray-600"></div>
                                    <div className="flex items-center gap-1.5 text-sm">
                                        <TrendingUp className="w-4 h-4 text-accent-orange" />
                                        <span className="font-bold text-accent-orange">{user.followersCount}</span>
                                        <span className="text-gray-400">followers</span>
                                    </div>
                                </div>
                                {user.bio && (
                                    <p className="text-sm text-gray-300 max-w-2xl">
                                        {user.bio}
                                    </p>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2">
                                <button className="btn-primary-enhanced ripple focus-enhanced px-4 py-2.5 text-sm font-bold shadow-lg shadow-brand-blue/30 group relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                                    <Plus className="w-4 h-4 inline-block mr-2 group-hover:rotate-90 transition-transform" />
                                    <span className="relative">Add Story</span>
                                </button>
                                <button className="btn-secondary-enhanced ripple focus-enhanced px-4 py-2.5 text-sm font-bold shadow-lg group relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                                    <Edit className="w-4 h-4 inline-block mr-2 group-hover:scale-110 transition-transform" />
                                    <span className="relative">Edit Profile</span>
                                </button>
                                <button className="p-2.5 smooth-hover rounded-xl focus-enhanced bg-gray-500/10 hover:bg-gray-500/20 border border-gray-500/30 shadow-lg group">
                                    <Settings className="w-5 h-5 text-gray-400 group-hover:text-white group-hover:rotate-90 transition-all duration-300" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Main Navigation Tabs */}
                    <div className="glass-card-elevated p-4 rounded-2xl smooth-hover mb-4 border border-brand-blue/20 shadow-xl shadow-brand-blue/10 backdrop-blur-xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-brand-blue/5 via-transparent to-accent-orange/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="flex items-center gap-6 overflow-x-auto scrollbar-enhanced relative z-10">
                            {mainTabs.map((tab) => {
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`pb-3 px-1 text-sm font-bold whitespace-nowrap transition-all duration-200 border-b-2 flex items-center gap-2 smooth-hover ${isActive
                                            ? 'text-brand-blue border-brand-blue shadow-lg shadow-brand-blue/20'
                                            : 'text-gray-400 border-transparent hover:text-white hover:border-brand-blue/50'
                                            }`}
                                    >
                                        {tab.label}
                                        {tab.count !== undefined && (
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${isActive ? 'bg-brand-blue/20 text-brand-blue' : 'bg-gray-500/20 text-gray-400'}`}>
                                                {tab.count}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
                    {activeTab === 'posts' && (
                        <>
                            {/* Left Sidebar - Intro, Friends, Recent Activity, Trading Stats */}
                            <div className="xl:col-span-4 space-y-3 stagger-item">
                                {/* Intro Card - Enhanced with Timeline Style */}
                                <div className="glass-card-elevated p-4 rounded-2xl smooth-hover border border-brand-blue/20 shadow-xl shadow-brand-blue/10 backdrop-blur-xl relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                    <div className="flex items-center justify-between mb-4 relative z-10">
                                        <h3 className="text-sm font-bold flex items-center gap-2 text-white">
                                            <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-brand-blue/20 to-accent-orange/20 flex items-center justify-center shadow-lg border border-brand-blue/30 group-hover:scale-110 transition-transform">
                                                <UsersIcon className="w-4 h-4 text-brand-blue group-hover:animate-pulse" />
                                                <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></div>
                                            </div>
                                            <span className="group-hover:text-brand-blue transition-colors">Intro</span>
                                        </h3>
                                        <button className="text-xs text-brand-blue hover:text-accent-orange transition-colors font-semibold group/btn">
                                            <span className="group-hover/btn:translate-x-1 inline-block transition-transform">Edit</span>
                                        </button>
                                    </div>

                                    {/* Bio */}
                                    <div className="mb-4 text-center relative z-10">
                                        <p className="text-sm text-gray-300 mb-3 leading-relaxed">
                                            💪 Helping traders achieve financial freedom through smart strategies
                                        </p>
                                    </div>

                                    {/* Info Items - Enhanced */}
                                    <div className="space-y-2 mb-3 relative z-10">
                                        {[
                                            { icon: '💼', text: 'Professional Trader at', highlight: 'LemoTick', color: 'brand-blue' },
                                            { icon: '🎓', text: 'Studied at', highlight: 'Shippensburg University', color: 'accent-orange' },
                                            { icon: <MapPin className="w-4 h-4" />, text: 'Lives in', highlight: 'Boca Raton, Florida', color: 'green' },
                                            { icon: '👥', text: 'Followed by', highlight: `${user.followersCount} people`, color: 'purple' },
                                        ].map((item, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-center gap-3 p-3 rounded-xl smooth-hover cursor-pointer bg-brand-blue/5 hover:bg-brand-blue/15 transition-all border border-brand-blue/10 hover:border-brand-blue/30 shadow-lg hover:shadow-xl hover:shadow-brand-blue/20 backdrop-blur-sm relative overflow-hidden animate-fade-in-up"
                                                style={{ animationDelay: `${idx * 50}ms` }}
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-r from-brand-blue/10 to-transparent opacity-0 hover:opacity-100 transition-opacity"></div>
                                                <span className={`text-base relative z-10 ${typeof item.icon === 'string' ? '' : `text-${item.color}-400`}`}>
                                                    {item.icon}
                                                </span>
                                                <span className="text-sm text-gray-300 relative z-10">
                                                    {item.text} <span className={`font-bold ${item.color === 'brand-blue'
                                                        ? 'text-brand-blue'
                                                        : item.color === 'accent-orange'
                                                            ? 'text-accent-orange'
                                                            : item.color === 'green'
                                                                ? 'text-green-400'
                                                                : 'text-purple-400'
                                                        }`}>{item.highlight}</span>
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Edit Details Button */}
                                    <button className="w-full btn-secondary-enhanced ripple focus-enhanced px-4 py-2.5 text-sm font-bold shadow-lg relative z-10">
                                        Edit details
                                    </button>
                                </div>

                                {/* Divider */}
                                <div className="divider-enhanced"></div>

                                {/* Friends Preview - Enhanced with Timeline Style */}
                                <div className="glass-card-elevated p-4 rounded-2xl smooth-hover border border-brand-blue/20 shadow-xl shadow-brand-blue/10 backdrop-blur-xl relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                    <div className="flex items-center justify-between mb-4 relative z-10">
                                        <h3 className="text-sm font-bold flex items-center gap-2 text-white">
                                            <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-brand-blue/20 to-accent-orange/20 flex items-center justify-center shadow-lg border border-brand-blue/30 group-hover:scale-110 transition-transform">
                                                <UsersIcon className="w-4 h-4 text-brand-blue group-hover:animate-pulse" />
                                                <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></div>
                                            </div>
                                            <span className="group-hover:text-brand-blue transition-colors">Friends</span>
                                        </h3>
                                        <button className="text-xs text-brand-blue hover:text-accent-orange transition-colors font-semibold group/btn">
                                            <span className="group-hover/btn:translate-x-1 inline-block transition-transform">See All</span>
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-400 mb-3 relative z-10 font-semibold">{user.friendsCount} friends</p>
                                    <div className="grid grid-cols-3 gap-2 relative z-10">
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                                            <div
                                                key={i}
                                                className="aspect-square rounded-xl overflow-hidden ring-2 ring-brand-blue/20 hover:ring-brand-blue/60 transition-all smooth-hover shadow-lg hover:shadow-xl hover:shadow-brand-blue/20 group/img cursor-pointer animate-fade-in-up backdrop-blur-sm relative"
                                                style={{ animationDelay: `${i * 30}ms` }}
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/10 to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity z-10"></div>
                                                <img
                                                    src={`https://i.pravatar.cc/150?img=${i}`}
                                                    alt={`Friend ${i}`}
                                                    className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-300"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="divider-enhanced"></div>

                                {/* Recent Activity - Enhanced with Timeline Style */}
                                <div className="glass-card-elevated p-4 rounded-2xl smooth-hover border border-purple-500/20 shadow-xl shadow-purple-500/10 backdrop-blur-xl relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                    <div className="flex items-center justify-between mb-4 relative z-10">
                                        <h3 className="text-sm font-bold flex items-center gap-2 text-white">
                                            <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center shadow-lg border border-purple-500/30 group-hover:scale-110 transition-transform">
                                                <Activity className="w-4 h-4 text-purple-400 group-hover:animate-pulse" />
                                                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></div>
                                            </div>
                                            <span className="group-hover:text-purple-400 transition-colors">Recent Activity</span>
                                        </h3>
                                        <button className="text-xs text-brand-blue hover:text-accent-orange transition-colors font-semibold group/btn">
                                            <span className="group-hover/btn:translate-x-1 inline-block transition-transform">View All</span>
                                        </button>
                                    </div>
                                    <div className="space-y-3 relative z-10">
                                        {[
                                            { icon: '📊', text: 'Closed a trade on', highlight: 'BTC/USDT', subtext: '+$2,450 profit', color: 'green', bgColor: 'bg-green-500/10', borderColor: 'border-green-400/30', glowColor: 'shadow-green-500/20' },
                                            { icon: '🎥', text: 'Posted a new video', highlight: 'Trading Strategy', subtext: '2 hours ago', color: 'purple', bgColor: 'bg-purple-500/10', borderColor: 'border-purple-400/30', glowColor: 'shadow-purple-500/20' },
                                            { icon: '📸', text: 'Added 5 photos to', highlight: 'Trading Setups', subtext: '5 hours ago', color: 'blue', bgColor: 'bg-brand-blue/10', borderColor: 'border-brand-blue/30', glowColor: 'shadow-brand-blue/20' },
                                            { icon: '👥', text: 'Became friends with', highlight: 'Sarah Chen', subtext: '1 day ago', color: 'orange', bgColor: 'bg-accent-orange/10', borderColor: 'border-accent-orange/30', glowColor: 'shadow-accent-orange/20' },
                                        ].map((activity, idx) => (
                                            <div
                                                key={idx}
                                                className={`flex items-start gap-3 p-3 rounded-xl ${activity.bgColor} shadow-xl ${activity.glowColor} smooth-hover border ${activity.borderColor} group/activity cursor-pointer animate-fade-in-up backdrop-blur-sm relative overflow-hidden`}
                                                style={{ animationDelay: `${idx * 100}ms` }}
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover/activity:opacity-100 transition-opacity"></div>
                                                <span className="text-xl relative z-10">{activity.icon}</span>
                                                <div className="flex-1 relative z-10">
                                                    <p className="text-sm text-gray-300">
                                                        {activity.text} <span className={`font-bold ${activity.color === 'green'
                                                            ? 'text-green-400'
                                                            : activity.color === 'purple'
                                                                ? 'text-purple-400'
                                                                : activity.color === 'blue'
                                                                    ? 'text-brand-blue'
                                                                    : 'text-accent-orange'
                                                            }`}>{activity.highlight}</span>
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-0.5">{activity.subtext}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="divider-enhanced"></div>

                                {/* Trading Stats - Enhanced with Timeline Style */}
                                <div className="glass-card-elevated p-4 rounded-2xl smooth-hover border border-green-400/30 shadow-xl shadow-green-500/10 backdrop-blur-xl relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                    <div className="flex items-center justify-between mb-4 relative z-10">
                                        <h3 className="text-sm font-bold flex items-center gap-2 text-white">
                                            <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center shadow-lg border border-green-400/30 group-hover:scale-110 transition-transform">
                                                <TrendingUp className="w-4 h-4 text-green-400 group-hover:animate-pulse" />
                                                <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></div>
                                            </div>
                                            <span className="group-hover:text-green-400 transition-colors">Trading Stats</span>
                                        </h3>
                                        <button className="text-xs text-brand-blue hover:text-accent-orange transition-colors font-semibold group/btn">
                                            <span className="group-hover/btn:translate-x-1 inline-block transition-transform">View All</span>
                                        </button>
                                    </div>
                                    <div className="space-y-3 relative z-10">
                                        {[
                                            { label: 'Total Profit', value: '$45,230', subValue: '+24.5% ROI', icon: '💰', color: 'green', bgColor: 'bg-green-500/10', borderColor: 'border-green-400/30', glowColor: 'shadow-green-500/20' },
                                            { label: 'Win Rate', value: '68%', subValue: 'Above average', icon: '🎯', color: 'blue', bgColor: 'bg-brand-blue/10', borderColor: 'border-brand-blue/30', glowColor: 'shadow-brand-blue/20' },
                                            { label: 'Active Bots', value: '3', subValue: 'All running', icon: '🚀', color: 'purple', bgColor: 'bg-purple-500/10', borderColor: 'border-purple-400/30', glowColor: 'shadow-purple-500/20' },
                                        ].map((stat, idx) => (
                                            <div
                                                key={idx}
                                                className={`flex items-center justify-between p-3 rounded-xl ${stat.bgColor} shadow-xl ${stat.glowColor} smooth-hover border ${stat.borderColor} group/stat cursor-pointer animate-fade-in-up backdrop-blur-sm`}
                                                style={{ animationDelay: `${idx * 100}ms` }}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-2xl">{stat.icon}</span>
                                                    <div>
                                                        <p className="text-xs text-gray-400">{stat.label}</p>
                                                        <p className={`text-sm font-bold ${stat.color === 'green'
                                                            ? 'text-green-400'
                                                            : stat.color === 'blue'
                                                                ? 'text-brand-blue'
                                                                : 'text-purple-400'
                                                            } group-hover/stat:scale-110 transition-transform inline-block`}>
                                                            {stat.value}
                                                        </p>
                                                    </div>
                                                </div>
                                                <p className={`text-xs ${stat.color === 'green'
                                                    ? 'text-green-400'
                                                    : stat.color === 'blue'
                                                        ? 'text-brand-blue'
                                                        : 'text-purple-400'
                                                    }`}>
                                                    {stat.subValue}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Right Side - Posts Feed */}
                            <div className="xl:col-span-8 space-y-3 stagger-item">
                                {/* Create Post Card */}
                                <div className="glass-card-elevated p-4 rounded-2xl smooth-hover border border-brand-blue/20 shadow-xl shadow-brand-blue/10 backdrop-blur-xl relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-gradient-to-r from-brand-blue/5 via-transparent to-accent-orange/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <div className="flex items-center gap-3 mb-4 relative z-10">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-blue/30 to-accent-orange/30 overflow-hidden ring-2 ring-brand-blue/30 shadow-lg shadow-brand-blue/20">
                                            <img
                                                src={user.avatarUrl}
                                                alt={user.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Share your trading insights..."
                                            className="flex-1 px-4 py-2.5 bg-dark/40 backdrop-blur-sm rounded-full text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-blue/50 transition-all border border-brand-blue/20 hover:border-brand-blue/40"
                                        />
                                    </div>
                                    <div className="flex items-center justify-around pt-3 border-t border-brand-blue/20 relative z-10">
                                        <button className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-brand-blue/10 rounded-xl transition-all smooth-hover group/btn">
                                            <span className="text-xl group-hover/btn:scale-110 transition-transform">🖼️</span>
                                            <span className="text-sm font-bold hidden sm:inline">Photo</span>
                                        </button>
                                        <button className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-accent-orange/10 rounded-xl transition-all smooth-hover group/btn">
                                            <span className="text-xl group-hover/btn:scale-110 transition-transform">📊</span>
                                            <span className="text-sm font-bold hidden sm:inline">Trade</span>
                                        </button>
                                        <button className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-green-500/10 rounded-xl transition-all smooth-hover group/btn">
                                            <span className="text-xl group-hover/btn:scale-110 transition-transform">⚡</span>
                                            <span className="text-sm font-bold hidden sm:inline">Signal</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="divider-enhanced"></div>

                                {/* Pinned Post */}
                                <div className="glass-card-elevated rounded-2xl smooth-hover border border-accent-orange/30 shadow-xl shadow-accent-orange/10 backdrop-blur-xl relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-gradient-to-br from-accent-orange/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                    {/* Pinned Badge */}
                                    <div className="px-5 pt-4 pb-2 relative z-10">
                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent-orange/20 border border-accent-orange/40 rounded-full">
                                            <span className="text-accent-orange text-lg">📌</span>
                                            <span className="text-xs font-bold text-accent-orange">Pinned Post</span>
                                        </div>
                                    </div>
                                    <div className="px-5 pb-5 relative z-10">
                                        <TradingPost
                                            author={{
                                                name: user.name,
                                                avatar: user.avatarUrl,
                                                verified: true,
                                                role: 'Pro Trader'
                                            }}
                                            timestamp="1 week ago"
                                            type="text"
                                            content="🎯 My Trading Philosophy: Consistency over perfection. Risk management over big wins. Education over speculation. Join me on this journey to financial freedom! 💪\n\n#TradingMindset #RiskManagement #FinancialFreedom"
                                            stats={{
                                                likes: 892,
                                                comments: 156,
                                                shares: 234,
                                                views: 5420
                                            }}
                                            isLiked={true}
                                            isBookmarked={true}
                                        />
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="divider-enhanced"></div>

                                {/* Posts */}
                                {posts.map((post, idx) => (
                                    <div
                                        key={post.id}
                                        className="animate-fade-in-up"
                                        style={{ animationDelay: `${idx * 100}ms` }}
                                    >
                                        <TradingPost {...post} />
                                    </div>
                                ))}

                                {/* No more posts */}
                                <div className="text-center py-8">
                                    <div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-500/10 border border-gray-500/20 text-gray-400">
                                        <span className="text-sm font-semibold">No more posts to show</span>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'about' && (
                        <>
                            {/* Left Sidebar - About Me */}
                            <div className="xl:col-span-4 space-y-3 stagger-item">
                                {/* About Me Card - Enhanced */}
                                <div className="glass-card-elevated p-4 rounded-2xl smooth-hover border border-purple-500/20 shadow-xl shadow-purple-500/10 backdrop-blur-xl relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                    <div className="flex items-center justify-between mb-4 relative z-10">
                                        <h3 className="text-sm font-bold flex items-center gap-2 text-white">
                                            <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center shadow-lg border border-purple-500/30 group-hover:scale-110 transition-transform">
                                                <Edit className="w-4 h-4 text-purple-400 group-hover:animate-pulse" />
                                                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></div>
                                            </div>
                                            <span className="group-hover:text-purple-400 transition-colors">About Me</span>
                                        </h3>
                                        <button className="text-xs text-brand-blue hover:text-accent-orange transition-colors font-semibold group/btn">
                                            <span className="group-hover/btn:translate-x-1 inline-block transition-transform">Edit Bio</span>
                                        </button>
                                    </div>
                                    <div className="space-y-3 relative z-10">
                                        <p className="text-gray-300 leading-relaxed">
                                            Professional cryptocurrency and forex trader with over 5 years of experience in the financial markets. Passionate about helping others achieve financial freedom through smart trading strategies and risk management.
                                        </p>
                                        <p className="text-gray-300 leading-relaxed">
                                            Specializing in technical analysis, algorithmic trading, and market sentiment analysis. I share my insights and trading signals with the community to help fellow traders succeed.
                                        </p>
                                        <div className="flex flex-wrap gap-2 mt-4">
                                            {[
                                                { tag: '#CryptoTrading', color: 'brand-blue' },
                                                { tag: '#TechnicalAnalysis', color: 'accent-orange' },
                                                { tag: '#DayTrading', color: 'green' },
                                                { tag: '#AlgoTrading', color: 'purple' },
                                            ].map((item, idx) => (
                                                <span
                                                    key={idx}
                                                    className={`px-3 py-1.5 rounded-full text-xs font-bold smooth-hover cursor-pointer animate-fade-in-up ${item.color === 'brand-blue'
                                                        ? 'bg-brand-blue/20 border border-brand-blue/40 text-brand-blue hover:bg-brand-blue/30'
                                                        : item.color === 'accent-orange'
                                                            ? 'bg-accent-orange/20 border border-accent-orange/40 text-accent-orange hover:bg-accent-orange/30'
                                                            : item.color === 'green'
                                                                ? 'bg-green-500/20 border border-green-400/40 text-green-400 hover:bg-green-500/30'
                                                                : 'bg-purple-500/20 border border-purple-400/40 text-purple-400 hover:bg-purple-500/30'
                                                        }`}
                                                    style={{ animationDelay: `${idx * 50}ms` }}
                                                >
                                                    {item.tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Side - Overview & Trading Performance */}
                            <div className="xl:col-span-8 space-y-3 stagger-item">
                                {/* Overview Card - Enhanced */}
                                <div className="glass-card-elevated p-4 rounded-2xl smooth-hover border border-brand-blue/20 shadow-xl shadow-brand-blue/10 backdrop-blur-xl relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                    <div className="flex items-center justify-between mb-4 relative z-10">
                                        <h3 className="text-sm font-bold flex items-center gap-2 text-white">
                                            <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-brand-blue/20 to-accent-orange/20 flex items-center justify-center shadow-lg border border-brand-blue/30 group-hover:scale-110 transition-transform">
                                                <UsersIcon className="w-4 h-4 text-brand-blue group-hover:animate-pulse" />
                                                <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></div>
                                            </div>
                                            <span className="group-hover:text-brand-blue transition-colors">Overview</span>
                                        </h3>
                                        <button className="text-xs text-brand-blue hover:text-accent-orange transition-colors font-semibold group/btn">
                                            <span className="group-hover/btn:translate-x-1 inline-block transition-transform">Edit</span>
                                        </button>
                                    </div>
                                    <div className="space-y-3 relative z-10">
                                        {[
                                            { icon: <Briefcase className="w-5 h-5" />, label: 'Works at', value: 'LemoTick Trading Platform', subValue: 'Professional Trader • 2020 - Present', color: 'brand-blue' },
                                            { icon: <GraduationCap className="w-5 h-5" />, label: 'Studied at', value: 'Shippensburg University', subValue: 'Bachelor of Science in Finance • 2016 - 2020', color: 'accent-orange' },
                                            { icon: <MapPin className="w-5 h-5" />, label: 'Lives in', value: 'Boca Raton, Florida', subValue: 'United States', color: 'green' },
                                            { icon: <Heart className="w-5 h-5" />, label: 'Relationship Status', value: 'Single', subValue: '', color: 'red' },
                                            { icon: <Calendar className="w-5 h-5" />, label: 'Joined', value: 'January 2022', subValue: '', color: 'purple' },
                                        ].map((item, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-start gap-3 p-3 rounded-xl smooth-hover cursor-pointer bg-brand-blue/5 hover:bg-brand-blue/15 transition-all border border-brand-blue/10 hover:border-brand-blue/30 shadow-lg hover:shadow-xl hover:shadow-brand-blue/20 backdrop-blur-sm relative overflow-hidden animate-fade-in-up"
                                                style={{ animationDelay: `${idx * 50}ms` }}
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-r from-brand-blue/10 to-transparent opacity-0 hover:opacity-100 transition-opacity"></div>
                                                <span className={`relative z-10 mt-0.5 ${item.color === 'brand-blue'
                                                    ? 'text-brand-blue'
                                                    : item.color === 'accent-orange'
                                                        ? 'text-accent-orange'
                                                        : item.color === 'green'
                                                            ? 'text-green-400'
                                                            : item.color === 'red'
                                                                ? 'text-red-400'
                                                                : 'text-purple-400'
                                                    }`}>
                                                    {item.icon}
                                                </span>
                                                <div className="relative z-10">
                                                    <p className="text-sm text-gray-400">{item.label}</p>
                                                    <p className="text-base font-bold text-white">{item.value}</p>
                                                    {item.subValue && <p className="text-xs text-gray-500 mt-1">{item.subValue}</p>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Trading Performance Card - Enhanced */}
                                <div className="glass-card-elevated p-4 rounded-2xl smooth-hover border border-green-400/30 shadow-xl shadow-green-500/10 backdrop-blur-xl relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                    <div className="flex items-center justify-between mb-4 relative z-10">
                                        <h3 className="text-sm font-bold flex items-center gap-2 text-white">
                                            <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center shadow-lg border border-green-400/30 group-hover:scale-110 transition-transform">
                                                <TrendingUp className="w-4 h-4 text-green-400 group-hover:animate-pulse" />
                                                <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></div>
                                            </div>
                                            <span className="group-hover:text-green-400 transition-colors">Trading Performance</span>
                                        </h3>
                                        <button className="text-xs text-brand-blue hover:text-accent-orange transition-colors font-semibold group/btn">
                                            <span className="group-hover/btn:translate-x-1 inline-block transition-transform">View Details</span>
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 relative z-10">
                                        {[
                                            { label: 'Total Profit', value: '$45,230', subValue: '+24.5% ROI', color: 'green', icon: '💰' },
                                            { label: 'Total Trades', value: '1,247', subValue: 'This year', color: 'blue', icon: '📊' },
                                            { label: 'Win Rate', value: '68%', subValue: 'Above avg', color: 'orange', icon: '🎯' },
                                            { label: 'Followers', value: '1,250', subValue: '+15% growth', color: 'purple', icon: '👥' },
                                        ].map((stat, idx) => (
                                            <div
                                                key={idx}
                                                className={`p-4 rounded-xl smooth-hover border backdrop-blur-sm cursor-pointer animate-fade-in-up ${stat.color === 'green'
                                                    ? 'bg-green-500/10 border-green-400/30 hover:bg-green-500/20 shadow-lg shadow-green-500/20'
                                                    : stat.color === 'blue'
                                                        ? 'bg-brand-blue/10 border-brand-blue/30 hover:bg-brand-blue/20 shadow-lg shadow-brand-blue/20'
                                                        : stat.color === 'orange'
                                                            ? 'bg-accent-orange/10 border-accent-orange/30 hover:bg-accent-orange/20 shadow-lg shadow-accent-orange/20'
                                                            : 'bg-purple-500/10 border-purple-400/30 hover:bg-purple-500/20 shadow-lg shadow-purple-500/20'
                                                    }`}
                                                style={{ animationDelay: `${idx * 100}ms` }}
                                            >
                                                <div className="text-center">
                                                    <span className="text-2xl mb-2 block">{stat.icon}</span>
                                                    <p className="text-xs text-gray-400 mb-1">{stat.label}</p>
                                                    <p className={`text-2xl font-bold ${stat.color === 'green'
                                                        ? 'text-green-400'
                                                        : stat.color === 'blue'
                                                            ? 'text-brand-blue'
                                                            : stat.color === 'orange'
                                                                ? 'text-accent-orange'
                                                                : 'text-purple-400'
                                                        }`}>
                                                        {stat.value}
                                                    </p>
                                                    <p className={`text-xs mt-1 ${stat.color === 'green'
                                                        ? 'text-green-400'
                                                        : stat.color === 'blue'
                                                            ? 'text-brand-blue'
                                                            : stat.color === 'orange'
                                                                ? 'text-accent-orange'
                                                                : 'text-purple-400'
                                                        }`}>
                                                        {stat.subValue}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'friends' && (
                        <>
                            {/* Left Sidebar - Friend Categories & Suggestions */}
                            <div className="xl:col-span-4 space-y-3 stagger-item">
                                {/* Friend Categories */}
                                <div className="glass-card-elevated p-4 rounded-2xl smooth-hover border border-brand-blue/20 shadow-xl shadow-brand-blue/10 backdrop-blur-xl relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                    <div className="flex items-center justify-between mb-4 relative z-10">
                                        <h3 className="text-sm font-bold flex items-center gap-2 text-white">
                                            <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-brand-blue/20 to-accent-orange/20 flex items-center justify-center shadow-lg border border-brand-blue/30 group-hover:scale-110 transition-transform">
                                                <UsersIcon className="w-4 h-4 text-brand-blue group-hover:animate-pulse" />
                                                <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></div>
                                            </div>
                                            <span className="group-hover:text-brand-blue transition-colors">Friend Lists</span>
                                        </h3>
                                        <button className="text-xs text-brand-blue hover:text-accent-orange transition-colors font-semibold group/btn">
                                            <span className="group-hover/btn:translate-x-1 inline-block transition-transform">Manage</span>
                                        </button>
                                    </div>
                                    <div className="space-y-2 relative z-10">
                                        {[
                                            { icon: '👥', label: 'All Friends', count: 542, color: 'brand-blue', active: true },
                                            { icon: '⭐', label: 'Close Friends', count: 28, color: 'accent-orange', active: false },
                                            { icon: '📊', label: 'Trading Partners', count: 156, color: 'green', active: false },
                                            { icon: '🎓', label: 'University', count: 45, color: 'purple', active: false },
                                            { icon: '💼', label: 'Work', count: 67, color: 'blue', active: false },
                                            { icon: '🌍', label: 'Nearby', count: 23, color: 'cyan', active: false },
                                        ].map((category, idx) => (
                                            <button
                                                key={idx}
                                                className={`w-full flex items-center justify-between p-3 rounded-xl smooth-hover transition-all border backdrop-blur-sm animate-fade-in-up group/cat ${category.active
                                                    ? 'bg-brand-blue/20 border-brand-blue/40 shadow-lg shadow-brand-blue/20'
                                                    : 'bg-gray-500/10 border-gray-500/20 hover:bg-gray-500/20 hover:border-gray-500/30'
                                                    }`}
                                                style={{ animationDelay: `${idx * 50}ms` }}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-lg group-hover/cat:scale-110 transition-transform">{category.icon}</span>
                                                    <span className={`text-sm font-bold ${category.active ? 'text-brand-blue' : 'text-gray-300 group-hover/cat:text-white'}`}>
                                                        {category.label}
                                                    </span>
                                                </div>
                                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${category.active
                                                    ? 'bg-brand-blue/30 text-brand-blue'
                                                    : 'bg-gray-500/20 text-gray-400 group-hover/cat:bg-gray-500/30'
                                                    }`}>
                                                    {category.count}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="divider-enhanced"></div>

                                {/* Friend Requests */}
                                <div className="glass-card-elevated p-4 rounded-2xl smooth-hover border border-accent-orange/20 shadow-xl shadow-accent-orange/10 backdrop-blur-xl relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-gradient-to-br from-accent-orange/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                    <div className="flex items-center justify-between mb-4 relative z-10">
                                        <h3 className="text-sm font-bold flex items-center gap-2 text-white">
                                            <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-accent-orange/20 to-yellow-500/20 flex items-center justify-center shadow-lg border border-accent-orange/30 group-hover:scale-110 transition-transform">
                                                <UserPlus className="w-4 h-4 text-accent-orange group-hover:animate-pulse" />
                                                <div className="absolute inset-0 bg-gradient-to-br from-accent-orange/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></div>
                                            </div>
                                            <span className="group-hover:text-accent-orange transition-colors">Friend Requests</span>
                                        </h3>
                                        <span className="text-xs font-bold px-2 py-1 rounded-full bg-accent-orange/20 text-accent-orange border border-accent-orange/40 animate-pulse">
                                            3
                                        </span>
                                    </div>
                                    <div className="space-y-3 relative z-10">
                                        {[
                                            { name: 'Alex Morgan', mutual: 12, avatar: 15, role: 'Swing Trader' },
                                            { name: 'Sarah Chen', mutual: 8, avatar: 16, role: 'Crypto Analyst' },
                                            { name: 'Mike Johnson', mutual: 24, avatar: 17, role: 'Day Trader' },
                                        ].map((request, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-center gap-3 p-3 rounded-xl bg-accent-orange/10 border border-accent-orange/20 smooth-hover hover:bg-accent-orange/15 transition-all animate-fade-in-up group/req"
                                                style={{ animationDelay: `${idx * 100}ms` }}
                                            >
                                                <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-accent-orange/30 shadow-lg flex-shrink-0 group-hover/req:ring-accent-orange/50 transition-all">
                                                    <img
                                                        src={`https://i.pravatar.cc/100?img=${request.avatar}`}
                                                        alt={request.name}
                                                        className="w-full h-full object-cover group-hover/req:scale-110 transition-transform"
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-white truncate group-hover/req:text-accent-orange transition-colors">{request.name}</p>
                                                    <p className="text-xs text-accent-orange">{request.role}</p>
                                                    <p className="text-xs text-gray-400">{request.mutual} mutual</p>
                                                </div>
                                                <div className="flex flex-col gap-1 flex-shrink-0">
                                                    <button className="p-1.5 rounded-lg bg-brand-blue/20 hover:bg-brand-blue/30 border border-brand-blue/40 transition-all group/btn">
                                                        <span className="text-brand-blue text-base group-hover/btn:scale-110 transition-transform inline-block">✓</span>
                                                    </button>
                                                    <button className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 transition-all group/btn">
                                                        <span className="text-red-400 text-base group-hover/btn:scale-110 transition-transform inline-block">✕</span>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <button className="w-full mt-3 btn-secondary-enhanced ripple focus-enhanced px-4 py-2 text-xs font-bold">
                                        See All Requests
                                    </button>
                                </div>

                                {/* Divider */}
                                <div className="divider-enhanced"></div>

                                {/* Suggested Friends */}
                                <div className="glass-card-elevated p-4 rounded-2xl smooth-hover border border-purple-500/20 shadow-xl shadow-purple-500/10 backdrop-blur-xl relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                    <div className="flex items-center justify-between mb-4 relative z-10">
                                        <h3 className="text-sm font-bold flex items-center gap-2 text-white">
                                            <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center shadow-lg border border-purple-500/30 group-hover:scale-110 transition-transform">
                                                <Sparkles className="w-4 h-4 text-purple-400 group-hover:animate-pulse" />
                                                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></div>
                                            </div>
                                            <span className="group-hover:text-purple-400 transition-colors">People You May Know</span>
                                        </h3>
                                    </div>
                                    <div className="space-y-3 relative z-10">
                                        {[
                                            { name: 'Emma Wilson', mutual: 45, avatar: 20, role: 'Pro Trader', profit: '+32.5%' },
                                            { name: 'David Lee', mutual: 32, avatar: 21, role: 'Crypto Expert', profit: '+28.1%' },
                                            { name: 'Lisa Anderson', mutual: 38, avatar: 22, role: 'Bot Developer', profit: '+41.2%' },
                                        ].map((suggestion, idx) => (
                                            <div
                                                key={idx}
                                                className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 smooth-hover hover:bg-purple-500/15 transition-all animate-fade-in-up group/sug"
                                                style={{ animationDelay: `${idx * 100}ms` }}
                                            >
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-purple-400/30 shadow-lg flex-shrink-0 group-hover/sug:ring-purple-400/50 transition-all">
                                                        <img
                                                            src={`https://i.pravatar.cc/100?img=${suggestion.avatar}`}
                                                            alt={suggestion.name}
                                                            className="w-full h-full object-cover group-hover/sug:scale-110 transition-transform"
                                                        />
                                                        {/* Profit Badge */}
                                                        <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 bg-green-500 rounded-full border-2 border-card">
                                                            <span className="text-[10px] font-bold text-white">{suggestion.profit}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-bold text-white truncate group-hover/sug:text-purple-400 transition-colors">{suggestion.name}</p>
                                                        <p className="text-xs text-purple-400">{suggestion.role}</p>
                                                        <p className="text-xs text-gray-400">{suggestion.mutual} mutual friends</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button className="flex-1 btn-primary-enhanced ripple focus-enhanced px-3 py-2 text-xs font-bold shadow-lg shadow-brand-blue/20">
                                                        <UserPlus className="w-3 h-3 inline-block mr-1" />
                                                        Add Friend
                                                    </button>
                                                    <button className="p-2 rounded-lg bg-gray-500/10 hover:bg-gray-500/20 border border-gray-500/20 transition-all">
                                                        <span className="text-xs">✕</span>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <button className="w-full mt-3 btn-secondary-enhanced ripple focus-enhanced px-4 py-2 text-xs font-bold">
                                        See More Suggestions
                                    </button>
                                </div>
                            </div>

                            {/* Right Side - Friends Grid */}
                            <div className="xl:col-span-8 space-y-3 stagger-item">
                                {/* Search and Filter Bar */}
                                <div className="glass-card-elevated p-4 rounded-2xl smooth-hover border border-brand-blue/20 shadow-xl shadow-brand-blue/10 backdrop-blur-xl relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-gradient-to-r from-brand-blue/5 via-transparent to-accent-orange/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <div className="flex flex-col sm:flex-row items-center gap-3 relative z-10">
                                        <div className="flex-1 w-full">
                                            <input
                                                type="text"
                                                placeholder="Search friends..."
                                                className="w-full px-4 py-2.5 bg-dark/40 backdrop-blur-sm rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-blue/50 transition-all border border-brand-blue/20 hover:border-brand-blue/40"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2 w-full sm:w-auto">
                                            <button className="flex-1 sm:flex-none btn-secondary-enhanced ripple focus-enhanced px-4 py-2.5 text-sm font-bold shadow-lg">
                                                <span className="text-lg mr-2">🔍</span>
                                                Search
                                            </button>
                                            <button className="flex-1 sm:flex-none btn-primary-enhanced ripple focus-enhanced px-4 py-2.5 text-sm font-bold shadow-lg shadow-brand-blue/30 group relative overflow-hidden">
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                                                <UserPlus className="w-4 h-4 inline-block mr-2 group-hover:scale-110 transition-transform" />
                                                <span className="relative">Find Friends</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Friends Count Header */}
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                        <span className="text-brand-blue">{user.friendsCount}</span> Friends
                                    </h2>
                                    <div className="flex items-center gap-2">
                                        <button className="p-2 rounded-lg bg-gray-500/10 hover:bg-gray-500/20 border border-gray-500/20 transition-all">
                                            <span className="text-sm">📋</span>
                                        </button>
                                        <button className="p-2 rounded-lg bg-gray-500/10 hover:bg-gray-500/20 border border-gray-500/20 transition-all">
                                            <span className="text-sm">⚙️</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Friends Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {[
                                        { name: 'Sarah Johnson', role: 'Pro Trader', mutual: 45, profit: '+24.5%', online: true, avatar: 1 },
                                        { name: 'Michael Chen', role: 'Crypto Expert', mutual: 32, profit: '+18.2%', online: true, avatar: 2 },
                                        { name: 'Emma Davis', role: 'Day Trader', mutual: 28, profit: '+15.8%', online: false, avatar: 3 },
                                        { name: 'James Wilson', role: 'Investor', mutual: 56, profit: '+22.1%', online: true, avatar: 4 },
                                        { name: 'Olivia Brown', role: 'Analyst', mutual: 41, profit: '+19.7%', online: false, avatar: 5 },
                                        { name: 'William Taylor', role: 'Swing Trader', mutual: 38, profit: '+16.4%', online: true, avatar: 6 },
                                        { name: 'Sophia Martinez', role: 'Scalper', mutual: 52, profit: '+28.9%', online: false, avatar: 7 },
                                        { name: 'Benjamin Lee', role: 'Bot Developer', mutual: 47, profit: '+21.3%', online: true, avatar: 8 },
                                        { name: 'Ava Anderson', role: 'Forex Trader', mutual: 35, profit: '+17.6%', online: false, avatar: 9 },
                                        { name: 'Lucas Garcia', role: 'Options Trader', mutual: 44, profit: '+23.8%', online: true, avatar: 10 },
                                        { name: 'Mia Rodriguez', role: 'Technical Analyst', mutual: 39, profit: '+20.2%', online: false, avatar: 11 },
                                        { name: 'Ethan Martinez', role: 'Momentum Trader', mutual: 51, profit: '+25.4%', online: true, avatar: 12 },
                                    ].map((friend, i) => (
                                        <div
                                            key={i}
                                            className="glass-card-elevated p-4 rounded-2xl smooth-hover border border-brand-blue/20 shadow-xl shadow-brand-blue/10 backdrop-blur-xl relative overflow-hidden group cursor-pointer animate-fade-in-up"
                                            style={{ animationDelay: `${i * 50}ms` }}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                            <div className="relative z-10">
                                                {/* Avatar with Online Status */}
                                                <div className="relative aspect-square rounded-xl overflow-hidden mb-3 ring-2 ring-brand-blue/20 group-hover:ring-brand-blue/50 transition-all shadow-lg">
                                                    <img
                                                        src={`https://i.pravatar.cc/200?img=${friend.avatar}`}
                                                        alt={friend.name}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                                    />
                                                    {/* Online Status Badge */}
                                                    {friend.online && (
                                                        <div className="absolute bottom-2 right-2">
                                                            <div className="relative">
                                                                <span className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-75"></span>
                                                                <span className="relative block w-3 h-3 bg-green-400 rounded-full border-2 border-card shadow-lg"></span>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {/* Profit Badge */}
                                                    <div className="absolute top-2 right-2 px-2 py-1 bg-green-500/90 backdrop-blur-sm rounded-lg">
                                                        <span className="text-xs font-bold text-white">{friend.profit}</span>
                                                    </div>
                                                </div>

                                                {/* Friend Info */}
                                                <h3 className="text-sm font-bold text-white truncate group-hover:text-brand-blue transition-colors mb-1">
                                                    {friend.name}
                                                </h3>
                                                <p className="text-xs text-brand-blue truncate mb-1">{friend.role}</p>
                                                <p className="text-xs text-gray-400 truncate mb-3">{friend.mutual} mutual friends</p>

                                                {/* Action Buttons */}
                                                <div className="flex gap-2">
                                                    <button className="flex-1 btn-secondary-enhanced ripple focus-enhanced px-3 py-2 text-xs font-bold">
                                                        <MessageCircle className="w-3 h-3 inline-block mr-1" />
                                                        Message
                                                    </button>
                                                    <button className="p-2 rounded-lg bg-gray-500/10 hover:bg-gray-500/20 border border-gray-500/20 transition-all">
                                                        <span className="text-sm">⋯</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Load More */}
                                <div className="text-center py-6">
                                    <button className="btn-primary-enhanced ripple focus-enhanced px-8 py-3 text-sm font-semibold rounded-xl group relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                                        <span className="relative">Load More Friends</span>
                                    </button>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'photos' && (
                        <div className="xl:col-span-12">
                            <div className="max-w-6xl mx-auto space-y-4">
                                {/* Photos Header */}
                                <div className="glass-card-elevated p-6 rounded-2xl smooth-hover border border-brand-blue/20 shadow-xl shadow-brand-blue/10 backdrop-blur-xl relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                    <div className="flex items-center justify-between relative z-10">
                                        <div>
                                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                                <Camera className="w-5 h-5 text-accent-orange" />
                                                Photos
                                            </h2>
                                            <p className="text-sm text-gray-400 mt-1">247 photos</p>
                                        </div>
                                        <button className="btn-primary-enhanced ripple focus-enhanced px-4 py-2.5 text-sm font-bold shadow-lg shadow-brand-blue/30 group relative overflow-hidden">
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                                            <Plus className="w-4 h-4 inline-block mr-2 group-hover:rotate-90 transition-transform" />
                                            <span className="relative">Add Photos</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Photo Albums */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    {[
                                        { name: 'Trading Setups', count: 45, cover: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400' },
                                        { name: 'Market Analysis', count: 67, cover: 'https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=400' },
                                    ].map((album, i) => (
                                        <div
                                            key={i}
                                            className="glass-card-elevated p-4 rounded-2xl smooth-hover border border-brand-blue/20 shadow-xl shadow-brand-blue/10 backdrop-blur-xl relative overflow-hidden group cursor-pointer animate-fade-in-up"
                                            style={{ animationDelay: `${i * 100}ms` }}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                            <div className="relative z-10">
                                                <div className="aspect-video rounded-xl overflow-hidden mb-3 ring-2 ring-brand-blue/20 group-hover:ring-brand-blue/50 transition-all shadow-lg">
                                                    <img
                                                        src={album.cover}
                                                        alt={album.name}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                                    />
                                                </div>
                                                <h3 className="text-base font-bold text-white group-hover:text-brand-blue transition-colors">{album.name}</h3>
                                                <p className="text-sm text-gray-400">{album.count} photos</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Recent Photos Grid */}
                                <div className="glass-card-elevated p-6 rounded-2xl smooth-hover border border-brand-blue/20 shadow-xl shadow-brand-blue/10 backdrop-blur-xl relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                    <h3 className="text-base font-bold text-white mb-4 relative z-10">Recent Photos</h3>
                                    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 relative z-10">
                                        {Array.from({ length: 15 }).map((_, i) => (
                                            <div
                                                key={i}
                                                className="aspect-square rounded-xl overflow-hidden ring-2 ring-brand-blue/20 hover:ring-brand-blue/50 transition-all shadow-lg hover:shadow-xl hover:shadow-brand-blue/20 group/img cursor-pointer animate-fade-in-up"
                                                style={{ animationDelay: `${i * 30}ms` }}
                                            >
                                                <img
                                                    src={`https://images.unsplash.com/photo-${1600000000000 + i * 10000000}?w=300&h=300&fit=crop`}
                                                    alt={`Photo ${i + 1}`}
                                                    className="w-full h-full object-cover group-hover/img:scale-110 transition-transform"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Load More */}
                                <div className="text-center py-6">
                                    <button className="btn-primary-enhanced ripple focus-enhanced px-8 py-3 text-sm font-semibold rounded-xl group relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                                        <span className="relative">Load More Photos</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'videos' && (
                        <div className="xl:col-span-12">
                            <div className="max-w-6xl mx-auto space-y-4">
                                {/* Videos Header */}
                                <div className="glass-card-elevated p-6 rounded-2xl smooth-hover border border-brand-blue/20 shadow-xl shadow-brand-blue/10 backdrop-blur-xl relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                    <div className="flex items-center justify-between relative z-10">
                                        <div>
                                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                                <Video className="w-5 h-5 text-purple-400" />
                                                Videos
                                            </h2>
                                            <p className="text-sm text-gray-400 mt-1">34 videos</p>
                                        </div>
                                        <button className="btn-primary-enhanced ripple focus-enhanced px-4 py-2.5 text-sm font-bold shadow-lg shadow-brand-blue/30 group relative overflow-hidden">
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                                            <Plus className="w-4 h-4 inline-block mr-2 group-hover:rotate-90 transition-transform" />
                                            <span className="relative">Upload Video</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Video Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {[
                                        { title: 'BTC Technical Analysis - Bullish Breakout', views: '12.5K', duration: '15:42', thumbnail: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600' },
                                        { title: 'Top 5 Trading Strategies for 2026', views: '8.3K', duration: '22:15', thumbnail: 'https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=600' },
                                        { title: 'How I Made $10K in One Day', views: '25.1K', duration: '18:30', thumbnail: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=600' },
                                        { title: 'Risk Management Masterclass', views: '6.7K', duration: '32:45', thumbnail: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=600' },
                                        { title: 'Live Trading Session - ETH Scalping', views: '15.2K', duration: '45:20', thumbnail: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=600' },
                                        { title: 'Market Sentiment Analysis Tutorial', views: '9.8K', duration: '12:55', thumbnail: 'https://images.unsplash.com/photo-1642790551116-18e150f248e8?w=600' },
                                    ].map((video, i) => (
                                        <div
                                            key={i}
                                            className="glass-card-elevated p-4 rounded-2xl smooth-hover border border-brand-blue/20 shadow-xl shadow-brand-blue/10 backdrop-blur-xl relative overflow-hidden group cursor-pointer animate-fade-in-up"
                                            style={{ animationDelay: `${i * 100}ms` }}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                            <div className="relative z-10">
                                                {/* Video Thumbnail */}
                                                <div className="relative aspect-video rounded-xl overflow-hidden mb-3 ring-2 ring-brand-blue/20 group-hover:ring-brand-blue/50 transition-all shadow-lg">
                                                    <img
                                                        src={video.thumbnail}
                                                        alt={video.title}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                                    />
                                                    {/* Play Button Overlay */}
                                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <div className="w-16 h-16 rounded-full bg-brand-blue/90 flex items-center justify-center shadow-2xl shadow-brand-blue/50 group-hover:scale-110 transition-transform">
                                                            <Play className="w-8 h-8 text-white ml-1" fill="white" />
                                                        </div>
                                                    </div>
                                                    {/* Duration Badge */}
                                                    <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 backdrop-blur-sm rounded-lg text-xs font-bold text-white">
                                                        {video.duration}
                                                    </div>
                                                </div>

                                                {/* Video Info */}
                                                <h3 className="text-sm font-bold text-white line-clamp-2 group-hover:text-brand-blue transition-colors mb-2">
                                                    {video.title}
                                                </h3>
                                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                                    <span className="flex items-center gap-1">
                                                        <Play className="w-3 h-3" />
                                                        {video.views} views
                                                    </span>
                                                    <span>•</span>
                                                    <span>2 days ago</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Load More */}
                                <div className="text-center py-6">
                                    <button className="btn-primary-enhanced ripple focus-enhanced px-8 py-3 text-sm font-semibold rounded-xl group relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                                        <span className="relative">Load More Videos</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </PageSection>
        </PageContainer>
    );
}
