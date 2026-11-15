@echo off
echo ====================================================
echo NextPlace - Placement Management System PBL
echo ====================================================
echo Starting FastAPI Backend and Vite Frontend...
start cmd /k "cd backend && run.bat"
start cmd /k "cd frontend && npm run dev"
echo Both services launched!
echo Frontend: http://localhost:5173
echo Backend API docs: http://localhost:8000/docs
