#!/usr/bin/env python3
"""
LemoTick Monitoring Setup Script
Sets up Prometheus, Loki, and Grafana for monitoring
"""

import os
import sys
import subprocess
from pathlib import Path


def check_docker():
    """Check if Docker is available."""
    try:
        result = subprocess.run(['docker', '--version'], 
                              capture_output=True, text=True)
        if result.returncode == 0:
            print("✅ Docker is available")
            return True
        else:
            print("❌ Docker is not available")
            return False
    except FileNotFoundError:
        print("❌ Docker is not installed")
        return False


def check_docker_compose():
    """Check if Docker Compose is available."""
    try:
        result = subprocess.run(['docker-compose', '--version'], 
                              capture_output=True, text=True)
        if result.returncode == 0:
            print("✅ Docker Compose is available")
            return True
        else:
            print("❌ Docker Compose is not available")
            return False
    except FileNotFoundError:
        print("❌ Docker Compose is not installed")
        return False


def create_monitoring_directories():
    """Create necessary directories for monitoring."""
    directories = [
        "monitoring/grafana/dashboards",
        "monitoring/grafana/datasources",
        "data",
        "logs"
    ]
    
    for directory in directories:
        Path(directory).mkdir(parents=True, exist_ok=True)
        print(f"✅ Created directory: {directory}")


def start_monitoring_stack():
    """Start the monitoring stack."""
    print("\n🚀 Starting LemoTick monitoring stack...")
    
    try:
        # Start monitoring services
        result = subprocess.run([
            'docker-compose', '-f', 'docker-compose.monitoring.yml', 'up', '-d'
        ], capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ Monitoring stack started successfully!")
            print("\n📊 Monitoring URLs:")
            print("   Grafana: http://localhost:3000 (admin/admin)")
            print("   Prometheus: http://localhost:9090")
            print("   Loki: http://localhost:3100")
            print("   Bot Metrics: http://localhost:8000/metrics")
        else:
            print(f"❌ Failed to start monitoring stack: {result.stderr}")
            return False
            
    except Exception as e:
        print(f"❌ Error starting monitoring stack: {e}")
        return False
    
    return True


def show_monitoring_info():
    """Show monitoring information."""
    print("\n" + "=" * 60)
    print("LEMOTICK MONITORING SETUP COMPLETE")
    print("=" * 60)
    
    print("\n📊 MONITORING SERVICES:")
    print("   • Prometheus: Metrics collection and alerting")
    print("   • Loki: Log aggregation and search")
    print("   • Grafana: Visualization and dashboards")
    print("   • Promtail: Log shipping to Loki")
    
    print("\n🌐 ACCESS URLs:")
    print("   • Grafana Dashboard: http://localhost:3000")
    print("   • Prometheus Metrics: http://localhost:9090")
    print("   • Loki Logs: http://localhost:3100")
    print("   • Bot Metrics: http://localhost:8000/metrics")
    
    print("\n🔑 DEFAULT CREDENTIALS:")
    print("   • Grafana: admin / admin")
    print("   • Prometheus: No authentication")
    print("   • Loki: No authentication")
    
    print("\n📈 WHAT YOU CAN MONITOR:")
    print("   • Trading performance and P&L")
    print("   • Signal generation and filtering")
    print("   • WebSocket connection status")
    print("   • Risk management metrics")
    print("   • Technical indicator values")
    print("   • Error rates and system health")
    
    print("\n🚀 NEXT STEPS:")
    print("   1. Start your LemoTick bot: python -m src")
    print("   2. Open Grafana: http://localhost:3000")
    print("   3. Import LemoTick dashboard")
    print("   4. Monitor real-time metrics and logs")


def main():
    """Main setup function."""
    print("LEMOTICK MONITORING SETUP")
    print("=" * 40)
    
    # Check prerequisites
    if not check_docker():
        print("\n❌ Docker is required for monitoring setup")
        print("   Please install Docker Desktop and try again")
        sys.exit(1)
    
    if not check_docker_compose():
        print("\n❌ Docker Compose is required for monitoring setup")
        print("   Please install Docker Compose and try again")
        sys.exit(1)
    
    # Create directories
    print("\n📁 Creating monitoring directories...")
    create_monitoring_directories()
    
    # Start monitoring stack
    print("\n🚀 Starting monitoring services...")
    if start_monitoring_stack():
        show_monitoring_info()
    else:
        print("\n❌ Failed to start monitoring stack")
        print("   Check Docker logs for more information")
        sys.exit(1)


if __name__ == "__main__":
    main()
