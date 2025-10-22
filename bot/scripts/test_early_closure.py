#!/usr/bin/env python3
"""
Test Early Closure After 8 Ticks

This script tests the early closure functionality of Rise/Fall contracts
after approximately 8 ticks (8 seconds) on the Volatility 75 Index.

Usage:
    python scripts/test_early_closure.py

Requirements:
    - Deriv API token configured in config/credentials.env
    - LemoTick dependencies installed
"""

import time
import sys
import os
import threading
from typing import Dict, Any

# Add src to path for imports
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'src'))

from stream_handler import StreamHandler
from trade_executor import TradeExecutor
from config import config
from logger import logger


class EarlyClosureTester:
    """Test early closure functionality after 8 ticks."""

    def __init__(self):
        """Initialize the early closure tester."""
        self.stream_handler = None
        self.trade_executor = None
        self.test_trade_id = None
        self.ticks_received = 0
        self.start_time = None
        self.monitoring_active = False

        # Test settings
        self.symbol = "R_75"  # Volatility 75 Index (1s ticks)
        self.stake = 1.0      # Small stake for testing
        self.ticks_to_wait = 8  # Wait for 8 ticks before closing

        logger.info(f"Early Closure Tester initialized - Symbol: {self.symbol}, Stake: ${self.stake}")

    def tick_callback(self, price: float, timestamp: int):
        """Handle incoming tick data."""
        if not self.monitoring_active:
            return

        self.ticks_received += 1
        elapsed_time = time.time() - self.start_time

        logger.info(f"Tick {self.ticks_received}: {price} (Elapsed: {elapsed_time:.1f}s)")

        # Check if we should attempt early closure after 8 ticks
        if (self.ticks_received >= self.ticks_to_wait and
            self.test_trade_id and
            self.test_trade_id in self.trade_executor.active_contracts):

            logger.info(f"=== ATTEMPTING EARLY CLOSURE AFTER {self.ticks_received} TICKS ===")

            # Get contract data
            contract_data = self.trade_executor.active_contracts[self.test_trade_id]

            # Check if contract should be closed early using tick-based logic
            should_close, reason = self.trade_executor.should_close_early(contract_data, self.ticks_received)

            if should_close:
                logger.info(f"Closing trade {self.test_trade_id} after {self.ticks_received} ticks: {reason}")

                # Check if contract can be sold early
                if self.trade_executor._can_sell_early(contract_data):
                    # Attempt early closure
                    success = self.trade_executor._execute_sell(self.test_trade_id, "test_8_ticks")

                    if success:
                        logger.info(f"✓ SUCCESS: Trade {self.test_trade_id} closed after {self.ticks_received} ticks!")
                    else:
                        logger.error(f"✗ FAILED: Could not close trade {self.test_trade_id}")
                else:
                    logger.warning(f"Cannot sell contract {self.test_trade_id} early (may not be resellable)")
            else:
                logger.info(f"Not closing yet: {reason}")

            # Stop monitoring after closure attempt
            self.monitoring_active = False

    def connect_to_deriv(self) -> bool:
        """Establish connection to Deriv API."""
        try:
            logger.info("Connecting to Deriv WebSocket API...")

            # Create stream handler with our tick callback
            self.stream_handler = StreamHandler(self.tick_callback)

            # Connect to Deriv
            if not self.stream_handler.connect():
                logger.error("Failed to connect to Deriv API")
                return False

            # Create trade executor
            self.trade_executor = TradeExecutor(
                stream_handler=self.stream_handler,
                strategy_engine=None
            )

            # Subscribe to tick data for the test symbol
            tick_subscription = {
                "ticks": self.symbol,
                "subscribe": 1
            }

            if not self.stream_handler.send_message(tick_subscription):
                logger.error("Failed to subscribe to tick data")
                return False

            logger.info(f"✓ Connected and subscribed to {self.symbol} ticks")
            return True

        except Exception as e:
            logger.error(f"Error connecting to Deriv: {e}")
            return False

    def place_test_trade(self) -> bool:
        """Place a test trade."""
        try:
            logger.info(f"Placing test trade on {self.symbol} with stake ${self.stake}...")

            # Place a CALL trade
            trade_id = self.trade_executor.place_trade(
                signal_type="BUY",
                stake=self.stake,
                duration=1  # 1 minute duration
            )

            if trade_id:
                self.test_trade_id = trade_id
                logger.info(f"✓ Test trade placed successfully: {trade_id}")
                return True
            else:
                logger.error("✗ Failed to place test trade")
                return False

        except Exception as e:
            logger.error(f"Error placing test trade: {e}")
            return False

    def run_test(self) -> None:
        """Run the early closure test."""
        logger.info("=== EARLY CLOSURE TEST: 8 TICKS ===")

        # Connect to Deriv
        if not self.connect_to_deriv():
            logger.error("Cannot proceed without Deriv connection")
            return

        try:
            # Place test trade
            if not self.place_test_trade():
                return

            # Start monitoring
            self.start_time = time.time()
            self.monitoring_active = True
            self.ticks_received = 0

            logger.info(f"⏰ Monitoring started - will close after {self.ticks_to_wait} ticks...")
            logger.info("Waiting for ticks and trade confirmation...")

            # Monitor for up to 2 minutes
            timeout = 120
            start_time = time.time()

            while self.monitoring_active and (time.time() - start_time) < timeout:
                time.sleep(0.5)  # Check every 500ms

                # Check if trade was executed and is active
                if (self.test_trade_id and
                    self.test_trade_id in self.trade_executor.active_contracts):

                    contract_data = self.trade_executor.active_contracts[self.test_trade_id]
                    if contract_data.get("status") == "active":
                        logger.info(f"✓ Trade {self.test_trade_id} is now active")

                        # Check contract age
                        contract_age = time.time() - contract_data.get("buy_time", 0)
                        logger.info(f"Contract age: {contract_age:.1f} seconds")

            # Final status check
            logger.info("=== TEST RESULTS ===")

            if self.test_trade_id in self.trade_executor.active_contracts:
                final_contract = self.trade_executor.active_contracts[self.test_trade_id]
                logger.info(f"Final contract status: {final_contract.get('status', 'unknown')}")
                logger.info(f"Final profit: {final_contract.get('final_profit', 'N/A')}")
            else:
                logger.info(f"Contract {self.test_trade_id} no longer in active contracts")

            logger.info(f"Total ticks received: {self.ticks_received}")
            logger.info(f"Test duration: {time.time() - self.start_time:.1f} seconds")

        except KeyboardInterrupt:
            logger.info("Test interrupted by user")
        except Exception as e:
            logger.error(f"Error during test: {e}")
        finally:
            # Cleanup
            if self.stream_handler:
                self.stream_handler.disconnect()
            logger.info("Early closure test completed")

    def show_test_summary(self) -> None:
        """Show test summary and configuration."""
        logger.info("=== TEST CONFIGURATION ===")
        logger.info(f"Symbol: {self.symbol}")
        logger.info(f"Stake: ${self.stake}")
        logger.info(f"Ticks to wait: {self.ticks_to_wait}")
        logger.info(f"Expected duration: ~{self.ticks_to_wait} seconds")
        logger.info("Early closure enabled: True")
        logger.info("Min profit threshold: 5% (default)")
        logger.info("Max loss threshold: 15% (default)")


def main():
    """Main entry point."""
    tester = EarlyClosureTester()

    # Show test configuration
    tester.show_test_summary()

    print("\n" + "="*60)
    print("Press Enter to start the 8-tick early closure test...")
    print("This will place a small test trade and attempt to close it after 8 ticks.")
    print("="*60)

    try:
        input()
        tester.run_test()
    except KeyboardInterrupt:
        print("\nExiting...")


if __name__ == "__main__":
    main()
