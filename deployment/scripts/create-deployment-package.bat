@echo off
REM ================================================================================
REM LemoTick Bot Windows Deployment Package Creator
REM ================================================================================
REM Creates a complete deployment package for Windows
REM Usage: create-deployment-package.bat
REM ================================================================================

setlocal enabledelayedexpansion

set PACKAGE_NAME=lemotick-windows-deployment
set PACKAGE_VERSION=%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set PACKAGE_VERSION=%PACKAGE_VERSION: =0%
set PACKAGE_DIR=%PACKAGE_NAME%-%PACKAGE_VERSION%
set ARCHIVE_NAME=%PACKAGE_NAME%-%PACKAGE_VERSION%.zip

echo %GREEN%[%date% %time%]%RESET% Creating LemoTick Bot Windows deployment package...
echo Package version: %PACKAGE_VERSION%
echo.

REM Create package directory
echo %GREEN%[INFO]%RESET% Creating package directory...
if exist "%PACKAGE_DIR%" rmdir /S /Q "%PACKAGE_DIR%"
mkdir "%PACKAGE_DIR%"
mkdir "%PACKAGE_DIR%\bot"

REM Copy bot code
echo %GREEN%[INFO]%RESET% Copying bot code...
xcopy /E /I /Y "bot\*" "%PACKAGE_DIR%\bot\"
if %errorlevel% neq 0 (
    echo %RED%[ERROR]%RESET% Failed to copy bot code
    pause
    exit /b 1
)

REM Remove unnecessary files
echo %GREEN%[INFO]%RESET% Cleaning up files...
if exist "%PACKAGE_DIR%\bot\__pycache__" rmdir /S /Q "%PACKAGE_DIR%\bot\__pycache__"
if exist "%PACKAGE_DIR%\bot\logs" rmdir /S /Q "%PACKAGE_DIR%\bot\logs"
if exist "%PACKAGE_DIR%\bot\data" rmdir /S /Q "%PACKAGE_DIR%\bot\data"
del /Q "%PACKAGE_DIR%\bot\*.pyc" 2>nul
del /Q "%PACKAGE_DIR%\bot\.env" 2>nul

REM Copy deployment scripts
echo %GREEN%[INFO]%RESET% Copying deployment scripts...
copy "deploy-lemotick.ps1" "%PACKAGE_DIR%\"
copy "lemotick-manager.bat" "%PACKAGE_DIR%\"
if exist "Dockerfile.bot" copy "Dockerfile.bot" "%PACKAGE_DIR%\"

