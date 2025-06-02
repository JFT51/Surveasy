import nlp from 'compromise';
import { spacyService, formatSpacyResult } from './spacyService.js';

/**
 * Advanced NLP Processing for CV Analysis
 * Provides sophisticated text analysis, entity extraction, and skill matching
 * Enhanced with spaCy Dutch NLP for superior analysis
 */

// Dutch language mappings and patterns
const DUTCH_SKILL_PATTERNS = {
  // Programming languages
  programming: [
    'javascript', 'python', 'java', 'c#', 'php', 'ruby', 'go', 'rust', 'swift', 'kotlin',
    'typescript', 'scala', 'perl', 'r', 'matlab', 'sql', 'html', 'css', 'sass', 'less'
  ],

  // Frameworks and libraries
  frameworks: [
    'react', 'vue', 'angular', 'node.js', 'express', 'django', 'flask', 'spring', 'laravel',
    'symfony', 'rails', 'asp.net', 'jquery', 'bootstrap', 'tailwind', 'next.js', 'nuxt.js'
  ],

  // Tools and technologies
  tools: [
    'git', 'docker', 'kubernetes', 'jenkins', 'gitlab', 'github', 'jira', 'confluence',
    'slack', 'teams', 'figma', 'sketch', 'photoshop', 'illustrator', 'indesign'
  ],

  // Cloud and infrastructure
  cloud: [
    'aws', 'azure', 'google cloud', 'gcp', 'heroku', 'digitalocean', 'cloudflare',
    'terraform', 'ansible', 'chef', 'puppet', 'vagrant'
  ],

  // Databases
  databases: [
    'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'cassandra',
    'oracle', 'sqlite', 'mariadb', 'dynamodb', 'firebase'
  ],

  // Soft skills (Dutch)
  softSkills: [
    'communicatie', 'teamwork', 'leiderschap', 'probleemoplossing', 'analytisch',
    'creativiteit', 'flexibiliteit', 'stressbestendig', 'klantgericht', 'zelfstandig',
    'nauwkeurig', 'betrouwbaar', 'initiatiefrijk', 'resultaatgericht', 'samenwerking'
  ],

  // Methodologies
  methodologies: [
    'agile', 'scrum', 'kanban', 'waterfall', 'devops', 'ci/cd', 'tdd', 'bdd',
    'lean', 'six sigma', 'prince2', 'itil', 'safe'
  ]
};

// Dutch stopwords and common words to filter
const DUTCH_STOPWORDS = [
  'de', 'het', 'een', 'en', 'van', 'te', 'dat', 'die', 'in', 'voor', 'op', 'met', 'als',
  'zijn', 'er', 'maar', 'om', 'door', 'over', 'ze', 'uit', 'aan', 'bij', 'nog', 'kan',
  'jaar', 'jaren', 'maanden', 'ervaring', 'kennis', 'vaardigheden', 'competenties',
  'heeft', 'hebben', 'had', 'was', 'waren', 'is', 'wordt', 'worden', 'werd', 'werden',
  'deze', 'dit', 'die', 'dat', 'zo', 'ook', 'naar', 'toe', 'dan', 'wel', 'niet', 'geen'
];

// English stopwords
const ENGLISH_STOPWORDS = [
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
  'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after', 'above',
  'below', 'between', 'among', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should'
];

/**
 * Remove stopwords from text array
 */
const removeCustomStopwords = (words, language = 'dutch') => {
  const stopwords = language === 'dutch' ? DUTCH_STOPWORDS : ENGLISH_STOPWORDS;
  return words.filter(word =>
    word.length > 2 &&
    !stopwords.includes(word.toLowerCase()) &&
    !/^\d+$/.test(word) // Remove pure numbers
  );
};

/**
 * Simple stemming function for Dutch words
 * Removes common suffixes to find word roots
 */
const simpleStem = (word) => {
  const dutchSuffixes = ['en', 'er', 'ing', 'heid', 'lijk', 'baar', 'ig', 'isch'];
  let stemmed = word.toLowerCase();

  for (const suffix of dutchSuffixes) {
    if (stemmed.endsWith(suffix) && stemmed.length > suffix.length + 2) {
      stemmed = stemmed.slice(0, -suffix.length);
      break;
    }
  }

  return stemmed;
};

