@echo off
title InstantVM · Dev Sandbox
echo ══════════════════════════════════
echo  InstantVM · Dev Sandbox
echo ══════════════════════════════════
echo.
echo Mapped: C:\Projects (read-only)
echo.
echo Installing tools...
winget install --id Git.Git --accept-source-agreements --accept-package-agreements -h 2>nul
winget install --id OpenJS.NodeJS.LTS --accept-source-agreements -h 2>nul
echo.
echo Ready. Open PowerShell or CMD.
cmd /k "cd C:\Projects"
