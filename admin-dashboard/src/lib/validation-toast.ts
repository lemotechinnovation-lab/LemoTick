import { toast, toastWithLoader } from '@/hooks/use-toast';

// ─────────────────────────────────────────────────────────────────────────────
// validateWithToast
// Returns true when valid, false + fires a toast when invalid.
// ─────────────────────────────────────────────────────────────────────────────
export const validateWithToast = {
    required(value: string | null | undefined, fieldName: string): boolean {
        if (value && value.trim().length > 0) return true;
        toast({
            title: 'Required Field',
            description: `${fieldName} is required.`,
            variant: 'destructive',
            duration: 4000,
        });
        return false;
    },

    email(value: string | null | undefined): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (value && emailRegex.test(value.trim())) return true;
        toast({
            title: 'Invalid Email',
            description: 'Please enter a valid email address.',
            variant: 'destructive',
            duration: 4000,
        });
        return false;
    },

    password(value: string | null | undefined): boolean {
        if (value && value.length >= 8) return true;
        toast({
            title: 'Weak Password',
            description: 'Password must be at least 8 characters long.',
            variant: 'destructive',
            duration: 4000,
        });
        return false;
    },

    confirmPassword(password: string, confirmPassword: string): boolean {
        if (password === confirmPassword) return true;
        toast({
            title: 'Passwords Do Not Match',
            description: 'Please make sure both passwords are identical.',
            variant: 'destructive',
            duration: 4000,
        });
        return false;
    },

    amount(value: string | number | null | undefined, min: number, max: number): boolean {
        const num = typeof value === 'string' ? parseFloat(value) : (value ?? NaN);
        if (!isNaN(num) && num >= min && num <= max) return true;
        toast({
            title: 'Invalid Amount',
            description: `Amount must be between ${min} and ${max}.`,
            variant: 'destructive',
            duration: 4000,
        });
        return false;
    },
};

// ─────────────────────────────────────────────────────────────────────────────
// validationToast
// Fire-and-forget toast helpers and loader-based async patterns.
// ─────────────────────────────────────────────────────────────────────────────
export const validationToast = {
    // Generic helpers
    success(message: string) {
        toast({ title: message, variant: 'success', duration: 3000 });
    },

    formError(message: string, field?: string) {
        toast({
            title: field ? `${field} Error` : 'Validation Error',
            description: message,
            variant: 'destructive',
            duration: 4000,
        });
    },

    invalidEmail() {
        toast({
            title: 'Invalid Email',
            description: 'Please enter a valid email address.',
            variant: 'destructive',
            duration: 4000,
        });
    },

    weakPassword() {
        toast({
            title: 'Weak Password',
            description: 'Password must be at least 8 characters and include a mix of letters and numbers.',
            variant: 'warning',
            duration: 5000,
        });
    },

    networkError() {
        toast({
            title: 'Network Error',
            description: 'Unable to connect. Please check your internet connection.',
            variant: 'destructive',
            duration: 5000,
        });
    },

    serverError(detail?: string) {
        toast({
            title: 'Server Error',
            description: detail ?? 'Something went wrong. Please try again later.',
            variant: 'destructive',
            duration: 5000,
        });
    },

    unauthorized() {
        toast({
            title: 'Unauthorised',
            description: 'You do not have permission to perform this action.',
            variant: 'destructive',
            duration: 4000,
        });
    },

    sessionExpired() {
        toast({
            title: 'Session Expired',
            description: 'Your session has expired. Please sign in again.',
            variant: 'warning',
            duration: 5000,
        });
    },

    // Async loader pattern — returns { success(msg), error(msg), dismiss() }
    apiValidation(action: string) {
        return toastWithLoader(`Processing ${action}…`, {
            loadingMessage: 'Please wait…',
            successMessage: 'Success!',
            errorMessage: 'Operation failed',
            duration: 3000,
            delay: 1500,
        });
    },

    customValidation(
        message: string,
        options: {
            loadingMessage?: string;
            successMessage?: string;
            errorMessage?: string;
            duration?: number;
            delay?: number;
        } = {}
    ) {
        return toastWithLoader(message, options);
    },

    // Trading-specific toasts
    trading: {
        insufficientBalance() {
            toast({
                title: 'Insufficient Balance',
                description: 'Your account balance is too low to place this trade.',
                variant: 'destructive',
                duration: 4000,
            });
        },
        invalidAmount(min: number, max: number) {
            toast({
                title: 'Invalid Trade Amount',
                description: `Trade amount must be between ${min} and ${max}.`,
                variant: 'warning',
                duration: 4000,
            });
        },
        marketClosed() {
            toast({
                title: 'Market Closed',
                description: 'Trading is currently unavailable. The market is closed.',
                variant: 'warning',
                duration: 4000,
            });
        },
        tradeSuccess(type: string, amount: number) {
            toast({
                title: 'Trade Placed',
                description: `${type.toUpperCase()} order for ${amount} placed successfully.`,
                variant: 'success',
                duration: 4000,
            });
        },
    },

    // File upload toasts
    fileUpload: {
        invalidType(allowedTypes: string[]) {
            toast({
                title: 'Invalid File Type',
                description: `Please upload one of the following types: ${allowedTypes.join(', ')}.`,
                variant: 'destructive',
                duration: 4000,
            });
        },
        tooLarge(maxSize: string) {
            toast({
                title: 'File Too Large',
                description: `File exceeds the maximum allowed size of ${maxSize}.`,
                variant: 'destructive',
                duration: 4000,
            });
        },
        uploadSuccess(filename: string) {
            toast({
                title: 'Upload Successful',
                description: `${filename} has been uploaded successfully.`,
                variant: 'success',
                duration: 3000,
            });
        },
    },
};
