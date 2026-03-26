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
        <div className="px-4 sm:px-6 lg:px-8 py-4 w-full max-w-9xl mx-auto">
            {/* Page header */}
            <div className="relative mb-4 p-3 rounded-lg bg-gradient-to-br from-[#2F6BFF]/10 via-[#16124A] to-[#FFA62B]/10 border border-[#2F6BFF]/20">
                <div className="sm:flex sm:justify-between sm:items-center">
                    <div className="mb-2 sm:mb-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                            <div className="p-1.5 bg-[#2F6BFF]/20 rounded-lg">
                                <Settings size={16} className="text-[#2F6BFF]" />
                            </div>
                            <h1 className="text-body-dashboard font-bold text-[#efdede] drop-shadow-[0_0_6px_rgba(160,167,181,0.3)]">Preferences</h1>
                        </div>
                        <p className="text-micro text-gray-300 ml-8">Customize your trading experience</p>
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
                {/* Display Tab */}
                {activeTab === 'display' && (
                    <div className="space-y-2 animate-fadeIn">
                        <h2 className="text-small-dashboard text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)] font-semibold mb-2">Display Preferences</h2>

                        <div>
                            <label className="block text-[10px] text-gray-400 mb-1">Theme</label>
                            <select
                                value={displayPrefs.theme}
                                onChange={(e) => setDisplayPrefs({ ...displayPrefs, theme: e.target.value })}
                                className="w-full px-2 py-1.5 bg-[#16124A] border border-gray-700/50 rounded text-micro text-[#efdede] focus:outline-none focus:border-[#2F6BFF] transition-colors"
                            >
                                <option value="dark">Dark</option>
                                <option value="light">Light</option>
                                <option value="auto">Auto</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-[10px] text-gray-400 mb-1">Language</label>
                                <select
                                    value={displayPrefs.language}
                                    onChange={(e) => setDisplayPrefs({ ...displayPrefs, language: e.target.value })}
                                    className="w-full px-2 py-1.5 bg-[#16124A] border border-gray-700/50 rounded text-micro text-[#efdede] focus:outline-none focus:border-[#2F6BFF] transition-colors"
                                >
                                    <option value="English">English</option>
                                    <option value="Spanish">Spanish</option>
                                    <option value="French">French</option>
                                    <option value="German">German</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] text-gray-400 mb-1">Currency</label>
                                <select
                                    value={displayPrefs.currency}
                                    onChange={(e) => setDisplayPrefs({ ...displayPrefs, currency: e.target.value })}
                                    className="w-full px-2 py-1.5 bg-[#16124A] border border-gray-700/50 rounded text-micro text-[#efdede] focus:outline-none focus:border-[#2F6BFF] transition-colors"
                                >
                                    <option value="USD">USD</option>
                                    <option value="EUR">EUR</option>
                                    <option value="GBP">GBP</option>
                                    <option value="JPY">JPY</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] text-gray-400 mb-1">Timezone</label>
                            <select
                                value={displayPrefs.timezone}
                                onChange={(e) => setDisplayPrefs({ ...displayPrefs, timezone: e.target.value })}
                                className="w-full px-2 py-1.5 bg-[#16124A] border border-gray-700/50 rounded text-micro text-[#efdede] focus:outline-none focus:border-[#2F6BFF] transition-colors"
                            >
                                <option value="America/New_York">Eastern Time (ET)</option>
                                <option value="America/Chicago">Central Time (CT)</option>
                                <option value="America/Denver">Mountain Time (MT)</option>
                                <option value="America/Los_Angeles">Pacific Time (PT)</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-[10px] text-gray-400 mb-1">Date Format</label>
                                <select
                                    value={displayPrefs.dateFormat}
                                    onChange={(e) => setDisplayPrefs({ ...displayPrefs, dateFormat: e.target.value })}
                                    className="w-full px-2 py-1.5 bg-[#16124A] border border-gray-700/50 rounded text-micro text-[#efdede] focus:outline-none focus:border-[#2F6BFF] transition-colors"
                                >
                                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] text-gray-400 mb-1">Time Format</label>
                                <select
                                    value={displayPrefs.timeFormat}
                                    onChange={(e) => setDisplayPrefs({ ...displayPrefs, timeFormat: e.target.value })}
                                    className="w-full px-2 py-1.5 bg-[#16124A] border border-gray-700/50 rounded text-micro text-[#efdede] focus:outline-none focus:border-[#2F6BFF] transition-colors"
                                >
                                    <option value="12h">12 Hour</option>
                                    <option value="24h">24 Hour</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {/* Trading Tab */}
                {activeTab === 'trading' && (
                    <div className="space-y-2 animate-fadeIn">
                        <h2 className="text-small-dashboard text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)] font-semibold mb-2">Trading Preferences</h2>

                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-[10px] text-gray-400 mb-1">Default Stake</label>
                                <input
                                    type="number"
                                    value={tradingPrefs.defaultStake}
                                    onChange={(e) => setTradingPrefs({ ...tradingPrefs, defaultStake: e.target.value })}
                                    className="w-full px-2 py-1.5 bg-[#16124A] border border-gray-700/50 rounded text-micro text-[#efdede] focus:outline-none focus:border-[#2F6BFF] transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] text-gray-400 mb-1">Default Duration</label>
                                <input
                                    type="number"
                                    value={tradingPrefs.defaultDuration}
                                    onChange={(e) => setTradingPrefs({ ...tradingPrefs, defaultDuration: e.target.value })}
                                    className="w-full px-2 py-1.5 bg-[#16124A] border border-gray-700/50 rounded text-micro text-[#efdede] focus:outline-none focus:border-[#2F6BFF] transition-colors"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] text-gray-400 mb-1">Risk Level</label>
                            <select
                                value={tradingPrefs.riskLevel}
                                onChange={(e) => setTradingPrefs({ ...tradingPrefs, riskLevel: e.target.value })}
                                className="w-full px-2 py-1.5 bg-[#16124A] border border-gray-700/50 rounded text-micro text-[#efdede] focus:outline-none focus:border-[#2F6BFF] transition-colors"
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-[10px] text-gray-400 mb-1">Chart Type</label>
                            <select
                                value={tradingPrefs.chartType}
                                onChange={(e) => setTradingPrefs({ ...tradingPrefs, chartType: e.target.value })}
                                className="w-full px-2 py-1.5 bg-[#16124A] border border-gray-700/50 rounded text-micro text-[#efdede] focus:outline-none focus:border-[#2F6BFF] transition-colors"
                            >
                                <option value="candlestick">Candlestick</option>
                                <option value="line">Line</option>
                                <option value="bar">Bar</option>
                                <option value="area">Area</option>
                            </select>
                        </div>

                        <div className="flex items-center justify-between p-1.5 bg-[#0B0633] border border-gray-700/50 rounded">
                            <div>
                                <div className="text-micro text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">Confirm Trades</div>
                                <div className="text-[10px] text-gray-400">Ask before placing trades</div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={tradingPrefs.confirmTrades}
                                    onChange={(e) => setTradingPrefs({ ...tradingPrefs, confirmTrades: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#2F6BFF]"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between p-1.5 bg-[#0B0633] border border-gray-700/50 rounded">
                            <div>
                                <div className="text-micro text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">Auto Close</div>
                                <div className="text-[10px] text-gray-400">Close trades automatically</div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={tradingPrefs.autoClose}
                                    onChange={(e) => setTradingPrefs({ ...tradingPrefs, autoClose: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#2F6BFF]"></div>
                            </label>
                        </div>
                    </div>
                )}

                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                    <div className="space-y-1.5 animate-fadeIn">
                        <h2 className="text-small-dashboard text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)] font-semibold mb-1.5">Notification Preferences</h2>

                        <div className="flex items-center justify-between p-1.5 bg-[#0B0633] border border-gray-700/50 rounded hover:border-[#2F6BFF]/50 transition-colors">
                            <div>
                                <div className="text-micro text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">Email Alerts</div>
                                <div className="text-[10px] text-gray-400">Receive email notifications</div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={notificationPrefs.emailAlerts}
                                    onChange={(e) => setNotificationPrefs({ ...notificationPrefs, emailAlerts: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#2F6BFF]"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between p-1.5 bg-[#0B0633] border border-gray-700/50 rounded hover:border-[#2F6BFF]/50 transition-colors">
                            <div>
                                <div className="text-micro text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">Push Notifications</div>
                                <div className="text-[10px] text-gray-400">Browser push notifications</div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={notificationPrefs.pushNotifications}
                                    onChange={(e) => setNotificationPrefs({ ...notificationPrefs, pushNotifications: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#2F6BFF]"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between p-1.5 bg-[#0B0633] border border-gray-700/50 rounded hover:border-[#2F6BFF]/50 transition-colors">
                            <div>
                                <div className="text-micro text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">Trade Alerts</div>
                                <div className="text-[10px] text-gray-400">Notify on trade execution</div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={notificationPrefs.tradeAlerts}
                                    onChange={(e) => setNotificationPrefs({ ...notificationPrefs, tradeAlerts: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#2F6BFF]"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between p-1.5 bg-[#0B0633] border border-gray-700/50 rounded hover:border-[#2F6BFF]/50 transition-colors">
                            <div>
                                <div className="text-micro text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">Price Alerts</div>
                                <div className="text-[10px] text-gray-400">Alert on price targets</div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={notificationPrefs.priceAlerts}
                                    onChange={(e) => setNotificationPrefs({ ...notificationPrefs, priceAlerts: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#2F6BFF]"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between p-1.5 bg-[#0B0633] border border-gray-700/50 rounded hover:border-[#2F6BFF]/50 transition-colors">
                            <div>
                                <div className="text-micro text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">Sound Enabled</div>
                                <div className="text-[10px] text-gray-400">Play notification sounds</div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={notificationPrefs.soundEnabled}
                                    onChange={(e) => setNotificationPrefs({ ...notificationPrefs, soundEnabled: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#2F6BFF]"></div>
                            </label>
                        </div>
                    </div>
                )}

                {/* Privacy Tab */}
                {activeTab === 'privacy' && (
                    <div className="space-y-1.5 animate-fadeIn">
                        <h2 className="text-small-dashboard text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)] font-semibold mb-1.5">Privacy Preferences</h2>

                        <div className="flex items-center justify-between p-1.5 bg-[#0B0633] border border-gray-700/50 rounded hover:border-[#2F6BFF]/50 transition-colors">
                            <div>
                                <div className="text-micro text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">Show Balance</div>
                                <div className="text-[10px] text-gray-400">Display account balance</div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={privacyPrefs.showBalance}
                                    onChange={(e) => setPrivacyPrefs({ ...privacyPrefs, showBalance: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#2F6BFF]"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between p-1.5 bg-[#0B0633] border border-gray-700/50 rounded hover:border-[#2F6BFF]/50 transition-colors">
                            <div>
                                <div className="text-micro text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">Show Profit/Loss</div>
                                <div className="text-[10px] text-gray-400">Display P&L information</div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={privacyPrefs.showProfitLoss}
                                    onChange={(e) => setPrivacyPrefs({ ...privacyPrefs, showProfitLoss: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#2F6BFF]"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between p-1.5 bg-[#0B0633] border border-gray-700/50 rounded hover:border-[#2F6BFF]/50 transition-colors">
                            <div>
                                <div className="text-micro text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">Public Profile</div>
                                <div className="text-[10px] text-gray-400">Make profile visible</div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={privacyPrefs.publicProfile}
                                    onChange={(e) => setPrivacyPrefs({ ...privacyPrefs, publicProfile: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#2F6BFF]"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between p-1.5 bg-[#0B0633] border border-gray-700/50 rounded hover:border-[#2F6BFF]/50 transition-colors">
                            <div>
                                <div className="text-micro text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">Data Sharing</div>
                                <div className="text-[10px] text-gray-400">Share data with partners</div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={privacyPrefs.dataSharing}
                                    onChange={(e) => setPrivacyPrefs({ ...privacyPrefs, dataSharing: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#2F6BFF]"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between p-1.5 bg-[#0B0633] border border-gray-700/50 rounded hover:border-[#2F6BFF]/50 transition-colors">
                            <div>
                                <div className="text-micro text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">Analytics Tracking</div>
                                <div className="text-[10px] text-gray-400">Help improve our service</div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={privacyPrefs.analyticsTracking}
                                    onChange={(e) => setPrivacyPrefs({ ...privacyPrefs, analyticsTracking: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#2F6BFF]"></div>
                            </label>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
