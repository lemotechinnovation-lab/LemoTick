import { TrendingDown, TrendingUp } from 'lucide-react';
import { cloneElement, isValidElement, ReactNode } from 'react';
import { GlassCard } from './GlassCard';

interface StatCardProps {
    label: string;
    value: string | number;
    change?: {
        value: number;
        isPositive: boolean;
    };
    icon: ReactNode;
    variant?: 'blue' | 'orange' | 'green' | 'purple' | 'red';
    subtitle?: string;
    badge?: string;
    badgeVariant?: 'success' | 'warning' | 'info';
    sparkline?: ReactNode;
    onClick?: () => void;
    delay?: number;
}

export function StatCard({
    label,
    value,
    change,
    icon,
    variant = 'blue',
    subtitle,
    badge,
    badgeVariant = 'info',
    sparkline,
    onClick,
    delay = 0
}: StatCardProps) {
    const iconColorClasses = {
        blue: 'text-[#2F6BFF]',
        orange: 'text-[#FFA62B]',
        green: 'text-[#10B981]',
        purple: 'text-[#A78BFA]',
        red: 'text-[#EF4444]',
    };

    const bgColors = {
        blue: 'bg-brand-blue/20',
        orange: 'bg-accent-orange/20',
        green: 'bg-green-500/20',
        purple: 'bg-purple-500/20',
        red: 'bg-red-500/20',
    };

    const borderColors = {
        blue: 'border-brand-blue/30',
        orange: 'border-accent-orange/30',
        green: 'border-green-400/30',
        purple: 'border-purple-500/30',
        red: 'border-red-500/30',
    };

    const gradientOverlays = {
        blue: 'from-brand-blue/10 to-transparent',
        orange: 'from-accent-orange/10 to-transparent',
        green: 'from-green-500/10 to-transparent',
        purple: 'from-purple-500/10 to-transparent',
        red: 'from-red-500/10 to-transparent',
    };

    const badgeColors = {
        success: 'bg-green-500/20 text-green-400 border-green-400/30',
        warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30',
        info: 'bg-purple-500/20 text-purple-400 border-purple-400/30',
    };

    // Clone the icon element and add the color class
    const coloredIcon = isValidElement(icon)
        ? cloneElement(icon as any, {
            className: `w-6 h-6 ${iconColorClasses[variant]} force-icon-color !opacity-100`,
            'data-icon-color': variant,
            style: { opacity: '1 !important', visibility: 'visible' }
        })
        : icon;

    return (
        <GlassCard
            variant={variant}
            onClick={onClick}
            className="animate-fade-in-up relative stat-card-wrapper"
            style={{ animationDelay: `${delay}ms` }}
            data-variant={variant}
        >
            {/* Gradient overlay for better contrast */}
            <div className={`absolute inset-0 bg-gradient-to-br ${gradientOverlays[variant]} opacity-50 rounded-2xl pointer-events-none`}></div>

            <div className="flex items-center justify-between mb-4 relative z-10">
                <div className={`relative w-12 h-12 rounded-xl ${bgColors[variant]} flex items-center justify-center shadow-lg border ${borderColors[variant]} transition-transform`}>
                    <div className={`absolute inset-0 bg-gradient-to-br ${bgColors[variant]} opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none z-0`}></div>
                    <div className={`relative z-20 stat-card-icon ${iconColorClasses[variant]}`} data-icon-color={variant}>
                        {coloredIcon}
                    </div>
                </div>
                {(change || badge) && (
                    <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${change
                        ? (change.isPositive ? 'bg-green-500/20 border border-green-400/30' : 'bg-red-500/20 border border-red-400/30')
                        : `border ${badgeColors[badgeVariant]}`
                        }`}>
                        {change && (
                            <div className={`stat-card-change ${change.isPositive ? 'text-green-400' : 'text-red-400'}`} data-change-type={change.isPositive ? 'positive' : 'negative'}>
                                {change.isPositive ? (
                                    <TrendingUp className={`w-3 h-3 inline ${change.isPositive ? 'text-green-400' : 'text-red-400'} force-icon-color`} />
                                ) : (
                                    <TrendingDown className={`w-3 h-3 inline ${change.isPositive ? 'text-green-400' : 'text-red-400'} force-icon-color`} />
                                )}
                                <span className="ml-1" data-change-value="true">
                                    {change.isPositive ? '+' : ''}{change.value.toFixed(1)}%
                                </span>
                            </div>
                        )}
                        {badge && !change && badge}
                    </div>
                )}
            </div>
            <div className="relative z-10">
                <p className="text-xs text-[#E8B4B8] mb-1 font-bold uppercase tracking-wide">{label}</p>
                <p className={`text-2xl font-bold mb-1 tabular-nums text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]`}>{value}</p>
                {subtitle && <p className="text-xs text-white font-medium">{subtitle}</p>}
            </div>
            {sparkline && (
                <div className="mt-4 -mb-2 relative z-10">
                    {sparkline}
                </div>
            )}
        </GlassCard>
    );
}


