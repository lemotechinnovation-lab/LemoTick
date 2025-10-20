@echo off
setlocal ENABLEEXTENSIONS

REM Wrapper to call PowerShell setup/run script
set SCRIPT_DIR=%~dp0
powershell -NoProfile -ExecutionPolicy Bypass -File "%SCRIPT_DIR%scripts\run_backtest.ps1"

endlocal

