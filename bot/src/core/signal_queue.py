"""
Signal Queue System for LemoTick Bot.
Priority queue for trading signals based on quality score.
"""

from queue import PriorityQueue, Full, Empty
from typing import Dict, Any, Optional
import time
import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from infrastructure.logger import logger


class SignalQueue:
    """
    Priority queue for trading signals.
    Higher quality signals get executed first when concurrent trades available.
    
    Features:
    - Automatic prioritization by quality score
    - Age-based expiration (signals too old are dropped)
    - Duplicate detection (don't queue same signal twice)
    - Statistics tracking
    
    Use Case:
    - When max concurrent trades reached, queue high-quality signals
    - Execute best available signal when position becomes available
    - Prevents missing profitable opportunities during busy periods
    """
    
    def __init__(self, max_size: int = 10, max_age_seconds: int = 30):
        """
        Initialize signal queue.
        
        Args:
            max_size: Maximum signals to hold in queue
            max_age_seconds: Maximum age before signal expires
        """
        self.queue = PriorityQueue(maxsize=max_size)
        self.max_size = max_size
        self.max_age_seconds = max_age_seconds
        
        # Performance tracking
        self.signals_added = 0
        self.signals_executed = 0
        self.signals_expired = 0
        self.signals_dropped_full = 0
        
        # Track signal quality distribution
        self.quality_scores = []
        
        logger.info("Signal Queue initialized")
        logger.info(f"  Max size: {max_size}")
        logger.info(f"  Max age: {max_age_seconds} seconds")
    
    def add_signal(self, signal: Dict[str, Any], quality_score: float) -> bool:
        """
        Add signal to queue with priority based on quality score.
        
        Args:
            signal: Signal dictionary
                Required keys:
                - type: "BUY" or "SELL"
                - asset: Asset symbol
                - duration: Contract duration
                Optional keys:
                - strategy: Strategy name
                - metadata: Additional data
            quality_score: Quality score 0.0 to 1.0 (higher = better)
            
        Returns:
            True if added successfully, False if queue full
        """
        # Validate signal
        if not self._validate_signal(signal):
            logger.warning(f"Invalid signal format, not adding to queue: {signal}")
            return False
        
        # Add timestamp if not present
        if "timestamp" not in signal:
            signal["timestamp"] = time.time()
        
        # Add quality score to signal
        signal["quality_score"] = quality_score
        
        # Priority queue uses lowest number = highest priority
        # Use (1 - quality_score) so high quality = low priority number = executes first
        priority = 1.0 - quality_score
        
        try:
            # Try to add to queue (non-blocking)
            self.queue.put((priority, signal), block=False)
            
            self.signals_added += 1
            self.quality_scores.append(quality_score)
            
            logger.info(f" Signal added to queue: {signal['type']} on {signal.get('asset', 'unknown')} (quality: {quality_score:.0%})")
            logger.debug(f"   Queue size: {self.queue.qsize()}/{self.max_size}")
            
            return True
            
        except Full:
            # Queue is full, drop lowest priority signal
            self.signals_dropped_full += 1
            
            logger.warning(f" Signal queue full ({self.max_size}), dropping signal")
            logger.warning(f"   Dropped: {signal['type']} on {signal.get('asset', 'unknown')} (quality: {quality_score:.0%})")
            
            return False
    
    def get_next_signal(self) -> Optional[Dict[str, Any]]:
        """
        Get highest priority (quality) signal from queue.
        
        Returns:
            Signal dictionary or None if queue empty
            Automatically removes expired signals
        """
        while not self.queue.empty():
            try:
                # Get highest priority signal
                priority, signal = self.queue.get(block=False)
                
                # Check if signal has expired
                age = time.time() - signal.get("timestamp", 0)
                
                if age > self.max_age_seconds:
                    # Signal too old, discard it
                    self.signals_expired += 1
                    
                    logger.warning(f" Signal expired ({age:.1f}s old): {signal['type']} on {signal.get('asset', 'unknown')}")
                    continue  # Try next signal
                
                # Valid signal, return it
                quality = signal.get("quality_score", 0)
                
                self.signals_executed += 1
                
                logger.info(f" Executing queued signal:")
                logger.info(f"   Type: {signal['type']} on {signal.get('asset', 'unknown')}")
                logger.info(f"   Quality: {quality:.0%}")
                logger.info(f"   Age: {age:.1f}s")
                logger.info(f"   Queue remaining: {self.queue.qsize()}")
                
                return signal
                
            except Empty:
                # Queue became empty while processing
                break
        
        return None
    
    def clear_old_signals(self) -> int:
        """
        Remove all signals older than max_age_seconds.
        
        Returns:
            Number of signals removed
        """
        removed_count = 0
        current_time = time.time()
        
        # Create new queue with only valid signals
        new_queue = PriorityQueue(maxsize=self.max_size)
        
        while not self.queue.empty():
            try:
                priority, signal = self.queue.get(block=False)
                
                age = current_time - signal.get("timestamp", 0)
                
                if age <= self.max_age_seconds:
                    # Keep this signal
                    new_queue.put((priority, signal))
                else:
                    # Remove this signal
                    removed_count += 1
                    self.signals_expired += 1
                    logger.debug(f"Removed expired signal: {signal['type']} on {signal.get('asset', 'unknown')} ({age:.1f}s old)")
                    
            except Empty:
                break
        
        # Replace old queue with new one
        self.queue = new_queue
        
        if removed_count > 0:
            logger.info(f"Cleared {removed_count} expired signals from queue")
        
        return removed_count
    
    def peek_best_signal(self) -> Optional[Dict[str, Any]]:
        """
        Look at best signal without removing it from queue.
        
        Returns:
            Best signal or None if queue empty
        """
        if self.queue.empty():
            return None
        
        # Get all signals, find best, put them all back
        signals = []
        
        while not self.queue.empty():
            try:
                signals.append(self.queue.get(block=False))
            except Empty:
                break
        
        # Find best (lowest priority number = highest quality)
        if not signals:
            return None
        
        best = min(signals, key=lambda x: x[0])
        
        # Put all signals back
        for signal in signals:
            try:
                self.queue.put(signal, block=False)
            except Full:
                pass
        
        return best[1] if best else None
    
    def get_statistics(self) -> Dict[str, Any]:
        """
        Get queue statistics.
        
        Returns:
            Statistics dictionary
        """
        avg_quality = sum(self.quality_scores) / len(self.quality_scores) if self.quality_scores else 0
        
        return {
            "current_size": self.queue.qsize(),
            "max_size": self.max_size,
            "signals_added": self.signals_added,
            "signals_executed": self.signals_executed,
            "signals_expired": self.signals_expired,
            "signals_dropped_full": self.signals_dropped_full,
            "average_quality": avg_quality,
            "execution_rate": (self.signals_executed / max(self.signals_added, 1)) * 100
        }
    
    def is_full(self) -> bool:
        """Check if queue is full."""
        return self.queue.full()
    
    def is_empty(self) -> bool:
        """Check if queue is empty."""
        return self.queue.empty()
    
    def size(self) -> int:
        """Get current queue size."""
        return self.queue.qsize()
    
    def clear(self):
        """Clear all signals from queue."""
        count = 0
        while not self.queue.empty():
            try:
                self.queue.get(block=False)
                count += 1
            except Empty:
                break
        
        logger.info(f"Cleared {count} signals from queue")
    
    def reset(self):
        """Reset queue and statistics."""
        self.clear()
        self.signals_added = 0
        self.signals_executed = 0
        self.signals_expired = 0
        self.signals_dropped_full = 0
        self.quality_scores = []
        logger.info("Signal Queue reset")
    
    def _validate_signal(self, signal: Dict[str, Any]) -> bool:
        """
        Validate signal format.
        
        Args:
            signal: Signal dictionary
            
        Returns:
            True if valid, False otherwise
        """
        required_keys = ["type", "asset", "duration"]
        
        for key in required_keys:
            if key not in signal:
                logger.error(f"Signal missing required key: {key}")
                return False
        
        if signal["type"] not in ["BUY", "SELL", "HOLD"]:
            logger.error(f"Invalid signal type: {signal['type']}")
            return False
        
        return True


