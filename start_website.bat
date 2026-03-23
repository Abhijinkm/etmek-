@echo off
echo =========================================
echo       Starting Etmek Website...
echo =========================================

echo Starting the backend server...
start "Etmek Server" cmd /k "node server.js"

echo Waiting for the server to start...
timeout /t 2 /nobreak >nul

echo Opening the website in your default browser...
start http://localhost:3000

echo Done! You can close this small window, but keep the "Etmek Server" black window open while you use the site.
timeout /t 5 /nobreak >nul
