// Enhanced Page Layout Components with Professional Alignment
// Based on 8px grid system and modern dashboard best practices

import { ReactNode } from 'react';

// ============================================================================
// CONTAINER COMPONENTS
// ============================================================================

interface PageContainerProps {
    children: ReactNode;
    maxWidth?: 'text' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
    className?: string;
    noPadding?: boolean;
}

/**
 * Main page container with consistent padding and max-width
 * Uses 8px grid system for spacing
 */
export function PageContainer({
    children,
    maxWidth = 'xl',
    className = '',
    noPadding = false
}: PageContainerProps) {
    const maxWidthClasses = {
        text: 'max-w-prose',     // 65ch - Optimal for reading
        sm: 'max-w-3xl',         // 768px - Narrow pages
        md: 'max-w-5xl',         // 1024px - Standard pages
        lg: 'max-w-6xl',         // 1152px - Wide pages
        xl: 'max-w-7xl',         // 1280px - Dashboard default
        '2xl': 'max-w-[1400px]', // 1400px - Extra wide
        full: 'max-w-full'       // No limit
    };

    const paddingClasses = noPadding ? '' : 'px-1 sm:px-2 lg:px-2 py-1 sm:py-2 lg:py-2';

    return (
        <div className={`w-full min-w-0 ${paddingClasses} ${className}`}>
            <div className={`w-full ${maxWidthClasses[maxWidth]} mx-auto`}>
                {children}
            </div>
        </div>
    );
}

// ============================================================================
// SECTION COMPONENTS
// ============================================================================

interface PageSectionProps {
    children: ReactNode;
    className?: string;
    spacing?: 'tight' | 'normal' | 'relaxed' | 'loose';
    background?: 'transparent' | 'subtle' | 'gradient';
    fullWidth?: boolean;
}

/**
 * Section container for grouping related content
 * Follows 8px grid for vertical rhythm
 */
export function PageSection({
    children,
    className = '',
    spacing = 'normal',
    background = 'transparent',
    fullWidth = false
}: PageSectionProps) {
    const spacingClasses = {
        tight: 'mb-6',       // 24px
        normal: 'mb-8',      // 32px
        relaxed: 'mb-10',    // 40px
        loose: 'mb-12'       // 48px
    };

    const backgroundClasses = {
        transparent: '',
        subtle: 'bg-[#16124A]/30',
        gradient: 'bg-gradient-to-r from-[#2F6BFF]/10 to-[#FFA62B]/10'
    };

    const widthClasses = fullWidth ? 'w-full' : '';
    const paddingClasses = background !== 'transparent' ? 'py-8 px-4' : '';

    return (
        <div className={`${spacingClasses[spacing]} ${backgroundClasses[background]} ${widthClasses} ${paddingClasses} ${className}`}>
            {background !== 'transparent' ? (
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            ) : (
                children
            )}
        </div>
    );
}

// ============================================================================
// GRID COMPONENTS
// ============================================================================

interface PageGridProps {
    children: ReactNode;
    cols?: 1 | 2 | 3 | 4 | 5 | 6;
    gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
    alignItems?: 'start' | 'center' | 'end' | 'stretch';
}

/**
 * Responsive grid layout with 8px-based gaps
 */
export function PageGrid({
    children,
    cols = 3,
    gap = 'md',
    alignItems = 'stretch',
    className = ''
}: PageGridProps) {
    const colClasses = {
        1: 'grid-cols-1',
        2: 'grid-cols-1 sm:grid-cols-2',
        3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
        4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
        5: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
        6: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6'
    };

    const gapClasses = {
        xs: 'gap-2',      // 8px
        sm: 'gap-3',      // 12px
        md: 'gap-4',      // 16px
        lg: 'gap-5',      // 20px
        xl: 'gap-6'       // 24px
    };

    const alignClasses = {
        start: 'items-start',
        center: 'items-center',
        end: 'items-end',
        stretch: 'items-stretch'
    };

    return (
        <div className={`grid ${colClasses[cols]} ${gapClasses[gap]} ${alignClasses[alignItems]} ${className}`}>
            {children}
        </div>
    );
}

// ============================================================================
// CARD COMPONENTS
// ============================================================================

interface PageCardProps {
    children: ReactNode;
    className?: string;
    hover?: boolean;
    padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    variant?: 'default' | 'bordered' | 'elevated' | 'glass';
}

/**
 * Card component with consistent styling and 8px padding
 */
