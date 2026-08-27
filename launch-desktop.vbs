Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "C:\Users\gaman\antigravity\Littlebird-AI-Workspace"
WshShell.Run "cmd /c launch-desktop.bat", 0, False
