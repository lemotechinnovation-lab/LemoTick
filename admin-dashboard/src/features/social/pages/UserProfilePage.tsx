// UserProfilePage - View another user's profile (non-editable, Facebook-style)

import { PageContainer, PageSection } from '@/components/ui/PageLayoutEnhanced';
import { Camera, MessageCircle, MoreHorizontal, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';

type MainTab = 'posts' | 'about' | 'friends' | 'photos' | 'videos';

export default function UserProfilePage() {
    const { userId } = useParams();
    const [activeTab, setActiveTab] = useState<MainTab>('posts');
    const [isFriend, setIsFriend] = useState(false); // Track friendship status

    // Mock user data - replace with actual data fetched by userId
    const user = {
        id: userId || '1',
        name: 'Roberto Cotton',
        bio: 'Professional trader | Crypto enthusiast | Building wealth through smart investments',
        friendsCount: 542,
        mutualFriendsCount: 32,
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
        coverUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&h=400&fit=crop',
    };

    const mainTabs = [
        { id: 'posts' as MainTab, label: 'Posts' },
        { id: 'about' as MainTab, label: 'About' },
        { id: 'friends' as MainTab, label: 'Friends', count: user.friendsCount },
        { id: 'photos' as MainTab, label: 'Photos' },
        { id: 'videos' as MainTab, label: 'Videos' },
    ];

    const handleAddFriend = () => {
        setIsFriend(!isFriend);
    };

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
                        </div>
                    </div>
                )}
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
                            </div>

                            {/* Name and Info */}
                            <div className="flex-1 text-center sm:text-left mb-4 sm:mb-0">
                                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
                                    {user.name}
                                </h1>
                                <p className="text-sm text-gray-400 mb-2">
                                    {user.friendsCount} friends · {user.mutualFriendsCount} mutual
                                </p>
                                {/* Mutual Friends Avatars */}
                                <div className="flex items-center justify-center sm:justify-start gap-1">
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                        <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0B0633] overflow-hidden -ml-2 first:ml-0">
                                            <img
                                                src={`https://i.pravatar.cc/150?img=${i}`}
                                                alt={`Mutual friend ${i}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleAddFriend}
                                    className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${isFriend
                                        ? 'bg-[#16124A] hover:bg-[#2F6BFF]/20 border border-[#2F6BFF]/30 text-white'
                                        : 'bg-gradient-to-r from-[#2F6BFF] to-[#3B82F6] hover:from-[#3B82F6] hover:to-[#2F6BFF] text-white'
                                        }`}
                                >
                                    <UserPlus className="w-4 h-4" />
                                    {isFriend ? 'Friends' : 'Add Friend'}
                                </button>
                                <button className="px-4 py-2 bg-[#16124A] hover:bg-[#2F6BFF]/20 border border-[#2F6BFF]/30 text-white rounded-lg font-semibold transition-all flex items-center gap-2">
                                    <MessageCircle className="w-4 h-4" />
                                    Message
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
                                {/* Vertical Separator Line */}
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
                                    </div>
                                </div>

                                {/* Right Side - Posts Feed */}
                                <div className="lg:col-span-7">
                                    {/* Posts will be displayed here */}
                                    <div className="text-center py-12 text-gray-400">
                                        <p>No posts to show</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'friends' && (
                            <div className="max-w-5xl mx-auto">
                                <div className="text-center py-12 text-gray-400">
                                    <p>Friends list will be displayed here</p>
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
                                                    <p className="text-sm text-white">Works at <span className="font-semibold">TechCorp Solutions</span></p>
                                                    <p className="text-xs text-gray-400">Software Engineer · 2019 - Present</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <span className="text-xl">🎓</span>
                                                <div>
                                                    <p className="text-sm text-white">Studied at <span className="font-semibold">MIT</span></p>
                                                    <p className="text-xs text-gray-400">Computer Science · 2015 - 2019</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <span className="text-xl">🏠</span>
                                                <p className="text-sm text-white">Lives in <span className="font-semibold">San Francisco, California</span></p>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <span className="text-xl">📍</span>
                                                <p className="text-sm text-white">From <span className="font-semibold">Boston, Massachusetts</span></p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column - All Other Sections */}
                                <div className="lg:col-span-7 space-y-4">
                                    {/* Work and Education */}
                                    <div className="p-6 rounded-2xl bg-[#16124A]/50 border border-[#2F6BFF]/20">
                                        <h2 className="text-lg font-semibold text-white mb-4">Work and Education</h2>
                                        <div className="space-y-4">
                                            {/* Work */}
                                            <div className="flex items-start gap-4">
                                                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#2F6BFF]/20 to-[#FFA62B]/20 flex items-center justify-center flex-shrink-0">
                                                    <span className="text-xl">💼</span>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm text-white font-semibold">Software Engineer at TechCorp Solutions</p>
                                                    <p className="text-xs text-gray-400">2019 - Present · San Francisco, CA</p>
                                                    <p className="text-xs text-gray-300 mt-2">Building scalable web applications and leading frontend development initiatives.</p>
                                                </div>
                                            </div>
                                            {/* Education */}
                                            <div className="flex items-start gap-4 pt-4 border-t border-[#2F6BFF]/20">
                                                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#2F6BFF]/20 to-[#FFA62B]/20 flex items-center justify-center flex-shrink-0">
                                                    <span className="text-xl">🎓</span>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm text-white font-semibold">Massachusetts Institute of Technology (MIT)</p>
                                                    <p className="text-xs text-gray-400">Bachelor's Degree in Computer Science · 2015 - 2019</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Places Lived */}
                                    <div className="p-6 rounded-2xl bg-[#16124A]/50 border border-[#2F6BFF]/20">
                                        <h2 className="text-lg font-semibold text-white mb-4">Places Lived</h2>
                                        <div className="space-y-4">
                                            <div className="flex items-start gap-4">
                                                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#2F6BFF]/20 to-[#FFA62B]/20 flex items-center justify-center flex-shrink-0">
                                                    <span className="text-xl">🏠</span>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm text-white font-semibold">San Francisco, California</p>
                                                    <p className="text-xs text-gray-400">Current City · Since 2019</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-4">
                                                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#2F6BFF]/20 to-[#FFA62B]/20 flex items-center justify-center flex-shrink-0">
                                                    <span className="text-xl">📍</span>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm text-white font-semibold">Boston, Massachusetts</p>
                                                    <p className="text-xs text-gray-400">Hometown</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Websites and Social Links */}
                                    <div className="p-6 rounded-2xl bg-[#16124A]/50 border border-[#2F6BFF]/20">
                                        <h2 className="text-lg font-semibold text-white mb-4">Websites and Social Links</h2>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <span className="text-lg">🌐</span>
                                                <a href="#" className="text-sm text-[#2F6BFF] hover:underline">www.robertocotton.dev</a>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-lg">💼</span>
                                                <a href="#" className="text-sm text-[#2F6BFF] hover:underline">linkedin.com/in/robertocotton</a>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-lg">🐙</span>
                                                <a href="#" className="text-sm text-[#2F6BFF] hover:underline">github.com/robertocotton</a>
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
