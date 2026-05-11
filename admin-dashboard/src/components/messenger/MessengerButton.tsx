// MessengerButton Component - Floating button to open messenger

import { useMessageStore } from '@/stores/messageStore';
import { MessageCircle } from 'lucide-react';

interface MessengerButtonProps {
    onClick: () => void;
}

export default function MessengerButton({ onClick }: MessengerButtonProps) {
    const { totalUnreadCount } = useMessageStore();

    return (
        <button
            onClick={onClick}
            className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-[#2F6BFF] to-[#FFA62B] rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 flex items-center justify-center z-40"
            title="Open Messages"
        >
            <MessageCircle className="w-6 h-6 text-white" />
            {totalUnreadCount > 0 && (
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center border-2 border-white">
                    <span className="text-xs font-bold text-white">
                        {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
                    </span>
                </div>
            )}
        </button>
    );
}
