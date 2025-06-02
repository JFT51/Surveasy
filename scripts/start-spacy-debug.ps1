# Start spaCy service with debugging
Write-Host "Starting spaCy service with debugging..."
$env:FLASK_ENV = "development"
$env:FLASK_DEBUG = "1"
$env:LOG_LEVEL = "DEBUG"

cd spacy-nlp-service
python -m flask run --port=5001 --host=0.0.0.0
