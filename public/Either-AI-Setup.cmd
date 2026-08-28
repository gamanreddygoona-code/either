@echo off
title Installing Either AI Workspace...
echo ================================================================
echo    ✦ EITHER AI WORKSPACE — SOVEREIGN AUTONOMOUS AGENT OS ✦
echo ================================================================
echo.
echo [1/3] Connecting to Sovereign Cloud Infrastructure...
set "CLOUD_URL=https://either-ai.vercel.app"
set "APP_URL=https://either-ai.vercel.app/?app=1&desktop=1"
echo       Connected to: %CLOUD_URL% (100%% Cloud Server)
echo.
echo [2/3] Configuring Windows Native Desktop App & Taskbar Integration...
set "APP_DIR=%LOCALAPPDATA%\EitherAIWorkspace"
if not exist "%APP_DIR%" mkdir "%APP_DIR%"

powershell -ExecutionPolicy Bypass -NoProfile -Command "try { Invoke-WebRequest -Uri 'https://either-ai.vercel.app/icons/icon.ico' -OutFile '%APP_DIR%\icon.ico' -UseBasicParsing -TimeoutSec 10 } catch {}"

powershell -ExecutionPolicy Bypass -NoProfile -Command "$s=(New-Object -COM WScript.Shell).CreateShortcut([System.Environment]::GetFolderPath('Desktop') + '\Either AI Workspace.lnk'); $e=@('C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe','C:\Program Files\Microsoft\Edge\Application\msedge.exe','C:\Program Files\Google\Chrome\Application\chrome.exe','C:\Program Files (x86)\Google\Chrome\Application\chrome.exe'); $t=''; foreach($c in $e){if(Test-Path $c){$t=$c;break}}; if($t -ne ''){$s.TargetPath=$t; $s.Arguments='--app=https://either-ai.vercel.app/?app=1&desktop=1'}else{$s.TargetPath='https://either-ai.vercel.app/?app=1&desktop=1'}; if(Test-Path '%APP_DIR%\icon.ico'){$s.IconLocation='%APP_DIR%\icon.ico,0'}; $s.Description='Either AI Workspace - Sovereign Autonomous Agent OS'; $s.WorkingDirectory='%APP_DIR%'; $s.Save()"

echo.
echo [3/3] Launching Either AI Desktop Application...
powershell -ExecutionPolicy Bypass -NoProfile -Command "$e=@('C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe','C:\Program Files\Microsoft\Edge\Application\msedge.exe','C:\Program Files\Google\Chrome\Application\chrome.exe','C:\Program Files (x86)\Google\Chrome\Application\chrome.exe'); $t=''; foreach($c in $e){if(Test-Path $c){$t=$c;break}}; if($t -ne ''){Start-Process $t -ArgumentList '--app=https://either-ai.vercel.app/?app=1&desktop=1'}else{Start-Process 'https://either-ai.vercel.app/?app=1&desktop=1'}"

echo.
echo ================================================================
echo   [OK] EITHER AI INSTALLED - RUNNING DIRECTLY ON OUR CLOUD SERVERS
echo ================================================================
echo   * Zero local servers or terminal commands required.
echo   * Desktop shortcut created on your Windows Desktop.
echo.
timeout /t 3 /nobreak >nul
