echo Deploying
@echo off
setlocal enabledelayedexpansion

echo Ejecutando npm run build...
call npm run build

IF ERRORLEVEL 1 (
    echo.
    echo ❌ ERROR: npm run build ha fallado. Abortando.
    pause
    exit /b 1
)

REM === Obtener fecha/hora ISO segura ===
for /f %%i in ('powershell -command "Get-Date -Format yyyyMMdd-HHmmss"') do set TIMESTAMP=%%i

echo.
echo Git add...
git add .

echo.
echo Git commit...
git commit -m "commit-%TIMESTAMP%"

IF ERRORLEVEL 1 (
    echo.
    echo ⚠️ No hay cambios para commitear.
    pause
    exit /b 0
)

echo.
echo Git push...
git push origin main

echo.
echo ✅ Proceso completado correctamente.
pause
endlocal
