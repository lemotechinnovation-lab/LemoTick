import { BarChart3, Download, Layout, Pencil, TrendingUp, ZoomIn, ZoomOut } from 'lucide-react';

interface ChartToolbarProps {
    onChartTypeClick: () => void;
    onIndicatorsClick: () => void;
    onTemplatesClick: () => void;
    onDrawingClick: () => void;
    onDownloadClick: () => void;
    onZoomIn: () => void;
    onZoomOut: () => void;
    activeIndicatorsCount?: number;
    hasTemplates?: boolean;
}

export default function ChartToolbar({
    onChartTypeClick,
    onIndicatorsClick,
    onTemplatesClick,
    onDrawingClick,
    onDownloadClick,
    onZoomIn,
    onZoomOut,
    activeIndicatorsCount = 0,
    hasTemplates = false,
}: ChartToolbarProps) {
    return (
        <div className="flex items-center gap-2">
            {/* Chart Types & Timeframe */}
            <button
                onClick={onChartTypeClick}
                className="flex items-center justify-center w-9 h-9 bg-[#16124A] hover:bg-[#2F6BFF] rounded-lg transition-all duration-300 border border-[#2F6BFF]/20 hover:scale-110 hover:shadow-lg hover:shadow-[#2F6BFF]/30"
                title="Chart Types & Timeframe"
            >
                <BarChart3 className="w-4 h-4 text-gray-100" />
            </button>

            {/* Indicators */}
            <button
                onClick={onIndicatorsClick}
                className="relative flex items-center justify-center w-9 h-9 bg-[#16124A] hover:bg-[#2F6BFF] rounded-lg transition-all duration-300 border border-[#2F6BFF]/20 hover:scale-110 hover:shadow-lg hover:shadow-[#2F6BFF]/30"
                title="Indicators"
            >
                <TrendingUp className="w-4 h-4 text-gray-100" />
                {activeIndicatorsCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-[#FFA62B] text-white text-[10px] font-bold rounded-full shadow-lg shadow-[#FFA62B]/50 animate-pulse">
                        {activeIndicatorsCount}
                    </span>
                )}
            </button>

            {/* Templates */}
            <button
                onClick={onTemplatesClick}
                className="flex items-center justify-center w-9 h-9 bg-[#16124A] hover:bg-[#2F6BFF] rounded-lg transition-all duration-300 border border-[#2F6BFF]/20 hover:scale-110 hover:shadow-lg hover:shadow-[#2F6BFF]/30"
                title="Templates"
            >
                <Layout className="w-4 h-4 text-gray-100" />
            </button>

            {/* Drawing Tools */}
            <button
                onClick={onDrawingClick}
                className="flex items-center justify-center w-9 h-9 bg-[#16124A] hover:bg-[#2F6BFF] rounded-lg transition-all duration-300 border border-[#2F6BFF]/20 hover:scale-110 hover:shadow-lg hover:shadow-[#2F6BFF]/30"
                title="Drawing Tools"
            >
                <Pencil className="w-4 h-4 text-gray-100" />
            </button>

            {/* Download Template */}
            <button
                onClick={onDownloadClick}
                disabled={!hasTemplates}
                className={`flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-300 border ${hasTemplates
                    ? 'bg-[#16124A] hover:bg-[#2F6BFF] border-[#2F6BFF]/20 cursor-pointer hover:scale-110 hover:shadow-lg hover:shadow-[#2F6BFF]/30'
                    : 'bg-[#16124A]/30 border-[#16124A]/30 cursor-not-allowed opacity-50'
                    }`}
                title={hasTemplates ? "Download Template" : "No templates available"}
            >
                <Download className={`w-4 h-4 ${hasTemplates ? 'text-gray-100' : 'text-gray-300'}`} />
            </button>

            {/* Divider */}
            <div className="w-px h-6 bg-[#2F6BFF]/30 mx-1" />

            {/* Zoom Out */}
            <button
                onClick={onZoomOut}
                className="flex items-center justify-center w-9 h-9 bg-[#16124A] hover:bg-[#2F6BFF] rounded-lg transition-all duration-300 border border-[#2F6BFF]/20 hover:scale-110 hover:shadow-lg hover:shadow-[#2F6BFF]/30"
                title="Zoom Out"
            >
                <ZoomOut className="w-4 h-4 text-gray-100" />
            </button>

            {/* Zoom In */}
            <button
                onClick={onZoomIn}
                className="flex items-center justify-center w-9 h-9 bg-[#16124A] hover:bg-[#2F6BFF] rounded-lg transition-all duration-300 border border-[#2F6BFF]/20 hover:scale-110 hover:shadow-lg hover:shadow-[#2F6BFF]/30"
                title="Zoom In"
            >
                <ZoomIn className="w-4 h-4 text-gray-100" />
            </button>
        </div>
    );
}


