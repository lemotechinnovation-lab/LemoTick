@echo off
REM ================================================================================
REM LemoTick Bot Windows Management Script
REM ================================================================================
REM Simple batch file for managing the LemoTick bot
REM Usage: lemotick-manager.bat [start|stop|restart|status|logs|deploy]
REM ================================================================================

setlocal enabledelayedexpansion

set BOT_NAME=LemoTickBot
set SERVICE_NAME=LemoTickBot
set BOT_HOME=C:\LemoTick
set LOG_DIR=C:\LemoTick\logs

REM Colors (limited in batch)
set "GREEN=[92m"
set "RED=[91m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "RESET=[0m"

REM Check if running as administrator
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo %RED%[ERROR]%RESET% This script must be run as Administrator
    echo %BLUE%[INFO]%RESET% Right-click Command Prompt and select 'Run as Administrator'
    pause
    exit /b 1
)

REM Main script logic
if "%1"=="" goto :show_help
if "%1"=="deploy" goto :deploy
if "%1"=="start" goto :start_bot
if "%1"=="stop" goto :stop_bot
if "%1"=="restart" goto :restart_bot
if "%1"=="status" goto :show_status
if "%1"=="logs" goto :show_logs
if "%1"=="health" goto :health_check
if "%1"=="help" goto :show_help
goto :show_help

:deploy
echo %GREEN%[%date% %time%]%RESET% Starting LemoTick Bot deployment...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo %YELLOW%[WARNING]%RESET% Python not found. Please install Python 3.9+ first.
    echo %BLUE%[INFO]%RESET% Download from: https://www.python.org/downloads/
    pause
    exit /b 1
)

REM Install dependencies
echo %GREEN%[INFO]%RESET% Installing Python packages...
pip install --upgrade pip
pip install -r bot\requirements.txt
if %errorlevel% neq 0 (
    echo %RED%[ERROR]%RESET% Failed to install Python packages
    pause
    exit /b 1
)

REM Create directories
echo %GREEN%[INFO]%RESET% Creating directories...
if not exist "%BOT_HOME%" mkdir "%BOT_HOME%"
if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"
if not exist "%BOT_HOME%\config" mkdir "%BOT_HOME%\config"
if not exist "%BOT_HOME%\data" mkdir "%BOT_HOME%\data"
if not exist "%BOT_HOME%\backups" mkdir "%BOT_HOME%\backups"

REM Copy bot files
echo %GREEN%[INFO]%RESET% Copying bot files...
xcopy /E /I /Y "bot\*" "%BOT_HOME%\"
if %errorlevel% neq 0 (
    echo %RED%[ERROR]%RESET% Failed to copy bot files
    pause
    exit /b 1
)

REM Create Windows Service
echo %GREEN%[INFO]%RESET% Creating Windows Service...
sc query "%SERVICE_NAME%" >nul 2>&1
if %errorlevel% equ 0 (
    echo %YELLOW%[WARNING]%RESET% Service %SERVICE_NAME% already exists
) else (
    sc create "%SERVICE_NAME%" binPath= "python.exe \"%BOT_HOME%\run_bot.py\"" start= auto DisplayName= "LemoTick Trading Bot"
    if %errorlevel% neq 0 (
        echo %RED%[ERROR]%RESET% Failed to create Windows Service
        pause
        exit /b 1
    )
    echo %GREEN%[SUCCESS]%RESET% Windows Service created
)

echo.
echo %GREEN%[SUCCESS]%RESET% Deployment completed successfully!
echo %BLUE%[INFO]%RESET% Bot is ready to start. Use: lemotick-manager.bat start
echo.
pause
goto :eof

:start_bot
echo %GREEN%[%date% %time%]%RESET% Starting LemoTick Bot...
echo.

sc query "%SERVICE_NAME%" | find "RUNNING" >nul
if %errorlevel% equ 0 (
    echo %YELLOW%[WARNING]%RESET% Bot is already running
    goto :eof
)

sc start "%SERVICE_NAME%"
if %errorlevel% equ 0 (
    timeout /t 3 /nobreak >nul
    sc query "%SERVICE_NAME%" | find "RUNNING" >nul
    if %errorlevel% equ 0 (
        echo %GREEN%[SUCCESS]%RESET% Bot started successfully
        echo %BLUE%[INFO]%RESET% Bot is now running and trading
    ) else (
        echo %RED%[ERROR]%RESET% Bot failed to start
        sc query "%SERVICE_NAME%"
    )
) else (
    echo %RED%[ERROR]%RESET% Failed to start bot service
)
echo.
pause
goto :eof

:stop_bot
echo %GREEN%[%date% %time%]%RESET% Stopping LemoTick Bot...
echo.

sc query "%SERVICE_NAME%" | find "RUNNING" >nul
if %errorlevel% neq 0 (
    echo %YELLOW%[WARNING]%RESET% Bot is not running
    goto :eof
)

