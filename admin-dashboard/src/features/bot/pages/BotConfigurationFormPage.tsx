// Enhanced Bot Configuration Form - Modern 2026 Design
// Multi-column layouts, compact sections, reduced scrolling

import {
    CompactField,
    CompactFormSection,
    Divider,
    FormContainer,
    FormField,
    FormGrid,
    FormSection,
    InfoMessage,
    Input,
    Select,
    Toggle
} from '@/components/ui/FormComponentsEnhanced';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageContainer } from '@/components/ui/PageLayoutEnhanced';
import { Activity, AlertCircle, Bot, DollarSign, Percent, Save, Settings, TrendingUp } from 'lucide-react';
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
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast.success('Configuration saved successfully!');
        setIsSaving(false);
    };

    return (
        <PageContainer>
            {/* Page Header */}
            <PageHeader
                title="BOT CONFIGURATION"
                description="Configure your trading bot settings and parameters"
                icon={Bot}
                actions={
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#2F6BFF] to-[#3B82F6] hover:from-[#3B82F6] hover:to-[#2F6BFF] text-white disabled:opacity-50 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold"
                    >
                        <Save className="w-5 h-5" />
                        <span>{isSaving ? 'Saving...' : 'Save Configuration'}</span>
                    </button>
                }
            />

            <FormContainer maxWidth="xl">
                {/* Tabs */}
                <div className="mb-8 rounded-2xl border border-[#2F6BFF]/30 bg-[#16124A]/50 shadow-xl overflow-hidden">
                    <div className="flex border-b border-[#2F6BFF]/30 bg-gradient-to-r from-[#2F6BFF]/10 to-transparent">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-semibold transition-all duration-300 ${activeTab === tab.id
                                        ? 'bg-gradient-to-r from-[#2F6BFF]/20 to-[#2F6BFF]/10 text-white border-b-2 border-[#2F6BFF]'
                                        : 'text-gray-400 hover:text-gray-300 hover:bg-[#16124A]/50'
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="hidden sm:inline">{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Tab Content */}
                    <div className="p-8">
                        {/* Trading Settings Tab */}
                        {activeTab === 'trading' && (
                            <FormContainer maxWidth="xl">
                                <FormSection
                                    title="Trading Parameters"
                                    description="Configure basic trading settings for your bot"
                                    variant="elevated"
                                    icon={<DollarSign className="w-5 h-5 text-[#2F6BFF]" />}
                                >
                                    <FormField
                                        label="Trading Symbol"
                                        htmlFor="symbol"
                                        required
                                        helpText="Select the market symbol to trade"
                                        compact
                                    >
                                        <Select
                                            id="symbol"
                                            value={config.symbol}
                                            onChange={(e) => handleChange('symbol', e.target.value)}
                                        >
                                            <option value="R_100">Volatility 100 Index</option>
                                            <option value="R_75">Volatility 75 Index</option>
                                            <option value="R_50">Volatility 50 Index</option>
                                            <option value="R_25">Volatility 25 Index</option>
                                        </Select>
                                    </FormField>

                                    <Divider label="Trade Settings" />

                                    <CompactFormSection title="Basic Parameters" columns={3}>
                                        <CompactField label="Contract Duration">
                                            <Input
                                                variant="compact"
                                                type="number"
                                                value={config.contractDuration}
                                                onChange={(e) => handleChange('contractDuration', parseInt(e.target.value))}
                                                min="1"
                                                max="10"
                                            />
                                        </CompactField>

                                        <CompactField label="Stake Amount (USD)">
                                            <Input
                                                variant="compact"
                                                type="number"
                                                value={config.stakeAmount}
                                                onChange={(e) => handleChange('stakeAmount', parseFloat(e.target.value))}
                                                min="1"
                                                step="0.01"
                                                icon={<DollarSign className="w-4 h-4" />}
                                            />
                                        </CompactField>

                                        <CompactField label="Max Concurrent">
                                            <Input
                                                variant="compact"
                                                type="number"
                                                value={config.maxConcurrentTrades}
                                                onChange={(e) => handleChange('maxConcurrentTrades', parseInt(e.target.value))}
                                                min="1"
                                                max="10"
                                            />
                                        </CompactField>
                                    </CompactFormSection>

                                    <Divider label="Daily Limits" />

                                    <CompactFormSection columns={2}>
                                        <CompactField label="Max Daily Loss">
                                            <Input
                                                variant="compact"
                                                type="number"
                                                value={config.maxDailyLoss}
                                                onChange={(e) => handleChange('maxDailyLoss', parseFloat(e.target.value))}
                                                min="0"
                                                icon={<DollarSign className="w-4 h-4" />}
                                            />
                                        </CompactField>

                                        <CompactField label="Max Daily Profit">
                                            <Input
                                                variant="compact"
                                                type="number"
                                                value={config.maxDailyProfit}
                                                onChange={(e) => handleChange('maxDailyProfit', parseFloat(e.target.value))}
                                                min="0"
                                                icon={<DollarSign className="w-4 h-4" />}
                                            />
                                        </CompactField>
                                    </CompactFormSection>
                                </FormSection>
                            </FormContainer>
                        )}

                        {/* Strategy Settings Tab */}
                        {activeTab === 'strategy' && (
                            <FormContainer maxWidth="xl">
                                <FormSection
                                    title="Strategy Configuration"
                                    description="Define your trading strategy and risk management rules"
                                    variant="elevated"
                                    icon={<TrendingUp className="w-5 h-5 text-[#2F6BFF]" />}
                                >
                                    <FormGrid columns={2} gap="md">
                                        <FormField
                                            label="Trading Strategy"
                                            htmlFor="strategy"
                                            required
                                            helpText="Select your preferred trading approach"
                                            compact
                                        >
                                            <Select
                                                id="strategy"
                                                value={config.strategy}
                                                onChange={(e) => handleChange('strategy', e.target.value)}
                                            >
                                                <option value="trend_following">Trend Following</option>
                                                <option value="mean_reversion">Mean Reversion</option>
                                                <option value="breakout">Breakout</option>
                                                <option value="scalping">Scalping</option>
                                            </Select>
                                        </FormField>

                                        <FormField
                                            label="Confidence Threshold (%)"
                                            htmlFor="confidenceThreshold"
                                            required
                                            helpText="Minimum confidence to execute (50-100%)"
                                            compact
                                        >
                                            <Input
                                                id="confidenceThreshold"
                                                type="number"
                                                value={config.confidenceThreshold}
                                                onChange={(e) => handleChange('confidenceThreshold', parseInt(e.target.value))}
                                                min="50"
                                                max="100"
                                                icon={<Percent className="w-4 h-4" />}
                                            />
                                        </FormField>
                                    </FormGrid>

                                    <Divider label="Risk Management" />

                                    <CompactFormSection title="Exit Parameters" columns={2}>
                                        <CompactField label="Stop Loss (%)">
                                            <Input
                                                variant="compact"
                                                type="number"
                                                value={config.stopLossPercentage}
                                                onChange={(e) => handleChange('stopLossPercentage', parseFloat(e.target.value))}
                                                min="0"
                                                step="0.1"
                                                icon={<Percent className="w-4 h-4" />}
                                            />
                                        </CompactField>

                                        <CompactField label="Take Profit (%)">
                                            <Input
                                                variant="compact"
                                                type="number"
                                                value={config.takeProfitPercentage}
                                                onChange={(e) => handleChange('takeProfitPercentage', parseFloat(e.target.value))}
                                                min="0"
                                                step="0.1"
                                                icon={<Percent className="w-4 h-4" />}
                                            />
                                        </CompactField>
                                    </CompactFormSection>
                                </FormSection>
                            </FormContainer>
                        )}

                        {/* Technical Indicators Tab */}
                        {activeTab === 'indicators' && (
                            <FormContainer maxWidth="xl">
                                <FormSection
                                    title="Technical Indicators"
                                    description="Configure technical analysis parameters"
                                    variant="elevated"
                                    icon={<Activity className="w-5 h-5 text-[#2F6BFF]" />}
                                >
                                    <CompactFormSection title="Moving Averages (EMA)" columns={2}>
                                        <CompactField label="Short Period">
                                            <Input
                                                variant="compact"
                                                type="number"
                                                value={config.emaShort}
                                                onChange={(e) => handleChange('emaShort', parseInt(e.target.value))}
                                                min="1"
                                            />
                                        </CompactField>

                                        <CompactField label="Long Period">
                                            <Input
                                                variant="compact"
                                                type="number"
                                                value={config.emaLong}
                                                onChange={(e) => handleChange('emaLong', parseInt(e.target.value))}
                                                min="1"
                                            />
                                        </CompactField>
                                    </CompactFormSection>

                                    <Divider label="RSI Settings" />

                                    <CompactFormSection columns={3}>
                                        <CompactField label="RSI Period">
                                            <Input
                                                variant="compact"
                                                type="number"
                                                value={config.rsiPeriod}
                                                onChange={(e) => handleChange('rsiPeriod', parseInt(e.target.value))}
                                                min="1"
                                            />
                                        </CompactField>

                                        <CompactField label="Overbought">
                                            <Input
                                                variant="compact"
                                                type="number"
                                                value={config.rsiOverbought}
                                                onChange={(e) => handleChange('rsiOverbought', parseInt(e.target.value))}
                                                min="50"
                                                max="100"
                                            />
                                        </CompactField>

                                        <CompactField label="Oversold">
                                            <Input
                                                variant="compact"
                                                type="number"
                                                value={config.rsiOversold}
                                                onChange={(e) => handleChange('rsiOversold', parseInt(e.target.value))}
                                                min="0"
                                                max="50"
                                            />
                                        </CompactField>
                                    </CompactFormSection>
                                </FormSection>
                            </FormContainer>
                        )}

                        {/* Account Settings Tab */}
                        {activeTab === 'account' && (
                            <FormContainer maxWidth="xl">
                                <FormSection
                                    title="Account Settings"
                                    description="Configure account mode and automation preferences"
                                    variant="elevated"
                                    icon={<Settings className="w-5 h-5 text-[#2F6BFF]" />}
                                >
                                    <FormField
                                        label="Account Mode"
                                        htmlFor="accountMode"
                                        required
                                        helpText="Choose between demo and live trading"
                                        compact
                                    >
                                        <Select
                                            id="accountMode"
                                            value={config.accountMode}
                                            onChange={(e) => handleChange('accountMode', e.target.value)}
                                        >
                                            <option value="demo">Demo Account</option>
                                            <option value="live">Live Account</option>
                                        </Select>
                                    </FormField>

                                    <Divider label="Automation" />

                                    <Toggle
                                        checked={config.autoRestart}
                                        onChange={(checked) => handleChange('autoRestart', checked)}
                                        label="Auto Restart on Error"
                                        description="Automatically restart the bot if an error occurs"
                                    />

                                    {config.accountMode === 'live' && (
                                        <>
                                            <Divider />
                                            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl animate-slideDown">
                                                <div className="flex items-start gap-3">
                                                    <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
                                                    <div>
                                                        <p className="text-sm font-medium text-red-200 mb-1">Live Trading Mode</p>
                                                        <p className="text-xs text-red-300">
                                                            Real money will be used for trades. Ensure you have tested your configuration thoroughly in demo mode.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </FormSection>
                            </FormContainer>
                        )}
                    </div>
                </div>
            </FormContainer>
        </PageContainer>
    );
}
