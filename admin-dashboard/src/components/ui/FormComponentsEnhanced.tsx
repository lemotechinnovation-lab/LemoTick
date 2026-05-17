// Enhanced Form Components - 2026 Modern Design Patterns
// Features: Bento-grid layouts, micro-animations, reduced scrolling, visual hierarchy

import { AlertCircle, Check, Info } from 'lucide-react';
import { ReactNode } from 'react';

// Form Container - Limits width for better readability
interface FormContainerProps {
    children: ReactNode;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    className?: string;
}

export function FormContainer({ children, maxWidth = 'lg', className = '' }: FormContainerProps) {
    const maxWidthClasses = {
        sm: 'max-w-md',   // 448px - Single column forms
        md: 'max-w-2xl',  // 672px - Standard forms
        lg: 'max-w-5xl',  // 1024px - Two-three column forms (increased)
        xl: 'max-w-7xl',  // 1280px - Complex multi-column forms (increased)
        full: 'max-w-full'
    };

    return (
        <div className={`w-full ${maxWidthClasses[maxWidth]} mx-auto ${className}`}>
            {children}
        </div>
    );
}

// Enhanced Form Section with Card Style
interface FormSectionProps {
    title?: string;
    description?: string;
    children: ReactNode;
    className?: string;
    variant?: 'default' | 'card' | 'elevated';
    icon?: ReactNode;
}

export function FormSection({
    title,
    description,
    children,
    className = '',
    variant = 'card',
    icon
}: FormSectionProps) {
    const variantClasses = {
        default: '',
        card: 'p-5 rounded-xl border border-[#2F6BFF]/20 bg-[#16124A]/30 backdrop-blur-sm',
        elevated: 'p-5 rounded-xl border border-[#2F6BFF]/30 bg-gradient-to-br from-[#16124A]/50 to-[#0B0633]/50 shadow-xl backdrop-blur-sm hover:border-[#2F6BFF]/50 transition-all duration-300'
    };

    return (
        <div className={`${variantClasses[variant]} ${className}`}>
            {(title || description) && (
                <div className="mb-4 pb-3 border-b border-[#2F6BFF]/20">
                    {title && (
                        <div className="flex items-center gap-2.5 mb-1.5">
                            {icon && (
                                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#2F6BFF]/20 to-[#3B82F6]/20 flex items-center justify-center">
                                    {icon}
                                </div>
                            )}
                            <h3 className="text-base font-semibold text-white">
                                {title}
                            </h3>
                        </div>
                    )}
                    {description && (
                        <p className="text-xs text-gray-400 leading-relaxed">
                            {description}
                        </p>
                    )}
                </div>
            )}
            <div className="space-y-4">
                {children}
            </div>
        </div>
    );
}

// Compact Form Section - For dense layouts
interface CompactFormSectionProps {
    title?: string;
    children: ReactNode;
    className?: string;
    columns?: 1 | 2 | 3 | 4;
}

export function CompactFormSection({
    title,
    children,
    className = '',
    columns = 2
}: CompactFormSectionProps) {
    const gridClasses = {
        1: 'grid-cols-1',
        2: 'grid-cols-1 lg:grid-cols-2',
        3: 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3',
        4: 'grid-cols-1 md:grid-cols-2 xl:grid-cols-4'
    };

    return (
        <div className={`p-4 rounded-xl border border-[#2F6BFF]/15 bg-[#16124A]/20 backdrop-blur-sm hover:border-[#2F6BFF]/30 transition-all duration-300 ${className}`}>
            {title && (
                <h4 className="text-xs font-semibold text-gray-300 mb-3 uppercase tracking-wide">
                    {title}
                </h4>
            )}
            <div className={`grid ${gridClasses[columns]} gap-3`}>
                {children}
            </div>
        </div>
    );
}

// Enhanced Form Field with better visual hierarchy
interface FormFieldProps {
    label: string;
    htmlFor?: string;
    required?: boolean;
    helpText?: string;
    error?: string;
    children: ReactNode;
    className?: string;
    inline?: boolean; // New: for horizontal label-input layout
    compact?: boolean; // New: for reduced spacing
}

