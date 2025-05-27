#!/usr/bin/env python3
"""
spaCy Dutch NLP Service
Advanced Dutch natural language processing using spaCy
Provides entity recognition, skill extraction, sentiment analysis, and text classification
"""

import os
import sys
import logging
import threading
from pathlib import Path
from typing import Optional, Dict, Any, List
from datetime import datetime

try:
    import spacy
    from spacy import displacy
    import torch
    from flask import Flask, request, jsonify
    from flask_cors import CORS
    import json
    import re
except ImportError as e:
    print(f"Missing dependency: {e}")
    print("Please install required packages:")
    print("pip install spacy flask flask-cors torch")
    print("python -m spacy download nl_core_news_sm")
    sys.exit(1)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Flask app setup
app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Global variables
nlp_model = None
model_name = "nl_core_news_sm"  # Dutch spaCy model
processing_lock = threading.Lock()  # Prevent concurrent processing

# Dutch skill patterns and categories
DUTCH_SKILLS_DATABASE = {
    "programming_languages": [
        "python", "javascript", "java", "c#", "php", "ruby", "go", "rust", "swift", "kotlin",
        "typescript", "scala", "perl", "r", "matlab", "sql", "html", "css", "sass", "less",
        "c++", "c", "objective-c", "dart", "lua", "haskell", "erlang", "elixir", "clojure"
    ],
    "frameworks": [
        "react", "vue", "angular", "node.js", "express", "django", "flask", "spring", "laravel",
        "symfony", "rails", "asp.net", "jquery", "bootstrap", "tailwind", "next.js", "nuxt.js",
        "svelte", "ember", "backbone", "meteor", "gatsby", "webpack", "vite", "parcel"
    ],
    "databases": [
        "mysql", "postgresql", "mongodb", "redis", "elasticsearch", "sqlite", "oracle",
        "sql server", "cassandra", "dynamodb", "firebase", "supabase", "neo4j", "influxdb"
    ],
    "cloud_platforms": [
        "aws", "azure", "google cloud", "gcp", "heroku", "netlify", "vercel", "digitalocean",
        "linode", "vultr", "cloudflare", "firebase", "supabase"
    ],
    "tools": [
        "git", "docker", "kubernetes", "jenkins", "gitlab", "github", "jira", "confluence",
        "slack", "teams", "figma", "sketch", "photoshop", "illustrator", "indesign", "xd",
        "terraform", "ansible", "vagrant", "postman", "insomnia", "vs code", "intellij"
    ],
    "methodologies": [
        "agile", "scrum", "kanban", "devops", "ci/cd", "tdd", "bdd", "lean", "waterfall",
        "design thinking", "user experience", "ux", "ui", "product management"
    ],
    "soft_skills": [
        "communicatie", "teamwork", "leiderschap", "probleemoplossing", "creativiteit",
        "analytisch", "organisatie", "planning", "flexibiliteit", "aanpassingsvermogen",
        "initiatief", "zelfstandig", "samenwerking", "motivatie", "doorzettingsvermogen",
        "klantgericht", "resultaatgericht", "innovatief", "strategisch", "commercieel"
    ],
    "languages": [
        "nederlands", "engels", "duits", "frans", "spaans", "italiaans", "portugees",
        "russisch", "chinees", "japans", "koreaans", "arabisch", "hindi", "turks"
    ]
}