REM Create installation script
echo %GREEN%[INFO]%RESET% Creating installation script...
(
echo @echo off
echo REM ================================================================================
echo REM LemoTick Bot Windows Installation Script
echo REM ================================================================================
echo REM Automated installation script for Windows
echo REM ================================================================================
echo.
echo setlocal enabledelayedexpansion
echo.
echo set BOT_HOME=C:\LemoTick
echo set LOG_DIR=C:\LemoTick\logs
echo set SERVICE_NAME=LemoTickBot
echo.
echo echo %GREEN%%[%date%% %time%%]%RESET%% Starting LemoTick Bot installation...
echo echo.
echo.
echo REM Check if running as administrator
echo net session ^>nul 2^>^&1
echo if %%errorlevel%% neq 0 ^(
echo     echo %%RED%%[ERROR]%%RESET%% This script must be run as Administrator
echo     echo %%BLUE%%[INFO]%%RESET%% Right-click Command Prompt and select 'Run as Administrator'
echo     pause
echo     exit /b 1
echo ^)
echo.
echo REM Check if Python is installed
echo python --version ^>nul 2^>^&1
echo if %%errorlevel%% neq 0 ^(
echo     echo %%YELLOW%%[WARNING]%%RESET%% Python not found. Please install Python 3.9+ first.
echo     echo %%BLUE%%[INFO]%%RESET%% Download from: https://www.python.org/downloads/
echo     pause
echo     exit /b 1
echo ^)
echo.
echo REM Install dependencies
echo echo %%GREEN%%[INFO]%%RESET%% Installing Python packages...
echo pip install --upgrade pip
echo pip install -r bot\requirements.txt
echo if %%errorlevel%% neq 0 ^(
echo     echo %%RED%%[ERROR]%%RESET%% Failed to install Python packages
echo     pause
echo     exit /b 1
echo ^)
echo.
echo REM Create directories
echo echo %%GREEN%%[INFO]%%RESET%% Creating directories...
echo if not exist "%%BOT_HOME%%" mkdir "%%BOT_HOME%%"
echo if not exist "%%LOG_DIR%%" mkdir "%%LOG_DIR%%"
echo if not exist "%%BOT_HOME%%\config" mkdir "%%BOT_HOME%%\config"
echo if not exist "%%BOT_HOME%%\data" mkdir "%%BOT_HOME%%\data"
echo if not exist "%%BOT_HOME%%\backups" mkdir "%%BOT_HOME%%\backups"
echo.
echo REM Copy bot files
echo echo %%GREEN%%[INFO]%%RESET%% Copying bot files...
echo xcopy /E /I /Y "bot\*" "%%BOT_HOME%%\"
echo if %%errorlevel%% neq 0 ^(
echo     echo %%RED%%[ERROR]%%RESET%% Failed to copy bot files
echo     pause
echo     exit /b 1
echo ^)
echo.
echo REM Create Windows Service
echo echo %%GREEN%%[INFO]%%RESET%% Creating Windows Service...
echo sc query "%%SERVICE_NAME%%" ^>nul 2^>^&1
echo if %%errorlevel%% equ 0 ^(
echo     echo %%YELLOW%%[WARNING]%%RESET%% Service %%SERVICE_NAME%% already exists
echo ^) else ^(
echo     sc create "%%SERVICE_NAME%%" binPath= "python.exe \"%%BOT_HOME%%\run_bot.py\"" start= auto DisplayName= "LemoTick Trading Bot"
echo     if %%errorlevel%% neq 0 ^(
echo         echo %%RED%%[ERROR]%%RESET%% Failed to create Windows Service
echo         pause
echo         exit /b 1
echo     ^)
echo     echo %%GREEN%%[SUCCESS]%%RESET%% Windows Service created
echo ^)
echo.
echo echo.
echo echo %%GREEN%%[SUCCESS]%%RESET%% Installation completed successfully!
echo echo %%BLUE%%[INFO]%%RESET%% Bot is ready to start. Use: lemotick-manager.bat start
echo echo.
echo pause
) > "%PACKAGE_DIR%\install.bat"

