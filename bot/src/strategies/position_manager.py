"""
Position Manager for Mean Reversion Strategy.
Handles dynamic position closure based on profit/loss and trend reversal.
"""

from typing import Dict, Any, Optional, Tuple
import time
from infrastructure.logger import logger
from infrastructure.config import config


class MeanReversionPositionManager:
    """
    Manages open positions for mean reversion strategy with:
    - Dynamic trend-based closure (close if trend reverses)
    - Take Profit levels
    - Stop Loss levels
    """
    
    def __init__(self, ema7=None, ema15=None):
        """
        Initialize position manager.
        
        Args:
            ema7: EMA7 indicator for trend detection
            ema15: EMA15 indicator for trend detection
        """
        self.ema7 = ema7
        self.ema15 = ema15
        
        # Load configuration
        self.take_profit = config.get("strategy.mean_reversion_strategy.take_profit", 1.3)
        self.stop_loss = config.get("strategy.mean_reversion_strategy.stop_loss", -1)
        self.trend_reversal_enabled = config.get("strategy.mean_reversion_strategy.trend_reversal_closure", True)
        self.grace_period = config.get("strategy.mean_reversion_strategy.grace_period_seconds", 10)
        
        # Tracking
        self.monitored_positions: Dict[str, Dict[str, Any]] = {}
        self.closed_positions: Dict[str, str] = {}  # contract_id -> reason
        
        logger.info("Mean Reversion Position Manager initialized")
        logger.info(f"  Take Profit: ${self.take_profit:.2f}")
        logger.info(f"  Stop Loss: ${self.stop_loss:.2f}")
        logger.info(f"  Trend Reversal Closure: {'ENABLED' if self.trend_reversal_enabled else 'DISABLED'}")
        logger.info(f"  Grace Period: {self.grace_period}s (prevents false stop-loss triggers)")
    
    def add_position(self, contract_id: str, signal_type: str, entry_price: float, stake: float, metadata: Optional[Dict] = None):
        """
        Add a position to monitor.
        
        Args:
            contract_id: Contract ID from Deriv
            signal_type: "BUY" or "SELL"
            entry_price: Entry price
            stake: Trade stake amount
            metadata: Additional position metadata
        """
        self.monitored_positions[contract_id] = {
            "contract_id": contract_id,
            "signal_type": signal_type,
            "entry_price": entry_price,
            "stake": stake,
            "entry_time": time.time(),
            "metadata": metadata or {}
        }
        logger.info(f"📊 Position added to monitor: {contract_id} ({signal_type}) @ {entry_price:.2f}")
    
    def check_position(self, contract_id: str, current_price: float, current_profit: Optional[float] = None) -> Tuple[bool, str]:
        """
        Check if position should be closed.
        
        Args:
            contract_id: Contract ID to check
            current_price: Current market price
            current_profit: Current profit/loss (if available)
        
        Returns:
            Tuple of (should_close, reason)
        """
        if contract_id not in self.monitored_positions:
            return False, "Position not monitored"
        
        position = self.monitored_positions[contract_id]
        signal_type = position["signal_type"]
        entry_price = position["entry_price"]
        metadata = position.get("metadata", {})
        strategy = metadata.get("strategy", "unknown")
        
        # ============================================
        # GRACE PERIOD: Don't check TP/SL for first N seconds
        # ============================================
        # This prevents false stop-loss triggers for binary options, which start with profit = -stake
        position_age = time.time() - position["entry_time"]
        
        if position_age < self.grace_period:
            logger.debug(f"⏳ [{strategy}] Position {contract_id} in grace period ({position_age:.1f}s / {self.grace_period}s) - skipping TP/SL checks")
            # Still allow trend reversal checks during grace period (handled below)
            current_profit = None  # Force skip TP/SL checks
        
        # ============================================
        # 1. CHECK PROFIT/LOSS THRESHOLDS (UNIVERSAL)
        # ============================================
        if current_profit is not None:
            # DEBUG: Log profit check (only log every ~2 seconds to avoid spam)
            position_age_int = int(position_age)
            if position_age_int % 2 == 0:  # Log every 2 seconds
                logger.debug(f"💰 [{strategy}] Position {contract_id}: Profit=${current_profit:.2f} (TP=${self.take_profit:.2f}, SL=${self.stop_loss:.2f})")
            
            # Take Profit - APPLIES TO ALL STRATEGIES
            if current_profit >= self.take_profit:
                logger.info(f"🎯 TAKE PROFIT HIT [{strategy}]: {contract_id} profit ${current_profit:.2f} >= ${self.take_profit:.2f}")
                return True, f"Take Profit (${current_profit:.2f})"
            
            # Stop Loss - APPLIES TO ALL STRATEGIES
            if current_profit <= self.stop_loss:
                logger.info(f"🛑 STOP LOSS HIT [{strategy}]: {contract_id} loss ${current_profit:.2f} <= ${self.stop_loss:.2f}")
                return True, f"Stop Loss (${current_profit:.2f})"
        else:
            # DEBUG: Log when profit is None AFTER grace period (indicates a real issue)
            if position_age >= self.grace_period:
                logger.warning(f"⚠️ [{strategy}] Position {contract_id}: current_profit is None after grace period - cannot check TP/SL")
        
        # ============================================
        # 2. CHECK TREND REVERSAL (ONLY FOR MEAN REVERSION)
        # ============================================
        # Only apply EMA trend reversal to mean_reversion strategy
        if "mean_reversion" in strategy.lower() and self.trend_reversal_enabled and self.ema7 and self.ema15:
            ema7_value = self.ema7.get_value()
            ema15_value = self.ema15.get_value()
            
            if ema7_value is not None and ema15_value is not None:
                # For BUY positions: close if EMA7 drops below EMA15 (downtrend)
                if signal_type == "BUY" and ema7_value < ema15_value:
                    logger.info(f"🔄 TREND REVERSAL: {contract_id} (BUY) - EMA7 {ema7_value:.2f} < EMA15 {ema15_value:.2f}")
                    return True, f"Trend Reversal to Downtrend (EMA7: {ema7_value:.2f} < EMA15: {ema15_value:.2f})"
                
                # For SELL positions: close if EMA7 rises above EMA15 (uptrend)
                elif signal_type == "SELL" and ema7_value > ema15_value:
                    logger.info(f"🔄 TREND REVERSAL: {contract_id} (SELL) - EMA7 {ema7_value:.2f} > EMA15 {ema15_value:.2f}")
                    return True, f"Trend Reversal to Uptrend (EMA7: {ema7_value:.2f} > EMA15: {ema15_value:.2f})"
        
        return False, "Position OK"
    
    def mark_closed(self, contract_id: str, reason: str):
        """
        Mark position as closed.
        
        Args:
            contract_id: Contract ID
            reason: Closure reason
        """
        if contract_id in self.monitored_positions:
            position = self.monitored_positions.pop(contract_id)
            self.closed_positions[contract_id] = reason
            duration = time.time() - position["entry_time"]
            logger.info(f"✅ Position closed: {contract_id} after {duration:.1f}s - Reason: {reason}")
    
    def get_active_positions_count(self) -> int:
        """Get number of active monitored positions."""
        return len(self.monitored_positions)
    
    def get_all_active_positions(self) -> Dict[str, Dict[str, Any]]:
        """Get all active monitored positions."""
        return self.monitored_positions.copy()
    
    def get_position_info(self, contract_id: str) -> Optional[Dict[str, Any]]:
        """Get information about a monitored position."""
        return self.monitored_positions.get(contract_id)
    
    def check_multi_position_closure(self, all_trades: Dict[str, Dict[str, Any]]) -> list[tuple[str, str]]:
        """
        Check if multiple positions should be closed together.
        
        Logic: If there are 2+ positions, one losing and one winning, and:
        - The winning position is only covering the losing one (net P&L near 0)
        - Neither is moving towards being positive
        - Then close BOTH
        
        Args:
            all_trades: Dictionary of all active trades {contract_id: trade_data}
        
        Returns:
            List of (contract_id, reason) tuples for positions to close
        """
        to_close = []
        
        # Get all mean reversion positions with profit data
        mr_positions = []
        for contract_id, pos in self.monitored_positions.items():
            # Find the trade data to get profit
            if contract_id in all_trades:
                trade = all_trades[contract_id]
                profit = trade.get("profit")
                if profit is not None:
                    mr_positions.append({
                        "contract_id": contract_id,
                        "profit": profit,
                        "signal_type": pos["signal_type"],
                        "entry_time": pos["entry_time"]
                    })
        
        # Need at least 2 positions to check
        if len(mr_positions) < 2:
            return to_close
        
        # Calculate total P&L
        total_pnl = sum(p["profit"] for p in mr_positions)
        
        # Check if we have winning and losing positions
        winning = [p for p in mr_positions if p["profit"] > 0]
        losing = [p for p in mr_positions if p["profit"] < 0]
        
        if len(winning) > 0 and len(losing) > 0:
            # Check if net P&L is near zero (winning only covering losing)
            # AND if losing position is significant (< -0.5)
            worst_loss = min(p["profit"] for p in losing)
            
            if worst_loss <= -0.5 and -0.3 <= total_pnl <= 0.3:
                # Winning is only covering losing, not making progress
                logger.warning(f"⚠️ MULTI-POSITION ALERT: Total P&L ${total_pnl:.2f} (Worst: ${worst_loss:.2f})")
                logger.warning(f"   Winning positions: {len(winning)}, Losing positions: {len(losing)}")
                logger.warning(f"   Closing ALL positions - no progress towards both being positive")
                
                for pos in mr_positions:
                    to_close.append((pos["contract_id"], f"Multi-position closure (Net P&L: ${total_pnl:.2f}, individual: ${pos['profit']:.2f})"))
        
        return to_close
    
    def cleanup_old_positions(self, max_age_seconds: int = 300):
        """
        Remove old positions from monitoring (they likely expired naturally).
        
        Args:
            max_age_seconds: Maximum age in seconds (default 5 minutes)
        """
        current_time = time.time()
        expired = []
        
        for contract_id, position in self.monitored_positions.items():
            if current_time - position["entry_time"] > max_age_seconds:
                expired.append(contract_id)
        
        for contract_id in expired:
            self.mark_closed(contract_id, "Expired (natural expiry)")
        
        if expired:
            logger.info(f"🧹 Cleaned up {len(expired)} expired positions")

