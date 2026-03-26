import { ArrowUpRight, Percent } from 'lucide-react';
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
        // Add your AI Indicator logic here
    };

    // Countdown timer
    useEffect(() => {
        const interval = setInterval(() => {
            setTimeRemaining((prev) => {
                if (prev <= 1) {
                    return settings.duration; // Reset
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
        return 93; // Mock value
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
        <div className="w-80 bg-gradient-to-b from-[#0B0633] via-[#16124A] to-[#0B0633] border-l border-green-500/30 flex-shrink-0 flex flex-col h-full relative overflow-hidden">
            {/* Animated Background Effects - More vibrant for active state */}
            <div className="absolute inset-0 opacity-40 pointer-events-none">
                <div className="absolute top-0 right-0 w-40 h-40 bg-green-500 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#2F6BFF] rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-purple-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            {/* Header with Active Glow */}
            <div className="px-3 py-2 border-b border-green-500/30 bg-gradient-to-r from-green-500/20 via-[#2F6BFF]/10 to-transparent relative z-10">
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-ping absolute"></div>
                        <div className="w-2 h-2 bg-green-500 rounded-full shadow-lg shadow-green-500/50"></div>
                    </div>
                    <h2 className="text-white text-sm font-semibold">Active robot</h2>
                    <div className="ml-auto flex items-center gap-1.5">
                        <span className="text-[10px] text-green-500 font-bold animate-pulse">● LIVE</span>
                        <div className="flex gap-0.5">
                            <div className="w-1 h-3 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-1 h-3 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-1 h-3 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content - No Scroll */}
            <div className="flex-1 p-3 pt-2 space-y-2 overflow-hidden pointer-events-auto relative z-10">
                {/* Balance Card - Replaces Asset section */}
                <div className="bg-gradient-to-br from-[#16124A] via-[#1E1854] to-[#16124A] rounded-lg p-2 border border-[#2F6BFF]/30 shadow-xl shadow-[#2F6BFF]/20 relative overflow-hidden">
                    {/* Animated gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#2F6BFF]/5 to-transparent animate-shimmer"></div>

                    <div className="flex items-start justify-between mb-1 relative z-10">
                        <div>
                            <div className="text-white text-lg font-bold animate-pulse">${balance.toFixed(2)}</div>
                            <div className="flex items-center gap-1 mt-0.5">
                                <span className="text-gray-400 text-[9px]">Profit</span>
                                <span className={`text-[9px] font-semibold flex items-center gap-0.5 ${profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    {profit >= 0 ? '↗' : '↘'}
                                    {profit >= 0 ? '+' : ''}{profit.toFixed(2)}
                                </span>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-gray-400 text-[9px]">Demo</div>
                        </div>
                    </div>

                    {/* Timer and Asset */}
                    <div className="flex items-center gap-2 mt-1.5 relative z-10">
                        {/* Circular Timer with Glow */}
                        <div className="relative w-11 h-11">
                            {/* Outer glow ring */}
                            <div className="absolute inset-0 bg-[#2F6BFF]/20 rounded-full blur-md animate-pulse"></div>

                            <svg className="w-11 h-11 transform -rotate-90 relative z-10">
                                <circle
                                    cx="22"
                                    cy="22"
                                    r="18"
                                    stroke="#16124A"
                                    strokeWidth="2"
                                    fill="none"
                                />
                                <circle
                                    cx="22"
                                    cy="22"
                                    r="18"
                                    stroke="url(#timerGradient)"
                                    strokeWidth="2"
                                    fill="none"
                                    strokeDasharray={`${2 * Math.PI * 18}`}
                                    strokeDashoffset={`${2 * Math.PI * 18 * (1 - progressPercentage / 100)}`}
                                    strokeLinecap="round"
                                    className="transition-all duration-1000"
                                />
                                <defs>
                                    <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#2F6BFF" />
                                        <stop offset="50%" stopColor="#4A5FD9" />
                                        <stop offset="100%" stopColor="#2F6BFF" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-white text-[9px] font-bold">{formatTime(timeRemaining)}</span>
                            </div>
                        </div>

                        {/* Asset Info */}
                        <div className="flex-1">
                            <div className="flex items-center gap-1 mb-0.5">
                                <span className="text-sm">🇨🇭</span>
                                <span className="text-white text-[10px] font-medium">USD/CHF OTC</span>
                                <span className="text-[#2F6BFF] text-[10px] font-semibold">{getAssetCorrelation()}%</span>
                            </div>
                            <div className="text-gray-400 text-[9px]">
                                {getIndicatorName(settings.indicator)}
                            </div>
                        </div>
                    </div>

                    {/* AI Indicator Promo */}
                    <a
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            handleAIIndicatorClick();
                        }}
                        className="mt-1.5 w-full bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-purple-500/20 border border-purple-500/40 rounded-lg p-1.5 hover:from-purple-500/30 hover:via-blue-500/30 hover:to-purple-500/30 transition-all duration-300 cursor-pointer relative z-10 block no-underline group shadow-lg shadow-purple-500/20 hover:shadow-xl hover:shadow-purple-500/30 hover:scale-105"
                    >
                        {/* Animated shine effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 rounded-lg"></div>

                        <div className="flex items-center gap-1.5 relative z-10">
                            <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center shadow-lg animate-pulse">
                                <span className="text-white text-xs">✨</span>
                            </div>
                            <div className="flex-1 text-left">
                                <div className="text-white text-[10px] font-semibold">Try AI Indicator</div>
                                <div className="text-gray-300 text-[8px]">Increase accuracy up to 63%</div>
                            </div>
                            <svg className="w-2.5 h-2.5 text-gray-400 group-hover:text-[#efdede] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </a>
                </div>

                {/* Amount & Strategy - Replaces Amount & Duration grid */}
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="text-gray-400 text-[9px] mb-0.5 block">Amount</label>
                        <div className="bg-[#16124A] text-white rounded-lg px-2 py-1.5 text-[11px] flex items-center gap-1">
                            <span className="text-red-500 text-xs">↓</span>
                            <span>${settings.initialAmount}</span>
                        </div>
                    </div>
                    <div>
                        <label className="text-gray-400 text-[9px] mb-0.5 block">Strategy</label>
                        <div className="bg-[#16124A] text-white rounded-lg px-2 py-1.5 text-[11px]">
                            {getStrategyName(settings.strategy)}
                        </div>
                    </div>
                </div>

                {/* Profit Limit - Matches Indicator section height */}
                <div>
                    <p className="text-gray-400 text-[9px] mb-0.5">Profit limit</p>
                    <div className="bg-gradient-to-r from-[#16124A] to-[#1E1854] rounded-lg p-2 flex items-center justify-between border border-green-500/20">
                        <div className="flex items-center gap-1.5">
                            <div className="w-6 h-6 bg-green-500/20 rounded flex items-center justify-center">
                                <ArrowUpRight className="w-3 h-3 text-green-500" />
                            </div>
                            <span className="text-white text-[11px] font-medium">${settings.profitLimit}</span>
                        </div>
                        <div className="w-7 h-7 bg-green-500 rounded-lg flex items-center justify-center">
                            <span className="text-white text-[9px] font-semibold">ON</span>
                        </div>
                    </div>
                </div>

                {/* Asset Change - Matches Strategy section height */}
                <div>
                    <p className="text-gray-400 text-[9px] mb-0.5">Asset auto-switch</p>
                    <div className="bg-gradient-to-r from-[#16124A] to-[#1E1854] rounded-lg p-2 flex items-center justify-between border border-[#2F6BFF]/20">
                        <div className="flex items-center gap-1.5">
                            <div className="w-6 h-6 bg-blue-500/20 rounded flex items-center justify-center">
                                <Percent className="w-3 h-3 text-blue-500" />
                            </div>
                            <div className="text-left">
                                <div className="text-white text-[11px] font-medium">Below {settings.assetChangeThreshold}%</div>
                                <span className="text-gray-400 text-[9px]">or market closes</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Chart Follows Asset - Matches Profit Limit section */}
                <div>
                    <label className="text-gray-400 text-[9px] mb-0.5 block">Chart behavior</label>
                    <div className="bg-gradient-to-r from-[#16124A] to-[#1E1854] rounded-lg p-2 flex items-center justify-between border border-[#2F6BFF]/20">
                        <div className="flex-1">
                            <div className="text-white text-[11px] font-semibold">Follows the asset</div>
                            <div className="text-gray-400 text-[9px]">Auto-switch chart</div>
                        </div>
                        <button
                            onClick={() => setChartFollowsAsset(!chartFollowsAsset)}
                            className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${chartFollowsAsset ? 'bg-[#2F6BFF]' : 'bg-gray-600'
                                }`}
                        >
                            <div
                                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${chartFollowsAsset ? 'translate-x-4' : 'translate-x-0'
                                    }`}
                            />
                        </button>
                    </div>
                </div>
            </div>

            {/* Stop Button */}
            <div className="p-3 border-t border-red-500/30 bg-gradient-to-t from-[#0B0633] to-transparent relative z-10">
                <button
                    onClick={onStopBot}
                    className="w-full bg-gradient-to-r from-red-500 via-red-600 to-red-500 hover:from-red-600 hover:via-red-700 hover:to-red-600 text-white font-bold py-3 rounded-lg transition-all duration-300 text-sm relative overflow-hidden group shadow-xl shadow-red-500/50 hover:shadow-2xl hover:shadow-red-500/70 hover:scale-105"
                >
                    {/* Animated shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                    <div className="flex items-center justify-center gap-2 relative z-10">
                        <span className="text-lg">🛑</span>
                        <span>Stop the robot</span>
                    </div>
                </button>

                {/* Pulsing glow effect */}
                <div className="absolute inset-x-3 bottom-3 h-12 bg-red-500/30 blur-xl rounded-lg animate-pulse pointer-events-none"></div>
            </div>
        </div>
    );
}
