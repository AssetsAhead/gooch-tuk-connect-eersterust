import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface IncidentAnalysis {
  incident_detected: boolean;
  incident_type: string | null;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence_score: number;
  description: string;
  details: {
    objects_detected: string[];
    license_plates: string[];
    traffic_violations: string[];
    safety_concerns: string[];
    recommended_actions: string[];
  };
}

export interface AnalysisResult {
  success: boolean;
  analysis?: IncidentAnalysis;
  error?: string;
}

export const useAIIncidentDetection = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<IncidentAnalysis | null>(null);
  const { toast } = useToast();

  const analyzeImage = async (
    imageUrl: string,
    captureId?: string,
    location?: { latitude: number; longitude: number }
  ): Promise<AnalysisResult> => {
    setIsAnalyzing(true);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-incident', {
        body: { imageUrl, captureId, location }
      });

      if (error) {
        console.error('AI analysis error:', error);
        toast({
          title: 'Analysis Failed',
          description: error.message || 'Could not analyze the image',
          variant: 'destructive'
        });
        return { success: false, error: error.message };
      }

      if (data?.analysis) {
        setLastAnalysis(data.analysis);

        // Show toast based on analysis result
        if (data.analysis.incident_detected) {
          const severityColors: Record<string, 'default' | 'destructive'> = {
            low: 'default',
            medium: 'default',
            high: 'destructive',
            critical: 'destructive'
          };

          toast({
            title: `🚨 ${data.analysis.incident_type?.toUpperCase() || 'INCIDENT'} Detected`,
            description: data.analysis.description,
            variant: severityColors[data.analysis.severity] || 'default',
            duration: data.analysis.severity === 'critical' ? 10000 : 5000
          });
        } else {
          toast({
            title: '✅ No Incidents Detected',
            description: 'The image analysis found no security concerns.',
          });
        }

        return { success: true, analysis: data.analysis };
      }

      return { success: false, error: 'No analysis returned' };
    } catch (err) {
      console.error('Analysis error:', err);
      const message = err instanceof Error ? err.message : 'Unknown error';
      toast({
        title: 'Analysis Error',
        description: message,
        variant: 'destructive'
      });
      return { success: false, error: message };
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeCapture = async (captureId: string): Promise<AnalysisResult> => {
    // First fetch the capture to get the image URL
    const { data: capture, error } = await supabase
      .from('camera_captures')
      .select('image_url, location')
      .eq('id', captureId)
      .single();

    if (error || !capture) {
      toast({
        title: 'Error',
        description: 'Could not find the capture to analyze',
        variant: 'destructive'
      });
      return { success: false, error: 'Capture not found' };
    }

    const location = capture.location as { latitude?: number; longitude?: number } | null;
    
    return analyzeImage(
      capture.image_url,
      captureId,
      location?.latitude && location?.longitude 
        ? { latitude: location.latitude, longitude: location.longitude }
        : undefined
    );
  };

  return {
    analyzeImage,
    analyzeCapture,
    isAnalyzing,
    lastAnalysis,
    clearAnalysis: () => setLastAnalysis(null)
  };
};
