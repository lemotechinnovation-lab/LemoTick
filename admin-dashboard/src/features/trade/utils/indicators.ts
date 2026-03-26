import {
    ADX,
    ATR,
    BollingerBands,
    EMA,
    IchimokuCloud,
    MACD,
    PSAR,
    RSI,
    SMA
} from 'technicalindicators';

interface CandleData {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
}

interface IndicatorResult {
    time: number;
    value: number;
}

interface BollingerBandsResult {
    time: number;
    upper: number;
    middle: number;
    lower: number;
}

interface MACDResult {
    time: number;
    MACD: number;
    signal: number;
    histogram: number;
}

// Simple Moving Average
export function calculateSMA(data: CandleData[], period: number = 20): IndicatorResult[] {
    const closes = data.map(d => d.close);
    const smaValues = SMA.calculate({ period, values: closes });

    return smaValues.map((value, index) => ({
        time: data[index + period - 1].time,
        value
    }));
}

// Exponential Moving Average
export function calculateEMA(data: CandleData[], period: number = 20): IndicatorResult[] {
    const closes = data.map(d => d.close);
    const emaValues = EMA.calculate({ period, values: closes });

    return emaValues.map((value, index) => ({
        time: data[index + period - 1].time,
        value
    }));
}

// Relative Strength Index
export function calculateRSI(data: CandleData[], period: number = 14): IndicatorResult[] {
    const closes = data.map(d => d.close);
    const rsiValues = RSI.calculate({ period, values: closes });

    return rsiValues.map((value, index) => ({
        time: data[index + period].time,
        value
    }));
}

// MACD
export function calculateMACD(
    data: CandleData[],
    fastPeriod: number = 12,
    slowPeriod: number = 26,
    signalPeriod: number = 9
): MACDResult[] {
    if (data.length < slowPeriod + signalPeriod) {
        return []; // Not enough data
    }

    const closes = data.map(d => d.close);
    const macdValues = MACD.calculate({
        values: closes,
        fastPeriod,
        slowPeriod,
        signalPeriod,
        SimpleMAOscillator: false,
        SimpleMASignal: false
    });

    // MACD library returns values starting from a certain index
    // We need to align them with the original data timestamps
    const results: MACDResult[] = [];

    for (let i = 0; i < macdValues.length; i++) {
        const dataIndex = data.length - macdValues.length + i;
        if (dataIndex >= 0 && dataIndex < data.length) {
            results.push({
                time: data[dataIndex].time,
                MACD: macdValues[i].MACD || 0,
                signal: macdValues[i].signal || 0,
                histogram: macdValues[i].histogram || 0,
            });
        }
    }

    return results.filter(v => v.MACD !== 0 || v.signal !== 0);
}

// Bollinger Bands
export function calculateBollingerBands(
    data: CandleData[],
    period: number = 20,
    stdDev: number = 2
): BollingerBandsResult[] {
    const closes = data.map(d => d.close);
    const bbValues = BollingerBands.calculate({
        period,
        values: closes,
        stdDev
    });

    return bbValues.map((value, index) => ({
        time: data[index + period - 1].time,
        upper: value.upper,
        middle: value.middle,
        lower: value.lower
    }));
}

// Stochastic Oscillator
export function calculateStochastic(
    data: CandleData[],
    period: number = 14,
    signalPeriod: number = 3,
    smooth: boolean = true
): { time: number; k: number; d: number }[] {
    if (data.length < period + signalPeriod) {
        return [];
    }

    const results: { time: number; k: number; d: number }[] = [];

    // Step 1: Calculate raw %K for all data points
    const rawKValues: { time: number; value: number }[] = [];
    for (let i = period - 1; i < data.length; i++) {
        // Find highest high and lowest low over the period ending at current index
        let highestHigh = data[i - period + 1].high;
        let lowestLow = data[i - period + 1].low;

        for (let j = 0; j < period; j++) {
            const idx = i - period + 1 + j;
            if (data[idx].high > highestHigh) highestHigh = data[idx].high;
            if (data[idx].low < lowestLow) lowestLow = data[idx].low;
        }

        // Calculate raw %K = ((Close - Lowest Low) / (Highest High - Lowest Low)) * 100
        const currentClose = data[i].close;
        const range = highestHigh - lowestLow;
        const rawK = range !== 0 ? ((currentClose - lowestLow) / range) * 100 : 50;

        rawKValues.push({
            time: data[i].time,
            value: rawK
        });
    }

    // Step 2: Calculate %D based on smooth parameter
    // When smooth=true: %D is SMA of raw %K, and we show both raw %K and %D
    // When smooth=false: %D is still SMA of raw %K, but we only show raw %K

    if (smooth) {
        // Calculate %D = SMA of raw %K over signalPeriod
        for (let i = signalPeriod - 1; i < rawKValues.length; i++) {
            let sum = 0;
            for (let j = 0; j < signalPeriod; j++) {
                sum += rawKValues[i - j].value;
            }
            const d = sum / signalPeriod;

            results.push({
                time: rawKValues[i].time,
                k: rawKValues[i].value,  // Fast %K is raw %K
                d: d  // Slow %D is SMA of raw %K
            });
        }
    } else {
        // No smoothing - still calculate %D but it won't be used in display
        for (let i = signalPeriod - 1; i < rawKValues.length; i++) {
            let sum = 0;
            for (let j = 0; j < signalPeriod; j++) {
                sum += rawKValues[i - j].value;
            }
            const d = sum / signalPeriod;

            results.push({
                time: rawKValues[i].time,
                k: rawKValues[i].value,  // Fast %K is raw %K
                d: d
            });
        }
    }

    return results;
}

