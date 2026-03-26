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
        <div className="px-4 sm:px-6 lg:px-8 py-4 w-full max-w-9xl mx-auto">
            {/* Page header */}
            <div className="relative mb-4 p-3 rounded-lg bg-gradient-to-br from-[#2F6BFF]/10 via-[#16124A] to-[#FFA62B]/10 border border-[#2F6BFF]/20">
                <div className="sm:flex sm:justify-between sm:items-center">
                    <div className="mb-2 sm:mb-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                            <div className="p-1.5 bg-[#2F6BFF]/20 rounded-lg">
                                <SettingsIcon size={16} className="text-[#2F6BFF]" />
                            </div>
                            <h1 className="text-body-dashboard font-bold text-[#efdede] drop-shadow-[0_0_6px_rgba(160,167,181,0.3)]">Settings</h1>
                        </div>
                        <p className="text-micro text-gray-300 ml-8">Manage your account settings and preferences</p>
                    </div>

                    {/* Save Button */}
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#2F6BFF] to-[#2557c9] hover:from-[#2557c9] hover:to-[#2F6BFF] text-white transition-all duration-300 shadow-brand hover-lift text-micro disabled:opacity-50"
                    >
                        <Save size={14} />
                        <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="mb-3 flex gap-1 p-1 bg-[#0B0633] border border-[#2F6BFF]/30 rounded-lg">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-micro font-semibold transition-all duration-300 ${activeTab === tab.id
                                ? 'bg-gradient-to-r from-[#2F6BFF] to-[#2557c9] text-white shadow-brand'
                                : 'text-gray-400 hover:text-[#efdede] hover:bg-[#16124A]'
                                }`}
                        >
                            <Icon size={14} />
                            <span>{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Content Area */}
            <div className="bg-gradient-to-br from-[#0B0633] to-[#16124A] rounded-lg border border-[#2F6BFF]/30 shadow-xl p-3">
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                    <div className="space-y-3 animate-fadeIn">
                        <h2 className="text-small-dashboard text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)] font-semibold mb-2">Profile Information</h2>

                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-[10px] text-gray-400 mb-1">First Name</label>
                                <input
                                    type="text"
                                    value={profileData.firstName}
                                    onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                                    className="w-full px-2 py-1.5 bg-[#16124A] border border-gray-700/50 rounded text-micro text-[#efdede] focus:outline-none focus:border-[#2F6BFF] transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] text-gray-400 mb-1">Last Name</label>
                                <input
                                    type="text"
                                    value={profileData.lastName}
                                    onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                                    className="w-full px-2 py-1.5 bg-[#16124A] border border-gray-700/50 rounded text-micro text-[#efdede] focus:outline-none focus:border-[#2F6BFF] transition-colors"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] text-gray-400 mb-1">Email Address</label>
                            <input
                                type="email"
                                value={profileData.email}
                                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                className="w-full px-2 py-1.5 bg-[#16124A] border border-gray-700/50 rounded text-micro text-[#efdede] focus:outline-none focus:border-[#2F6BFF] transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] text-gray-400 mb-1">Phone Number</label>
                            <input
                                type="tel"
                                value={profileData.phone}
                                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                className="w-full px-2 py-1.5 bg-[#16124A] border border-gray-700/50 rounded text-micro text-[#efdede] focus:outline-none focus:border-[#2F6BFF] transition-colors"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-[10px] text-gray-400 mb-1">Country</label>
                                <select
                                    value={profileData.country}
                                    onChange={(e) => setProfileData({ ...profileData, country: e.target.value })}
                                    className="w-full px-2 py-1.5 bg-[#16124A] border border-gray-700/50 rounded text-micro text-[#efdede] focus:outline-none focus:border-[#2F6BFF] transition-colors"
                                >
                                    <option value="United States">United States</option>
                                    <option value="United Kingdom">United Kingdom</option>
                                    <option value="Canada">Canada</option>
                                    <option value="Australia">Australia</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] text-gray-400 mb-1">Timezone</label>
                                <select
                                    value={profileData.timezone}
                                    onChange={(e) => setProfileData({ ...profileData, timezone: e.target.value })}
                                    className="w-full px-2 py-1.5 bg-[#16124A] border border-gray-700/50 rounded text-micro text-[#efdede] focus:outline-none focus:border-[#2F6BFF] transition-colors"
                                >
                                    <option value="America/New_York">Eastern Time (ET)</option>
                                    <option value="America/Chicago">Central Time (CT)</option>
                                    <option value="America/Denver">Mountain Time (MT)</option>
                                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] text-gray-400 mb-1">Language</label>
                            <select
                                value={profileData.language}
                                onChange={(e) => setProfileData({ ...profileData, language: e.target.value })}
                                className="w-full px-2 py-1.5 bg-[#16124A] border border-gray-700/50 rounded text-micro text-[#efdede] focus:outline-none focus:border-[#2F6BFF] transition-colors"
                            >
                                <option value="English">English</option>
                                <option value="Spanish">Spanish</option>
                                <option value="French">French</option>
                                <option value="German">German</option>
                            </select>
                        </div>
                    </div>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                    <div className="space-y-3 animate-fadeIn">
                        <h2 className="text-small-dashboard text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)] font-semibold mb-2">Security Settings</h2>

                        <div>
                            <label className="block text-[10px] text-gray-400 mb-1">Current Password</label>
                            <input
                                type="password"
                                value={securityData.currentPassword}
                                onChange={(e) => setSecurityData({ ...securityData, currentPassword: e.target.value })}
                                className="w-full px-2 py-1.5 bg-[#16124A] border border-gray-700/50 rounded text-micro text-[#efdede] focus:outline-none focus:border-[#2F6BFF] transition-colors"
                                placeholder="Enter current password"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-[10px] text-gray-400 mb-1">New Password</label>
                                <input
                                    type="password"
                                    value={securityData.newPassword}
                                    onChange={(e) => setSecurityData({ ...securityData, newPassword: e.target.value })}
                                    className="w-full px-2 py-1.5 bg-[#16124A] border border-gray-700/50 rounded text-micro text-[#efdede] focus:outline-none focus:border-[#2F6BFF] transition-colors"
                                    placeholder="Enter new password"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] text-gray-400 mb-1">Confirm Password</label>
                                <input
                                    type="password"
                                    value={securityData.confirmPassword}
                                    onChange={(e) => setSecurityData({ ...securityData, confirmPassword: e.target.value })}
                                    className="w-full px-2 py-1.5 bg-[#16124A] border border-gray-700/50 rounded text-micro text-[#efdede] focus:outline-none focus:border-[#2F6BFF] transition-colors"
                                    placeholder="Confirm new password"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-2 bg-[#0B0633] border border-gray-700/50 rounded">
                            <div>
                                <div className="text-micro text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">Two-Factor Authentication</div>
                                <div className="text-[10px] text-gray-400">Add an extra layer of security</div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={securityData.twoFactorEnabled}
                                    onChange={(e) => setSecurityData({ ...securityData, twoFactorEnabled: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#2F6BFF]"></div>
                            </label>
                        </div>

                        <div>
                            <label className="block text-[10px] text-gray-400 mb-1">Session Timeout (minutes)</label>
                            <select
                                value={securityData.sessionTimeout}
                                onChange={(e) => setSecurityData({ ...securityData, sessionTimeout: e.target.value })}
                                className="w-full px-2 py-1.5 bg-[#16124A] border border-gray-700/50 rounded text-micro text-[#efdede] focus:outline-none focus:border-[#2F6BFF] transition-colors"
                            >
                                <option value="15">15 minutes</option>
                                <option value="30">30 minutes</option>
                                <option value="60">1 hour</option>
                                <option value="120">2 hours</option>
                            </select>
                        </div>
                    </div>
                )}

                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                    <div className="space-y-1.5 animate-fadeIn">
                        <h2 className="text-small-dashboard text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)] font-semibold mb-1.5">Notification Preferences</h2>

                        <div className="flex items-center justify-between p-1.5 bg-[#0B0633] border border-gray-700/50 rounded hover:border-[#2F6BFF]/50 transition-colors">
                            <div>
                                <div className="text-micro text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">Email Notifications</div>
                                <div className="text-[10px] text-gray-400">Receive notifications via email</div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={notificationData.emailNotifications}
                                    onChange={(e) => setNotificationData({ ...notificationData, emailNotifications: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#2F6BFF]"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between p-1.5 bg-[#0B0633] border border-gray-700/50 rounded hover:border-[#2F6BFF]/50 transition-colors">
                            <div>
                                <div className="text-micro text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">Trade Alerts</div>
                                <div className="text-[10px] text-gray-400">Get notified about trade executions</div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={notificationData.tradeAlerts}
                                    onChange={(e) => setNotificationData({ ...notificationData, tradeAlerts: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#2F6BFF]"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between p-1.5 bg-[#0B0633] border border-gray-700/50 rounded hover:border-[#2F6BFF]/50 transition-colors">
                            <div>
                                <div className="text-micro text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">Price Alerts</div>
                                <div className="text-[10px] text-gray-400">Alerts when prices reach targets</div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={notificationData.priceAlerts}
                                    onChange={(e) => setNotificationData({ ...notificationData, priceAlerts: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#2F6BFF]"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between p-1.5 bg-[#0B0633] border border-gray-700/50 rounded hover:border-[#2F6BFF]/50 transition-colors">
                            <div>
                                <div className="text-micro text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">News Updates</div>
                                <div className="text-[10px] text-gray-400">Market news and updates</div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={notificationData.newsUpdates}
                                    onChange={(e) => setNotificationData({ ...notificationData, newsUpdates: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#2F6BFF]"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between p-1.5 bg-[#0B0633] border border-gray-700/50 rounded hover:border-[#2F6BFF]/50 transition-colors">
                            <div>
                                <div className="text-micro text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">Weekly Reports</div>
                                <div className="text-[10px] text-gray-400">Weekly performance summaries</div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={notificationData.weeklyReports}
                                    onChange={(e) => setNotificationData({ ...notificationData, weeklyReports: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#2F6BFF]"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between p-1.5 bg-[#0B0633] border border-gray-700/50 rounded hover:border-[#2F6BFF]/50 transition-colors">
                            <div>
                                <div className="text-micro text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">Marketing Emails</div>
                                <div className="text-[10px] text-gray-400">Promotional offers and updates</div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={notificationData.marketingEmails}
                                    onChange={(e) => setNotificationData({ ...notificationData, marketingEmails: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#2F6BFF]"></div>
                            </label>
                        </div>
                    </div>
                )}

                {/* Preferences Tab */}
                {activeTab === 'preferences' && (
                    <div className="space-y-3 animate-fadeIn">
                        <h2 className="text-small-dashboard text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)] font-semibold mb-2">Application Preferences</h2>

                        <div>
                            <label className="block text-[10px] text-gray-400 mb-1">Theme</label>
                            <select
                                value={preferenceData.theme}
                                onChange={(e) => setPreferenceData({ ...preferenceData, theme: e.target.value })}
                                className="w-full px-2 py-1.5 bg-[#16124A] border border-gray-700/50 rounded text-micro text-[#efdede] focus:outline-none focus:border-[#2F6BFF] transition-colors"
                            >
                                <option value="dark">Dark</option>
                                <option value="light">Light</option>
                                <option value="auto">Auto</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-[10px] text-gray-400 mb-1">Default Currency</label>
                            <select
                                value={preferenceData.currency}
                                onChange={(e) => setPreferenceData({ ...preferenceData, currency: e.target.value })}
                                className="w-full px-2 py-1.5 bg-[#16124A] border border-gray-700/50 rounded text-micro text-[#efdede] focus:outline-none focus:border-[#2F6BFF] transition-colors"
                            >
                                <option value="USD">USD - US Dollar</option>
                                <option value="EUR">EUR - Euro</option>
                                <option value="GBP">GBP - British Pound</option>
                                <option value="JPY">JPY - Japanese Yen</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-[10px] text-gray-400 mb-1">Date Format</label>
                                <select
                                    value={preferenceData.dateFormat}
                                    onChange={(e) => setPreferenceData({ ...preferenceData, dateFormat: e.target.value })}
                                    className="w-full px-2 py-1.5 bg-[#16124A] border border-gray-700/50 rounded text-micro text-[#efdede] focus:outline-none focus:border-[#2F6BFF] transition-colors"
                                >
                                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] text-gray-400 mb-1">Number Format</label>
                                <select
                                    value={preferenceData.numberFormat}
                                    onChange={(e) => setPreferenceData({ ...preferenceData, numberFormat: e.target.value })}
                                    className="w-full px-2 py-1.5 bg-[#16124A] border border-gray-700/50 rounded text-micro text-[#efdede] focus:outline-none focus:border-[#2F6BFF] transition-colors"
                                >
                                    <option value="en-US">1,234.56 (US)</option>
                                    <option value="de-DE">1.234,56 (EU)</option>
                                    <option value="fr-FR">1 234,56 (FR)</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] text-gray-400 mb-1">Default Chart Type</label>
                            <select
                                value={preferenceData.chartType}
                                onChange={(e) => setPreferenceData({ ...preferenceData, chartType: e.target.value })}
                                className="w-full px-2 py-1.5 bg-[#16124A] border border-gray-700/50 rounded text-micro text-[#efdede] focus:outline-none focus:border-[#2F6BFF] transition-colors"
                            >
                                <option value="candlestick">Candlestick</option>
                                <option value="line">Line</option>
                                <option value="bar">Bar</option>
                                <option value="area">Area</option>
                            </select>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
