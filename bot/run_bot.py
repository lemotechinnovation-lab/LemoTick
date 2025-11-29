#!/usr/bin/env python3
"""
LemoTick Bot Runner
Entry point for the enterprise-grade trading bot
"""

import os
import sys
import traceback
from pathlib import Path

# Add the src directory to Python path
src_path = Path(__file__).parent / "src"
sys.path.insert(0, str(src_path))

# Import and run the main bot
if __name__ == "__main__":
    import asyncio

    from main import main

    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nBot stopped by user")
    except Exception as e:
        print(f"Fatal error: {e}")
        print("\nFull traceback:")
        traceback.print_exc()
        sys.exit(1)
