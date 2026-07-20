@echo off
cd /d "%~dp0"
echo === SOLO DESARROLLO: genera un enlace de acceso sin usar el email ===
echo Asegurate de que el servidor (iniciar-app.bat) ya esta corriendo.
echo.
node scripts\dev-login.mjs %1
echo.
pause
