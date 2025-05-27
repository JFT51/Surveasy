import React from 'react';
import { CheckCircle, Clock, Zap, AlertTriangle, Database, Brain, FileText, Mic } from 'lucide-react';

const AIToolsStatus = ({ analysisData }) => {
  const aiTools = {
    implemented: [
      {
        name: 'PDF.js Text Extraction',
        category: 'File Processing',
        status: 'active',
        description: 'Real PDF text extraction with multi-page support',
        dataSource: 'real',
        confidence: analysisData?.metadata?.confidence || 0.9,
        icon: FileText
      },
      {
        name: 'NLP Skill Extraction',
        category: 'Skills Analysis',
        status: 'active',
        description: 'Compromise.js for semantic skill understanding',
        dataSource: 'real',
        confidence: analysisData?.nlpAnalysis?.confidence || 0.85,
        icon: Brain
      },
      {
        name: 'CV Structure Parser',
        category: 'Content Analysis',
        status: 'active',
        description: 'Experience, education, and personal info extraction',
        dataSource: 'real',
        confidence: 0.8,
        icon: Database
      },
      {
        name: 'Skill Categorization',
        category: 'Classification',
        status: 'active',
        description: 'Automatic classification into technical/soft/tools',
        dataSource: 'real',
        confidence: 0.85,
        icon: Brain
      },
      {
        name: 'Experience Level Detection',
        category: 'Assessment',
        status: 'active',
        description: 'Beginner/intermediate/expert level determination',
        dataSource: 'real',
        confidence: 0.75,
        icon: CheckCircle
      },
      {
        name: 'Whisper Speech-to-Text',
        category: 'Audio Processing',
        status: 'active',
        description: 'Real-time Dutch speech-to-text with OpenAI Whisper',
        dataSource: 'real',
        confidence: analysisData?.metadata?.isRealTranscription ? 0.9 : 0.0,
        icon: Mic
      }
    ],
    planned: [
      {
        name: 'spaCy Dutch NLP',
        category: 'Advanced NLP',
        status: 'planned',
        description: 'Named entity recognition and advanced language processing',
        expectedImplementation: 'Q2 2024',
        icon: Brain
      },
      {
        name: 'Computer Vision OCR',
        category: 'Document Processing',
        status: 'planned',
        description: 'Scanned document and image text extraction',
        expectedImplementation: 'Q3 2024',
        icon: FileText
      },
      {
        name: 'Sentiment Analysis',
        category: 'Communication Analysis',
        status: 'planned',
        description: 'Emotional tone and communication style analysis',
        expectedImplementation: 'Q3 2024',
        icon: Brain
      }
    ],
    mockData: [
      {
        name: 'Audio Transcript Analysis',
        category: 'Communication Skills',
        status: 'mock',
        description: 'Currently using simulated audio analysis',
        realImplementation: 'Whisper API integration planned',
        icon: Mic,
        mockReason: 'Audio transcription API not yet integrated'
      },
      {
        name: 'Advanced Personality Assessment',
        category: 'Psychological Analysis',
        status: 'mock',
        description: 'Personality traits and cultural fit assessment',
        realImplementation: 'ML model training in progress',
        icon: Brain,
        mockReason: 'Requires large dataset for training'
      }
    ]
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'planned':
        return <Clock className="w-5 h-5 text-blue-600" />;
      case 'mock':
        return <Zap className="w-5 h-5 text-yellow-600" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: 'bg-green-100 text-green-800 border-green-200',
      planned: 'bg-blue-100 text-blue-800 border-blue-200',
      mock: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };

    const labels = {
      active: 'Actief',
      planned: 'Gepland',
      mock: 'Demo Data'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${badges[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const getConfidenceBar = (confidence) => {
    const percentage = Math.round(confidence * 100);
    const colorClass = percentage >= 80 ? 'bg-green-500' : percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500';

    return (
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${colorClass}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    );
  };

  return (
    <div className="card">
      <div className="flex items-center mb-8">
        <Brain className="w-8 h-8 text-primary-600 mr-4" />
        <h3 className="text-3xl font-bold text-neutral-900">AI Tools & Implementation Status</h3>
      </div>

      {/* Implemented Tools */}
      <div className="mb-10">
        <h4 className="text-2xl font-semibold text-green-700 mb-6 flex items-center">
          <CheckCircle className="w-6 h-6 mr-3" />
          Geïmplementeerde AI Tools ({aiTools.implemented.length})
        </h4>
        <div className="grid gap-4">
          {aiTools.implemented.map((tool, index) => {
            const Icon = tool.icon;
            return (
              <div key={index} className="border border-green-200 rounded-lg p-6 bg-green-50">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <Icon className="w-6 h-6 text-green-600 mr-3" />
                    <div>
                      <h5 className="text-xl font-semibold text-neutral-900">{tool.name}</h5>
                      <p className="text-sm text-green-700 font-medium">{tool.category}</p>
                    </div>
                  </div>
                  {getStatusBadge(tool.status)}
                </div>
                <p className="text-neutral-700 mb-4">{tool.description}</p>
                {tool.confidence && (
                  <div className="mb-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-neutral-600">Betrouwbaarheid</span>
                      <span className="font-medium">{Math.round(tool.confidence * 100)}%</span>
                    </div>
                    {getConfidenceBar(tool.confidence)}
                  </div>
                )}
                <div className="flex items-center text-sm">
                  <Database className="w-4 h-4 text-green-600 mr-2" />
                  <span className="text-green-700 font-medium">Echte data verwerking</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Planned Tools */}
      <div className="mb-10">
        <h4 className="text-2xl font-semibold text-blue-700 mb-6 flex items-center">
          <Clock className="w-6 h-6 mr-3" />
          Geplande AI Tools ({aiTools.planned.length})
        </h4>
        <div className="grid gap-4">
          {aiTools.planned.map((tool, index) => {
            const Icon = tool.icon;
            return (
              <div key={index} className="border border-blue-200 rounded-lg p-6 bg-blue-50">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <Icon className="w-6 h-6 text-blue-600 mr-3" />
                    <div>
                      <h5 className="text-xl font-semibold text-neutral-900">{tool.name}</h5>
                      <p className="text-sm text-blue-700 font-medium">{tool.category}</p>
                    </div>
                  </div>
                  {getStatusBadge(tool.status)}
                </div>
                <p className="text-neutral-700 mb-4">{tool.description}</p>
                <div className="flex items-center text-sm">
                  <Clock className="w-4 h-4 text-blue-600 mr-2" />
                  <span className="text-blue-700 font-medium">
                    Verwachte implementatie: {tool.expectedImplementation}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mock Data Tools */}
      <div>
        <h4 className="text-2xl font-semibold text-yellow-700 mb-6 flex items-center">
          <Zap className="w-6 h-6 mr-3" />
          Demo Data Tools ({aiTools.mockData.length})
        </h4>
        <div className="grid gap-4">
          {aiTools.mockData.map((tool, index) => {
            const Icon = tool.icon;
            return (
              <div key={index} className="border border-yellow-200 rounded-lg p-6 bg-yellow-50">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <Icon className="w-6 h-6 text-yellow-600 mr-3" />
                    <div>
                      <h5 className="text-xl font-semibold text-neutral-900">{tool.name}</h5>
                      <p className="text-sm text-yellow-700 font-medium">{tool.category}</p>
                    </div>
                  </div>
                  {getStatusBadge(tool.status)}
                </div>
                <p className="text-neutral-700 mb-4">{tool.description}</p>
                <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3 mb-3">
                  <p className="text-sm text-yellow-800">
                    <strong>Demo Reden:</strong> {tool.mockReason}
                  </p>
                </div>
                <div className="flex items-center text-sm">
                  <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2" />
                  <span className="text-yellow-700 font-medium">
                    Echte implementatie: {tool.realImplementation}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-10 p-6 bg-neutral-100 rounded-lg">
        <h5 className="text-xl font-semibold text-neutral-900 mb-4">Implementatie Overzicht</h5>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {aiTools.implemented.length}
            </div>
            <p className="text-neutral-700">Actieve AI Tools</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {aiTools.planned.length}
            </div>
            <p className="text-neutral-700">Geplande Tools</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600 mb-2">
              {aiTools.mockData.length}
            </div>
            <p className="text-neutral-700">Demo Data Tools</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIToolsStatus;
