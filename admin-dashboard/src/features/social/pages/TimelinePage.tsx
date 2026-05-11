// TimelinePage - Social feed with stories and posts (Facebook-style)

import { PageContainer, PageSection } from '@/components/ui/PageLayoutEnhanced';
import { Camera, Heart, Image, MessageCircle, MoreHorizontal, Share2, ThumbsUp, Video } from 'lucide-react';

interface PostLink {
    url: string;
    title: string;
    description: string;
    image?: string;
}

interface Post {
    id: string;
    author: string;
    authorAvatar: string;
    timestamp: string;
    privacy: string;
    content: string;
    image?: string;
    link?: PostLink;
    likes: number;
    comments: number;
    shares: number;
}

export default function TimelinePage() {

    // Mock data - replace with actual data from store
    const user = {
        name: 'John Trader',
        avatarUrl: '/src/images/user-avatar-32.png',
    };

    const stories = [
        { id: '1', name: 'Add to Story', avatarUrl: user.avatarUrl, isAddStory: true },
        { id: '2', name: 'Tom Russo', avatarUrl: 'https://i.pravatar.cc/150?img=12', hasStory: true },
        { id: '3', name: 'Anna Becklund', avatarUrl: 'https://i.pravatar.cc/150?img=5', hasStory: true },
        { id: '4', name: 'Dennis Han', avatarUrl: 'https://i.pravatar.cc/150?img=7', hasStory: true },
        { id: '5', name: 'Cynthia Lopez', avatarUrl: 'https://i.pravatar.cc/150?img=9', hasStory: true },
        { id: '6', name: 'Eric Jones', avatarUrl: 'https://i.pravatar.cc/150?img=2', hasStory: true },
        { id: '7', name: 'Betty Chen', avatarUrl: 'https://i.pravatar.cc/150?img=6', hasStory: true },
        { id: '8', name: 'Aiden Brown', avatarUrl: 'https://i.pravatar.cc/150?img=4', hasStory: true },
        { id: '9', name: 'Dan Brown', avatarUrl: 'https://i.pravatar.cc/150?img=8', hasStory: true },
        { id: '10', name: 'Henri Cook', avatarUrl: 'https://i.pravatar.cc/150?img=3', hasStory: true },
        { id: '11', name: 'Sarah Miller', avatarUrl: 'https://i.pravatar.cc/150?img=10', hasStory: true },
        { id: '12', name: 'Mike Wilson', avatarUrl: 'https://i.pravatar.cc/150?img=11', hasStory: true },
    ];

    const posts: Post[] = [
        {
            id: '1',
            author: 'Tom Russo',
            authorAvatar: 'https://i.pravatar.cc/150?img=12',
            timestamp: '5 mins',
            privacy: 'public',
            content: 'Not having fun at all 😜',
            image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
            likes: 24,
            comments: 8,
            shares: 3,
        },
        {
            id: '2',
            author: 'Anna Becklund',
            authorAvatar: 'https://i.pravatar.cc/150?img=5',
            timestamp: '15 mins',
            privacy: 'public',
            content: 'Just closed my biggest trade of the month! 🚀📈 The market analysis paid off. Remember: patience and strategy always win over emotions. #TradingLife #CryptoSuccess',
            likes: 42,
            comments: 12,
            shares: 5,
        },
        {
            id: '3',
            author: 'Dennis Han',
            authorAvatar: 'https://i.pravatar.cc/150?img=7',
            timestamp: '1 hour',
            privacy: 'public',
            content: 'Check out this amazing article on market trends for 2024! 📊\n\nhttps://example.com/market-trends-2024',
            link: {
                url: 'https://example.com/market-trends-2024',
                title: 'Top 10 Market Trends to Watch in 2024',
                description: 'Discover the key market trends that will shape trading strategies in the coming year. Expert analysis and predictions.',
                image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
            },
            likes: 67,
            comments: 23,
            shares: 15,
        },
        {
            id: '4',
            author: 'Cynthia Lopez',
            authorAvatar: 'https://i.pravatar.cc/150?img=9',
            timestamp: '2 hours',
            privacy: 'friends',
            content: 'Beautiful sunset from my trading desk today 🌅 Sometimes you need to look up from the charts and appreciate the moment.',
            image: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=800',
            likes: 89,
            comments: 15,
            shares: 7,
        },
        {
            id: '5',
            author: 'Eric Jones',
            authorAvatar: 'https://i.pravatar.cc/150?img=2',
            timestamp: '3 hours',
            privacy: 'public',
            content: 'Quick reminder: Never invest more than you can afford to lose. Risk management is key! 💡\n\nWhat\'s your #1 trading rule? Drop it in the comments! 👇',
            likes: 156,
            comments: 45,
            shares: 28,
        },
        {
            id: '6',
            author: 'Betty Chen',
            authorAvatar: 'https://i.pravatar.cc/150?img=6',
            timestamp: '4 hours',
            privacy: 'public',
            content: 'New trading bot configuration is live! 🤖 Check out the performance dashboard:\n\nhttps://lemotick.com/bots/performance',
            link: {
                url: 'https://lemotick.com/bots/performance',
                title: 'LemoTick Bot Performance Dashboard',
                description: 'Real-time analytics and performance metrics for your automated trading bots. Track profits, losses, and optimization opportunities.',
                image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
            },
            likes: 94,
            comments: 31,
            shares: 19,
        },
        {
            id: '7',
            author: 'Aiden Brown',
            authorAvatar: 'https://i.pravatar.cc/150?img=4',
            timestamp: '5 hours',
            privacy: 'public',
            content: 'Coffee + Charts = Perfect Morning ☕📊',
            image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800',
            likes: 73,
            comments: 9,
            shares: 4,
        },
        {
            id: '8',
            author: 'Dan Brown',
            authorAvatar: 'https://i.pravatar.cc/150?img=8',
            timestamp: '6 hours',
            privacy: 'public',
            content: 'Thoughts on the current market volatility? 🤔 I\'m seeing some interesting patterns forming. Bull or bear? Let me know what you think!',
            likes: 112,
            comments: 67,
            shares: 12,
        },
    ];

    return (
        <div className="w-full min-h-screen bg-gradient-to-b from-[#0B0633] to-[#16124A]">
            <PageContainer maxWidth="xl">
                <PageSection>
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Main Feed - Takes more space */}
                        <div className="lg:col-span-8">
                            {/* Stories Section */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-semibold text-white">Stories</h2>
                                    <button className="text-sm text-[#2F6BFF] hover:text-[#FFA62B] font-semibold transition-colors">
                                        See All
                                    </button>
                                </div>
                                <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                                    {stories.map((story) => (
                                        <button
                                            key={story.id}
                                            className="flex-shrink-0 w-28 h-44 rounded-2xl overflow-hidden relative group"
                                        >
                                            {story.isAddStory ? (
                                                <div className="w-full h-full bg-gradient-to-br from-[#16124A] to-[#2F6BFF]/20 border-2 border-dashed border-[#2F6BFF]/50 flex flex-col items-center justify-center hover:border-[#2F6BFF] transition-all">
                                                    <div className="w-10 h-10 rounded-full bg-[#2F6BFF] flex items-center justify-center mb-2">
                                                        <Camera className="w-5 h-5 text-white" />
                                                    </div>
                                                    <span className="text-xs text-white font-semibold">Add to Story</span>
                                                </div>
                                            ) : (
                                                <>
                                                    <img
                                                        src={story.avatarUrl}
                                                        alt={story.name}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60"></div>
                                                    <div className="absolute top-3 left-3 w-10 h-10 rounded-full border-4 border-[#2F6BFF] overflow-hidden">
                                                        <img
                                                            src={story.avatarUrl}
                                                            alt={story.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    <div className="absolute bottom-3 left-3 right-3">
                                                        <p className="text-xs text-white font-semibold truncate">{story.name}</p>
                                                    </div>
                                                </>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

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
                                        placeholder="What's on your mind?"
                                        className="flex-1 px-4 py-2.5 bg-[#0B0633] border border-[#2F6BFF]/20 rounded-full text-white placeholder-gray-500 focus:outline-none focus:border-[#2F6BFF] transition-all"
                                    />
                                </div>
                                <div className="flex items-center justify-around pt-3 border-t border-[#2F6BFF]/20">
                                    <button className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-[#2F6BFF]/10 rounded-lg transition-all">
                                        <Video className="w-5 h-5 text-red-400" />
                                        <span className="text-sm font-semibold hidden sm:inline">Live Video</span>
                                    </button>
                                    <button className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-[#2F6BFF]/10 rounded-lg transition-all">
                                        <Image className="w-5 h-5 text-green-400" />
                                        <span className="text-sm font-semibold hidden sm:inline">Photo/Video</span>
                                    </button>
                                    <button className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-[#2F6BFF]/10 rounded-lg transition-all">
                                        <span className="text-xl">📊</span>
                                        <span className="text-sm font-semibold hidden sm:inline">Trade Update</span>
                                    </button>
                                </div>
                            </div>

                            {/* Posts Feed */}
                            <div className="space-y-6">
                                {posts.map((post) => (
                                    <div key={post.id} className="rounded-2xl bg-[#16124A]/50 border border-[#2F6BFF]/20 overflow-hidden">
                                        {/* Post Header */}
                                        <div className="p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2F6BFF]/20 to-[#FFA62B]/20 overflow-hidden">
                                                    <img
                                                        src={post.authorAvatar}
                                                        alt={post.author}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-semibold text-white">{post.author}</h3>
                                                    <p className="text-xs text-gray-400">
                                                        {post.timestamp} · 🌍
                                                    </p>
                                                </div>
                                            </div>
                                            <button className="p-2 hover:bg-[#2F6BFF]/10 rounded-full transition-all">
                                                <MoreHorizontal className="w-5 h-5 text-gray-400" />
                                            </button>
                                        </div>

                                        {/* Post Content */}
                                        <div className="px-4 pb-3">
                                            <p className="text-white whitespace-pre-line">{post.content}</p>
                                        </div>

                                        {/* Post Image */}
                                        {post.image && !post.link && (
                                            <div className="w-full">
                                                <img
                                                    src={post.image}
                                                    alt="Post"
                                                    className="w-full object-cover max-h-96"
                                                />
                                            </div>
                                        )}

                                        {/* Post Link Preview */}
                                        {post.link && (
                                            <a
                                                href={post.link.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="block border-t border-[#2F6BFF]/20 hover:bg-[#2F6BFF]/5 transition-all"
                                            >
                                                {post.link.image && (
                                                    <div className="w-full">
                                                        <img
                                                            src={post.link.image}
                                                            alt={post.link.title}
                                                            className="w-full object-cover max-h-64"
                                                        />
                                                    </div>
                                                )}
                                                <div className="p-4">
                                                    <p className="text-xs text-gray-500 uppercase mb-1">
                                                        {new URL(post.link.url).hostname}
                                                    </p>
                                                    <h4 className="text-white font-semibold mb-1 line-clamp-2">
                                                        {post.link.title}
                                                    </h4>
                                                    <p className="text-sm text-gray-400 line-clamp-2">
                                                        {post.link.description}
                                                    </p>
                                                </div>
                                            </a>
                                        )}

                                        {/* Post Stats */}
                                        <div className="px-4 py-2 flex items-center justify-between text-sm text-gray-400 border-b border-[#2F6BFF]/20">
                                            <div className="flex items-center gap-2">
                                                <div className="flex -space-x-1">
                                                    <div className="w-5 h-5 rounded-full bg-[#2F6BFF] flex items-center justify-center border border-[#16124A]">
                                                        <ThumbsUp className="w-3 h-3 text-white" />
                                                    </div>
                                                    <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center border border-[#16124A]">
                                                        <Heart className="w-3 h-3 text-white fill-white" />
                                                    </div>
                                                </div>
                                                <span>{post.likes}</span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span>{post.comments} comments</span>
                                                <span>{post.shares} shares</span>
                                            </div>
                                        </div>

                                        {/* Post Actions */}
                                        <div className="px-4 py-2 flex items-center justify-around">
                                            <button className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-[#2F6BFF]/10 rounded-lg transition-all flex-1 justify-center">
                                                <ThumbsUp className="w-5 h-5" />
                                                <span className="text-sm font-semibold">Like</span>
                                            </button>
                                            <button className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-[#2F6BFF]/10 rounded-lg transition-all flex-1 justify-center">
                                                <MessageCircle className="w-5 h-5" />
                                                <span className="text-sm font-semibold">Comment</span>
                                            </button>
                                            <button className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-[#2F6BFF]/10 rounded-lg transition-all flex-1 justify-center">
                                                <Share2 className="w-5 h-5" />
                                                <span className="text-sm font-semibold">Share</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {/* Load More */}
                                <div className="text-center py-6">
                                    <button className="px-6 py-3 bg-[#16124A] hover:bg-[#2F6BFF]/20 border border-[#2F6BFF]/30 text-white rounded-xl font-semibold transition-all">
                                        Load More Posts
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Right Sidebar - Suggested + Ads (hidden on mobile) */}
                        <div className="hidden lg:block lg:col-span-4">
                            <div className="sticky top-6 space-y-4">
                                {/* Suggested Groups */}
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-4">Suggested</h3>
                                    <div className="p-4 rounded-2xl bg-[#16124A]/50 border border-[#2F6BFF]/20">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="text-2xl">👥</div>
                                            <div className="flex-1">
                                                <h4 className="text-sm font-semibold text-white">Groups</h4>
                                                <p className="text-xs text-gray-400">New ways to find and join communities</p>
                                            </div>
                                        </div>
                                        <button className="w-full px-4 py-2 bg-[#2F6BFF]/20 hover:bg-[#2F6BFF]/30 border border-[#2F6BFF]/30 text-[#2F6BFF] rounded-lg text-sm font-semibold transition-all">
                                            Find Your Groups
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </PageSection>
            </PageContainer>

            {/* Contacts - Fixed Bottom Right (Above Messenger) */}
            <div className="hidden lg:block fixed bottom-24 right-6 z-50">
                <ul className="space-y-3 mb-8">
                    {['Dennis Han', 'Eric Jones', 'Cynthia Lopez'].map((name, idx) => (
                        <li key={idx}>
                            <button
                                className="relative hover:opacity-80 transition-all"
                                title={name}
                            >
                                <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-transparent hover:ring-[#2F6BFF]/50 transition-all">
                                    <img
                                        src={`https://i.pravatar.cc/150?img=${idx + 1}`}
                                        alt={name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                {idx < 2 && (
                                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#0B0633]"></div>
                                )}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
