import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import UploadStep from './steps/UploadStep';
import SkillsStep from './steps/SkillsStep';
import ProcessingStep from './steps/ProcessingStep';
import ResultsStep from './steps/ResultsStep';

const StepManager = () => {
  const { state } = useApp();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentStepComponent, setCurrentStepComponent] = useState(null);

  const getStepComponent = (step) => {
    switch (step) {
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

  useEffect(() => {
    // Trigger transition animation when step changes
    setIsTransitioning(true);

    const timer = setTimeout(() => {
      setCurrentStepComponent(getStepComponent(state.currentStep));
      setIsTransitioning(false);
    }, 150); // Short transition duration

    return () => clearTimeout(timer);
  }, [state.currentStep]);

  // Initialize with current step
  useEffect(() => {
    if (!currentStepComponent) {
      setCurrentStepComponent(getStepComponent(state.currentStep));
    }
  }, []);

  return (
    <div className={`transition-all duration-300 ease-in-out ${
      isTransitioning ? 'opacity-0 transform translate-y-4' : 'opacity-100 transform translate-y-0'
    }`}>
      {currentStepComponent}
    </div>
  );
};

export default StepManager;
