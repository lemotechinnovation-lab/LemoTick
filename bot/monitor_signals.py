#!/usr/bin/env python3
"""
Monitor bot for trading signals and execution
Runs bot for 2 minutes and captures all signal activity
"""

import subprocess
import sys
import time
from datetime import datetime

def monitor_bot(duration_seconds=120):
    """Monitor bot for specified duration"""
    print("=" * 80)
    print("LemoTick Bot - Signal Monitor")
    print("=" * 80)
    print(f"Monitoring for {duration_seconds} seconds...")
    print(f"Started at: {datetime.now().strftime('%H:%M:%S')}")
    print()
    print("Looking for:")
    print("  - ENTRY SIGNAL (BUY/SELL)")
    print("  - EXIT SIGNAL")
    print("  - Trade execution")
    print("  - EMA/RSI values")
    print()
    print("=" * 80)
    print()

    # Start bot
    process = subprocess.Popen(
        [sys.executable, "run_bot.py"],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1
    )

    start_time = time.time()
    signal_count = 0
    trade_count = 0

    try:
        while time.time() - start_time < duration_seconds:
            line = process.stdout.readline() # type: ignore
            if not line:
                break

            # Print all output
            print(line.rstrip())

            # Track signals
            if "ENTRY SIGNAL" in line or "Signal:" in line:
                signal_count += 1
                print(f"\n>>> SIGNAL #{signal_count} DETECTED <<<\n")

            if "EXIT SIGNAL" in line:
                print(f"\n>>> EXIT SIGNAL DETECTED <<<\n")

            if "Opened" in line or "contract=" in line:
                trade_count += 1
                print(f"\n>>> TRADE #{trade_count} EXECUTED <<<\n")

    except KeyboardInterrupt:
        print("\n\nMonitoring stopped by user")
    finally:
        process.terminate()
        process.wait()

    elapsed = time.time() - start_time
    print()
    print("=" * 80)
    print(f"Monitoring complete ({elapsed:.0f} seconds)")
    print(f"Signals detected: {signal_count}")
    print(f"Trades executed: {trade_count}")
    print("=" * 80)

if __name__ == "__main__":
    duration = 120  # 2 minutes
    if len(sys.argv) > 1:
        duration = int(sys.argv[1])

    monitor_bot(duration)
