/**
 * Whisper Speech-to-Text Service Integration
 * Connects React frontend to Python Whisper backend
 */

// Whisper service configuration
const getWhisperServiceUrl = () => {
  // Try to get from environment variables (Vite)
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    const envUrl = import.meta.env.VITE_WHISPER_SERVICE_URL;

    // If empty string in production (Netlify), return null to indicate demo mode
    if (envUrl === '') {
      return null;
    }

    return envUrl || 'http://localhost:5000';
  }

  // Fallback to default
  return 'http://localhost:5000';
};

const WHISPER_SERVICE_URL = getWhisperServiceUrl();
const IS_DEMO_MODE = WHISPER_SERVICE_URL === null;

/**
 * Whisper service client for speech-to-text operations
 */
export class WhisperService {
  constructor(baseUrl = WHISPER_SERVICE_URL) {
    this.baseUrl = baseUrl;
    this.isAvailable = false;
    this.serviceInfo = null;
    this.isDemoMode = IS_DEMO_MODE;
  }

  /**
   * Check if Whisper service is available
   */
  async checkAvailability() {
    // If in demo mode (Netlify deployment), return false immediately
    if (this.isDemoMode) {
      console.log('Running in demo mode - Whisper service disabled');
      this.serviceInfo = {
        status: "demo",
        message: "Running in demo mode on Netlify",
        whisper_available: false,
        model_loaded: false,
        demo_mode: true
      };
      this.isAvailable = false;
      return false;
    }

    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        this.serviceInfo = await response.json();
        this.isAvailable = true;
        console.log('Whisper service is available:', this.serviceInfo);
        return true;
      } else {
        this.isAvailable = false;
        console.warn('Whisper service health check failed:', response.status);
        return false;
      }
    } catch (error) {
      this.isAvailable = false;
      console.warn('Whisper service not reachable:', error.message);
      return false;
    }
  }

  /**
   * Get available Whisper models
   */
  async getAvailableModels() {
    try {
      const response = await fetch(`${this.baseUrl}/models`);
      if (response.ok) {
        return await response.json();
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (error) {
      console.error('Failed to get available models:', error);
      throw error;
    }
  }

  /**
   * Transcribe audio file using Whisper
   * @param {File} audioFile - Audio file to transcribe
   * @param {Object} options - Transcription options
   * @returns {Promise<Object>} - Transcription result
   */
  async transcribeAudio(audioFile, options = {}) {
    const {
      language = 'nl',
      task = 'transcribe',
      wordTimestamps = true,
      initialPrompt = null
    } = options;

    try {
      const formData = new FormData();
      formData.append('audio', audioFile);
      formData.append('language', language);
      formData.append('task', task);
      formData.append('word_timestamps', wordTimestamps.toString());

      if (initialPrompt) {
        formData.append('initial_prompt', initialPrompt);
      }

      console.log('Sending audio for transcription...', {
        fileName: audioFile.name,
        fileSize: audioFile.size,
        language,
        task
      });

      const response = await fetch(`${this.baseUrl}/transcribe`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        console.log('Transcription completed:', result.result);
        return result.result;
      } else {
        console.error('Transcription failed:', result.error);
        throw new Error(result.error || 'Transcription failed');
      }
    } catch (error) {
      console.error('Transcription error:', error);
      throw error;
    }
  }

  /**
   * Detect language of audio file
   * @param {File} audioFile - Audio file to analyze
   * @returns {Promise<Object>} - Language detection result
   */
  async detectLanguage(audioFile) {
    try {
      const formData = new FormData();
      formData.append('audio', audioFile);

      const response = await fetch(`${this.baseUrl}/detect-language`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        return result.result;
      } else {
        throw new Error(result.error || 'Language detection failed');
      }
    } catch (error) {
      console.error('Language detection error:', error);
      throw error;
    }
  }

  /**
   * Get service information
   */
  getServiceInfo() {
    return this.serviceInfo;
  }

  /**
   * Check if service is available
   */
  isServiceAvailable() {
    return this.isAvailable;
  }
}

/**
 * Audio recording utilities for browser-based recording
 */
export class AudioRecorder {
  constructor() {
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.stream = null;
    this.isRecording = false;
  }

  /**
   * Start recording audio
   */
  async startRecording() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000
        }
      });

      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start(1000); // Collect data every second
      this.isRecording = true;

      console.log('Audio recording started');
      return true;
    } catch (error) {
      console.error('Failed to start recording:', error);
      throw error;
    }
  }

  /**
   * Stop recording and return audio blob
   */
  async stopRecording() {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || !this.isRecording) {
        reject(new Error('No active recording'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        this.cleanup();
        resolve(audioBlob);
      };

      this.mediaRecorder.onerror = (error) => {
        this.cleanup();
        reject(error);
      };

      this.mediaRecorder.stop();
      this.isRecording = false;
    });
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.isRecording = false;
  }

  /**
   * Check if currently recording
   */
  getIsRecording() {
    return this.isRecording;
  }
}

/**
 * Convert audio blob to File object for upload
 */
export const blobToFile = (blob, filename = 'recording.webm') => {
  return new File([blob], filename, { type: blob.type });
};

/**
 * Format transcription result for display
 */
export const formatTranscriptionResult = (result) => {
  if (!result) return null;

  return {
    text: result.text,
    language: result.language,
    wordCount: result.word_count,
    duration: result.duration,
    confidence: result.confidence,
    segments: result.segments?.map(segment => ({
      start: segment.start,
      end: segment.end,
      text: segment.text,
      words: segment.words || []
    })) || [],
    processingInfo: result.processing_info
  };
};

/**
 * Generate mock transcription for fallback
 */
export const generateMockTranscription = (duration = 30) => {
  const mockTexts = [
    "Goedemiddag, ik ben zeer geïnteresseerd in deze functie. Ik heb ruime ervaring met JavaScript, React en Node.js.",
    "Mijn achtergrond is in software ontwikkeling en ik heb gewerkt aan verschillende projecten met moderne technologieën.",
    "Ik ben een teamspeler en hou van uitdagingen. Communicatie en samenwerking zijn voor mij zeer belangrijk.",
    "In mijn vorige functie heb ik geleid aan de implementatie van een nieuwe applicatie architectuur.",
    "Ik ben altijd bereid om nieuwe technologieën te leren en mijn vaardigheden verder te ontwikkelen."
  ];

  const selectedText = mockTexts[Math.floor(Math.random() * mockTexts.length)];

  return {
    text: selectedText,
    language: "nl",
    wordCount: selectedText.split(' ').length,
    duration: duration,
    confidence: 0.85 + Math.random() * 0.1, // 85-95%
    segments: [{
      start: 0,
      end: duration,
      text: selectedText,
      words: selectedText.split(' ').map((word, index) => ({
        word,
        start: (index / selectedText.split(' ').length) * duration,
        end: ((index + 1) / selectedText.split(' ').length) * duration,
        probability: 0.8 + Math.random() * 0.2
      }))
    }],
    processingInfo: {
      model: "mock",
      device: "browser",
      task: "transcribe",
      timestamp: new Date().toISOString(),
      isMockData: true
    }
  };
};

// Create singleton instance
export const whisperService = new WhisperService();

// Initialize service availability check
whisperService.checkAvailability().catch(console.warn);

export default whisperService;
