# 🎤 Whisper AI Setup Guide for Surveasy

## 🎯 **Quick Setup Checklist**

### ✅ **Environment Files Configured**
- **Main .env**: ✅ Already configured with Whisper enabled
- **Whisper Service .env**: ✅ Created with optimal settings
- **Demo Mode**: ✅ Disabled to use real Whisper AI

### 🔧 **Required Dependencies**

#### **1. FFmpeg (Critical) - REQUIRED FOR WHISPER**
**⚠️ ISSUE IDENTIFIED: FFmpeg is missing - this is why transcription fails!**

**Option A: Chocolatey (Recommended)**
```bash
# Run PowerShell as Administrator
choco install ffmpeg

# Verify installation
ffmpeg -version
```

**Option B: Manual Installation**
1. Download FFmpeg from: https://www.gyan.dev/ffmpeg/builds/
2. Extract to `C:\ffmpeg`
3. Add `C:\ffmpeg\bin` to your PATH environment variable
4. Restart PowerShell/Command Prompt
5. Verify: `ffmpeg -version`

**Option C: Scoop**
```bash
scoop install ffmpeg
```

**Option D: Winget**
```bash
winget install Gyan.FFmpeg
```

#### **2. Python Dependencies**
```bash
cd whisper-service
pip install -r requirements.txt
```

#### **3. Whisper Model Download**
The first time you run the service, it will automatically download the model.

---

## 🚀 **Starting Whisper AI**

### **Step 1: Start Whisper Service**
```bash
# Navigate to whisper service directory
cd whisper-service

# Start the service
python app.py
```

**Expected Output:**
```
Loading Whisper model 'base' on device 'cpu'...
Model loaded successfully. Multilingual: True
Starting Whisper service on port 5000
Model: base, Device: cpu
* Running on all addresses (0.0.0.0)
* Running on http://127.0.0.1:5000
* Running on http://[::1]:5000
```

### **Step 2: Start React Application**
```bash
# In main project directory
npm run dev
```

### **Step 3: Test Whisper Integration**
1. Open http://localhost:3002
2. Click "Whisper Debug" button
3. Check service status (should show "Available")
4. Test live recording or file upload

---

## ⚙️ **Configuration Options**

### **Whisper Models (whisper-service/.env)**

| Model | Size | Speed | VRAM | Best For |
|-------|------|-------|------|----------|
| `tiny` | 39M | ~10x | ~1GB | Quick testing |
| `base` | 74M | ~7x | ~1GB | **Development** ⭐ |
| `small` | 244M | ~4x | ~2GB | Good balance |
| `medium` | 769M | ~2x | ~5GB | High accuracy |
| `large` | 1550M | 1x | ~10GB | Best accuracy |
| `turbo` | 809M | ~8x | ~6GB | **Production** ⭐ |

**Change model:**
```bash
# Edit whisper-service/.env
WHISPER_MODEL=small
```

### **Language Settings**
```bash
# Default language for transcription
DEFAULT_LANGUAGE=nl

# Supported languages
SUPPORTED_LANGUAGES=nl,en,de,fr,es
```

### **Performance Settings**
```bash
# Use GPU if available (much faster)
TORCH_DEVICE=auto

# For CPU only
TORCH_DEVICE=cpu

# For specific GPU
TORCH_DEVICE=cuda
```

---

## 🔍 **Troubleshooting**

### **Issue 1: Service Won't Start**

**Error**: `ModuleNotFoundError: No module named 'whisper'`
**Solution**:
```bash
cd whisper-service
pip install -r requirements.txt
```

**Error**: `FileNotFoundError: [Errno 2] No such file or directory: 'ffmpeg'`
**Solution**: Install FFmpeg (see dependencies section)

### **Issue 2: Model Loading Fails**

**Error**: `RuntimeError: CUDA out of memory`
**Solution**: Use smaller model or CPU
```bash
# Edit whisper-service/.env
WHISPER_MODEL=tiny
TORCH_DEVICE=cpu
```

### **Issue 3: Connection Refused**

**Error**: `Connection refused` in debug panel
**Solution**:
1. Check if service is running: `python app.py`
2. Verify port 5000 is not blocked
3. Check firewall settings

### **Issue 4: Poor Transcription Quality**

**Solutions**:
1. Use larger model: `WHISPER_MODEL=small`
2. Ensure good audio quality
3. Use appropriate language setting

---

## 🎯 **Verification Steps**

### **1. Service Health Check**
```bash
curl http://localhost:5000/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "service": "whisper-speech-to-text",
  "model": "base",
  "device": "cpu",
  "multilingual": true,
  "supported_languages": ["nl", "en", "de", "fr", "es"]
}
```

### **2. Debug Panel Test**
1. Open Surveasy: http://localhost:3002
2. Click "Whisper Debug" button
3. Check service status: Should show "Available"
4. Test recording: Record 5-10 seconds of speech
5. Verify transcription: Should show real transcription results

### **3. Full Workflow Test**
1. Upload CV and audio files
2. Complete analysis workflow
3. Check results page for "Whisper AI" badge
4. Verify real transcription in Full Text Display

---

## 📊 **Performance Optimization**

### **For Development**
```bash
# Fast, good enough quality
WHISPER_MODEL=base
TORCH_DEVICE=auto
```

### **For Production**
```bash
# Best balance of speed and quality
WHISPER_MODEL=turbo
TORCH_DEVICE=auto
```

### **For High Accuracy**
```bash
# Best quality, slower
WHISPER_MODEL=small
TORCH_DEVICE=auto
```

---

## 🎯 **Current Configuration Status**

### **✅ Environment Files Ready**
- **Main .env**: Whisper enabled, demo mode disabled
- **Whisper .env**: Optimal settings with base model
- **Production .env**: Demo mode for deployment

### **✅ Service Configuration**
- **Model**: base (good balance of speed/quality)
- **Language**: Dutch (nl) with multi-language support
- **Device**: Auto-detect (GPU if available)
- **Port**: 5000 with CORS enabled

### **✅ Integration Ready**
- **Frontend**: Configured to use real Whisper service
- **Debug Panel**: Available for immediate testing
- **Error Handling**: Graceful fallback to demo mode if service unavailable

---

## 🚀 **Next Steps**

1. **Install FFmpeg** (if not already installed)
2. **Start Whisper service**: `cd whisper-service && python app.py`
3. **Test with debug panel**: Click "Whisper Debug" button
4. **Verify integration**: Upload audio and check for real transcription

**Your Whisper AI is now configured and ready to provide real speech-to-text functionality!**
