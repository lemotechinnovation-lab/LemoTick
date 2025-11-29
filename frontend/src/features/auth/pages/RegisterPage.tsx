import { AlertCircle, Calendar, CreditCard, Globe, Lock, Mail, Phone, User } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuthStore } from '../stores/authStore'

export default function RegisterPage() {
    const navigate = useNavigate()
    const { register, isLoading, error, clearError } = useAuthStore()

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phoneNumber: '',
        dateOfBirth: '',
        nationality: 'South Africa',
        idNumber: '',
        referralCode: '',
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        clearError()

        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match')
            return
        }

        try {
            // Backend expects confirmPassword field
            await register(formData)
            toast.success('Registration successful!')
            navigate('/dashboard')
        } catch (error: any) {
            toast.error(error.message || 'Registration failed')
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }))
    }

    return (
        <div>
            <div className="mb-3">
                <h2 className="text-xl font-bold text-gray-900">Create Account</h2>
                <p className="mt-0.5 text-xs text-gray-600">
                    Start your investment journey today
                </p>
            </div>

            {error && (
                <div className="mb-2 flex items-center space-x-2 rounded-lg bg-red-50 p-2 text-xs text-red-800">
                    <AlertCircle className="h-4 w-4" />
                    <span>{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-2.5">
                <div className="grid grid-cols-2 gap-2.5">
                    <div>
                        <label htmlFor="firstName" className="label text-xs mb-0.5">
                            First Name
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                id="firstName"
                                name="firstName"
                                type="text"
                                required
                                value={formData.firstName}
                                onChange={handleChange}
                                className="input pl-9 py-1.5 text-sm"
                                placeholder="John"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="lastName" className="label text-xs mb-0.5">
                            Last Name
                        </label>
                        <input
                            id="lastName"
                            name="lastName"
                            type="text"
                            required
                            value={formData.lastName}
                            onChange={handleChange}
                            className="input py-1.5 text-sm"
                            placeholder="Doe"
                        />
                    </div>
                </div>

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
                            required
                            value={formData.email}
                            onChange={handleChange}
                            className="input pl-9 py-2 text-sm"
                            placeholder="you@example.com"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
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
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="input pl-9 py-1.5 text-sm"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="label text-xs mb-0.5">
                            Confirm Password
                        </label>
                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            required
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="input py-1.5 text-sm"
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                    <div>
                        <label htmlFor="phoneNumber" className="label text-xs mb-0.5">
                            Phone Number
                        </label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                id="phoneNumber"
                                name="phoneNumber"
                                type="tel"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                className="input pl-9 py-1.5 text-sm"
                                placeholder="+27 123 456 789"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="dateOfBirth" className="label text-xs mb-0.5">
                            Date of Birth
                        </label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                id="dateOfBirth"
                                name="dateOfBirth"
                                type="date"
                                required
                                value={formData.dateOfBirth}
                                onChange={handleChange}
                                className="input pl-9 py-1.5 text-sm"
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                    <div>
                        <label htmlFor="nationality" className="label text-xs mb-0.5">
                            Nationality
                        </label>
                        <div className="relative">
                            <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <select
                                id="nationality"
                                name="nationality"
                                required
                                value={formData.nationality}
                                onChange={handleChange}
                                className="input pl-9 py-1.5 text-sm"
                            >
                                <option value="South Africa">South Africa</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="idNumber" className="label text-xs mb-0.5">
                            ID Number
                        </label>
                        <div className="relative">
                            <CreditCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                id="idNumber"
                                name="idNumber"
                                type="text"
                                required
                                value={formData.idNumber}
                                onChange={handleChange}
                                className="input pl-9 py-1.5 text-sm"
                                placeholder="1234567890123"
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <label htmlFor="referralCode" className="label text-xs mb-0.5">
                        Referral Code (Optional)
                    </label>
                    <input
                        id="referralCode"
                        name="referralCode"
                        type="text"
                        value={formData.referralCode}
                        onChange={handleChange}
                        className="input py-2 text-sm"
                        placeholder="Enter referral code"
                    />
                </div>

                <div className="flex items-start">
                    <input
                        id="terms"
                        type="checkbox"
                        required
                        className="mt-0.5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <label htmlFor="terms" className="ml-2 text-xs leading-tight text-gray-600">
                        I agree to the{' '}
                        <a href="/terms" className="text-primary-600 hover:text-primary-700">
                            Terms of Service
                        </a>{' '}
                        and{' '}
                        <a href="/privacy" className="text-primary-600 hover:text-primary-700">
                            Privacy Policy
                        </a>
                    </label>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary w-full py-2"
                >
                    {isLoading ? 'Creating account...' : 'Create Account'}
                </button>
            </form>

            <div className="mt-3 text-center">
                <p className="text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link
                        to="/login"
                        className="font-medium text-primary-600 hover:text-primary-700"
                    >
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    )
}

