/**
 * Advanced Text Analytics Service
 * Provides enhanced text analysis capabilities including readability, complexity, and semantic analysis
 */

class AdvancedAnalyticsService {
  constructor() {
    this.isAvailable = true;
  }

  /**
   * Perform comprehensive text analysis
   * @param {string} text - Text to analyze
   * @returns {Object} - Analysis results
   */
  analyzeText(text) {
    if (!text || text.trim().length === 0) {
      return this.getEmptyAnalysis();
    }

    const cleanText = text.trim();
    
    return {
      readability: this.analyzeReadability(cleanText),
      complexity: this.analyzeComplexity(cleanText),
      semantics: this.analyzeSemantics(cleanText),
      structure: this.analyzeStructure(cleanText),
      keywords: this.extractKeywords(cleanText),
      topics: this.extractTopics(cleanText),
      metadata: {
        textLength: cleanText.length,
        analysisTimestamp: new Date().toISOString(),
        analysisMethod: 'Advanced Text Analytics'
      }
    };
  }

  /**
   * Analyze text readability
   * @param {string} text - Text to analyze
   * @returns {Object} - Readability metrics
   */
  analyzeReadability(text) {
    const sentences = this.getSentences(text);
    const words = this.getWords(text);
    const syllables = this.countSyllables(text);

    // Flesch Reading Ease Score (adapted for Dutch)
    const avgSentenceLength = words.length / sentences.length;
    const avgSyllablesPerWord = syllables / words.length;
    const fleschScore = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);

    // Readability level
    let readabilityLevel;
    if (fleschScore >= 90) readabilityLevel = 'zeer_makkelijk';
    else if (fleschScore >= 80) readabilityLevel = 'makkelijk';
    else if (fleschScore >= 70) readabilityLevel = 'redelijk_makkelijk';
    else if (fleschScore >= 60) readabilityLevel = 'standaard';
    else if (fleschScore >= 50) readabilityLevel = 'redelijk_moeilijk';
    else if (fleschScore >= 30) readabilityLevel = 'moeilijk';
    else readabilityLevel = 'zeer_moeilijk';

