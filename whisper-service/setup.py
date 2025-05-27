#!/usr/bin/env python3
"""
Setup script for Whisper Speech-to-Text Service
"""

import os
import sys
import subprocess
import platform
from pathlib import Path

def check_python_version():
    """Check if Python version is compatible"""
    if sys.version_info < (3, 8):
        print("Error: Python 3.8 or higher is required")
        sys.exit(1)
    print(f"✓ Python {sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}")

def check_ffmpeg():
    """Check if ffmpeg is installed"""
    try:
        subprocess.run(['ffmpeg', '-version'], capture_output=True, check=True)
        print("✓ FFmpeg is installed")
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("⚠ FFmpeg not found")
        return False

def install_ffmpeg():
    """Provide instructions for installing FFmpeg"""
    system = platform.system().lower()
    
    print("\nFFmpeg is required for audio processing. Please install it:")
    
    if system == "windows":
        print("Windows:")
        print("  - Using Chocolatey: choco install ffmpeg")
        print("  - Using Scoop: scoop install ffmpeg")
        print("  - Or download from: https://ffmpeg.org/download.html")
    elif system == "darwin":  # macOS
        print("macOS:")
        print("  - Using Homebrew: brew install ffmpeg")
        print("  - Using MacPorts: sudo port install ffmpeg")
    elif system == "linux":
        print("Linux:")
        print("  - Ubuntu/Debian: sudo apt update && sudo apt install ffmpeg")
        print("  - CentOS/RHEL: sudo yum install ffmpeg")
        print("  - Arch Linux: sudo pacman -S ffmpeg")
    
    print("\nAfter installing FFmpeg, run this setup script again.")

def install_requirements():
    """Install Python requirements"""
    try:
        print("Installing Python requirements...")
        subprocess.run([
            sys.executable, '-m', 'pip', 'install', '-r', 'requirements.txt'
        ], check=True)
        print("✓ Requirements installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"✗ Failed to install requirements: {e}")
        return False

def test_whisper_import():
    """Test if Whisper can be imported"""
    try:
        # Add whisper-main to path
        whisper_path = Path(__file__).parent.parent / "whisper-main"
        sys.path.insert(0, str(whisper_path))
        
        import whisper
        print("✓ Whisper imported successfully")
        
        # Test model loading
        print("Testing model loading...")
        model = whisper.load_model("tiny")
        print(f"✓ Model loaded successfully (device: {model.device})")
        
        return True
    except Exception as e:
        print(f"✗ Whisper import/loading failed: {e}")
        return False

def create_test_script():
    """Create a test script"""
    test_script = """#!/usr/bin/env python3
import sys
import os
from pathlib import Path

# Add whisper-main to path
whisper_path = Path(__file__).parent.parent / "whisper-main"
sys.path.insert(0, str(whisper_path))

import whisper
import requests
import time

def test_service():
    print("Testing Whisper service...")
    
    # Test health endpoint
    try:
        response = requests.get("http://localhost:5000/health", timeout=5)
        if response.status_code == 200:
            print("✓ Service is running")
            print(f"  Response: {response.json()}")
        else:
            print(f"✗ Service returned status {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"✗ Service not reachable: {e}")
        print("Make sure to start the service with: python app.py")

if __name__ == "__main__":
    test_service()
"""
    
    with open("test_service.py", "w") as f:
        f.write(test_script)
    
    print("✓ Test script created: test_service.py")

def main():
    """Main setup function"""
    print("Whisper Speech-to-Text Service Setup")
    print("=" * 40)
    
    # Check Python version
    check_python_version()
    
    # Check FFmpeg
    if not check_ffmpeg():
        install_ffmpeg()
        return
    
    # Install requirements
    if not install_requirements():
        return
    
    # Test Whisper
    if not test_whisper_import():
        print("\nTroubleshooting:")
        print("1. Make sure the whisper-main folder is in the parent directory")
        print("2. Try installing PyTorch manually: pip install torch")
        print("3. Check if you have enough disk space for model downloads")
        return
    
    # Create test script
    create_test_script()
    
    print("\n" + "=" * 40)
    print("✓ Setup completed successfully!")
    print("\nNext steps:")
    print("1. Start the service: python app.py")
    print("2. Test the service: python test_service.py")
    print("3. The service will be available at http://localhost:5000")
    print("\nAvailable endpoints:")
    print("  GET  /health          - Service health check")
    print("  GET  /models          - Available Whisper models")
    print("  POST /transcribe      - Transcribe audio file")
    print("  POST /detect-language - Detect audio language")

if __name__ == "__main__":
    main()
