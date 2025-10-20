#!/usr/bin/env python3
"""
Fix Grafana loading issues by ensuring Docker is running and services are started.
"""

import subprocess
import time
import webbrowser
import requests
from pathlib import Path

def check_docker_running():
    """Check if Docker is running."""
    try:
        result = subprocess.run(['docker', 'ps'], capture_output=True, text=True)
        return result.returncode == 0
    except:
        return False

def check_port_3001():
    """Check if port 3001 is in use."""
    try:
        result = subprocess.run(['netstat', '-ano'], capture_output=True, text=True)
        return ':3001' in result.stdout
    except:
        return False

def start_docker_desktop():
    """Start Docker Desktop."""
    print("Starting Docker Desktop...")
    try:
        # Try different possible paths for Docker Desktop
        paths = [
            r"C:\Program Files\Docker\Docker\Docker Desktop.exe",
            r"C:\Program Files (x86)\Docker\Docker\Docker Desktop.exe",
            r"C:\Users\{}\AppData\Local\Docker\Docker Desktop.exe".format(subprocess.getoutput('echo %USERNAME%'))
        ]
        
        for path in paths:
            try:
                if Path(path).exists():
                    subprocess.Popen([path])
                    print(f"Docker Desktop started from: {path}")
                    return True
            except:
                continue
        
        print("Could not find Docker Desktop executable.")
        return False
    except Exception as e:
        print(f"Error starting Docker Desktop: {e}")
        return False

def wait_for_docker():
    """Wait for Docker to be ready."""
    print("Waiting for Docker to be ready...")
    for i in range(30):
        if check_docker_running():
            print("✅ Docker is ready!")
            return True
        print(f"Waiting... ({i+1}/30)")
        time.sleep(2)
    return False

def start_monitoring_stack():
    """Start the monitoring stack."""
    print("Starting monitoring stack...")
    try:
        result = subprocess.run([
            'docker-compose', '-f', 'docker-compose.monitoring.yml', 'up', '-d'
        ], capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ Monitoring stack started!")
            return True
        else:
            print(f"❌ Error starting monitoring stack: {result.stderr}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def check_grafana_accessible():
    """Check if Grafana is accessible."""
    try:
        response = requests.get('http://localhost:3001', timeout=5)
        return response.status_code == 200
    except:
        return False

def open_grafana():
    """Open Grafana in browser."""
    print("Opening Grafana...")
    webbrowser.open('http://localhost:3001')

def show_manual_steps():
    """Show manual steps if automatic startup fails."""
    print("\n" + "="*60)
    print("MANUAL STEPS TO FIX GRAFANA:")
    print("="*60)
    print("1. Start Docker Desktop manually:")
    print("   - Press Windows key")
    print("   - Type 'Docker Desktop'")
    print("   - Right-click and 'Run as administrator'")
    print("   - Wait 30-60 seconds for Docker to load")
    print()
    print("2. Start monitoring stack:")
    print("   docker-compose -f docker-compose.monitoring.yml up -d")
    print()
    print("3. Access Grafana:")
    print("   http://localhost:3001")
    print("   Username: admin")
    print("   Password: admin")
    print("="*60)

def main():
    """Main function to fix Grafana loading."""
    print("Grafana Loading Fix")
    print("=" * 40)
    
    # Check if Docker is running
    if not check_docker_running():
        print("❌ Docker Desktop is not running.")
        print("Attempting to start Docker Desktop...")
        
        if not start_docker_desktop():
            print("❌ Could not start Docker Desktop automatically.")
            show_manual_steps()
            return
        
        if not wait_for_docker():
            print("❌ Docker Desktop is taking too long to start.")
            show_manual_steps()
            return
    
    # Check if monitoring stack is running
    print("Checking monitoring stack...")
    try:
        result = subprocess.run(['docker-compose', '-f', 'docker-compose.monitoring.yml', 'ps'], 
                              capture_output=True, text=True)
        if 'grafana' not in result.stdout.lower():
            print("Starting monitoring stack...")
            if not start_monitoring_stack():
                print("❌ Failed to start monitoring stack.")
                show_manual_steps()
                return
        else:
            print("✅ Monitoring stack is already running.")
    except:
        print("Starting monitoring stack...")
        if not start_monitoring_stack():
            print("❌ Failed to start monitoring stack.")
            show_manual_steps()
            return
    
    # Wait for services to be ready
    print("Waiting for services to start...")
    time.sleep(15)
    
    # Check if Grafana is accessible
    if check_grafana_accessible():
        print("✅ Grafana is running and accessible!")
        open_grafana()
    else:
        print("❌ Grafana is not accessible yet.")
        print("Please wait a moment and try accessing: http://localhost:3001")
        print("Default credentials: admin/admin")
        show_manual_steps()

if __name__ == "__main__":
    main()
