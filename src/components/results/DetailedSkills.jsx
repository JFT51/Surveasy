import React, { useState } from 'react';
import { 
  Code, Users, Wrench, Layers, GitBranch, Settings, 
  ChevronDown, ChevronUp, Star, MapPin, Clock, 
  CheckCircle, AlertCircle, Brain, Search
} from 'lucide-react';

const DetailedSkills = ({ analysisData }) => {
  const [expandedCategories, setExpandedCategories] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const skillCategories = analysisData.nlpAnalysis?.skillCategories || {};
  const experienceLevels = analysisData.nlpAnalysis?.experienceLevels || {};

  const categoryIcons = {
    technical: Code,
    soft: Users,
    tools: Wrench,
    languages: Layers,
    frameworks: GitBranch,
    methodologies: Settings
  };

  const categoryLabels = {
    technical: 'Technische Vaardigheden',
    soft: 'Soft Skills',
    tools: 'Tools & Software',
    languages: 'Programmeertalen',
    frameworks: 'Frameworks & Libraries',
    methodologies: 'Methodologieën & Practices'
  };

  const getExperienceLevel = (skillName) => {
    return experienceLevels[skillName] || 'intermediate';
  };

  const getExperienceBadge = (level) => {
    const badges = {
      beginner: { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Beginner' },
      intermediate: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Gemiddeld' },
      expert: { color: 'bg-green-100 text-green-800 border-green-200', label: 'Expert' }
    };
    
    const badge = badges[level] || badges.intermediate;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  const getConfidenceStars = (confidence) => {
    const stars = Math.round(confidence * 5);
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`w-4 h-4 ${i < stars ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
      />
    ));
  };

  const getSkillSource = (skill) => {
    // Determine where the skill was found
    const sources = [];
    if (skill.source?.includes('CV')) sources.push('CV');
    if (skill.source?.includes('NLP')) sources.push('NLP Analyse');
    if (skill.source?.includes('Interview')) sources.push('Interview');
    
    return sources.length > 0 ? sources.join(', ') : 'NLP Extractie';
  };

  const filteredCategories = Object.entries(skillCategories).filter(([category, skills]) => {
    if (!searchTerm) return true;
    return skills.some(skill => 
      skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const filteredSkills = (skills) => {
    if (!searchTerm) return skills;
    return skills.filter(skill => 
      skill.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <Brain className="w-8 h-8 text-primary-600 mr-4" />
          <h3 className="text-3xl font-bold text-neutral-900">Gedetailleerde Vaardigheden Analyse</h3>
        </div>
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Zoek vaardigheden..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      {/* Skills Overview */}
      <div className="mb-8 p-6 bg-neutral-50 rounded-lg">
        <h4 className="text-xl font-semibold text-neutral-900 mb-4">Overzicht</h4>
        <div className="grid md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600 mb-1">
              {Object.values(skillCategories).flat().length}
            </div>
            <p className="text-neutral-600">Totaal Vaardigheden</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {Object.values(skillCategories).flat().filter(s => s.confidence >= 0.8).length}
            </div>
            <p className="text-neutral-600">Hoge Betrouwbaarheid</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {Object.keys(skillCategories).length}
            </div>
            <p className="text-neutral-600">Categorieën</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {Object.values(experienceLevels).filter(level => level === 'expert').length}
            </div>
            <p className="text-neutral-600">Expert Level</p>
          </div>
        </div>
      </div>

      {/* Skills by Category */}
      <div className="space-y-6">
        {filteredCategories.map(([category, skills]) => {
          const Icon = categoryIcons[category] || Code;
          const isExpanded = expandedCategories[category];
          const categorySkills = filteredSkills(skills);
          
          if (categorySkills.length === 0) return null;

          return (
            <div key={category} className="border border-neutral-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleCategory(category)}
                className="w-full p-6 bg-neutral-50 hover:bg-neutral-100 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center">
                  <Icon className="w-6 h-6 text-primary-600 mr-4" />
                  <div className="text-left">
                    <h4 className="text-xl font-semibold text-neutral-900">
                      {categoryLabels[category] || category}
                    </h4>
                    <p className="text-neutral-600">
                      {categorySkills.length} vaardigheden gevonden
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="mr-4 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                    {categorySkills.length}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-neutral-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-neutral-500" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="p-6 bg-white">
                  <div className="grid gap-4">
                    {categorySkills.map((skill, index) => {
                      const experienceLevel = getExperienceLevel(skill.name);
                      const source = getSkillSource(skill);
                      
                      return (
                        <div key={index} className="border border-neutral-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h5 className="text-lg font-semibold text-neutral-900 mb-1">
                                {skill.name}
                              </h5>
                              <div className="flex items-center space-x-3 mb-2">
                                {getExperienceBadge(experienceLevel)}
                                <div className="flex items-center">
                                  {getConfidenceStars(skill.confidence)}
                                  <span className="ml-2 text-sm text-neutral-600">
                                    {Math.round(skill.confidence * 100)}% betrouwbaar
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center text-sm text-neutral-600 mb-1">
                                <MapPin className="w-4 h-4 mr-1" />
                                {source}
                              </div>
                              <div className="flex items-center text-sm text-neutral-600">
                                <Clock className="w-4 h-4 mr-1" />
                                {skill.category}
                              </div>
                            </div>
                          </div>

                          {/* Skill Details */}
                          <div className="grid md:grid-cols-3 gap-4 mt-4 p-3 bg-neutral-50 rounded-lg">
                            <div>
                              <h6 className="text-sm font-medium text-neutral-700 mb-1">Betrouwbaarheid</h6>
                              <div className="w-full bg-neutral-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    skill.confidence >= 0.8 ? 'bg-green-500' : 
                                    skill.confidence >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${skill.confidence * 100}%` }}
                                ></div>
                              </div>
                              <span className="text-xs text-neutral-600">
                                {Math.round(skill.confidence * 100)}%
                              </span>
                            </div>
                            
                            <div>
                              <h6 className="text-sm font-medium text-neutral-700 mb-1">Ervaring Level</h6>
                              <div className="flex items-center">
                                {experienceLevel === 'expert' && <CheckCircle className="w-4 h-4 text-green-500 mr-1" />}
                                {experienceLevel === 'intermediate' && <AlertCircle className="w-4 h-4 text-yellow-500 mr-1" />}
                                {experienceLevel === 'beginner' && <Clock className="w-4 h-4 text-blue-500 mr-1" />}
                                <span className="text-sm text-neutral-700 capitalize">{experienceLevel}</span>
                              </div>
                            </div>
                            
                            <div>
                              <h6 className="text-sm font-medium text-neutral-700 mb-1">Bron</h6>
                              <span className="text-sm text-neutral-600">{source}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* No Results */}
      {filteredCategories.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
          <h4 className="text-xl font-semibold text-neutral-600 mb-2">Geen vaardigheden gevonden</h4>
          <p className="text-neutral-500">
            Probeer een andere zoekterm of wis de zoekbalk om alle vaardigheden te zien.
          </p>
        </div>
      )}

      {/* Analysis Method Info */}
      <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <h5 className="text-lg font-semibold text-blue-800 mb-3 flex items-center">
          <Brain className="w-5 h-5 mr-2" />
          NLP Analyse Methode
        </h5>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <h6 className="font-medium text-blue-700 mb-2">Extractie Technieken:</h6>
            <ul className="space-y-1 text-blue-600">
              <li>• Compromise.js voor semantische analyse</li>
              <li>• Pattern matching voor skill herkenning</li>
              <li>• Context-aware confidence scoring</li>
              <li>• Nederlandse taal ondersteuning</li>
            </ul>
          </div>
          <div>
            <h6 className="font-medium text-blue-700 mb-2">Betrouwbaarheid Factoren:</h6>
            <ul className="space-y-1 text-blue-600">
              <li>• Frequentie van vermelding</li>
              <li>• Context en ervaring indicatoren</li>
              <li>• Skill categorie specificiteit</li>
              <li>• Cross-referentie validatie</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailedSkills;
