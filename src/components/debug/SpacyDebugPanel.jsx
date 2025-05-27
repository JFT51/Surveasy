import React, { useState, useEffect } from 'react';
import {
  Brain,
  CheckCircle,
  XCircle,
  Loader2,
  FileText,
  BarChart3,
  Users,
  Target,
  MessageSquare,
  Lightbulb,
  RefreshCw
} from 'lucide-react';
import { spacyService } from '../../utils/spacyService.js';

const SpacyDebugPanel = () => {
  const [serviceStatus, setServiceStatus] = useState({
    available: false,
    loading: true,
    info: null,
    error: null
  });

  const [analysis, setAnalysis] = useState({
    result: null,
    loading: false,
    error: null
  });

  const [testText, setTestText] = useState(`Tom De Wilde
38 jaar
Software Developer

Werkervaring:
- 5 jaar ervaring met JavaScript, React en Node.js
- Gewerkt bij TechCorp als Senior Developer
- Projectleider voor e-commerce platform ontwikkeling
- Expertise in agile methodologieën en scrum

Opleiding:
- Master Computer Science, Universiteit Gent
- Bachelor Informatica, Hogeschool Antwerpen

Vaardigheden:
- Programmeren: Python, JavaScript, Java, C#
- Frameworks: React, Vue.js, Django, Express
- Databases: MySQL, PostgreSQL, MongoDB
- Cloud: AWS, Azure, Docker, Kubernetes
- Soft skills: teamwork, leiderschap, communicatie, probleemoplossing

Talen:
- Nederlands (moedertaal)
- Engels (vloeiend)
- Frans (gemiddeld)`);

  // Check service status on component mount
  useEffect(() => {
    checkServiceStatus();
  }, []);

  const checkServiceStatus = async () => {
    setServiceStatus(prev => ({ ...prev, loading: true, error: null }));

    try {
      const available = await spacyService.checkAvailability();
      setServiceStatus({
        available,
        loading: false,
        info: spacyService.serviceInfo,
        error: null
      });
    } catch (error) {
      setServiceStatus({
        available: false,
        loading: false,
        info: null,
        error: error.message
      });
    }
  };

  const analyzeText = async () => {
    if (!serviceStatus.available) {
      setAnalysis({
        result: null,
        loading: false,
        error: 'spaCy service is not available'
      });
      return;
    }

    setAnalysis({ result: null, loading: true, error: null });

    try {
      const result = await spacyService.analyzeText(testText);
      setAnalysis({ result, loading: false, error: null });
    } catch (error) {
      console.error('spaCy analysis failed:', error);
      setAnalysis({ result: null, loading: false, error: error.message });
    }
  };

  const extractSkills = async () => {
    if (!serviceStatus.available) {
      setAnalysis({
        result: null,
        loading: false,
        error: 'spaCy service is not available'
      });
      return;
    }

    setAnalysis({ result: null, loading: true, error: null });

    try {
      const skills = await spacyService.extractSkills(testText);
      setAnalysis({
        result: { skills, type: 'skills_only' },
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('spaCy skills extraction failed:', error);
      setAnalysis({ result: null, loading: false, error: error.message });
    }
  };

  const renderServiceStatus = () => (
    <div className="card mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-neutral-900 flex items-center gap-2">
          <Brain className="h-5 w-5" />
          spaCy Dutch NLP Service Status
        </h3>
        <button
          onClick={checkServiceStatus}
          disabled={serviceStatus.loading}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
        >
          {serviceStatus.loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          <span>Refresh Status</span>
        </button>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
          serviceStatus.available
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {serviceStatus.available ? (
            <CheckCircle className="h-3 w-3" />
          ) : (
            <XCircle className="h-3 w-3" />
          )}
          {serviceStatus.available ? 'Available' : 'Unavailable'}
        </div>
      </div>

      {serviceStatus.info && (
        <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-4">
          <h4 className="font-medium text-green-800 mb-2">Service Information</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><strong>Status:</strong> {serviceStatus.info.status}</div>
            <div><strong>Model:</strong> {serviceStatus.info.model}</div>
            <div><strong>Model Loaded:</strong> {serviceStatus.info.model_loaded ? 'Yes' : 'No'}</div>
            {serviceStatus.info.pipeline && (
              <div className="col-span-2"><strong>Pipeline:</strong> {serviceStatus.info.pipeline.join(', ')}</div>
            )}
            {serviceStatus.info.demo_mode && (
              <div className="col-span-2 text-orange-600"><strong>Demo Mode:</strong> Running in demo mode</div>
            )}
          </div>
        </div>
      )}

      {serviceStatus.error && (
        <div className="flex items-center space-x-3 p-4 bg-red-50 rounded-lg border border-red-200">
          <XCircle className="h-4 w-4 text-red-600" />
          <div>
            <p className="font-medium text-red-800">Service Error</p>
            <p className="text-sm text-red-600">{serviceStatus.error}</p>
          </div>
        </div>
      )}
    </div>
  );

  const renderTestInterface = () => (
    <div className="card mb-6">
      <h3 className="text-xl font-semibold text-neutral-900 mb-4 flex items-center gap-2">
        <FileText className="h-5 w-5" />
        Test spaCy Analysis
      </h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Test Text (Dutch CV Content)
          </label>
          <textarea
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            className="w-full h-40 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter Dutch text to analyze..."
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={analyzeText}
            disabled={analysis.loading || !serviceStatus.available}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
          >
            {analysis.loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <BarChart3 className="h-4 w-4" />
            )}
            Full Analysis
          </button>

          <button
            onClick={extractSkills}
            disabled={analysis.loading || !serviceStatus.available}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:bg-gray-100"
          >
            {analysis.loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Target className="h-4 w-4" />
            )}
            Extract Skills Only
          </button>
        </div>
      </div>
    </div>
  );

  const renderAnalysisResults = () => {
    if (analysis.loading) {
      return (
        <div className="card">
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              <span>Analyzing with spaCy...</span>
            </div>
          </div>
        </div>
      );
    }

    if (analysis.error) {
      return (
        <div className="flex items-center space-x-3 p-4 bg-red-50 rounded-lg border border-red-200">
          <XCircle className="h-4 w-4 text-red-600" />
          <div>
            <p className="font-medium text-red-800">Analysis Error</p>
            <p className="text-sm text-red-600">{analysis.error}</p>
          </div>
        </div>
      );
    }

    if (!analysis.result) {
      return null;
    }

    const { result } = analysis;

    if (result.type === 'skills_only') {
      return renderSkillsResults(result.skills);
    }

    return renderFullAnalysisResults(result);
  };

  const renderSkillsResults = (skills) => (
    <div className="card">
      <h3 className="text-xl font-semibold text-neutral-900 mb-4 flex items-center gap-2">
        <Target className="h-5 w-5" />
        Extracted Skills
      </h3>

      <div className="space-y-4">
        {Object.entries(skills).map(([category, skillList]) => (
          <div key={category} className="space-y-2">
            <h4 className="font-medium capitalize">
              {category.replace('_', ' ')} ({skillList.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {skillList.map((skill, index) => (
                <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  {skill.name} ({Math.round(skill.confidence * 100)}%)
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderFullAnalysisResults = (result) => (
    <div className="space-y-4">
      {/* Skills Analysis */}
      <div className="card">
        <h3 className="text-xl font-semibold text-neutral-900 mb-4 flex items-center gap-2">
          <Target className="h-5 w-5" />
          Skills Analysis
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(result.skills).map(([category, skillList]) => (
            <div key={category} className="space-y-2">
              <h4 className="font-medium capitalize">
                {category.replace('_', ' ')} ({skillList.length})
              </h4>
              <div className="space-y-1">
                {skillList.slice(0, 5).map((skill, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{skill.name}</span>
                    <span className="text-gray-500">
                      {Math.round(skill.confidence * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Entities */}
      <div className="card">
        <h3 className="text-xl font-semibold text-neutral-900 mb-4 flex items-center gap-2">
          <Users className="h-5 w-5" />
          Named Entities
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(result.entities).map(([type, entities]) => (
            <div key={type} className="space-y-2">
              <h4 className="font-medium capitalize">{type}</h4>
              <div className="space-y-1">
                {entities.slice(0, 3).map((entity, index) => (
                  <span key={index} className="px-3 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                    {entity.text}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Statistics */}
      <div className="card">
        <h3 className="text-xl font-semibold text-neutral-900 mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Text Statistics
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{result.statistics.word_count}</div>
            <div className="text-sm text-gray-500">Words</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{result.statistics.sentence_count}</div>
            <div className="text-sm text-gray-500">Sentences</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{result.statistics.unique_words}</div>
            <div className="text-sm text-gray-500">Unique Words</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">
              {Math.round(result.statistics.lexical_diversity * 100)}%
            </div>
            <div className="text-sm text-gray-500">Diversity</div>
          </div>
        </div>
      </div>

      {/* Sentiment */}
      <div className="card">
        <h3 className="text-xl font-semibold text-neutral-900 mb-4 flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Sentiment Analysis
        </h3>

        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Overall Sentiment:</span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              result.sentiment.overall === 'positive' ? 'bg-green-100 text-green-800' :
              result.sentiment.overall === 'negative' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {result.sentiment.overall}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Sentiment Score:</span>
            <span>{Math.round(result.sentiment.score * 100)}%</span>
          </div>
        </div>
      </div>

      {/* Processing Info */}
      <div className="card">
        <h3 className="text-xl font-semibold text-neutral-900 mb-4 flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Processing Information
        </h3>

        <div className="space-y-2 text-sm">
          <div><strong>Model:</strong> {result.processing_info.model}</div>
          <div><strong>Language:</strong> {result.processing_info.language}</div>
          <div><strong>Tokens:</strong> {result.processing_info.tokens}</div>
          <div><strong>Sentences:</strong> {result.processing_info.sentences}</div>
          <div><strong>Processed:</strong> {new Date(result.processing_info.timestamp).toLocaleString()}</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Brain className="h-6 w-6" />
        <h2 className="text-2xl font-bold">spaCy Dutch NLP Debug Panel</h2>
      </div>

      {renderServiceStatus()}
      {renderTestInterface()}
      {renderAnalysisResults()}
    </div>
  );
};

export default SpacyDebugPanel;
