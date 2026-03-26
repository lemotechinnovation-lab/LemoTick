import { Activity, AlertCircle, Bot, DollarSign, Info, Save, Settings, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface BotConfig {
    // Trading Settings
    symbol: string;
    contractDuration: number;
    stakeAmount: number;
    maxDailyLoss: number;
    maxDailyProfit: number;

    // Strategy Settings
    strategy: string;
    confidenceThreshold: number;

    // Risk Management
    stopLossPercentage: number;
    takeProfitPercentage: number;
    maxConcurrentTrades: number;

    // Technical Indicators
    emaShort: number;
    emaLong: number;
    rsiPeriod: number;
    rsiOverbought: number;
    rsiOversold: number;

    // Account Settings
    accountMode: 'demo' | 'live';
    autoRestart: boolean;
}

type TabType = 'trading' | 'strategy' | 'indicators' | 'account';

export default function BotConfigurationFormPage() {
    const [activeTab, setActiveTab] = useState<TabType>('trading');
    const [config, setConfig] = useState<BotConfig>({
        symbol: 'R_100',
        contractDuration: 5,
        stakeAmount: 10,
        maxDailyLoss: 100,
        maxDailyProfit: 500,
        strategy: 'trend_following',
        confidenceThreshold: 70,
        stopLossPercentage: 5,
        takeProfitPercentage: 10,
        maxConcurrentTrades: 3,
        emaShort: 12,
        emaLong: 26,
        rsiPeriod: 14,
        rsiOverbought: 70,
        rsiOversold: 30,
        accountMode: 'demo',
        autoRestart: true,
    });

    const [isSaving, setIsSaving] = useState(false);

    const tabs = [
        { id: 'trading' as TabType, label: 'Trading', icon: DollarSign },
        { id: 'strategy' as TabType, label: 'Strategy', icon: TrendingUp },
        { id: 'indicators' as TabType, label: 'Indicators', icon: Activity },
        { id: 'account' as TabType, label: 'Account', icon: Settings },
    ];

    const handleChange = (field: keyof BotConfig, value: any) => {
        setConfig(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast.success('Configuration saved successfully!');
        setIsSaving(false);
    };

    return (
        <div className="px-4 sm:px-6 lg:px-8 py-4 w-full max-w-9xl mx-auto">
            {/* Page header with gradient background */}
            <div className="relative mb-4 p-3 rounded-lg bg-gradient-to-br from-[#2F6BFF]/10 via-[#16124A] to-[#FFA62B]/10 border border-[#2F6BFF]/20">
                <div className="sm:flex sm:justify-between sm:items-center">
                    <div className="mb-2 sm:mb-0">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="p-1.5 bg-[#2F6BFF]/20 rounded-lg">
                                <Bot size={16} className="text-[#2F6BFF]" />
                            </div>
                            <h1 className="text-body-dashboard font-bold text-[#efdede] drop-shadow-[0_0_6px_rgba(160,167,181,0.3)]">Bot Configuration Form</h1>

                            {/* Info Icon with Tooltip */}
                            <div className="relative group">
                                <Info size={14} className="text-gray-400 hover:text-[#2F6BFF] cursor-help transition-colors" />
                                <div className="absolute left-0 top-6 w-64 p-2 bg-[#0B0633] border border-[#2F6BFF]/30 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                                    <div className="flex items-start gap-1.5">
                                        <AlertCircle size={12} className="text-yellow-400 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-[10px] font-semibold text-yellow-400 mb-0.5">Important</p>
                                            <p className="text-[10px] text-gray-300 leading-relaxed">
                                                Changes will take effect after restarting the bot. Make sure to test your configuration in demo mode before switching to live trading.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p className="text-micro text-gray-300 ml-8">Configure your trading bot with an easy-to-use form</p>
                    </div>

                    {/* Save Button */}
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#2F6BFF] to-[#2557c9] hover:from-[#2557c9] hover:to-[#2F6BFF] text-white disabled:opacity-50 transition-all duration-300 shadow-brand hover-lift text-micro"
                    >
                        <Save size={14} />
                        <span>{isSaving ? 'Saving...' : 'Save Configuration'}</span>
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="mb-3 bg-gradient-to-br from-[#0B0633] to-[#16124A] rounded-lg border border-[#2F6BFF]/30 shadow-xl overflow-hidden">
                <div className="flex border-b border-[#2F6BFF]/30">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-micro font-semibold transition-all duration-300 ${activeTab === tab.id
                                    ? 'bg-gradient-to-r from-[#2F6BFF]/20 to-[#2F6BFF]/10 text-white border-b-2 border-[#2F6BFF]'
                                    : 'text-gray-400 hover:text-gray-300 hover:bg-[#16124A]/50'
                                    }`}
                            >
                                <Icon size={14} />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Tab Content */}
                <div className="p-4">
                    {/* Trading Settings Tab */}
                    {activeTab === 'trading' && (
                        <div className="space-y-3 max-w-2xl">
                            <div>
                                <label className="block text-micro text-gray-400 mb-1">Trading Symbol</label>
                                <select
                                    value={config.symbol}
                                    onChange={(e) => handleChange('symbol', e.target.value)}
                                    className="w-full px-2 py-1.5 rounded-lg bg-[#0B0633] border border-[#2F6BFF]/30 text-white text-micro focus:border-[#2F6BFF] focus:outline-none focus:ring-2 focus:ring-[#2F6BFF]/50 transition-all"
                                >
                                    <option value="R_100">Volatility 100 Index</option>
                                    <option value="R_75">Volatility 75 Index</option>
                                    <option value="R_50">Volatility 50 Index</option>
                                    <option value="R_25">Volatility 25 Index</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-micro text-gray-400 mb-1">Contract Duration (ticks)</label>
                                <input
                                    type="number"
                                    value={config.contractDuration}
                                    onChange={(e) => handleChange('contractDuration', parseInt(e.target.value))}
                                    className="w-full px-2 py-1.5 rounded-lg bg-[#0B0633] border border-[#2F6BFF]/30 text-white text-micro focus:border-[#2F6BFF] focus:outline-none focus:ring-2 focus:ring-[#2F6BFF]/50 transition-all"
                                    min="1"
                                    max="10"
                                />
                            </div>

                            <div>
                                <label className="block text-micro text-gray-400 mb-1">Stake Amount ($)</label>
                                <input
                                    type="number"
                                    value={config.stakeAmount}
                                    onChange={(e) => handleChange('stakeAmount', parseFloat(e.target.value))}
                                    className="w-full px-2 py-1.5 rounded-lg bg-[#0B0633] border border-[#2F6BFF]/30 text-white text-micro focus:border-[#2F6BFF] focus:outline-none focus:ring-2 focus:ring-[#2F6BFF]/50 transition-all"
                                    min="1"
                                    step="0.01"
                                />
                            </div>

                            <div>
                                <label className="block text-micro text-gray-400 mb-1">Max Daily Loss ($)</label>
                                <input
                                    type="number"
                                    value={config.maxDailyLoss}
                                    onChange={(e) => handleChange('maxDailyLoss', parseFloat(e.target.value))}
                                    className="w-full px-2 py-1.5 rounded-lg bg-[#0B0633] border border-[#2F6BFF]/30 text-white text-micro focus:border-[#2F6BFF] focus:outline-none focus:ring-2 focus:ring-[#2F6BFF]/50 transition-all"
                                    min="0"
                                />
                            </div>

                            <div>
                                <label className="block text-micro text-gray-400 mb-1">Max Daily Profit ($)</label>
                                <input
                                    type="number"
                                    value={config.maxDailyProfit}
                                    onChange={(e) => handleChange('maxDailyProfit', parseFloat(e.target.value))}
                                    className="w-full px-2 py-1.5 rounded-lg bg-[#0B0633] border border-[#2F6BFF]/30 text-white text-micro focus:border-[#2F6BFF] focus:outline-none focus:ring-2 focus:ring-[#2F6BFF]/50 transition-all"
                                    min="0"
                                />
                            </div>
                        </div>
                    )}

                    {/* Strategy Settings Tab */}
                    {activeTab === 'strategy' && (
                        <div className="space-y-3 max-w-2xl">
                            <div>
                                <label className="block text-micro text-gray-400 mb-1">Trading Strategy</label>
                                <select
                                    value={config.strategy}
                                    onChange={(e) => handleChange('strategy', e.target.value)}
                                    className="w-full px-2 py-1.5 rounded-lg bg-[#0B0633] border border-[#2F6BFF]/30 text-white text-micro focus:border-[#2F6BFF] focus:outline-none focus:ring-2 focus:ring-[#2F6BFF]/50 transition-all"
                                >
                                    <option value="trend_following">Trend Following</option>
                                    <option value="mean_reversion">Mean Reversion</option>
                                    <option value="breakout">Breakout</option>
                                    <option value="scalping">Scalping</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-micro text-gray-400 mb-1">Confidence Threshold (%)</label>
                                <input
                                    type="number"
                                    value={config.confidenceThreshold}
                                    onChange={(e) => handleChange('confidenceThreshold', parseInt(e.target.value))}
                                    className="w-full px-2 py-1.5 rounded-lg bg-[#0B0633] border border-[#2F6BFF]/30 text-white text-micro focus:border-[#2F6BFF] focus:outline-none focus:ring-2 focus:ring-[#2F6BFF]/50 transition-all"
                                    min="50"
                                    max="100"
                                />
                            </div>

                            <div>
                                <label className="block text-micro text-gray-400 mb-1">Stop Loss (%)</label>
                                <input
                                    type="number"
                                    value={config.stopLossPercentage}
                                    onChange={(e) => handleChange('stopLossPercentage', parseFloat(e.target.value))}
                                    className="w-full px-2 py-1.5 rounded-lg bg-[#0B0633] border border-[#2F6BFF]/30 text-white text-micro focus:border-[#2F6BFF] focus:outline-none focus:ring-2 focus:ring-[#2F6BFF]/50 transition-all"
                                    min="0"
                                    step="0.1"
                                />
                            </div>

                            <div>
                                <label className="block text-micro text-gray-400 mb-1">Take Profit (%)</label>
                                <input
                                    type="number"
                                    value={config.takeProfitPercentage}
                                    onChange={(e) => handleChange('takeProfitPercentage', parseFloat(e.target.value))}
                                    className="w-full px-2 py-1.5 rounded-lg bg-[#0B0633] border border-[#2F6BFF]/30 text-white text-micro focus:border-[#2F6BFF] focus:outline-none focus:ring-2 focus:ring-[#2F6BFF]/50 transition-all"
                                    min="0"
                                    step="0.1"
                                />
                            </div>

                            <div>
                                <label className="block text-micro text-gray-400 mb-1">Max Concurrent Trades</label>
                                <input
                                    type="number"
                                    value={config.maxConcurrentTrades}
                                    onChange={(e) => handleChange('maxConcurrentTrades', parseInt(e.target.value))}
                                    className="w-full px-2 py-1.5 rounded-lg bg-[#0B0633] border border-[#2F6BFF]/30 text-white text-micro focus:border-[#2F6BFF] focus:outline-none focus:ring-2 focus:ring-[#2F6BFF]/50 transition-all"
                                    min="1"
                                    max="10"
                                />
                            </div>
                        </div>
                    )}

                    {/* Technical Indicators Tab */}
                    {activeTab === 'indicators' && (
                        <div className="space-y-3 max-w-2xl">
                            <div>
                                <label className="block text-micro text-gray-400 mb-1">EMA Short Period</label>
                                <input
                                    type="number"
                                    value={config.emaShort}
                                    onChange={(e) => handleChange('emaShort', parseInt(e.target.value))}
                                    className="w-full px-2 py-1.5 rounded-lg bg-[#0B0633] border border-[#2F6BFF]/30 text-white text-micro focus:border-[#2F6BFF] focus:outline-none focus:ring-2 focus:ring-[#2F6BFF]/50 transition-all"
                                    min="1"
                                />
                            </div>

                            <div>
                                <label className="block text-micro text-gray-400 mb-1">EMA Long Period</label>
                                <input
                                    type="number"
                                    value={config.emaLong}
                                    onChange={(e) => handleChange('emaLong', parseInt(e.target.value))}
                                    className="w-full px-2 py-1.5 rounded-lg bg-[#0B0633] border border-[#2F6BFF]/30 text-white text-micro focus:border-[#2F6BFF] focus:outline-none focus:ring-2 focus:ring-[#2F6BFF]/50 transition-all"
                                    min="1"
                                />
                            </div>

                            <div>
                                <label className="block text-micro text-gray-400 mb-1">RSI Period</label>
                                <input
                                    type="number"
                                    value={config.rsiPeriod}
                                    onChange={(e) => handleChange('rsiPeriod', parseInt(e.target.value))}
                                    className="w-full px-2 py-1.5 rounded-lg bg-[#0B0633] border border-[#2F6BFF]/30 text-white text-micro focus:border-[#2F6BFF] focus:outline-none focus:ring-2 focus:ring-[#2F6BFF]/50 transition-all"
                                    min="1"
                                />
                            </div>

                            <div>
                                <label className="block text-micro text-gray-400 mb-1">RSI Overbought Level</label>
                                <input
                                    type="number"
                                    value={config.rsiOverbought}
                                    onChange={(e) => handleChange('rsiOverbought', parseInt(e.target.value))}
                                    className="w-full px-2 py-1.5 rounded-lg bg-[#0B0633] border border-[#2F6BFF]/30 text-white text-micro focus:border-[#2F6BFF] focus:outline-none focus:ring-2 focus:ring-[#2F6BFF]/50 transition-all"
                                    min="50"
                                    max="100"
                                />
                            </div>

                            <div>
                                <label className="block text-micro text-gray-400 mb-1">RSI Oversold Level</label>
                                <input
                                    type="number"
                                    value={config.rsiOversold}
                                    onChange={(e) => handleChange('rsiOversold', parseInt(e.target.value))}
                                    className="w-full px-2 py-1.5 rounded-lg bg-[#0B0633] border border-[#2F6BFF]/30 text-white text-micro focus:border-[#2F6BFF] focus:outline-none focus:ring-2 focus:ring-[#2F6BFF]/50 transition-all"
                                    min="0"
                                    max="50"
                                />
                            </div>
                        </div>
                    )}

                    {/* Account Settings Tab */}
                    {activeTab === 'account' && (
                        <div className="space-y-3 max-w-2xl">
                            <div>
                                <label className="block text-micro text-gray-400 mb-1">Account Mode</label>
                                <select
                                    value={config.accountMode}
                                    onChange={(e) => handleChange('accountMode', e.target.value)}
                                    className="w-full px-2 py-1.5 rounded-lg bg-[#0B0633] border border-[#2F6BFF]/30 text-white text-micro focus:border-[#2F6BFF] focus:outline-none focus:ring-2 focus:ring-[#2F6BFF]/50 transition-all"
                                >
                                    <option value="demo">Demo Account</option>
                                    <option value="live">Live Account</option>
                                </select>
                            </div>

                            <div className="flex items-center justify-between p-2 rounded-lg bg-[#0B0633] border border-[#2F6BFF]/30">
                                <span className="text-micro text-gray-300">Auto Restart on Error</span>
                                <button
                                    onClick={() => handleChange('autoRestart', !config.autoRestart)}
                                    className={`relative w-10 h-5 rounded-full transition-colors ${config.autoRestart ? 'bg-[#2F6BFF]' : 'bg-gray-600'}`}
                                >
                                    <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${config.autoRestart ? 'translate-x-5' : 'translate-x-0'}`}></span>
                                </button>
                            </div>

                            {config.accountMode === 'live' && (
                                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                                    <div className="flex items-start gap-2">
                                        <AlertCircle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                                        <p className="text-micro text-red-400 leading-relaxed">
                                            Live trading mode is enabled. Real money will be used for trades. Make sure you have tested your configuration thoroughly in demo mode.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
