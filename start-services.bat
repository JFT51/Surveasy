@echo off
echo Starting spaCy and Whisper services...

REM Set environment variables
set PORT=5002
set WHISPER_MODEL=base

REM Start spaCy service
start "spaCy Service" cmd /k "cd spacy-nlp-service && python app.py"

REM Start Whisper service
start "Whisper Service" cmd /k "cd whisper-service && set PORT=5002 && python app.py"

REM Start frontend
start "Frontend" cmd /k "npm run dev"

echo Services started! The application should open in your browser shortly...
timeout /t 5
