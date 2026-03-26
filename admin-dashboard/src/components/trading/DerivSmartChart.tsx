import React from 'react';

interface DerivSmartChartProps {
    symbol?: string;
    [key: string]: any;
}

const DerivSmartChart: React.FC<DerivSmartChartProps> = () => {
    return (
        <div className="bg-white dark:bg-[#0B0633] rounded-xl p-6">
            <p className="text-[#efdede] dark:text-gray-200">Deriv chart component coming soon...</p>
        </div>
    );
};

export default DerivSmartChart;
