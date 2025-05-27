// Analysis engine with PDF.js integration, NLP processing, and Whisper integration
// Includes advanced CV analysis and real speech-to-text capabilities

import { extractTextFromPDF, parseCV } from './pdfProcessor.js';
import { analyzeCVWithNLP } from './cvAnalyzer.js';
import { extractSkillsNLP, extractSkillsEnhanced } from './nlpProcessor.js';
import { spacyService } from './spacyService.js';
import { whisperService, formatTranscriptionResult } from './whisperService.js';
import {
  analyzeCommunicationQuality,
  extractPersonalityTraits,
  analyzeLeadershipSkills
} from './audioTranscriptAnalyzer.js';

export const processCVText = async (file) => {
  try {
    // Extract text from PDF using PDF.js
    const extractionResult = await extractTextFromPDF(file);

    if (!extractionResult.success) {
      throw new Error(extractionResult.error || 'Failed to extract text from PDF');
    }

    // Parse the extracted text into structured CV data
    const parsedCV = parseCV(extractionResult.text);

    return {
      success: true,
      extractedText: extractionResult.text,
      parsedData: parsedCV,
      metadata: {
        fileName: file.name,
        fileSize: file.size,
        pageCount: extractionResult.metadata.totalPages,
        wordCount: extractionResult.metadata.wordCount,
        characterCount: extractionResult.metadata.characterCount,
        processingTime: 'Real-time',
        extractedAt: extractionResult.metadata.extractedAt,
        sections: Object.keys(parsedCV.sections),
        isPDFExtraction: true
      }
    };

  } catch (error) {
    console.error('CV processing error:', error);
    throw new Error(`Failed to process CV: ${error.message}. Please ensure the PDF is valid and try again.`);
  }
};





/**
 * Process audio file using Whisper speech-to-text
 * @param {File} audioFile - Audio file to transcribe
 * @param {Object} options - Transcription options
 * @returns {Promise<Object>} - Transcription result
 */
export const processAudioWithWhisper = async (audioFile, options = {}) => {
  try {
    console.log('Processing audio file with Whisper:', audioFile.name);

    // Check if Whisper service is available
    const isWhisperAvailable = await whisperService.checkAvailability();

    if (!isWhisperAvailable) {
      throw new Error('Whisper service is not available. Please ensure the Whisper service is running on port 5000.');
    }

    console.log('Using Whisper service for transcription');

    // Use real Whisper transcription
    const transcriptionResult = await whisperService.transcribeAudio(audioFile, {
      language: 'nl',
      task: 'transcribe',
      wordTimestamps: true,
      initialPrompt: 'Dit is een sollicitatiegesprek in het Nederlands.',
      ...options
    });

    const formattedResult = formatTranscriptionResult(transcriptionResult);

    return {
      success: true,
      audioTranscript: formattedResult.text,
      transcriptionData: formattedResult,
      metadata: {
        fileName: audioFile.name,
        fileSize: audioFile.size,
        transcriptionMethod: 'Whisper',
        language: formattedResult.language,
        confidence: formattedResult.confidence,
        duration: formattedResult.duration,
        wordCount: formattedResult.wordCount,
        processingTime: new Date().toISOString(),
        isRealTranscription: true
      }
    };
  } catch (error) {
    console.error('Audio processing error:', error);
    throw new Error(`Failed to process audio: ${error.message}. Please ensure the Whisper service is running and the audio file is valid.`);
  }
};



