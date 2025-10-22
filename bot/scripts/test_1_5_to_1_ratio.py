#!/usr/bin/env python3
"""
Test 1.5:1 Take Profit to Stop Loss Ratio Early Closure

This script tests the 1.5:1 profit/loss ratio strategy for early closure:
- Take Profit: Close when profit reaches 1.5x the initial stake
- Stop Loss: Close when loss reaches 1x the initial stake
- This allows for more wins by not waiting the entire contract duration

Usage:
    python scripts/test_1_5_to_1_ratio.py

Requirements:
    - Deriv API token configured in config/credentials.env
    - LemoTick dependencies installed
"""

import time
import sys
import os
import random
from typing import Dict, Any

# Add src to path for imports
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'src'))

from stream_handler import StreamHandler
from trade_executor import TradeExecutor
from config import config
from logger import logger


class RatioTester:
    """Test 1.5:1 take profit to stop loss ratio early closure."""

    def __init__(self):
        """Initialize the ratio tester."""
        self.stream_handler = None
        self.trade_executor = None
        self.test_trade_id = None
        self.ticks_received = 0
        self.start_time = None
        self.monitoring_active = False

        # Test settings
        self.symbol = "R_75"  # Volatility 75 Index (1s ticks)
        self.stake = 10.0     # $10 stake for meaningful P&L calculations
        self.ticks_to_wait = 8  # Wait for 8 ticks before starting ratio checks

        logger.info(f"1.5:1 Ratio Tester initialized - Symbol: {self.symbol}, Stake: ${self.stake}")

    def tick_callback(self, price: float, timestamp: int):
        """Handle incoming tick data."""
        if not self.monitoring_active:
            return

        self.ticks_received += 1
        elapsed_time = time.time() - self.start_time

        logger.info(f"Tick {self.ticks_received}: {price} (Elapsed: {elapsed_time:.1f}s)")

        # Check if trade is active and we should start ratio monitoring
        if (self.ticks_received >= self.ticks_to_wait and
            self.test_trade_id and
            self.test_trade_id in self.trade_executor.active_contracts):

            contract_data = self.trade_executor.active_contracts[self.test_trade_id]

            # Check if contract should be closed early using 1.5:1 ratio
            should_close, reason = self.trade_executor.should_close_early(contract_data, self.ticks_received)

            if should_close:
                logger.info("=== 1.5:1 RATIO EARLY CLOSURE TRIGGERED ===")
                logger.info(f"Reason: {reason}")

                # Check if contract can be sold early
                if self.trade_executor._can_sell_early(contract_data):
                    logger.info(f"Closing trade {self.test_trade_id} using 1.5:1 ratio...")

                    # Attempt early closure
                    success = self.trade_executor._execute_sell(self.test_trade_id, "1.5:1_ratio")

                    if success:
                        logger.info(f"SUCCESS: Trade {self.test_trade_id} closed using 1.5:1 ratio!")
                        logger.info("Final P&L will be calculated based on exit price")
                    else:
                        logger.error(f"FAILED: Could not close trade {self.test_trade_id}")
                else:
                    logger.warning(f"Cannot sell contract {self.test_trade_id} early (may not be resellable)")

                # Stop monitoring after closure attempt
                self.monitoring_active = False
            else:
                logger.debug(f"Ratio check: {reason}")

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

            logger.info(f"Connected and subscribed to {self.symbol} ticks")
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
                logger.info(f"Test trade placed successfully: {trade_id}")
                return True
            else:
                logger.error("Failed to place test trade")
                return False

        except Exception as e:
            logger.error(f"Error placing test trade: {e}")
            return False

    def run_test(self) -> None:
        """Run the 1.5:1 ratio test."""
        logger.info("=== 1.5:1 RATIO EARLY CLOSURE TEST ===")

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

            logger.info(f"Monitoring started - will apply 1.5:1 ratio after {self.ticks_to_wait} ticks...")
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
                        logger.info(f"Trade {self.test_trade_id} is now active")

                        # Show current P&L if available
                        current_pl = self.trade_executor._get_current_profit_loss(
                            self.test_trade_id, self.stake
                        )
                        if current_pl is not None:
                            logger.info(f"Current P&L: ${current_pl:.2f}")

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
            logger.info("1.5:1 ratio test completed")

    def show_test_summary(self) -> None:
        """Show test summary and configuration."""
        logger.info("=== TEST CONFIGURATION ===")
        logger.info(f"Symbol: {self.symbol}")
        logger.info(f"Stake: ${self.stake}")
        logger.info("Contract Duration: 1 minute")
        logger.info("Early closure enabled: True")
        logger.info("1.5:1 Ratio Strategy:")
        logger.info(f"  Take Profit: ${self.stake * 1.5:.2f} (1.5x stake)")
        logger.info(f"  Stop Loss: -${self.stake:.2f} (1x stake)")
        logger.info("  Minimum contract age: 30 seconds")
        logger.info(f"  Start ratio checks after: {self.ticks_to_wait} ticks")


def main():
    """Main entry point."""
    tester = RatioTester()

    # Show test configuration
    tester.show_test_summary()

    print("\n" + "="*60)
    print("Press Enter to start the 1.5:1 ratio early closure test...")
    print("This will place a test trade and apply the 1.5:1 profit/loss ratio.")
    print("="*60)

    try:
        input()
        tester.run_test()
    except KeyboardInterrupt:
        print("\nExiting...")


if __name__ == "__main__":
    main()
