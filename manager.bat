@echo off
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0manager.ps1" %*
if errorlevel 1 exit /b 1
