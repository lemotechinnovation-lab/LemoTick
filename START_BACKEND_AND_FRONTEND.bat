@echo off
echo ========================================
echo Starting LemoTick Backend and Frontend
echo ========================================
echo.

REM Check if database is running
echo [1/5] Checking database...
docker ps | findstr "lemotick-investor-postgres" > nul
if errorlevel 1 (
    echo Database not running. Starting database...
    cd /d "%~dp0backend"
    docker compose -f docker-compose.postgres.yml up -d
    echo Waiting for database to be ready...
    timeout /t 10 /nobreak > nul
) else (
    echo Database is already running!
)
echo.

REM Start Backend API in new window
echo [2/5] Starting Backend API...
cd /d "%~dp0backend\API"
start "LemoTick Backend API" powershell -NoExit -Command "Write-Host 'Starting Backend API...' -ForegroundColor Green; dotnet run; Read-Host 'Press Enter to close'"
echo Backend starting in new window...
echo Waiting 15 seconds for backend to start...
timeout /t 15 /nobreak > nul
echo.

REM Start Frontend in new window  
echo [3/5] Starting Frontend...
cd /d "%~dp0frontend"
start "LemoTick Frontend" cmd /k "echo Starting Frontend... && npm run dev"
echo Frontend starting in new window...
echo.

REM Wait a bit for everything to start
echo [4/5] Waiting for systems to initialize...
timeout /t 5 /nobreak > nul
echo.

REM Show access URLs
echo [5/5] Systems Started!
echo ========================================
echo.
echo BACKEND API:
echo   URL: https://localhost:5000
echo   Swagger: https://localhost:5000/swagger
echo.
echo FRONTEND:
echo   URL: http://localhost:5173
echo   (May take a minute to compile)
echo.
echo DATABASE:
echo   PgAdmin: http://localhost:5050
echo.
echo TRADING BOT:
echo   Grafana: http://localhost:3000
echo.
echo ========================================
echo.
echo TIP: If you see certificate warning in browser:
echo   Click "Advanced" then "Proceed to localhost"
echo.
echo TIP: Close this window when done testing
echo.
pause


