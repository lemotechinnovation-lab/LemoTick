import { TrendingUp } from 'lucide-react'
import { Outlet } from 'react-router-dom'

export default function AuthLayout() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-500 to-primary-700">
            <div className="flex min-h-screen items-center justify-center p-4">
                <div className="w-full max-w-md">
                    {/* Logo & Title */}
                    <div className="mb-8 text-center">
                        <div className="inline-flex items-center justify-center rounded-full bg-white p-3 shadow-lg">
                            <TrendingUp className="h-8 w-8 text-primary-600" />
                        </div>
                        <h1 className="mt-4 text-4xl font-bold text-white">LemoTick</h1>
                        <p className="mt-2 text-primary-100">Investor Management Portal</p>
                    </div>

                    {/* Auth Form Card */}
                    <div className="rounded-xl bg-white p-8 shadow-2xl">
                        <Outlet />
                    </div>

                    {/* Footer */}
                    <p className="mt-8 text-center text-sm text-primary-100">
                        © 2025 LemoTick. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    )
}

