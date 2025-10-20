#!/usr/bin/env python3
"""
LemoTick Monitoring Quick Start
Starts the monitoring stack and bot with monitoring enabled
"""

import subprocess
import sys
import time
from pathlib import Path


def check_docker():
    """Check if Docker is available."""
    try:
        result = subprocess.run(['docker', '--version'], 
                              capture_output=True, text=True)
        return result.returncode == 0
    except FileNotFoundError:
        return False


def start_monitoring_stack():
    """Start the monitoring stack."""
    print("🚀 Starting LemoTick monitoring stack...")
    
    try:
        # Start monitoring services
        result = subprocess.run([
            'docker-compose', '-f', 'docker-compose.monitoring.yml', 'up', '-d'
        ], capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ Monitoring stack started successfully!")
            return True
        else:
            print(f"❌ Failed to start monitoring stack: {result.stderr}")
            return False
            
    except Exception as e:
        print(f"❌ Error starting monitoring stack: {e}")
        return False


def start_bot():
    """Start the LemoTick bot."""
    print("\n🤖 Starting LemoTick bot with monitoring...")
    
    try:
        # Start the bot
        result = subprocess.run([sys.executable, '-m', 'src'], 
                              capture_output=False, text=True)
        return result.returncode == 0
    except KeyboardInterrupt:
        print("\n⏹️ Bot stopped by user")
        return True
    except Exception as e:
        print(f"❌ Error starting bot: {e}")
        return False


def show_monitoring_info():
    """Show monitoring information."""
    print("\n" + "=" * 60)
    print("LEMOTICK MONITORING ACTIVE")
    print("=" * 60)
    
    print("\n📊 MONITORING SERVICES:")
    print("   • Prometheus: Metrics collection")
    print("   • Loki: Log aggregation")
    print("   • Grafana: Visualization")
    print("   • Promtail: Log shipping")
    
    print("\n🌐 ACCESS URLs:")
    print("   • Grafana Dashboard: http://localhost:3000")
    print("   • Prometheus Metrics: http://localhost:9090")
    print("   • Loki Logs: http://localhost:3100")
    print("   • Bot Metrics: http://localhost:8000/metrics")
    
    print("\n🔑 CREDENTIALS:")
    print("   • Grafana: admin / admin")
    print("   • Prometheus: No authentication")
    print("   • Loki: No authentication")
    
    print("\n📈 DASHBOARD FEATURES:")
    print("   • Real-time trading performance")
    print("   • Technical indicator monitoring")
    print("   • System health metrics")
    print("   • Risk management alerts")
    print("   • Signal generation tracking")
    
    print("\n🚨 ALERTING:")
    print("   • High drawdown alerts")
    print("   • WebSocket disconnection")
    print("   • Performance issues")
    print("   • Trading activity monitoring")
    
    print("\n🎯 NEXT STEPS:")
    print("   1. Open Grafana: http://localhost:3000")
    print("   2. Import LemoTick dashboard")
    print("   3. Monitor real-time metrics")
    print("   4. Set up alert notifications")
    print("   5. Customize dashboards as needed")


def main():
    """Main function."""
    print("LEMOTICK MONITORING QUICK START")
    print("=" * 40)
    
    # Check prerequisites
    if not check_docker():
        print("❌ Docker is required for monitoring setup")
        print("   Please install Docker Desktop and try again")
        sys.exit(1)
    
    # Start monitoring stack
    if not start_monitoring_stack():
        print("❌ Failed to start monitoring stack")
        sys.exit(1)
    
    # Wait for services to be ready
    print("⏳ Waiting for services to initialize...")
    time.sleep(10)
    
    # Show monitoring info
    show_monitoring_info()
    
    # Ask if user wants to start the bot
    try:
        start_bot_choice = input("\n🤖 Start LemoTick bot now? (y/n): ").strip().lower()
        
        if start_bot_choice in ['y', 'yes']:
            start_bot()
        else:
            print("\n📝 To start the bot later, run:")
            print("   python -m src")
            print("\n📊 To view monitoring:")
            print("   Open http://localhost:3000 in your browser")
            
    except KeyboardInterrupt:
        print("\n👋 Goodbye!")


if __name__ == "__main__":
    main()
