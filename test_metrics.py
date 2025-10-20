#!/usr/bin/env python3
"""
Test script to verify Prometheus metrics are working correctly.
"""

import sys
import os
import requests
import time

# Add src to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

try:
    from metrics import get_metrics, start_metrics_server
except ImportError:
    # Fallback for direct execution
    import sys
    sys.path.insert(0, os.path.dirname(__file__))
    from src.metrics import get_metrics, start_metrics_server

def test_metrics_server():
    """Test that metrics server starts and exposes metrics."""
    print("🚀 Starting metrics server...")

    # Start metrics server
    if not start_metrics_server(port=8000):
        print("❌ Failed to start metrics server")
        return False

    # Wait a moment for server to start
    time.sleep(2)

    try:
        # Test metrics endpoint
        response = requests.get("http://localhost:8000/")
        if response.status_code == 200:
            print("✅ Metrics server is responding")
            print(f"📊 Content length: {len(response.text)} characters")

            # Check for key metrics
            content = response.text
            expected_metrics = [
                "lemotick_trades_total",
                "lemotick_signals_generated_total",
                "lemotick_ema_fast",
                "lemotick_macd_line",
                "lemotick_macd_signal",
                "lemotick_macd_histogram"
            ]

            found_metrics = []
            for metric in expected_metrics:
                if metric in content:
                    found_metrics.append(metric)
                    print(f"✅ Found metric: {metric}")
                else:
                    print(f"❌ Missing metric: {metric}")

            if len(found_metrics) >= 5:  # At least 5 out of 7 expected metrics
                print(f"✅ Successfully found {len(found_metrics)}/{len(expected_metrics)} expected metrics")
                return True
            else:
                print(f"❌ Only found {len(found_metrics)}/{len(expected_metrics)} expected metrics")
                return False
        else:
            print(f"❌ Metrics server returned status {response.status_code}")
            return False

    except requests.exceptions.RequestException as e:
        print(f"❌ Failed to connect to metrics server: {e}")
        return False

if __name__ == "__main__":
    print("🧪 Testing LemoTick metrics integration...")
    success = test_metrics_server()

    if success:
        print("\n🎉 Metrics integration test PASSED!")
        print("📊 Dashboard should now display data correctly")
    else:
        print("\n❌ Metrics integration test FAILED!")
        print("🔧 Check the logs above for issues")

    sys.exit(0 if success else 1)