class DutchNLPService:
    """Advanced Dutch NLP Service using spaCy"""

    def __init__(self, model_name: str = "nl_core_news_sm"):
        self.model_name = model_name
        self.nlp = None
        self.load_model()

    def load_model(self):
        """Load spaCy Dutch model"""
        try:
            logger.info(f"Loading spaCy Dutch model '{self.model_name}'...")
            self.nlp = spacy.load(self.model_name)
            logger.info(f"Model loaded successfully. Pipeline: {self.nlp.pipe_names}")
        except OSError as e:
            logger.error(f"Failed to load spaCy model: {e}")
            logger.error("Please install the Dutch model: python -m spacy download nl_core_news_sm")
            raise
        except Exception as e:
            logger.error(f"Failed to load spaCy model: {e}")
            raise

    def analyze_text(self, text: str) -> Dict[str, Any]:
        """
        Comprehensive text analysis using spaCy
        
        Args:
            text: Input text to analyze
            
        Returns:
            Dictionary with comprehensive analysis results
        """
        try:
            logger.info(f"Analyzing text of length: {len(text)} characters")
            
            # Process text with spaCy
            doc = self.nlp(text)
            
            # Extract entities
            entities = self._extract_entities(doc)
            
            # Extract skills
            skills = self._extract_skills(doc, text)
            
            # Analyze syntax
            syntax_analysis = self._analyze_syntax(doc)
            
            # Extract key phrases
            key_phrases = self._extract_key_phrases(doc)
            
            # Analyze sentiment (basic)
            sentiment = self._analyze_sentiment(doc)
            
            # Extract experience information
            experience = self._extract_experience(doc, text)
            
            # Extract education information
            education = self._extract_education(doc, text)
            
            # Calculate text statistics
            statistics = self._calculate_statistics(doc, text)
            
            result = {
                "entities": entities,
                "skills": skills,
                "syntax": syntax_analysis,
                "key_phrases": key_phrases,
                "sentiment": sentiment,
                "experience": experience,
                "education": education,
                "statistics": statistics,
                "processing_info": {
                    "model": self.model_name,
                    "language": "nl",
                    "timestamp": datetime.now().isoformat(),
                    "text_length": len(text),
                    "tokens": len(doc),
                    "sentences": len(list(doc.sents))
                }
            }
            
            logger.info(f"Text analysis completed. Found {len(entities)} entities, {sum(len(cat) for cat in skills.values())} skills")
            return result
            
        except Exception as e:
            logger.error(f"Text analysis failed: {e}")
            raise

    def _extract_entities(self, doc) -> Dict[str, List[Dict]]:
        """Extract named entities from text"""
        entities = {
            "persons": [],
            "organizations": [],
            "locations": [],
            "dates": [],
            "money": [],
            "other": []
        }
        
        for ent in doc.ents:
            entity_info = {
                "text": ent.text,
                "label": ent.label_,
                "start": ent.start_char,
                "end": ent.end_char,
                "confidence": getattr(ent, 'confidence', 0.8)
            }
            
            if ent.label_ in ["PERSON", "PER"]:
                entities["persons"].append(entity_info)
            elif ent.label_ in ["ORG", "ORGANIZATION"]:
                entities["organizations"].append(entity_info)
            elif ent.label_ in ["LOC", "LOCATION", "GPE"]:
                entities["locations"].append(entity_info)
            elif ent.label_ in ["DATE", "TIME"]:
                entities["dates"].append(entity_info)
            elif ent.label_ in ["MONEY", "CURRENCY"]:
                entities["money"].append(entity_info)
            else:
                entities["other"].append(entity_info)
        
        return entities

    def _extract_skills(self, doc, text: str) -> Dict[str, List[Dict]]:
        """Extract skills from text using pattern matching and NLP"""
        skills = {
            "programming_languages": [],
            "frameworks": [],
            "databases": [],
            "cloud_platforms": [],
            "tools": [],
            "methodologies": [],
            "soft_skills": [],
            "languages": []
        }
        
        text_lower = text.lower()
        
        # Extract skills by category
        for category, skill_list in DUTCH_SKILLS_DATABASE.items():
            for skill in skill_list:
                # Use regex for more precise matching
                pattern = r'\b' + re.escape(skill.lower()) + r'\b'
                matches = re.finditer(pattern, text_lower)
                
                for match in matches:
                    # Calculate confidence based on context
                    confidence = self._calculate_skill_confidence(doc, skill, match.start(), match.end())
                    
                    skill_info = {
                        "name": skill,
                        "confidence": confidence,
                        "start": match.start(),
                        "end": match.end(),
                        "context": self._get_context(text, match.start(), match.end())
                    }
                    
                    skills[category].append(skill_info)
        
        # Remove duplicates and sort by confidence
        for category in skills:
            skills[category] = self._deduplicate_skills(skills[category])
        
        return skills

    def _calculate_skill_confidence(self, doc, skill: str, start: int, end: int) -> float:
        """Calculate confidence score for a skill based on context"""
        base_confidence = 0.7
        
        # Find the token containing this skill
        skill_token = None
        for token in doc:
            if token.idx <= start < token.idx + len(token.text):
                skill_token = token
                break
        
        if not skill_token:
            return base_confidence
        
        # Boost confidence based on context
        context_words = []
        for i in range(max(0, skill_token.i - 3), min(len(doc), skill_token.i + 4)):
            context_words.append(doc[i].text.lower())
        
        # Experience indicators
        experience_indicators = ["ervaring", "jaar", "jaren", "gewerkt", "gebruikt", "ontwikkeld", "expert", "specialist"]
        if any(indicator in context_words for indicator in experience_indicators):
            base_confidence += 0.2
        
        # Project indicators
        project_indicators = ["project", "ontwikkeling", "implementatie", "gebouwd", "gemaakt"]
        if any(indicator in context_words for indicator in project_indicators):
            base_confidence += 0.1
        
        return min(base_confidence, 1.0)

    def _get_context(self, text: str, start: int, end: int, window: int = 50) -> str:
        """Get context around a skill mention"""
        context_start = max(0, start - window)
        context_end = min(len(text), end + window)
        return text[context_start:context_end].strip()

    def _deduplicate_skills(self, skills: List[Dict]) -> List[Dict]:
        """Remove duplicate skills and keep the one with highest confidence"""
        skill_dict = {}
        for skill in skills:
            name = skill["name"]
            if name not in skill_dict or skill["confidence"] > skill_dict[name]["confidence"]:
                skill_dict[name] = skill
        
        return sorted(skill_dict.values(), key=lambda x: x["confidence"], reverse=True)

    def _analyze_syntax(self, doc) -> Dict[str, Any]:
        """Analyze syntactic structure of text"""
        pos_counts = {}
        dep_counts = {}
        
        for token in doc:
            # Part-of-speech counts
            pos_counts[token.pos_] = pos_counts.get(token.pos_, 0) + 1
            
            # Dependency relation counts
            dep_counts[token.dep_] = dep_counts.get(token.dep_, 0) + 1
        
        return {
            "pos_distribution": pos_counts,
            "dependency_distribution": dep_counts,
            "sentence_count": len(list(doc.sents)),
            "token_count": len(doc),
            "complexity_score": self._calculate_complexity(doc)
        }

    def _calculate_complexity(self, doc) -> float:
        """Calculate text complexity score"""
        sentences = list(doc.sents)
        if not sentences:
            return 0.0
        
        # Average sentence length
        avg_sentence_length = len(doc) / len(sentences)
        
        # Unique words ratio
        unique_words = len(set(token.lemma_.lower() for token in doc if token.is_alpha))
        total_words = len([token for token in doc if token.is_alpha])
        unique_ratio = unique_words / total_words if total_words > 0 else 0
        
        # Complexity based on sentence length and vocabulary diversity
        complexity = (avg_sentence_length / 20) + unique_ratio
        return min(complexity, 1.0)

    def _extract_key_phrases(self, doc) -> List[Dict]:
        """Extract key phrases using noun chunks and named entities"""
        key_phrases = []
        
        # Extract noun chunks
        for chunk in doc.noun_chunks:
            if len(chunk.text.split()) >= 2:  # Multi-word phrases
                key_phrases.append({
                    "text": chunk.text,
                    "type": "noun_chunk",
                    "start": chunk.start_char,
                    "end": chunk.end_char
                })
        
        # Extract compound words and technical terms
        for token in doc:
            if (token.pos_ in ["NOUN", "PROPN"] and 
                len(token.text) > 6 and 
                not token.is_stop):
                key_phrases.append({
                    "text": token.text,
                    "type": "technical_term",
                    "start": token.idx,
                    "end": token.idx + len(token.text)
                })
        
        return key_phrases[:20]  # Return top 20 key phrases

    def _analyze_sentiment(self, doc) -> Dict[str, Any]:
        """Basic sentiment analysis (can be enhanced with specialized models)"""
        positive_words = ["goed", "uitstekend", "succesvol", "positief", "sterk", "ervaren", "expert"]
        negative_words = ["slecht", "zwak", "probleem", "moeilijk", "beperkt"]
        
        positive_count = 0
        negative_count = 0
        
        for token in doc:
            if token.lemma_.lower() in positive_words:
                positive_count += 1
            elif token.lemma_.lower() in negative_words:
                negative_count += 1
        
        total_sentiment_words = positive_count + negative_count
        if total_sentiment_words == 0:
            sentiment_score = 0.5  # Neutral
        else:
            sentiment_score = positive_count / total_sentiment_words
        
        return {
            "score": sentiment_score,
            "positive_indicators": positive_count,
            "negative_indicators": negative_count,
            "overall": "positive" if sentiment_score > 0.6 else "negative" if sentiment_score < 0.4 else "neutral"
        }

    def _extract_experience(self, doc, text: str) -> List[Dict]:
        """Extract work experience information"""
        experience = []
        
        # Pattern for years of experience
        year_patterns = [
            r'(\d+)\s*jaar\s*(ervaring|gewerkt)',
            r'(\d+)\s*jaren\s*(ervaring|gewerkt)',
            r'sinds\s*(\d{4})',
            r'(\d{4})\s*-\s*(\d{4}|\w+)'
        ]
        
        for pattern in year_patterns:
            matches = re.finditer(pattern, text.lower())
            for match in matches:
                experience.append({
                    "text": match.group(0),
                    "type": "duration",
                    "start": match.start(),
                    "end": match.end()
                })
        
        return experience

    def _extract_education(self, doc, text: str) -> List[Dict]:
        """Extract education information"""
        education = []
        
        # Education keywords
        education_keywords = [
            "universiteit", "hogeschool", "bachelor", "master", "diploma", "certificaat",
            "opleiding", "studie", "afgestudeerd", "doctoraal", "phd", "mbo", "hbo", "wo"
        ]
        
        for token in doc:
            if token.lemma_.lower() in education_keywords:
                education.append({
                    "text": token.text,
                    "type": "education_keyword",
                    "start": token.idx,
                    "end": token.idx + len(token.text)
                })
        
        return education

    def _calculate_statistics(self, doc, text: str) -> Dict[str, Any]:
        """Calculate text statistics"""
        sentences = list(doc.sents)
        words = [token for token in doc if token.is_alpha]
        
        return {
            "character_count": len(text),
            "word_count": len(words),
            "sentence_count": len(sentences),
            "average_words_per_sentence": len(words) / len(sentences) if sentences else 0,
            "unique_words": len(set(token.lemma_.lower() for token in words)),
            "lexical_diversity": len(set(token.lemma_.lower() for token in words)) / len(words) if words else 0
        }

