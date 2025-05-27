import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Brain, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  FileText, 
  BarChart3,
  Users,
  Target,
  MessageSquare,
  Lightbulb
} from 'lucide-react';
import { spacyService } from '../../utils/spacyService.js';

const SpacyDebugPanel = () => {
  const [serviceStatus, setServiceStatus] = useState({
    available: false,
    loading: true,
    info: null,
    error: null
  });

  const [analysis, setAnalysis] = useState({
    result: null,
    loading: false,
    error: null
  });

  const [testText, setTestText] = useState(`Tom De Wilde
38 jaar
Software Developer

Werkervaring:
- 5 jaar ervaring met JavaScript, React en Node.js
- Gewerkt bij TechCorp als Senior Developer
- Projectleider voor e-commerce platform ontwikkeling
- Expertise in agile methodologieën en scrum

Opleiding:
- Master Computer Science, Universiteit Gent
- Bachelor Informatica, Hogeschool Antwerpen

Vaardigheden:
- Programmeren: Python, JavaScript, Java, C#
- Frameworks: React, Vue.js, Django, Express
- Databases: MySQL, PostgreSQL, MongoDB
- Cloud: AWS, Azure, Docker, Kubernetes
- Soft skills: teamwork, leiderschap, communicatie, probleemoplossing

Talen:
- Nederlands (moedertaal)
- Engels (vloeiend)
- Frans (gemiddeld)`);

  // Check service status on component mount
  useEffect(() => {
    checkServiceStatus();
  }, []);

  const checkServiceStatus = async () => {
    setServiceStatus(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const available = await spacyService.checkAvailability();
      setServiceStatus({
        available,
        loading: false,
        info: spacyService.serviceInfo,
        error: null
      });
    } catch (error) {
      setServiceStatus({
        available: false,
        loading: false,
        info: null,
        error: error.message
      });
    }
  };

  const analyzeText = async () => {
    if (!serviceStatus.available) {
      setAnalysis({
        result: null,
        loading: false,
        error: 'spaCy service is not available'
      });
      return;
    }

    setAnalysis({ result: null, loading: true, error: null });
    
    try {
      const result = await spacyService.analyzeText(testText);
      setAnalysis({ result, loading: false, error: null });
    } catch (error) {
      console.error('spaCy analysis failed:', error);
      setAnalysis({ result: null, loading: false, error: error.message });
    }
  };

  const extractSkills = async () => {
    if (!serviceStatus.available) {
      setAnalysis({
        result: null,
        loading: false,
        error: 'spaCy service is not available'
      });
      return;
    }

    setAnalysis({ result: null, loading: true, error: null });
    
    try {
      const skills = await spacyService.extractSkills(testText);
      setAnalysis({ 
        result: { skills, type: 'skills_only' }, 
        loading: false, 
        error: null 
      });
    } catch (error) {
      console.error('spaCy skills extraction failed:', error);
      setAnalysis({ result: null, loading: false, error: error.message });
    }
  };

  const renderServiceStatus = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          spaCy Dutch NLP Service Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-4">
          <Button 
            onClick={checkServiceStatus} 
            disabled={serviceStatus.loading}
            variant="outline"
            size="sm"
          >
            {serviceStatus.loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              'Refresh Status'
            )}
          </Button>
          
          <Badge 
            variant={serviceStatus.available ? "default" : "destructive"}
            className="flex items-center gap-1"
          >
            {serviceStatus.available ? (
              <CheckCircle className="h-3 w-3" />
            ) : (
              <XCircle className="h-3 w-3" />
            )}
            {serviceStatus.available ? 'Available' : 'Unavailable'}
          </Badge>
        </div>

        {serviceStatus.info && (
          <div className="space-y-2 text-sm">
            <div><strong>Status:</strong> {serviceStatus.info.status}</div>
            <div><strong>Model:</strong> {serviceStatus.info.model}</div>
            <div><strong>Model Loaded:</strong> {serviceStatus.info.model_loaded ? 'Yes' : 'No'}</div>
            {serviceStatus.info.pipeline && (
              <div><strong>Pipeline:</strong> {serviceStatus.info.pipeline.join(', ')}</div>
            )}
            {serviceStatus.info.demo_mode && (
              <div className="text-orange-600"><strong>Demo Mode:</strong> Running in demo mode</div>
            )}
          </div>
        )}

        {serviceStatus.error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              Service Error: {serviceStatus.error}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );

  const renderTestInterface = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Test spaCy Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Test Text (Dutch CV Content)
            </label>
            <textarea
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              className="w-full h-40 p-3 border rounded-md resize-none"
              placeholder="Enter Dutch text to analyze..."
            />
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={analyzeText}
              disabled={analysis.loading || !serviceStatus.available}
              className="flex items-center gap-2"
            >
              {analysis.loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <BarChart3 className="h-4 w-4" />
              )}
              Full Analysis
            </Button>
            
            <Button 
              onClick={extractSkills}
              disabled={analysis.loading || !serviceStatus.available}
              variant="outline"
              className="flex items-center gap-2"
            >
              {analysis.loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Target className="h-4 w-4" />
              )}
              Extract Skills Only
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderAnalysisResults = () => {
    if (analysis.loading) {
      return (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Analyzing with spaCy...</span>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (analysis.error) {
      return (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            Analysis Error: {analysis.error}
          </AlertDescription>
        </Alert>
      );
    }

    if (!analysis.result) {
      return null;
    }

    const { result } = analysis;

    if (result.type === 'skills_only') {
      return renderSkillsResults(result.skills);
    }

    return renderFullAnalysisResults(result);
  };

  const renderSkillsResults = (skills) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Extracted Skills
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.entries(skills).map(([category, skillList]) => (
            <div key={category} className="space-y-2">
              <h4 className="font-medium capitalize">
                {category.replace('_', ' ')} ({skillList.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {skillList.map((skill, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {skill.name} ({Math.round(skill.confidence * 100)}%)
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderFullAnalysisResults = (result) => (
    <div className="space-y-4">
      {/* Skills Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Skills Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(result.skills).map(([category, skillList]) => (
              <div key={category} className="space-y-2">
                <h4 className="font-medium capitalize">
                  {category.replace('_', ' ')} ({skillList.length})
                </h4>
                <div className="space-y-1">
                  {skillList.slice(0, 5).map((skill, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{skill.name}</span>
                      <span className="text-gray-500">
                        {Math.round(skill.confidence * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Entities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Named Entities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(result.entities).map(([type, entities]) => (
              <div key={type} className="space-y-2">
                <h4 className="font-medium capitalize">{type}</h4>
                <div className="space-y-1">
                  {entities.slice(0, 3).map((entity, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {entity.text}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Text Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{result.statistics.word_count}</div>
              <div className="text-sm text-gray-500">Words</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{result.statistics.sentence_count}</div>
              <div className="text-sm text-gray-500">Sentences</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{result.statistics.unique_words}</div>
              <div className="text-sm text-gray-500">Unique Words</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {Math.round(result.statistics.lexical_diversity * 100)}%
              </div>
              <div className="text-sm text-gray-500">Diversity</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sentiment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Sentiment Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Overall Sentiment:</span>
              <Badge variant={
                result.sentiment.overall === 'positive' ? 'default' :
                result.sentiment.overall === 'negative' ? 'destructive' : 'secondary'
              }>
                {result.sentiment.overall}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Sentiment Score:</span>
              <span>{Math.round(result.sentiment.score * 100)}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Processing Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Processing Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div><strong>Model:</strong> {result.processing_info.model}</div>
            <div><strong>Language:</strong> {result.processing_info.language}</div>
            <div><strong>Tokens:</strong> {result.processing_info.tokens}</div>
            <div><strong>Sentences:</strong> {result.processing_info.sentences}</div>
            <div><strong>Processed:</strong> {new Date(result.processing_info.timestamp).toLocaleString()}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Brain className="h-6 w-6" />
        <h2 className="text-2xl font-bold">spaCy Dutch NLP Debug Panel</h2>
      </div>

      {renderServiceStatus()}
      {renderTestInterface()}
      {renderAnalysisResults()}
    </div>
  );
};

export default SpacyDebugPanel;