export const analyzeCandidate = async (cvText, audioTranscript, desiredSkills, audioResult = null) => {
  try {
    console.log('Starting enhanced candidate analysis with spaCy + NLP...');
    console.log('Audio result metadata:', audioResult?.metadata);

    // Check spaCy service availability
    const spacyAvailable = await spacyService.checkAvailability();
    console.log('spaCy service available:', spacyAvailable);

    // Use enhanced NLP for comprehensive CV analysis (spaCy + compromise)
    const nlpAnalysis = await analyzeCVWithNLP(cvText, desiredSkills);

    // Analyze communication from audio transcript with metadata
    const communicationAnalysis = analyzeAudioCommunication(audioTranscript, audioResult);

    // Enhanced skill matching using NLP results
    const skillMatches = desiredSkills.map(desiredSkill => {
      const skillName = desiredSkill.name.toLowerCase();

      // Check in NLP extracted skills
      const allExtractedSkills = Object.values(nlpAnalysis.skills.skills).flat();
      const nlpMatch = allExtractedSkills.find(skill =>
        skill.name.toLowerCase().includes(skillName) ||
        skillName.includes(skill.name.toLowerCase())
      );

      let found = false;
      let confidence = 0;
      let source = [];

      if (nlpMatch) {
        found = true;
        confidence = nlpMatch.confidence;
        source = ['CV (NLP)'];
      } else {
        // Fallback to traditional keyword matching
        const combinedText = (cvText + ' ' + audioTranscript).toLowerCase();
        if (combinedText.includes(skillName)) {
          found = true;
          confidence = 0.7;
          source = ['CV', 'Interview'];
        } else {
          // Check for related terms
          const relatedTerms = getRelatedTerms(skillName);
          for (const term of relatedTerms) {
            if (combinedText.includes(term)) {
              found = true;
              confidence = 0.5;
              source = ['Related terms'];
              break;
            }
          }
        }
      }

      return {
        skill: desiredSkill.name,
        priority: desiredSkill.priority,
        weight: desiredSkill.weight,
        found,
        confidence,
        source,
        score: found ? confidence * desiredSkill.weight : 0,
        nlpCategory: nlpMatch ? nlpMatch.category : null
      };
    });

    // Calculate overall score using NLP assessment
    const nlpScore = nlpAnalysis.overallAssessment.overallScore;
    const totalPossibleScore = desiredSkills.reduce((sum, skill) => sum + skill.weight, 0);
    const actualScore = skillMatches.reduce((sum, match) => sum + match.score, 0);
    const skillMatchScore = totalPossibleScore > 0 ? Math.round((actualScore / totalPossibleScore) * 100) : 0;

    // Combine NLP score with skill matching (70% NLP, 30% skill matching)
    const overallScore = Math.round(nlpScore * 0.7 + skillMatchScore * 0.3);

  // Determine candidate category
  let candidateCategory;
  const highPriorityMatches = skillMatches.filter(m => m.priority === 'high' && m.found).length;
  const totalHighPriority = desiredSkills.filter(s => s.priority === 'high').length;

  if (overallScore >= 80 && highPriorityMatches >= totalHighPriority * 0.8) {
    candidateCategory = {
      type: 'high_match',
      label: 'Hoge Match',
      color: 'green',
      icon: '🟢',
      description: 'Uitstekende kandidaat met sterke technische vaardigheden en ervaring'
    };
  } else if (overallScore >= 60) {
    candidateCategory = {
      type: 'good_communication',
      label: 'Goede Communicatie, Zwakke Technische Match',
      color: 'yellow',
      icon: '🟡',
      description: 'Sterke communicatievaardigheden, maar mist enkele technische competenties'
    };
  } else if (overallScore >= 40) {
    candidateCategory = {
      type: 'potential',
      label: 'Potentieel, Heeft Ontwikkeling Nodig',
      color: 'orange',
      icon: '🟠',
      description: 'Toont potentieel maar heeft training en ontwikkeling nodig'
    };
  } else {
    candidateCategory = {
      type: 'underqualified',
      label: 'Ondergekwalificeerd',
      color: 'red',
      icon: '🔴',
      description: 'Voldoet niet aan de minimale vereisten voor deze functie'
    };
  }

  // Generate strengths and weaknesses
  const strengths = skillMatches
    .filter(m => m.found && m.confidence > 0.7)
    .map(m => m.skill)
    .slice(0, 5);

  const weaknesses = skillMatches
    .filter(m => !m.found && m.priority !== 'low')
    .map(m => m.skill)
    .slice(0, 5);

  // Generate recommendation
  let recommendation = '';
  switch (candidateCategory.type) {
    case 'high_match':
      recommendation = 'Sterk aanbevolen voor de functie. Kandidaat toont uitstekende match met vereiste vaardigheden.';
      break;
    case 'good_communication':
      recommendation = 'Overweeg voor de functie met aanvullende technische training. Sterke communicatievaardigheden zijn waardevol.';
      break;
    case 'potential':
      recommendation = 'Mogelijk geschikt voor junior positie of met uitgebreid ontwikkelingsprogramma.';
      break;
    case 'underqualified':
      recommendation = 'Niet aanbevolen voor deze functie. Overweeg voor andere posities binnen de organisatie.';
      break;
  }

    // Enhanced return with NLP data
    return {
      candidateCategory,
      skillMatches,
      overallScore,
      nlpScore,
      skillMatchScore,
      strengths: nlpAnalysis.overallAssessment.strengths,
      weaknesses: nlpAnalysis.overallAssessment.improvements,
      recommendation: nlpAnalysis.overallAssessment.recommendation,
      extractedSkills: Object.values(nlpAnalysis.skills.skills).flat().map(s => s.name),
      nlpAnalysis: {
        experience: nlpAnalysis.experience,
        education: nlpAnalysis.education,
        languages: nlpAnalysis.languages,
        skillCategories: nlpAnalysis.skills.skills,
        confidence: nlpAnalysis.metadata.confidence
      },
      communicationAnalysis,
      metadata: {
        analysisMethod: spacyAvailable ? 'spaCy Dutch NLP Enhanced' : 'Compromise NLP Enhanced',
        processingTime: nlpAnalysis.metadata.processingTime,
        confidence: nlpAnalysis.metadata.confidence,
        spacyEnhanced: spacyAvailable,
        nlpMethod: nlpAnalysis.metadata.processingMethod
      }
    };

  } catch (error) {
    console.error('Enhanced candidate analysis failed:', error);
    throw new Error(`Candidate analysis failed: ${error.message}. Please ensure all AI services are running and try again.`);
  }
};

