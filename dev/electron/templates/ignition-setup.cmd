@echo off
title InstantVM · Ignition Designer
echo ══════════════════════════════════
echo  InstantVM · Ignition Designer
echo ══════════════════════════════════
if exist "C:\Sandbox\vm\setup.cmd" (
    call "C:\Sandbox\vm\setup.cmd"
) else (
    echo No setup script found. Opening browser to gateway...
    start http://10.0.0.1:8090
    pause
)
