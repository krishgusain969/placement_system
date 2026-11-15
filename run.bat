@echo off
cd /d "%~dp0"
echo ====================================================
echo NextPlace - Placement Management System Launcher
echo ====================================================
echo.

REM Verify backend dependencies
if not exist "backend\venv" (
    echo [Setup] Creating Python virtual environment in backend\venv...
    python -m venv backend\venv
)

echo [1/2] Starting FastAPI Backend on http://localhost:8000 ...
start "NextPlace Backend (FastAPI)" cmd /k "cd backend && run.bat"

timeout /t 2 >nul

echo [2/2] Starting React + Vite Frontend on http://localhost:5173 ...
start "NextPlace Frontend (Vite)" cmd /k "cd frontend && npm run dev"

echo.
echo ====================================================
echo Application launched successfully!
echo - Frontend: http://localhost:5173
echo - Backend API Docs: http://localhost:8000/docs
echo ====================================================
echo Press any key to close this launcher window (services keep running in their own windows).
pause >nul
