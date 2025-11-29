import { authService } from '@services/authService'
import { User, LoginCredentials, RegisterData } from '@/types'
import { create } from 'zustand'

interface AuthState {
    user: User | null
    isAuthenticated: boolean
    isLoading: boolean
    error: string | null

    login: (credentials: LoginCredentials) => Promise<void>
    register: (data: RegisterData) => Promise<void>
    logout: () => void
    setUser: (user: User | null) => void
    clearError: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
    user: authService.getStoredUser(),
    isAuthenticated: authService.isAuthenticated(),
    isLoading: false,
    error: null,

    login: async (credentials) => {
        set({ isLoading: true, error: null })
        try {
            const response = await authService.login(credentials)
            set({
                user: response.user,
                isAuthenticated: true,
                isLoading: false
            })
        } catch (error: any) {
            set({
                error: error.message || 'Login failed',
                isLoading: false
            })
            throw error
        }
    },

    register: async (data) => {
        set({ isLoading: true, error: null })
        try {
            const response = await authService.register(data)
            set({
                user: response.user,
                isAuthenticated: true,
                isLoading: false
            })
        } catch (error: any) {
            set({
                error: error.message || 'Registration failed',
                isLoading: false
            })
            throw error
        }
    },

    logout: () => {
        authService.logout()
        set({
            user: null,
            isAuthenticated: false,
            error: null
        })
    },

    setUser: (user) => set({
        user,
        isAuthenticated: !!user
    }),

    clearError: () => set({ error: null }),
}))

