import { useMessageStore } from '@/stores/messageStore';
import { formatDistanceToNow } from 'date-fns';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Transition from '../utils/Transition';

interface DropdownMessagesProps {
    align?: string;
    onMessageClick?: (conversationId: string) => void;
}

function DropdownMessages({ align, onMessageClick }: DropdownMessagesProps) {
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const trigger = useRef<HTMLButtonElement>(null);
    const dropdown = useRef<HTMLDivElement>(null);

    const {
        conversations,
        totalUnreadCount,
        loading,
        fetchConversations,
        markConversationAsRead,
    } = useMessageStore();

    // Fetch conversations on mount
    useEffect(() => {
        fetchConversations();
    }, [fetchConversations]);

    // Get only the first 5 conversations for the dropdown
    const displayConversations = conversations.slice(0, 5);

    const handleConversationClick = async (conversationId: string) => {
        await markConversationAsRead(conversationId);
        setDropdownOpen(false);
        onMessageClick?.(conversationId);
    };

    const formatTimeAgo = (dateString: string) => {
        try {
            return formatDistanceToNow(new Date(dateString), { addSuffix: true });
        } catch {
            return 'Recently';
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

    // close on click outside
    useEffect(() => {
        const clickHandler = ({ target }: MouseEvent) => {
            if (!dropdown.current) return;
            if (!dropdownOpen || dropdown.current.contains(target as Node) || trigger.current?.contains(target as Node)) return;
            setDropdownOpen(false);
        };
        document.addEventListener('click', clickHandler);
        return () => document.removeEventListener('click', clickHandler);
    });

    // close if the esc key is pressed
    useEffect(() => {
        const keyHandler = ({ keyCode }: KeyboardEvent) => {
            if (!dropdownOpen || keyCode !== 27) return;
            setDropdownOpen(false);
        };
        document.addEventListener('keydown', keyHandler);
        return () => document.removeEventListener('keydown', keyHandler);
    });

    return (
        <div className="relative inline-flex">
            <button
                ref={trigger}
                className={`w-9 h-9 flex items-center justify-center hover:bg-[#16124A]/50 rounded-lg transition-colors relative ${dropdownOpen && 'bg-[#16124A]/70'}`}
                aria-haspopup="true"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-expanded={dropdownOpen}
                aria-label="Messages"
            >
                <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {totalUnreadCount > 0 && (
                    <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 border-2 border-[#1A1547] rounded-full"></div>
                )}
            </button>

            <Transition
                className={`origin-top z-[9999] fixed sm:absolute top-16 sm:top-full left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 w-72 sm:w-auto sm:min-w-80 max-w-md bg-gradient-to-br from-[#1A1547] to-[#16124A] border border-[#2F6BFF]/30 rounded-2xl shadow-2xl shadow-[#2F6BFF]/10 overflow-hidden mt-2 ${align === 'right' ? 'sm:right-0' : 'sm:left-0'}`}
                show={dropdownOpen}
                enter="transition ease-out duration-200 transform"
                enterStart="opacity-0 -translate-y-2"
                enterEnd="opacity-100 translate-y-0"
                leave="transition ease-out duration-200"
                leaveStart="opacity-100"
                leaveEnd="opacity-0"
            >
                <div
                    ref={dropdown}
                    onFocus={() => setDropdownOpen(true)}
                    onBlur={() => setDropdownOpen(false)}
                >
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-[#2F6BFF]/20 bg-gradient-to-r from-[#2F6BFF]/10 to-transparent">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-[#efdede]">Messages</h3>
                            {totalUnreadCount > 0 && (
                                <span className="text-xs bg-[#2F6BFF]/20 text-[#2F6BFF] px-2 py-0.5 rounded-full font-medium">
                                    {totalUnreadCount} New
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Messages List */}
                    <div className="max-h-80 overflow-y-auto">
                        {loading ? (
                            <div className="p-8 text-center">
                                <div className="w-8 h-8 mx-auto mb-2 border-2 border-[#2F6BFF] border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-sm text-gray-400">Loading messages...</p>
                            </div>
                        ) : displayConversations.length === 0 ? (
                            <div className="p-8 text-center">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#2F6BFF]/20 to-[#FFA62B]/20 flex items-center justify-center">
                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <p className="text-sm text-gray-400 mb-1">No messages</p>
                                <p className="text-xs text-gray-500">Your inbox is empty</p>
                            </div>
                        ) : (
                            displayConversations.map((conversation) => (
                                <button
                                    key={conversation.id}
                                    className="w-full flex items-start gap-3 p-4 hover:bg-[#2F6BFF]/5 transition-all duration-200 border-b border-[#2F6BFF]/10 text-left"
                                    onClick={() => handleConversationClick(conversation.id)}
                                >
                                    <div className="flex-shrink-0 relative">
                                        {conversation.participantAvatar ? (
                                            <img
                                                src={conversation.participantAvatar}
                                                alt={conversation.participantName}
                                                className="w-10 h-10 rounded-full border-2 border-[#2F6BFF]/30"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2F6BFF] to-[#FFA62B] flex items-center justify-center border-2 border-[#2F6BFF]/30">
                                                <span className="text-white font-semibold text-sm">
                                                    {conversation.participantName.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                        )}
                                        {conversation.participantOnlineStatus && (
                                            <div className={`absolute bottom-0 right-0 w-3 h-3 ${getOnlineStatusColor(conversation.participantOnlineStatus)} border-2 border-[#1A1547] rounded-full`}></div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="text-sm font-semibold text-[#efdede] truncate">{conversation.participantName}</p>
                                            <span className="text-xs text-gray-400">{formatTimeAgo(conversation.updatedAt)}</span>
                                        </div>
                                        <p className="text-sm text-gray-300 line-clamp-2">
                                            {conversation.lastMessage?.content || 'No messages yet'}
                                        </p>
                                    </div>
                                    {conversation.unreadCount > 0 && (
                                        <div className="w-2 h-2 bg-[#2F6BFF] rounded-full flex-shrink-0 mt-2"></div>
                                    )}
                                </button>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {displayConversations.length > 0 && (
                        <div className="px-4 py-3 border-t border-[#2F6BFF]/20 bg-gradient-to-r from-[#2F6BFF]/5 to-transparent">
                            <Link
                                to="/messages"
                                className="text-sm text-[#2F6BFF] hover:text-[#FFA62B] font-semibold transition-colors flex items-center justify-center gap-1"
                                onClick={() => setDropdownOpen(false)}
                            >
                                View all messages
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        </div>
                    )}
                </div>
            </Transition>
        </div>
    );
}

export default DropdownMessages;


