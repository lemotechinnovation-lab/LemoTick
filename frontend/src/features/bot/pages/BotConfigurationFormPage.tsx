/* eslint-disable @typescript-eslint/no-explicit-any */
import { QUERY_KEYS } from '@/config/constants'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Activity, AlertTriangle, ChevronDown, ChevronUp, Save, Settings as SettingsIcon, Shield, TrendingUp, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { botConfigService } from '../services/botService'
import type { BotConfig } from '../types/botConfig.types'
import { configToYaml, getDefaultConfig, parseYamlToConfig } from '../utils/configParser'

export default function BotConfigurationFormPage() {
    const queryClient = useQueryClient()
    const [config, setConfig] = useState<Partial<BotConfig>>(getDefaultConfig())
    const [originalYaml, setOriginalYaml] = useState<string>('')
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['trading']))

    // Fetch configuration
    const { data, isLoading, error } = useQuery({
        queryKey: QUERY_KEYS.BOT_CONFIG,
        queryFn: () => botConfigService.getConfigurationRaw(),
    })

    // Parse YAML to form data when loaded
    useEffect(() => {
        if (data?.yaml) {
            setOriginalYaml(data.yaml)
            const parsed = parseYamlToConfig(data.yaml)
            setConfig({ ...getDefaultConfig(), ...parsed })
        }
    }, [data])

    // Update configuration mutation
    const updateMutation = useMutation({
        mutationFn: async () => {
            console.log('Mutation started')
            const updatedYaml = configToYaml(config, originalYaml)
            console.log('Updated YAML to send:', updatedYaml.substring(0, 200) + '...')
            const result = await botConfigService.updateConfiguration({ yaml: updatedYaml })
            console.log('Backend response:', result)
            return result
        },
        onSuccess: (result) => {
            console.log('Success callback:', result)
            if (result.success) {
                toast.success(result.message || 'Configuration saved successfully!')
                queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BOT_CONFIG })
            } else {
                toast.error(result.message || 'Failed to save configuration')
            }
        },
        onError: (error: Error) => {
            console.error('Error callback:', error)
            toast.error(error.message || 'Failed to update configuration')
        },
    })

    const toggleSection = (section: string) => {
        const newExpanded = new Set(expandedSections)
        if (newExpanded.has(section)) {
            newExpanded.delete(section)
        } else {
            newExpanded.add(section)
        }
        setExpandedSections(newExpanded)
    }

    const handleSave = () => {
        console.log('Saving configuration...', config)
        console.log('Original YAML:', originalYaml)
        updateMutation.mutate()
    }

    const updateField = (section: keyof BotConfig, field: string, value: any) => {
        setConfig(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }))
    }

    const updateNestedField = (section: keyof BotConfig, subsection: string, field: string, value: any) => {
        setConfig(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [subsection]: {
                    ...(prev[section] as any)?.[subsection],
                    [field]: value
                }
            }
        }))
    }

    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="text-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading configuration...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="rounded-lg bg-red-50 p-4">
                <p className="text-red-600">Error loading configuration: {(error as Error).message}</p>
            </div>
        )
    }

    const sections = [
        {
            id: 'trading',
            title: 'Trading Settings',
            icon: TrendingUp,
            description: 'Configure symbol, stakes, and trade parameters',
            color: 'green'
        },
        {
            id: 'strategy',
            title: 'Strategy Configuration',
            icon: Activity,
            description: 'Choose and configure your trading strategies',
            color: 'purple'
        },
        {
            id: 'risk_management',
            title: 'Risk Management',
            icon: Shield,
            description: 'Set risk controls and protective limits',
            color: 'red'
        },
        {
            id: 'indicators',
            title: 'Technical Indicators',
            icon: SettingsIcon,
            description: 'Fine-tune EMA, RSI, MACD, and other indicators',
            color: 'yellow'
        },
        {
            id: 'account_mode',
            title: 'Account Mode',
            icon: User,
            description: 'Switch between demo and live trading',
            color: 'orange'
        },
    ]

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Bot Configuration</h1>
                    <p className="text-gray-600 mt-1">Configure your trading bot with an easy-to-use form</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={updateMutation.isPending}
                    className="flex items-center space-x-2 rounded-lg bg-primary-600 px-6 py-3 text-white hover:bg-primary-700 disabled:opacity-50 shadow-lg hover:shadow-xl transition-all"
                >
                    <Save className="h-5 w-5" />
                    <span className="font-semibold">{updateMutation.isPending ? 'Saving...' : 'Save Configuration'}</span>
                </button>
            </div>

            {/* Warning Banner */}
            <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-4">
                <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div>
                        <h3 className="font-semibold text-yellow-900">Important</h3>
                        <p className="text-sm text-yellow-800 mt-1">
                            Configuration changes require a bot restart to take effect. Make sure to stop the bot before making changes,
                            and restart it after saving.
                        </p>
                    </div>
                </div>
            </div>

            {/* Configuration Sections */}
            <div className="space-y-4">
                {sections.map((section) => {
                    const Icon = section.icon
                    const isExpanded = expandedSections.has(section.id)

                    return (
                        <div key={section.id} className="rounded-lg border border-gray-200 bg-white overflow-hidden">
                            {/* Section Header */}
                            <button
                                onClick={() => toggleSection(section.id)}
                                className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-center space-x-4">
                                    <div className={`rounded-lg bg-${section.color}-100 p-3`}>
                                        <Icon className={`h-6 w-6 text-${section.color}-600`} />
                                    </div>
                                    <div className="text-left">
                                        <h2 className="text-lg font-semibold text-gray-900">{section.title}</h2>
                                        <p className="text-sm text-gray-600">{section.description}</p>
                                    </div>
                                </div>
                                {isExpanded ? (
                                    <ChevronUp className="h-5 w-5 text-gray-400" />
                                ) : (
                                    <ChevronDown className="h-5 w-5 text-gray-400" />
                                )}
                            </button>

                            {/* Section Content */}
                            {isExpanded && (
                                <div className="border-t border-gray-200 p-6 bg-gray-50">
                                    {renderSectionContent(section.id, config, updateField, updateNestedField)}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Save Button (Sticky) */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg md:left-64">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                        Don't forget to restart the bot after saving changes
                    </p>
                    <button
                        onClick={handleSave}
                        disabled={updateMutation.isPending}
                        className="flex items-center space-x-2 rounded-lg bg-primary-600 px-6 py-3 text-white hover:bg-primary-700 disabled:opacity-50 shadow-lg hover:shadow-xl transition-all"
                    >
                        <Save className="h-5 w-5" />
                        <span className="font-semibold">{updateMutation.isPending ? 'Saving...' : 'Save Configuration'}</span>
                    </button>
                </div>
            </div>
        </div>
    )
}

// Render section content based on section ID
function renderSectionContent(
    sectionId: string,
    config: Partial<BotConfig>,
    updateField: (section: keyof BotConfig, field: string, value: any) => void,
    updateNestedField: (section: keyof BotConfig, subsection: string, field: string, value: any) => void
) {
    switch (sectionId) {
        case 'trading':
            return <TradingSettingsForm config={config.trading} updateField={(f: string, v: any) => updateField('trading', f, v)} />
        case 'strategy':
            return <StrategySettingsForm config={config.strategy} updateField={(f: string, v: any) => updateField('strategy', f, v)} updateNestedField={(sub: string, f: string, v: any) => updateNestedField('strategy', sub, f, v)} />
        case 'risk_management':
            return <RiskManagementForm config={config.risk_management} updateField={(f: string, v: any) => updateField('risk_management', f, v)} />
        case 'indicators':
            return <IndicatorsForm config={config.indicators} updateField={(f: string, v: any) => updateField('indicators', f, v)} />
        case 'account_mode':
            return <AccountModeForm config={config.account_mode} updateField={(f: string, v: any) => updateField('account_mode', f, v)} />
        default:
            return null
    }
}

// Form Components for each section
function TradingSettingsForm({ config, updateField }: any) {
    return (
        <div className="space-y-6">
            {/* Basic Trading Setup */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-lg">📊</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Basic Setup</h3>
                </div>
                <p className="text-sm text-gray-600 mb-5 ml-10">Configure your primary trading parameters</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-3">
                        <FormSelect
                            label="Trading Symbol"
                            value={config?.symbol || 'R_100'}
                            options={['R_100', 'R_75', 'R_50', 'R_25', 'R_200', 'frxEURUSD', 'frxGBPUSD', 'frxUSDJPY']}
                            onChange={(v) => updateField('symbol', v)}
                            help="Choose which market to trade"
                        />
                        <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm font-semibold text-blue-900 mb-2">📊 Symbol Guide:</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-blue-800">
                                <div><strong>R_100:</strong> Volatility 100 Index (1 tick/second) - Most popular</div>
                                <div><strong>R_75:</strong> Volatility 75 Index (1 tick/1.2s) - Medium volatility</div>
                                <div><strong>R_50:</strong> Volatility 50 Index (1 tick/2s) - Lower volatility</div>
                                <div><strong>R_25:</strong> Volatility 25 Index (1 tick/4s) - Lowest volatility</div>
                                <div><strong>R_200:</strong> Volatility 200 Index (Very high volatility)</div>
                                <div><strong>frxEURUSD:</strong> Euro vs US Dollar (Forex)</div>
                                <div><strong>frxGBPUSD:</strong> British Pound vs US Dollar (Forex)</div>
                                <div><strong>frxUSDJPY:</strong> US Dollar vs Japanese Yen (Forex)</div>
                            </div>
                            <p className="text-xs text-blue-700 mt-3 italic">💡 Tip: Start with R_100 for beginners - it's the most liquid and has consistent tick frequency</p>
                        </div>
                    </div>
                    <div>
                        <FormNumber
                            label="Contract Duration (minutes)"
                            value={config?.contract_duration || 3}
                            onChange={(v) => updateField('contract_duration', v)}
                            min={1}
                            max={60}
                            help="How long each trade lasts (1-60 minutes)"
                        />
                    </div>
                    <div>
                        <FormSelect
                            label="Contract Basis"
                            value={config?.contract_basis || 'stake'}
                            options={['stake', 'payout']}
                            onChange={(v) => updateField('contract_basis', v)}
                            help="Stake = amount you risk, Payout = amount you win"
                        />
                    </div>
                </div>
            </div>

            {/* Stake Configuration */}
            <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-lg font-bold">R</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Stake Configuration</h3>
                </div>
                <p className="text-sm text-gray-600 mb-5 ml-10">Set your trading amounts (in Rands)</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormNumber
                        label="Base Stake (R)"
                        value={config?.base_stake || 1}
                        onChange={(v) => updateField('base_stake', v)}
                        min={0.1}
                        step={0.1}
                        help="Your normal trade amount"
                    />
                    <FormNumber
                        label="Min Stake (R)"
                        value={config?.min_stake || 1}
                        onChange={(v) => updateField('min_stake', v)}
                        min={0.1}
                        step={0.1}
                        help="Smallest allowed trade"
                    />
                    <FormNumber
                        label="Max Stake (R)"
                        value={config?.max_stake || 25}
                        onChange={(v) => updateField('max_stake', v)}
                        min={1}
                        help="Largest allowed trade"
                    />
                </div>
            </div>

            {/* Risk Parameters */}
            <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-lg">⚠️</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Risk & Protection</h3>
                </div>
                <p className="text-sm text-gray-600 mb-5 ml-10">Protect your account with automatic limits</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <FormNumber
                        label="Risk Per Trade (%)"
                        value={(config?.risk_per_trade || 0.03) * 100}
                        onChange={(v) => updateField('risk_per_trade', v / 100)}
                        min={1}
                        max={10}
                        step={0.1}
                        help="Percentage of your balance per trade"
                    />
                    <FormNumber
                        label="Max Daily Loss (R)"
                        value={config?.max_daily_loss || 20}
                        onChange={(v) => updateField('max_daily_loss', v)}
                        min={1}
                        help="Bot stops trading after losing this much today"
                    />
                    <FormNumber
                        label="Emergency Stop Loss (R)"
                        value={config?.emergency_stop_loss || 50}
                        onChange={(v) => updateField('emergency_stop_loss', v)}
                        min={1}
                        help="Emergency stop - bot shuts down at this loss"
                    />
                    <FormNumber
                        label="Take Profit (%)"
                        value={(config?.take_profit_pct || 0) * 100}
                        onChange={(v) => updateField('take_profit_pct', v / 100)}
                        min={0}
                        max={100}
                        step={1}
                        help="Automatically close trade when reaching this profit"
                    />
                    <FormNumber
                        label="Stop Loss (%)"
                        value={(config?.stop_loss_pct || 0.2) * 100}
                        onChange={(v) => updateField('stop_loss_pct', v / 100)}
                        min={0}
                        max={100}
                        step={1}
                        help="Automatically close trade when reaching this loss"
                    />
                    <FormNumber
                        label="Max Concurrent Trades"
                        value={config?.max_concurrent_trades || 999}
                        onChange={(v) => updateField('max_concurrent_trades', v)}
                        min={1}
                        help="How many trades can be open at once"
                    />
                </div>
            </div>

            {/* Early Closure */}
            <div className="bg-emerald-50 border-2 border-emerald-300 rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-lg">⏱️</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Early Closure Settings</h3>
                </div>
                <p className="text-sm text-gray-600 mb-5 ml-10">Close trades before expiry to lock in profits or cut losses</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormCheckbox
                        label="Enable Early Closure"
                        checked={config?.early_closure_enabled || false}
                        onChange={(v) => updateField('early_closure_enabled', v)}
                        help="Allow bot to close trades before expiry"
                    />
                    <FormNumber
                        label="Min Profit Threshold (%)"
                        value={(config?.min_profit_threshold || 0.5) * 100}
                        onChange={(v) => updateField('min_profit_threshold', v / 100)}
                        min={0}
                        max={100}
                        step={1}
                        help="Close early when profit reaches this %"
                    />
                    <FormNumber
                        label="Max Loss Threshold (%)"
                        value={(config?.max_loss_threshold || 0.2) * 100}
                        onChange={(v) => updateField('max_loss_threshold', v / 100)}
                        min={0}
                        max={100}
                        step={1}
                        help="Close early when loss reaches this %"
                    />
                </div>
            </div>
        </div>
    )
}

function StrategySettingsForm({ config, updateField, updateNestedField }: any) {
    return (
        <div className="space-y-6">
            {/* Candlestick Strategy */}
            <div className="border-2 border-purple-200 rounded-xl p-6 bg-purple-50 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-lg">📈</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Candlestick Strategy</h3>
                </div>
                <p className="text-sm text-gray-600 mb-5 ml-10">Configure candlestick pattern detection</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <FormCheckbox
                        label="Enable Strategy"
                        checked={config?.candlestick_strategy?.enabled || false}
                        onChange={(v) => updateNestedField('candlestick_strategy', 'enabled', v)}
                        help="Use candlestick pattern detection"
                    />
                    <FormNumber
                        label="Min Confidence (%)"
                        value={(config?.candlestick_strategy?.min_pattern_confidence || 0.55) * 100}
                        onChange={(v) => updateNestedField('candlestick_strategy', 'min_pattern_confidence', v / 100)}
                        min={0}
                        max={100}
                        step={1}
                        help="Minimum pattern confidence"
                    />
                    <FormNumber
                        label="Quality Threshold (%)"
                        value={(config?.candlestick_strategy?.quality_threshold || 0.55) * 100}
                        onChange={(v) => updateNestedField('candlestick_strategy', 'quality_threshold', v / 100)}
                        min={0}
                        max={100}
                        step={1}
                        help="Signal quality threshold"
                    />
                    <FormNumber
                        label="Ticks Per Candle"
                        value={config?.candlestick_strategy?.ticks_per_candle || 5}
                        onChange={(v) => updateNestedField('candlestick_strategy', 'ticks_per_candle', v)}
                        min={1}
                        max={20}
                        help="Number of ticks per candle"
                    />
                    <FormNumber
                        label="Close After Candles"
                        value={config?.candlestick_strategy?.candlestick_close_after_candles || 2}
                        onChange={(v) => updateNestedField('candlestick_strategy', 'candlestick_close_after_candles', v)}
                        min={1}
                        max={10}
                        help="Close position after N candles"
                    />
                    <FormCheckbox
                        label="Require Trend Confirmation"
                        checked={config?.candlestick_strategy?.require_trend_confirmation || false}
                        onChange={(v) => updateNestedField('candlestick_strategy', 'require_trend_confirmation', v)}
                        help="Require trend alignment"
                    />
                    <FormCheckbox
                        label="Require Momentum Confirmation"
                        checked={config?.candlestick_strategy?.require_momentum_confirmation || false}
                        onChange={(v) => updateNestedField('candlestick_strategy', 'require_momentum_confirmation', v)}
                        help="Require momentum alignment"
                    />
                </div>
            </div>

            {/* Other Strategies */}
            <div className="border-2 border-indigo-200 rounded-xl p-6 bg-indigo-50 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-lg">🎯</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Additional Strategies</h3>
                </div>
                <p className="text-sm text-gray-600 mb-5 ml-10">Enable additional trading strategies</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormCheckbox
                        label="Enable Fibonacci"
                        checked={config?.fibonacci_enabled || false}
                        onChange={(v) => updateField('fibonacci_enabled', v)}
                        help="Use Fibonacci retracement levels"
                    />
                    <FormNumber
                        label="Fibonacci Confidence Boost (%)"
                        value={(config?.fibonacci_confidence_boost || 0.15) * 100}
                        onChange={(v) => updateField('fibonacci_confidence_boost', v / 100)}
                        min={0}
                        max={50}
                        step={1}
                        help="Confidence boost near Fib levels"
                    />
                    <FormCheckbox
                        label="Enable Mean Reversion"
                        checked={config?.mean_reversion_enabled || false}
                        onChange={(v) => updateField('mean_reversion_enabled', v)}
                        help="Trade mean reversion opportunities"
                    />
                    <FormCheckbox
                        label="Enable Tick Pattern"
                        checked={config?.tick_pattern_enabled || false}
                        onChange={(v) => updateField('tick_pattern_enabled', v)}
                        help="Use tick pattern analysis"
                    />
                </div>
            </div>
        </div>
    )
}

function RiskManagementForm({ config, updateField }: any) {
    return (
        <div className="space-y-6">
            {/* Main Risk Settings */}
            <div className="border-2 border-red-200 rounded-xl p-6 bg-red-50 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-lg">🛡️</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Risk Controls</h3>
                </div>
                <p className="text-sm text-gray-600 mb-5 ml-10">Set trading limits and controls</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <FormNumber
                        label="Risk Per Trade (%)"
                        value={(config?.risk_per_trade || 0.03) * 100}
                        onChange={(v) => updateField('risk_per_trade', v / 100)}
                        min={0.1}
                        max={10}
                        step={0.1}
                        help="% of equity to risk per trade"
                    />
                    <FormNumber
                        label="Max Daily Drawdown (%)"
                        value={(config?.max_daily_drawdown || 0.3) * 100}
                        onChange={(v) => updateField('max_daily_drawdown', v / 100)}
                        min={1}
                        max={100}
                        step={1}
                        help="Maximum daily drawdown allowed"
                    />
                    <FormNumber
                        label="Max Concurrent Trades"
                        value={config?.max_concurrent_trades || 1}
                        onChange={(v) => updateField('max_concurrent_trades', v)}
                        min={1}
                        max={10}
                        help="Maximum simultaneous positions"
                    />
                    <FormNumber
                        label="Cooldown (seconds)"
                        value={config?.cooldown_seconds || 0}
                        onChange={(v) => updateField('cooldown_seconds', v)}
                        min={0}
                        max={300}
                        help="Wait time between trades"
                    />
                    <FormNumber
                        label="Daily Loss Limit (R)"
                        value={config?.daily_loss_limit || 99999}
                        onChange={(v) => updateField('daily_loss_limit', v)}
                        min={1}
                        help="Stop after this daily loss"
                    />
                    <FormNumber
                        label="Daily Trade Limit"
                        value={config?.daily_trade_limit || 99999}
                        onChange={(v) => updateField('daily_trade_limit', v)}
                        min={1}
                        help="Maximum trades per day"
                    />
                </div>
            </div>

            {/* Protection Settings */}
            <div className="border-2 border-orange-200 rounded-xl p-6 bg-orange-50 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-lg">🔒</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Protection Settings</h3>
                </div>
                <p className="text-sm text-gray-600 mb-5 ml-10">Advanced safety mechanisms</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <FormCheckbox
                        label="Force Always Trade"
                        checked={config?.force_always_trade || false}
                        onChange={(v) => updateField('force_always_trade', v)}
                        help="Bypass risk controls for 24/7 trading"
                    />
                    <FormCheckbox
                        label="Win Rate Protection"
                        checked={config?.win_rate_protection_enabled || false}
                        onChange={(v) => updateField('win_rate_protection_enabled', v)}
                        help="Stop if win rate drops too low"
                    />
                    <FormNumber
                        label="Min Win Rate (%)"
                        value={(config?.min_win_rate_threshold || 0.5) * 100}
                        onChange={(v) => updateField('min_win_rate_threshold', v / 100)}
                        min={0}
                        max={100}
                        step={1}
                        help="Minimum required win rate"
                    />
                    <FormCheckbox
                        label="Circuit Breaker"
                        checked={config?.circuit_breaker_enabled || false}
                        onChange={(v) => updateField('circuit_breaker_enabled', v)}
                        help="Stop after consecutive losses"
                    />
                    <FormNumber
                        label="Circuit Breaker Losses"
                        value={config?.circuit_breaker_losses || 10}
                        onChange={(v) => updateField('circuit_breaker_losses', v)}
                        min={3}
                        max={20}
                        help="Consecutive losses to trigger"
                    />
                    <FormCheckbox
                        label="Equity Protection"
                        checked={config?.equity_protection_enabled || false}
                        onChange={(v) => updateField('equity_protection_enabled', v)}
                        help="Protect against equity drawdown"
                    />
                    <FormNumber
                        label="Max Equity Drawdown (%)"
                        value={(config?.max_equity_drawdown || 0.1) * 100}
                        onChange={(v) => updateField('max_equity_drawdown', v / 100)}
                        min={1}
                        max={50}
                        step={1}
                        help="Maximum equity drawdown %"
                    />
                </div>
            </div>
        </div>
    )
}

function IndicatorsForm({ config, updateField }: any) {
    return (
        <div className="space-y-6">
            <div className="border-2 border-yellow-200 rounded-xl p-6 bg-yellow-50 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm font-bold">EMA</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">EMA (Exponential Moving Average)</h3>
                </div>
                <p className="text-sm text-gray-600 mb-5 ml-10">Configure moving average periods</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormNumber
                        label="Short Period"
                        value={config?.ema_short_period || 6}
                        onChange={(v) => updateField('ema_short_period', v)}
                        min={1}
                        max={50}
                        help="Fast EMA period"
                    />
                    <FormNumber
                        label="Medium Period"
                        value={config?.ema_medium_period || 18}
                        onChange={(v) => updateField('ema_medium_period', v)}
                        min={1}
                        max={100}
                        help="Medium EMA period"
                    />
                    <FormNumber
                        label="Long Period"
                        value={config?.ema_long_period || 50}
                        onChange={(v) => updateField('ema_long_period', v)}
                        min={1}
                        max={200}
                        help="Slow EMA period"
                    />
                </div>
            </div>

            <div className="border-2 border-cyan-200 rounded-xl p-6 bg-cyan-50 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm font-bold">RSI</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">RSI (Relative Strength Index)</h3>
                </div>
                <p className="text-sm text-gray-600 mb-5 ml-10">Configure RSI thresholds</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormNumber
                        label="RSI Period"
                        value={config?.rsi_period || 14}
                        onChange={(v) => updateField('rsi_period', v)}
                        min={2}
                        max={50}
                        help="RSI calculation period"
                    />
                    <FormNumber
                        label="Overbought Level"
                        value={config?.rsi_overbought || 70}
                        onChange={(v) => updateField('rsi_overbought', v)}
                        min={50}
                        max={90}
                        help="RSI overbought threshold"
                    />
                    <FormNumber
                        label="Oversold Level"
                        value={config?.rsi_oversold || 30}
                        onChange={(v) => updateField('rsi_oversold', v)}
                        min={10}
                        max={50}
                        help="RSI oversold threshold"
                    />
                </div>
            </div>

            <div className="border-2 border-teal-200 rounded-xl p-6 bg-teal-50 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-xs font-bold">MACD</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">MACD</h3>
                </div>
                <p className="text-sm text-gray-600 mb-5 ml-10">Configure MACD parameters</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormNumber
                        label="Fast Period"
                        value={config?.macd_fast || 12}
                        onChange={(v) => updateField('macd_fast', v)}
                        min={2}
                        max={50}
                        help="MACD fast EMA period"
                    />
                    <FormNumber
                        label="Slow Period"
                        value={config?.macd_slow || 26}
                        onChange={(v) => updateField('macd_slow', v)}
                        min={2}
                        max={100}
                        help="MACD slow EMA period"
                    />
                    <FormNumber
                        label="Signal Period"
                        value={config?.macd_signal || 9}
                        onChange={(v) => updateField('macd_signal', v)}
                        min={2}
                        max={50}
                        help="MACD signal line period"
                    />
                </div>
            </div>

            <div className="border-2 border-slate-200 rounded-xl p-6 bg-slate-50 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-slate-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-lg">📉</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Other Indicators</h3>
                </div>
                <p className="text-sm text-gray-600 mb-5 ml-10">Additional technical indicators</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormNumber
                        label="ATR Period"
                        value={config?.atr_period || 14}
                        onChange={(v) => updateField('atr_period', v)}
                        min={2}
                        max={50}
                        help="Average True Range period"
                    />
                    <FormNumber
                        label="Bollinger Bands Period"
                        value={config?.bb_period || 20}
                        onChange={(v) => updateField('bb_period', v)}
                        min={2}
                        max={100}
                        help="BB calculation period"
                    />
                    <FormNumber
                        label="BB Standard Deviation"
                        value={config?.bb_std_dev || 2}
                        onChange={(v) => updateField('bb_std_dev', v)}
                        min={0.5}
                        max={4}
                        step={0.1}
                        help="BB standard deviation multiplier"
                    />
                </div>
            </div>
        </div>
    )
}

function AccountModeForm({ config, updateField }: any) {
    return (
        <div className="space-y-6">
            <div className="rounded-lg border-2 border-red-300 bg-red-50 p-6">
                <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-6 w-6 text-red-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                        <h3 className="font-semibold text-red-900 text-lg mb-2">⚠️ Critical Setting</h3>
                        <p className="text-sm text-red-800 mb-4">
                            Switching to live trading mode will use real money. Make sure you understand the risks and have thoroughly
                            tested your strategy in demo mode first.
                        </p>

                        <div className="space-y-4 mt-6">
                            <FormCheckbox
                                label="Enable Live Trading"
                                checked={config?.use_live_account || false}
                                onChange={(v) => updateField('use_live_account', v)}
                                help="Switch from demo to live (real money)"
                            />
                            <FormCheckbox
                                label="Require Explicit Confirmation"
                                checked={config?.require_explicit_confirmation !== false}
                                onChange={(v) => updateField('require_explicit_confirmation', v)}
                                help="Require confirmation before live trades"
                            />
                        </div>

                        {config?.use_live_account && (
                            <div className="mt-4 p-4 bg-red-100 rounded-lg border border-red-300">
                                <p className="text-sm font-semibold text-red-900">
                                    ⚠️ LIVE MODE ENABLED - Trading with real money!
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

// Reusable Form Components
interface FormNumberProps {
    label: string
    value: number
    onChange: (value: number) => void
    min?: number
    max?: number
    step?: number
    help?: string
}

interface FormSelectProps {
    label: string
    value: string
    options: string[]
    onChange: (value: string) => void
    help?: string
}

interface FormCheckboxProps {
    label: string
    checked: boolean
    onChange: (value: boolean) => void
    help?: string
}

function FormNumber({ label, value, onChange, min, max, step, help }: FormNumberProps) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
            </label>
            <input
                type="number"
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                min={min}
                max={max}
                step={step || 1}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:outline-none"
            />
            {help && <p className="text-xs text-gray-500 mt-1">{help}</p>}
        </div>
    )
}

function FormSelect({ label, value, options, onChange, help }: FormSelectProps) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
            </label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:outline-none"
            >
                {options.map((opt: string) => (
                    <option key={opt} value={opt}>
                        {opt}
                    </option>
                ))}
            </select>
            {help && <p className="text-xs text-gray-500 mt-1">{help}</p>}
        </div>
    )
}

function FormCheckbox({ label, checked, onChange, help }: FormCheckboxProps) {
    return (
        <div className="flex items-start">
            <div className="flex items-center h-5">
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-2 focus:ring-primary-500"
                />
            </div>
            <div className="ml-3">
                <label className="text-sm font-medium text-gray-700">
                    {label}
                </label>
                {help && <p className="text-xs text-gray-500 mt-0.5">{help}</p>}
            </div>
        </div>
    )
}