// Average True Range
export function calculateATR(data: CandleData[], period: number = 14): IndicatorResult[] {
    const highs = data.map(d => d.high);
    const lows = data.map(d => d.low);
    const closes = data.map(d => d.close);

    const atrValues = ATR.calculate({
        high: highs,
        low: lows,
        close: closes,
        period
    });

    return atrValues.map((value, index) => ({
        time: data[index + period].time,
        value
    }));
}

// Average Directional Index
export function calculateADX(data: CandleData[], period: number = 14): IndicatorResult[] {
    const highs = data.map(d => d.high);
    const lows = data.map(d => d.low);
    const closes = data.map(d => d.close);

    const adxValues = ADX.calculate({
        high: highs,
        low: lows,
        close: closes,
        period
    });

    return adxValues.map((value, index) => ({
        time: data[index + period * 2 - 1].time,
        value: value.adx
    }));
}

// Parabolic SAR
export function calculatePSAR(
    data: CandleData[],
    step: number = 0.02,
    max: number = 0.2
): IndicatorResult[] {
    const highs = data.map(d => d.high);
    const lows = data.map(d => d.low);

    const psarValues = PSAR.calculate({
        high: highs,
        low: lows,
        step,
        max
    });

    return psarValues.map((value, index) => ({
        time: data[index].time,
        value
    }));
}

// Ichimoku Cloud
export function calculateIchimoku(
    data: CandleData[],
    conversionPeriod: number = 9,
    basePeriod: number = 26,
    spanPeriod: number = 52,
    displacement: number = 26
) {
    const highs = data.map(d => d.high);
    const lows = data.map(d => d.low);

    const ichimokuValues = IchimokuCloud.calculate({
        high: highs,
        low: lows,
        conversionPeriod,
        basePeriod,
        spanPeriod,
        displacement
    });

    return ichimokuValues.map((value, index) => ({
        time: data[index + basePeriod - 1].time,
        conversion: value.conversion,
        base: value.base,
        spanA: value.spanA,
        spanB: value.spanB
    }));
}

// Weighted Moving Average
export function calculateWMA(data: CandleData[], period: number = 20): IndicatorResult[] {
    const closes = data.map(d => d.close);
    const wmaValues: number[] = [];

    for (let i = period - 1; i < closes.length; i++) {
        let sum = 0;
        let weightSum = 0;
        for (let j = 0; j < period; j++) {
            const weight = period - j;
            sum += closes[i - j] * weight;
            weightSum += weight;
        }
        wmaValues.push(sum / weightSum);
    }

    return wmaValues.map((value, index) => ({
        time: data[index + period - 1].time,
        value
    }));
}

// Hull Moving Average
export function calculateHMA(data: CandleData[], period: number = 20): IndicatorResult[] {
    const halfPeriod = Math.floor(period / 2);
    const sqrtPeriod = Math.floor(Math.sqrt(period));

    const wma1 = calculateWMA(data, halfPeriod);
    const wma2 = calculateWMA(data, period);

    // Calculate 2*WMA(n/2) - WMA(n)
    const rawHMA: number[] = [];
    const minLength = Math.min(wma1.length, wma2.length);

    for (let i = 0; i < minLength; i++) {
        rawHMA.push(2 * wma1[i].value - wma2[i].value);
    }

    // Apply WMA to the result
    const hmaValues: number[] = [];
    for (let i = sqrtPeriod - 1; i < rawHMA.length; i++) {
        let sum = 0;
        let weightSum = 0;
        for (let j = 0; j < sqrtPeriod; j++) {
            const weight = sqrtPeriod - j;
            sum += rawHMA[i - j] * weight;
            weightSum += weight;
        }
        hmaValues.push(sum / weightSum);
    }

    return hmaValues.map((value, index) => ({
        time: data[index + period + sqrtPeriod - 2].time,
        value
    }));
}

