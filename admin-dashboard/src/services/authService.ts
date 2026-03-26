import { STORAGE_KEYS } from '@config/constants'
import { AuthResponse, LoginCredentials, RegisterData, User } from '../types'
import { api } from './api'

class AuthService {
    private tokenExpirationTimer: NodeJS.Timeout | null = null

    /**
     * Login user
     */
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        const response = await api.post<any>('/api/Auth/login', credentials)

        // Backend returns 'investor' but frontend expects 'user'
        const mappedResponse: AuthResponse = {
            token: response.token,
            refreshToken: response.refreshToken,
            user: response.investor || response.user,
            expiresIn: response.expiresIn || 3600 // Default 1 hour
        }

        if (mappedResponse.token) {
            this.setAuthData(mappedResponse)
            this.startTokenExpirationTimer(mappedResponse.expiresIn)
        }

        return mappedResponse
    }

    /**
     * Register new user
     */
    async register(data: RegisterData): Promise<AuthResponse> {
        const response = await api.post<any>('/api/Auth/register', data)

        // Backend returns 'investor' but frontend expects 'user'
        const mappedResponse: AuthResponse = {
            token: response.token,
            refreshToken: response.refreshToken,
            user: response.investor || response.user,
            expiresIn: response.expiresIn || 3600 // Default 1 hour
        }

        if (mappedResponse.token) {
            this.setAuthData(mappedResponse)
            this.startTokenExpirationTimer(mappedResponse.expiresIn)
        }

        return mappedResponse
    }

    /**
     * Logout user with comprehensive cleanup
     */
    logout(): void {
        // Clear all auth-related data from localStorage
        this.clearAllAuthData()

        // Clear token expiration timer
        this.clearTokenExpirationTimer()

        // Clear any other app-specific data
        this.clearAppData()
    }

    /**
     * Handle token expiration
     */
    handleTokenExpiration(): void {
        // Clear all data
        this.clearAllAuthData()
        this.clearTokenExpirationTimer()
        this.clearAppData()

        // Import and show toast notification
        import('../lib/validation-toast').then(({ validationToast }) => {
            validationToast.sessionExpired()
        })

        // Redirect to login after a short delay
        setTimeout(() => {
            window.location.href = '/login'
        }, 2000)
    }

    /**
     * Start token expiration timer
     */
    private startTokenExpirationTimer(expiresIn: number): void {
        this.clearTokenExpirationTimer()

        // Set timer for 30 seconds before actual expiration to show warning
        const warningTime = Math.max((expiresIn - 30) * 1000, 0)
        const expirationTime = expiresIn * 1000

        // Show warning 30 seconds before expiration
        if (warningTime > 0) {
            setTimeout(() => {
                import('../lib/validation-toast').then(({ validationToast }) => {
                    validationToast.formError('Your session will expire soon. Please save your work.', 'Session Warning')
                })
            }, warningTime)
        }

        // Handle actual expiration
        this.tokenExpirationTimer = setTimeout(() => {
            this.handleTokenExpiration()
        }, expirationTime)
    }

    /**
     * Clear token expiration timer
     */
    private clearTokenExpirationTimer(): void {
        if (this.tokenExpirationTimer) {
            clearTimeout(this.tokenExpirationTimer)
            this.tokenExpirationTimer = null
        }
    }

    /**
     * Clear all authentication data
     */
    private clearAllAuthData(): void {
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
        localStorage.removeItem(STORAGE_KEYS.USER)

        // Clear token expiration timestamp if stored
        localStorage.removeItem('lemotick_token_expires_at')
    }

    /**
     * Clear application-specific data
     */
    private clearAppData(): void {
        // Get all localStorage keys before clearing
        const allKeys = Object.keys(localStorage)

        // Keys to preserve (browser/system related)
        const preserveKeys = [
            'devtools',
            '__reactDevTools',
            'debug',
            'loglevel'
        ]

        // Clear all keys except preserved ones
        allKeys.forEach(key => {
            const shouldPreserve = preserveKeys.some(preserveKey =>
                key.toLowerCase().includes(preserveKey.toLowerCase())
            )

            if (!shouldPreserve) {
                localStorage.removeItem(key)
            }
        })

        // Clear sessionStorage completely
        sessionStorage.clear()

        // Also clear any IndexedDB data if present
        if ('indexedDB' in window) {
            try {
                // Clear common IndexedDB databases
                const dbNames = ['lemotick', 'trading', 'charts', 'cache']
                dbNames.forEach(dbName => {
                    indexedDB.deleteDatabase(dbName)
                })
            } catch (error) {
                console.warn('Could not clear IndexedDB:', error)
            }
        }
    }

    /**
     * Get current user
     */
    async getCurrentUser(): Promise<User> {
        return api.get<User>('/api/Auth/me')
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated(): boolean {
        const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
        const expiresAt = localStorage.getItem('lemotick_token_expires_at')

        if (!token) return false

        // Check if token is expired
        if (expiresAt) {
            const expirationTime = parseInt(expiresAt)
            if (Date.now() > expirationTime) {
                this.handleTokenExpiration()
                return false
            }
        }

        return true
    }

    /**
     * Get stored user
     */
    getStoredUser(): User | null {
        const userStr = localStorage.getItem(STORAGE_KEYS.USER)
        if (!userStr) return null

        try {
            return JSON.parse(userStr) as User
        } catch {
            return null
        }
    }

    /**
     * Forgot password
     */
    async forgotPassword(email: string): Promise<void> {
        await api.post('/api/Auth/forgot-password', { email })
    }

    /**
     * Reset password
     */
    async resetPassword(token: string, newPassword: string): Promise<void> {
        await api.post('/api/Auth/reset-password', { token, newPassword })
    }

    /**
     * Change password
     */
    async changePassword(currentPassword: string, newPassword: string): Promise<void> {
        await api.post('/api/Auth/change-password', { currentPassword, newPassword })
    }

    /**
     * Setup 2FA
     */
    async setup2FA(): Promise<{ qrCodeUrl: string; secret: string }> {
        return api.post('/api/TwoFactorAuth/enable')
    }

    /**
     * Enable 2FA
     */
    async enable2FA(code: string): Promise<void> {
        await api.post('/api/TwoFactorAuth/verify-setup', { code })
    }

    /**
     * Verify 2FA code
     */
    async verify2FA(code: string): Promise<void> {
        await api.post('/api/TwoFactorAuth/verify-login', { code })
    }

    /**
     * Disable 2FA
     */
    async disable2FA(password: string): Promise<void> {
        await api.post('/api/TwoFactorAuth/disable', { password })
    }

    /**
     * Refresh authentication state on app initialization
     */
    initializeAuth(): void {
        if (this.isAuthenticated()) {
            const expiresAt = localStorage.getItem('lemotick_token_expires_at')
            if (expiresAt) {
                const expirationTime = parseInt(expiresAt)
                const remainingTime = Math.max(expirationTime - Date.now(), 0) / 1000
                if (remainingTime > 0) {
                    this.startTokenExpirationTimer(remainingTime)
                }
            }
        }
    }

    private setAuthData(response: AuthResponse): void {
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.token)

        if (response.refreshToken) {
            localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken)
        }

        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user))

        // Store token expiration timestamp
        const expiresAt = Date.now() + (response.expiresIn * 1000)
        localStorage.setItem('lemotick_token_expires_at', expiresAt.toString())
    }
}

export const authService = new AuthService()

