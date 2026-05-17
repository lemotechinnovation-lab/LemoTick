// Reusable Page Layout Components
// Ensures consistent alignment, spacing, and structure across all pages

import { ReactNode } from 'react';

// Main page container with consistent padding and max-width
interface PageContainerProps {
    children: ReactNode;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
    className?: string;
}

export function PageContainer({ children, maxWidth = 'xl', className = '' }: PageContainerProps) {
    const maxWidthClasses = {
        sm: 'max-w-3xl',      // 768px - Narrow pages
        md: 'max-w-5xl',      // 1024px - Standard pages
        lg: 'max-w-6xl',      // 1152px - Wide pages
        xl: 'max-w-7xl',      // 1280px - Extra wide (default)
        '2xl': 'max-w-[1400px]', // 1400px - Very wide
        full: 'max-w-full'    // No limit
    };

    return (
        <div className={`w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 ${className}`}>
            <div className={`w-full ${maxWidthClasses[maxWidth]} mx-auto`}>
                {children}
            </div>
        </div>
    );
}

// Hero page container with background effects
interface HeroPageContainerProps {
    children: ReactNode;
    className?: string;
}

export function HeroPageContainer({ children, className = '' }: HeroPageContainerProps) {
    return (
        <div className={`w-full min-w-0 relative ${className}`}>
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5" style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(47, 107, 255, 0.15) 1px, transparent 0)',
                backgroundSize: '32px 32px'
            }}></div>

            {/* Animated gradient orbs */}
            <div className="absolute top-20 left-10 w-72 h-72 bg-[#2F6BFF]/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#FFA62B]/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

            {/* Content */}
            <div className="relative px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
                <div className="w-full max-w-7xl mx-auto">
                    {children}
                </div>
            </div>
        </div>
    );
}

// Section container for grouping related content
interface PageSectionProps {
    children: ReactNode;
    className?: string;
    spacing?: 'sm' | 'md' | 'lg';
}

export function PageSection({ children, className = '', spacing = 'md' }: PageSectionProps) {
    const spacingClasses = {
        sm: 'mb-4 sm:mb-6',
        md: 'mb-6 sm:mb-8',
        lg: 'mb-8 sm:mb-12'
    };

    return (
        <div className={`${spacingClasses[spacing]} ${className}`}>
            {children}
        </div>
    );
}

// Grid layout for stats cards, data cards, etc.
interface PageGridProps {
    children: ReactNode;
    cols?: 1 | 2 | 3 | 4 | 5;
    gap?: 'sm' | 'md' | 'lg';
    className?: string;
}

export function PageGrid({ children, cols = 4, gap = 'md', className = '' }: PageGridProps) {
    const colClasses = {
        1: 'grid-cols-1',
        2: 'grid-cols-1 sm:grid-cols-2',
        3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
        4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
        5: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5'
    };

    const gapClasses = {
        sm: 'gap-3 sm:gap-4',
        md: 'gap-4 sm:gap-6',
        lg: 'gap-6 sm:gap-8'
    };

    return (
        <div className={`grid ${colClasses[cols]} ${gapClasses[gap]} ${className}`}>
            {children}
        </div>
    );
}

// Card component for consistent styling
interface PageCardProps {
    children: ReactNode;
    className?: string;
    hover?: boolean;
    padding?: 'sm' | 'md' | 'lg';
}

export function PageCard({ children, className = '', hover = true, padding = 'md' }: PageCardProps) {
    const paddingClasses = {
        sm: 'p-3 sm:p-4',
        md: 'p-4 sm:p-6',
        lg: 'p-6 sm:p-8'
    };

    const hoverClasses = hover
        ? 'hover:border-[#2F6BFF] hover:shadow-lg hover:shadow-[#2F6BFF]/10 transition-all duration-300'
        : '';

    return (
        <div className={`rounded-2xl bg-[#35335e]/90 border border-[#2F6BFF]/20 ${paddingClasses[padding]} ${hoverClasses} ${className}`}>
            {children}
        </div>
    );
}

// Stats card with icon, value, and label
interface StatsCardProps {
    icon: ReactNode;
    value: string | number;
    label: string;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    iconColor?: string;
    className?: string;
}

export function StatsCard({ icon, value, label, trend, iconColor = 'text-[#2F6BFF]', className = '' }: StatsCardProps) {
    return (
        <PageCard hover className={className}>
            <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#2F6BFF]/20 to-[#FFA62B]/20 rounded-xl flex items-center justify-center shrink-0">
                    <div className={iconColor}>
                        {icon}
                    </div>
                </div>
                {trend && (
                    <span className={`text-sm font-semibold ${trend.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                        {trend.isPositive ? '+' : ''}{trend.value}%
                    </span>
                )}
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white mb-1">{value}</div>
            <div className="text-sm text-gray-400">{label}</div>
        </PageCard>
    );
}

// Content section with optional title
interface ContentSectionProps {
    title?: string;
    description?: string;
    children: ReactNode;
    className?: string;
    actions?: ReactNode;
}

export function ContentSection({ title, description, children, className = '', actions }: ContentSectionProps) {
    return (
        <div className={className}>
            {(title || description || actions) && (
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <div>
                        {title && (
                            <h2 className="text-lg sm:text-xl font-semibold text-white mb-1">
                                {title}
                            </h2>
                        )}
                        {description && (
                            <p className="text-sm text-gray-400">
                                {description}
                            </p>
                        )}
                    </div>
                    {actions && (
                        <div className="shrink-0">
                            {actions}
                        </div>
                    )}
                </div>
            )}
            {children}
        </div>
    );
}

// Two column layout
interface TwoColumnLayoutProps {
    left: ReactNode;
    right: ReactNode;
    leftWidth?: 'narrow' | 'balanced' | 'wide';
    gap?: 'sm' | 'md' | 'lg';
    className?: string;
}

export function TwoColumnLayout({ left, right, leftWidth = 'balanced', gap = 'md', className = '' }: TwoColumnLayoutProps) {
    const widthClasses = {
        narrow: 'lg:grid-cols-[300px_1fr]',
        balanced: 'lg:grid-cols-2',
        wide: 'lg:grid-cols-[1fr_300px]'
    };

    const gapClasses = {
        sm: 'gap-4',
        md: 'gap-6',
        lg: 'gap-8'
    };

    return (
        <div className={`grid grid-cols-1 ${widthClasses[leftWidth]} ${gapClasses[gap]} ${className}`}>
            <div>{left}</div>
            <div>{right}</div>
        </div>
    );
}

// Empty state component
interface EmptyStateProps {
    icon: ReactNode;
    title: string;
    description: string;
    action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#2F6BFF]/20 to-[#FFA62B]/20 rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
                <div className="text-[#2F6BFF]">
                    {icon}
                </div>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">
                {title}
            </h3>
            <p className="text-sm sm:text-base text-gray-400 max-w-md mb-6">
                {description}
            </p>
            {action && (
                <div>
                    {action}
                </div>
            )}
        </div>
    );
}

// Loading state component
interface LoadingStateProps {
    message?: string;
}

export function LoadingState({ message = 'Loading...' }: LoadingStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-12 sm:py-16">
            <div className="w-12 h-12 border-4 border-[#2F6BFF]/20 border-t-[#2F6BFF] rounded-full animate-spin mb-4"></div>
            <p className="text-sm text-gray-400">{message}</p>
        </div>
    );
}


