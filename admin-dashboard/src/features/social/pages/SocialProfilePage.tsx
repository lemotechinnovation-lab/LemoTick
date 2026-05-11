// SocialProfilePage - User's social profile page (Facebook-style)

import { PageContainer, PageSection } from '@/components/ui/PageLayoutEnhanced';
import { Camera, Edit, MoreHorizontal, Plus } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

type MainTab = 'posts' | 'about' | 'friends' | 'photos' | 'videos';

export default function SocialProfilePage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<MainTab>('posts');

    // Mock user data - replace with actual user data from store
    const user = {
        name: 'John Trader',
        bio: 'Professional trader | Crypto enthusiast | Building wealth through smart investments',
        friendsCount: 542,
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
        coverUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&h=400&fit=crop',
    };

    const mainTabs = [
        { id: 'posts' as MainTab, label: 'Posts' },
        { id: 'about' as MainTab, label: 'About' },
        { id: 'friends' as MainTab, label: 'Friends', count: user.friendsCount },
        { id: 'photos' as MainTab, label: 'Photos' },
        { id: 'videos' as MainTab, label: 'Videos' },
    ];

    return (
        <div className="w-full">
            {/* Cover Photo */}
            <div className="relative w-full h-64 sm:h-80 lg:h-96 bg-gradient-to-br from-[#2F6BFF]/20 to-[#FFA62B]/20 border-b border-[#2F6BFF]/20">
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
                <button className="absolute bottom-4 right-4 px-4 py-2 bg-[#16124A]/80 hover:bg-[#16124A] backdrop-blur-sm border border-[#2F6BFF]/30 text-white rounded-lg text-sm font-semibold transition-all flex items-center gap-2">
                    <Camera className="w-4 h-4" />
                    Edit cover photo
                </button>
            </div>

            {/* Profile Info Section */}
            <PageContainer maxWidth="xl">
                <PageSection>
                    <div className="relative -mt-20 sm:-mt-24">
                        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 mb-6">
                            {/* Profile Picture */}
                            <div className="relative">
                                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-[#0B0633] bg-gradient-to-br from-[#2F6BFF]/20 to-[#FFA62B]/20 overflow-hidden">
                                    <img
                                        src={user.avatarUrl}
                                        alt={user.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.onerror = null;
                                            target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=2F6BFF&color=fff&size=256`;
                                        }}
                                    />
                                </div>
                                <button className="absolute bottom-2 right-2 w-8 h-8 bg-[#16124A] hover:bg-[#2F6BFF] border border-[#2F6BFF]/30 rounded-full flex items-center justify-center transition-all">
                                    <Camera className="w-4 h-4 text-white" />
                                </button>
                            </div>

                            {/* Name and Info */}
                            <div className="flex-1 text-center sm:text-left mb-4 sm:mb-0">
                                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
                                    {user.name}
                                </h1>
                                <p className="text-sm text-gray-400 mb-2">
                                    {user.friendsCount} friends
                                </p>
                                {user.bio && (
                                    <p className="text-sm text-gray-300 max-w-2xl">
                                        {user.bio}
                                    </p>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2">
                                <button className="px-4 py-2 bg-gradient-to-r from-[#2F6BFF] to-[#3B82F6] hover:from-[#3B82F6] hover:to-[#2F6BFF] text-white rounded-lg font-semibold transition-all flex items-center gap-2">
                                    <Plus className="w-4 h-4" />
                                    Add to story
                                </button>
                                <button className="px-4 py-2 bg-[#16124A] hover:bg-[#2F6BFF]/20 border border-[#2F6BFF]/30 text-white rounded-lg font-semibold transition-all flex items-center gap-2">
                                    <Edit className="w-4 h-4" />
                                    Edit profile
                                </button>
                                <button className="p-2 bg-[#16124A] hover:bg-[#2F6BFF]/20 border border-[#2F6BFF]/30 text-white rounded-lg transition-all">
                                    <MoreHorizontal className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Main Navigation Tabs */}
                        <div className="border-b border-[#2F6BFF]/20">
                            <div className="flex items-center gap-6 overflow-x-auto scrollbar-hide">
                                {mainTabs.map((tab) => {
                                    const isActive = activeTab === tab.id;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`pb-3 px-1 text-sm font-semibold whitespace-nowrap transition-all duration-200 border-b-2 flex items-center gap-2 ${isActive
                                                ? 'text-[#2F6BFF] border-[#2F6BFF]'
                                                : 'text-gray-400 border-transparent hover:text-gray-200 hover:border-gray-600'
                                                }`}
                                        >
                                            {tab.label}
                                            {tab.count !== undefined && (
                                                <span className="text-xs text-gray-500">
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
                    <div className="py-6">
                        {activeTab === 'posts' && (
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative">
                                {/* Vertical Separator Line - Hidden on mobile, visible on lg+ */}
                                <div className="hidden lg:block absolute left-[41.666%] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#2F6BFF]/30 to-transparent"></div>

                                {/* Left Sidebar - Intro */}
                                <div className="lg:col-span-5">
                                    <div className="p-6 rounded-2xl bg-[#16124A]/50 border border-[#2F6BFF]/20">
                                        <h2 className="text-xl font-semibold text-white mb-4">Intro</h2>

                                        {/* Bio */}
                                        <div className="mb-4 text-center">
                                            <p className="text-sm text-gray-300 mb-3">
                                                💪 Helping Men & Women LOSE FAT & GET FIT without Losing Motivation
                                            </p>
                                            <p className="text-sm text-gray-300 mb-3">
                                                💬 DM me "Chase It" for more info
                                            </p>
                                        </div>

                                        {/* Info Items */}
                                        <div className="space-y-3 mb-4">
                                            <div className="flex items-center gap-3 text-sm text-gray-300">
                                                <span className="text-gray-400">💼</span>
                                                <span>Professional Trader</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm text-gray-300">
                                                <span className="text-gray-400">🎓</span>
                                                <span>Studied at <span className="font-semibold">Shippensburg University</span></span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm text-gray-300">
                                                <span className="text-gray-400">🎓</span>
                                                <span>Went to <span className="font-semibold">Olympic Heights Community High School</span></span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm text-gray-300">
                                                <span className="text-gray-400">🏠</span>
                                                <span>Lives in <span className="font-semibold">Boca Raton, Florida</span></span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm text-gray-300">
                                                <span className="text-gray-400">📍</span>
                                                <span>From <span className="font-semibold">Boca Raton, Florida</span></span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm text-gray-300">
                                                <span className="text-gray-400">👥</span>
                                                <span>Followed by <span className="font-semibold">150 people</span></span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm">
                                                <span className="text-gray-400">🔗</span>
                                                <a href="#" className="text-[#2F6BFF] hover:underline">linktr.ee/thechaselifestyle</a>
                                            </div>
                                        </div>

                                        {/* Edit Details Button */}
                                        <button className="w-full px-4 py-2 bg-[#2F6BFF]/20 hover:bg-[#2F6BFF]/30 border border-[#2F6BFF]/30 text-white rounded-lg text-sm font-semibold transition-all">
                                            Edit details
                                        </button>

                                        {/* Hobbies/Interests */}
                                        <div className="mt-4 pt-4 border-t border-[#2F6BFF]/20">
                                            <button className="w-full px-4 py-2 bg-[#2F6BFF]/20 hover:bg-[#2F6BFF]/30 border border-[#2F6BFF]/30 text-white rounded-lg text-sm font-semibold transition-all">
                                                Add hobbies
                                            </button>
                                        </div>

                                        {/* Featured */}
                                        <div className="mt-4 pt-4 border-t border-[#2F6BFF]/20">
                                            <button className="w-full px-4 py-2 bg-[#2F6BFF]/20 hover:bg-[#2F6BFF]/30 border border-[#2F6BFF]/30 text-white rounded-lg text-sm font-semibold transition-all">
                                                Add featured
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side - Posts Feed */}
                                <div className="lg:col-span-7">
                                    {/* Create Post Card */}
                                    <div className="mb-6 p-4 rounded-2xl bg-[#16124A]/50 border border-[#2F6BFF]/20">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2F6BFF]/20 to-[#FFA62B]/20 overflow-hidden">
                                                <img
                                                    src={user.avatarUrl}
                                                    alt={user.name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        target.onerror = null;
                                                        target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=2F6BFF&color=fff&size=128`;
                                                    }}
                                                />
                                            </div>
                                            <input
                                                type="text"
                                                placeholder={`Write something to ${user.name.split(' ')[0]}...`}
                                                className="flex-1 px-4 py-2.5 bg-[#0B0633] border border-[#2F6BFF]/20 rounded-full text-white placeholder-gray-500 focus:outline-none focus:border-[#2F6BFF] transition-all"
                                            />
                                        </div>
                                        <div className="flex items-center justify-around pt-3 border-t border-[#2F6BFF]/20">
                                            <button className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-[#2F6BFF]/10 rounded-lg transition-all">
                                                <span className="text-xl">🖼️</span>
                                                <span className="text-sm font-semibold hidden sm:inline">Photo/video</span>
                                            </button>
                                            <button className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-[#2F6BFF]/10 rounded-lg transition-all">
                                                <span className="text-xl">👥</span>
                                                <span className="text-sm font-semibold hidden sm:inline">Tag people</span>
                                            </button>
                                            <button className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-[#2F6BFF]/10 rounded-lg transition-all">
                                                <span className="text-xl">😊</span>
                                                <span className="text-sm font-semibold hidden sm:inline">Feeling/activity</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Posts Header with Filters */}
                                    <div className="mb-4 p-4 rounded-2xl bg-[#16124A]/50 border border-[#2F6BFF]/20">
                                        <div className="flex items-center justify-between">
                                            <h2 className="text-lg font-semibold text-white">Posts</h2>
                                            <button className="px-4 py-2 bg-[#2F6BFF]/20 hover:bg-[#2F6BFF]/30 border border-[#2F6BFF]/30 text-white rounded-lg text-sm font-semibold transition-all flex items-center gap-2">
                                                <span>⚙️</span>
                                                Filters
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-2 mt-3">
                                            <button className="px-4 py-2 bg-[#2F6BFF] text-white rounded-lg text-sm font-semibold transition-all">
                                                List view
                                            </button>
                                            <button className="px-4 py-2 bg-[#2F6BFF]/20 hover:bg-[#2F6BFF]/30 text-white rounded-lg text-sm font-semibold transition-all">
                                                Grid view
                                            </button>
                                        </div>
                                    </div>

                                    {/* Sample Post */}
                                    <div className="rounded-2xl bg-[#16124A]/50 border border-[#2F6BFF]/20 overflow-hidden mb-6">
                                        {/* Post Header */}
                                        <div className="p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2F6BFF]/20 to-[#FFA62B]/20 overflow-hidden">
                                                    <img
                                                        src={user.avatarUrl}
                                                        alt={user.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-semibold text-white">{user.name}</h3>
                                                    <p className="text-xs text-gray-400">
                                                        Reels · Aug 1 · 📹
                                                    </p>
                                                </div>
                                            </div>
                                            <button className="p-2 hover:bg-[#2F6BFF]/10 rounded-full transition-all">
                                                <MoreHorizontal className="w-5 h-5 text-gray-400" />
                                            </button>
                                        </div>

                                        {/* Post Video/Image */}
                                        <div className="relative w-full aspect-video bg-gradient-to-br from-[#0B0633] to-[#16124A]">
                                            <img
                                                src="https://images.unsplash.com/photo-1549476464-37392f717541?w=800&h=600&fit=crop"
                                                alt="Post content"
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <button className="w-16 h-16 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-all">
                                                    <span className="text-3xl">▶️</span>
                                                </button>
                                            </div>
                                            {/* Mute button */}
                                            <button className="absolute top-4 right-4 w-10 h-10 bg-[#16124A]/80 hover:bg-[#16124A] backdrop-blur-sm rounded-full flex items-center justify-center transition-all">
                                                <span className="text-white">🔇</span>
                                            </button>
                                            {/* More options */}
                                            <button className="absolute top-4 right-16 w-10 h-10 bg-[#16124A]/80 hover:bg-[#16124A] backdrop-blur-sm rounded-full flex items-center justify-center transition-all">
                                                <MoreHorizontal className="w-5 h-5 text-white" />
                                            </button>
                                        </div>

                                        {/* Post Stats & Actions would go here */}
                                        <div className="p-4">
                                            <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
                                                <span>👍 ❤️ 245 reactions</span>
                                                <div className="flex items-center gap-4">
                                                    <span>32 comments</span>
                                                    <span>15 shares</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-around pt-3 border-t border-[#2F6BFF]/20">
                                                <button className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-[#2F6BFF]/10 rounded-lg transition-all flex-1 justify-center">
                                                    <span>👍</span>
                                                    <span className="text-sm font-semibold">Like</span>
                                                </button>
                                                <button className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-[#2F6BFF]/10 rounded-lg transition-all flex-1 justify-center">
                                                    <span>💬</span>
                                                    <span className="text-sm font-semibold">Comment</span>
                                                </button>
                                                <button className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-[#2F6BFF]/10 rounded-lg transition-all flex-1 justify-center">
                                                    <span>↗️</span>
                                                    <span className="text-sm font-semibold">Share</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Post 2 - Text Only */}
                                    <div className="rounded-2xl bg-[#16124A]/50 border border-[#2F6BFF]/20 overflow-hidden mb-6">
                                        <div className="p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2F6BFF]/20 to-[#FFA62B]/20 overflow-hidden">
                                                    <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-semibold text-white">{user.name}</h3>
                                                    <p className="text-xs text-gray-400">July 28 · 🌍</p>
                                                </div>
                                            </div>
                                            <button className="p-2 hover:bg-[#2F6BFF]/10 rounded-full transition-all">
                                                <MoreHorizontal className="w-5 h-5 text-gray-400" />
                                            </button>
                                        </div>
                                        <div className="px-4 pb-4">
                                            <p className="text-white text-base leading-relaxed">
                                                Just hit my monthly trading goal! 🎯📈 Consistency and discipline are the keys to success. Remember: it's not about making quick money, it's about building sustainable wealth over time. Keep grinding! 💪
                                            </p>
                                        </div>
                                        <div className="px-4 pb-4">
                                            <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
                                                <span>👍 ❤️ 🔥 189 reactions</span>
                                                <div className="flex items-center gap-4">
                                                    <span>45 comments</span>
                                                    <span>23 shares</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-around pt-3 border-t border-[#2F6BFF]/20">
                                                <button className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-[#2F6BFF]/10 rounded-lg transition-all flex-1 justify-center">
                                                    <span>👍</span>
                                                    <span className="text-sm font-semibold">Like</span>
                                                </button>
                                                <button className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-[#2F6BFF]/10 rounded-lg transition-all flex-1 justify-center">
                                                    <span>💬</span>
                                                    <span className="text-sm font-semibold">Comment</span>
                                                </button>
                                                <button className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-[#2F6BFF]/10 rounded-lg transition-all flex-1 justify-center">
                                                    <span>↗️</span>
                                                    <span className="text-sm font-semibold">Share</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Post 3 - Image Post */}
                                    <div className="rounded-2xl bg-[#16124A]/50 border border-[#2F6BFF]/20 overflow-hidden mb-6">
                                        <div className="p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2F6BFF]/20 to-[#FFA62B]/20 overflow-hidden">
                                                    <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-semibold text-white">{user.name}</h3>
                                                    <p className="text-xs text-gray-400">July 25 · 🌍</p>
                                                </div>
                                            </div>
                                            <button className="p-2 hover:bg-[#2F6BFF]/10 rounded-full transition-all">
                                                <MoreHorizontal className="w-5 h-5 text-gray-400" />
                                            </button>
                                        </div>
                                        <div className="px-4 pb-3">
                                            <p className="text-white">Morning motivation! Start your day with purpose 🌅☕</p>
                                        </div>
                                        <div className="w-full">
                                            <img
                                                src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=600&fit=crop"
                                                alt="Morning coffee"
                                                className="w-full object-cover max-h-96"
                                            />
                                        </div>
                                        <div className="p-4">
                                            <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
                                                <span>👍 ❤️ 156 reactions</span>
                                                <div className="flex items-center gap-4">
                                                    <span>28 comments</span>
                                                    <span>12 shares</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-around pt-3 border-t border-[#2F6BFF]/20">
                                                <button className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-[#2F6BFF]/10 rounded-lg transition-all flex-1 justify-center">
                                                    <span>👍</span>
                                                    <span className="text-sm font-semibold">Like</span>
                                                </button>
                                                <button className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-[#2F6BFF]/10 rounded-lg transition-all flex-1 justify-center">
                                                    <span>💬</span>
                                                    <span className="text-sm font-semibold">Comment</span>
                                                </button>
                                                <button className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-[#2F6BFF]/10 rounded-lg transition-all flex-1 justify-center">
                                                    <span>↗️</span>
                                                    <span className="text-sm font-semibold">Share</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Post 4 - Link Preview */}
                                    <div className="rounded-2xl bg-[#16124A]/50 border border-[#2F6BFF]/20 overflow-hidden mb-6">
                                        <div className="p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2F6BFF]/20 to-[#FFA62B]/20 overflow-hidden">
                                                    <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-semibold text-white">{user.name}</h3>
                                                    <p className="text-xs text-gray-400">July 20 · 🌍</p>
                                                </div>
                                            </div>
                                            <button className="p-2 hover:bg-[#2F6BFF]/10 rounded-full transition-all">
                                                <MoreHorizontal className="w-5 h-5 text-gray-400" />
                                            </button>
                                        </div>
                                        <div className="px-4 pb-3">
                                            <p className="text-white">Great insights on market analysis! 📊 Must read for all traders.</p>
                                        </div>
                                        <a
                                            href="#"
                                            className="block border-t border-[#2F6BFF]/20 hover:bg-[#2F6BFF]/5 transition-all"
                                        >
                                            <div className="w-full">
                                                <img
                                                    src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=400&fit=crop"
                                                    alt="Market analysis"
                                                    className="w-full object-cover max-h-64"
                                                />
                                            </div>
                                            <div className="p-4">
                                                <p className="text-xs text-gray-500 uppercase mb-1">tradinginsights.com</p>
                                                <h4 className="text-white font-semibold mb-1 line-clamp-2">
                                                    5 Essential Trading Strategies for 2024
                                                </h4>
                                                <p className="text-sm text-gray-400 line-clamp-2">
                                                    Learn the most effective trading strategies used by professional traders to maximize profits and minimize risks.
                                                </p>
                                            </div>
                                        </a>
                                        <div className="p-4">
                                            <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
                                                <span>👍 ❤️ 203 reactions</span>
                                                <div className="flex items-center gap-4">
                                                    <span>67 comments</span>
                                                    <span>89 shares</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-around pt-3 border-t border-[#2F6BFF]/20">
                                                <button className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-[#2F6BFF]/10 rounded-lg transition-all flex-1 justify-center">
                                                    <span>👍</span>
                                                    <span className="text-sm font-semibold">Like</span>
                                                </button>
                                                <button className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-[#2F6BFF]/10 rounded-lg transition-all flex-1 justify-center">
                                                    <span>💬</span>
                                                    <span className="text-sm font-semibold">Comment</span>
                                                </button>
                                                <button className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-[#2F6BFF]/10 rounded-lg transition-all flex-1 justify-center">
                                                    <span>↗️</span>
                                                    <span className="text-sm font-semibold">Share</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Post 5 - Multiple Images */}
                                    <div className="rounded-2xl bg-[#16124A]/50 border border-[#2F6BFF]/20 overflow-hidden mb-6">
                                        <div className="p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2F6BFF]/20 to-[#FFA62B]/20 overflow-hidden">
                                                    <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-semibold text-white">{user.name}</h3>
                                                    <p className="text-xs text-gray-400">July 15 · 🌍</p>
                                                </div>
                                            </div>
                                            <button className="p-2 hover:bg-[#2F6BFF]/10 rounded-full transition-all">
                                                <MoreHorizontal className="w-5 h-5 text-gray-400" />
                                            </button>
                                        </div>
                                        <div className="px-4 pb-3">
                                            <p className="text-white">Amazing weekend getaway! 🏖️ Sometimes you need to disconnect to reconnect. #WorkLifeBalance</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-1">
                                            <img
                                                src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=400&fit=crop"
                                                alt="Beach 1"
                                                className="w-full h-64 object-cover"
                                            />
                                            <img
                                                src="https://images.unsplash.com/photo-1519046904884-53103b34b206?w=400&h=400&fit=crop"
                                                alt="Beach 2"
                                                className="w-full h-64 object-cover"
                                            />
                                        </div>
                                        <div className="p-4">
                                            <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
                                                <span>👍 ❤️ 🔥 312 reactions</span>
                                                <div className="flex items-center gap-4">
                                                    <span>89 comments</span>
                                                    <span>34 shares</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-around pt-3 border-t border-[#2F6BFF]/20">
                                                <button className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-[#2F6BFF]/10 rounded-lg transition-all flex-1 justify-center">
                                                    <span>👍</span>
                                                    <span className="text-sm font-semibold">Like</span>
                                                </button>
                                                <button className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-[#2F6BFF]/10 rounded-lg transition-all flex-1 justify-center">
                                                    <span>💬</span>
                                                    <span className="text-sm font-semibold">Comment</span>
                                                </button>
                                                <button className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-[#2F6BFF]/10 rounded-lg transition-all flex-1 justify-center">
                                                    <span>↗️</span>
                                                    <span className="text-sm font-semibold">Share</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Post 6 - Achievement Post */}
                                    <div className="rounded-2xl bg-[#16124A]/50 border border-[#2F6BFF]/20 overflow-hidden mb-6">
                                        <div className="p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2F6BFF]/20 to-[#FFA62B]/20 overflow-hidden">
                                                    <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-semibold text-white">{user.name}</h3>
                                                    <p className="text-xs text-gray-400">July 10 · 🌍</p>
                                                </div>
                                            </div>
                                            <button className="p-2 hover:bg-[#2F6BFF]/10 rounded-full transition-all">
                                                <MoreHorizontal className="w-5 h-5 text-gray-400" />
                                            </button>
                                        </div>
                                        <div className="px-4 pb-3">
                                            <p className="text-white text-base leading-relaxed">
                                                🎉 Celebrating 1 year of profitable trading! 🚀<br /><br />
                                                From losing my first $500 to now managing a 6-figure portfolio. The journey wasn't easy, but every loss taught me something valuable.<br /><br />
                                                Key lessons:<br />
                                                ✅ Risk management is everything<br />
                                                ✅ Emotions are your worst enemy<br />
                                                ✅ Patience pays off<br />
                                                ✅ Never stop learning<br /><br />
                                                Thank you to everyone who supported me along the way! 🙏💙
                                            </p>
                                        </div>
                                        <div className="p-4">
                                            <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
                                                <span>👍 ❤️ 🔥 🎉 567 reactions</span>
                                                <div className="flex items-center gap-4">
                                                    <span>134 comments</span>
                                                    <span>78 shares</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-around pt-3 border-t border-[#2F6BFF]/20">
                                                <button className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-[#2F6BFF]/10 rounded-lg transition-all flex-1 justify-center">
                                                    <span>👍</span>
                                                    <span className="text-sm font-semibold">Like</span>
                                                </button>
                                                <button className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-[#2F6BFF]/10 rounded-lg transition-all flex-1 justify-center">
                                                    <span>💬</span>
                                                    <span className="text-sm font-semibold">Comment</span>
                                                </button>
                                                <button className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-[#2F6BFF]/10 rounded-lg transition-all flex-1 justify-center">
                                                    <span>↗️</span>
                                                    <span className="text-sm font-semibold">Share</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* No more posts message */}
                                    <div className="text-center py-8 text-gray-400">
                                        <p className="text-sm">No more posts to show</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'friends' && (
                            <div className="max-w-5xl mx-auto">
                                {/* Friends Header */}
                                <div className="mb-6">
                                    <h2 className="text-2xl font-bold text-white mb-4">Friends</h2>

                                    {/* Search Bar */}
                                    <div className="mb-4">
                                        <input
                                            type="text"
                                            placeholder="Search"
                                            className="w-full max-w-md px-4 py-2.5 bg-[#16124A]/50 border border-[#2F6BFF]/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#2F6BFF] transition-all"
                                        />
                                    </div>

                                    {/* Filter Tabs */}
                                    <div className="flex items-center gap-6 overflow-x-auto scrollbar-hide border-b border-[#2F6BFF]/20">
                                        {['All friends', 'Mutual Friends', 'Recently Added', 'College', 'High School', 'Current city', 'Hometown', 'Followers', 'Following'].map((filter) => (
                                            <button
                                                key={filter}
                                                className={`pb-3 px-1 text-sm font-semibold whitespace-nowrap transition-all border-b-2 ${filter === 'All friends'
                                                    ? 'text-[#2F6BFF] border-[#2F6BFF]'
                                                    : 'text-gray-400 border-transparent hover:text-gray-200'
                                                    }`}
                                            >
                                                {filter}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Friends Grid - 2 Columns */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[
                                        { id: '1', name: 'Roberto Cotton', mutualFriends: 32, avatar: 'https://i.pravatar.cc/150?img=12' },
                                        { id: '2', name: 'Heather Daniel', mutualFriends: 8, avatar: 'https://i.pravatar.cc/150?img=5' },
                                        { id: '3', name: 'Elizabeth Elizabeth', mutualFriends: 27, avatar: 'https://i.pravatar.cc/150?img=9' },
                                        { id: '4', name: 'Diana Grace James', mutualFriends: 9, avatar: 'https://i.pravatar.cc/150?img=10' },
                                        { id: '5', name: 'Michael Brown', mutualFriends: 15, avatar: 'https://i.pravatar.cc/150?img=7' },
                                        { id: '6', name: 'Sarah Wilson', mutualFriends: 23, avatar: 'https://i.pravatar.cc/150?img=6' },
                                        { id: '7', name: 'Tom Anderson', mutualFriends: 41, avatar: 'https://i.pravatar.cc/150?img=8' },
                                        { id: '8', name: 'Jessica Martinez', mutualFriends: 12, avatar: 'https://i.pravatar.cc/150?img=11' },
                                        { id: '9', name: 'David Johnson', mutualFriends: 19, avatar: 'https://i.pravatar.cc/150?img=13' },
                                        { id: '10', name: 'Emily Davis', mutualFriends: 34, avatar: 'https://i.pravatar.cc/150?img=14' },
                                        { id: '11', name: 'Chris Taylor', mutualFriends: 7, avatar: 'https://i.pravatar.cc/150?img=15' },
                                        { id: '12', name: 'Amanda White', mutualFriends: 28, avatar: 'https://i.pravatar.cc/150?img=16' },
                                    ].map((friend) => (
                                        <div
                                            key={friend.id}
                                            onClick={() => navigate(`/social/user/${friend.id}`)}
                                            className="flex items-center gap-4 p-4 rounded-xl bg-[#16124A]/50 border border-[#2F6BFF]/20 hover:bg-[#16124A]/70 transition-all cursor-pointer"
                                        >
                                            {/* Friend Avatar */}
                                            <div className="w-20 h-20 rounded-xl overflow-hidden bg-gradient-to-br from-[#2F6BFF]/20 to-[#FFA62B]/20 flex-shrink-0">
                                                <img
                                                    src={friend.avatar}
                                                    alt={friend.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>

                                            {/* Friend Info */}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-base font-semibold text-white mb-1 truncate">
                                                    {friend.name}
                                                </h3>
                                                <p className="text-sm text-gray-400 mb-2">
                                                    {friend.mutualFriends} mutual friends
                                                </p>
                                            </div>

                                            {/* More Options Button */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    // Handle more options
                                                }}
                                                className="p-2 hover:bg-[#2F6BFF]/10 rounded-full transition-all flex-shrink-0"
                                            >
                                                <MoreHorizontal className="w-5 h-5 text-gray-400" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'about' && (
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative">
                                {/* Vertical Separator Line */}
                                <div className="hidden lg:block absolute left-[41.666%] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#2F6BFF]/30 to-transparent"></div>

                                {/* Left Column - Overview Only */}
                                <div className="lg:col-span-5">
                                    <div className="p-6 rounded-2xl bg-[#16124A]/50 border border-[#2F6BFF]/20">
                                        <h2 className="text-lg font-semibold text-white mb-4">Overview</h2>
                                        <div className="space-y-3">
                                            <div className="flex items-start gap-3">
                                                <span className="text-xl">💼</span>
                                                <div>
                                                    <p className="text-sm text-white">Works at <span className="font-semibold">LemoTick Trading</span></p>
                                                    <p className="text-xs text-gray-400">Senior Trader · 2020 - Present</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <span className="text-xl">🎓</span>
                                                <div>
                                                    <p className="text-sm text-white">Studied at <span className="font-semibold">Shippensburg University</span></p>
                                                    <p className="text-xs text-gray-400">Bachelor's in Finance · 2016 - 2020</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <span className="text-xl">🏠</span>
                                                <p className="text-sm text-white">Lives in <span className="font-semibold">Boca Raton, Florida</span></p>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <span className="text-xl">📍</span>
                                                <p className="text-sm text-white">From <span className="font-semibold">Miami, Florida</span></p>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <span className="text-xl">❤️</span>
                                                <p className="text-sm text-white">Single</p>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <span className="text-xl">🎂</span>
                                                <p className="text-sm text-white">Born on <span className="font-semibold">March 15, 1998</span></p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column - All Other Sections */}
                                <div className="lg:col-span-7 space-y-4">
                                    {/* Work and Education */}
                                    <div className="p-6 rounded-2xl bg-[#16124A]/50 border border-[#2F6BFF]/20">
                                        <div className="flex items-center justify-between mb-4">
                                            <h2 className="text-lg font-semibold text-white">Work and Education</h2>
                                            <button className="text-sm text-[#2F6BFF] hover:text-[#FFA62B] font-semibold transition-colors">
                                                Edit
                                            </button>
                                        </div>
                                        <div className="space-y-4">
                                            {/* Work */}
                                            <div className="flex items-start gap-4">
                                                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#2F6BFF]/20 to-[#FFA62B]/20 flex items-center justify-center flex-shrink-0">
                                                    <span className="text-xl">💼</span>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm text-white font-semibold">Senior Trader at LemoTick Trading</p>
                                                    <p className="text-xs text-gray-400">2020 - Present · Boca Raton, FL</p>
                                                    <p className="text-xs text-gray-300 mt-2">Specializing in cryptocurrency and forex trading with focus on algorithmic strategies.</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-4">
                                                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#2F6BFF]/20 to-[#FFA62B]/20 flex items-center justify-center flex-shrink-0">
                                                    <span className="text-xl">💼</span>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm text-white font-semibold">Junior Analyst at Goldman Sachs</p>
                                                    <p className="text-xs text-gray-400">2018 - 2020 · New York, NY</p>
                                                </div>
                                            </div>
                                            {/* Education */}
                                            <div className="flex items-start gap-4 pt-4 border-t border-[#2F6BFF]/20">
                                                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#2F6BFF]/20 to-[#FFA62B]/20 flex items-center justify-center flex-shrink-0">
                                                    <span className="text-xl">🎓</span>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm text-white font-semibold">Shippensburg University</p>
                                                    <p className="text-xs text-gray-400">Bachelor's Degree in Finance · 2016 - 2020</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-4">
                                                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#2F6BFF]/20 to-[#FFA62B]/20 flex items-center justify-center flex-shrink-0">
                                                    <span className="text-xl">🎓</span>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm text-white font-semibold">Olympic Heights Community High School</p>
                                                    <p className="text-xs text-gray-400">2012 - 2016</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Places Lived */}
                                    <div className="p-6 rounded-2xl bg-[#16124A]/50 border border-[#2F6BFF]/20">
                                        <div className="flex items-center justify-between mb-4">
                                            <h2 className="text-lg font-semibold text-white">Places Lived</h2>
                                            <button className="text-sm text-[#2F6BFF] hover:text-[#FFA62B] font-semibold transition-colors">
                                                Edit
                                            </button>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex items-start gap-4">
                                                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#2F6BFF]/20 to-[#FFA62B]/20 flex items-center justify-center flex-shrink-0">
                                                    <span className="text-xl">🏠</span>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm text-white font-semibold">Boca Raton, Florida</p>
                                                    <p className="text-xs text-gray-400">Current City · Since 2020</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-4">
                                                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#2F6BFF]/20 to-[#FFA62B]/20 flex items-center justify-center flex-shrink-0">
                                                    <span className="text-xl">📍</span>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm text-white font-semibold">Miami, Florida</p>
                                                    <p className="text-xs text-gray-400">Hometown</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Contact and Basic Info */}
                                    <div className="p-6 rounded-2xl bg-[#16124A]/50 border border-[#2F6BFF]/20">
                                        <div className="flex items-center justify-between mb-4">
                                            <h2 className="text-lg font-semibold text-white">Contact and Basic Info</h2>
                                            <button className="text-sm text-[#2F6BFF] hover:text-[#FFA62B] font-semibold transition-colors">
                                                Edit
                                            </button>
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <h3 className="text-xs font-semibold text-gray-400 uppercase mb-3">Contact Info</h3>
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-lg">📱</span>
                                                        <p className="text-sm text-white">+1 (561) 555-0123</p>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-lg">✉️</span>
                                                        <p className="text-sm text-white">john.trader@lemotick.com</p>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-lg">🔗</span>
                                                        <a href="#" className="text-sm text-[#2F6BFF] hover:underline">linktr.ee/thechaselifestyle</a>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="pt-4 border-t border-[#2F6BFF]/20">
                                                <h3 className="text-xs font-semibold text-gray-400 uppercase mb-3">Basic Info</h3>
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-lg">🎂</span>
                                                        <p className="text-sm text-white">March 15, 1998</p>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-lg">⚧️</span>
                                                        <p className="text-sm text-white">Male</p>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-lg">💬</span>
                                                        <p className="text-sm text-white">English, Spanish</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Websites and Social Links */}
                                    <div className="p-6 rounded-2xl bg-[#16124A]/50 border border-[#2F6BFF]/20">
                                        <div className="flex items-center justify-between mb-4">
                                            <h2 className="text-lg font-semibold text-white">Websites and Social Links</h2>
                                            <button className="text-sm text-[#2F6BFF] hover:text-[#FFA62B] font-semibold transition-colors">
                                                Edit
                                            </button>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <span className="text-lg">🌐</span>
                                                <a href="#" className="text-sm text-[#2F6BFF] hover:underline">www.johntrader.com</a>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-lg">💼</span>
                                                <a href="#" className="text-sm text-[#2F6BFF] hover:underline">linkedin.com/in/johntrader</a>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-lg">🐦</span>
                                                <a href="#" className="text-sm text-[#2F6BFF] hover:underline">twitter.com/johntrader</a>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-lg">📸</span>
                                                <a href="#" className="text-sm text-[#2F6BFF] hover:underline">instagram.com/johntrader</a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'photos' && (
                            <div className="max-w-6xl mx-auto">
                                {/* Photos Sub-tabs */}
                                <div className="mb-6 border-b border-[#2F6BFF]/20">
                                    <div className="flex items-center gap-6 overflow-x-auto scrollbar-hide">
                                        {['Your Photos', 'Tagged Photos', 'Albums'].map((tab, idx) => (
                                            <button
                                                key={tab}
                                                className={`pb-3 px-1 text-sm font-semibold whitespace-nowrap transition-all border-b-2 ${idx === 0
                                                    ? 'text-[#2F6BFF] border-[#2F6BFF]'
                                                    : 'text-gray-400 border-transparent hover:text-gray-200'
                                                    }`}
                                            >
                                                {tab}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Photos Grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                                    {[
                                        'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=400&fit=crop',
                                        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=400&fit=crop',
                                        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=400&fit=crop',
                                        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=400&fit=crop',
                                        'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=400&h=400&fit=crop',
                                        'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop',
                                        'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400&h=400&fit=crop',
                                        'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=400&fit=crop',
                                        'https://images.unsplash.com/photo-1549476464-37392f717541?w=400&h=400&fit=crop',
                                        'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=400&fit=crop&sat=-100',
                                        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=400&fit=crop&sat=-100',
                                        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=400&fit=crop&sat=-100',
                                        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=400&fit=crop&sat=-100',
                                        'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=400&h=400&fit=crop&sat=-100',
                                        'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop&sat=-100',
                                        'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400&h=400&fit=crop&sat=-100',
                                        'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=400&fit=crop&sat=-100',
                                        'https://images.unsplash.com/photo-1549476464-37392f717541?w=400&h=400&fit=crop&sat=-100',
                                        'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=400&fit=crop&hue=180',
                                        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=400&fit=crop&hue=180',
                                    ].map((photo, idx) => (
                                        <div
                                            key={idx}
                                            className="aspect-square rounded-lg overflow-hidden bg-[#0B0633] hover:opacity-80 transition-opacity cursor-pointer group relative"
                                        >
                                            <img
                                                src={photo}
                                                alt={`Photo ${idx + 1}`}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                            {/* Hover Overlay */}
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300"></div>
                                        </div>
                                    ))}
                                </div>

                                {/* Load More Button */}
                                <div className="text-center py-8">
                                    <button className="px-6 py-3 bg-[#16124A] hover:bg-[#2F6BFF]/20 border border-[#2F6BFF]/30 text-white rounded-xl font-semibold transition-all">
                                        Load More Photos
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'videos' && (
                            <div className="max-w-6xl mx-auto">
                                {/* Videos Sub-tabs */}
                                <div className="mb-6 border-b border-[#2F6BFF]/20">
                                    <div className="flex items-center gap-6 overflow-x-auto scrollbar-hide">
                                        {['Your Videos', 'Tagged Videos', 'Playlists'].map((tab, idx) => (
                                            <button
                                                key={tab}
                                                className={`pb-3 px-1 text-sm font-semibold whitespace-nowrap transition-all border-b-2 ${idx === 0
                                                    ? 'text-[#2F6BFF] border-[#2F6BFF]'
                                                    : 'text-gray-400 border-transparent hover:text-gray-200'
                                                    }`}
                                            >
                                                {tab}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Videos Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {[
                                        { thumbnail: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&h=400&fit=crop', title: 'Trading Strategy Breakdown', duration: '12:45', views: '2.3K' },
                                        { thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop', title: 'Market Analysis - Weekly Review', duration: '18:32', views: '5.1K' },
                                        { thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop', title: 'How I Made $10K in One Trade', duration: '15:20', views: '12.8K' },
                                        { thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop', title: 'Beach Day Vlog', duration: '8:15', views: '1.2K' },
                                        { thumbnail: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=600&h=400&fit=crop', title: 'Crypto Trading Tips for Beginners', duration: '22:10', views: '8.9K' },
                                        { thumbnail: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=400&fit=crop', title: 'Morning Routine of a Trader', duration: '10:05', views: '3.4K' },
                                        { thumbnail: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=600&h=400&fit=crop', title: 'Technical Analysis Masterclass', duration: '45:30', views: '15.2K' },
                                        { thumbnail: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&h=400&fit=crop', title: 'Office Tour & Setup', duration: '6:40', views: '2.7K' },
                                        { thumbnail: 'https://images.unsplash.com/photo-1549476464-37392f717541?w=600&h=400&fit=crop', title: 'Live Trading Session', duration: '1:32:15', views: '9.5K' },
                                    ].map((video, idx) => (
                                        <div
                                            key={idx}
                                            className="rounded-xl overflow-hidden bg-[#16124A]/50 border border-[#2F6BFF]/20 hover:bg-[#16124A]/70 transition-all cursor-pointer group"
                                        >
                                            {/* Video Thumbnail */}
                                            <div className="relative aspect-video bg-[#0B0633] overflow-hidden">
                                                <img
                                                    src={video.thumbnail}
                                                    alt={video.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                                {/* Play Button Overlay */}
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-all">
                                                    <div className="w-16 h-16 bg-white/90 group-hover:bg-white rounded-full flex items-center justify-center transition-all">
                                                        <span className="text-2xl ml-1">▶️</span>
                                                    </div>
                                                </div>
                                                {/* Duration Badge */}
                                                <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 text-white text-xs font-semibold rounded">
                                                    {video.duration}
                                                </div>
                                            </div>

                                            {/* Video Info */}
                                            <div className="p-4">
                                                <h3 className="text-sm font-semibold text-white mb-2 line-clamp-2">
                                                    {video.title}
                                                </h3>
                                                <div className="flex items-center justify-between text-xs text-gray-400">
                                                    <span>{video.views} views</span>
                                                    <span>2 days ago</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Load More Button */}
                                <div className="text-center py-8">
                                    <button className="px-6 py-3 bg-[#16124A] hover:bg-[#2F6BFF]/20 border border-[#2F6BFF]/30 text-white rounded-xl font-semibold transition-all">
                                        Load More Videos
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </PageSection>
            </PageContainer>
        </div>
    );
}
