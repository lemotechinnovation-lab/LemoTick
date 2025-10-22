#!/usr/bin/env python3
"""
Rise/Fall Contract Example for LemoTick Bot

This script demonstrates how to use the optimized Rise/Fall contract implementation
in LemoTick. Rise/Fall contracts offer several advantages over other contract types:

1. No continuous tick subscriptions required
2. Simplified trade logic with event-driven approach
3. Better risk management with easy early closure
4. Reduced WebSocket traffic and improved performance
5. Full control over contract lifecycle

Usage:
    python scripts/rise_fall_example.py

Requirements:
    - Deriv API token configured in config/credentials.env
    - LemoTick dependencies installed
"""

import time
import json
import sys
import os

# Add src to path for imports
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'src'))

from stream_handler import StreamHandler
from trade_executor import TradeExecutor
from config import config
from logger import logger


class RiseFallExample:
    """Example implementation showing optimized Rise/Fall contract usage."""

    def __init__(self):
        """Initialize the Rise/Fall example."""
        self.stream_handler = None
        self.trade_executor = None
        self.is_running = False

        # Example trade settings
        self.symbol = "R_75"  # Volatility 75 Index (1s)
        self.stake = 10.0
        self.duration = 1  # 1 minute
        self.max_trades = 3  # Run 3 example trades

        logger.info("Rise/Fall Example initialized")

    def connect_to_deriv(self) -> bool:
        """Establish connection to Deriv API."""
        try:
            logger.info("Connecting to Deriv WebSocket API...")

            # Create stream handler with dummy tick callback
            def dummy_tick_callback(price: float, timestamp: int):
                pass

            self.stream_handler = StreamHandler(dummy_tick_callback)

            # Connect to Deriv
            if not self.stream_handler.connect():
                logger.error("Failed to connect to Deriv API")
                return False

            # Create trade executor
            self.trade_executor = TradeExecutor(
                stream_handler=self.stream_handler,
                strategy_engine=None  # No strategy engine for this example
            )

            logger.info("Successfully connected to Deriv API")
            return True

        except Exception as e:
            logger.error(f"Error connecting to Deriv: {e}")
            return False

    def demonstrate_rise_fall_workflow(self) -> None:
        """Demonstrate the complete Rise/Fall contract workflow."""
        logger.info("=== Rise/Fall Contract Workflow Demonstration ===")

        # Step 1: Get current price for reference
        current_price = self.stream_handler.get_latest_tick(self.symbol)
        logger.info(f"Current {self.symbol} price: {current_price}")

        # Step 2: Place a CALL (Rise) contract
        logger.info("Step 1: Placing CALL (Rise) contract...")
        trade_id_1 = self.trade_executor.place_trade(
            signal_type="BUY",  # CALL contract
            stake=self.stake,
            duration=self.duration
        )

        if trade_id_1:
            logger.info(f"✓ CALL contract placed successfully: {trade_id_1}")
        else:
            logger.error("✗ Failed to place CALL contract")
            return

        # Step 3: Place a PUT (Fall) contract
        logger.info("Step 2: Placing PUT (Fall) contract...")
        trade_id_2 = self.trade_executor.place_trade(
            signal_type="SELL",  # PUT contract
            stake=self.stake,
            duration=self.duration
        )

        if trade_id_2:
            logger.info(f"✓ PUT contract placed successfully: {trade_id_2}")
        else:
            logger.error("✗ Failed to place PUT contract")

        # Step 4: Monitor contracts (Rise/Fall optimized - no continuous subscriptions)
        logger.info("Step 3: Monitoring contracts (Rise/Fall optimized)...")

        start_time = time.time()
        check_interval = 10  # Check every 10 seconds

        while time.time() - start_time < 120:  # Monitor for 2 minutes max
            # Check contract statuses using efficient polling (not subscriptions)
            contract_statuses = self.trade_executor.check_all_contracts_status()

            logger.info(f"Active contracts: {len(contract_statuses)}")
            for contract_id, status in contract_statuses.items():
                logger.info(f"  Contract {contract_id}: {status.get('status', 'unknown')}")

            # Demonstrate early closure for one contract
            if trade_id_1 in contract_statuses:
                contract_data = contract_statuses[trade_id_1]
                if contract_data.get('status') == 'active':
                    # Check if we should close early (after 30 seconds for demo)
                    contract_age = time.time() - contract_data.get('buy_time', 0)
                    if contract_age > 30:
                        logger.info(f"Step 4: Demonstrating early closure for {trade_id_1}...")
                        self.trade_executor._execute_sell(trade_id_1, "demo_early_closure")
                        break

            time.sleep(check_interval)

        # Step 5: Final status check
        logger.info("Step 5: Final contract status check...")
        final_statuses = self.trade_executor.check_all_contracts_status()

        for contract_id, status in final_statuses.items():
            final_status = status.get('final_status', 'unknown')
            final_profit = status.get('final_profit', 0)
            logger.info(f"Final result - Contract {contract_id}: {final_status} (Profit: {final_profit})")

    def demonstrate_advantages(self) -> None:
        """Demonstrate the advantages of Rise/Fall contracts."""
        logger.info("=== Rise/Fall Contract Advantages ===")

        advantages = [
            "✓ No continuous tick subscriptions required",
            "✓ Simplified trade logic with event-driven approach",
            "✓ Easy early contract closure (sell) functionality",
            "✓ Reduced WebSocket traffic and improved performance",
            "✓ Better error handling and recovery",
            "✓ Full control over contract lifecycle",
            "✓ Efficient contract status checking",
            "✓ Lower resource usage compared to live subscriptions"
        ]

        for advantage in advantages:
            logger.info(advantage)

        logger.info(f"Current active contracts: {len(self.trade_executor.active_contracts)}")
        logger.info(f"Non-resellable contracts: {len(self.trade_executor._non_resellable_contracts)}")

    def run_example(self) -> None:
        """Run the complete Rise/Fall example."""
        logger.info("Starting Rise/Fall Contract Example...")

        # Connect to Deriv
        if not self.connect_to_deriv():
            logger.error("Cannot proceed without Deriv connection")
            return

        try:
            # Demonstrate the workflow
            self.demonstrate_rise_fall_workflow()

            # Show advantages
            self.demonstrate_advantages()

        except KeyboardInterrupt:
            logger.info("Example interrupted by user")
        except Exception as e:
            logger.error(f"Error during example: {e}")
        finally:
            # Cleanup
            if self.stream_handler:
                self.stream_handler.disconnect()
            logger.info("Rise/Fall example completed")

    def show_api_calls_example(self) -> None:
        """Show example API calls for Rise/Fall contracts."""
        logger.info("=== Example Rise/Fall API Calls ===")

        examples = [
            {
                "step": "1. Buy Contract",
                "payload": {
                    "buy": 1,
                    "parameters": {
                        "amount": 10,
                        "basis": "stake",
                        "contract_type": "CALL",
                        "symbol": "R_75",
                        "duration": 1,
                        "duration_unit": "m",
                        "currency": "USD"
                    }
                }
            },
            {
                "step": "2. Check Contract Status",
                "payload": {
                    "proposal_open_contract": 1,
                    "contract_id": "1234567890"
                }
            },
            {
                "step": "3. Close Contract Early",
                "payload": {
                    "sell": 1,
                    "contract_id": "1234567890"
                }
            }
        ]

        for example in examples:
            logger.info(f"\n{example['step']}:")
            logger.info(json.dumps(example['payload'], indent=2))


def main():
    """Main entry point."""
    example = RiseFallExample()

    # Show API call examples first
    example.show_api_calls_example()

    print("\n" + "="*60)
    print("Press Enter to run the live example (requires API token)...")
    print("="*60)

    try:
        input()
        example.run_example()
    except KeyboardInterrupt:
        print("\nExiting...")


if __name__ == "__main__":
    main()