/**
 * Extract and analyze skills from CV text using enhanced NLP
 * @param {string} text - The CV text to analyze
 * @returns {Object} - Analyzed skills with categories and confidence scores
 */
export const extractSkillsNLP = async (text) => {
  try {
    console.log('Starting enhanced NLP skills extraction...');
    console.log('Input text length:', text.length);

    // Check if spaCy service is available
    const spacyAvailable = await spacyService.checkAvailability();

    if (spacyAvailable) {
      console.log('Using spaCy Dutch NLP for advanced analysis');
      return await extractSkillsWithSpacy(text);
    } else {
      console.log('spaCy not available, using compromise fallback');
      return extractSkillsWithCompromise(text);
    }

  } catch (error) {
    console.error('Enhanced NLP skills extraction error:', error);
    throw new Error(`NLP skills extraction failed: ${error.message}. Please ensure the NLP services are available.`);
  }
};

/**
 * Extract skills using spaCy Dutch NLP service
 */
const extractSkillsWithSpacy = async (text) => {
  try {
    // Get comprehensive analysis from spaCy
    const spacyResult = await spacyService.analyzeText(text);
    const formattedResult = formatSpacyResult(spacyResult);

    // Convert spaCy skills format to our expected format
    const skillsWithConfidence = convertSpacySkills(formattedResult.skills);

    // Extract experience levels using spaCy entities and analysis
    const experienceLevels = extractExperienceLevelsFromSpacy(spacyResult);

    console.log('spaCy NLP skills extraction completed');
    console.log('Total skills found:', Object.values(skillsWithConfidence).flat().length);
    console.log('Skills by category:', Object.keys(skillsWithConfidence).map(cat =>
      `${cat}: ${skillsWithConfidence[cat].length}`
    ).join(', '));

    return {
      skills: skillsWithConfidence,
      experienceLevels,
      entities: formattedResult.entities,
      spacyAnalysis: formattedResult, // Include full spaCy analysis
      metadata: {
        totalSkillsFound: Object.values(skillsWithConfidence).flat().length,
        textLength: text.length,
        processingMethod: 'spaCy Dutch NLP',
        confidence: formattedResult.metadata.confidence,
        sentiment: formattedResult.sentiment,
        complexity: spacyResult.syntax.complexity_score
      }
    };

  } catch (error) {
    console.error('spaCy skills extraction error:', error);
    throw error;
  }
};

/**
 * Extract skills using compromise (fallback method)
 */
const extractSkillsWithCompromise = (text) => {
  // Normalize and clean text
  const cleanText = normalizeText(text);
  console.log('Normalized text length:', cleanText.length);

  // Use compromise for basic NLP analysis
  const doc = nlp(cleanText);

  // Extract different types of entities
  const entities = {
    nouns: doc.nouns().out('array'),
    verbs: doc.verbs().out('array'),
    adjectives: doc.adjectives().out('array'),
    organizations: doc.organizations().out('array'),
    places: doc.places().out('array')
  };

  // Extract skills by category
  const extractedSkills = {
    technical: extractTechnicalSkills(cleanText, entities),
    soft: extractSoftSkills(cleanText, entities),
    tools: extractTools(cleanText, entities),
    languages: extractProgrammingLanguages(cleanText, entities),
    frameworks: extractFrameworks(cleanText, entities),
    methodologies: extractMethodologies(cleanText, entities)
  };

  // Calculate confidence scores
  const skillsWithConfidence = calculateConfidenceScores(extractedSkills, cleanText);

  // Extract experience levels
  const experienceLevels = extractExperienceLevels(cleanText, skillsWithConfidence);

  console.log('Compromise NLP skills extraction completed');
  console.log('Total skills found:', Object.values(skillsWithConfidence).flat().length);

  return {
    skills: skillsWithConfidence,
    experienceLevels,
    entities,
    metadata: {
      totalSkillsFound: Object.values(skillsWithConfidence).flat().length,
      textLength: cleanText.length,
      processingMethod: 'Compromise NLP',
      confidence: calculateOverallConfidence(skillsWithConfidence)
    }
  };
};

