import React from 'react';
import { CheckCircle, Clock, Zap, FileText, Mic, Brain, Database } from 'lucide-react';

const AIModelStatus = ({ step, compact = false }) => {
  const modelInfo = {
    upload: {
      title: 'File Processing',
      models: [
        {
          name: 'PDF.js',
          purpose: 'CV text extraction',
          status: 'implemented',
          description: 'Client-side PDF parsing and text extraction with fallback'
        },
        {
          name: 'File Validation',
          purpose: 'File type checking',
          status: 'implemented',
          description: 'Browser-based file validation'
        }
      ]
    },
    skills: {
      title: 'Skills Management',
      models: [
        {
          name: 'NLP Processing',
          purpose: 'Advanced skill extraction',
          status: 'implemented',
          description: 'Compromise.js + Natural.js for Dutch semantic understanding'
        },
        {
          name: 'Skill Categorization',
          purpose: 'Skill classification',
          status: 'implemented',
          description: 'Automated categorization into technical, soft, tools, etc.'
        }
      ]
    },
    processing: {
      title: 'AI Analysis',
      models: [
        {
          name: 'NLP CV Analyzer',
          purpose: 'Comprehensive CV analysis',
          status: 'implemented',
          description: 'Advanced text analysis with experience and education extraction'
        },
        {
          name: 'Communication Analyzer',
          purpose: 'Audio transcript analysis',
          status: 'implemented',
          description: 'Language pattern analysis for communication skills assessment'
        },
        {
          name: 'Whisper API',
          purpose: 'Audio transcription',
          status: 'planned',
          description: 'Speech-to-text conversion for Dutch language'
        }
      ]
    },
    results: {
      title: 'Results Generation',
      models: [
        {
          name: 'Scoring Algorithm',
          purpose: 'Candidate evaluation',
          status: 'implemented',
          description: 'Weighted skill matching and categorization'
        },
        {
          name: 'Report Generation',
          purpose: 'Results formatting',
          status: 'implemented',
          description: 'Structured output and recommendations'
        }
      ]
    }
  };

  const currentModels = modelInfo[step] || modelInfo.upload;

  const getStatusIcon = (status) => {
    switch (status) {
      case 'implemented':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'planned':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'demo':
        return <Zap className="w-4 h-4 text-yellow-600" />;
      default:
        return <Database className="w-4 h-4 text-neutral-400" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'implemented':
        return 'Actief';
      case 'planned':
        return 'Gepland';
      case 'demo':
        return 'Demo';
      default:
        return 'Onbekend';
    }
  };

  if (compact) {
    return (
      <div className="bg-white border border-neutral-200 rounded-lg p-4">
        <h4 className="text-lg font-semibold text-neutral-900 mb-3">AI Models Status</h4>
        <div className="space-y-2">
          {currentModels.models.map((model, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm text-neutral-700">{model.name}</span>
              <div className={`ai-status ${model.status}`}>
                {getStatusIcon(model.status)}
                <span className="ml-1">{getStatusText(model.status)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center mb-6">
        <Brain className="w-6 h-6 text-primary-600 mr-3" />
        <h3 className="text-2xl font-semibold text-neutral-900">AI Models & Implementation</h3>
      </div>

      <div className="mb-6">
        <h4 className="text-xl font-medium text-neutral-800 mb-2">{currentModels.title}</h4>
        <p className="text-neutral-600">
          Overzicht van AI-modellen en hun implementatiestatus voor deze stap.
        </p>
      </div>

      <div className="space-y-4">
        {currentModels.models.map((model, index) => (
          <div key={index} className="border border-neutral-200 rounded-lg p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <h5 className="text-lg font-medium text-neutral-900 mr-3">{model.name}</h5>
                  <div className={`ai-status ${model.status}`}>
                    {getStatusIcon(model.status)}
                    <span className="ml-1">{getStatusText(model.status)}</span>
                  </div>
                </div>
                <p className="text-sm text-neutral-600 mb-1">
                  <strong>Doel:</strong> {model.purpose}
                </p>
                <p className="text-sm text-neutral-600">
                  {model.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-neutral-50 rounded-lg">
        <h5 className="text-lg font-medium text-neutral-900 mb-2">Status Uitleg</h5>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center">
            <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
            <div>
              <span className="font-medium text-green-800">Actief</span>
              <p className="text-neutral-600">Volledig geïmplementeerd en operationeel</p>
            </div>
          </div>
          <div className="flex items-center">
            <Clock className="w-4 h-4 text-blue-600 mr-2" />
            <div>
              <span className="font-medium text-blue-800">Gepland</span>
              <p className="text-neutral-600">Volgende implementatiefase</p>
            </div>
          </div>
          <div className="flex items-center">
            <Zap className="w-4 h-4 text-yellow-600 mr-2" />
            <div>
              <span className="font-medium text-yellow-800">Demo</span>
              <p className="text-neutral-600">Gesimuleerd voor demonstratie</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIModelStatus;
