import nlp from 'compromise';
import { extractSkillsNLP, extractSkillsEnhanced } from './nlpProcessor.js';
import { spacyService } from './spacyService.js';

/**
 * Advanced CV Analysis using NLP
 * Provides comprehensive analysis of CV content including experience, education, and skills
 */

/**
 * Analyze complete CV using enhanced NLP techniques
 * @param {string} cvText - The extracted CV text
 * @param {Array} requiredSkills - Skills required for the position
 * @returns {Object} - Comprehensive CV analysis
 */
export const analyzeCVWithNLP = async (cvText, requiredSkills = []) => {
  try {
    console.log('Starting comprehensive CV analysis with enhanced NLP...');

    // Extract skills using enhanced NLP (spaCy + compromise)
    const skillsAnalysis = await extractSkillsEnhanced(cvText);

    // Analyze work experience (enhanced with spaCy if available)
    const experienceAnalysis = await analyzeWorkExperienceEnhanced(cvText, skillsAnalysis.spacyAnalysis);

    // Analyze education (enhanced with spaCy if available)
    const educationAnalysis = await analyzeEducationEnhanced(cvText, skillsAnalysis.spacyAnalysis);

    // Extract personal information (enhanced with spaCy entities)
    const personalInfo = await extractPersonalInfoEnhanced(cvText, skillsAnalysis.spacyAnalysis);

    // Analyze language proficiency
    const languageAnalysis = analyzeLanguages(cvText);

    // Calculate skill matching score
    const skillMatching = calculateSkillMatching(skillsAnalysis.skills, requiredSkills);

    // Generate overall assessment
    const overallAssessment = generateOverallAssessment({
      skills: skillsAnalysis,
      experience: experienceAnalysis,
      education: educationAnalysis,
      skillMatching
    });

    console.log('CV analysis completed successfully');

    return {
      personalInfo,
      skills: skillsAnalysis,
      experience: experienceAnalysis,
      education: educationAnalysis,
      languages: languageAnalysis,
      skillMatching,
      overallAssessment,
      metadata: {
        analysisMethod: 'NLP',
        processingTime: new Date().toISOString(),
        textLength: cvText.length,
        confidence: calculateAnalysisConfidence({
          skills: skillsAnalysis,
          experience: experienceAnalysis,
          education: educationAnalysis
        })
      }
    };

  } catch (error) {
    console.error('CV analysis error:', error);

    // Fallback to basic analysis
    return analyzeCVFallback(cvText, requiredSkills);
  }
};

/**
 * Analyze work experience using NLP
 */
const analyzeWorkExperience = (text) => {
  const doc = nlp(text);

  // Find experience-related sections
  const experienceKeywords = [
    'werkervaring', 'ervaring', 'experience', 'werk', 'functie', 'position', 'job',
    'baan', 'carrière', 'loopbaan', 'professional'
  ];

  const experiences = [];
  const lines = text.split('\n');
  let inExperienceSection = false;
  let currentExperience = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const lowerLine = line.toLowerCase();

    // Check if we're entering experience section
    if (experienceKeywords.some(keyword => lowerLine.includes(keyword))) {
      inExperienceSection = true;
      continue;
    }

    // Stop if we hit another major section
    if (lowerLine.includes('opleiding') || lowerLine.includes('education') ||
        lowerLine.includes('vaardigheden') || lowerLine.includes('skills')) {
      inExperienceSection = false;
      if (currentExperience) {
        experiences.push(currentExperience);
        currentExperience = null;
      }
    }

    if (inExperienceSection && line.length > 10) {
      // Try to extract job information
      const jobInfo = extractJobInfo(line, lines.slice(i, i + 3));
      if (jobInfo) {
        if (currentExperience) {
          experiences.push(currentExperience);
        }
        currentExperience = jobInfo;
      } else if (currentExperience) {
        // Add to current experience description
        currentExperience.description += ' ' + line;
      }
    }
  }

  if (currentExperience) {
    experiences.push(currentExperience);
  }

  // Calculate total experience
  const totalExperience = calculateTotalExperience(text, experiences);

  // Extract key achievements
  const achievements = extractAchievements(text);

  return {
    positions: experiences,
    totalYears: totalExperience,
    achievements,
    seniority: determineSeniority(totalExperience, experiences),
    industries: extractIndustries(text)
  };
};