export function FormField({
    label,
    htmlFor,
    required,
    helpText,
    error,
    children,
    className = '',
    inline = false,
    compact = false
}: FormFieldProps) {
    if (inline) {
        return (
            <div className={`flex items-start gap-4 ${compact ? 'py-2' : 'py-3'} ${className}`}>
                <label
                    htmlFor={htmlFor}
                    className="flex-shrink-0 w-32 pt-2 text-sm font-medium text-gray-300"
                >
                    {label}
                    {required && <span className="text-red-400 ml-1">*</span>}
                </label>
                <div className="flex-1 space-y-1">
                    {children}
                    {helpText && !error && (
                        <div className="flex items-start gap-1.5 text-xs text-gray-500">
                            <Info className="w-3 h-3 mt-0.5 shrink-0" />
                            <span>{helpText}</span>
                        </div>
                    )}
                    {error && (
                        <div className="flex items-start gap-1.5 text-xs text-red-400 animate-slideDown">
                            <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className={`${compact ? 'space-y-1.5' : 'space-y-2'} ${className}`}>
            <label
                htmlFor={htmlFor}
                className="block text-sm font-medium text-gray-200"
            >
                {label}
                {required && <span className="text-red-400 ml-1">*</span>}
            </label>
            {children}
            {helpText && !error && (
                <div className="flex items-start gap-1.5 text-xs text-gray-500">
                    <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <span>{helpText}</span>
                </div>
            )}
            {error && (
                <div className="flex items-start gap-1.5 text-xs text-red-400 animate-slideDown">
                    <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
}

// Compact Field - For inline label-value pairs
interface CompactFieldProps {
    label: string;
    children: ReactNode;
    className?: string;
}

export function CompactField({ label, children, className = '' }: CompactFieldProps) {
    return (
        <div className={`flex items-center justify-between gap-2 ${className}`}>
            <label className="text-xs font-medium text-gray-300 flex-shrink-0">
                {label}
            </label>
            <div className="flex-1 max-w-[180px]">
                {children}
            </div>
        </div>
    );
}

// Enhanced Input with micro-animations
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: boolean;
    icon?: ReactNode;
    variant?: 'default' | 'compact';
}

export function Input({ error, icon, variant = 'default', className = '', ...props }: InputProps) {
    const sizeClasses = variant === 'compact' ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-2 text-sm';
    const iconSize = variant === 'compact' ? 'pl-7' : 'pl-9';

    return (
        <div className="relative group">
            {icon && (
                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                    <div className="text-gray-400 group-focus-within:text-[#2F6BFF] transition-colors duration-200">
                        {icon}
                    </div>
                </div>
            )}
            <input
                className={`
                    w-full ${sizeClasses}
                    ${icon ? iconSize : ''}
                    bg-[#16124A]/50 
                    border ${error ? 'border-red-500/50' : 'border-[#2F6BFF]/20'}
                    rounded-lg 
                    text-white
                    placeholder-gray-500
                    focus:outline-none focus:ring-1 
                    ${error ? 'focus:ring-red-500/50 focus:border-red-500' : 'focus:ring-[#2F6BFF]/50 focus:border-[#2F6BFF]'}
                    hover:border-[#2F6BFF]/40
                    transition-all duration-200
                    backdrop-blur-sm
                    hover:bg-[#16124A]/70
                    focus:bg-[#16124A]/70
                    ${className}
                `}
                {...props}
            />
        </div>
    );
}

// Enhanced Textarea
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    error?: boolean;
}

export function Textarea({ error, className = '', ...props }: TextareaProps) {
    return (
        <textarea
            className={`
                w-full px-4 py-2.5 
                bg-[#16124A]/50 
                border ${error ? 'border-red-500/50' : 'border-[#2F6BFF]/20'}
                rounded-lg 
                text-white text-sm
                placeholder-gray-500
                focus:outline-none focus:ring-2 
                ${error ? 'focus:ring-red-500/50 focus:border-red-500' : 'focus:ring-[#2F6BFF]/50 focus:border-[#2F6BFF]'}
                hover:border-[#2F6BFF]/40
                transition-all duration-200
                backdrop-blur-sm
                hover:bg-[#16124A]/70
                focus:bg-[#16124A]/70
                resize-none
                ${className}
            `}
            {...props}
        />
    );
}

// Enhanced Select with better styling
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    error?: boolean;
    variant?: 'default' | 'compact';
}

export function Select({ error, variant = 'default', className = '', children, ...props }: SelectProps) {
    const sizeClasses = variant === 'compact' ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-2 text-sm';

    return (
        <select
            className={`
                w-full ${sizeClasses}
                bg-[#16124A]/50 
                border ${error ? 'border-red-500/50' : 'border-[#2F6BFF]/20'}
                rounded-lg 
                text-white
                focus:outline-none focus:ring-1 
                ${error ? 'focus:ring-red-500/50 focus:border-red-500' : 'focus:ring-[#2F6BFF]/50 focus:border-[#2F6BFF]'}
                hover:border-[#2F6BFF]/40
                transition-all duration-200
                backdrop-blur-sm
                hover:bg-[#16124A]/70
                focus:bg-[#16124A]/70
                cursor-pointer
                ${className}
            `}
            {...props}
        >
            {children}
        </select>
    );
}

// Enhanced Toggle with micro-animations
interface ToggleProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label?: string;
    description?: string;
    disabled?: boolean;
    variant?: 'default' | 'compact';
}

export function Toggle({ checked, onChange, label, description, disabled, variant = 'default' }: ToggleProps) {
    if (variant === 'compact') {
        return (
            <div className="flex items-center justify-between gap-3 py-2">
                <div className="flex-1">
                    {label && (
                        <div className="text-sm font-medium text-gray-300">
                            {label}
                        </div>
                    )}
                    {description && (
                        <div className="text-xs text-gray-500 mt-0.5">
                            {description}
                        </div>
                    )}
                </div>
                <button
                    type="button"
                    role="switch"
                    aria-checked={checked}
                    disabled={disabled}
                    onClick={() => onChange(!checked)}
                    className={`
                        relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full 
                        border-2 border-transparent transition-all duration-200 ease-in-out 
                        focus:outline-none focus:ring-2 focus:ring-[#2F6BFF] focus:ring-offset-2 focus:ring-offset-[#0B0633]
                        ${checked ? 'bg-[#2F6BFF] shadow-[0_0_12px_rgba(47,107,255,0.4)]' : 'bg-gray-600'}
                        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'}
                    `}
                >
                    <span
                        className={`
                            pointer-events-none inline-block h-4 w-4 transform rounded-full 
                            bg-white shadow-lg ring-0 transition-all duration-200 ease-in-out
                            ${checked ? 'translate-x-4 scale-110' : 'translate-x-0'}
                        `}
                    />
                </button>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-between gap-4 p-4 bg-[#0B0633]/50 border border-[#2F6BFF]/20 rounded-xl hover:border-[#2F6BFF]/40 hover:bg-[#0B0633]/70 transition-all duration-200 group">
            <div className="flex-1">
                {label && (
                    <div className="text-sm font-medium text-white mb-0.5 group-hover:text-gray-100 transition-colors">
                        {label}
                    </div>
                )}
                {description && (
                    <div className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">
                        {description}
                    </div>
                )}
            </div>
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                disabled={disabled}
                onClick={() => onChange(!checked)}
                className={`
                    relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full 
                    border-2 border-transparent transition-all duration-200 ease-in-out 
                    focus:outline-none focus:ring-2 focus:ring-[#2F6BFF] focus:ring-offset-2 focus:ring-offset-[#0B0633]
                    ${checked ? 'bg-[#2F6BFF] shadow-[0_0_16px_rgba(47,107,255,0.5)]' : 'bg-gray-600'}
                    ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl'}
                `}
            >
                <span
                    className={`
                        pointer-events-none inline-block h-5 w-5 transform rounded-full 
                        bg-white shadow-lg ring-0 transition-all duration-200 ease-in-out
                        ${checked ? 'translate-x-5 scale-110' : 'translate-x-0'}
                    `}
                />
            </button>
        </div>
    );
}

// Advanced Form Grid - Bento-style with varied columns
interface FormGridProps {
    children: ReactNode;
    columns?: 1 | 2 | 3 | 4;
    className?: string;
    gap?: 'sm' | 'md' | 'lg';
}

export function FormGrid({ children, columns = 2, className = '', gap = 'md' }: FormGridProps) {
    const gridClasses = {
        1: 'grid-cols-1',
        2: 'grid-cols-1 lg:grid-cols-2',
        3: 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3',
        4: 'grid-cols-1 md:grid-cols-2 xl:grid-cols-4'
    };

    const gapClasses = {
        sm: 'gap-3',
        md: 'gap-5',
        lg: 'gap-6'
    };

    return (
        <div className={`grid ${gridClasses[columns]} ${gapClasses[gap]} ${className}`}>
            {children}
        </div>
    );
}

// Bento Grid - For varied-size layouts
interface BentoGridProps {
    children: ReactNode;
    className?: string;
}

export function BentoGrid({ children, className = '' }: BentoGridProps) {
    return (
        <div className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 auto-rows-auto ${className}`}>
            {children}
        </div>
    );
}

// Bento Item - Individual items in bento grid
interface BentoItemProps {
    children: ReactNode;
    span?: 1 | 2 | 3;
    className?: string;
}

export function BentoItem({ children, span = 1, className = '' }: BentoItemProps) {
    const spanClasses = {
        1: '',
        2: 'md:col-span-2',
        3: 'md:col-span-2 xl:col-span-3'
    };

    return (
        <div className={`${spanClasses[span]} ${className}`}>
            {children}
        </div>
    );
}

// Field Group - For grouping related fields horizontally
interface FieldGroupProps {
    children: ReactNode;
    label?: string;
    className?: string;
}

export function FieldGroup({ children, label, className = '' }: FieldGroupProps) {
    return (
        <div className={`space-y-2 ${className}`}>
            {label && (
                <label className="block text-sm font-medium text-gray-200">
                    {label}
                </label>
            )}
            <div className="flex gap-3">
                {children}
            </div>
        </div>
    );
}

// Form Actions - Enhanced button group
interface FormActionsProps {
    children: ReactNode;
    align?: 'left' | 'right' | 'center' | 'between';
    className?: string;
    sticky?: boolean; // New: for sticky footer
}

export function FormActions({ children, align = 'right', className = '', sticky = false }: FormActionsProps) {
    const alignClasses = {
        left: 'justify-start',
        right: 'justify-end',
        center: 'justify-center',
        between: 'justify-between'
    };

    const stickyClasses = sticky
        ? 'sticky bottom-0 bg-gradient-to-t from-[#0B0633] via-[#0B0633]/95 to-transparent pt-8 pb-4 -mx-6 px-6 backdrop-blur-sm'
        : 'pt-6 border-t border-[#2F6BFF]/20';

    return (
        <div className={`flex items-center gap-3 ${stickyClasses} ${alignClasses[align]} ${className}`}>
            {children}
        </div>
    );
}

// Divider with label
interface DividerProps {
    label?: string;
    className?: string;
}

export function Divider({ label, className = '' }: DividerProps) {
    if (label) {
        return (
            <div className={`relative flex items-center ${className}`}>
                <div className="flex-grow border-t border-[#2F6BFF]/20"></div>
                <span className="flex-shrink mx-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {label}
                </span>
                <div className="flex-grow border-t border-[#2F6BFF]/20"></div>
            </div>
        );
    }

    return <div className={`border-t border-[#2F6BFF]/20 ${className}`} />;
}

// Success Message with animation
interface SuccessMessageProps {
    message: string;
    onDismiss?: () => void;
}

export function SuccessMessage({ message, onDismiss }: SuccessMessageProps) {
    return (
        <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl animate-slideDown backdrop-blur-sm">
            <div className="flex items-start gap-3">
                <div className="shrink-0 w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center animate-pulse">
                    <Check className="w-3 h-3 text-green-400" />
                </div>
                <div className="flex-1">
                    <p className="text-sm text-green-200">{message}</p>
                </div>
                {onDismiss && (
                    <button
                        onClick={onDismiss}
                        className="shrink-0 text-green-400 hover:text-green-300 transition-colors hover:scale-110 transform duration-200"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>
        </div>
    );
}

// Error Message with animation
interface ErrorMessageProps {
    message: string;
    onDismiss?: () => void;
}

export function ErrorMessage({ message, onDismiss }: ErrorMessageProps) {
    return (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl animate-slideDown backdrop-blur-sm">
            <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 animate-pulse" />
                <div className="flex-1">
                    <p className="text-sm text-red-200">{message}</p>
                </div>
                {onDismiss && (
                    <button
                        onClick={onDismiss}
                        className="shrink-0 text-red-400 hover:text-red-300 transition-colors hover:scale-110 transform duration-200"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>
        </div>
    );
}

// Info Message
interface InfoMessageProps {
    message: string;
    onDismiss?: () => void;
}

export function InfoMessage({ message, onDismiss }: InfoMessageProps) {
    return (
        <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl backdrop-blur-sm">
            <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-400 shrink-0" />
                <div className="flex-1">
                    <p className="text-sm text-blue-200">{message}</p>
                </div>
                {onDismiss && (
                    <button
                        onClick={onDismiss}
                        className="shrink-0 text-blue-400 hover:text-blue-300 transition-colors hover:scale-110 transform duration-200"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>
        </div>
    );
}


