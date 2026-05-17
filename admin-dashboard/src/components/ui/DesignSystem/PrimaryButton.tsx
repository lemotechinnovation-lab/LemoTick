import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface PrimaryButtonProps {
    children: ReactNode;
    onClick?: () => void;
    icon?: LucideIcon;
    iconPosition?: 'left' | 'right';
    disabled?: boolean;
    loading?: boolean;
    type?: 'button' | 'submit' | 'reset';
    className?: string;
    variant?: 'primary' | 'secondary';
}

export function PrimaryButton({
    children,
    onClick,
    icon: Icon,
    iconPosition = 'left',
    disabled = false,
    loading = false,
    type = 'button',
    className = '',
    variant = 'primary'
}: PrimaryButtonProps) {
    const baseClass = variant === 'primary'
        ? 'btn-primary-enhanced shadow-brand-blue/30'
        : 'btn-secondary-enhanced';

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={`${baseClass} ripple focus-enhanced px-4 py-2.5 text-sm font-bold shadow-lg group relative overflow-hidden ${className}`}
        >
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>

            {/* Content */}
            <span className="relative z-10 flex items-center gap-2">
                {Icon && iconPosition === 'left' && (
                    <Icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                )}
                {loading ? 'Loading...' : children}
                {Icon && iconPosition === 'right' && (
                    <Icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                )}
            </span>
        </button>
    );
}


