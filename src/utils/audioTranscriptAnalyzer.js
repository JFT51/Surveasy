/**
 * Advanced Audio Transcript Analysis Module
 * Analyzes interview transcripts for communication skills, personality traits, and technical competency
 */

// Communication patterns and indicators
const COMMUNICATION_PATTERNS = {
  clarity: {
    positive: ['duidelijk', 'helder', 'specifiek', 'concreet', 'precies', 'exact'],
    negative: ['vaag', 'onduidelijk', 'misschien', 'soort van', 'eh', 'uhm'],
    fillers: ['eh', 'uhm', 'nou', 'ja', 'dus', 'eigenlijk', 'gewoon']
  },
  confidence: {
    high: ['zeker', 'absoluut', 'definitief', 'overtuigd', 'stellig', 'zonder twijfel'],
    medium: ['denk ik', 'geloof ik', 'waarschijnlijk', 'vermoedelijk'],
    low: ['misschien', 'mogelijk', 'weet niet zeker', 'twijfel', 'onzeker']
  },
  technical: {
    terms: ['systeem', 'proces', 'implementatie', 'integratie', 'analyse', 'architectuur', 
            'database', 'framework', 'algoritme', 'optimalisatie', 'performance', 'security'],
    methodologies: ['agile', 'scrum', 'devops', 'ci/cd', 'testing', 'debugging', 'refactoring'],
    languages: ['javascript', 'python', 'java', 'react', 'node', 'sql', 'html', 'css']
  },
  leadership: {
    indicators: ['team', 'leiding', 'verantwoordelijkheid', 'beslissing', 'coördinatie', 
                'samenwerking', 'motivatie', 'coaching', 'mentoring', 'project management']
  },
  problemSolving: {
    indicators: ['probleem', 'oplossing', 'uitdaging', 'aanpak', 'strategie', 'analyse',
                'onderzoek', 'troubleshooting', 'debugging', 'optimalisatie']
  }
};

// Personality trait indicators
const PERSONALITY_INDICATORS = {
  analytical: ['analyse', 'data', 'onderzoek', 'systematisch', 'methodisch', 'logisch'],
  creative: ['creatief', 'innovatief', 'origineel', 'out-of-the-box', 'brainstorm'],
  collaborative: ['samenwerking', 'team', 'communicatie', 'feedback', 'overleg'],
  detail_oriented: ['detail', 'nauwkeurig', 'precies', 'zorgvuldig', 'grondig'],
  adaptable: ['flexibel', 'aanpassen', 'verandering', 'leren', 'ontwikkeling']
};

/**
 * Analyze communication quality from transcript
 */
export const analyzeCommunicationQuality = (transcript, audioMetadata = null) => {
  if (!transcript || transcript.trim().length === 0) {
    return {
      clarity: 0,
      confidence: 0,
      fluency: 0,
      technicalCommunication: 0,
      overallScore: 0,
      insights: ['Geen transcript beschikbaar voor analyse']
    };
  }

  const text = transcript.toLowerCase();
  const words = text.split(/\s+/).filter(word => word.length > 0);
  const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 10);
  
  // Base scores from Whisper confidence if available
  let baseScore = audioMetadata?.confidence ? Math.round(audioMetadata.confidence * 100) : 75;
  
  // Analyze clarity
  const clarity = analyzeClarityScore(text, words, sentences, baseScore);
  
  // Analyze confidence
  const confidence = analyzeConfidenceScore(text, words, baseScore);
  
  // Analyze fluency
  const fluency = analyzeFluencyScore(text, words, sentences, audioMetadata);
  
  // Analyze technical communication
  const technicalCommunication = analyzeTechnicalCommunication(text, words);
  
  // Calculate overall score
  const overallScore = Math.round((clarity + confidence + fluency + technicalCommunication) / 4);
  
  // Generate insights
  const insights = generateCommunicationInsights(clarity, confidence, fluency, technicalCommunication, audioMetadata);
  
  return {
    clarity,
    confidence,
    fluency,
    technicalCommunication,
    overallScore,
    insights,
    metadata: {
      wordCount: words.length,
      sentenceCount: sentences.length,
      averageWordsPerSentence: sentences.length > 0 ? Math.round(words.length / sentences.length) : 0,
      transcriptionSource: audioMetadata?.transcriptionMethod || 'unknown',
      isRealTranscription: audioMetadata?.isRealTranscription || false
    }
  };
};

/**
 * Analyze clarity of communication
 */
