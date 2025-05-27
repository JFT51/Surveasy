import React, { useState, useEffect } from 'react';
import { 
  Mic, MicOff, Play, Square, Upload, Download, 
  CheckCircle, XCircle, AlertCircle, Loader, 
  Volume2, FileAudio, Settings, RefreshCw
} from 'lucide-react';
import { whisperService, AudioRecorder, blobToFile, formatTranscriptionResult } from '../../utils/whisperService';

const WhisperDebugPanel = () => {
  const [serviceStatus, setServiceStatus] = useState({
    available: false,
    checking: true,
    info: null,
    error: null
  });
  
  const [recorder, setRecorder] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  
  const [transcription, setTranscription] = useState({
    result: null,
    loading: false,
    error: null
  });
  
  const [uploadedFile, setUploadedFile] = useState(null);

  // Initialize recorder and check service
  useEffect(() => {
    const audioRecorder = new AudioRecorder();
    setRecorder(audioRecorder);
    
    checkWhisperService();
    
    return () => {
      if (audioRecorder) {
        audioRecorder.cleanup();
      }
    };
  }, []);

  // Recording timer
  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    
    return () => clearInterval(interval);
  }, [isRecording]);

  const checkWhisperService = async () => {
    setServiceStatus(prev => ({ ...prev, checking: true, error: null }));
    
    try {
      const available = await whisperService.checkAvailability();
      const info = whisperService.getServiceInfo();
      
      setServiceStatus({
        available,
        checking: false,
        info,
        error: null
      });
    } catch (error) {
      setServiceStatus({
        available: false,
        checking: false,
        info: null,
        error: error.message
      });
    }
  };

  const startRecording = async () => {
    try {
      await recorder.startRecording();
      setIsRecording(true);
      setAudioBlob(null);
      setAudioUrl(null);
      setTranscription({ result: null, loading: false, error: null });
    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('Failed to start recording: ' + error.message);
    }
  };

  const stopRecording = async () => {
    try {
      const blob = await recorder.stopRecording();
      setIsRecording(false);
      setAudioBlob(blob);
      
      // Create audio URL for playback
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
    } catch (error) {
      console.error('Failed to stop recording:', error);
      alert('Failed to stop recording: ' + error.message);
    }
  };

  const transcribeAudio = async (audioFile) => {
    setTranscription({ result: null, loading: true, error: null });
    
    try {
      console.log('Starting transcription with Whisper service...');
      
      if (!serviceStatus.available) {
        throw new Error('Whisper service is not available');
      }
      
      const result = await whisperService.transcribeAudio(audioFile, {
        language: 'nl',
        task: 'transcribe',
        wordTimestamps: true,
        initialPrompt: 'Dit is een sollicitatiegesprek in het Nederlands.'
      });
      
      const formattedResult = formatTranscriptionResult(result);
      setTranscription({ result: formattedResult, loading: false, error: null });
      
      console.log('Transcription completed:', formattedResult);
    } catch (error) {
      console.error('Transcription failed:', error);
      setTranscription({ result: null, loading: false, error: error.message });
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedFile(file);
      transcribeAudio(file);
    }
  };

  const transcribeRecording = () => {
    if (audioBlob) {
      const audioFile = blobToFile(audioBlob, 'debug-recording.webm');
      transcribeAudio(audioFile);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const downloadRecording = () => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'whisper-debug-recording.webm';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-neutral-900">Whisper Debug Panel</h2>
        <button
          onClick={checkWhisperService}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          disabled={serviceStatus.checking}
        >
          <RefreshCw className={`w-4 h-4 ${serviceStatus.checking ? 'animate-spin' : ''}`} />
          <span>Refresh Status</span>
        </button>
      </div>

      {/* Service Status */}
      <div className="card">
        <h3 className="text-xl font-semibold text-neutral-900 mb-4">Service Status</h3>
        
        <div className="flex items-center space-x-3 mb-4">
          {serviceStatus.checking ? (
            <Loader className="w-6 h-6 text-blue-600 animate-spin" />
          ) : serviceStatus.available ? (
            <CheckCircle className="w-6 h-6 text-green-600" />
          ) : (
            <XCircle className="w-6 h-6 text-red-600" />
          )}
          
          <div>
            <p className="font-medium">
              {serviceStatus.checking ? 'Checking service...' : 
               serviceStatus.available ? 'Whisper Service Available' : 
               'Whisper Service Unavailable'}
            </p>
            {serviceStatus.error && (
              <p className="text-sm text-red-600">{serviceStatus.error}</p>
            )}
          </div>
        </div>

        {serviceStatus.info && (
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h4 className="font-medium text-green-800 mb-2">Service Information</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Model:</span> {serviceStatus.info.model}
              </div>
              <div>
                <span className="font-medium">Device:</span> {serviceStatus.info.device}
              </div>
              <div>
                <span className="font-medium">Multilingual:</span> {serviceStatus.info.multilingual ? 'Yes' : 'No'}
              </div>
              <div>
                <span className="font-medium">Languages:</span> {serviceStatus.info.supported_languages?.length || 0}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Audio Recording */}
      <div className="card">
        <h3 className="text-xl font-semibold text-neutral-900 mb-4">Live Recording</h3>
        
        <div className="flex items-center space-x-4 mb-4">
          {!isRecording ? (
            <button
              onClick={startRecording}
              className="flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Mic className="w-5 h-5" />
              <span>Start Recording</span>
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="flex items-center space-x-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Square className="w-5 h-5" />
              <span>Stop Recording</span>
            </button>
          )}
          
          {isRecording && (
            <div className="flex items-center space-x-2 text-red-600">
              <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
              <span className="font-mono text-lg">{formatTime(recordingTime)}</span>
            </div>
          )}
        </div>

        {audioUrl && (
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <audio controls src={audioUrl} className="flex-1" />
              <button
                onClick={downloadRecording}
                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                title="Download Recording"
              >
                <Download className="w-5 h-5" />
              </button>
            </div>
            
            <button
              onClick={transcribeRecording}
              disabled={!serviceStatus.available || transcription.loading}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
            >
              <Volume2 className="w-4 h-4" />
              <span>Transcribe Recording</span>
            </button>
          </div>
        )}
      </div>

      {/* File Upload */}
      <div className="card">
        <h3 className="text-xl font-semibold text-neutral-900 mb-4">File Upload</h3>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
              <Upload className="w-4 h-4" />
              <span>Upload Audio File</span>
              <input
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            
            {uploadedFile && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <FileAudio className="w-4 h-4" />
                <span>{uploadedFile.name}</span>
                <span>({Math.round(uploadedFile.size / 1024)} KB)</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Transcription Results */}
      <div className="card">
        <h3 className="text-xl font-semibold text-neutral-900 mb-4">Transcription Results</h3>
        
        {transcription.loading && (
          <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
            <Loader className="w-5 h-5 text-blue-600 animate-spin" />
            <span className="text-blue-800">Transcribing audio...</span>
          </div>
        )}
        
        {transcription.error && (
          <div className="flex items-center space-x-3 p-4 bg-red-50 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <div>
              <p className="font-medium text-red-800">Transcription Failed</p>
              <p className="text-sm text-red-600">{transcription.error}</p>
            </div>
          </div>
        )}
        
        {transcription.result && (
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-800 mb-2">Transcription Success</h4>
              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <span className="font-medium">Language:</span> {transcription.result.language}
                </div>
                <div>
                  <span className="font-medium">Confidence:</span> {Math.round(transcription.result.confidence * 100)}%
                </div>
                <div>
                  <span className="font-medium">Duration:</span> {Math.round(transcription.result.duration)}s
                </div>
                <div>
                  <span className="font-medium">Words:</span> {transcription.result.wordCount}
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-2">Transcribed Text</h4>
              <p className="text-gray-700 leading-relaxed">{transcription.result.text}</p>
            </div>
            
            {transcription.result.segments && transcription.result.segments.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">Segments</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {transcription.result.segments.map((segment, index) => (
                    <div key={index} className="text-sm">
                      <span className="font-mono text-gray-500">
                        [{Math.round(segment.start)}s - {Math.round(segment.end)}s]
                      </span>
                      <span className="ml-2 text-gray-700">{segment.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WhisperDebugPanel;
