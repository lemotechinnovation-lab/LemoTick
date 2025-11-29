import { AlertCircle, Lock, Mail } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuthStore } from '../stores/authStore'

export default function LoginPage() {
    const navigate = useNavigate()
    const { login, isLoading, error, clearError } = useAuthStore()

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        clearError()

        try {
            await login(formData)
            toast.success('Login successful!')
            navigate('/dashboard')
        } catch (error: any) {
            toast.error(error.message || 'Login failed')
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }))
    }

    return (
        <div>
            <div className="mb-3">
                <h2 className="text-xl font-bold text-gray-900">Welcome Back</h2>
                <p className="mt-0.5 text-xs text-gray-600">
                    Sign in to access your investor portal
                </p>
            </div>

            {error && (
                <div className="mb-2 flex items-center space-x-2 rounded-lg bg-red-50 p-2 text-xs text-red-800">
                    <AlertCircle className="h-4 w-4" />
                    <span>{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-2.5">
                <div>
                    <label htmlFor="email" className="label text-xs mb-0.5">
                        Email Address
                    </label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            className="input pl-9 py-1.5 text-sm"
                            placeholder="you@example.com"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="password" className="label text-xs mb-0.5">
                        Password
                    </label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            className="input pl-9 py-1.5 text-sm"
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="ml-2 text-xs text-gray-600">Remember me</span>
                    </label>

                    <Link
                        to="/forgot-password"
                        className="text-xs font-medium text-primary-600 hover:text-primary-700"
                    >
                        Forgot password?
                    </Link>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary w-full py-2"
                >
                    {isLoading ? 'Signing in...' : 'Sign In'}
                </button>
            </form>

            <div className="mt-3 text-center">
                <p className="text-sm text-gray-600">
                    Don't have an account?{' '}
                    <Link
                        to="/register"
                        className="font-medium text-primary-600 hover:text-primary-700"
                    >
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    )
}

