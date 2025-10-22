@echo off
echo ========================================
echo Grafana Loading Fix
echo ========================================
echo.

echo Step 1: Starting Docker Desktop...
start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"

echo.
echo Docker Desktop is starting...
echo Please wait 30-60 seconds for Docker to fully load.
echo.

echo Step 2: Waiting for Docker to be ready...
timeout /t 30 /nobreak >nul

echo.
echo Step 3: Starting monitoring stack...
docker-compose -f docker-compose.monitoring.yml up -d

echo.
echo Step 4: Waiting for services to start...
timeout /t 15 /nobreak >nul

echo.
echo Step 5: Opening Grafana...
start http://localhost:3001

echo.
echo ========================================
echo Grafana should now be accessible at:
echo http://localhost:3001
echo Username: admin
echo Password: admin
echo ========================================
echo.

pause
