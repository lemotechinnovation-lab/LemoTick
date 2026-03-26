import { AreaSeries, BarSeries, CandlestickData, CandlestickSeries, createChart, IChartApi, ISeriesApi, LineData, LineSeries } from 'lightweight-charts';
import { useEffect, useRef } from 'react';
import { calculateADX, calculateAwesomeOscillator, calculateBollingerBands, calculateDPO, calculateEMA, calculateHMA, calculateMACD, calculatePSAR, calculateROC, calculateRSI, calculateSMA, calculateStochastic, calculateTSMA, calculateWMA, calculateZLEMA } from '../utils/indicators';

interface CandleData {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
}

interface LightweightChartProps {
    data: CandleData[];
    chartType: 'area' | 'candle' | 'hollow' | 'ohlc';
    barSpacing?: number;
    activeIndicators?: string[];
    indicatorSettings?: Record<string, any>;
}

export default function LightweightChart({ data, chartType, barSpacing = 20, activeIndicators = [], indicatorSettings = {} }: LightweightChartProps) {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const seriesRef = useRef<any>(null);
    const indicatorSeriesRef = useRef<Map<string, ISeriesApi<any>>>(new Map());
    const isInitialLoad = useRef(true);

    useEffect(() => {
        if (!chartContainerRef.current) return;

        // Create chart
        const chart = createChart(chartContainerRef.current, {
            width: chartContainerRef.current.clientWidth,
            height: chartContainerRef.current.clientHeight,
            layout: {
                background: { color: '#0B0633' },
                textColor: '#E5E7EB',
                fontSize: 11,
            },
            grid: {
                vertLines: { color: '#16124A', visible: true },
                horzLines: { color: '#16124A', visible: true },
            },
            crosshair: {
                mode: 1,
                vertLine: {
                    color: '#2F6BFF',
                    width: 1,
                    style: 2,
                },
                horzLine: {
                    color: '#2F6BFF',
                    width: 1,
                    style: 2,
                },
            },
            rightPriceScale: {
                borderColor: '#16124A',
                visible: true,
                scaleMargins: {
                    top: 0.1,
                    bottom: 0.1,
                },
            },
            timeScale: {
                borderColor: '#16124A',
                timeVisible: true,
                secondsVisible: false,
                barSpacing: barSpacing,
                minBarSpacing: 5,
                rightOffset: 5,
                fixLeftEdge: false,
                fixRightEdge: false,
                tickMarkFormatter: (time: any) => {
                    const date = new Date(time * 1000);
                    const hours = date.getHours().toString().padStart(2, '0');
                    const minutes = date.getMinutes().toString().padStart(2, '0');
                    return `${hours}:${minutes}`;
                },
            },
        });

        chartRef.current = chart;

        // Add series based on chart type
        let series: ISeriesApi<any>;

        if (chartType === 'area') {
            series = chart.addSeries(AreaSeries);
            series.applyOptions({
                lineColor: '#2F6BFF',
                topColor: 'rgba(30, 109, 227, 0.4)',
                bottomColor: 'rgba(30, 109, 227, 0.0)',
                lineWidth: 2,
                priceScaleId: 'right',
            });
        } else if (chartType === 'candle') {
            series = chart.addSeries(CandlestickSeries);
            series.applyOptions({
                upColor: '#10B981',
                downColor: '#F87171',
                borderUpColor: '#10B981',
                borderDownColor: '#F87171',
                wickUpColor: '#10B981',
                wickDownColor: '#F87171',
                borderVisible: true,
                wickVisible: true,
                priceScaleId: 'right',
            });
        } else if (chartType === 'hollow') {
            series = chart.addSeries(CandlestickSeries);
            series.applyOptions({
                upColor: 'transparent',
                downColor: '#F87171',
                borderUpColor: '#10B981',
                borderDownColor: '#F87171',
                wickUpColor: '#10B981',
                wickDownColor: '#F87171',
                borderVisible: true,
                wickVisible: true,
                priceScaleId: 'right',
            });
        } else if (chartType === 'ohlc') {
            series = chart.addSeries(BarSeries);
            series.applyOptions({
                upColor: '#10B981',
                downColor: '#F87171',
                openVisible: true,
                thinBars: false,
                priceScaleId: 'right',
            });
        } else {
            // Default to candlestick
            series = chart.addSeries(CandlestickSeries);
            series.applyOptions({
                upColor: '#10B981',
                downColor: '#F87171',
                borderUpColor: '#10B981',
                borderDownColor: '#F87171',
                wickUpColor: '#10B981',
                wickDownColor: '#F87171',
                borderVisible: true,
                wickVisible: true,
                priceScaleId: 'right',
            });
        }

        seriesRef.current = series;

        // Handle resize
        const handleResize = () => {
            if (chartContainerRef.current && chartRef.current) {
                chartRef.current.applyOptions({
                    width: chartContainerRef.current.clientWidth,
                    height: chartContainerRef.current.clientHeight,
                });
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, [chartType]);

    // Update barSpacing without recreating the chart
    useEffect(() => {
        if (!chartRef.current) return;

        // Clamp barSpacing to valid range
        const clampedSpacing = Math.max(5, Math.min(50, barSpacing));

        chartRef.current.applyOptions({
            timeScale: {
                barSpacing: clampedSpacing,
            },
        });
    }, [barSpacing]);

    // Update chart data
    useEffect(() => {
        if (!seriesRef.current || data.length === 0) return;

        if (chartType === 'area') {
            // Area chart uses LineData format (only time and value)
            const formattedData: LineData[] = data.map((candle) => ({
                time: candle.time as any,
                value: candle.close,
            }));
            seriesRef.current.setData(formattedData);
        } else {
            // Candlestick, Hollow, and OHLC use CandlestickData format
            const formattedData: CandlestickData[] = data.map((candle) => ({
                time: candle.time as any,
                open: candle.open,
                high: candle.high,
                low: candle.low,
                close: candle.close,
            }));
            seriesRef.current.setData(formattedData);
        }

        // Fit content with better visibility and spacing from y-axis
        if (chartRef.current && isInitialLoad.current) {
            // Set visible range to show last 60 candles for better visibility (only on initial load)
            const visibleLogicalRange = {
                from: Math.max(0, data.length - 60),
                to: data.length + 3, // Add 3 bars of space on the right
            };
            chartRef.current.timeScale().setVisibleLogicalRange(visibleLogicalRange);
            isInitialLoad.current = false;
        }
    }, [data, chartType]);

    // Draw indicators when activeIndicators or data changes
    useEffect(() => {
        if (!chartRef.current || data.length === 0) return;

        // Remove old indicator series
        indicatorSeriesRef.current.forEach((series) => {
            if (series && chartRef.current) {
                try {
                    chartRef.current.removeSeries(series);
                } catch (error) {
                    console.warn('Error removing series:', error);
                }
            }
        });
        indicatorSeriesRef.current.clear();

        // Determine which indicators go to bottom pane
        const bottomPaneIndicators = ['rsi', 'macd', 'stochastic_oscillator', 'adx_dms',
            'awesome_oscillator', 'detrended_price', 'price_rate_change', 'stochastic_momentum',
            'williams_percent', 'aroon', 'commodity_channel'];

        const activeBottomIndicators = activeIndicators.filter(id => bottomPaneIndicators.includes(id));
        const bottomIndicatorCount = Math.min(activeBottomIndicators.length, 2); // Max 2

        // Adjust main chart scale margins based on number of bottom indicators
        if (seriesRef.current) {
            const mainChartBottom = bottomIndicatorCount === 0 ? 0.1 : 0.1 + (bottomIndicatorCount * 0.1);
            chartRef.current!.priceScale('right').applyOptions({
                scaleMargins: {
                    top: 0.1,
                    bottom: mainChartBottom,
                },
            });
        }

        // Calculate scale margins for each bottom indicator
        // First indicator in array goes to bottom, second goes above it
        const getScaleMargins = (indicatorId: string) => {
            const indexInBottomIndicators = activeBottomIndicators.indexOf(indicatorId);
            if (indexInBottomIndicators === -1 || bottomIndicatorCount === 0) {
                return { top: 0.8, bottom: 0 };
            }

            const mainChartHeight = 0.75; // 75% reserved for main chart (reduced from 80% to add spacing)
            const spacingBetweenIndicators = 0.02; // 2% spacing between indicators
            const totalIndicatorSpace = 1 - mainChartHeight;
            const indicatorHeight = (totalIndicatorSpace - (spacingBetweenIndicators * (bottomIndicatorCount - 1))) / bottomIndicatorCount;

            // First indicator (index 0) goes to bottom, second (index 1) goes above with spacing
            const positionFromBottom = indexInBottomIndicators;
            const bottom = (positionFromBottom * indicatorHeight) + (positionFromBottom * spacingBetweenIndicators);
            const top = 1 - bottom - indicatorHeight;

            return { top, bottom };
        };

        // Add new indicator series based on activeIndicators
        activeIndicators.forEach((indicatorId) => {
            try {
                const settings = indicatorSettings[indicatorId] || {};

                switch (indicatorId) {
                    case 'moving_average': {
                        const period = settings.period || 50;
                        const color = settings.color || '#2962FF';
                        const type = settings.type || 'simple';

                        let maData;
                        let maLabel;

                        switch (type) {
                            case 'exponential':
                                maData = calculateEMA(data, period);
                                maLabel = `EMA(${period})`;
                                break;
                            case 'weighted':
                                maData = calculateWMA(data, period);
                                maLabel = `WMA(${period})`;
                                break;
                            case 'hull':
                                maData = calculateHMA(data, period);
                                maLabel = `HMA(${period})`;
                                break;
                            case 'zero_lag':
                                maData = calculateZLEMA(data, period);
                                maLabel = `ZLEMA(${period})`;
                                break;
                            case 'time_series':
                                maData = calculateTSMA(data, period);
                                maLabel = `TSMA(${period})`;
                                break;
                            case 'simple':
                            default:
                                maData = calculateSMA(data, period);
                                maLabel = `SMA(${period})`;
                                break;
                        }

                        const smaSeries = chartRef.current!.addSeries(LineSeries);
                        smaSeries.applyOptions({
                            color: color,
                            lineWidth: 2,
                            title: maLabel,
                        });
                        smaSeries.setData(maData as any);
                        indicatorSeriesRef.current.set('moving_average', smaSeries);
                        break;
                    }
                    case 'rsi': {
                        const period = settings.period || 14;
                        const color = settings.color || '#FF6D00';
                        const overBought = settings.overBought || 80;
                        const overSold = settings.overSold || 20;
                        const overBoughtColor = settings.overBoughtColor || '#EF4444';
                        const overSoldColor = settings.overSoldColor || '#22C55E';
                        const showZones = settings.showZones !== false;

                        const rsiData = calculateRSI(data, period);
                        const rsiSeries = chartRef.current!.addSeries(LineSeries);
                        rsiSeries.applyOptions({
                            color: color,
                            lineWidth: 2,
                            title: `RSI(${period})`,
                            priceScaleId: 'rsi',
                        });
                        rsiSeries.setData(rsiData as any);
                        indicatorSeriesRef.current.set('rsi', rsiSeries);

                        // Add over bought line
                        if (showZones) {
                            const overBoughtLine = chartRef.current!.addSeries(LineSeries);
                            overBoughtLine.applyOptions({
                                color: overBoughtColor,
                                lineWidth: 1,
                                lineStyle: 2, // Dashed
                                title: `OB(${overBought})`,
                                priceScaleId: 'rsi',
                            });
                            overBoughtLine.setData(rsiData.map(d => ({ time: d.time, value: overBought })) as any);
                            indicatorSeriesRef.current.set('rsi_overbought', overBoughtLine);

                            // Add over sold line
                            const overSoldLine = chartRef.current!.addSeries(LineSeries);
                            overSoldLine.applyOptions({
                                color: overSoldColor,
                                lineWidth: 1,
                                lineStyle: 2, // Dashed
                                title: `OS(${overSold})`,
                                priceScaleId: 'rsi',
                            });
                            overSoldLine.setData(rsiData.map(d => ({ time: d.time, value: overSold })) as any);
                            indicatorSeriesRef.current.set('rsi_oversold', overSoldLine);
                        }

                        // Configure RSI price scale to show in bottom pane
                        const isBottomPane = bottomPaneIndicators.includes('rsi');
                        if (isBottomPane) {
                            const margins = getScaleMargins('rsi');
                            chartRef.current!.priceScale('rsi').applyOptions({
                                scaleMargins: margins,
                            });
                        }
                        break;
                    }
                    case 'bollinger_bands': {
                        const bbData = calculateBollingerBands(data, 20, 2);

                        // Upper band
                        const upperSeries = chartRef.current!.addSeries(LineSeries);
                        upperSeries.applyOptions({
                            color: '#089981',
                            lineWidth: 1,
                            title: 'BB U',
                        });
                        upperSeries.setData(bbData.map(d => ({ time: d.time, value: d.upper })) as any);

                        // Middle band
                        const middleSeries = chartRef.current!.addSeries(LineSeries);
                        middleSeries.applyOptions({
                            color: '#2962FF',
                            lineWidth: 1,
                            title: 'BB M',
                        });
                        middleSeries.setData(bbData.map(d => ({ time: d.time, value: d.middle })) as any);

                        // Lower band
                        const lowerSeries = chartRef.current!.addSeries(LineSeries);
                        lowerSeries.applyOptions({
                            color: '#F23645',
                            lineWidth: 1,
                            title: 'BB L',
                        });
                        lowerSeries.setData(bbData.map(d => ({ time: d.time, value: d.lower })) as any);

                        indicatorSeriesRef.current.set('bollinger_bands_upper', upperSeries);
                        indicatorSeriesRef.current.set('bollinger_bands_middle', middleSeries);
                        indicatorSeriesRef.current.set('bollinger_bands_lower', lowerSeries);
                        break;
                    }
                    case 'macd': {
                        const settings = indicatorSettings['macd'] || {};
                        const fastPeriod = settings.fastPeriod || 12;
                        const slowPeriod = settings.slowPeriod || 26;
                        const signalPeriod = settings.signalPeriod || 9;
                        const increasingColor = settings.increasingColor || '#22C55E';
                        const decreasingColor = settings.decreasingColor || '#EF4444';

                        const macdData = calculateMACD(data, fastPeriod, slowPeriod, signalPeriod);

                        // MACD Line
                        const macdSeries = chartRef.current!.addSeries(LineSeries);
                        macdSeries.applyOptions({
                            color: '#2962FF',
                            lineWidth: 2,
                            title: `MACD(${fastPeriod},${slowPeriod},${signalPeriod})`,
                            priceScaleId: 'macd',
                        });
                        macdSeries.setData(macdData.map(d => ({ time: d.time, value: d.MACD })) as any);

                        // Signal Line
                        const signalSeries = chartRef.current!.addSeries(LineSeries);
                        signalSeries.applyOptions({
                            color: '#FF6D00',
                            lineWidth: 2,
                            title: 'Signal',
                            priceScaleId: 'macd',
                        });
                        signalSeries.setData(macdData.map(d => ({ time: d.time, value: d.signal })) as any);

                        // Histogram - split into positive and negative bars using Candlestick series
                        // Positive bars (green)
                        const positiveData = macdData
                            .filter(d => d.histogram >= 0)
                            .map(d => ({
                                time: d.time,
                                open: 0,
                                high: d.histogram,
                                low: 0,
                                close: d.histogram,
                            }));

                        const positiveHistogram = chartRef.current!.addSeries(CandlestickSeries);
                        positiveHistogram.applyOptions({
                            priceScaleId: 'macd',
                            upColor: increasingColor,
                            downColor: increasingColor,
                            borderUpColor: increasingColor,
                            borderDownColor: increasingColor,
                            wickUpColor: increasingColor,
                            wickDownColor: increasingColor,
                            borderVisible: false,
                            wickVisible: false,
                        });
                        positiveHistogram.setData(positiveData as any);

                        // Negative bars (red)
                        const negativeData = macdData
                            .filter(d => d.histogram < 0)
                            .map(d => ({
                                time: d.time,
                                open: 0,
                                high: 0,
                                low: d.histogram,
                                close: d.histogram,
                            }));

                        const negativeHistogram = chartRef.current!.addSeries(CandlestickSeries);
                        negativeHistogram.applyOptions({
                            priceScaleId: 'macd',
                            upColor: decreasingColor,
                            downColor: decreasingColor,
                            borderUpColor: decreasingColor,
                            borderDownColor: decreasingColor,
                            wickUpColor: decreasingColor,
                            wickDownColor: decreasingColor,
                            borderVisible: false,
                            wickVisible: false,
                        });
                        negativeHistogram.setData(negativeData as any);

                        indicatorSeriesRef.current.set('macd', macdSeries);
                        indicatorSeriesRef.current.set('macd_signal', signalSeries);
                        indicatorSeriesRef.current.set('macd_histogram_positive', positiveHistogram);
                        indicatorSeriesRef.current.set('macd_histogram_negative', negativeHistogram);

                        // Configure MACD price scale to show in bottom pane
                        const isBottomPane = bottomPaneIndicators.includes('macd');
                        if (isBottomPane) {
                            const margins = getScaleMargins('macd');
                            chartRef.current!.priceScale('macd').applyOptions({
                                scaleMargins: margins,
                            });
                        }
                        break;
                    }
                    case 'stochastic_oscillator': {
                        const settings = indicatorSettings['stochastic_oscillator'] || {};
                        const period = settings.period || 14;
                        const fastColor = settings.fastColor || '#efdede';
                        const slowColor = settings.slowColor || '#EF4444';
                        const overBought = settings.overBought || 80;
                        const overSold = settings.overSold || 20;
                        const overBoughtColor = settings.overBoughtColor || '#EF4444';
                        const overSoldColor = settings.overSoldColor || '#22C55E';
                        const showZones = settings.showZones !== false;
                        const smooth = settings.smooth !== false;

                        const stochData = calculateStochastic(data, period, 3, smooth);

                        if (stochData.length === 0) break;

                        // %K line (Fast) - always shown
                        const kSeries = chartRef.current!.addSeries(LineSeries);
                        kSeries.applyOptions({
                            color: fastColor,
                            lineWidth: 2,
                            title: `Stoch(${period},3)`,
                            priceScaleId: 'stoch',
                        });
                        kSeries.setData(stochData.map(d => ({ time: d.time, value: d.k })) as any);
                        indicatorSeriesRef.current.set('stoch_k', kSeries);

                        // %D line (Slow) - always shown
                        const dSeries = chartRef.current!.addSeries(LineSeries);
                        dSeries.applyOptions({
                            color: slowColor,
                            lineWidth: 2,
                            title: smooth ? 'D' : 'D',
                            priceScaleId: 'stoch',
                        });
                        dSeries.setData(stochData.map(d => ({ time: d.time, value: d.d })) as any);
                        indicatorSeriesRef.current.set('stoch_d', dSeries);

                        // Add overbought and oversold lines if showZones is enabled
                        if (showZones && stochData.length > 0) {
                            const overBoughtLine = chartRef.current!.addSeries(LineSeries);
                            overBoughtLine.applyOptions({
                                color: overBoughtColor,
                                lineWidth: 1,
                                lineStyle: 2, // Dashed
                                priceScaleId: 'stoch',
                            });
                            overBoughtLine.setData(stochData.map(d => ({ time: d.time, value: overBought })) as any);
                            indicatorSeriesRef.current.set('stoch_overbought', overBoughtLine);

                            const overSoldLine = chartRef.current!.addSeries(LineSeries);
                            overSoldLine.applyOptions({
                                color: overSoldColor,
                                lineWidth: 1,
                                lineStyle: 2, // Dashed
                                priceScaleId: 'stoch',
                            });
                            overSoldLine.setData(stochData.map(d => ({ time: d.time, value: overSold })) as any);
                            indicatorSeriesRef.current.set('stoch_oversold', overSoldLine);
                        }

                        // Configure Stochastic price scale to show in bottom pane with fixed range 0-100
                        const isBottomPane = bottomPaneIndicators.includes('stochastic_oscillator');
                        if (isBottomPane) {
                            const margins = getScaleMargins('stochastic_oscillator');
                            chartRef.current!.priceScale('stoch').applyOptions({
                                scaleMargins: margins,
                                autoScale: false,
                                mode: 0, // Normal price scale mode
                            });
                        }
                        break;
                    }
                    case 'adx_dms': {
                        const adxData = calculateADX(data, 14);
                        const adxSeries = chartRef.current!.addSeries(LineSeries);
                        adxSeries.applyOptions({
                            color: '#9C27B0',
                            lineWidth: 2,
                            title: 'ADX(14)',
                            priceScaleId: 'adx',
                        });
                        adxSeries.setData(adxData as any);
                        indicatorSeriesRef.current.set('adx_dms', adxSeries);

                        // Configure ADX price scale to show in bottom pane
                        const isBottomPane = bottomPaneIndicators.includes('adx_dms');
                        if (isBottomPane) {
                            const margins = getScaleMargins('adx_dms');
                            chartRef.current!.priceScale('adx').applyOptions({
                                scaleMargins: margins,
                            });
                        }
                        break;
                    }
                    case 'awesome_oscillator': {
                        const settings = indicatorSettings['awesome_oscillator'] || {};
                        const increasingColor = settings.increasingColor || '#22C55E';
                        const decreasingColor = settings.decreasingColor || '#EF4444';

                        const aoData = calculateAwesomeOscillator(data, 5, 34);

                        // Histogram - color based on whether current bar is higher than previous bar
                        // Green when increasing, red when decreasing
                        const increasingData: any[] = [];
                        const decreasingData: any[] = [];

                        for (let i = 0; i < aoData.length; i++) {
                            const currentValue = aoData[i].value;
                            const previousValue = i > 0 ? aoData[i - 1].value : currentValue;

                            const barData = {
                                time: aoData[i].time,
                                open: 0,
                                high: currentValue > 0 ? currentValue : 0,
                                low: currentValue < 0 ? currentValue : 0,
                                close: currentValue,
                            };

                            // Green if current value is greater than previous, red otherwise
                            if (currentValue >= previousValue) {
                                increasingData.push(barData);
                            } else {
                                decreasingData.push(barData);
                            }
                        }

                        // Increasing bars (green)
                        const increasingHistogram = chartRef.current!.addSeries(CandlestickSeries);
                        increasingHistogram.applyOptions({
                            priceScaleId: 'ao',
                            upColor: increasingColor,
                            downColor: increasingColor,
                            borderUpColor: increasingColor,
                            borderDownColor: increasingColor,
                            wickUpColor: increasingColor,
                            wickDownColor: increasingColor,
                            borderVisible: false,
                            wickVisible: false,
                            title: 'AO',
                        });
                        increasingHistogram.setData(increasingData as any);

                        // Decreasing bars (red)
                        const decreasingHistogram = chartRef.current!.addSeries(CandlestickSeries);
                        decreasingHistogram.applyOptions({
                            priceScaleId: 'ao',
                            upColor: decreasingColor,
                            downColor: decreasingColor,
                            borderUpColor: decreasingColor,
                            borderDownColor: decreasingColor,
                            wickUpColor: decreasingColor,
                            wickDownColor: decreasingColor,
                            borderVisible: false,
                            wickVisible: false,
                        });
                        decreasingHistogram.setData(decreasingData as any);

                        indicatorSeriesRef.current.set('ao_histogram_increasing', increasingHistogram);
                        indicatorSeriesRef.current.set('ao_histogram_decreasing', decreasingHistogram);

                        // Configure AO price scale to show in bottom pane
                        const isBottomPane = bottomPaneIndicators.includes('awesome_oscillator');
                        if (isBottomPane) {
                            const margins = getScaleMargins('awesome_oscillator');
                            chartRef.current!.priceScale('ao').applyOptions({
                                scaleMargins: margins,
                            });
                        }
                        break;
                    }
                    case 'detrended_price': {
                        const settings = indicatorSettings['detrended_price'] || {};
                        const period = settings.period || 14;
                        const field = settings.field || 'close';
                        const color = settings.color || '#efdede';

                        const dpoData = calculateDPO(data, period, field);

                        const dpoSeries = chartRef.current!.addSeries(LineSeries);
                        dpoSeries.applyOptions({
                            color: color,
                            lineWidth: 2,
                            title: `DPO(${period})`,
                            priceScaleId: 'dpo',
                        });
                        dpoSeries.setData(dpoData as any);
                        indicatorSeriesRef.current.set('detrended_price', dpoSeries);

                        // Configure DPO price scale to show in bottom pane
                        const isBottomPane = bottomPaneIndicators.includes('detrended_price');
                        if (isBottomPane) {
                            const margins = getScaleMargins('detrended_price');
                            chartRef.current!.priceScale('dpo').applyOptions({
                                scaleMargins: margins,
                            });
                        }
                        break;
                    }
                    case 'price_rate_change': {
                        const settings = indicatorSettings['price_rate_change'] || {};
                        const period = settings.period || 14;
                        const field = settings.field || 'close';
                        const color = settings.color || '#efdede';

                        const rocData = calculateROC(data, period, field);

                        const rocSeries = chartRef.current!.addSeries(LineSeries);
                        rocSeries.applyOptions({
                            color: color,
                            lineWidth: 2,
                            title: `ROC(${period})`,
                            priceScaleId: 'roc',
                        });
                        rocSeries.setData(rocData as any);
                        indicatorSeriesRef.current.set('price_rate_change', rocSeries);

                        // Configure ROC price scale to show in bottom pane
                        const isBottomPane = bottomPaneIndicators.includes('price_rate_change');
                        if (isBottomPane) {
                            const margins = getScaleMargins('price_rate_change');
                            chartRef.current!.priceScale('roc').applyOptions({
                                scaleMargins: margins,
                            });
                        }
                        break;
                    }
                    case 'parabolic_sar': {
                        const psarData = calculatePSAR(data, 0.02, 0.2);
                        const psarSeries = chartRef.current!.addSeries(LineSeries);
                        psarSeries.applyOptions({
                            color: '#00BCD4',
                            lineWidth: 1,
                            lineStyle: 2, // Dotted
                            title: 'PSAR',
                        });
                        psarSeries.setData(psarData as any);
                        indicatorSeriesRef.current.set('parabolic_sar', psarSeries);
                        break;
                    }
                }
            } catch (error) {
                console.error(`Error calculating indicator ${indicatorId}:`, error);
            }
        });
    }, [activeIndicators, data, indicatorSettings]);

    return <div ref={chartContainerRef} className="w-full h-full [&_#tv-attr-logo]:hidden" />;
}
