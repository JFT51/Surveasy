import React, { useState, useEffect } from 'react';
import { Info, X, Globe, Code, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';

const DemoNotice = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const { state } = useApp();

  // Only show in production/demo mode
  const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true' ||
                     import.meta.env.VITE_WHISPER_SERVICE_URL === '';

  // Auto-close after step 1 (upload)
  useEffect(() => {
    if (state.currentStep !== 'upload' && isVisible) {
      handleClose();
    }
  }, [state.currentStep, isVisible]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
    }, 300); // Match CSS transition duration
  };

  if (!isDemoMode || !isVisible) {
    return null;
  }

  return (
    <div className={`bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-6 relative transition-all duration-300 ease-in-out ${
      isExiting ? 'transform -translate-y-full opacity-0 max-h-0 mb-0 py-0' : 'transform translate-y-0 opacity-100'
    }`}>
      <button
        onClick={handleClose}
        className="absolute top-2 right-2 p-1 text-blue-400 hover:text-blue-600 transition-colors"
        title="Sluiten"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <Info className="w-4 h-4 text-blue-600" />
          </div>
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            🎯 Surveasy Demo Versie
          </h3>

          <p className="text-blue-800 mb-3">
            Dit is een demo versie van hoe ik het concept zie. Alles werkt momenteel met demo data.
            Bedoeling is dat uwe klant (of gij) eerst deze workflow valideert.
          </p>

          <div className="grid md:grid-cols-3 gap-4 mb-3">
            <div className="flex items-center space-x-2 text-sm text-blue-700">
              <Code className="w-4 h-4 text-blue-500" />
              <span><strong>CV Analyse:</strong> Echte PDF verwerking</span>
            </div>

            <div className="flex items-center space-x-2 text-sm text-blue-700">
              <Zap className="w-4 h-4 text-blue-500" />
              <span><strong>Audio:</strong> Momenteel demo transcriptie</span>
            </div>

            <div className="flex items-center space-x-2 text-sm text-blue-700">
              <Globe className="w-4 h-4 text-blue-500" />
              <span><strong>Hosting:</strong> Netlify deployment</span>
            </div>
          </div>

          <div className="bg-blue-100 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>💡 Nota:</strong> In de volledige implementatie ga ik Whisper AI gebruiken
              voor de speech-to-text transcriptie van interview audio.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoNotice;