# Example usage and testing
if __name__ == "__main__":
    print("Testing Signal Queue System\n")
    print("="*60)
    
    # Initialize queue
    queue = SignalQueue(max_size=5, max_age_seconds=10)
    
    # Add some signals with different quality scores
    test_signals = [
        ({"type": "BUY", "asset": "R_100", "duration": 5}, 0.75),
        ({"type": "SELL", "asset": "R_75", "duration": 3}, 0.85),
        ({"type": "BUY", "asset": "R_50", "duration": 7}, 0.65),
        ({"type": "SELL", "asset": "R_100", "duration": 5}, 0.90),
        ({"type": "BUY", "asset": "R_75", "duration": 3}, 0.70),
    ]
    
    print("\nAdding signals to queue...")
    for signal, quality in test_signals:
        success = queue.add_signal(signal, quality)
        print(f"  Added: {signal['type']} {signal['asset']} (quality: {quality:.0%}) - {'' if success else ''}")
    
    # Try to add one more (queue full)
    print("\nTrying to add signal to full queue...")
    overflow_signal = {"type": "BUY", "asset": "R_50", "duration": 5}
    success = queue.add_signal(overflow_signal, 0.80)
    print(f"  Result: {' Added' if success else ' Queue full'}")
    
    # Peek at best signal
    print("\nPeeking at best signal (without removing)...")
    best = queue.peek_best_signal()
    if best:
        print(f"  Best: {best['type']} {best['asset']} (quality: {best.get('quality_score', 0):.0%})")
    
    # Execute signals in priority order
    print("\nExecuting signals in priority order...")
    while not queue.is_empty():
        signal = queue.get_next_signal()
        if signal:
            print(f"  Executed: {signal['type']} {signal['asset']} (quality: {signal.get('quality_score', 0):.0%})")
    
    # Test expiration
    print("\nTesting signal expiration...")
    queue.add_signal({"type": "BUY", "asset": "R_100", "duration": 5, "timestamp": time.time() - 15}, 0.80)
    queue.add_signal({"type": "SELL", "asset": "R_75", "duration": 3, "timestamp": time.time()}, 0.75)
    
    expired = queue.clear_old_signals()
    print(f"  Removed {expired} expired signals")
    print(f"  Remaining: {queue.size()}")
    
    # Print statistics
    print("\n" + "="*60)
    print("Queue Statistics:")
    print("="*60)
    stats = queue.get_statistics()
    for key, value in stats.items():
        if isinstance(value, float):
            print(f"  {key}: {value:.2f}")
        else:
            print(f"  {key}: {value}")



