#!/usr/bin/env python3
"""
Simple test to verify Whisper functionality without web service
"""

import os
import sys
import tempfile
import logging

# Add whisper-main to Python path
from pathlib import Path
whisper_path = Path(__file__).parent.parent / "whisper-main"
sys.path.insert(0, str(whisper_path))

try:
    import whisper
    import torch
    import numpy as np
except ImportError as e:
    print(f"Missing dependency: {e}")
    sys.exit(1)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_whisper_basic():
    """Test basic Whisper functionality"""
    try:
        print("🔍 Testing Whisper Basic Functionality")
        print("=" * 50)
        
        # Load model
        print("📥 Loading Whisper model...")
        model = whisper.load_model("base")
        print(f"✅ Model loaded: {model.dims}")
        print(f"📱 Device: {'cuda' if torch.cuda.is_available() else 'cpu'}")
        print(f"🌍 Multilingual: {model.is_multilingual}")
        
        # Test with existing test audio file
        test_audio_path = "test_audio.wav"
        if os.path.exists(test_audio_path):
            print(f"\n🎵 Testing with existing audio file: {test_audio_path}")
            
            # Check file size
            file_size = os.path.getsize(test_audio_path)
            print(f"📊 File size: {file_size} bytes")
            
            if file_size > 0:
                try:
                    # Try to load audio
                    print("🔄 Loading audio...")
                    audio = whisper.load_audio(test_audio_path)
                    print(f"✅ Audio loaded successfully, shape: {audio.shape}")
                    
                    # Try transcription
                    print("🎤 Transcribing...")
                    result = model.transcribe(test_audio_path, language="nl")
                    
                    print("\n🎯 TRANSCRIPTION RESULTS:")
                    print("=" * 30)
                    print(f"Text: {result['text']}")
                    print(f"Language: {result.get('language', 'unknown')}")
                    print(f"Segments: {len(result.get('segments', []))}")
                    
                    return True
                    
                except Exception as e:
                    print(f"❌ Transcription failed: {e}")
                    print(f"Error type: {type(e).__name__}")
                    return False
            else:
                print("❌ Test audio file is empty")
                return False
        else:
            print(f"⚠️  Test audio file not found: {test_audio_path}")
            print("Creating a simple test...")
            
            # Create a simple test with numpy array
            try:
                print("🔧 Creating synthetic audio test...")
                # Create 1 second of silence
                sample_rate = 16000
                duration = 1.0
                audio_data = np.zeros(int(sample_rate * duration), dtype=np.float32)
                
                # Save to temporary file
                with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_file:
                    temp_path = temp_file.name
                
                # Try to save using soundfile if available
                try:
                    import soundfile as sf
                    sf.write(temp_path, audio_data, sample_rate)
                    print(f"✅ Created test audio file: {temp_path}")
                    
                    # Test transcription
                    result = model.transcribe(temp_path, language="nl")
                    print(f"✅ Transcription successful: '{result['text']}'")
                    
                    # Cleanup
                    os.unlink(temp_path)
                    return True
                    
                except ImportError:
                    print("⚠️  soundfile not available, skipping file creation test")
                    return False
                except Exception as e:
                    print(f"❌ Synthetic test failed: {e}")
                    if os.path.exists(temp_path):
                        os.unlink(temp_path)
                    return False
                    
            except Exception as e:
                print(f"❌ Synthetic test setup failed: {e}")
                return False
    
    except Exception as e:
        print(f"❌ Basic test failed: {e}")
        print(f"Error type: {type(e).__name__}")
        return False

def check_dependencies():
    """Check if all required dependencies are available"""
    print("🔍 Checking Dependencies")
    print("=" * 30)
    
    dependencies = {
        "whisper": whisper,
        "torch": torch,
        "numpy": np
    }
    
    for name, module in dependencies.items():
        try:
            version = getattr(module, '__version__', 'unknown')
            print(f"✅ {name}: {version}")
        except Exception as e:
            print(f"❌ {name}: {e}")
    
    # Check FFmpeg
    try:
        import subprocess
        result = subprocess.run(['ffmpeg', '-version'], 
                              capture_output=True, text=True, timeout=5)
        if result.returncode == 0:
            version_line = result.stdout.split('\n')[0]
            print(f"✅ FFmpeg: {version_line}")
        else:
            print("❌ FFmpeg: Not working properly")
    except FileNotFoundError:
        print("❌ FFmpeg: Not found in PATH")
    except Exception as e:
        print(f"❌ FFmpeg: {e}")

if __name__ == "__main__":
    print("🎤 Whisper Simple Test")
    print("=" * 50)
    
    # Check dependencies first
    check_dependencies()
    print()
    
    # Run basic test
    success = test_whisper_basic()
    
    print("\n" + "=" * 50)
    if success:
        print("🎉 Test completed successfully!")
        print("✅ Whisper is working correctly")
    else:
        print("❌ Test failed!")
        print("🔧 Check the error messages above for troubleshooting")
    
    print("=" * 50)
