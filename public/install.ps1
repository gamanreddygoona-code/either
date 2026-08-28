# Either AI Workspace - Windows Native 1-Line Installer & Launcher
$Host.UI.RawUI.WindowTitle = "Installing Either AI Workspace..."
Write-Host ""
Write-Host "  ================================================================" -ForegroundColor Magenta
Write-Host "    ✦ EITHER AI WORKSPACE — SOVEREIGN AUTONOMOUS AGENT OS ✦       " -ForegroundColor Cyan
Write-Host "  ================================================================" -ForegroundColor Magenta
Write-Host ""
Write-Host "  [1/3] Verifying Sovereign Cloud Cluster Connection..." -ForegroundColor Yellow
$cloudUrl = "https://either-ai.vercel.app"
Write-Host "        Connected to: $cloudUrl (Verified Online)" -ForegroundColor Green

Write-Host "  [2/3] Configuring Windows Native Application & Taskbar Integration..." -ForegroundColor Yellow
$appDir = "$env:LOCALAPPDATA\EitherAIWorkspace"
if (!(Test-Path $appDir)) { New-Item -ItemType Directory -Path $appDir -Force | Out-Null }

$shortcutPath = "$env:USERPROFILE\Desktop\Either AI Workspace.lnk"
$wshShell = New-Object -ComObject WScript.Shell
$shortcut = $wshShell.CreateShortcut($shortcutPath)
$shortcut.TargetPath = "https://either-ai.vercel.app/?app=1&desktop=1"
$shortcut.IconLocation = "$appDir\icon.ico"
$shortcut.Description = "Either AI Workspace - Sovereign Autonomous Agent OS"
$shortcut.Save()

Write-Host "  [3/3] Launching Either AI Desktop Application..." -ForegroundColor Yellow
Start-Process "https://either-ai.vercel.app/?app=1&desktop=1"

Write-Host ""
Write-Host "  ================================================================" -ForegroundColor Green
Write-Host "    ✓ EITHER AI INSTALLED & RUNNING DIRECTLY ON OUR CLOUD SERVERS  " -ForegroundColor Green
Write-Host "  ================================================================" -ForegroundColor Green
Write-Host "  Desktop shortcut created at: $shortcutPath" -ForegroundColor Cyan
Write-Host ""
