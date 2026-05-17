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
            {/* Backdrop with enhanced blur */}
            <div className="fixed inset-0 bg-black/70 backdrop-blur-xl z-40 animate-fadeIn" onClick={onClose}>
                {/* Animated Background Orbs */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-blue/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            {/* Modal with enhanced glass effect */}
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] bg-gradient-to-br from-[#0B0633]/95 via-[#16124A]/95 to-[#0B0633]/95 backdrop-blur-2xl rounded-2xl shadow-2xl shadow-brand-blue/30 z-50 border border-brand-blue/30 animate-slideUp">
                {/* Header with gradient */}
                <div className="relative flex items-center justify-between px-6 py-4 border-b border-brand-blue/20 bg-gradient-to-r from-brand-blue/10 to-transparent">
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-blue/5 to-transparent opacity-50" />
                    <h2 className="relative text-xl font-bold bg-gradient-to-r from-brand-blue via-violet-400 to-brand-blue bg-clip-text text-transparent">
                        Chart Types
                    </h2>
                    <button
                        onClick={onClose}
                        className="relative text-gray-300 hover:text-white hover:bg-brand-blue/20 rounded-lg p-2 transition-all duration-300 hover:scale-110 hover:rotate-90"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Chart Types Grid */}
                    <div className="grid grid-cols-4 gap-3">
                        {CHART_TYPES.map((type, index) => (
                            <button
                                key={type.id}
                                onClick={() => onChartTypeChange(type.id)}
                                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-110 animate-fade-in-up ${selectedChartType === type.id
                                    ? 'border-brand-blue bg-gradient-to-br from-brand-blue/30 to-violet-600/30 shadow-lg shadow-brand-blue/50'
                                    : 'border-[#16124A] hover:border-brand-blue/50 bg-[#16124A]/30 hover:bg-[#16124A]/50'
                                    }`}
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <div className="w-10 h-10 flex items-center justify-center mb-2">
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
                                <span className={`text-sm font-medium transition-colors ${selectedChartType === type.id ? 'text-violet-400' : 'text-gray-200'
                                    }`}>
                                    {type.label}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Time Interval Section */}
                    <div className="space-y-3 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                        <h3 className="text-base font-semibold bg-gradient-to-r from-accent-orange to-yellow-400 bg-clip-text text-transparent flex items-center gap-2">
                            <svg className="w-5 h-5 text-accent-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Time Interval
                        </h3>
                        <div className="grid grid-cols-4 gap-2">
                            {TIME_INTERVALS.map((interval, index) => {
                                const isTickInterval = interval.value === 0;
                                const isDisabled = isTickInterval && selectedChartType !== 'area';

                                return (
                                    <button
                                        key={interval.value}
                                        onClick={() => !isDisabled && onIntervalChange(interval.value)}
                                        disabled={isDisabled}
                                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 animate-fade-in-up ${selectedInterval === interval.value
                                            ? 'bg-gradient-to-r from-accent-orange to-yellow-500 text-white shadow-lg shadow-accent-orange/30 scale-105'
                                            : isDisabled
                                                ? 'bg-[#0B0633]/30 text-gray-600 cursor-not-allowed'
                                                : 'bg-[#0B0633]/50 text-gray-200 hover:bg-[#16124A] hover:scale-105 hover:border-accent-orange/30 border border-transparent'
                                            }`}
                                        style={{ animationDelay: `${250 + index * 30}ms` }}
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


