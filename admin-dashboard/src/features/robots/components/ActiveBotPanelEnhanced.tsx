import { ArrowUpRight, Bot, Percent } from 'lucide-react';
import { useEffect, useState } from 'react';

interface BotSettings {
    asset: string;
    assetChangeThreshold: number;
    initialAmount: number;
    duration: number;
    indicator: string;
    strategy: string;
    profitLimit: number;
}

interface ActiveBotPanelEnhancedProps {
    settings: BotSettings;
    onStopBot: () => void;
}

export default function ActiveBotPanelEnhanced({ settings, onStopBot }: ActiveBotPanelEnhancedProps) {
    const [balance, setBalance] = useState(9980);
    const [profit, setProfit] = useState(0);
    const [timeRemaining, setTimeRemaining] = useState(settings.duration);
    const [chartFollowsAsset, setChartFollowsAsset] = useState(true);

    const handleAIIndicatorClick = () => {
        console.log('AI Indicator clicked');
    };

    // Countdown timer
    useEffect(() => {
        const interval = setInterval(() => {
            setTimeRemaining((prev) => {
                if (prev <= 1) {
                    return settings.duration;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [settings.duration]);

    // Simulate profit changes
    useEffect(() => {
        const interval = setInterval(() => {
            const change = (Math.random() - 0.5) * 5;
            setProfit((prev) => prev + change);
            setBalance((prev) => prev + change);
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getAssetCorrelation = () => 93;

    const getIndicatorName = (id: string) => {
        const indicators: Record<string, string> = {
            close_price: 'Close price',
            rsi: 'RSI',
            macd: 'MACD',
            bollinger: 'Bollinger Bands',
        };
        return indicators[id] || id;
    };

    const getStrategyName = (id: string) => {
        const strategies: Record<string, string> = {
            optimal: 'Optimal',
            conservative: 'Conservative',
            aggressive: 'Aggressive',
        };
        return strategies[id] || id;
    };

    const progressPercentage = ((settings.duration - timeRemaining) / settings.duration) * 100;

    return (
        <div className="w-full h-full flex flex-col overflow-hidden relative">
            {/* Beautiful Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#B4B4C3] via-[#B4B4C3] to-[#B4B4C3] pointer-events-none"></div>

            {/* Animated Gradient Orbs */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-500/20 via-emerald-500/15 to-transparent rounded-full blur-3xl animate-pulse-slow pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-brand-blue/15 via-purple-500/10 to-transparent rounded-full blur-3xl animate-pulse-slow pointer-events-none" style={{ animationDelay: '1s' }}></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 bg-gradient-to-br from-green-500/10 via-emerald-500/10 to-transparent rounded-full blur-3xl animate-pulse-slow pointer-events-none" style={{ animationDelay: '2s' }}></div>

            {/* Subtle Grid Pattern */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-2 space-y-2.5 scrollbar-enhanced relative z-10">
                {/* Enhanced Header with Live Status */}
                <div className="glass-card-elevated p-2.5 rounded-xl smooth-hover border border-green-400/30 shadow-xl shadow-green-500/20 backdrop-blur-xl relative overflow-hidden group animate-fade-in-up bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-transparent">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/15 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                    <div className="flex items-center justify-between relative z-10">
                        <h3 className="text-xs font-bold flex items-center gap-1.5 text-white">
                            <div className="relative w-5 h-5 rounded-lg bg-gradient-to-br from-green-500/30 to-emerald-500/30 flex items-center justify-center shadow-xl border border-green-400/40 group-hover:scale-110 transition-transform">
                                <Bot className="w-3 h-3 text-green-400 group-hover:animate-pulse" />
                                <div className="absolute inset-0 bg-gradient-to-br from-green-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></div>
                                <div className="absolute inset-0 rounded-lg bg-green-500/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                {/* Live Indicator */}
                                <div className="absolute -top-0.5 -right-0.5">
                                    <span className="relative flex h-1.5 w-1.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500 shadow-lg shadow-green-500/50"></span>
                                    </span>
                                </div>
                            </div>
                            <span className="bg-gradient-to-r from-white via-green-400 to-white bg-clip-text text-transparent group-hover:from-green-400 group-hover:via-emerald-400 group-hover:to-green-400 transition-all duration-500">Active Robot</span>
                        </h3>
                        <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-green-500/20 rounded-full border border-green-400/30 shadow-lg shadow-green-500/20">
                            <span className="text-[8px] text-green-400 font-bold">LIVE</span>
                        </span>
                    </div>
                </div>

                {/* Balance & Profit Card */}
                <div className="glass-card-elevated p-2.5 rounded-xl smooth-hover border border-green-400/30 shadow-xl shadow-green-500/20 backdrop-blur-xl relative overflow-hidden group animate-fade-in-up bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-transparent" style={{ animationDelay: '100ms' }}>
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/15 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                    <div className="flex items-start justify-between mb-1.5 relative z-10">
                        <div>
                            <div className="text-[9px] text-gray-300 mb-0.5 font-semibold">Balance</div>
                            <div className="text-lg font-black text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]">
                                ${balance.toFixed(2)}
                            </div>
                            <div className="flex items-center gap-0.5 mt-0.5">
                                <span className="text-[8px] text-gray-400">Profit</span>
                                <span className={`text-[9px] font-bold flex items-center gap-0.5 ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {profit >= 0 ? '↗' : '↘'}
                                    {profit >= 0 ? '+' : ''}${profit.toFixed(2)}
                                </span>
                            </div>
                        </div>
                        <div className="px-1.5 py-0.5 rounded-lg bg-purple-500/20 border border-purple-400/30 shadow-lg shadow-purple-500/20">
                            <span className="text-[8px] text-purple-400 font-bold">DEMO</span>
                        </div>
                    </div>

                    {/* Timer and Asset */}
                    <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-gradient-to-br from-brand-blue/15 to-purple-500/10 border border-brand-blue/40 shadow-xl relative z-10">
                        {/* Circular Timer */}
                        <div className="relative w-8 h-8 shrink-0">
                            <svg className="w-8 h-8 transform -rotate-90">
                                <circle
                                    cx="16"
                                    cy="16"
                                    r="13"
                                    stroke="rgba(59, 130, 246, 0.2)"
                                    strokeWidth="2"
                                    fill="none"
                                />
                                <circle
                                    cx="16"
                                    cy="16"
                                    r="13"
                                    stroke="url(#timerGradient)"
                                    strokeWidth="2"
                                    fill="none"
                                    strokeDasharray={`${2 * Math.PI * 13}`}
                                    strokeDashoffset={`${2 * Math.PI * 13 * (1 - progressPercentage / 100)}`}
                                    strokeLinecap="round"
                                    className="transition-all duration-1000"
                                />
                                <defs>
                                    <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="var(--color-brand-blue)" />
                                        <stop offset="100%" stopColor="var(--color-violet-600)" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-[9px] font-bold text-white drop-shadow-lg">{formatTime(timeRemaining)}</span>
                            </div>
                        </div>

                        {/* Asset Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-0.5 mb-0.5">
                                <span className="text-xs">🇨🇭</span>
                                <span className="text-white text-[10px] font-bold truncate drop-shadow-lg">USD/CHF OTC</span>
                                <span className="text-brand-blue text-[9px] font-bold drop-shadow-lg">{getAssetCorrelation()}%</span>
                            </div>
                            <div className="text-gray-400 text-[9px] truncate">
                                {getIndicatorName(settings.indicator)}
                            </div>
                        </div>
                    </div>

                    {/* AI Indicator Promo */}
                    <button
                        onClick={handleAIIndicatorClick}
                        className="mt-1.5 w-full bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-purple-500/20 border border-purple-500/40 rounded-xl p-1.5 hover:from-purple-500/30 hover:via-blue-500/30 hover:to-purple-500/30 transition-all duration-300 group/ai shadow-xl shadow-purple-500/20 hover:shadow-2xl hover:shadow-purple-500/30 hover:scale-[1.02] relative z-10"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/ai:translate-x-full transition-transform duration-700"></div>
                        <div className="flex items-center gap-1.5 relative z-10">
                            <div className="w-5 h-5 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center shadow-xl animate-pulse shrink-0">
                                <span className="text-white text-[10px]">✨</span>
                            </div>
                            <div className="flex-1 text-left min-w-0">
                                <div className="text-white text-[9px] font-bold drop-shadow-lg">Try AI Indicator</div>
                                <div className="text-gray-300 text-[8px]">+63% accuracy</div>
                            </div>
                            <svg className="w-3 h-3 text-gray-400 group-hover/ai:text-white transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </button>
                </div>

                {/* Settings Grid */}
                <div className="grid grid-cols-2 gap-2 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                    {/* Amount Card */}
                    <div className="glass-card-elevated p-2.5 rounded-xl smooth-hover border border-red-400/30 shadow-xl shadow-red-500/20 backdrop-blur-xl relative overflow-hidden group bg-gradient-to-br from-red-500/10 via-pink-500/5 to-transparent">
                        <div className="absolute inset-0 bg-gradient-to-br from-red-500/15 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                        <div className="text-[10px] font-bold flex items-center gap-1 text-white mb-1 relative z-10">
                            <div className="relative w-3.5 h-3.5 rounded-lg bg-gradient-to-br from-red-500/30 to-pink-500/30 flex items-center justify-center shadow-xl border border-red-400/40">
                                <span className="text-[9px]">💰</span>
                                <div className="absolute inset-0 rounded-lg bg-red-500/30 blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </div>
                            <span className="group-hover:text-red-400 transition-colors">Amount</span>
                        </div>
                        <div className="flex items-center gap-0.5 relative z-10">
                            <span className="text-red-400 text-xs drop-shadow-lg">↓</span>
                            <span className="text-white text-xs font-bold drop-shadow-lg">${settings.initialAmount}</span>
                        </div>
                    </div>

                    {/* Strategy Card */}
                    <div className="glass-card-elevated p-2.5 rounded-xl smooth-hover border border-purple-500/30 shadow-xl shadow-purple-500/20 backdrop-blur-xl relative overflow-hidden group bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-transparent">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/15 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                        <div className="text-[10px] font-bold flex items-center gap-1 text-white mb-1 relative z-10">
                            <div className="relative w-3.5 h-3.5 rounded-lg bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center shadow-xl border border-purple-500/40">
                                <span className="text-[8px]">🎯</span>
                                <div className="absolute inset-0 rounded-lg bg-purple-500/30 blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </div>
                            <span className="group-hover:text-purple-400 transition-colors">Strategy</span>
                        </div>
                        <div className="text-white text-xs font-bold truncate relative z-10 drop-shadow-lg">
                            {getStrategyName(settings.strategy)}
                        </div>
                    </div>
                </div>

                {/* Profit Limit */}
                <div className="glass-card-elevated px-2 py-1 rounded-xl smooth-hover border border-green-400/30 shadow-xl shadow-green-500/20 backdrop-blur-xl relative overflow-hidden group animate-fade-in-up bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-transparent" style={{ animationDelay: '300ms' }}>
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/15 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    <div className="text-[11px] font-bold flex items-center gap-1 text-white mb-0.5 relative z-10">
                        <div className="relative w-3 h-3 rounded-lg bg-gradient-to-br from-green-500/30 to-emerald-500/30 flex items-center justify-center shadow-xl border border-green-400/40">
                            <ArrowUpRight className="w-1.5 h-1.5 text-green-400" />
                            <div className="absolute inset-0 rounded-lg bg-green-500/30 blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                        <span className="group-hover:text-green-400 transition-colors">Profit Limit</span>
                    </div>
                    <div className="flex items-center justify-between relative z-10">
                        <span className="text-white text-xs font-bold drop-shadow-lg">${settings.profitLimit}</span>
                        <div className="px-1.5 py-0.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg shadow-xl shadow-green-500/50">
                            <span className="text-white text-[8px] font-bold drop-shadow-lg">ON</span>
                        </div>
                    </div>
                </div>

                {/* Asset Auto-switch */}
                <div className="glass-card-elevated px-2 py-1.5 rounded-xl smooth-hover border border-brand-blue/30 shadow-xl shadow-brand-blue/20 backdrop-blur-xl relative overflow-hidden group animate-fade-in-up bg-gradient-to-br from-brand-blue/10 via-purple-500/5 to-transparent" style={{ animationDelay: '400ms' }}>
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/15 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    <div className="text-xs font-bold flex items-center gap-1 text-white mb-0.5 relative z-10">
                        <div className="relative w-3.5 h-3.5 rounded-lg bg-gradient-to-br from-brand-blue/30 to-purple-500/30 flex items-center justify-center shadow-xl border border-brand-blue/40">
                            <Percent className="w-2 h-2 text-brand-blue" />
                            <div className="absolute inset-0 rounded-lg bg-brand-blue/30 blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                        <span className="group-hover:text-brand-blue transition-colors">Asset Auto-switch</span>
                    </div>
                    <div className="flex-1 min-w-0 relative z-10">
                        <div className="text-white text-xs font-bold drop-shadow-lg">Below {settings.assetChangeThreshold}%</div>
                        <span className="text-gray-400 text-[9px]">or market closes</span>
                    </div>
                </div>

                {/* Chart Behavior */}
                <div className="glass-card-elevated p-2.5 rounded-xl smooth-hover border border-purple-500/30 shadow-xl shadow-purple-500/20 backdrop-blur-xl relative overflow-hidden group animate-fade-in-up bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-transparent" style={{ animationDelay: '500ms' }}>
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/15 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    <div className="text-xs font-bold flex items-center gap-1 text-white mb-1.5 relative z-10">
                        <div className="relative w-4 h-4 rounded-lg bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center shadow-xl border border-purple-500/40">
                            <span className="text-[9px]">📊</span>
                            <div className="absolute inset-0 rounded-lg bg-purple-500/30 blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                        <span className="group-hover:text-purple-400 transition-colors">Chart Behavior</span>
                    </div>
                    <div className="flex items-center justify-between relative z-10">
                        <div className="flex-1 min-w-0">
                            <div className="text-white text-xs font-bold drop-shadow-lg">Follows the asset</div>
                            <div className="text-gray-400 text-[9px]">Auto-switch chart</div>
                        </div>
                        <button
                            onClick={() => setChartFollowsAsset(!chartFollowsAsset)}
                            className={`relative w-9 h-5 rounded-full transition-all flex-shrink-0 shadow-xl ${chartFollowsAsset ? 'bg-gradient-to-r from-brand-blue to-purple-500 shadow-brand-blue/50' : 'bg-gray-600 shadow-gray-600/30'
                                }`}
                        >
                            <div
                                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform shadow-xl ${chartFollowsAsset ? 'translate-x-4' : 'translate-x-0'
                                    }`}
                            />
                        </button>
                    </div>
                </div>
            </div>

            {/* Stop Button - Fixed at Bottom */}
            <div className="flex-shrink-0 p-2 border-t border-red-500/30 backdrop-blur-xl relative overflow-hidden animate-fade-in-up bg-gradient-to-t from-[#B4B4C3]/95 via-[#B4B4C3]/90 to-transparent" style={{ animationDelay: '600ms' }}>
                {/* Animated glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-pink-500/10 to-red-500/10 animate-pulse-slow opacity-50"></div>

                <button
                    onClick={onStopBot}
                    className="relative z-10 w-full bg-gradient-to-r from-red-500 via-red-600 to-red-500 hover:from-red-600 hover:via-red-700 hover:to-red-600 text-white font-bold py-3 rounded-xl transition-all duration-300 text-sm overflow-hidden group shadow-2xl shadow-red-500/50 hover:shadow-2xl hover:shadow-red-500/70 hover:scale-[1.02] active:scale-[0.98]"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500/50 via-pink-500/30 to-red-500/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="flex items-center justify-center gap-1.5 relative z-10">
                        <span className="text-sm drop-shadow-lg">🛑</span>
                        <span className="drop-shadow-lg">Stop Robot</span>
                    </div>
                </button>
            </div>
        </div >
    );
}


