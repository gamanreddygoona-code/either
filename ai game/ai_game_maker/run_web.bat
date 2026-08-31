@echo off
chcp 65001 >nul
title AI Game Maker - Web Interface
color 0F

echo ==========================================
echo    AI Game Maker - Web Interface
echo ==========================================
echo.
echo Starting the web interface...
echo After the server starts, open your browser to:
echo http://localhost:5000
echo.
echo Press Ctrl+C to stop the server.
echo.

python main.py web

pause