/**
 * Extract job information from text line
 */
const extractJobInfo = (line, context) => {
  // Common patterns for job titles and companies
  const jobPatterns = [
    /(.+?)\s+(?:bij|at|@)\s+(.+)/i,
    /(.+?)\s+-\s+(.+)/i,
    /(.+?)\s+\|\s+(.+)/i
  ];

  for (const pattern of jobPatterns) {
    const match = line.match(pattern);
    if (match) {
      const title = match[1].trim();
      const company = match[2].trim();

      // Extract dates if available
      const dates = extractDates(context.join(' '));

      return {
        title,
        company,
        dates,
        description: '',
        duration: calculateDuration(dates)
      };
    }
  }

  return null;
};

/**
 * Extract dates from text
 */
const extractDates = (text) => {
  const datePatterns = [
    /(\d{4})\s*-\s*(\d{4})/g,
    /(\d{4})\s*-\s*(heden|present|nu)/gi,
    /(jan|feb|mrt|apr|mei|jun|jul|aug|sep|okt|nov|dec)\s+(\d{4})/gi
  ];

  const dates = [];

  datePatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      dates.push(match[0]);
    }
  });

  return dates;
};

/**
 * Calculate duration from dates
 */
const calculateDuration = (dates) => {
  if (!dates || dates.length === 0) return null;

  // Simple duration calculation
  const yearMatches = dates.join(' ').match(/\d{4}/g);
  if (yearMatches && yearMatches.length >= 2) {
    const startYear = parseInt(yearMatches[0]);
    const endYear = yearMatches[1] === 'heden' ? new Date().getFullYear() : parseInt(yearMatches[1]);
    return endYear - startYear;
  }

  return null;
};

/**
 * Calculate total work experience
 */
const calculateTotalExperience = (text, experiences) => {
  // Look for explicit experience mentions
  const experiencePatterns = [
    /(\d+)\s*(?:\+)?\s*(?:jaar|jaren|year|years)/gi,
    /(\d+)\s*(?:\+)?\s*(?:maanden|months)/gi
  ];

  let totalYears = 0;

  experiencePatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(match => {
        const number = parseInt(match.match(/\d+/)[0]);
        if (match.toLowerCase().includes('jaar') || match.toLowerCase().includes('year')) {
          totalYears = Math.max(totalYears, number);
        } else if (match.toLowerCase().includes('maand') || match.toLowerCase().includes('month')) {
          totalYears = Math.max(totalYears, Math.floor(number / 12));
        }
      });
    }
  });

  // If no explicit mention, calculate from positions
  if (totalYears === 0 && experiences.length > 0) {
    totalYears = experiences.reduce((sum, exp) => sum + (exp.duration || 1), 0);
  }

  return totalYears;
};

/**
 * Determine seniority level
 */
const determineSeniority = (totalYears, experiences) => {
  if (totalYears >= 8) return 'Senior';
  if (totalYears >= 4) return 'Medior';
  if (totalYears >= 1) return 'Junior';
  return 'Starter';
};

/**
 * Extract achievements and accomplishments
 */
const extractAchievements = (text) => {
  const achievementKeywords = [
    'behaald', 'gerealiseerd', 'verbeterd', 'geoptimaliseerd', 'geleid', 'ontwikkeld',
    'geïmplementeerd', 'achieved', 'improved', 'led', 'developed', 'implemented'
  ];

  const achievements = [];
  const sentences = text.split(/[.!?]+/);

  sentences.forEach(sentence => {
    const lowerSentence = sentence.toLowerCase();
    if (achievementKeywords.some(keyword => lowerSentence.includes(keyword))) {
      achievements.push(sentence.trim());
    }
  });

  return achievements.slice(0, 5); // Limit to top 5
};

/**
 * Extract industries from CV text
 */
