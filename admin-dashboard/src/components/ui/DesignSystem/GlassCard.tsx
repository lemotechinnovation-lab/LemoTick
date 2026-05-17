import { CSSProperties, ReactNode } from 'react';

interface GlassCardProps {
    children: ReactNode;
    className?: string;
    style?: CSSProperties;
    variant?: 'default' | 'blue' | 'orange' | 'green' | 'purple' | 'red';
    hover?: boolean;
    onClick?: () => void;
}

export function GlassCard({
    children,
    className = '',
    style,
    variant = 'default',
    hover = true,
    onClick
}: GlassCardProps) {
    const variantClasses = {
        default: 'border-brand-blue/20 shadow-brand-blue/10',
        blue: 'border-brand-blue/30 shadow-brand-blue/20',
        orange: 'border-accent-orange/30 shadow-accent-orange/20',
        green: 'border-green-400/30 shadow-green-500/20',
        purple: 'border-purple-500/30 shadow-purple-500/20',
        red: 'border-red-500/30 shadow-red-500/20',
    };

    const hoverGlowColors = {
        default: 'from-brand-blue/5',
        blue: 'from-brand-blue/10',
        orange: 'from-accent-orange/10',
        green: 'from-green-500/10',
        purple: 'from-purple-500/10',
        red: 'from-red-500/10',
    };

    return (
        <div
            className={`glass-card-elevated p-5 rounded-2xl ${hover ? 'smooth-hover' : ''} border ${variantClasses[variant]} shadow-xl backdrop-blur-xl relative overflow-hidden group ${onClick ? 'cursor-pointer' : ''} ${className}`}
            style={style}
            onClick={onClick}
        >
            {hover && (
                <div className={`absolute inset-0 bg-gradient-to-br ${hoverGlowColors[variant]} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
            )}
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
}


