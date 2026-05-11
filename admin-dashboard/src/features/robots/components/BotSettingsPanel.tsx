import { ChevronRight, Info, Percent, TrendingUp } from 'lucide-react';
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
        <div className="bg-gradient-to-b from-[#0B0633] via-[#16124A] to-[#0B0633] shrink-0 flex flex-col h-full relative overflow-hidden w-full">
            {/* Animated Background Effects */}
            <div className="absolute inset-0 opacity-30 pointer-events-none">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#2F6BFF] rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#FFA62B] rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            {/* Header with Glow */}
            <div className="px-2 py-2 border-b border-[#2F6BFF]/30 bg-gradient-to-r from-[#2F6BFF]/10 to-transparent relative z-10 shrink-0">
                <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-[#2F6BFF] rounded-full animate-pulse shadow-lg shadow-[#2F6BFF]/50"></div>
                    <h2 className="text-white text-xs font-semibold">Robot's settings</h2>
                    <div className="ml-auto">
                        <span className="text-[10px] text-[#2F6BFF] font-semibold animate-pulse">● READY</span>
                    </div>
                </div>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 p-2 pt-2 space-y-2 overflow-y-auto relative z-10 min-h-0">
                {/* Asset */}
                <div className="relative">
                    <div className="flex items-center justify-between mb-0.5">
                        <p className="text-gray-400 text-[10px]">Trading asset</p>
                        <div className="relative">
                            <button
                                onMouseEnter={() => setShowAssetInfo(true)}
                                onMouseLeave={() => setShowAssetInfo(false)}
                                className="text-gray-400 hover:text-[#efdede] transition-colors"
                            >
                                <Info className="w-3 h-3" />
                            </button>
                            {showAssetInfo && (
                                <div className="absolute right-0 top-full mt-1 w-44 bg-[#16124A] border border-[#2F6BFF]/30 rounded p-1.5 shadow-lg z-50">
                                    <p className="text-white text-[8px] leading-relaxed">
                                        The robot will switch to the most profitable asset if the selected one is below{' '}
                                        <span className="text-[#2F6BFF] font-semibold">{settings.assetChangeThreshold}%</span> or the market closes
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={() => setShowAssetSelector(!showAssetSelector)}
                        className="w-full bg-gradient-to-r from-[#16124A] to-[#1E1854] hover:from-[#1E1854] hover:to-[#16124A] rounded-lg p-2 flex items-center justify-between transition-all duration-300 border border-[#2F6BFF]/20 hover:border-[#2F6BFF]/50 hover:shadow-lg hover:shadow-[#2F6BFF]/20"
                    >
                        <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 bg-gradient-to-br from-[#2F6BFF] to-[#4A5FD9] rounded flex items-center justify-center shadow-lg shadow-[#2F6BFF]/30 animate-pulse">
                                <Percent className="w-3 h-3 text-white" />
                            </div>
                            <span className="text-white text-[10px] font-medium">{settings.asset} <span className="text-[#2F6BFF] font-bold">{getAssetCorrelation(settings.asset)}%</span></span>
                        </div>
                        <ChevronRight className="w-2.5 h-2.5 text-gray-400" />
                    </button>
                    {showAssetSelector && (
                        <div className="absolute left-0 right-0 top-full mt-1.5 bg-[#16124A] rounded-lg p-1.5 space-y-0.5 shadow-xl z-50">
                            {assets.map(asset => (
                                <button
                                    key={asset.id}
                                    onClick={() => {
                                        setSettings({ ...settings, asset: asset.id });
                                        setShowAssetSelector(false);
                                    }}
                                    className={`w-full text-left px-2 py-1.5 rounded text-[10px] transition-colors ${settings.asset === asset.id ? 'bg-[#2F6BFF] text-white' : 'text-gray-300 hover:bg-[#1E1854]'
                                        }`}
                                >
                                    {asset.id} <span className="text-[#2F6BFF]">{asset.correlation}%</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Amount & Duration */}
                <div className="grid grid-cols-2 gap-1.5">
                    <div>
                        <label className="text-gray-400 text-[8px] mb-0.5 block">Initial amount</label>
                        <input
                            type="number"
                            value={settings.initialAmount}
                            onChange={(e) => setSettings({ ...settings, initialAmount: parseFloat(e.target.value) })}
                            className="w-full bg-[#16124A] text-white rounded-lg px-1.5 py-1.5 text-[10px] focus:outline-none focus:ring-1 focus:ring-[#2F6BFF]"
                        />
                    </div>
                    <div className="relative">
                        <label className="text-gray-400 text-[8px] mb-0.5 block">Duration</label>
                        <button
                            onClick={() => setShowDurationSelector(!showDurationSelector)}
                            className="w-full bg-[#16124A] hover:bg-[#1E1854] text-white rounded-lg px-1.5 py-1.5 text-[10px] flex items-center justify-between transition-colors"
                        >
                            <span>{getDurationLabel(settings.duration)}</span>
                            <ChevronRight className="w-3 h-3" />
                        </button>
                        {showDurationSelector && (
                            <div className="absolute left-0 right-0 top-full mt-1.5 bg-[#16124A] rounded-lg p-1.5 space-y-0.5 shadow-xl z-50">
                                {durations.map(duration => (
                                    <button
                                        key={duration.value}
                                        onClick={() => {
                                            setSettings({ ...settings, duration: duration.value });
                                            setShowDurationSelector(false);
                                        }}
                                        className={`w-full text-left px-2 py-1.5 rounded text-[10px] transition-colors ${settings.duration === duration.value ? 'bg-[#2F6BFF] text-white' : 'text-gray-300 hover:bg-[#1E1854]'
                                            }`}
                                    >
                                        {duration.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Indicator */}
                <div className="relative">
                    <p className="text-gray-400 text-[9px] mb-0.5">Technical indicator</p>
                    <button
                        onClick={() => setShowIndicatorSelector(!showIndicatorSelector)}
                        className="w-full bg-gradient-to-r from-[#16124A] to-[#1E1854] hover:from-[#1E1854] hover:to-[#16124A] rounded-lg p-2.5 flex items-center justify-between transition-all duration-300 border border-[#2F6BFF]/20 hover:border-[#2F6BFF]/50 hover:shadow-lg hover:shadow-[#2F6BFF]/20"
                    >
                        <div className="flex items-center gap-1.5">
                            <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-red-500 rounded flex items-center justify-center shadow-lg animate-pulse">
                                <TrendingUp className="w-3.5 h-3.5 text-white" />
                            </div>
                            <span className="text-white text-xs font-medium">{getIndicatorName(settings.indicator)}</span>
                        </div>
                        <ChevronRight className="w-3 h-3 text-gray-400" />
                    </button>
                    {showIndicatorSelector && (
                        <div className="absolute left-0 right-0 top-full mt-1.5 bg-[#16124A] rounded-lg p-1.5 space-y-0.5 shadow-xl z-50">
                            {indicators.map(indicator => (
                                <button
                                    key={indicator.id}
                                    onClick={() => {
                                        setSettings({ ...settings, indicator: indicator.id });
                                        setShowIndicatorSelector(false);
                                    }}
                                    className={`w-full text-left px-2 py-1.5 rounded text-[10px] transition-colors ${settings.indicator === indicator.id ? 'bg-[#2F6BFF] text-white' : 'text-gray-300 hover:bg-[#1E1854]'
                                        }`}
                                >
                                    {indicator.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Strategy */}
                <div className="relative">
                    <p className="text-gray-400 text-[9px] mb-0.5">Strategy</p>
                    <button
                        onClick={() => setShowStrategySelector(!showStrategySelector)}
                        className="w-full bg-gradient-to-r from-[#16124A] to-[#1E1854] hover:from-[#1E1854] hover:to-[#16124A] rounded-lg p-2.5 flex items-center justify-between transition-all duration-300 border border-[#2F6BFF]/20 hover:border-[#2F6BFF]/50 hover:shadow-lg hover:shadow-[#2F6BFF]/20"
                    >
                        <div className="flex items-center gap-1.5">
                            <div className="w-6 h-6 bg-gradient-to-br from-[#4A5FD9] to-[#2F6BFF] rounded flex items-center justify-center text-sm shadow-lg animate-pulse">♟️</div>
                            <div className="text-left">
                                <div className="text-white text-xs font-medium">{getStrategyName(settings.strategy)}</div>
                                <span className="text-[#FFA62B] text-[9px]">{getStrategyRisk(settings.strategy)}</span>
                            </div>
                        </div>
                        <ChevronRight className="w-3 h-3 text-gray-400" />
                    </button>
                    {showStrategySelector && (
                        <div className="absolute left-0 right-0 top-full mt-1.5 bg-[#16124A] rounded-lg p-1.5 space-y-0.5 shadow-xl z-50">
                            {strategies.map(strategy => (
                                <button
                                    key={strategy.id}
                                    onClick={() => {
                                        setSettings({ ...settings, strategy: strategy.id });
                                        setShowStrategySelector(false);
                                    }}
                                    className={`w-full text-left px-2 py-1.5 rounded text-[10px] transition-colors ${settings.strategy === strategy.id ? 'bg-[#2F6BFF] text-white' : 'text-gray-300 hover:bg-[#1E1854]'
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm">{strategy.icon}</span>
                                        <span className="font-medium">{strategy.name}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Profit Limit */}
                <div>
                    <label className="text-gray-400 text-[9px] mb-0.5 block">Profit limit</label>
                    <div className="flex items-center gap-1.5">
                        <input
                            type="number"
                            value={settings.profitLimit}
                            onChange={(e) => setSettings({ ...settings, profitLimit: parseFloat(e.target.value) })}
                            className="flex-1 bg-[#16124A] text-white rounded-lg px-2 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#2F6BFF]"
                        />
                        <div className="w-8 h-8 bg-[#2F6BFF] rounded-lg flex items-center justify-center shrink-0">
                            <span className="text-white text-[10px] font-semibold">ON</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Start Button */}
            <div className="p-2 border-t border-[#2F6BFF]/30 bg-gradient-to-t from-[#0B0633] to-transparent relative z-10 shrink-0">
                <button
                    onClick={() => onStartBot(settings)}
                    onMouseEnter={() => setIsHoveringStart(true)}
                    onMouseLeave={() => setIsHoveringStart(false)}
                    className="w-full bg-gradient-to-r from-[#2F6BFF] via-[#4A5FD9] to-[#2F6BFF] hover:from-[#1557B7] hover:via-[#3A4FC9] hover:to-[#1557B7] text-white font-bold py-2 rounded-lg transition-all duration-300 text-[11px] relative overflow-hidden group shadow-xl shadow-[#2F6BFF]/50 hover:shadow-2xl hover:shadow-[#2F6BFF]/70 hover:scale-105"
                >
                    {/* Animated shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                    <div className="flex items-center justify-center gap-1.5 relative z-10">
                        <span className="text-sm animate-bounce">🚀</span>
                        <span>Start robot</span>
                        {isHoveringStart && <span className="animate-pulse">✨</span>}
                    </div>
                </button>

                {/* Pulsing glow effect */}
                <div className="absolute inset-x-2 bottom-2 h-9 bg-[#2F6BFF]/30 blur-xl rounded-lg animate-pulse pointer-events-none"></div>
            </div>
        </div>
    );
}
