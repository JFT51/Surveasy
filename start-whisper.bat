@echo off
echo ========================================
echo    Surveasy Whisper AI Service
echo ========================================
echo.

echo Checking FFmpeg installation...
ffmpeg -version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ FFmpeg not found! Please install FFmpeg first:
    echo    choco install ffmpeg
    echo    or download from https://ffmpeg.org
    pause
    exit /b 1
)
echo ✅ FFmpeg is installed

echo.
echo Checking Python dependencies...
cd whisper-service
python -c "import whisper, torch, flask" >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Missing Python dependencies. Installing...
    pip install -r requirements.txt
    if %errorlevel% neq 0 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
)
echo ✅ Python dependencies are ready

echo.
echo Starting Whisper AI Service...
echo Model: base (change in whisper-service/.env)
echo Port: 5000
echo Language: Dutch (nl)
echo.
echo Press Ctrl+C to stop the service
echo ========================================
echo.

python app.py
