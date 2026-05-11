// Public Page Components - Enhanced Typography & Styling
// Consistent design system for all public-facing pages

import { ReactNode } from 'react';

// Enhanced Page Header Component
interface PageHeaderProps {
    title: string;
    subtitle?: string;
    badge?: string;
    children?: ReactNode;
}

export function EnhancedPageHeader({ title, subtitle, badge, children }: PageHeaderProps) {
    return (
        <div className="text-center mb-12">
            {badge && (
                <div className="inline-block mb-6">
                    <span className="px-5 py-2.5 bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 rounded-full text-sm text-primary font-bold backdrop-blur-sm shadow-lg shadow-primary/20">
                        {badge}
                    </span>
                </div>
            )}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
                {title}
            </h1>
            {subtitle && (
                <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto font-medium leading-relaxed">
                    {subtitle}
                </p>
            )}
            {children}
        </div>
    );
}

// Enhanced Section Header
interface SectionHeaderProps {
    title: string;
    subtitle?: string;
    align?: 'left' | 'center';
}

export function EnhancedSectionHeader({ title, subtitle, align = 'center' }: SectionHeaderProps) {
    return (
        <div className={`mb-10 ${align === 'center' ? 'text-center' : 'text-left'}`}>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
                {title}
            </h2>
            {subtitle && (
                <p className="text-base md:text-lg text-gray-300 font-medium leading-relaxed max-w-2xl ${align === 'center' ? 'mx-auto' : ''}">
                    {subtitle}
                </p>
            )}
        </div>
    );
}

// Enhanced Card Component
interface EnhancedCardProps {
    children: ReactNode;
    className?: string;
    hover?: boolean;
}

export function EnhancedCard({ children, className = '', hover = true }: EnhancedCardProps) {
    return (
        <div className={`p-6 md:p-8 rounded-2xl bg-card/30 backdrop-blur-md border border-primary/20 shadow-[0_0_20px_rgba(47,107,255,0.12)] transition-all ${hover ? 'hover:bg-card/40 hover:shadow-[0_0_25px_rgba(47,107,255,0.18)] hover:border-primary/30' : ''} ${className}`}>
            {children}
        </div>
    );
}

// Enhanced Feature Card
interface FeatureCardProps {
    icon: ReactNode;
    title: string;
    description: string;
    iconColor?: string;
}

export function EnhancedFeatureCard({ icon, title, description, iconColor = 'bg-primary/20' }: FeatureCardProps) {
    return (
        <EnhancedCard>
            <div className={`w-14 h-14 rounded-2xl ${iconColor} flex items-center justify-center mb-5 shadow-lg`}>
                {icon}
            </div>
            <h3 className="text-xl font-bold text-white mb-3">
                {title}
            </h3>
            <p className="text-gray-300 leading-relaxed font-medium">
                {description}
            </p>
        </EnhancedCard>
    );
}

// Enhanced Stats Card
interface StatsCardProps {
    value: string;
    label: string;
    icon?: ReactNode;
    trend?: string;
}

export function EnhancedStatsCard({ value, label, icon, trend }: StatsCardProps) {
    return (
        <EnhancedCard className="text-center">
            {icon && (
                <div className="flex justify-center mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                        {icon}
                    </div>
                </div>
            )}
            <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                {value}
            </div>
            <div className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                {label}
            </div>
            {trend && (
                <div className="mt-3 text-sm font-bold text-green-400">
                    {trend}
                </div>
            )}
        </EnhancedCard>
    );
}

// Enhanced Button
interface EnhancedButtonProps {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    onClick?: () => void;
    className?: string;
}

export function EnhancedButton({
    children,
    variant = 'primary',
    size = 'md',
    onClick,
    className = ''
}: EnhancedButtonProps) {
    const baseClasses = 'font-bold rounded-xl transition-all shadow-lg';

    const variantClasses = {
        primary: 'bg-gradient-to-r from-primary to-blue-500 hover:from-blue-500 hover:to-primary text-white shadow-primary/30',
        secondary: 'bg-card/40 hover:bg-card/60 backdrop-blur-sm border border-primary/30 text-white',
        outline: 'bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-white'
    };

    const sizeClasses = {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg'
    };

    return (
        <button
            onClick={onClick}
            className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        >
            {children}
        </button>
    );
}

// Enhanced List Item
interface ListItemProps {
    icon?: ReactNode;
    children: ReactNode;
}

