@echo off
echo ========================================
echo   OceanPhenix Admin Hub - Test Local
echo ========================================
echo.

REM Vérifier si Python est installé
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERREUR] Python n'est pas installe ou n'est pas dans le PATH
    echo Installez Python depuis https://www.python.org/downloads/
    pause
    exit /b 1
)

echo [INFO] Demarrage du serveur local...
echo [INFO] URL : http://localhost:8080
echo.
echo Appuyez sur Ctrl+C pour arreter le serveur
echo.

cd /d "%~dp0"
python -m http.server 8080

pause
