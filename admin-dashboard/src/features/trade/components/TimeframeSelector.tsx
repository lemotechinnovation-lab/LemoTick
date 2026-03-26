import { Clock } from 'lucide-react';
import { useState } from 'react';

interface Timeframe {
    label: string;
    value: number;
    seconds: number;
}

interface TimeframeSelectorProps {
    selectedGranularity: number;
    onGranularityChange: (granularity: number) => void;
}

const TIMEFRAMES: Timeframe[] = [
    { label: '1s', value: 1, seconds: 1 },
    { label: '5s', value: 5, seconds: 5 },
    { label: '10s', value: 10, seconds: 10 },
    { label: '15s', value: 15, seconds: 15 },
    { label: '30s', value: 30, seconds: 30 },
    { label: '1m', value: 60, seconds: 60 },
    { label: '2m', value: 120, seconds: 120 },
    { label: '3m', value: 180, seconds: 180 },
    { label: '5m', value: 300, seconds: 300 },
    { label: '10m', value: 600, seconds: 600 },
    { label: '15m', value: 900, seconds: 900 },
    { label: '30m', value: 1800, seconds: 1800 },
    { label: '1h', value: 3600, seconds: 3600 },
    { label: '2h', value: 7200, seconds: 7200 },
    { label: '4h', value: 14400, seconds: 14400 },
    { label: '8h', value: 28800, seconds: 28800 },
    { label: '1d', value: 86400, seconds: 86400 },
];

export default function TimeframeSelector({ selectedGranularity, onGranularityChange }: TimeframeSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);

    const selectedTimeframe = TIMEFRAMES.find((tf) => tf.value === selectedGranularity);

    return (
        <div className="relative">
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 bg-[#0B0633]/90 hover:bg-gray-700/90 rounded-lg transition-colors border border-[#16124A]/50"
            >
                <Clock className="w-4 h-4 text-gray-200" />
                <span className="text-white font-semibold text-sm">{selectedTimeframe?.label || '1m'}</span>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div className="fixed inset-0 z-20" onClick={() => setIsOpen(false)} />

                    {/* Menu */}
                    <div className="absolute top-full right-0 mt-2 w-48 bg-[#0B0633] border border-[#16124A] rounded-lg shadow-xl z-30 max-h-96 overflow-y-auto">
                        <div className="py-2">
                            {TIMEFRAMES.map((tf) => (
                                <button
                                    key={tf.value}
                                    onClick={() => {
                                        onGranularityChange(tf.value);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full px-4 py-2 text-left hover:bg-gray-700/50 transition-colors flex items-center justify-between ${selectedGranularity === tf.value ? 'bg-[#2F6BFF]/10 text-violet-400' : 'text-white'
                                        }`}
                                >
                                    <span className="text-sm font-medium">{tf.label}</span>
                                    {selectedGranularity === tf.value && (
                                        <div className="w-2 h-2 rounded-full bg-[#2F6BFF]" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
