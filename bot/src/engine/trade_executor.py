"""
Trade execution module for LemoTick bot.
Handles Deriv API integration for placing trades and managing positions.
"""

import time
from typing import Dict, Any, Optional, Callable, List
from infrastructure.config import config
from infrastructure.logger import logger
from utils.helpers import generate_trade_id, calculate_dynamic_ticks_sl_tp, calculate_tick_size_for_symbol
from typing import TYPE_CHECKING
from infrastructure.metrics import get_metrics
from indicators.fibonacci import FibonacciLevels

if TYPE_CHECKING:
    from .stream_handler import StreamHandler


class TradeExecutor:
    """Handles trade execution through Deriv API."""

    def __init__(self, stream_handler: "StreamHandler", strategy_engine=None, data_recorder=None, risk_manager=None):
        """
        Initialize trade executor.

        Args:
            stream_handler: WebSocket stream handler for sending messages
            strategy_engine: Strategy engine for active trades checking
            data_recorder: Data recorder for database operations
            risk_manager: Risk manager for equity tracking
        """
        self.stream_handler = stream_handler
        self.strategy_engine = strategy_engine
        self.data_recorder = data_recorder
        self.risk_manager = risk_manager
        # Note: Using config.symbol dynamically instead of storing as instance variable
        self.min_stake = config.min_stake
        self.max_stake = config.max_stake

        # Thread safety for trade placement
        import threading
        import time
        self._trade_lock = threading.Lock()  # Prevent race conditions in trade placement
        self._placing_trade = False  # Flag to indicate if a trade is currently being placed
        self._placing_trade_start_time = 0  # Track when trade placement started
        
        # Trade tracking - Simplified for direct buy orders
        self.active_contracts = {}  # contract_id -> contract_data
        
        # Market fallback system
        self.pending_market_fallback = None  # Store pending market fallback requests
        self.pending_proposals = {}  #  Added to fix cancellation cleanup
        
        # CRITICAL FIX: Force update active trades metric on initialization
        try:
            self.metrics = get_metrics()
            self.metrics.update_active_trades(0)
            logger.info("INITIALIZED active trades metric to 0")
        except Exception as e:
            logger.error(f"Error initializing metrics: {e}")
        
        # Balance tracking for real equity updates
        self.current_balance = 1000.0  # Default starting balance
        
        
        # Dynamic Stop Loss - Exit when profit drops to zero
        self.dynamic_stop_loss_enabled = config.get("risk_management.dynamic_stop_loss_enabled", False)
        self.dynamic_stop_loss_threshold = config.get("risk_management.dynamic_stop_loss_threshold", 0.0)
        self.dynamic_stop_loss_check_interval = config.get("risk_management.dynamic_stop_loss_check_interval", 5)
        
        if self.dynamic_stop_loss_enabled:
            logger.info(f"DYNAMIC STOP LOSS ENABLED: Exit when profit drops to ${self.dynamic_stop_loss_threshold}")
        
        # Enhanced pattern detection only - no reversal strategy needed
        
        # Fibonacci Analysis for Enhanced Pattern Detection
        self.fibonacci = FibonacciLevels(lookback_period=50)
        self.fibonacci_enabled = config.get("strategy.fibonacci_enabled", True)
        self.fibonacci_confidence_boost = config.get("strategy.fibonacci_confidence_boost", 0.15)
        self.price_history = []  # Price history for fibonacci analysis
        
        if self.fibonacci_enabled:
            logger.info(f"FIBONACCI ANALYSIS ENABLED: Confidence boost {self.fibonacci_confidence_boost:.0%}")
        
        #  NEW: Profit protection cooldown mechanism
        self.profit_protection_cooldown_end = 0.0  # Timestamp when cooldown ends
        self.profit_protection_cooldown_duration = config.get("trading.profit_protection_cooldown_seconds", 10.0)  # Default 60 seconds

        # Execution parameters
        self.contract_duration = config.get("trading.contract_duration", 1)  # minutes
        self.contract_duration_unit = config.get("trading.contract_duration_unit", "m")  # minutes
        self.contract_basis = config.get("trading.contract_basis", "stake")
        
        # Symbol-specific durations
        self.symbol_durations = config.get("trading.symbol_durations", {})

        # Protective exits - support both percentage and fixed dollar amounts
        self.take_profit_pct = float(config.get("trading.take_profit_pct", 0.35))
        self.stop_loss_pct = float(config.get("trading.stop_loss_pct", 0.20))
        
        #  NEW: Fixed dollar amount SL/TP (overrides percentage if set)
        self.fixed_take_profit = config.get("trading.fixed_take_profit", None)  # e.g., 5.0 = $5
        self.fixed_stop_loss = config.get("trading.fixed_stop_loss", None)      # e.g., 2.5 = $2.5
        
        if self.fixed_take_profit:
            logger.info(f"Using FIXED take profit: ${self.fixed_take_profit}")
        if self.fixed_stop_loss:
            logger.info(f"Using FIXED stop loss: ${self.fixed_stop_loss}")

        # Early closure settings for Rise/Fall optimization
        self.early_closure_enabled = config.get("trading.early_closure_enabled", True)
        self.min_profit_threshold = float(config.get("trading.min_profit_threshold", 0.05))  # 5% minimum profit
        self.max_loss_threshold = float(config.get("trading.max_loss_threshold", 0.15))    # 15% maximum loss
        self.early_closure_check_interval = config.get("trading.early_closure_check_interval", 10)  # Check every 10 seconds
        
        # CRITICAL: Candlestick timing integration
        self.use_candlestick_timing = config.get("trading.use_candlestick_timing", True)
        self.candlestick_strategy = None  # Will be set by strategy engine

        # Register callbacks on the stream handler so we receive trade events
        try:
            self.stream_handler.register_trade_callbacks(
                on_proposal=self.handle_proposal_response,
                on_buy=self.handle_buy_response,
                on_sell=self.handle_sell_response,
                on_sell_error=self.handle_sell_error,
                on_contract_update=self.handle_contract_update,
            )
        except Exception:
            # Backward compatible if stream handler does not support registration
            pass

        # Metrics
        try:
            self.metrics = get_metrics()
        except Exception:
            self.metrics = None

        # Track contracts where resale is not offered to avoid repeated errors
        self._non_resellable_contracts = set()
        self._sell_attempts = {}  # Track sell attempts per contract
        self._last_sell_attempt = {}  # Track last sell attempt time for cooldown

        # Clear any stuck contracts from previous sessions
        self._clear_stuck_contracts()

        logger.info("Trade executor initialized")

    def set_candlestick_strategy(self, strategy):
        """Set reference to candlestick strategy for timing integration."""
        self.candlestick_strategy = strategy
        logger.info("Candlestick strategy reference set for timing integration")


    def _calculate_otm_probability(self, barrier_offset: float, current_price: float, contract_type: str) -> float:
        """
        Calculate approximate OTM probability for a given barrier.

        This is a simplified calculation - in practice you'd need more sophisticated models.
        """
        try:
            # Simple approximation based on barrier distance from current price
            distance_pct = barrier_offset / current_price

            # Assume normal distribution with 68% within 1 std dev
            # Approximate probability as distance from mean
            base_probability = min(distance_pct * 2.0, 0.5)  # Max 50% for extreme OTM

            # Adjust for contract type (calls vs puts may have different probabilities)
            if contract_type == "CALL":
                # Calls typically have slightly higher OTM probability
                return base_probability * 1.1
            else:
                # Puts typically have slightly lower OTM probability
                return base_probability * 0.9

        except Exception:
            return 0.25  # Default 25% OTM probability


    def _check_dynamic_stop_loss(self, contract_data: Dict, current_price: float) -> tuple[bool, str]:
        """
        Check if trade should be closed due to dynamic stop loss (profit drops to zero).
        
        Args:
            contract_data: Contract data dictionary
            current_price: Current market price
            
        Returns:
            Tuple of (should_close, reason)
        """
        if not self.dynamic_stop_loss_enabled:
            return False, "Dynamic stop loss disabled"
        
        try:
            # Extract core data
            contract_type = contract_data.get("contract_type", "")
            entry_price = contract_data.get("entry_price", contract_data.get("entry_spot", 0))
            stake = contract_data.get("stake", 0)
            symbol = contract_data.get("symbol", "")
    
            if entry_price <= 0 or stake <= 0:
                return False, "Invalid trade data"
    
            # Determine trade type
            is_call_trade = contract_type == "CALL"
            is_put_trade = contract_type == "PUT"
    
            if not (is_call_trade or is_put_trade):
                return False, "Unknown contract type"
    
            # Detect inverted symbols (R_ indices)
            is_inverted_symbol = self._is_inverted_symbol(symbol)
    
            # Calculate price difference
            price_diff = current_price - entry_price
    
            # Apply correct profit direction based on inversion (same logic as barrier calculation)
            if is_inverted_symbol:
                # INVERTED LOGIC for R_ symbols
                if is_call_trade:
                    # CALL: Profit when price goes DOWN (inverted)
                    current_profit = -price_diff  # Negative diff = profit
                else:
                    # PUT: Profit when price goes UP (inverted)
                    current_profit = price_diff   # Positive diff = profit
            else:
                # NORMAL LOGIC for other symbols
                if is_call_trade:
                    # CALL: Profit when price goes UP (normal)
                    current_profit = price_diff   # Positive diff = profit
                else:
                    # PUT: Profit when price goes DOWN (normal)
                    current_profit = -price_diff  # Negative diff = profit

    
            # Check if profit dropped below dynamic stop-loss threshold
            if current_profit <= self.dynamic_stop_loss_threshold:
                logger.info(
                    f"DYNAMIC STOP LOSS TRIGGERED: profit={current_profit:.4f} "
                    f"(threshold={self.dynamic_stop_loss_threshold}) | "
                    f"symbol={symbol} | inverted={is_inverted_symbol} | "
                    f"contract={contract_type} | entry={entry_price:.4f} | current={current_price:.4f}"
                )
                return True, f"Dynamic stop loss: Profit dropped to {current_profit:.4f}"
    
            logger.debug(
                f"DYNAMIC STOP LOSS CHECK: profit={current_profit:.4f} | "
                f"threshold={self.dynamic_stop_loss_threshold} | "
                f"symbol={symbol} | inverted={is_inverted_symbol}"
            )
            return False, f"Trade still profitable: {current_profit:.4f}"
    
        except Exception as e:
            logger.error(f"Error in dynamic stop loss check: {e}", exc_info=True)
            return False, f"Error in dynamic stop loss: {e}"

    def _extract_symbol_from_shortcode(self, shortcode: str) -> str:
        """
        Extract symbol from Deriv shortcode.
        
        Args:
            shortcode: Shortcode from Deriv API (e.g., "CALL_R_100_2.76_1761716034_1761716334_S-43P_0")
            
        Returns:
            Symbol string (e.g., "R_100")
        """
        try:
            # Shortcode format: CALL_R_100_2.76_1761716034_1761716334_S-43P_0
            # Split by underscore and look for R_ pattern
            parts = shortcode.split('_')
            for i, part in enumerate(parts):
                if part == 'R' and i + 1 < len(parts):
                    return f"R_{parts[i + 1]}"
            return "unknown"
        except Exception as e:
            logger.error(f"Error extracting symbol from shortcode {shortcode}: {e}")
            return "unknown"

    def _is_inverted_symbol(self, symbol: str) -> bool:
        """
        Check if symbol uses inverted logic.
        
        Args:
            symbol: Symbol to check
            
        Returns:
            True if symbol uses inverted logic
        """
        return symbol in ["R_100", "R_75", "R_50", "R_25", "R_200"]

    def place_trade(
        self,
        signal_type: str,
        stake: float,
        on_trade_result: Optional[Callable] = None,
        entry_price: Optional[float] = None,
        duration: Optional[int] = None,
        signal_data: Optional[Dict] = None
    ) -> Optional[str]:
        """
        Place a direct buy order (CALL/PUT binary options - no SL/TP support).

        Args:
            signal_type: Trading signal (BUY/SELL)
            stake: Stake amount
            on_trade_result: Callback for trade results
            entry_price: Entry price (optional, uses current price if not provided)
            duration: Contract duration in minutes (optional, uses config default if not provided)
            signal_data: Signal data containing timing information (optional)

        Returns:
            Trade ID if successful, None otherwise

        NOTE: SL/TP is only supported for Multiplier contracts (MULTUP/MULTDOWN),
              not for CALL/PUT binary options contracts.
        """
        # Use thread lock to prevent race conditions when placing trades
        with self._trade_lock:
            try:
                # CRITICAL CHECK #1: Check if a trade is currently being placed (with timeout)
                if self._placing_trade:
                    # Check if trade placement has been stuck for too long (30 seconds timeout)
                    if time.time() - self._placing_trade_start_time > 30:
                        logger.warning(f"Trade placement timeout detected - forcing unlock after 30 seconds")
                        self._placing_trade = False
                    else:
                        logger.warning(f"BLOCKED: Cannot place {signal_type} trade - another trade is currently being placed!")
                        return None
                
                # CRITICAL CHECK #2: Prevent multiple trades from opening simultaneously
                # Count real active contracts (excluding those in closing states)
                real_active_count = 0
                for contract_id, trade_data in self.active_contracts.items():
                    status = trade_data.get("status", "")
                    if status not in ["closing", "closing_early", "force_closing", "closed"]:
                        real_active_count += 1
                
                # OPTIMIZED: Allow up to 2 concurrent trades for faster execution
                if real_active_count >= 2:
                    logger.warning(f"BLOCKED: Cannot place {signal_type} trade - already have {real_active_count} active trade(s)! Max concurrent: 2")
                    return None
                
                # CRITICAL CHECK #3: Profit protection cooldown
                if self.is_in_profit_protection_cooldown():
                    remaining_time = self.get_profit_protection_cooldown_remaining()
                    logger.warning(f"BLOCKED: Cannot place {signal_type} trade - profit protection cooldown active ({remaining_time:.0f}s remaining)")
                    return None
                
                # Set the placing trade flag to block other concurrent attempts
                self._placing_trade = True
                self._placing_trade_start_time = time.time()
                logger.info(f"Trade placement started for {signal_type} - blocking concurrent attempts")

                # Validate inputs
                if signal_type not in ["BUY", "SELL"]:
                    logger.error(f"Invalid signal type: {signal_type}")
                    return None

                if not (self.min_stake <= stake <= self.max_stake):
                    logger.error(
                        f"Stake {stake} outside allowed range [{self.min_stake}, {self.max_stake}]"
                    )
                    return None

                # Enhanced Pattern Detection Validation for Entry
                if entry_price:
                    pattern_validation = self._validate_entry_pattern(signal_type, entry_price)
                    if not pattern_validation["valid"]:
                        logger.warning(f"PATTERN VALIDATION FAILED: {pattern_validation['reason']} - Blocking {signal_type} trade")
                        self._placing_trade = False
                        return None
                    else:
                        logger.info(f"PATTERN VALIDATION PASSED: {pattern_validation['reason']} - Proceeding with {signal_type} trade")

                # Use CALL/PUT contracts for 1HZ100V synthetic index (Deriv API standard)
                contract_type = "CALL" if signal_type == "BUY" else "PUT"

                # Generate unique trade ID
                trade_id = generate_trade_id()

                # Update fibonacci levels with current price
                if entry_price:
                    self.update_fibonacci_levels(entry_price)

                # Execute direct buy order
                success = self._execute_direct_buy(
                    trade_id=trade_id,
                    contract_type=contract_type,
                    stake=stake,
                    duration=duration,
                    on_trade_result=on_trade_result,
                    signal_data=signal_data,
                    signal_type=signal_type
                )

                if success:
                    logger.info(f"Direct buy order placed: {trade_id} - {contract_type} {stake}")
                    # Keep _placing_trade=True until we get buy response (cleared in handle_buy_response)
                    return trade_id
                else:
                    logger.error("Failed to place direct buy order")
                    self._placing_trade = False  # Clear flag on failure
                    logger.info(f"Trade placement failed - unlocking for next attempt")
                    return None

            except Exception as e:
                logger.error(f"Error placing trade: {e}")
                self._placing_trade = False  # Clear flag on error
                logger.info(f"Trade placement error - unlocking for next attempt")
                return None

    def _execute_direct_buy(
        self,
        trade_id: str,
        contract_type: str,
        stake: float,
        duration: Optional[int] = None,
        on_trade_result: Optional[Callable] = None,
        signal_data: Optional[Dict] = None,
        signal_type: Optional[str] = None
    ) -> bool:
        """
        Execute direct buy order (CALL/PUT binary options - no SL/TP).

        Args:
            trade_id: Trade ID
            contract_type: Contract type (CALL/PUT)
            stake: Stake amount
            duration: Contract duration in minutes (optional, uses config default if not provided)
            on_trade_result: Callback for trade results
            signal_data: Signal data containing timing information (optional)

        Returns:
            True if successful, False otherwise

        NOTE: SL/TP parameters removed since they're not supported for CALL/PUT contracts.
              Use Multiplier contracts (MULTUP/MULTDOWN) if you need SL/TP functionality.
        """
        try:
            # For binary options, we need to use the barrier (strike price)
            # Get current price for out-of-money barrier calculation
            current_price = self.stream_handler.get_latest_tick(config.symbol)
            if current_price is None:
                logger.error("No current price available for direct buy order")
                return False
            
            # Detect inverted symbols (R_ indices) - same logic as barrier calculation
            is_inverted_symbol = config.symbol in ["R_100", "R_75", "R_50", "R_25", "R_200"]
                

            # For Deriv binary options, we need to use the proposal -> buy flow
            # First request a proposal, then buy it

            # Build proposal request (Deriv API format)
            # For binary options, barrier might need different format
            duration_minutes = duration if duration is not None else self.contract_duration

            # Optimized proposal payload for Rise/Fall contracts
            proposal_payload = {
                "proposal": 1,
                "symbol": config.symbol,
                "contract_type": contract_type,
                "duration": duration_minutes,
                "duration_unit": self.contract_duration_unit,
                "currency": "USD",
                "basis": self.contract_basis,
                # Note: amount/payout will be set below based on basis type
                # Note: SL/TP not supported for Rise/Fall CALL/PUT contracts
                # Only available for Multiplier contracts (MULTUP/MULTDOWN)
            }

            # OPTIMIZED OTM BARRIER CALCULATION for Rise/Fall contracts
            # Use closer barriers for better win rate (1.5:1 ratio optimization)
            atr_value = 0.0  # Simplified - ATR not needed for enhanced pattern detection
            signal_strength = 0.8  # Simplified - high confidence for enhanced pattern detection

            # Optimized barrier offset for Rise/Fall (closer barriers = better win rate)
            if atr_value and atr_value > 0:
                # Reduced ATR multiplier for closer barriers (better win rate)
                base_atr_multiplier = config.get('trading.otm_atr_multiplier', 0.3)  # 0.3x ATR (reduced from 0.5x)

                # Minimal signal strength adjustment for Rise/Fall
                signal_multiplier = 1.0 + (signal_strength * 0.2)  # 1.0x to 1.2x (reduced from 0.5x)

                # Reduced volatility multiplier for Rise/Fall
                volatility = 0.001  # Simplified - low volatility default for enhanced pattern detection
                volatility_multiplier = 1.0 + (volatility * 3.0)  # 1.0x to 2.0x (reduced from 3.0x)

                dynamic_offset = atr_value * base_atr_multiplier * signal_multiplier * volatility_multiplier
                barrier_offset = min(dynamic_offset, current_price * 0.0005)  # Cap at 1% of price (reduced from 2%)
            else:
                # Fallback to percentage-based if ATR not available (optimized for Rise/Fall)
                base_offset_pct = config.get('trading.otm_base_offset_pct', 0.0005)  # 0.2% (reduced from 0.5%)
                barrier_offset = current_price * base_offset_pct

            barrier_offset = round(barrier_offset, 2)  # Round to 2 decimal places

            ## Always calculate barrier based on CURRENT MARKET PRICE (not adjusted entry price)
            # Hardcode best offset = 0.05% of current market price (tested optimal for R_100)

             # Apply OTM probability checking - stricter for Rise/Fall (better win rate)
            otm_probability = self._calculate_otm_probability(barrier_offset, current_price, contract_type)
            max_otm_probability = config.get('trading.max_otm_probability', 0.15)  # Max 15% OTM probability (reduced from 25%)

            if otm_probability > max_otm_probability:
                logger.warning(f"OTM probability too high ({otm_probability:.2f}), reducing barrier offset for better win rate")
                # Reduce barrier offset to bring probability within acceptable range
                while otm_probability > max_otm_probability and barrier_offset > 0.001:
                    barrier_offset *= 0.7  # Reduce by 30% (more aggressive reduction)
                    barrier_offset = round(barrier_offset, 2)
                    otm_probability = self._calculate_otm_probability(barrier_offset, current_price, contract_type)

            # Apply barrier according to contract type
            # Symbol-specific barrier inversion fix
            
            barrier_offset = round(barrier_offset, 2)
            logger.info("-" * 80)
            logger.info(f"SYMBOL: {config.symbol} | CONTRACT: {contract_type} | OFFSET: {barrier_offset:.2f}")
            
            if self._is_inverted_symbol(config.symbol):
                logger.info(f"BARRIER LOGIC: Using INVERTED logic for {config.symbol}")
                if contract_type == "CALL":
                    barrier = current_price - barrier_offset
                    proposal_payload["barrier"] = f"-{barrier_offset:.2f}"
                    logger.info(f"CALL BARRIER: {barrier:.4f} (current: {current_price:.4f} - offset: {barrier_offset:.4f})")
                elif contract_type == "PUT":
                    barrier = current_price + barrier_offset
                    proposal_payload["barrier"] = f"+{barrier_offset:.2f}"
                    logger.info(f"PUT BARRIER: {barrier:.4f} (current: {current_price:.4f} + offset: {barrier_offset:.4f})")
                else:
                    barrier = current_price
                    logger.warning(f"Unknown contract type: {contract_type}, using current price as barrier")
            else:
                logger.info(f"BARRIER LOGIC: Using NORMAL logic for {config.symbol}")
                if contract_type == "CALL":
                    barrier = current_price + barrier_offset
                    proposal_payload["barrier"] = f"+{barrier_offset:.2f}"
                    logger.info(f"CALL BARRIER: {barrier:.4f} (current: {current_price:.4f} + offset: {barrier_offset:.4f})")
                elif contract_type == "PUT":
                    barrier = current_price - barrier_offset
                    proposal_payload["barrier"] = f"-{barrier_offset:.2f}"
                    logger.info(f"PUT BARRIER: {barrier:.4f} (current: {current_price:.4f} - offset: {barrier_offset:.4f})")
                else:
                    barrier = current_price
                    logger.warning(f"Unknown contract type: {contract_type}, using current price as barrier")
           

            logger.info(f"Dynamic OTM barrier: {barrier:.4f} (current_price: {current_price:.4f}, offset: {barrier_offset:.4f}, prob: {otm_probability:.2f})")

            # Add the correct money field according to the basis
            if str(self.contract_basis).lower() in ("stake", "amount"):
                proposal_payload["amount"] = stake
            else:
                # For payout basis, use amount instead (payout is calculated by Deriv)
                # Deriv API doesn't accept payout parameter in proposal requests
                proposal_payload["amount"] = stake

            # Debug logging
            logger.debug(f"Proposal payload: {proposal_payload}")

            # Note: SL/TP is NOT supported for CALL/PUT binary options contracts on Deriv
            # SL/TP only works with Multiplier contracts (MULTUP/MULTDOWN)
            # For binary options, we rely on the contract's natural expiry

            # Send proposal request
            if not self.stream_handler.send_message(proposal_payload):
                logger.error("Failed to send proposal request")
                return False

            # Store trade information for proposal response
            # NOTE: No SL/TP for CALL/PUT contracts - only for Multiplier contracts
            trade_data = {
                "trade_id": trade_id,
                "signal_type": "BUY" if contract_type == "CALL" else "SELL",
                "contract_type": contract_type,
                "stake": stake,
                "barrier": barrier,
                "entry_price": current_price,  # Store entry price for TP/SL calculations
                "entry_spot": current_price,    # FIXED: Also store as entry_spot for profit protection
                "symbol": config.symbol,        # Store symbol for inverted logic detection
                "timestamp": time.time(),
                "status": "proposal_sent",
                "on_result": on_trade_result,
            }
            
            # CRITICAL: Store timing information from signal data for candlestick strategy
            if signal_data:
                trade_data.update({
                    "trade_start_candle": signal_data.get("trade_start_candle", 0),
                    "expected_close_candle": signal_data.get("expected_close_candle", 0),
                    "pattern": signal_data.get("pattern", ""),
                    "close_after_candles": signal_data.get("close_after_candles", 2),
                    "strategy": signal_data.get("strategy", ""),
                    "pattern_type": signal_data.get("pattern_type", "")
                })
                logger.info(f"TIMING DATA STORED: Start candle: {trade_data['trade_start_candle']}, Expected close: {trade_data['expected_close_candle']}")

            # Store in active contracts (waiting for proposal response)
            self.active_contracts[trade_id] = trade_data

            # Register trade with risk manager
            if self.risk_manager and hasattr(self.risk_manager, 'register_trade'):
                try:
                    # Convert contract_type to signal_type for risk manager
                    trade_type = "BUY" if contract_type == "CALL" else "SELL"
                    logger.info(f"Registering trade with risk manager: trade_id={trade_id}, type={trade_type}, stake={stake}")
                    self.risk_manager.register_trade(
                        trade_id=trade_id,
                        trade_type=trade_type,
                        stake=stake,
                        entry_price=current_price,
                        timestamp=int(time.time())
                    )
                    logger.info(f"Trade registered successfully. Open trades: {len(self.risk_manager.open_trades)}")
                    logger.info(f"Trade registered with risk manager: {trade_id}")
                except Exception as e:
                    logger.error(f"Error registering trade with risk manager: {e}")

            # Log detailed trade information for debugging
            duration_minutes = duration if duration is not None else self.contract_duration
            logger.info(f"Placing {contract_type} for {config.symbol} - duration {duration_minutes}{self.contract_duration_unit} stake {stake} barrier {barrier:.2f} (OTM)")
            logger.debug(f"Proposal payload: {proposal_payload}")

            logger.info(f"Proposal requested: {trade_id} - {contract_type} {stake} at barrier {barrier:.2f} (OTM = Out-The-Money)")
            return True

        except Exception as e:
            logger.error(f"Error executing direct buy: {e}")
            return False


    def handle_proposal_response(self, proposal_data: Dict[str, Any]) -> None:
        """
        Handle proposal response from Deriv API.

        Args:
            proposal_data: Proposal response data
        """
        try:
            # Safer proposal ID extraction (handle different response formats)
            proposal_id = (proposal_data.get("id") or
                          proposal_data.get("proposal", {}).get("id") or
                          proposal_data.get("proposal", {}).get("proposal_id"))

            if not proposal_id:
                logger.error(f"No proposal ID found in response: {proposal_data}")
                return

            # Find corresponding trade data
            trade_data = None
            for tid, data in self.active_contracts.items():
                if data.get("status") == "proposal_sent":
                    trade_data = data
                    break

            if not trade_data:
                logger.warning(f"Received proposal for unknown trade: {proposal_id}")
                return

            # Extract proposal details
            ask_price = proposal_data.get("ask_price", 0)
            payout = proposal_data.get("payout", 0)

            # Enhanced error handling for Rise/Fall proposal responses
            error_code = proposal_data.get("error", {}).get("code")
            error_message = proposal_data.get("error", {}).get("message")

            if error_code:
                # Handle specific Deriv API errors for Rise/Fall contracts
                if error_code == "InvalidSymbol":
                    logger.error(f"Rise/Fall contract error: Invalid symbol {config.symbol}")
                    # Trigger market fallback for invalid symbol
                    self._trigger_market_fallback("InvalidSymbol", f"Symbol {config.symbol} is invalid")
                elif error_code == "InvalidContractType":
                    logger.error(f"Rise/Fall contract error: Invalid contract type {trade_data.get('contract_type', 'unknown')}")
                elif error_code == "InvalidAmount":
                    logger.error(f"Rise/Fall contract error: Invalid stake amount {trade_data.get('stake', 'unknown')}")
                elif error_code == "MarketClosed":
                    logger.error("Rise/Fall contract error: Market is closed")
                    # Trigger market fallback for closed market
                    self._trigger_market_fallback("MarketClosed", f"Market {config.symbol} is closed")
                elif error_code == "RateLimited":
                    logger.error("Rise/Fall contract error: Rate limited - too many requests")
                else:
                    logger.error(f"Rise/Fall contract error {error_code}: {error_message}")
                    # Trigger market fallback for other errors
                    self._trigger_market_fallback("TradeError", f"Error {error_code}: {error_message}")

                logger.error(f"Full proposal response: {proposal_data}")
                self._cancel_trade(trade_data, f"Proposal error {error_code}: {error_message}")
                return

            if ask_price <= 0:
                logger.error(f"Invalid proposal price: {ask_price} for {trade_data.get('contract_type', 'unknown')} trade")
                logger.error(f"Full proposal response: {proposal_data}")
                self._cancel_trade(trade_data, "Invalid proposal price")
                return

            # Execute buy order with proposal
            buy_payload = {"buy": proposal_id, "price": ask_price}

            if not self.stream_handler.send_message(buy_payload):
                logger.error("Failed to send buy request")
                self._cancel_trade(trade_data, "Failed to send buy request")
                return

            # Update trade status
            trade_data["status"] = "buy_sent"
            trade_data["ask_price"] = ask_price
            trade_data["payout"] = payout

            logger.info(f"Buy order sent: {trade_data['trade_id']} - Price: {ask_price}")

        except Exception as e:
            logger.error(f"Error handling proposal response: {e}")
            logger.error(f"Proposal data received: {proposal_data}")

    def handle_buy_response(self, buy_data: Dict[str, Any]) -> None:
        """
        Handle buy response from Deriv API.

        Args:
            buy_data: Buy response data
        """
        try:
            # Check if this is a duplicate buy response
            transaction_id = buy_data.get("buy", {}).get("transaction_id")
            if transaction_id and hasattr(self, "_last_transaction_id") and transaction_id == self._last_transaction_id:
                logger.debug(f"Skipping duplicate buy response with transaction ID: {transaction_id}")
                return
            
            # Store this transaction ID to prevent duplicates
            self._last_transaction_id = transaction_id
            
            logger.info(f"Received buy response: {buy_data}")
            buy_info = buy_data.get("buy", {})
            contract_id = buy_info.get("contract_id")

            if not contract_id:
                logger.error("No contract ID in buy response")
                return

            # Find corresponding trade data
            trade_data = None
            for tid, data in self.active_contracts.items():
                if data.get("status") == "buy_sent":
                    trade_data = data
                    break

            if not trade_data:
                logger.warning("Received buy response for unknown trade")
                self._placing_trade = False  # Clear flag if trade not found
                logger.info(f"Unknown trade in buy response - unlocked")
                return

            # Enhanced error handling for buy response
            if not contract_id:
                logger.error("Rise/Fall contract error: No contract ID in buy response")
                self._cancel_trade(trade_data, "No contract ID in buy response")
                self._placing_trade = False  # Clear flag on error
                logger.info(f"No contract ID - unlocked")
                return

            # Check for buy errors in the response
            if "error" in buy_data:
                error_code = buy_data["error"].get("code")
                error_message = buy_data["error"].get("message")
                logger.error(f"Rise/Fall buy error {error_code}: {error_message}")
                self._cancel_trade(trade_data, f"Buy error {error_code}: {error_message}")
                self._placing_trade = False  # Clear flag on error
                logger.info(f"Buy error - unlocked")
                return

            # Update trade status
            trade_data["status"] = "active"
            trade_data["contract_id"] = contract_id
            trade_data["buy_time"] = time.time()
            
            # Store trade with contract_id as key (remove original trade_id entry)
            timestamp = time.time()
            
            # Remove original trade_id entry if it exists
            original_trade_id = trade_data.get("trade_id")
            if original_trade_id and original_trade_id in self.active_contracts:
                logger.info(f"Removing original trade_id entry: {original_trade_id}")
                del self.active_contracts[original_trade_id]
            
            # Store with contract_id as key
            self.active_contracts[contract_id] = trade_data
            logger.info(f"ADDING TRADE to active contracts: {contract_id} at {timestamp}")
            logger.info(f"Active contracts after addition: {list(self.active_contracts.keys())}")
            logger.info(f"Active contracts count: {len(self.active_contracts)}")
            
            # CRITICAL: Register trade with candlestick strategy for timing tracking
            if self.candlestick_strategy and hasattr(self.candlestick_strategy, 'register_trade'):
                try:
                    # Create signal data for timing tracking
                    signal_data = {
                        "trade_start_candle": trade_data.get("trade_start_candle", 0),
                        "expected_close_candle": trade_data.get("expected_close_candle", 0),
                        "type": trade_data.get("signal_type", ""),
                        "pattern": trade_data.get("pattern", ""),
                        "close_after_candles": trade_data.get("close_after_candles", 2)
                    }
                    self.candlestick_strategy.register_trade(contract_id, signal_data)
                    logger.info(f"Trade {contract_id} registered with candlestick strategy for timing")
                except Exception as e:
                    logger.error(f"Error registering trade with candlestick strategy: {e}")
            
            # CRITICAL: Clear the placing trade flag now that trade is in active_contracts
            self._placing_trade = False
            logger.info(f"Trade successfully added to active contracts - unlocked for next trade")
            
            # Get entry spot from current market price (this is the actual contract basis/entry price)
            # For Rise/Fall contracts, we use the current market price as the entry spot
            # Note: buy_price in the response is the stake amount, not the entry price
            from infrastructure.config import config as global_config
            entry_spot = self.stream_handler.get_latest_tick(global_config.symbol)
            if entry_spot:
                trade_data["entry_spot"] = entry_spot
                logger.info(f"Entry spot captured from current market price: {entry_spot} for contract {contract_id}")
            else:
                # Fallback to trade entry price if current price not available
                trade_data["entry_spot"] = trade_data.get("entry_price", 0)
                logger.warning(f"Current price not available, using trade entry price: {trade_data['entry_spot']}")
            
            # Store buy_price from API response for SL/TP calculations
            buy_price = buy_info.get("buy_price", 1)
            if buy_price > 0:
                trade_data["buy_price"] = buy_price
                logger.info(f"Buy price stored for SL/TP calculations: {buy_price} for contract {contract_id}")

            # Update balance from API response
            balance_after = buy_info.get("balance_after")
            if balance_after is not None:
                self.current_balance = balance_after
                logger.info(f"Balance updated from buy: {balance_after}")
                
                # Check if we're in demo mode
                from infrastructure.config import config
                demo_account = config.get("development.demo_account", False)
                
                if demo_account:
                    # In demo mode, don't update risk manager equity from demo balance
                    logger.info(f"Demo account: Received balance {balance_after:.2f} but preserving configured risk capital")
                    
                    # Update metrics with actual balance for display purposes
                    if self.metrics:
                        try:
                            self.metrics.update_equity(balance_after)
                            logger.info(f"Updated display equity for demo account: {balance_after:.2f}")
                        except Exception as e:
                            logger.error(f"Error updating equity metrics: {e}")
                else:
                    # In live mode, update risk manager's equity with real balance
                    if self.risk_manager and hasattr(self.risk_manager, 'update_equity'):
                        self.risk_manager.update_equity(balance_after)
                        logger.info(f"Risk manager equity updated: {balance_after}")

            # Fix contract lookup mismatch: re-key by contract_id for contract updates
            # Find the current key (trade_id) and move to contract_id key
            current_key = None
            for k, v in list(self.active_contracts.items()):
                if v is trade_data:
                    current_key = k
                    break

            if current_key and current_key != contract_id:
                # Move entry to use contract_id as key for contract updates
                self.active_contracts[contract_id] = self.active_contracts.pop(current_key)
            elif not current_key:
                logger.error("Rise/Fall contract error: Could not find trade data in active contracts")
                return

            logger.info(f"Trade executed: {trade_data['trade_id']} - Contract: {contract_id}")

            if self.metrics:
                try:
                    self.metrics.active_trades.set(len(self.active_contracts))
                except Exception:
                    pass

            # For Rise/Fall contracts, we don't need continuous subscriptions
            # We can check contract status later using proposal_open_contract without subscribe: 1
            # This reduces WebSocket traffic and improves performance

            # Call trade result callback if provided
            if trade_data.get("on_result"):
                trade_data["on_result"](trade_data, "executed")

        except Exception as e:
            logger.error(f"Error handling buy response: {e}")

    def handle_sell_response(self, sell_data: Dict[str, Any]) -> None:
        """
        Handle sell response from Deriv API.
        CRITICAL: This method is responsible for updating metrics after trade completion.

        Args:
            sell_data: Sell response data
        """
        try:
            logger.info(f"Received sell response: {sell_data}")
            sell_info = sell_data.get("sell", {})
            contract_id = sell_info.get("contract_id")
            sold_for = sell_info.get("sold_for", 0)
            transaction_id = sell_info.get("transaction_id")

            if not contract_id:
                logger.error("No contract ID in sell response")
                return

            # Find corresponding trade data with detailed debugging
            trade_data = None
            logger.info(f"=== SELL RESPONSE DEBUG ===")
            logger.info(f"Looking for contract {contract_id} (type: {type(contract_id)})")
            logger.info(f"Active contracts keys: {list(self.active_contracts.keys())}")
            logger.info(f"Active contracts count: {len(self.active_contracts)}")
            
            # Log all active contracts with their details
            for key, data in self.active_contracts.items():
                stored_contract_id = data.get("contract_id")
                logger.info(f"Active contract {key}: contract_id={stored_contract_id} (type: {type(stored_contract_id)}), status={data.get('status')}")
            
            # Try direct lookup by contract_id first
            if contract_id in self.active_contracts:
                trade_data = self.active_contracts[contract_id]
                logger.info(f"Found contract by direct lookup: {contract_id}")
            else:
                logger.info(f"Direct lookup failed for {contract_id}")
                # Fallback to searching by contract_id in trade data
                for tid, data in self.active_contracts.items():
                    stored_contract_id = data.get("contract_id")
                    logger.info(f"Checking contract {tid}: stored={stored_contract_id} (type: {type(stored_contract_id)}) == looking_for={contract_id} (type: {type(contract_id)})")
                    
                    # Try exact match first
                    if stored_contract_id == contract_id:
                        trade_data = data
                        logger.info(f"Found contract by exact match: {tid}")
                        break
                    
                    # Try string comparison
                    if str(stored_contract_id) == str(contract_id):
                        trade_data = data
                        logger.info(f"Found contract by string comparison: {tid}")
                        break
                    
                    # Try integer comparison
                    try:
                        if int(stored_contract_id) == int(contract_id):
                            trade_data = data
                            logger.info(f"Found contract by integer comparison: {tid}")
                            break
                    except (ValueError, TypeError) as e:
                        logger.info(f"Integer comparison failed: {e}")
                        pass

            if not trade_data:
                logger.warning(f"Received sell response for unknown contract {contract_id}")
                logger.debug(f"Active contracts: {self.active_contracts}")
                return
            
            # Check if trade is already marked as completed
            if trade_data.get("pending_closure"):
                timestamp = time.time()
                logger.info(f"Received sell response for already completed trade {contract_id} at {timestamp}")
                logger.info(f"Trade was marked as completed, but still processing closure for payout")
                # Still process the closure to update risk manager with actual payout

            # Update trade status
            trade_data["status"] = "closed"
            trade_data["sell_price"] = sold_for
            trade_data["sell_time"] = time.time()
            trade_data["transaction_id"] = transaction_id

            # Calculate final profit/loss
            stake = trade_data.get("stake", 0)
            profit = sold_for - stake
            trade_data["final_profit"] = profit
            trade_data["final_status"] = "win" if profit > 0 else "loss"

            # Update balance from API response
            balance_after = sell_info.get("balance_after")
            if balance_after is not None:
                self.current_balance = balance_after
                logger.info(f"Balance updated from sell: {balance_after}")
                
                # Check if we're in demo mode
                from infrastructure.config import config
                demo_account = config.get("development.demo_account", False)
                
                if demo_account:
                    # In demo mode, don't update risk manager equity from demo balance
                    logger.info(f"Demo account: Received balance {balance_after:.2f} but preserving configured risk capital")
                    
                    # Update metrics with actual balance for display purposes
                    if self.metrics:
                        try:
                            self.metrics.update_equity(balance_after)
                            logger.info(f"Updated display equity for demo account: {balance_after:.2f}")
                        except Exception as e:
                            logger.error(f"Error updating equity metrics: {e}")
                else:
                    # In live mode, don't update equity here - let close_trade() handle it
                    # to avoid double-counting the profit (balance_after already includes the profit,
                    # and close_trade() will add the profit again)
                    logger.info(f"Real account: Balance after trade is {balance_after:.2f}, equity will be updated by close_trade()")

            # Update risk manager with trade closure
            if self.risk_manager and hasattr(self.risk_manager, 'close_trade'):
                try:
                    # Get the original stake from trade data
                    stake = trade_data.get("stake", 0)
                    logger.info(f"Closing trade {contract_id}: stake={stake}, sold_for={sold_for}")
                    
                    # Get the trade_id for closure
                    closure_trade_id = trade_data.get("trade_id", contract_id)
                    logger.info(f"Attempting to close trade: trade_id={closure_trade_id}, contract_id={contract_id}")
                    logger.info(f"Available open trades: {list(self.risk_manager.open_trades.keys())}")
                    logger.info(f"Trade data keys: {list(trade_data.keys())}")
                    
                    # Check if trade is already in risk manager's open trades
                    if closure_trade_id in self.risk_manager.open_trades:
                        # Call risk manager close_trade method
                        # Get closure reason from trade data
                        closure_reason = trade_data.get("close_reason", trade_data.get("early_close_reason", ""))
                        trade_result = self.risk_manager.close_trade(
                            trade_id=closure_trade_id,
                            exit_price=sold_for,
                            timestamp=int(time.time()),
                            closure_reason=closure_reason
                        )
                        logger.info(f"Risk manager updated with trade closure: {trade_result}")
                        logger.info(f"Risk manager total_profit: {self.risk_manager.total_profit}")
                        
                        # Update metrics after risk manager close_trade
                        if self.metrics:
                            try:
                                self.metrics.update_profit_loss(self.risk_manager.total_profit)
                                total_trades = self.risk_manager.total_wins + self.risk_manager.total_losses
                                win_rate = 0.0
                                if total_trades > 0:
                                    win_rate = (self.risk_manager.total_wins / total_trades) * 100
                                    self.metrics.update_win_rate(win_rate)
                                logger.info(f"Updated metrics after risk manager close_trade: profit={self.risk_manager.total_profit}, win_rate={win_rate}%")
                            except Exception as e:
                                logger.error(f"Error updating metrics after risk manager close_trade: {e}")
                    else:
                        # Trade not in risk manager, update profit directly
                        profit = sold_for - stake
                        self.risk_manager.total_profit += profit
                        if profit > 0:
                            self.risk_manager.total_wins += 1
                        else:
                            self.risk_manager.total_losses += 1
                        logger.info(f"Updated risk manager directly: profit={profit}, total_profit={self.risk_manager.total_profit}")
                        
                        # Update metrics immediately after manual risk manager update
                        if self.metrics:
                            try:
                                self.metrics.update_profit_loss(self.risk_manager.total_profit)
                                total_trades = self.risk_manager.total_wins + self.risk_manager.total_losses
                                win_rate = 0.0
                                if total_trades > 0:
                                    win_rate = (self.risk_manager.total_wins / total_trades) * 100
                                    self.metrics.update_win_rate(win_rate)
                                logger.info(f"Updated metrics after manual risk manager update: profit={self.risk_manager.total_profit}, win_rate={win_rate}%")
                            except Exception as e:
                                logger.error(f"Error updating metrics after manual risk manager update: {e}")
                except Exception as e:
                    logger.error(f"Error updating risk manager with trade closure: {e}")
                    
                    # Fallback: Update metrics even if risk manager fails
                    if self.metrics:
                        try:
                            # Calculate profit from the trade data
                            stake = trade_data.get("stake", 0)
                            profit = sold_for - stake
                            logger.info(f"Fallback metrics update: profit={profit}")
                            
                            # Update metrics with calculated profit
                            current_profit = getattr(self.risk_manager, 'total_profit', 0) + profit
                            self.metrics.update_profit_loss(current_profit)
                            
                            # Update win rate if we have trade counts
                            total_wins = getattr(self.risk_manager, 'total_wins', 0)
                            total_losses = getattr(self.risk_manager, 'total_losses', 0)
                            if profit > 0:
                                total_wins += 1
                            else:
                                total_losses += 1
                                
                            total_trades = total_wins + total_losses
                            win_rate = 0.0
                            if total_trades > 0:
                                win_rate = (total_wins / total_trades) * 100
                                self.metrics.update_win_rate(win_rate)
                                
                            logger.info(f"Fallback metrics updated: profit={current_profit}, win_rate={win_rate}%")
                        except Exception as metrics_error:
                            logger.error(f"Error in fallback metrics update: {metrics_error}")

            logger.info(f"Trade closed successfully: Contract {contract_id} - Sold for: {sold_for}, Profit: {profit:.2f}")

            # Call trade result callback if provided
            if trade_data.get("on_result"):
                trade_data["on_result"](trade_data, "closed")

            # Remove from active contracts using the correct key
            # Find the trade by contract_id and remove using the original trade_id key
            trade_id_to_remove = None
            for tid, data in self.active_contracts.items():
                if data.get("contract_id") == contract_id:
                    trade_id_to_remove = tid
                    break
            
            if trade_id_to_remove:
                timestamp = time.time()
                logger.info(f"REMOVING TRADE from active contracts (normal closure): {trade_id_to_remove} (contract_id: {contract_id}) at {timestamp}")
                logger.info(f"Active contracts before removal: {list(self.active_contracts.keys())}")
                
                # CRITICAL: Unregister trade from candlestick strategy
                if self.candlestick_strategy and hasattr(self.candlestick_strategy, 'unregister_trade'):
                    try:
                        self.candlestick_strategy.unregister_trade(contract_id)
                        logger.info(f"Trade {contract_id} unregistered from candlestick strategy")
                    except Exception as e:
                        logger.error(f"Error unregistering trade from candlestick strategy: {e}")
                
                del self.active_contracts[trade_id_to_remove]
                logger.info(f"Active contracts after removal: {list(self.active_contracts.keys())}")
                logger.info(f"Active contracts count after removal: {len(self.active_contracts)}")
                
                # CRITICAL FIX: Force update active trades metric immediately after removal
                if hasattr(self, 'metrics') and self.metrics:
                    active_count = len(self.active_contracts)
                    self.metrics.update_active_trades(active_count)
                    logger.info(f"FORCE UPDATED active trades metric: {active_count}")
                
                #  NEW: Check for pending reversal and execute it
                logger.info("Reversal strategy disabled - using enhanced pattern detection only")
            else:
                logger.warning(f"Could not find trade with contract_id {contract_id} to remove")

            # Update trade status in database
            if self.data_recorder:
                try:
                    self.data_recorder.update_trade_status(contract_id, "closed", exit_price=sold_for, profit=profit)
                    logger.info(f"Trade marked as closed in database: {contract_id}")
                    
                    # Record database operation metric
                    if self.metrics:
                        try:
                            self.metrics.record_database_operation("trade_closed")
                        except Exception:
                            pass
                except Exception as e:
                    logger.error(f"Error updating trade status in database: {e}")

            # Metrics
            if self.metrics:
                try:
                    result_label = "win" if profit > 0 else "loss"
                    self.metrics.record_trade(
                        action=trade_data.get("signal_type", "unknown"),
                        result=result_label,
                        profit=abs(profit),
                    )
                    self.metrics.active_trades.set(len(self.active_contracts))
                except Exception:
                    pass

        except Exception as e:
            logger.error(f"Error handling sell response: {e}")

    def handle_sell_error(self, error_data: Dict[str, Any]) -> None:
        """
        Handle sell error response from Deriv API.

        Args:
            error_data: Error response data
        """
        try:
            error_code = error_data.get("code", "Unknown")
            error_message = error_data.get("message", "Unknown error")
            
            logger.warning(f"Sell error received: {error_code} - {error_message}")
            
            # Handle specific error types
            if error_code == "InvalidOfferings":
                # Mark contracts as non-resellable to prevent further attempts
                logger.info("Contract resale not offered - marking as non-resellable")
                # We can't identify the specific contract from the error, so we'll handle this
                # in the _execute_sell method by tracking failed attempts
                
        except Exception as e:
            logger.error(f"Error handling sell error: {e}")

    def handle_contract_update(self, contract_data: Dict[str, Any]) -> None:
        """
        Handle contract update from Deriv API.
        CRITICAL: This method updates contract status in real-time.
        """
        try:
            contract_id = contract_data.get("contract_id")
            if not contract_id:
                logger.warning(f"Contract update missing contract_id: {contract_data}")
                return
                
            # Check if this is a completed contract - we should process even if not in active_contracts
            status = contract_data.get("status", "open")
            is_sold = contract_data.get("is_sold", False)
            is_expired = contract_data.get("is_expired", False)
            is_completed = status in ["won", "lost", "sold"] or is_sold or is_expired
            
            if contract_id not in self.active_contracts:
                if is_completed:
                    logger.warning(f"Received completion update for unknown contract {contract_id}, status={status}")
                    # Process anyway, since it might have been removed already but metrics need updating
                    self._process_contract_completion(contract_id, contract_data)
                return

            trade_data = self.active_contracts[contract_id]

            # Extract key info
            profit = contract_data.get("profit", 0)
            sell_price = contract_data.get("sell_price", 0)
            is_sell_available = contract_data.get("is_sell_available", False)
            entry_tick = contract_data.get("entry_tick", 0)
            exit_tick = contract_data.get("exit_tick", 0)
            
            # Extract symbol from shortcode if available
            shortcode = contract_data.get("shortcode", "")
            if shortcode and not trade_data.get("symbol"):
                extracted_symbol = self._extract_symbol_from_shortcode(shortcode)
                if extracted_symbol != "unknown":
                    trade_data["symbol"] = extracted_symbol
                    logger.info(f"Extracted symbol from shortcode: {extracted_symbol}")
            
            # Detect inverted symbol for profit calculations
            symbol = trade_data.get("symbol", "")
            is_inverted_symbol = self._is_inverted_symbol(symbol)
            
            # Store more data for accurate status tracking
            trade_data.update({
                "profit": profit,
                "is_sell_available": is_sell_available,
                "sell_price": sell_price,
                "last_update": time.time(),
                "entry_tick": entry_tick,
                "exit_tick": exit_tick,
                "contract_status": status
            })

            logger.info(
                f"Contract update: {contract_id} | status={status} "
                f"profit={profit} sell_available={is_sell_available} sold={is_sold} expired={is_expired}"
            )

            #  Detect contract completion (Deriv sends is_sold/is_expired instead of status)
            if is_completed:
                logger.info(f"Contract {contract_id} completed: status={status}, profit={profit:.2f}")
                self._handle_contract_completion(contract_id, contract_data, trade_data)
                return

            # Handle force_closing contracts that are still open
            # If we marked a contract as force_closing but it's still open on the API, try to sell it
            if trade_data.get("status") == "force_closing" and status == "open":
                if is_sell_available:
                    logger.info(f"Force-closing contract {contract_id} is still open, attempting to sell")
                    self._execute_sell(contract_id, reason="force_completion_sell")
                else:
                    logger.warning(f"Force-closing contract {contract_id} is still open but not sellable, waiting for expiration")

            # Optional: auto-sell logic if take-profit or stop-loss reached
            stake = trade_data.get("stake", 0)
            if self.early_closure_enabled and is_sell_available and stake > 0:
                # Use fixed dollar amounts if configured, otherwise use percentages
                if self.fixed_take_profit:
                    take_profit_target = self.fixed_take_profit
                else:
                    take_profit_target = stake * self.take_profit_pct
                    
                if self.fixed_stop_loss:
                    stop_loss_target = -self.fixed_stop_loss
                else:
                    stop_loss_target = -stake * self.stop_loss_pct
                
                if profit >= take_profit_target:
                    self._execute_sell(contract_id, reason=f"take_profit_hit_${profit:.2f}")
                elif profit <= stop_loss_target:
                    self._execute_sell(contract_id, reason=f"stop_loss_hit_${abs(profit):.2f}")
                    
            # Ensure we get regular updates by subscribing to the contract
            if trade_data.get("subscribe_sent") != True:
                self._subscribe_to_contract_updates(contract_id)
                trade_data["subscribe_sent"] = True

        except Exception as e:
            logger.error(f"Error handling contract update: {e}")

    def _can_sell_early(self, contract_data: Dict[str, Any]) -> bool:
        """Check if a contract can be sold early (Rise/Fall optimized)."""
        try:
            # For Rise/Fall contracts, early closure is always possible
            # Check if we haven't exceeded sell attempts for this contract
            contract_id = contract_data.get("contract_id")
            if not contract_id:
                return False

            if contract_id in self._non_resellable_contracts:
                return False

            sell_attempts = self._sell_attempts.get(contract_id, 0)
            return sell_attempts < 3  # Allow up to 3 attempts

        except Exception as e:
            logger.error(f"Error checking if contract can be sold early: {e}")
            return False

    def _execute_sell(self, contract_id: str, reason: str = "manual") -> None:
        """Attempt to sell an active contract early - DOES NOT remove from active_contracts until sell response."""
        try:
            logger.info(f"Executing sell for {contract_id} (reason={reason})")

            if contract_id in self._non_resellable_contracts:
                logger.debug(f"Skipping sell for {contract_id} - resale not offered")
                return

            now = time.time()
            # Skip cooldown for profit protection closures (they're successful profit-taking)
            if "profit_protection" not in reason.lower() and now - self._last_sell_attempt.get(contract_id, 0) < 10:
                logger.debug(f"Sell cooldown active for {contract_id}")
                return

            # Throttle attempts
            self._sell_attempts[contract_id] = self._sell_attempts.get(contract_id, 0) + 1
            self._last_sell_attempt[contract_id] = now
            if self._sell_attempts[contract_id] > 2:
                self._non_resellable_contracts.add(contract_id)
                logger.warning(f"Marked {contract_id} as non-resellable after multiple failures")
                return

            sell_payload = {"sell": int(contract_id), "price": 0}
            logger.info(f"Sending sell payload: {sell_payload}")

            if not self.stream_handler.send_message(sell_payload):
                logger.warning(f"Failed to send sell request for {contract_id}")
                return

            # Mark contract as "closing" but KEEP it in active_contracts
            # It will be removed when sell response arrives in handle_sell_response
            if contract_id in self.active_contracts:
                self.active_contracts[contract_id]["status"] = "closing"
                self.active_contracts[contract_id]["close_requested_time"] = now
                self.active_contracts[contract_id]["close_reason"] = reason  # Store closure reason
                logger.info(f"Contract {contract_id} marked as CLOSING (kept in active_contracts for sell response)")

            if self.data_recorder:
                self.data_recorder.update_trade_status(contract_id, "closing")

            if self.metrics:
                self.metrics.record_database_operation("trade_sell")

        except Exception as e:
            logger.error(f"Error executing sell for {contract_id}: {e}")

    def _check_contract_sellability(self, contract_id: str) -> Optional[Dict[str, Any]]:
        """
        Check if a contract is sellable using proposal_open_contract.
        
        Args:
            contract_id: Contract ID to check
            
        Returns:
            Contract status data if available, None otherwise
        """
        try:
            # Convert contract_id to integer if it's a string
            try:
                if isinstance(contract_id, str):
                    contract_id_int = int(contract_id)
                else:
                    contract_id_int = contract_id  # pyright: ignore[reportUnreachable]
            except (ValueError, TypeError):
                logger.error(f"Invalid contract_id format: {contract_id} (expected integer)")
                return {"is_sell_available": False, "sell_price": 0}

            # Send proposal_open_contract request to check sellability
            status_payload = {
                "proposal_open_contract": 1,
                "contract_id": contract_id_int
            }
            
            if not self.stream_handler.send_message(status_payload):
                logger.error(f"Failed to send contract status request for {contract_id}")
                return None
                
            # Note: The response will be handled by handle_contract_update
            # For now, we'll return a placeholder - in a real implementation,
            # you'd need to wait for the response or use a synchronous approach
            return {"is_sell_available": True, "sell_price": 0}  # Placeholder
            
        except Exception as e:
            logger.error(f"Error checking contract sellability: {e}")
            return None

    def _subscribe_to_contract_updates(self, contract_id: str) -> None:
        """Subscribe to regular contract updates."""
        try:
            logger.info(f"Subscribing to updates for contract {contract_id}")
            # First unsubscribe to avoid duplicate subscriptions
            self.stream_handler.send_message({
                "forget_all": ["proposal_open_contract"],
                "passthrough": {"contract_id": contract_id}
            })
            
            # Then create a fresh subscription
            self.stream_handler.send_message({
                "proposal_open_contract": 1,
                "contract_id": contract_id,
                "subscribe": 1
            })
            
            logger.info(f"Subscribed to contract {contract_id} for updates")
        except Exception as e:
            logger.error(f"Error subscribing to contract updates: {e}")
            
    def _process_contract_completion(self, contract_id: str, contract_data: Dict[str, Any]) -> None:
        """Process completion of a contract that was already removed from active_contracts."""
        try:
            # Extract the key information we need
            profit = contract_data.get("profit", 0)
            status = contract_data.get("status", "completed")
            buy_price = contract_data.get("buy_price", 0)
            sell_price = contract_data.get("sell_price", 0)
            
            logger.info(f"Processing completion for removed contract {contract_id}: status={status}, profit={profit:.2f}")
            
            # We don't have trade_data anymore, so update metrics directly
            if self.risk_manager:
                # Update risk manager
                self.risk_manager.total_profit += profit
                if profit > 0:
                    self.risk_manager.total_wins += 1
                    logger.info(f"WIN recorded for contract {contract_id}: +${profit:.2f}")
                else:
                    self.risk_manager.total_losses += 1
                    logger.info(f"LOSS recorded for contract {contract_id}: -${abs(profit):.2f}")
                    
                # Update metrics via risk manager
                if self.metrics:
                    self.metrics.update_profit_loss(self.risk_manager.total_profit)
                    total_trades = self.risk_manager.total_wins + self.risk_manager.total_losses
                    win_rate = 0.0
                    if total_trades > 0:
                        win_rate = (self.risk_manager.total_wins / total_trades) * 100
                        self.metrics.update_win_rate(win_rate)
                    logger.info(f"Updated metrics for completed contract: profit={self.risk_manager.total_profit}, win_rate={win_rate}%")
            
        except Exception as e:
            logger.error(f"Error processing contract completion: {e}")
            
    def _handle_contract_completion(self, contract_id: str, contract_data: Dict[str, Any], trade_data: Dict[str, Any]) -> None:
        """Handle contract completion and cleanup."""
        try:
            profit = contract_data.get("profit", 0)
            status = contract_data.get("status", "completed")
            buy_price = trade_data.get("stake", contract_data.get("buy_price", 0))
            sell_price = contract_data.get("sell_price", 0)
            
            # Check if the contract was actually won or lost by the status
            is_win = status == "won" or profit > 0
            result_label = "win" if is_win else "loss"

            trade_data.update({
                "status": "completed",
                "final_profit": profit,
                "final_status": status,
                "completion_time": time.time(),
                "result": result_label
            })

            logger.info(f"Contract {contract_id} completed: status={status}, profit={profit:.2f}, result={result_label}")

            if trade_data.get("on_result"):
                trade_data["on_result"](trade_data, "completed")

            # Clean up
            self.active_contracts.pop(contract_id, None)
            
            # CRITICAL FIX: Force update active trades metric immediately after removal
            if hasattr(self, 'metrics') and self.metrics:
                active_count = len(self.active_contracts)
                self.metrics.update_active_trades(active_count)
                logger.info(f"FORCE UPDATED active trades metric after contract completion: {active_count}")

            if self.data_recorder:
                self.data_recorder.update_trade_status(contract_id, "closed", exit_price=sell_price, profit=profit)

            # Update risk manager
            if self.risk_manager and hasattr(self.risk_manager, 'close_trade'):
                trade_id = trade_data.get("trade_id", contract_id)
                
                if trade_id in self.risk_manager.open_trades:
                    # Use risk manager's close_trade method
                    # Get closure reason from trade data
                    closure_reason = trade_data.get("close_reason", trade_data.get("early_close_reason", ""))
                    trade_result = self.risk_manager.close_trade(
                        trade_id,
                        exit_price=sell_price,
                        timestamp=int(time.time()),
                        closure_reason=closure_reason
                    )
                    logger.info(f"Risk manager total_profit: {self.risk_manager.total_profit}")
                    
                    # Update metrics via risk manager
                    if self.metrics:
                        self.metrics.update_profit_loss(self.risk_manager.total_profit)
                        total_trades = self.risk_manager.total_wins + self.risk_manager.total_losses
                        win_rate = 0.0
                        if total_trades > 0:
                            win_rate = (self.risk_manager.total_wins / total_trades) * 100
                            self.metrics.update_win_rate(win_rate)
                        logger.info(f"Updated metrics after risk manager close_trade: profit={self.risk_manager.total_profit}, win_rate={win_rate}%")
                else:
                    # Directly update risk manager values
                    self.risk_manager.total_profit += profit
                    if is_win:
                        self.risk_manager.total_wins += 1
                        logger.info(f"WIN recorded for contract {contract_id}: +${profit:.2f}")
                    else:
                        self.risk_manager.total_losses += 1
                        logger.info(f"LOSS recorded for contract {contract_id}: -${abs(profit):.2f}")
                    
                    # Update metrics directly
                    if self.metrics:
                        self.metrics.update_profit_loss(self.risk_manager.total_profit)
                        total_trades = self.risk_manager.total_wins + self.risk_manager.total_losses
                        win_rate = 0.0
                        if total_trades > 0:
                            win_rate = (self.risk_manager.total_wins / total_trades) * 100
                            self.metrics.update_win_rate(win_rate)
                        logger.info(f"Updated metrics after manual risk manager update: profit={self.risk_manager.total_profit}, win_rate={win_rate}%")

            if self.metrics:
                self.metrics.record_trade(
                    action=trade_data.get("signal_type", "unknown"),
                    result=result_label,
                    profit=abs(profit)
                )
                self.metrics.active_trades.set(len(self.active_contracts))
                logger.info(f"Metrics updated: Active trades={len(self.active_contracts)}")

        except Exception as e:
            logger.error(f"Error finalizing contract {contract_id}: {e}")

    def _cancel_trade(self, trade_data: Dict[str, Any], reason: str) -> None:
        """Cancel a pending trade and clean up safely."""
        try:
            trade_data["status"] = "cancelled"
            trade_data["cancel_reason"] = reason
            trade_data["cancel_time"] = time.time()
            logger.warning(f"Cancelled trade {trade_data.get('trade_id')} due to: {reason}")

            proposal_id = trade_data.get("proposal_id")
            if proposal_id and proposal_id in self.pending_proposals:
                del self.pending_proposals[proposal_id]

            if trade_data.get("on_result"):
                trade_data["on_result"](trade_data, "cancelled")

        except Exception as e:
            logger.error(f"Error cancelling trade: {e}")


    def _clear_stuck_contracts(self) -> None:
        """Clear any stuck contracts from previous sessions that may prevent new trading."""
        if self.active_contracts:
            logger.warning(f"Clearing {len(self.active_contracts)} stuck contracts from previous session")
            # Clear all active contracts that may be stuck
            self.active_contracts.clear()
            logger.info("Stuck contracts cleared - ready for new trading session")
        else:
            logger.debug("No stuck contracts found")

    
    def _check_expired_contracts(self):
        """Check for contracts that should have expired and force completion."""
        try:
            current_time = time.time()
            expired_contracts = []
            
            for contract_id, contract_data in self.active_contracts.items():
                # Check if contract has been active too long (contract_duration + 1 minute buffer)
                buy_time = contract_data.get("buy_time")
                if buy_time:
                    elapsed_time = current_time - buy_time
                    contract_duration_seconds = self.contract_duration * 60  # Convert minutes to seconds
                    max_elapsed_time = contract_duration_seconds + 60  # Add 1 minute buffer
                    
                    if elapsed_time > max_elapsed_time:
                        logger.warning(f"Contract {contract_id} has been active for {elapsed_time:.1f}s, should have expired")
                        expired_contracts.append(contract_id)
            
            # Force completion of expired contracts
            for contract_id in expired_contracts:
                logger.warning(f"Force completing expired contract {contract_id}")
                self._force_contract_completion(contract_id, "expired")
                
        except Exception as e:
            logger.error(f"Error checking expired contracts: {e}")

    def _force_contract_completion(self, contract_id: str, reason: str):
        """Force completion of a contract that should have expired."""
        try:
            if contract_id not in self.active_contracts:
                logger.warning(f"Cannot force complete unknown contract {contract_id}")
                return
                
            contract_data = self.active_contracts[contract_id]
            
            # NEW APPROACH: First check the actual contract status from API
            # This avoids trying to sell contracts that are already expired/completed on the API side
            logger.info(f"Contract {contract_id} appears expired ({reason}), checking API status...")
            
            # Request the current contract status (without subscribe to reduce overhead)
            self.stream_handler.send_message({
                "proposal_open_contract": 1,
                "contract_id": int(contract_id)
            })
            
            # Mark as force_closing while we wait for status update
            contract_data["status"] = "force_closing"
            contract_data["expiration_reason"] = reason
            contract_data["force_completion_time"] = time.time()
            contract_data["pending_closure"] = True
            contract_data["force_completed"] = True
            
            logger.info(f"Contract {contract_id} marked as FORCE_CLOSING, waiting for API status")
            logger.info(f"Active contracts during force completion: {list(self.active_contracts.keys())}")
            
            # NOTE: We DO NOT try to sell the contract here anymore
            # Instead, we wait for the API to send us the contract status via handle_contract_update
            # If the contract is still open, we'll sell it there
            # If it's already closed, handle_contract_update will process the completion
            
        except Exception as e:
            logger.error(f"Error force completing contract {contract_id}: {e}")

    def check_contract_status(self, contract_id: str) -> Optional[Dict[str, Any]]:
        """
        Check the status of a specific contract (Rise/Fall optimized).

        Args:
            contract_id: Contract ID to check

        Returns:
            Contract status data if found, None otherwise
        """
        try:
            # Convert contract_id to integer if it's a string
            try:
                if isinstance(contract_id, str):
                    contract_id_int = int(contract_id)
                else:
                    contract_id_int = contract_id
            except (ValueError, TypeError):
                logger.error(f"Invalid contract_id format: {contract_id} (expected integer)")
                return {"is_sell_available": False, "sell_price": 0}

            # Send proposal_open_contract request without subscription for efficient checking
            status_payload = {
                "proposal_open_contract": 1,
                "contract_id": contract_id_int
            }

            # This will be handled by the stream handler and routed back to handle_contract_update
            if not self.stream_handler.send_message(status_payload):
                logger.error(f"Failed to send contract status request for {contract_id}")
                return None

            return self.active_contracts.get(contract_id)
        except Exception as e:
            logger.error(f"Error checking contract status: {e}")
            return None


    def should_close_early(self, contract_data: Dict[str, Any], ticks_received: int = 0) -> tuple[bool, str]:
        """
        Check if contract should be closed early based on candlestick timing or tick-based SL/TP system.

        CRITICAL: Prioritizes candlestick timing over aggressive early closure
        - First checks candlestick strategy timing (close after second candlestick)
        - Falls back to tick-based SL/TP only if candlestick timing allows

        Args:
            contract_data: Contract data from active_contracts
            ticks_received: Number of ticks received since trade entry

        Returns:
            Tuple of (should_close, reason)
        """
        try:
            contract_id = contract_data.get("contract_id")
            if not contract_id:
                return False, "No contract ID"

            # CRITICAL: Check profit protection FIRST (highest priority)
            if self.early_closure_enabled:
                # Check profit protection before candlestick timing
                stake = contract_data.get("stake", 0)
                if stake > 0:
                    try:
                        # Get current price and contract details
                        from infrastructure.config import config as global_config
                        current_price = self.stream_handler.get_latest_tick(global_config.symbol)
                        if current_price:
                            # Check profit protection logic
                            should_close_profit, reason_profit = self._check_profit_protection(contract_data, current_price)
                            if should_close_profit:
                                logger.info(f"PROFIT PROTECTION: Closing trade {contract_id} - {reason_profit}")
                                return True, f"profit_protection: {reason_profit}"
                            
                            # Check dynamic stop loss (profit drops to zero)
                            should_close_dynamic, reason_dynamic = self._check_dynamic_stop_loss(contract_data, current_price)
                            if should_close_dynamic:
                                logger.info(f"DYNAMIC STOP LOSS: Closing trade {contract_id} - {reason_dynamic}")
                                return True, f"dynamic_stop_loss: {reason_dynamic}"
                            
                            # NEW: Enhanced Pattern Detection for Early Closure
                            should_close_pattern, reason_pattern = self._check_pattern_based_closure(contract_data, current_price)
                            if should_close_pattern:
                                logger.info(f"PATTERN DETECTION: Closing trade {contract_id} - {reason_pattern}")
                                return True, f"pattern_detection: {reason_pattern}"
                    except Exception as e:
                        logger.error(f"Error checking profit protection: {e}")

            # SECOND: Check candlestick timing (after profit protection)
            logger.debug(f"DEBUG: use_candlestick_timing={self.use_candlestick_timing}, candlestick_strategy={self.candlestick_strategy}")
            if self.use_candlestick_timing and self.candlestick_strategy:
                try:
                    logger.debug(f"DEBUG: Checking candlestick timing for trade {contract_id}")
                    should_close, reason = self.candlestick_strategy.should_close_trade(contract_id)
                    logger.debug(f"DEBUG: Candlestick timing result for {contract_id}: should_close={should_close}, reason={reason}")
                    if should_close:
                        logger.info(f"CANDLESTICK TIMING: Closing trade {contract_id} - {reason}")
                        return True, f"candlestick_timing: {reason}"
                except Exception as e:
                    logger.error(f"Error checking candlestick timing: {e}")
            else:
                logger.debug(f"DEBUG: Skipping candlestick timing check - use_candlestick_timing={self.use_candlestick_timing}, candlestick_strategy={self.candlestick_strategy}")

            # THIRD: Check other early closure settings
            if not self.early_closure_enabled:
                return False, "Early closure disabled"

            stake = contract_data.get("stake", 0)
            if stake <= 0:
                return False, "Invalid stake amount"

            # Get contract age and REAL profit/loss from Deriv API
            contract_age = time.time() - contract_data.get("buy_time", 0)
            
            # Use REAL profit data from Deriv API instead of calculating from price movements
            real_profit = contract_data.get("profit")
            if real_profit is not None:
                pnl_dollars = float(real_profit)
                logger.debug(f"Using REAL profit data: ${pnl_dollars:.2f} for contract {contract_id}")
            else:
                # Fallback: If no real profit data yet, don't close early
                logger.debug(f"No real profit data available for contract {contract_id}, skipping early closure check")
                return False, "No real profit data available yet"
            
            # NEW LOGIC: Hold trades for 3 minutes before deciding to close
            min_hold_time = 180  # 3 minutes in seconds
            
            if contract_age < min_hold_time:
                # Within 3 minutes - only close if loss >= $4.00
                if pnl_dollars <= -4.0:
                    return True, f"Stop loss triggered: ${pnl_dollars:.2f} loss (within {min_hold_time/60:.0f}min hold period)"
                else:
                    return False, f"Holding trade: ${pnl_dollars:.2f} P&L (within {min_hold_time/60:.0f}min hold period)"
            else:
                # After 3 minutes - close if positive or loss >= $4.00
                if pnl_dollars >= 0:
                    return True, f"Take profit after {min_hold_time/60:.0f}min hold: ${pnl_dollars:.2f} profit"
                elif pnl_dollars <= -4.0:
                    return True, f"Stop loss triggered: ${pnl_dollars:.2f} loss"
                else:
                    return False, f"Holding trade: ${pnl_dollars:.2f} P&L (after {min_hold_time/60:.0f}min hold period)"

            # Enhanced pattern detection only - no MACD-based closure needed

            # Simplified closure logic for enhanced pattern detection
            # Use only dynamic stop loss and candlestick timing
            return False, "Enhanced pattern detection - no complex SL/TP needed"
            
        except Exception as e:
            logger.error(f"Error checking early closure conditions: {e}")
            return False, f"Error: {e}"

    def _check_profit_protection(self, contract_data: Dict[str, Any], current_price: float) -> tuple[bool, str]:
        """
        Check profit protection logic - extracted from should_close_early for priority handling.
        
        Args:
            contract_data: Contract data from active_contracts
            current_price: Current market price
            
        Returns:
            Tuple of (should_close, reason)
        """
        try:
            contract_id = contract_data.get("contract_id")
            signal_type = contract_data.get("signal_type", "BUY")
            contract_type = contract_data.get("contract_type", "")
            
            # Get profit protection data
            profit_protection = contract_data.get("profit_protection", {})
            if not profit_protection:
                profit_protection = {
                    "was_profitable": False,
                    "negative_ticks": 0,
                    "max_profit_pct": 0.0,
                    "max_profit_ticks": 0,
                    "locked_entry_spot": None
                }
                contract_data["profit_protection"] = profit_protection
            
            # Get entry spot and tick size - FIXED: Use proper entry price
            entry_price = contract_data.get("entry_price", contract_data.get("entry_spot", 0))
            if entry_price <= 0:
                logger.warning(f"No valid entry price for contract {contract_id}: {entry_price}")
                return False, "No valid entry price"
            
            from infrastructure.config import config as global_config
            tick_size = calculate_tick_size_for_symbol(global_config.symbol)
            if tick_size <= 0:
                logger.warning(f"Invalid tick size: {tick_size}")
                return False, "Invalid tick size"
            
            # Calculate ticks moved from entry spot
            price_difference = current_price - entry_price
            
            # Detect inverted symbols (R_ indices) - same logic as barrier calculation
            symbol = contract_data.get("symbol", "")
            is_inverted_symbol = self._is_inverted_symbol(symbol)
            
            # FIXED: Proper contract type and signal type handling
            is_call_trade = (contract_type == "CALL" or signal_type in ["BUY", "RISE"])
            is_put_trade = (contract_type == "PUT" or signal_type in ["SELL", "FALL"])
            
            if is_call_trade:
                # Apply correct profit direction based on inversion (same logic as barrier calculation)
                if is_inverted_symbol:
                    # INVERTED LOGIC for R_ symbols: CALL profits when price goes DOWN
                    ticks_up = -price_difference / tick_size  # Negative diff = profit
                else:
                    # NORMAL LOGIC for other symbols: CALL profits when price goes UP
                    ticks_up = price_difference / tick_size   # Positive diff = profit
                
                # DYNAMIC ENTRY SPOT ADJUSTMENT - Lock in profits
                if ticks_up > 0:
                    # Trade is profitable - adjust entry spot to lock in profits
                    profit_ticks = ticks_up
                    
                    # Calculate new "virtual" entry spot that ensures P&L >= 0
                    profit_lock_percentage = global_config.get("trading.profit_lock_percentage", 0.3)
                    new_virtual_entry = current_price - (profit_ticks * tick_size * profit_lock_percentage)
                    
                    # Update profit protection tracking
                    if not profit_protection["was_profitable"]:
                        profit_protection["was_profitable"] = True
                        profit_protection["negative_ticks"] = 0
                        profit_protection["max_profit_ticks"] = 0
                        profit_protection["locked_entry_spot"] = entry_price
                        logger.info(f"PROFIT PROTECTION: Trade {contract_id} became profitable ({profit_ticks:.1f} ticks)")
                    
                    # Track maximum profit achieved
                    profit_protection["max_profit_ticks"] = max(profit_protection["max_profit_ticks"], profit_ticks)
                    profit_protection["max_profit_pct"] = max(profit_protection["max_profit_pct"], ticks_up * tick_size / entry_price)
                    
                    # Adjust locked entry spot to protect profits
                    profit_lock_threshold = global_config.get("trading.profit_lock_threshold", 3)
                    
                    if profit_ticks >= profit_lock_threshold:  # If we're at threshold ticks in profit
                        # Move entry spot up to lock in percentage of profits
                        profit_protection["locked_entry_spot"] = new_virtual_entry
                        logger.info(f"PROFIT LOCK: Adjusted entry spot to {new_virtual_entry:.5f} (locked {profit_ticks*profit_lock_percentage:.1f} ticks profit)")
                    
                elif profit_protection["was_profitable"]:
                    # Was profitable, now negative - check if we're still above locked entry
                    locked_entry = profit_protection.get("locked_entry_spot", entry_price)
                    current_profit_ticks = (current_price - locked_entry) / tick_size
                    
                    if current_profit_ticks < 0:
                        # We're now below the locked entry - close to protect profits
                        logger.info(f"PROFIT PROTECTION: Closing {contract_id} - below locked entry {locked_entry:.5f}")
                        # Start cooldown period to prevent immediate new trades
                        self.start_profit_protection_cooldown()
                        return True, f"Below locked entry spot {locked_entry:.5f} (protecting {profit_protection['max_profit_ticks']:.1f} ticks profit)"
                    else:
                        # Still profitable relative to locked entry
                        profit_protection["negative_ticks"] += 1
                        if profit_protection["negative_ticks"] >= 10:
                            logger.info(f"PROFIT PROTECTION: Closing {contract_id} - was profitable, now negative for 10+ ticks")
                            # Start cooldown period to prevent immediate new trades
                            self.start_profit_protection_cooldown()
                            return True, f"Was profitable ({profit_protection['max_profit_pct']:.2%}), now negative for 10+ ticks"
                    
            elif is_put_trade:
                # Apply correct profit direction based on inversion (same logic as barrier calculation)
                if is_inverted_symbol:
                    # INVERTED LOGIC for R_ symbols: PUT profits when price goes UP
                    ticks_down = price_difference / tick_size   # Positive diff = profit
                else:
                    # NORMAL LOGIC for other symbols: PUT profits when price goes DOWN
                    ticks_down = -price_difference / tick_size  # Negative diff = profit
                
                # DYNAMIC ENTRY SPOT ADJUSTMENT - Lock in profits for PUT contracts
                if ticks_down > 0:
                    # Trade is profitable - adjust entry spot to lock in profits
                    profit_ticks = ticks_down
                    
                    # Calculate new "virtual" entry spot that ensures P&L >= 0
                    profit_lock_percentage = global_config.get("trading.profit_lock_percentage", 0.3)
                    new_virtual_entry = current_price + (profit_ticks * tick_size * profit_lock_percentage)
                    
                    # Update profit protection tracking
                    if not profit_protection["was_profitable"]:
                        profit_protection["was_profitable"] = True
                        profit_protection["negative_ticks"] = 0
                        profit_protection["max_profit_ticks"] = 0
                        profit_protection["locked_entry_spot"] = entry_price
                        logger.info(f"PROFIT PROTECTION: Trade {contract_id} became profitable ({profit_ticks:.1f} ticks)")
                    
                    # Track maximum profit achieved
                    profit_protection["max_profit_ticks"] = max(profit_protection["max_profit_ticks"], profit_ticks)
                    profit_protection["max_profit_pct"] = max(profit_protection["max_profit_pct"], ticks_down * tick_size / entry_price)
                    
                    # Adjust locked entry spot to protect profits
                    profit_lock_threshold = global_config.get("trading.profit_lock_threshold", 3)
                    
                    if profit_ticks >= profit_lock_threshold:  # If we're at threshold ticks in profit
                        # Move entry spot down to lock in percentage of profits
                        profit_protection["locked_entry_spot"] = new_virtual_entry
                        logger.info(f"PROFIT LOCK: Adjusted entry spot to {new_virtual_entry:.5f} (locked {profit_ticks*profit_lock_percentage:.1f} ticks profit)")
                    
                elif profit_protection["was_profitable"]:
                    # Was profitable, now negative - check if we're still above locked entry
                    locked_entry = profit_protection.get("locked_entry_spot", entry_price)
                    current_profit_ticks = (locked_entry - current_price) / tick_size
                    
                    if current_profit_ticks < 0:
                        # We're now above the locked entry - close to protect profits
                        logger.info(f"PROFIT PROTECTION: Closing {contract_id} - above locked entry {locked_entry:.5f}")
                        # Start cooldown period to prevent immediate new trades
                        self.start_profit_protection_cooldown()
                        return True, f"Above locked entry spot {locked_entry:.5f} (protecting {profit_protection['max_profit_ticks']:.1f} ticks profit)"
                    else:
                        # Still profitable relative to locked entry
                        profit_protection["negative_ticks"] += 1
                        if profit_protection["negative_ticks"] >= 10:
                            logger.info(f"PROFIT PROTECTION: Closing {contract_id} - was profitable, now negative for 10+ ticks")
                            # Start cooldown period to prevent immediate new trades
                            self.start_profit_protection_cooldown()
                            return True, f"Was profitable ({profit_protection['max_profit_pct']:.2%}), now negative for 10+ ticks"
            else:
                logger.warning(f"Unknown contract type/signal: {contract_type}/{signal_type}")
                return False, f"Unknown contract type: {contract_type}"
            
            return False, "No profit protection trigger"
            
        except Exception as e:
            logger.error(f"Error in profit protection check: {e}")
            return False, f"Error: {e}"


    def is_in_profit_protection_cooldown(self) -> bool:
        """Check if we're currently in profit protection cooldown period."""
        import time
        current_time = time.time()
        return current_time < self.profit_protection_cooldown_end
    
    def start_profit_protection_cooldown(self):
        """Start profit protection cooldown period."""
        import time
        self.profit_protection_cooldown_end = time.time() + self.profit_protection_cooldown_duration
        logger.info(f"PROFIT PROTECTION COOLDOWN: Started {self.profit_protection_cooldown_duration:.0f}s cooldown period")
    
    def get_profit_protection_cooldown_remaining(self) -> float:
        """Get remaining cooldown time in seconds."""
        import time
        current_time = time.time()
        remaining = self.profit_protection_cooldown_end - current_time
        return max(0.0, remaining)

    def _get_current_profit_loss(self, contract_id: str, stake: float) -> Optional[float]:
        """
        Get current profit/loss for a contract using REAL Deriv API data.

        Args:
            contract_id: Contract ID to check
            stake: Original stake amount

        Returns:
            Current profit/loss amount, None if cannot determine
        """
        try:
            # Get contract data from active contracts (updated by handle_contract_update)
            if contract_id not in self.active_contracts:
                logger.warning(f"Contract {contract_id} not found in active contracts")
                return None
            
            contract_data = self.active_contracts[contract_id]
            
            # Use REAL profit data from Deriv API (updated by handle_contract_update)
            real_profit = contract_data.get("profit")
            if real_profit is not None:
                logger.debug(f"Current P&L for {contract_id}: ${real_profit:.2f} (from Deriv API)")
                return float(real_profit)
            
            # Fallback: If no real profit data yet, return None instead of simulated data
            logger.debug(f"No real profit data available for {contract_id} yet")
            return None

        except Exception as e:
            logger.error(f"Error getting current P&L for {contract_id}: {e}")
            return None

    def _trigger_market_fallback(self, error_type: str, error_message: str) -> None:
        """
        Trigger market fallback when trades fail due to invalid symbols or market issues.
        
        Args:
            error_type: Type of error that triggered fallback
            error_message: Detailed error message
        """
        try:
            logger.warning(f"MARKET FALLBACK TRIGGERED: {error_type} - {error_message}")
            
            # Get available markets from config
            available_symbols = config.get("markets", {}).get("available_symbols", ["R_100", "R_75", "R_50"])
            current_symbol = config.get("trading", {}).get("symbol", "R_100")
            
            # Find next available symbol
            try:
                current_index = available_symbols.index(current_symbol)
                next_index = (current_index + 1) % len(available_symbols)
                next_symbol = available_symbols[next_index]
            except ValueError:
                # Current symbol not in list, use first available
                next_symbol = available_symbols[0] if available_symbols else "R_100"
            
            logger.warning(f"MARKET FALLBACK: Switching from {current_symbol} to {next_symbol}")
            
            # Store fallback request for bot engine to process
            self.pending_market_fallback = {
                "from_symbol": current_symbol,
                "to_symbol": next_symbol,
                "error_type": error_type,
                "error_message": error_message,
                "timestamp": time.time()
            }
            
            logger.info(f"MARKET FALLBACK: Fallback request stored - {current_symbol} -> {next_symbol}")

        except Exception as e:
            logger.error(f"Error triggering market fallback: {e}")
    
    def get_pending_market_fallback(self) -> Optional[Dict[str, Any]]:
        """
        Get and clear any pending market fallback request.
        
        Returns:
            Fallback request dictionary or None
        """
        if hasattr(self, 'pending_market_fallback') and self.pending_market_fallback:
            fallback_request = self.pending_market_fallback
            self.pending_market_fallback = None
            return fallback_request
            return None

    def perform_early_closure_check(self, ticks_received: int = 0) -> None:
        """Perform early closure checks on all active contracts."""
        try:
            if not self.early_closure_enabled:
                return

            contracts_to_close = []
            current_time = time.time()
            
            for contract_id, contract_data in list(self.active_contracts.items()):
                # Skip contracts that are already marked as non-resellable
                if contract_id in self._non_resellable_contracts:
                    continue
                    
                # Skip contracts that have already been attempted to be sold multiple times
                if self._sell_attempts.get(contract_id, 0) >= 2:
                    continue
                    
                # Skip contracts in cooldown period
                last_attempt = self._last_sell_attempt.get(contract_id, 0)
                if current_time - last_attempt < 30:
                    continue
                    
                should_close, reason = self.should_close_early(contract_data, ticks_received)
                if should_close:
                    contracts_to_close.append((contract_id, reason))

            # Close contracts that meet early closure criteria
            for contract_id, reason in contracts_to_close:
                logger.info(f"Closing contract {contract_id} early: {reason}")
                self._execute_sell(contract_id, f"early_closure_{reason}")

        except Exception as e:
            logger.error(f"Error in early closure check: {e}")

    def _check_negative_ticks_closure(self, contract_data: Dict[str, Any], current_price: float) -> tuple[bool, str]:
        """
        Check if trade should be closed because it's been below zero for more than 10 ticks.
        
        Args:
            contract_data: Contract data from active_contracts
            current_price: Current market price
            
        Returns:
            Tuple of (should_close, reason)
        """
        try:
            contract_id = contract_data.get("contract_id")
            if not contract_id:
                return False, "No contract ID"
            
            # Get configuration values
            from infrastructure.config import config
            max_negative_ticks = config.get("trading.max_negative_ticks", 10)
            negative_tick_check_interval = config.get("trading.negative_tick_check_interval", 2)
            
            # Get current profit/loss
            real_profit = contract_data.get("profit")
            if real_profit is None:
                return False, "No profit data available yet"
            
            pnl_dollars = float(real_profit)
            
            # Only check if trade is currently losing money
            if pnl_dollars >= 0:
                return False, f"Trade is profitable: ${pnl_dollars:.2f}"
            
            # Initialize negative tick counter if not exists
            if "negative_ticks_count" not in contract_data:
                contract_data["negative_ticks_count"] = 0
                contract_data["last_negative_check_tick"] = 0
            
            # Get current tick count from strategy engine
            from core.bot_engine import LemoTickBot
            current_tick = getattr(LemoTickBot, '_current_tick_count', 0)
            
            # Only check every N ticks to avoid excessive checking
            if current_tick - contract_data["last_negative_check_tick"] < negative_tick_check_interval:
                return False, f"Not time to check yet (checking every {negative_tick_check_interval} ticks)"
            
            # Update last check tick
            contract_data["last_negative_check_tick"] = current_tick
            
            # Increment negative tick counter
            contract_data["negative_ticks_count"] += 1
            
            logger.debug(f"NEGATIVE TICKS CHECK: Contract {contract_id} - P&L: ${pnl_dollars:.2f}, Negative ticks: {contract_data['negative_ticks_count']}/{max_negative_ticks}")
            
            # Check if we've exceeded the maximum negative ticks
            if contract_data["negative_ticks_count"] >= max_negative_ticks:
                return True, f"Below zero for {contract_data['negative_ticks_count']} ticks (limit: {max_negative_ticks}), P&L: ${pnl_dollars:.2f}"
            
            return False, f"Below zero for {contract_data['negative_ticks_count']}/{max_negative_ticks} ticks, P&L: ${pnl_dollars:.2f}"
            
        except Exception as e:
            logger.error(f"Error checking negative ticks closure: {e}")
            return False, f"Error: {e}"

    def close_all_trades(self) -> None:
        """Close all active trades (emergency function)."""
        logger.warning("Closing all active trades")

        # For Rise/Fall contracts, we can attempt to close them early if profitable
        closed_count = 0
        for contract_id in list(self.active_contracts.keys()):
            try:
                # Check if contract can be sold profitably
                contract_data = self.active_contracts[contract_id]
                if self._can_sell_early(contract_data):
                    self._execute_sell(contract_id, "emergency_close")
                    closed_count += 1
            except Exception as e:
                logger.error(f"Error closing contract {contract_id}: {e}")

        logger.info(
            f"Emergency close requested. Attempted to close {closed_count} contracts, "
            f"{len(self.active_contracts)} contracts remain active"
        )

    def _validate_entry_pattern(self, signal_type: str, entry_price: float) -> Dict[str, Any]:
        """
        Validate trade entry using enhanced four-category pattern detection.
        
        Args:
            signal_type: Trading signal (BUY/SELL)
            entry_price: Entry price for validation
            
        Returns:
            Dictionary with validation result
        """
        try:
            # Get current candle data for pattern validation
            candle_data = self._simulate_current_candle(entry_price)
            
            if not candle_data:
                return {"valid": True, "reason": "No candle data available - allowing trade"}
            
            # Calculate candle metrics
            body_size = abs(candle_data["close"] - candle_data["open"])
            total_range = candle_data["high"] - candle_data["low"]
            upper_wick = candle_data["high"] - max(candle_data["open"], candle_data["close"])
            lower_wick = min(candle_data["open"], candle_data["close"]) - candle_data["low"]
            
            if total_range == 0:
                return {"valid": True, "reason": "No price movement detected - allowing trade"}
            
            body_ratio = body_size / total_range
            upper_wick_ratio = upper_wick / total_range
            lower_wick_ratio = lower_wick / total_range
            
            # Get previous candle if available
            previous_candle = self._get_previous_candle()
            
            # Check for conflicting patterns
            if signal_type == "BUY":
                # Check for bearish patterns that would conflict with BUY signal
                bearish_pattern = self._detect_bearish_patterns(previous_candle, candle_data, body_ratio, upper_wick_ratio, lower_wick_ratio)
                if bearish_pattern:
                    pattern_name, pattern_signal, confidence = bearish_pattern
                    if pattern_signal == "SELL" and confidence > 0.8:
                        return {"valid": False, "reason": f"Conflicting bearish pattern: {pattern_name} (confidence: {confidence:.0%})"}
                
                # Check for neutral patterns that suggest indecision
                neutral_pattern = self._detect_neutral_patterns(candle_data, body_size, total_range, upper_wick, lower_wick)
                if neutral_pattern:
                    pattern_name, pattern_signal, confidence = neutral_pattern
                    if pattern_signal == "HOLD" and confidence > 0.85:
                        return {"valid": False, "reason": f"Market indecision pattern: {pattern_name} (confidence: {confidence:.0%})"}
                
                # Check for bullish patterns that confirm BUY signal
                bullish_pattern = self._detect_bullish_patterns(previous_candle, candle_data, body_ratio, upper_wick_ratio, lower_wick_ratio)
                if bullish_pattern:
                    pattern_name, pattern_signal, confidence = bullish_pattern
                    if pattern_signal == "BUY" and confidence > 0.7:
                        return {"valid": True, "reason": f"Confirming bullish pattern: {pattern_name} (confidence: {confidence:.0%})"}
            
            elif signal_type == "SELL":
                # Check for bullish patterns that would conflict with SELL signal
                bullish_pattern = self._detect_bullish_patterns(previous_candle, candle_data, body_ratio, upper_wick_ratio, lower_wick_ratio)
                if bullish_pattern:
                    pattern_name, pattern_signal, confidence = bullish_pattern
                    if pattern_signal == "BUY" and confidence > 0.8:
                        return {"valid": False, "reason": f"Conflicting bullish pattern: {pattern_name} (confidence: {confidence:.0%})"}
                
                # Check for neutral patterns that suggest indecision
                neutral_pattern = self._detect_neutral_patterns(candle_data, body_size, total_range, upper_wick, lower_wick)
                if neutral_pattern:
                    pattern_name, pattern_signal, confidence = neutral_pattern
                    if pattern_signal == "HOLD" and confidence > 0.85:
                        return {"valid": False, "reason": f"Market indecision pattern: {pattern_name} (confidence: {confidence:.0%})"}
                
                # Check for bearish patterns that confirm SELL signal
                bearish_pattern = self._detect_bearish_patterns(previous_candle, candle_data, body_ratio, upper_wick_ratio, lower_wick_ratio)
                if bearish_pattern:
                    pattern_name, pattern_signal, confidence = bearish_pattern
                    if pattern_signal == "SELL" and confidence > 0.7:
                        return {"valid": True, "reason": f"Confirming bearish pattern: {pattern_name} (confidence: {confidence:.0%})"}
            
            # FIBONACCI CONFLUENCE ANALYSIS - Check fibonacci levels for additional validation
            if self.fibonacci_enabled and len(self.price_history) > 0:
                fib_signal = self.fibonacci.get_signal(entry_price)
                
                if fib_signal:
                    fib_confidence = fib_signal["confidence"]
                    fib_level = fib_signal["level"]
                    
                    # Check fibonacci confluence with signal direction
                    if signal_type == "BUY" and fib_signal["type"] == "BUY":
                        # Fibonacci support confirms BUY signal
                        logger.info(f"FIBONACCI CONFLUENCE: BUY signal confirmed at {fib_level} support level (confidence: {fib_confidence:.0%})")
                        return {"valid": True, "reason": f"Fibonacci support confluence: {fib_level} level (confidence: {fib_confidence:.0%})"}
                    elif signal_type == "SELL" and fib_signal["type"] == "SELL":
                        # Fibonacci resistance confirms SELL signal
                        logger.info(f"FIBONACCI CONFLUENCE: SELL signal confirmed at {fib_level} resistance level (confidence: {fib_confidence:.0%})")
                        return {"valid": True, "reason": f"Fibonacci resistance confluence: {fib_level} level (confidence: {fib_confidence:.0%})"}
                    elif signal_type == "BUY" and fib_signal["type"] == "SELL":
                        # Fibonacci resistance conflicts with BUY signal
                        logger.warning(f"FIBONACCI CONFLICT: BUY signal conflicts with {fib_level} resistance level (confidence: {fib_confidence:.0%})")
                        return {"valid": False, "reason": f"Fibonacci resistance conflict: {fib_level} level (confidence: {fib_confidence:.0%})"}
                    elif signal_type == "SELL" and fib_signal["type"] == "BUY":
                        # Fibonacci support conflicts with SELL signal
                        logger.warning(f"FIBONACCI CONFLICT: SELL signal conflicts with {fib_level} support level (confidence: {fib_confidence:.0%})")
                        return {"valid": False, "reason": f"Fibonacci support conflict: {fib_level} level (confidence: {fib_confidence:.0%})"}
            
            # Default: allow trade if no conflicting patterns detected
            return {"valid": True, "reason": "No conflicting patterns detected - allowing trade"}
            
        except Exception as e:
            logger.error(f"Error in pattern validation: {e}")
            return {"valid": True, "reason": f"Validation error - allowing trade: {e}"}

    def _check_pattern_based_closure(self, contract_data: Dict[str, Any], current_price: float) -> tuple[bool, str]:
        """
        Check if trade should be closed based on enhanced four-category pattern detection.
        
        Args:
            contract_data: Contract data from active_contracts
            current_price: Current market price
            
        Returns:
            Tuple of (should_close, reason)
        """
        try:
            contract_id = contract_data.get("contract_id")
            signal_type = contract_data.get("signal_type", "")
            
            # Get current candle data (simplified - would need actual candle data in real implementation)
            # For now, we'll use price-based candle simulation
            candle_data = self._simulate_current_candle(current_price)
            
            if not candle_data:
                return False, "No candle data available"
            
            # Calculate candle metrics
            body_size = abs(candle_data["close"] - candle_data["open"])
            total_range = candle_data["high"] - candle_data["low"]
            upper_wick = candle_data["high"] - max(candle_data["open"], candle_data["close"])
            lower_wick = min(candle_data["open"], candle_data["close"]) - candle_data["low"]
            
            if total_range == 0:
                return False, "No price movement"
            
            body_ratio = body_size / total_range
            upper_wick_ratio = upper_wick / total_range
            lower_wick_ratio = lower_wick / total_range
            
            # Get previous candle if available (simplified)
            previous_candle = self._get_previous_candle()
            
            # Check for pattern-based closure signals
            # 1. Check Neutral Patterns (indecision - close if opposite to trade direction)
            neutral_pattern = self._detect_neutral_patterns(candle_data, body_size, total_range, upper_wick, lower_wick)
            if neutral_pattern:
                pattern_name, pattern_signal, confidence = neutral_pattern
                if pattern_signal == "HOLD" and confidence > 0.8:
                    logger.info(f"PATTERN CLOSURE: {pattern_name} detected - Market indecision, closing trade")
                    return True, f"{pattern_name} - Market indecision"
            
            # 2. Check for opposite direction patterns
            if signal_type == "BUY":
                # Check for bearish patterns that suggest closing BUY trades
                bearish_pattern = self._detect_bearish_patterns(previous_candle, candle_data, body_ratio, upper_wick_ratio, lower_wick_ratio)
                if bearish_pattern:
                    pattern_name, pattern_signal, confidence = bearish_pattern
                    if pattern_signal == "SELL" and confidence > 0.8:
                        logger.info(f"PATTERN CLOSURE: {pattern_name} detected - Bearish reversal, closing BUY trade")
                        return True, f"{pattern_name} - Bearish reversal"
            elif signal_type == "SELL":
                # Check for bullish patterns that suggest closing SELL trades
                bullish_pattern = self._detect_bullish_patterns(previous_candle, candle_data, body_ratio, upper_wick_ratio, lower_wick_ratio)
                if bullish_pattern:
                    pattern_name, pattern_signal, confidence = bullish_pattern
                    if pattern_signal == "BUY" and confidence > 0.8:
                        logger.info(f"PATTERN CLOSURE: {pattern_name} detected - Bullish reversal, closing SELL trade")
                        return True, f"{pattern_name} - Bullish reversal"
            
            # 3. Check complex patterns for strong reversal signals
            complex_pattern = self._detect_complex_patterns(previous_candle, candle_data, body_ratio, upper_wick_ratio, lower_wick_ratio)
            if complex_pattern:
                pattern_name, pattern_signal, confidence = complex_pattern
                if confidence > 0.85:  # High confidence complex patterns
                    if (signal_type == "BUY" and pattern_signal == "SELL") or (signal_type == "SELL" and pattern_signal == "BUY"):
                        logger.info(f"PATTERN CLOSURE: {pattern_name} detected - Strong reversal, closing trade")
                        return True, f"{pattern_name} - Strong reversal"
            
            # FIBONACCI CONFLUENCE ANALYSIS - Check fibonacci levels for closure signals
            if self.fibonacci_enabled and len(self.price_history) > 0:
                fib_signal = self.fibonacci.get_signal(current_price)
                
                if fib_signal:
                    fib_confidence = fib_signal["confidence"]
                    fib_level = fib_signal["level"]
                    
                    # Check fibonacci confluence for early closure
                    if signal_type == "BUY" and fib_signal["type"] == "SELL":
                        # Fibonacci resistance suggests closing BUY trade
                        if fib_confidence > 0.8:
                            logger.info(f"FIBONACCI CLOSURE: BUY trade near {fib_level} resistance level (confidence: {fib_confidence:.0%})")
                            return True, f"Fibonacci resistance closure: {fib_level} level"
                    elif signal_type == "SELL" and fib_signal["type"] == "BUY":
                        # Fibonacci support suggests closing SELL trade
                        if fib_confidence > 0.8:
                            logger.info(f"FIBONACCI CLOSURE: SELL trade near {fib_level} support level (confidence: {fib_confidence:.0%})")
                            return True, f"Fibonacci support closure: {fib_level} level"
            
            return False, "No pattern-based closure signal"
            
        except Exception as e:
            logger.error(f"Error in pattern-based closure check: {e}")
            return False, f"Error: {e}"
    
    def _simulate_current_candle(self, current_price: float) -> Optional[Dict]:
        """
        Get real current candle data from candlestick strategy for pattern detection.
        
        Args:
            current_price: Current market price
            
        Returns:
            Candle data dictionary or None
        """
        try:
            # Get real candlestick data from the candlestick strategy
            if self.candlestick_strategy and hasattr(self.candlestick_strategy, 'current_candle'):
                current_candle = self.candlestick_strategy.current_candle
                if current_candle and all(key in current_candle for key in ['open', 'high', 'low', 'close']):
                    logger.info(f"Using real candlestick data: O:{current_candle['open']:.4f} H:{current_candle['high']:.4f} L:{current_candle['low']:.4f} C:{current_candle['close']:.4f}")
                    return current_candle
                else:
                    logger.warning("Candlestick strategy current_candle is incomplete, falling back to simulation")
            
            # Fallback to simulation if no real data available
            logger.warning("No real candlestick data available, using simulation (this may cause false patterns)")
            candle_data = {
                "open": current_price * 0.999,  # Slightly lower open
                "high": current_price * 1.001,  # Slightly higher high
                "low": current_price * 0.998,   # Slightly lower low
                "close": current_price           # Current price as close
            }
            return candle_data
        except Exception as e:
            logger.error(f"Error getting current candle data: {e}")
            return None
    
    def _get_previous_candle(self) -> Optional[Dict]:
        """
        Get previous candle data from candlestick strategy for pattern detection.
        
        Returns:
            Previous candle data dictionary or None
        """
        try:
            # Get real previous candle data from the candlestick strategy
            if self.candlestick_strategy and hasattr(self.candlestick_strategy, 'candle_buffer'):
                candle_buffer = self.candlestick_strategy.candle_buffer
                if candle_buffer and len(candle_buffer) > 0:
                    # Get the most recent completed candle
                    previous_candle = candle_buffer[-1]
                    if all(key in previous_candle for key in ['open', 'high', 'low', 'close']):
                        logger.info(f"Using real previous candle data: O:{previous_candle['open']:.4f} H:{previous_candle['high']:.4f} L:{previous_candle['low']:.4f} C:{previous_candle['close']:.4f}")
                        return previous_candle
                    else:
                        logger.warning("Previous candle data is incomplete")
            
            # No previous candle available
            logger.debug("No previous candle data available")
            return None
        except Exception as e:
            logger.error(f"Error getting previous candle: {e}")
            return None
    
    def update_fibonacci_levels(self, price: float, timestamp: Optional[int] = None):
        """
        Update fibonacci levels with new price data.
        
        Args:
            price: Current price
            timestamp: Optional timestamp (defaults to current time)
        """
        try:
            if self.fibonacci_enabled:
                if timestamp is None:
                    timestamp = int(time.time())
                
                # Update fibonacci levels
                self.fibonacci.update(price, timestamp)
                
                # Update price history for fibonacci analysis
                self.price_history.append(price)
                
                # Keep only last 100 prices to prevent memory issues
                if len(self.price_history) > 100:
                    self.price_history = self.price_history[-100:]
                    
        except Exception as e:
            logger.error(f"Error updating fibonacci levels: {e}")

    # Enhanced Four-Category Pattern Detection Methods
    def _detect_neutral_patterns(self, candle: Dict, body_size: float, total_range: float, upper_wick: float, lower_wick: float) -> Optional[tuple]:
        """
        Detect neutral patterns that signal market indecision.
        
        Args:
            candle: Current candle data
            body_size: Candle body size
            total_range: Total candle range
            upper_wick: Upper wick length
            lower_wick: Lower wick length
            
        Returns:
            Tuple of (pattern_name, signal_type, confidence) or None
        """
        if total_range == 0:
            return None
            
        body_ratio = body_size / total_range
        upper_wick_ratio = upper_wick / total_range
        lower_wick_ratio = lower_wick / total_range
        
        # Enhanced Doji Detection - Multiple Doji Types
        if body_ratio <= 0.1:  # Very small body
            if upper_wick_ratio > 0.4 and lower_wick_ratio > 0.4:
                # Long-legged Doji - Strong indecision
                logger.info(f"NEUTRAL PATTERN: Long-legged Doji detected - Market indecision")
                return ("LongLeggedDoji", "HOLD", 0.90)  # High confidence for indecision
            elif upper_wick_ratio > 0.3:
                # Gravestone Doji - Bearish indecision
                logger.info(f"NEUTRAL PATTERN: Gravestone Doji detected - Bearish indecision")
                return ("GravestoneDoji", "HOLD", 0.85)
            elif lower_wick_ratio > 0.3:
                # Dragonfly Doji - Bullish indecision
                logger.info(f"NEUTRAL PATTERN: Dragonfly Doji detected - Bullish indecision")
                return ("DragonflyDoji", "HOLD", 0.85)
            else:
                # Standard Doji - General indecision
                logger.info(f"NEUTRAL PATTERN: Standard Doji detected - Market indecision")
                return ("StandardDoji", "HOLD", 0.80)
        
        # Spinning Top - Small body with long wicks
        if body_ratio <= 0.3 and upper_wick_ratio > 0.3 and lower_wick_ratio > 0.3:
            logger.info(f"NEUTRAL PATTERN: Spinning Top detected - Market indecision")
            return ("SpinningTop", "HOLD", 0.75)
        
        return None
    
    def _detect_bullish_patterns(self, candle1: Optional[Dict], candle2: Dict, body_ratio: float, upper_wick_ratio: float, lower_wick_ratio: float) -> Optional[tuple]:
        """
        Detect bullish patterns that indicate potential upward price movement.
        
        Args:
            candle1: Previous candle (if available)
            candle2: Current candle
            body_ratio: Current candle body ratio
            upper_wick_ratio: Current candle upper wick ratio
            lower_wick_ratio: Current candle lower wick ratio
            
        Returns:
            Tuple of (pattern_name, signal_type, confidence) or None
        """
        # Hammer Pattern - Bullish reversal
        if lower_wick_ratio >= 2.0 and upper_wick_ratio <= 0.1 and body_ratio <= 0.3:
            logger.info(f"BULLISH PATTERN: Hammer detected - Bullish reversal")
            return ("Hammer", "BUY", 0.85)
        
        # Inverted Hammer - Bullish reversal
        if upper_wick_ratio >= 2.0 and lower_wick_ratio <= 0.1 and body_ratio <= 0.3:
            logger.info(f"BULLISH PATTERN: Inverted Hammer detected - Bullish reversal")
            return ("InvertedHammer", "BUY", 0.80)
        
        # Bullish Engulfing (requires previous candle)
        if candle1 is not None:
            prev_body_size = abs(candle1["close"] - candle1["open"])
            prev_is_bearish = candle1["close"] < candle1["open"]
            current_is_bullish = candle2["close"] > candle2["open"]
            
            if (prev_is_bearish and current_is_bullish and 
                candle2["close"] > candle1["open"] and candle2["open"] < candle1["close"]):
                logger.info(f"BULLISH PATTERN: Bullish Engulfing detected - Strong bullish reversal")
                return ("BullishEngulfing", "BUY", 0.90)
        
        # Support Bounce - Long lower wick with bullish close
        if lower_wick_ratio >= 0.4 and candle2["close"] > candle2["open"]:
            logger.info(f"BULLISH PATTERN: Support Bounce detected - Bullish continuation")
            return ("SupportBounce", "BUY", 0.75)
        
        # Strong Bullish Momentum
        if body_ratio >= 0.6 and candle2["close"] > candle2["open"]:
            logger.info(f"BULLISH PATTERN: Strong Bullish Momentum detected")
            return ("StrongBullishMomentum", "BUY", 0.85)
        
        return None
    
    def _detect_bearish_patterns(self, candle1: Optional[Dict], candle2: Dict, body_ratio: float, upper_wick_ratio: float, lower_wick_ratio: float) -> Optional[tuple]:
        """
        Detect bearish patterns that suggest possible downward price movement.
        
        Args:
            candle1: Previous candle (if available)
            candle2: Current candle
            body_ratio: Current candle body ratio
            upper_wick_ratio: Current candle upper wick ratio
            lower_wick_ratio: Current candle lower wick ratio
            
        Returns:
            Tuple of (pattern_name, signal_type, confidence) or None
        """
        # Hanging Man - Bearish reversal
        if lower_wick_ratio >= 2.0 and upper_wick_ratio <= 0.1 and body_ratio <= 0.3:
            logger.info(f"BEARISH PATTERN: Hanging Man detected - Bearish reversal")
            return ("HangingMan", "SELL", 0.85)
        
        # Shooting Star - Bearish reversal
        if upper_wick_ratio >= 2.0 and lower_wick_ratio <= 0.1 and body_ratio <= 0.3:
            logger.info(f"BEARISH PATTERN: Shooting Star detected - Bearish reversal")
            return ("ShootingStar", "SELL", 0.85)
        
        # Bearish Engulfing (requires previous candle)
        if candle1 is not None:
            prev_is_bullish = candle1["close"] > candle1["open"]
            current_is_bearish = candle2["close"] < candle2["open"]
            
            if (prev_is_bullish and current_is_bearish and 
                candle2["close"] < candle1["open"] and candle2["open"] > candle1["close"]):
                logger.info(f"BEARISH PATTERN: Bearish Engulfing detected - Strong bearish reversal")
                return ("BearishEngulfing", "SELL", 0.90)
        
        # Resistance Rejection - Long upper wick with bearish close
        if upper_wick_ratio >= 0.4 and candle2["close"] < candle2["open"]:
            logger.info(f"BEARISH PATTERN: Resistance Rejection detected - Bearish continuation")
            return ("ResistanceRejection", "SELL", 0.75)
        
        # Strong Bearish Momentum
        if body_ratio >= 0.6 and candle2["close"] < candle2["open"]:
            logger.info(f"BEARISH PATTERN: Strong Bearish Momentum detected")
            return ("StrongBearishMomentum", "SELL", 0.85)
        
        return None
    
    def _detect_complex_patterns(self, candle1: Optional[Dict], candle2: Dict, body_ratio: float, upper_wick_ratio: float, lower_wick_ratio: float) -> Optional[tuple]:
        """
        Detect complex patterns involving multiple candles with nuanced signals.
        
        Args:
            candle1: Previous candle (if available)
            candle2: Current candle
            body_ratio: Current candle body ratio
            upper_wick_ratio: Current candle upper wick ratio
            lower_wick_ratio: Current candle lower wick ratio
            
        Returns:
            Tuple of (pattern_name, signal_type, confidence) or None
        """
        if candle1 is None:
            return None
        
        # Breakout Pattern - Strong move after consolidation
        prev_body_size = abs(candle1["close"] - candle1["open"])
        prev_range = candle1["high"] - candle1["low"]
        prev_body_ratio = prev_body_size / prev_range if prev_range > 0 else 0
        
        # Current candle is strong, previous was small (consolidation breakout)
        if body_ratio >= 0.6 and prev_body_ratio < 0.4:
            if candle2["close"] > candle2["open"]:
                logger.info(f"COMPLEX PATTERN: Bullish Breakout detected - Strong bullish continuation")
                return ("BullishBreakout", "BUY", 0.78)
            else:
                logger.info(f"COMPLEX PATTERN: Bearish Breakout detected - Strong bearish continuation")
                return ("BearishBreakout", "SELL", 0.78)
        
        # Morning Star Pattern (3-candle pattern - simplified to 2-candle)
        prev_is_bearish = candle1["close"] < candle1["open"]
        current_is_bullish = candle2["close"] > candle2["open"]
        prev_body_large = prev_body_ratio >= 0.6
        current_body_large = body_ratio >= 0.6
        
        if prev_is_bearish and current_is_bullish and prev_body_large and current_body_large:
            logger.info(f"COMPLEX PATTERN: Morning Star (simplified) detected - Strong bullish reversal")
            return ("MorningStar", "BUY", 0.88)
        
        # Evening Star Pattern (3-candle pattern - simplified to 2-candle)
        prev_is_bullish = candle1["close"] > candle1["open"]
        current_is_bearish = candle2["close"] < candle2["open"]
        
        if prev_is_bullish and current_is_bearish and prev_body_large and current_body_large:
            logger.info(f"COMPLEX PATTERN: Evening Star (simplified) detected - Strong bearish reversal")
            return ("EveningStar", "SELL", 0.88)
        
        return None