# Initialize NLP service
try:
    nlp_service = DutchNLPService(model_name)
except Exception as e:
    logger.error(f"Failed to initialize NLP service: {e}")
    nlp_service = None

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy" if nlp_service else "unhealthy",
        "service": "spacy-dutch-nlp",
        "model": model_name,
        "model_loaded": nlp_service is not None,
        "pipeline": nlp_service.nlp.pipe_names if nlp_service else [],
        "timestamp": datetime.now().isoformat()
    })

@app.route('/analyze', methods=['POST'])
def analyze_text():
    """Analyze text using spaCy Dutch NLP"""
    # Check if another analysis is in progress
    if not processing_lock.acquire(blocking=False):
        return jsonify({
            "success": False,
            "error": "Another analysis is currently in progress. Please wait and try again."
        }), 429
    
    try:
        if not nlp_service:
            return jsonify({"error": "NLP service not available"}), 503
        
        # Get text from request
        data = request.get_json()
        if not data or 'text' not in data:
            return jsonify({"error": "No text provided"}), 400
        
        text = data['text']
        if not text or len(text.strip()) == 0:
            return jsonify({"error": "Empty text provided"}), 400
        
        logger.info(f"Analyzing text of length: {len(text)}")
        
        # Analyze text
        result = nlp_service.analyze_text(text)
        
        return jsonify({
            "success": True,
            "result": result
        })
        
    except Exception as e:
        logger.error(f"Text analysis endpoint error: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500
    finally:
        processing_lock.release()

@app.route('/skills', methods=['POST'])
def extract_skills():
    """Extract skills from text"""
    try:
        if not nlp_service:
            return jsonify({"error": "NLP service not available"}), 503
        
        data = request.get_json()
        if not data or 'text' not in data:
            return jsonify({"error": "No text provided"}), 400
        
        text = data['text']
        doc = nlp_service.nlp(text)
        skills = nlp_service._extract_skills(doc, text)
        
        return jsonify({
            "success": True,
            "skills": skills
        })
        
    except Exception as e:
        logger.error(f"Skills extraction error: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    # Get port from environment or use default
    port = int(os.getenv('PORT', 5001))
    
    logger.info(f"Starting spaCy Dutch NLP service on port {port}")
    logger.info(f"Model: {model_name}")
    
    if nlp_service:
        logger.info(f"Pipeline: {nlp_service.nlp.pipe_names}")
    else:
        logger.error("NLP service failed to initialize")
    
    app.run(
        host='0.0.0.0',
        port=port,
        debug=os.getenv('DEBUG', 'false').lower() == 'true'
    )