const extractIndustries = (text) => {
  const industries = [
    'technologie', 'finance', 'healthcare', 'education', 'retail', 'manufacturing',
    'consulting', 'media', 'telecommunications', 'automotive', 'aerospace',
    'fintech', 'e-commerce', 'gaming', 'startup'
  ];

  const foundIndustries = [];
  const lowerText = text.toLowerCase();

  industries.forEach(industry => {
    if (lowerText.includes(industry)) {
      foundIndustries.push(industry);
    }
  });

  return foundIndustries;
};

/**
 * Extract personal information from CV text
 */
const extractPersonalInfo = (text) => {
  const personalInfo = {
    name: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    github: ''
  };

  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);

  // Extract name (usually first non-empty line or line with capital letters)
  for (const line of lines.slice(0, 5)) {
    if (line.length > 2 && line.length < 50 && /^[A-Z][a-z]+\s+[A-Z][a-z]+/.test(line)) {
      personalInfo.name = line;
      break;
    }
  }

  // Extract email
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) {
    personalInfo.email = emailMatch[0];
  }

  // Extract phone number
  const phonePatterns = [
    /(\+31|0031|0)\s*[1-9]\s*\d{8}/g,  // Dutch phone numbers
    /(\+\d{1,3}[-.\s]?)?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}/g  // International
  ];

  for (const pattern of phonePatterns) {
    const phoneMatch = text.match(pattern);
    if (phoneMatch) {
      personalInfo.phone = phoneMatch[0];
      break;
    }
  }

  // Extract location (cities in Netherlands)
  const dutchCities = [
    'amsterdam', 'rotterdam', 'den haag', 'utrecht', 'eindhoven', 'tilburg',
    'groningen', 'almere', 'breda', 'nijmegen', 'enschede', 'haarlem',
    'arnhem', 'zaanstad', 'amersfoort', 'apeldoorn', 'den bosch', 'hoofddorp',
    'maastricht', 'leiden', 'dordrecht', 'zoetermeer', 'zwolle', 'deventer'
  ];

  const lowerText = text.toLowerCase();
  for (const city of dutchCities) {
    if (lowerText.includes(city)) {
      personalInfo.location = city.charAt(0).toUpperCase() + city.slice(1);
      break;
    }
  }

  // Extract LinkedIn
  const linkedinMatch = text.match(/linkedin\.com\/in\/[a-zA-Z0-9-]+/i);
  if (linkedinMatch) {
    personalInfo.linkedin = linkedinMatch[0];
  }

  // Extract GitHub
  const githubMatch = text.match(/github\.com\/[a-zA-Z0-9-]+/i);
  if (githubMatch) {
    personalInfo.github = githubMatch[0];
  }

  return personalInfo;
};

/**
 * Analyze education background
 */
const analyzeEducation = (text) => {
  const educationKeywords = [
    'opleiding', 'onderwijs', 'education', 'studie', 'universiteit', 'hogeschool',
    'school', 'diploma', 'certificaat', 'degree', 'bachelor', 'master', 'phd'
  ];

  const educationEntries = [];
  const lines = text.split('\n');
  let inEducationSection = false;

  for (const line of lines) {
    const lowerLine = line.toLowerCase();

    if (educationKeywords.some(keyword => lowerLine.includes(keyword))) {
      inEducationSection = true;

      // Try to extract education info
      const educationInfo = extractEducationInfo(line);
      if (educationInfo) {
        educationEntries.push(educationInfo);
      }
    } else if (inEducationSection && line.trim().length > 10) {
      const educationInfo = extractEducationInfo(line);
      if (educationInfo) {
        educationEntries.push(educationInfo);
      }
    }
  }

  return {
    entries: educationEntries,
    highestLevel: determineEducationLevel(educationEntries),
    relevantToTech: assessTechRelevance(educationEntries)
  };
};

/**
 * Extract education information
 */
