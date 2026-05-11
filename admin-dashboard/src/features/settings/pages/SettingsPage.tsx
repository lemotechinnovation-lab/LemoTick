import ModernAreaChart from '@/components/charts/ModernAreaChart';
import {
    CompactField,
    CompactFormSection,
    Divider,
    FormContainer,
    FormField,
    FormGrid,
    FormSection,
    Input,
    Select,
    Toggle
} from '@/components/ui/FormComponentsEnhanced';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageContainer } from '@/components/ui/PageLayoutEnhanced';
import { validateWithToast, validationToast } from '@/lib/validation-toast';
import { Bell, CheckCircle, Clock, Copy, DollarSign, Eye, Lock, Mail, Phone, Save, Settings as SettingsIcon, Share2, Shield, TrendingUp, User, Users, XCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

type TabType = 'profile' | 'security' | 'display' | 'trading' | 'notifications' | 'referrals';

export interface Referral {
    id: string;
    name: string;
    email: string;
    status: 'active' | 'pending' | 'inactive';
    signupDate: string;
    totalTrades: number;
    commission: number;
    level: number;
}

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<TabType>('profile');
    const [isSaving, setIsSaving] = useState(false);

    // Profile settings
    const [profileData, setProfileData] = useState({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1 (555) 123-4567',
        country: 'United States',
        timezone: 'America/New_York',
        language: 'English',
    });

    // Security settings
    const [securityData, setSecurityData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        twoFactorEnabled: true,
        sessionTimeout: '30',
    });

    // Display settings
    const [displayData, setDisplayData] = useState({
        theme: 'dark',
        currency: 'USD',
        numberFormat: 'en-US',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h',
        chartType: 'candlestick',
    });

    // Trading settings
    const [tradingData, setTradingData] = useState({
        defaultStake: '10',
        defaultDuration: '5',
        riskLevel: 'medium',
        confirmTrades: true,
        autoClose: false,
    });

    // Notification settings
    const [notificationData, setNotificationData] = useState({
        emailNotifications: true,
        pushNotifications: false,
        tradeAlerts: true,
        priceAlerts: false,
        newsUpdates: true,
        weeklyReports: true,
        marketingEmails: false,
        soundEnabled: true,
    });

    // Referrals data
    const referralCode = 'ACME2024XYZ';
    const referralLink = `https://app.example.com/signup?ref=${referralCode}`;

    const [referrals] = useState<Referral[]>([
        {
            id: '1',
            name: 'John Smith',
            email: 'john.smith@example.com',
            status: 'active',
            signupDate: '2024-03-01',
            totalTrades: 45,
            commission: 125.50,
            level: 1,
        },
        {
            id: '2',
            name: 'Sarah Johnson',
            email: 'sarah.j@example.com',
            status: 'active',
            signupDate: '2024-03-05',
            totalTrades: 32,
            commission: 89.25,
            level: 1,
        },
        {
            id: '3',
            name: 'Mike Wilson',
            email: 'mike.w@example.com',
            status: 'pending',
            signupDate: '2024-03-08',
            totalTrades: 0,
            commission: 0,
            level: 1,
        },
        {
            id: '4',
            name: 'Emily Davis',
            email: 'emily.d@example.com',
            status: 'active',
            signupDate: '2024-02-28',
            totalTrades: 67,
            commission: 198.75,
            level: 1,
        },
    ]);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(referralLink);
        toast.success('Referral link copied to clipboard!');
    };

    const handleCopyCode = () => {
        navigator.clipboard.writeText(referralCode);
        toast.success('Referral code copied to clipboard!');
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: 'Join me on this trading platform',
                text: `Use my referral code: ${referralCode}`,
                url: referralLink,
            });
        } else {
            toast.info('Share feature not supported on this browser');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'text-green-400 bg-green-500/20';
            case 'pending': return 'text-yellow-400 bg-yellow-500/20';
            case 'inactive': return 'text-gray-400 bg-gray-500/20';
            default: return 'text-gray-400 bg-gray-500/20';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active': return <CheckCircle className="w-4 h-4 text-green-400" />;
            case 'pending': return <Clock className="w-4 h-4 text-yellow-400" />;
            case 'inactive': return <XCircle className="w-4 h-4 text-gray-400" />;
            default: return null;
        }
    };

    const totalReferrals = referrals.length;
    const activeReferrals = referrals.filter(r => r.status === 'active').length;
    const totalCommission = referrals.reduce((sum, r) => sum + r.commission, 0);
    const pendingReferrals = referrals.filter(r => r.status === 'pending').length;

    // Commission trend data (last 30 days)
    const commissionTrend = [12, 15, 18, 22, 19, 25, 28, 32, 29, 35, 38, 42, 45, 48, 52, 55, 58, 62, 65, 68, 72, 75, 78, 82, 85, 89, 92, 95, 98, totalCommission];

    const handleSave = async () => {
        // Validate profile data
        if (activeTab === 'profile') {
            if (!validateWithToast.required(profileData.firstName, 'First Name')) return;
            if (!validateWithToast.required(profileData.lastName, 'Last Name')) return;
            if (!validateWithToast.email(profileData.email)) return;
        }

        // Validate security data
        if (activeTab === 'security' && securityData.newPassword) {
            if (!validateWithToast.required(securityData.currentPassword, 'Current Password')) return;
            if (!validateWithToast.password(securityData.newPassword)) return;
            if (!validateWithToast.confirmPassword(securityData.newPassword, securityData.confirmPassword)) return;
        }

        // Show loading toast
        const saveToast = validationToast.customValidation(
            'Saving your settings...',
            {
                loadingMessage: 'Updating settings...',
                successMessage: 'Settings saved successfully!',
                errorMessage: 'Failed to save settings',
                duration: 3000,
                delay: 1000,
            }
        );

        setIsSaving(true);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Simulate success/failure
            const success = Math.random() > 0.1; // 90% success rate

            if (success) {
                saveToast.success('Settings updated successfully!');

                // Clear password fields after successful save
                if (activeTab === 'security') {
                    setSecurityData(prev => ({
                        ...prev,
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: '',
                    }));
                }
            } else {
                saveToast.error('Failed to save settings. Please try again.');
            }
        } catch (error) {
            validationToast.serverError('Unable to save settings. Please check your connection.');
        } finally {
            setIsSaving(false);
        }
    };

    const tabs = [
        { id: 'profile' as TabType, label: 'Profile', icon: User },
        { id: 'security' as TabType, label: 'Security', icon: Lock },
        { id: 'display' as TabType, label: 'Display', icon: Eye },
        { id: 'trading' as TabType, label: 'Trading', icon: TrendingUp },
        { id: 'notifications' as TabType, label: 'Notifications', icon: Bell },
        { id: 'referrals' as TabType, label: 'Referrals', icon: Users },
    ];

    return (
        <PageContainer>
            {/* Page Header */}
            <PageHeader
                title="SETTINGS"
                description="Manage your account settings and preferences"
                icon={SettingsIcon}
                actions={
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#2F6BFF] to-[#3B82F6] hover:from-[#3B82F6] hover:to-[#2F6BFF] text-white disabled:opacity-50 transition-all duration-300 shadow-lg hover:shadow-xl text-sm font-semibold"
                    >
                        <Save className="w-4 h-4" />
                        <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                }
            />

            {/* Tabs */}
            <div className="mb-8 w-full max-w-full rounded-2xl border border-[#2F6BFF]/30 bg-[#16124A]/50 shadow-xl overflow-hidden">
                <div className="flex border-b border-[#2F6BFF]/30 bg-gradient-to-r from-[#2F6BFF]/10 to-transparent">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 flex items-center justify-center gap-2 px-4 sm:px-6 py-4 text-sm font-semibold transition-all duration-300 ${activeTab === tab.id
                                    ? 'bg-gradient-to-r from-[#2F6BFF]/20 to-[#2F6BFF]/10 text-white border-b-2 border-[#2F6BFF]'
                                    : 'text-gray-400 hover:text-gray-300 hover:bg-[#16124A]/50'
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Content Area */}
                <div className="p-4 sm:p-6">
                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <FormContainer maxWidth="xl">
                            <FormSection
                                title="Profile Information"
                                description="Update your personal details and contact information"
                                variant="elevated"
                                icon={<User className="w-5 h-5 text-[#2F6BFF]" />}
                            >
                                <FormGrid columns={3} gap="md">
                                    <FormField label="First Name" htmlFor="firstName" required compact>
                                        <Input
                                            id="firstName"
                                            type="text"
                                            value={profileData.firstName}
                                            onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                                            icon={<User className="w-4 h-4" />}
                                        />
                                    </FormField>
                                    <FormField label="Last Name" htmlFor="lastName" required compact>
                                        <Input
                                            id="lastName"
                                            type="text"
                                            value={profileData.lastName}
                                            onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                                        />
                                    </FormField>
                                    <FormField label="Email Address" htmlFor="email" required compact>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={profileData.email}
                                            onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                            icon={<Mail className="w-4 h-4" />}
                                        />
                                    </FormField>
                                </FormGrid>

                                <Divider />

                                <CompactFormSection title="Contact & Location" columns={3}>
                                    <CompactField label="Phone">
                                        <Input
                                            variant="compact"
                                            type="tel"
                                            value={profileData.phone}
                                            onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                            icon={<Phone className="w-4 h-4" />}
                                        />
                                    </CompactField>
                                    <CompactField label="Country">
                                        <Select
                                            variant="compact"
                                            value={profileData.country}
                                            onChange={(e) => setProfileData({ ...profileData, country: e.target.value })}
                                        >
                                            <option value="United States">United States</option>
                                            <option value="United Kingdom">United Kingdom</option>
                                            <option value="Canada">Canada</option>
                                            <option value="Australia">Australia</option>
                                        </Select>
                                    </CompactField>
                                    <CompactField label="Timezone">
                                        <Select
                                            variant="compact"
                                            value={profileData.timezone}
                                            onChange={(e) => setProfileData({ ...profileData, timezone: e.target.value })}
                                        >
                                            <option value="America/New_York">Eastern Time (ET)</option>
                                            <option value="America/Chicago">Central Time (CT)</option>
                                            <option value="America/Denver">Mountain Time (MT)</option>
                                            <option value="America/Los_Angeles">Pacific Time (PT)</option>
                                        </Select>
                                    </CompactField>
                                </CompactFormSection>

                                <Divider />

                                <CompactFormSection title="Preferences" columns={2}>
                                    <CompactField label="Language">
                                        <Select
                                            variant="compact"
                                            value={profileData.language}
                                            onChange={(e) => setProfileData({ ...profileData, language: e.target.value })}
                                        >
                                            <option value="English">English</option>
                                            <option value="Spanish">Spanish</option>
                                            <option value="French">French</option>
                                            <option value="German">German</option>
                                        </Select>
                                    </CompactField>
                                </CompactFormSection>
                            </FormSection>
                        </FormContainer>
                    )}

                    {/* Security Tab */}
                    {activeTab === 'security' && (
                        <FormContainer maxWidth="lg">
                            <FormSection
                                title="Security Settings"
                                description="Manage your password and authentication settings"
                                variant="elevated"
                                icon={<Lock className="w-5 h-5 text-[#2F6BFF]" />}
                            >
                                <FormField
                                    label="Current Password"
                                    htmlFor="currentPassword"
                                    helpText="Required to change your password"
                                    inline
                                >
                                    <Input
                                        id="currentPassword"
                                        type="password"
                                        value={securityData.currentPassword}
                                        onChange={(e) => setSecurityData({ ...securityData, currentPassword: e.target.value })}
                                        placeholder="Enter current password"
                                        icon={<Lock className="w-4 h-4" />}
                                    />
                                </FormField>

                                <Divider />

                                <FormGrid columns={2} gap="md">
                                    <FormField label="New Password" htmlFor="newPassword" compact>
                                        <Input
                                            id="newPassword"
                                            type="password"
                                            value={securityData.newPassword}
                                            onChange={(e) => setSecurityData({ ...securityData, newPassword: e.target.value })}
                                            placeholder="Enter new password"
                                            icon={<Shield className="w-4 h-4" />}
                                        />
                                    </FormField>
                                    <FormField label="Confirm Password" htmlFor="confirmPassword" compact>
                                        <Input
                                            id="confirmPassword"
                                            type="password"
                                            value={securityData.confirmPassword}
                                            onChange={(e) => setSecurityData({ ...securityData, confirmPassword: e.target.value })}
                                            placeholder="Confirm new password"
                                        />
                                    </FormField>
                                </FormGrid>

                                <Divider label="Authentication" />

                                <Toggle
                                    checked={securityData.twoFactorEnabled}
                                    onChange={(checked) => setSecurityData({ ...securityData, twoFactorEnabled: checked })}
                                    label="Two-Factor Authentication"
                                    description="Add an extra layer of security to your account"
                                />

                                <Divider />

                                <CompactFormSection title="Session Management" columns={2}>
                                    <CompactField label="Session Timeout">
                                        <Select
                                            variant="compact"
                                            value={securityData.sessionTimeout}
                                            onChange={(e) => setSecurityData({ ...securityData, sessionTimeout: e.target.value })}
                                        >
                                            <option value="15">15 minutes</option>
                                            <option value="30">30 minutes</option>
                                            <option value="60">1 hour</option>
                                            <option value="120">2 hours</option>
                                        </Select>
                                    </CompactField>
                                </CompactFormSection>
                            </FormSection>
                        </FormContainer>
                    )}

                    {/* Notifications Tab */}
                    {activeTab === 'notifications' && (
                        <FormContainer maxWidth="xl">
                            <FormSection
                                title="Notification Preferences"
                                description="Choose which notifications you want to receive"
                                variant="elevated"
                                icon={<Bell className="w-5 h-5 text-[#2F6BFF]" />}
                            >
                                <CompactFormSection title="Delivery Methods" columns={2}>
                                    <Toggle
                                        variant="compact"
                                        checked={notificationData.emailNotifications}
                                        onChange={(checked) => setNotificationData({ ...notificationData, emailNotifications: checked })}
                                        label="Email Notifications"
                                        description="Receive via email"
                                    />
                                    <Toggle
                                        variant="compact"
                                        checked={notificationData.pushNotifications}
                                        onChange={(checked) => setNotificationData({ ...notificationData, pushNotifications: checked })}
                                        label="Push Notifications"
                                        description="Browser push alerts"
                                    />
                                </CompactFormSection>

                                <Divider label="Alert Types" />

                                <CompactFormSection columns={3}>
                                    <Toggle
                                        variant="compact"
                                        checked={notificationData.tradeAlerts}
                                        onChange={(checked) => setNotificationData({ ...notificationData, tradeAlerts: checked })}
                                        label="Trade Alerts"
                                        description="Trade executions"
                                    />
                                    <Toggle
                                        variant="compact"
                                        checked={notificationData.priceAlerts}
                                        onChange={(checked) => setNotificationData({ ...notificationData, priceAlerts: checked })}
                                        label="Price Alerts"
                                        description="Price targets"
                                    />
                                    <Toggle
                                        variant="compact"
                                        checked={notificationData.newsUpdates}
                                        onChange={(checked) => setNotificationData({ ...notificationData, newsUpdates: checked })}
                                        label="News Updates"
                                        description="Market news"
                                    />
                                </CompactFormSection>

                                <Divider label="Reports & Marketing" />

                                <CompactFormSection columns={3}>
                                    <Toggle
                                        variant="compact"
                                        checked={notificationData.weeklyReports}
                                        onChange={(checked) => setNotificationData({ ...notificationData, weeklyReports: checked })}
                                        label="Weekly Reports"
                                        description="Performance summaries"
                                    />
                                    <Toggle
                                        variant="compact"
                                        checked={notificationData.marketingEmails}
                                        onChange={(checked) => setNotificationData({ ...notificationData, marketingEmails: checked })}
                                        label="Marketing Emails"
                                        description="Promotional offers"
                                    />
                                    <Toggle
                                        variant="compact"
                                        checked={notificationData.soundEnabled}
                                        onChange={(checked) => setNotificationData({ ...notificationData, soundEnabled: checked })}
                                        label="Sound Enabled"
                                        description="Notification sounds"
                                    />
                                </CompactFormSection>
                            </FormSection>
                        </FormContainer>
                    )}

                    {/* Display Tab */}
                    {activeTab === 'display' && (
                        <FormContainer maxWidth="xl">
                            <FormSection
                                title="Display Preferences"
                                description="Customize how information is displayed"
                                variant="elevated"
                                icon={<Eye className="w-5 h-5 text-[#2F6BFF]" />}
                            >
                                <CompactFormSection title="Appearance" columns={2}>
                                    <CompactField label="Theme">
                                        <Select
                                            variant="compact"
                                            value={displayData.theme}
                                            onChange={(e) => setDisplayData({ ...displayData, theme: e.target.value })}
                                        >
                                            <option value="dark">Dark</option>
                                            <option value="light">Light</option>
                                            <option value="auto">Auto</option>
                                        </Select>
                                    </CompactField>
                                    <CompactField label="Default Currency">
                                        <Select
                                            variant="compact"
                                            value={displayData.currency}
                                            onChange={(e) => setDisplayData({ ...displayData, currency: e.target.value })}
                                        >
                                            <option value="USD">USD - US Dollar</option>
                                            <option value="EUR">EUR - Euro</option>
                                            <option value="GBP">GBP - British Pound</option>
                                            <option value="JPY">JPY - Japanese Yen</option>
                                        </Select>
                                    </CompactField>
                                </CompactFormSection>

                                <Divider label="Formats" />

                                <CompactFormSection columns={4}>
                                    <CompactField label="Number Format">
                                        <Select
                                            variant="compact"
                                            value={displayData.numberFormat}
                                            onChange={(e) => setDisplayData({ ...displayData, numberFormat: e.target.value })}
                                        >
                                            <option value="en-US">1,234.56 (US)</option>
                                            <option value="de-DE">1.234,56 (EU)</option>
                                            <option value="fr-FR">1 234,56 (FR)</option>
                                        </Select>
                                    </CompactField>
                                    <CompactField label="Date Format">
                                        <Select
                                            variant="compact"
                                            value={displayData.dateFormat}
                                            onChange={(e) => setDisplayData({ ...displayData, dateFormat: e.target.value })}
                                        >
                                            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                        </Select>
                                    </CompactField>
                                    <CompactField label="Time Format">
                                        <Select
                                            variant="compact"
                                            value={displayData.timeFormat}
                                            onChange={(e) => setDisplayData({ ...displayData, timeFormat: e.target.value })}
                                        >
                                            <option value="12h">12 Hour</option>
                                            <option value="24h">24 Hour</option>
                                        </Select>
                                    </CompactField>
                                    <CompactField label="Chart Type">
                                        <Select
                                            variant="compact"
                                            value={displayData.chartType}
                                            onChange={(e) => setDisplayData({ ...displayData, chartType: e.target.value })}
                                        >
                                            <option value="candlestick">Candlestick</option>
                                            <option value="line">Line</option>
                                            <option value="bar">Bar</option>
                                            <option value="area">Area</option>
                                        </Select>
                                    </CompactField>
                                </CompactFormSection>
                            </FormSection>
                        </FormContainer>
                    )}

                    {/* Trading Tab */}
                    {activeTab === 'trading' && (
                        <FormContainer maxWidth="xl">
                            <FormSection
                                title="Trading Preferences"
                                description="Configure your default trading settings"
                                variant="elevated"
                                icon={<TrendingUp className="w-5 h-5 text-[#2F6BFF]" />}
                            >
                                <CompactFormSection title="Default Values" columns={3}>
                                    <CompactField label="Default Stake">
                                        <Input
                                            variant="compact"
                                            type="number"
                                            value={tradingData.defaultStake}
                                            onChange={(e) => setTradingData({ ...tradingData, defaultStake: e.target.value })}
                                            icon={<DollarSign className="w-4 h-4" />}
                                        />
                                    </CompactField>
                                    <CompactField label="Duration (min)">
                                        <Input
                                            variant="compact"
                                            type="number"
                                            value={tradingData.defaultDuration}
                                            onChange={(e) => setTradingData({ ...tradingData, defaultDuration: e.target.value })}
                                            icon={<Clock className="w-4 h-4" />}
                                        />
                                    </CompactField>
                                    <CompactField label="Risk Level">
                                        <Select
                                            variant="compact"
                                            value={tradingData.riskLevel}
                                            onChange={(e) => setTradingData({ ...tradingData, riskLevel: e.target.value })}
                                        >
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                        </Select>
                                    </CompactField>
                                </CompactFormSection>

                                <Divider label="Trade Execution" />

                                <CompactFormSection columns={2}>
                                    <Toggle
                                        variant="compact"
                                        checked={tradingData.confirmTrades}
                                        onChange={(checked) => setTradingData({ ...tradingData, confirmTrades: checked })}
                                        label="Confirm Trades"
                                        description="Ask before placing"
                                    />
                                    <Toggle
                                        variant="compact"
                                        checked={tradingData.autoClose}
                                        onChange={(checked) => setTradingData({ ...tradingData, autoClose: checked })}
                                        label="Auto Close"
                                        description="Close at expiry"
                                    />
                                </CompactFormSection>
                            </FormSection>
                        </FormContainer>
                    )}

                    {/* Referrals Tab */}
                    {activeTab === 'referrals' && (
                        <div className="space-y-6">
                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {/* Total Referrals */}
                                <div className="rounded-2xl border border-[#2F6BFF]/30 bg-[#16124A]/50 p-4 hover:border-[#2F6BFF] transition-all duration-300">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-[#2F6BFF]/20 to-[#3B82F6]/20 rounded-xl flex items-center justify-center">
                                            <Users className="w-5 h-5 text-[#2F6BFF]" />
                                        </div>
                                        <span className="text-xs text-gray-400 font-semibold">Total</span>
                                    </div>
                                    <div className="text-2xl font-bold text-white mb-1">{totalReferrals}</div>
                                    <div className="text-xs text-gray-400">Referrals</div>
                                </div>

                                {/* Active Referrals */}
                                <div className="rounded-2xl border border-green-500/20 bg-[#16124A]/50 p-4 hover:border-green-500 transition-all duration-300">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-green-500/20 to-green-400/20 rounded-xl flex items-center justify-center">
                                            <CheckCircle className="w-5 h-5 text-green-400" />
                                        </div>
                                        <span className="text-xs text-green-400 font-semibold">Active</span>
                                    </div>
                                    <div className="text-2xl font-bold text-green-400 mb-1">{activeReferrals}</div>
                                    <div className="text-xs text-gray-400">Trading</div>
                                </div>

                                {/* Pending Referrals */}
                                <div className="rounded-2xl border border-yellow-500/20 bg-[#16124A]/50 p-4 hover:border-yellow-500 transition-all duration-300">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-yellow-500/20 to-yellow-400/20 rounded-xl flex items-center justify-center">
                                            <Clock className="w-5 h-5 text-yellow-400" />
                                        </div>
                                        <span className="text-xs text-yellow-400 font-semibold">Pending</span>
                                    </div>
                                    <div className="text-2xl font-bold text-white mb-1">{pendingReferrals}</div>
                                    <div className="text-xs text-gray-400">Not Active</div>
                                </div>

                                {/* Total Commission */}
                                <div className="rounded-2xl border border-[#FFA62B]/20 bg-[#16124A]/50 p-4 hover:border-[#FFA62B] transition-all duration-300">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-[#FFA62B]/20 to-[#F59E0B]/20 rounded-xl flex items-center justify-center">
                                            <DollarSign className="w-5 h-5 text-[#FFA62B]" />
                                        </div>
                                        <span className="text-xs text-[#FFA62B] font-semibold">Earned</span>
                                    </div>
                                    <div className="text-2xl font-bold text-[#FFA62B] mb-1">${totalCommission.toFixed(2)}</div>
                                    <div className="text-xs text-gray-400">Commission</div>
                                </div>
                            </div>

                            {/* Commission Trend Chart */}
                            <div className="rounded-2xl border border-[#2F6BFF]/30 bg-[#16124A]/50 p-6">
                                <h3 className="text-base font-semibold text-white mb-4">Commission Earnings (Last 30 Days)</h3>
                                <ModernAreaChart
                                    data={commissionTrend}
                                    color="#FFA62B"
                                    gradientFrom="#FFA62B"
                                    gradientTo="#F59E0B"
                                    height={180}
                                    showGrid={true}
                                />
                            </div>

                            {/* Referral Link Section */}
                            <div className="rounded-2xl border border-[#2F6BFF]/30 bg-[#16124A]/50 p-6">
                                <h3 className="text-base font-semibold text-white mb-4">Your Referral Link</h3>

                                <div className="space-y-4">
                                    {/* Referral Code */}
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-300 mb-2">Referral Code</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={referralCode}
                                                readOnly
                                                className="flex-1 px-3 py-2 bg-[#16124A] border border-gray-700/50 rounded-xl text-sm text-[#efdede] focus:outline-none"
                                            />
                                            <button
                                                onClick={handleCopyCode}
                                                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#2F6BFF]/20 border border-[#2F6BFF]/30 hover:border-[#2F6BFF] text-[#2F6BFF] text-xs font-semibold transition-all duration-300"
                                            >
                                                <Copy className="w-4 h-4" />
                                                <span>Copy</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Referral Link */}
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-300 mb-2">Referral Link</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={referralLink}
                                                readOnly
                                                className="flex-1 px-3 py-2 bg-[#16124A] border border-gray-700/50 rounded-xl text-sm text-[#efdede] focus:outline-none"
                                            />
                                            <button
                                                onClick={handleCopyLink}
                                                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#2F6BFF]/20 border border-[#2F6BFF]/30 hover:border-[#2F6BFF] text-[#2F6BFF] text-xs font-semibold transition-all duration-300"
                                            >
                                                <Copy className="w-4 h-4" />
                                                <span>Copy</span>
                                            </button>
                                            <button
                                                onClick={handleShare}
                                                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-[#2F6BFF] to-[#3B82F6] hover:from-[#3B82F6] hover:to-[#2F6BFF] text-white text-xs font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                                            >
                                                <Share2 className="w-4 h-4" />
                                                <span>Share</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Referrals Table */}
                            <div className="rounded-2xl border border-[#2F6BFF]/30 bg-[#16124A]/50 p-6">
                                <div className="border-b border-[#2F6BFF]/20 bg-gradient-to-r from-[#2F6BFF]/10 to-transparent pb-4 mb-4">
                                    <h3 className="text-base font-semibold text-white">Referral History</h3>
                                </div>

                                <div className="overflow-x-auto w-full">
                                    <table className="w-full min-w-[600px]">
                                        <thead>
                                            <tr className="bg-gradient-to-r from-[#2F6BFF]/10 to-transparent border-b border-[#2F6BFF]/30">
                                                <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Name</th>
                                                <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Email</th>
                                                <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Status</th>
                                                <th className="px-4 sm:px-6 py-3 text-center text-xs font-semibold text-gray-300 uppercase tracking-wider">Trades</th>
                                                <th className="px-4 sm:px-6 py-3 text-right text-xs font-semibold text-gray-300 uppercase tracking-wider">Commission</th>
                                                <th className="px-4 sm:px-6 py-3 text-right text-xs font-semibold text-gray-300 uppercase tracking-wider">Signup Date</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#2F6BFF]/20">
                                            {referrals.map((referral) => (
                                                <tr key={referral.id} className="hover:bg-[#16124A]/50 transition-colors duration-200">
                                                    <td className="px-4 sm:px-6 py-3 whitespace-nowrap">
                                                        <div className="text-sm font-semibold text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">{referral.name}</div>
                                                    </td>
                                                    <td className="px-4 sm:px-6 py-3 whitespace-nowrap">
                                                        <div className="text-xs text-gray-400">{referral.email}</div>
                                                    </td>
                                                    <td className="px-4 sm:px-6 py-3 whitespace-nowrap">
                                                        <div className="flex items-center gap-2">
                                                            {getStatusIcon(referral.status)}
                                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(referral.status)}`}>
                                                                {referral.status.toUpperCase()}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 sm:px-6 py-3 text-center whitespace-nowrap">
                                                        <div className="text-sm font-semibold text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">{referral.totalTrades}</div>
                                                    </td>
                                                    <td className="px-4 sm:px-6 py-3 text-right whitespace-nowrap">
                                                        <div className="text-sm text-[#FFA62B] font-semibold">${referral.commission.toFixed(2)}</div>
                                                    </td>
                                                    <td className="px-4 sm:px-6 py-3 text-right whitespace-nowrap">
                                                        <div className="text-xs text-gray-400">{referral.signupDate}</div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </PageContainer>
    );
}
