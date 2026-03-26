import { Briefcase } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import ConnectionManager from '../../../services/ConnectionManager';
import StreamManager from '../../../services/StreamManager';
import ChartTypesModal from '../../trade/components/ChartTypesModal';
import DrawingToolsModal from '../../trade/components/DrawingToolsModal';
import IndicatorControls from '../../trade/components/IndicatorControls';
import IndicatorSettingsModal from '../../trade/components/IndicatorSettingsModal';
import IndicatorsModal from '../../trade/components/IndicatorsModal';
import LightweightChart from '../../trade/components/LightweightChart';
import OpenPositionsPanel from '../../trade/components/OpenPositionsPanel';
import TemplatesModal from '../../trade/components/TemplatesModal';
import ActiveBotPanel from '../components/ActiveBotPanel';
import BotSettingsPanel from '../components/BotSettingsPanel';

interface CandleData {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
}

interface Position {
    id: string;
    symbol: string;
    type: 'Rise' | 'Fall';
    stake: number;
    payout: number;
    entryPrice: number;
    currentPrice: number;
    profit: number;
    status: 'active' | 'won' | 'lost';
}

export default function MyRobotsPage() {
    const [isReady, setIsReady] = useState(false);
    const [symbol, setSymbol] = useState('R_100');
    const [granularity, setGranularity] = useState(60);
    const [chartData, setChartData] = useState<CandleData[]>([]);
    const [currentPrice, setCurrentPrice] = useState(0);
    const [priceChange, setPriceChange] = useState(0);
    const [priceChangePercent, setPriceChangePercent] = useState(0);
    const [positions, setPositions] = useState<Position[]>([]);
    const [chartType, setChartType] = useState<'area' | 'candle' | 'hollow' | 'ohlc'>('candle');
    const [isChartTypesModalOpen, setIsChartTypesModalOpen] = useState(false);
    const [isIndicatorsModalOpen, setIsIndicatorsModalOpen] = useState(false);
    const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
    const [isDrawingToolsModalOpen, setIsDrawingToolsModalOpen] = useState(false);
    const [isOpenPositionsPanelOpen, setIsOpenPositionsPanelOpen] = useState(false);
    const [activeIndicators, setActiveIndicators] = useState<string[]>(() => {
        // Load from localStorage on initial render
        const saved = localStorage.getItem('activeIndicators');
        return saved ? JSON.parse(saved) : [];
    });
    const [barSpacing, setBarSpacing] = useState(12);
    const [chartHeight, setChartHeight] = useState(600);
    const [hasTemplates, setHasTemplates] = useState(false);

    // Bot state
    const [isBotActive, setIsBotActive] = useState(false);
    const [botSettings, setBotSettings] = useState<any>(null);

    // Check if templates exist and update state
    useEffect(() => {
        const checkTemplates = () => {
            try {
                const saved = localStorage.getItem('chartTemplates');
                const templates = saved ? JSON.parse(saved) : [];
                setHasTemplates(templates.length > 0);
            } catch {
                setHasTemplates(false);
            }
        };

        // Check initially
        checkTemplates();

        // Listen for storage changes (when templates are added/removed)
        window.addEventListener('storage', checkTemplates);

        // Also check when modal closes (in case templates were modified)
        if (!isTemplatesModalOpen) {
            checkTemplates();
        }

        return () => {
            window.removeEventListener('storage', checkTemplates);
        };
    }, [isTemplatesModalOpen]);

    const chartContainerRef = useRef<HTMLDivElement>(null);
    const [isIndicatorSettingsModalOpen, setIsIndicatorSettingsModalOpen] = useState(false);
    const [editingIndicatorId, setEditingIndicatorId] = useState<string>('');
    const [indicatorSettings, setIndicatorSettings] = useState<Record<string, any>>(() => {
        // Load from localStorage on initial render
        const saved = localStorage.getItem('indicatorSettings');
        return saved ? JSON.parse(saved) : {};
    });

    const previousPriceRef = useRef<number>(0);
    const connectionManagerRef = useRef<ConnectionManager | null>(null);
    const streamManagerRef = useRef<StreamManager | null>(null);
    const currentRequestRef = useRef<any>(null);
    const currentCallbackRef = useRef<any>(null);

    // Persist activeIndicators to localStorage
    useEffect(() => {
        localStorage.setItem('activeIndicators', JSON.stringify(activeIndicators));
    }, [activeIndicators]);

    // Persist indicatorSettings to localStorage
    useEffect(() => {
        localStorage.setItem('indicatorSettings', JSON.stringify(indicatorSettings));
    }, [indicatorSettings]);

    // Auto-open positions panel when there are active positions
    useEffect(() => {
        const activePositions = positions.filter(p => p.status === 'active');
        if (activePositions.length > 0) {
            setIsOpenPositionsPanelOpen(true);
        }
    }, [positions]);

    // Measure chart height
    useEffect(() => {
        const updateHeight = () => {
            if (chartContainerRef.current) {
                setChartHeight(chartContainerRef.current.clientHeight);
            }
        };

        updateHeight();
        window.addEventListener('resize', updateHeight);
        return () => window.removeEventListener('resize', updateHeight);
    }, []);

    // Initialize WebSocket connection
    useEffect(() => {
        const appId = '1089';
        const language = 'en';
        const endpoint = 'wss://ws.derivws.com/websockets/v3';

        const connectionManager = new ConnectionManager({
            appId,
            language,
            endpoint,
        });

        connectionManagerRef.current = connectionManager;

        const streamManager = new StreamManager(connectionManager);
        streamManagerRef.current = streamManager;

        connectionManager.onOpened(() => {
            console.log('✅ Deriv WebSocket connected');
            setIsReady(true);
        });

        connectionManager.onClosed(() => {
            console.log('❌ Deriv WebSocket closed');
        });

        return () => {
            connectionManager.close();
        };
    }, []);

    // Subscribe to chart data when symbol or granularity changes
    useEffect(() => {
        if (!isReady || !streamManagerRef.current) return;

        const streamManager = streamManagerRef.current;
        const connectionManager = connectionManagerRef.current;

        if (!connectionManager) return;

        // Unsubscribe from previous subscription
        if (currentRequestRef.current && currentCallbackRef.current) {
            streamManager.forget(currentRequestRef.current, currentCallbackRef.current);
            currentRequestRef.current = null;
            currentCallbackRef.current = null;
        }

        // Clear chart data
        setChartData([]);

        // Subscribe to new symbol/granularity
        connectionManager.send({ time: 1 }).then((timeResponse) => {
            const serverTime = timeResponse.time;

            const request = {
                ticks_history: symbol,
                style: 'candles',
                end: serverTime,
                count: 1000,
                granularity: granularity,
                adjust_start_time: 1,
                subscribe: 1,
            };

            const callback = (response: any) => {
                if (response.candles) {
                    console.log(`📊 Received ${response.candles.length} candles`);

                    // Transform to Lightweight Charts format
                    const formattedData: CandleData[] = response.candles.map((candle: any) => ({
                        time: candle.epoch,
                        open: typeof candle.open === 'string' ? parseFloat(candle.open) : candle.open,
                        high: typeof candle.high === 'string' ? parseFloat(candle.high) : candle.high,
                        low: typeof candle.low === 'string' ? parseFloat(candle.low) : candle.low,
                        close: typeof candle.close === 'string' ? parseFloat(candle.close) : candle.close,
                    }));

                    setChartData(formattedData);

                    // Update current price
                    if (formattedData.length > 0) {
                        const latestCandle = formattedData[formattedData.length - 1];
                        const newPrice = latestCandle.close;
                        previousPriceRef.current = newPrice;
                        setCurrentPrice(newPrice);
                        setPriceChange(0);
                        setPriceChangePercent(0);
                    }
                } else if (response.ohlc) {
                    // Live update
                    const newCandle: CandleData = {
                        time: response.ohlc.open_time,
                        open: parseFloat(response.ohlc.open),
                        high: parseFloat(response.ohlc.high),
                        low: parseFloat(response.ohlc.low),
                        close: parseFloat(response.ohlc.close),
                    };

                    const newPrice = newCandle.close;

                    // Calculate price change from previous price (tick-to-tick)
                    if (previousPriceRef.current > 0) {
                        const change = newPrice - previousPriceRef.current;
                        const changePercent = (change / previousPriceRef.current) * 100;
                        setPriceChange(change);
                        setPriceChangePercent(changePercent);
                    }

                    // Update current price and store as previous for next update
                    setCurrentPrice(newPrice);
                    previousPriceRef.current = newPrice;

                    // Update chart data
                    setChartData((prev) => {
                        const lastCandle = prev[prev.length - 1];
                        if (lastCandle && lastCandle.time === newCandle.time) {
                            return [...prev.slice(0, -1), newCandle];
                        } else {
                            return [...prev, newCandle];
                        }
                    });
                }
            };

            streamManager.subscribe(request, callback);

            // Store for cleanup
            currentRequestRef.current = request;
            currentCallbackRef.current = callback;
        });

        return () => {
            if (currentRequestRef.current && currentCallbackRef.current && streamManagerRef.current) {
                streamManagerRef.current.forget(currentRequestRef.current, currentCallbackRef.current);
            }
        };
    }, [isReady, symbol, granularity]);

    const handleTradePlaced = (tradeData: any) => {
        console.log('📊 Trade placed:', tradeData);

        const newPosition: Position = {
            id: `pos_${Date.now()}`,
            symbol: tradeData.symbol,
            type: tradeData.type,
            stake: tradeData.stake,
            payout: tradeData.stake * 1.95,
            entryPrice: currentPrice,
            currentPrice: currentPrice,
            profit: 0,
            status: 'active',
        };

        setPositions((prev) => [...prev, newPosition]);
    };

    const handleDownloadTemplate = () => {
        // Create template object with current chart settings
        const template = {
            name: `Chart Template ${new Date().toLocaleDateString()}`,
            chartType,
            granularity,
            activeIndicators,
            indicatorSettings,
            barSpacing,
            createdAt: new Date().toISOString(),
        };

        // Convert to JSON string
        const jsonString = JSON.stringify(template, null, 2);

        // Create blob and download
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `chart-template-${Date.now()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleEditIndicator = (indicatorId: string) => {
        setEditingIndicatorId(indicatorId);
        setIsIndicatorSettingsModalOpen(true);
    };

    const handleDeleteIndicator = (indicatorId: string) => {
        setActiveIndicators((prev) => prev.filter((id) => id !== indicatorId));
        // Also remove settings for this indicator
        setIndicatorSettings((prev) => {
            const newSettings = { ...prev };
            delete newSettings[indicatorId];
            return newSettings;
        });
    };

    const handleSaveIndicatorSettings = (settings: any) => {
        setIndicatorSettings((prev) => ({
            ...prev,
            [editingIndicatorId]: settings,
        }));
    };

    const getIndicatorName = (indicatorId: string): string => {
        const names: Record<string, string> = {
            moving_average: 'Moving Average (MA)',
            rsi: 'Relative Strength Index (RSI)',
            bollinger_bands: 'Bollinger Bands',
            macd: 'MACD',
            stochastic_oscillator: 'Stochastic Oscillator',
            adx_dms: 'ADX/DMS',
            parabolic_sar: 'Parabolic SAR',
            awesome_oscillator: 'Awesome Oscillator',
            detrended_price: 'Detrended Price Oscillator',
            price_rate_change: 'Price Rate of Change',
        };
        return names[indicatorId] || indicatorId;
    };

    const getDefaultSettings = (indicatorId: string): any => {
        switch (indicatorId) {
            case 'moving_average':
                return {
                    color: '#2F6BFF',
                    period: 50,
                    field: 'close',
                    type: 'simple',
                    offset: 0,
                };
            case 'rsi':
                return {
                    color: '#FFA62B',
                    period: 14,
                    field: 'close',
                    overBought: 80,
                    overSold: 20,
                    overBoughtColor: '#F87171',
                    overSoldColor: '#10B981',
                    showZones: true,
                };
            case 'macd':
                return {
                    fastPeriod: 12,
                    slowPeriod: 26,
                    signalPeriod: 9,
                    increasingColor: '#10B981',
                    decreasingColor: '#F87171',
                };
            case 'awesome_oscillator':
                return {
                    increasingColor: '#10B981',
                    decreasingColor: '#F87171',
                };
            case 'detrended_price':
                return {
                    color: '#2F6BFF',
                    period: 14,
                    field: 'close',
                    maType: 'simple',
                };
            case 'price_rate_change':
                return {
                    color: '#FFA62B',
                    period: 14,
                    field: 'close',
                };
            case 'stochastic_oscillator':
                return {
                    fastColor: '#2F6BFF',
                    slowColor: '#F87171',
                    period: 14,
                    field: 'close',
                    smooth: true,
                    overBought: 80,
                    overSold: 20,
                    overBoughtColor: '#F87171',
                    overSoldColor: '#10B981',
                    showZones: true,
                };
            default:
                return {};
        }
    };

    const getActiveIndicatorsWithPosition = () => {
        // Define which indicators should be in bottom pane
        // Momentum and trend indicators that use oscillators go to bottom pane
        const bottomPaneIndicators = [
            // Momentum indicators
            'awesome_oscillator',
            'detrended_price',
            'macd',
            'price_rate_change',
            'rsi',
            'stochastic_oscillator',
            'stochastic_momentum',
            'williams_percent',
            // Trend indicators (oscillator-based)
            'aroon',
            'adx_dms',
            'commodity_channel',
        ];

        return activeIndicators.map(id => ({
            id,
            name: getIndicatorName(id),
            position: bottomPaneIndicators.includes(id) ? 'bottom' as const : 'main' as const,
        }));
    };

    // Bot handlers
    const handleStartBot = (settings: any) => {
        console.log('🤖 Starting bot with settings:', settings);
        setBotSettings(settings);
        setIsBotActive(true);
        // TODO: Connect to bot API
    };

    const handleStopBot = () => {
        console.log('🛑 Stopping bot');
        setIsBotActive(false);
        // TODO: Disconnect from bot API
    };

    if (!isReady) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-[#0D0735] via-[#0B0633] to-[#16124A]/60 gap-6">
                <div className="relative">
                    {/* Outer glow ring */}
                    <div className="absolute inset-0 w-20 h-20 -m-2 rounded-full bg-gradient-to-r from-[#2F6BFF]/20 to-[#FFA62B]/20 blur-xl animate-pulse"></div>
                    {/* Main spinner */}
                    <div className="relative w-16 h-16 border-4 border-[#2F6BFF]/20 border-t-[#2F6BFF] rounded-full animate-spin shadow-[0_0_20px_rgba(30,109,227,0.5)]"></div>
                    {/* Counter spinner */}
                    <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-[#FFA62B] rounded-full animate-spin shadow-[0_0_20px_rgba(240,122,47,0.5)]" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }}></div>
                </div>
                <div className="text-center space-y-2">
                    <span className="text-white text-lg font-semibold bg-gradient-to-r from-[#2F6BFF] to-[#FFA62B] bg-clip-text text-transparent">Connecting to Deriv...</span>
                    <div className="flex gap-1.5 justify-center">
                        <div className="w-2 h-2 bg-gradient-to-r from-[#2F6BFF] to-[#2557c9] rounded-full animate-bounce shadow-[0_0_8px_rgba(30,109,227,0.6)]" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-gradient-to-r from-[#2F6BFF] to-[#2557c9] rounded-full animate-bounce shadow-[0_0_8px_rgba(30,109,227,0.6)]" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-gradient-to-r from-[#2F6BFF] to-[#2557c9] rounded-full animate-bounce shadow-[0_0_8px_rgba(30,109,227,0.6)]" style={{ animationDelay: '300ms' }}></div>
                    </div>
                </div>
            </div>
        );
    }

    if (chartData.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-[#0D0735] via-[#0B0633] to-[#16124A]/60 gap-6">
                <div className="relative">
                    {/* Outer glow ring */}
                    <div className="absolute inset-0 w-20 h-20 -m-2 rounded-full bg-gradient-to-r from-[#2F6BFF]/20 to-[#FFA62B]/20 blur-xl animate-pulse"></div>
                    {/* Main spinner */}
                    <div className="relative w-16 h-16 border-4 border-[#2F6BFF]/20 border-t-[#2F6BFF] rounded-full animate-spin shadow-[0_0_20px_rgba(30,109,227,0.5)]"></div>
                    {/* Counter spinner */}
                    <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-[#FFA62B] rounded-full animate-spin shadow-[0_0_20px_rgba(240,122,47,0.5)]" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }}></div>
                </div>
                <div className="text-center space-y-2">
                    <span className="text-white text-lg font-semibold bg-gradient-to-r from-[#2F6BFF] to-[#FFA62B] bg-clip-text text-transparent">Loading chart data...</span>
                    <div className="flex gap-1.5 justify-center">
                        <div className="w-2 h-2 bg-gradient-to-r from-[#2F6BFF] to-[#2557c9] rounded-full animate-bounce shadow-[0_0_8px_rgba(30,109,227,0.6)]" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-gradient-to-r from-[#2F6BFF] to-[#2557c9] rounded-full animate-bounce shadow-[0_0_8px_rgba(30,109,227,0.6)]" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-gradient-to-r from-[#2F6BFF] to-[#2557c9] rounded-full animate-bounce shadow-[0_0_8px_rgba(30,109,227,0.6)]" style={{ animationDelay: '300ms' }}></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-full bg-[#0B0633]">
            {/* Left Side - Chart with Overlay Header */}
            <div className="flex-1 relative">
                {/* Top Bar - Market & Toolbar */}
                <div className={`absolute top-0 right-0 z-10 px-4 py-3 flex items-center transition-all duration-300 ${isOpenPositionsPanelOpen ? 'left-[220px]' : 'left-0'}`}>

                    {/* Spacer */}
                    <div className="w-12"></div>

                    {/* Chart Toolbar - Centered */}
                    <div className="flex-1 flex items-center justify-center">
                        <div className="flex items-center gap-2 bg-gradient-to-r from-[#0B0633] via-[#16124A] to-[#0B0633] px-4 py-2 rounded-xl border border-[#2F6BFF]/30 shadow-lg shadow-[#2F6BFF]/20">
                            {/* Chart Types & Timeframe */}
                            <button
                                onClick={() => setIsChartTypesModalOpen(true)}
                                className="flex items-center justify-center w-9 h-9 bg-gradient-to-br from-[#16124A] to-[#1E1854] hover:from-[#2F6BFF] hover:to-[#4A5FD9] rounded-lg transition-all duration-300 border border-[#2F6BFF]/30 hover:border-[#2F6BFF] hover:scale-110 hover:shadow-lg hover:shadow-[#2F6BFF]/50 group"
                                title="Chart Types & Timeframe"
                            >
                                <svg className="w-4 h-4 text-gray-100 group-hover:text-[#efdede] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </button>

                            {/* Drawing Tools */}
                            <button
                                onClick={() => setIsDrawingToolsModalOpen(true)}
                                className="flex items-center justify-center w-9 h-9 bg-gradient-to-br from-[#16124A] to-[#1E1854] hover:from-[#2F6BFF] hover:to-[#4A5FD9] rounded-lg transition-all duration-300 border border-[#2F6BFF]/30 hover:border-[#2F6BFF] hover:scale-110 hover:shadow-lg hover:shadow-[#2F6BFF]/50 group"
                                title="Drawing Tools"
                            >
                                <svg className="w-4 h-4 text-gray-100 group-hover:text-[#efdede] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                            </button>

                            {/* Divider */}
                            <div className="w-px h-6 bg-gradient-to-b from-transparent via-[#2F6BFF]/50 to-transparent mx-1" />

                            {/* Zoom Out */}
                            <button
                                onClick={() => {
                                    setBarSpacing((prev) => {
                                        const newValue = prev - 5;
                                        return newValue < 5 ? 5 : newValue;
                                    });
                                }}
                                className="flex items-center justify-center w-9 h-9 bg-gradient-to-br from-[#16124A] to-[#1E1854] hover:from-[#2F6BFF] hover:to-[#4A5FD9] rounded-lg transition-all duration-300 border border-[#2F6BFF]/30 hover:border-[#2F6BFF] hover:scale-110 hover:shadow-lg hover:shadow-[#2F6BFF]/50 group"
                                title="Zoom Out"
                            >
                                <svg className="w-4 h-4 text-gray-100 group-hover:text-[#efdede] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                                </svg>
                            </button>

                            {/* Zoom In */}
                            <button
                                onClick={() => {
                                    setBarSpacing((prev) => {
                                        const newValue = prev + 5;
                                        return newValue > 50 ? 50 : newValue;
                                    });
                                }}
                                className="flex items-center justify-center w-9 h-9 bg-gradient-to-br from-[#16124A] to-[#1E1854] hover:from-[#2F6BFF] hover:to-[#4A5FD9] rounded-lg transition-all duration-300 border border-[#2F6BFF]/30 hover:border-[#2F6BFF] hover:scale-110 hover:shadow-lg hover:shadow-[#2F6BFF]/50 group"
                                title="Zoom In"
                            >
                                <svg className="w-4 h-4 text-gray-100 group-hover:text-[#efdede] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Right spacer to balance layout */}
                    <div className="w-[300px]"></div>
                </div>

                {/* Chart Area - Full Height with Top Padding */}
                <div ref={chartContainerRef} className="w-full h-full pt-[85px] relative">
                    <LightweightChart
                        data={chartData}
                        chartType={chartType}
                        barSpacing={barSpacing}
                        activeIndicators={activeIndicators}
                        indicatorSettings={indicatorSettings}
                    />

                    {/* Indicator Controls Overlay */}
                    <IndicatorControls
                        indicators={getActiveIndicatorsWithPosition()}
                        onEdit={handleEditIndicator}
                        onDelete={handleDeleteIndicator}
                        chartHeight={chartHeight}
                    />
                </div>

                {/* Portfolio Icon - Bottom Left Corner of Page */}
                <button
                    onClick={() => setIsOpenPositionsPanelOpen(!isOpenPositionsPanelOpen)}
                    className="fixed bottom-3 left-66 p-0 bg-[#0B0633]/90 hover:bg-gray-700/90 rounded border border-[#16124A]/50 transition-colors z-40"
                    title="Portfolio"
                >
                    <Briefcase className="w-4 h-4 text-gray-200" />
                    {positions.filter(p => p.status === 'active').length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center">
                            {positions.filter(p => p.status === 'active').length}
                        </span>
                    )}
                </button>

                {/* Open Positions Panel */}
                <OpenPositionsPanel
                    isOpen={isOpenPositionsPanelOpen}
                    onClose={() => setIsOpenPositionsPanelOpen(false)}
                    positions={positions}
                    onDismissPosition={(positionId) => {
                        setPositions(prev => prev.filter(p => p.id !== positionId));
                    }}
                />
            </div>

            {/* Right Side - Bot Panel */}
            {isBotActive && botSettings ? (
                <ActiveBotPanel settings={botSettings} onStopBot={handleStopBot} />
            ) : (
                <BotSettingsPanel onStartBot={handleStartBot} />
            )}

            {/* Chart Types Modal */}
            <ChartTypesModal
                isOpen={isChartTypesModalOpen}
                onClose={() => setIsChartTypesModalOpen(false)}
                selectedChartType={chartType}
                selectedInterval={granularity}
                onChartTypeChange={setChartType}
                onIntervalChange={setGranularity}
            />

            {/* Indicators Modal */}
            <IndicatorsModal
                isOpen={isIndicatorsModalOpen}
                onClose={() => setIsIndicatorsModalOpen(false)}
                activeIndicators={activeIndicators}
                onToggleIndicator={(indicatorId) => {
                    setActiveIndicators((prev) => {
                        const isAdding = !prev.includes(indicatorId);
                        if (isAdding) {
                            // Initialize settings for new indicator
                            if (!indicatorSettings[indicatorId]) {
                                setIndicatorSettings((prevSettings) => ({
                                    ...prevSettings,
                                    [indicatorId]: getDefaultSettings(indicatorId),
                                }));
                            }
                            return [...prev, indicatorId];
                        } else {
                            return prev.filter((id) => id !== indicatorId);
                        }
                    });
                }}
                onEditIndicator={handleEditIndicator}
                onDeleteIndicator={handleDeleteIndicator}
            />

            {/* Indicator Settings Modal */}
            <IndicatorSettingsModal
                isOpen={isIndicatorSettingsModalOpen}
                onClose={() => setIsIndicatorSettingsModalOpen(false)}
                indicatorId={editingIndicatorId}
                indicatorName={getIndicatorName(editingIndicatorId)}
                currentSettings={indicatorSettings[editingIndicatorId] || getDefaultSettings(editingIndicatorId)}
                onSave={handleSaveIndicatorSettings}
            />

            {/* Templates Modal */}
            <TemplatesModal
                isOpen={isTemplatesModalOpen}
                onClose={() => setIsTemplatesModalOpen(false)}
            />

            {/* Drawing Tools Modal */}
            <DrawingToolsModal
                isOpen={isDrawingToolsModalOpen}
                onClose={() => setIsDrawingToolsModalOpen(false)}
            />
        </div>
    );
}
