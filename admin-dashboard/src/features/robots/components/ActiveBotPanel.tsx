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

interface ActiveBotPanelProps {
    settings: BotSettings;
    onStopBot: () => void;
}

export default function ActiveBotPanel({ settings, onStopBot }: ActiveBotPanelProps) {
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

    const getAssetCorrelation = () => {
        return 93;
    };

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
        <div className="w-full h-full flex flex-col overflow-hidden p-1.5 space-y-1 scrollbar-thin scrollbar-thumb-green-500/20 scrollbar-track-transparent">
            {/* Enhanced Header with Title & Live Stats - Micro Compact */}
            <div className="glass-card-elevated p-1.5 rounded-md border border-green-400/30 shadow-xl shadow-green-500/10 backdrop-blur-xl animate-fade-in-up relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-accent-orange/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="relative z-10 space-y-1">
                    {/* Title Section with Live Indicator */}
                    <div className="flex items-center gap-1">
                        <div className="relative w-5 h-5 rounded-md bg-gradient-to-br from-green-500/40 to-emerald-500/40 flex items-center justify-center shadow-lg shadow-green-500/30 border border-green-400/20">
                            <Bot className="w-2.5 h-2.5 text-green-400" />
                            <div className="absolute -top-0.5 -right-0.5">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500 shadow-lg shadow-green-500/50"></span>
                                </span>
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-[9px] font-bold flex items-center gap-1">
                                <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-green-500 bg-clip-text text-transparent truncate">
                                    Trading Robots
                                </span>
                                <span className="flex items-center gap-0.5 px-1 py-0.5 bg-green-500/20 rounded-full border border-green-400/30 flex-shrink-0">
                                    <span className="text-[7px] text-green-400 font-bold">ACTIVE</span>
                                </span>
                            </h1>
                        </div>
                    </div>

                    {/* Live Stats Grid */}
                    <div className="grid grid-cols-3 gap-0.5">
                        <div className="glass-card-elevated p-0.5 rounded-sm border border-green-400/20 backdrop-blur-sm group/stat cursor-pointer hover:border-green-400/40 transition-all bg-[radial-gradient(circle_at_50%_120%,rgba(34,197,94,0.15),transparent)]">
                            <div className="flex flex-col items-center">
                                <Bot className="w-2 h-2 text-green-400 group-hover/stat:scale-110 transition-transform" />
                                <p className="text-[7px] text-gray-400 font-medium">Active</p>
                                <p className="text-[8px] font-bold text-green-400 tabular-nums">1</p>
                            </div>
                        </div>
                        <div className="glass-card-elevated p-0.5 rounded-sm border border-green-400/20 backdrop-blur-sm group/stat cursor-pointer hover:border-green-400/40 transition-all bg-[radial-gradient(circle_at_50%_120%,rgba(34,197,94,0.15),transparent)]">
                            <div className="flex flex-col items-center">
                                <ArrowUpRight className="w-2 h-2 text-green-400 group-hover/stat:scale-110 transition-transform" />
                                <p className="text-[7px] text-gray-400 font-medium">Profit</p>
                                <p className={`text-[8px] font-bold tabular-nums ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {profit >= 0 ? '+' : ''}{profit.toFixed(2)}
                                </p>
                            </div>
                        </div>
                        <div className="glass-card-elevated p-0.5 rounded-sm border border-brand-blue/20 backdrop-blur-sm group/stat cursor-pointer hover:border-brand-blue/40 transition-all bg-[radial-gradient(circle_at_50%_120%,rgba(59,130,246,0.15),transparent)]">
                            <div className="flex flex-col items-center">
                                <Percent className="w-2 h-2 text-brand-blue group-hover/stat:scale-110 transition-transform" />
                                <p className="text-[7px] text-gray-400 font-medium">Balance</p>
                                <p className="text-[8px] font-bold text-brand-blue tabular-nums">${balance.toFixed(0)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Balance Card - Micro Compact */}
            <div className="glass-card-elevated p-1.5 rounded-md border border-green-400/30 shadow-xl shadow-green-500/10 backdrop-blur-xl animate-fade-in-up relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="flex items-start justify-between mb-1 relative z-10">
                    <div>
                        <div className="text-[8px] text-gray-300 mb-0.5 font-semibold">Balance</div>
                        <div className="text-sm font-black text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]">
                            ${balance.toFixed(2)}
                        </div>
                        <div className="flex items-center gap-0.5 mt-0.5">
                            <span className="text-[7px] text-gray-400">Profit</span>
                            <span className={`text-[8px] font-bold flex items-center gap-0.5 ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {profit >= 0 ? '↗' : '↘'}
                                {profit >= 0 ? '+' : ''}${profit.toFixed(2)}
                            </span>
                        </div>
                    </div>
                    <div className="px-1.5 py-0.5 rounded-md bg-purple-500/20 border border-purple-400/30 shadow-lg shadow-purple-500/20">
                        <span className="text-[7px] text-purple-400 font-bold">DEMO</span>
                    </div>
                </div>

                {/* Timer and Asset */}
                <div className="flex items-center gap-1.5 p-1.5 rounded-md bg-gradient-to-br from-brand-blue/10 to-purple-500/10 border border-brand-blue/30 shadow-lg relative z-10">
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
                                    <stop offset="0%" stopColor="#3B82F6" />
                                    <stop offset="100%" stopColor="#8B5CF6" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-[8px] font-bold text-white">{formatTime(timeRemaining)}</span>
                        </div>
                    </div>

                    {/* Asset Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-0.5 mb-0.5">
                            <span className="text-[9px]">🇨🇭</span>
                            <span className="text-white text-[9px] font-bold truncate">USD/CHF OTC</span>
                            <span className="text-brand-blue text-[8px] font-bold">{getAssetCorrelation()}%</span>
                        </div>
                        <div className="text-gray-400 text-[8px] truncate">
                            {getIndicatorName(settings.indicator)}
                        </div>
                    </div>
                </div>

                {/* AI Indicator Promo */}
                <button
                    onClick={handleAIIndicatorClick}
                    className="mt-1.5 w-full bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-purple-500/20 border border-purple-500/40 rounded-md p-1.5 hover:from-purple-500/30 hover:via-blue-500/30 hover:to-purple-500/30 transition-all duration-300 group/ai shadow-xl shadow-purple-500/20 hover:shadow-2xl hover:shadow-purple-500/30 hover:scale-105 relative z-10"
                >
                    <div className="flex items-center gap-1">
                        <div className="w-5 h-5 bg-gradient-to-br from-purple-500 to-blue-500 rounded-md flex items-center justify-center shadow-lg animate-pulse shrink-0">
                            <span className="text-white text-[9px]">✨</span>
                        </div>
                        <div className="flex-1 text-left min-w-0">
                            <div className="text-white text-[8px] font-bold">Try AI Indicator</div>
                            <div className="text-gray-300 text-[7px]">+63% accuracy</div>
                        </div>
                        <svg className="w-3 h-3 text-gray-400 group-hover/ai:text-white transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </button>
            </div>

            {/* Settings Grid */}
            <div className="grid grid-cols-2 gap-2">
                <div className="glass-card-elevated p-2.5 rounded-xl border border-brand-blue/20 shadow-lg shadow-brand-blue/10 backdrop-blur-xl animate-fade-in-up relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="text-[11px] text-gray-300 mb-0.5 font-semibold relative z-10">Amount</div>
                    <div className="flex items-center gap-1 relative z-10">
                        <span className="text-red-400 text-xs">↓</span>
                        <span className="text-white text-xs font-bold">${settings.initialAmount}</span>
                    </div>
                </div>

                <div className="glass-card-elevated p-2.5 rounded-xl border border-purple-500/20 shadow-lg shadow-purple-500/10 backdrop-blur-xl animate-fade-in-up relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="text-[11px] text-gray-300 mb-0.5 font-semibold relative z-10">Strategy</div>
                    <div className="text-white text-xs font-bold truncate relative z-10">
                        {getStrategyName(settings.strategy)}
                    </div>
                </div>
            </div>

            {/* Profit Limit */}
            <div className="glass-card-elevated p-2.5 rounded-xl border border-green-400/30 shadow-lg shadow-green-500/10 backdrop-blur-xl animate-fade-in-up relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="text-[11px] text-gray-300 mb-1.5 font-semibold relative z-10">Profit limit</div>
                <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-1.5">
                        <div className="w-7 h-7 bg-green-500/20 rounded-lg flex items-center justify-center border border-green-400/30 shadow-lg shadow-green-500/20">
                            <ArrowUpRight className="w-3.5 h-3.5 text-green-400" />
                        </div>
                        <span className="text-white text-xs font-bold">${settings.profitLimit}</span>
                    </div>
                    <div className="px-2.5 py-0.5 bg-green-500 rounded-lg shadow-lg shadow-green-500/30">
                        <span className="text-white text-[10px] font-bold">ON</span>
                    </div>
                </div>
            </div>

            {/* Asset Auto-switch */}
            <div className="glass-card-elevated p-2.5 rounded-xl border border-brand-blue/20 shadow-lg shadow-brand-blue/10 backdrop-blur-xl animate-fade-in-up relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="text-[11px] text-gray-300 mb-1.5 font-semibold relative z-10">Asset auto-switch</div>
                <div className="flex items-center gap-1.5 relative z-10">
                    <div className="w-7 h-7 bg-brand-blue/20 rounded-lg flex items-center justify-center border border-brand-blue/30 shadow-lg shadow-brand-blue/20">
                        <Percent className="w-3.5 h-3.5 text-brand-blue" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-white text-[11px] font-bold">Below {settings.assetChangeThreshold}%</div>
                        <span className="text-gray-400 text-[10px]">or market closes</span>
                    </div>
                </div>
            </div>

            {/* Chart Behavior */}
            <div className="glass-card-elevated p-3 rounded-2xl border border-purple-500/20 shadow-xl shadow-purple-500/10 backdrop-blur-xl animate-fade-in-up relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="text-xs text-gray-300 mb-2 font-semibold relative z-10">Chart behavior</div>
                <div className="flex items-center justify-between relative z-10">
                    <div className="flex-1 min-w-0">
                        <div className="text-white text-xs font-bold">Follows the asset</div>
                        <div className="text-gray-400 text-xs">Auto-switch chart</div>
                    </div>
                    <button
                        onClick={() => setChartFollowsAsset(!chartFollowsAsset)}
                        className={`relative w-10 h-6 rounded-full transition-colors flex-shrink-0 shadow-lg ${chartFollowsAsset ? 'bg-brand-blue shadow-brand-blue/30' : 'bg-gray-600'
                            }`}
                    >
                        <div
                            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-lg ${chartFollowsAsset ? 'translate-x-4' : 'translate-x-0'
                                }`}
                        />
                    </button>
                </div>
            </div>

            {/* Stop Button */}
            <button
                onClick={onStopBot}
                className="w-full bg-gradient-to-r from-red-500 via-red-600 to-red-500 hover:from-red-600 hover:via-red-700 hover:to-red-600 text-white font-bold py-3.5 rounded-xl transition-all duration-300 text-sm relative overflow-hidden group shadow-2xl shadow-red-500/50 hover:shadow-2xl hover:shadow-red-500/70 hover:scale-105 animate-fade-in-up"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <div className="flex items-center justify-center gap-2 relative z-10">
                    <span className="text-lg">🛑</span>
                    <span>Stop the robot</span>
                </div>
            </button>
        </div>
    );
}


