import React from 'react';

interface OpenPositionsPanelProps {
    positions?: any[];
    isOpen?: boolean;
    onToggle?: () => void;
    [key: string]: any;
}

const OpenPositionsPanel: React.FC<OpenPositionsPanelProps> = () => {
    return (
        <div className="bg-white dark:bg-[#0B0633] rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Open Positions</h3>
            <p className="text-gray-600 dark:text-gray-200">No open positions</p>
        </div>
    );
};

export default OpenPositionsPanel;


