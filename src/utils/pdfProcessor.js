import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker - try multiple approaches for maximum compatibility
let workerConfigured = false;

// Approach 1: Try jsdelivr CDN with .mjs extension
try {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
  workerConfigured = true;
  console.log('PDF.js worker configured with jsdelivr CDN (.mjs)');
} catch (error) {
  console.warn('Failed to configure jsdelivr worker:', error);
}

// Approach 2: Fallback to unpkg CDN
if (!workerConfigured) {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
    workerConfigured = true;
    console.log('PDF.js worker configured with unpkg CDN (.mjs)');
  } catch (error) {
    console.warn('Failed to configure unpkg worker:', error);
  }
}

// Approach 3: Try local worker file
if (!workerConfigured) {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
    workerConfigured = true;
    console.log('PDF.js worker configured with local file');
  } catch (error) {
    console.warn('Failed to configure local worker:', error);
  }
}

// Log final configuration
console.log('PDF.js version:', pdfjsLib.version);
console.log('Final worker source:', pdfjsLib.GlobalWorkerOptions.workerSrc);
console.log('Worker configured successfully:', workerConfigured);

/**
 * Extract text content from a PDF file
 * @param {File} file - The PDF file to process
 * @returns {Promise<Object>} - Extracted text and metadata
 */
export const extractTextFromPDF = async (file) => {
  try {
    // Check if worker is properly configured
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      throw new Error('PDF.js worker not configured properly');
    }

    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // Load the PDF document with timeout
    const loadingTask = pdfjsLib.getDocument({
      data: arrayBuffer,
      verbosity: 0 // Reduce console noise
    });

    // Add timeout to prevent hanging
    const pdf = await Promise.race([
      loadingTask.promise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('PDF loading timeout')), 30000)
      )
    ]);

    let fullText = '';
    const pages = [];

    // Extract text from each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();

      // Combine text items into readable text
      const pageText = textContent.items
        .map(item => item.str)
        .join(' ')
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();

      pages.push({
        pageNumber: pageNum,
        text: pageText,
        wordCount: pageText.split(' ').filter(word => word.length > 0).length
      });

      fullText += pageText + '\n';
    }

    // Clean up the full text
    fullText = fullText
      .replace(/\n+/g, '\n') // Normalize line breaks
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim();

    // Calculate basic statistics
    const words = fullText.split(' ').filter(word => word.length > 0);
    const sentences = fullText.split(/[.!?]+/).filter(s => s.trim().length > 0);

    return {
      success: true,
      text: fullText,
      metadata: {
        fileName: file.name,
        fileSize: file.size,
        totalPages: pdf.numPages,
        wordCount: words.length,
        sentenceCount: sentences.length,
        characterCount: fullText.length,
        extractedAt: new Date().toISOString(),
        pages: pages
      },
      pages: pages
    };

  } catch (error) {
    console.error('PDF extraction error:', error);

    return {
      success: false,
      error: error.message,
      text: '',
      metadata: {
        fileName: file.name,
        fileSize: file.size,
        extractedAt: new Date().toISOString(),
        errorDetails: error.toString()
      }
    };
  }
};

/**
 * Validate if a file is a valid PDF
 * @param {File} file - The file to validate
 * @returns {Promise<boolean>} - Whether the file is a valid PDF
 */
export const validatePDF = async (file) => {
  try {
    // Check file type
    if (file.type !== 'application/pdf') {
      return false;
    }

    // Try to load the PDF to verify it's valid
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    // Check if it has at least one page
    return pdf.numPages > 0;

  } catch (error) {
    console.error('PDF validation error:', error);
    return false;
  }
};

/**
 * Extract specific sections from CV text
 * @param {string} text - The extracted PDF text
 * @returns {Object} - Structured CV data
 */
export const parseCV = (text) => {
  const sections = {
    personalInfo: extractPersonalInfo(text),
    experience: extractExperience(text),
    education: extractEducation(text),
    skills: extractSkills(text),
    languages: extractLanguages(text),
    contact: extractContactInfo(text)
  };

  return {
    sections,
    rawText: text,
    parsedAt: new Date().toISOString()
  };
};

/**
 * Extract personal information from CV text
 */
