import { ChevronDown, Search, Star, TrendingDown, TrendingUp } from 'lucide-react';
import { useState } from 'react';

interface Market {
    symbol: string;
    name: string;
    category: 'derived' | 'forex' | 'stock_indices' | 'cryptocurrencies' | 'commodities';
    subcategory?: string;
    icon?: string;
    isClosed?: boolean;
}

interface MarketSelectorProps {
    selectedSymbol: string;
    onSymbolChange: (symbol: string) => void;
    currentPrice: number;
    priceChange: number;
    priceChangePercent: number;
}

const MARKETS: Market[] = [
    // Derived - Continuous Indices
    { symbol: '1HZ10V', name: 'Volatility 10 (1s) Index', category: 'derived', subcategory: 'Continuous Indices', icon: '📊' },
    { symbol: 'R_10', name: 'Volatility 10 Index', category: 'derived', subcategory: 'Continuous Indices', icon: '📊' },
    { symbol: '1HZ15V', name: 'Volatility 15 (1s) Index', category: 'derived', subcategory: 'Continuous Indices', icon: '📊' },
    { symbol: '1HZ25V', name: 'Volatility 25 (1s) Index', category: 'derived', subcategory: 'Continuous Indices', icon: '📊' },
    { symbol: 'R_25', name: 'Volatility 25 Index', category: 'derived', subcategory: 'Continuous Indices', icon: '📊' },
    { symbol: '1HZ30V', name: 'Volatility 30 (1s) Index', category: 'derived', subcategory: 'Continuous Indices', icon: '📊' },
    { symbol: '1HZ50V', name: 'Volatility 50 (1s) Index', category: 'derived', subcategory: 'Continuous Indices', icon: '📊' },
    { symbol: 'R_50', name: 'Volatility 50 Index', category: 'derived', subcategory: 'Continuous Indices', icon: '📊' },
    { symbol: '1HZ75V', name: 'Volatility 75 (1s) Index', category: 'derived', subcategory: 'Continuous Indices', icon: '📊' },
    { symbol: 'R_75', name: 'Volatility 75 Index', category: 'derived', subcategory: 'Continuous Indices', icon: '📊' },
    { symbol: '1HZ90V', name: 'Volatility 90 (1s) Index', category: 'derived', subcategory: 'Continuous Indices', icon: '📊' },
    { symbol: '1HZ100V', name: 'Volatility 100 (1s) Index', category: 'derived', subcategory: 'Continuous Indices', icon: '📊' },
    { symbol: 'R_100', name: 'Volatility 100 Index', category: 'derived', subcategory: 'Continuous Indices', icon: '📊' },

    // Derived - Crash/Boom Indices
    { symbol: 'BOOM50', name: 'Boom 50 Index', category: 'derived', subcategory: 'Crash/Boom Indices', icon: '💥' },
    { symbol: 'BOOM150N', name: 'Boom 150 Index', category: 'derived', subcategory: 'Crash/Boom Indices', icon: '💥' },
    { symbol: 'BOOM300N', name: 'Boom 300 Index', category: 'derived', subcategory: 'Crash/Boom Indices', icon: '💥' },
    { symbol: 'BOOM500', name: 'Boom 500 Index', category: 'derived', subcategory: 'Crash/Boom Indices', icon: '💥' },
    { symbol: 'BOOM600', name: 'Boom 600 Index', category: 'derived', subcategory: 'Crash/Boom Indices', icon: '💥' },
    { symbol: 'BOOM900', name: 'Boom 900 Index', category: 'derived', subcategory: 'Crash/Boom Indices', icon: '💥' },
    { symbol: 'BOOM1000', name: 'Boom 1000 Index', category: 'derived', subcategory: 'Crash/Boom Indices', icon: '💥' },
    { symbol: 'CRASH50', name: 'Crash 50 Index', category: 'derived', subcategory: 'Crash/Boom Indices', icon: '📉' },
    { symbol: 'CRASH150N', name: 'Crash 150 Index', category: 'derived', subcategory: 'Crash/Boom Indices', icon: '📉' },
    { symbol: 'CRASH300N', name: 'Crash 300 Index', category: 'derived', subcategory: 'Crash/Boom Indices', icon: '📉' },
    { symbol: 'CRASH500', name: 'Crash 500 Index', category: 'derived', subcategory: 'Crash/Boom Indices', icon: '📉' },
    { symbol: 'CRASH600', name: 'Crash 600 Index', category: 'derived', subcategory: 'Crash/Boom Indices', icon: '📉' },
    { symbol: 'CRASH900', name: 'Crash 900 Index', category: 'derived', subcategory: 'Crash/Boom Indices', icon: '📉' },
    { symbol: 'CRASH1000', name: 'Crash 1000 Index', category: 'derived', subcategory: 'Crash/Boom Indices', icon: '📉' },

    // Derived - Daily Reset Indices
    { symbol: 'RDBEAR', name: 'Bear Market Index', category: 'derived', subcategory: 'Daily Reset Indices', icon: '🐻' },
    { symbol: 'RDBULL', name: 'Bull Market Index', category: 'derived', subcategory: 'Daily Reset Indices', icon: '🐂' },

    // Derived - Jump Indices
    { symbol: 'JD10', name: 'Jump 10 Index', category: 'derived', subcategory: 'Jump Indices', icon: '⬆️' },
    { symbol: 'JD25', name: 'Jump 25 Index', category: 'derived', subcategory: 'Jump Indices', icon: '⬆️' },
    { symbol: 'JD50', name: 'Jump 50 Index', category: 'derived', subcategory: 'Jump Indices', icon: '⬆️' },
    { symbol: 'JD75', name: 'Jump 75 Index', category: 'derived', subcategory: 'Jump Indices', icon: '⬆️' },
    { symbol: 'JD100', name: 'Jump 100 Index', category: 'derived', subcategory: 'Jump Indices', icon: '⬆️' },

    // Derived - Range Break Indices
    { symbol: 'RB100', name: 'Range Break 100 Index', category: 'derived', subcategory: 'Range Break Indices', icon: '📊' },
    { symbol: 'RB200', name: 'Range Break 200 Index', category: 'derived', subcategory: 'Range Break Indices', icon: '📊' },

    // Derived - Step Indices
    { symbol: 'stpRNG', name: 'Step Index 100', category: 'derived', subcategory: 'Step Indices', icon: '📶' },
    { symbol: 'stpRNG2', name: 'Step Index 200', category: 'derived', subcategory: 'Step Indices', icon: '📶' },
    { symbol: 'stpRNG3', name: 'Step Index 300', category: 'derived', subcategory: 'Step Indices', icon: '📶' },
    { symbol: 'stpRNG4', name: 'Step Index 400', category: 'derived', subcategory: 'Step Indices', icon: '📶' },
    { symbol: 'stpRNG5', name: 'Step Index 500', category: 'derived', subcategory: 'Step Indices', icon: '📶' },

    // Derived - Baskets (Commodities) - Order: 1
    { symbol: 'WLDXAU', name: 'Gold Basket', category: 'derived', subcategory: 'Commodities Basket', icon: '🪙', isClosed: true },

    // Derived - Baskets (Forex) - Order: 2
    { symbol: 'WLDAUD', name: 'AUD Basket', category: 'derived', subcategory: 'Forex Basket', icon: '🇦🇺', isClosed: true },
    { symbol: 'WLDEUR', name: 'EUR Basket', category: 'derived', subcategory: 'Forex Basket', icon: '🇪🇺', isClosed: true },
    { symbol: 'WLDGBP', name: 'GBP Basket', category: 'derived', subcategory: 'Forex Basket', icon: '🇬🇧', isClosed: true },
    { symbol: 'WLDUSD', name: 'USD Basket', category: 'derived', subcategory: 'Forex Basket', icon: '🇺🇸', isClosed: true },

    // Forex - Major Pairs
    { symbol: 'frxAUDJPY', name: 'AUD/JPY', category: 'forex', subcategory: 'Major Pairs', icon: '💱', isClosed: true },
    { symbol: 'frxAUDUSD', name: 'AUD/USD', category: 'forex', subcategory: 'Major Pairs', icon: '💱', isClosed: true },
    { symbol: 'frxEURAUD', name: 'EUR/AUD', category: 'forex', subcategory: 'Major Pairs', icon: '💱', isClosed: true },
    { symbol: 'frxEURCAD', name: 'EUR/CAD', category: 'forex', subcategory: 'Major Pairs', icon: '💱', isClosed: true },
    { symbol: 'frxEURCHF', name: 'EUR/CHF', category: 'forex', subcategory: 'Major Pairs', icon: '💱', isClosed: true },
    { symbol: 'frxEURGBP', name: 'EUR/GBP', category: 'forex', subcategory: 'Major Pairs', icon: '💱', isClosed: true },
    { symbol: 'frxEURJPY', name: 'EUR/JPY', category: 'forex', subcategory: 'Major Pairs', icon: '💱', isClosed: true },
    { symbol: 'frxEURUSD', name: 'EUR/USD', category: 'forex', subcategory: 'Major Pairs', icon: '💱', isClosed: true },
    { symbol: 'frxGBPAUD', name: 'GBP/AUD', category: 'forex', subcategory: 'Major Pairs', icon: '💱', isClosed: true },
    { symbol: 'frxGBPJPY', name: 'GBP/JPY', category: 'forex', subcategory: 'Major Pairs', icon: '💱', isClosed: true },
    { symbol: 'frxGBPUSD', name: 'GBP/USD', category: 'forex', subcategory: 'Major Pairs', icon: '💱', isClosed: true },
    { symbol: 'frxUSDCAD', name: 'USD/CAD', category: 'forex', subcategory: 'Major Pairs', icon: '💱', isClosed: true },
    { symbol: 'frxUSDCHF', name: 'USD/CHF', category: 'forex', subcategory: 'Major Pairs', icon: '💱', isClosed: true },
    { symbol: 'frxUSDJPY', name: 'USD/JPY', category: 'forex', subcategory: 'Major Pairs', icon: '💱', isClosed: true },

    // Forex - Minor Pairs
    { symbol: 'frxAUDCAD', name: 'AUD/CAD', category: 'forex', subcategory: 'Minor Pairs', icon: '💱', isClosed: true },
    { symbol: 'frxAUDCHF', name: 'AUD/CHF', category: 'forex', subcategory: 'Minor Pairs', icon: '💱', isClosed: true },
    { symbol: 'frxAUDNZD', name: 'AUD/NZD', category: 'forex', subcategory: 'Minor Pairs', icon: '💱', isClosed: true },
    { symbol: 'frxEURNZD', name: 'EUR/NZD', category: 'forex', subcategory: 'Minor Pairs', icon: '💱', isClosed: true },
    { symbol: 'frxGBPCAD', name: 'GBP/CAD', category: 'forex', subcategory: 'Minor Pairs', icon: '💱', isClosed: true },
    { symbol: 'frxGBPCHF', name: 'GBP/CHF', category: 'forex', subcategory: 'Minor Pairs', icon: '💱', isClosed: true },
    { symbol: 'frxGBPNZD', name: 'GBP/NZD', category: 'forex', subcategory: 'Minor Pairs', icon: '💱', isClosed: true },
    { symbol: 'frxNZDJPY', name: 'NZD/JPY', category: 'forex', subcategory: 'Minor Pairs', icon: '💱', isClosed: true },
    { symbol: 'frxNZDUSD', name: 'NZD/USD', category: 'forex', subcategory: 'Minor Pairs', icon: '💱', isClosed: true },
    { symbol: 'frxUSDMXN', name: 'USD/MXN', category: 'forex', subcategory: 'Minor Pairs', icon: '💱', isClosed: true },
    { symbol: 'frxUSDPLN', name: 'USD/PLN', category: 'forex', subcategory: 'Minor Pairs', icon: '💱', isClosed: true },

    // Stock Indices - American
    { symbol: 'OTC_SPC', name: 'US 500', category: 'stock_indices', subcategory: 'American Indices', icon: '📈', isClosed: true },
    { symbol: 'OTC_NDX', name: 'US Tech 100', category: 'stock_indices', subcategory: 'American Indices', icon: '📈', isClosed: true },
    { symbol: 'OTC_DJI', name: 'Wall Street 30', category: 'stock_indices', subcategory: 'American Indices', icon: '📈', isClosed: true },

    // Stock Indices - Asian
    { symbol: 'OTC_AS51', name: 'Australia 200', category: 'stock_indices', subcategory: 'Asian Indices', icon: '📈', isClosed: true },
    { symbol: 'OTC_HSI', name: 'Hong Kong 50', category: 'stock_indices', subcategory: 'Asian Indices', icon: '📈', isClosed: true },
    { symbol: 'OTC_N225', name: 'Japan 225', category: 'stock_indices', subcategory: 'Asian Indices', icon: '📈', isClosed: true },

    // Stock Indices - European
    { symbol: 'OTC_SX5E', name: 'Euro 50', category: 'stock_indices', subcategory: 'European Indices', icon: '📈', isClosed: true },
    { symbol: 'OTC_FCHI', name: 'France 40', category: 'stock_indices', subcategory: 'European Indices', icon: '📈', isClosed: true },
    { symbol: 'OTC_GDAXI', name: 'Germany 40', category: 'stock_indices', subcategory: 'European Indices', icon: '📈', isClosed: true },
    { symbol: 'OTC_AEX', name: 'Netherlands 25', category: 'stock_indices', subcategory: 'European Indices', icon: '📈', isClosed: true },
    { symbol: 'OTC_SSMI', name: 'Swiss 20', category: 'stock_indices', subcategory: 'European Indices', icon: '📈', isClosed: true },
    { symbol: 'OTC_FTSE', name: 'UK 100', category: 'stock_indices', subcategory: 'European Indices', icon: '📈', isClosed: true },

    // Cryptocurrencies
    { symbol: 'cryBTCUSD', name: 'BTC/USD', category: 'cryptocurrencies', subcategory: 'Cryptocurrencies', icon: '₿' },
    { symbol: 'cryETHUSD', name: 'ETH/USD', category: 'cryptocurrencies', subcategory: 'Cryptocurrencies', icon: 'Ξ' },

    // Commodities - Metals
    { symbol: 'frxXAUUSD', name: 'Gold/USD', category: 'commodities', subcategory: 'Metals', icon: '🪙', isClosed: true },
    { symbol: 'frxXPDUSD', name: 'Palladium/USD', category: 'commodities', subcategory: 'Metals', icon: '🪙', isClosed: true },
    { symbol: 'frxXPTUSD', name: 'Platinum/USD', category: 'commodities', subcategory: 'Metals', icon: '🪙', isClosed: true },
    { symbol: 'frxXAGUSD', name: 'Silver/USD', category: 'commodities', subcategory: 'Metals', icon: '⚪', isClosed: true },
];

