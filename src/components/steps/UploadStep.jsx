import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useNotifications } from '../../context/NotificationContext';
import { Upload, FileText, Mic, CheckCircle, X, Settings } from 'lucide-react';
import { validatePDF } from '../../utils/pdfProcessor';
import AIModelStatus from '../AIModelStatus';
import Modal from '../Modal';
import WhisperDebugPanel from '../debug/WhisperDebugPanel';

const UploadStep = () => {
  const { state, setFiles, setStep } = useApp();
  const { success, error, info } = useNotifications();
  const [dragOver, setDragOver] = useState({ cv: false, audio: false });
  const [isDebugModalOpen, setIsDebugModalOpen] = useState(false);
  const cvInputRef = useRef(null);
  const audioInputRef = useRef(null);

  const handleDragOver = (e, type) => {
    e.preventDefault();
    setDragOver(prev => ({ ...prev, [type]: true }));
  };

  const handleDragLeave = (e, type) => {
    e.preventDefault();
    setDragOver(prev => ({ ...prev, [type]: false }));
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    setDragOver(prev => ({ ...prev, [type]: false }));

    const files = Array.from(e.dataTransfer.files);
    const file = files[0];

    if (file) {
      handleFileSelect(file, type);
    }
  };

  const handleFileSelect = async (file, type) => {
    if (!file) return;

    if (type === 'cv') {
      // Validate file type
      if (file.type !== 'application/pdf') {
        error('Alleen PDF bestanden zijn toegestaan voor CV upload');
        return;
      }

      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        error('CV bestand mag niet groter zijn dan 10MB');
        return;
      }

      // Validate PDF using PDF.js
      info('PDF wordt gevalideerd...', { duration: 2000 });
      try {
        const isValidPDF = await validatePDF(file);
        if (!isValidPDF) {
          error('Het geüploade bestand is geen geldig PDF bestand of is beschadigd');
          return;
        }
      } catch (err) {
        error('Fout bij PDF validatie. Probeer een ander bestand.');
        return;
      }

      setFiles({ cv: file });
      success(`CV "${file.name}" succesvol geüpload en gevalideerd`, {
        duration: 3000
      });
    } else if (type === 'audio') {
      // Validate audio file
      if (!file.type.startsWith('audio/')) {
        error('Alleen audio bestanden zijn toegestaan');
        return;
      }

      // Validate file size (50MB)
      if (file.size > 50 * 1024 * 1024) {
        error('Audio bestand mag niet groter zijn dan 50MB');
        return;
      }

      setFiles({ audio: file });
      success(`Audio bestand "${file.name}" succesvol geüpload`, {
        duration: 3000
      });
    } else {
      error(`Ongeldig bestandstype voor ${type === 'cv' ? 'CV' : 'audio'}. ${
        type === 'cv' ? 'Alleen PDF bestanden zijn toegestaan.' : 'Alleen audio bestanden zijn toegestaan.'
      }`);
    }
  };

  const removeFile = (type) => {
    setFiles({ [type]: null });
  };

  const canProceed = state.files.cv && state.files.audio;

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-5xl font-bold text-neutral-900 mb-6">
          Upload Kandidaat Bestanden
        </h2>
        <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
          Upload hier uw CV (PDF) en audio interview.
          Het systeem extraheert vaardigheden en zal een uitgebreide beoordeling genereren.
          In een volgende fase zullen kandidaten ook een ranking krijgen maar wil eerst dit overlopen.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* CV Upload */}
        <div className="card-minimal">
          <div className="flex items-center mb-8">
            <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center mr-4">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-neutral-900">CV Upload</h3>
          </div>

          {!state.files.cv ? (
            <div
              className={`upload-zone ${dragOver.cv ? 'dragover' : ''}`}
              onDragOver={(e) => handleDragOver(e, 'cv')}
              onDragLeave={(e) => handleDragLeave(e, 'cv')}
              onDrop={(e) => handleDrop(e, 'cv')}
              onClick={() => cvInputRef.current?.click()}
            >
              <Upload className="w-16 h-16 text-neutral-400 mx-auto mb-6" />
              <h4 className="text-2xl font-semibold text-neutral-700 mb-3">
                Sleep CV hier of klik om te uploaden
              </h4>
              <p className="text-lg text-neutral-500">
                Alleen PDF bestanden (max 10MB)
              </p>
              <input
                ref={cvInputRef}
                type="file"
                accept=".pdf"
                onChange={(e) => handleFileSelect(e.target.files[0], 'cv')}
                className="hidden"
              />
            </div>
          ) : (
            <div className="bg-success-50 border border-success-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-success-600 mr-3" />
                  <div>
                    <p className="font-medium text-success-800">{state.files.cv.name}</p>
                    <p className="text-sm text-success-600">
                      {formatFileSize(state.files.cv.size)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile('cv')}
                  className="text-success-600 hover:text-success-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Audio Upload */}
        <div className="card-minimal">
          <div className="flex items-center mb-8">
            <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center mr-4">
              <Mic className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-neutral-900">Interview Audio</h3>
          </div>

          {!state.files.audio ? (
            <div
              className={`upload-zone ${dragOver.audio ? 'dragover' : ''}`}
              onDragOver={(e) => handleDragOver(e, 'audio')}
              onDragLeave={(e) => handleDragLeave(e, 'audio')}
              onDrop={(e) => handleDrop(e, 'audio')}
              onClick={() => audioInputRef.current?.click()}
            >
              <Mic className="w-16 h-16 text-neutral-400 mx-auto mb-6" />
              <h4 className="text-2xl font-semibold text-neutral-700 mb-3">
                Sleep audio hier of klik om te uploaden
              </h4>
              <p className="text-lg text-neutral-500">
                MP3, WAV, M4A bestanden (max 50MB)
              </p>
              <input
                ref={audioInputRef}
                type="file"
                accept="audio/*"
                onChange={(e) => handleFileSelect(e.target.files[0], 'audio')}
                className="hidden"
              />
            </div>
          ) : (
            <div className="bg-success-50 border border-success-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-success-600 mr-3" />
                  <div>
                    <p className="font-medium text-success-800">{state.files.audio.name}</p>
                    <p className="text-sm text-success-600">
                      {formatFileSize(state.files.audio.size)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile('audio')}
                  className="text-success-600 hover:text-success-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI Model Status */}
      <AIModelStatus step="upload" />

      {/* Continue Button */}
      <div className="text-center space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => setStep('skills')}
            disabled={!canProceed}
            className={`btn-primary ${!canProceed ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Doorgaan naar Vaardigheden
          </button>

          <button
            onClick={() => setIsDebugModalOpen(true)}
            className="btn-secondary flex items-center space-x-2 bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100 hover:border-orange-300"
            title="Open Whisper Debug Panel om de speech-to-text functionaliteit te testen en problemen op te lossen"
          >
            <Settings className="w-5 h-5" />
            <span>Whisper Debug</span>
          </button>
        </div>

        {!canProceed && (
          <p className="text-xl text-neutral-500">
            Upload beide bestanden om door te gaan
          </p>
        )}

        <div className="text-center">
          <p className="text-sm text-neutral-400 max-w-2xl mx-auto">
            💡 <strong>Tip:</strong> Gebruik de "Whisper Debug" knop om de speech-to-text functionaliteit te testen
            en eventuele problemen met de audio transcriptie op te sporen.
          </p>
        </div>
      </div>

      {/* Debug Modal */}
      <Modal
        isOpen={isDebugModalOpen}
        onClose={() => setIsDebugModalOpen(false)}
        title="Whisper Speech-to-Text Debug Panel"
        size="xlarge"
      >
        <WhisperDebugPanel />
      </Modal>
    </div>
  );
};

export default UploadStep;
