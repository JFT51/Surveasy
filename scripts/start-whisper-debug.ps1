# Start Whisper service with debugging
Write-Host "Starting Whisper service with debugging..."
$env:FLASK_ENV = "development"
$env:FLASK_DEBUG = "1"
$env:LOG_LEVEL = "DEBUG"
$env:PORT = "5002"
$env:WHISPER_MODEL = "base"

cd whisper-service
python -m flask run --port=5002 --host=0.0.0.0
