import React from 'react';

interface TradingControlsProps {
    [key: string]: any;
}

const TradingControls: React.FC<TradingControlsProps> = () => {
    return (
        <div className="bg-white dark:bg-[#0B0633] rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Trading Controls</h3>
            <p className="text-gray-600 dark:text-gray-200">Controls coming soon...</p>
        </div>
    );
};

export default TradingControls;


