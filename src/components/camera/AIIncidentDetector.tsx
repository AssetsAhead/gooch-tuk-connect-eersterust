import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAIIncidentDetection, IncidentAnalysis } from '@/hooks/useAIIncidentDetection';
import { 
  AlertTriangle, 
  Camera, 
  Shield, 
  Eye, 
  Car, 
  Users, 
  Loader2,
  CheckCircle,
  XCircle,
  Sparkles
} from 'lucide-react';

const AIIncidentDetector = () => {
  const { analyzeImage, isAnalyzing, lastAnalysis, clearAnalysis } = useAIIncidentDetection();
  const [imageUrl, setImageUrl] = useState('');

  const handleAnalyze = async () => {
    if (!imageUrl.trim()) return;
    await analyzeImage(imageUrl);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-600 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getIncidentIcon = (type: string | null) => {
    switch (type) {
      case 'accident': return <Car className="h-5 w-5" />;
      case 'traffic_violation': return <AlertTriangle className="h-5 w-5" />;
      case 'suspicious_activity': return <Eye className="h-5 w-5" />;
      case 'crowd_disturbance': return <Users className="h-5 w-5" />;
      default: return <Shield className="h-5 w-5" />;
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Incident Detection
        </CardTitle>
        <CardDescription>
          Analyze images from cameras or dashcams for security incidents using AI
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Image URL Input */}
        <div className="flex gap-2">
          <Input
            placeholder="Enter image URL to analyze..."
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            disabled={isAnalyzing}
            className="flex-1"
          />
          <Button 
            onClick={handleAnalyze} 
            disabled={isAnalyzing || !imageUrl.trim()}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Camera className="h-4 w-4 mr-2" />
                Analyze
              </>
            )}
          </Button>
        </div>

        {/* Analysis Result */}
        {lastAnalysis && (
          <AnalysisResultCard 
            analysis={lastAnalysis} 
            onClear={clearAnalysis}
            getSeverityColor={getSeverityColor}
            getIncidentIcon={getIncidentIcon}
          />
        )}

        {/* Demo Images */}
        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground mb-2">
            Test with sample images:
          </p>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setImageUrl('https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800')}
            >
              Car on Road
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setImageUrl('https://images.unsplash.com/photo-1530268729831-4b0b9e170218?w=800')}
            >
              Street Scene
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setImageUrl('https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800')}
            >
              Urban Traffic
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface AnalysisResultCardProps {
  analysis: IncidentAnalysis;
  onClear: () => void;
  getSeverityColor: (severity: string) => string;
  getIncidentIcon: (type: string | null) => React.ReactNode;
}

const AnalysisResultCard = ({ 
  analysis, 
  onClear, 
  getSeverityColor, 
  getIncidentIcon 
}: AnalysisResultCardProps) => {
  return (
    <div className={`rounded-lg border p-4 ${
      analysis.incident_detected 
        ? 'border-destructive/50 bg-destructive/5' 
        : 'border-green-500/50 bg-green-500/5'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {analysis.incident_detected ? (
            <XCircle className="h-5 w-5 text-destructive" />
          ) : (
            <CheckCircle className="h-5 w-5 text-green-500" />
          )}
          <span className="font-semibold">
            {analysis.incident_detected ? 'Incident Detected' : 'No Incidents'}
          </span>
        </div>
        <Button variant="ghost" size="sm" onClick={onClear}>
          Clear
        </Button>
      </div>

      {analysis.incident_detected && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={getSeverityColor(analysis.severity)}>
              {analysis.severity.toUpperCase()}
            </Badge>
            {analysis.incident_type && (
              <Badge variant="outline" className="flex items-center gap-1">
                {getIncidentIcon(analysis.incident_type)}
                {analysis.incident_type.replace('_', ' ')}
              </Badge>
            )}
            <Badge variant="secondary">
              {Math.round(analysis.confidence_score * 100)}% confident
            </Badge>
          </div>

          <p className="text-sm">{analysis.description}</p>

          {/* Details */}
          <div className="grid gap-2 text-sm">
            {analysis.details.objects_detected.length > 0 && (
              <div>
                <span className="font-medium">Objects Detected: </span>
                <span className="text-muted-foreground">
                  {analysis.details.objects_detected.join(', ')}
                </span>
              </div>
            )}

            {analysis.details.license_plates.length > 0 && (
              <div>
                <span className="font-medium">License Plates: </span>
                <span className="text-primary font-mono">
                  {analysis.details.license_plates.join(', ')}
                </span>
              </div>
            )}

            {analysis.details.traffic_violations.length > 0 && (
              <div>
                <span className="font-medium">Traffic Violations: </span>
                <span className="text-destructive">
                  {analysis.details.traffic_violations.join(', ')}
                </span>
              </div>
            )}

            {analysis.details.safety_concerns.length > 0 && (
              <div>
                <span className="font-medium">Safety Concerns: </span>
                <span className="text-orange-500">
                  {analysis.details.safety_concerns.join(', ')}
                </span>
              </div>
            )}

            {analysis.details.recommended_actions.length > 0 && (
              <div className="pt-2 border-t">
                <span className="font-medium block mb-1">Recommended Actions:</span>
                <ul className="list-disc list-inside text-muted-foreground">
                  {analysis.details.recommended_actions.map((action, i) => (
                    <li key={i}>{action}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {!analysis.incident_detected && (
        <p className="text-sm text-muted-foreground">
          {analysis.description}
        </p>
      )}
    </div>
  );
};

export default AIIncidentDetector;
