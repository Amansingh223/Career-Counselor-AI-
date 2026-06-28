@echo off
title SheStarts AI Career Counselor - Launcher
color 0A

echo.
echo  ============================================
echo   SheStarts AI Career Counselor
echo   Starting servers...
echo  ============================================
echo.

echo  [1/2] Starting Backend (FastAPI on port 8000)...
start "SheStarts Backend" cmd /k "cd /d "%~dp0backend" && py -m uvicorn main:app --reload --port 8000"

timeout /t 3 /nobreak >nul

echo  [2/2] Starting Frontend (Next.js on port 3000)...
start "SheStarts Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

timeout /t 5 /nobreak >nul

echo.
echo  ============================================
echo   Both servers are starting up!
echo.
echo   Backend API:  http://localhost:8000
echo   API Docs:     http://localhost:8000/docs
echo   Frontend App: http://localhost:3000
echo  ============================================
echo.
echo  Opening app in browser...
timeout /t 5 /nobreak >nul
start http://localhost:3000

echo.
echo  You can close this window. The servers
echo  will keep running in their own windows.
echo.
pause