const getRelatedTerms = (skill) => {
  const relatedTermsMap = {
    'sap tm': ['sap', 'transport management'],
    'portbase': ['port', 'haven'],
    'douaneformaliteiten': ['douane', 'customs'],
    'communicatievaardigheden': ['communicatie', 'contact', 'overleg'],
    'probleemoplossend denken': ['probleem', 'oplossen', 'analytisch'],
    'tijdsmanagement': ['planning', 'organisatie', 'tijd'],
    'internationale regelgeving': ['internationaal', 'regelgeving', 'wet'],
    'edi-integraties': ['edi', 'integratie', 'systeem'],
    'track & trace': ['track', 'trace', 'volgen'],
    'wms systemen': ['wms', 'warehouse', 'magazijn'],
    'maritieme logistiek': ['maritiem', 'logistiek', 'scheepvaart'],
    'stressbestendigheid': ['stress', 'druk', 'kalm'],
    'klantgerichtheid': ['klant', 'service', 'klantenservice'],
    'leiderschapsvaardigheden': ['leiderschap', 'leiden', 'management']
  };

  return relatedTermsMap[skill] || [];
};



/**
 * Enhanced audio communication analysis using advanced transcript analyzer
 */
const analyzeAudioCommunication = (audioTranscript, audioResult = null) => {
  if (!audioTranscript || audioTranscript.length < 50) {
    return {
      clarity: 0,
      confidence: 0,
      technicalCommunication: 0,
      fluency: 0,
      languageProficiency: 'unknown',
      communicationStyle: 'unknown',
      keyPoints: [],
      transcriptionMethod: 'none',
      isRealTranscription: false,
      personalityTraits: [],
      leadershipSkills: { leadershipScore: 0, problemSolvingScore: 0 },
      communicationInsights: [],
      overallCommunicationScore: 0
    };
  }

  // Get audio metadata
  const audioMetadata = audioResult?.metadata || null;
  const isRealTranscription = audioMetadata?.isRealTranscription || false;
  const transcriptionMethod = audioMetadata?.transcriptionMethod || 'mock';

  console.log('Enhanced audio communication analysis:', {
    transcriptLength: audioTranscript.length,
    isReal: isRealTranscription,
    method: transcriptionMethod,
    confidence: audioMetadata?.confidence
  });

  // Perform comprehensive communication analysis
  const communicationQuality = analyzeCommunicationQuality(audioTranscript, audioMetadata);

  // Extract personality traits
  const personalityAnalysis = extractPersonalityTraits(audioTranscript);

  // Analyze leadership and soft skills
  const leadershipAnalysis = analyzeLeadershipSkills(audioTranscript);

  // Extract key communication points (enhanced)
  const sentences = audioTranscript.split(/[.!?]+/).filter(s => s.trim().length > 20);
  const keyPoints = sentences.slice(0, 4).map(s => s.trim());

  // Determine language proficiency from Whisper metadata
  let languageProficiency = 'intermediate';
  if (audioMetadata?.language === 'nl' && isRealTranscription) {
    const confidence = Math.round(audioMetadata.confidence * 100);
    if (confidence >= 90) languageProficiency = 'native';
    else if (confidence >= 80) languageProficiency = 'fluent';
    else if (confidence >= 70) languageProficiency = 'intermediate';
    else languageProficiency = 'basic';
  }

  // Combine all insights
  const allInsights = [
    ...communicationQuality.insights,
    ...personalityAnalysis.insights,
    ...leadershipAnalysis.insights
  ];

  // Calculate overall communication score
  const overallCommunicationScore = Math.round(
    (communicationQuality.overallScore +
     personalityAnalysis.confidence +
     ((leadershipAnalysis.leadershipScore + leadershipAnalysis.problemSolvingScore) / 2)) / 3
  );

  return {
    // Basic communication metrics
    clarity: communicationQuality.clarity,
    confidence: communicationQuality.confidence,
    technicalCommunication: communicationQuality.technicalCommunication,
    fluency: communicationQuality.fluency,

    // Enhanced analysis results
    overallCommunicationScore,
    personalityTraits: personalityAnalysis.traits,
    leadershipSkills: {
      leadershipScore: leadershipAnalysis.leadershipScore,
      problemSolvingScore: leadershipAnalysis.problemSolvingScore
    },

    // Communication insights and metadata
    communicationInsights: allInsights,
    keyPoints,
    languageProficiency,
    communicationStyle: isRealTranscription ? 'analyzed' : 'simulated',

    // Technical metadata
    transcriptionMethod,
    isRealTranscription,
    whisperConfidence: audioMetadata?.confidence || null,
    audioMetadata,

    // Analysis metadata
    analysisMetadata: {
      ...communicationQuality.metadata,
      personalityConfidence: personalityAnalysis.confidence,
      analysisTimestamp: new Date().toISOString(),
      enhancedAnalysis: true
    }
  };
};