/**
 * Normalize text for better NLP processing
 */
const normalizeText = (text) => {
  // Basic normalization
  const normalized = text
    .toLowerCase()
    .replace(/[^\w\s\-\.]/g, ' ') // Remove special characters except hyphens and dots
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();

  return normalized;
};

/**
 * Advanced text preprocessing with stopword removal
 */
const preprocessText = (text, removeStops = false) => {
  const normalized = normalizeText(text);

  if (!removeStops) {
    return normalized;
  }

  // Split into words and remove stopwords
  const words = normalized.split(' ');
  const filteredWords = removeCustomStopwords(words, 'dutch');

  return filteredWords.join(' ');
};

/**
 * Extract technical skills using pattern matching and context analysis
 */
const extractTechnicalSkills = (text, entities) => {
  const technicalSkills = new Set();

  // Combine all technical skill categories
  const allTechnicalSkills = [
    ...DUTCH_SKILL_PATTERNS.programming,
    ...DUTCH_SKILL_PATTERNS.frameworks,
    ...DUTCH_SKILL_PATTERNS.tools,
    ...DUTCH_SKILL_PATTERNS.cloud,
    ...DUTCH_SKILL_PATTERNS.databases
  ];

  // Find skills with context
  allTechnicalSkills.forEach(skill => {
    const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    if (regex.test(text)) {
      technicalSkills.add(skill);
    }
  });

  // Also check in extracted nouns
  entities.nouns.forEach(noun => {
    if (allTechnicalSkills.some(skill =>
      skill.toLowerCase().includes(noun.toLowerCase()) ||
      noun.toLowerCase().includes(skill.toLowerCase())
    )) {
      technicalSkills.add(noun);
    }
  });

  return Array.from(technicalSkills);
};

/**
 * Extract soft skills using Dutch patterns and context
 */
const extractSoftSkills = (text, entities) => {
  const softSkills = new Set();

  DUTCH_SKILL_PATTERNS.softSkills.forEach(skill => {
    const regex = new RegExp(`\\b${skill}\\b`, 'gi');
    if (regex.test(text)) {
      softSkills.add(skill);
    }
  });

  // Check adjectives for soft skills
  entities.adjectives.forEach(adj => {
    if (DUTCH_SKILL_PATTERNS.softSkills.some(skill =>
      skill.toLowerCase().includes(adj.toLowerCase())
    )) {
      softSkills.add(adj);
    }
  });

  return Array.from(softSkills);
};

/**
 * Extract tools and software
 */
