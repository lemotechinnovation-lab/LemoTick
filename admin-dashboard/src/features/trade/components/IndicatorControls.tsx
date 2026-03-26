import { Settings, Trash2 } from 'lucide-react';

interface IndicatorControlsProps {
    indicators: Array<{
        id: string;
        name: string;
        position: 'main' | 'bottom';
    }>;
    onEdit: (indicatorId: string) => void;
    onDelete: (indicatorId: string) => void;
    chartHeight?: number;
}

export default function IndicatorControls({ indicators, onEdit, onDelete, chartHeight = 600 }: IndicatorControlsProps) {
    // Group indicators by position
    const bottomIndicators = indicators.filter(ind => ind.position === 'bottom');

    if (bottomIndicators.length === 0) return null;

    const bottomIndicatorCount = Math.min(bottomIndicators.length, 2);
    const mainChartHeight = 0.75;
    const spacingBetweenIndicators = 0.02;
    const totalIndicatorSpace = 1 - mainChartHeight;
    const indicatorHeight = (totalIndicatorSpace - (spacingBetweenIndicators * (bottomIndicatorCount - 1))) / bottomIndicatorCount;

    return (
        <>
            {bottomIndicators.map((indicator, index) => {
                // Calculate position for each indicator based on its pane
                const positionFromBottom = index;
                const bottomPercent = (positionFromBottom * indicatorHeight) + (positionFromBottom * spacingBetweenIndicators);
                const topPercent = 1 - bottomPercent - indicatorHeight;

                // Convert to pixels - position at the top of each indicator pane
                const topPosition = topPercent * chartHeight + 8; // 8px padding from top of pane

                return (
                    <div
                        key={indicator.id}
                        className="absolute left-2 z-20"
                        style={{
                            top: `${topPosition}px`
                        }}
                    >
                        <div className="flex items-center gap-1.5 bg-[#0B0633]/90 backdrop-blur-sm px-2 py-1 rounded border border-[#16124A]/50">
                            <span className="text-[10px] text-gray-100 font-normal">{indicator.name}</span>
                            <div className="flex items-center gap-0.5">
                                <button
                                    onClick={() => onEdit(indicator.id)}
                                    className="p-0.5 hover:bg-gray-700 rounded transition-colors"
                                    title="Settings"
                                >
                                    <Settings className="w-3 h-3 text-gray-200 hover:text-violet-400" />
                                </button>
                                <button
                                    onClick={() => onDelete(indicator.id)}
                                    className="p-0.5 hover:bg-gray-700 rounded transition-colors"
                                    title="Delete"
                                >
                                    <Trash2 className="w-3 h-3 text-gray-200 hover:text-red-400" />
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })}
        </>
    );
}
