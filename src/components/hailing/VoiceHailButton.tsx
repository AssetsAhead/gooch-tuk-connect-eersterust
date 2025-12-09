import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface VoiceHailButtonProps {
  onDestinationDetected: (destination: string) => void;
  onHailTriggered?: () => void;
  disabled?: boolean;
}

const VoiceHailButton: React.FC<VoiceHailButtonProps> = ({
  onDestinationDetected,
  onHailTriggered,
  disabled = false
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = false;
        recognitionInstance.interimResults = true;
        recognitionInstance.lang = 'en-ZA'; // South African English
        setRecognition(recognitionInstance);
      }
    }
  }, []);

  const extractDestination = useCallback((text: string): string | null => {
    const lowerText = text.toLowerCase();
    
    // Common patterns for hailing commands
    const patterns = [
      /(?:hail|get|call|book|find|take me|go|ride|taxi)\s*(?:a\s*)?(?:ride|taxi|tuk|tuktuk)?\s*(?:to|for)?\s*(?:the\s*)?(.*)/i,
      /(?:i\s*(?:need|want)\s*(?:a\s*)?(?:ride|taxi|tuk)?\s*(?:to|for)?\s*(?:the\s*)?)(.*)/i,
      /(?:take me to\s*(?:the\s*)?)(.*)/i,
      /(?:going to\s*(?:the\s*)?)(.*)/i,
    ];

    for (const pattern of patterns) {
      const match = lowerText.match(pattern);
      if (match && match[1]) {
        const destination = match[1].trim();
        if (destination.length > 2) {
          // Capitalize first letter of each word
          return destination.replace(/\b\w/g, l => l.toUpperCase());
        }
      }
    }

    // If no pattern matched but text is short, treat whole thing as destination
    if (lowerText.length > 2 && lowerText.length < 50) {
      return text.trim().replace(/\b\w/g, l => l.toUpperCase());
    }

    return null;
  }, []);

  const startListening = useCallback(() => {
    if (!recognition) {
      toast.error('Speech recognition not supported in this browser');
      return;
    }

    setIsListening(true);
    setTranscript('');
    
    recognition.onresult = (event) => {
      const current = event.resultIndex;
      const result = event.results[current];
      const transcriptText = result[0].transcript;
      setTranscript(transcriptText);

      if (result.isFinal) {
        setIsProcessing(true);
        const destination = extractDestination(transcriptText);
        
        if (destination) {
          toast.success(`Destination: ${destination}`);
          onDestinationDetected(destination);
          onHailTriggered?.();
        } else {
          toast.info('Say something like "Hail a ride to the clinic"');
        }
        
        setIsProcessing(false);
        setIsListening(false);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        toast.error('Microphone access denied. Please enable it in settings.');
      } else if (event.error !== 'aborted') {
        toast.error('Voice recognition error. Please try again.');
      }
      setIsListening(false);
      setIsProcessing(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    try {
      recognition.start();
      toast.info('Listening... Say your destination');
    } catch (error) {
      console.error('Failed to start recognition:', error);
      setIsListening(false);
    }
  }, [recognition, extractDestination, onDestinationDetected, onHailTriggered]);

  const stopListening = useCallback(() => {
    if (recognition) {
      recognition.stop();
    }
    setIsListening(false);
  }, [recognition]);

  if (!recognition) {
    return null; // Don't render if not supported
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        variant={isListening ? "destructive" : "outline"}
        size="lg"
        onClick={isListening ? stopListening : startListening}
        disabled={disabled || isProcessing}
        className="h-16 w-16 rounded-full p-0 transition-all duration-200"
      >
        {isProcessing ? (
          <Loader2 className="h-6 w-6 animate-spin" />
        ) : isListening ? (
          <MicOff className="h-6 w-6" />
        ) : (
          <Mic className="h-6 w-6" />
        )}
      </Button>
      
      <span className="text-xs text-muted-foreground text-center">
        {isListening ? 'Listening...' : isProcessing ? 'Processing...' : 'Voice Hail'}
      </span>
      
      {transcript && isListening && (
        <p className="text-sm text-muted-foreground italic max-w-48 text-center">
          "{transcript}"
        </p>
      )}
    </div>
  );
};

export default VoiceHailButton;
