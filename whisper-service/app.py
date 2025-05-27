#!/usr/bin/env python3
"""
Whisper Speech-to-Text Service
Real-time Dutch speech-to-text conversion using OpenAI Whisper
"""

import os
import sys
import tempfile
import logging
from pathlib import Path
from typing import Optional, Dict, Any
import json
import asyncio
from datetime import datetime

# Add whisper-main to Python path
whisper_path = Path(__file__).parent.parent / "whisper-main"
sys.path.insert(0, str(whisper_path))

try:
    import whisper
    import torch
    import numpy as np
    from flask import Flask, request, jsonify, Response
    from flask_cors import CORS
    import librosa
    import soundfile as sf
except ImportError as e:
    print(f"Missing dependency: {e}")
    print("Please install required packages:")
    print("pip install flask flask-cors librosa soundfile")
    sys.exit(1)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Flask app setup
app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Global variables
whisper_model = None
model_name = "base"  # Default model
supported_languages = ["nl", "en", "de", "fr", "es"]  # Dutch, English, German, French, Spanish

class WhisperService:
    """Whisper Speech-to-Text Service"""
    
    def __init__(self, model_name: str = "base"):
        self.model_name = model_name
        self.model = None
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.load_model()
    
    def load_model(self):
        """Load Whisper model"""
        try:
            logger.info(f"Loading Whisper model '{self.model_name}' on device '{self.device}'...")
            self.model = whisper.load_model(self.model_name, device=self.device)
            logger.info(f"Model loaded successfully. Multilingual: {self.model.is_multilingual}")
        except Exception as e:
            logger.error(f"Failed to load Whisper model: {e}")
            raise
    
    def transcribe_audio(
        self, 
        audio_file_path: str, 
        language: str = "nl",
        task: str = "transcribe",
        word_timestamps: bool = True,
        initial_prompt: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Transcribe audio file using Whisper
        
        Args:
            audio_file_path: Path to audio file
            language: Language code (nl for Dutch)
            task: 'transcribe' or 'translate'
            word_timestamps: Include word-level timestamps
            initial_prompt: Optional context prompt
            
        Returns:
            Dictionary with transcription results
        """
        try:
            logger.info(f"Transcribing audio file: {audio_file_path}")
            logger.info(f"Language: {language}, Task: {task}")
            
            # Transcribe with Whisper
            result = self.model.transcribe(
                audio_file_path,
                language=language if language in supported_languages else None,
                task=task,
                word_timestamps=word_timestamps,
                initial_prompt=initial_prompt,
                verbose=False
            )
            
            # Process results
            transcription_result = {
                "text": result["text"].strip(),
                "language": result.get("language", language),
                "segments": result.get("segments", []),
                "word_count": len(result["text"].split()),
                "duration": self._calculate_duration(result.get("segments", [])),
                "confidence": self._calculate_confidence(result.get("segments", [])),
                "processing_info": {
                    "model": self.model_name,
                    "device": self.device,
                    "task": task,
                    "word_timestamps": word_timestamps,
                    "timestamp": datetime.now().isoformat()
                }
            }
            
            logger.info(f"Transcription completed. Text length: {len(result['text'])} characters")
            return transcription_result
            
        except Exception as e:
            logger.error(f"Transcription failed: {e}")
            raise
    
    def _calculate_duration(self, segments) -> float:
        """Calculate total audio duration from segments"""
        if not segments:
            return 0.0
        return max(segment.get("end", 0) for segment in segments)
    
    def _calculate_confidence(self, segments) -> float:
        """Calculate average confidence from segments"""
        if not segments:
            return 0.0
        
        confidences = []
        for segment in segments:
            if "words" in segment:
                word_confidences = [
                    word.get("probability", 0.0) 
                    for word in segment["words"] 
                    if "probability" in word
                ]
                if word_confidences:
                    confidences.extend(word_confidences)
        
        return sum(confidences) / len(confidences) if confidences else 0.8
    
    def detect_language(self, audio_file_path: str) -> Dict[str, Any]:
        """Detect language of audio file"""
        try:
            # Load audio and detect language
            audio = whisper.load_audio(audio_file_path)
            audio = whisper.pad_or_trim(audio)
            
            # Make log-Mel spectrogram
            mel = whisper.log_mel_spectrogram(audio, n_mels=self.model.dims.n_mels).to(self.model.device)
            
            # Detect language
            _, probs = self.model.detect_language(mel)
            
            # Get top 3 languages
            sorted_probs = sorted(probs.items(), key=lambda x: x[1], reverse=True)
            
            return {
                "detected_language": max(probs, key=probs.get),
                "confidence": max(probs.values()),
                "top_languages": sorted_probs[:3],
                "all_probabilities": probs
            }
            
        except Exception as e:
            logger.error(f"Language detection failed: {e}")
            raise

# Initialize Whisper service
whisper_service = WhisperService(model_name)

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "whisper-speech-to-text",
        "model": model_name,
        "device": whisper_service.device,
        "multilingual": whisper_service.model.is_multilingual if whisper_service.model else False,
        "supported_languages": supported_languages,
        "timestamp": datetime.now().isoformat()
    })

@app.route('/models', methods=['GET'])
def get_available_models():
    """Get available Whisper models"""
    return jsonify({
        "available_models": whisper.available_models(),
        "current_model": model_name,
        "model_info": {
            "tiny": {"size": "39M", "speed": "~10x", "vram": "~1GB"},
            "base": {"size": "74M", "speed": "~7x", "vram": "~1GB"},
            "small": {"size": "244M", "speed": "~4x", "vram": "~2GB"},
            "medium": {"size": "769M", "speed": "~2x", "vram": "~5GB"},
            "large": {"size": "1550M", "speed": "1x", "vram": "~10GB"},
            "turbo": {"size": "809M", "speed": "~8x", "vram": "~6GB"}
        }
    })

@app.route('/transcribe', methods=['POST'])
def transcribe_audio():
    """Transcribe uploaded audio file"""
    try:
        # Check if file is present
        if 'audio' not in request.files:
            return jsonify({"error": "No audio file provided"}), 400
        
        audio_file = request.files['audio']
        if audio_file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        
        # Get parameters
        language = request.form.get('language', 'nl')
        task = request.form.get('task', 'transcribe')
        word_timestamps = request.form.get('word_timestamps', 'true').lower() == 'true'
        initial_prompt = request.form.get('initial_prompt', None)
        
        # Validate language
        if language not in supported_languages:
            return jsonify({"error": f"Unsupported language: {language}"}), 400
        
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
            audio_file.save(temp_file.name)
            temp_file_path = temp_file.name
        
        try:
            # Transcribe audio
            result = whisper_service.transcribe_audio(
                temp_file_path,
                language=language,
                task=task,
                word_timestamps=word_timestamps,
                initial_prompt=initial_prompt
            )
            
            return jsonify({
                "success": True,
                "result": result
            })
            
        finally:
            # Clean up temporary file
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)
    
    except Exception as e:
        logger.error(f"Transcription endpoint error: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/detect-language', methods=['POST'])
def detect_language():
    """Detect language of uploaded audio file"""
    try:
        if 'audio' not in request.files:
            return jsonify({"error": "No audio file provided"}), 400
        
        audio_file = request.files['audio']
        if audio_file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
            audio_file.save(temp_file.name)
            temp_file_path = temp_file.name
        
        try:
            # Detect language
            result = whisper_service.detect_language(temp_file_path)
            
            return jsonify({
                "success": True,
                "result": result
            })
            
        finally:
            # Clean up temporary file
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)
    
    except Exception as e:
        logger.error(f"Language detection endpoint error: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    # Check if model should be changed via environment variable
    env_model = os.getenv('WHISPER_MODEL', model_name)
    if env_model != model_name:
        model_name = env_model
        whisper_service = WhisperService(model_name)
    
    # Get port from environment or use default
    port = int(os.getenv('PORT', 5000))
    
    logger.info(f"Starting Whisper service on port {port}")
    logger.info(f"Model: {model_name}, Device: {whisper_service.device}")
    
    app.run(
        host='0.0.0.0',
        port=port,
        debug=os.getenv('DEBUG', 'false').lower() == 'true'
    )
