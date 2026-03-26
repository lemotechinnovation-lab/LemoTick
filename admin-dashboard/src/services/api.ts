import { API_BASE_URL, API_TIMEOUT, STORAGE_KEYS } from '@config/constants'
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { ApiError } from '../types'

/**
 * Axios instance with interceptors for authentication and error handling
 */
class ApiService {
    private axiosInstance: AxiosInstance

    constructor() {
        this.axiosInstance = axios.create({
            baseURL: API_BASE_URL,
            timeout: API_TIMEOUT,
            headers: {
                'Content-Type': 'application/json',
            },
        })

        this.setupInterceptors()
    }

    private setupInterceptors() {
        // Request interceptor - Add auth token
        this.axiosInstance.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`
                }
                return config
            },
            (error) => Promise.reject(error)
        )

        // Response interceptor - Handle errors
        this.axiosInstance.interceptors.response.use(
            (response) => response,
            async (error: AxiosError<ApiError>) => {
                if (error.response?.status === 401) {
                    // Unauthorized - handle token expiration
                    this.handleUnauthorized()
                }
                return Promise.reject(this.normalizeError(error))
            }
        )
    }

    private normalizeError(error: AxiosError<ApiError>): ApiError {
        if (error.response) {
            return {
                message: error.response.data?.message || 'An error occurred',
                errors: error.response.data?.errors,
                status: error.response.status,
            }
        }
        if (error.request) {
            return {
                message: 'No response from server. Please check your connection.',
                status: 0,
            }
        }
        return {
            message: error.message || 'An unexpected error occurred',
        }
    }

    private handleUnauthorized() {
        // Import authService to handle token expiration properly
        import('./authService').then(({ authService }) => {
            authService.handleTokenExpiration()
        })
    }

    // HTTP Methods
    async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response: AxiosResponse<T> = await this.axiosInstance.get(url, config)
        return response.data
    }

    async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
        const response: AxiosResponse<T> = await this.axiosInstance.post(url, data, config)
        return response.data
    }

    async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
        const response: AxiosResponse<T> = await this.axiosInstance.put(url, data, config)
        return response.data
    }

    async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
        const response: AxiosResponse<T> = await this.axiosInstance.patch(url, data, config)
        return response.data
    }

    async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response: AxiosResponse<T> = await this.axiosInstance.delete(url, config)
        return response.data
    }

    // File upload
    async uploadFile<T>(url: string, file: File, onProgress?: (progress: number) => void): Promise<T> {
        const formData = new FormData()
        formData.append('file', file)

        const response: AxiosResponse<T> = await this.axiosInstance.post(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
                if (onProgress && progressEvent.total) {
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
                    onProgress(progress)
                }
            },
        })

        return response.data
    }

    // Download file
    async downloadFile(url: string, filename: string): Promise<void> {
        const response = await this.axiosInstance.get(url, {
            responseType: 'blob',
        })

        const blob = new Blob([response.data])
        const link = document.createElement('a')
        link.href = window.URL.createObjectURL(blob)
        link.download = filename
        link.click()
        window.URL.revokeObjectURL(link.href)
    }
}

export const api = new ApiService()