export function PageCard({
    children,
    className = '',
    hover = true,
    padding = 'md',
    variant = 'default'
}: PageCardProps) {
    const paddingClasses = {
        none: '',
        xs: 'p-2',              // 8px
        sm: 'p-3',              // 12px
        md: 'p-4',              // 16px
        lg: 'p-5',              // 20px
        xl: 'p-6'               // 24px
    };

    const variantClasses = {
        default: 'bg-[#35335e]/90 border border-[#2F6BFF]/20',
        bordered: 'bg-[#35335e]/80 border-2 border-[#2F6BFF]/30',
        elevated: 'bg-[#35335e]/95 border border-[#2F6BFF]/20 shadow-lg shadow-[#2F6BFF]/10',
        glass: 'bg-[#35335e]/70 backdrop-blur-sm border border-[#2F6BFF]/20'
    };

    const hoverClasses = hover
        ? 'hover:border-[#2F6BFF] hover:shadow-lg hover:shadow-[#2F6BFF]/10 transition-all duration-300'
        : '';

    return (
        <div className={`rounded-xl ${variantClasses[variant]} ${paddingClasses[padding]} ${hoverClasses} ${className}`}>
            {children}
        </div>
    );
}

// ============================================================================
// CONTENT COMPONENTS
// ============================================================================

interface ContentWrapperProps {
    children: ReactNode;
    maxWidth?: 'text' | 'narrow' | 'normal' | 'wide';
    align?: 'left' | 'center';
    className?: string;
}

/**
 * Wrapper for text content with optimal reading width
 */
export function ContentWrapper({
    children,
    maxWidth = 'normal',
    align = 'left',
    className = ''
}: ContentWrapperProps) {
    const widthClasses = {
        text: 'max-w-prose',      // 65ch - Optimal reading
        narrow: 'max-w-2xl',      // 672px
        normal: 'max-w-4xl',      // 896px
        wide: 'max-w-6xl'         // 1152px
    };

    const alignClasses = {
        left: '',
        center: 'mx-auto text-center'
    };

    return (
        <div className={`${widthClasses[maxWidth]} ${alignClasses[align]} ${className}`}>
            {children}
        </div>
    );
}

