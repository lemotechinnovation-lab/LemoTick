@echo off
REM Quick setup for mobile monitoring via Ngrok + Grafana

echo.
echo ====================================================================
echo    LemoTick Mobile Monitoring Setup
echo ====================================================================
echo.
echo This will expose your Grafana dashboard to your mobile phone
echo using Ngrok (secure tunnel).
echo.
echo Prerequisites:
echo   1. Bot must be running (Grafana on port 3000)
echo   2. Ngrok installed (download from ngrok.com)
echo.
echo ====================================================================
echo.

REM Check if Ngrok is installed
where ngrok >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Ngrok not found!
    echo.
    echo Please install Ngrok:
    echo   1. Visit: https://ngrok.com/download
    echo   2. Download ngrok for Windows
    echo   3. Extract to C:\ngrok\ (or add to PATH)
    echo   4. Sign up at: https://dashboard.ngrok.com/signup
    echo   5. Get auth token: https://dashboard.ngrok.com/get-started/your-authtoken
    echo   6. Run: ngrok config add-authtoken YOUR_TOKEN
    echo.
    pause
    exit /b 1
)

echo [OK] Ngrok is installed
echo.

REM Check if bot is running (Grafana should be on port 3000)
echo Checking if Grafana is running on port 3000...
netstat -an | find ":3000" | find "LISTENING" >nul 2>nul
if %errorlevel% neq 0 (
    echo.
    echo [WARNING] Grafana does not appear to be running on port 3000
    echo.
    echo Please start your LemoTick bot first:
    echo   python run_bot.py
    echo.
    echo Then run this script again.
    echo.
    pause
    exit /b 1
)

echo [OK] Grafana is running on port 3000
echo.

echo ====================================================================
echo Starting Ngrok Tunnel...
echo ====================================================================
echo.
echo This will create a public URL you can access from your phone.
echo The URL will be displayed below (looks like: https://abc123.ngrok.io)
echo.
echo Keep this window open while you want mobile access!
echo.
echo ====================================================================
echo.

REM Start Ngrok
ngrok http 3000

REM When Ngrok stops, show message
echo.
echo Ngrok tunnel closed.
echo Mobile access is no longer available.
echo.
pause