// Zero Lag Exponential Moving Average
export function calculateZLEMA(data: CandleData[], period: number = 20): IndicatorResult[] {
    const closes = data.map(d => d.close);
    const lag = Math.floor((period - 1) / 2);
    const zlemaValues: number[] = [];

    const multiplier = 2 / (period + 1);

    // Calculate ZLEMA
    for (let i = lag; i < closes.length; i++) {
        const zlData = 2 * closes[i] - closes[i - lag];

        if (zlemaValues.length === 0) {
            zlemaValues.push(zlData);
        } else {
            const zlema = (zlData - zlemaValues[zlemaValues.length - 1]) * multiplier + zlemaValues[zlemaValues.length - 1];
            zlemaValues.push(zlema);
        }
    }

    return zlemaValues.map((value, index) => ({
        time: data[index + lag].time,
        value
    }));
}

// Time Series Moving Average (Linear Regression)
export function calculateTSMA(data: CandleData[], period: number = 20): IndicatorResult[] {
    const closes = data.map(d => d.close);
    const tsmaValues: number[] = [];

    for (let i = period - 1; i < closes.length; i++) {
        let sumX = 0;
        let sumY = 0;
        let sumXY = 0;
        let sumX2 = 0;

        for (let j = 0; j < period; j++) {
            const x = j;
            const y = closes[i - period + 1 + j];
            sumX += x;
            sumY += y;
            sumXY += x * y;
            sumX2 += x * x;
        }

        const slope = (period * sumXY - sumX * sumY) / (period * sumX2 - sumX * sumX);
        const intercept = (sumY - slope * sumX) / period;
        const forecast = slope * (period - 1) + intercept;

        tsmaValues.push(forecast);
    }

    return tsmaValues.map((value, index) => ({
        time: data[index + period - 1].time,
        value
    }));
}

// Awesome Oscillator
export function calculateAwesomeOscillator(
    data: CandleData[],
    fastPeriod: number = 5,
    slowPeriod: number = 34
): IndicatorResult[] {
    if (data.length < slowPeriod) {
        return [];
    }

    // Calculate median price (high + low) / 2
    const medianPrices = data.map(d => (d.high + d.low) / 2);

    const aoValues: IndicatorResult[] = [];

    // Start from slowPeriod - 1 to have enough data for both SMAs
    for (let i = slowPeriod - 1; i < medianPrices.length; i++) {
        // Calculate fast SMA (5-period) at current position
        let fastSum = 0;
        for (let j = 0; j < fastPeriod; j++) {
            fastSum += medianPrices[i - j];
        }
        const fastSMA = fastSum / fastPeriod;

        // Calculate slow SMA (34-period) at current position
        let slowSum = 0;
        for (let j = 0; j < slowPeriod; j++) {
            slowSum += medianPrices[i - j];
        }
        const slowSMA = slowSum / slowPeriod;

        // AO = Fast SMA - Slow SMA
        aoValues.push({
            time: data[i].time,
            value: fastSMA - slowSMA
        });
    }

    return aoValues;
}

// Detrended Price Oscillator
export function calculateDPO(
    data: CandleData[],
    period: number = 14,
    field: 'close' | 'open' | 'high' | 'low' = 'close'
): IndicatorResult[] {
    if (data.length < period) {
        return [];
    }

    const prices = data.map(d => d[field]);
    const dpoValues: IndicatorResult[] = [];
    const displacement = Math.floor(period / 2) + 1;

    // Start calculating from period + displacement onwards to have enough data
    for (let i = period + displacement - 1; i < prices.length; i++) {
        // Calculate SMA at the displaced position (in the past)
        const smaIndex = i - displacement;
        let sum = 0;
        for (let j = 0; j < period; j++) {
            sum += prices[smaIndex - j];
        }
        const sma = sum / period;

        // DPO = Current Price - SMA from displaced position
        const dpo = prices[i] - sma;
        dpoValues.push({
            time: data[i].time,
            value: dpo
        });
    }

    return dpoValues;
}

// Price Rate of Change (ROC)
export function calculateROC(
    data: CandleData[],
    period: number = 14,
    field: 'close' | 'open' | 'high' | 'low' = 'close'
): IndicatorResult[] {
    if (data.length <= period) {
        return [];
    }

    const prices = data.map(d => d[field]);
    const rocValues: IndicatorResult[] = [];

    // Start from period onwards
    for (let i = period; i < prices.length; i++) {
        const currentPrice = prices[i];
        const pastPrice = prices[i - period];

        // ROC = ((Current Price - Past Price) / Past Price) * 100
        if (pastPrice !== 0) {
            const roc = ((currentPrice - pastPrice) / pastPrice) * 100;
            rocValues.push({
                time: data[i].time,
                value: roc
            });
        }
    }

    return rocValues;
}
