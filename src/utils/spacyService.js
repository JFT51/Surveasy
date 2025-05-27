/**
 * spaCy Dutch NLP Service Integration
 * Connects React frontend to Python spaCy backend for advanced Dutch NLP processing
 */

// spaCy service configuration
const getSpacyServiceUrl = () => {
  // Try to get from environment variables (Vite)
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    const envUrl = import.meta.env.VITE_SPACY_SERVICE_URL;

    // If empty string in production (Netlify), return null to indicate demo mode
    if (envUrl === '') {
      return null;
    }

    return envUrl || 'http://localhost:5001';
  }

  // Fallback to default
  return 'http://localhost:5001';
};

const SPACY_SERVICE_URL = getSpacyServiceUrl();

/**
 * spaCy service client for advanced Dutch NLP operations
 */
export class SpacyService {
  constructor(baseUrl = SPACY_SERVICE_URL) {
    this.baseUrl = baseUrl;
    this.isAvailable = false;
    this.serviceInfo = null;
  }

  /**
   * Check if spaCy service is available
   */
  async checkAvailability() {

    try {
      console.log('Checking spaCy service availability...');
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        this.serviceInfo = await response.json();
        this.isAvailable = this.serviceInfo.model_loaded;
        console.log('spaCy service status:', this.serviceInfo);
        return this.isAvailable;
      } else {
        console.warn('spaCy service health check failed:', response.status);
        this.isAvailable = false;
        return false;
      }
    } catch (error) {
      console.warn('spaCy service not available:', error.message);
      this.isAvailable = false;
      this.serviceInfo = {
        status: "unavailable",
        error: error.message,
        spacy_available: false,
        model_loaded: false
      };
      return false;
    }
  }

  /**
   * Analyze text using spaCy Dutch NLP
   * @param {string} text - Text to analyze
   * @returns {Promise<Object>} - Comprehensive NLP analysis results
   */
  async analyzeText(text) {
    if (!this.isAvailable) {
      throw new Error('spaCy service is not available');
    }

    try {
      console.log('Analyzing text with spaCy...', {
        textLength: text.length,
        service: 'spaCy Dutch NLP'
      });

      const response = await fetch(`${this.baseUrl}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      const result = await response.json();

      if (result.success) {
        console.log('spaCy analysis completed:', result.result);
        return result.result;
      } else {
        console.error('spaCy analysis failed:', result.error);
        throw new Error(result.error || 'spaCy analysis failed');
      }
    } catch (error) {
      console.error('spaCy analysis error:', error);
      throw error;
    }
  }

  /**
   * Extract skills from text using spaCy
   * @param {string} text - Text to analyze
   * @returns {Promise<Object>} - Extracted skills by category
   */
  async extractSkills(text) {
    if (!this.isAvailable) {
      throw new Error('spaCy service is not available');
    }

    try {
      console.log('Extracting skills with spaCy...');

      const response = await fetch(`${this.baseUrl}/skills`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      const result = await response.json();

      if (result.success) {
        console.log('spaCy skills extraction completed:', result.skills);
        return result.skills;
      } else {
        console.error('spaCy skills extraction failed:', result.error);
        throw new Error(result.error || 'Skills extraction failed');
      }
    } catch (error) {
      console.error('spaCy skills extraction error:', error);
      throw error;
    }
  }

  /**
   * Analyze text using spaCy Dutch NLP
   * @param {string} text - Text to analyze
   * @returns {Promise<Object>} - Complete analysis results
   */
  async analyzeText(text) {
    if (!this.isAvailable) {
      throw new Error('spaCy service is not available');
    }

    try {
      console.log('Analyzing text with spaCy...');

      const response = await fetch(`${this.baseUrl}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      const result = await response.json();

      if (result.success) {
        console.log('spaCy text analysis completed');
        return result;
      } else {
        console.error('spaCy text analysis failed:', result.error);
        throw new Error(result.error || 'Text analysis failed');
      }
    } catch (error) {
      console.error('spaCy text analysis error:', error);
      throw error;
    }
  }

  /**
   * Format spaCy analysis results for use in the application
   */
  formatAnalysisResult(spacyResult) {
    if (!spacyResult) return null;

    return {
      // Enhanced skills with spaCy analysis
      skills: this.formatSkills(spacyResult.skills),

      // Named entities
      entities: spacyResult.entities,

      // Text statistics
      statistics: spacyResult.statistics,

      // Sentiment analysis
      sentiment: spacyResult.sentiment,

      // Key phrases and technical terms
      keyPhrases: spacyResult.key_phrases,

      // Syntax analysis
      syntax: spacyResult.syntax,

      // Experience and education
      experience: spacyResult.experience,
      education: spacyResult.education,

      // Processing metadata
      metadata: {
        ...spacyResult.processing_info,
        analysisMethod: 'spaCy Dutch NLP',
        confidence: this.calculateOverallConfidence(spacyResult)
      }
    };
  }

  /**
   * Format skills from spaCy analysis
   */
  formatSkills(spacySkills) {
    const formattedSkills = {};

    Object.entries(spacySkills).forEach(([category, skills]) => {
      formattedSkills[category] = skills.map(skill => ({
        name: skill.name,
        confidence: skill.confidence,
        category: category,
        context: skill.context,
        source: 'spaCy',
        position: {
          start: skill.start,
          end: skill.end
        }
      }));
    });

    return formattedSkills;
  }

  /**
   * Calculate overall confidence score for the analysis
   */
  calculateOverallConfidence(spacyResult) {
    const skillsCount = Object.values(spacyResult.skills).flat().length;
    const entitiesCount = Object.values(spacyResult.entities).flat().length;
    const complexityScore = spacyResult.syntax.complexity_score;

    // Base confidence on amount of extracted information
    let confidence = 0.5;

    if (skillsCount > 5) confidence += 0.2;
    if (entitiesCount > 3) confidence += 0.1;
    if (complexityScore > 0.5) confidence += 0.1;
    if (spacyResult.statistics.word_count > 100) confidence += 0.1;

    return Math.min(confidence, 1.0);
  }
}

// Create and export service instance
export const spacyService = new SpacyService();

// Export utility functions
export const formatSpacyResult = (result) => {
  return spacyService.formatAnalysisResult(result);
};

export const isSpacyAvailable = async () => {
  return await spacyService.checkAvailability();
};

export default spacyService;
