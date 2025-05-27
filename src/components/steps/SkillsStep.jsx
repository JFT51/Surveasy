import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, X, Star, Target, Lightbulb } from 'lucide-react';
import AIModelStatus from '../AIModelStatus';

const SkillsStep = () => {
  const { state, setDesiredSkills, setStep } = useApp();
  const [newSkill, setNewSkill] = useState('');
  const [skillPriority, setSkillPriority] = useState('medium');

  // Suggested skills for maritime/logistics roles
  const suggestedSkills = [
    'SAP TM', 'Portbase', 'Douaneformaliteiten', 'Import/Export procedures',
    'Logistieke planning', 'Communicatievaardigheden', 'Probleemoplossend denken',
    'Internationale regelgeving', 'EDI-integraties', 'Track & Trace systemen',
    'WMS systemen', 'Maritieme logistiek', 'Tijdsmanagement', 'Klantgerichtheid',
    'Stressbestendigheid', 'Analytisch denken', 'Teamwork', 'Leiderschapsvaardigheden'
  ];

  const addSkill = (skillName = newSkill, priority = skillPriority) => {
    if (skillName.trim() && !state.desiredSkills.find(s => s.name.toLowerCase() === skillName.toLowerCase())) {
      const updatedSkills = [...state.desiredSkills, {
        id: Date.now(),
        name: skillName.trim(),
        priority: priority,
        weight: priority === 'high' ? 3 : priority === 'medium' ? 2 : 1
      }];
      setDesiredSkills(updatedSkills);
      setNewSkill('');
      setSkillPriority('medium');
    }
  };

  const removeSkill = (skillId) => {
    const updatedSkills = state.desiredSkills.filter(skill => skill.id !== skillId);
    setDesiredSkills(updatedSkills);
  };

  const updateSkillPriority = (skillId, newPriority) => {
    const updatedSkills = state.desiredSkills.map(skill =>
      skill.id === skillId
        ? { ...skill, priority: newPriority, weight: newPriority === 'high' ? 3 : newPriority === 'medium' ? 2 : 1 }
        : skill
    );
    setDesiredSkills(updatedSkills);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return <Star className="w-4 h-4" />;
      case 'medium': return <Target className="w-4 h-4" />;
      case 'low': return <Lightbulb className="w-4 h-4" />;
      default: return null;
    }
  };

  const canProceed = state.desiredSkills.length > 0;

  return (
    <div className="space-y-12">
      <div className="text-center">
        <h2 className="text-5xl font-bold text-neutral-900 mb-6">
          Gewenste Vaardigheden Definiëren
        </h2>
        <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
          Voeg de vaardigheden toe die belangrijk zijn voor deze functie.
          Stel prioriteiten in om de matching nauwkeuriger te maken.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Add Skills Section */}
        <div className="card">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Vaardigheid Toevoegen</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vaardigheid Naam
              </label>
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                placeholder="Bijv. SAP TM, Communicatievaardigheden..."
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prioriteit
              </label>
              <select
                value={skillPriority}
                onChange={(e) => setSkillPriority(e.target.value)}
                className="input-field"
              >
                <option value="low">Laag - Nice to have</option>
                <option value="medium">Gemiddeld - Belangrijk</option>
                <option value="high">Hoog - Essentieel</option>
              </select>
            </div>

            <button
              onClick={() => addSkill()}
              disabled={!newSkill.trim()}
              className="btn-primary w-full flex items-center justify-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Vaardigheid Toevoegen</span>
            </button>
          </div>

          {/* Suggested Skills */}
          <div className="mt-8">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Voorgestelde Vaardigheden</h4>
            <div className="flex flex-wrap gap-2">
              {suggestedSkills
                .filter(skill => !state.desiredSkills.find(s => s.name.toLowerCase() === skill.toLowerCase()))
                .map((skill, index) => (
                <button
                  key={index}
                  onClick={() => addSkill(skill, 'medium')}
                  className="px-3 py-1 text-sm bg-gray-100 hover:bg-primary-100 text-gray-700 hover:text-primary-700 rounded-full transition-colors duration-200"
                >
                  + {skill}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Skills List */}
        <div className="card">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            Toegevoegde Vaardigheden ({state.desiredSkills.length})
          </h3>

          {state.desiredSkills.length === 0 ? (
            <div className="text-center py-8">
              <Target className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Nog geen vaardigheden toegevoegd</p>
              <p className="text-sm text-gray-400 mt-1">
                Voeg vaardigheden toe om de analyse te starten
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {state.desiredSkills.map((skill) => (
                <div
                  key={skill.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-1 rounded-full ${getPriorityColor(skill.priority)}`}>
                      {getPriorityIcon(skill.priority)}
                    </div>
                    <span className="font-medium text-gray-900">{skill.name}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <select
                      value={skill.priority}
                      onChange={(e) => updateSkillPriority(skill.id, e.target.value)}
                      className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    >
                      <option value="low">Laag</option>
                      <option value="medium">Gemiddeld</option>
                      <option value="high">Hoog</option>
                    </select>

                    <button
                      onClick={() => removeSkill(skill.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* AI Model Status */}
      <AIModelStatus step="skills" />

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={() => setStep('upload')}
          className="btn-secondary"
        >
          Terug naar Upload
        </button>

        <button
          onClick={() => setStep('processing')}
          disabled={!canProceed}
          className={`btn-primary ${!canProceed ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Start Analyse
        </button>
      </div>

      {!canProceed && (
        <p className="text-center text-xl text-neutral-500 mt-4">
          Voeg minimaal één vaardigheid toe om door te gaan
        </p>
      )}
    </div>
  );
};

export default SkillsStep;
