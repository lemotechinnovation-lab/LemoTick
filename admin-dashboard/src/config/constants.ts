/// <reference types="vite/client" />

// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:5000'
export const API_TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT) || 30000

// SignalR Configuration
export const SIGNALR_HUB_URL = import.meta.env.VITE_SIGNALR_HUB_URL || 'https://localhost:5000/notificationHub'
export const SOCIAL_SIGNALR_HUB_URL = import.meta.env.VITE_SOCIAL_SIGNALR_HUB_URL || 'https://localhost:5000/socialHub'

// App Configuration
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'LemoTick Investor Portal'
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0'

// Feature Flags
export const ENABLE_2FA = import.meta.env.VITE_ENABLE_2FA === 'true'
export const ENABLE_REAL_TIME_UPDATES = import.meta.env.VITE_ENABLE_REAL_TIME_UPDATES === 'true'
export const ENABLE_ANALYTICS = import.meta.env.VITE_ENABLE_ANALYTICS === 'true'

// Storage Keys
export const STORAGE_KEYS = {
    AUTH_TOKEN: 'lemotick_auth_token',
    REFRESH_TOKEN: 'lemotick_refresh_token',
    USER: 'lemotick_user',
    THEME: 'lemotick_theme',
} as const

// Routes
export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    FORGOT_PASSWORD: '/forgot-password',
    DASHBOARD: '/dashboard',
    PORTFOLIO: '/portfolio',
    TRANSACTIONS: '/transactions',
    TRADES: '/trades',
    BANK_ACCOUNTS: '/bank-accounts',
    PREFERENCES: '/preferences',
    KYC: '/kyc',
    NOTIFICATIONS: '/notifications',
    STATEMENTS: '/statements',
    REFERRALS: '/referrals',
    BOT_MANAGEMENT: '/bot-management',
    BOT_CONFIGURATION: '/bot-configuration',
    HELP: '/help',
} as const

// Pagination
export const DEFAULT_PAGE_SIZE = 20
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

// Date Formats
export const DATE_FORMAT = 'yyyy-MM-dd'
export const DATETIME_FORMAT = 'yyyy-MM-dd HH:mm:ss'
export const TIME_FORMAT = 'HH:mm:ss'

// Currency
export const DEFAULT_CURRENCY = 'ZAR'
export const SUPPORTED_CURRENCIES = ['ZAR', 'USD', 'EUR', 'GBP'] as const

// Query Keys
export const QUERY_KEYS = {
    USER: ['user'],
    DASHBOARD: ['dashboard'],
    PORTFOLIO: ['portfolio'],
    PORTFOLIOS: ['portfolios'],
    TRADES: ['trades'],
    TRANSACTIONS: ['transactions'],
    NOTIFICATIONS: ['notifications'],
    BANK_ACCOUNTS: ['bank-accounts'],
    PREFERENCES: ['preferences'],
    KYC_DOCUMENTS: ['kyc-documents'],
    STATEMENTS: ['statements'],
    REFERRALS: ['referrals'],
    LOOKUPS: ['lookups'],
    BOT_STATUS: ['bot-status'],
    BOT_CONFIG: ['bot-config'],
} as const

// Notification Display Duration
export const TOAST_DURATION = {
    SUCCESS: 3000,
    ERROR: 5000,
    INFO: 4000,
    WARNING: 4000,
} as const

// Brand Colors - Official LemoTick Color Palette
export const BRAND_COLORS = {
    // Primary Brand Colors (match logo)
    brandBlue: '#3B82F6',        // Logo blue
    brandBlueLight: '#60A5FA',   // Gradient blue highlight
    accentOrange: '#F59E0B',     // Logo orange
    accentOrangeDeep: '#F97316', // Deeper orange for hover states

    // Background Colors
    darkBackground: '#0B0830',   // Main background (logo navy)
    darkNavy: '#14104A',         // Sidebar background
    darkCard: '#35335e',         // Cards in dark mode
    lightBackground: '#F6F8FF',  // Dashboard light theme

    // Text Colors
    offWhite: '#E8ECFF',         // Main dark mode text
    lightGray: '#9AA3B2',        // Secondary labels
    darkText: '#111827',         // Text on light backgrounds
    mediumGray: '#6B7280',       // Neutral card titles
    formLabel: '#374151',        // Form labels

    // Status Colors
    successGreen: '#22C55E',     // Profit / success
    errorRed: '#EF4444',         // Loss / errors
    warningOrange: '#F59E0B',    // Warnings

    // Borders
    borderLight: '#E6EAF5',
    inputBorder: '#D7DCEF',

    // Brand Gradients (important for your logo style)
    brandGradientBlue: 'linear-gradient(135deg, #3B82F6, #60A5FA)',
    brandGradientOrange: 'linear-gradient(135deg, #F59E0B, #F97316)',

    // Light background gradient
    lightGradientStart: '#F5F7FF',
    lightGradientEnd: '#E9EDFF',
} as const

