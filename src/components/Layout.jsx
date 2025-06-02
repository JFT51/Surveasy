import React from 'react';
import { useApp } from '../context/AppContext';
import { Upload, Users, BarChart3, Settings } from 'lucide-react';
import NotificationSystem from './NotificationSystem';

const Layout = ({ children }) => {
  const { state, resetApp } = useApp();

  const steps = [
    { id: 'upload', label: 'Upload', icon: Upload },
    { id: 'skills', label: 'Vaardigheden', icon: Settings },
    { id: 'processing', label: 'Verwerking', icon: BarChart3 },
    { id: 'results', label: 'Resultaten', icon: Users }
  ];

  const currentStepIndex = steps.findIndex(step => step.id === state.currentStep);

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-24">
            <div>
              <h1 className="text-4xl font-bold text-neutral-900">Surveasy</h1>
              <p className="text-lg text-neutral-600 mt-1">AI Talent Analyzer</p>
            </div>

            <button
              onClick={resetApp}
              className="btn-secondary"
            >
              Nieuwe Analyse
            </button>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="py-8">
            <nav className="flex justify-center">
              <div className="flex items-center space-x-12">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = step.id === state.currentStep;
                  const isCompleted = index < currentStepIndex;

                  return (
                    <div key={step.id} className="flex items-center">
                      <div className="flex items-center space-x-4">
                        <div
                          className={`w-16 h-16 rounded-lg flex items-center justify-center transition-colors ${
                            isActive
                              ? 'bg-primary-600 text-white'
                              : isCompleted
                              ? 'bg-success-600 text-white'
                              : 'bg-neutral-200 text-neutral-500'
                          }`}
                        >
                          <Icon className="w-8 h-8" />
                        </div>
                        <div>
                          <span
                            className={`text-xl font-semibold ${
                              isActive
                                ? 'text-primary-600'
                                : isCompleted
                                ? 'text-success-600'
                                : 'text-neutral-500'
                            }`}
                          >
                            {step.label}
                          </span>
                        </div>
                      </div>

                      {/* Connector Line */}
                      {index < steps.length - 1 && (
                        <div className={`w-24 h-1 mx-8 rounded ${
                          index < currentStepIndex ? 'bg-success-400' : 'bg-neutral-200'
                        }`}></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 lg:px-8 py-16 pb-24">
        {children}
      </main>

      {/* Notification System */}
      <NotificationSystem />
    </div>
  );
};

export default Layout;
