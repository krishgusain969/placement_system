@echo off
cd /d "%~dp0"
set PYTHONPATH=%cd%;%cd%\..;%PYTHONPATH%
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)
call venv\Scripts\activate
pip install -r requirements.txt
echo.
echo Starting backend server on http://localhost:8000 ...
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000