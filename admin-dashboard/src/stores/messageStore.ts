// Message Store - Manages user messages and conversations

import { create } from 'zustand';

// ============================================================================
// Types
// ============================================================================

export interface Message {
    id: string;
    conversationId: string;
    senderId: string;
    senderName: string;
    senderAvatar?: string;
    content: string;
    isRead: boolean;
    createdAt: string;
    updatedAt?: string;
}

export interface Conversation {
    id: string;
    participantId: string;
    participantName: string;
    participantAvatar?: string;
    participantOnlineStatus?: 'online' | 'offline' | 'away';
    lastMessage?: Message;
    unreadCount: number;
    updatedAt: string;
}

// ============================================================================
// State Interface
// ============================================================================

interface MessageState {
    conversations: Conversation[];
    messages: Record<string, Message[]>; // conversationId -> messages
    totalUnreadCount: number;
    loading: boolean;
    error: string | null;

    // Actions - Conversations
    fetchConversations: () => Promise<void>;
    getConversation: (conversationId: string) => Conversation | undefined;

    // Actions - Messages
    fetchMessages: (conversationId: string) => Promise<void>;
    sendMessage: (conversationId: string, content: string) => Promise<void>;
    markConversationAsRead: (conversationId: string) => Promise<void>;
    deleteConversation: (conversationId: string) => Promise<void>;

    // Real-time updates
    addMessage: (message: Message) => void;
    updateConversation: (conversation: Conversation) => void;

    // Utility
    getTotalUnreadCount: () => number;
}

// ============================================================================
// Store Implementation
// ============================================================================

export const useMessageStore = create<MessageState>((set, get) => ({
    conversations: [],
    messages: {},
    totalUnreadCount: 0,
    loading: false,
    error: null,

    // Fetch conversations from backend
    fetchConversations: async () => {
        set({ loading: true, error: null });

        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('/api/message/conversations', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            const totalUnread = data.reduce((sum: number, conv: Conversation) => sum + conv.unreadCount, 0);

            set({
                conversations: data,
                totalUnreadCount: totalUnread,
                loading: false,
            });
        } catch (error: any) {
            console.error('[messageStore] Error fetching conversations:', error);
            set({
                error: error.message || 'Failed to fetch conversations',
                loading: false,
            });
        }
    },

    // Get a specific conversation
    getConversation: (conversationId: string) => {
        return get().conversations.find(c => c.id === conversationId);
    },

    // Fetch messages for a conversation
    fetchMessages: async (conversationId: string) => {
        set({ loading: true, error: null });

        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`/api/message/conversations/${conversationId}/messages`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            set((state) => ({
                messages: {
                    ...state.messages,
                    [conversationId]: data,
                },
                loading: false,
            }));
        } catch (error: any) {
            console.error('[messageStore] Error fetching messages:', error);
            set({
                error: error.message || 'Failed to fetch messages',
                loading: false,
            });
        }
    },

    // Send a message
    sendMessage: async (conversationId: string, content: string) => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`/api/message/conversations/${conversationId}/messages`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const newMessage = await response.json();

            // The message will be added via real-time update (SignalR)
            // But we can also add it optimistically here
            set((state) => {
                const conversationMessages = state.messages[conversationId] || [];
                return {
                    messages: {
                        ...state.messages,
                        [conversationId]: [...conversationMessages, newMessage],
                    },
                };
            });
        } catch (error: any) {
            console.error('[messageStore] Error sending message:', error);
            throw error;
        }
    },

    // Mark conversation as read
    markConversationAsRead: async (conversationId: string) => {
        try {
            const token = localStorage.getItem('authToken');
            await fetch(`/api/message/conversations/${conversationId}/read`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            set((state) => {
                const conversation = state.conversations.find(c => c.id === conversationId);
                if (!conversation) return state;

                const unreadDiff = conversation.unreadCount;

                return {
                    conversations: state.conversations.map((c) =>
                        c.id === conversationId ? { ...c, unreadCount: 0 } : c
                    ),
                    totalUnreadCount: Math.max(0, state.totalUnreadCount - unreadDiff),
                };
            });
        } catch (error: any) {
            console.error('[messageStore] Error marking conversation as read:', error);
        }
    },

    // Delete a conversation
    deleteConversation: async (conversationId: string) => {
        try {
            const token = localStorage.getItem('authToken');
            await fetch(`/api/message/conversations/${conversationId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            set((state) => {
                const conversation = state.conversations.find(c => c.id === conversationId);
                const unreadDiff = conversation?.unreadCount || 0;

                const newMessages = { ...state.messages };
                delete newMessages[conversationId];

                return {
                    conversations: state.conversations.filter((c) => c.id !== conversationId),
                    messages: newMessages,
                    totalUnreadCount: Math.max(0, state.totalUnreadCount - unreadDiff),
                };
            });
        } catch (error: any) {
            console.error('[messageStore] Error deleting conversation:', error);
        }
    },

    // Add message (for real-time updates via SignalR)
    addMessage: (message: Message) => {
        set((state) => {
            const conversationMessages = state.messages[message.conversationId] || [];

            return {
                messages: {
                    ...state.messages,
                    [message.conversationId]: [...conversationMessages, message],
                },
                conversations: state.conversations.map((c) => {
                    if (c.id === message.conversationId) {
                        return {
                            ...c,
                            lastMessage: message,
                            unreadCount: message.isRead ? c.unreadCount : c.unreadCount + 1,
                            updatedAt: message.createdAt,
                        };
                    }
                    return c;
                }),
                totalUnreadCount: message.isRead ? state.totalUnreadCount : state.totalUnreadCount + 1,
            };
        });
    },

    // Update conversation (for real-time updates)
    updateConversation: (conversation: Conversation) => {
        set((state) => {
            const existingConv = state.conversations.find(c => c.id === conversation.id);

            if (existingConv) {
                return {
                    conversations: state.conversations.map((c) =>
                        c.id === conversation.id ? conversation : c
                    ),
                };
            } else {
                return {
                    conversations: [conversation, ...state.conversations],
                };
            }
        });
    },

    // Get total unread count
    getTotalUnreadCount: () => {
        return get().totalUnreadCount;
    },
}));
