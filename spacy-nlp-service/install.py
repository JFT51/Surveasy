#!/usr/bin/env python3
"""
spaCy Dutch NLP Service Installation Script
Installs required packages and downloads the Dutch language model
"""

import subprocess
import sys
import os

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"\n🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed:")
        print(f"Error: {e.stderr}")
        return False

def main():
    print("🚀 Installing spaCy Dutch NLP Service")
    print("=" * 50)
    
    # Check Python version
    if sys.version_info < (3, 8):
        print("❌ Python 3.8 or higher is required")
        sys.exit(1)
    
    print(f"✅ Python version: {sys.version}")
    
    # Install requirements
    if not run_command("pip install -r requirements.txt", "Installing Python packages"):
        print("❌ Failed to install requirements")
        sys.exit(1)
    
    # Download spaCy Dutch model
    if not run_command("python -m spacy download nl_core_news_sm", "Downloading Dutch language model"):
        print("❌ Failed to download Dutch model")
        print("💡 You can try manually: python -m spacy download nl_core_news_sm")
        sys.exit(1)
    
    # Verify installation
    print("\n🔍 Verifying installation...")
    try:
        import spacy
        nlp = spacy.load("nl_core_news_sm")
        print("✅ spaCy Dutch model loaded successfully")
        print(f"✅ Model pipeline: {nlp.pipe_names}")
    except Exception as e:
        print(f"❌ Verification failed: {e}")
        sys.exit(1)
    
    print("\n🎉 Installation completed successfully!")
    print("\n🚀 To start the service, run:")
    print("   python app.py")
    print("\n📊 The service will be available at:")
    print("   http://localhost:5001")

if __name__ == "__main__":
    main()
