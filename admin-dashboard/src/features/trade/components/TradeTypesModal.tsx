import { Search, X } from 'lucide-react';
import { useState } from 'react';

interface TradeTypesModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedType: string;
    onTypeSelect: (type: string) => void;
}

const tradeCategories = [
    {
        id: 'all',
        label: 'All',
        icon: '☰',
        types: []
    },
    {
        id: 'multipliers',
        label: 'Multipliers',
        icon: '✕',
        types: [
            { id: 'multipliers', label: 'Multipliers', icons: ['📈', '📉'] }
        ]
    },
    {
        id: 'options',
        label: 'Options',
        icon: '⚙',
        types: []
    },
    {
        id: 'accumulators',
        label: 'Accumulators',
        icon: '📊',
        types: [
            { id: 'accumulators', label: 'Accumulators', icons: ['📊'] }
        ]
    }
];

const tradeTypes = [
    {
        category: 'Accumulators',
        items: [
            { id: 'accumulators', label: 'Accumulators', icons: ['📊'] }
        ]
    },
    {
        category: 'Vanillas',
        items: [
            { id: 'call_put', label: 'Call/Put', icons: ['📈', '📉'] }
        ]
    },
    {
        category: 'Turbos',
        items: [
            { id: 'turbos', label: 'Turbos', icons: ['⚡', '⚡'] }
        ]
    },
    {
        category: 'Multipliers',
        items: [
            { id: 'multipliers', label: 'Multipliers', icons: ['✕', '✕'] }
        ]
    },
    {
        category: 'Ups & Downs',
        items: [
            { id: 'rise_fall', label: 'Rise/Fall', icons: ['📈', '📉'] },
            { id: 'higher_lower', label: 'Higher/Lower', icons: ['⬆', '⬇'] }
        ]
    },
    {
        category: 'Touch & No Touch',
        items: [
            { id: 'touch_no_touch', label: 'Touch/No Touch', icons: ['👆', '🚫'] }
        ]
    },
    {
        category: 'Digits',
        items: [
            { id: 'matches_differs', label: 'Matches/Differs', icons: ['✓', '✗'] },
            { id: 'even_odd', label: 'Even/Odd', icons: ['2️⃣', '1️⃣'] },
            { id: 'over_under', label: 'Over/Under', icons: ['⬆', '⬇'] }
        ]
    }
];

export default function TradeTypesModal({ isOpen, onClose, selectedType, onTypeSelect }: TradeTypesModalProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    if (!isOpen) return null;

    const filteredTypes = tradeTypes.filter(category => {
        if (selectedCategory === 'all') return true;
        if (selectedCategory === 'multipliers') return category.category === 'Multipliers';
        if (selectedCategory === 'options') return ['Vanillas', 'Turbos', 'Ups & Downs', 'Touch & No Touch', 'Digits'].includes(category.category);
        if (selectedCategory === 'accumulators') return category.category === 'Accumulators';
        return true;
    }).filter(category => {
        if (!searchQuery) return true;
        return category.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
            category.items.some(item => item.label.toLowerCase().includes(searchQuery.toLowerCase()));
    });

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-[#0B0633] rounded-lg w-[600px] h-[500px] flex flex-col border border-[#16124A]">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#2F6BFF]/20">
                    <h2 className="text-white font-semibold text-base">Trade types</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-200 hover:text-[#efdede] transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Left Sidebar - Categories */}
                    <div className="w-48 border-r border-[#16124A] bg-[#0B0633]/30">
                        {tradeCategories.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => setSelectedCategory(category.id)}
                                className={`w-full px-4 py-3 flex items-center gap-3 text-left transition-colors ${selectedCategory === category.id
                                        ? 'bg-[#2F6BFF]/20 border-l-2 border-[#2F6BFF] text-white'
                                        : 'text-gray-200 hover:bg-[#0B0633]/50 hover:text-[#efdede]'
                                    }`}
                            >
                                <span className="text-lg">{category.icon}</span>
                                <span className="text-sm">{category.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Right Panel - Trade Types */}
                    <div className="flex-1 flex flex-col">
                        {/* Search */}
                        <div className="p-4 border-b border-[#2F6BFF]/20">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-200" />
                                <input
                                    type="text"
                                    placeholder="Search"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-[#0B0633] border border-[#16124A] rounded text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#2F6BFF]"
                                />
                            </div>
                        </div>

                        {/* Learn More Link */}
                        <div className="px-4 py-2 border-b border-[#2F6BFF]/20">
                            <button className="text-violet-400 hover:text-violet-300 text-xs flex items-center gap-1">
                                Learn more about trade types
                                <span>→</span>
                            </button>
                        </div>

                        {/* Trade Types List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {filteredTypes.map((category) => (
                                <div key={category.category}>
                                    <h3 className="text-gray-200 text-xs font-medium mb-2">{category.category}</h3>
                                    <div className="space-y-1">
                                        {category.items.map((item) => (
                                            <button
                                                key={item.id}
                                                onClick={() => {
                                                    onTypeSelect(item.id);
                                                    onClose();
                                                }}
                                                className={`w-full px-3 py-2 rounded flex items-center gap-2 text-left transition-colors ${selectedType === item.id
                                                        ? 'bg-[#2F6BFF]/20 text-white'
                                                        : 'text-gray-100 hover:bg-[#16124A]/80 hover:scale-105 transition-all duration-300'
                                                    }`}
                                            >
                                                <div className="flex gap-1">
                                                    {item.icons.map((icon, idx) => (
                                                        <span key={idx} className="text-base">{icon}</span>
                                                    ))}
                                                </div>
                                                <span className="text-sm">{item.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


