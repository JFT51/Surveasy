/**
 * Enhanced Skill Confidence Scoring Service
 * Provides advanced confidence scoring for skills based on context, experience, and evidence
 */

class SkillConfidenceService {
  constructor() {
    this.isAvailable = true;
    this.confidenceFactors = {
      contextRelevance: 0.3,
      experienceLevel: 0.25,
      evidenceStrength: 0.25,
      frequencyMention: 0.2
    };
  }

  /**
   * Calculate enhanced confidence score for a skill
   * @param {Object} skill - Skill object with context
   * @param {string} fullText - Full text for context analysis
   * @param {Object} experienceData - Experience level data
   * @returns {Object} - Enhanced confidence analysis
   */
  calculateEnhancedConfidence(skill, fullText, experienceData = {}) {
    const baseConfidence = skill.confidence || 0.5;
    
    const factors = {
      contextRelevance: this.analyzeContextRelevance(skill, fullText),
      experienceLevel: this.analyzeExperienceLevel(skill, experienceData),
      evidenceStrength: this.analyzeEvidenceStrength(skill, fullText),
      frequencyMention: this.analyzeFrequencyMention(skill, fullText)
    };

    // Calculate weighted confidence score
    const enhancedConfidence = Object.entries(factors).reduce((total, [factor, score]) => {
      return total + (score * this.confidenceFactors[factor]);
    }, 0);

    // Combine with base confidence
    const finalConfidence = Math.min(1.0, Math.max(0.1, 
      (baseConfidence * 0.4) + (enhancedConfidence * 0.6)
    ));

    return {
      originalConfidence: baseConfidence,
      enhancedConfidence: finalConfidence,
      confidenceIncrease: finalConfidence - baseConfidence,
      factors,
      analysis: this.generateConfidenceAnalysis(factors, finalConfidence),
      metadata: {
        calculatedAt: new Date().toISOString(),
        method: 'Enhanced Skill Confidence Scoring',
        factorWeights: this.confidenceFactors
      }
    };
  }

  /**
   * Analyze context relevance of skill mention
   * @param {Object} skill - Skill object
   * @param {string} text - Full text
   * @returns {number} - Context relevance score (0-1)
   */
  analyzeContextRelevance(skill, text) {
    const skillName = skill.skill.toLowerCase();
    const textLower = text.toLowerCase();
    
    // Find skill mentions and analyze surrounding context
    const skillIndex = textLower.indexOf(skillName);
    if (skillIndex === -1) return 0.3; // Default if not found directly

    // Extract context around skill mention (±50 characters)
    const contextStart = Math.max(0, skillIndex - 50);
    const contextEnd = Math.min(text.length, skillIndex + skillName.length + 50);
    const context = textLower.substring(contextStart, contextEnd);

    // Positive context indicators
    const positiveIndicators = [
      'ervaring', 'expert', 'specialist', 'professioneel', 'uitstekend',
      'goed', 'sterk', 'bekwaam', 'vaardig', 'competent', 'jaren',
      'project', 'ontwikkeld', 'gebouwd', 'geïmplementeerd', 'geleid'
    ];

    // Negative context indicators
    const negativeIndicators = [
      'basis', 'beginnend', 'leren', 'interesse', 'kennis van',
      'beperkt', 'weinig', 'geen', 'niet'
    ];

    const positiveCount = positiveIndicators.filter(indicator => 
      context.includes(indicator)
    ).length;

    const negativeCount = negativeIndicators.filter(indicator => 
      context.includes(indicator)
    ).length;

    // Calculate relevance score
    if (positiveCount > negativeCount) {
      return Math.min(1.0, 0.6 + (positiveCount * 0.1));
    } else if (negativeCount > positiveCount) {
      return Math.max(0.2, 0.5 - (negativeCount * 0.1));
    }

    return 0.5; // Neutral context
  }

