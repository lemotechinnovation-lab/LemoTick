// MessengerPanel Component - Floating right panel for messages

import { useMessageStore } from '@/stores/messageStore';
import { useSocialStore } from '@/stores/socialStore';
import { formatDistanceToNow } from 'date-fns';
import {
    ArrowLeft,
    MessageCircle,
    Minimize2,
    MoreVertical,
    Paperclip,
    Search,
    Send,
    Smile,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface MessengerPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function MessengerPanel({ isOpen, onClose }: MessengerPanelProps) {
    const {
        conversations,
        messages,
        loading,
        fetchConversations,
        fetchMessages,
        sendMessage,
        markConversationAsRead,
    } = useMessageStore();

    const { currentUserProfile } = useSocialStore();

    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
    const [messageInput, setMessageInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isMinimized, setIsMinimized] = useState(false);

    // Fetch conversations on mount
    useEffect(() => {
        if (isOpen) {
            fetchConversations();
        }
    }, [isOpen, fetchConversations]);

    // Fetch messages when conversation is selected
    useEffect(() => {
        if (selectedConversationId) {
            fetchMessages(selectedConversationId);
            markConversationAsRead(selectedConversationId);
        }
    }, [selectedConversationId, fetchMessages, markConversationAsRead]);

    const selectedConversation = conversations.find((c) => c.id === selectedConversationId);
    const conversationMessages = selectedConversationId ? messages[selectedConversationId] || [] : [];

    const filteredConversations = conversations.filter((conv) =>
        conv.participantName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSendMessage = async () => {
        if (!messageInput.trim() || !selectedConversationId) return;

        try {
            await sendMessage(selectedConversationId, messageInput.trim());
            setMessageInput('');
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const getOnlineStatusColor = (status?: string) => {
        switch (status) {
            case 'online':
                return 'bg-green-500';
            case 'away':
                return 'bg-yellow-500';
            default:
                return 'bg-gray-500';
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className={`fixed right-0 top-0 bottom-0 bg-[#0B0633] border-l border-[#2F6BFF]/20 shadow-2xl z-[100] transition-all duration-300 overflow-hidden ${isMinimized ? 'w-16' : 'w-96 max-w-full'
                }`}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#2F6BFF]/20 bg-[#16124A]">
                {!isMinimized && (
                    <>
                        {selectedConversationId ? (
                            <button
                                onClick={() => setSelectedConversationId(null)}
                                className="p-2 hover:bg-[#2F6BFF]/20 rounded-lg transition-all"
                            >
                                <ArrowLeft className="w-5 h-5 text-white" />
                            </button>
                        ) : (
                            <div className="flex items-center gap-2">
                                <MessageCircle className="w-5 h-5 text-[#2F6BFF]" />
                                <h2 className="text-lg font-semibold text-white">Messages</h2>
                            </div>
                        )}
                    </>
                )}

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsMinimized(!isMinimized)}
                        className="p-2 hover:bg-[#2F6BFF]/20 rounded-lg transition-all"
                        title={isMinimized ? 'Expand' : 'Minimize'}
                    >
                        <Minimize2 className="w-4 h-4 text-gray-400" />
                    </button>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-red-500/20 rounded-lg transition-all"
                        title="Close"
                    >
                        <X className="w-4 h-4 text-gray-400 hover:text-red-400" />
                    </button>
                </div>
            </div>

            {!isMinimized && (
                <>
                    {/* Conversation List View */}
                    {!selectedConversationId && (
                        <div className="flex flex-col h-[calc(100%-73px)]">
                            {/* Search */}
                            <div className="p-4 border-b border-[#2F6BFF]/20">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search conversations..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 bg-[#16124A] border border-[#2F6BFF]/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#2F6BFF]"
                                    />
                                </div>
                            </div>

                            {/* Conversations */}
                            <div className="flex-1 overflow-y-auto">
                                {loading && conversations.length === 0 ? (
                                    <div className="flex items-center justify-center h-full">
                                        <div className="text-gray-400">Loading conversations...</div>
                                    </div>
                                ) : filteredConversations.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                                        <MessageCircle className="w-16 h-16 text-gray-600 mb-4" />
                                        <p className="text-gray-400 mb-2">No conversations yet</p>
                                        <p className="text-sm text-gray-500">
                                            Start chatting with your friends!
                                        </p>
                                    </div>
                                ) : (
                                    filteredConversations.map((conversation) => (
                                        <button
                                            key={conversation.id}
                                            onClick={() => setSelectedConversationId(conversation.id)}
                                            className="w-full p-4 flex items-start gap-3 hover:bg-[#16124A] transition-all border-b border-[#2F6BFF]/10"
                                        >
                                            {/* Avatar */}
                                            <div className="relative flex-shrink-0">
                                                <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-[#2F6BFF]/20 to-[#FFA62B]/20 flex items-center justify-center">
                                                    {conversation.participantAvatar ? (
                                                        <img
                                                            src={conversation.participantAvatar}
                                                            alt={conversation.participantName}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <span className="text-lg font-bold text-[#2F6BFF]">
                                                            {conversation.participantName.charAt(0).toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                                <div
                                                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#0B0633] ${getOnlineStatusColor(
                                                        conversation.participantOnlineStatus
                                                    )}`}
                                                ></div>
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0 text-left">
                                                <div className="flex items-center justify-between mb-1">
                                                    <h3 className="font-semibold text-white truncate">
                                                        {conversation.participantName}
                                                    </h3>
                                                    {conversation.lastMessage && (
                                                        <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                                                            {formatDistanceToNow(
                                                                new Date(conversation.lastMessage.createdAt),
                                                                { addSuffix: true }
                                                            )}
                                                        </span>
                                                    )}
                                                </div>
                                                {conversation.lastMessage && (
                                                    <p
                                                        className={`text-sm truncate ${conversation.unreadCount > 0
                                                            ? 'text-white font-semibold'
                                                            : 'text-gray-400'
                                                            }`}
                                                    >
                                                        {conversation.lastMessage.senderId === currentUserProfile?.userId
                                                            ? 'You: '
                                                            : ''}
                                                        {conversation.lastMessage.content}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Unread Badge */}
                                            {conversation.unreadCount > 0 && (
                                                <div className="flex-shrink-0 w-5 h-5 bg-[#2F6BFF] rounded-full flex items-center justify-center">
                                                    <span className="text-xs font-bold text-white">
                                                        {conversation.unreadCount}
                                                    </span>
                                                </div>
                                            )}
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* Conversation View */}
                    {selectedConversationId && selectedConversation && (
                        <div className="flex flex-col h-[calc(100dvh-73px)]">
                            {/* Conversation Header */}
                            <div className="p-4 border-b border-[#2F6BFF]/20 bg-[#16124A]">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-[#2F6BFF]/20 to-[#FFA62B]/20 flex items-center justify-center">
                                                {selectedConversation.participantAvatar ? (
                                                    <img
                                                        src={selectedConversation.participantAvatar}
                                                        alt={selectedConversation.participantName}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-sm font-bold text-[#2F6BFF]">
                                                        {selectedConversation.participantName
                                                            .charAt(0)
                                                            .toUpperCase()}
                                                    </span>
                                                )}
                                            </div>
                                            <div
                                                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#16124A] ${getOnlineStatusColor(
                                                    selectedConversation.participantOnlineStatus
                                                )}`}
                                            ></div>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-white">
                                                {selectedConversation.participantName}
                                            </h3>
                                            <p className="text-xs text-gray-400">
                                                {selectedConversation.participantOnlineStatus === 'online'
                                                    ? 'Active now'
                                                    : 'Offline'}
                                            </p>
                                        </div>
                                    </div>
                                    <button className="p-2 hover:bg-[#2F6BFF]/20 rounded-lg transition-all">
                                        <MoreVertical className="w-4 h-4 text-gray-400" />
                                    </button>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {conversationMessages.length === 0 ? (
                                    <div className="flex items-center justify-center h-full">
                                        <p className="text-gray-400 text-sm">No messages yet</p>
                                    </div>
                                ) : (
                                    conversationMessages.map((message) => {
                                        const isOwn = message.senderId === currentUserProfile?.userId;
                                        return (
                                            <div
                                                key={message.id}
                                                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div
                                                    className={`max-w-[75%] ${isOwn
                                                        ? 'bg-[#2F6BFF] text-white'
                                                        : 'bg-[#16124A] text-white'
                                                        } rounded-2xl px-4 py-2`}
                                                >
                                                    <p className="text-sm break-words">{message.content}</p>
                                                    <p
                                                        className={`text-xs mt-1 ${isOwn ? 'text-blue-200' : 'text-gray-400'
                                                            }`}
                                                    >
                                                        {formatDistanceToNow(new Date(message.createdAt), {
                                                            addSuffix: true,
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {/* Message Input */}
                            <div className="p-4 border-t border-[#2F6BFF]/20 bg-[#16124A]">
                                <div className="flex items-end gap-2">
                                    <button className="p-2 hover:bg-[#2F6BFF]/20 rounded-lg transition-all flex-shrink-0">
                                        <Paperclip className="w-5 h-5 text-gray-400" />
                                    </button>
                                    <button className="p-2 hover:bg-[#2F6BFF]/20 rounded-lg transition-all flex-shrink-0">
                                        <Smile className="w-5 h-5 text-gray-400" />
                                    </button>
                                    <textarea
                                        value={messageInput}
                                        onChange={(e) => setMessageInput(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="Type a message..."
                                        rows={1}
                                        className="flex-1 px-4 py-2 bg-[#0B0633] border border-[#2F6BFF]/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#2F6BFF] resize-none"
                                    />
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={!messageInput.trim()}
                                        className="p-2 bg-[#2F6BFF] hover:bg-[#2F6BFF]/80 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-all flex-shrink-0"
                                    >
                                        <Send className="w-5 h-5 text-white" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Minimized View */}
            {isMinimized && (
                <div className="flex flex-col items-center py-4 gap-4">
                    <button
                        onClick={() => setIsMinimized(false)}
                        className="p-3 hover:bg-[#2F6BFF]/20 rounded-lg transition-all"
                    >
                        <MessageCircle className="w-6 h-6 text-[#2F6BFF]" />
                    </button>
                    {conversations.slice(0, 5).map((conv) => (
                        <button
                            key={conv.id}
                            onClick={() => {
                                setIsMinimized(false);
                                setSelectedConversationId(conv.id);
                            }}
                            className="relative"
                        >
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-[#2F6BFF]/20 to-[#FFA62B]/20 flex items-center justify-center hover:ring-2 hover:ring-[#2F6BFF] transition-all">
                                {conv.participantAvatar ? (
                                    <img
                                        src={conv.participantAvatar}
                                        alt={conv.participantName}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-sm font-bold text-[#2F6BFF]">
                                        {conv.participantName.charAt(0).toUpperCase()}
                                    </span>
                                )}
                            </div>
                            {conv.unreadCount > 0 && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                                    <span className="text-xs font-bold text-white">
                                        {conv.unreadCount}
                                    </span>
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