type CategoryIcon = string | typeof Star;

interface Category {
    id: string;
    label: string;
    icon: CategoryIcon;
}

const CATEGORIES: Category[] = [
    { id: 'favorites', label: 'Favorites', icon: Star },
    { id: 'derived', label: 'Derived', icon: '🌐' },
    { id: 'forex', label: 'Forex', icon: '💱' },
    { id: 'stock_indices', label: 'Stock Indices', icon: '📈' },
    { id: 'cryptocurrencies', label: 'Cryptocurrencies', icon: '₿' },
    { id: 'commodities', label: 'Commodities', icon: '🪙' },
];

export default function MarketSelector({
    selectedSymbol,
    onSymbolChange,
    currentPrice,
    priceChange,
    priceChangePercent
}: MarketSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string>('derived');
    const [activeScrollSection, setActiveScrollSection] = useState<string>('Baskets');
    const [searchQuery, setSearchQuery] = useState('');
    const [favorites, setFavorites] = useState<string[]>(() => {
        const saved = localStorage.getItem('favoriteMarkets');
        return saved ? JSON.parse(saved) : [];
    });
    const [isDerivedExpanded, setIsDerivedExpanded] = useState(true);

    const selectedMarket = MARKETS.find((m) => m.symbol === selectedSymbol);

    const toggleFavorite = (symbol: string) => {
        const newFavorites = favorites.includes(symbol)
            ? favorites.filter(s => s !== symbol)
            : [...favorites, symbol];
        setFavorites(newFavorites);
        localStorage.setItem('favoriteMarkets', JSON.stringify(newFavorites));
    };

    // Map subcategories to display groups (Baskets or Synthetics)
    const getDisplayGroup = (subcategory: string) => {
        if (subcategory === 'Commodities Basket' || subcategory === 'Forex Basket') return 'Baskets';
        // All other derived subcategories are "Synthetics"
        return 'Synthetics';
    };

    const derivedSubcategories = ['Baskets', 'Synthetics'];

    const filteredMarkets = MARKETS.filter((market) => {
        const matchesCategory = selectedCategory === 'favorites'
            ? favorites.includes(market.symbol)
            : market.category === selectedCategory;

        const matchesSearch = market.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            market.symbol.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesCategory && matchesSearch;
    });

    // Group markets by subcategory for display
    const groupedMarkets = filteredMarkets.reduce((acc, market) => {
        const key = market.subcategory || market.category;
        if (!acc[key]) acc[key] = [];
        acc[key].push(market);
        return acc;
    }, {} as Record<string, Market[]>);

    // Define display order for derived subcategories
    const derivedOrder = [
        'Commodities Basket',
        'Forex Basket',
        'Continuous Indices',
        'Crash/Boom Indices',
        'Daily Reset Indices',
        'Jump Indices',
        'Range Break Indices',
        'Step Indices'
    ];

    // Define display order for other categories
    const forexOrder = ['Major Pairs', 'Minor Pairs'];
    const stockIndicesOrder = ['American Indices', 'Asian Indices', 'European Indices'];
    const commoditiesOrder = ['Metals'];

    // Sort grouped markets based on category
    const getSortedMarkets = () => {
        const entries = Object.entries(groupedMarkets);

        if (selectedCategory === 'derived') {
            return entries.sort(([a], [b]) => {
                const indexA = derivedOrder.indexOf(a);
                const indexB = derivedOrder.indexOf(b);
                return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
            });
        } else if (selectedCategory === 'forex') {
            return entries.sort(([a], [b]) => {
                const indexA = forexOrder.indexOf(a);
                const indexB = forexOrder.indexOf(b);
                return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
            });
        } else if (selectedCategory === 'stock_indices') {
            return entries.sort(([a], [b]) => {
                const indexA = stockIndicesOrder.indexOf(a);
                const indexB = stockIndicesOrder.indexOf(b);
                return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
            });
        } else if (selectedCategory === 'commodities') {
            return entries.sort(([a], [b]) => {
                const indexA = commoditiesOrder.indexOf(a);
                const indexB = commoditiesOrder.indexOf(b);
                return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
            });
        }

        return entries;
    };

    const sortedGroupedMarkets = getSortedMarkets();

    // Handle scroll to update active section
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        if (selectedCategory !== 'derived') return;

        const container = e.currentTarget;
        const sections = container.querySelectorAll('[data-section]');

        let currentSection = 'Baskets';
        let minDistance = Infinity;

        sections.forEach((section) => {
            const rect = section.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();

            // Calculate distance from top of container
            const distance = Math.abs(rect.top - containerRect.top);

            // Find the section closest to the top of the viewport
            if (rect.top <= containerRect.top + 150 && distance < minDistance) {
                const sectionName = section.getAttribute('data-section');
                if (sectionName) {
                    minDistance = distance;
                    currentSection = getDisplayGroup(sectionName);
                }
            }
        });

        if (currentSection !== activeScrollSection) {
            setActiveScrollSection(currentSection);
        }
    };

    return (
        <div className="relative">
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 px-4 py-2.5 bg-[#16124A] hover:bg-[#16124A]/80 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[#2F6BFF]/20 border border-[#2F6BFF]/20"
            >
                {/* Market Icon */}
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-[#2F6BFF]/20 to-[#FFA62B]/20 rounded-lg">
                    <span className="text-2xl">{selectedMarket?.icon || '📊'}</span>
                </div>

                {/* Market Info */}
                <div className="flex flex-col items-start flex-1 min-w-[200px]">
                    <span className="text-white font-semibold text-body-dashboard">
                        {selectedMarket?.name || selectedSymbol}
                    </span>
                    <div className={`flex items-center gap-1.5 text-small-dashboard font-medium ${priceChangePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        <span className="text-gray-100 font-semibold font-tabular">
                            {currentPrice.toFixed(selectedSymbol === 'R_100' ? 2 : 5)}
                        </span>
                        <span>-</span>
                        <span className="font-semibold font-tabular">
                            {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(selectedSymbol === 'R_100' ? 4 : 5)}
                        </span>
                        <span className="font-semibold font-tabular">
                            ({priceChangePercent >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%)
                        </span>
                        {priceChangePercent >= 0 ? (
                            <TrendingUp className="w-3 h-3" />
                        ) : (
                            <TrendingDown className="w-3 h-3" />
                        )}
                    </div>
                </div>

                <ChevronDown className={`w-4 h-4 text-gray-200 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Modal */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

                    {/* Modal Content */}
                    <div className="absolute top-full left-0 mt-2 w-[700px] h-[500px] bg-[#0B0633] border border-[#2F6BFF]/30 rounded-2xl shadow-2xl glow-primary z-50 flex overflow-hidden">
                        {/* Left Sidebar - Categories */}
                        <div className="w-56 border-r border-[#2F6BFF]/20 flex flex-col bg-[#16124A]/50">
                            <div className="px-4 py-3 border-b border-[#16124A]">
                                <h3 className="text-white font-semibold text-data-label">Markets</h3>
                            </div>
                            <div className="flex-1 overflow-y-auto py-2">
                                {/* Favorites */}
                                <button
                                    onClick={() => setSelectedCategory('favorites')}
                                    className={`w-full px-4 py-2.5 text-left text-body-dashboard transition-colors flex items-center gap-3 ${selectedCategory === 'favorites'
                                        ? 'bg-[#2F6BFF]/10 text-white border-l-2 border-[#2F6BFF]'
                                        : 'text-gray-200 hover:text-gray-100 hover:bg-[#16124A]/30'
                                        }`}
                                >
                                    <Star className="w-4 h-4" />
                                    <span>Favorites</span>
                                </button>

                                {/* Derived with Dropdown */}
                                <div>
                                    <button
                                        onClick={() => {
                                            setSelectedCategory('derived');
                                            setIsDerivedExpanded(!isDerivedExpanded);
                                        }}
                                        className={`w-full px-4 py-2.5 text-left text-body-dashboard transition-colors flex items-center gap-3 ${selectedCategory === 'derived'
                                            ? 'bg-[#2F6BFF]/10 text-white border-l-2 border-[#2F6BFF]'
                                            : 'text-gray-200 hover:text-gray-100 hover:bg-[#16124A]/30'
                                            }`}
                                    >
                                        <span className="text-lg">🌐</span>
                                        <span className="flex-1">Derived</span>
                                        <ChevronDown className={`w-3 h-3 transition-transform ${isDerivedExpanded && selectedCategory === 'derived' ? '' : '-rotate-90'}`} />
                                    </button>

                                    {/* Derived Subcategories */}
                                    {isDerivedExpanded && selectedCategory === 'derived' && (
                                        <div className="bg-[#0B0633]/30">
                                            {derivedSubcategories.map((subcat) => (
                                                <button
                                                    key={subcat}
                                                    onClick={() => {
                                                        // Scroll to the first section of this group
                                                        const container = document.querySelector('[data-scroll-container]');
                                                        if (container) {
                                                            const firstSection = subcat === 'Baskets'
                                                                ? container.querySelector('[data-section="Commodities Basket"]')
                                                                : container.querySelector('[data-section="Continuous Indices"]');
                                                            if (firstSection) {
                                                                firstSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                                            }
                                                        }
                                                    }}
                                                    className={`w-full px-8 py-2 text-left text-small-dashboard transition-colors ${activeScrollSection === subcat
                                                        ? 'text-white bg-[#2F6BFF]/10'
                                                        : 'text-gray-200 hover:text-gray-100 hover:bg-[#16124A]/30'
                                                        }`}
                                                >
                                                    {subcat}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Other Categories */}
                                {CATEGORIES.filter(c => c.id !== 'favorites' && c.id !== 'derived').map((category) => (
                                    <button
                                        key={category.id}
                                        onClick={() => setSelectedCategory(category.id)}
                                        className={`w-full px-4 py-2.5 text-left text-body-dashboard transition-colors flex items-center gap-3 ${selectedCategory === category.id
                                            ? 'bg-[#2F6BFF]/10 text-white border-l-2 border-[#2F6BFF]'
                                            : 'text-gray-200 hover:text-gray-100 hover:bg-[#16124A]/30'
                                            }`}
                                    >
                                        {typeof category.icon === 'string' ? (
                                            <span className="text-lg">{category.icon}</span>
                                        ) : (
                                            <category.icon className="w-4 h-4" />
                                        )}
                                        <span>{category.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Right Content */}
                        <div className="flex-1 flex flex-col">
                            {/* Header with Search */}
                            <div className="px-4 py-3 border-b border-[#16124A]">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-300" />
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 bg-[#0B0633] border border-[#16124A] rounded text-white text-body-dashboard focus:outline-none focus:border-[#2F6BFF]"
                                    />
                                </div>
                            </div>

                            {/* Markets List */}
                            <div className="flex-1 overflow-y-auto" onScroll={handleScroll} data-scroll-container>
                                {selectedCategory === 'favorites' && favorites.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-gray-200">
                                        <Star className="w-12 h-12 mb-2 opacity-30" />
                                        <p className="text-body-dashboard">There are no favorites yet.</p>
                                    </div>
                                ) : (
                                    sortedGroupedMarkets.map(([subcategory, markets]) => {
                                        // Use subcategory as section heading directly
                                        const sectionHeading = subcategory;

                                        return (
                                            <div key={subcategory} data-section={subcategory} id={`section-${subcategory.replace(/\s+/g, '-')}`}>
                                                <button
                                                    onClick={() => {
                                                        const element = document.getElementById(`section-${subcategory.replace(/\s+/g, '-')}`);
                                                        if (element) {
                                                            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                                        }
                                                    }}
                                                    className="w-full px-4 py-2 text-xs font-semibold text-gray-300 uppercase bg-[#0B0633]/50 sticky top-0 text-left hover:bg-[#0B0633]/50 transition-colors"
                                                >
                                                    {sectionHeading}
                                                </button>
                                                {markets.map((market) => (
                                                    <button
                                                        key={market.symbol}
                                                        onClick={() => {
                                                            onSymbolChange(market.symbol);
                                                            setIsOpen(false);
                                                        }}
                                                        className={`w-full px-4 py-3 text-left hover:bg-[#16124A]/50 transition-colors flex items-center justify-between group ${selectedSymbol === market.symbol ? 'bg-[#2F6BFF]/10' : ''
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-3 flex-1">
                                                            <span className="text-xl">{market.icon}</span>
                                                            <span className="text-white text-sm font-medium">{market.name}</span>
                                                            {market.isClosed && (
                                                                <span className="px-2 py-0.5 text-[10px] font-medium text-red-400 border border-red-400/30 rounded">
                                                                    CLOSED
                                                                </span>
                                                            )}
                                                        </div>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                toggleFavorite(market.symbol);
                                                            }}
                                                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <Star
                                                                className={`w-4 h-4 ${favorites.includes(market.symbol)
                                                                    ? 'fill-violet-400 text-violet-400'
                                                                    : 'text-gray-200 hover:text-violet-400'
                                                                    }`}
                                                            />
                                                        </button>
                                                    </button>
                                                ))}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
