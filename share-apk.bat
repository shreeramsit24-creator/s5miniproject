@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion
title Smart Attendance - Wireless APK Share
set PYTHONUNBUFFERED=1
echo ========================================================
echo       Smart Attendance Mobile APK Wireless Transfer      
echo ========================================================

set "PROJECT_ROOT=%~dp0"
if "%PROJECT_ROOT:~-1%"=="\" set "PROJECT_ROOT=%PROJECT_ROOT:~0,-1%"

cd /d "%PROJECT_ROOT%"

:: Free port 8080 if occupied
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$conns = Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue; " ^
  "if ($conns) { " ^
  "  $pids = $conns | Select-Object -ExpandProperty OwningProcess -Unique; " ^
  "  foreach ($p in $pids) { " ^
  "    if ($p -and $p -ne 0) { taskkill /F /T /PID $p 2>$null; } " ^
  "  } " ^
  "}"

:: Use Python from backend venv if available, or system python
set "PYTHON_EXE=%PROJECT_ROOT%\backend\.venv\Scripts\python.exe"
if not exist "%PYTHON_EXE%" (
  set "PYTHON_EXE=python"
)

"%PYTHON_EXE%" "%PROJECT_ROOT%\share-apk.py"

pause