const extractEducationInfo = (line) => {
  const degreePatterns = [
    /(bachelor|master|phd|hbo|wo|mbo)\s+(.+)/i,
    /(.+?)\s+-\s+(.+)/i
  ];

  for (const pattern of degreePatterns) {
    const match = line.match(pattern);
    if (match) {
      return {
        degree: match[1].trim(),
        field: match[2].trim(),
        institution: extractInstitution(line)
      };
    }
  }

  return null;
};

/**
 * Extract institution name
 */
const extractInstitution = (line) => {
  const institutions = [
    'universiteit', 'hogeschool', 'university', 'college', 'school',
    'tu delft', 'uva', 'vu', 'erasmus', 'tilburg', 'groningen'
  ];

  const lowerLine = line.toLowerCase();
  for (const institution of institutions) {
    if (lowerLine.includes(institution)) {
      return institution;
    }
  }

  return null;
};

/**
 * Determine highest education level
 */
const determineEducationLevel = (entries) => {
  const levels = ['mbo', 'hbo', 'bachelor', 'master', 'phd'];
  let highestLevel = 'unknown';

  entries.forEach(entry => {
    const degree = entry.degree.toLowerCase();
    levels.forEach(level => {
      if (degree.includes(level)) {
        if (levels.indexOf(level) > levels.indexOf(highestLevel)) {
          highestLevel = level;
        }
      }
    });
  });

  return highestLevel;
};

/**
 * Assess tech relevance of education
 */
const assessTechRelevance = (entries) => {
  const techFields = [
    'informatica', 'computer', 'software', 'techniek', 'engineering',
    'mathematics', 'physics', 'data science', 'artificial intelligence'
  ];

  return entries.some(entry =>
    techFields.some(field =>
      entry.field.toLowerCase().includes(field) ||
      entry.degree.toLowerCase().includes(field)
    )
  );
};

/**
 * Analyze language proficiency
 */
const analyzeLanguages = (text) => {
  const languages = {
    'nederlands': ['nederlands', 'dutch', 'nl'],
    'english': ['english', 'engels', 'en'],
    'german': ['german', 'duits', 'deutsch', 'de'],
    'french': ['french', 'frans', 'français', 'fr'],
    'spanish': ['spanish', 'spaans', 'español', 'es']
  };

  const proficiencyLevels = {
    'native': ['moedertaal', 'native', 'mother tongue'],
    'fluent': ['vloeiend', 'fluent', 'vlot'],
    'advanced': ['gevorderd', 'advanced', 'goed'],
    'intermediate': ['gemiddeld', 'intermediate', 'basis'],
    'basic': ['basis', 'basic', 'elementair']
  };

  const foundLanguages = {};
  const lowerText = text.toLowerCase();

  Object.keys(languages).forEach(lang => {
    languages[lang].forEach(variant => {
      if (lowerText.includes(variant)) {
        // Try to find proficiency level
        const context = extractLanguageContext(text, variant);
        const proficiency = determineProficiency(context, proficiencyLevels);

        foundLanguages[lang] = {
          proficiency: proficiency || 'intermediate',
          context: context
        };
      }
    });
  });

  return foundLanguages;
};

/**
 * Extract context around language mention
 */
const extractLanguageContext = (text, language) => {
  const regex = new RegExp(`.{0,30}${language}.{0,30}`, 'gi');
  const matches = text.match(regex);
  return matches ? matches.join(' ') : '';
};

/**
 * Determine language proficiency from context
 */
const determineProficiency = (context, proficiencyLevels) => {
  const lowerContext = context.toLowerCase();

  for (const [level, indicators] of Object.entries(proficiencyLevels)) {
    if (indicators.some(indicator => lowerContext.includes(indicator))) {
      return level;
    }
  }

  return null;
};

/**
 * Calculate skill matching score
 */
