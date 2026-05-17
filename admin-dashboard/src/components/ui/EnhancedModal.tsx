// Enhanced Modal Component - Reusable across all pages
// Premium design with glass-morphism, animated backgrounds, and gradient effects

import { ReactNode } from 'react';

interface EnhancedModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    showCloseButton?: boolean;
}

export function EnhancedModal({
    isOpen,
    onClose,
    title,
    children,
    maxWidth = 'xl',
    showCloseButton = true,
}: EnhancedModalProps) {
    if (!isOpen) return null;

    const maxWidthClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-2xl z-[9999] flex items-center justify-center p-4 animate-fadeIn">
            <div className={`relative w-full ${maxWidthClasses[maxWidth]}`}>
                {/* Enhanced Animated Background with More Orbs */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#0B0633] via-[#1A1450] to-[#0B0633] pointer-events-none rounded-3xl"></div>

                {/* Multiple Gradient Orbs for Depth */}
                <div className="absolute -top-20 -right-20 w-80 h-80 bg-gradient-to-br from-[#2F6BFF]/30 via-purple-500/20 to-transparent rounded-full blur-3xl animate-pulse-slow pointer-events-none"></div>
                <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-gradient-to-tr from-[#FFA62B]/25 via-pink-500/15 to-transparent rounded-full blur-3xl animate-pulse-slow pointer-events-none" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-gradient-to-br from-purple-500/15 via-[#2F6BFF]/15 to-transparent rounded-full blur-3xl animate-pulse-slow pointer-events-none" style={{ animationDelay: '2s' }}></div>
                <div className="absolute bottom-1/3 left-1/4 w-56 h-56 bg-gradient-to-tr from-violet-500/15 via-[#FFA62B]/10 to-transparent rounded-full blur-3xl animate-pulse-slow pointer-events-none" style={{ animationDelay: '1.5s' }}></div>

                {/* Enhanced Grid Pattern */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none rounded-3xl" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

                {/* Modal Content with Enhanced Glass Effect */}
                <div className="relative glass-card-elevated rounded-3xl shadow-[0_0_80px_rgba(47,107,255,0.4)] border-2 border-[#2F6BFF]/40 backdrop-blur-3xl animate-scaleIn overflow-hidden">
                    {/* Animated Border Glow */}
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-[#2F6BFF]/20 via-purple-500/20 to-[#FFA62B]/20 opacity-50 blur-xl animate-pulse-slow pointer-events-none"></div>

                    {/* Header with Enhanced Gradient */}
                    <div className="relative px-4 py-2.5 border-b-2 border-[#2F6BFF]/30 bg-gradient-to-r from-[#2F6BFF]/10 via-purple-500/10 to-[#FFA62B]/10 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#2F6BFF]/10 via-transparent to-[#FFA62B]/10 opacity-60"></div>
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(47,107,255,0.15),transparent_50%)]"></div>

                        {/* Close Button - Absolute Positioned */}
                        {showCloseButton && (
                            <button
                                onClick={onClose}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white hover:bg-[#2F6BFF]/30 rounded-xl p-1.5 transition-all duration-300 hover:scale-110 hover:rotate-90 smooth-hover group z-10"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-[#2F6BFF]/20 to-purple-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity blur-md"></div>
                                <svg className="w-5 h-5 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}

                        {/* Centered Title */}
                        <div className="relative flex items-center justify-center">
                            <h2 className="text-sm font-bold">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-r from-[#2F6BFF] to-[#FFA62B] blur-lg opacity-60 animate-pulse-slow"></div>
                                    <span className="relative bg-gradient-to-r from-[#2F6BFF] via-purple-400 to-[#FFA62B] bg-clip-text text-transparent animate-gradient-x drop-shadow-[0_0_8px_rgba(47,107,255,0.5)]">
                                        {title}
                                    </span>
                                </div>
                            </h2>
                        </div>
                    </div>

                    {/* Modal Body - Content passed as children */}
                    <div className="p-3 relative">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Enhanced Modal Section Card - For organizing content within modals
interface ModalSectionCardProps {
    children: ReactNode;
    title?: string;
    icon?: ReactNode;
    colorScheme?: 'blue' | 'orange' | 'red' | 'green' | 'purple';
    className?: string;
}

export function ModalSectionCard({
    children,
    title,
    icon,
    colorScheme = 'blue',
    className = '',
}: ModalSectionCardProps) {
    const colorSchemes = {
        blue: {
            border: 'border-[#2F6BFF]/40',
            shadow: 'shadow-[0_8px_32px_rgba(47,107,255,0.15)]',
            bg: 'bg-gradient-to-br from-[#2F6BFF]/10 via-purple-500/5 to-transparent',
            hoverBg: 'from-[#2F6BFF]/15 to-purple-500/15',
            orbBg: 'bg-[#2F6BFF]/20',
            iconBg: 'from-[#2F6BFF]/50 to-purple-500/50',
            iconShadow: 'shadow-[0_0_20px_rgba(47,107,255,0.4)]',
            iconBorder: 'border-[#2F6BFF]/30',
            iconDropShadow: 'drop-shadow-[0_0_4px_rgba(47,107,255,0.8)]',
            textGradient: 'from-white via-[#2F6BFF] to-purple-400',
            textDropShadow: 'drop-shadow-[0_0_8px_rgba(47,107,255,0.3)]',
        },
        orange: {
            border: 'border-[#FFA62B]/40',
            shadow: 'shadow-[0_8px_32px_rgba(255,166,43,0.15)]',
            bg: 'bg-gradient-to-br from-[#FFA62B]/10 via-yellow-500/5 to-transparent',
            hoverBg: 'from-[#FFA62B]/15 to-yellow-500/15',
            orbBg: 'bg-[#FFA62B]/20',
            iconBg: 'from-[#FFA62B]/50 to-yellow-500/50',
            iconShadow: 'shadow-[0_0_20px_rgba(255,166,43,0.4)]',
            iconBorder: 'border-[#FFA62B]/30',
            iconDropShadow: 'drop-shadow-[0_0_4px_rgba(255,166,43,0.8)]',
            textGradient: 'from-white via-[#FFA62B] to-yellow-400',
            textDropShadow: 'drop-shadow-[0_0_8px_rgba(255,166,43,0.3)]',
        },
        red: {
            border: 'border-red-500/40',
            shadow: 'shadow-[0_8px_32px_rgba(239,68,68,0.15)]',
            bg: 'bg-gradient-to-br from-red-500/10 via-orange-500/5 to-transparent',
            hoverBg: 'from-red-500/15 to-orange-500/15',
            orbBg: 'bg-red-500/20',
            iconBg: 'from-red-500/50 to-orange-500/50',
            iconShadow: 'shadow-[0_0_20px_rgba(239,68,68,0.4)]',
            iconBorder: 'border-red-500/30',
            iconDropShadow: 'drop-shadow-[0_0_4px_rgba(239,68,68,0.8)]',
            textGradient: 'from-white via-red-400 to-orange-400',
            textDropShadow: 'drop-shadow-[0_0_8px_rgba(239,68,68,0.3)]',
        },
        green: {
            border: 'border-green-500/40',
            shadow: 'shadow-[0_8px_32px_rgba(34,197,94,0.15)]',
            bg: 'bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-transparent',
            hoverBg: 'from-green-500/15 to-emerald-500/15',
            orbBg: 'bg-green-500/20',
            iconBg: 'from-green-500/50 to-emerald-500/50',
            iconShadow: 'shadow-[0_0_20px_rgba(34,197,94,0.4)]',
            iconBorder: 'border-green-500/30',
            iconDropShadow: 'drop-shadow-[0_0_4px_rgba(34,197,94,0.8)]',
            textGradient: 'from-white via-green-400 to-emerald-400',
            textDropShadow: 'drop-shadow-[0_0_8px_rgba(34,197,94,0.3)]',
        },
        purple: {
            border: 'border-purple-500/40',
            shadow: 'shadow-[0_8px_32px_rgba(168,85,247,0.15)]',
            bg: 'bg-gradient-to-br from-purple-500/10 via-violet-500/5 to-transparent',
            hoverBg: 'from-purple-500/15 to-violet-500/15',
            orbBg: 'bg-purple-500/20',
            iconBg: 'from-purple-500/50 to-violet-500/50',
            iconShadow: 'shadow-[0_0_20px_rgba(168,85,247,0.4)]',
            iconBorder: 'border-purple-500/30',
            iconDropShadow: 'drop-shadow-[0_0_4px_rgba(168,85,247,0.8)]',
            textGradient: 'from-white via-purple-400 to-violet-400',
            textDropShadow: 'drop-shadow-[0_0_8px_rgba(168,85,247,0.3)]',
        },
    };

    const colors = colorSchemes[colorScheme];

    return (
        <div
            className={`glass-card-elevated p-2.5 rounded-xl smooth-hover border-2 ${colors.border} ${colors.shadow} backdrop-blur-2xl relative overflow-hidden group animate-fade-in-up ${colors.bg} ${className}`}
        >
            <div className={`absolute inset-0 bg-gradient-to-br ${colors.hoverBg} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            <div className={`absolute -top-20 -right-20 w-40 h-40 ${colors.orbBg} rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>

            <div className="relative z-10 space-y-2">
                {title && (
                    <h3 className="text-xs font-bold flex items-center gap-2 text-white mb-2">
                        {icon && (
                            <div className={`relative w-5 h-5 rounded-lg bg-gradient-to-br ${colors.iconBg} flex items-center justify-center ${colors.iconShadow} glow-hover border-2 ${colors.iconBorder} group-hover:scale-110 transition-transform`}>
                                <div className={`text-white ${colors.iconDropShadow}`}>{icon}</div>
                                <div className={`absolute inset-0 rounded-lg bg-gradient-to-br ${colors.iconBg} opacity-0 group-hover:opacity-100 transition-opacity animate-pulse-slow`}></div>
                                <div className={`absolute inset-0 rounded-lg ${colors.orbBg} blur-md opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                            </div>
                        )}
                        <span className={`bg-gradient-to-r ${colors.textGradient} bg-clip-text text-transparent ${colors.textDropShadow}`}>
                            {title}
                        </span>
                    </h3>
                )}
                {children}
            </div>
        </div>
    );
}

// Enhanced Modal Actions - For action buttons at the bottom of modals
interface ModalActionsProps {
    children: ReactNode;
    className?: string;
}

export function ModalActions({ children, className = '' }: ModalActionsProps) {
    return (
        <div className={`flex items-center justify-end gap-2 pt-1 animate-fade-in-up ${className}`}>
            {children}
        </div>
    );
}

// Enhanced Modal Button - Primary action button
interface ModalButtonProps {
    children: ReactNode;
    onClick?: () => void;
    type?: 'button' | 'submit' | 'reset';
    variant?: 'primary' | 'secondary' | 'danger';
    disabled?: boolean;
    className?: string;
}

export function ModalButton({
    children,
    onClick,
    type = 'button',
    variant = 'primary',
    disabled = false,
    className = '',
}: ModalButtonProps) {
    const variants = {
        primary: 'bg-gradient-to-r from-[#2F6BFF] via-purple-600 to-[#2F6BFF] hover:from-[#2F6BFF] hover:via-purple-500 hover:to-[#2F6BFF] shadow-[0_4px_24px_rgba(47,107,255,0.4)] hover:shadow-[0_8px_32px_rgba(47,107,255,0.6)] border-[#2F6BFF]/50 hover:border-[#2F6BFF]/80',
        secondary: 'bg-gradient-to-br from-gray-700/40 to-gray-800/40 hover:from-gray-700/60 hover:to-gray-800/60 shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.4)] border-gray-600/40 hover:border-gray-500/60',
        danger: 'bg-gradient-to-r from-red-600 via-red-500 to-red-600 hover:from-red-500 hover:via-red-400 hover:to-red-500 shadow-[0_4px_24px_rgba(239,68,68,0.4)] hover:shadow-[0_8px_32px_rgba(239,68,68,0.6)] border-red-500/50 hover:border-red-500/80',
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`relative flex items-center gap-2 px-4 py-1.5 ${variants[variant]} text-white rounded-lg transition-all duration-300 font-bold overflow-hidden group hover:scale-105 text-sm border-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${className}`}
        >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            {variant === 'primary' && (
                <div className="absolute inset-0 bg-gradient-to-r from-[#2F6BFF]/50 to-purple-600/50 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            )}
            <span className="relative drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">{children}</span>
        </button>
    );
}
