import { X } from 'lucide-react';

interface ChartTypesModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedChartType: 'area' | 'candle' | 'hollow' | 'ohlc';
    selectedInterval: number;
    onChartTypeChange: (type: 'area' | 'candle' | 'hollow' | 'ohlc') => void;
    onIntervalChange: (interval: number) => void;
}

const CHART_TYPES = [
    { id: 'area', label: 'Area', icon: '📈' },
    { id: 'candle', label: 'Candle', icon: '🕯️' },
    { id: 'hollow', label: 'Hollow', icon: '📊' },
    { id: 'ohlc', label: 'OHLC', icon: '📉' },
] as const;

const TIME_INTERVALS = [
    { label: '1 tick', value: 0 },
    { label: '1 minute', value: 60 },
    { label: '2 minutes', value: 120 },
    { label: '3 minutes', value: 180 },
    { label: '5 minutes', value: 300 },
    { label: '10 minutes', value: 600 },
    { label: '15 minutes', value: 900 },
    { label: '30 minutes', value: 1800 },
    { label: '1 hour', value: 3600 },
    { label: '2 hours', value: 7200 },
    { label: '4 hours', value: 14400 },
    { label: '8 hours', value: 28800 },
    { label: '1 day', value: 86400 },
];

export default function ChartTypesModal({
    isOpen,
    onClose,
    selectedChartType,
    selectedInterval,
    onChartTypeChange,
    onIntervalChange,
}: ChartTypesModalProps) {
    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fadeIn" onClick={onClose} />

            {/* Modal */}
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] bg-[#0B0633] rounded-2xl shadow-2xl z-50 border border-[#2F6BFF]/30 animate-slideUp">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#2F6BFF]/20">
                    <h2 className="text-section-header text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">Chart Types</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-200 hover:text-[#efdede] hover:bg-[#16124A] rounded-lg p-1.5 transition-all duration-300"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Chart Types */}
                    <div className="grid grid-cols-4 gap-3 mb-6">
                        {CHART_TYPES.map((type) => (
                            <button
                                key={type.id}
                                onClick={() => onChartTypeChange(type.id)}
                                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${selectedChartType === type.id
                                    ? 'border-[#2F6BFF] bg-[#2F6BFF]/20 shadow-lg shadow-[#2F6BFF]/30'
                                    : 'border-[#16124A] hover:border-[#2F6BFF]/50 bg-[#16124A]/30 hover:bg-[#16124A]/50'
                                    }`}
                            >
                                <div className="w-10 h-10 flex items-center justify-center mb-1.5">
                                    {type.id === 'area' && (
                                        <svg className="w-8 h-8" viewBox="0 0 40 40" fill="none">
                                            <path d="M5 30 L10 25 L15 28 L20 20 L25 23 L30 15 L35 18 L35 35 L5 35 Z" fill="#8B5CF6" opacity="0.3" stroke="#8B5CF6" strokeWidth="2" />
                                        </svg>
                                    )}
                                    {type.id === 'candle' && (
                                        <svg className="w-8 h-8" viewBox="0 0 40 40" fill="none">
                                            <line x1="12" y1="8" x2="12" y2="32" stroke="#EF4444" strokeWidth="1" />
                                            <rect x="9" y="12" width="6" height="12" fill="#EF4444" />
                                            <line x1="28" y1="5" x2="28" y2="30" stroke="#22C55E" strokeWidth="1" />
                                            <rect x="25" y="10" width="6" height="15" fill="#22C55E" />
                                        </svg>
                                    )}
                                    {type.id === 'hollow' && (
                                        <svg className="w-8 h-8" viewBox="0 0 40 40" fill="none">
                                            <line x1="12" y1="8" x2="12" y2="32" stroke="#EF4444" strokeWidth="1" />
                                            <rect x="9" y="12" width="6" height="12" stroke="#EF4444" strokeWidth="2" fill="none" />
                                            <line x1="28" y1="5" x2="28" y2="30" stroke="#22C55E" strokeWidth="1" />
                                            <rect x="25" y="10" width="6" height="15" stroke="#22C55E" strokeWidth="2" fill="none" />
                                        </svg>
                                    )}
                                    {type.id === 'ohlc' && (
                                        <svg className="w-8 h-8" viewBox="0 0 40 40" fill="none">
                                            <line x1="12" y1="8" x2="12" y2="32" stroke="#EF4444" strokeWidth="2" />
                                            <line x1="8" y1="12" x2="12" y2="12" stroke="#EF4444" strokeWidth="2" />
                                            <line x1="12" y1="24" x2="16" y2="24" stroke="#EF4444" strokeWidth="2" />
                                            <line x1="28" y1="5" x2="28" y2="30" stroke="#22C55E" strokeWidth="2" />
                                            <line x1="24" y1="10" x2="28" y2="10" stroke="#22C55E" strokeWidth="2" />
                                            <line x1="28" y1="25" x2="32" y2="25" stroke="#22C55E" strokeWidth="2" />
                                        </svg>
                                    )}
                                </div>
                                <span className={`text-small-dashboard ${selectedChartType === type.id ? 'text-violet-400' : 'text-gray-100'
                                    }`}>
                                    {type.label}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Time Interval */}
                    <div>
                        <h3 className="text-data-label text-[#efdede] drop-shadow-[0_0_3px_rgba(160,167,181,0.2)] mb-2">Time Interval</h3>
                        <div className="grid grid-cols-4 gap-1.5">
                            {TIME_INTERVALS.map((interval) => {
                                const isTickInterval = interval.value === 0;
                                const isDisabled = isTickInterval && selectedChartType !== 'area';

                                return (
                                    <button
                                        key={interval.value}
                                        onClick={() => !isDisabled && onIntervalChange(interval.value)}
                                        disabled={isDisabled}
                                        className={`px-3 py-1.5 rounded text-small-dashboard transition-all ${selectedInterval === interval.value
                                            ? 'bg-[#2F6BFF] text-white'
                                            : isDisabled
                                                ? 'bg-[#0B0633]/30 text-gray-600 cursor-not-allowed'
                                                : 'bg-[#0B0633]/50 text-gray-100 hover:bg-[#16124A]'
                                            }`}
                                    >
                                        {interval.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
