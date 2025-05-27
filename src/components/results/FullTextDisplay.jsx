import React, { useState } from 'react';
import {
  FileText, Mic, Copy, Download, Search, Eye, EyeOff,
  ChevronDown, ChevronUp, Hash, Clock, User, Building
} from 'lucide-react';

const FullTextDisplay = ({ cvText, audioTranscript, analysisData, audioResult }) => {
  const [expandedSections, setExpandedSections] = useState({
    cv: false,
    audio: false
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightSkills, setHighlightSkills] = useState(true);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
    console.log(`${type} text copied to clipboard`);
  };

  const downloadText = (text, filename) => {
    const element = document.createElement('a');
    const file = new Blob([text], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const highlightText = (text, searchTerm, skills = []) => {
    if (!text) return '';

    let highlightedText = text;

    // Highlight search term
    if (searchTerm && searchTerm.length > 2) {
      const regex = new RegExp(`(${searchTerm})`, 'gi');
      highlightedText = highlightedText.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>');
    }

    // Highlight skills if enabled
    if (highlightSkills && skills.length > 0) {
      skills.forEach(skill => {
        const skillRegex = new RegExp(`\\b(${skill.name})\\b`, 'gi');
        highlightedText = highlightedText.replace(skillRegex,
          `<span class="bg-blue-100 text-blue-800 px-1 rounded font-medium border border-blue-200">$1</span>`
        );
      });
    }

    return highlightedText;
  };

  const extractedSkills = analysisData?.nlpAnalysis?.skillCategories ?
    Object.values(analysisData.nlpAnalysis.skillCategories).flat() : [];

  const getTextStats = (text) => {
    if (!text) return { words: 0, characters: 0, lines: 0 };

    return {
      words: text.split(/\s+/).filter(word => word.length > 0).length,
      characters: text.length,
      lines: text.split('\n').length
    };
  };

  const cvStats = getTextStats(cvText);
  const audioStats = audioResult?.metadata ? {
    words: audioResult.metadata.wordCount || getTextStats(audioTranscript).words,
    characters: audioTranscript.length,
    lines: audioTranscript.split('\n').length,
    duration: audioResult.metadata.duration || 0,
    confidence: audioResult.metadata.confidence || 0,
    language: audioResult.metadata.language || 'nl',
    isRealTranscription: audioResult.metadata.isRealTranscription || false,
    transcriptionMethod: audioResult.metadata.transcriptionMethod || 'Unknown'
  } : getTextStats(audioTranscript);

  return (
    <div className="space-y-8">
      {/* Search and Controls */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-3xl font-bold text-neutral-900">Volledige Tekst Analyse</h3>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Zoek in tekst..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <button
              onClick={() => setHighlightSkills(!highlightSkills)}
              className={`flex items-center px-4 py-2 rounded-lg border transition-colors ${
                highlightSkills
                  ? 'bg-blue-100 text-blue-700 border-blue-300'
                  : 'bg-neutral-100 text-neutral-700 border-neutral-300'
              }`}
            >
              {highlightSkills ? <Eye className="w-4 h-4 mr-2" /> : <EyeOff className="w-4 h-4 mr-2" />}
              Skills Markeren
            </button>
          </div>
        </div>

        {/* Text Statistics */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="text-lg font-semibold text-blue-800 mb-3 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              CV Tekst Statistieken
            </h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{cvStats.words}</div>
                <p className="text-blue-700">Woorden</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{cvStats.characters}</div>
                <p className="text-blue-700">Karakters</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{cvStats.lines}</div>
                <p className="text-blue-700">Regels</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="text-lg font-semibold text-green-800 mb-3 flex items-center">
              <Mic className="w-5 h-5 mr-2" />
              Audio Transcript Statistieken
            </h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{audioStats.words}</div>
                <p className="text-green-700">Woorden</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{audioStats.characters}</div>
                <p className="text-green-700">Karakters</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{extractedSkills.length}</div>
                <p className="text-green-700">Skills Gevonden</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CV Text Section */}
      <div className="card">
        <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <FileText className="w-8 h-8 text-blue-600 mr-4" />
              <div className="text-left">
                <h3 className="text-2xl font-bold text-blue-900">CV Volledige Tekst</h3>
                <p className="text-blue-700">
                  {cvStats.words} woorden • {cvStats.characters} karakters • Geëxtraheerd met PDF.js
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => copyToClipboard(cvText, 'CV')}
                className="p-2 text-blue-600 hover:bg-blue-200 rounded-lg transition-colors"
                title="Kopieer CV tekst"
              >
                <Copy className="w-5 h-5" />
              </button>
              <button
                onClick={() => downloadText(cvText, 'cv-text.txt')}
                className="p-2 text-blue-600 hover:bg-blue-200 rounded-lg transition-colors"
                title="Download CV tekst"
              >
                <Download className="w-5 h-5" />
              </button>
              <button
                onClick={() => toggleSection('cv')}
                className="p-2 text-blue-600 hover:bg-blue-200 rounded-lg transition-colors"
                title={expandedSections.cv ? 'Inklappen' : 'Uitklappen'}
              >
                {expandedSections.cv ? (
                  <ChevronUp className="w-6 h-6" />
                ) : (
                  <ChevronDown className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {expandedSections.cv && (
          <div className="p-6 bg-white border-t border-blue-200">
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Bron:</strong> PDF.js extractie •
                <strong> Verwerking:</strong> NLP analyse met Compromise.js •
                <strong> Skills:</strong> {extractedSkills.length} geïdentificeerd
              </p>
            </div>
            <div
              className="prose max-w-none text-neutral-700 leading-relaxed whitespace-pre-wrap font-mono text-sm bg-neutral-50 p-6 rounded-lg border"
              dangerouslySetInnerHTML={{
                __html: highlightText(cvText, searchTerm, extractedSkills)
              }}
            />
          </div>
        )}
      </div>

      {/* Audio Transcript Section */}
      <div className="card">
        <div className="p-6 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Mic className="w-8 h-8 text-green-600 mr-4" />
              <div className="text-left">
                <h3 className="text-2xl font-bold text-green-900">Audio Transcript</h3>
                <p className="text-green-700">
                  {audioStats.words} woorden • {audioStats.characters} karakters •
                  {audioStats.isRealTranscription ?
                    ` Whisper ${audioStats.transcriptionMethod} (${Math.round(audioStats.confidence * 100)}%)` :
                    ' Demo transcript'
                  }
                  {audioStats.duration > 0 && ` • ${Math.round(audioStats.duration)}s`}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 border rounded-full text-sm font-medium ${
                audioStats.isRealTranscription
                  ? 'bg-green-100 text-green-800 border-green-300'
                  : 'bg-yellow-100 text-yellow-800 border-yellow-300'
              }`}>
                {audioStats.isRealTranscription ? 'Whisper AI' : 'Demo Data'}
              </span>
              <button
                onClick={() => copyToClipboard(audioTranscript, 'Audio Transcript')}
                className="p-2 text-green-600 hover:bg-green-200 rounded-lg transition-colors"
                title="Kopieer transcript"
              >
                <Copy className="w-5 h-5" />
              </button>
              <button
                onClick={() => downloadText(audioTranscript, 'audio-transcript.txt')}
                className="p-2 text-green-600 hover:bg-green-200 rounded-lg transition-colors"
                title="Download transcript"
              >
                <Download className="w-5 h-5" />
              </button>
              <button
                onClick={() => toggleSection('audio')}
                className="p-2 text-green-600 hover:bg-green-200 rounded-lg transition-colors"
                title={expandedSections.audio ? 'Inklappen' : 'Uitklappen'}
              >
                {expandedSections.audio ? (
                  <ChevronUp className="w-6 h-6" />
                ) : (
                  <ChevronDown className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {expandedSections.audio && (
          <div className="p-6 bg-white border-t border-green-200">
            {!audioStats.isRealTranscription ? (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>⚠️ Demo Data:</strong> Dit is een gesimuleerd interview transcript.
                  Start de Whisper service voor echte audio-naar-tekst conversie.
                </p>
              </div>
            ) : (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  <strong>✅ Whisper AI Transcriptie:</strong> Echte audio-naar-tekst conversie met {Math.round(audioStats.confidence * 100)}% betrouwbaarheid.
                </p>
              </div>
            )}
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Transcriptie:</strong> {audioStats.transcriptionMethod} •
                <strong> Taal:</strong> {audioStats.language?.toUpperCase() || 'NL'} •
                <strong> Duur:</strong> {audioStats.duration > 0 ? `${Math.round(audioStats.duration)}s` : 'Onbekend'} •
                <strong> Betrouwbaarheid:</strong> {Math.round(audioStats.confidence * 100)}%
              </p>
            </div>
            <div
              className="prose max-w-none text-neutral-700 leading-relaxed whitespace-pre-wrap font-mono text-sm bg-neutral-50 p-6 rounded-lg border"
              dangerouslySetInnerHTML={{
                __html: highlightText(audioTranscript, searchTerm, extractedSkills)
              }}
            />
          </div>
        )}
      </div>

      {/* Analysis Summary */}
      <div className="card">
        <h4 className="text-2xl font-semibold text-neutral-900 mb-6">Tekst Analyse Samenvatting</h4>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <h5 className="text-lg font-semibold text-purple-800 mb-2 flex items-center">
              <Hash className="w-5 h-5 mr-2" />
              Totale Analyse
            </h5>
            <div className="space-y-2 text-sm">
              <p className="text-purple-700">
                <strong>Totaal woorden:</strong> {cvStats.words + audioStats.words}
              </p>
              <p className="text-purple-700">
                <strong>Skills gevonden:</strong> {extractedSkills.length}
              </p>
              <p className="text-purple-700">
                <strong>Analyse methode:</strong> {analysisData?.metadata?.analysisMethod || 'NLP Enhanced'}
              </p>
            </div>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h5 className="text-lg font-semibold text-blue-800 mb-2 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Kandidaat Info
            </h5>
            <div className="space-y-2 text-sm">
              <p className="text-blue-700">
                <strong>Ervaring:</strong> {analysisData?.nlpAnalysis?.experience?.totalYears || 0} jaar
              </p>
              <p className="text-blue-700">
                <strong>Seniority:</strong> {analysisData?.nlpAnalysis?.experience?.seniority || 'Onbekend'}
              </p>
              <p className="text-blue-700">
                <strong>Opleiding:</strong> {analysisData?.nlpAnalysis?.education?.highestLevel || 'Onbekend'}
              </p>
            </div>
          </div>

          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h5 className="text-lg font-semibold text-green-800 mb-2 flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Verwerking Info
            </h5>
            <div className="space-y-2 text-sm">
              <p className="text-green-700">
                <strong>Betrouwbaarheid:</strong> {Math.round((analysisData?.metadata?.confidence || 0.8) * 100)}%
              </p>
              <p className="text-green-700">
                <strong>Verwerkt op:</strong> {new Date().toLocaleDateString('nl-NL')}
              </p>
              <p className="text-green-700">
                <strong>NLP Engine:</strong> Compromise.js + Custom
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullTextDisplay;
