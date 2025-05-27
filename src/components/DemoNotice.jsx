import React, { useState } from 'react';
import { Info, X, Globe, Code, Zap } from 'lucide-react';

const DemoNotice = () => {
  const [isVisible, setIsVisible] = useState(true);
  
  // Only show in production/demo mode
  const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true' || 
                     import.meta.env.VITE_WHISPER_SERVICE_URL === '';

  if (!isDemoMode || !isVisible) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-6 relative">
      <button
        onClick={() => setIsVisible(false)}
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
            Dit is een demo versie van hoe ik het concept zie. Alles werkt met realistische demo data. 
            Bedoeling is dat uwe klant (of gij) eerst deze workflow valideert.
          </p>
          
          <div className="grid md:grid-cols-3 gap-4 mb-3">
            <div className="flex items-center space-x-2 text-sm text-blue-700">
              <Code className="w-4 h-4 text-blue-500" />
              <span><strong>CV Analyse:</strong> Echte PDF verwerking</span>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-blue-700">
              <Zap className="w-4 h-4 text-blue-500" />
              <span><strong>Audio:</strong> Demo transcriptie</span>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-blue-700">
              <Globe className="w-4 h-4 text-blue-500" />
              <span><strong>Hosting:</strong> Netlify deployment</span>
            </div>
          </div>
          
          <div className="bg-blue-100 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>💡 Productie versie:</strong> In de volledige implementatie wordt Whisper AI gebruikt 
              voor echte speech-to-text transcriptie van interview audio.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoNotice;
