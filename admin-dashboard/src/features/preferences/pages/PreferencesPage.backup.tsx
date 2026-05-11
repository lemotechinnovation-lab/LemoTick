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
import { Bell, Eye, Save, Settings, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

type TabType = 'display' | 'trading' | 'notifications' | 'privacy';

export default function PreferencesPage() {
    const [activeTab, setActiveTab] = useState<TabType>('display');
    const [isSaving, setIsSaving] = useState(false);

    // Display preferences
    const [displayPrefs, setDisplayPrefs] = useState({
        theme: 'dark',
        language: 'English',
        timezone: 'America/New_York',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h',
        currency: 'USD',
    });

    // Trading preferences
    const [tradingPrefs, setTradingPrefs] = useState({
        defaultStake: '10',
        defaultDuration: '5',
        confirmTrades: true,
        autoClose: false,
        riskLevel: 'medium',
        chartType: 'candlestick',
    });

    // Notification preferences
    const [notificationPrefs, setNotificationPrefs] = useState({
        emailAlerts: true,
        pushNotifications: false,
        tradeAlerts: true,
        priceAlerts: false,
        soundEnabled: true,
    });

    // Privacy preferences
    const [privacyPrefs, setPrivacyPrefs] = useState({
        showBalance: true,
        showProfitLoss: true,
        publicProfile: false,
        dataSharing: false,
        analyticsTracking: true,
    });

    const handleSave = async () => {
        setIsSaving(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast.success('Preferences saved successfully!');
        setIsSaving(false);
    };

    const tabs = [
        { id: 'display' as TabType, label: 'Display', icon: Eye },
        { id: 'trading' as TabType, label: 'Trading', icon: TrendingUp },
        { id: 'notifications' as TabType, label: 'Notifications', icon: Bell },
        { id: 'privacy' as TabType, label: 'Privacy', icon: Settings },
    ];

    return (
        <PageContainer>
            {/* Page Header */}
            <PageHeader
                title="PREFERENCES"
                description="Customize your trading experience"
                icon={Settings}
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
                    {/* Display Tab */}
                    {activeTab === 'display' && (
                        <FormContainer maxWidth="md">
                            <FormSection
                                title="Display Preferences"
                                description="Customize how information is displayed"
                            >
                                <FormField label="Theme" htmlFor="theme">
                                    <Select
                                        id="theme"
                                        value={displayPrefs.theme}
                                        onChange={(e) => setDisplayPrefs({ ...displayPrefs, theme: e.target.value })}
                                    >
                                        <option value="dark">Dark</option>
                                        <option value="light">Light</option>
                                        <option value="auto">Auto</option>
                                    </Select>
                                </FormField>

                                <FormGrid columns={2}>
                                    <FormField label="Language" htmlFor="language">
                                        <Select
                                            id="language"
                                            value={displayPrefs.language}
                                            onChange={(e) => setDisplayPrefs({ ...displayPrefs, language: e.target.value })}
                                        >
                                            <option value="English">English</option>
                                            <option value="Spanish">Spanish</option>
                                            <option value="French">French</option>
                                            <option value="German">German</option>
                                        </Select>
                                    </FormField>
                                    <FormField label="Currency" htmlFor="currency">
                                        <Select
                                            id="currency"
                                            value={displayPrefs.currency}
                                            onChange={(e) => setDisplayPrefs({ ...displayPrefs, currency: e.target.value })}
                                        >
                                            <option value="USD">USD</option>
                                            <option value="EUR">EUR</option>
                                            <option value="GBP">GBP</option>
                                            <option value="JPY">JPY</option>
                                        </Select>
                                    </FormField>
                                </FormGrid>

                                <FormField label="Timezone" htmlFor="timezone">
                                    <Select
                                        id="timezone"
                                        value={displayPrefs.timezone}
                                        onChange={(e) => setDisplayPrefs({ ...displayPrefs, timezone: e.target.value })}
                                    >
                                        <option value="America/New_York">Eastern Time (ET)</option>
                                        <option value="America/Chicago">Central Time (CT)</option>
                                        <option value="America/Denver">Mountain Time (MT)</option>
                                        <option value="America/Los_Angeles">Pacific Time (PT)</option>
                                    </Select>
                                </FormField>

                                <FormGrid columns={2}>
                                    <FormField label="Date Format" htmlFor="dateFormat">
                                        <Select
                                            id="dateFormat"
                                            value={displayPrefs.dateFormat}
                                            onChange={(e) => setDisplayPrefs({ ...displayPrefs, dateFormat: e.target.value })}
                                        >
                                            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                        </Select>
                                    </FormField>
                                    <FormField label="Time Format" htmlFor="timeFormat">
                                        <Select
                                            id="timeFormat"
                                            value={displayPrefs.timeFormat}
                                            onChange={(e) => setDisplayPrefs({ ...displayPrefs, timeFormat: e.target.value })}
                                        >
                                            <option value="12h">12 Hour</option>
                                            <option value="24h">24 Hour</option>
                                        </Select>
                                    </FormField>
                                </FormGrid>
                            </FormSection>
                        </FormContainer>
                    )}

                    {/* Trading Tab */}
                    {activeTab === 'trading' && (
                        <FormContainer maxWidth="md">
                            <FormSection
                                title="Trading Preferences"
                                description="Configure your default trading settings"
                            >
                                <FormGrid columns={2}>
                                    <FormField label="Default Stake" htmlFor="defaultStake">
                                        <Input
                                            id="defaultStake"
                                            type="number"
                                            value={tradingPrefs.defaultStake}
                                            onChange={(e) => setTradingPrefs({ ...tradingPrefs, defaultStake: e.target.value })}
                                        />
                                    </FormField>
                                    <FormField label="Default Duration" htmlFor="defaultDuration">
                                        <Input
                                            id="defaultDuration"
                                            type="number"
                                            value={tradingPrefs.defaultDuration}
                                            onChange={(e) => setTradingPrefs({ ...tradingPrefs, defaultDuration: e.target.value })}
                                        />
                                    </FormField>
                                </FormGrid>

                                <FormField label="Risk Level" htmlFor="riskLevel">
                                    <Select
                                        id="riskLevel"
                                        value={tradingPrefs.riskLevel}
                                        onChange={(e) => setTradingPrefs({ ...tradingPrefs, riskLevel: e.target.value })}
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </Select>
                                </FormField>

                                <FormField label="Chart Type" htmlFor="chartType">
                                    <Select
                                        id="chartType"
                                        value={tradingPrefs.chartType}
                                        onChange={(e) => setTradingPrefs({ ...tradingPrefs, chartType: e.target.value })}
                                    >
                                        <option value="candlestick">Candlestick</option>
                                        <option value="line">Line</option>
                                        <option value="bar">Bar</option>
                                        <option value="area">Area</option>
                                    </Select>
                                </FormField>

                                <Toggle
                                    checked={tradingPrefs.confirmTrades}
                                    onChange={(checked) => setTradingPrefs({ ...tradingPrefs, confirmTrades: checked })}
                                    label="Confirm Trades"
                                    description="Ask before placing trades"
                                />

                                <Toggle
                                    checked={tradingPrefs.autoClose}
                                    onChange={(checked) => setTradingPrefs({ ...tradingPrefs, autoClose: checked })}
                                    label="Auto Close"
                                    description="Close trades automatically"
                                />
                            </FormSection>
                        </FormContainer>
                    )}

                    {/* Notifications Tab */}
                    {activeTab === 'notifications' && (
                        <FormContainer maxWidth="md">
                            <FormSection
                                title="Notification Preferences"
                                description="Manage how you receive notifications"
                            >
                                <Toggle
                                    checked={notificationPrefs.emailAlerts}
                                    onChange={(checked) => setNotificationPrefs({ ...notificationPrefs, emailAlerts: checked })}
                                    label="Email Alerts"
                                    description="Receive email notifications"
                                />

                                <Toggle
                                    checked={notificationPrefs.pushNotifications}
                                    onChange={(checked) => setNotificationPrefs({ ...notificationPrefs, pushNotifications: checked })}
                                    label="Push Notifications"
                                    description="Browser push notifications"
                                />

                                <Toggle
                                    checked={notificationPrefs.tradeAlerts}
                                    onChange={(checked) => setNotificationPrefs({ ...notificationPrefs, tradeAlerts: checked })}
                                    label="Trade Alerts"
                                    description="Notify on trade execution"
                                />

                                <Toggle
                                    checked={notificationPrefs.priceAlerts}
                                    onChange={(checked) => setNotificationPrefs({ ...notificationPrefs, priceAlerts: checked })}
                                    label="Price Alerts"
                                    description="Alert on price targets"
                                />

                                <Toggle
                                    checked={notificationPrefs.soundEnabled}
                                    onChange={(checked) => setNotificationPrefs({ ...notificationPrefs, soundEnabled: checked })}
                                    label="Sound Enabled"
                                    description="Play notification sounds"
                                />
                            </FormSection>
                        </FormContainer>
                    )}

                    {/* Privacy Tab */}
                    {activeTab === 'privacy' && (
                        <FormContainer maxWidth="md">
                            <FormSection
                                title="Privacy Preferences"
                                description="Control your privacy and data sharing settings"
                            >
                                <Toggle
                                    checked={privacyPrefs.showBalance}
                                    onChange={(checked) => setPrivacyPrefs({ ...privacyPrefs, showBalance: checked })}
                                    label="Show Balance"
                                    description="Display account balance"
                                />

                                <Toggle
                                    checked={privacyPrefs.showProfitLoss}
                                    onChange={(checked) => setPrivacyPrefs({ ...privacyPrefs, showProfitLoss: checked })}
                                    label="Show Profit/Loss"
                                    description="Display P&L information"
                                />

                                <Toggle
                                    checked={privacyPrefs.publicProfile}
                                    onChange={(checked) => setPrivacyPrefs({ ...privacyPrefs, publicProfile: checked })}
                                    label="Public Profile"
                                    description="Make profile visible"
                                />

                                <Toggle
                                    checked={privacyPrefs.dataSharing}
                                    onChange={(checked) => setPrivacyPrefs({ ...privacyPrefs, dataSharing: checked })}
                                    label="Data Sharing"
                                    description="Share data with partners"
                                />

                                <Toggle
                                    checked={privacyPrefs.analyticsTracking}
                                    onChange={(checked) => setPrivacyPrefs({ ...privacyPrefs, analyticsTracking: checked })}
                                    label="Analytics Tracking"
                                    description="Help improve our service"
                                />
                            </FormSection>
                        </FormContainer>
                    )}
                </div>
            </div>
        </PageContainer>
    );
}
