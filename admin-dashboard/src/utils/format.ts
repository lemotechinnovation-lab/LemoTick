import { format, formatDistanceToNow, parseISO } from 'date-fns'

/**
 * Format currency with symbol
 */
export function formatCurrency(amount: number | null | undefined, currency = 'ZAR'): string {
    const value = amount ?? 0
    return new Intl.NumberFormat('en-ZA', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(isNaN(value) ? 0 : value)
}

/**
 * Format number with commas
 */
export function formatNumber(value: number | null | undefined, decimals = 2): string {
    const num = value ?? 0
    return new Intl.NumberFormat('en-ZA', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(isNaN(num) ? 0 : num)
}

/**
 * Format percentage
 */
export function formatPercentage(value: number | null | undefined, decimals = 2): string {
    const num = value ?? 0
    const safeValue = isNaN(num) ? 0 : num
    return `${safeValue >= 0 ? '+' : ''}${formatNumber(safeValue, decimals)}%`
}

/**
 * Format date
 */
export function formatDate(date: string | Date, dateFormat = 'yyyy-MM-dd'): string {
    if (!date) return ''
    const parsedDate = typeof date === 'string' ? parseISO(date) : date
    return format(parsedDate, dateFormat)
}

/**
 * Format datetime
 */
export function formatDateTime(date: string | Date): string {
    if (!date) return ''
    const parsedDate = typeof date === 'string' ? parseISO(date) : date
    return format(parsedDate, 'yyyy-MM-dd HH:mm:ss')
}

/**
 * Format time ago (e.g., "2 hours ago")
 */
export function formatTimeAgo(date: string | Date): string {
    if (!date) return ''
    const parsedDate = typeof date === 'string' ? parseISO(date) : date
    return formatDistanceToNow(parsedDate, { addSuffix: true })
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

/**
 * Truncate text
 */
export function truncate(text: string, length = 50): string {
    if (text.length <= length) return text
    return `${text.substring(0, length)}...`
}

/**
 * Capitalize first letter
 */
export function capitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

/**
 * Format phone number
 */
export function formatPhoneNumber(phone: string): string {
    const cleaned = phone.replace(/\D/g, '')
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/)
    if (match) {
        return `(${match[1]}) ${match[2]}-${match[3]}`
    }
    return phone
}

