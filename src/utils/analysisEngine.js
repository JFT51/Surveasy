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
import { ocrService } from './ocrService.js';
import { advancedAnalyticsService } from './advancedAnalyticsService.js';
import { skillConfidenceService } from './skillConfidenceService.js';

export const processCVText = async (file) => {
  try {
    let extractionResult;
    let processingMethod = 'PDF.js';

    // Check if file is an image (for OCR processing)
    const imageFormats = ['image/jpeg', 'image/png', 'image/bmp', 'image/tiff'];

    if (imageFormats.includes(file.type)) {
      console.log('Processing image file with OCR...');
      processingMethod = 'OCR';

      // Check OCR availability
      const ocrAvailable = await ocrService.checkAvailability();
      if (!ocrAvailable) {
        throw new Error('OCR service not available for image processing');
      }

      // Process with OCR
      extractionResult = await ocrService.processScannedDocument(file);

      if (!extractionResult.success) {
        throw new Error(extractionResult.error || 'Failed to extract text from image using OCR');
      }

    } else {
      // Extract text from PDF using PDF.js
      extractionResult = await extractTextFromPDF(file);

      if (!extractionResult.success) {
        // If PDF.js fails and text is very short, try OCR as fallback
        if (extractionResult.text && extractionResult.text.length < 100) {
          console.log('PDF text extraction yielded minimal text, attempting OCR fallback...');
          try {
            const ocrAvailable = await ocrService.checkAvailability();
            if (ocrAvailable) {
              const ocrResult = await ocrService.processScannedDocument(file);
              if (ocrResult.success && ocrResult.extractedText.length > extractionResult.text.length) {
                extractionResult = ocrResult;
                processingMethod = 'OCR (Fallback)';
              }
            }
          } catch (ocrError) {
            console.warn('OCR fallback failed:', ocrError);
          }
        }

        if (!extractionResult.success) {
          throw new Error(extractionResult.error || 'Failed to extract text from PDF');
        }
      }
    }

    // Parse the extracted text into structured CV data
    const parsedCV = parseCV(extractionResult.extractedText || extractionResult.text);

    return {
      success: true,
      extractedText: extractionResult.extractedText || extractionResult.text,
      parsedData: parsedCV,
      metadata: {
        fileName: file.name,
        fileSize: file.size,
        pageCount: extractionResult.metadata?.totalPages || 1,
        wordCount: extractionResult.metadata?.wordCount || 0,
        characterCount: extractionResult.metadata?.characterCount || 0,
        processingTime: 'Real-time',
        extractedAt: extractionResult.metadata?.extractedAt || new Date().toISOString(),
        sections: Object.keys(parsedCV.sections),
        processingMethod,
        isPDFExtraction: processingMethod.includes('PDF'),
        isOCRExtraction: processingMethod.includes('OCR'),
        ocrConfidence: extractionResult.confidence || null
      }
    };

  } catch (error) {
    console.error('CV processing error:', error);
    throw new Error(`Failed to process CV: ${error.message}. Please ensure the file is valid and try again.`);
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



export const analyzeCandidate = async (cvText, audioTranscript, desiredSkills, audioResult) => {
  try {
    // Extract skills using consolidated enhanced method
    const skillsAnalysis = await extractSkillsEnhanced(cvText);

    // Process audio only if real transcription is available
    const communicationAnalysis = audioResult?.metadata?.isRealTranscription 
      ? analyzeAudioCommunication(audioTranscript, audioResult)
      : null;

    // Calculate skill matches without duplicates using a Map for uniqueness
    const skillMatchMap = new Map();
    desiredSkills.forEach(desiredSkill => {
      const skillName = desiredSkill.name.toLowerCase();
      const allExtractedSkills = Object.values(skillsAnalysis.skills).flat();
      
      // Find best match based on highest confidence
      let bestMatch = { found: false, confidence: 0, source: [] };
      allExtractedSkills.forEach(extractedSkill => {
        if (extractedSkill.name.toLowerCase().includes(skillName) ||
            skillName.includes(extractedSkill.name.toLowerCase())) {
          if (extractedSkill.confidence > bestMatch.confidence) {
            bestMatch = {
              found: true,
              confidence: extractedSkill.confidence,
              source: [extractedSkill.category]
            };
          }
        }
      });
      
      skillMatchMap.set(skillName, {
        skill: desiredSkill.name,
        priority: desiredSkill.priority,
        ...bestMatch
      });
    });

    return {
      skills: skillsAnalysis.skills,
      skillMatches: Array.from(skillMatchMap.values()),
      communicationAnalysis,
      metadata: {
        isRealAnalysis: true,
        processingTime: new Date().toISOString(),
        confidence: skillsAnalysis.metadata.confidence,
        processingMethod: skillsAnalysis.metadata.processingMethod,
        totalSkillsFound: skillsAnalysis.metadata.totalSkillsFound
      }
    };
  } catch (error) {
    console.error('Analysis error:', error);
    throw error;
  }
};


