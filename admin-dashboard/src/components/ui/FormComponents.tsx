// Professional Form Components inspired by Stripe & Asana
// Max-width containers, proper spacing, visual hierarchy

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
        lg: 'max-w-4xl',  // 896px - Two column forms
        xl: 'max-w-6xl',  // 1152px - Complex forms
        full: 'max-w-full'
    };

    return (
        <div className={`w-full ${maxWidthClasses[maxWidth]} mx-auto ${className}`}>
            {children}
        </div>
    );
}

// Form Section - Groups related fields with optional title
interface FormSectionProps {
    title?: string;
    description?: string;
    children: ReactNode;
    className?: string;
}

export function FormSection({ title, description, children, className = '' }: FormSectionProps) {
    return (
        <div className={`space-y-6 ${className}`}>
            {(title || description) && (
                <div className="space-y-1">
                    {title && (
                        <h3 className="text-lg font-semibold text-white">
                            {title}
                        </h3>
                    )}
                    {description && (
                        <p className="text-sm text-gray-400">
                            {description}
                        </p>
                    )}
                </div>
            )}
            <div className="space-y-5">
                {children}
            </div>
        </div>
    );
}

// Form Field - Individual field with label and optional help text
interface FormFieldProps {
    label: string;
    htmlFor?: string;
    required?: boolean;
    helpText?: string;
    error?: string;
    children: ReactNode;
    className?: string;
}

export function FormField({ label, htmlFor, required, helpText, error, children, className = '' }: FormFieldProps) {
    return (
        <div className={`space-y-2 ${className}`}>
            <label
                htmlFor={htmlFor}
                className="block text-sm font-medium text-gray-200"
            >
                {label}
                {required && <span className="text-red-400 ml-1">*</span>}
            </label>
            {children}
            {helpText && !error && (
                <div className="flex items-start gap-1.5 text-xs text-gray-400">
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

// Input - Styled text input
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: boolean;
    icon?: ReactNode;
}

export function Input({ error, icon, className = '', ...props }: InputProps) {
    return (
        <div className="relative">
            {icon && (
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <div className="text-gray-400">
                        {icon}
                    </div>
                </div>
            )}
            <input
                className={`
                    w-full px-4 py-2.5 
                    ${icon ? 'pl-10' : ''}
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
                    ${className}
                `}
                {...props}
            />
        </div>
    );
}

// Textarea - Styled textarea
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
                resize-none
                ${className}
            `}
            {...props}
        />
    );
}

// Select - Styled select dropdown
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    error?: boolean;
}

export function Select({ error, className = '', children, ...props }: SelectProps) {
    return (
        <select
            className={`
                w-full px-4 py-2.5 
                bg-[#16124A]/50 
                border ${error ? 'border-red-500/50' : 'border-[#2F6BFF]/20'}
                rounded-lg 
                text-white text-sm
                focus:outline-none focus:ring-2 
                ${error ? 'focus:ring-red-500/50 focus:border-red-500' : 'focus:ring-[#2F6BFF]/50 focus:border-[#2F6BFF]'}
                hover:border-[#2F6BFF]/40
                transition-all duration-200
                backdrop-blur-sm
                cursor-pointer
                ${className}
            `}
            {...props}
        >
            {children}
        </select>
    );
}

// Toggle Switch - Modern toggle
interface ToggleProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label?: string;
    description?: string;
    disabled?: boolean;
}

export function Toggle({ checked, onChange, label, description, disabled }: ToggleProps) {
    return (
        <div className="flex items-center justify-between gap-4 p-4 bg-[#0B0633] border border-[#2F6BFF]/20 rounded-lg hover:border-[#2F6BFF]/40 transition-colors">
            <div className="flex-1">
                {label && (
                    <div className="text-sm font-medium text-white mb-0.5">
                        {label}
                    </div>
                )}
                {description && (
                    <div className="text-xs text-gray-400">
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
                    border-2 border-transparent transition-colors duration-200 ease-in-out 
                    focus:outline-none focus:ring-2 focus:ring-[#2F6BFF] focus:ring-offset-2 focus:ring-offset-[#0B0633]
                    ${checked ? 'bg-[#2F6BFF]' : 'bg-gray-600'}
                    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
            >
                <span
                    className={`
                        pointer-events-none inline-block h-5 w-5 transform rounded-full 
                        bg-white shadow ring-0 transition duration-200 ease-in-out
                        ${checked ? 'translate-x-5' : 'translate-x-0'}
                    `}
                />
            </button>
        </div>
    );
}

// Form Grid - Responsive grid for form fields
interface FormGridProps {
    children: ReactNode;
    columns?: 1 | 2 | 3;
    className?: string;
}

export function FormGrid({ children, columns = 2, className = '' }: FormGridProps) {
    const gridClasses = {
        1: 'grid-cols-1',
        2: 'grid-cols-1 md:grid-cols-2',
        3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
    };

    return (
        <div className={`grid ${gridClasses[columns]} gap-5 ${className}`}>
            {children}
        </div>
    );
}

// Form Actions - Button group for form actions
interface FormActionsProps {
    children: ReactNode;
    align?: 'left' | 'right' | 'center' | 'between';
    className?: string;
}

export function FormActions({ children, align = 'right', className = '' }: FormActionsProps) {
    const alignClasses = {
        left: 'justify-start',
        right: 'justify-end',
        center: 'justify-center',
        between: 'justify-between'
    };

    return (
        <div className={`flex items-center gap-3 pt-6 border-t border-[#2F6BFF]/20 ${alignClasses[align]} ${className}`}>
            {children}
        </div>
    );
}

// Success Message
interface SuccessMessageProps {
    message: string;
    onDismiss?: () => void;
}

export function SuccessMessage({ message, onDismiss }: SuccessMessageProps) {
    return (
        <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg animate-slideDown">
            <div className="flex items-start gap-3">
                <div className="shrink-0 w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Check className="w-3 h-3 text-green-400" />
                </div>
                <div className="flex-1">
                    <p className="text-sm text-green-200">{message}</p>
                </div>
                {onDismiss && (
                    <button
                        onClick={onDismiss}
                        className="shrink-0 text-green-400 hover:text-green-300 transition-colors"
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

// Error Message
interface ErrorMessageProps {
    message: string;
    onDismiss?: () => void;
}

export function ErrorMessage({ message, onDismiss }: ErrorMessageProps) {
    return (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg animate-slideDown">
            <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                <div className="flex-1">
                    <p className="text-sm text-red-200">{message}</p>
                </div>
                {onDismiss && (
                    <button
                        onClick={onDismiss}
                        className="shrink-0 text-red-400 hover:text-red-300 transition-colors"
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
        <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-400 shrink-0" />
                <div className="flex-1">
                    <p className="text-sm text-blue-200">{message}</p>
                </div>
                {onDismiss && (
                    <button
                        onClick={onDismiss}
                        className="shrink-0 text-blue-400 hover:text-blue-300 transition-colors"
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


