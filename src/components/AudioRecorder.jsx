import React, { useState, useRef, useEffect } from 'react';
import {
  Mic, MicOff, Square, Play, Pause, Download, Upload,
  Volume2, Clock, Zap, CheckCircle, AlertTriangle, Loader
} from 'lucide-react';
import { AudioRecorder, whisperService, blobToFile, formatTranscriptionResult, generateMockTranscription } from '../utils/whisperService';

const AudioRecorderComponent = ({ onTranscriptionComplete, onAudioUpload }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionResult, setTranscriptionResult] = useState(null);
  const [whisperAvailable, setWhisperAvailable] = useState(false);
  const [error, setError] = useState(null);

  const audioRecorderRef = useRef(new AudioRecorder());
  const audioPlayerRef = useRef(null);
  const recordingTimerRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Check Whisper service availability
    const checkWhisperService = async () => {
      const available = await whisperService.checkAvailability();
      setWhisperAvailable(available);
    };

    checkWhisperService();

    // Cleanup on unmount
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      audioRecorderRef.current.cleanup();
    };
  }, []);

  const startRecording = async () => {
    try {
      setError(null);
      await audioRecorderRef.current.startRecording();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      setError('Kon opname niet starten. Controleer microfoon toegang.');
      console.error('Recording start error:', error);
    }
  };

  const stopRecording = async () => {
    try {
      const blob = await audioRecorderRef.current.stopRecording();
      setAudioBlob(blob);
      setIsRecording(false);

      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }

      // Automatically transcribe if Whisper is available
      if (whisperAvailable) {
        await transcribeAudio(blob);
      } else {
        // Generate mock transcription
        const mockResult = generateMockTranscription(recordingTime);
        setTranscriptionResult(mockResult);
        if (onTranscriptionComplete) {
          onTranscriptionComplete(mockResult);
        }
      }
    } catch (error) {
      setError('Kon opname niet stoppen.');
      console.error('Recording stop error:', error);
    }
  };

  const playAudio = () => {
    if (audioBlob && audioPlayerRef.current) {
      const audioUrl = URL.createObjectURL(audioBlob);
      audioPlayerRef.current.src = audioUrl;
      audioPlayerRef.current.play();
      setIsPlaying(true);

      audioPlayerRef.current.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };
    }
  };

  const pauseAudio = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      setIsPlaying(false);
    }
  };

  const transcribeAudio = async (blob) => {
    try {
      setIsTranscribing(true);
      setError(null);

      const audioFile = blobToFile(blob, 'recording.webm');

      if (!whisperAvailable) {
        throw new Error('Whisper service is not available. Please ensure the Whisper service is running on port 5000.');
      }

      const result = await whisperService.transcribeAudio(audioFile, {
        language: 'nl',
        task: 'transcribe',
        wordTimestamps: true,
        initialPrompt: 'Dit is een sollicitatiegesprek in het Nederlands.'
      });

      const formattedResult = formatTranscriptionResult(result);
      setTranscriptionResult(formattedResult);

      if (onTranscriptionComplete) {
        onTranscriptionComplete(formattedResult);
      }
    } catch (error) {
      setError('Transcriptie mislukt. Probeer opnieuw.');
      console.error('Transcription error:', error);
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setError(null);
      setIsTranscribing(true);

      // Create blob from file for playback
      const blob = new Blob([file], { type: file.type });
      setAudioBlob(blob);

      if (onAudioUpload) {
        onAudioUpload(file);
      }

      // Transcribe uploaded file
      if (!whisperAvailable) {
        throw new Error('Whisper service is not available. Please ensure the Whisper service is running on port 5000.');
      }

      const result = await whisperService.transcribeAudio(file, {
        language: 'nl',
        task: 'transcribe',
        wordTimestamps: true
      });

      const formattedResult = formatTranscriptionResult(result);
      setTranscriptionResult(formattedResult);

      if (onTranscriptionComplete) {
        onTranscriptionComplete(formattedResult);
      }
    } catch (error) {
      setError('Bestand upload mislukt.');
      console.error('File upload error:', error);
    } finally {
      setIsTranscribing(false);
    }
  };

  const downloadAudio = () => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `interview-recording-${new Date().toISOString().slice(0, 19)}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-neutral-900">Audio Interview Opname</h3>
        <div className="flex items-center space-x-2">
          {whisperAvailable ? (
            <span className="flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              <CheckCircle className="w-4 h-4 mr-1" />
              Whisper Actief
            </span>
          ) : (
            <span className="flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
              <Zap className="w-4 h-4 mr-1" />
              Demo Modus
            </span>
          )}
        </div>
      </div>

      {/* Service Status */}
      <div className="mb-6 p-4 bg-neutral-50 rounded-lg">
        <h4 className="text-lg font-semibold text-neutral-900 mb-2">Service Status</h4>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-neutral-700">Whisper Service:</span>
            <span className={`ml-2 ${whisperAvailable ? 'text-green-600' : 'text-yellow-600'}`}>
              {whisperAvailable ? 'Beschikbaar' : 'Niet beschikbaar (Demo modus)'}
            </span>
          </div>
          <div>
            <span className="font-medium text-neutral-700">Transcriptie:</span>
            <span className="ml-2 text-blue-600">
              {whisperAvailable ? 'Real-time Nederlands' : 'Gesimuleerd'}
            </span>
          </div>
        </div>
      </div>

      {/* Recording Controls */}
      <div className="mb-6">
        <div className="flex items-center justify-center space-x-4 mb-4">
          {!isRecording ? (
            <button
              onClick={startRecording}
              disabled={isTranscribing}
              className="flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Mic className="w-5 h-5 mr-2" />
              Start Opname
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="flex items-center px-6 py-3 bg-red-800 text-white rounded-lg hover:bg-red-900 transition-colors animate-pulse"
            >
              <Square className="w-5 h-5 mr-2" />
              Stop Opname
            </button>
          )}

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isRecording || isTranscribing}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Upload className="w-5 h-5 mr-2" />
            Upload Audio
          </button>
        </div>

        {/* Recording Timer */}
        {isRecording && (
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 text-red-600">
              <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
              <Clock className="w-5 h-5" />
              <span className="text-xl font-mono font-bold">
                {formatTime(recordingTime)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Audio Playback */}
      {audioBlob && (
        <div className="mb-6 p-4 bg-neutral-50 rounded-lg">
          <h4 className="text-lg font-semibold text-neutral-900 mb-3">Audio Playback</h4>
          <div className="flex items-center space-x-4">
            {!isPlaying ? (
              <button
                onClick={playAudio}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Play className="w-4 h-4 mr-2" />
                Afspelen
              </button>
            ) : (
              <button
                onClick={pauseAudio}
                className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              >
                <Pause className="w-4 h-4 mr-2" />
                Pauzeren
              </button>
            )}

            <button
              onClick={downloadAudio}
              className="flex items-center px-4 py-2 bg-neutral-600 text-white rounded-lg hover:bg-neutral-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </button>

            <div className="flex items-center text-neutral-600">
              <Volume2 className="w-4 h-4 mr-1" />
              <span className="text-sm">Audio opgenomen</span>
            </div>
          </div>
        </div>
      )}

      {/* Transcription Status */}
      {isTranscribing && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center">
            <Loader className="w-5 h-5 text-blue-600 mr-3 animate-spin" />
            <span className="text-blue-800 font-medium">
              {whisperAvailable ? 'Transcriberen met Whisper...' : 'Genereren demo transcriptie...'}
            </span>
          </div>
        </div>
      )}

      {/* Transcription Result */}
      {transcriptionResult && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="text-lg font-semibold text-green-800 mb-3">Transcriptie Resultaat</h4>
          <div className="space-y-3">
            <div className="p-3 bg-white rounded border">
              <p className="text-neutral-800">{transcriptionResult.text}</p>
            </div>
            <div className="grid md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium text-green-700">Taal:</span>
                <span className="ml-2">{transcriptionResult.language}</span>
              </div>
              <div>
                <span className="font-medium text-green-700">Woorden:</span>
                <span className="ml-2">{transcriptionResult.wordCount}</span>
              </div>
              <div>
                <span className="font-medium text-green-700">Duur:</span>
                <span className="ml-2">{Math.round(transcriptionResult.duration)}s</span>
              </div>
              <div>
                <span className="font-medium text-green-700">Betrouwbaarheid:</span>
                <span className="ml-2">{Math.round(transcriptionResult.confidence * 100)}%</span>
              </div>
            </div>
            {transcriptionResult.processingInfo?.isMockData && (
              <div className="p-2 bg-yellow-100 border border-yellow-300 rounded text-sm text-yellow-800">
                ⚠️ Dit is demo data. Start de Whisper service voor echte transcriptie.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-600 mr-3" />
            <span className="text-red-800 font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Hidden audio player */}
      <audio ref={audioPlayerRef} className="hidden" />
    </div>
  );
};

export default AudioRecorderComponent;
