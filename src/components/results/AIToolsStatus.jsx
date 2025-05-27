import React from 'react';
import { CheckCircle, Clock, Zap, AlertTriangle, Database, Brain, FileText, Mic, MessageSquare, Users, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';

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
        description: analysisData?.metadata?.spacyEnhanced ? 'spaCy Dutch NLP + Compromise.js hybrid analysis' : 'Compromise.js for semantic skill understanding',
        dataSource: 'real',
        confidence: analysisData?.nlpAnalysis?.confidence || 0.85,
        icon: Brain
      },
      {
        name: 'spaCy Dutch NLP',
        category: 'Advanced NLP',
        status: 'active',
        description: 'Named entity recognition, sentiment analysis, and advanced Dutch language processing',
        dataSource: 'real',
        confidence: analysisData?.metadata?.spacyEnhanced ? (analysisData?.metadata?.confidence || 0.9) : 0.0,
        icon: Brain,
        isSpacyEnhanced: analysisData?.metadata?.spacyEnhanced || false
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
      },
      {
        name: 'Audio Transcript Analysis',
        category: 'Communication Skills',
        status: 'active',
        description: 'Communication quality, personality traits, and leadership skills analysis',
        dataSource: 'real',
        confidence: analysisData?.communicationAnalysis?.analysisMetadata?.enhancedAnalysis ? 0.85 : 0.0,
        icon: MessageSquare
      },
      {
        name: 'Sentiment Analysis',
        category: 'Text Analysis',
        status: 'active',
        description: analysisData?.metadata?.spacyEnhanced ? 'spaCy-powered sentiment analysis for Dutch text' : 'Basic sentiment analysis',
        dataSource: 'real',
        confidence: analysisData?.metadata?.spacyEnhanced ? 0.8 : 0.6,
        icon: Brain
      },
      {
        name: 'Experience Level Detection',
        category: 'Skills Analysis',
        status: 'active',
        description: 'Automatic detection of beginner/intermediate/expert skill levels',
        dataSource: 'real',
        confidence: 0.75,
        icon: TrendingUp
      },
      {
        name: 'Named Entity Recognition',
        category: 'Information Extraction',
        status: 'active',
        description: analysisData?.metadata?.spacyEnhanced ? 'spaCy-powered extraction of persons, organizations, locations' : 'Basic entity extraction',
        dataSource: 'real',
        confidence: analysisData?.metadata?.spacyEnhanced ? 0.9 : 0.6,
        icon: Users
      },
      {
        name: 'CV Structure Parser',
        category: 'Document Processing',
        status: 'active',
        description: 'Intelligent parsing of CV sections: experience, education, skills, contact info',
        dataSource: 'real',
        confidence: 0.8,
        icon: FileText
      },
      {
        name: 'Computer Vision OCR',
        category: 'Document Processing',
        status: 'active',
        description: 'Tesseract.js OCR for scanned documents and image text extraction',
        dataSource: 'real',
        confidence: 0.75,
        icon: FileText
      },
      {
        name: 'Advanced Text Analytics',
        category: 'Text Analysis',
        status: 'active',
        description: 'Readability analysis, complexity scoring, semantic analysis, and keyword extraction',
        dataSource: 'real',
        confidence: 0.85,
        icon: Brain
      },
      {
        name: 'Enhanced Skill Confidence',
        category: 'Skills Analysis',
        status: 'active',
        description: 'Advanced confidence scoring based on context, evidence, and experience level',
        dataSource: 'real',
        confidence: 0.8,
        icon: TrendingUp
      }
    ],
    planned: [
      {
        name: 'Advanced ML Models',
        category: 'Enhanced AI',
        status: 'planned',
        description: 'Custom trained models for Dutch CV analysis and candidate scoring',
        expectedImplementation: 'Q4 2024',
        icon: Brain
      },
      {
        name: 'Real-time Video Analysis',
        category: 'Video Processing',
        status: 'planned',
        description: 'Video interview analysis with facial expression and gesture recognition',
        expectedImplementation: 'Q1 2025',
        icon: Mic
      },
      {
        name: 'Predictive Analytics',
        category: 'AI Insights',
        status: 'planned',
        description: 'Job performance prediction and cultural fit analysis using ML',
        expectedImplementation: 'Q2 2025',
        icon: TrendingUp
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
                      <h5 className="text-xl font-semibold text-neutral-900">
                        {tool.name}
                        {tool.isSpacyEnhanced && (
                          <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            Enhanced
                          </span>
                        )}
                      </h5>
                      <p className="text-sm text-green-700 font-medium">{tool.category}</p>
                    </div>
                  </div>
                  {getStatusBadge(tool.status)}
                </div>
                <p className="text-neutral-700 mb-4">{tool.description}</p>
                {tool.confidence !== undefined && (
                  <div className="mb-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-neutral-600">Betrouwbaarheid</span>
                      <span className="font-medium">
                        {tool.confidence === 0 ? 'Service niet beschikbaar' : `${Math.round(tool.confidence * 100)}%`}
                      </span>
                    </div>
                    {tool.confidence === 0 ? (
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="h-2 rounded-full bg-gray-400" style={{ width: '100%' }}></div>
                      </div>
                    ) : (
                      getConfidenceBar(tool.confidence)
                    )}
                    {tool.confidence === 0 && tool.name === 'spaCy Dutch NLP' && (
                      <p className="text-xs text-gray-600 mt-1">
                        Start de spaCy service op poort 5001 voor geavanceerde NLP analyse
                      </p>
                    )}
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
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {Math.round((aiTools.implemented.length / (aiTools.implemented.length + aiTools.planned.length)) * 100)}%
            </div>
            <p className="text-neutral-700">Implementatie Voortgang</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIToolsStatus;
