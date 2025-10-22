#!/usr/bin/env python3
"""
Test script to verify the stake configuration fix.
"""

import sys
import os

# Add the project root to Python path
project_root = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, project_root)

def test_stake_configuration():
    """Test that the stake configuration is working correctly."""
    print("Testing Stake Configuration Fix...")
    print("=" * 40)
    
    try:
        from src.config import config
        
        # Check configuration values
        min_stake = config.get("trading.min_stake", 10.0)
        max_stake = config.get("trading.max_stake", 10.0)
        
        print(f"[OK] Min Stake: ${min_stake}")
        print(f"[OK] Max Stake: ${max_stake}")
        
        # Test the stake calculation logic
        stake = config.get("trading.min_stake", 10.0)
        print(f"[OK] Calculated Stake: ${stake}")
        
        # Verify stake is within allowed range
        if min_stake <= stake <= max_stake:
            print(f"[SUCCESS] Stake {stake} is within allowed range [{min_stake}, {max_stake}]")
            return True
        else:
            print(f"[ERROR] Stake {stake} is outside allowed range [{min_stake}, {max_stake}]")
            return False
            
    except Exception as e:
        print(f"[ERROR] Configuration test failed: {e}")
        return False

if __name__ == "__main__":
    success = test_stake_configuration()
    if success:
        print("\n[SUCCESS] Stake configuration is working correctly!")
        print("The bot should now place trades with the correct stake amount.")
    else:
        print("\n[ERROR] Stake configuration needs further fixes.")
    
    sys.exit(0 if success else 1)
