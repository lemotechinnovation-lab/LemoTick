// Enhanced Bot Configuration Form - Compact 2026 Design
// Glass-morphism, animated backgrounds, fits without scrolling

import { GlassCard, StatCard } from '@/components/ui/DesignSystem';
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
import { PageContainer, Stack } from '@/components/ui/PageLayoutEnhanced';
import { Activity, AlertCircle, Bot, DollarSign, Percent, Save, Settings, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface BotConfig {
    symbol: string;
    contractDuration: number;
    stakeAmount: number;
    maxDailyLoss: number;
    maxDailyProfit: number;
    strategy: string;
    confidenceThreshold: number;
    stopLossPercentage: number;
    takeProfitPercentage: number;
    maxConcurrentTrades: number;
    emaShort: number;
    emaLong: number;
    rsiPeriod: number;
    rsiOverbought: number;
    rsiOversold: number;
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
        <PageContainer maxWidth="xl" className="fade-in-up relative overflow-hidden">
            {/* Animated Background Effects */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-brand-blue/15 via-purple-500/10 to-transparent rounded-full blur-3xl animate-pulse-slow pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-accent-orange/10 via-pink-500/5 to-transparent rounded-full blur-3xl animate-pulse-slow pointer-events-none" style={{ animationDelay: '1s' }}></div>

            <PageHeader
                title="BOT CONFIGURATION"
                description="Configure trading bot settings and parameters"
                icon={Bot}
                actions={
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-blue to-[#3B82F6] hover:from-[#3B82F6] hover:to-brand-blue text-white transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-brand-blue/50 text-sm font-semibold disabled:opacity-50 group relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                        <Save className={`w-4 h-4 relative z-10 ${isSaving ? 'animate-spin' : ''}`} />
                        <span className="relative z-10">{isSaving ? 'Saving...' : 'Save Configuration'}</span>
                    </button>
                }
            />

            <Stack spacing="lg" className="relative z-10">
                {/* Configuration Summary Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up">
                    <StatCard
                        icon={<DollarSign className="w-6 h-6" />}
                        value={`$${config.stakeAmount}`}
                        label="Stake Amount"
                        variant="green"
                        delay={0}
                    />
                    <StatCard
                        icon={<TrendingUp className="w-6 h-6" />}
                        value={`${config.confidenceThreshold}%`}
                        label="Confidence Level"
                        variant="blue"
                        delay={100}
                    />
                    <StatCard
                        icon={<Activity className="w-6 h-6" />}
                        value={config.maxConcurrentTrades.toString()}
                        label="Max Concurrent"
                        variant="purple"
                        delay={200}
                    />
                    <StatCard
                        icon={<Settings className="w-6 h-6" />}
                        value={config.accountMode === 'live' ? '🔴 LIVE' : '🎮 DEMO'}
                        label="Account Mode"
                        variant={config.accountMode === 'live' ? 'red' : 'orange'}
                        delay={300}
                    />
                </div>

                {/* Compact Tabs */}
                <GlassCard className="p-0 overflow-hidden smooth-hover border border-brand-blue/30 shadow-2xl shadow-brand-blue/10 backdrop-blur-xl relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-blue/5 via-transparent to-accent-orange/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                    <div className="flex border-b border-brand-blue/30 bg-gradient-to-r from-brand-blue/10 via-transparent to-purple-500/10 relative z-10">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold transition-all relative overflow-hidden group/tab ${isActive
                                        ? 'bg-gradient-to-r from-brand-blue/20 to-purple-500/10 text-white border-b-2 border-brand-blue'
                                        : 'text-gray-400 hover:text-white hover:bg-brand-blue/10'
                                        }`}
                                >
                                    {isActive && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-brand-blue/10 via-transparent to-purple-500/10 opacity-0 group-hover/tab:opacity-100 transition-opacity pointer-events-none"></div>
                                    )}
                                    <div className={`relative w-8 h-8 rounded-lg flex items-center justify-center shadow-lg border transition-all duration-300 ${isActive
                                        ? 'bg-gradient-to-br from-brand-blue/30 to-purple-500/30 border-brand-blue/40 group-hover/tab:scale-110'
                                        : 'bg-gray-500/10 border-gray-500/30 group-hover/tab:bg-brand-blue/20 group-hover/tab:border-brand-blue/30'
                                        }`}>
                                        <Icon className={`w-4 h-4 transition-all duration-300 relative z-10 ${isActive ? 'text-brand-blue' : 'text-gray-400 group-hover/tab:text-brand-blue'}`} />
                                        {isActive && (
                                            <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/20 to-transparent opacity-0 group-hover/tab:opacity-100 transition-opacity rounded-lg pointer-events-none"></div>
                                        )}
                                    </div>
                                    <span className="relative z-10">{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Tab Content - Compact */}
                    <div className="p-6 relative z-10">
                        {activeTab === 'trading' && (
                            <FormContainer maxWidth="xl" className="animate-fade-in-up">
                                <FormSection
                                    title="Trading Parameters"
                                    description="Configure basic trading settings"
                                    variant="elevated"
                                    icon={<DollarSign className="w-4 h-4 text-green-400" />}
                                    className="relative group/section"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover/section:opacity-100 transition-opacity duration-500 rounded-xl pointer-events-none -z-10"></div>
                                    <FormField label="Trading Symbol" htmlFor="symbol" required helpText="Select market symbol" compact>
                                        <Select id="symbol" value={config.symbol} onChange={(e) => handleChange('symbol', e.target.value)}>
                                            <option value="R_100">Volatility 100 Index</option>
                                            <option value="R_75">Volatility 75 Index</option>
                                            <option value="R_50">Volatility 50 Index</option>
                                            <option value="R_25">Volatility 25 Index</option>
                                        </Select>
                                    </FormField>

                                    <Divider label="Trade Settings" />

                                    <CompactFormSection title="Basic Parameters" columns={3}>
                                        <CompactField label="Duration">
                                            <Input variant="compact" type="number" value={config.contractDuration} onChange={(e) => handleChange('contractDuration', parseInt(e.target.value))} min="1" max="10" />
                                        </CompactField>
                                        <CompactField label="Stake (USD)">
                                            <Input variant="compact" type="number" value={config.stakeAmount} onChange={(e) => handleChange('stakeAmount', parseFloat(e.target.value))} min="1" step="0.01" icon={<DollarSign className="w-4 h-4" />} />
                                        </CompactField>
                                        <CompactField label="Max Concurrent">
                                            <Input variant="compact" type="number" value={config.maxConcurrentTrades} onChange={(e) => handleChange('maxConcurrentTrades', parseInt(e.target.value))} min="1" max="10" />
                                        </CompactField>
                                    </CompactFormSection>

                                    <Divider label="Daily Limits" />

                                    <CompactFormSection columns={2}>
                                        <CompactField label="Max Loss">
                                            <Input variant="compact" type="number" value={config.maxDailyLoss} onChange={(e) => handleChange('maxDailyLoss', parseFloat(e.target.value))} min="0" icon={<DollarSign className="w-4 h-4" />} />
                                        </CompactField>
                                        <CompactField label="Max Profit">
                                            <Input variant="compact" type="number" value={config.maxDailyProfit} onChange={(e) => handleChange('maxDailyProfit', parseFloat(e.target.value))} min="0" icon={<DollarSign className="w-4 h-4" />} />
                                        </CompactField>
                                    </CompactFormSection>
                                </FormSection>
                            </FormContainer>
                        )}

                        {activeTab === 'strategy' && (
                            <FormContainer maxWidth="xl" className="animate-fade-in-up">
                                <FormSection
                                    title="Strategy Configuration"
                                    description="Define trading strategy and risk rules"
                                    variant="elevated"
                                    icon={<TrendingUp className="w-4 h-4 text-brand-blue" />}
                                    className="relative group/section"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/5 to-transparent opacity-0 group-hover/section:opacity-100 transition-opacity duration-500 rounded-xl pointer-events-none -z-10"></div>
                                    <FormGrid columns={2} gap="md">
                                        <FormField label="Trading Strategy" htmlFor="strategy" required helpText="Select trading approach" compact>
                                            <Select id="strategy" value={config.strategy} onChange={(e) => handleChange('strategy', e.target.value)}>
                                                <option value="trend_following">Trend Following</option>
                                                <option value="mean_reversion">Mean Reversion</option>
                                                <option value="breakout">Breakout</option>
                                                <option value="scalping">Scalping</option>
                                            </Select>
                                        </FormField>
                                        <FormField label="Confidence (%)" htmlFor="confidenceThreshold" required helpText="Min confidence (50-100%)" compact>
                                            <Input id="confidenceThreshold" type="number" value={config.confidenceThreshold} onChange={(e) => handleChange('confidenceThreshold', parseInt(e.target.value))} min="50" max="100" icon={<Percent className="w-4 h-4" />} />
                                        </FormField>
                                    </FormGrid>

                                    <Divider label="Risk Management" />

                                    <CompactFormSection title="Exit Parameters" columns={2}>
                                        <CompactField label="Stop Loss (%)">
                                            <Input variant="compact" type="number" value={config.stopLossPercentage} onChange={(e) => handleChange('stopLossPercentage', parseFloat(e.target.value))} min="0" step="0.1" icon={<Percent className="w-4 h-4" />} />
                                        </CompactField>
                                        <CompactField label="Take Profit (%)">
                                            <Input variant="compact" type="number" value={config.takeProfitPercentage} onChange={(e) => handleChange('takeProfitPercentage', parseFloat(e.target.value))} min="0" step="0.1" icon={<Percent className="w-4 h-4" />} />
                                        </CompactField>
                                    </CompactFormSection>
                                </FormSection>
                            </FormContainer>
                        )}

                        {activeTab === 'indicators' && (
                            <FormContainer maxWidth="xl" className="animate-fade-in-up">
                                <FormSection
                                    title="Technical Indicators"
                                    description="Configure technical analysis parameters"
                                    variant="elevated"
                                    icon={<Activity className="w-4 h-4 text-purple-400" />}
                                    className="relative group/section"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover/section:opacity-100 transition-opacity duration-500 rounded-xl pointer-events-none -z-10"></div>
                                    <CompactFormSection title="Moving Averages (EMA)" columns={2}>
                                        <CompactField label="Short Period">
                                            <Input variant="compact" type="number" value={config.emaShort} onChange={(e) => handleChange('emaShort', parseInt(e.target.value))} min="1" />
                                        </CompactField>
                                        <CompactField label="Long Period">
                                            <Input variant="compact" type="number" value={config.emaLong} onChange={(e) => handleChange('emaLong', parseInt(e.target.value))} min="1" />
                                        </CompactField>
                                    </CompactFormSection>

                                    <Divider label="RSI Settings" />

                                    <CompactFormSection columns={3}>
                                        <CompactField label="RSI Period">
                                            <Input variant="compact" type="number" value={config.rsiPeriod} onChange={(e) => handleChange('rsiPeriod', parseInt(e.target.value))} min="1" />
                                        </CompactField>
                                        <CompactField label="Overbought">
                                            <Input variant="compact" type="number" value={config.rsiOverbought} onChange={(e) => handleChange('rsiOverbought', parseInt(e.target.value))} min="50" max="100" />
                                        </CompactField>
                                        <CompactField label="Oversold">
                                            <Input variant="compact" type="number" value={config.rsiOversold} onChange={(e) => handleChange('rsiOversold', parseInt(e.target.value))} min="0" max="50" />
                                        </CompactField>
                                    </CompactFormSection>
                                </FormSection>
                            </FormContainer>
                        )}

                        {activeTab === 'account' && (
                            <FormContainer maxWidth="xl" className="animate-fade-in-up">
                                <FormSection
                                    title="Account Settings"
                                    description="Configure account mode and automation"
                                    variant="elevated"
                                    icon={<Settings className="w-4 h-4 text-accent-orange" />}
                                    className="relative group/section"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-accent-orange/5 to-transparent opacity-0 group-hover/section:opacity-100 transition-opacity duration-500 rounded-xl pointer-events-none -z-10"></div>
                                    <FormField label="Account Mode" htmlFor="accountMode" required helpText="Choose demo or live trading" compact>
                                        <Select id="accountMode" value={config.accountMode} onChange={(e) => handleChange('accountMode', e.target.value)}>
                                            <option value="demo">Demo Account</option>
                                            <option value="live">Live Account</option>
                                        </Select>
                                    </FormField>

                                    <Divider label="Automation" />

                                    <Toggle
                                        checked={config.autoRestart}
                                        onChange={(checked) => handleChange('autoRestart', checked)}
                                        label="Auto Restart on Error"
                                        description="Automatically restart bot on error"
                                    />

                                    {config.accountMode === 'live' && (
                                        <>
                                            <Divider />
                                            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl animate-fade-in-up backdrop-blur-sm relative overflow-hidden group/warning smooth-hover shadow-xl shadow-red-500/10">
                                                <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent opacity-0 group-hover/warning:opacity-100 transition-opacity"></div>
                                                <div className="flex items-start gap-3 relative z-10">
                                                    <div className="relative w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center shadow-lg border border-red-500/30 shrink-0 group-hover/warning:scale-110 transition-transform">
                                                        <AlertCircle className="w-5 h-5 text-red-400 group-hover/warning:animate-pulse" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-red-200 mb-1 group-hover/warning:text-red-100 transition-colors">⚠️ Live Trading Mode</p>
                                                        <p className="text-xs text-red-300 leading-relaxed">Real money will be used. Test thoroughly in demo mode first. Ensure you understand all risks before proceeding.</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </FormSection>
                            </FormContainer>
                        )}
                    </div>
                </GlassCard>
            </Stack>
        </PageContainer>
    );
}


