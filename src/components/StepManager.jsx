import React from 'react';
import { useApp } from '../context/AppContext';
import UploadStep from './steps/UploadStep';
import SkillsStep from './steps/SkillsStep';
import ProcessingStep from './steps/ProcessingStep';
import ResultsStep from './steps/ResultsStep';

const StepManager = () => {
  const { state } = useApp();

  const renderStep = () => {
    switch (state.currentStep) {
      case 'upload':
        return <UploadStep />;
      case 'skills':
        return <SkillsStep />;
      case 'processing':
        return <ProcessingStep />;
      case 'results':
        return <ResultsStep />;
      default:
        return <UploadStep />;
    }
  };

  return (
    <div className="animate-fade-in">
      {renderStep()}
    </div>
  );
};

export default StepManager;
