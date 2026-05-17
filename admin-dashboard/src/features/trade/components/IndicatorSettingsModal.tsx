import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface IndicatorSettings {
    [key: string]: any;
}

interface IndicatorSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    indicatorId: string;
    indicatorName: string;
    currentSettings: IndicatorSettings;
    onSave: (settings: IndicatorSettings) => void;
}

export default function IndicatorSettingsModal({
    isOpen,
    onClose,
    indicatorId,
    indicatorName,
    currentSettings,
    onSave,
}: IndicatorSettingsModalProps) {
    const [settings, setSettings] = useState<IndicatorSettings>(currentSettings);

    useEffect(() => {
        setSettings(currentSettings);
    }, [currentSettings, isOpen]);

    if (!isOpen) return null;

    const handleSave = () => {
        onSave(settings);
        onClose();
    };

    const handleReset = () => {
        // Reset to default values based on indicator type
        const defaults = getDefaultSettings(indicatorId);
        setSettings(defaults);
    };

    const renderSettingsFields = () => {
        switch (indicatorId) {
            case 'moving_average':
                return (
                    <>
                        {/* Result Color */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-white mb-2">Result</label>
                            <div className="flex items-center gap-2">
                                <label className="text-xs text-gray-200 w-12">Color</label>
                                <div className="flex-1 flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={settings.color || '#2962FF'}
                                        onChange={(e) => setSettings({ ...settings, color: e.target.value })}
                                        className="w-20 h-10 rounded cursor-pointer border-0"
                                        style={{ backgroundColor: settings.color || '#2962FF' }}
                                    />
                                    <span className="text-gray-200 text-body-dashboard">{settings.color || '#2962FF'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Period */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-white mb-2">Period</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="range"
                                    min="1"
                                    max="200"
                                    value={settings.period || 50}
                                    onChange={(e) => setSettings({ ...settings, period: parseInt(e.target.value) })}
                                    className="flex-1"
                                />
                                <span className="text-white font-medium w-12 text-right">{settings.period || 50}</span>
                            </div>
                        </div>

                        {/* Field */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-white mb-2">Field</label>
                            <select
                                value={settings.field || 'close'}
                                onChange={(e) => setSettings({ ...settings, field: e.target.value })}
                                className="w-full px-3 py-2 bg-[#0B0633] border border-[#16124A] rounded text-white text-sm focus:outline-none focus:border-[#2F6BFF]"
                            >
                                <option value="close">Close</option>
                                <option value="open">Open</option>
                                <option value="high">High</option>
                                <option value="low">Low</option>
                            </select>
                        </div>

                        {/* Type */}
                        <div className="mb-4">
                            <label className="block text-data-label text-[#efdede] drop-shadow-[0_0_3px_rgba(160,167,181,0.2)] mb-2">Type</label>
                            <select
                                value={settings.type || 'simple'}
                                onChange={(e) => setSettings({ ...settings, type: e.target.value })}
                                className="w-full px-3 py-2 bg-[#0B0633] border border-[#16124A] rounded text-white text-body-dashboard focus:outline-none focus:border-[#2F6BFF]"
                            >
                                <option value="simple">Simple</option>
                                <option value="exponential">Exponential</option>
                                <option value="weighted">Weighted</option>
                                <option value="hull">Hull</option>
                                <option value="zero_lag">Zero Lag</option>
                                <option value="time_series">Time Series</option>
                            </select>
                        </div>

                        {/* Offset */}
                        <div className="mb-4">
                            <label className="block text-data-label text-[#efdede] drop-shadow-[0_0_3px_rgba(160,167,181,0.2)] mb-2">Offset</label>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setSettings({ ...settings, offset: Math.max(0, (settings.offset || 0) - 1) })}
                                    className="w-8 h-8 bg-[#16124A] hover:bg-[#2F6BFF]/30 rounded text-white"
                                >
                                    -
                                </button>
                                <input
                                    type="number"
                                    value={settings.offset || 0}
                                    onChange={(e) => setSettings({ ...settings, offset: parseInt(e.target.value) || 0 })}
                                    className="flex-1 px-3 py-2 bg-[#0B0633] border border-[#16124A] rounded text-white text-body-dashboard text-center focus:outline-none focus:border-[#2F6BFF]"
                                />
                                <button
                                    onClick={() => setSettings({ ...settings, offset: (settings.offset || 0) + 1 })}
                                    className="w-8 h-8 bg-[#16124A] hover:bg-[#2F6BFF]/30 rounded text-white"
                                >
                                    +
                                </button>
                                <span className="text-white font-medium w-12 text-right">{settings.offset || 0}</span>
                            </div>
                        </div>
                    </>
                );

            case 'rsi':
                return (
                    <>
                        {/* Over Bought */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-white mb-2">Over Bought</label>
                            <div className="flex items-center gap-2">
                                <label className="text-xs text-gray-200 w-12">Size</label>
                                <button
                                    onClick={() => setSettings({ ...settings, overBought: Math.max(50, (settings.overBought || 80) - 1) })}
                                    className="w-8 h-8 bg-[#16124A] hover:bg-[#2F6BFF]/30 rounded text-white"
                                >
                                    -
                                </button>
                                <input
                                    type="number"
                                    value={settings.overBought || 80}
                                    onChange={(e) => setSettings({ ...settings, overBought: parseInt(e.target.value) || 80 })}
                                    className="w-16 px-2 py-1 bg-[#0B0633] border border-[#16124A] rounded text-white text-sm text-center focus:outline-none focus:border-[#2F6BFF]"
                                />
                                <button
                                    onClick={() => setSettings({ ...settings, overBought: Math.min(100, (settings.overBought || 80) + 1) })}
                                    className="w-8 h-8 bg-[#16124A] hover:bg-[#2F6BFF]/30 rounded text-white"
                                >
                                    +
                                </button>
                                <input
                                    type="color"
                                    value={settings.overBoughtColor || '#EF4444'}
                                    onChange={(e) => setSettings({ ...settings, overBoughtColor: e.target.value })}
                                    className="w-20 h-8 rounded cursor-pointer ml-auto border-0"
                                    style={{ backgroundColor: settings.overBoughtColor || '#EF4444' }}
                                />
                            </div>
                        </div>

                        {/* Over Sold */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-white mb-2">Over Sold</label>
                            <div className="flex items-center gap-2">
                                <label className="text-xs text-gray-200 w-12">Size</label>
                                <button
                                    onClick={() => setSettings({ ...settings, overSold: Math.max(0, (settings.overSold || 20) - 1) })}
                                    className="w-8 h-8 bg-[#16124A] hover:bg-[#2F6BFF]/30 rounded text-white"
                                >
                                    -
                                </button>
                                <input
                                    type="number"
                                    value={settings.overSold || 20}
                                    onChange={(e) => setSettings({ ...settings, overSold: parseInt(e.target.value) || 20 })}
                                    className="w-16 px-2 py-1 bg-[#0B0633] border border-[#16124A] rounded text-white text-sm text-center focus:outline-none focus:border-[#2F6BFF]"
                                />
                                <button
                                    onClick={() => setSettings({ ...settings, overSold: Math.min(50, (settings.overSold || 20) + 1) })}
                                    className="w-8 h-8 bg-[#16124A] hover:bg-[#2F6BFF]/30 rounded text-white"
                                >
                                    +
                                </button>
                                <input
                                    type="color"
                                    value={settings.overSoldColor || '#22C55E'}
                                    onChange={(e) => setSettings({ ...settings, overSoldColor: e.target.value })}
                                    className="w-20 h-8 rounded cursor-pointer ml-auto border-0"
                                    style={{ backgroundColor: settings.overSoldColor || '#22C55E' }}
                                />
                            </div>
                        </div>

                        {/* Show Zones Toggle */}
                        <div className="mb-4">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={settings.showZones !== false}
                                    onChange={(e) => setSettings({ ...settings, showZones: e.target.checked })}
                                    className="w-4 h-4"
                                />
                                <span className="text-sm text-white">Show Zones</span>
                            </label>
                        </div>

                        {/* Result Color */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-white mb-2">Result</label>
                            <div className="flex items-center gap-2">
                                <label className="text-xs text-gray-200 w-12">Color</label>
                                <div className="flex-1 flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={settings.color || '#efdede'}
                                        onChange={(e) => setSettings({ ...settings, color: e.target.value })}
                                        className="w-20 h-10 rounded cursor-pointer border-0"
                                        style={{ backgroundColor: settings.color || '#efdede' }}
                                    />
                                    <span className="text-gray-200 text-sm">{settings.color || '#efdede'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Period */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-white mb-2">Period</label>
                            <input
                                type="number"
                                value={settings.period || 14}
                                onChange={(e) => setSettings({ ...settings, period: parseInt(e.target.value) || 14 })}
                                className="w-full px-3 py-2 bg-[#0B0633] border border-[#16124A] rounded text-white text-sm focus:outline-none focus:border-[#2F6BFF]"
                            />
                        </div>

                        {/* Field */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-white mb-2">Field</label>
                            <select
                                value={settings.field || 'close'}
                                onChange={(e) => setSettings({ ...settings, field: e.target.value })}
                                className="w-full px-3 py-2 bg-[#0B0633] border border-[#16124A] rounded text-white text-sm focus:outline-none focus:border-[#2F6BFF]"
                            >
                                <option value="close">Close</option>
                                <option value="open">Open</option>
                                <option value="high">High</option>
                                <option value="low">Low</option>
                            </select>
                        </div>
                    </>
                );

            case 'macd':
                return (
                    <>
                        {/* Increasing Bar Color */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-white mb-2">Increasing Bar</label>
                            <div className="flex items-center gap-2">
                                <label className="text-xs text-gray-200 w-12">Color</label>
                                <input
                                    type="color"
                                    value={settings.increasingColor || '#22C55E'}
                                    onChange={(e) => setSettings({ ...settings, increasingColor: e.target.value })}
                                    className="w-full h-10 rounded cursor-pointer border-0"
                                    style={{ backgroundColor: settings.increasingColor || '#22C55E' }}
                                />
                            </div>
                        </div>

                        {/* Decreasing Bar Color */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-white mb-2">Decreasing Bar</label>
                            <div className="flex items-center gap-2">
                                <label className="text-xs text-gray-200 w-12">Color</label>
                                <input
                                    type="color"
                                    value={settings.decreasingColor || '#EF4444'}
                                    onChange={(e) => setSettings({ ...settings, decreasingColor: e.target.value })}
                                    className="w-full h-10 rounded cursor-pointer border-0"
                                    style={{ backgroundColor: settings.decreasingColor || '#EF4444' }}
                                />
                            </div>
                        </div>

                        {/* Fast MA Period */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-white mb-2">Fast MA Period</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="range"
                                    min="1"
                                    max="50"
                                    value={settings.fastPeriod || 12}
                                    onChange={(e) => setSettings({ ...settings, fastPeriod: parseInt(e.target.value) })}
                                    className="flex-1"
                                />
                                <span className="text-white font-medium w-12 text-right">{settings.fastPeriod || 12}</span>
                            </div>
                        </div>

                        {/* Slow MA Period */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-white mb-2">Slow MA Period</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="range"
                                    min="1"
                                    max="100"
                                    value={settings.slowPeriod || 26}
                                    onChange={(e) => setSettings({ ...settings, slowPeriod: parseInt(e.target.value) })}
                                    className="flex-1"
                                />
                                <span className="text-white font-medium w-12 text-right">{settings.slowPeriod || 26}</span>
                            </div>
                        </div>

                        {/* Signal MA Period */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-white mb-2">Signal MA Period</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="range"
                                    min="1"
                                    max="50"
                                    value={settings.signalPeriod || 9}
                                    onChange={(e) => setSettings({ ...settings, signalPeriod: parseInt(e.target.value) })}
                                    className="flex-1"
                                />
                                <span className="text-white font-medium w-12 text-right">{settings.signalPeriod || 9}</span>
                            </div>
                        </div>
                    </>
                );

            case 'awesome_oscillator':
                return (
                    <>
                        {/* Increasing Bar Color */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-white mb-2">Increasing Bar</label>
                            <div className="flex items-center gap-2">
                                <label className="text-xs text-gray-200 w-12">Color</label>
                                <input
                                    type="color"
                                    value={settings.increasingColor || '#22C55E'}
                                    onChange={(e) => setSettings({ ...settings, increasingColor: e.target.value })}
                                    className="w-full h-10 rounded cursor-pointer border-0"
                                    style={{ backgroundColor: settings.increasingColor || '#22C55E' }}
                                />
                            </div>
                        </div>

                        {/* Decreasing Bar Color */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-white mb-2">Decreasing Bar</label>
                            <div className="flex items-center gap-2">
                                <label className="text-xs text-gray-200 w-12">Color</label>
                                <input
                                    type="color"
                                    value={settings.decreasingColor || '#EF4444'}
                                    onChange={(e) => setSettings({ ...settings, decreasingColor: e.target.value })}
                                    className="w-full h-10 rounded cursor-pointer border-0"
                                    style={{ backgroundColor: settings.decreasingColor || '#EF4444' }}
                                />
                            </div>
                        </div>
                    </>
                );

            case 'detrended_price':
                return (
                    <>
                        {/* Result Color */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-white mb-2">Result</label>
                            <div className="flex items-center gap-2">
                                <label className="text-xs text-gray-200 w-12">Color</label>
                                <div className="flex-1 flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={settings.color || '#efdede'}
                                        onChange={(e) => setSettings({ ...settings, color: e.target.value })}
                                        className="w-20 h-10 rounded cursor-pointer border-0"
                                        style={{ backgroundColor: settings.color || '#efdede' }}
                                    />
                                    <span className="text-gray-200 text-sm">{settings.color || '#efdede'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Period */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-white mb-2">Period</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="range"
                                    min="1"
                                    max="200"
                                    value={settings.period || 14}
                                    onChange={(e) => setSettings({ ...settings, period: parseInt(e.target.value) })}
                                    className="flex-1"
                                />
                                <span className="text-white font-medium w-12 text-right">{settings.period || 14}</span>
                            </div>
                        </div>

                        {/* Field */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-white mb-2">Field</label>
                            <select
                                value={settings.field || 'close'}
                                onChange={(e) => setSettings({ ...settings, field: e.target.value })}
                                className="w-full px-3 py-2 bg-[#0B0633] border border-[#16124A] rounded text-white text-sm focus:outline-none focus:border-[#2F6BFF]"
                            >
                                <option value="close">Close</option>
                                <option value="open">Open</option>
                                <option value="high">High</option>
                                <option value="low">Low</option>
                            </select>
                        </div>

                        {/* Moving Average Type */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-white mb-2">Moving Average Type</label>
                            <select
                                value={settings.maType || 'simple'}
                                onChange={(e) => setSettings({ ...settings, maType: e.target.value })}
                                className="w-full px-3 py-2 bg-[#0B0633] border border-[#16124A] rounded text-white text-sm focus:outline-none focus:border-[#2F6BFF]"
                            >
                                <option value="simple">Simple</option>
                                <option value="exponential">Exponential</option>
                                <option value="weighted">Weighted</option>
                                <option value="hull">Hull</option>
                                <option value="zero_lag">Zero Lag</option>
                                <option value="time_series">Time Series</option>
                            </select>
                        </div>
                    </>
                );

            case 'price_rate_change':
                return (
                    <>
                        {/* Result Color */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-white mb-2">Result</label>
                            <div className="flex items-center gap-2">
                                <label className="text-xs text-gray-200 w-12">Color</label>
                                <div className="flex-1 flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={settings.color || '#efdede'}
                                        onChange={(e) => setSettings({ ...settings, color: e.target.value })}
                                        className="w-20 h-10 rounded cursor-pointer border-0"
                                        style={{ backgroundColor: settings.color || '#efdede' }}
                                    />
                                    <span className="text-gray-200 text-sm">{settings.color || '#efdede'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Period */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-white mb-2">Period</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="range"
                                    min="1"
                                    max="200"
                                    value={settings.period || 14}
                                    onChange={(e) => setSettings({ ...settings, period: parseInt(e.target.value) })}
                                    className="flex-1"
                                />
                                <span className="text-white font-medium w-12 text-right">{settings.period || 14}</span>
                            </div>
                        </div>

                        {/* Field */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-white mb-2">Field</label>
                            <select
                                value={settings.field || 'close'}
                                onChange={(e) => setSettings({ ...settings, field: e.target.value })}
                                className="w-full px-3 py-2 bg-[#0B0633] border border-[#16124A] rounded text-white text-sm focus:outline-none focus:border-[#2F6BFF]"
                            >
                                <option value="close">Close</option>
                                <option value="open">Open</option>
                                <option value="high">High</option>
                                <option value="low">Low</option>
                            </select>
                        </div>
                    </>
                );

            case 'stochastic_oscillator':
                return (
                    <>
                        {/* Result - Fast */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-white mb-2">Result</label>
                            <div className="flex items-center gap-2 mb-2">
                                <label className="text-xs text-gray-200 w-12">Fast</label>
                                <input
                                    type="color"
                                    value={settings.fastColor || '#efdede'}
                                    onChange={(e) => setSettings({ ...settings, fastColor: e.target.value })}
                                    className="w-full h-10 rounded cursor-pointer border-0"
                                    style={{ backgroundColor: settings.fastColor || '#efdede' }}
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <label className="text-xs text-gray-200 w-12">Slow</label>
                                <input
                                    type="color"
                                    value={settings.slowColor || '#EF4444'}
                                    onChange={(e) => setSettings({ ...settings, slowColor: e.target.value })}
                                    className="w-full h-10 rounded cursor-pointer border-0"
                                    style={{ backgroundColor: settings.slowColor || '#EF4444' }}
                                />
                            </div>
                        </div>

                        {/* Period */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-white mb-2">Period</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="range"
                                    min="1"
                                    max="200"
                                    value={settings.period || 14}
                                    onChange={(e) => setSettings({ ...settings, period: parseInt(e.target.value) })}
                                    className="flex-1"
                                />
                                <span className="text-white font-medium w-12 text-right">{settings.period || 14}</span>
                            </div>
                        </div>

                        {/* Field */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-white mb-2">Field</label>
                            <select
                                value={settings.field || 'close'}
                                onChange={(e) => setSettings({ ...settings, field: e.target.value })}
                                className="w-full px-3 py-2 bg-[#0B0633] border border-[#16124A] rounded text-white text-sm focus:outline-none focus:border-[#2F6BFF]"
                            >
                                <option value="close">Close</option>
                                <option value="open">Open</option>
                                <option value="high">High</option>
                                <option value="low">Low</option>
                            </select>
                        </div>

                        {/* Smooth Toggle */}
                        <div className="mb-4">
                            <label className="flex items-center gap-2">
                                <span className="text-sm text-white">Smooth</span>
                                <input
                                    type="checkbox"
                                    checked={settings.smooth !== false}
                                    onChange={(e) => setSettings({ ...settings, smooth: e.target.checked })}
                                    className="w-4 h-4"
                                />
                            </label>
                        </div>

                        {/* Over Bought */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-white mb-2">Over Bought</label>
                            <div className="flex items-center gap-2">
                                <label className="text-xs text-gray-200 w-12">Size</label>
                                <button
                                    onClick={() => setSettings({ ...settings, overBought: Math.max(50, (settings.overBought || 80) - 1) })}
                                    className="w-8 h-8 bg-[#16124A] hover:bg-[#2F6BFF]/30 rounded text-white"
                                >
                                    -
                                </button>
                                <input
                                    type="number"
                                    value={settings.overBought || 80}
                                    onChange={(e) => setSettings({ ...settings, overBought: parseInt(e.target.value) || 80 })}
                                    className="w-16 px-2 py-1 bg-[#0B0633] border border-[#16124A] rounded text-white text-sm text-center focus:outline-none focus:border-[#2F6BFF]"
                                />
                                <button
                                    onClick={() => setSettings({ ...settings, overBought: Math.min(100, (settings.overBought || 80) + 1) })}
                                    className="w-8 h-8 bg-[#16124A] hover:bg-[#2F6BFF]/30 rounded text-white"
                                >
                                    +
                                </button>
                                <input
                                    type="color"
                                    value={settings.overBoughtColor || '#EF4444'}
                                    onChange={(e) => setSettings({ ...settings, overBoughtColor: e.target.value })}
                                    className="w-20 h-8 rounded cursor-pointer ml-auto border-0"
                                    style={{ backgroundColor: settings.overBoughtColor || '#EF4444' }}
                                />
                            </div>
                        </div>

                        {/* Over Sold */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-white mb-2">Over Sold</label>
                            <div className="flex items-center gap-2">
                                <label className="text-xs text-gray-200 w-12">Size</label>
                                <button
                                    onClick={() => setSettings({ ...settings, overSold: Math.max(0, (settings.overSold || 20) - 1) })}
                                    className="w-8 h-8 bg-[#16124A] hover:bg-[#2F6BFF]/30 rounded text-white"
                                >
                                    -
                                </button>
                                <input
                                    type="number"
                                    value={settings.overSold || 20}
                                    onChange={(e) => setSettings({ ...settings, overSold: parseInt(e.target.value) || 20 })}
                                    className="w-16 px-2 py-1 bg-[#0B0633] border border-[#16124A] rounded text-white text-sm text-center focus:outline-none focus:border-[#2F6BFF]"
                                />
                                <button
                                    onClick={() => setSettings({ ...settings, overSold: Math.min(50, (settings.overSold || 20) + 1) })}
                                    className="w-8 h-8 bg-[#16124A] hover:bg-[#2F6BFF]/30 rounded text-white"
                                >
                                    +
                                </button>
                                <input
                                    type="color"
                                    value={settings.overSoldColor || '#22C55E'}
                                    onChange={(e) => setSettings({ ...settings, overSoldColor: e.target.value })}
                                    className="w-20 h-8 rounded cursor-pointer ml-auto border-0"
                                    style={{ backgroundColor: settings.overSoldColor || '#22C55E' }}
                                />
                            </div>
                        </div>

                        {/* Show Zones Toggle */}
                        <div className="mb-4">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={settings.showZones !== false}
                                    onChange={(e) => setSettings({ ...settings, showZones: e.target.checked })}
                                    className="w-4 h-4"
                                />
                                <span className="text-sm text-white">Show Zones</span>
                            </label>
                        </div>
                    </>
                );

            default:
                return (
                    <div className="text-center text-gray-200 py-8">
                        No settings available for this indicator
                    </div>
                );
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fadeIn" onClick={onClose} />

            {/* Modal */}
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] max-h-[600px] bg-[#0B0633] rounded-2xl shadow-2xl z-50 border border-[#2F6BFF]/30 animate-slideUp flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#2F6BFF]/20">
                    <h2 className="text-lg font-semibold text-white">{indicatorName}</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-200 hover:text-[#efdede] hover:bg-[#16124A] rounded-lg p-1.5 transition-all duration-300"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {renderSettingsFields()}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-[#16124A]">
                    <button
                        onClick={handleReset}
                        className="px-4 py-2 text-sm font-medium text-gray-100 hover:text-[#efdede] transition-colors"
                    >
                        Reset
                    </button>
                    <div className="flex gap-2">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-100 hover:text-[#efdede] transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded transition-colors"
                        >
                            Done
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

function getDefaultSettings(indicatorId: string): IndicatorSettings {
    switch (indicatorId) {
        case 'moving_average':
            return {
                color: '#2962FF',
                period: 50,
                field: 'close',
                type: 'simple',
                offset: 0,
            };
        case 'rsi':
            return {
                color: '#FF6D00',
                period: 14,
                field: 'close',
                overBought: 80,
                overSold: 20,
                overBoughtColor: '#EF4444',
                overSoldColor: '#22C55E',
                showZones: true,
            };
        case 'macd':
            return {
                fastPeriod: 12,
                slowPeriod: 26,
                signalPeriod: 9,
                increasingColor: '#22C55E',
                decreasingColor: '#EF4444',
            };
        case 'awesome_oscillator':
            return {
                increasingColor: '#22C55E',
                decreasingColor: '#EF4444',
            };
        case 'detrended_price':
            return {
                color: '#efdede',
                period: 14,
                field: 'close',
                maType: 'simple',
            };
        case 'price_rate_change':
            return {
                color: '#efdede',
                period: 14,
                field: 'close',
            };
        case 'stochastic_oscillator':
            return {
                fastColor: '#efdede',
                slowColor: '#EF4444',
                period: 14,
                field: 'close',
                smooth: true,
                overBought: 80,
                overSold: 20,
                overBoughtColor: '#EF4444',
                overSoldColor: '#22C55E',
                showZones: true,
            };
        default:
            return {};
    }
}


