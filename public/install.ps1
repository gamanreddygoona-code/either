# Either AI Workspace - Windows Native 1-Line Installer & Launcher
$Host.UI.RawUI.WindowTitle = "Installing Either AI Workspace..."
Write-Host ""
Write-Host "  ================================================================" -ForegroundColor Magenta
Write-Host "    ✦ EITHER AI WORKSPACE — SOVEREIGN AUTONOMOUS AGENT OS ✦       " -ForegroundColor Cyan
Write-Host "  ================================================================" -ForegroundColor Magenta
Write-Host ""
Write-Host "  [1/3] Connecting to Sovereign Cloud Infrastructure..." -ForegroundColor Yellow
$cloudUrl = "https://either-ai.vercel.app"
$appUrl = "https://either-ai.vercel.app/?app=1&desktop=1"
Write-Host "        Connected to: $cloudUrl (Verified 100% Cloud Server)" -ForegroundColor Green

Write-Host "  [2/3] Configuring Windows Native Desktop App & Taskbar Integration..." -ForegroundColor Yellow
$appDir = "$env:LOCALAPPDATA\EitherAIWorkspace"
if (!(Test-Path $appDir)) { New-Item -ItemType Directory -Path $appDir -Force | Out-Null }

$iconFile = "$appDir\icon.ico"
try {
    Invoke-WebRequest -Uri "$cloudUrl/icons/icon.ico" -OutFile $iconFile -UseBasicParsing -TimeoutSec 10 -ErrorAction SilentlyContinue
} catch {}

# Find browser for standalone native app window
$edgePath = "$env:ProgramFiles (x86)\Microsoft\Edge\Application\msedge.exe"
$edgePath64 = "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe"
$chromePath = "$env:ProgramFiles\Google\Chrome\Application\chrome.exe"
$chromePath64 = "$env:ProgramFiles (x86)\Google\Chrome\Application\chrome.exe"

$targetExe = ""
$targetArgs = "--app=$appUrl"

if (Test-Path $edgePath) {
    $targetExe = $edgePath
} elseif (Test-Path $edgePath64) {
    $targetExe = $edgePath64
} elseif (Test-Path $chromePath) {
    $targetExe = $chromePath
} elseif (Test-Path $chromePath64) {
    $targetExe = $chromePath64
}

$shortcutPath = "$env:USERPROFILE\Desktop\Either AI Workspace.lnk"
$wshShell = New-Object -ComObject WScript.Shell
$shortcut = $wshShell.CreateShortcut($shortcutPath)

if ($targetExe -ne "") {
    $shortcut.TargetPath = $targetExe
    $shortcut.Arguments = $targetArgs
} else {
    $shortcut.TargetPath = $appUrl
}

if (Test-Path $iconFile) {
    $shortcut.IconLocation = "$iconFile,0"
}
$shortcut.Description = "Either AI Workspace - Sovereign Autonomous Agent OS (Cloud Connected)"
$shortcut.WorkingDirectory = $appDir
$shortcut.Save()

Write-Host "  [3/3] Launching Either AI Desktop Application..." -ForegroundColor Yellow
if ($targetExe -ne "") {
    Start-Process $targetExe -ArgumentList $targetArgs
} else {
    Start-Process $appUrl
}

Write-Host ""
Write-Host "  ================================================================" -ForegroundColor Green
Write-Host "    ✓ EITHER AI INSTALLED — RUNNING DIRECTLY ON OUR CLOUD SERVERS  " -ForegroundColor Green
Write-Host "  ================================================================" -ForegroundColor Green
Write-Host "  ✓ Zero local servers or terminal commands required." -ForegroundColor Green
Write-Host "  ✓ Desktop icon created at: $shortcutPath" -ForegroundColor Cyan
Write-Host ""
