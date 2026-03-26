import { useEffect } from 'react';
import {
  Route,
  Routes,
  useLocation
} from 'react-router-dom';

import './charts/ChartjsConfig';
import './css/style.css';

// Route Guards

// Layout
import DashboardLayout from './layouts/DashboardLayout';

// Public pages
import Login from './features/auth/pages/Login';
import Register from './features/auth/pages/Register';
import Landing from './pages/Landing';

// Dashboard
import Dashboard from './features/dashboard/pages/Dashboard';

// Trading
import PerformanceMetricsPage from './features/performance/pages/PerformanceMetricsPage';
import PortfolioPage from './features/portfolio/pages/PortfolioPage';
import TradePage from './features/trade/pages/TradePage';

// Bots
import BotConfigurationFormPage from './features/bot/pages/BotConfigurationFormPage';
import BotManagementPage from './features/bot/pages/BotManagementPage';
import MyRobotsPage from './features/robots/pages/MyRobotsPage';

// Finance
import AccountsPage from './features/accounts/pages/AccountsPage';
import BankAccountsPage from './features/banking/pages/BankAccountsPage';
import StatementsPage from './features/statements/pages/StatementsPage';
import TransactionsPage from './features/transactions/pages/TransactionsPage';

// Account
import KYCDocumentsPage from './features/kyc/pages/KYCDocumentsPage';
import PreferencesPage from './features/preferences/pages/PreferencesPage';
import ReferralsPage from './features/referrals/pages/ReferralsPage';
import SettingsPage from './features/settings/pages/SettingsPage';

// Other
import { ParticleBackground } from './components/common/ParticleBackground';
import ProtectedRoute from './components/common/ProtectedRoute';
import PublicRoute from './components/routes/PublicRoute';
import { Toaster } from './components/ui/toaster';
import { useAuthStore } from './features/auth/stores/authStore';
import MailPage from './features/mail/pages/MailPage';
import NotificationsFullPage from './features/notifications/pages/NotificationsFullPage';
import PricingPage from './features/pricing/pages/PricingPage';
import SupportPage from './features/support/pages/SupportPage';

function App() {
  const location = useLocation();
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    const html = document.querySelector('html');
    if (html) {
      html.style.scrollBehavior = 'auto';
    }
    window.scroll({ top: 0 });
    if (html) {
      html.style.scrollBehavior = '';
    }
  }, [location.pathname]);

  // Initialize auth system on app startup
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <>
      <ParticleBackground />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Landing />} /> {/* Landing is always accessible */}
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

        {/* Protected routes - Require authentication */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          </ProtectedRoute>
        } />

        {/* Trading */}
        <Route path="/trade" element={
          <ProtectedRoute>
            <DashboardLayout><TradePage /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/portfolio" element={
          <ProtectedRoute>
            <DashboardLayout><PortfolioPage /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/performance" element={
          <ProtectedRoute>
            <DashboardLayout><PerformanceMetricsPage /></DashboardLayout>
          </ProtectedRoute>
        } />

        {/* Bots */}
        <Route path="/my-robots" element={
          <ProtectedRoute>
            <DashboardLayout><MyRobotsPage /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/management" element={
          <ProtectedRoute>
            <DashboardLayout><BotManagementPage /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/configuration" element={
          <ProtectedRoute>
            <DashboardLayout><BotConfigurationFormPage /></DashboardLayout>
          </ProtectedRoute>
        } />

        {/* Finance */}
        <Route path="/accounts" element={
          <ProtectedRoute>
            <DashboardLayout><AccountsPage /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/bank-accounts" element={
          <ProtectedRoute>
            <DashboardLayout><BankAccountsPage /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/transactions" element={
          <ProtectedRoute>
            <DashboardLayout><TransactionsPage /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/statements" element={
          <ProtectedRoute>
            <DashboardLayout><StatementsPage /></DashboardLayout>
          </ProtectedRoute>
        } />

        {/* Account */}
        <Route path="/settings" element={
          <ProtectedRoute>
            <DashboardLayout><SettingsPage /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/preferences" element={
          <ProtectedRoute>
            <DashboardLayout><PreferencesPage /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/kyc" element={
          <ProtectedRoute>
            <DashboardLayout><KYCDocumentsPage /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/referrals" element={
          <ProtectedRoute>
            <DashboardLayout><ReferralsPage /></DashboardLayout>
          </ProtectedRoute>
        } />

        {/* Other */}
        <Route path="/notifications" element={
          <ProtectedRoute>
            <DashboardLayout><NotificationsFullPage /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/mail" element={
          <ProtectedRoute>
            <DashboardLayout><MailPage /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/pricing" element={
          <ProtectedRoute>
            <DashboardLayout><PricingPage /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/support" element={
          <ProtectedRoute>
            <DashboardLayout><SupportPage /></DashboardLayout>
          </ProtectedRoute>
        } />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
