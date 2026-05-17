interface StatusBadgeProps {
    status: 'success' | 'error' | 'warning' | 'info' | 'pending' | 'active' | 'inactive';
    label?: string;
    pulse?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

export function StatusBadge({
    status,
    label,
    pulse = false,
    size = 'md'
}: StatusBadgeProps) {
    const statusConfig = {
        success: {
            bg: 'bg-green-500/20',
            border: 'border-green-400/30',
            text: 'text-green-400',
            dot: 'bg-green-400',
            shadow: 'shadow-green-500/20',
        },
        error: {
            bg: 'bg-red-500/20',
            border: 'border-red-400/30',
            text: 'text-red-400',
            dot: 'bg-red-400',
            shadow: 'shadow-red-500/20',
        },
        warning: {
            bg: 'bg-accent-orange/20',
            border: 'border-accent-orange/30',
            text: 'text-accent-orange',
            dot: 'bg-accent-orange',
            shadow: 'shadow-accent-orange/20',
        },
        info: {
            bg: 'bg-brand-blue/20',
            border: 'border-brand-blue/30',
            text: 'text-brand-blue',
            dot: 'bg-brand-blue',
            shadow: 'shadow-brand-blue/20',
        },
        pending: {
            bg: 'bg-gray-500/20',
            border: 'border-gray-400/30',
            text: 'text-gray-400',
            dot: 'bg-gray-400',
            shadow: 'shadow-gray-500/20',
        },
        active: {
            bg: 'bg-green-500/20',
            border: 'border-green-400/30',
            text: 'text-green-400',
            dot: 'bg-green-400',
            shadow: 'shadow-green-500/20',
        },
        inactive: {
            bg: 'bg-gray-500/20',
            border: 'border-gray-400/30',
            text: 'text-gray-400',
            dot: 'bg-gray-400',
            shadow: 'shadow-gray-500/20',
        },
    };

    const sizeClasses = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-xs',
        lg: 'px-3 py-1.5 text-sm',
    };

    const dotSizes = {
        sm: 'w-1.5 h-1.5',
        md: 'w-2 h-2',
        lg: 'w-2.5 h-2.5',
    };

    const config = statusConfig[status];

    return (
        <span className={`inline-flex items-center gap-1.5 ${sizeClasses[size]} ${config.bg} rounded-full border ${config.border} shadow-lg ${config.shadow} ${pulse ? 'animate-pulse-glow' : ''}`}>
            <span className="relative">
                {pulse && (
                    <span className={`absolute inset-0 ${config.dot} rounded-full animate-ping`}></span>
                )}
                <span className={`relative block ${dotSizes[size]} ${config.dot} rounded-full shadow-lg`}></span>
            </span>
            {label && (
                <span className={`font-bold ${config.text}`}>{label}</span>
            )}
        </span>
    );
}


