import { Search, Settings, Trash2, X } from 'lucide-react';
import { useState } from 'react';

interface IndicatorsModalProps {
    isOpen: boolean;
    onClose: () => void;
    activeIndicators: string[];
    onToggleIndicator: (indicator: string) => void;
    onEditIndicator: (indicatorId: string) => void;
    onDeleteIndicator: (indicatorId: string) => void;
}

type IndicatorCategory = 'active' | 'momentum' | 'trend' | 'volatility' | 'moving_averages' | 'others';

interface Indicator {
    id: string;
    name: string;
    category: IndicatorCategory;
    icon: string;
}

const INDICATORS: Indicator[] = [
    // Momentum (8 items)
    { id: 'awesome_oscillator', name: 'Awesome Oscillator', category: 'momentum', icon: '📊' },
    { id: 'detrended_price', name: 'Detrended Price Oscillator', category: 'momentum', icon: '📈' },
    { id: 'macd', name: 'MACD', category: 'momentum', icon: '📉' },
    { id: 'price_rate_change', name: 'Price Rate of Change', category: 'momentum', icon: '💹' },
    { id: 'rsi', name: 'Relative Strength Index (RSI)', category: 'momentum', icon: '📊' },
    { id: 'stochastic_oscillator', name: 'Stochastic Oscillator', category: 'momentum', icon: '📈' },
    { id: 'stochastic_momentum', name: 'Stochastic Momentum Index', category: 'momentum', icon: '📉' },
    { id: 'williams_percent', name: "William's Percent Range", category: 'momentum', icon: '📊' },

    // Volatility (2 items)
    { id: 'bollinger_bands', name: 'Bollinger Bands', category: 'volatility', icon: '📊' },
    { id: 'donchian_channel', name: 'Donchian Channel', category: 'volatility', icon: '📈' },

    // Moving Averages (3 items)
    { id: 'moving_average', name: 'Moving Average (MA)', category: 'moving_averages', icon: '📈' },
    { id: 'moving_average_envelope', name: 'Moving Average Envelope', category: 'moving_averages', icon: '📊' },
    { id: 'rainbow_moving_average', name: 'Rainbow Moving Average', category: 'moving_averages', icon: '🌈' },

    // Trend (6 items)
    { id: 'aroon', name: 'Aroon', category: 'trend', icon: '📊' },
    { id: 'adx_dms', name: 'ADX/DMS', category: 'trend', icon: '📊' },
    { id: 'commodity_channel', name: 'Commodity Channel Index', category: 'trend', icon: '💹' },
    { id: 'ichimoku_clouds', name: 'Ichimoku Clouds', category: 'trend', icon: '☁️' },
    { id: 'parabolic_sar', name: 'Parabolic SAR', category: 'trend', icon: '📉' },
    { id: 'zig_zag', name: 'Zig Zag', category: 'trend', icon: '⚡' },

    // Others (2 items)
    { id: 'alligator', name: 'Alligator', category: 'others', icon: '🐊' },
    { id: 'fractal_chaos', name: 'Fractal Chaos Band', category: 'others', icon: '🔮' },
];

const CATEGORIES = [
    { id: 'active', label: 'Active', icon: '⚡' },
    { id: 'momentum', label: 'Momentum', icon: '📊' },
    { id: 'trend', label: 'Trend', icon: '📈' },
    { id: 'volatility', label: 'Volatility', icon: '📉' },
    { id: 'moving_averages', label: 'Moving averages', icon: '〰️' },
    { id: 'others', label: 'Others', icon: '⋯' },
] as const;