interface StackProps {
    children: ReactNode;
    spacing?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

/**
 * Vertical stack with consistent spacing (8px grid)
 */
export function Stack({ children, spacing = 'md', className = '' }: StackProps) {
    const spacingClasses = {
        xs: 'space-y-2',    // 8px
        sm: 'space-y-3',    // 12px
        md: 'space-y-4',    // 16px
        lg: 'space-y-6',    // 24px
        xl: 'space-y-8'     // 32px
    };

    return (
        <div className={`${spacingClasses[spacing]} ${className}`}>
            {children}
        </div>
    );
}

// ============================================================================
// LAYOUT COMPONENTS
// ============================================================================

interface TwoColumnLayoutProps {
    left: ReactNode;
    right: ReactNode;
    leftWidth?: 'narrow' | 'balanced' | 'wide';
    gap?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
    sticky?: boolean;
    stickyScroll?: boolean; // New prop for sticky left with scrollable right
}

/**
 * Two column layout with responsive behavior
 */
export function TwoColumnLayout({
    left,
    right,
    leftWidth = 'balanced',
    gap = 'lg',
    sticky = false,
    stickyScroll = false,
    className = ''
}: TwoColumnLayoutProps) {
    const widthClasses = {
        narrow: 'lg:grid-cols-[280px_1fr]',
        balanced: 'lg:grid-cols-2',
        wide: 'lg:grid-cols-[1fr_280px]'
    };

    const gapClasses = {
        sm: 'gap-4',     // 16px
        md: 'gap-6',     // 24px
        lg: 'gap-8',     // 32px
        xl: 'gap-10'     // 40px
    };

    // If stickyScroll is enabled, use a different layout approach
    if (stickyScroll) {
        return (
            <div className={`grid grid-cols-1 ${widthClasses[leftWidth]} ${gapClasses[gap]} ${className}`}>
                <div className="lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
                    {left}
                </div>
                <div className="lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
                    {right}
                </div>
            </div>
        );
    }

    return (
        <div className={`grid grid-cols-1 ${widthClasses[leftWidth]} ${gapClasses[gap]} ${className}`}>
            <div className={sticky ? 'lg:sticky lg:top-24 lg:self-start' : ''}>
                {left}
            </div>
            <div>{right}</div>
        </div>
    );
}

interface ThreeColumnLayoutProps {
    left: ReactNode;
    center: ReactNode;
    right: ReactNode;
    gap?: 'sm' | 'md' | 'lg';
    className?: string;
}

/**
 * Three column layout for complex dashboards
 */
export function ThreeColumnLayout({
    left,
    center,
    right,
    gap = 'md',
    className = ''
}: ThreeColumnLayoutProps) {
    const gapClasses = {
        sm: 'gap-4',
        md: 'gap-6',
        lg: 'gap-8'
    };

    return (
        <div className={`grid grid-cols-1 lg:grid-cols-[280px_1fr_280px] ${gapClasses[gap]} ${className}`}>
            <div>{left}</div>
            <div>{center}</div>
            <div>{right}</div>
        </div>
    );
}

// ============================================================================
// STATS & DATA COMPONENTS
// ============================================================================

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

/**
 * Content section with optional title, description, and actions
 * Used for grouping related content with a header
 */
export function ContentSection({
    title,
    description,
    children,
    className = '',
    actions
}: {
    title?: string;
    description?: string;
    children: ReactNode;
    className?: string;
    actions?: ReactNode;
}) {
    return (
        <div className={className}>
            {(title || description || actions) && (
                <div className="flex items-center justify-between mb-3">
                    <div>
                        {title && (
                            <h2 className="text-sm font-semibold text-white mb-0.5">
                                {title}
                            </h2>
                        )}
                        {description && (
                            <p className="text-xs text-gray-400">
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

/**
 * Stats card with icon, value, and optional trend
 */
export function StatsCard({
    icon,
    value,
    label,
    trend,
    iconColor = 'text-[#2F6BFF]',
    className = ''
}: StatsCardProps) {
    return (
        <PageCard hover className={className}>
            <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-[#2F6BFF]/20 to-[#FFA62B]/20 rounded-lg flex items-center justify-center shrink-0">
                    <div className={iconColor}>
                        {icon}
                    </div>
                </div>
                {trend && (
                    <span className={`text-xs font-semibold ${trend.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                        {trend.isPositive ? '+' : ''}{trend.value}%
                    </span>
                )}
            </div>
            <div className="text-xl font-bold text-white mb-0.5 font-tabular">{value}</div>
            <div className="text-xs text-gray-400">{label}</div>
        </PageCard>
    );
}

// ============================================================================
// STATE COMPONENTS
// ============================================================================

interface EmptyStateProps {
    icon: ReactNode;
    title: string;
    description: string;
    action?: ReactNode;
}

/**
 * Empty state with icon, title, description, and optional action
 */
export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 sm:py-20 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#2F6BFF]/20 to-[#FFA62B]/20 rounded-2xl flex items-center justify-center mb-6">
                <div className="text-[#2F6BFF]">
                    {icon}
                </div>
            </div>
            <h3 className="text-xl sm:text-2xl font-semibold text-white mb-3">
                {title}
            </h3>
            <p className="text-base text-gray-400 max-w-md mb-8">
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

interface LoadingStateProps {
    message?: string;
    size?: 'sm' | 'md' | 'lg';
}

/**
 * Loading state with spinner and optional message
 */
export function LoadingState({ message = 'Loading...', size = 'md' }: LoadingStateProps) {
    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-12 h-12',
        lg: 'w-16 h-16'
    };

    return (
        <div className="flex flex-col items-center justify-center py-16 sm:py-20">
            <div className={`${sizeClasses[size]} border-4 border-[#2F6BFF]/20 border-t-[#2F6BFF] rounded-full animate-spin mb-4`}></div>
            <p className="text-sm text-gray-400">{message}</p>
        </div>
    );
}

// ============================================================================
// UTILITY COMPONENTS
// ============================================================================

interface DividerProps {
    spacing?: 'sm' | 'md' | 'lg';
    className?: string;
}

/**
 * Horizontal divider with consistent spacing
 */
export function Divider({ spacing = 'md', className = '' }: DividerProps) {
    const spacingClasses = {
        sm: 'my-4',     // 16px
        md: 'my-6',     // 24px
        lg: 'my-8'      // 32px
    };

    return (
        <hr className={`border-t border-[#2F6BFF]/20 ${spacingClasses[spacing]} ${className}`} />
    );
}

interface SpacerProps {
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

/**
 * Vertical spacer for fine-tuned spacing control
 */
export function Spacer({ size = 'md' }: SpacerProps) {
    const sizeClasses = {
        xs: 'h-2',      // 8px
        sm: 'h-4',      // 16px
        md: 'h-6',      // 24px
        lg: 'h-8',      // 32px
        xl: 'h-10',     // 40px
        '2xl': 'h-12'   // 48px
    };

    return <div className={sizeClasses[size]} aria-hidden="true" />;
}
