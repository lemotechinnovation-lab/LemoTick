"""
Quick Bot Status Checker
Shows current market conditions and predicts when next trade might happen
"""

import json
import sys
from datetime import datetime
from pathlib import Path
from typing import Any

import websocket

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from strategies.ema_rsi_strategy import EMA, RSI


class BotStatusChecker:
    """Quick status checker for bot market conditions"""

    def __init__(self, app_id: int = 1089):
        self.app_id: int = app_id
        self.ws: websocket.WebSocket | None = None

    def connect(self):
        """Connect to Deriv API"""
        ws_url = f"wss://ws.derivws.com/websockets/v3?app_id={self.app_id}"
        self.ws = websocket.create_connection(ws_url, timeout=10)

    def fetch_recent_candles(
        self, symbol: str, count: int = 10
    ) -> list[dict[str, Any]]:
        """Fetch recent candles"""
        if not self.ws:
            return []

        request = {
            "ticks_history": symbol,
            "adjust_start_time": 1,
            "count": count,
            "end": "latest",
            "granularity": 300,  # 5 minutes
            "style": "candles",
        }

        _ = self.ws.send(json.dumps(request))
        response = json.loads(self.ws.recv())

        if "error" in response:
            return []

        return response.get("candles", [])

    def calculate_indicators(self, candles: list[dict[str, Any]]) -> dict[str, float]:
        """Calculate current indicators"""
        ema5 = EMA(period=5)
        ema10 = EMA(period=10)
        rsi5 = RSI(period=5)

        for candle in candles:
            close = float(candle.get("close", 0))
            _ = ema5.update(close)
            _ = ema10.update(close)
            _ = rsi5.update(close)

        return {
            "ema5": ema5.value or 0,
            "ema10": ema10.value or 0,
            "rsi": rsi5.value or 0,
            "ema5_prev": ema5.previous_value or 0,
            "ema10_prev": ema10.previous_value or 0,
        }

    def analyze_market(
        self, indicators: dict[str, float], latest_candle: dict[str, Any]
    ) -> dict[str, Any]:
        """Analyze market conditions"""
        ema5 = indicators["ema5"]
        ema10 = indicators["ema10"]
        rsi = indicators["rsi"]
        ema5_prev = indicators["ema5_prev"]
        ema10_prev = indicators["ema10_prev"]

        diff = abs(ema5 - ema10)
        close = float(latest_candle.get("close", 0))

        # Determine EMA position
        if ema5 > ema10:
            position = "EMA5 ABOVE EMA10 (Bullish)"
            next_signal = "Waiting for EMA5 to cross BELOW (SELL signal)"
        else:
            position = "EMA5 BELOW EMA10 (Bearish)"
            next_signal = "Waiting for EMA5 to cross ABOVE (BUY signal)"

        # Check if crossover just happened
        crossover_recent = False
        if ema5_prev > ema10_prev and ema5 < ema10:
            crossover_recent = True
            crossover_type = "BEARISH (SELL)"
        elif ema5_prev < ema10_prev and ema5 > ema10:
            crossover_recent = True
            crossover_type = "BULLISH (BUY)"
        else:
            crossover_type = "None"

        # Predict proximity to crossover
        if diff < 0.01:
            proximity = "VERY CLOSE - Crossover likely in 1-2 candles (5-10 minutes)"
        elif diff < 0.05:
            proximity = "CLOSE - Crossover possible in 2-4 candles (10-20 minutes)"
        elif diff < 0.2:
            proximity = "MODERATE - Crossover may occur in 5-10 candles (25-50 minutes)"
        else:
            proximity = "FAR APART - Crossover unlikely soon (strong trend)"

        # RSI analysis
        if rsi > 70:
            rsi_status = "OVERBOUGHT (>70) - Potential reversal down"
        elif rsi > 55:
            rsi_status = "Bullish zone (>55) - Good for BUY signals"
        elif rsi >= 45:
            rsi_status = "Neutral zone (45-55) - Wait for clear direction"
        elif rsi > 30:
            rsi_status = "Bearish zone (<45) - Good for SELL signals"
        else:
            rsi_status = "OVERSOLD (<30) - Potential reversal up"

        return {
            "position": position,
            "next_signal": next_signal,
            "proximity": proximity,
            "difference": diff,
            "rsi_status": rsi_status,
            "crossover_recent": crossover_recent,
            "crossover_type": crossover_type,
            "close_price": close,
        }

    def display_status(
        self, indicators: dict[str, float], analysis: dict[str, Any], timestamp: float
    ) -> None:
        """Display formatted status"""
        print("\n" + "=" * 80)
        print("LEMOTICK BOT STATUS CHECKER")
        print("=" * 80)
        print(
            f"Time: {datetime.fromtimestamp(timestamp).strftime('%Y-%m-%d %H:%M:%S')}"
        )
        print("Market: R_25 (Volatility 25 Index)")
        print("Timeframe: 5 minutes")
        print("=" * 80)

        print("\nCURRENT INDICATORS:")
        print(f"  EMA5:  {indicators['ema5']:.5f}")
        print(f"  EMA10: {indicators['ema10']:.5f}")
        print(f"  RSI5:  {indicators['rsi']:.1f}")
        print(f"  Price: {analysis['close_price']:.5f}")

        print("\nEMA POSITION:")
        print(f"  {analysis['position']}")
        print(f"  Difference: {analysis['difference']:.5f}")

        print("\nCROSSOVER STATUS:")
        if analysis["crossover_recent"]:
            print(
                f"  *** CROSSOVER JUST HAPPENED! Type: {analysis['crossover_type']} ***"
            )
            print(f"  >>> Bot should have placed a trade! <<<")
        else:
            print(f"  Last crossover: {analysis['crossover_type']}")
            print(f"  Proximity: {analysis['proximity']}")

        print("\nRSI STATUS:")
        print(f"  {analysis['rsi_status']}")

        print("\nNEXT TRADE PREDICTION:")
        print(f"  {analysis['next_signal']}")
        print(f"  Estimated time: {analysis['proximity']}")

        print("\nTRADE REQUIREMENTS:")
        if "BUY" in analysis["next_signal"]:
            print("  For BUY signal:")
            print(
                f"    - EMA5 must cross ABOVE EMA10 ({'%.5f' % indicators['ema5']} → > {'%.5f' % indicators['ema10']})"
            )
            print(f"    - RSI must be > 50 (current: {indicators['rsi']:.1f})")
            print(f"    - Price must be above both EMAs")
        else:
            print("  For SELL signal:")
            print(
                f"    - EMA5 must cross BELOW EMA10 ({'%.5f' % indicators['ema5']} → < {'%.5f' % indicators['ema10']})"
            )
            print(f"    - RSI must be < 50 (current: {indicators['rsi']:.1f})")
            print(f"    - Price must be below both EMAs")

        print("\n" + "=" * 80)

        # Summary
        if analysis["crossover_recent"]:
            print("STATUS: Trade signal should have been generated!")
            print("Check bot logs for trade execution details.")
        elif analysis["difference"] < 0.01:
            print("STATUS: Trade coming very soon! (1-2 candles)")
            print("Keep bot running - watch for crossover!")
        elif analysis["difference"] < 0.1:
            print("STATUS: Trade likely within next 15-30 minutes")
            print("Bot is monitoring - be patient.")
        else:
            print("STATUS: Waiting for market conditions to align")
            print("Strong trend in place - crossover may take 30+ minutes.")

        print("=" * 80 + "\n")

    def disconnect(self) -> None:
        """Disconnect"""
        if self.ws:
            self.ws.close()


def main() -> None:
    """Main function"""
    try:
        print("\nConnecting to Deriv API...")
        checker = BotStatusChecker()
        checker.connect()
        print("Connected!")

        print("Fetching latest market data...")
        candles = checker.fetch_recent_candles("R_25", count=15)

        if not candles:
            print("Error: Could not fetch candles")
            return

        print(f"Fetched {len(candles)} candles")

        # Calculate indicators
        indicators = checker.calculate_indicators(candles)

        # Analyze market
        latest_candle = candles[-1]
        analysis = checker.analyze_market(indicators, latest_candle)

        # Display status
        timestamp = latest_candle.get("epoch", 0)
        checker.display_status(indicators, analysis, timestamp)

        checker.disconnect()

        print("TIP: Run this script anytime to check current market conditions!")
        print("     python check_bot_status.py\n")

    except KeyboardInterrupt:
        print("\n\nInterrupted by user")
    except Exception as e:
        print(f"\nError: {e}")
        import traceback

        traceback.print_exc()


if __name__ == "__main__":
    main()
