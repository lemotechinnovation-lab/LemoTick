#!/usr/bin/env python3
"""
LemoTick Bot Runner
Entry point for the enterprise-grade trading bot
"""

import sys
import os
from pathlib import Path

# Add the src directory to Python path
src_path = Path(__file__).parent / "src"
sys.path.insert(0, str(src_path))

# Import and run the main bot
if __name__ == "__main__":
    from main import main
    import asyncio
    
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nBot stopped by user")
    except Exception as e:
        print(f"Fatal error: {e}")
        sys.exit(1)
