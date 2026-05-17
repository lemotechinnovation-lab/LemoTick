import { Bot, ChevronDown, Info } from 'lucide-react';
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

export default function BotSettingsPanelEnhanced({ onStartBot }: BotSettingsPanelProps) {
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
        <div className="w-full h-full flex flex-col overflow-hidden relative">
            {/* Beautiful Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#B4B4C3] via-[#B4B4C3] to-[#B4B4C3] pointer-events-none"></div>

            {/* Animated Gradient Orbs */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-brand-blue/20 via-purple-500/15 to-transparent rounded-full blur-3xl animate-pulse-slow pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-accent-orange/15 via-pink-500/10 to-transparent rounded-full blur-3xl animate-pulse-slow pointer-events-none" style={{ animationDelay: '1s' }}></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 bg-gradient-to-br from-purple-500/10 via-brand-blue/10 to-transparent rounded-full blur-3xl animate-pulse-slow pointer-events-none" style={{ animationDelay: '2s' }}></div>

            {/* Subtle Grid Pattern */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5 scrollbar-enhanced relative z-10">
                {/* Compact Header - Matching Social Pages Style */}
                <div className="glass-card-elevated p-2.5 rounded-xl smooth-hover border border-brand-blue/30 shadow-xl shadow-brand-blue/20 backdrop-blur-xl relative overflow-hidden group animate-fade-in-up bg-gradient-to-br from-brand-blue/10 via-purple-500/5 to-transparent">
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/10 via-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    <div className="flex items-center justify-between relative z-10">
                        <h3 className="text-xs font-bold flex items-center gap-2 text-white">
                            <div className="relative w-6 h-6 rounded-lg bg-gradient-to-br from-brand-blue/30 to-purple-500/30 flex items-center justify-center shadow-xl border border-brand-blue/40 group-hover:scale-110 transition-transform">
                                <Bot className="w-3.5 h-3.5 text-brand-blue group-hover:animate-pulse" />
                                <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></div>
                                <div className="absolute inset-0 rounded-lg bg-brand-blue/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </div>
                            <span className="bg-gradient-to-r from-white via-brand-blue to-white bg-clip-text text-transparent group-hover:from-brand-blue group-hover:via-purple-400 group-hover:to-brand-blue transition-all duration-500">Robot Configuration</span>
                        </h3>
                    </div>
                </div>

                {/* Asset Selection - Enhanced with Social Style */}
                <div className="glass-card-elevated p-2.5 rounded-xl smooth-hover border border-brand-blue/30 shadow-xl shadow-brand-blue/20 backdrop-blur-xl relative overflow-hidden group animate-fade-in-up bg-gradient-to-br from-brand-blue/5 via-transparent to-purple-500/5" style={{ animationDelay: '100ms' }}>
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    <div className="flex items-center justify-between mb-2 relative z-10">
                        <label className="text-xs font-bold flex items-center gap-1.5 text-white">
                            <div className="relative w-5 h-5 rounded-lg bg-gradient-to-br from-brand-blue/30 to-purple-500/30 flex items-center justify-center shadow-xl border border-brand-blue/40 group-hover:scale-110 transition-transform">
                                <span className="text-[10px]">📊</span>
                                <div className="absolute inset-0 rounded-lg bg-brand-blue/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </div>
                            <span className="group-hover:text-brand-blue transition-colors">Asset</span>
                        </label>
                        <div className="group/info relative">
                            <Info className="w-3.5 h-3.5 text-gray-400 hover:text-brand-blue transition-colors cursor-help" />
                            <div className="absolute right-0 top-full mt-2 w-48 glass-card-elevated border border-brand-blue/30 rounded-lg p-3 shadow-2xl z-50 backdrop-blur-xl opacity-0 invisible group-hover/info:opacity-100 group-hover/info:visible transition-all">
                                <p className="text-white text-xs leading-relaxed">
                                    Robot switches if correlation drops below{' '}
                                    <span className="text-brand-blue font-bold">{settings.assetChangeThreshold}%</span>
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="relative z-10">
                        <button
                            onClick={() => setShowAssetSelector(!showAssetSelector)}
                            className="w-full bg-gradient-to-br from-brand-blue/15 to-purple-500/10 hover:from-brand-blue/25 hover:to-purple-500/20 border border-brand-blue/40 hover:border-brand-blue/60 rounded-xl px-3 py-2 flex items-center justify-between transition-all group/btn shadow-xl hover:shadow-2xl hover:shadow-brand-blue/30 relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-brand-blue/20 via-purple-500/10 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700"></div>
                            <div className="flex items-center gap-2 relative z-10">
                                <div className="w-8 h-8 bg-gradient-to-br from-brand-blue/50 to-purple-500/50 rounded-lg flex items-center justify-center shadow-xl border border-brand-blue/40 group-hover/btn:scale-110 transition-transform">
                                    <span className="text-white text-xs font-bold drop-shadow-lg">{settings.asset}</span>
                                    <div className="absolute inset-0 rounded-lg bg-brand-blue/30 blur-md opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
                                </div>
                                <div className="text-left">
                                    <div className="text-white text-xs font-semibold group-hover/btn:text-brand-blue transition-colors">{settings.asset}</div>
                                    <div className="text-brand-blue text-[10px] font-semibold">{getAssetCorrelation(settings.asset)}% correlation</div>
                                </div>
                            </div>
                            <ChevronDown className={`w-4 h-4 text-gray-400 group-hover/btn:text-brand-blue transition-all relative z-10 ${showAssetSelector ? 'rotate-180' : ''}`} />
                        </button>
                        {showAssetSelector && (
                            <div className="absolute left-0 right-0 top-full mt-2 glass-card-elevated rounded-xl p-2 space-y-1 shadow-2xl z-50 border border-brand-blue/30 backdrop-blur-xl animate-fade-in-up">
                                {assets.map(asset => (
                                    <button
                                        key={asset.id}
                                        onClick={() => {
                                            setSettings({ ...settings, asset: asset.id });
                                            setShowAssetSelector(false);
                                        }}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${settings.asset === asset.id ? 'bg-brand-blue text-white font-semibold shadow-lg shadow-brand-blue/30' : 'text-gray-300 hover:bg-brand-blue/10 hover:text-white'
                                            }`}
                                    >
                                        {asset.id} <span className={settings.asset === asset.id ? 'text-white' : 'text-brand-blue'}>{asset.correlation}%</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Amount & Duration - Enhanced Cards */}
                <div className="grid grid-cols-2 gap-2.5 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                    {/* Initial Amount Card */}
                    <div className="glass-card-elevated p-2.5 rounded-xl smooth-hover border border-green-400/30 shadow-xl shadow-green-500/20 backdrop-blur-xl relative overflow-hidden group bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-transparent">
                        <div className="absolute inset-0 bg-gradient-to-br from-green-500/15 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                        <label className="text-[10px] font-bold flex items-center gap-1.5 text-white mb-2 relative z-10">
                            <div className="relative w-4 h-4 rounded-lg bg-gradient-to-br from-green-500/30 to-emerald-500/30 flex items-center justify-center shadow-xl border border-green-400/40 group-hover:scale-110 transition-transform">
                                <span className="text-[10px]">💰</span>
                                <div className="absolute inset-0 rounded-lg bg-green-500/30 blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </div>
                            <span className="group-hover:text-green-400 transition-colors">Amount</span>
                        </label>
                        <div className="relative group/input z-10">
                            <input
                                type="number"
                                value={settings.initialAmount}
                                onChange={(e) => setSettings({ ...settings, initialAmount: parseFloat(e.target.value) })}
                                className="w-full bg-gradient-to-br from-green-500/15 to-emerald-500/10 border border-green-400/40 rounded-xl px-2.5 py-2 text-white text-xs font-semibold focus:outline-none focus:border-green-400/70 focus:shadow-xl focus:shadow-green-400/30 transition-all hover:border-green-400/60 hover:shadow-lg hover:shadow-green-400/20"
                                placeholder="0.00"
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 text-green-400 text-[10px] font-bold bg-green-500/30 px-1.5 py-0.5 rounded-md border border-green-400/40 shadow-lg">USD</div>
                        </div>
                    </div>

                    {/* Duration Card */}
                    <div className="glass-card-elevated p-2.5 rounded-xl smooth-hover border border-accent-orange/30 shadow-xl shadow-accent-orange/20 backdrop-blur-xl relative overflow-hidden group bg-gradient-to-br from-accent-orange/10 via-yellow-500/5 to-transparent">
                        <div className="absolute inset-0 bg-gradient-to-br from-accent-orange/15 to-yellow-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                        <label className="text-[10px] font-bold flex items-center gap-1.5 text-white mb-2 relative z-10">
                            <div className="relative w-4 h-4 rounded-lg bg-gradient-to-br from-accent-orange/30 to-yellow-500/30 flex items-center justify-center shadow-xl border border-accent-orange/40 group-hover:scale-110 transition-transform">
                                <span className="text-[10px]">⏱️</span>
                                <div className="absolute inset-0 rounded-lg bg-accent-orange/30 blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </div>
                            <span className="group-hover:text-accent-orange transition-colors">Duration</span>
                        </label>
                        <div className="relative z-10">
                            <button
                                onClick={() => setShowDurationSelector(!showDurationSelector)}
                                className="w-full bg-gradient-to-br from-accent-orange/15 to-yellow-500/10 hover:from-accent-orange/25 hover:to-yellow-500/20 border border-accent-orange/40 rounded-xl px-2.5 py-2 text-white text-xs font-semibold flex items-center justify-between hover:border-accent-orange/60 hover:shadow-xl hover:shadow-accent-orange/30 transition-all group/btn relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-accent-orange/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700"></div>
                                <span className="relative z-10 group-hover/btn:text-accent-orange transition-colors">{getDurationLabel(settings.duration)}</span>
                                <ChevronDown className={`w-3.5 h-3.5 text-gray-400 group-hover/btn:text-accent-orange transition-all relative z-10 ${showDurationSelector ? 'rotate-180' : ''}`} />
                            </button>
                            {showDurationSelector && (
                                <div className="absolute left-0 right-0 top-full mt-2 glass-card-elevated rounded-xl p-2 space-y-1 shadow-2xl z-50 border border-accent-orange/30 backdrop-blur-xl animate-fade-in-up">
                                    {durations.map(duration => (
                                        <button
                                            key={duration.value}
                                            onClick={() => {
                                                setSettings({ ...settings, duration: duration.value });
                                                setShowDurationSelector(false);
                                            }}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${settings.duration === duration.value ? 'bg-accent-orange text-white font-semibold shadow-lg shadow-accent-orange/30' : 'text-gray-300 hover:bg-accent-orange/10 hover:text-white'
                                                }`}
                                        >
                                            {duration.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Technical Indicator - Enhanced Card */}
                <div className="glass-card-elevated p-2.5 rounded-xl smooth-hover border border-green-400/30 shadow-xl shadow-green-500/20 backdrop-blur-xl relative overflow-hidden group animate-fade-in-up bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-transparent" style={{ animationDelay: '300ms' }}>
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/15 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    <label className="text-xs font-bold flex items-center gap-1.5 text-white mb-2 relative z-10">
                        <div className="relative w-5 h-5 rounded-lg bg-gradient-to-br from-green-500/30 to-emerald-500/30 flex items-center justify-center shadow-xl border border-green-400/40 group-hover:scale-110 transition-transform">
                            <span className="text-[10px]">📈</span>
                            <div className="absolute inset-0 rounded-lg bg-green-500/30 blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                        <span className="group-hover:text-green-400 transition-colors">Technical Indicator</span>
                    </label>
                    <div className="relative z-10">
                        <button
                            onClick={() => setShowIndicatorSelector(!showIndicatorSelector)}
                            className="w-full bg-gradient-to-br from-green-500/15 to-emerald-500/10 hover:from-green-500/25 hover:to-emerald-500/20 border border-green-400/40 rounded-xl px-3 py-2 flex items-center justify-between hover:border-green-400/60 hover:shadow-xl hover:shadow-green-400/30 transition-all group/btn relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700"></div>
                            <span className="text-white text-xs font-semibold relative z-10 group-hover/btn:text-green-400 transition-colors drop-shadow-lg">{getIndicatorName(settings.indicator)}</span>
                            <ChevronDown className={`w-4 h-4 text-gray-400 group-hover/btn:text-green-400 transition-all relative z-10 ${showIndicatorSelector ? 'rotate-180' : ''}`} />
                        </button>
                        {showIndicatorSelector && (
                            <div className="absolute left-0 right-0 top-full mt-2 glass-card-elevated rounded-xl p-2 space-y-1 shadow-2xl z-50 border border-green-400/30 backdrop-blur-xl animate-fade-in-up">
                                {indicators.map(indicator => (
                                    <button
                                        key={indicator.id}
                                        onClick={() => {
                                            setSettings({ ...settings, indicator: indicator.id });
                                            setShowIndicatorSelector(false);
                                        }}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${settings.indicator === indicator.id ? 'bg-green-500 text-white font-semibold shadow-lg shadow-green-500/30' : 'text-gray-300 hover:bg-green-500/10 hover:text-white'
                                            }`}
                                    >
                                        {indicator.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Strategy - Enhanced Card */}
                <div className="glass-card-elevated p-2 rounded-xl smooth-hover border border-purple-500/30 shadow-xl shadow-purple-500/20 backdrop-blur-xl relative overflow-hidden group animate-fade-in-up bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-transparent" style={{ animationDelay: '400ms' }}>
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/15 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    <label className="text-[10px] font-bold flex items-center gap-1 text-white mb-1.5 relative z-10">
                        <div className="relative w-4 h-4 rounded-lg bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center shadow-xl border border-purple-500/40 group-hover:scale-110 transition-transform">
                            <span className="text-[9px]">🎯</span>
                            <div className="absolute inset-0 rounded-lg bg-purple-500/30 blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                        <span className="group-hover:text-purple-400 transition-colors">Strategy</span>
                    </label>
                    <div className="relative z-10">
                        <button
                            onClick={() => setShowStrategySelector(!showStrategySelector)}
                            className="w-full bg-gradient-to-br from-purple-500/15 to-pink-500/10 hover:from-purple-500/25 hover:to-pink-500/20 border border-purple-500/40 rounded-xl px-2.5 py-1.5 flex items-center justify-between hover:border-purple-500/60 hover:shadow-xl hover:shadow-purple-500/30 transition-all group/btn relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700"></div>
                            <div className="flex items-center gap-1.5 relative z-10">
                                <div className="text-sm group-hover/btn:scale-110 transition-transform drop-shadow-lg">{strategies.find(s => s.id === settings.strategy)?.icon}</div>
                                <div className="text-left">
                                    <div className="text-white text-[10px] font-semibold group-hover/btn:text-purple-400 transition-colors leading-tight drop-shadow-lg">{getStrategyName(settings.strategy)}</div>
                                    <div className="text-accent-orange text-[9px] font-semibold leading-tight drop-shadow-lg">{getStrategyRisk(settings.strategy)}</div>
                                </div>
                            </div>
                            <ChevronDown className={`w-3.5 h-3.5 text-gray-400 group-hover/btn:text-purple-400 transition-all relative z-10 ${showStrategySelector ? 'rotate-180' : ''}`} />
                        </button>
                        {showStrategySelector && (
                            <div className="absolute left-0 right-0 top-full mt-2 glass-card-elevated rounded-xl p-2 space-y-1 shadow-2xl z-50 border border-purple-500/30 backdrop-blur-xl animate-fade-in-up">
                                {strategies.map(strategy => (
                                    <button
                                        key={strategy.id}
                                        onClick={() => {
                                            setSettings({ ...settings, strategy: strategy.id });
                                            setShowStrategySelector(false);
                                        }}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${settings.strategy === strategy.id ? 'bg-purple-500 text-white font-semibold shadow-lg shadow-purple-500/30' : 'text-gray-300 hover:bg-purple-500/10 hover:text-white'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="text-base">{strategy.icon}</span>
                                            <div>
                                                <div>{strategy.name}</div>
                                                <div className="text-xs opacity-75">{strategy.risk}</div>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Profit Limit - Enhanced Card */}
                <div className="glass-card-elevated p-2.5 rounded-xl smooth-hover border border-green-400/30 shadow-xl shadow-green-500/20 backdrop-blur-xl relative overflow-hidden group animate-fade-in-up bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-transparent" style={{ animationDelay: '500ms' }}>
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/15 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    <label className="text-xs font-bold flex items-center gap-1.5 text-white mb-2 relative z-10">
                        <div className="relative w-5 h-5 rounded-lg bg-gradient-to-br from-green-500/30 to-emerald-500/30 flex items-center justify-center shadow-xl border border-green-400/40 group-hover:scale-110 transition-transform">
                            <span className="text-[10px]">💎</span>
                            <div className="absolute inset-0 rounded-lg bg-green-500/30 blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                        <span className="group-hover:text-green-400 transition-colors">Profit Limit</span>
                    </label>
                    <div className="relative group/input z-10">
                        <input
                            type="number"
                            value={settings.profitLimit}
                            onChange={(e) => setSettings({ ...settings, profitLimit: parseFloat(e.target.value) })}
                            className="w-full bg-gradient-to-br from-green-500/15 to-emerald-500/10 border border-green-400/40 rounded-xl px-2.5 py-2 text-white text-xs font-semibold focus:outline-none focus:border-green-400/70 focus:shadow-xl focus:shadow-green-400/30 transition-all hover:border-green-400/60 hover:shadow-lg hover:shadow-green-400/20"
                            placeholder="0.00"
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-0.5 bg-gradient-to-r from-brand-blue to-blue-600 rounded-md text-white text-[10px] font-bold shadow-xl shadow-brand-blue/50 group-hover/input:scale-110 group-hover/input:shadow-2xl group-hover/input:shadow-brand-blue/70 transition-all">ON</div>
                    </div>
                </div>
            </div>

            {/* Start Button - Fixed at Bottom with Enhanced Style */}
            <div className="flex-shrink-0 p-2.5 border-t border-brand-blue/30 backdrop-blur-xl relative overflow-hidden animate-fade-in-up bg-gradient-to-t from-[#B4B4C3]/95 via-[#B4B4C3]/90 to-transparent" style={{ animationDelay: '600ms' }}>
                {/* Animated glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-brand-blue/10 via-purple-500/10 to-brand-blue/10 animate-pulse-slow opacity-50"></div>

                <button
                    onClick={() => onStartBot(settings)}
                    className="relative z-10 w-full bg-gradient-to-r from-brand-blue via-blue-600 to-brand-blue hover:from-blue-600 hover:via-blue-700 hover:to-blue-600 text-white font-bold py-3 rounded-xl transition-all duration-300 text-sm overflow-hidden group shadow-2xl shadow-brand-blue/50 hover:shadow-2xl hover:shadow-brand-blue/70 hover:scale-[1.02] active:scale-[0.98]"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-blue/50 via-purple-500/30 to-brand-blue/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="flex items-center justify-center gap-2 relative z-10">
                        <Bot className="w-4.5 h-4.5 group-hover:animate-pulse drop-shadow-lg" />
                        <span className="drop-shadow-lg">Start Robot</span>
                    </div>
                </button>
            </div>
        </div>
    );
}


