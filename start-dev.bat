@echo off
REM TalentTalk Development Startup Script for Windows
REM Starts both Flask backend and Vite frontend

echo.
echo 🚀 Starting TalentTalk Development Environment...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed or not in PATH
    echo    Please install Python from https://www.python.org/downloads/
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed or not in PATH
    echo    Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Install backend dependencies if needed
echo 📦 Checking backend dependencies...
python -c "import flask" >nul 2>&1
if errorlevel 1 (
    echo 📦 Installing backend dependencies...
    cd backend
    pip install -r requirements.txt
    cd ..
)

REM Start backend in a separate window
echo.
echo 🔄 Starting Flask backend on http://127.0.0.1:5000...
start cmd /k "cd backend && python app.py"

REM Wait a moment for backend to start
timeout /t 2 /nobreak >nul

REM Start frontend
echo.
echo ⚡ Starting Vite frontend on http://localhost:5173...
call npm run dev

echo.
echo To restart, close this window and run start-dev.bat again
pause
