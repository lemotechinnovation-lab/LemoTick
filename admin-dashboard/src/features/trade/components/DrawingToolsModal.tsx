import { Minus, TrendingUp, X } from 'lucide-react';
import { JSX, useState } from 'react';

interface DrawingTool {
    id: string;
    name: string;
    icon: JSX.Element;
}

const DRAWING_TOOLS: DrawingTool[] = [
    {
        id: 'channel',
        name: 'Channel',
        icon: (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 18l6-6 4 4 8-8" />
                <path d="M3 12l6-6 4 4 8-8" />
            </svg>
        ),
    },
    {
        id: 'continuous',
        name: 'Continuous',
        icon: (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12c0 0 3-6 9-6s9 6 9 6-3 6-9 6-9-6-9-6z" />
            </svg>
        ),
    },
    {
        id: 'fib_fan',
        name: 'Fib Fan',
        icon: (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 20l9-16 9 16" />
                <path d="M6 20l6-11" />
                <path d="M18 20l-6-11" />
            </svg>
        ),
    },
    {
        id: 'horizontal',
        name: 'Horizontal',
        icon: <Minus className="w-4 h-4" />,
    },
    {
        id: 'line',
        name: 'Line',
        icon: (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 19l14-14" />
            </svg>
        ),
    },
    {
        id: 'ray',
        name: 'Ray',
        icon: (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 19l14-14" />
                <circle cx="19" cy="5" r="2" fill="currentColor" />
            </svg>
        ),
    },
    {
        id: 'rectangle',
        name: 'Rectangle',
        icon: (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="4" y="6" width="16" height="12" rx="1" />
            </svg>
        ),
    },
    {
        id: 'trend',
        name: 'Trend',
        icon: <TrendingUp className="w-4 h-4" />,
    },
    {
        id: 'vertical',
        name: 'Vertical',
        icon: (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 3v18" />
            </svg>
        ),
    },
];

interface DrawingToolsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function DrawingToolsModal({ isOpen, onClose }: DrawingToolsModalProps) {
    const [selectedCategory, setSelectedCategory] = useState<'active' | 'all'>('active');
    const [activeDrawings, setActiveDrawings] = useState<string[]>([]);

    if (!isOpen) return null;

    const displayedTools = selectedCategory === 'active'
        ? DRAWING_TOOLS.filter(tool => activeDrawings.includes(tool.id))
        : DRAWING_TOOLS;

    const hasActiveDrawings = activeDrawings.length > 0;

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fadeIn" onClick={onClose} />

            {/* Modal */}
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[400px] bg-[#0B0633] rounded-2xl shadow-2xl z-50 border border-[#2F6BFF]/30 animate-slideUp flex">
                {/* Left Sidebar */}
                <div className="w-40 border-r border-[#16124A] flex flex-col">
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-[#2F6BFF]/20">
                        <h2 className="text-base font-semibold text-white">Drawing tools</h2>
                    </div>

                    {/* Categories */}
                    <div className="flex-1 py-2">
                        <button
                            onClick={() => setSelectedCategory('active')}
                            className={`w-full px-4 py-2 text-left text-sm transition-colors flex items-center gap-2 ${selectedCategory === 'active'
                                    ? 'bg-[#16124A] text-white'
                                    : 'text-gray-200 hover:text-gray-100'
                                }`}
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                            </svg>
                            Active
                        </button>
                        <button
                            onClick={() => setSelectedCategory('all')}
                            className={`w-full px-4 py-2 text-left text-sm transition-colors flex items-center gap-2 ${selectedCategory === 'all'
                                    ? 'bg-[#16124A] text-white'
                                    : 'text-gray-200 hover:text-gray-100'
                                }`}
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 12h18M3 6h18M3 18h18" />
                            </svg>
                            All drawings
                        </button>
                    </div>
                </div>

                {/* Right Content */}
                <div className="flex-1 flex flex-col">
                    {/* Header with Close Button */}
                    <div className="px-4 py-3 border-b border-[#2F6BFF]/20 flex items-center justify-end">
                        <button
                            onClick={onClose}
                            className="text-gray-200 hover:text-[#efdede] hover:bg-[#16124A] rounded-lg p-1.5 transition-all duration-300"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-4">
                        {selectedCategory === 'active' && !hasActiveDrawings ? (
                            /* Empty State */
                            <div className="flex flex-col items-center justify-center h-full">
                                <div className="w-24 h-24 mb-4 relative">
                                    <div className="absolute inset-0 bg-gradient-to-br from-violet-900/30 to-violet-700/30 rounded-full"></div>
                                    <div className="absolute inset-2 bg-gradient-to-br from-violet-800/20 to-violet-600/20 rounded-full"></div>
                                    <div className="absolute inset-4 bg-gradient-to-br from-violet-700/10 to-violet-500/10 rounded-full"></div>
                                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                        <svg className="w-8 h-8 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-200">You have no active drawings yet.</p>
                            </div>
                        ) : (
                            /* Tools Grid */
                            <div className="grid grid-cols-3 gap-2">
                                {displayedTools.map((tool) => (
                                    <button
                                        key={tool.id}
                                        className="flex flex-col items-center gap-2 px-3 py-3 rounded hover:bg-[#16124A]/80 hover:scale-105 transition-all duration-300 transition-colors group"
                                    >
                                        <div className="text-gray-200 group-hover:text-violet-400 transition-colors">
                                            {tool.icon}
                                        </div>
                                        <span className="text-xs text-gray-200 group-hover:text-gray-100 transition-colors">
                                            {tool.name}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}


