@echo off
chcp 65001 >nul
title AI Game Maker - Run Generated Game
color 0F

echo ==========================================
echo    AI Game Maker - Run Generated Game
echo ==========================================
echo.
echo This will run the default game_design.json file.
echo.

python main.py run

pause