  /**
   * Analyze experience level indicators
   * @param {Object} skill - Skill object
   * @param {Object} experienceData - Experience data
   * @returns {number} - Experience level score (0-1)
   */
  analyzeExperienceLevel(skill, experienceData) {
    const skillName = skill.skill.toLowerCase();
    
    // Check if skill appears in experience sections
    const experienceScore = experienceData.totalYears || 0;
    
    // Years of experience mapping
    if (experienceScore >= 5) return 0.9;
    if (experienceScore >= 3) return 0.7;
    if (experienceScore >= 1) return 0.5;
    
    // Check skill category for experience inference
    const seniorSkills = ['architect', 'lead', 'senior', 'manager', 'director'];
    const isSeniorSkill = seniorSkills.some(senior => skillName.includes(senior));
    
    if (isSeniorSkill) return 0.8;
    
    return 0.4; // Default for skills without clear experience indicators
  }

  /**
   * Analyze evidence strength for skill claims
   * @param {Object} skill - Skill object
   * @param {string} text - Full text
   * @returns {number} - Evidence strength score (0-1)
   */
  analyzeEvidenceStrength(skill, text) {
    const skillName = skill.skill.toLowerCase();
    const textLower = text.toLowerCase();
    
    // Evidence indicators
    const strongEvidence = [
      'certificaat', 'diploma', 'cursus', 'training', 'project',
      'gebouwd', 'ontwikkeld', 'geïmplementeerd', 'geleid', 'beheerd',
      'resultaat', 'succes', 'prestatie', 'award', 'prijs'
    ];

    const mediumEvidence = [
      'ervaring', 'gewerkt', 'gebruikt', 'toegepast', 'kennis',
      'vaardigheid', 'competentie', 'bekwaam'
    ];

    const weakEvidence = [
      'interesse', 'hobby', 'persoonlijk', 'zelfstandig', 'geleerd'
    ];

    // Count evidence types
    const strongCount = strongEvidence.filter(evidence => 
      textLower.includes(evidence)
    ).length;

    const mediumCount = mediumEvidence.filter(evidence => 
      textLower.includes(evidence)
    ).length;

    const weakCount = weakEvidence.filter(evidence => 
      textLower.includes(evidence)
    ).length;

    // Calculate evidence score
    const evidenceScore = (strongCount * 0.8) + (mediumCount * 0.5) + (weakCount * 0.2);
    
    return Math.min(1.0, evidenceScore / 3); // Normalize to 0-1
  }

  /**
   * Analyze frequency of skill mentions
   * @param {Object} skill - Skill object
   * @param {string} text - Full text
   * @returns {number} - Frequency score (0-1)
   */
  analyzeFrequencyMention(skill, text) {
    const skillName = skill.skill.toLowerCase();
    const textLower = text.toLowerCase();
    
    // Count direct mentions
    const directMentions = (textLower.match(new RegExp(skillName, 'g')) || []).length;
    
    // Count related terms
    const relatedTerms = this.getRelatedTerms(skillName);
    const relatedMentions = relatedTerms.reduce((count, term) => {
      return count + (textLower.match(new RegExp(term, 'g')) || []).length;
    }, 0);

    const totalMentions = directMentions + (relatedMentions * 0.5);
    
    // Frequency scoring
    if (totalMentions >= 5) return 1.0;
    if (totalMentions >= 3) return 0.8;
    if (totalMentions >= 2) return 0.6;
    if (totalMentions >= 1) return 0.4;
    
    return 0.2; // Minimal mention
  }

