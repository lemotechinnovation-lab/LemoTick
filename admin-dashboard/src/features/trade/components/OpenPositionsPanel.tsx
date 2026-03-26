import { Briefcase, TrendingDown, TrendingUp, X } from 'lucide-react';
import { useEffect, useState } from 'react';

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
    currentTick?: number;
    totalTicks?: number;
    contractValue?: number;
    durationType?: 'tick' | 'minute';
    startTime?: number; // timestamp in seconds
    endTime?: number; // timestamp in seconds
    canSell?: boolean;
}

interface OpenPositionsPanelProps {
    isOpen: boolean;
    onClose: () => void;
    positions: Position[];
    onSellPosition?: (positionId: string) => void;
    onDismissPosition?: (positionId: string) => void;
}

export default function OpenPositionsPanel({ isOpen, onClose, positions, onSellPosition, onDismissPosition }: OpenPositionsPanelProps) {
    const activePositions = positions.filter(p => p.status === 'active');
    const closedPositions = positions.filter(p => p.status === 'won' || p.status === 'lost');
    const [currentTime, setCurrentTime] = useState(Date.now() / 1000);

    // Update current time every second for countdown
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(Date.now() / 1000);
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const formatCountdown = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed top-23 left-69 bottom-11 w-[220px] bg-[#0B0633] border-r border-[#2F6BFF]/20 z-30 flex flex-col shadow-2xl animate-slideDown">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#2F6BFF]/20 bg-[#16124A]">
                <h3 className="text-white font-bold text-sm">Open Positions</h3>
                <button
                    onClick={onClose}
                    className="text-gray-200 hover:text-[#efdede] hover:bg-[#16124A] rounded-lg p-1 transition-all duration-300"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                {activePositions.length === 0 && closedPositions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full px-4 text-center">
                        <div className="w-16 h-16 bg-[#16124A]/50 rounded-full flex items-center justify-center mb-3">
                            <Briefcase className="w-8 h-8 text-gray-300" />
                        </div>
                        <p className="text-gray-200 text-xs font-medium">You have no open positions.</p>
                    </div>
                ) : (
                    <div className="p-3 space-y-2">
                        {/* Closed Positions */}
                        {closedPositions.map((position) => (
                            <div
                                key={position.id}
                                className="bg-[#16124A] rounded-xl border border-teal-500/30 p-3 hover:border-teal-500/50 transition-all duration-300 hover:scale-105 shadow-lg"
                            >
                                <div className="flex items-center justify-between mb-1.5">
                                    <div className="flex items-center gap-1.5">
                                        <svg className="w-3.5 h-3.5 text-teal-400" viewBox="0 0 16 16" fill="none">
                                            <path d="M13.5 4.5L6 12L2.5 8.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        <span className="text-[10px] font-medium text-teal-400">Closed</span>
                                    </div>
                                    <button
                                        onClick={() => onDismissPosition?.(position.id)}
                                        className="text-gray-200 hover:text-[#efdede] transition-colors"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                                <div className={`text-base font-bold ${position.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {position.profit >= 0 ? '+' : ''}{position.profit.toFixed(2)} USD
                                </div>
                            </div>
                        ))}

                        {/* Active Positions */}
                        {activePositions.map((position) => {
                            const isTick = position.durationType === 'tick';
                            const isMinute = position.durationType === 'minute';

                            // Calculate time progress
                            let timeRemaining = 0;
                            if (isMinute && position.startTime && position.endTime) {
                                timeRemaining = Math.max(0, position.endTime - currentTime);
                            }

                            return (
                                <div
                                    key={position.id}
                                    className="bg-[#16124A] rounded border border-[#16124A] overflow-hidden"
                                >
                                    {/* Position Header */}
                                    <div className="px-2.5 py-2 bg-[#16124A] border-b border-[#2F6BFF]/10">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-4 h-4 bg-[#16124A] rounded flex items-center justify-center text-[8px]">
                                                📊
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-[11px] font-semibold text-white">{position.symbol}</div>
                                                {/* Duration Countdown - Always show */}
                                                <div className="text-[10px] text-gray-200">
                                                    {isTick && position.currentTick && position.totalTicks ? (
                                                        `Tick ${position.currentTick} of ${position.totalTicks}`
                                                    ) : isMinute && position.startTime && position.endTime ? (
                                                        formatCountdown(timeRemaining)
                                                    ) : (
                                                        'Active'
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1 mt-1">
                                            {position.type === 'Rise' ? (
                                                <>
                                                    <TrendingUp className="w-3 h-3 text-green-400" />
                                                    <span className="text-[10px] text-green-400 font-medium">Rise</span>
                                                </>
                                            ) : (
                                                <>
                                                    <TrendingDown className="w-3 h-3 text-red-400" />
                                                    <span className="text-[10px] text-red-400 font-medium">Fall</span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Progress Bar Only */}
                                    {isTick && position.currentTick && position.totalTicks && (
                                        <div className="px-2.5 py-1.5 border-b border-[#2F6BFF]/10">
                                            <div className="flex gap-0.5">
                                                {Array.from({ length: position.totalTicks }).map((_, i) => (
                                                    <div
                                                        key={i}
                                                        className={`h-1 flex-1 rounded-sm ${i < position.currentTick
                                                            ? position.type === 'Rise'
                                                                ? 'bg-green-500'
                                                                : 'bg-red-500'
                                                            : 'bg-[#16124A]'
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {isMinute && position.startTime && position.endTime && (
                                        <div className="px-2.5 py-1.5 border-b border-[#2F6BFF]/10">
                                            <div className="w-full bg-[#16124A] rounded-sm h-1 overflow-hidden">
                                                <div
                                                    className={`h-full transition-all duration-1000 ${position.type === 'Rise' ? 'bg-green-500' : 'bg-red-500'
                                                        }`}
                                                    style={{ width: `${Math.min(100, ((currentTime - position.startTime) / (position.endTime - position.startTime)) * 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Position Details */}
                                    <div className="px-2.5 py-2 space-y-1 text-[10px] border-b border-[#2F6BFF]/10">
                                        <div className="flex justify-between">
                                            <span className="text-gray-200">Total profit/loss:</span>
                                            <span className={`font-medium ${position.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                {position.profit >= 0 ? '+' : ''}{position.profit.toFixed(2)} USD
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-200">Contract value:</span>
                                            <span className="text-white font-medium">
                                                {position.contractValue?.toFixed(2) || position.stake.toFixed(2)} USD
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-200">Stake:</span>
                                            <span className="text-white">{position.stake.toFixed(2)} USD</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-200">Potential payout:</span>
                                            <span className="text-white">{position.payout.toFixed(2)} USD</span>
                                        </div>
                                    </div>

                                    {/* Sell Button or Resale Notice */}
                                    <div className="px-2.5 py-2">
                                        {position.canSell ? (
                                            <button
                                                onClick={() => onSellPosition?.(position.id)}
                                                className="w-full py-1.5 bg-[#16124A] hover:bg-[#2F6BFF]/30 text-white text-[10px] font-medium rounded transition-colors"
                                            >
                                                Sell
                                            </button>
                                        ) : (
                                            <div className="text-center">
                                                <span className="text-[10px] text-gray-300">Resale not offered</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Total P/L Footer */}
            {(activePositions.length > 0 || closedPositions.length > 0) && (
                <div className="px-4 py-2.5 border-t border-[#16124A] bg-[#0B0633]">
                    <div className="flex justify-between items-center">
                        <span className="text-[11px] text-gray-200 font-medium">Total P/L:</span>
                        <span className={`text-sm font-bold ${positions.reduce((sum, p) => sum + p.profit, 0) >= 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                            {positions.reduce((sum, p) => sum + p.profit, 0) >= 0 ? '+' : ''}
                            {positions.reduce((sum, p) => sum + p.profit, 0).toFixed(2)} USD
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
