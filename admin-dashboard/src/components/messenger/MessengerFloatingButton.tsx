import { MessageCircle, X } from 'lucide-react';

interface MessengerFloatingButtonProps {
    isOpen: boolean;
    onClick: () => void;
    unreadCount?: number;
}

function MessengerFloatingButton({ isOpen, onClick, unreadCount = 0 }: MessengerFloatingButtonProps) {
    return (
        <button
            onClick={onClick}
            className="fixed bottom-20 right-6 z-40 w-14 h-14 bg-gradient-to-r from-[#2F6BFF] to-[#4A7FFF] hover:from-[#4A7FFF] hover:to-[#2F6BFF] rounded-full shadow-[0_0_30px_rgba(47,107,255,0.6)] hover:shadow-[0_0_40px_rgba(47,107,255,0.8)] transition-all duration-300 flex items-center justify-center group hover:scale-110"
        >
            {isOpen ? (
                <X className="w-6 h-6 text-white transition-transform group-hover:rotate-90 duration-300" />
            ) : (
                <>
                    <MessageCircle className="w-6 h-6 text-white" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-6 h-6 bg-[#FFA62B] text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-[#0B0633] animate-pulse">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </>
            )}
        </button>
    );
}

export default MessengerFloatingButton;
