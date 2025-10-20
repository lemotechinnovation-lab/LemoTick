
import json
import time
from collections import deque

class MemoryTickProcessor:
    """Process ticks in memory without database."""
    
    def __init__(self, max_ticks=1000):
        self.tick_buffer = deque(maxlen=max_ticks)
        self.last_tick_time = 0
        self.tick_count = 0
        
    def process_tick(self, tick_data):
        """Process tick data in memory."""
        try:
            current_time = time.time()
            
            # Add tick to buffer
            self.tick_buffer.append({
                'timestamp': current_time,
                'price': tick_data.get('quote', 0),
                'symbol': tick_data.get('symbol', 'R_100')
            })
            
            self.tick_count += 1
            self.last_tick_time = current_time
            
            # Process for trading signals (simplified)
            if len(self.tick_buffer) >= 10:  # Need at least 10 ticks
                self.analyze_trend()
                
            return True
            
        except Exception as e:
            print(f"Error processing tick: {e}")
            return False
    
    def analyze_trend(self):
        """Simple trend analysis on recent ticks."""
        if len(self.tick_buffer) < 10:
            return
            
        recent_ticks = list(self.tick_buffer)[-10:]
        prices = [tick['price'] for tick in recent_ticks]
        
        # Simple moving average
        avg_price = sum(prices) / len(prices)
        current_price = prices[-1]
        
        # Generate signal based on price vs average
        if current_price > avg_price * 1.001:  # 0.1% above average
            self.generate_buy_signal()
        elif current_price < avg_price * 0.999:  # 0.1% below average
            self.generate_sell_signal()
    
    def generate_buy_signal(self):
        """Generate buy signal."""
        print(f"BUY SIGNAL: Tick {self.tick_count}")
        # Here you would trigger actual trade execution
        
    def generate_sell_signal(self):
        """Generate sell signal."""
        print(f"SELL SIGNAL: Tick {self.tick_count}")
        # Here you would trigger actual trade execution

# Global tick processor
tick_processor = MemoryTickProcessor()
