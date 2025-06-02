# Start services for local development
Write-Host "Starting spaCy and Whisper services..."

# Set environment variables
$env:PORT = "5002"
$env:WHISPER_MODEL = "base"
$env:VITE_ENABLE_DEMO_MODE = "false"
$env:VITE_ENABLE_DEBUG_PANEL = "true"

# Create a new window for spaCy service with debugging
Start-Process powershell -ArgumentList "-NoExit", "-Command", ".\scripts\start-spacy-debug.ps1"

# Create a new window for Whisper service with debugging
Start-Process powershell -ArgumentList "-NoExit", "-Command", ".\scripts\start-whisper-debug.ps1"

# Start frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"

Write-Host "Services started! The application should open in your browser shortly..."
Start-Sleep -Seconds 5
