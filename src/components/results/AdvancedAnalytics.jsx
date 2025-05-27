import React, { useState } from 'react';
import { 
  BarChart3, 
  Brain, 
  FileText, 
  TrendingUp, 
  Eye, 
  Target,
  ChevronDown,
  ChevronUp,
  Hash,
  Tag
} from 'lucide-react';

const AdvancedAnalytics = ({ analysisData }) => {
  const [expandedSections, setExpandedSections] = useState({
    readability: false,
    complexity: false,
    semantics: false,
    structure: false,
    keywords: false,
    topics: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (!analysisData?.advancedAnalytics) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Geavanceerde tekstanalyse niet beschikbaar</p>
      </div>
    );
  }

  const analytics = analysisData.advancedAnalytics;

  const getReadabilityColor = (level) => {
    const colors = {
      'zeer_makkelijk': 'text-green-600 bg-green-100',
      'makkelijk': 'text-green-600 bg-green-100',
      'redelijk_makkelijk': 'text-blue-600 bg-blue-100',
      'standaard': 'text-yellow-600 bg-yellow-100',
      'redelijk_moeilijk': 'text-orange-600 bg-orange-100',
      'moeilijk': 'text-red-600 bg-red-100',
      'zeer_moeilijk': 'text-red-600 bg-red-100'
    };
    return colors[level] || 'text-gray-600 bg-gray-100';
  };

  const getComplexityColor = (score) => {
    if (score >= 80) return 'text-red-600 bg-red-100';
    if (score >= 60) return 'text-orange-600 bg-orange-100';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100';
    if (score >= 20) return 'text-blue-600 bg-blue-100';
    return 'text-green-600 bg-green-100';
  };

  const getSentimentColor = (score) => {
    if (score >= 70) return 'text-green-600 bg-green-100';
    if (score >= 30) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const AnalyticsCard = ({ title, icon: Icon, children, sectionKey, summary }) => (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div 
        className="p-4 bg-gray-50 cursor-pointer flex items-center justify-between hover:bg-gray-100 transition-colors"
        onClick={() => toggleSection(sectionKey)}
      >
        <div className="flex items-center">
          <Icon className="w-5 h-5 text-blue-600 mr-3" />
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <div className="flex items-center">
          {summary && <span className="text-sm text-gray-600 mr-3">{summary}</span>}
          {expandedSections[sectionKey] ? 
            <ChevronUp className="w-5 h-5 text-gray-500" /> : 
            <ChevronDown className="w-5 h-5 text-gray-500" />
          }
        </div>
      </div>
      {expandedSections[sectionKey] && (
        <div className="p-4">
          {children}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <Brain className="w-8 h-8 text-blue-600 mr-3" />
          <h2 className="text-2xl font-bold text-gray-900">Geavanceerde Tekstanalyse</h2>
        </div>
        <p className="text-gray-700">
          Diepgaande analyse van tekstkwaliteit, complexiteit en semantische inhoud
        </p>
      </div>

      {/* Readability Analysis */}
      <AnalyticsCard 
        title="Leesbaarheidsanalyse" 
        icon={Eye}
        sectionKey="readability"
        summary={`${Math.round(analytics.readability.fleschScore)} punten - ${analytics.readability.readabilityLevel.replace('_', ' ')}`}
      >
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Flesch Score</span>
                <span className="text-lg font-bold text-blue-600">
                  {Math.round(analytics.readability.fleschScore)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${analytics.readability.fleschScore}%` }}
                ></div>
              </div>
            </div>
            <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getReadabilityColor(analytics.readability.readabilityLevel)}`}>
              {analytics.readability.readabilityLevel.replace('_', ' ')}
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Gemiddelde zinslengte:</span>
              <span className="font-medium">{Math.round(analytics.readability.avgSentenceLength)} woorden</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Lettergrepen per woord:</span>
              <span className="font-medium">{analytics.readability.avgSyllablesPerWord.toFixed(1)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Totaal zinnen:</span>
              <span className="font-medium">{analytics.readability.totalSentences}</span>
            </div>
          </div>
        </div>
      </AnalyticsCard>

      {/* Complexity Analysis */}
      <AnalyticsCard 
        title="Complexiteitsanalyse" 
        icon={BarChart3}
        sectionKey="complexity"
        summary={`${analytics.complexity.complexityScore}/100 - ${analytics.complexity.complexityScore >= 60 ? 'Complex' : 'Eenvoudig'}`}
      >
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Complexiteitsscore</span>
                <span className="text-lg font-bold text-orange-600">
                  {analytics.complexity.complexityScore}/100
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-orange-600 h-2 rounded-full" 
                  style={{ width: `${analytics.complexity.complexityScore}%` }}
                ></div>
              </div>
            </div>
            <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getComplexityColor(analytics.complexity.complexityScore)}`}>
              {analytics.complexity.complexityScore >= 60 ? 'Complex' : 'Eenvoudig'}
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Lexicale diversiteit:</span>
              <span className="font-medium">{(analytics.complexity.lexicalDiversity * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Complexe woorden:</span>
              <span className="font-medium">{(analytics.complexity.complexWordRatio * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Gemiddelde woordlengte:</span>
              <span className="font-medium">{analytics.complexity.avgWordLength.toFixed(1)} karakters</span>
            </div>
          </div>
        </div>
      </AnalyticsCard>

      {/* Semantic Analysis */}
      <AnalyticsCard 
        title="Semantische Analyse" 
        icon={Target}
        sectionKey="semantics"
        summary={`${analytics.semantics.primaryDomain} - ${analytics.semantics.sentimentScore}% positief`}
      >
        <div className="space-y-6">
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Professionele Domeinen</h4>
            <div className="grid md:grid-cols-2 gap-4">
              {Object.entries(analytics.semantics.domainScores).map(([domain, score]) => (
                <div key={domain} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700 capitalize">{domain.replace('_', ' ')}</span>
                  <div className="flex items-center">
                    <div className="w-20 bg-gray-200 rounded-full h-2 mr-3">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${score}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{score}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Sentiment & Toon</h4>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getSentimentColor(analytics.semantics.sentimentScore)}`}>
                  {analytics.semantics.sentimentScore >= 70 ? 'Positief' : 
                   analytics.semantics.sentimentScore >= 30 ? 'Neutraal' : 'Negatief'}
                </div>
                <p className="text-2xl font-bold text-gray-900 mt-2">{analytics.semantics.sentimentScore}%</p>
                <p className="text-sm text-gray-600">Sentiment Score</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{analytics.semantics.positiveIndicators}</p>
                <p className="text-sm text-gray-600">Positieve Indicatoren</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-lg font-semibold text-gray-900 capitalize">
                  {analytics.semantics.professionalTone}
                </p>
                <p className="text-sm text-gray-600">Professionele Toon</p>
              </div>
            </div>
          </div>
        </div>
      </AnalyticsCard>

      {/* Keywords */}
      <AnalyticsCard 
        title="Sleutelwoorden" 
        icon={Hash}
        sectionKey="keywords"
        summary={`${analytics.keywords.length} belangrijke termen`}
      >
        <div className="flex flex-wrap gap-2">
          {analytics.keywords.map((keyword, index) => (
            <div key={index} className="flex items-center bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
              <span className="font-medium">{keyword.word}</span>
              <span className="ml-2 text-xs bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full">
                {keyword.frequency}x
              </span>
            </div>
          ))}
        </div>
      </AnalyticsCard>

      {/* Topics */}
      <AnalyticsCard 
        title="Onderwerpen" 
        icon={Tag}
        sectionKey="topics"
        summary={`${analytics.topics.length} gedetecteerde onderwerpen`}
      >
        <div className="space-y-3">
          {analytics.topics.map((topic, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <span className="font-medium text-gray-900">{topic.topic}</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {topic.matchedKeywords.map((keyword, kidx) => (
                    <span key={kidx} className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-16 bg-gray-200 rounded-full h-2 mr-3">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${topic.relevance}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{topic.relevance}%</span>
              </div>
            </div>
          ))}
        </div>
      </AnalyticsCard>
    </div>
  );
};

export default AdvancedAnalytics;