const calculateSkillMatching = (extractedSkills, requiredSkills) => {
  if (!requiredSkills || requiredSkills.length === 0) {
    return { score: 0, matches: [], missing: [] };
  }

  const allExtractedSkills = Object.values(extractedSkills.skills).flat().map(s => s.name.toLowerCase());
  const requiredSkillsLower = requiredSkills.map(s => s.name.toLowerCase());

  const matches = [];
  const missing = [];

  requiredSkillsLower.forEach(required => {
    const match = allExtractedSkills.find(extracted =>
      extracted.includes(required) || required.includes(extracted)
    );

    if (match) {
      matches.push(required);
    } else {
      missing.push(required);
    }
  });

  const score = Math.round((matches.length / requiredSkills.length) * 100);

  return { score, matches, missing };
};

/**
 * Generate overall assessment
 */
const generateOverallAssessment = ({ skills, experience, education, skillMatching }) => {
  const assessment = {
    overallScore: 0,
    strengths: [],
    improvements: [],
    recommendation: ''
  };

  // Calculate overall score
  let scoreComponents = [];

  // Skills score (40%)
  const skillsScore = Math.min(skills.metadata.totalSkillsFound * 10, 100);
  scoreComponents.push(skillsScore * 0.4);

  // Experience score (35%)
  const experienceScore = Math.min(experience.totalYears * 15, 100);
  scoreComponents.push(experienceScore * 0.35);

  // Education score (15%)
  const educationScore = education.relevantToTech ? 80 : 60;
  scoreComponents.push(educationScore * 0.15);

  // Skill matching score (10%)
  scoreComponents.push(skillMatching.score * 0.1);

  assessment.overallScore = Math.round(scoreComponents.reduce((sum, score) => sum + score, 0));

  // Determine strengths
  if (skills.metadata.totalSkillsFound > 10) {
    assessment.strengths.push('Uitgebreide technische vaardigheden');
  }
  if (experience.totalYears > 5) {
    assessment.strengths.push('Ruime werkervaring');
  }
  if (education.relevantToTech) {
    assessment.strengths.push('Relevante technische opleiding');
  }

  // Determine improvements
  if (skillMatching.missing.length > 0) {
    assessment.improvements.push(`Ontbrekende vaardigheden: ${skillMatching.missing.slice(0, 3).join(', ')}`);
  }
  if (experience.totalYears < 2) {
    assessment.improvements.push('Beperkte werkervaring');
  }

  // Generate recommendation
  if (assessment.overallScore >= 80) {
    assessment.recommendation = 'Sterke kandidaat met uitstekende match';
  } else if (assessment.overallScore >= 60) {
    assessment.recommendation = 'Goede kandidaat met potentieel';
  } else {
    assessment.recommendation = 'Kandidaat heeft ontwikkeling nodig';
  }

  return assessment;
};

/**
 * Calculate analysis confidence
 */
const calculateAnalysisConfidence = ({ skills, experience, education }) => {
  let confidence = 0;

  // Skills confidence
  confidence += skills.metadata.confidence * 0.4;

  // Experience confidence (based on detail level)
  const experienceConfidence = experience.positions.length > 0 ? 0.8 : 0.4;
  confidence += experienceConfidence * 0.35;

  // Education confidence
  const educationConfidence = education.entries.length > 0 ? 0.8 : 0.5;
  confidence += educationConfidence * 0.25;

  return Math.round(confidence * 100) / 100;
};

/**
 * Fallback CV analysis
 */
const analyzeCVFallback = (cvText, requiredSkills) => {
  console.log('Using fallback CV analysis...');

  return {
    personalInfo: { name: 'Unknown', email: '', phone: '' },
    skills: { skills: { technical: [], soft: [], tools: [], languages: [], frameworks: [], methodologies: [] } },
    experience: { positions: [], totalYears: 0, achievements: [], seniority: 'Unknown', industries: [] },
    education: { entries: [], highestLevel: 'unknown', relevantToTech: false },
    languages: {},
    skillMatching: { score: 0, matches: [], missing: requiredSkills || [] },
    overallAssessment: {
      overallScore: 0,
      strengths: [],
      improvements: ['NLP analysis niet beschikbaar'],
      recommendation: 'Handmatige beoordeling vereist'
    },
    metadata: {
      analysisMethod: 'Fallback',
      processingTime: new Date().toISOString(),
      textLength: cvText.length,
      confidence: 0.3
    }
  };
};