const extractPersonalInfo = (text) => {
  const info = {};

  // Extract name (usually at the beginning)
  const nameMatch = text.match(/^([A-Z][a-z]+ [A-Z][a-z]+)/);
  if (nameMatch) {
    info.name = nameMatch[1];
  }

  // Extract email
  const emailMatch = text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  if (emailMatch) {
    info.email = emailMatch[1];
  }

  // Extract phone
  const phoneMatch = text.match(/(\+?[\d\s\-\(\)]{10,})/);
  if (phoneMatch) {
    info.phone = phoneMatch[1].trim();
  }

  return info;
};

/**
 * Extract work experience from CV text
 */
const extractExperience = (text) => {
  const experienceKeywords = [
    'ervaring', 'werkervaring', 'experience', 'werk', 'functie', 'position', 'job'
  ];

  const experiences = [];
  const lines = text.split('\n');

  let inExperienceSection = false;
  let currentExperience = null;

  for (const line of lines) {
    const lowerLine = line.toLowerCase();

    // Check if we're entering experience section
    if (experienceKeywords.some(keyword => lowerLine.includes(keyword))) {
      inExperienceSection = true;
      continue;
    }

    // Look for job titles and companies
    if (inExperienceSection && line.trim()) {
      // Simple pattern matching for job entries
      const jobMatch = line.match(/(.+?)\s+(?:bij|at|@)\s+(.+)/i);
      if (jobMatch) {
        if (currentExperience) {
          experiences.push(currentExperience);
        }
        currentExperience = {
          title: jobMatch[1].trim(),
          company: jobMatch[2].trim(),
          description: ''
        };
      } else if (currentExperience) {
        currentExperience.description += line + ' ';
      }
    }
  }

  if (currentExperience) {
    experiences.push(currentExperience);
  }

  return experiences;
};

/**
 * Extract education from CV text
 */
const extractEducation = (text) => {
  const educationKeywords = [
    'opleiding', 'onderwijs', 'education', 'studie', 'universiteit', 'hogeschool', 'school'
  ];

  const education = [];
  const lines = text.split('\n');

  for (const line of lines) {
    const lowerLine = line.toLowerCase();

    if (educationKeywords.some(keyword => lowerLine.includes(keyword))) {
      education.push(line.trim());
    }
  }

  return education;
};

/**
 * Extract skills from CV text
 */
const extractSkills = (text) => {
  const skillKeywords = [
    'vaardigheden', 'skills', 'competenties', 'kennis', 'expertise'
  ];

  const commonSkills = [
    'javascript', 'python', 'java', 'react', 'vue', 'angular', 'node.js',
    'html', 'css', 'sql', 'git', 'docker', 'kubernetes', 'aws', 'azure',
    'projectmanagement', 'scrum', 'agile', 'teamwork', 'leadership',
    'communicatie', 'analytisch', 'probleemoplossend'
  ];

  const foundSkills = [];
  const lowerText = text.toLowerCase();

  // Find skills mentioned in the text
  for (const skill of commonSkills) {
    if (lowerText.includes(skill.toLowerCase())) {
      foundSkills.push(skill);
    }
  }

  return foundSkills;
};

/**
 * Extract languages from CV text
 */
const extractLanguages = (text) => {
  const languages = ['nederlands', 'english', 'engels', 'duits', 'german', 'frans', 'french', 'spaans', 'spanish'];
  const foundLanguages = [];
  const lowerText = text.toLowerCase();

  for (const lang of languages) {
    if (lowerText.includes(lang)) {
      foundLanguages.push(lang);
    }
  }

  return foundLanguages;
};

/**
 * Extract contact information from CV text
 */
const extractContactInfo = (text) => {
  const contact = {};

  // Extract LinkedIn
  const linkedinMatch = text.match(/(linkedin\.com\/in\/[a-zA-Z0-9-]+)/i);
  if (linkedinMatch) {
    contact.linkedin = linkedinMatch[1];
  }

  // Extract GitHub
  const githubMatch = text.match(/(github\.com\/[a-zA-Z0-9-]+)/i);
  if (githubMatch) {
    contact.github = githubMatch[1];
  }

  // Extract website
  const websiteMatch = text.match(/(https?:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  if (websiteMatch) {
    contact.website = websiteMatch[1];
  }

  return contact;
};
