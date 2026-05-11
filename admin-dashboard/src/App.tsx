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
import PublicLayout from './layouts/PublicLayout';

// Public pages
import Login from './features/auth/pages/Login';
import Register from './features/auth/pages/Register';
import About from './pages/About';
import FAQ from './pages/FAQ';
import HowItWorks from './pages/HowItWorks';
import Landing from './pages/Landing';
import Markets from './pages/Markets';
import Partners from './pages/Partners';
import Pricing from './pages/Pricing';
import Rules from './pages/Rules';

// Dashboard
import Dashboard from './features/dashboard/pages/Dashboard';

// Trading
import PortfolioPage from './features/portfolio/pages/PortfolioPage';
import TradePage from './features/trade/pages/TradePage';

// Bots
import BotConfigurationFormPage from './features/bot/pages/BotConfigurationFormPage';
import MyRobotsPage from './features/robots/pages/MyRobotsPage';

// Finance
import AccountsPage from './features/accounts/pages/AccountsPage';
import BankAccountsPage from './features/banking/pages/BankAccountsPage';
import StatementsPage from './features/statements/pages/StatementsPage';
import TransactionsPage from './features/transactions/pages/TransactionsPage';

// Account
import KYCDocumentsPage from './features/kyc/pages/KYCDocumentsPage';
import SettingsPage from './features/settings/pages/SettingsPage';

// Social
import SocialProfilePageEnhanced from './features/social/pages/SocialProfilePageEnhanced';
import TimelinePageEnhanced from './features/social/pages/TimelinePageEnhanced';
import UserProfilePageEnhanced from './features/social/pages/UserProfilePageEnhanced';

// Other
import { ParticleBackground } from './components/common/ParticleBackground';
import ProtectedRoute from './components/common/ProtectedRoute';
import PublicRoute from './components/routes/PublicRoute';
import { Toaster } from './components/ui/toaster';
import ActivityLogPage from './features/activity/pages/ActivityLogPage';
import { useAuthStore } from './features/auth/stores/authStore';
import NotificationsFullPage from './features/notifications/pages/NotificationsFullPage';
import PricingPage from './features/pricing/pages/PricingPage';
import ReportsPage from './features/reports/pages/ReportsPage';
import SupportPage from './features/support/pages/SupportPage';

// Messenger
import { useState } from 'react';
import MessengerButton from './components/messenger/MessengerButton';
import MessengerPanel from './components/messenger/MessengerPanel';

function App() {
  const location = useLocation();
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const { isAuthenticated } = useAuthStore();
  const [isMessengerOpen, setIsMessengerOpen] = useState(false);

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
      <div className="w-full h-full overflow-x-hidden">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<PublicLayout><Landing /></PublicLayout>} /> {/* Landing with shared layout */}
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

          {/* Public pages with shared layout */}
          <Route path="/how-it-works" element={<PublicLayout><HowItWorks /></PublicLayout>} />
          <Route path="/pricing" element={<PublicLayout><Pricing /></PublicLayout>} />
          <Route path="/markets" element={<PublicLayout><Markets /></PublicLayout>} />
          <Route path="/rules" element={<PublicLayout><Rules /></PublicLayout>} />
          <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
          <Route path="/partners" element={<PublicLayout><Partners /></PublicLayout>} />
          <Route path="/faq" element={<PublicLayout><FAQ /></PublicLayout>} />

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

          {/* Bots */}
          <Route path="/my-robots" element={
            <ProtectedRoute>
              <DashboardLayout><MyRobotsPage /></DashboardLayout>
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
          <Route path="/kyc" element={
            <ProtectedRoute>
              <DashboardLayout><KYCDocumentsPage /></DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Social */}
          <Route path="/social" element={
            <ProtectedRoute>
              <DashboardLayout><SocialProfilePageEnhanced /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/social/timeline" element={
            <ProtectedRoute>
              <DashboardLayout><TimelinePageEnhanced /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/social/user/:userId" element={
            <ProtectedRoute>
              <DashboardLayout><UserProfilePageEnhanced /></DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Other */}
          <Route path="/notifications" element={
            <ProtectedRoute>
              <DashboardLayout><NotificationsFullPage /></DashboardLayout>
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
          <Route path="/reports" element={
            <ProtectedRoute>
              <DashboardLayout><ReportsPage /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/activity" element={
            <ProtectedRoute>
              <DashboardLayout><ActivityLogPage /></DashboardLayout>
            </ProtectedRoute>
          } />
        </Routes>
        <Toaster />

        {/* Messenger - Only show on social pages when authenticated */}
        {isAuthenticated && (location.pathname.includes('/social') || location.pathname.includes('/timeline') || location.pathname.includes('/profile')) && (
          <>
            <MessengerButton onClick={() => setIsMessengerOpen(true)} />
            <MessengerPanel isOpen={isMessengerOpen} onClose={() => setIsMessengerOpen(false)} />
          </>
        )}
      </div>
    </>
  );
}

export default App;
