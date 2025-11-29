import { api } from '@/services/api'

export interface RegisterData {
    firstName: string
    lastName: string
    email: string
    password: string
    phoneNumber?: string
    dateOfBirth: string
    nationality: string
    idNumber: string
    referralCode?: string
}

export interface LoginResponse {
    token: string
    refreshToken: string
    investor: {
        id: string
        firstName: string
        lastName: string
        email: string
        role: string
        status: string
    }
}

export interface LoginRequest {
    email: string
    password: string
}

export interface ChangePasswordRequest {
    currentPassword: string
    newPassword: string
    confirmNewPassword: string
}

export const authService = {
    /**
     * Register a new investor
     */
    register: async (data: RegisterData): Promise<LoginResponse> => {
        const response = await api.post<LoginResponse>('/api/Auth/register', data)
        return response
    },

    /**
     * Login with email and password
     */
    login: async (email: string, password: string): Promise<LoginResponse> => {
        const response = await api.post<LoginResponse>('/api/Auth/login', {
            email,
            password,
        })
        return response
    },

    /**
     * Logout (clear local storage)
     */
    logout: () => {
        localStorage.removeItem('lemotick_auth_token')
        localStorage.removeItem('lemotick_refresh_token')
        localStorage.removeItem('lemotick_user')
    },

    /**
     * Refresh authentication token
     */
    refreshToken: async (refreshToken: string): Promise<LoginResponse> => {
        const response = await api.post<LoginResponse>('/api/Auth/refresh-token', {
            refreshToken,
        })
        return response
    },

    /**
     * Change password
     */
    changePassword: async (data: ChangePasswordRequest): Promise<void> => {
        await api.post('/api/Auth/change-password', data)
    },

    /**
     * Request password reset
     */
    forgotPassword: async (email: string): Promise<void> => {
        await api.post('/api/Auth/forgot-password', { email })
    },

    /**
     * Reset password with token
     */
    resetPassword: async (token: string, newPassword: string): Promise<void> => {
        await api.post('/api/Auth/reset-password', { token, newPassword })
    },
}

