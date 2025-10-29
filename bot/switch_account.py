#!/usr/bin/env python3
"""
LemoTick Account Switcher
Easily switch between demo and real trading accounts
"""

import os
import sys
import shutil
import argparse
from pathlib import Path
import subprocess
import time

SCRIPT_DIR = Path(__file__).parent.absolute()
CONFIG_DIR = SCRIPT_DIR / "config"
DEMO_ENV = CONFIG_DIR / "credentials.demo.env"
LIVE_ENV = CONFIG_DIR / "credentials.live.env"
TARGET_ENV = CONFIG_DIR / "credentials.env"

def switch_account(mode):
    """Switch between demo and real accounts"""
    if not DEMO_ENV.exists():
        print(f"Error: Demo credentials file not found: {DEMO_ENV}")
        return False
    
    if not LIVE_ENV.exists():
        print(f"Error: Live credentials file not found: {LIVE_ENV}")
        return False
    
    # Determine source file based on mode
    if mode.lower() == "demo":
        source = DEMO_ENV
        account_type = "DEMO"
        color = "\033[94m"  # Blue
    elif mode.lower() == "real" or mode.lower() == "live":
        source = LIVE_ENV
        account_type = "REAL"
        color = "\033[91m"  # Red
    else:
        print(f"Invalid mode: {mode}. Use 'demo' or 'real'.")
        return False
    
    reset_color = "\033[0m"
    
    # Backup existing credentials file if it exists
    if TARGET_ENV.exists():
        backup_file = TARGET_ENV.with_suffix('.env.backup')
        shutil.copy2(TARGET_ENV, backup_file)
        print(f"Backed up current config to {backup_file}")
    
    # Copy selected config to target
    shutil.copy2(source, TARGET_ENV)
    
    print(f"{color}> Switched to {account_type} account mode{reset_color}")
    print(f"Using credentials from: {source.name}")
    
    # Check if docker is running
    try:
        result = subprocess.run(
            ["docker", "ps", "--filter", "name=lemotick-bot", "--format", "{{.Names}}"],
            capture_output=True, 
            text=True
        )
        
        if "lemotick-bot" in result.stdout:
            print("ℹ️ Bot container is running, restarting to apply changes...")
            restart_cmd = ["docker", "restart", "lemotick-bot"]
            subprocess.run(restart_cmd, check=True)
            
            # Wait a moment for the container to restart
            time.sleep(2)
            
            # Check the account mode from the logs
            check_cmd = ["docker", "logs", "lemotick-bot", "--tail", "20"]
            log_result = subprocess.run(check_cmd, capture_output=True, text=True)
            
            # Look for account type in logs
            if "REAL ACCOUNT MODE" in log_result.stdout or "REAL / LIVE" in log_result.stdout:
                print(f"{color}Bot restarted in REAL account mode{reset_color}")
            elif "DEMO ACCOUNT MODE" in log_result.stdout:
                print(f"{color}Bot restarted in DEMO account mode{reset_color}")
            else:
                print("Bot container restarted")
            
            return True
        else:
            print("Bot container is not running. Start it to apply changes.")
            print("Run: docker compose up -d")
            return True
            
    except Exception as e:
        print(f"Could not check Docker status: {e}")
        print("You may need to restart the bot manually: docker compose down && docker compose up -d")
        return True

def check_current_account():
    """Display current account mode"""
    if not TARGET_ENV.exists():
        print("❌ No active configuration found")
        return
    
    with open(TARGET_ENV, 'r') as f:
        content = f.read()
    
    if "LEMOTICK_LIVE_ACCOUNT=true" in content:
        color = "\033[91m"  # Red
        account_type = "REAL"
    else:
        color = "\033[94m"  # Blue
        account_type = "DEMO"
    
    reset_color = "\033[0m"
    print(f"{color}Current account mode: {account_type}{reset_color}")
    
    # Check if bot is running
    try:
        result = subprocess.run(
            ["docker", "ps", "--filter", "name=lemotick-bot", "--format", "{{.Names}}"],
            capture_output=True, 
            text=True
        )
        
        if "lemotick-bot" in result.stdout:
            print("Bot status: Running")
        else:
            print("Bot status: Not running")
            
    except Exception:
        print("Bot status: Unknown (Could not check Docker)")

def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(description='LemoTick Account Switcher')
    parser.add_argument('mode', nargs='?', choices=['demo', 'real', 'status'], 
                      help='Account mode to switch to (demo or real) or check status')
    
    args = parser.parse_args()
    
    print("\n" + "=" * 60)
    print("  _                     _____ _      _    ")
    print(" | |    ___ _ __ ___   |_   _(_) ___| | __")
    print(" | |   / _ \\ '_ ` _ \\    | | | |/ __| |/ /")
    print(" | |__|  __/ | | | | |   | | | | (__|   < ")
    print(" |_____\\___|_| |_| |_|   |_| |_|\\___|_|\\_\\")
    print("                                          ")
    print("  Account Switcher v1.0")
    print("=" * 60)
    
    if args.mode == 'status' or args.mode is None:
        check_current_account()
    else:
        switch_account(args.mode)
    
    print("=" * 60)

if __name__ == "__main__":
    main()
