import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  User, Star, Target, AlertTriangle, CheckCircle, X,
  TrendingUp, TrendingDown, FileText, Mic, Download,
  BarChart3, PieChart, Award, Brain, Eye, Settings
} from 'lucide-react';
import AIModelStatus from '../AIModelStatus';
import AIToolsStatus from '../results/AIToolsStatus';
import AnalysisCharts from '../results/AnalysisCharts';
import DetailedSkills from '../results/DetailedSkills';
import FullTextDisplay from '../results/FullTextDisplay';
import WhisperDebugPanel from '../debug/WhisperDebugPanel';
import AudioAnalysisResults from '../results/AudioAnalysisResults';

const ResultsStep = () => {
  const { state, resetApp } = useApp();
  const [activeTab, setActiveTab] = useState('overview');

  const { analysis } = state;

  if (!analysis.candidateCategory) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Geen analyseresultaten beschikbaar</h3>
        <p className="text-gray-600 mb-4">Er is een probleem opgetreden tijdens de analyse.</p>
        <button onClick={resetApp} className="btn-primary">
          Nieuwe Analyse Starten
        </button>
      </div>
    );
  }

  const getCategoryIcon = (type) => {
    switch (type) {
      case 'high_match': return <CheckCircle className="w-8 h-8 text-green-600" />;
      case 'good_communication': return <Star className="w-8 h-8 text-yellow-600" />;
      case 'potential': return <Target className="w-8 h-8 text-orange-600" />;
      case 'underqualified': return <X className="w-8 h-8 text-red-600" />;
      default: return <User className="w-8 h-8 text-gray-600" />;
    }
  };

  const getCategoryBgColor = (type) => {
    switch (type) {
      case 'high_match': return 'bg-green-50 border-green-200';
      case 'good_communication': return 'bg-yellow-50 border-yellow-200';
      case 'potential': return 'bg-orange-50 border-orange-200';
      case 'underqualified': return 'bg-red-50 border-red-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const tabs = [
    { id: 'overview', label: 'Overzicht', icon: BarChart3 },
    { id: 'audio-analysis', label: 'Audio Analyse', icon: Mic },
    { id: 'charts', label: 'Grafieken', icon: PieChart },
    { id: 'skills', label: 'Vaardigheden Detail', icon: Award },
    { id: 'ai-tools', label: 'AI Tools Status', icon: Brain },
    { id: 'full-text', label: 'Volledige Tekst', icon: Eye },
    { id: 'whisper-debug', label: 'Whisper Debug', icon: Settings },
    { id: 'details', label: 'Basis Details', icon: FileText }
  ];

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-5xl font-bold text-neutral-900 mb-6">
          Kandidaat Analyse Resultaten
        </h2>
        <p className="text-xl text-neutral-600">
          Uitgebreide beoordeling gebaseerd op CV en interview analyse
        </p>
      </div>

      {/* Candidate Category Card */}
      <div className={`card mb-8 ${getCategoryBgColor(analysis.candidateCategory.type)}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {getCategoryIcon(analysis.candidateCategory.type)}
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                {analysis.candidateCategory.label}
              </h3>
              <p className="text-gray-700 mt-1">
                {analysis.candidateCategory.description}
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900 mb-1">
              <span className={getScoreColor(analysis.overallScore)}>
                {analysis.overallScore}%
              </span>
            </div>
            <p className="text-sm text-gray-600">Overall Score</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Quick Stats */}
          <div className="grid md:grid-cols-4 gap-6">
            <div className="card text-center">
              <div className="text-2xl font-bold text-primary-600 mb-1">
                {analysis.skillMatches.filter(m => m.found).length}
              </div>
              <p className="text-sm text-gray-600">Gevonden Vaardigheden</p>
            </div>

            <div className="card text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {analysis.strengths.length}
              </div>
              <p className="text-sm text-gray-600">Sterke Punten</p>
            </div>

            <div className="card text-center">
              <div className="text-2xl font-bold text-orange-600 mb-1">
                {analysis.weaknesses.length}
              </div>
              <p className="text-sm text-gray-600">Verbeterpunten</p>
            </div>

            <div className="card text-center">
              <div className={`text-2xl font-bold mb-1 ${getScoreColor(analysis.overallScore)}`}>
                {analysis.overallScore}%
              </div>
              <p className="text-sm text-gray-600">Match Score</p>
            </div>
          </div>

          {/* Strengths and Weaknesses */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="card">
              <div className="flex items-center mb-4">
                <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Sterke Punten</h3>
              </div>

              {analysis.strengths.length > 0 ? (
                <ul className="space-y-2">
                  {analysis.strengths.map((strength, index) => (
                    <li key={index} className="flex items-center text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                      {strength}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 italic">Geen specifieke sterke punten geïdentificeerd</p>
              )}
            </div>

            <div className="card">
              <div className="flex items-center mb-4">
                <TrendingDown className="w-5 h-5 text-orange-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Verbeterpunten</h3>
              </div>

              {analysis.weaknesses.length > 0 ? (
                <ul className="space-y-2">
                  {analysis.weaknesses.map((weakness, index) => (
                    <li key={index} className="flex items-center text-gray-700">
                      <AlertTriangle className="w-4 h-4 text-orange-500 mr-2 flex-shrink-0" />
                      {weakness}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 italic">Geen significante verbeterpunten geïdentificeerd</p>
              )}
            </div>
          </div>

          {/* Recommendation */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Aanbeveling</h3>
            <p className="text-gray-700 leading-relaxed">
              {analysis.recommendation}
            </p>
          </div>
        </div>
      )}

      {activeTab === 'audio-analysis' && (
        <AudioAnalysisResults
          communicationAnalysis={analysis.communicationAnalysis}
          audioMetadata={state.extractedData.audioResult?.metadata}
        />
      )}

      {activeTab === 'charts' && (
        <AnalysisCharts analysisData={analysis} />
      )}

      {activeTab === 'skills' && (
        <DetailedSkills analysisData={analysis} />
      )}

      {activeTab === 'ai-tools' && (
        <AIToolsStatus analysisData={analysis} />
      )}

      {activeTab === 'full-text' && (
        <FullTextDisplay
          cvText={state.extractedData.cvText}
          audioTranscript={state.extractedData.audioTranscript}
          audioResult={state.extractedData.audioResult}
          analysisData={analysis}
        />
      )}

      {activeTab === 'whisper-debug' && (
        <WhisperDebugPanel />
      )}

      {activeTab === 'details' && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="card">
              <div className="flex items-center mb-4">
                <FileText className="w-5 h-5 text-blue-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">CV Analyse</h3>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                <p className="text-sm text-gray-700 whitespace-pre-line">
                  {state.extractedData.cvText.substring(0, 500)}...
                </p>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center mb-4">
                <Mic className="w-5 h-5 text-purple-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Interview Transcript</h3>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                <p className="text-sm text-gray-700 whitespace-pre-line">
                  {state.extractedData.audioTranscript.substring(0, 500)}...
                </p>
              </div>
            </div>
          </div>

          {/* Extracted Skills */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Geëxtraheerde Vaardigheden
            </h3>
            <div className="flex flex-wrap gap-2">
              {analysis.extractedSkills?.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* AI Model Status */}
      <AIModelStatus step="results" />

      {/* Actions */}
      <div className="flex justify-between pt-8 border-t border-neutral-200">
        <button
          onClick={resetApp}
          className="btn-secondary"
        >
          Nieuwe Analyse
        </button>

        <div className="flex space-x-4">
          <button className="btn-secondary flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export PDF</span>
          </button>

          <button className="btn-primary">
            Kandidaat Opslaan
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultsStep;
