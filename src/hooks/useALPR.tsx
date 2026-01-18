import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PlateResult {
  plate_number: string;
  confidence: number;
  province: string | null;
  is_valid_sa_format: boolean;
}

export interface ALPRResult {
  success: boolean;
  plates_detected: number;
  plates: PlateResult[];
  processing_time_ms: number;
  image_quality: 'poor' | 'fair' | 'good' | 'excellent' | 'unknown';
  recommendations: string[];
  error?: string;
}

export const useALPR = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResult, setLastResult] = useState<ALPRResult | null>(null);
  const { toast } = useToast();

  const recognizePlate = useCallback(async (
    input: { imageUrl?: string; imageBase64?: string }
  ): Promise<ALPRResult> => {
    if (!input.imageUrl && !input.imageBase64) {
      const error = 'Either imageUrl or imageBase64 is required';
      toast({
        title: 'Invalid Input',
        description: error,
        variant: 'destructive',
      });
      return {
        success: false,
        plates_detected: 0,
        plates: [],
        processing_time_ms: 0,
        image_quality: 'unknown',
        recommendations: [],
        error,
      };
    }

    setIsProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke('alpr-recognize', {
        body: input,
      });

      if (error) {
        console.error('ALPR error:', error);
        toast({
          title: 'Recognition Failed',
          description: error.message || 'Could not process the image',
          variant: 'destructive',
        });
        return {
          success: false,
          plates_detected: 0,
          plates: [],
          processing_time_ms: 0,
          image_quality: 'unknown',
          recommendations: [],
          error: error.message,
        };
      }

      const result = data as ALPRResult;
      setLastResult(result);

      // Show appropriate toast based on results
      if (result.plates_detected > 0) {
        const plateNumbers = result.plates.map(p => p.plate_number).join(', ');
        toast({
          title: `🚗 ${result.plates_detected} Plate${result.plates_detected > 1 ? 's' : ''} Detected`,
          description: plateNumbers,
        });
      } else {
        toast({
          title: 'No Plates Found',
          description: result.recommendations[0] || 'Try a clearer image',
        });
      }

      return result;
    } catch (err) {
      console.error('ALPR exception:', err);
      const message = err instanceof Error ? err.message : 'Unknown error';
      toast({
        title: 'Recognition Error',
        description: message,
        variant: 'destructive',
      });
      return {
        success: false,
        plates_detected: 0,
        plates: [],
        processing_time_ms: 0,
        image_quality: 'unknown',
        recommendations: [],
        error: message,
      };
    } finally {
      setIsProcessing(false);
    }
  }, [toast]);

  const clearResult = useCallback(() => {
    setLastResult(null);
  }, []);

  return {
    recognizePlate,
    isProcessing,
    lastResult,
    clearResult,
  };
};
