import { GlassCard } from '@/components/ui/DesignSystem';
import { Bot, ChevronRight, Info, Percent, TrendingUp } from 'lucide-react';
import { useState } from 'react';

interface BotSettings {
    asset: string;
    assetChangeThreshold: number;
    initialAmount: number;
    duration: number;
    indicator: string;
    strategy: string;
    profitLimit: number;
}

interface BotSettingsPanelProps {
    onStartBot: (settings: BotSettings) => void;
}

export default function BotSettingsPanel({ onStartBot }: BotSettingsPanelProps) {
    const [settings, setSettings] = useState<BotSettings>({
        asset: 'R_100',
        assetChangeThreshold: 80,
        initialAmount: 10,
        duration: 60,
        indicator: 'close_price',
        strategy: 'optimal',
        profitLimit: 20,
    });

    const [showAssetSelector, setShowAssetSelector] = useState(false);
    const [showDurationSelector, setShowDurationSelector] = useState(false);
    const [showIndicatorSelector, setShowIndicatorSelector] = useState(false);
    const [showStrategySelector, setShowStrategySelector] = useState(false);
    const [showAssetInfo, setShowAssetInfo] = useState(false);
    const [isHoveringStart, setIsHoveringStart] = useState(false);

    const assets = [
        { id: 'R_100', correlation: 93 },
        { id: 'R_75', correlation: 88 },
        { id: 'R_50', correlation: 85 },
    ];

    const durations = [
        { value: 60, label: '1 min' },
        { value: 120, label: '2 min' },
        { value: 180, label: '3 min' },
        { value: 300, label: '5 min' },
    ];

    const indicators = [
        { id: 'close_price', name: 'Close price' },
        { id: 'rsi', name: 'RSI' },
        { id: 'macd', name: 'MACD' },
        { id: 'bollinger', name: 'Bollinger Bands' },
    ];

    const strategies = [
        { id: 'optimal', name: 'Optimal', risk: 'Medium risk', icon: '♟️' },
        { id: 'conservative', name: 'Conservative', risk: 'Low risk', icon: '🛡️' },
        { id: 'aggressive', name: 'Aggressive', risk: 'High risk', icon: '⚡' },
    ];

    const getAssetCorrelation = (assetId: string) => assets.find(a => a.id === assetId)?.correlation || 0;
    const getDurationLabel = (value: number) => durations.find(d => d.value === value)?.label || `${value}s`;
    const getIndicatorName = (id: string) => indicators.find(i => i.id === id)?.name || id;
    const getStrategyName = (id: string) => strategies.find(s => s.id === id)?.name || id;
    const getStrategyRisk = (id: string) => strategies.find(s => s.id === id)?.risk || '';

    return (
        <div className="w-full h-full flex flex-col p-1.5 space-y-1 overflow-hidden">
            {/* Enhanced Header - Micro Compact */}
            <div className="glass-card-elevated p-1.5 rounded-md border border-purple-500/30 shadow-lg shadow-purple-500/20 backdrop-blur-xl relative overflow-hidden group hover:border-purple-400/50 transition-all">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-accent-orange/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(168,85,247,0.1),transparent)]"></div>

                <div className="relative z-10 space-y-1">
                    {/* Title Section */}
                    <div className="flex items-center gap-1">
                        <div className="relative w-5 h-5 rounded-md bg-gradient-to-br from-purple-500/50 to-pink-500/50 flex items-center justify-center shadow-lg shadow-purple-500/40 border border-purple-400/30">
                            <Bot className="w-2.5 h-2.5 text-purple-300 drop-shadow-[0_0_6px_rgba(168,85,247,0.6)]" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-[9px] font-bold bg-gradient-to-r from-purple-300 via-pink-300 to-accent-orange bg-clip-text text-transparent truncate">
                                Trading Robots
                            </h1>
                        </div>
                    </div>

                    {/* Quick Stats Grid - Micro Compact */}
                    <div className="grid grid-cols-3 gap-0.5">
                        <div className="glass-card-elevated p-0.5 rounded-sm border border-purple-400/30 backdrop-blur-sm group/stat cursor-pointer hover:border-purple-400/50 transition-all bg-[radial-gradient(circle_at_50%_120%,rgba(168,85,247,0.15),transparent)]">
                            <div className="flex flex-col items-center">
                                <Bot className="w-2 h-2 text-purple-400 group-hover/stat:scale-110 transition-transform drop-shadow-[0_0_4px_rgba(168,85,247,0.6)]" />
                                <p className="text-[7px] text-gray-400 font-medium">Active</p>
                                <p className="text-[8px] font-bold text-purple-400 tabular-nums">0</p>
                            </div>
                        </div>
                        <div className="glass-card-elevated p-0.5 rounded-sm border border-green-400/30 backdrop-blur-sm group/stat cursor-pointer hover:border-green-400/50 transition-all bg-[radial-gradient(circle_at_50%_120%,rgba(34,197,94,0.15),transparent)]">
                            <div className="flex flex-col items-center">
                                <TrendingUp className="w-2 h-2 text-green-400 group-hover/stat:scale-110 transition-transform drop-shadow-[0_0_4px_rgba(34,197,94,0.6)]" />
                                <p className="text-[7px] text-gray-400 font-medium">Profit</p>
                                <p className="text-[8px] font-bold text-green-400 tabular-nums">$2.4K</p>
                            </div>
                        </div>
                        <div className="glass-card-elevated p-0.5 rounded-sm border border-brand-blue/30 backdrop-blur-sm group/stat cursor-pointer hover:border-brand-blue/50 transition-all bg-[radial-gradient(circle_at_50%_120%,rgba(59,130,246,0.15),transparent)]">
                            <div className="flex flex-col items-center">
                                <Percent className="w-2 h-2 text-brand-blue group-hover/stat:scale-110 transition-transform drop-shadow-[0_0_4px_rgba(59,130,246,0.6)]" />
                                <p className="text-[7px] text-gray-400 font-medium">Win</p>
                                <p className="text-[8px] font-bold text-brand-blue tabular-nums">72%</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Asset Selection - Micro Compact */}
            <div className="glass-card-elevated p-1 rounded-md border border-brand-blue/30 shadow-lg shadow-brand-blue/20 backdrop-blur-xl animate-fade-in-up relative hover:border-brand-blue/50 transition-all group">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(59,130,246,0.15),transparent)]"></div>
                <div className="flex items-center justify-between mb-0.5 relative z-10">
                    <label className="text-[8px] text-gray-300 font-bold">Asset</label>
                    <div className="relative">
                        <button
                            onMouseEnter={() => setShowAssetInfo(true)}
                            onMouseLeave={() => setShowAssetInfo(false)}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            <Info className="w-2 h-2" />
                        </button>
                        {showAssetInfo && (
                            <div className="absolute right-0 top-full mt-1 w-36 glass-card-elevated border border-brand-blue/30 rounded-md p-1.5 shadow-2xl z-50 backdrop-blur-xl animate-fade-in-up">
                                <p className="text-white text-[8px] leading-relaxed">
                                    Robot switches if below{' '}
                                    <span className="text-brand-blue font-bold">{settings.assetChangeThreshold}%</span>
                                </p>
                            </div>
                        )}
                    </div>
                </div>
                <GlassCard variant="blue" className="p-0 relative z-10">
                    <button
                        onClick={() => setShowAssetSelector(!showAssetSelector)}
                        className="w-full p-1 flex items-center justify-between hover:bg-brand-blue/10 transition-all duration-300 rounded-md group/btn"
                    >
                        <div className="flex items-center gap-1">
                            <div className="w-4 h-4 bg-gradient-to-br from-brand-blue to-blue-600 rounded-sm flex items-center justify-center shadow-lg shadow-brand-blue/30 group-hover/btn:scale-110 transition-transform">
                                <Percent className="w-2 h-2 text-white" />
                            </div>
                            <span className="text-white text-[9px] font-bold">{settings.asset} <span className="text-brand-blue">{getAssetCorrelation(settings.asset)}%</span></span>
                        </div>
                        <ChevronRight className="w-2.5 h-2.5 text-gray-400 group-hover/btn:text-white transition-colors" />
                    </button>
                    {showAssetSelector && (
                        <div className="absolute left-0 right-0 top-full mt-0.5 glass-card-elevated rounded-md p-0.5 space-y-0.5 shadow-2xl z-50 border border-brand-blue/30 backdrop-blur-xl animate-fade-in-up">
                            {assets.map(asset => (
                                <button
                                    key={asset.id}
                                    onClick={() => {
                                        setSettings({ ...settings, asset: asset.id });
                                        setShowAssetSelector(false);
                                    }}
                                    className={`w-full text-left px-1.5 py-0.5 rounded-sm text-[8px] transition-all ${settings.asset === asset.id ? 'bg-brand-blue text-white font-bold shadow-lg shadow-brand-blue/30' : 'text-gray-300 hover:bg-brand-blue/10'
                                        }`}
                                >
                                    {asset.id} <span className={settings.asset === asset.id ? 'text-white' : 'text-brand-blue'}>{asset.correlation}%</span>
                                </button>
                            ))}
                        </div>
                    )}
                </GlassCard>
            </div>

            {/* Amount & Duration - Micro Compact */}
            <div className="grid grid-cols-2 gap-1">
                <div className="glass-card-elevated p-1 rounded-md border border-green-400/30 shadow-lg shadow-green-500/10 backdrop-blur-xl animate-fade-in-up relative overflow-hidden group hover:border-green-400/50 transition-all">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(34,197,94,0.15),transparent)]"></div>
                    <label className="text-[8px] text-gray-300 font-bold mb-0.5 block relative z-10">Amount</label>
                    <GlassCard variant="green" className="p-0 relative z-10">
                        <input
                            type="number"
                            value={settings.initialAmount}
                            onChange={(e) => setSettings({ ...settings, initialAmount: parseFloat(e.target.value) })}
                            className="w-full bg-transparent text-white rounded-md px-1.5 py-0.5 text-[9px] font-bold focus:outline-none focus:ring-1 focus:ring-green-400/50"
                        />
                    </GlassCard>
                </div>
                <div className="glass-card-elevated p-1 rounded-md border border-accent-orange/30 shadow-lg shadow-accent-orange/10 backdrop-blur-xl animate-fade-in-up relative overflow-hidden group hover:border-accent-orange/50 transition-all">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(251,146,60,0.15),transparent)]"></div>
                    <label className="text-[8px] text-gray-300 font-bold mb-0.5 block relative z-10">Duration</label>
                    <GlassCard variant="orange" className="p-0 relative z-10">
                        <button
                            onClick={() => setShowDurationSelector(!showDurationSelector)}
                            className="w-full text-white rounded-md px-1.5 py-0.5 text-[9px] font-bold flex items-center justify-between hover:bg-accent-orange/10 transition-colors group/btn"
                        >
                            <span>{getDurationLabel(settings.duration)}</span>
                            <ChevronRight className="w-2.5 h-2.5 group-hover/btn:translate-x-0.5 transition-transform" />
                        </button>
                    </GlassCard>
                    {showDurationSelector && (
                        <div className="absolute left-0 right-0 top-full mt-0.5 glass-card-elevated rounded-md p-0.5 space-y-0.5 shadow-2xl z-50 border border-accent-orange/30 backdrop-blur-xl animate-fade-in-up">
                            {durations.map(duration => (
                                <button
                                    key={duration.value}
                                    onClick={() => {
                                        setSettings({ ...settings, duration: duration.value });
                                        setShowDurationSelector(false);
                                    }}
                                    className={`w-full text-left px-1.5 py-0.5 rounded-sm text-[8px] transition-all ${settings.duration === duration.value ? 'bg-accent-orange text-white font-bold shadow-lg shadow-accent-orange/30' : 'text-gray-300 hover:bg-accent-orange/10'
                                        }`}
                                >
                                    {duration.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Indicator - Ultra Compact */}
            <div className="glass-card-elevated p-1.5 rounded-lg border border-green-400/30 shadow-lg shadow-green-500/10 backdrop-blur-xl animate-fade-in-up relative overflow-hidden group hover:border-green-400/50 transition-all">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(34,197,94,0.15),transparent)]"></div>
                <label className="text-[9px] text-gray-300 font-bold mb-1 block relative z-10">Technical indicator</label>
                <GlassCard variant="green" className="p-0 relative z-10">
                    <button
                        onClick={() => setShowIndicatorSelector(!showIndicatorSelector)}
                        className="w-full p-1.5 flex items-center justify-between hover:bg-green-500/10 transition-all duration-300 rounded-lg group/btn"
                    >
                        <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 bg-gradient-to-br from-green-500 to-green-600 rounded-md flex items-center justify-center shadow-lg group-hover/btn:scale-110 transition-transform">
                                <TrendingUp className="w-2.5 h-2.5 text-white" />
                            </div>
                            <span className="text-white text-[10px] font-bold">{getIndicatorName(settings.indicator)}</span>
                        </div>
                        <ChevronRight className="w-3 h-3 text-gray-400 group-hover/btn:text-white group-hover/btn:translate-x-0.5 transition-all" />
                    </button>
                </GlassCard>
                {showIndicatorSelector && (
                    <div className="absolute left-0 right-0 top-full mt-1 glass-card-elevated rounded-lg p-1 space-y-0.5 shadow-2xl z-50 border border-green-400/30 backdrop-blur-xl animate-fade-in-up">
                        {indicators.map(indicator => (
                            <button
                                key={indicator.id}
                                onClick={() => {
                                    setSettings({ ...settings, indicator: indicator.id });
                                    setShowIndicatorSelector(false);
                                }}
                                className={`w-full text-left px-2 py-1 rounded-md text-[9px] transition-all ${settings.indicator === indicator.id ? 'bg-green-500 text-white font-bold shadow-lg shadow-green-500/30' : 'text-gray-300 hover:bg-green-500/10'
                                    }`}
                            >
                                {indicator.name}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Indicator - Micro Compact */}
            <div className="glass-card-elevated p-1 rounded-md border border-green-400/30 shadow-lg shadow-green-500/10 backdrop-blur-xl animate-fade-in-up relative overflow-hidden group hover:border-green-400/50 transition-all">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(34,197,94,0.15),transparent)]"></div>
                <label className="text-[8px] text-gray-300 font-bold mb-0.5 block relative z-10">Indicator</label>
                <GlassCard variant="green" className="p-0 relative z-10">
                    <button
                        onClick={() => setShowIndicatorSelector(!showIndicatorSelector)}
                        className="w-full p-1 flex items-center justify-between hover:bg-green-500/10 transition-all duration-300 rounded-md group/btn"
                    >
                        <div className="flex items-center gap-1">
                            <div className="w-4 h-4 bg-gradient-to-br from-green-500 to-green-600 rounded-sm flex items-center justify-center shadow-lg group-hover/btn:scale-110 transition-transform">
                                <TrendingUp className="w-2 h-2 text-white" />
                            </div>
                            <span className="text-white text-[9px] font-bold truncate">{getIndicatorName(settings.indicator)}</span>
                        </div>
                        <ChevronRight className="w-2.5 h-2.5 text-gray-400 group-hover/btn:text-white group-hover/btn:translate-x-0.5 transition-all" />
                    </button>
                </GlassCard>
                {showIndicatorSelector && (
                    <div className="absolute left-0 right-0 top-full mt-0.5 glass-card-elevated rounded-md p-0.5 space-y-0.5 shadow-2xl z-50 border border-green-400/30 backdrop-blur-xl animate-fade-in-up">
                        {indicators.map(indicator => (
                            <button
                                key={indicator.id}
                                onClick={() => {
                                    setSettings({ ...settings, indicator: indicator.id });
                                    setShowIndicatorSelector(false);
                                }}
                                className={`w-full text-left px-1.5 py-0.5 rounded-sm text-[8px] transition-all ${settings.indicator === indicator.id ? 'bg-green-500 text-white font-bold shadow-lg shadow-green-500/30' : 'text-gray-300 hover:bg-green-500/10'
                                    }`}
                            >
                                {indicator.name}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Strategy - Micro Compact */}
            <div className="glass-card-elevated p-1 rounded-md border border-purple-500/30 shadow-lg shadow-purple-500/10 backdrop-blur-xl animate-fade-in-up relative overflow-hidden group hover:border-purple-500/50 transition-all">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(168,85,247,0.15),transparent)]"></div>
                <label className="text-[8px] text-gray-300 font-bold mb-0.5 block relative z-10">Strategy</label>
                <GlassCard variant="purple" className="p-0 relative z-10">
                    <button
                        onClick={() => setShowStrategySelector(!showStrategySelector)}
                        className="w-full p-1 flex items-center justify-between hover:bg-purple-500/10 transition-all duration-300 rounded-md group/btn"
                    >
                        <div className="flex items-center gap-1">
                            <div className="w-4 h-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-sm flex items-center justify-center text-[9px] shadow-lg group-hover/btn:scale-110 transition-transform">♟️</div>
                            <div className="text-left min-w-0 flex-1">
                                <div className="text-white text-[9px] font-bold truncate">{getStrategyName(settings.strategy)}</div>
                                <span className="text-accent-orange text-[7px]">{getStrategyRisk(settings.strategy)}</span>
                            </div>
                        </div>
                        <ChevronRight className="w-2.5 h-2.5 text-gray-400 group-hover/btn:text-white group-hover/btn:translate-x-0.5 transition-all flex-shrink-0" />
                    </button>
                </GlassCard>
                {showStrategySelector && (
                    <div className="absolute left-0 right-0 top-full mt-0.5 glass-card-elevated rounded-md p-0.5 space-y-0.5 shadow-2xl z-50 border border-purple-500/30 backdrop-blur-xl animate-fade-in-up">
                        {strategies.map(strategy => (
                            <button
                                key={strategy.id}
                                onClick={() => {
                                    setSettings({ ...settings, strategy: strategy.id });
                                    setShowStrategySelector(false);
                                }}
                                className={`w-full text-left px-1.5 py-0.5 rounded-sm text-[8px] transition-all ${settings.strategy === strategy.id ? 'bg-purple-500 text-white font-bold shadow-lg shadow-purple-500/30' : 'text-gray-300 hover:bg-purple-500/10'
                                    }`}
                            >
                                <div className="flex items-center gap-1">
                                    <span className="text-[9px]">{strategy.icon}</span>
                                    <span className="truncate">{strategy.name}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Profit Limit - Micro Compact */}
            <div className="glass-card-elevated p-1 rounded-md border border-green-400/30 shadow-lg shadow-green-500/20 backdrop-blur-xl animate-fade-in-up relative overflow-hidden group hover:border-green-400/50 transition-all">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(34,197,94,0.15),transparent)]"></div>
                <label className="text-[8px] text-gray-300 font-bold mb-0.5 block relative z-10">Profit limit</label>
                <GlassCard variant="green" className="p-0 relative z-10 border border-green-400/20">
                    <div className="flex items-center gap-1 p-1">
                        <input
                            type="number"
                            value={settings.profitLimit}
                            onChange={(e) => setSettings({ ...settings, profitLimit: parseFloat(e.target.value) })}
                            className="flex-1 bg-transparent text-white text-[9px] font-bold focus:outline-none"
                        />
                        <div className="px-1.5 py-0.5 bg-brand-blue rounded-sm shrink-0 shadow-lg shadow-brand-blue/30">
                            <span className="text-white text-[7px] font-bold">ON</span>
                        </div>
                    </div>
                </GlassCard>
            </div>

            {/* Start Button - Micro Compact */}
            <button
                onClick={() => onStartBot(settings)}
                onMouseEnter={() => setIsHoveringStart(true)}
                onMouseLeave={() => setIsHoveringStart(false)}
                className="w-full bg-gradient-to-r from-brand-blue via-blue-600 to-brand-blue hover:from-blue-600 hover:via-blue-700 hover:to-blue-600 text-white font-bold py-1.5 rounded-md transition-all duration-300 text-[9px] relative overflow-hidden group shadow-2xl shadow-brand-blue/50 hover:shadow-2xl hover:shadow-brand-blue/70 hover:scale-105 animate-fade-in-up"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <div className="flex items-center justify-center gap-1 relative z-10">
                    <span className="text-xs animate-bounce">🚀</span>
                    <span>Start robot</span>
                    {isHoveringStart && <span className="animate-pulse">✨</span>}
                </div>
            </button>
        </div>
    );
}


