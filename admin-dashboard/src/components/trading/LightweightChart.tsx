import React from 'react';

interface LightweightChartProps {
    data?: any[];
    [key: string]: any;
}

const LightweightChart: React.FC<LightweightChartProps> = () => {
    return (
        <div className="bg-white dark:bg-[#0B0633] rounded-xl p-6 h-96">
            <p className="text-[#efdede] dark:text-gray-200">Chart component coming soon...</p>
        </div>
    );
};

export default LightweightChart;