export default function IndicatorsModal({
    isOpen,
    onClose,
    activeIndicators,
    onToggleIndicator,
    onEditIndicator,
    onDeleteIndicator,
}: IndicatorsModalProps) {
    const [selectedCategory, setSelectedCategory] = useState<IndicatorCategory>('active');
    const [searchQuery, setSearchQuery] = useState('');

    if (!isOpen) return null;

    // Define bottom pane indicators (oscillators only, not overlay indicators)
    const bottomPaneIndicatorIds = [
        // Momentum indicators (all go to bottom)
        'awesome_oscillator', 'detrended_price', 'macd', 'price_rate_change', 'rsi',
        'stochastic_oscillator', 'stochastic_momentum', 'williams_percent',
        // Trend indicators (only oscillator-based ones)
        'aroon', 'adx_dms', 'commodity_channel'
        // Note: ichimoku_clouds, parabolic_sar, zig_zag are overlay indicators on main chart
    ];

    // Count active bottom pane indicators
    const activeBottomIndicators = activeIndicators.filter(id => bottomPaneIndicatorIds.includes(id));
    const bottomPaneIsFull = activeBottomIndicators.length >= 2;

    const filteredIndicators = INDICATORS.filter((indicator) => {
        const matchesCategory = selectedCategory === 'active'
            ? activeIndicators.includes(indicator.id)
            : indicator.category === selectedCategory;
        const matchesSearch = indicator.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const hasActiveIndicators = activeIndicators.length > 0;

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fadeIn" onClick={onClose} />

            {/* Modal */}
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[700px] h-[480px] bg-[#0B0633] rounded-2xl shadow-2xl z-50 border border-[#2F6BFF]/30 animate-slideUp flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-3 border-b border-[#2F6BFF]/20">
                    <h2 className="text-section-header text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">Indicators</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-200 hover:text-[#efdede] hover:bg-[#16124A] rounded-lg p-1.5 transition-all duration-300"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Left Sidebar - Categories */}
                    <div className="w-48 border-r border-[#16124A] bg-[#0B0633]/30">
                        {CATEGORIES.map((category) => {
                            const isActive = category.id === 'active';
                            const count = isActive ? activeIndicators.length : 0;

                            return (
                                <button
                                    key={category.id}
                                    onClick={() => setSelectedCategory(category.id as IndicatorCategory)}
                                    className={`w-full px-3 py-2 text-left flex items-center gap-2 transition-colors relative ${selectedCategory === category.id
                                        ? 'bg-[#2F6BFF]/10 text-violet-400 border-l-2 border-[#2F6BFF]'
                                        : 'text-gray-100 hover:bg-[#16124A]/30'
                                        }`}
                                >
                                    <span className="text-body-dashboard">{category.icon}</span>
                                    <span className="text-data-label flex-1">{category.label}</span>
                                    {isActive && count > 0 && (
                                        <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1.5 bg-[#2F6BFF] text-white text-[9px] font-semibold rounded-full">
                                            {count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Right Content - Indicators List */}
                    <div className="flex-1 flex flex-col">
                        {/* Search Bar */}
                        <div className="p-3 border-b border-[#2F6BFF]/20">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-200" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-3 py-1.5 bg-[#0B0633] border border-[#16124A] rounded text-white text-body-dashboard focus:outline-none focus:border-[#2F6BFF]"
                                />
                            </div>
                        </div>

                        {/* Indicators List - No Scroll */}
                        <div className="flex-1 p-3">
                            {selectedCategory === 'active' && !hasActiveIndicators ? (
                                <div className="flex flex-col items-center justify-center h-full text-center">
                                    <div className="w-20 h-20 mb-2 opacity-50">
                                        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <circle cx="100" cy="100" r="80" fill="#374151" opacity="0.3" />
                                            <path d="M70 110 Q85 90 100 110 T130 110" stroke="#6B7280" strokeWidth="3" fill="none" />
                                            <circle cx="75" cy="85" r="8" fill="#6B7280" />
                                            <circle cx="125" cy="85" r="8" fill="#6B7280" />
                                        </svg>
                                    </div>
                                    <p className="text-gray-200 text-body-dashboard">You have no active indicators yet.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-1.5">
                                    {filteredIndicators.map((indicator) => {
                                        const isActive = activeIndicators.includes(indicator.id);
                                        const isBottomPane = bottomPaneIndicatorIds.includes(indicator.id);
                                        const isDisabled = !isActive && isBottomPane && bottomPaneIsFull;

                                        return (
                                            <div
                                                key={indicator.id}
                                                className={`w-full px-3 py-1.5 rounded-lg flex items-center gap-2 transition-colors ${isActive
                                                    ? 'bg-[#2F6BFF]/10 border border-[#2F6BFF]/30'
                                                    : isDisabled
                                                        ? 'opacity-40 cursor-not-allowed'
                                                        : 'hover:bg-[#16124A]/30'
                                                    }`}
                                            >
                                                <span className="text-body-dashboard">{indicator.icon}</span>
                                                {selectedCategory === 'active' && isActive && (
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onEditIndicator(indicator.id);
                                                            }}
                                                            className="p-1 hover:bg-[#16124A] rounded transition-colors"
                                                            title="Settings"
                                                        >
                                                            <Settings className="w-3 h-3 text-gray-200 hover:text-violet-400" />
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onDeleteIndicator(indicator.id);
                                                            }}
                                                            className="p-1 hover:bg-[#16124A] rounded transition-colors"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-3 h-3 text-gray-200 hover:text-red-400" />
                                                        </button>
                                                    </div>
                                                )}
                                                <button
                                                    onClick={() => !isDisabled && onToggleIndicator(indicator.id)}
                                                    disabled={isDisabled}
                                                    className="flex items-center gap-2 flex-1 text-left disabled:cursor-not-allowed"
                                                    title={isDisabled ? 'Maximum 2 bottom pane indicators reached' : ''}
                                                >
                                                    <span className={`text-data-label ${isActive ? 'text-violet-400' : 'text-gray-100'}`}>
                                                        {indicator.name}
                                                    </span>
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