sc stop "%SERVICE_NAME%"
if %errorlevel% equ 0 (
    timeout /t 3 /nobreak >nul
    sc query "%SERVICE_NAME%" | find "STOPPED" >nul
    if %errorlevel% equ 0 (
        echo %GREEN%[SUCCESS]%RESET% Bot stopped successfully
        echo %BLUE%[INFO]%RESET% Bot is now stopped and not trading
    ) else (
        echo %RED%[ERROR]%RESET% Bot failed to stop properly
        sc query "%SERVICE_NAME%"
    )
) else (
    echo %RED%[ERROR]%RESET% Failed to stop bot service
)
echo.
pause
goto :eof

:restart_bot
echo %GREEN%[%date% %time%]%RESET% Restarting LemoTick Bot...
echo.

sc stop "%SERVICE_NAME%"
timeout /t 3 /nobreak >nul
sc start "%SERVICE_NAME%"
if %errorlevel% equ 0 (
    timeout /t 3 /nobreak >nul
    sc query "%SERVICE_NAME%" | find "RUNNING" >nul
    if %errorlevel% equ 0 (
        echo %GREEN%[SUCCESS]%RESET% Bot restarted successfully
        echo %BLUE%[INFO]%RESET% Bot is now running with updated configuration
    ) else (
        echo %RED%[ERROR]%RESET% Bot failed to restart
        sc query "%SERVICE_NAME%"
    )
) else (
    echo %RED%[ERROR]%RESET% Failed to restart bot service
)
echo.
pause
goto :eof

:show_status
echo %GREEN%[%date% %time%]%RESET% LemoTick Bot Status:
echo.

REM Service status
echo %BLUE%[INFO]%RESET% Service Status:
sc query "%SERVICE_NAME%"
echo.

REM Process info
echo %BLUE%[INFO]%RESET% Process Information:
tasklist /FI "IMAGENAME eq python.exe" /FO TABLE
echo.

REM Memory usage
echo %BLUE%[INFO]%RESET% Memory Usage:
wmic process where "name='python.exe'" get ProcessId,WorkingSetSize,PageFileUsage /format:table
echo.

REM Recent logs
echo %BLUE%[INFO]%RESET% Recent Logs:
if exist "%LOG_DIR%\runtime.log" (
    powershell -Command "Get-Content '%LOG_DIR%\runtime.log' -Tail 10"
) else (
    echo %YELLOW%[WARNING]%RESET% Log file not found: %LOG_DIR%\runtime.log
)
echo.
pause
goto :eof

:show_logs
echo %GREEN%[%date% %time%]%RESET% Showing bot logs...
echo.

if exist "%LOG_DIR%\runtime.log" (
    echo %BLUE%[INFO]%RESET% Press Ctrl+C to exit log viewer
    echo.
    powershell -Command "Get-Content '%LOG_DIR%\runtime.log' -Wait -Tail 50"
) else (
    echo %YELLOW%[WARNING]%RESET% Log file not found: %LOG_DIR%\runtime.log
    pause
)
goto :eof

:health_check
echo %GREEN%[%date% %time%]%RESET% Performing health check...
echo.

REM Check service status
sc query "%SERVICE_NAME%" | find "RUNNING" >nul
if %errorlevel% equ 0 (
    echo %GREEN%[OK]%RESET% Service: Running
) else (
    echo %RED%[ERROR]%RESET% Service: Not running
    goto :eof
)

REM Check memory usage
for /f "tokens=2" %%i in ('wmic process where "name='python.exe'" get WorkingSetSize /value ^| find "WorkingSetSize"') do set MEMORY=%%i
if %MEMORY% LSS 500000000 (
    echo %GREEN%[OK]%RESET% Memory: Less than 500MB (OK)
) else (
    echo %YELLOW%[WARNING]%RESET% Memory: High usage detected
)

REM Check disk space
for /f "tokens=3" %%i in ('dir C:\ /-c ^| find "bytes free"') do set FREE_SPACE=%%i
if %FREE_SPACE% GTR 5000000000 (
    echo %GREEN%[OK]%RESET% Disk: More than 5GB free (OK)
) else (
    echo %YELLOW%[WARNING]%RESET% Disk: Low free space
)

echo.
echo %GREEN%[SUCCESS]%RESET% Health check completed
pause
goto :eof

:show_help
echo LemoTick Bot Windows Manager
echo.
echo Usage: lemotick-manager.bat [command]
echo.
echo Commands:
echo   deploy   - Deploy the bot (requires Administrator)
echo   start    - Start the bot service
echo   stop     - Stop the bot service
echo   restart  - Restart the bot service
echo   status   - Show detailed status information
echo   logs     - Show live logs (Ctrl+C to exit)
echo   health   - Quick health check
echo   help     - Show this help message
echo.
echo Examples:
echo   lemotick-manager.bat deploy    # Deploy the bot
echo   lemotick-manager.bat start     # Start the bot
echo   lemotick-manager.bat status   # Check status
echo.
echo Note: This script must be run as Administrator
pause
goto :eof