const extractTools = (text, entities) => {
  const tools = new Set();

  DUTCH_SKILL_PATTERNS.tools.forEach(tool => {
    const regex = new RegExp(`\\b${tool.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    if (regex.test(text)) {
      tools.add(tool);
    }
  });

  return Array.from(tools);
};

/**
 * Extract programming languages
 */
const extractProgrammingLanguages = (text, entities) => {
  const languages = new Set();

  DUTCH_SKILL_PATTERNS.programming.forEach(lang => {
    const regex = new RegExp(`\\b${lang.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    if (regex.test(text)) {
      languages.add(lang);
    }
  });

  return Array.from(languages);
};

/**
 * Extract frameworks and libraries
 */
const extractFrameworks = (text, entities) => {
  const frameworks = new Set();

  DUTCH_SKILL_PATTERNS.frameworks.forEach(framework => {
    const regex = new RegExp(`\\b${framework.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    if (regex.test(text)) {
      frameworks.add(framework);
    }
  });

  return Array.from(frameworks);
};

/**
 * Extract methodologies and practices
 */
const extractMethodologies = (text, entities) => {
  const methodologies = new Set();

  DUTCH_SKILL_PATTERNS.methodologies.forEach(methodology => {
    const regex = new RegExp(`\\b${methodology.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    if (regex.test(text)) {
      methodologies.add(methodology);
    }
  });

  return Array.from(methodologies);
};

/**
 * Calculate confidence scores for extracted skills
 */
const calculateConfidenceScores = (skills, text) => {
  const skillsWithConfidence = {};

  Object.keys(skills).forEach(category => {
    skillsWithConfidence[category] = skills[category].map(skill => {
      const confidence = calculateSkillConfidence(skill, text);
      return {
        name: skill,
        confidence: confidence,
        category: category
      };
    });
  });

  return skillsWithConfidence;
};

/**
 * Calculate confidence score for a specific skill
 */
const calculateSkillConfidence = (skill, text) => {
  const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
  const matches = text.match(regex) || [];
  const frequency = matches.length;

  // Base confidence on frequency and context
  let confidence = Math.min(0.5 + (frequency * 0.2), 1.0);

  // Boost confidence for skills mentioned with experience indicators
  const experiencePatterns = [
    'jaar', 'jaren', 'maanden', 'ervaring', 'kennis', 'expert', 'gevorderd', 'basis'
  ];

  experiencePatterns.forEach(pattern => {
    const contextRegex = new RegExp(`${skill}.*${pattern}|${pattern}.*${skill}`, 'gi');
    if (contextRegex.test(text)) {
      confidence = Math.min(confidence + 0.2, 1.0);
    }
  });

  return Math.round(confidence * 100) / 100;
};

/**
 * Extract experience levels for skills
 */
const extractExperienceLevels = (text, skills) => {
  const experienceLevels = {};

  Object.values(skills).flat().forEach(skillObj => {
    const skill = skillObj.name;
    const level = determineExperienceLevel(skill, text);
    if (level) {
      experienceLevels[skill] = level;
    }
  });

  return experienceLevels;
};

/**
 * Determine experience level for a skill
 */
const determineExperienceLevel = (skill, text) => {
  const skillRegex = new RegExp(`${skill}`, 'gi');
  const skillContext = text.match(new RegExp(`.{0,50}${skill}.{0,50}`, 'gi'));

  if (!skillContext) return null;

  const context = skillContext.join(' ').toLowerCase();

  // Expert level indicators
  if (/expert|senior|lead|architect|specialist|gevorderd|uitgebreid/.test(context)) {
    return 'expert';
  }

  // Intermediate level indicators
  if (/ervaring|kennis|competent|vaardig|intermediate/.test(context)) {
    return 'intermediate';
  }

  // Beginner level indicators
  if (/basis|beginner|starter|junior|beginnend/.test(context)) {
    return 'beginner';
  }

  // Check for years of experience
  const yearMatch = context.match(/(\d+)\s*(jaar|jaren)/);
  if (yearMatch) {
    const years = parseInt(yearMatch[1]);
    if (years >= 5) return 'expert';
    if (years >= 2) return 'intermediate';
    return 'beginner';
  }

  return 'intermediate'; // Default
};

/**
 * Calculate overall confidence score
 */
const calculateOverallConfidence = (skills) => {
  const allSkills = Object.values(skills).flat();
  if (allSkills.length === 0) return 0;

  const totalConfidence = allSkills.reduce((sum, skill) => sum + skill.confidence, 0);
  return Math.round((totalConfidence / allSkills.length) * 100) / 100;
};



/**
 * Convert spaCy skills format to our expected format
 */
const convertSpacySkills = (spacySkills) => {
  const convertedSkills = {
    technical: [],
    soft: [],
    tools: [],
    languages: [],
    frameworks: [],
    methodologies: []
  };

  // Map spaCy categories to our categories
  const categoryMapping = {
    programming_languages: 'languages',
    frameworks: 'frameworks',
    databases: 'technical',
    cloud_platforms: 'technical',
    tools: 'tools',
    methodologies: 'methodologies',
    soft_skills: 'soft',
    languages: 'soft' // Human languages go to soft skills
  };

  Object.entries(spacySkills).forEach(([spacyCategory, skills]) => {
    const ourCategory = categoryMapping[spacyCategory] || 'technical';

    skills.forEach(skill => {
      convertedSkills[ourCategory].push({
        name: skill.name,
        confidence: skill.confidence,
        category: ourCategory,
        source: 'spaCy',
        context: skill.context,
        position: skill.position
      });
    });
  });

  return convertedSkills;
};

/**
 * Extract experience levels from spaCy analysis
 */
const extractExperienceLevelsFromSpacy = (spacyResult) => {
  const experienceLevels = {};

  // Use spaCy's experience extraction
  if (spacyResult.experience && spacyResult.experience.length > 0) {
    spacyResult.experience.forEach(exp => {
      if (exp.type === 'duration') {
        // Extract years from experience text
        const yearMatch = exp.text.match(/(\d+)\s*(jaar|jaren)/);
        if (yearMatch) {
          const years = parseInt(yearMatch[1]);
          experienceLevels['general'] = years;
        }
      }
    });
  }

  return experienceLevels;
};

/**
 * Enhanced skill extraction with spaCy integration
 * @param {string} text - Text to analyze
 * @returns {Object} - Enhanced skills analysis
 */
export const extractSkillsEnhanced = async (text) => {
  try {
    // Get comprehensive analysis from spaCy first if available
    const spacyAvailable = await spacyService.checkAvailability();
    if (spacyAvailable) {
      console.log('Using spaCy Dutch NLP for advanced analysis');
      const spacyResult = await spacyService.analyzeText(text);
      const formattedResult = formatSpacyResult(spacyResult);
      
      // Convert spaCy skills format to our expected format
      const skillsWithConfidence = convertSpacySkills(formattedResult.skills);
      
      // Extract experience levels using spaCy
      const experienceLevels = extractExperienceLevelsFromSpacy(spacyResult);
      
      return {
        skills: skillsWithConfidence,
        experienceLevels,
        entities: formattedResult.entities,
        spacyAnalysis: formattedResult,
        metadata: {
          processingMethod: 'spaCy Dutch NLP',
          totalSkillsFound: Object.values(skillsWithConfidence).flat().length,
          confidence: formattedResult.metadata.confidence
        }
      };
    }
    
    // Fallback to basic NLP analysis
    console.log('spaCy not available, using basic NLP');
    const basicSkills = await extractBasicSkills(text);
    return {
      ...basicSkills,
      metadata: {
        ...basicSkills.metadata,
        processingMethod: 'Basic NLP',
        isBasicAnalysis: true
      }
    };
  } catch (error) {
    console.error('Skill extraction error:', error);
    throw error;
  }
};

// Move from compromise to more accurate basic analysis
const extractBasicSkills = async (text) => {
  const normalizedText = normalizeText(text);
  const doc = nlp(normalizedText);
  
  const entities = {
    nouns: doc.nouns().out('array'),
    verbs: doc.verbs().out('array'),
    adjectives: doc.adjectives().out('array')
  };

  // Extract skills by category without duplicates
  const extractedSkills = {
    technical: new Set(extractTechnicalSkills(normalizedText, entities)),
    soft: new Set(extractSoftSkills(normalizedText, entities)),
    tools: new Set(extractTools(normalizedText, entities)),
    languages: new Set(extractProgrammingLanguages(normalizedText, entities)),
    frameworks: new Set(extractFrameworks(normalizedText, entities)),
    methodologies: new Set(extractMethodologies(normalizedText, entities))
  };

  // Convert sets to arrays with confidence scores
  const skillsWithConfidence = {};
  Object.entries(extractedSkills).forEach(([category, skillSet]) => {
    skillsWithConfidence[category] = Array.from(skillSet).map(skill => ({
      name: skill,
      confidence: calculateSkillConfidence(skill, normalizedText),
      category
    }));
  });

  return {
    skills: skillsWithConfidence,
    experienceLevels: extractExperienceLevels(normalizedText, skillsWithConfidence),
    entities,
    metadata: {
      totalSkillsFound: Object.values(skillsWithConfidence).flat().length,
      confidence: calculateOverallConfidence(skillsWithConfidence)
    }
  };
};
