import React, { useState } from 'react';
import { 
  Mic, 
  MessageCircle, 
  Brain, 
  Users, 
  Target, 
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Star,
  Award,
  Lightbulb
} from 'lucide-react';

const AudioAnalysisResults = ({ communicationAnalysis, audioMetadata }) => {
  const [expandedSections, setExpandedSections] = useState({
    communication: true,
    personality: false,
    leadership: false,
    insights: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (!communicationAnalysis) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <Mic className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600">Geen audio analyse beschikbaar</p>
      </div>
    );
  }

  const {
    clarity,
    confidence,
    technicalCommunication,
    fluency,
    overallCommunicationScore,
    personalityTraits,
    leadershipSkills,
    communicationInsights,
    keyPoints,
    languageProficiency,
    isRealTranscription,
    transcriptionMethod
  } = communicationAnalysis;

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreIcon = (score) => {
    if (score >= 80) return '🟢';
    if (score >= 60) return '🟡';
    return '🔴';
  };

  const getProficiencyColor = (proficiency) => {
    switch (proficiency) {
      case 'native': return 'text-green-600 bg-green-100';
      case 'fluent': return 'text-blue-600 bg-blue-100';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Overall Score */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-full">
              <Mic className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Audio Transcript Analyse</h3>
              <p className="text-sm text-gray-600">
                {isRealTranscription ? 'Whisper AI Transcriptie' : 'Demo Transcriptie'} • 
                Methode: {transcriptionMethod}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-semibold ${getScoreColor(overallCommunicationScore)}`}>
              {getScoreIcon(overallCommunicationScore)} {overallCommunicationScore}%
            </div>
            <p className="text-sm text-gray-600 mt-1">Totaal Communicatie Score</p>
          </div>
        </div>
      </div>

      {/* Communication Skills */}
      <div className="bg-white rounded-lg border border-gray-200">
        <button
          onClick={() => toggleSection('communication')}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <MessageCircle className="w-5 h-5 text-blue-600" />
            <h4 className="text-lg font-semibold text-gray-900">Communicatievaardigheden</h4>
          </div>
          {expandedSections.communication ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
        
        {expandedSections.communication && (
          <div className="px-6 pb-6 border-t border-gray-100">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="text-center">
                <div className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium ${getScoreColor(clarity)}`}>
                  {clarity}%
                </div>
                <p className="text-sm text-gray-600 mt-1">Helderheid</p>
              </div>
              <div className="text-center">
                <div className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium ${getScoreColor(confidence)}`}>
                  {confidence}%
                </div>
                <p className="text-sm text-gray-600 mt-1">Zelfvertrouwen</p>
              </div>
              <div className="text-center">
                <div className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium ${getScoreColor(fluency)}`}>
                  {fluency}%
                </div>
                <p className="text-sm text-gray-600 mt-1">Vloeiendheid</p>
              </div>
              <div className="text-center">
                <div className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium ${getScoreColor(technicalCommunication)}`}>
                  {technicalCommunication}%
                </div>
                <p className="text-sm text-gray-600 mt-1">Technische Communicatie</p>
              </div>
            </div>
            
            <div className="mt-4 flex items-center space-x-4">
              <span className="text-sm text-gray-600">Taalniveau:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getProficiencyColor(languageProficiency)}`}>
                {languageProficiency === 'native' ? 'Moedertaal' :
                 languageProficiency === 'fluent' ? 'Vloeiend' :
                 languageProficiency === 'intermediate' ? 'Gemiddeld' : 'Basis'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Personality Traits */}
      {personalityTraits && personalityTraits.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200">
          <button
            onClick={() => toggleSection('personality')}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Brain className="w-5 h-5 text-purple-600" />
              <h4 className="text-lg font-semibold text-gray-900">Persoonlijkheidskenmerken</h4>
            </div>
            {expandedSections.personality ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          
          {expandedSections.personality && (
            <div className="px-6 pb-6 border-t border-gray-100">
              <div className="space-y-3 mt-4">
                {personalityTraits.map((trait, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Star className="w-4 h-4 text-purple-600" />
                      <span className="font-medium text-gray-900 capitalize">
                        {trait.trait.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`px-2 py-1 rounded text-sm font-medium ${getScoreColor(trait.score)}`}>
                        {trait.score}%
                      </div>
                      <div className="text-xs text-gray-500">
                        {trait.indicators?.slice(0, 2).join(', ')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Leadership & Soft Skills */}
      {(leadershipSkills?.leadershipScore > 0 || leadershipSkills?.problemSolvingScore > 0) && (
        <div className="bg-white rounded-lg border border-gray-200">
          <button
            onClick={() => toggleSection('leadership')}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Users className="w-5 h-5 text-green-600" />
              <h4 className="text-lg font-semibold text-gray-900">Leiderschap & Soft Skills</h4>
            </div>
            {expandedSections.leadership ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          
          {expandedSections.leadership && (
            <div className="px-6 pb-6 border-t border-gray-100">
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Award className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <div className={`text-2xl font-bold ${getScoreColor(leadershipSkills.leadershipScore)}`}>
                    {leadershipSkills.leadershipScore}%
                  </div>
                  <p className="text-sm text-gray-600">Leiderschapsvaardigheden</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className={`text-2xl font-bold ${getScoreColor(leadershipSkills.problemSolvingScore)}`}>
                    {leadershipSkills.problemSolvingScore}%
                  </div>
                  <p className="text-sm text-gray-600">Probleemoplossend Vermogen</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Key Insights */}
      {communicationInsights && communicationInsights.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200">
          <button
            onClick={() => toggleSection('insights')}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Lightbulb className="w-5 h-5 text-yellow-600" />
              <h4 className="text-lg font-semibold text-gray-900">Belangrijkste Inzichten</h4>
            </div>
            {expandedSections.insights ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          
          {expandedSections.insights && (
            <div className="px-6 pb-6 border-t border-gray-100">
              <div className="space-y-2 mt-4">
                {communicationInsights.map((insight, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                    <TrendingUp className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-700">{insight}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Key Communication Points */}
      {keyPoints && keyPoints.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <MessageCircle className="w-5 h-5 text-blue-600 mr-2" />
            Belangrijkste Uitspraken
          </h4>
          <div className="space-y-3">
            {keyPoints.map((point, index) => (
              <div key={index} className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                <p className="text-sm text-gray-700 italic">"{point}"</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioAnalysisResults;
