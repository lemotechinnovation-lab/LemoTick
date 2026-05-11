import { X } from 'lucide-react';

interface ModalHeaderProps {
    title: string;
    onClose: () => void;
}

export default function ModalHeader({ title, onClose }: ModalHeaderProps) {
    return (
        <div
            className="flex items-center justify-between p-3 border-b border-[#2F6BFF]/30 sticky top-0 z-10 backdrop-blur-xl bg-[#35335e]/90"
            style={{
                backgroundImage: 'linear-gradient(to right, rgba(47, 107, 255, 0.3), rgba(255, 166, 43, 0.2), rgba(47, 107, 255, 0.3))'
            }}
        >
            <h2 className="text-small-dashboard text-white font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                {title}
            </h2>
            <button
                onClick={onClose}
                className="p-1 hover:bg-red-500/20 rounded-md transition-all duration-200 hover:scale-110"
            >
                <X size={16} className="text-gray-300 hover:text-red-400" />
            </button>
        </div>
    );
}
