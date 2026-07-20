@echo off
cd /d "%~dp0"

echo Iniciando Blood Bowl Manager...
start "Blood Bowl Manager - Servidor (no cierres esta ventana)" cmd /k npm run dev

echo Esperando a que arranque el servidor...
timeout /t 6 /nobreak >nul

echo Abriendo el navegador...
start "" http://localhost:3000/login