    return {
      fleschScore: Math.max(0, Math.min(100, fleschScore)),
      readabilityLevel,
      avgSentenceLength,
      avgSyllablesPerWord,
      totalSentences: sentences.length,
      totalWords: words.length,
      totalSyllables: syllables
    };
  }

  /**
   * Analyze text complexity
   * @param {string} text - Text to analyze
   * @returns {Object} - Complexity metrics
   */
  analyzeComplexity(text) {
    const words = this.getWords(text);
    const sentences = this.getSentences(text);
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);

    // Lexical diversity (Type-Token Ratio)
    const uniqueWords = new Set(words.map(w => w.toLowerCase()));
    const lexicalDiversity = uniqueWords.size / words.length;

    // Complex words (3+ syllables)
    const complexWords = words.filter(word => this.countWordSyllables(word) >= 3);
    const complexWordRatio = complexWords.length / words.length;

    // Average word length
    const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;

    // Sentence complexity
    const sentenceLengths = sentences.map(s => this.getWords(s).length);
    const sentenceComplexity = sentenceLengths.reduce((sum, len) => sum + len, 0) / sentenceLengths.length;

    // Overall complexity score (0-100)
    const complexityScore = Math.min(100, Math.round(
      (lexicalDiversity * 30) +
      (complexWordRatio * 25) +
      (Math.min(avgWordLength / 10, 1) * 25) +
      (Math.min(sentenceComplexity / 30, 1) * 20)
    ));

    return {
      complexityScore,
      lexicalDiversity: Math.round(lexicalDiversity * 100) / 100,
      complexWordRatio: Math.round(complexWordRatio * 100) / 100,
      avgWordLength: Math.round(avgWordLength * 10) / 10,
      sentenceComplexity: Math.round(sentenceComplexity * 10) / 10,
      uniqueWords: uniqueWords.size,
      totalWords: words.length,
      complexWords: complexWords.length,
      paragraphs: paragraphs.length
    };
  }

  /**
   * Analyze semantic content
   * @param {string} text - Text to analyze
   * @returns {Object} - Semantic analysis
   */
  analyzeSemantics(text) {
    const words = this.getWords(text);
    const lowerText = text.toLowerCase();

    // Professional domains detection
    const domains = {
      technical: ['technisch', 'software', 'programmeren', 'ontwikkeling', 'systeem', 'database', 'api', 'framework'],
      business: ['business', 'management', 'strategie', 'project', 'klant', 'verkoop', 'marketing'],
      creative: ['creatief', 'design', 'kunst', 'innovatie', 'concept', 'visueel'],
      analytical: ['analyse', 'data', 'onderzoek', 'statistiek', 'rapport', 'metrics'],
      communication: ['communicatie', 'presentatie', 'overleg', 'contact', 'samenwerking']
    };

    const domainScores = {};
    Object.keys(domains).forEach(domain => {
      const matches = domains[domain].filter(term => lowerText.includes(term)).length;
      domainScores[domain] = Math.round((matches / domains[domain].length) * 100);
    });

    // Sentiment indicators
    const positiveWords = ['goed', 'uitstekend', 'succesvol', 'positief', 'sterk', 'ervaren', 'expert', 'professioneel'];
    const negativeWords = ['slecht', 'zwak', 'probleem', 'moeilijk', 'beperkt', 'onervaren'];

    const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;

    const sentimentScore = positiveCount > 0 || negativeCount > 0 
      ? (positiveCount / (positiveCount + negativeCount)) * 100 
      : 50;

    return {
      domainScores,
      primaryDomain: Object.keys(domainScores).reduce((a, b) => domainScores[a] > domainScores[b] ? a : b),
      sentimentScore: Math.round(sentimentScore),
      positiveIndicators: positiveCount,
      negativeIndicators: negativeCount,
      professionalTone: this.assessProfessionalTone(text)
    };
  }

  /**
   * Analyze text structure
   * @param {string} text - Text to analyze
   * @returns {Object} - Structure analysis
   */
  analyzeStructure(text) {
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    const sentences = this.getSentences(text);
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);

    // Detect sections (headers, lists, etc.)
    const headers = lines.filter(line => 
      line.trim().length < 50 && 
      (line.includes(':') || line.match(/^[A-Z][A-Z\s]+$/))
    );

    const lists = lines.filter(line => 
      line.trim().match(/^[-•*]\s/) || 
      line.trim().match(/^\d+\.\s/)
    );

    const emails = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
    const phones = text.match(/[\+]?[\d\s\-\(\)]{10,}/g) || [];
    const urls = text.match(/https?:\/\/[^\s]+/g) || [];

    return {
      totalLines: lines.length,
      totalSentences: sentences.length,
      totalParagraphs: paragraphs.length,
      headers: headers.length,
      lists: lists.length,
      contactInfo: {
        emails: emails.length,
        phones: phones.length,
        urls: urls.length
      },
      avgParagraphLength: paragraphs.length > 0 
        ? Math.round(paragraphs.reduce((sum, p) => sum + p.length, 0) / paragraphs.length)
        : 0,
      structureScore: this.calculateStructureScore(headers.length, lists.length, paragraphs.length)
    };
  }

  /**
   * Extract keywords from text
   * @param {string} text - Text to analyze
   * @returns {Array} - Keywords with frequency
   */
  extractKeywords(text) {
    const words = this.getWords(text);
    const stopWords = new Set([
      'de', 'het', 'een', 'en', 'van', 'te', 'dat', 'die', 'in', 'voor', 'is', 'op', 'met', 'als', 'zijn',
      'er', 'maar', 'om', 'door', 'over', 'ze', 'bij', 'aan', 'uit', 'ook', 'tot', 'je', 'zijn', 'heeft'
    ]);

    // Count word frequencies
    const wordFreq = {};
    words.forEach(word => {
      const lowerWord = word.toLowerCase();
      if (lowerWord.length > 2 && !stopWords.has(lowerWord) && /^[a-zA-Z]+$/.test(lowerWord)) {
        wordFreq[lowerWord] = (wordFreq[lowerWord] || 0) + 1;
      }
    });

    // Sort by frequency and return top keywords
    return Object.entries(wordFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20)
      .map(([word, freq]) => ({
        word,
        frequency: freq,
        relevance: Math.min(100, Math.round((freq / words.length) * 1000))
      }));
  }

  /**
   * Extract topics from text
   * @param {string} text - Text to analyze
   * @returns {Array} - Detected topics
   */
  extractTopics(text) {
    const lowerText = text.toLowerCase();
    
    const topicPatterns = {
      'Software Development': ['software', 'programmeren', 'ontwikkeling', 'code', 'applicatie'],
      'Project Management': ['project', 'management', 'planning', 'coördinatie', 'leiding'],
      'Data Analysis': ['data', 'analyse', 'statistiek', 'rapport', 'onderzoek'],
      'Customer Service': ['klant', 'service', 'support', 'helpdesk', 'contact'],
      'Marketing': ['marketing', 'campagne', 'promotie', 'brand', 'communicatie'],
      'Sales': ['verkoop', 'sales', 'acquisitie', 'klantwerving', 'omzet'],
      'Education': ['onderwijs', 'training', 'opleiding', 'cursus', 'leren'],
      'Healthcare': ['zorg', 'medisch', 'gezondheid', 'patiënt', 'behandeling']
    };

    const detectedTopics = [];
    Object.entries(topicPatterns).forEach(([topic, keywords]) => {
      const matches = keywords.filter(keyword => lowerText.includes(keyword)).length;
      if (matches > 0) {
        detectedTopics.push({
          topic,
          relevance: Math.round((matches / keywords.length) * 100),
          matchedKeywords: keywords.filter(keyword => lowerText.includes(keyword))
        });
      }
    });

    return detectedTopics.sort((a, b) => b.relevance - a.relevance);
  }

  // Helper methods
  getSentences(text) {
    return text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  }

  getWords(text) {
    return text.match(/\b\w+\b/g) || [];
  }

  countSyllables(text) {
    const words = this.getWords(text);
    return words.reduce((total, word) => total + this.countWordSyllables(word), 0);
  }

  countWordSyllables(word) {
    // Simple syllable counting for Dutch
    const vowels = 'aeiouAEIOU';
    let count = 0;
    let prevWasVowel = false;
    
    for (let i = 0; i < word.length; i++) {
      const isVowel = vowels.includes(word[i]);
      if (isVowel && !prevWasVowel) {
        count++;
      }
      prevWasVowel = isVowel;
    }
    
    return Math.max(1, count);
  }

  assessProfessionalTone(text) {
    const professionalIndicators = ['ervaring', 'vaardigheden', 'competentie', 'professioneel', 'kwaliteit'];
    const informalIndicators = ['cool', 'awesome', 'super', 'geweldig'];
    
    const professionalCount = professionalIndicators.filter(word => text.toLowerCase().includes(word)).length;
    const informalCount = informalIndicators.filter(word => text.toLowerCase().includes(word)).length;
    
    if (professionalCount > informalCount) return 'professional';
    if (informalCount > professionalCount) return 'informal';
    return 'neutral';
  }

  calculateStructureScore(headers, lists, paragraphs) {
    // Score based on document structure organization
    let score = 0;
    if (headers > 0) score += 30;
    if (lists > 0) score += 20;
    if (paragraphs > 1) score += 25;
    if (paragraphs > 3) score += 25;
    return Math.min(100, score);
  }

  getEmptyAnalysis() {
    return {
      readability: { fleschScore: 0, readabilityLevel: 'unknown' },
      complexity: { complexityScore: 0 },
      semantics: { domainScores: {}, sentimentScore: 50 },
      structure: { structureScore: 0 },
      keywords: [],
      topics: [],
      metadata: { textLength: 0, analysisTimestamp: new Date().toISOString() }
    };
  }
}

// Create and export service instance
export const advancedAnalyticsService = new AdvancedAnalyticsService();

export default advancedAnalyticsService;
