import {
    FormContainer,
    FormField,
    FormGrid,
    FormSection,
    Input,
    Select,
    Toggle,
} from '@/components/ui/FormComponents';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageContainer } from '@/components/ui/PageLayoutEnhanced';
import { validateWithToast, validationToast } from '@/lib/validation-toast';
import { Bell, Lock, Save, Settings as SettingsIcon, User } from 'lucide-react';
import { useState } from 'react';

type TabType = 'profile' | 'security' | 'notifications' | 'preferences';

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

    // Notification settings
    const [notificationData, setNotificationData] = useState({
        emailNotifications: true,
        tradeAlerts: true,
        priceAlerts: false,
        newsUpdates: true,
        weeklyReports: true,
        marketingEmails: false,
    });

    // Preference settings
    const [preferenceData, setPreferenceData] = useState({
        theme: 'dark',
        currency: 'USD',
        dateFormat: 'MM/DD/YYYY',
        numberFormat: 'en-US',
        chartType: 'candlestick',
    });

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
        { id: 'notifications' as TabType, label: 'Notifications', icon: Bell },
        { id: 'preferences' as TabType, label: 'Preferences', icon: SettingsIcon },
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
                        <FormContainer maxWidth="md">
                            <FormSection
                                title="Profile Information"
                                description="Update your personal details and contact information"
                            >
                                <FormGrid columns={2}>
                                    <FormField label="First Name" htmlFor="firstName" required>
                                        <Input
                                            id="firstName"
                                            type="text"
                                            value={profileData.firstName}
                                            onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                                        />
                                    </FormField>
                                    <FormField label="Last Name" htmlFor="lastName" required>
                                        <Input
                                            id="lastName"
                                            type="text"
                                            value={profileData.lastName}
                                            onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                                        />
                                    </FormField>
                                </FormGrid>

                                <FormField label="Email Address" htmlFor="email" required>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={profileData.email}
                                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                    />
                                </FormField>

                                <FormField label="Phone Number" htmlFor="phone">
                                    <Input
                                        id="phone"
                                        type="tel"
                                        value={profileData.phone}
                                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                    />
                                </FormField>

                                <FormGrid columns={2}>
                                    <FormField label="Country" htmlFor="country">
                                        <Select
                                            id="country"
                                            value={profileData.country}
                                            onChange={(e) => setProfileData({ ...profileData, country: e.target.value })}
                                        >
                                            <option value="United States">United States</option>
                                            <option value="United Kingdom">United Kingdom</option>
                                            <option value="Canada">Canada</option>
                                            <option value="Australia">Australia</option>
                                        </Select>
                                    </FormField>
                                    <FormField label="Timezone" htmlFor="timezone">
                                        <Select
                                            id="timezone"
                                            value={profileData.timezone}
                                            onChange={(e) => setProfileData({ ...profileData, timezone: e.target.value })}
                                        >
                                            <option value="America/New_York">Eastern Time (ET)</option>
                                            <option value="America/Chicago">Central Time (CT)</option>
                                            <option value="America/Denver">Mountain Time (MT)</option>
                                            <option value="America/Los_Angeles">Pacific Time (PT)</option>
                                        </Select>
                                    </FormField>
                                </FormGrid>

                                <FormField label="Language" htmlFor="language">
                                    <Select
                                        id="language"
                                        value={profileData.language}
                                        onChange={(e) => setProfileData({ ...profileData, language: e.target.value })}
                                    >
                                        <option value="English">English</option>
                                        <option value="Spanish">Spanish</option>
                                        <option value="French">French</option>
                                        <option value="German">German</option>
                                    </Select>
                                </FormField>
                            </FormSection>
                        </FormContainer>
                    )}

                    {/* Security Tab */}
                    {activeTab === 'security' && (
                        <FormContainer maxWidth="md">
                            <FormSection
                                title="Security Settings"
                                description="Manage your password and authentication settings"
                            >
                                <FormField
                                    label="Current Password"
                                    htmlFor="currentPassword"
                                    helpText="Required to change your password"
                                >
                                    <Input
                                        id="currentPassword"
                                        type="password"
                                        value={securityData.currentPassword}
                                        onChange={(e) => setSecurityData({ ...securityData, currentPassword: e.target.value })}
                                        placeholder="Enter current password"
                                    />
                                </FormField>

                                <FormGrid columns={2}>
                                    <FormField label="New Password" htmlFor="newPassword">
                                        <Input
                                            id="newPassword"
                                            type="password"
                                            value={securityData.newPassword}
                                            onChange={(e) => setSecurityData({ ...securityData, newPassword: e.target.value })}
                                            placeholder="Enter new password"
                                        />
                                    </FormField>
                                    <FormField label="Confirm Password" htmlFor="confirmPassword">
                                        <Input
                                            id="confirmPassword"
                                            type="password"
                                            value={securityData.confirmPassword}
                                            onChange={(e) => setSecurityData({ ...securityData, confirmPassword: e.target.value })}
                                            placeholder="Confirm new password"
                                        />
                                    </FormField>
                                </FormGrid>

                                <Toggle
                                    checked={securityData.twoFactorEnabled}
                                    onChange={(checked) => setSecurityData({ ...securityData, twoFactorEnabled: checked })}
                                    label="Two-Factor Authentication"
                                    description="Add an extra layer of security to your account"
                                />

                                <FormField label="Session Timeout" htmlFor="sessionTimeout">
                                    <Select
                                        id="sessionTimeout"
                                        value={securityData.sessionTimeout}
                                        onChange={(e) => setSecurityData({ ...securityData, sessionTimeout: e.target.value })}
                                    >
                                        <option value="15">15 minutes</option>
                                        <option value="30">30 minutes</option>
                                        <option value="60">1 hour</option>
                                        <option value="120">2 hours</option>
                                    </Select>
                                </FormField>
                            </FormSection>
                        </FormContainer>
                    )}

                    {/* Notifications Tab */}
                    {activeTab === 'notifications' && (
                        <FormContainer maxWidth="md">
                            <FormSection
                                title="Notification Preferences"
                                description="Choose which notifications you want to receive"
                            >
                                <Toggle
                                    checked={notificationData.emailNotifications}
                                    onChange={(checked) => setNotificationData({ ...notificationData, emailNotifications: checked })}
                                    label="Email Notifications"
                                    description="Receive notifications via email"
                                />

                                <Toggle
                                    checked={notificationData.tradeAlerts}
                                    onChange={(checked) => setNotificationData({ ...notificationData, tradeAlerts: checked })}
                                    label="Trade Alerts"
                                    description="Get notified about trade executions"
                                />

                                <Toggle
                                    checked={notificationData.priceAlerts}
                                    onChange={(checked) => setNotificationData({ ...notificationData, priceAlerts: checked })}
                                    label="Price Alerts"
                                    description="Alerts when prices reach your targets"
                                />

                                <Toggle
                                    checked={notificationData.newsUpdates}
                                    onChange={(checked) => setNotificationData({ ...notificationData, newsUpdates: checked })}
                                    label="News Updates"
                                    description="Market news and important updates"
                                />

                                <Toggle
                                    checked={notificationData.weeklyReports}
                                    onChange={(checked) => setNotificationData({ ...notificationData, weeklyReports: checked })}
                                    label="Weekly Reports"
                                    description="Weekly performance summaries"
                                />

                                <Toggle
                                    checked={notificationData.marketingEmails}
                                    onChange={(checked) => setNotificationData({ ...notificationData, marketingEmails: checked })}
                                    label="Marketing Emails"
                                    description="Promotional offers and updates"
                                />
                            </FormSection>
                        </FormContainer>
                    )}

                    {/* Preferences Tab */}
                    {activeTab === 'preferences' && (
                        <FormContainer maxWidth="md">
                            <FormSection
                                title="Application Preferences"
                                description="Customize your application experience"
                            >
                                <FormField label="Theme" htmlFor="theme">
                                    <Select
                                        id="theme"
                                        value={preferenceData.theme}
                                        onChange={(e) => setPreferenceData({ ...preferenceData, theme: e.target.value })}
                                    >
                                        <option value="dark">Dark</option>
                                        <option value="light">Light</option>
                                        <option value="auto">Auto</option>
                                    </Select>
                                </FormField>

                                <FormField label="Default Currency" htmlFor="currency">
                                    <Select
                                        id="currency"
                                        value={preferenceData.currency}
                                        onChange={(e) => setPreferenceData({ ...preferenceData, currency: e.target.value })}
                                    >
                                        <option value="USD">USD - US Dollar</option>
                                        <option value="EUR">EUR - Euro</option>
                                        <option value="GBP">GBP - British Pound</option>
                                        <option value="JPY">JPY - Japanese Yen</option>
                                    </Select>
                                </FormField>

                                <FormGrid columns={2}>
                                    <FormField label="Date Format" htmlFor="dateFormat">
                                        <Select
                                            id="dateFormat"
                                            value={preferenceData.dateFormat}
                                            onChange={(e) => setPreferenceData({ ...preferenceData, dateFormat: e.target.value })}
                                        >
                                            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                        </Select>
                                    </FormField>
                                    <FormField label="Number Format" htmlFor="numberFormat">
                                        <Select
                                            id="numberFormat"
                                            value={preferenceData.numberFormat}
                                            onChange={(e) => setPreferenceData({ ...preferenceData, numberFormat: e.target.value })}
                                        >
                                            <option value="en-US">1,234.56 (US)</option>
                                            <option value="de-DE">1.234,56 (EU)</option>
                                            <option value="fr-FR">1 234,56 (FR)</option>
                                        </Select>
                                    </FormField>
                                </FormGrid>

                                <FormField label="Default Chart Type" htmlFor="chartType">
                                    <Select
                                        id="chartType"
                                        value={preferenceData.chartType}
                                        onChange={(e) => setPreferenceData({ ...preferenceData, chartType: e.target.value })}
                                    >
                                        <option value="candlestick">Candlestick</option>
                                        <option value="line">Line</option>
                                        <option value="bar">Bar</option>
                                        <option value="area">Area</option>
                                    </Select>
                                </FormField>
                            </FormSection>
                        </FormContainer>
                    )}
                </div>
            </div>
        </PageContainer>
    );
}


