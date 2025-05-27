import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useNotifications } from '../../context/NotificationContext';
import { FileText, Mic, Brain, CheckCircle, Loader } from 'lucide-react';
import { processCVText, processAudioWithWhisper, analyzeCandidate } from '../../utils/analysisEngine';
import AIModelStatus from '../AIModelStatus';

const ProcessingStep = () => {
  const { state, setExtractedData, setAnalysis, setStep, setProcessing } = useApp();
  const { processing, success, info, dataQuality } = useNotifications();
  const [currentTask, setCurrentTask] = useState('');
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState([]);
  const [processingNotificationId, setProcessingNotificationId] = useState(null);

  const addLog = (message, type = 'info') => {
    setLogs(prev => [...prev, {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`, // Unique ID
      message,
      type,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const updateProgress = (value, task) => {
    setProgress(value);
    setCurrentTask(task);
    setProcessing({ isProcessing: true, currentTask: task, progress: value });

    // Update processing notification
    if (processingNotificationId) {
      processing(task, {
        progress: value,
        progressText: task
      });
    }
  };

  useEffect(() => {
    let isProcessing = false; // Prevent multiple simultaneous runs

    const runAnalysis = async () => {
      if (isProcessing) {
        console.log('Analysis already in progress, skipping...');
        return;
      }

      isProcessing = true;

      try {
        // Start processing notification
        const notificationId = processing('AI analyse gestart...', {
          progress: 0,
          progressText: 'Initialisatie...'
        });
        setProcessingNotificationId(notificationId);

        addLog('AI analyse gestart...', 'info');
        info('Demo modus actief - Resultaten zijn gebaseerd op voorbeelddata', {
          title: 'Demo Modus',
          dataQuality: 'mock'
        });

        // Step 1: Process CV
        updateProgress(10, 'CV wordt verwerkt met PDF.js...');
        addLog('PDF wordt gelezen en tekst geëxtraheerd met PDF.js');

        const cvResult = await processCVText(state.files.cv);
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (cvResult.success) {
          updateProgress(30, 'CV tekst succesvol geëxtraheerd');
          if (cvResult.metadata.isPDFExtraction) {
            addLog(`PDF succesvol verwerkt: ${cvResult.metadata.wordCount} woorden uit ${cvResult.metadata.pageCount} pagina's`, 'success');
            addLog(`Secties gevonden: ${cvResult.metadata.sections?.join(', ') || 'Geen'}`, 'info');
          } else {
            addLog(`Fallback modus gebruikt: ${cvResult.metadata.fallbackReason}`, 'warning');
            addLog(`Mock data geladen: ${cvResult.metadata.wordCount} woorden`, 'info');
          }
        } else {
          addLog('CV verwerking mislukt, fallback gebruikt', 'warning');
        }

        const cvText = cvResult.extractedText;

        // Step 2: Process Audio with Whisper
        updateProgress(40, 'Audio wordt getranscribeerd met Whisper...');
        addLog('Audio transcriptie gestart met Whisper AI');

        let audioResult;
        let audioTranscript;

        try {
          // Use Whisper transcription with retry logic for concurrent processing
          addLog('Whisper transcriptie gestart...', 'info');

          let retryCount = 0;
          const maxRetries = 3;

          while (retryCount < maxRetries) {
            try {
              audioResult = await processAudioWithWhisper(state.files.audio);
              break; // Success, exit retry loop
            } catch (error) {
              if (error.message.includes('Another transcription is currently in progress') && retryCount < maxRetries - 1) {
                retryCount++;
                addLog(`Whisper service bezet, poging ${retryCount + 1}/${maxRetries}...`, 'warning');
                await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds before retry
                continue;
              }
              throw error; // Re-throw if not a concurrency issue or max retries reached
            }
          }

          audioTranscript = audioResult.audioTranscript;

          if (audioResult.success && audioResult.metadata.isRealTranscription) {
            addLog(`Whisper transcriptie succesvol: ${audioResult.metadata.wordCount} woorden`, 'success');
            addLog(`Taal: ${audioResult.metadata.language}, Betrouwbaarheid: ${Math.round(audioResult.metadata.confidence * 100)}%`, 'info');
            addLog(`Model: ${audioResult.transcriptionData.processingInfo?.model || 'Whisper'}, Duur: ${Math.round(audioResult.metadata.duration)}s`, 'info');
          } else {
            throw new Error('Whisper transcription failed - no real transcription available');
          }
        } catch (error) {
          addLog(`Audio transcriptie mislukt: ${error.message}`, 'error');
          throw new Error(`Audio transcription failed: ${error.message}. Please ensure the Whisper service is running on port 5000.`);
        }

        updateProgress(60, 'Audio transcriptie voltooid');
        addLog(`Audio verwerkt: ${audioTranscript.length} karakters getranscribeerd`, 'success');

        // Update extracted data with full audio result
        setExtractedData({
          cvText,
          audioTranscript,
          audioResult: audioResult // Include full audio processing result
        });

        // Step 3: Analyze skills and match
        updateProgress(70, 'Vaardigheden worden geanalyseerd...');
        addLog('AI analyse van vaardigheden gestart');

        await new Promise(resolve => setTimeout(resolve, 2000));
        const analysis = await analyzeCandidate(cvText, audioTranscript, state.desiredSkills, audioResult);

        updateProgress(90, 'Kandidaat wordt gecategoriseerd...');
        addLog('Kandidaat categorisering berekend', 'success');

        await new Promise(resolve => setTimeout(resolve, 1000));

        // Set final analysis
        setAnalysis(analysis);

        updateProgress(100, 'AI analyse voltooid!');
        addLog('Analyse succesvol voltooid!', 'success');

        // Show completion notifications
        success('AI analyse succesvol voltooid!', {
          title: 'Analyse Voltooid',
          duration: 4000
        });

        dataQuality('mock', {
          title: 'Demo Resultaten',
          message: 'Resultaten zijn gebaseerd op voorbeelddata voor demonstratiedoeleinden. In productie worden echte AI-modellen gebruikt.',
          duration: 6000
        });

        // Navigate to results after a short delay
        setTimeout(() => {
          setProcessing({ isProcessing: false, currentTask: '', progress: 100 });
          setStep('results');
        }, 2000);

      } catch (error) {
        addLog(`Fout tijdens analyse: ${error.message}`, 'error');
        console.error('Analysis error:', error);
      } finally {
        isProcessing = false; // Reset processing flag
      }
    };

    runAnalysis();
  }, []);

  const getLogIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error': return <CheckCircle className="w-4 h-4 text-red-500" />;
      case 'warning': return <CheckCircle className="w-4 h-4 text-yellow-500" />;
      case 'info': return <CheckCircle className="w-4 h-4 text-blue-500" />;
      default: return <Loader className="w-4 h-4 text-blue-500 animate-spin" />;
    }
  };

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-5xl font-bold text-neutral-900 mb-6">
          AI Analyse in Uitvoering
        </h2>
        <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
          Het systeem analyseert de kandidaat data met AI-algoritmes voor
          diepgaande talent assessment en skill matching.
        </p>
      </div>

      {/* Progress Bar */}
      <div className="card">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-3xl font-bold text-neutral-900">Voortgang</h3>
          <div className="flex items-center space-x-4">
            <span className="text-4xl font-bold text-primary-600">{progress}%</span>
            <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center">
              <Loader className="w-6 h-6 text-white animate-spin" />
            </div>
          </div>
        </div>

        <div className="w-full bg-neutral-200 rounded-lg h-6 mb-8">
          <div
            className="h-full bg-primary-600 rounded-lg transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <div className="text-center">
          <p className="text-2xl font-medium text-neutral-700">{currentTask}</p>
        </div>
      </div>

      {/* Processing Steps */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className={`card transition-all duration-300 ${progress >= 30 ? 'bg-green-50 border-green-200' : 'bg-gray-50'}`}>
          <div className="flex items-center mb-3">
            <div className={`p-2 rounded-full ${progress >= 30 ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'}`}>
              <FileText className="w-5 h-5" />
            </div>
            <h4 className="ml-3 font-medium text-gray-900">CV Verwerking</h4>
          </div>
          <p className="text-sm text-gray-600">
            Extractie van tekst, vaardigheden en ervaring uit de PDF
          </p>
          {progress >= 30 && (
            <div className="mt-2 flex items-center text-sm text-green-600">
              <CheckCircle className="w-4 h-4 mr-1" />
              Voltooid
            </div>
          )}
        </div>

        <div className={`card transition-all duration-300 ${progress >= 60 ? 'bg-green-50 border-green-200' : 'bg-gray-50'}`}>
          <div className="flex items-center mb-3">
            <div className={`p-2 rounded-full ${progress >= 60 ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'}`}>
              <Mic className="w-5 h-5" />
            </div>
            <h4 className="ml-3 font-medium text-gray-900">Audio Transcriptie</h4>
          </div>
          <p className="text-sm text-gray-600">
            Conversie van spraak naar tekst en analyse van communicatie
          </p>
          {progress >= 60 && (
            <div className="mt-2 flex items-center text-sm text-green-600">
              <CheckCircle className="w-4 h-4 mr-1" />
              Voltooid
            </div>
          )}
        </div>

        <div className={`card transition-all duration-300 ${progress >= 90 ? 'bg-green-50 border-green-200' : 'bg-gray-50'}`}>
          <div className="flex items-center mb-3">
            <div className={`p-2 rounded-full ${progress >= 90 ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'}`}>
              <Brain className="w-5 h-5" />
            </div>
            <h4 className="ml-3 font-medium text-gray-900">AI Analyse</h4>
          </div>
          <p className="text-sm text-gray-600">
            Matching van vaardigheden en categorisering van kandidaat
          </p>
          {progress >= 90 && (
            <div className="mt-2 flex items-center text-sm text-green-600">
              <CheckCircle className="w-4 h-4 mr-1" />
              Voltooid
            </div>
          )}
        </div>
      </div>

      {/* AI Model Status */}
      <AIModelStatus step="processing" />

      {/* Processing Log */}
      <div className="card">
        <h3 className="text-2xl font-semibold text-neutral-900 mb-6">Verwerkingslog</h3>
        <div className="bg-neutral-50 rounded-lg p-6 max-h-64 overflow-y-auto">
          {logs.map((log) => (
            <div key={log.id} className="flex items-start space-x-3 mb-3 last:mb-0">
              {getLogIcon(log.type)}
              <div className="flex-1 min-w-0">
                <p className="text-lg text-neutral-900">{log.message}</p>
                <p className="text-sm text-neutral-500">{log.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProcessingStep;
