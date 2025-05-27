#!/usr/bin/env python3
"""
Test script for Whisper Speech-to-Text Service
Verifies installation and basic functionality
"""

import sys
import os
from pathlib import Path

# Add whisper-main to Python path
whisper_path = Path(__file__).parent.parent / "whisper-main"
sys.path.insert(0, str(whisper_path))

def test_imports():
    """Test if all required packages can be imported"""
    print("Testing imports...")
    
    try:
        import whisper
        print("✓ Whisper imported successfully")
    except ImportError as e:
        print(f"✗ Whisper import failed: {e}")
        return False
    
    try:
        import torch
        print(f"✓ PyTorch imported successfully (version: {torch.__version__})")
        print(f"  CUDA available: {torch.cuda.is_available()}")
        if torch.cuda.is_available():
            print(f"  CUDA device: {torch.cuda.get_device_name(0)}")
    except ImportError as e:
        print(f"✗ PyTorch import failed: {e}")
        return False
    
    try:
        import flask
        print(f"✓ Flask imported successfully (version: {flask.__version__})")
    except ImportError as e:
        print(f"✗ Flask import failed: {e}")
        return False
    
    try:
        import librosa
        print(f"✓ Librosa imported successfully (version: {librosa.__version__})")
    except ImportError as e:
        print(f"✗ Librosa import failed: {e}")
        return False
    
    return True

def test_whisper_models():
    """Test Whisper model availability"""
    print("\nTesting Whisper models...")
    
    try:
        import whisper
        
        available_models = whisper.available_models()
        print(f"✓ Available models: {available_models}")
        
        # Test loading the smallest model
        print("Loading 'tiny' model for testing...")
        model = whisper.load_model("tiny")
        print(f"✓ Model loaded successfully")
        print(f"  Device: {model.device}")
        print(f"  Multilingual: {model.is_multilingual}")
        
        return True
        
    except Exception as e:
        print(f"✗ Model loading failed: {e}")
        return False

def test_audio_processing():
    """Test basic audio processing capabilities"""
    print("\nTesting audio processing...")
    
    try:
        import whisper
        import numpy as np
        
        # Create a simple test audio (1 second of silence)
        sample_rate = 16000
        duration = 1.0
        test_audio = np.zeros(int(sample_rate * duration), dtype=np.float32)
        
        # Test audio preprocessing
        audio = whisper.pad_or_trim(test_audio)
        print(f"✓ Audio preprocessing successful (length: {len(audio)})")
        
        # Test mel spectrogram
        model = whisper.load_model("tiny")
        mel = whisper.log_mel_spectrogram(audio, n_mels=model.dims.n_mels)
        print(f"✓ Mel spectrogram generation successful (shape: {mel.shape})")
        
        return True
        
    except Exception as e:
        print(f"✗ Audio processing failed: {e}")
        return False

def test_service_dependencies():
    """Test Flask service dependencies"""
    print("\nTesting service dependencies...")
    
    try:
        from flask import Flask, request, jsonify
        from flask_cors import CORS
        print("✓ Flask and CORS imported successfully")
        
        import tempfile
        import json
        from datetime import datetime
        print("✓ Standard library imports successful")
        
        return True
        
    except Exception as e:
        print(f"✗ Service dependencies failed: {e}")
        return False

def create_sample_audio():
    """Create a sample audio file for testing"""
    print("\nCreating sample audio file...")
    
    try:
        import numpy as np
        import soundfile as sf
        
        # Generate a simple sine wave (440 Hz for 2 seconds)
        sample_rate = 16000
        duration = 2.0
        frequency = 440.0
        
        t = np.linspace(0, duration, int(sample_rate * duration), False)
        audio = 0.3 * np.sin(2 * np.pi * frequency * t)
        
        # Save as WAV file
        output_file = "test_audio.wav"
        sf.write(output_file, audio, sample_rate)
        
        print(f"✓ Sample audio created: {output_file}")
        print(f"  Duration: {duration} seconds")
        print(f"  Sample rate: {sample_rate} Hz")
        print(f"  File size: {os.path.getsize(output_file)} bytes")
        
        return output_file
        
    except Exception as e:
        print(f"✗ Sample audio creation failed: {e}")
        return None

def test_transcription():
    """Test actual transcription with sample audio"""
    print("\nTesting transcription...")
    
    try:
        import whisper
        
        # Create sample audio
        audio_file = create_sample_audio()
        if not audio_file:
            return False
        
        # Load model and transcribe
        model = whisper.load_model("tiny")
        result = model.transcribe(audio_file, language="nl")
        
        print(f"✓ Transcription successful")
        print(f"  Text: '{result['text']}'")
        print(f"  Language: {result.get('language', 'unknown')}")
        print(f"  Segments: {len(result.get('segments', []))}")
        
        # Clean up
        if os.path.exists(audio_file):
            os.remove(audio_file)
            print(f"✓ Cleaned up test file: {audio_file}")
        
        return True
        
    except Exception as e:
        print(f"✗ Transcription failed: {e}")
        return False

def main():
    """Run all tests"""
    print("Whisper Speech-to-Text Service Test")
    print("=" * 40)
    
    tests = [
        ("Import Test", test_imports),
        ("Model Test", test_whisper_models),
        ("Audio Processing Test", test_audio_processing),
        ("Service Dependencies Test", test_service_dependencies),
        ("Transcription Test", test_transcription)
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n{test_name}:")
        print("-" * len(test_name))
        
        try:
            if test_func():
                passed += 1
                print(f"✓ {test_name} PASSED")
            else:
                print(f"✗ {test_name} FAILED")
        except Exception as e:
            print(f"✗ {test_name} ERROR: {e}")
    
    print("\n" + "=" * 40)
    print(f"Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Whisper service is ready.")
        print("\nNext steps:")
        print("1. Start the service: python app.py")
        print("2. Test the API: python test_service.py")
        print("3. Use in React app: http://localhost:3001")
    else:
        print("❌ Some tests failed. Please check the installation.")
        print("\nTroubleshooting:")
        print("1. Install requirements: pip install -r requirements.txt")
        print("2. Install FFmpeg: see WHISPER_INTEGRATION.md")
        print("3. Check Python version: Python 3.8+ required")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
