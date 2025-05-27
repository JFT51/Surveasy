@echo off
echo ========================================
echo    FFmpeg Installation for Whisper
echo ========================================
echo.

echo Checking if FFmpeg is already installed...
ffmpeg -version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ FFmpeg is already installed!
    ffmpeg -version | findstr "ffmpeg version"
    echo.
    echo You can now use Whisper AI transcription.
    pause
    exit /b 0
)

echo ❌ FFmpeg not found. Installing...
echo.

echo Trying different installation methods:
echo.

echo 1. Trying Chocolatey...
choco --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Chocolatey found. Installing FFmpeg...
    choco install ffmpeg -y
    if %errorlevel% equ 0 (
        echo ✅ FFmpeg installed successfully via Chocolatey!
        goto verify
    ) else (
        echo ❌ Chocolatey installation failed. Trying next method...
    )
) else (
    echo ❌ Chocolatey not found. Trying next method...
)

echo.
echo 2. Trying Winget...
winget --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Winget found. Installing FFmpeg...
    winget install Gyan.FFmpeg
    if %errorlevel% equ 0 (
        echo ✅ FFmpeg installed successfully via Winget!
        goto verify
    ) else (
        echo ❌ Winget installation failed. Trying next method...
    )
) else (
    echo ❌ Winget not found. Trying next method...
)

echo.
echo 3. Trying Scoop...
scoop --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Scoop found. Installing FFmpeg...
    scoop install ffmpeg
    if %errorlevel% equ 0 (
        echo ✅ FFmpeg installed successfully via Scoop!
        goto verify
    ) else (
        echo ❌ Scoop installation failed.
    )
) else (
    echo ❌ Scoop not found.
)

echo.
echo ❌ All automatic installation methods failed.
echo.
echo 📋 Manual Installation Instructions:
echo ========================================
echo 1. Download FFmpeg from: https://www.gyan.dev/ffmpeg/builds/
echo 2. Choose "release builds" and download the latest version
echo 3. Extract the zip file to C:\ffmpeg
echo 4. Add C:\ffmpeg\bin to your PATH environment variable:
echo    - Press Win + R, type "sysdm.cpl", press Enter
echo    - Click "Environment Variables"
echo    - Under "System Variables", find "Path" and click "Edit"
echo    - Click "New" and add: C:\ffmpeg\bin
echo    - Click OK on all dialogs
echo 5. Restart this command prompt
echo 6. Run: ffmpeg -version
echo.
echo After manual installation, run this script again to verify.
pause
exit /b 1

:verify
echo.
echo ========================================
echo Verifying FFmpeg installation...
echo ========================================
timeout /t 2 >nul

ffmpeg -version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ SUCCESS! FFmpeg is now installed and working!
    echo.
    ffmpeg -version | findstr "ffmpeg version"
    echo.
    echo 🎉 You can now use Whisper AI transcription!
    echo.
    echo Next steps:
    echo 1. Start Whisper service: start-whisper.bat
    echo 2. Test with debug panel in Surveasy
    echo.
) else (
    echo ❌ FFmpeg installation verification failed.
    echo Please restart your command prompt and try again.
    echo If the problem persists, try manual installation.
)

pause
