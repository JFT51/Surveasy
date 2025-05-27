import React, { createContext, useContext, useReducer } from 'react';

const AppContext = createContext();

const initialState = {
  currentStep: 'upload', // upload, skills, processing, results
  files: {
    cv: null,
    audio: null
  },
  desiredSkills: [],
  extractedData: {
    cvText: '',
    audioTranscript: '',
    audioResult: null, // Full audio processing result with metadata
    skills: []
  },
  analysis: {
    candidateCategory: null,
    skillMatches: [],
    overallScore: 0,
    strengths: [],
    weaknesses: [],
    recommendation: ''
  },
  processing: {
    isProcessing: false,
    currentTask: '',
    progress: 0
  }
};

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.payload };

    case 'SET_FILES':
      return {
        ...state,
        files: { ...state.files, ...action.payload }
      };

    case 'SET_DESIRED_SKILLS':
      return { ...state, desiredSkills: action.payload };

    case 'SET_EXTRACTED_DATA':
      return {
        ...state,
        extractedData: { ...state.extractedData, ...action.payload }
      };

    case 'SET_ANALYSIS':
      return {
        ...state,
        analysis: { ...state.analysis, ...action.payload }
      };

    case 'SET_PROCESSING':
      return {
        ...state,
        processing: { ...state.processing, ...action.payload }
      };

    case 'RESET_APP':
      return initialState;

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const value = {
    state,
    dispatch,
    // Helper functions
    setStep: (step) => dispatch({ type: 'SET_STEP', payload: step }),
    setFiles: (files) => dispatch({ type: 'SET_FILES', payload: files }),
    setDesiredSkills: (skills) => dispatch({ type: 'SET_DESIRED_SKILLS', payload: skills }),
    setExtractedData: (data) => dispatch({ type: 'SET_EXTRACTED_DATA', payload: data }),
    setAnalysis: (analysis) => dispatch({ type: 'SET_ANALYSIS', payload: analysis }),
    setProcessing: (processing) => dispatch({ type: 'SET_PROCESSING', payload: processing }),
    resetApp: () => dispatch({ type: 'RESET_APP' })
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