  /**
   * Get related terms for a skill
   * @param {string} skillName - Skill name
   * @returns {Array} - Related terms
   */
  getRelatedTerms(skillName) {
    const relatedTermsMap = {
      'javascript': ['js', 'node', 'react', 'vue', 'angular'],
      'python': ['django', 'flask', 'pandas', 'numpy'],
      'java': ['spring', 'hibernate', 'maven', 'gradle'],
      'react': ['jsx', 'redux', 'hooks', 'component'],
      'vue': ['vuex', 'nuxt', 'composition'],
      'angular': ['typescript', 'rxjs', 'ngrx'],
      'css': ['sass', 'scss', 'less', 'bootstrap'],
      'html': ['html5', 'semantic', 'markup'],
      'sql': ['mysql', 'postgresql', 'database', 'query'],
      'git': ['github', 'gitlab', 'version control', 'repository'],
      'docker': ['container', 'kubernetes', 'devops'],
      'aws': ['cloud', 'ec2', 's3', 'lambda'],
      'project management': ['scrum', 'agile', 'kanban', 'jira']
    };

    return relatedTermsMap[skillName] || [];
  }

  /**
   * Generate confidence analysis explanation
   * @param {Object} factors - Analysis factors
   * @param {number} finalConfidence - Final confidence score
   * @returns {Object} - Analysis explanation
   */
  generateConfidenceAnalysis(factors, finalConfidence) {
    const analysis = {
      level: this.getConfidenceLevel(finalConfidence),
      strengths: [],
      weaknesses: [],
      recommendations: []
    };

    // Analyze strengths
    Object.entries(factors).forEach(([factor, score]) => {
      if (score >= 0.7) {
        analysis.strengths.push(this.getFactorDescription(factor, 'high'));
      } else if (score <= 0.3) {
        analysis.weaknesses.push(this.getFactorDescription(factor, 'low'));
      }
    });

    // Generate recommendations
    if (finalConfidence < 0.5) {
      analysis.recommendations.push('Voeg meer specifieke voorbeelden toe van projecten waar deze vaardigheid is gebruikt');
      analysis.recommendations.push('Vermeld certificeringen of trainingen gerelateerd aan deze vaardigheid');
    } else if (finalConfidence < 0.7) {
      analysis.recommendations.push('Beschrijf concrete resultaten behaald met deze vaardigheid');
    }

    return analysis;
  }

  /**
   * Get confidence level description
   * @param {number} confidence - Confidence score
   * @returns {string} - Confidence level
   */
  getConfidenceLevel(confidence) {
    if (confidence >= 0.8) return 'zeer_hoog';
    if (confidence >= 0.6) return 'hoog';
    if (confidence >= 0.4) return 'gemiddeld';
    if (confidence >= 0.2) return 'laag';
    return 'zeer_laag';
  }

  /**
   * Get factor description
   * @param {string} factor - Factor name
   * @param {string} level - Level (high/low)
   * @returns {string} - Factor description
   */
  getFactorDescription(factor, level) {
    const descriptions = {
      contextRelevance: {
        high: 'Vaardigheid wordt genoemd in sterke professionele context',
        low: 'Vaardigheid mist duidelijke professionele context'
      },
      experienceLevel: {
        high: 'Duidelijke ervaring en senioriteit aangetoond',
        low: 'Beperkte ervaring of beginnend niveau'
      },
      evidenceStrength: {
        high: 'Sterke bewijzen zoals projecten en certificeringen',
        low: 'Weinig concrete bewijzen voor vaardigheid'
      },
      frequencyMention: {
        high: 'Vaardigheid wordt frequent genoemd',
        low: 'Vaardigheid wordt zelden genoemd'
      }
    };

    return descriptions[factor]?.[level] || `${factor}: ${level}`;
  }

  /**
   * Batch process skills for enhanced confidence
   * @param {Array} skills - Array of skills
   * @param {string} fullText - Full text
   * @param {Object} experienceData - Experience data
   * @returns {Array} - Enhanced skills with confidence
   */
  enhanceSkillsConfidence(skills, fullText, experienceData = {}) {
    return skills.map(skill => ({
      ...skill,
      enhancedConfidence: this.calculateEnhancedConfidence(skill, fullText, experienceData)
    }));
  }
}

// Create and export service instance
export const skillConfidenceService = new SkillConfidenceService();

export default skillConfidenceService;
