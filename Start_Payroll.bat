@echo off
echo Starting Payroll System...
start "Backend (Payroll)" cmd /k "cd D:\gemini-bot-payroll-system\backend && node server.js"
start "Frontend (Payroll)" cmd /k "cd D:\gemini-bot-payroll-system\frontend && npm run dev"
echo Payroll services have been started in separate windows.
pause
