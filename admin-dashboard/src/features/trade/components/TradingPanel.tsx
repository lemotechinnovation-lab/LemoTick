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

export default function TradingPanel({ symbol, currentPrice, onTradePlaced, positions }: TradingPanelProps) {
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
        <div className="flex flex-col h-full bg-gradient-to-b from-[#0B0633] via-[#16124A] to-[#0B0633] relative overflow-hidden min-h-0">
            {/* Animated Background Effects */}
            <div className="absolute inset-0 opacity-30 pointer-events-none">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#2F6BFF] rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#FFA62B] rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            {/* Trade Type Header */}
            <div className="px-2 py-2 border-b border-[#2F6BFF]/30 bg-gradient-to-r from-[#2F6BFF]/10 to-transparent relative z-10 shrink-0">
                <button
                    onClick={() => setIsTradeTypesModalOpen(true)}
                    className="w-full flex items-center justify-between text-left bg-gradient-to-r from-[#16124A] to-[#1E1854] hover:from-[#1E1854] hover:to-[#16124A] rounded-lg px-2 py-2 transition-all duration-300 group border border-[#2F6BFF]/20 hover:border-[#2F6BFF]/50 hover:shadow-lg hover:shadow-[#2F6BFF]/20"
                >
                    <div className="flex items-center gap-1.5">
                        <div className="flex gap-1">
                            <span className="text-sm">📈</span>
                            <span className="text-sm">📉</span>
                        </div>
                        <span className="text-white text-xs font-semibold">Rise/Fall</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-200 group-hover:text-[#2F6BFF] transition-colors" />
                </button>
            </div>

            {/* Trade Type Selector */}
            <div className="px-2 py-2 border-b border-[#2F6BFF]/30 relative z-10 shrink-0">
                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={() => setTradeType('Rise')}
                        className={`flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 relative overflow-hidden group ${tradeType === 'Rise'
                            ? 'bg-gradient-to-r from-[#2F6BFF] via-[#4A5FD9] to-[#2F6BFF] text-white shadow-xl shadow-[#2F6BFF]/50 scale-105'
                            : 'bg-gradient-to-r from-[#16124A] to-[#1E1854] text-gray-100 hover:from-[#1E1854] hover:to-[#16124A] hover:scale-105 border border-[#2F6BFF]/20'
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
                        className={`flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 relative overflow-hidden group ${tradeType === 'Fall'
                            ? 'bg-gradient-to-r from-[#FFA62B] via-[#FF8C42] to-[#FFA62B] text-white shadow-xl shadow-[#FFA62B]/50 scale-105'
                            : 'bg-gradient-to-r from-[#16124A] to-[#1E1854] text-gray-100 hover:from-[#1E1854] hover:to-[#16124A] hover:scale-105 border border-[#2F6BFF]/20'
                            }`}
                    >
                        {tradeType === 'Fall' && (
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                        )}
                        <TrendingDown className="w-4 h-4 relative z-10" />
                        <span className="relative z-10">Fall</span>
                    </button>
                </div>
            </div>

            {/* Trade Types Modal */}
            <TradeTypesModal
                isOpen={isTradeTypesModalOpen}
                onClose={() => setIsTradeTypesModalOpen(false)}
                selectedType={selectedTradeType}
                onTypeSelect={setSelectedTradeType}
            />

            {/* Trade Parameters - Scrollable Content */}
            <div className="flex-1 px-2 py-2 space-y-2.5 relative z-10 overflow-y-auto min-h-0">{/* Added min-h-0 */}
                {/* Stake */}
                <div>
                    <label className="block text-[10px] text-gray-100 mb-1">
                        <DollarSign className="w-3 h-3 inline mr-1" />
                        Stake
                    </label>
                    <input
                        type="number"
                        value={stake}
                        onChange={(e) => setStake(e.target.value)}
                        className="w-full px-2 py-2 bg-[#16124A] border border-[#2F6BFF]/30 rounded-lg text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#2F6BFF]"
                        placeholder="10.00"
                        min="1"
                        step="1"
                    />
                    <div className="flex gap-1.5 mt-1.5">
                        {['10', '25', '50', '100'].map((amount) => (
                            <button
                                key={amount}
                                onClick={() => setStake(amount)}
                                className="flex-1 px-1.5 py-1 text-[10px] bg-[#16124A] hover:bg-[#2F6BFF]/30 text-gray-100 rounded transition-colors"
                            >
                                ${amount}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Duration */}
                <div>
                    <label className="block text-[10px] text-gray-100 mb-1">
                        <Clock className="w-3 h-3 inline mr-1" />
                        Duration
                    </label>
                    <div className="flex gap-1.5 mb-1.5">
                        <button
                            onClick={() => setDurationType('ticks')}
                            className={`flex-1 px-2 py-1.5 rounded-lg text-[10px] font-medium transition-colors ${durationType === 'ticks'
                                ? 'bg-[#2F6BFF] text-white'
                                : 'bg-[#16124A] text-gray-100 hover:bg-[#2F6BFF]/30'
                                }`}
                        >
                            Ticks
                        </button>
                        <button
                            onClick={() => setDurationType('minutes')}
                            className={`flex-1 px-2 py-1.5 rounded-lg text-[10px] font-medium transition-colors ${durationType === 'minutes'
                                ? 'bg-[#2F6BFF] text-white'
                                : 'bg-[#16124A] text-gray-100 hover:bg-[#2F6BFF]/30'
                                }`}
                        >
                            Minutes
                        </button>
                    </div>
                    <input
                        type="number"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        className="w-full px-2 py-2 bg-[#16124A] border border-[#2F6BFF]/30 rounded-lg text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#2F6BFF]"
                        placeholder="5"
                        min="1"
                        step="1"
                    />
                </div>

                {/* Payout Info */}
                <div className="bg-gradient-to-br from-[#16124A] via-[#1E1854] to-[#16124A] rounded-lg p-2.5 space-y-1.5 border border-[#2F6BFF]/20 shadow-lg">
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-200">Stake</span>
                        <span className="text-white font-semibold font-tabular">${parseFloat(stake || '0').toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-200">Payout</span>
                        <span className="text-green-400 font-semibold font-tabular">${payout.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs pt-1.5 border-t border-[#2F6BFF]/30">
                        <span className="text-gray-200">Potential Profit</span>
                        <span className="text-green-400 font-bold font-tabular">${(payout - parseFloat(stake || '0')).toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {/* Trade Button - Fixed at Bottom */}
            <div className="p-2 border-t border-[#2F6BFF]/30 bg-gradient-to-t from-[#0B0633] to-transparent relative z-10 shrink-0">
                <button
                    onClick={handleTrade}
                    className={`w-full py-3 rounded-xl font-bold text-sm transition-all duration-300 transform hover:scale-105 relative overflow-hidden group ${tradeType === 'Rise'
                        ? 'bg-gradient-to-r from-green-500 via-green-600 to-green-500 hover:from-green-600 hover:via-green-700 hover:to-green-600 text-white shadow-xl shadow-green-500/50'
                        : 'bg-gradient-to-r from-red-500 via-red-600 to-red-500 hover:from-red-600 hover:via-red-700 hover:to-red-600 text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)] shadow-xl shadow-red-500/50'
                        }`}
                >
                    {/* Animated shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                    <span className="relative z-10">
                        {tradeType === 'Rise' ? '🚀 Buy Rise' : '📉 Buy Fall'}
                    </span>
                </button>
            </div>

            {/* Open Positions */}
            {positions.length > 0 && (
                <div className="border-t border-[#16124A] p-2 shrink-0 relative z-10 max-h-[200px] overflow-y-auto">
                    <h3 className="text-[10px] text-gray-100 mb-2">Open Positions ({positions.length})</h3>
                    <div className="space-y-1.5">
                        {positions.map((position) => (
                            <div
                                key={position.id}
                                className="bg-[#16124A]/50 rounded-lg p-2 text-xs"
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
    );
}
