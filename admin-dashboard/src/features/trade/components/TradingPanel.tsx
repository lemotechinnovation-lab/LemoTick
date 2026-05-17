import { validateWithToast, validationToast } from '@/lib/validation-toast';
import { ChevronRight, Clock, DollarSign, TrendingDown, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import TradeTypesModal from './TradeTypesModal';

interface Position {
    id: string;
    symbol: string;
    type: 'Rise' | 'Fall';
    stake: number;
    payout: number;
    entryPrice: number;
    currentPrice: number;
    profit: number;
    status: 'active' | 'won' | 'lost';
}

interface TradingPanelProps {
    symbol: string;
    currentPrice: number;
    onTradePlaced: (tradeData: any) => void;
    positions: Position[];
}

export default function TradingPanel({ symbol, onTradePlaced, positions }: TradingPanelProps) {
    const [tradeType, setTradeType] = useState<'Rise' | 'Fall'>('Rise');
    const [stake, setStake] = useState('10');
    const [duration, setDuration] = useState('5');
    const [durationType, setDurationType] = useState<'ticks' | 'minutes'>('ticks');
    const [selectedTradeType, setSelectedTradeType] = useState('rise_fall');
    const [isTradeTypesModalOpen, setIsTradeTypesModalOpen] = useState(false);

    const handleTrade = async () => {
        const stakeAmount = parseFloat(stake);
        const durationAmount = parseInt(duration);

        // Validate stake amount with toast feedback
        if (!validateWithToast.amount(stakeAmount, 1, 10000)) {
            return;
        }

        // Validate duration
        if (!validateWithToast.required(duration, 'Duration')) {
            return;
        }

        if (isNaN(durationAmount) || durationAmount <= 0) {
            validationToast.formError('Duration must be a positive number', 'Duration');
            return;
        }

        // Check market status (simulated - you can replace with real market status check)
        const currentHour = new Date().getHours();
        const isMarketOpen = currentHour >= 0 && currentHour <= 23; // Forex is 24/7, adjust as needed

        if (!isMarketOpen) {
            validationToast.trading.marketClosed();
            return;
        }

        // Simulate balance check (replace with real balance check)
        const userBalance = 5000; // This should come from your user store/context
        if (stakeAmount > userBalance) {
            validationToast.trading.insufficientBalance();
            return;
        }

        // Show loading toast for trade execution
        const tradeToast = validationToast.customValidation(
            `Placing ${tradeType} trade for ${symbol}`,
            {
                loadingMessage: 'Executing trade...',
                successMessage: 'Trade placed successfully!',
                errorMessage: 'Trade execution failed',
                duration: 3000,
                delay: 1500,
            }
        );

        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Simulate trade execution (replace with real API call)
            const success = Math.random() > 0.1; // 90% success rate for demo

            if (success) {
                onTradePlaced({
                    symbol,
                    type: tradeType,
                    stake: stakeAmount,
                    duration: durationAmount,
                    durationType,
                });

                tradeToast.success(`${tradeType} trade executed successfully!`);
                validationToast.trading.tradeSuccess(tradeType, stakeAmount);
            } else {
                tradeToast.error('Trade execution failed. Please try again.');
            }
        } catch (error) {
            validationToast.serverError('Failed to execute trade. Please check your connection.');
        }
    };

    const payout = parseFloat(stake) * 1.95;

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
                {/* Trade Type Header - Enhanced */}
                <div className="glass-card-elevated p-2.5 rounded-xl smooth-hover border border-brand-blue/30 shadow-xl shadow-brand-blue/20 backdrop-blur-xl relative overflow-hidden group animate-fade-in-up bg-gradient-to-br from-brand-blue/10 via-purple-500/5 to-transparent">
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/10 via-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    <button
                        onClick={() => setIsTradeTypesModalOpen(true)}
                        className="w-full flex items-center justify-between text-left relative z-10"
                    >
                        <div className="flex items-center gap-2">
                            <div className="relative w-6 h-6 rounded-lg bg-gradient-to-br from-brand-blue/30 to-purple-500/30 flex items-center justify-center shadow-xl border border-brand-blue/40 group-hover:scale-110 transition-transform">
                                <span className="text-xs">📊</span>
                                <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></div>
                                <div className="absolute inset-0 rounded-lg bg-brand-blue/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </div>
                            <span className="text-white text-xs font-bold bg-gradient-to-r from-white via-brand-blue to-white bg-clip-text text-transparent group-hover:from-brand-blue group-hover:via-purple-400 group-hover:to-brand-blue transition-all duration-500">Rise/Fall</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-brand-blue transition-colors" />
                    </button>
                </div>

                {/* Trade Type Selector - Enhanced */}
                <div className="grid grid-cols-2 gap-2.5 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                    <button
                        onClick={() => setTradeType('Rise')}
                        className={`flex items-center justify-center gap-1.5 px-3 py-3 rounded-xl text-xs font-bold transition-all duration-300 relative overflow-hidden group ${tradeType === 'Rise'
                            ? 'bg-gradient-to-r from-green-500 via-green-600 to-green-500 text-white shadow-xl shadow-green-500/50 scale-105'
                            : 'bg-gradient-to-br from-brand-blue/15 to-purple-500/10 text-gray-100 hover:from-brand-blue/25 hover:to-purple-500/20 hover:scale-105 border border-brand-blue/40'
                            }`}
                    >
                        {tradeType === 'Rise' && (
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                        )}
                        <TrendingUp className="w-4 h-4 relative z-10" />
                        <span className="relative z-10">Rise</span>
                    </button>
                    <button
                        onClick={() => setTradeType('Fall')}
                        className={`flex items-center justify-center gap-1.5 px-3 py-3 rounded-xl text-xs font-bold transition-all duration-300 relative overflow-hidden group ${tradeType === 'Fall'
                            ? 'bg-gradient-to-r from-red-500 via-red-600 to-red-500 text-white shadow-xl shadow-red-500/50 scale-105'
                            : 'bg-gradient-to-br from-brand-blue/15 to-purple-500/10 text-gray-100 hover:from-brand-blue/25 hover:to-purple-500/20 hover:scale-105 border border-brand-blue/40'
                            }`}
                    >
                        {tradeType === 'Fall' && (
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                        )}
                        <TrendingDown className="w-4 h-4 relative z-10" />
                        <span className="relative z-10">Fall</span>
                    </button>
                </div>

                {/* Stake - Enhanced Card */}
                <div className="glass-card-elevated p-2.5 rounded-xl smooth-hover border border-green-400/30 shadow-xl shadow-green-500/20 backdrop-blur-xl relative overflow-hidden group animate-fade-in-up bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-transparent" style={{ animationDelay: '200ms' }}>
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/15 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    <label className="text-xs font-bold flex items-center gap-1.5 text-white mb-2 relative z-10">
                        <div className="relative w-5 h-5 rounded-lg bg-gradient-to-br from-green-500/30 to-emerald-500/30 flex items-center justify-center shadow-xl border border-green-400/40 group-hover:scale-110 transition-transform">
                            <DollarSign className="w-3 h-3 text-green-400" />
                            <div className="absolute inset-0 rounded-lg bg-green-500/30 blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                        <span className="group-hover:text-green-400 transition-colors">Stake</span>
                    </label>
                    <div className="relative group/input z-10">
                        <input
                            type="number"
                            value={stake}
                            onChange={(e) => setStake(e.target.value)}
                            className="w-full bg-gradient-to-br from-green-500/15 to-emerald-500/10 border border-green-400/40 rounded-xl px-2.5 py-2 text-white text-xs font-semibold focus:outline-none focus:border-green-400/70 focus:shadow-xl focus:shadow-green-400/30 transition-all hover:border-green-400/60 hover:shadow-lg hover:shadow-green-400/20"
                            placeholder="10.00"
                            min="1"
                            step="1"
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-green-400 text-[10px] font-bold bg-green-500/30 px-1.5 py-0.5 rounded-md border border-green-400/40 shadow-lg">USD</div>
                    </div>
                    <div className="flex gap-1.5 mt-2 relative z-10">
                        {['10', '25', '50', '100'].map((amount) => (
                            <button
                                key={amount}
                                onClick={() => setStake(amount)}
                                className="flex-1 px-2 py-1.5 text-[10px] bg-gradient-to-br from-brand-blue/15 to-purple-500/10 hover:from-brand-blue/25 hover:to-purple-500/20 text-gray-100 rounded-lg transition-all border border-brand-blue/40 hover:border-brand-blue/60 font-semibold"
                            >
                                ${amount}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Duration - Enhanced Card */}
                <div className="glass-card-elevated p-2.5 rounded-xl smooth-hover border border-accent-orange/30 shadow-xl shadow-accent-orange/20 backdrop-blur-xl relative overflow-hidden group animate-fade-in-up bg-gradient-to-br from-accent-orange/10 via-yellow-500/5 to-transparent" style={{ animationDelay: '300ms' }}>
                    <div className="absolute inset-0 bg-gradient-to-br from-accent-orange/15 to-yellow-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    <label className="text-xs font-bold flex items-center gap-1.5 text-white mb-2 relative z-10">
                        <div className="relative w-5 h-5 rounded-lg bg-gradient-to-br from-accent-orange/30 to-yellow-500/30 flex items-center justify-center shadow-xl border border-accent-orange/40 group-hover:scale-110 transition-transform">
                            <Clock className="w-3 h-3 text-accent-orange" />
                            <div className="absolute inset-0 rounded-lg bg-accent-orange/30 blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                        <span className="group-hover:text-accent-orange transition-colors">Duration</span>
                    </label>
                    <div className="flex gap-1.5 mb-2 relative z-10">
                        <button
                            onClick={() => setDurationType('ticks')}
                            className={`flex-1 px-2 py-1.5 rounded-lg text-[10px] font-semibold transition-all ${durationType === 'ticks'
                                ? 'bg-gradient-to-r from-accent-orange to-yellow-500 text-white shadow-lg shadow-accent-orange/30'
                                : 'bg-gradient-to-br from-brand-blue/15 to-purple-500/10 text-gray-100 hover:from-brand-blue/25 hover:to-purple-500/20 border border-brand-blue/40'
                                }`}
                        >
                            Ticks
                        </button>
                        <button
                            onClick={() => setDurationType('minutes')}
                            className={`flex-1 px-2 py-1.5 rounded-lg text-[10px] font-semibold transition-all ${durationType === 'minutes'
                                ? 'bg-gradient-to-r from-accent-orange to-yellow-500 text-white shadow-lg shadow-accent-orange/30'
                                : 'bg-gradient-to-br from-brand-blue/15 to-purple-500/10 text-gray-100 hover:from-brand-blue/25 hover:to-purple-500/20 border border-brand-blue/40'
                                }`}
                        >
                            Minutes
                        </button>
                    </div>
                    <div className="relative z-10">
                        <input
                            type="number"
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            className="w-full bg-gradient-to-br from-accent-orange/15 to-yellow-500/10 border border-accent-orange/40 rounded-xl px-2.5 py-2 text-white text-xs font-semibold focus:outline-none focus:border-accent-orange/70 focus:shadow-xl focus:shadow-accent-orange/30 transition-all hover:border-accent-orange/60 hover:shadow-lg hover:shadow-accent-orange/20"
                            placeholder="5"
                            min="1"
                            step="1"
                        />
                    </div>
                </div>

                {/* Payout Info - Enhanced Card */}
                <div className="glass-card-elevated p-2.5 rounded-xl smooth-hover border border-purple-500/30 shadow-xl shadow-purple-500/20 backdrop-blur-xl relative overflow-hidden group animate-fade-in-up bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-transparent" style={{ animationDelay: '400ms' }}>
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/15 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    <div className="space-y-1.5 relative z-10">
                        <div className="flex justify-between text-xs">
                            <span className="text-gray-200 font-semibold">Stake</span>
                            <span className="text-white font-bold font-tabular">${parseFloat(stake || '0').toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-gray-200 font-semibold">Payout</span>
                            <span className="text-green-400 font-bold font-tabular">${payout.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-xs pt-1.5 border-t border-purple-500/30">
                            <span className="text-gray-200 font-semibold">Potential Profit</span>
                            <span className="text-green-400 font-black font-tabular drop-shadow-lg">${(payout - parseFloat(stake || '0')).toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Open Positions */}
                {positions.length > 0 && (
                    <div className="glass-card-elevated p-2.5 rounded-xl smooth-hover border border-brand-blue/30 shadow-xl shadow-brand-blue/20 backdrop-blur-xl relative overflow-hidden group animate-fade-in-up bg-gradient-to-br from-brand-blue/10 via-purple-500/5 to-transparent" style={{ animationDelay: '500ms' }}>
                        <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/10 via-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <h3 className="text-xs font-bold text-white mb-2 relative z-10">Open Positions ({positions.length})</h3>
                        <div className="space-y-1.5 relative z-10 max-h-[200px] overflow-y-auto scrollbar-enhanced">
                            {positions.map((position) => (
                                <div
                                    key={position.id}
                                    className="bg-gradient-to-br from-brand-blue/15 to-purple-500/10 rounded-lg p-2 text-xs border border-brand-blue/40"
                                >
                                    <div className="flex justify-between items-center mb-1">
                                        <span className={`font-semibold ${position.type === 'Rise' ? 'text-green-400' : 'text-red-400'
                                            }`}>
                                            {position.type}
                                        </span>
                                        <span className="text-gray-200 font-tabular">${position.stake.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-[10px] text-gray-200">
                                        <span>Entry: <span className="font-tabular">{position.entryPrice.toFixed(5)}</span></span>
                                        <span className={`font-tabular ${position.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            {position.profit >= 0 ? '+' : ''}{position.profit.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Trade Button - Fixed at Bottom with Enhanced Style */}
            <div className="flex-shrink-0 p-2.5 border-t border-brand-blue/30 backdrop-blur-xl relative overflow-hidden animate-fade-in-up bg-gradient-to-t from-[#B4B4C3]/95 via-[#B4B4C3]/90 to-transparent" style={{ animationDelay: '600ms' }}>
                {/* Animated glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-brand-blue/10 via-purple-500/10 to-brand-blue/10 animate-pulse-slow opacity-50"></div>

                <button
                    onClick={handleTrade}
                    className={`relative z-10 w-full py-3 rounded-xl font-bold text-sm transition-all duration-300 overflow-hidden group shadow-2xl hover:scale-[1.02] active:scale-[0.98] ${tradeType === 'Rise'
                        ? 'bg-gradient-to-r from-green-500 via-green-600 to-green-500 hover:from-green-600 hover:via-green-700 hover:to-green-600 text-white shadow-green-500/50 hover:shadow-2xl hover:shadow-green-500/70'
                        : 'bg-gradient-to-r from-red-500 via-red-600 to-red-500 hover:from-red-600 hover:via-red-700 hover:to-red-600 text-white shadow-red-500/50 hover:shadow-2xl hover:shadow-red-500/70'
                        }`}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${tradeType === 'Rise'
                        ? 'bg-gradient-to-r from-green-500/50 via-emerald-500/30 to-green-500/50'
                        : 'bg-gradient-to-r from-red-500/50 via-pink-500/30 to-red-500/50'
                        }`}></div>
                    <div className="flex items-center justify-center gap-2 relative z-10">
                        <span className="drop-shadow-lg">{tradeType === 'Rise' ? '🚀' : '📉'}</span>
                        <span className="drop-shadow-lg">Buy {tradeType}</span>
                    </div>
                </button>
            </div>

            {/* Trade Types Modal */}
            <TradeTypesModal
                isOpen={isTradeTypesModalOpen}
                onClose={() => setIsTradeTypesModalOpen(false)}
                selectedType={selectedTradeType}
                onTypeSelect={setSelectedTradeType}
            />
        </div>
    );
}


