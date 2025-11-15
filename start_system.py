#!/usr/bin/env python3
"""
LemoTick Investor Management System Startup Script
Starts all components of the enterprise-grade investment platform
"""

import subprocess
import sys
import time
import os
from pathlib import Path

def run_command(command, cwd=None, background=False):
    """Run a command and return the process"""
    print(f"Running: {command}")
    if background:
        return subprocess.Popen(command, shell=True, cwd=cwd)
    else:
        return subprocess.run(command, shell=True, cwd=cwd)

def check_dependencies():
    """Check if required dependencies are installed"""
    print("Checking dependencies...")
    
    # Check Python version
    if sys.version_info < (3, 9):
        print("Error: Python 3.9+ is required")
        return False
    
    # Check if .NET is installed
    try:
        result = subprocess.run(["dotnet", "--version"], capture_output=True, text=True)
        if result.returncode != 0:
            print("Warning: .NET SDK not found. Backend will not start.")
    except FileNotFoundError:
        print("Warning: .NET SDK not found. Backend will not start.")
    
    # Check if Node.js is installed
    try:
        result = subprocess.run(["node", "--version"], capture_output=True, text=True)
        if result.returncode != 0:
            print("Warning: Node.js not found. Frontend will not start.")
    except FileNotFoundError:
        print("Warning: Node.js not found. Frontend will not start.")
    
    return True

def start_backend():
    """Start the .NET Core backend"""
    print("Starting .NET Core backend...")
    backend_path = Path("backend")
    if backend_path.exists():
        return run_command("dotnet run --project API", cwd=backend_path, background=True)
    else:
        print("Backend directory not found")
        return None

def start_bot():
    """Start the Python trading bot"""
    print("Starting Python trading bot...")
    bot_path = Path("bot")
    if bot_path.exists():
        return run_command("python run_bot.py", cwd=bot_path, background=True)
    else:
        print("Bot directory not found")
        return None

def start_frontend():
    """Start the React frontend applications"""
    print("Starting React frontend applications...")
    
    # Start investor portal
    investor_portal_path = Path("frontend/investor-portal")
    if investor_portal_path.exists():
        investor_process = run_command("npm start", cwd=investor_portal_path, background=True)
    else:
        print("Investor portal not found")
        investor_process = None
    
    # Start admin dashboard
    admin_dashboard_path = Path("frontend/admin-dashboard")
    if admin_dashboard_path.exists():
        admin_process = run_command("npm start", cwd=admin_dashboard_path, background=True)
    else:
        print("Admin dashboard not found")
        admin_process = None
    
    return investor_process, admin_process

def main():
    """Main startup function"""
    print("🚀 Starting LemoTick Investor Management System...")
    print("=" * 60)
    
    # Check dependencies
    if not check_dependencies():
        sys.exit(1)
    
    processes = []
    
    try:
        # Start backend
        backend_process = start_backend()
        if backend_process:
            processes.append(("Backend", backend_process))
            time.sleep(5)  # Give backend time to start
        
        # Start bot
        bot_process = start_bot()
        if bot_process:
            processes.append(("Bot", bot_process))
            time.sleep(2)  # Give bot time to start
        
        # Start frontend (if available)
        investor_process, admin_process = start_frontend()
        if investor_process:
            processes.append(("Investor Portal", investor_process))
        if admin_process:
            processes.append(("Admin Dashboard", admin_process))
        
        print("\n✅ System started successfully!")
        print("=" * 60)
        print("Components running:")
        for name, process in processes:
            if process and process.poll() is None:
                print(f"  ✅ {name}")
            else:
                print(f"  ❌ {name} (failed to start)")
        
        print("\nPress Ctrl+C to stop all components...")
        
        # Keep running until interrupted
        while True:
            time.sleep(1)
            
            # Check if any process has died
            for name, process in processes:
                if process and process.poll() is not None:
                    print(f"⚠️  {name} has stopped unexpectedly")
    
    except KeyboardInterrupt:
        print("\n🛑 Stopping all components...")
        
        # Stop all processes
        for name, process in processes:
            if process and process.poll() is None:
                print(f"Stopping {name}...")
                process.terminate()
                try:
                    process.wait(timeout=5)
                except subprocess.TimeoutExpired:
                    process.kill()
        
        print("✅ All components stopped")
    
    except Exception as e:
        print(f"❌ Error starting system: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
