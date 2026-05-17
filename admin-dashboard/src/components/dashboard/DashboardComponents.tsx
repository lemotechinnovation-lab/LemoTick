// Reusable Dashboard Components
// Compact, modern components for trading dashboard following TimelinePageEnhanced style

import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

// ============================================================================
// STAT CARD (KPI Metric)
// ============================================================================

interface StatCardProps {
    label: string;
    value: string | number;
    change?: string;
    changeType?: 'positive' | 'negative' | 'neutral';
    icon?: LucideIcon;
    iconColor?: string;
    iconBgFrom?: string;
    iconBgTo?: string;
    trend?: 'up' | 'down' | 'neutral';
    loading?: boolean;
}

export function StatCard({ label, value, change, changeType = 'neutral', icon: Icon, iconColor, iconBgFrom, iconBgTo, trend, loading }: StatCardProps) {
    const changeColors = {
        positive: 'text-green-400 bg-green-500/20',
        negative: 'text-red-400 bg-red-500/20',
        neutral: 'text-gray-400 bg-gray-500/20',
    };

    const trendIcons = {
        up: '↑',
        down: '↓',
        neutral: '→',
    };

    return (
        <div className="p-4 rounded-xl bg-card/30 backdrop-blur-md hover:bg-card/40 transition-all duration-300 shadow-[0_0_30px_rgba(47,107,255,0.15)] hover:shadow-[0_0_40px_rgba(47,107,255,0.25)]">
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</span>
                {Icon && (
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${iconBgFrom || 'from-primary/15'} ${iconBgTo || 'to-accent/15'} flex items-center justify-center`}>
                        <Icon className={`w-4 h-4 ${iconColor || 'text-primary'}`} />
                    </div>
                )}
            </div>

            {loading ? (
                <div className="h-8 bg-gray-700/50 rounded animate-pulse"></div>
            ) : (
                <>
                    <div className="text-2xl md:text-3xl font-black text-white mb-1">
                        {value}
                    </div>
                    {change && (
                        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${changeColors[changeType]}`}>
                            {trend && <span>{trendIcons[trend]}</span>}
                            {change}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

// ============================================================================
// PROGRESS BAR (Drawdown/Target)
// ============================================================================

interface ProgressBarProps {
    label: string;
    current: number;
    max: number;
    unit?: string;
    showPercentage?: boolean;
    colorScheme?: 'green' | 'red' | 'blue' | 'yellow';
    warning?: boolean;
}

export function ProgressBar({
    label,
    current,
    max,
    unit = '',
    showPercentage = true,
    colorScheme = 'green',
    warning = false
}: ProgressBarProps) {
    const percentage = Math.min((current / max) * 100, 100);

    const colors = {
        green: 'from-green-500 to-emerald-500',
        red: 'from-red-500 to-rose-500',
        blue: 'from-[#2F6BFF] to-[#3B82F6]',
        yellow: 'from-yellow-500 to-orange-500',
    };

    const textColors = {
        green: 'text-green-400',
        red: 'text-red-400',
        blue: 'text-[#2F6BFF]',
        yellow: 'text-yellow-400',
    };

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-gray-400">{label}</span>
                <span className={`text-xs font-bold ${warning ? 'text-yellow-400' : textColors[colorScheme]}`}>
                    {current}{unit} / {max}{unit}
                    {showPercentage && ` (${percentage.toFixed(1)}%)`}
                </span>
            </div>
            <div className="h-2 bg-gray-700/50 rounded-full overflow-hidden">
                <div
                    className={`h-full bg-gradient-to-r ${colors[colorScheme]} rounded-full transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
            {warning && percentage > 80 && (
                <p className="text-xs text-yellow-400 font-medium">⚠️ Approaching limit</p>
            )}
        </div>
    );
}

// ============================================================================
// STATUS BADGE
// ============================================================================

interface StatusBadgeProps {
    status: 'active' | 'inactive' | 'pending' | 'warning' | 'error' | 'success';
    label?: string;
    pulse?: boolean;
}

export function StatusBadge({ status, label, pulse = false }: StatusBadgeProps) {
    const configs = {
        active: {
            bg: 'bg-green-500/20',
            border: 'border-green-500/40',
            text: 'text-green-400',
            dot: 'bg-green-400',
            label: label || 'Active',
        },
        inactive: {
            bg: 'bg-gray-500/20',
            border: 'border-gray-500/40',
            text: 'text-gray-400',
            dot: 'bg-gray-400',
            label: label || 'Inactive',
        },
        pending: {
            bg: 'bg-yellow-500/20',
            border: 'border-yellow-500/40',
            text: 'text-yellow-400',
            dot: 'bg-yellow-400',
            label: label || 'Pending',
        },
        warning: {
            bg: 'bg-orange-500/20',
            border: 'border-orange-500/40',
            text: 'text-orange-400',
            dot: 'bg-orange-400',
            label: label || 'Warning',
        },
        error: {
            bg: 'bg-red-500/20',
            border: 'border-red-500/40',
            text: 'text-red-400',
            dot: 'bg-red-400',
            label: label || 'Error',
        },
        success: {
            bg: 'bg-green-500/20',
            border: 'border-green-500/40',
            text: 'text-green-400',
            dot: 'bg-green-400',
            label: label || 'Success',
        },
    };

    const config = configs[status];

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 ${config.bg} rounded-full text-xs font-bold ${config.text}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${config.dot} ${pulse ? 'animate-pulse' : ''}`}></div>
            {config.label}
        </span>
    );
}

// ============================================================================
// METRIC CARD (Large Display)
// ============================================================================

interface MetricCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon?: LucideIcon;
    iconColor?: string;
    iconBgFrom?: string;
    iconBgTo?: string;
    trend?: {
        value: string;
        direction: 'up' | 'down' | 'neutral';
    };
    children?: ReactNode;
}

export function MetricCard({ title, value, subtitle, icon: Icon, iconColor, iconBgFrom, iconBgTo, trend, children }: MetricCardProps) {
    const trendColors = {
        up: 'text-green-400',
        down: 'text-red-400',
        neutral: 'text-gray-400',
    };

    return (
        <div className="p-5 rounded-2xl bg-card/30 backdrop-blur-md hover:bg-card/40 transition-all duration-300 shadow-[0_0_30px_rgba(47,107,255,0.15)] hover:shadow-[0_0_40px_rgba(47,107,255,0.25)]">
            <div className="flex items-start justify-between mb-3">
                <div>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-1">{title}</h3>
                    {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
                </div>
                {Icon && (
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${iconBgFrom || 'from-primary/15'} ${iconBgTo || 'to-accent/15'} flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 ${iconColor || 'text-primary'}`} />
                    </div>
                )}
            </div>

            <div className="text-3xl md:text-4xl font-black text-white mb-2">
                {value}
            </div>

            {trend && (
                <div className={`flex items-center gap-1 text-sm font-bold ${trendColors[trend.direction]}`}>
                    <span>{trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '→'}</span>
                    <span>{trend.value}</span>
                </div>
            )}

            {children && (
                <div className="mt-4 pt-4 border-t border-gray-700/50">
                    {children}
                </div>
            )}
        </div>
    );
}

// ============================================================================
// QUICK ACTION BUTTON
// ============================================================================

interface QuickActionProps {
    icon: LucideIcon;
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'success' | 'danger';
    disabled?: boolean;
}

export function QuickAction({ icon: Icon, label, onClick, variant = 'primary', disabled }: QuickActionProps) {
    const variants = {
        primary: 'bg-gradient-to-r from-[#2F6BFF] to-[#3B82F6] hover:from-[#3B82F6] hover:to-[#2F6BFF] text-white',
        secondary: 'bg-card/40 hover:bg-card/60 border border-primary/30 hover:border-primary/50 text-white',
        success: 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-emerald-500 hover:to-green-500 text-white',
        danger: 'bg-gradient-to-r from-red-500 to-rose-500 hover:from-rose-500 hover:to-red-500 text-white',
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]}`}
        >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
        </button>
    );
}

// ============================================================================
// DATA TABLE ROW
// ============================================================================

interface TableRowProps {
    children: ReactNode;
    onClick?: () => void;
    className?: string;
}

export function TableRow({ children, onClick, className = '' }: TableRowProps) {
    return (
        <tr
            onClick={onClick}
            className={`border-b border-gray-700/50 hover:bg-card/20 transition-colors ${onClick ? 'cursor-pointer' : ''} ${className}`}
        >
            {children}
        </tr>
    );
}

interface TableCellProps {
    children: ReactNode;
    align?: 'left' | 'center' | 'right';
    className?: string;
}

export function TableCell({ children, align = 'left', className = '' }: TableCellProps) {
    const alignClasses = {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right',
    };

    return (
        <td className={`px-4 py-3 text-xs font-medium ${alignClasses[align]} ${className}`}>
            {children}
        </td>
    );
}

// ============================================================================
// EMPTY STATE
// ============================================================================

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2F6BFF]/20 to-[#FFA62B]/20 flex items-center justify-center mb-4">
                <Icon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
            <p className="text-sm text-gray-400 max-w-md mb-6">{description}</p>
            {action && (
                <button
                    onClick={action.onClick}
                    className="px-6 py-3 bg-gradient-to-r from-[#2F6BFF] to-[#3B82F6] text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all duration-300"
                >
                    {action.label}
                </button>
            )}
        </div>
    );
}

// ============================================================================
// LOADING SKELETON
// ============================================================================

export function LoadingSkeleton({ className = '' }: { className?: string }) {
    return (
        <div className={`bg-gray-700/50 rounded animate-pulse ${className}`}></div>
    );
}

// ============================================================================
// ALERT/NOTIFICATION
// ============================================================================

interface AlertProps {
    type: 'info' | 'success' | 'warning' | 'error';
    title?: string;
    message: string;
    onClose?: () => void;
}

export function Alert({ type, title, message, onClose }: AlertProps) {
    const configs = {
        info: {
            bg: 'bg-blue-500/20',
            border: 'border-blue-500/40',
            text: 'text-blue-400',
            icon: 'ℹ️',
        },
        success: {
            bg: 'bg-green-500/20',
            border: 'border-green-500/40',
            text: 'text-green-400',
            icon: '✓',
        },
        warning: {
            bg: 'bg-yellow-500/20',
            border: 'border-yellow-500/40',
            text: 'text-yellow-400',
            icon: '⚠️',
        },
        error: {
            bg: 'bg-red-500/20',
            border: 'border-red-500/40',
            text: 'text-red-400',
            icon: '✕',
        },
    };

    const config = configs[type];

    return (
        <div className={`p-4 rounded-xl ${config.bg} border ${config.border} backdrop-blur-md`}>
            <div className="flex items-start gap-3">
                <span className="text-lg">{config.icon}</span>
                <div className="flex-1">
                    {title && <h4 className={`text-sm font-bold ${config.text} mb-1`}>{title}</h4>}
                    <p className="text-xs text-gray-300">{message}</p>
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        ✕
                    </button>
                )}
            </div>
        </div>
    );
}


