"""
LemoTick: Momentum Breakout (1-min) backtest prototype
Run: python lemo_tick_backtest.py
Requires: pandas, numpy
"""

import os
from datetime import timedelta
import numpy as np
import pandas as pd


# --- PARAMETERS (tweak these) ---
EMA_FAST = 5
EMA_SLOW = 20
RSI_PERIOD = 14
VOL_WINDOW = 30  # ticks for volatility calc
VOL_THRESHOLD = 0.01  # relative stddev threshold (1%)
STAKE = 10.0  # USD per trade (fixed)
PAYOUT_RATE = 0.90  # more conservative payout assumption
COOLDOWN_SECONDS = 45  # wait after placing a trade
MAX_CONSECUTIVE = 2
EXPIRY_SECONDS = 60  # 1 minute expiry
# -------------------------------


def rsi(series: pd.Series, period: int = 14) -> pd.Series:
    delta = series.diff()
    up = delta.clip(lower=0)
    down = -1 * delta.clip(upper=0)
    ma_up = up.rolling(period, min_periods=period).mean()
    ma_down = down.rolling(period, min_periods=period).mean()
    rs = ma_up / (ma_down + 1e-12)
    return 100 - (100 / (1 + rs))


def prepare_data(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df["ema_fast"] = df["price"].ewm(span=EMA_FAST, adjust=False).mean()
    df["ema_slow"] = df["price"].ewm(span=EMA_SLOW, adjust=False).mean()
    df["rsi"] = rsi(df["price"], RSI_PERIOD)
    vol_mean = df["price"].rolling(VOL_WINDOW).mean()
    df["vol"] = df["price"].rolling(VOL_WINDOW).std() / (vol_mean + 1e-12)
    df.dropna(inplace=True)
    return df


def generate_synthetic_ticks(n: int = 2000, seed: int = 42) -> pd.DataFrame:
    # simple mean-reverting + drift series for demo purposes
    np.random.seed(seed)
    t = np.arange(n)
    price = 860 + 0.02 * t + np.cumsum(np.random.normal(scale=1.0, size=n))
    # Generate timezone-aware UTC timestamps at 1-second frequency
    start = pd.Timestamp.now(tz="UTC").floor("s")
    times = pd.date_range(start=start, periods=n, freq="s")
    return pd.DataFrame({"timestamp": times, "price": price})


def load_ticks(csv_path: str = "ticks.csv") -> pd.DataFrame:
    if os.path.exists(csv_path):
        df = pd.read_csv(csv_path, parse_dates=["timestamp"])  # expects timestamp,price
        df = df[["timestamp", "price"]].sort_values("timestamp").reset_index(drop=True)
        # Ensure timezone-aware UTC timestamps
        if df["timestamp"].dt.tz is None:
            df["timestamp"] = df["timestamp"].dt.tz_localize("UTC")
        else:
            df["timestamp"] = df["timestamp"].dt.tz_convert("UTC")
        return df
    else:
        print("ticks.csv not found — generating synthetic tick data for demo.")
        return generate_synthetic_ticks(n=5000)


def backtest(df: pd.DataFrame) -> list[dict]:
    trades: list[dict] = []
    # Use UTC-aware baseline to avoid tz-naive/aware subtraction errors
    last_trade_time = pd.Timestamp(0, tz="UTC")
    consecutive = 0
    equity = 1000.0
    df = prepare_data(df)

    # iterate ticks
    for idx, row in df.iterrows():
        now = row["timestamp"]
        if (now - last_trade_time).total_seconds() < COOLDOWN_SECONDS:
            continue  # still cooling down

        # volatility filter
        if row["vol"] < VOL_THRESHOLD:
            consecutive = 0  # reset consecutive if market calm
            continue

        # crossover detection (we check previous tick to detect a cross)
        if idx == 0:
            continue
        prev = df.iloc[idx - 1]
        cross_up = prev["ema_fast"] <= prev["ema_slow"] and row["ema_fast"] > row["ema_slow"]
        cross_down = prev["ema_fast"] >= prev["ema_slow"] and row["ema_fast"] < row["ema_slow"]

        # EMA cross entries for 1-minute candles (no RSI filter)
        entry_dir: str | None = None
        if cross_up:  # Bullish EMA cross
            entry_dir = "rise"
        elif cross_down:  # Bearish EMA cross
            entry_dir = "fall"

        if entry_dir is None:
            continue

        # throttle consecutive trades
        if consecutive >= MAX_CONSECUTIVE:
            # enforce extended cooldown
            last_trade_time = now + pd.Timedelta(seconds=COOLDOWN_SECONDS * 2)
            consecutive = 0
            continue

        # determine expiry time and find exit price (closest timestamp >= expiry)
        expiry_time = now + pd.Timedelta(seconds=EXPIRY_SECONDS)
        # find exit row
        exit_rows = df[df["timestamp"] >= expiry_time]
        if exit_rows.empty:
            break  # no more data to evaluate expiry
        exit_price = exit_rows.iloc[0]["price"]
        entry_price = row["price"]

        # Evaluate result
        if entry_dir == "rise":
            win = exit_price > entry_price
        else:
            win = exit_price < entry_price

        payout = STAKE * PAYOUT_RATE if win else -STAKE
        equity += payout
        trades.append(
            {
                "entry_time": now,
                "entry_price": entry_price,
                "expiry_time": expiry_time,
                "exit_price": exit_price,
                "dir": entry_dir,
                "win": win,
                "payout": payout,
                "equity": equity,
            }
        )
        # update state
        last_trade_time = now
        consecutive += 1 if win else 0  # count consecutive wins (or count trades)
    return trades


def summarize(trades: list[dict], start_equity: float = 1000.0) -> pd.DataFrame | None:
    if not trades:
        print("No trades executed.")
        return None
    df = pd.DataFrame(trades)
    wins = int(df["win"].sum())
    total = len(df)
    win_rate = wins / total * 100
    net = float(df["payout"].sum())
    final_equity = start_equity + net
    avg_trade = float(df["payout"].mean())
    print(f"Trades: {total}, Wins: {wins}, Win rate: {win_rate:.1f}%")
    print(f"Net P/L: {net:.2f} | Final equity: {final_equity:.2f} | Avg trade: {avg_trade:.2f}")
    # show some trades
    print(df.head(10).to_string(index=False))
    return df


if __name__ == "__main__":
    ticks = load_ticks("ticks.csv")  # put your 1s tick CSV here (timestamp,price)
    trades = backtest(ticks)
    df_trades = summarize(trades)
    # optionally save
    if df_trades is not None:
        df_trades.to_csv("lemo_trades_log.csv", index=False)
        print("Saved trades to lemo_trades_log.csv")


