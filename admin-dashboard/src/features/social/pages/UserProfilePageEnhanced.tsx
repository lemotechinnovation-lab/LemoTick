// UserProfilePageEnhanced - View another user's profile with Timeline UI styling
// Modern glassmorphism design matching TimelinePageEnhanced - 2026 Enhanced

import { PageContainer, PageSection } from '@/components/ui/PageLayoutEnhanced';
import { TradingPost } from '@/components/ui/SocialComponentsEnhanced';
import { getUserById, getUserFriends, mockUsers } from '@/features/social/data/mockSocialData';
import { Award, Camera, MapPin, MessageCircle, MoreHorizontal, TrendingUp, UserCheck, UserPlus, Users as UsersIcon } from 'lucide-react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';

type MainTab = 'posts' | 'about' | 'friends' | 'photos' | 'videos';

export default function UserProfilePageEnhanced() {
    const { userId } = useParams();
    const [activeTab, setActiveTab] = useState<MainTab>('posts');
    const [isFriend, setIsFriend] = useState(false);
    const [friendRequestSent, setFriendRequestSent] = useState(false);

    // Get user data from mock data
    const user = getUserById(userId || '1') || mockUsers['1'];
    const userFriends = getUserFriends(user.id);

    // Initialize friend status from mock data
    useState(() => {
        setIsFriend(user.isFriend || false);
        setFriendRequestSent(user.friendRequestSent || false);
    });

    const handleAddFriend = () => {
        if (isFriend) {
            // Unfriend
            setIsFriend(false);
        } else if (friendRequestSent) {
            // Cancel request
            setFriendRequestSent(false);
        } else {
            // Send friend request
            setFriendRequestSent(true);
        }
    };

    const mainTabs = [
        { id: 'posts' as MainTab, label: 'Posts', count: 2 },
        { id: 'about' as MainTab, label: 'About' },
        { id: 'friends' as MainTab, label: 'Friends', count: user.friendsCount },
        { id: 'photos' as MainTab, label: 'Photos' },
        { id: 'videos' as MainTab, label: 'Videos' },
    ];

    // Sample posts from this user
    const posts = [
        {
            id: '1',
            author: {
                id: user.id,
                name: user.name,
                avatar: user.avatar,
                verified: user.verified,
                role: user.role
            },
            timestamp: '5 hours ago',
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
            id: '2',
            author: {
                id: user.id,
                name: user.name,
                avatar: user.avatar,
                verified: user.verified
            },
            timestamp: '1 day ago',
            type: 'text' as const,
            content: 'Just hit my monthly trading goal! 🎯📈 Consistency and discipline are the keys to success. Remember: it\'s not about making quick money, it\'s about building sustainable wealth over time. Keep grinding! 💪',
            stats: {
                likes: 189,
                comments: 45,
                shares: 23,
                views: 1120
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
                {user.coverPhoto ? (
                    <img
                        src={user.coverPhoto}
                        alt="Cover"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center text-gray-400">
                            <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        </div>
                    </div>
                )}
            </div>

            {/* Profile Info Section */}
            <PageSection className="relative z-10">
                <div className="relative -mt-20 sm:-mt-24">
                    {/* Profile Header Card */}
                    <div className="glass-card-elevated p-6 rounded-2xl smooth-hover mb-4 border border-brand-blue/30 shadow-2xl shadow-brand-blue/10 backdrop-blur-xl bg-gradient-to-r from-brand-blue/5 via-transparent to-accent-orange/5">
                        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4">
                            {/* Profile Picture */}
                            <div className="relative -mt-16 sm:-mt-20">
                                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-card bg-gradient-to-br from-brand-blue/30 to-accent-orange/30 overflow-hidden ring-4 ring-brand-blue/20 shadow-2xl shadow-brand-blue/30">
                                    <img
                                        src={user.avatar}
                                        alt={user.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>

                            {/* Name and Info */}
                            <div className="flex-1 text-center sm:text-left">
                                <h1 className="text-2xl sm:text-3xl font-bold mb-1 flex items-center justify-center sm:justify-start gap-2">
                                    <span className="bg-gradient-to-r from-brand-blue via-accent-orange to-brand-blue bg-clip-text text-transparent">
                                        {user.name}
                                    </span>
                                    {user.verified && (
                                        <span className="inline-flex items-center justify-center w-6 h-6 bg-brand-blue/20 rounded-full border border-brand-blue/40 shadow-lg shadow-brand-blue/30">
                                            <Award className="w-3.5 h-3.5 text-brand-blue" />
                                        </span>
                                    )}
                                </h1>
                                {user.role && (
                                    <p className="text-sm text-brand-blue font-semibold mb-2">{user.role}</p>
                                )}
                                <div className="flex items-center justify-center sm:justify-start gap-4 mb-2">
                                    <div className="flex items-center gap-1.5 text-sm">
                                        <UsersIcon className="w-4 h-4 text-brand-blue" />
                                        <span className="font-bold text-brand-blue">{user.friendsCount}</span>
                                        <span className="text-gray-400">friends</span>
                                    </div>
                                    <div className="w-1 h-1 rounded-full bg-gray-600"></div>
                                    <div className="flex items-center gap-1.5 text-sm">
                                        <span className="font-bold text-accent-orange">{user.mutualFriendsCount || 0}</span>
                                        <span className="text-gray-400">mutual</span>
                                    </div>
                                    <div className="w-1 h-1 rounded-full bg-gray-600"></div>
                                    <div className="flex items-center gap-1.5 text-sm">
                                        <TrendingUp className="w-4 h-4 text-accent-orange" />
                                        <span className="font-bold text-accent-orange">{user.followersCount}</span>
                                        <span className="text-gray-400">followers</span>
                                    </div>
                                </div>
                                {/* Mutual Friends Avatars */}
                                {user.mutualFriendsCount && user.mutualFriendsCount > 0 && (
                                    <div className="flex items-center justify-center sm:justify-start gap-1">
                                        {userFriends.slice(0, 5).map((friend) => (
                                            <div key={friend.id} className="w-8 h-8 rounded-full border-2 border-card overflow-hidden -ml-2 first:ml-0 ring-1 ring-brand-blue/20 shadow-lg">
                                                <img
                                                    src={friend.avatar}
                                                    alt={friend.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        ))}
                                        {user.mutualFriendsCount > 5 && (
                                            <span className="text-xs text-gray-400 ml-2">+{user.mutualFriendsCount - 5} mutual friends</span>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleAddFriend}
                                    className={`ripple focus-enhanced px-4 py-2.5 text-sm font-bold shadow-lg rounded-xl transition-all flex items-center gap-2 group relative overflow-hidden ${isFriend
                                        ? 'btn-secondary-enhanced'
                                        : friendRequestSent
                                            ? 'bg-accent-orange/20 hover:bg-accent-orange/30 border border-accent-orange/40 text-accent-orange'
                                            : 'btn-primary-enhanced shadow-brand-blue/30'
                                        }`}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                                    {isFriend ? (
                                        <>
                                            <UserCheck className="w-4 h-4 relative z-10 group-hover:scale-110 transition-transform" />
                                            <span className="relative z-10">Friends</span>
                                        </>
                                    ) : friendRequestSent ? (
                                        <>
                                            <UserCheck className="w-4 h-4 relative z-10 group-hover:scale-110 transition-transform" />
                                            <span className="relative z-10">Request Sent</span>
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus className="w-4 h-4 relative z-10 group-hover:scale-110 transition-transform" />
                                            <span className="relative z-10">Add Friend</span>
                                        </>
                                    )}
                                </button>
                                <button className="btn-secondary-enhanced ripple focus-enhanced px-4 py-2.5 text-sm font-bold shadow-lg group relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                                    <MessageCircle className="w-4 h-4 inline-block mr-2 group-hover:scale-110 transition-transform relative z-10" />
                                    <span className="relative z-10">Message</span>
                                </button>
                                <button className="p-2.5 smooth-hover rounded-xl focus-enhanced bg-gray-500/10 hover:bg-gray-500/20 border border-gray-500/30 shadow-lg group">
                                    <MoreHorizontal className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
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
                                {/* Intro Card */}
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
                                    </div>

                                    {/* Bio */}
                                    <div className="mb-4 text-center relative z-10">
                                        <p className="text-sm text-gray-300 mb-3 leading-relaxed">
                                            💪 Professional trader focused on crypto and forex markets
                                        </p>
                                    </div>

                                    {/* Info Items */}
                                    <div className="space-y-2 mb-3 relative z-10">
                                        {[
                                            { icon: '💼', text: user.work || 'Professional Trader', color: 'brand-blue' },
                                            { icon: '🎓', text: `Studied at ${user.education || 'University'}`, color: 'accent-orange' },
                                            { icon: <MapPin className="w-4 h-4" />, text: `Lives in ${user.location}`, color: 'green' },
                                            { icon: '👥', text: `Followed by ${user.followersCount} people`, color: 'purple' },
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
                                                    {item.text}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="divider-enhanced"></div>

                                {/* Friends Preview */}
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
                                    <p className="text-xs text-gray-400 mb-3 relative z-10 font-semibold">{user.friendsCount} friends · {user.mutualFriendsCount || 0} mutual</p>
                                    <div className="grid grid-cols-3 gap-2 relative z-10">
                                        {userFriends.slice(0, 9).map((friend, i) => (
                                            <div
                                                key={friend.id}
                                                className="aspect-square rounded-xl overflow-hidden ring-2 ring-brand-blue/20 hover:ring-brand-blue/60 transition-all smooth-hover shadow-lg hover:shadow-xl hover:shadow-brand-blue/20 group/img cursor-pointer animate-fade-in-up backdrop-blur-sm relative"
                                                style={{ animationDelay: `${i * 30}ms` }}
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/10 to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity z-10"></div>
                                                <img
                                                    src={friend.avatar}
                                                    alt={friend.name}
                                                    className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-300"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="divider-enhanced"></div>

                                {/* Trading Stats */}
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
                                    </div>
                                    <div className="space-y-3 relative z-10">
                                        {[
                                            { label: 'Win Rate', value: '72%', icon: '🎯', color: 'blue' },
                                            { label: 'Total Trades', value: '1,247', icon: '📊', color: 'green' },
                                            { label: 'Followers', value: user.followersCount.toString(), icon: '👥', color: 'purple' },
                                        ].map((stat, idx) => (
                                            <div
                                                key={idx}
                                                className={`flex items-center justify-between p-3 rounded-xl ${stat.color === 'blue'
                                                    ? 'bg-brand-blue/10 border-brand-blue/30 hover:bg-brand-blue/20'
                                                    : stat.color === 'green'
                                                        ? 'bg-green-500/10 border-green-400/30 hover:bg-green-500/20'
                                                        : 'bg-purple-500/10 border-purple-400/30 hover:bg-purple-500/20'
                                                    } shadow-xl smooth-hover border backdrop-blur-sm cursor-pointer animate-fade-in-up`}
                                                style={{ animationDelay: `${idx * 100}ms` }}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-2xl">{stat.icon}</span>
                                                    <div>
                                                        <p className="text-xs text-gray-400">{stat.label}</p>
                                                        <p className={`text-sm font-bold ${stat.color === 'blue'
                                                            ? 'text-brand-blue'
                                                            : stat.color === 'green'
                                                                ? 'text-green-400'
                                                                : 'text-purple-400'
                                                            }`}>
                                                            {stat.value}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Right Side - Posts Feed */}
                            <div className="xl:col-span-8 space-y-3 stagger-item">
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
                        <div className="xl:col-span-12">
                            <div className="max-w-4xl mx-auto space-y-3">
                                <div className="glass-card-elevated p-4 rounded-2xl smooth-hover border border-brand-blue/20 shadow-xl shadow-brand-blue/10 backdrop-blur-xl">
                                    <h2 className="text-lg font-semibold text-white mb-4">About {user.name}</h2>
                                    <p className="text-gray-300">Profile details coming soon...</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'friends' && (
                        <div className="xl:col-span-12">
                            <div className="max-w-6xl mx-auto">
                                <div className="glass-card-elevated p-4 rounded-2xl smooth-hover border border-brand-blue/20 shadow-xl shadow-brand-blue/10 backdrop-blur-xl">
                                    <h2 className="text-lg font-semibold text-white mb-4">Friends</h2>
                                    <p className="text-gray-300">Friends list coming soon...</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'photos' && (
                        <div className="xl:col-span-12">
                            <div className="max-w-6xl mx-auto">
                                <div className="glass-card-elevated p-4 rounded-2xl smooth-hover border border-brand-blue/20 shadow-xl shadow-brand-blue/10 backdrop-blur-xl">
                                    <h2 className="text-lg font-semibold text-white mb-4">Photos</h2>
                                    <p className="text-gray-300">Photos coming soon...</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'videos' && (
                        <div className="xl:col-span-12">
                            <div className="max-w-6xl mx-auto">
                                <div className="glass-card-elevated p-4 rounded-2xl smooth-hover border border-brand-blue/20 shadow-xl shadow-brand-blue/10 backdrop-blur-xl">
                                    <h2 className="text-lg font-semibold text-white mb-4">Videos</h2>
                                    <p className="text-gray-300">Videos coming soon...</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </PageSection>
        </PageContainer>
    );
}