const analyzeClarityScore = (text, words, sentences, baseScore) => {
  let score = baseScore;
  
  // Positive indicators
  const positiveCount = COMMUNICATION_PATTERNS.clarity.positive
    .reduce((count, word) => count + (text.split(word).length - 1), 0);
  score += positiveCount * 3;
  
  // Negative indicators
  const negativeCount = COMMUNICATION_PATTERNS.clarity.negative
    .reduce((count, word) => count + (text.split(word).length - 1), 0);
  score -= negativeCount * 2;
  
  // Filler words penalty
  const fillerCount = COMMUNICATION_PATTERNS.clarity.fillers
    .reduce((count, word) => count + (text.split(word).length - 1), 0);
  const fillerRatio = fillerCount / words.length;
  score -= Math.round(fillerRatio * 100);
  
  // Sentence structure bonus
  if (sentences.length > 0) {
    const avgWordsPerSentence = words.length / sentences.length;
    if (avgWordsPerSentence >= 8 && avgWordsPerSentence <= 20) {
      score += 5; // Good sentence length
    }
  }
  
  return Math.max(0, Math.min(100, score));
};

/**
 * Analyze confidence level in speech
 */
const analyzeConfidenceScore = (text, words, baseScore) => {
  let score = baseScore;
  
  // High confidence indicators
  const highConfidenceCount = COMMUNICATION_PATTERNS.confidence.high
    .reduce((count, phrase) => count + (text.split(phrase).length - 1), 0);
  score += highConfidenceCount * 5;
  
  // Medium confidence indicators
  const mediumConfidenceCount = COMMUNICATION_PATTERNS.confidence.medium
    .reduce((count, phrase) => count + (text.split(phrase).length - 1), 0);
  score += mediumConfidenceCount * 2;
  
  // Low confidence indicators
  const lowConfidenceCount = COMMUNICATION_PATTERNS.confidence.low
    .reduce((count, phrase) => count + (text.split(phrase).length - 1), 0);
  score -= lowConfidenceCount * 3;
  
  return Math.max(0, Math.min(100, score));
};

/**
 * Analyze fluency based on speech patterns
 */
const analyzeFluencyScore = (text, words, sentences, audioMetadata) => {
  let score = 75;
  
  // Use Whisper confidence as base if available
  if (audioMetadata?.confidence) {
    score = Math.round(audioMetadata.confidence * 100);
  }
  
  // Analyze repetition patterns
  const wordFreq = {};
  words.forEach(word => {
    if (word.length > 3) {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    }
  });
  
  const repetitions = Object.values(wordFreq).filter(count => count > 3).length;
  score -= repetitions * 2;
  
  // Analyze sentence variety
  if (sentences.length > 0) {
    const sentenceLengths = sentences.map(s => s.split(/\s+/).length);
    const avgLength = sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length;
    const variance = sentenceLengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / sentenceLengths.length;
    
    if (variance > 10) score += 5; // Good sentence variety
  }
  
  return Math.max(0, Math.min(100, score));
};

/**
 * Analyze technical communication skills
 */
const analyzeTechnicalCommunication = (text, words) => {
  let score = 60; // Base technical score
  
  // Technical terms
  const technicalTermCount = COMMUNICATION_PATTERNS.technical.terms
    .reduce((count, term) => count + (text.split(term).length - 1), 0);
  score += technicalTermCount * 4;
  
  // Methodologies
  const methodologyCount = COMMUNICATION_PATTERNS.technical.methodologies
    .reduce((count, method) => count + (text.split(method).length - 1), 0);
  score += methodologyCount * 5;
  
  // Programming languages
  const languageCount = COMMUNICATION_PATTERNS.technical.languages
    .reduce((count, lang) => count + (text.split(lang).length - 1), 0);
  score += languageCount * 3;
  
  return Math.max(0, Math.min(100, score));
};

/**
 * Generate communication insights
 */
const generateCommunicationInsights = (clarity, confidence, fluency, technical, audioMetadata) => {
  const insights = [];
  
  // Clarity insights
  if (clarity >= 85) {
    insights.push('Zeer heldere en duidelijke communicatie');
  } else if (clarity >= 70) {
    insights.push('Goede communicatiehelderheid');
  } else if (clarity < 60) {
    insights.push('Communicatie kan duidelijker en gestructureerder');
  }
  
  // Confidence insights
  if (confidence >= 85) {
    insights.push('Toont hoog zelfvertrouwen in antwoorden');
  } else if (confidence < 60) {
    insights.push('Zou meer zelfvertrouwen kunnen tonen');
  }
  
  // Technical insights
  if (technical >= 80) {
    insights.push('Sterke technische communicatievaardigheden');
  } else if (technical >= 60) {
    insights.push('Adequate technische communicatie');
  } else {
    insights.push('Technische communicatie kan worden verbeterd');
  }
  
  // Whisper-specific insights
  if (audioMetadata?.isRealTranscription) {
    if (audioMetadata.confidence >= 0.9) {
      insights.push('Zeer duidelijke uitspraak en articulatie');
    } else if (audioMetadata.confidence < 0.7) {
      insights.push('Uitspraak of audio kwaliteit kan beter');
    }
  }
  
  return insights;
};

