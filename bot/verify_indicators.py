"""
Indicator Verification Script
Compares bot's indicator calculations with Deriv's official candles
"""

import asyncio
import json
import os
import sys
from datetime import datetime
from pathlib import Path

import websocket
from dotenv import load_dotenv

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from strategies.ema_rsi_strategy import EMA, RSI, Candle


class IndicatorVerifier:
    """Verifies indicator calculations match Deriv's data"""

    def __init__(self, app_id: int = 1089):
        self.app_id = app_id
        self.ws = None

    def connect(self):
        """Connect to Deriv API"""
        ws_url = f"wss://ws.derivws.com/websockets/v3?app_id={self.app_id}"
        print(f"Connecting to Deriv API...")
        self.ws = websocket.create_connection(ws_url, timeout=10)
        print("✅ Connected\n")

    def fetch_candles(self, symbol: str, granularity: int, count: int):
        """Fetch official OHLC candles from Deriv"""
        print(f"Fetching {count} candles for {symbol} ({granularity}s timeframe)...")

        request = {
            "ticks_history": symbol,
            "adjust_start_time": 1,
            "count": count,
            "end": "latest",
            "granularity": granularity,
            "style": "candles",
        }

        self.ws.send(json.dumps(request))
        response = json.loads(self.ws.recv())

        if "error" in response:
            print(f"❌ Error: {response['error']['message']}")
            return []

        candles_data = response.get("candles", [])
        print(f"✅ Fetched {len(candles_data)} official OHLC candles\n")

        return candles_data

    def calculate_indicators(self, candles_data, show_all=False):
        """Calculate indicators from candles"""
        print("=" * 80)
        print("CALCULATING INDICATORS FROM DERIV'S OFFICIAL CANDLES")
        print("=" * 80)

        # Initialize indicators
        ema5 = EMA(period=5)
        ema10 = EMA(period=10)
        rsi5 = RSI(period=5)

        results = []

        for i, candle_data in enumerate(candles_data, 1):
            close = float(candle_data.get("close", 0))
            timestamp = candle_data.get("epoch", 0)
            time_str = datetime.fromtimestamp(timestamp).strftime("%Y-%m-%d %H:%M:%S")

            # Update indicators
            ema5_val = ema5.update(close)
            ema10_val = ema10.update(close)
            rsi_val = rsi5.update(close)

            result = {
                "index": i,
                "time": time_str,
                "close": close,
                "ema5": ema5_val if ema5_val else 0,
                "ema10": ema10_val if ema10_val else 0,
                "rsi": rsi_val if rsi_val else 0,
            }
            results.append(result)

            # Show progress for first few and last few candles
            if show_all or i <= 5 or i > len(candles_data) - 5:
                rsi_str = f"{rsi_val:.1f}" if rsi_val else "N/A"
                print(
                    f"Candle #{i:2d} | {time_str} | "
                    f"Close: {close:8.2f} | "
                    f"EMA5: {ema5_val:8.5f} | EMA10: {ema10_val:8.5f} | RSI: {rsi_str:>5}"
                )
            elif i == 6:
                print("   ... (middle candles omitted) ...")

        return results

    def display_final_values(self, results):
        """Display final indicator values"""
        if not results:
            print("No results to display")
            return

        last = results[-1]

        print("\n" + "=" * 80)
        print("FINAL INDICATOR VALUES (LATEST CANDLE)")
        print("=" * 80)
        print(f"Time:         {last['time']}")
        print(f"Close Price:  {last['close']:.5f}")
        print(f"EMA5:         {last['ema5']:.5f}")
        print(f"EMA10:        {last['ema10']:.5f}")
        print(f"RSI5:         {last['rsi']:.1f}")
        print("=" * 80)

        # Show EMA relationship
        if last["ema5"] > last["ema10"]:
            print(
                f"📈 EMA5 > EMA10 (Bullish) | Difference: {last['ema5'] - last['ema10']:.5f}"
            )
        elif last["ema5"] < last["ema10"]:
            print(
                f"📉 EMA5 < EMA10 (Bearish) | Difference: {last['ema10'] - last['ema5']:.5f}"
            )
        else:
            print("➡️  EMA5 = EMA10 (Neutral)")

        # Show RSI zones
        rsi = last["rsi"]
        if rsi > 70:
            print(f"⚠️  RSI: {rsi:.1f} (OVERBOUGHT)")
        elif rsi > 55:
            print(f"📈 RSI: {rsi:.1f} (Bullish)")
        elif rsi >= 45:
            print(f"➡️  RSI: {rsi:.1f} (Neutral)")
        elif rsi > 30:
            print(f"📉 RSI: {rsi:.1f} (Bearish)")
        else:
            print(f"⚠️  RSI: {rsi:.1f} (OVERSOLD)")

        print("=" * 80)

    def verify_against_deriv_chart(self, last_result):
        """Show instructions to verify against Deriv chart"""
        print("\n" + "=" * 80)
        print("VERIFICATION STEPS")
        print("=" * 80)
        print("1. Open Deriv Trader (deriv.com)")
        print("2. Select Volatility 25 Index (1s)")
        print("3. Set timeframe to 5 minutes")
        print("4. Add indicators:")
        print("   - EMA with period 5")
        print("   - EMA with period 10")
        print("   - RSI with period 5")
        print("5. Compare the indicator values:")
        print(f"   ✅ EMA5 should show: ~{last_result['ema5']:.2f}")
        print(f"   ✅ EMA10 should show: ~{last_result['ema10']:.2f}")
        print(f"   ✅ RSI should show: ~{last_result['rsi']:.1f}")
        print("\n   (Values may differ slightly due to rounding)")
        print("=" * 80)

    def disconnect(self):
        """Disconnect from Deriv"""
        if self.ws:
            self.ws.close()
            print("\n✅ Disconnected from Deriv API")


def main():
    """Main verification function"""
    print("\n" + "=" * 80)
    print("LEMOTICK INDICATOR VERIFICATION TOOL")
    print("=" * 80)
    print(
        "This tool verifies that indicator calculations match Deriv's official data\n"
    )

    # Configuration
    symbol = "R_25"  # Volatility 25 Index
    granularity = 300  # 5 minutes
    count = 30  # Fetch 30 candles

    try:
        verifier = IndicatorVerifier()
        verifier.connect()

        # Fetch official candles
        candles_data = verifier.fetch_candles(symbol, granularity, count)

        if not candles_data:
            print("❌ No candles received")
            return

        # Calculate indicators
        results = verifier.calculate_indicators(candles_data, show_all=False)

        # Display results
        verifier.display_final_values(results)

        # Show verification steps
        verifier.verify_against_deriv_chart(results[-1])

        # Show comparison with bot
        print("\n" + "=" * 80)
        print("COMPARE WITH YOUR BOT")
        print("=" * 80)
        print("When your bot starts, check the 'INDICATORS BOOTSTRAPPED' section.")
        print("The values should match the ones shown above.")
        print("=" * 80)

        verifier.disconnect()

        print("\n✅ Verification complete!")

    except KeyboardInterrupt:
        print("\n\n⚠️  Interrupted by user")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback

        traceback.print_exc()


if __name__ == "__main__":
    main()
