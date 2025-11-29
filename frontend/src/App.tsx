import ProtectedRoute from '@components/common/ProtectedRoute'
import AuthLayout from '@layouts/AuthLayout'
import DashboardLayout from '@layouts/DashboardLayout'
import { Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'

// Auth pages
import LoginPage from '@features/auth/pages/LoginPage'
import RegisterPage from '@features/auth/pages/RegisterPage'

// Dashboard pages
import BankAccountsPage from '@features/banking/pages/BankAccountsPage'
import BotConfigurationFormPage from '@features/bot/pages/BotConfigurationFormPage'
import BotManagementPage from '@features/bot/pages/BotManagementPage'
import DashboardPage from '@features/dashboard/pages/DashboardPage'
import KYCDocumentsPage from '@features/kyc/pages/KYCDocumentsPage'
import NotificationsPage from '@features/notifications/pages/NotificationsPage'
import PortfolioPage from '@features/portfolio/pages/PortfolioPage'
import PreferencesPage from '@features/preferences/pages/PreferencesPage'
import ReferralsPage from '@features/referrals/pages/ReferralsPage'
import StatementsPage from '@features/statements/pages/StatementsPage'
import TransactionsPage from '@features/transactions/pages/TransactionsPage'

function App() {
    return (
        <>
            <Routes>
                {/* Public routes */}
                <Route element={<AuthLayout />}>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                </Route>

                {/* Protected routes */}
                <Route element={<ProtectedRoute />}>
                    <Route element={<DashboardLayout />}>
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/portfolio" element={<PortfolioPage />} />
                        <Route path="/transactions" element={<TransactionsPage />} />
                        <Route path="/bank-accounts" element={<BankAccountsPage />} />
                        <Route path="/statements" element={<StatementsPage />} />
                        <Route path="/referrals" element={<ReferralsPage />} />
                        <Route path="/notifications" element={<NotificationsPage />} />
                        <Route path="/preferences" element={<PreferencesPage />} />
                        <Route path="/kyc" element={<KYCDocumentsPage />} />
                        <Route path="/bot-management" element={<BotManagementPage />} />
                        <Route path="/bot-configuration" element={<BotConfigurationFormPage />} />
                    </Route>
                </Route>

                {/* Redirects */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<NotFoundPage />} />
            </Routes>

            <Toaster position="top-right" richColors />
        </>
    )
}

function NotFoundPage() {
    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
                <h1 className="text-6xl font-bold text-gray-900">404</h1>
                <p className="mt-2 text-xl text-gray-600">Page not found</p>
                <a href="/dashboard" className="mt-4 inline-block btn-primary">
                    Go to Dashboard
                </a>
            </div>
        </div>
    )
}

export default App

