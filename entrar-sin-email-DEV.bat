@echo off
cd /d "%~dp0"

echo === SOLO DESARROLLO: genera un enlace de acceso sin usar el email ===
echo.

powershell -NoProfile -Command "if (Test-NetConnection -ComputerName localhost -Port 3000 -InformationLevel Quiet -WarningAction SilentlyContinue) { exit 0 } else { exit 1 }"
if errorlevel 1 (
  echo El servidor no esta corriendo. Arrancandolo...
  start "Blood Bowl Manager - Servidor (no cierres esta ventana)" cmd /k npm run dev
  echo Esperando a que arranque...
  timeout /t 8 /nobreak >nul
) else (
  echo El servidor ya esta corriendo.
)

echo.
node scripts\dev-login.mjs %1
echo.
pause