REM Create README
echo %GREEN%[INFO]%RESET% Creating README...
(
echo # LemoTick Bot Windows Deployment Package
echo.
echo This package contains everything needed to deploy the LemoTick trading bot on Windows.
echo.
echo ## Quick Start
echo.
echo ### 1. Install Dependencies
echo ```cmd
echo install.bat
echo ```
echo.
echo ### 2. Configure Bot Settings
echo Edit `bot\config\settings.yaml` with your trading parameters:
echo - Account credentials
echo - Risk management settings
echo - Trading strategies
echo - API endpoints
echo.
echo ### 3. Start Bot
echo ```cmd
echo lemotick-manager.bat start
echo ```
echo.
echo ## Management Commands
echo.
echo ```cmd
echo lemotick-manager.bat start      # Start bot
echo lemotick-manager.bat stop       # Stop bot
echo lemotick-manager.bat restart    # Restart bot
echo lemotick-manager.bat status     # Show status
echo lemotick-manager.bat logs       # Show live logs
echo lemotick-manager.bat health     # Health check
echo ```
echo.
echo ## File Structure
echo.
echo ```
echo lemotick-windows-deployment/
echo ├── install.bat                 # Installation script
echo ├── lemotick-manager.bat         # Service management
echo ├── deploy-lemotick.ps1          # PowerShell deployment
echo ├── README.md                    # This file
echo └── bot/                         # Bot source code
echo     ├── config/
echo     │   └── settings.yaml        # Bot configuration
echo     ├── src/                     # Source code
echo     ├── requirements.txt         # Python dependencies
echo     └── run_bot.py               # Main bot script
echo ```
echo.
echo ## Configuration
echo.
echo ### Bot Settings (`bot\config\settings.yaml`)
echo - **Account**: Set your trading account credentials
echo - **Risk Management**: Configure risk per trade, daily limits
echo - **Strategies**: Enable/disable trading strategies
echo - **Timing**: Set candlestick timing parameters
echo - **Cooldowns**: Configure trade cooldown periods
echo.
echo ### Service Configuration
echo - **Service Name**: `LemoTickBot`
echo - **Directory**: `C:\LemoTick`
echo - **Logs**: `C:\LemoTick\logs`
echo - **Startup**: Automatic
echo.
echo ## Monitoring
echo.
echo ### Health Checks
echo - Service status monitoring
echo - Memory usage tracking
echo - Disk space monitoring
echo - Error log analysis
echo.
echo ### Logs
echo - Application logs: `C:\LemoTick\logs\`
echo - Windows Event Log: Application log
echo - Service logs: `sc query LemoTickBot`
echo.
echo ## Security
echo.
echo ### User Account
echo - Service runs as Local System
echo - Restricted file permissions
echo - Windows Service security
echo.
echo ## Troubleshooting
echo.
echo ### Common Issues
echo.
echo 1. **Bot won't start**
echo    ```cmd
echo    lemotick-manager.bat status
echo    sc query LemoTickBot
echo    ```
echo.
echo 2. **Permission errors**
echo    - Run Command Prompt as Administrator
echo    - Check service permissions
echo.
echo 3. **Python dependencies**
echo    ```cmd
echo    pip install -r bot\requirements.txt
echo    ```
echo.
echo ### Support
echo - Check logs for error messages
echo - Verify configuration settings
echo - Ensure all dependencies are installed
echo - Check network connectivity
echo.
echo ## Updates
echo.
echo ### Code Updates
echo 1. Stop bot: `lemotick-manager.bat stop`
echo 2. Replace files in `C:\LemoTick`
echo 3. Start bot: `lemotick-manager.bat start`
echo.
echo ### Configuration Updates
echo 1. Edit `C:\LemoTick\config\settings.yaml`
echo 2. Restart bot: `lemotick-manager.bat restart`
echo.
echo ## License
echo This software is proprietary. Unauthorized distribution is prohibited.
) > "%PACKAGE_DIR%\README.md"

REM Create version file
echo %GREEN%[INFO]%RESET% Creating version file...
(
echo LemoTick Bot Windows Deployment Package
echo Version: %PACKAGE_VERSION%
echo Created: %date% %time%
echo Package: %ARCHIVE_NAME%
) > "%PACKAGE_DIR%\VERSION.txt"

REM Create archive
echo %GREEN%[INFO]%RESET% Creating deployment archive...
powershell -Command "Compress-Archive -Path '%PACKAGE_DIR%\*' -DestinationPath '%ARCHIVE_NAME%' -Force"
if %errorlevel% neq 0 (
    echo %RED%[ERROR]%RESET% Failed to create archive
    pause
    exit /b 1
)

REM Calculate size
for %%I in ("%ARCHIVE_NAME%") do set ARCHIVE_SIZE=%%~zI
set /a ARCHIVE_SIZE_MB=%ARCHIVE_SIZE%/1024/1024

echo.
echo %GREEN%[SUCCESS]%RESET% Deployment package created successfully!
echo.
echo Package: %ARCHIVE_NAME%
echo Size: %ARCHIVE_SIZE_MB% MB
echo.
echo To deploy:
echo 1. Extract %ARCHIVE_NAME% on target Windows machine
echo 2. Run install.bat as Administrator
echo 3. Configure bot settings
echo 4. Start bot: lemotick-manager.bat start
echo.

REM Cleanup
echo %GREEN%[INFO]%RESET% Cleaning up temporary files...
rmdir /S /Q "%PACKAGE_DIR%"

echo %GREEN%[SUCCESS]%RESET% Cleanup completed
pause
