from typing import List, Dict
import math

class Candle:
    def __init__(self, time, open, high, low, close):
        self.time = time
        self.open = open
        self.high = high
        self.low = low
        self.close = close


# -----------------------------
# SMA
# -----------------------------
def calculate_sma(data: List[Candle], period: int = 20):

    closes = [c.close for c in data]
    values = []

    for i in range(period - 1, len(closes)):
        sma = sum(closes[i - period + 1:i + 1]) / period
        values.append({
            "time": data[i].time,
            "value": sma
        })

    return values


# -----------------------------
# EMA
# -----------------------------
def calculate_ema(data: List[Candle], period: int = 20):

    closes = [c.close for c in data]
    multiplier = 2 / (period + 1)

    ema_values = []
    sma = sum(closes[:period]) / period
    ema = sma

    for i in range(period, len(closes)):
        ema = (closes[i] - ema) * multiplier + ema
        ema_values.append({
            "time": data[i].time,
            "value": ema
        })

    return ema_values


# -----------------------------
# RSI
# -----------------------------
def calculate_rsi(data: List[Candle], period: int = 14):

    closes = [c.close for c in data]

    gains = []
    losses = []

    for i in range(1, len(closes)):
        diff = closes[i] - closes[i - 1]
        gains.append(max(diff, 0))
        losses.append(abs(min(diff, 0)))

    avg_gain = sum(gains[:period]) / period
    avg_loss = sum(losses[:period]) / period

    rsi_values = []

    for i in range(period, len(gains)):
        avg_gain = (avg_gain * (period - 1) + gains[i]) / period
        avg_loss = (avg_loss * (period - 1) + losses[i]) / period

        if avg_loss == 0:
            rsi = 100
        else:
            rs = avg_gain / avg_loss
            rsi = 100 - (100 / (1 + rs))

        rsi_values.append({
            "time": data[i + 1].time,
            "value": rsi
        })

    return rsi_values


# -----------------------------
# WMA
# -----------------------------
def calculate_wma(data: List[Candle], period: int = 20):

    closes = [c.close for c in data]
    results = []

    for i in range(period - 1, len(closes)):
        weighted_sum = 0
        weight_sum = 0

        for j in range(period):
            weight = period - j
            weighted_sum += closes[i - j] * weight
            weight_sum += weight

        results.append({
            "time": data[i].time,
            "value": weighted_sum / weight_sum
        })

    return results


# -----------------------------
# HMA
# -----------------------------
def calculate_hma(data: List[Candle], period: int = 20):

    half = period // 2
    sqrt_p = int(math.sqrt(period))

    wma_half = calculate_wma(data, half)
    wma_full = calculate_wma(data, period)

    raw = []
    min_len = min(len(wma_half), len(wma_full))

    for i in range(min_len):
        raw.append(2 * wma_half[i]["value"] - wma_full[i]["value"])

    hma = []

    for i in range(sqrt_p - 1, len(raw)):

        weighted_sum = 0
        weight_sum = 0

        for j in range(sqrt_p):
            weight = sqrt_p - j
            weighted_sum += raw[i - j] * weight
            weight_sum += weight

        hma.append({
            "time": data[i + period].time,
            "value": weighted_sum / weight_sum
        })

    return hma


# -----------------------------
# Bollinger Bands
# -----------------------------
def calculate_bollinger_bands(data: List[Candle], period: int = 20, std_dev: int = 2):

    closes = [c.close for c in data]
    results = []

    for i in range(period - 1, len(closes)):

        window = closes[i - period + 1:i + 1]
        mean = sum(window) / period

        variance = sum((x - mean) ** 2 for x in window) / period
        std = math.sqrt(variance)

        results.append({
            "time": data[i].time,
            "upper": mean + std_dev * std,
            "middle": mean,
            "lower": mean - std_dev * std
        })

    return results


# -----------------------------
# MACD
# -----------------------------
def calculate_macd(data: List[Candle], fast=12, slow=26, signal=9):

    closes = [c.close for c in data]

    def ema(values, period):
        multiplier = 2 / (period + 1)
        ema_values = []

        sma = sum(values[:period]) / period
        prev = sma

        for i in range(period, len(values)):
            prev = (values[i] - prev) * multiplier + prev
            ema_values.append(prev)

        return ema_values

    fast_ema = ema(closes, fast)
    slow_ema = ema(closes, slow)

    length = min(len(fast_ema), len(slow_ema))

    macd_line = [
        fast_ema[-length + i] - slow_ema[-length + i]
        for i in range(length)
    ]

    signal_line = ema(macd_line, signal)

    results = []

    for i in range(len(signal_line)):
        macd = macd_line[i + len(macd_line) - len(signal_line)]
        signal_val = signal_line[i]

        results.append({
            "time": data[len(data) - len(signal_line) + i].time,
            "MACD": macd,
            "signal": signal_val,
            "histogram": macd - signal_val
        })

    return results


# -----------------------------
# ATR
# -----------------------------
def calculate_atr(data: List[Candle], period: int = 14):

    trs = []

    for i in range(1, len(data)):

        high = data[i].high
        low = data[i].low
        prev_close = data[i - 1].close

        tr = max(
            high - low,
            abs(high - prev_close),
            abs(low - prev_close)
        )

        trs.append(tr)

    atr = sum(trs[:period]) / period
    results = []

    for i in range(period, len(trs)):
        atr = ((atr * (period - 1)) + trs[i]) / period

        results.append({
            "time": data[i + 1].time,
            "value": atr
        })

    return results


# -----------------------------
# ROC
# -----------------------------
def calculate_roc(data: List[Candle], period: int = 14):

    results = []

    for i in range(period, len(data)):

        current = data[i].close
        past = data[i - period].close

        roc = ((current - past) / past) * 100 if past != 0 else 0

        results.append({
            "time": data[i].time,
            "value": roc
        })

    return results


# -----------------------------
# Awesome Oscillator
# -----------------------------
def calculate_awesome_oscillator(data: List[Candle], fast=5, slow=34):

    medians = [(c.high + c.low) / 2 for c in data]
    results = []

    for i in range(slow - 1, len(medians)):

        fast_sma = sum(medians[i - j] for j in range(fast)) / fast
        slow_sma = sum(medians[i - j] for j in range(slow)) / slow

        results.append({
            "time": data[i].time,
            "value": fast_sma - slow_sma
        })

    return results