/**
 * Enhanced work experience analysis using spaCy
 */
const analyzeWorkExperienceEnhanced = async (text, spacyAnalysis) => {
  // Start with basic analysis
  const basicAnalysis = analyzeWorkExperience(text);

  // Enhance with spaCy if available
  if (spacyAnalysis && spacyAnalysis.entities) {
    // Extract organizations from spaCy entities
    const organizations = spacyAnalysis.entities.organizations || [];
    const dates = spacyAnalysis.entities.dates || [];

    // Add organizations to experience
    organizations.forEach(org => {
      const existingPosition = basicAnalysis.positions.find(pos =>
        pos.company.toLowerCase().includes(org.text.toLowerCase())
      );

      if (!existingPosition) {
        basicAnalysis.positions.push({
          title: 'Unknown',
          company: org.text,
          duration: 'Unknown',
          description: `Extracted from spaCy: ${org.text}`,
          source: 'spaCy'
        });
      }
    });

    // Enhance with spaCy experience data
    if (spacyAnalysis.experience) {
      spacyAnalysis.experience.forEach(exp => {
        if (exp.type === 'duration') {
          const yearMatch = exp.text.match(/(\d+)\s*(jaar|jaren)/);
          if (yearMatch) {
            const years = parseInt(yearMatch[1]);
            basicAnalysis.totalYears = Math.max(basicAnalysis.totalYears, years);
          }
        }
      });
    }
  }

  return basicAnalysis;
};

/**
 * Enhanced education analysis using spaCy
 */
const analyzeEducationEnhanced = async (text, spacyAnalysis) => {
  // Start with basic analysis
  const basicAnalysis = analyzeEducation(text);

  // Enhance with spaCy if available
  if (spacyAnalysis && spacyAnalysis.entities) {
    // Extract organizations that might be educational institutions
    const organizations = spacyAnalysis.entities.organizations || [];

    organizations.forEach(org => {
      const orgText = org.text.toLowerCase();
      const isEducational = ['universiteit', 'hogeschool', 'university', 'college', 'school'].some(keyword =>
        orgText.includes(keyword)
      );

      if (isEducational) {
        const existingEntry = basicAnalysis.entries.find(entry =>
          entry.institution && entry.institution.toLowerCase().includes(orgText)
        );

        if (!existingEntry) {
          basicAnalysis.entries.push({
            degree: 'Unknown',
            field: 'Unknown',
            institution: org.text,
            source: 'spaCy'
          });
        }
      }
    });

    // Enhance with spaCy education data
    if (spacyAnalysis.education) {
      spacyAnalysis.education.forEach(edu => {
        if (edu.type === 'education_keyword') {
          // Add education keywords as potential degrees
          const keyword = edu.text.toLowerCase();
          if (['bachelor', 'master', 'phd', 'hbo', 'wo', 'mbo'].includes(keyword)) {
            const existingEntry = basicAnalysis.entries.find(entry =>
              entry.degree.toLowerCase().includes(keyword)
            );

            if (!existingEntry) {
              basicAnalysis.entries.push({
                degree: edu.text,
                field: 'Unknown',
                institution: 'Unknown',
                source: 'spaCy'
              });
            }
          }
        }
      });
    }
  }

  return basicAnalysis;
};

/**
 * Enhanced personal information extraction using spaCy
 */
const extractPersonalInfoEnhanced = async (text, spacyAnalysis) => {
  // Start with basic extraction
  const basicInfo = extractPersonalInfo(text);

  // Enhance with spaCy entities if available
  if (spacyAnalysis && spacyAnalysis.entities) {
    // Extract person names
    const persons = spacyAnalysis.entities.persons || [];
    if (persons.length > 0 && !basicInfo.name) {
      // Use the first person name found
      basicInfo.name = persons[0].text;
      basicInfo.source = 'spaCy';
    }

    // Extract locations
    const locations = spacyAnalysis.entities.locations || [];
    if (locations.length > 0) {
      basicInfo.location = locations[0].text;
    }
  }

  return basicInfo;
};