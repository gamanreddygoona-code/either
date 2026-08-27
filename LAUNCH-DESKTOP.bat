@echo off
cd /d "%~dp0"
start "" npx electron electron/main.cjs
exit
