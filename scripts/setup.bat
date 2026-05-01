@echo off
REM scripts/setup.bat
pushd %~dp0
powershell -ExecutionPolicy Bypass -File "setup.ps1"
popd
pause
