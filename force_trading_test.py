#!/usr/bin/env python3
"""
Force trading test - modify bot to trade immediately for testing
"""

import os
import sys
import time
import json

# Add src to path
sys.path.insert(0, 'src')

def modify_strategy_for_testing():
    """Modify strategy to be more aggressive for testing"""
    
    # Read current strategy file
    strategy_file = 'src/strategy.py'
    
    if not os.path.exists(strategy_file):
        print("Strategy file not found!")
        return False
    
    with open(strategy_file, 'r') as f:
        content = f.read()
    
    # Create backup
    with open('src/strategy.py.backup', 'w') as f:
        f.write(content)
    
    # Modify strategy to be more aggressive
    modified_content = content.replace(
        'def should_trade(self, tick_data: Dict[str, Any]) -> bool:',
        '''def should_trade(self, tick_data: Dict[str, Any]) -> bool:
        # FORCE TRADING FOR TESTING - REMOVE IN PRODUCTION
        return True'''
    )
    
    # Write modified content
    with open(strategy_file, 'w') as f:
        f.write(modified_content)
    
    print("✅ Strategy modified for aggressive trading")
    return True

def restore_strategy():
    """Restore original strategy"""
    if os.path.exists('src/strategy.py.backup'):
        with open('src/strategy.py.backup', 'r') as f:
            content = f.read()
        
        with open('src/strategy.py', 'w') as f:
            f.write(content)
        
        os.remove('src/strategy.py.backup')
        print("✅ Strategy restored to original")

if __name__ == "__main__":
    print("🔧 Force Trading Test")
    print("1. Modifying strategy for aggressive trading...")
    
    if modify_strategy_for_testing():
        print("✅ Strategy modified - bot should trade immediately")
        print("⚠️  Remember to restore strategy after testing!")
        
        # Wait for user input
        input("Press Enter to restore original strategy...")
        restore_strategy()
    else:
        print("❌ Failed to modify strategy")