export function EnhancedListItem({ icon, children }: ListItemProps) {
    return (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-dark/30 hover:bg-dark/50 transition-all">
            {icon && (
                <div className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    {icon}
                </div>
            )}
            <p className="text-gray-200 font-medium leading-relaxed">
                {children}
            </p>
        </div>
    );
}

// Enhanced Pricing Card
interface PricingCardProps {
    title: string;
    price: string;
    period?: string;
    features: string[];
    highlighted?: boolean;
    badge?: string;
    buttonText?: string;
    onButtonClick?: () => void;
}

export function EnhancedPricingCard({
    title,
    price,
    period = '/month',
    features,
    highlighted = false,
    badge,
    buttonText = 'Get Started',
    onButtonClick
}: PricingCardProps) {
    return (
        <div className={`relative p-8 rounded-2xl backdrop-blur-md border transition-all ${highlighted
                ? 'bg-gradient-to-br from-primary/20 to-accent/20 border-primary/50 shadow-[0_0_30px_rgba(47,107,255,0.25)] scale-105'
                : 'bg-card/30 border-primary/20 shadow-[0_0_20px_rgba(47,107,255,0.12)] hover:shadow-[0_0_25px_rgba(47,107,255,0.18)]'
            }`}>
            {badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1.5 bg-gradient-to-r from-accent to-primary text-white text-xs font-bold rounded-full shadow-lg">
                        {badge}
                    </span>
                </div>
            )}

            <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-4">
                    {title}
                </h3>
                <div className="flex items-baseline justify-center gap-2">
                    <span className="text-5xl font-bold text-white">
                        {price}
                    </span>
                    <span className="text-gray-400 font-semibold">
                        {period}
                    </span>
                </div>
            </div>

            <div className="space-y-3 mb-8">
                {features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                            <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <span className="text-gray-200 font-medium">
                            {feature}
                        </span>
                    </div>
                ))}
            </div>

            <EnhancedButton
                variant={highlighted ? 'primary' : 'secondary'}
                size="lg"
                onClick={onButtonClick}
                className="w-full"
            >
                {buttonText}
            </EnhancedButton>
        </div>
    );
}

// Enhanced FAQ Item
interface FAQItemProps {
    question: string;
    answer: string;
    isOpen: boolean;
    onToggle: () => void;
}

export function EnhancedFAQItem({ question, answer, isOpen, onToggle }: FAQItemProps) {
    return (
        <div className="rounded-2xl bg-card/30 backdrop-blur-md border border-primary/20 shadow-[0_0_20px_rgba(47,107,255,0.12)] overflow-hidden transition-all hover:shadow-[0_0_25px_rgba(47,107,255,0.18)]">
            <button
                onClick={onToggle}
                className="w-full p-6 flex items-center justify-between text-left hover:bg-card/40 transition-all"
            >
                <span className="text-lg font-bold text-white pr-4">
                    {question}
                </span>
                <div className={`w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </button>
            {isOpen && (
                <div className="px-6 pb-6">
                    <p className="text-gray-300 leading-relaxed font-medium">
                        {answer}
                    </p>
                </div>
            )}
        </div>
    );
}

// Enhanced Container
interface ContainerProps {
    children: ReactNode;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
    className?: string;
}

export function EnhancedContainer({ children, maxWidth = 'xl', className = '' }: ContainerProps) {
    const maxWidthClasses = {
        sm: 'max-w-2xl',
        md: 'max-w-4xl',
        lg: 'max-w-5xl',
        xl: 'max-w-6xl',
        '2xl': 'max-w-7xl',
        full: 'max-w-full'
    };

    return (
        <div className={`mx-auto px-4 sm:px-6 lg:px-8 ${maxWidthClasses[maxWidth]} ${className}`}>
            {children}
        </div>
    );
}

// Enhanced Section
interface SectionProps {
    children: ReactNode;
    className?: string;
    background?: 'default' | 'gradient' | 'dark';
}

export function EnhancedSection({ children, className = '', background = 'default' }: SectionProps) {
    const bgClasses = {
        default: 'bg-transparent',
        gradient: 'bg-gradient-to-b from-dark to-card',
        dark: 'bg-dark/50'
    };

    return (
        <section className={`py-16 md:py-24 ${bgClasses[background]} ${className}`}>
            {children}
        </section>
    );
}
