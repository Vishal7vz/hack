@echo off
echo Starting SecureShield Development Environment...

echo.
echo [1/3] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo Failed to install root dependencies
    pause
    exit /b 1
)

echo.
echo [2/3] Installing client dependencies...
cd client
call npm install
if %errorlevel% neq 0 (
    echo Failed to install client dependencies
    pause
    exit /b 1
)
cd ..

echo.
echo [3/3] Starting servers...
echo.
echo Backend will run on: http://localhost:5000
echo Frontend will run on: http://localhost:3000
echo.
echo Press Ctrl+C to stop both servers
echo.

start "SecureShield Backend" cmd /k "node server.js"
timeout /t 3 /nobreak >nul
start "SecureShield Frontend" cmd /k "cd client && npm start"

echo.
echo ✅ SecureShield is starting up!
echo 🌐 Frontend: http://localhost:3000
echo 🔧 Backend: http://localhost:5000
echo.
pause
