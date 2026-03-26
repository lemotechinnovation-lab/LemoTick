import { validationToast } from '@/lib/validation-toast'
import { LoginCredentials, RegisterData, User } from '@/types'
import { authService } from '@services/authService'
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
    refreshAuthState: () => void
    initializeAuth: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
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
        // Show logout confirmation toast
        const logoutToast = validationToast.customValidation(
            'Signing you out...',
            {
                loadingMessage: 'Logging out...',
                successMessage: 'Successfully logged out',
                errorMessage: 'Logout completed',
                duration: 2000,
                delay: 500,
            }
        )

        // Perform logout - clear all data immediately
        authService.logout()

        // Update state immediately
        set({
            user: null,
            isAuthenticated: false,
            error: null
        })

        // Show success message
        setTimeout(() => {
            logoutToast.success('You have been successfully logged out')
        }, 500)

        // Redirect to login after showing success message
        setTimeout(() => {
            // Force a complete page reload to ensure everything is cleared
            window.location.href = '/login'
        }, 1500)
    },

    setUser: (user) => set({
        user,
        isAuthenticated: !!user
    }),

    clearError: () => set({ error: null }),

    refreshAuthState: () => {
        const isAuthenticated = authService.isAuthenticated()
        const user = isAuthenticated ? authService.getStoredUser() : null

        set({
            user,
            isAuthenticated
        })
    },

    initializeAuth: () => {
        authService.initializeAuth()
        get().refreshAuthState()
    },
}))

