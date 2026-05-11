// Standardized Page Header Component
// Supports both standard and hero layouts with consistent styling

import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface PageHeaderProps {
    // Content
    title: string;
    description?: string;
    badge?: string;
    badgeIcon?: string;

    // Icon
    icon?: LucideIcon;
    iconColor?: string;

    // Layout
    variant?: 'standard' | 'hero';

    // Actions
    actions?: ReactNode;

    // Additional content
    children?: ReactNode;
}

export function PageHeader({
    title,
    description,
    badge,
    badgeIcon,
    icon: Icon,
    iconColor = 'text-[#2F6BFF]',
    variant = 'standard',
    actions,
    children,
}: PageHeaderProps) {
    if (variant === 'hero') {
        return (
            <div className="text-center mb-6 sm:mb-8">
                {/* Badge */}
                {badge && (
                    <div className="inline-block mb-2 sm:mb-3">
                        <span className="px-3 py-1.5 bg-gradient-to-r from-[#2F6BFF]/20 to-[#FFA62B]/20 border border-[#2F6BFF]/30 rounded-full text-xs sm:text-sm text-[#2F6BFF] font-semibold backdrop-blur-sm">
                            {badgeIcon && <span className="mr-2">{badgeIcon}</span>}
                            {badge}
                        </span>
                    </div>
                )}

                {/* Title */}
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-normal mb-2 sm:mb-3 leading-tight uppercase">
                    <span className="block bg-gradient-to-r from-[#efdede] via-[#B8BEC9] to-[#efdede] bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(160,167,181,0.4)]">
                        {title}
                    </span>
                </h1>

                {/* Description */}
                {description && (
                    <p className="text-xs sm:text-sm md:text-base text-gray-200 max-w-2xl mx-auto leading-relaxed">
                        {description}
                    </p>
                )}

                {/* Additional Content */}
                {children}
            </div>
        );
    }

    // Standard variant
    return (
        <div className="mb-3 sm:mb-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-3">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                        {/* Icon */}
                        {Icon && (
                            <div className="w-8 h-8 bg-gradient-to-br from-[#2F6BFF]/20 to-[#FFA62B]/20 rounded-lg flex items-center justify-center shrink-0">
                                <Icon className={`w-4 h-4 ${iconColor}`} />
                            </div>
                        )}

                        {/* Title */}
                        <h1 className="text-lg sm:text-xl md:text-2xl font-normal uppercase">
                            <span className="bg-gradient-to-r from-[#efdede] via-[#B8BEC9] to-[#efdede] bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(160,167,181,0.4)]">
                                {title}
                            </span>
                        </h1>
                    </div>

                    {/* Description */}
                    {description && (
                        <p className="text-gray-300 text-xs sm:text-sm ml-0 sm:ml-10">
                            {description}
                        </p>
                    )}
                </div>

                {/* Actions */}
                {actions && (
                    <div className="shrink-0">
                        {actions}
                    </div>
                )}
            </div>

            {/* Additional Content */}
            {children}
        </div>
    );
}

// Standard action button for consistency
interface PageHeaderActionProps {
    onClick: () => void;
    disabled?: boolean;
    loading?: boolean;
    icon?: LucideIcon;
    children: ReactNode;
    variant?: 'primary' | 'secondary';
}

export function PageHeaderAction({
    onClick,
    disabled,
    loading,
    icon: Icon,
    children,
    variant = 'primary',
}: PageHeaderActionProps) {
    const baseClasses = "flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed";

    const variantClasses = variant === 'primary'
        ? "bg-gradient-to-r from-[#2F6BFF] to-[#3B82F6] hover:from-[#3B82F6] hover:to-[#2F6BFF] text-white"
        : "bg-[#16124A]/50 border border-[#2F6BFF]/20 hover:bg-[#2F6BFF]/10 hover:border-[#2F6BFF]/50 text-gray-200";

    return (
        <button
            onClick={onClick}
            disabled={disabled || loading}
            className={`${baseClasses} ${variantClasses}`}
        >
            {Icon && <Icon className="w-4 h-4" />}
            <span>{loading ? 'Loading...' : children}</span>
        </button>
    );
}

// Live indicator badge
export function LiveBadge() {
    return (
        <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-sm text-green-400 font-semibold">Live</span>
        </div>
    );
}
