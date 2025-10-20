@echo off
echo Starting Docker Desktop...
echo Please wait 30-60 seconds for Docker to fully load.

REM Try to start Docker Desktop
start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"

echo.
echo Docker Desktop is starting...
echo Please wait for it to fully load before running the monitoring stack.
echo.
echo Once Docker is ready, run:
echo docker-compose -f docker-compose.monitoring.yml up -d
echo.
echo Then access Grafana at: http://localhost:3001
echo Username: admin
echo Password: admin
echo.
pause
