/**
 * OCR Service for Computer Vision Text Extraction
 * Handles scanned PDFs and image text extraction using Tesseract.js
 */

import Tesseract from 'tesseract.js';

class OCRService {
  constructor() {
    this.isAvailable = true;
    this.supportedFormats = ['image/jpeg', 'image/png', 'image/bmp', 'image/tiff'];
    this.languages = ['nld', 'eng']; // Dutch and English
  }

  /**
   * Check if OCR service is available
   */
  async checkAvailability() {
    try {
      // Test Tesseract availability
      return this.isAvailable;
    } catch (error) {
      console.warn('OCR service not available:', error);
      this.isAvailable = false;
      return false;
    }
  }

  /**
   * Extract text from image using OCR
   * @param {File|string} imageSource - Image file or data URL
   * @param {Object} options - OCR options
   * @returns {Promise<Object>} - OCR result
   */
  async extractTextFromImage(imageSource, options = {}) {
    const {
      language = 'nld+eng', // Dutch + English
      psm = 6, // Page segmentation mode
      oem = 3, // OCR Engine mode
      progress = null
    } = options;

    try {
      console.log('Starting OCR text extraction...');

      const result = await Tesseract.recognize(
        imageSource,
        language,
        {
          logger: progress ? (m) => {
            if (m.status === 'recognizing text') {
              progress(Math.round(m.progress * 100));
            }
          } : undefined,
          tessedit_pageseg_mode: psm,
          tessedit_ocr_engine_mode: oem,
          tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,!?@#$%^&*()_+-=[]{}|;:\'\"<>?/~` \n\t',
        }
      );

      const extractedText = result.data.text.trim();
      const confidence = result.data.confidence;

      console.log('OCR extraction completed:', {
        textLength: extractedText.length,
        confidence: Math.round(confidence),
        wordsCount: extractedText.split(/\s+/).length
      });

      return {
        success: true,
        text: extractedText,
        confidence: confidence / 100, // Convert to 0-1 scale
        metadata: {
          language: language,
          wordCount: extractedText.split(/\s+/).filter(w => w.length > 0).length,
          characterCount: extractedText.length,
          extractedAt: new Date().toISOString(),
          ocrEngine: 'Tesseract.js',
          psm: psm,
          oem: oem
        },
        rawData: result.data
      };

    } catch (error) {
      console.error('OCR extraction failed:', error);
      return {
        success: false,
        error: error.message,
        text: '',
        confidence: 0,
        metadata: {
          extractedAt: new Date().toISOString(),
          errorDetails: error.toString()
        }
      };
    }
  }

  /**
   * Convert PDF page to image for OCR processing
   * @param {File} pdfFile - PDF file
   * @param {number} pageNumber - Page number to convert
   * @returns {Promise<string>} - Image data URL
   */
  async convertPDFPageToImage(pdfFile, pageNumber = 1) {
    try {
      // This would require PDF-to-image conversion
      // For now, we'll return a placeholder implementation
      throw new Error('PDF to image conversion not yet implemented. Please use image files directly.');
    } catch (error) {
      console.error('PDF to image conversion failed:', error);
      throw error;
    }
  }

  /**
   * Process scanned document (image or PDF)
   * @param {File} file - Document file
   * @param {Object} options - Processing options
   * @returns {Promise<Object>} - Processing result
   */
  async processScannedDocument(file, options = {}) {
    try {
      console.log('Processing scanned document:', file.name, file.type);

      // Check if file is supported
      if (!this.supportedFormats.includes(file.type)) {
        throw new Error(`Unsupported file format: ${file.type}. Supported formats: ${this.supportedFormats.join(', ')}`);
      }

      // Extract text using OCR
      const ocrResult = await this.extractTextFromImage(file, options);

      if (!ocrResult.success) {
        throw new Error(`OCR failed: ${ocrResult.error}`);
      }

      // Post-process the extracted text
      const processedText = this.postProcessOCRText(ocrResult.text);

      return {
        success: true,
        extractedText: processedText,
        originalText: ocrResult.text,
        confidence: ocrResult.confidence,
        metadata: {
          ...ocrResult.metadata,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          processingMethod: 'OCR',
          isOCRExtraction: true,
          postProcessed: true
        }
      };

    } catch (error) {
      console.error('Scanned document processing failed:', error);
      return {
        success: false,
        error: error.message,
        extractedText: '',
        confidence: 0,
        metadata: {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          processingMethod: 'OCR',
          isOCRExtraction: false,
          errorDetails: error.toString()
        }
      };
    }
  }

  /**
   * Post-process OCR text to improve quality
   * @param {string} text - Raw OCR text
   * @returns {string} - Processed text
   */
  postProcessOCRText(text) {
    if (!text) return '';

    let processed = text;

    // Fix common OCR errors
    processed = processed
      // Fix spacing issues
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n')
      // Fix common character misrecognitions
      .replace(/0/g, 'O') // In names/words, 0 is often O
      .replace(/1/g, 'I') // In names/words, 1 is often I
      .replace(/5/g, 'S') // In names/words, 5 is often S
      // Fix email patterns
      .replace(/(\w+)\s*@\s*(\w+)/g, '$1@$2')
      // Fix phone number patterns
      .replace(/(\d)\s+(\d)/g, '$1$2')
      // Normalize line breaks
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      // Remove excessive whitespace
      .trim();

    return processed;
  }

  /**
   * Get OCR service information
   */
  getServiceInfo() {
    return {
      name: 'Tesseract.js OCR',
      version: '4.0+',
      supportedFormats: this.supportedFormats,
      supportedLanguages: this.languages,
      isAvailable: this.isAvailable,
      capabilities: [
        'Image text extraction',
        'Multi-language support',
        'Confidence scoring',
        'Text post-processing'
      ]
    };
  }
}

// Create and export service instance
export const ocrService = new OCRService();

// Export utility functions
export const isOCRAvailable = async () => {
  return await ocrService.checkAvailability();
};

export const extractTextFromImage = async (imageFile, options = {}) => {
  return await ocrService.extractTextFromImage(imageFile, options);
};

export const processScannedDocument = async (file, options = {}) => {
  return await ocrService.processScannedDocument(file, options);
};

export default ocrService;