/**
 * Extract personality traits from transcript
 */
export const extractPersonalityTraits = (transcript) => {
  if (!transcript || transcript.trim().length === 0) {
    return {
      traits: [],
      confidence: 0,
      insights: ['Geen transcript beschikbaar voor persoonlijkheidsanalyse']
    };
  }

  const text = transcript.toLowerCase();
  const traits = [];
  
  // Analyze each personality dimension
  Object.entries(PERSONALITY_INDICATORS).forEach(([trait, indicators]) => {
    const score = indicators.reduce((count, indicator) => {
      return count + (text.split(indicator).length - 1);
    }, 0);
    
    if (score > 0) {
      traits.push({
        trait: trait,
        score: Math.min(score * 10, 100),
        indicators: indicators.filter(ind => text.includes(ind))
      });
    }
  });
  
  // Sort by score
  traits.sort((a, b) => b.score - a.score);
  
  const confidence = traits.length > 0 ? Math.min(traits[0].score, 85) : 0;
  
  return {
    traits: traits.slice(0, 3), // Top 3 traits
    confidence,
    insights: generatePersonalityInsights(traits)
  };
};

/**
 * Generate personality insights
 */
const generatePersonalityInsights = (traits) => {
  const insights = [];
  
  if (traits.length === 0) {
    insights.push('Onvoldoende data voor persoonlijkheidsanalyse');
    return insights;
  }
  
  const topTrait = traits[0];
  
  switch (topTrait.trait) {
    case 'analytical':
      insights.push('Toont analytische denkwijze en systematische aanpak');
      break;
    case 'creative':
      insights.push('Demonstreert creativiteit en innovatief denken');
      break;
    case 'collaborative':
      insights.push('Sterke focus op samenwerking en teamwork');
      break;
    case 'detail_oriented':
      insights.push('Aandacht voor detail en nauwkeurigheid');
      break;
    case 'adaptable':
      insights.push('Flexibel en aanpasbaar in verschillende situaties');
      break;
  }
  
  if (traits.length > 1) {
    insights.push(`Toont ook kenmerken van ${traits[1].trait.replace('_', ' ')}`);
  }
  
  return insights;
};

/**
 * Analyze leadership and soft skills
 */
export const analyzeLeadershipSkills = (transcript) => {
  if (!transcript || transcript.trim().length === 0) {
    return {
      leadershipScore: 0,
      problemSolvingScore: 0,
      insights: ['Geen transcript beschikbaar voor soft skills analyse']
    };
  }

  const text = transcript.toLowerCase();
  
  // Leadership indicators
  const leadershipCount = COMMUNICATION_PATTERNS.leadership.indicators
    .reduce((count, indicator) => count + (text.split(indicator).length - 1), 0);
  const leadershipScore = Math.min(leadershipCount * 15, 100);
  
  // Problem solving indicators
  const problemSolvingCount = COMMUNICATION_PATTERNS.problemSolving.indicators
    .reduce((count, indicator) => count + (text.split(indicator).length - 1), 0);
  const problemSolvingScore = Math.min(problemSolvingCount * 12, 100);
  
  const insights = [];
  
  if (leadershipScore >= 70) {
    insights.push('Sterke leiderschapsvaardigheden en teamgerichtheid');
  } else if (leadershipScore >= 40) {
    insights.push('Toont potentieel voor leiderschapsrollen');
  }
  
  if (problemSolvingScore >= 70) {
    insights.push('Uitstekende probleemoplossende vaardigheden');
  } else if (problemSolvingScore >= 40) {
    insights.push('Goede analytische en probleemoplossende aanpak');
  }
  
  if (leadershipScore < 30 && problemSolvingScore < 30) {
    insights.push('Meer focus op soft skills ontwikkeling aanbevolen');
  }
  
  return {
    leadershipScore,
    problemSolvingScore,
    insights
  };
};
