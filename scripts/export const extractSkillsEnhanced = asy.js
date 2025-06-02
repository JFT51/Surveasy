export const extractSkillsEnhanced = async (text) => {
  try {
    // Try spaCy first for best accuracy
    const spacyAvailable = await spacyService.checkAvailability();
    if (spacyAvailable) {
      return await extractSkillsWithSpacy(text);
    }
    
    // Fallback to compromise
    return extractSkillsWithCompromise(text);
  } catch (error) {
    console.error('Skill extraction error:', error);
    throw error;
  }
};

export const analyzeCandidate = async (cvText, audioTranscript, desiredSkills, audioResult) => {
  try {
    // Extract skills using consolidated method
    const skillsAnalysis = await extractSkillsEnhanced(cvText);

    // Process audio if real transcription available
    const communicationAnalysis = audioResult?.metadata?.isRealTranscription 
      ? analyzeAudioCommunication(audioTranscript, audioResult)
      : null;

    // Calculate skill matches without duplicates
    const skillMatches = desiredSkills.map(desiredSkill => {
      const allExtractedSkills = Object.values(skillsAnalysis.skills).flat();
      const match = findBestSkillMatch(desiredSkill, allExtractedSkills);
      return {
        skill: desiredSkill.name,
        priority: desiredSkill.priority,
        found: match.found,
        confidence: match.confidence,
        source: match.source
      };
    });

    return {
      skills: skillsAnalysis,
      skillMatches,
      communicationAnalysis,
      metadata: {
        isRealAnalysis: true,
        processingTime: new Date().toISOString(),
        confidence: calculateOverallConfidence(skillsAnalysis)
      }
    };
  } catch (error) {
    console.error('Analysis error:', error);
    throw error;
  }
};

const ProcessingStep = () => {
  // Remove dataQuality mock notification
  const handleAnalysisComplete = () => {
    success('AI analyse succesvol voltooid!', {
      title: 'Analyse Voltooid',
      duration: 4000
    });
    
    // Navigate to results
    setTimeout(() => navigate('/results'), 1000);
  };
};