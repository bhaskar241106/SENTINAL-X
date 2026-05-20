@echo off
TITLE Sentinel-X Master Launcher
COLOR 0B
cd /d "%~dp0"

echo ==========================================
echo    SENTINEL-X OFFLINE ECOSYSTEM
echo ==========================================
echo.

echo [1/3] Starting Local AI Brain (Ollama)...
start "Ollama Engine" cmd /c "ollama serve"
timeout /t 5 /nobreak > nul

echo [2/3] Starting Sentinel Backend API...
start "Sentinel Backend" cmd /k "npm run dev --workspace=@workspace/api-server"
timeout /t 8 /nobreak > nul

echo [3/3] Starting Frontend Dashboard...
start "Sentinel Frontend" cmd /k "npm run dev --workspace=@workspace/drivelegal"

echo.
echo ==========================================
echo    ALL SYSTEMS GO!
echo    Dashboard: http://localhost:5173
echo    Backend:   http://localhost:8080
echo ==========================================
echo.
pause
