import React from 'react';

interface RobotSettingsPanelProps {
    symbol?: string;
    [key: string]: any;
}

const RobotSettingsPanel: React.FC<RobotSettingsPanelProps> = () => {
    return (
        <div className="bg-white dark:bg-[#0B0633] rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Robot Settings</h3>
            <p className="text-gray-600 dark:text-gray-200">Settings panel coming soon...</p>
        </div>
    );
};

export default RobotSettingsPanel;
