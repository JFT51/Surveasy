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
const IS_DEMO_MODE = SPACY_SERVICE_URL === null;

/**
 * spaCy service client for advanced Dutch NLP operations
 */
export class SpacyService {
  constructor(baseUrl = SPACY_SERVICE_URL) {
    this.baseUrl = baseUrl;
    this.isAvailable = false;
    this.serviceInfo = null;
    this.isDemoMode = IS_DEMO_MODE;
  }

  /**
   * Check if spaCy service is available
   */
  async checkAvailability() {
    // If in demo mode (Netlify deployment), return false immediately
    if (this.isDemoMode) {
      console.log('Running in demo mode - spaCy service disabled');
      this.serviceInfo = {
        status: "demo",
        message: "Running in demo mode on Netlify",
        spacy_available: false,
        model_loaded: false,
        demo_mode: true
      };
      this.isAvailable = false;
      return false;
    }

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
    if (this.isDemoMode) {
      console.log('Demo mode: Using fallback NLP analysis');
      return this.getDemoAnalysis(text);
    }

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
    if (this.isDemoMode) {
      console.log('Demo mode: Using fallback skills extraction');
      return this.getDemoSkills(text);
    }

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
   * Get demo analysis for when spaCy service is not available
   */
  getDemoAnalysis(text) {
    const words = text.split(/\s+/).filter(word => word.length > 0);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);

    return {
      entities: {
        persons: [],
        organizations: [],
        locations: [],
        dates: [],
        money: [],
        other: []
      },
      skills: this.getDemoSkills(text),
      syntax: {
        pos_distribution: { NOUN: 25, VERB: 15, ADJ: 10, ADV: 5 },
        dependency_distribution: { ROOT: 5, nsubj: 8, dobj: 6 },
        sentence_count: sentences.length,
        token_count: words.length,
        complexity_score: 0.6
      },
      key_phrases: [
        { text: "software ontwikkeling", type: "noun_chunk", start: 0, end: 20 },
        { text: "projectmanagement", type: "technical_term", start: 25, end: 42 }
      ],
      sentiment: {
        score: 0.7,
        positive_indicators: 3,
        negative_indicators: 1,
        overall: "positive"
      },
      experience: [],
      education: [],
      statistics: {
        character_count: text.length,
        word_count: words.length,
        sentence_count: sentences.length,
        average_words_per_sentence: sentences.length > 0 ? Math.round(words.length / sentences.length) : 0,
        unique_words: Math.round(words.length * 0.7),
        lexical_diversity: 0.7
      },
      processing_info: {
        model: "demo",
        language: "nl",
        timestamp: new Date().toISOString(),
        text_length: text.length,
        tokens: words.length,
        sentences: sentences.length,
        demo_mode: true
      }
    };
  }

  /**
   * Get demo skills for when spaCy service is not available
   */
  getDemoSkills(text) {
    const lowerText = text.toLowerCase();
    const demoSkills = {
      programming_languages: [],
      frameworks: [],
      databases: [],
      cloud_platforms: [],
      tools: [],
      methodologies: [],
      soft_skills: [],
      languages: []
    };

    // Simple keyword matching for demo
    const skillKeywords = {
      programming_languages: ['javascript', 'python', 'java', 'react', 'vue'],
      frameworks: ['react', 'vue', 'angular', 'django', 'flask'],
      databases: ['mysql', 'postgresql', 'mongodb'],
      cloud_platforms: ['aws', 'azure', 'google cloud'],
      tools: ['git', 'docker', 'jenkins'],
      methodologies: ['agile', 'scrum', 'devops'],
      soft_skills: ['communicatie', 'teamwork', 'leiderschap'],
      languages: ['nederlands', 'engels', 'duits']
    };

    Object.entries(skillKeywords).forEach(([category, keywords]) => {
      keywords.forEach(keyword => {
        if (lowerText.includes(keyword)) {
          demoSkills[category].push({
            name: keyword,
            confidence: 0.8,
            start: lowerText.indexOf(keyword),
            end: lowerText.indexOf(keyword) + keyword.length,
            context: `Demo context for ${keyword}`,
            demo_mode: true
          });
        }
      });
    });

    return demoSkills;
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
