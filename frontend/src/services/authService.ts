import { STORAGE_KEYS } from '@config/constants'
import { AuthResponse, LoginCredentials, RegisterData, User } from '@types/index'
import { api } from './api'

class AuthService {
    /**
     * Login user
     */
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        const response = await api.post<any>('/api/Auth/login', credentials)

        // Backend returns 'investor' but frontend expects 'user'
        const mappedResponse: AuthResponse = {
            token: response.token,
            refreshToken: response.refreshToken,
            user: response.investor || response.user
        }

        if (mappedResponse.token) {
            this.setAuthData(mappedResponse)
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
            user: response.investor || response.user
        }

        if (mappedResponse.token) {
            this.setAuthData(mappedResponse)
        }

        return mappedResponse
    }

    /**
     * Logout user
     */
    logout(): void {
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
        localStorage.removeItem(STORAGE_KEYS.USER)
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
        return !!token
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

    private setAuthData(response: AuthResponse): void {
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.token)

        if (response.refreshToken) {
            localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken)
        }

        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user))
    }
}

export const authService = new AuthService()

