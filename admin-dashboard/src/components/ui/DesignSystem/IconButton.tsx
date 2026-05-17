import { LucideIcon } from 'lucide-react';

interface IconButtonProps {
    icon: LucideIcon;
    onClick?: () => void;
    variant?: 'blue' | 'orange' | 'green' | 'purple' | 'red' | 'gray';
    badge?: number | string;
    pulse?: boolean;
    className?: string;
    title?: string;
}

export function IconButton({
    icon: Icon,
    onClick,
    variant = 'blue',
    badge,
    pulse = false,
    className = '',
    title
}: IconButtonProps) {
    const variantClasses = {
        blue: 'bg-brand-blue/10 hover:bg-brand-blue/20 border-brand-blue/30 shadow-brand-blue/10',
        orange: 'bg-accent-orange/10 hover:bg-accent-orange/20 border-accent-orange/30 shadow-accent-orange/10',
        green: 'bg-green-500/10 hover:bg-green-500/20 border-green-400/30 shadow-green-500/10',
        purple: 'bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/30 shadow-purple-500/10',
        red: 'bg-red-500/10 hover:bg-red-500/20 border-red-500/30 shadow-red-500/10',
        gray: 'bg-gray-500/10 hover:bg-gray-500/20 border-gray-500/30 shadow-gray-500/10',
    };

    const iconColors = {
        blue: 'text-brand-blue',
        orange: 'text-accent-orange',
        green: 'text-green-400',
        purple: 'text-purple-400',
        red: 'text-red-400',
        gray: 'text-gray-400 group-hover:text-white',
    };

    const badgeColors = {
        blue: 'bg-gradient-to-br from-brand-blue to-[#4A7FFF] shadow-brand-blue/50',
        orange: 'bg-gradient-to-br from-accent-orange to-[#FFB84D] shadow-accent-orange/50',
        green: 'bg-gradient-to-br from-green-500 to-emerald-500 shadow-green-500/50',
        purple: 'bg-gradient-to-br from-purple-500 to-pink-500 shadow-purple-500/50',
        red: 'bg-gradient-to-br from-red-500 to-rose-500 shadow-red-500/50',
        gray: 'bg-gradient-to-br from-gray-500 to-gray-600 shadow-gray-500/50',
    };

    return (
        <button
            onClick={onClick}
            title={title}
            className={`p-2.5 smooth-hover rounded-xl relative focus-enhanced ${variantClasses[variant]} border shadow-lg group ${className}`}
        >
            <Icon className={`w-5 h-5 ${iconColors[variant]} group-hover:scale-110 transition-transform`} />

            {badge !== undefined && (
                <span className={`absolute -top-1 -right-1 px-1.5 min-w-5 h-5 ${badgeColors[variant]} rounded-full flex items-center justify-center ring-2 ring-card shadow-lg ${pulse ? 'animate-bounce-subtle' : ''}`}>
                    <span className="text-xs font-bold text-white">{badge}</span>
                </span>
            )}

            {pulse && badge === undefined && (
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-card shadow-lg shadow-red-500/50">
                    <span className="absolute inset-0 bg-red-500 rounded-full animate-ping"></span>
                </span>
            )}
        </button>
    );
}


