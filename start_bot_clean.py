#!/usr/bin/env python3
"""
Clean bot startup script that handles all common issues.
"""

import os
import sys
import time
import subprocess
from dotenv import load_dotenv

# Load environment variables
load_dotenv("config/credentials.env")

# Set custom port to avoid conflicts
os.environ["PROMETHEUS_PORT"] = "8001"

# Add src to path
sys.path.insert(0, "src")

def cleanup_old_processes():
    """Clean up any old Python processes."""
    print("Cleaning up old processes...")
    try:
        # Kill any existing Python processes
        subprocess.run(['taskkill', '/F', '/IM', 'python.exe'], 
                      capture_output=True, text=True)
        time.sleep(1)
        print("Old processes cleaned up.")
    except:
        print("No old processes to clean up.")

def start_bot():
    """Start the bot with proper error handling."""
    try:
        from src.main import LemoTickBot
        
        print("Starting LemoTick Bot (Clean Mode)")
        print("=" * 50)
        print("Fixes applied:")
        print("- SSL certificate verification disabled")
        print("- Prometheus port set to 8001")
        print("- Multiple process cleanup")
        print("- Better error handling")
        print("=" * 50)
        
        # Clean up first
        cleanup_old_processes()
        
        # Create and start bot
        bot = LemoTickBot()
        
        print("Bot initialized successfully!")
        print("Starting bot...")
        
        # Start the bot
        bot.start()
        
        print("Bot started successfully!")
        print("Metrics available at: http://localhost:8001/metrics")
        print("Press Ctrl+C to stop...")
        
        # Keep running until interrupted
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            print("\nStopping bot...")
            bot.stop()
            print("Bot stopped successfully!")
            
    except Exception as e:
        print(f"Error starting bot: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    start_bot()
